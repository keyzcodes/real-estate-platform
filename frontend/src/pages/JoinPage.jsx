import { Link } from "react-router-dom";

function JoinPage() {
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

      <main className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <section aria-labelledby="join-heading">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-kudu-green">
              Join Kudu
            </p>

            <h1
              id="join-heading"
              className="mt-4 text-4xl font-semibold tracking-tight text-kudu-green sm:text-5xl"
            >
              How would you like to use the platform?
            </h1>

            <p className="mt-6 text-lg leading-8 text-stone-700">
              Browsing remains open to everyone. Choose an account path only
              when you want seeker account features or protected provider
              access.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-kudu-green">
                Property seeker
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Find a property
              </h2>

              <p className="mt-4 leading-7 text-stone-700">
                Explore verified properties and compare transparent rent and
                fee information. You can continue browsing without creating an
                account.
              </p>

              <div className="mt-auto space-y-4 pt-8">
                <Link
                  to="/sign-in?intent=seeker"
                  className="flex min-h-12 items-center justify-center rounded-lg bg-kudu-green px-5 text-center font-semibold text-white transition hover:opacity-90"
                >
                  Continue as a seeker
                </Link>

                <Link
                  to="/properties"
                  className="flex min-h-12 items-center justify-center rounded-lg border border-kudu-green px-5 text-center font-semibold text-kudu-green transition hover:bg-kudu-green/5"
                >
                  Browse without signing in
                </Link>
              </div>
            </article>

            <article className="flex flex-col rounded-2xl bg-kudu-green p-6 text-white shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">
                Property provider
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                List a property
              </h2>

              <p className="mt-4 leading-7 text-white/80">
                Register for protected provider access. Provider registration
                does not verify or publish a property automatically.
              </p>

              <p className="mt-4 text-sm leading-6 text-white/75">
                Listing submission tools are being introduced in controlled
                stages.
              </p>

              <div className="mt-auto pt-8">
                <Link
                  to="/sign-in?intent=provider"
                  className="flex min-h-12 items-center justify-center rounded-lg bg-white px-5 text-center font-semibold text-kudu-green transition hover:bg-kudu-ivory"
                >
                  Continue as a provider
                </Link>
              </div>
            </article>
          </div>

          <p className="mt-8 text-center text-stone-700">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-semibold text-kudu-green hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default JoinPage;