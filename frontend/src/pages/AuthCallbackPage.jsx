import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import {
  clearRegistrationIntent,
  readRegistrationIntent,
} from "../auth/registrationIntent";

const authErrorParameters = [
  "error",
  "error_code",
  "error_description",
];

function containsAuthenticationError(search, hash) {
  const searchParameters = new URLSearchParams(search);
  const hashParameters = new URLSearchParams(
    hash.startsWith("#") ? hash.slice(1) : hash
  );

  return authErrorParameters.some(
    (parameter) =>
      searchParameters.has(parameter) ||
      hashParameters.has(parameter)
  );
}

function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  let registrationIntent = "seeker";
  let intentReadFailed = false;

  try {
    registrationIntent = readRegistrationIntent();
  } catch {
    intentReadFailed = true;
  }

  const callbackHasError = containsAuthenticationError(
    location.search,
    location.hash
  );

  const authenticationFailed =
    callbackHasError ||
    intentReadFailed ||
    (!isLoading && !isAuthenticated);

  const retryDestination = intentReadFailed
    ? "/join"
    : `/sign-in?intent=${registrationIntent}`;

  useEffect(() => {
    if (
      callbackHasError ||
      intentReadFailed ||
      isLoading ||
      !isAuthenticated
    ) {
      return;
    }

    const destination =
      registrationIntent === "provider" ? "/provider" : "/";

    if (registrationIntent === "seeker") {
      clearRegistrationIntent();
    }

    navigate(destination, { replace: true });
  }, [
    callbackHasError,
    intentReadFailed,
    isAuthenticated,
    isLoading,
    navigate,
    registrationIntent,
  ]);

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
          className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm sm:p-10"
          aria-labelledby="callback-heading"
        >
          {!authenticationFailed && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-kudu-green">
                Secure authentication
              </p>

              <h1
                id="callback-heading"
                className="mt-4 text-3xl font-semibold tracking-tight text-kudu-green"
              >
                {isAuthenticated
                  ? "Sign-in complete"
                  : "Completing your sign-in"}
              </h1>

              <p
                className="mt-5 leading-7 text-stone-700"
                role="status"
                aria-live="polite"
              >
                {isAuthenticated
                  ? "Your session is ready. Returning you to Kudu..."
                  : "Please wait while we securely establish your session."}
              </p>
            </>
          )}

          {authenticationFailed && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
                Authentication unsuccessful
              </p>

              <h1
                id="callback-heading"
                className="mt-4 text-3xl font-semibold tracking-tight text-kudu-green"
              >
                We could not complete your sign-in
              </h1>

              <p
                className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-4 leading-7 text-red-800"
                role="alert"
              >
                {intentReadFailed
                  ? "Your browser could not read sign-in progress. Please check its site-storage settings, then choose your account type again."
                  : "Please return to sign in and try again. Public property browsing remains available."}
              </p>

              <Link
                to={retryDestination}
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-kudu-green px-6 font-semibold text-white transition hover:opacity-90"
              >
                {intentReadFailed
                  ? "Return to account choices"
                  : "Return to sign in"}
              </Link>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuthCallbackPage;