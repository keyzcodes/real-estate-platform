import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  clearRegistrationIntent,
  normalizeRegistrationIntent,
  storeRegistrationIntent,
} from "../auth/registrationIntent";
import useAuth from "../auth/useAuth";
import supabase from "../config/supabase";

function SignInPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const registrationIntent = normalizeRegistrationIntent(
    searchParams.get("intent"),
  );

  useEffect(() => {
  try {
    storeRegistrationIntent(registrationIntent);
  } catch {
    // Keep the page usable. The sign-in handler reports storage errors.
  }
}, [registrationIntent]);

  async function handleGoogleSignIn() {
  if (
    isLoading ||
    isAuthenticated ||
    submissionStatus === "loading"
  ) {
    return;
  }

  setSubmissionStatus("loading");
  setErrorMessage("");

  let intentSaved = false;

  try {
    storeRegistrationIntent(registrationIntent);
    intentSaved = true;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  } catch {
    try {
      clearRegistrationIntent();
    } catch {
      // Cleanup can also fail when browser storage is unavailable.
    }

    setErrorMessage(
      intentSaved
        ? "We could not start sign-in. Please try again in a moment."
        : "Your browser could not save sign-in progress. Please check its site-storage settings and try again."
    );

    setSubmissionStatus("idle");
  }
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

      <main className="mx-auto flex max-w-7xl justify-center px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <section
          className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-10"
          aria-labelledby="sign-in-heading"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-kudu-green">
            Secure account access
          </p>

          <h1
            id="sign-in-heading"
            className="mt-4 text-4xl font-semibold tracking-tight text-kudu-green"
          >
            Sign in to Kudu
          </h1>

          <p className="mt-5 leading-7 text-stone-700">
            Continue securely with your Google account. Kudu does not receive
            your Google password.
          </p>
          <p
            className="mt-5 rounded-lg bg-kudu-green/10 px-4 py-3 text-sm font-medium text-kudu-green"
            aria-live="polite"
          >
            You are continuing as a property{" "}
            {registrationIntent === "provider" ? "provider" : "seeker"}.
          </p>

          <div className="mt-8">
            {isLoading && (
              <p
                className="rounded-lg bg-kudu-green/10 px-4 py-4 font-medium text-kudu-green"
                role="status"
              >
                Checking your session...
              </p>
            )}

            {!isLoading && isAuthenticated && (
              <div
                className="rounded-lg bg-kudu-green/10 px-4 py-5"
                role="status"
              >
                <p className="font-semibold text-kudu-green">
                  You are already signed in.
                </p>

                <Link
                  to="/join"
                  className="mt-4 inline-flex font-semibold text-kudu-green hover:underline"
                >
                  Continue to account choices
                </Link>
              </div>
            )}

            {!isLoading && !isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submissionStatus === "loading"}
                  className="flex min-h-12 w-full items-center justify-center rounded-lg bg-kudu-green px-5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submissionStatus === "loading"
                    ? "Connecting to Google..."
                    : "Continue with Google"}
                </button>

                {errorMessage && (
                  <p
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                )}
              </>
            )}
          </div>

          <p className="mt-8 text-sm leading-6 text-stone-600">
            Authentication confirms your identity. Provider permissions and
            listing publication are controlled separately.
          </p>

          <Link
            to="/join"
            className="mt-6 inline-flex font-semibold text-kudu-green hover:underline"
          >
            Back to account choices
          </Link>
        </section>
      </main>
    </div>
  );
}

export default SignInPage;
