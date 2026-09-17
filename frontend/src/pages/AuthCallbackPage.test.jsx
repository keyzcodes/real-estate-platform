import {
  cleanup,
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
import {
  storeRegistrationIntent,
} from "../auth/registrationIntent";
import AuthCallbackPage from "./AuthCallbackPage";

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("../auth/useAuth", () => ({
  default: authMocks.useAuth,
}));

const storageKey = "kudu.registration-intent";

const genericCallbackError =
  "Please return to sign in and try again. Public property browsing remains available.";

const storageCallbackError =
  "Your browser could not read sign-in progress. Please check its site-storage settings, then choose your account type again.";

function CallbackRoutes() {
  return (
    <Routes>
      <Route
        path="/auth/callback"
        element={<AuthCallbackPage />}
      />

      <Route
        path="/"
        element={<h1>Public catalogue</h1>}
      />

      <Route
        path="/provider"
        element={<h1>Provider workspace entry</h1>}
      />

      <Route
        path="/join"
        element={<h1>Account choices</h1>}
      />

      <Route
        path="/sign-in"
        element={<h1>Sign-in page</h1>}
      />
    </Routes>
  );
}

function renderCallback(entry = "/auth/callback") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <CallbackRoutes />
    </MemoryRouter>
  );
}

describe("Authentication callback recovery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.clear();

    authMocks.useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  test("shows a controlled loading state while the session is established", () => {
    renderCallback();

    expect(
      screen.getByRole("heading", {
        name: "Completing your sign-in",
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Please wait while we securely establish your session."
    );

    expect(
      screen.queryByRole("alert")
    ).not.toBeInTheDocument();
  });

  test("finishes a seeker callback after loading completes", async () => {
    let authState = {
      isAuthenticated: false,
      isLoading: true,
    };

    authMocks.useAuth.mockImplementation(() => authState);
    storeRegistrationIntent("seeker");

    const view = renderCallback();

    expect(
      screen.getByRole("heading", {
        name: "Completing your sign-in",
      })
    ).toBeInTheDocument();

    authState = {
      isAuthenticated: true,
      isLoading: false,
    };

    view.rerender(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <CallbackRoutes />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeInTheDocument();

    expect(
      window.sessionStorage.getItem(storageKey)
    ).toBeNull();
  });

  test("shows a safe retry when authentication finishes without a session", () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderCallback();

    expect(
      screen.getByRole("heading", {
        name: "We could not complete your sign-in",
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      genericCallbackError
    );

    expect(
      screen.getByRole("link", {
        name: "Return to sign in",
      })
    ).toHaveAttribute(
      "href",
      "/sign-in?intent=seeker"
    );
  });

  test("routes a completed seeker sign-in to public browsing", async () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    storeRegistrationIntent("seeker");
    renderCallback();

    expect(
      await screen.findByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeInTheDocument();

    expect(
      window.sessionStorage.getItem(storageKey)
    ).toBeNull();
  });

  test("routes provider intent only to the protected workspace entry", async () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    storeRegistrationIntent("provider");
    renderCallback();

    expect(
      await screen.findByRole("heading", {
        name: "Provider workspace entry",
      })
    ).toBeInTheDocument();

    expect(
      window.sessionStorage.getItem(storageKey)
    ).toBe("provider");
  });

  test("ignores an arbitrary return URL after provider sign-in", async () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    storeRegistrationIntent("provider");

    renderCallback(
      "/auth/callback?returnTo=https%3A%2F%2Fattacker.example"
    );

    expect(
      await screen.findByRole("heading", {
        name: "Provider workspace entry",
      })
    ).toBeInTheDocument();

    expect(document.body).not.toHaveTextContent(
      "attacker.example"
    );
  });

  test("defaults an unsupported saved intent to seeker", async () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    window.sessionStorage.setItem(storageKey, "admin");

    renderCallback();

    expect(
      await screen.findByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Provider workspace entry",
      })
    ).not.toBeInTheDocument();

    expect(
      window.sessionStorage.getItem(storageKey)
    ).toBeNull();
  });

  test.each([
    [
      "query",
      "/auth/callback?error=access_denied&error_description=Private%20query%20diagnostic",
    ],
    [
      "hash",
      "/auth/callback#error_code=oauth_failed&error_description=Private%20hash%20diagnostic",
    ],
  ])(
    "blocks navigation when the callback contains a %s error",
    (source, entry) => {
      const privateDetails =
        `Private ${source} diagnostic`;

      authMocks.useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      storeRegistrationIntent("provider");
      renderCallback(entry);

      expect(
        screen.getByRole("heading", {
          name: "We could not complete your sign-in",
        })
      ).toBeInTheDocument();

      expect(screen.getByRole("alert")).toHaveTextContent(
        genericCallbackError
      );

      expect(document.body).not.toHaveTextContent(
        privateDetails
      );

      expect(
        screen.getByRole("link", {
          name: "Return to sign in",
        })
      ).toHaveAttribute(
        "href",
        "/sign-in?intent=provider"
      );

      expect(
        screen.queryByRole("heading", {
          name: "Provider workspace entry",
        })
      ).not.toBeInTheDocument();

      expect(
        window.sessionStorage.getItem(storageKey)
      ).toBe("provider");
    }
  );

  test("blocked storage stops navigation and returns to account choices", () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    vi.spyOn(
      Storage.prototype,
      "getItem"
    ).mockImplementation(() => {
      throw new Error(
        "Private storage read diagnostic"
      );
    });

    renderCallback();

    expect(
      screen.getByRole("heading", {
        name: "We could not complete your sign-in",
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      storageCallbackError
    );

    expect(document.body).not.toHaveTextContent(
      "Private storage read diagnostic"
    );

    expect(
      screen.getByRole("link", {
        name: "Return to account choices",
      })
    ).toHaveAttribute("href", "/join");

    expect(
      screen.queryByRole("heading", {
        name: "Public catalogue",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Provider workspace entry",
      })
    ).not.toBeInTheDocument();
  });

  test("cleanup failure cannot prevent a successful seeker redirect", async () => {
    authMocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    storeRegistrationIntent("seeker");

    vi.spyOn(
      Storage.prototype,
      "removeItem"
    ).mockImplementation(() => {
      throw new Error("Private cleanup diagnostic");
    });

    renderCallback();

    expect(
      await screen.findByRole("heading", {
        name: "Public catalogue",
      })
    ).toBeInTheDocument();

    expect(document.body).not.toHaveTextContent(
      "Private cleanup diagnostic"
    );

    expect(
      window.sessionStorage.getItem(storageKey)
    ).toBe("seeker");
  });
});