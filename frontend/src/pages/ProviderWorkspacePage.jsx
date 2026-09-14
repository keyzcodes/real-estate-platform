import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
} from "react-router-dom";
import {
  clearRegistrationIntent,
  readRegistrationIntent,
} from "../auth/registrationIntent";
import useAuth from "../auth/useAuth";
import {
  enrolCurrentUserAsProvider,
  getProviderWorkspace,
} from "../api/authApi";

function ProviderWorkspacePage() {
  const {
    accessToken,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [status, setStatus] = useState("idle");

  const registrationIntent =
    readRegistrationIntent();

  const shouldCompleteProviderEnrolment =
    registrationIntent === "provider";

  useEffect(() => {
    if (
      isLoading ||
      !isAuthenticated ||
      !accessToken
    ) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadProviderWorkspace() {
      setStatus("loading");

      try {
        if (shouldCompleteProviderEnrolment) {
          await enrolCurrentUserAsProvider(
            accessToken,
            {
              signal: controller.signal,
            }
          );

          clearRegistrationIntent();
        }

        const workspaceData =
          await getProviderWorkspace(
            accessToken,
            {
              signal: controller.signal,
            }
          );

        setWorkspace(workspaceData);
        setStatus("success");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (error.status === 401) {
          setStatus("session-expired");
          return;
        }

        if (error.status === 403) {
          setStatus("access-denied");
          return;
        }

        setStatus("error");
      }
    }

    loadProviderWorkspace();

    return () => {
      controller.abort();
    };
  }, [
    accessToken,
    isAuthenticated,
    isLoading,
    shouldCompleteProviderEnrolment,
  ]);

  if (!isLoading && !isAuthenticated) {
    return (
      <Navigate
        to="/sign-in?intent=provider"
        replace
      />
    );
  }

  let content;

  if (
    isLoading ||
    status === "idle" ||
    status === "loading"
  ) {
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
          Preparing your workspace
        </h1>

        <p
          className="mt-5 leading-7 text-stone-700"
          role="status"
          aria-live="polite"
        >
          We are securely confirming your account and
          provider access.
        </p>
      </section>
    );
  } else if (
    status === "access-denied" ||
    status === "session-expired"
  ) {
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
          Your current account cannot access the
          provider workspace.
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

        <p
          className="mt-5 leading-7 text-stone-700"
          role="alert"
        >
          We could not load the provider workspace.
          Please try again later.
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
          Your provider access has been confirmed.
          This workspace will become the home of your
          property submissions.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-kudu-green">
              Property drafts
            </h2>

            <p className="mt-3 leading-7 text-stone-700">
              Property creation and editing will be
              introduced in the following sprint.
            </p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-kudu-green">
              Media preparation
            </h2>

            <p className="mt-3 leading-7 text-stone-700">
              Photo, video and 360-degree uploads remain
              disabled until Cloudinary integration.
            </p>
          </article>

          <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-kudu-green">
              Publication control
            </h2>

            <p className="mt-3 leading-7 text-stone-700">
              Provider submissions will still require
              administrator verification before
              publication.
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

          <nav aria-label="Primary navigation">
            <Link
              to="/properties"
              className="font-medium text-kudu-green hover:underline"
            >
              Browse properties
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        {content}
      </main>
    </div>
  );
}

export default ProviderWorkspacePage;