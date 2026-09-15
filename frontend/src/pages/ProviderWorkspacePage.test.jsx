import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import AuthProvider from "../auth/AuthProvider";
import ProviderWorkspacePage from "./ProviderWorkspacePage";
import {
  enrolCurrentUserAsProvider,
  getProviderWorkspace,
} from "../api/authApi";
import {
  readRegistrationIntent,
  storeRegistrationIntent,
} from "../auth/registrationIntent";

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

vi.mock("../api/authApi", () => ({
  enrolCurrentUserAsProvider: vi.fn(),
  getProviderWorkspace: vi.fn(),
}));

function makeSession(overrides = {}) {
  return {
    user: {
      id: "94000000-0000-4000-8000-000000000001",
    },
    access_token: "mock-provider-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

function deferred() {
  let resolve;
  let reject;

  const promise = new Promise(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    }
  );

  return { promise, resolve, reject };
}

function renderWorkspace() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/provider"]}>
        <Routes>
          <Route
            path="/provider"
            element={<ProviderWorkspacePage />}
          />

          <Route
            path="/"
            element={<h1>Public catalogue</h1>}
          />

          <Route
            path="/sign-in"
            element={<h1>Sign-in page</h1>}
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

async function emitSession(event, session) {
  await act(async () => {
    authMocks.callback(event, session);
  });
}

describe("Protected provider workspace session handling", () => {
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

    enrolCurrentUserAsProvider.mockResolvedValue({
      roles: [
        "property_provider",
        "property_seeker",
      ],
    });

    getProviderWorkspace.mockResolvedValue({
      fullName: "Test Provider",
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.sessionStorage.clear();
  });

  test("shows loading until the session is established", () => {
    renderWorkspace();

    expect(
      screen.getByRole("heading", {
        name: "Preparing your workspace",
      })
    ).toBeTruthy();

    expect(getProviderWorkspace).not.toHaveBeenCalled();
  });

  test("redirects anonymous visitors without calling protected APIs", async () => {
    renderWorkspace();
    await emitSession("INITIAL_SESSION", null);

    expect(
      screen.getByRole("heading", {
        name: "Sign-in page",
      })
    ).toBeTruthy();

    expect(getProviderWorkspace).not.toHaveBeenCalled();
    expect(
      enrolCurrentUserAsProvider
    ).not.toHaveBeenCalled();
  });

  test("renders the workspace after the endpoint confirms access", async () => {
    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    expect(
      await screen.findByRole("heading", {
        name: "Welcome, Test Provider",
      })
    ).toBeTruthy();

    expect(getProviderWorkspace).toHaveBeenCalledWith(
      "mock-provider-token",
      {
        signal: expect.any(AbortSignal),
      }
    );

    expect(
      enrolCurrentUserAsProvider
    ).not.toHaveBeenCalled();
  });

  test("completes provider intent before loading the workspace", async () => {
    storeRegistrationIntent("provider");
    renderWorkspace();

    await emitSession("INITIAL_SESSION", makeSession());

    await screen.findByRole("heading", {
      name: "Welcome, Test Provider",
    });

    expect(
      enrolCurrentUserAsProvider
    ).toHaveBeenCalledTimes(1);

    expect(getProviderWorkspace).toHaveBeenCalledTimes(1);

    expect(
      enrolCurrentUserAsProvider.mock.invocationCallOrder[0]
    ).toBeLessThan(
      getProviderWorkspace.mock.invocationCallOrder[0]
    );

    expect(readRegistrationIntent()).toBe("seeker");
  });

  test("a 403 never displays protected workspace content", async () => {
    getProviderWorkspace.mockRejectedValue({
      status: 403,
    });

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    expect(
      await screen.findByRole("heading", {
        name: "Provider access is required",
      })
    ).toBeTruthy();

    expect(
      screen.queryByText("Property drafts")
    ).toBeNull();
  });

  test("a 401 provides a separate sign-in-again action", async () => {
    getProviderWorkspace.mockRejectedValue({
      status: 401,
    });

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    expect(
      await screen.findByRole("heading", {
        name: "Please sign in again",
      })
    ).toBeTruthy();

    expect(
      screen.queryByText("Property drafts")
    ).toBeNull();

    expect(authMocks.signOut).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Sign in again",
        })
      );
    });

    expect(authMocks.signOut).toHaveBeenCalledWith({
      scope: "local",
    });

    expect(
      await screen.findByRole("heading", {
        name: "Sign-in page",
      })
    ).toBeTruthy();
  });

  test("sign-out clears intent and returns to public browsing", async () => {
    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    await screen.findByRole("heading", {
      name: "Welcome, Test Provider",
    });

    storeRegistrationIntent("provider");

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Sign out",
        })
      );
    });

    expect(
      await screen.findByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeTruthy();

    expect(
      screen.queryByText("Property drafts")
    ).toBeNull();

    expect(readRegistrationIntent()).toBe("seeker");
    expect(authMocks.signOut).toHaveBeenCalledTimes(1);
  });

  test("pending sign-out hides content and disables the button", async () => {
    const pending = deferred();

    authMocks.signOut.mockReturnValue(pending.promise);

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    await screen.findByRole("heading", {
      name: "Welcome, Test Provider",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign out",
      })
    );

    expect(
      screen.queryByText("Property drafts")
    ).toBeNull();

    expect(
      screen.getByRole("heading", {
        name: "Signing you out",
      })
    ).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Signing out...",
      }).disabled
    ).toBe(true);

    await act(async () => {
      pending.resolve({ error: null });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeTruthy();
  });

  test("failed sign-out shows a safe error and allows retry", async () => {
    authMocks.signOut.mockResolvedValueOnce({
      error: new Error("Private internal diagnostic"),
    });

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    await screen.findByRole("heading", {
      name: "Welcome, Test Provider",
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Sign out",
        })
      );
    });

    expect(
      await screen.findByText(
        "We could not complete sign-out. Please check your connection and try again."
      )
    ).toBeTruthy();

    expect(
      screen.queryByText("Private internal diagnostic")
    ).toBeNull();

    expect(
      screen.queryByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeNull();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Sign out",
        })
      );
    });

    expect(
      await screen.findByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeTruthy();
  });

  test("expiry removes an already-loaded workspace", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T12:00:00Z"));

    renderWorkspace();

    await emitSession(
      "INITIAL_SESSION",
      makeSession({
        expires_at: Date.now() / 1000 + 2,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: "Welcome, Test Provider",
      })
    ).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.getByRole("heading", {
        name: "Sign-in page",
      })
    ).toBeTruthy();

    expect(
      screen.queryByText("Property drafts")
    ).toBeNull();
  });

  test("token refresh hides old data until access is confirmed again", async () => {
    const pending = deferred();

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    await screen.findByRole("heading", {
      name: "Welcome, Test Provider",
    });

    getProviderWorkspace.mockReturnValueOnce(
      pending.promise
    );

    await emitSession(
      "TOKEN_REFRESHED",
      makeSession({
        access_token: "mock-fresh-token",
      })
    );

    expect(
      screen.queryByText("Property drafts")
    ).toBeNull();

    expect(
      screen.getByRole("heading", {
        name: "Preparing your workspace",
      })
    ).toBeTruthy();

    await act(async () => {
      pending.resolve({
        fullName: "Confirmed Provider",
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Welcome, Confirmed Provider",
      })
    ).toBeTruthy();
  });

  test("account switching hides the previous provider's data", async () => {
    const pending = deferred();

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    await screen.findByRole("heading", {
      name: "Welcome, Test Provider",
    });

    getProviderWorkspace.mockReturnValueOnce(
      pending.promise
    );

    await emitSession(
      "SIGNED_IN",
      makeSession({
        user: {
          id: "94000000-0000-4000-8000-000000000002",
        },
        access_token: "mock-second-provider-token",
      })
    );

    expect(
      screen.queryByRole("heading", {
        name: "Welcome, Test Provider",
      })
    ).toBeNull();

    await act(async () => {
      pending.resolve({
        fullName: "Second Provider",
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Welcome, Second Provider",
      })
    ).toBeTruthy();
  });

  test("a late response cannot restore content after logout", async () => {
    const pending = deferred();

    getProviderWorkspace.mockReturnValueOnce(
      pending.promise
    );

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    const requestSignal =
      getProviderWorkspace.mock.calls[0][1].signal;

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Sign out",
        })
      );
    });

    expect(requestSignal.aborted).toBe(true);

    await act(async () => {
      pending.resolve({
        fullName: "Late Provider",
      });
    });

    expect(
      screen.getByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeTruthy();

    expect(
      screen.queryByRole("heading", {
        name: "Welcome, Late Provider",
      })
    ).toBeNull();
  });

  test("a stale 401 cannot replace a refreshed workspace", async () => {
    const pending = deferred();

    getProviderWorkspace.mockReturnValueOnce(
      pending.promise
    );

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    const oldSignal =
      getProviderWorkspace.mock.calls[0][1].signal;

    await emitSession(
      "TOKEN_REFRESHED",
      makeSession({
        access_token: "mock-fresh-token",
      })
    );

    await screen.findByRole("heading", {
      name: "Welcome, Test Provider",
    });

    expect(oldSignal.aborted).toBe(true);

    await act(async () => {
      pending.reject({ status: 401 });
    });

    expect(
      screen.getByRole("heading", {
        name: "Welcome, Test Provider",
      })
    ).toBeTruthy();

    expect(
      screen.queryByRole("heading", {
        name: "Please sign in again",
      })
    ).toBeNull();

    expect(authMocks.signOut).not.toHaveBeenCalled();
  });

  test("cancelled enrolment cannot continue loading the workspace", async () => {
    const pending = deferred();

    storeRegistrationIntent("provider");

    enrolCurrentUserAsProvider.mockReturnValueOnce(
      pending.promise
    );

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Sign out",
        })
      );
    });

    storeRegistrationIntent("provider");

    await act(async () => {
      pending.resolve({
        roles: ["property_provider"],
      });
    });

    expect(getProviderWorkspace).not.toHaveBeenCalled();
    expect(readRegistrationIntent()).toBe("provider");

    expect(
      screen.getByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeTruthy();
  });

  test("malformed workspace data displays a controlled error", async () => {
    getProviderWorkspace.mockResolvedValue(null);

    renderWorkspace();
    await emitSession("INITIAL_SESSION", makeSession());

    expect(
      await screen.findByRole("heading", {
        name: "Workspace temporarily unavailable",
      })
    ).toBeTruthy();

    expect(
      screen.queryByText("Property drafts")
    ).toBeNull();
  });
});