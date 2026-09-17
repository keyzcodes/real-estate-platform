import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import SignInPage from "./SignInPage";

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  signInWithOAuth: vi.fn(),
}));

vi.mock("../auth/useAuth", () => ({
  default: authMocks.useAuth,
}));

vi.mock("../config/supabase", () => ({
  default: {
    auth: {
      signInWithOAuth: authMocks.signInWithOAuth,
    },
  },
}));

const storageKey = "kudu.registration-intent";
const safeSignInError =
  "We could not start sign-in. Please try again in a moment.";
const safeStorageError =
  "Your browser could not save sign-in progress. Please check its site-storage settings and try again.";

function renderSignIn(entry = "/sign-in?intent=provider") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <SignInPage />
    </MemoryRouter>,
  );
}

async function clickSignIn() {
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );
  });
}

describe("Sign-in error recovery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    authMocks.signInWithOAuth.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  test.each(["seeker", "provider"])(
    "shows and preserves the selected %s choice",
    (intent) => {
      renderSignIn(`/sign-in?intent=${intent}`);

      expect(
        screen.getByText(`You are continuing as a property ${intent}.`),
      ).toBeInTheDocument();
      expect(window.sessionStorage.getItem(storageKey)).toBe(intent);
      expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
    },
  );

  test.each(["admin", "https://attacker.example"])(
    "defaults unsupported intent %s to seeker",
    (intent) => {
      renderSignIn(`/sign-in?intent=${encodeURIComponent(intent)}`);

      expect(
        screen.getByText("You are continuing as a property seeker."),
      ).toBeInTheDocument();
      expect(window.sessionStorage.getItem(storageKey)).toBe("seeker");
      expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
    },
  );

  test("waits for the session before offering sign-in", () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });
    renderSignIn();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Checking your session...",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
  });

  test("offers the provider workspace when already signed in with provider intent", () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    renderSignIn();

    expect(screen.getByRole("status")).toHaveTextContent(
      "You are already signed in.",
    );
    expect(
      screen.getByRole("link", {
        name: "Continue to provider workspace",
      }),
    ).toHaveAttribute("href", "/provider");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
  });

  test("offers property browsing when already signed in with seeker intent", () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    renderSignIn("/sign-in?intent=seeker");

    expect(screen.getByRole("status")).toHaveTextContent(
      "You are already signed in.",
    );
    expect(
      screen.getByRole("link", {
        name: "Continue to property browsing",
      }),
    ).toHaveAttribute("href", "/properties");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
  });
  test("saves intent before OAuth and ignores an arbitrary return URL", async () => {
    authMocks.signInWithOAuth.mockImplementation(async () => {
      expect(window.sessionStorage.getItem(storageKey)).toBe("provider");
      return { error: null };
    });
    renderSignIn("/sign-in?intent=provider&returnTo=https://attacker.example");
    await clickSignIn();

    expect(authMocks.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(authMocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connecting to Google..." }),
    ).toBeDisabled();
  });

  test("disables repeated clicks while OAuth is pending", async () => {
    let finishSignIn;
    const pendingSignIn = new Promise((resolve) => {
      finishSignIn = resolve;
    });
    authMocks.signInWithOAuth.mockReturnValue(pendingSignIn);
    renderSignIn();
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    const pendingButton = screen.getByRole("button", {
      name: "Connecting to Google...",
    });
    expect(pendingButton).toBeDisabled();
    fireEvent.click(pendingButton);
    expect(authMocks.signInWithOAuth).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishSignIn({ error: null });
    });
  });

  test.each(["returned error", "rejected promise"])(
    "handles an OAuth %s without exposing its details",
    async (failureMode) => {
      const privateDetails = "Private OAuth diagnostic for testing";
      if (failureMode === "returned error") {
        authMocks.signInWithOAuth.mockResolvedValue({
          error: { message: privateDetails },
        });
      } else {
        authMocks.signInWithOAuth.mockRejectedValue(new Error(privateDetails));
      }
      renderSignIn();
      await clickSignIn();

      expect(screen.getByRole("alert")).toHaveTextContent(safeSignInError);
      expect(document.body).not.toHaveTextContent(privateDetails);
      expect(window.sessionStorage.getItem(storageKey)).toBeNull();
      expect(
        screen.getByRole("button", { name: "Continue with Google" }),
      ).toBeEnabled();
    },
  );

  test("clears the previous error and saves intent again on retry", async () => {
    authMocks.signInWithOAuth
      .mockResolvedValueOnce({ error: { message: "Mock OAuth failure" } })
      .mockResolvedValueOnce({ error: null });
    renderSignIn();
    await clickSignIn();
    expect(screen.getByRole("alert")).toHaveTextContent(safeSignInError);

    await clickSignIn();

    expect(authMocks.signInWithOAuth).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(storageKey)).toBe("provider");
  });

  test("blocked storage prevents OAuth and allows retry after recovery", async () => {
    const write = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Private storage write diagnostic");
      });
    renderSignIn();
    await clickSignIn();

    expect(screen.getByRole("alert")).toHaveTextContent(safeStorageError);
    expect(document.body).not.toHaveTextContent(
      "Private storage write diagnostic",
    );
    expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeEnabled();

    write.mockRestore();
    await clickSignIn();

    expect(authMocks.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(storageKey)).toBe("provider");
  });

  test("an inaccessible storage property does not crash the page", async () => {
    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => {
      throw new Error("Private inaccessible storage diagnostic");
    });
    renderSignIn();
    await clickSignIn();

    expect(screen.getByRole("alert")).toHaveTextContent(safeStorageError);
    expect(document.body).not.toHaveTextContent(
      "Private inaccessible storage diagnostic",
    );
    expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeEnabled();
  });

  test("cleanup failure cannot hide the sign-in error or prevent retry", async () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("Private cleanup diagnostic");
    });
    authMocks.signInWithOAuth
      .mockResolvedValueOnce({ error: { message: "Private OAuth diagnostic" } })
      .mockResolvedValueOnce({ error: null });
    renderSignIn();
    await clickSignIn();

    expect(screen.getByRole("alert")).toHaveTextContent(safeSignInError);
    expect(document.body).not.toHaveTextContent("Private cleanup diagnostic");
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeEnabled();

    await clickSignIn();

    expect(authMocks.signInWithOAuth).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
