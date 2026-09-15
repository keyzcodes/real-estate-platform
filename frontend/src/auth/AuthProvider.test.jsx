import { useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import AuthProvider from "./AuthProvider";
import useAuth from "./useAuth";
import {
  readRegistrationIntent,
  storeRegistrationIntent,
} from "./registrationIntent";

const authMocks = vi.hoisted(() => ({
  callback: null,
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("../config/supabase", () => ({
  default: {
    auth: {
      onAuthStateChange: authMocks.onAuthStateChange,
      signOut: authMocks.signOut,
    },
  },
}));

function makeSession(overrides = {}) {
  return {
    user: {
      id: "94000000-0000-4000-8000-000000000001",
    },
    access_token: "mock-access-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

// This component exists only inside the tests.
function AccountProbe() {
  const auth = useAuth();
  const [failed, setFailed] = useState(false);

  async function handleSignOut() {
    try {
      await auth.signOut();
    } catch {
      setFailed(true);
    }
  }

  return (
    <div>
      <output data-testid="account-state">
        {JSON.stringify({
          userId: auth.user?.id ?? null,
          accessToken: auth.accessToken,
          sessionPresent: auth.session !== null,
          isAuthenticated: auth.isAuthenticated,
          isLoading: auth.isLoading,
          isSigningOut: auth.isSigningOut,
        })}
      </output>

      <button type="button" onClick={handleSignOut}>
        Sign out
      </button>

      {failed && <p role="alert">Sign-out failed</p>}
    </div>
  );
}

function renderAccount() {
  return render(
    <AuthProvider>
      <AccountProbe />
    </AuthProvider>
  );
}

function readAccount() {
  return JSON.parse(
    screen.getByTestId("account-state").textContent
  );
}

function emitSession(event, session) {
  act(() => {
    authMocks.callback(event, session);
  });
}

describe("Authentication session lifecycle", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
    authMocks.callback = null;

    authMocks.onAuthStateChange.mockImplementation(
      (callback) => {
        authMocks.callback = callback;

        return {
          data: {
            subscription: {
              unsubscribe: authMocks.unsubscribe,
            },
          },
        };
      }
    );

    authMocks.signOut.mockResolvedValue({
      error: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.sessionStorage.clear();
  });

  test("starts with loading and no exposed account", () => {
    renderAccount();

    expect(readAccount()).toMatchObject({
      userId: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  test("restores a usable initial session", () => {
    renderAccount();
    emitSession("INITIAL_SESSION", makeSession());

    expect(readAccount()).toMatchObject({
      userId: "94000000-0000-4000-8000-000000000001",
      accessToken: "mock-access-token",
      isAuthenticated: true,
      isLoading: false,
    });
  });

  test.each([
    ["an expired session", { expires_at: 1 }],
    ["a missing user", { user: null }],
    ["a missing user ID", { user: {} }],
    ["a missing access token", { access_token: undefined }],
    ["a blank access token", { access_token: " " }],
    ["a missing expiry", { expires_at: undefined }],
    ["a non-finite expiry", { expires_at: Infinity }],
  ])("does not expose %s", (_description, overrides) => {
    renderAccount();
    emitSession("INITIAL_SESSION", makeSession(overrides));

    expect(readAccount()).toMatchObject({
      userId: null,
      accessToken: null,
      sessionPresent: false,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  test("SIGNED_OUT clears account state and registration intent", () => {
    renderAccount();
    emitSession("SIGNED_IN", makeSession());
    storeRegistrationIntent("provider");

    emitSession("SIGNED_OUT", null);

    expect(readAccount()).toMatchObject({
      userId: null,
      accessToken: null,
      sessionPresent: false,
      isAuthenticated: false,
    });

    expect(readRegistrationIntent()).toBe("seeker");
  });

  test("explicit sign-out uses local scope and clears account state", async () => {
    renderAccount();
    emitSession("SIGNED_IN", makeSession());
    storeRegistrationIntent("provider");

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Sign out" })
      );
    });

    expect(authMocks.signOut).toHaveBeenCalledWith({
      scope: "local",
    });

    expect(readAccount()).toMatchObject({
      userId: null,
      accessToken: null,
      isAuthenticated: false,
      isSigningOut: false,
      isLoading: false,
    });

    expect(readRegistrationIntent()).toBe("seeker");
  });

  test("hides account information while sign-out is pending", async () => {
    let finishSignOut;

    authMocks.signOut.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishSignOut = resolve;
        })
    );

    renderAccount();
    emitSession("SIGNED_IN", makeSession());

    fireEvent.click(
      screen.getByRole("button", { name: "Sign out" })
    );

    expect(readAccount()).toMatchObject({
      userId: null,
      accessToken: null,
      sessionPresent: false,
      isAuthenticated: false,
      isLoading: true,
      isSigningOut: true,
    });

    await act(async () => {
      finishSignOut({ error: null });
    });

    expect(readAccount().isSigningOut).toBe(false);
  });

  test("does not report successful logout when the SDK returns an error", async () => {
    authMocks.signOut.mockResolvedValue({
      error: new Error("Network failure"),
    });

    renderAccount();
    emitSession("SIGNED_IN", makeSession());
    storeRegistrationIntent("provider");

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Sign out" })
      );
    });

    expect(screen.getByRole("alert").textContent).toBe(
      "Sign-out failed"
    );

    expect(readAccount()).toMatchObject({
      isAuthenticated: true,
      isSigningOut: false,
      isLoading: false,
    });

    expect(readRegistrationIntent()).toBe("provider");
  });

  test("removes expired account information without another API request", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T12:00:00Z"));

    renderAccount();
    emitSession(
      "SIGNED_IN",
      makeSession({
        expires_at: Date.now() / 1000 + 2,
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(readAccount()).toMatchObject({
      userId: null,
      accessToken: null,
      isAuthenticated: false,
    });

    // Access-token expiry must not revoke a recoverable session.
    expect(authMocks.signOut).not.toHaveBeenCalled();
  });

  test("token refresh cancels the previous expiry timer", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T12:00:00Z"));

    renderAccount();
    emitSession(
      "SIGNED_IN",
      makeSession({
        expires_at: Date.now() / 1000 + 2,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    emitSession(
      "TOKEN_REFRESHED",
      makeSession({
        access_token: "mock-refreshed-token",
        expires_at: Date.now() / 1000 + 5,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(readAccount()).toMatchObject({
      accessToken: "mock-refreshed-token",
      isAuthenticated: true,
    });

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(readAccount().isAuthenticated).toBe(false);
  });

  test("a later valid refresh can restore the frontend session", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T12:00:00Z"));

    renderAccount();
    emitSession(
      "SIGNED_IN",
      makeSession({
        expires_at: Date.now() / 1000 + 1,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(readAccount().isAuthenticated).toBe(false);

    emitSession(
      "TOKEN_REFRESHED",
      makeSession({
        access_token: "mock-recovered-token",
      })
    );

    expect(readAccount()).toMatchObject({
      accessToken: "mock-recovered-token",
      isAuthenticated: true,
    });

    expect(authMocks.signOut).not.toHaveBeenCalled();
  });

  test("long expiry values do not overflow browser timers", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T12:00:00Z"));

    renderAccount();
    emitSession(
      "SIGNED_IN",
      makeSession({
        expires_at: Date.now() / 1000 + 40 * 24 * 3600,
      })
    );

    act(() => {
      vi.advanceTimersByTime(2147483647);
    });

    expect(readAccount().isAuthenticated).toBe(true);
  });

  test("unsubscribes and ignores callbacks after unmount", () => {
    const view = renderAccount();
    view.unmount();

    storeRegistrationIntent("provider");
    emitSession("SIGNED_OUT", null);

    expect(authMocks.unsubscribe).toHaveBeenCalledTimes(1);
    expect(readRegistrationIntent()).toBe("provider");
  });
});