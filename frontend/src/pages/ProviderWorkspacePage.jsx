import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  clearRegistrationIntent,
  readRegistrationIntent,
} from "../auth/registrationIntent";
import useAuth from "../auth/useAuth";
import {
  enrolCurrentUserAsProvider,
  getProviderWorkspace,
} from "../api/authApi";

function hasProviderRegistrationIntent() {
  try {
    return readRegistrationIntent() === "provider";
  } catch {
    // Registration intent is only a UI hint. Database roles remain authoritative.
    return false;
  }
}

function ProviderWorkspacePage() {
  const navigate = useNavigate();

  const {
    accessToken,
    isAuthenticated,
    isLoading,
    isSigningOut,
    signOut,
    user,
  } = useAuth();

  const [result, setResult] = useState({
    accountKey: null,
    workspace: null,
    status: "idle",
  });

  const [signOutError, setSignOutError] = useState("");
  const [isLeavingWorkspace, setIsLeavingWorkspace] = useState(false);
  const [isSignOutConfirmationOpen, setIsSignOutConfirmationOpen] =
    useState(false);

  const signOutButtonRef = useRef(null);
  const staySignedInButtonRef = useRef(null);

  useEffect(() => {
    if (isSignOutConfirmationOpen) {
      staySignedInButtonRef.current?.focus();
    }
  }, [isSignOutConfirmationOpen]);

  // Keep this key in memory only. Never render or log access tokens.
  const accountKey =
    isAuthenticated && accessToken && user?.id
      ? `${user.id}:${accessToken}`
      : null;

  const workspace = result.accountKey === accountKey ? result.workspace : null;

  const status = result.accountKey === accountKey ? result.status : "idle";

  useEffect(() => {
    if (
      isLoading ||
      isSigningOut ||
      !isAuthenticated ||
      !accessToken ||
      !accountKey
    ) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadProviderWorkspace() {
      setResult({
        accountKey,
        workspace: null,
        status: "loading",
      });

      try {
        if (hasProviderRegistrationIntent()) {
          await enrolCurrentUserAsProvider(accessToken, {
            signal: controller.signal,
          });

          if (controller.signal.aborted) {
            return;
          }

          clearRegistrationIntent();
        }

        const workspaceData = await getProviderWorkspace(accessToken, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (typeof workspaceData?.fullName !== "string") {
          throw new Error("The workspace response is invalid.");
        }

        setResult({
          accountKey,
          workspace: workspaceData,
          status: "success",
        });
      } catch (error) {
        if (controller.signal.aborted || error?.name === "AbortError") {
          return;
        }

        setResult({
          accountKey,
          workspace: null,
          status:
            error?.status === 401
              ? "session-expired"
              : error?.status === 403
                ? "access-denied"
                : "error",
        });
      }
    }

    loadProviderWorkspace();

    return () => {
      controller.abort();
    };
  }, [accessToken, accountKey, isAuthenticated, isLoading, isSigningOut]);

  function requestSignOut() {
    setSignOutError("");
    setIsSignOutConfirmationOpen(true);
  }

  function cancelSignOut() {
    setIsSignOutConfirmationOpen(false);
    signOutButtonRef.current?.focus();
  }

  async function handleSignOut(destination = "/", navigationState = null) {
    setIsSignOutConfirmationOpen(false);
    setSignOutError("");
    setIsLeavingWorkspace(true);

    try {
      await signOut();
      navigate(destination, {
        replace: true,
        state: navigationState,
      });
    } catch {
      setIsLeavingWorkspace(false);

      setSignOutError(
        "We could not complete sign-out. Please check your connection and try again.",
      );
    }
  }

  if (!isLoading && !isSigningOut && !isAuthenticated && !isLeavingWorkspace) {
    return <Navigate to="/sign-in?intent=provider" replace />;
  }

  let content;

  if (isLoading || isSigningOut || status === "idle" || status === "loading") {
    content = (
      <section
        className="mx-auto max-w-xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm"
        aria-labelledby="workspace-loading-heading"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-kudu-green">
          Protected provider access
        </p>

        <h1
          id="workspace-loading-heading"
          className="mt-4 text-3xl font-semibold text-kudu-green"
        >
          {isSigningOut ? "Signing you out" : "Preparing your workspace"}
        </h1>

        <p
          className="mt-5 leading-7 text-stone-700"
          role="status"
          aria-live="polite"
        >
          {isSigningOut
            ? "Your protected workspace is hidden while sign-out completes."
            : "We are securely confirming your account and provider access."}
        </p>
      </section>
    );
  } else if (status === "session-expired") {
    content = (
      <section
        className="mx-auto max-w-xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm"
        aria-labelledby="workspace-session-heading"
      >
        <h1
          id="workspace-session-heading"
          className="text-3xl font-semibold text-kudu-green"
        >
          Please sign in again
        </h1>

        <p
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 leading-7 text-red-800"
          role="alert"
        >
          Your session could not be verified. Sign in again to continue.
        </p>

        <button
          type="button"
          onClick={() => handleSignOut("/sign-in?intent=provider")}
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-kudu-green px-6 font-semibold text-white transition hover:opacity-90"
        >
          Sign in again
        </button>
      </section>
    );
  } else if (status === "access-denied") {
    content = (
      <section
        className="mx-auto max-w-xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm"
        aria-labelledby="workspace-denied-heading"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
          Access unavailable
        </p>

        <h1
          id="workspace-denied-heading"
          className="mt-4 text-3xl font-semibold text-kudu-green"
        >
          Provider access is required
        </h1>

        <p
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 leading-7 text-red-800"
          role="alert"
        >
          Your current account cannot access the provider workspace.
        </p>

        <Link
          to="/join"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-kudu-green px-6 font-semibold text-white transition hover:opacity-90"
        >
          View registration options
        </Link>
      </section>
    );
  } else if (status === "error") {
    content = (
      <section
        className="mx-auto max-w-xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm"
        aria-labelledby="workspace-error-heading"
      >
        <h1
          id="workspace-error-heading"
          className="text-3xl font-semibold text-kudu-green"
        >
          Workspace temporarily unavailable
        </h1>

        <p className="mt-5 leading-7 text-stone-700" role="alert">
          We could not load the provider workspace. Please try again later.
        </p>

        <Link
          to="/properties"
          className="mt-8 inline-flex font-semibold text-kudu-green hover:underline"
        >
          Return to property browsing
        </Link>
      </section>
    );
  } else {
    content = (
      <section aria-labelledby="workspace-heading">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-kudu-green">
          Protected provider workspace
        </p>

        <h1
          id="workspace-heading"
          className="mt-4 text-4xl font-semibold tracking-tight text-kudu-green sm:text-5xl"
        >
          Welcome, {workspace.fullName}
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
          Your provider access has been confirmed. This workspace will become
          the home of your property submissions.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-kudu-green">
              Property drafts
            </h2>

            <p className="mt-3 leading-7 text-stone-700">
              Property creation and editing will be introduced in the following
              sprint.
            </p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-kudu-green">
              Media preparation
            </h2>

            <p className="mt-3 leading-7 text-stone-700">
              Photo, video and 360-degree uploads remain disabled until
              Cloudinary integration.
            </p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-kudu-green">
              Publication control
            </h2>

            <p className="mt-3 leading-7 text-stone-700">
              Provider submissions will still require administrator verification
              before publication.
            </p>
          </article>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-kudu-ivory text-stone-900">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-kudu-green"
          >
            Kudu
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center justify-end gap-4"
          >
            <Link
              to="/properties"
              className="font-medium text-kudu-green hover:underline"
            >
              Browse properties
            </Link>

            {(isAuthenticated || isSigningOut) && (
              <button
                ref={signOutButtonRef}
                type="button"
                onClick={requestSignOut}
                disabled={isSigningOut || isLeavingWorkspace}
                aria-controls="sign-out-confirmation"
                aria-expanded={isSignOutConfirmationOpen}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-kudu-green px-4 font-semibold text-kudu-green transition hover:bg-kudu-green/5 disabled:cursor-wait disabled:opacity-60"
              >
                {isSigningOut || isLeavingWorkspace
                  ? "Signing out..."
                  : "Sign out"}
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        {isSignOutConfirmationOpen && (
          <section
            id="sign-out-confirmation"
            role="region"
            aria-labelledby="sign-out-confirmation-heading"
            className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm"
          >
            <h2
              id="sign-out-confirmation-heading"
              className="text-xl font-semibold text-stone-900"
            >
              Are you sure you want to sign out?
            </h2>

            <p className="mt-3 leading-7 text-stone-700">
              You will need to sign in again to return to your provider
              workspace.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                ref={staySignedInButtonRef}
                type="button"
                onClick={cancelSignOut}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-kudu-green px-5 font-semibold text-kudu-green transition hover:bg-kudu-green/5"
              >
                Stay signed in
              </button>

              <button
                type="button"
                onClick={() => handleSignOut("/", { signedOut: true })}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-kudu-green px-5 font-semibold text-white transition hover:opacity-90"
              >
                Yes, sign out
              </button>
            </div>
          </section>
        )}
        {signOutError && (
          <p
            className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 leading-7 text-red-800"
            role="alert"
          >
            {signOutError}
          </p>
        )}

        {content}
      </main>
    </div>
  );
}

export default ProviderWorkspacePage;
