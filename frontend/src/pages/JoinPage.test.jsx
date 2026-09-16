import {
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
  describe,
  expect,
  test,
} from "vitest";
import JoinPage from "./JoinPage";

function renderJoinPage() {
  return render(
    <MemoryRouter initialEntries={["/join"]}>
      <Routes>
        <Route
          path="/join"
          element={<JoinPage />}
        />

        <Route
          path="/properties"
          element={<h1>Public property catalogue</h1>}
        />

        <Route
          path="/sign-in"
          element={<h1>Sign-in page</h1>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("Join page", () => {
  afterEach(() => {
    cleanup();
  });

  test("presents accessible seeker and provider choices", () => {
    renderJoinPage();

    expect(
      screen.getByRole("heading", {
        name: "How would you like to use the platform?",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Find a property",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "List a property",
      })
    ).toBeInTheDocument();
  });

  test("uses fixed seeker and provider intent URLs", () => {
    renderJoinPage();

    expect(
      screen.getByRole("link", {
        name: "Continue as a seeker",
      })
    ).toHaveAttribute(
      "href",
      "/sign-in?intent=seeker"
    );

    expect(
      screen.getByRole("link", {
        name: "Continue as a provider",
      })
    ).toHaveAttribute(
      "href",
      "/sign-in?intent=provider"
    );

    expect(
      screen.getByRole("link", {
        name: "Sign in",
      })
    ).toHaveAttribute("href", "/sign-in");
  });

  test("allows anonymous visitors to continue browsing", () => {
    renderJoinPage();

    fireEvent.click(
      screen.getByRole("link", {
        name: "Browse without signing in",
      })
    );

    expect(
      screen.getByRole("heading", {
        name: "Public property catalogue",
      })
    ).toBeInTheDocument();
  });

  test("does not promise automatic verification or publication", () => {
    renderJoinPage();

    expect(
      screen.getByText(
        /does not verify or publish a property automatically/i
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: /admin/i,
      })
    ).not.toBeInTheDocument();
  });

  test("keeps the provider action readable on its light background", () => {
    renderJoinPage();

    const providerLink = screen.getByRole("link", {
      name: "Continue as a provider",
    });

    expect(providerLink).toHaveClass("bg-white");
    expect(providerLink).toHaveClass("font-semibold");
    expect(providerLink).toHaveClass("text-kudu-green");
  });
});