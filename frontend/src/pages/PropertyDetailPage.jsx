import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyBySlug } from "../api/propertyApi";

function formatLabel(value) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function PropertyDetailPage() {
  const { slug } = useParams();

  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProperty() {
      setStatus("loading");
      setErrorMessage("");

      try {
        const result = await getPropertyBySlug(slug, {
          signal: controller.signal,
        });

        setProperty(result);
        setStatus("success");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setProperty(null);
        setErrorMessage(error.message);
        setStatus(error.status === 404 ? "not-found" : "error");
      }
    }

    loadProperty();

    return () => {
      controller.abort();
    };
  }, [slug, requestVersion]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-kudu-ivory px-5 py-20">
        <div
          className="mx-auto max-w-4xl rounded-2xl border border-black/10 bg-white px-6 py-16 text-center"
          role="status"
        >
          <p className="font-semibold text-kudu-green">
            Loading property details…
          </p>
        </div>
      </main>
    );
  }

  if (status === "not-found") {
    return (
      <main className="min-h-screen bg-kudu-ivory px-5 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold text-kudu-green">
            Property not found
          </h1>

          <p className="mt-4 leading-7 text-stone-600">
            This property is unavailable or is not published for public
            viewing.
          </p>

          <Link
            to="/properties"
            className="mt-8 inline-flex rounded-lg bg-kudu-green px-5 py-3 font-semibold text-white"
          >
            Browse available properties
          </Link>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-kudu-ivory px-5 py-20">
        <div
          className="mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white px-6 py-16 text-center"
          role="alert"
        >
          <h1 className="text-3xl font-semibold text-kudu-green">
            We couldn’t load this property
          </h1>

          <p className="mt-4 leading-7 text-stone-600">{errorMessage}</p>

          <button
            type="button"
            onClick={() => setRequestVersion((version) => version + 1)}
            className="mt-8 rounded-lg bg-kudu-green px-5 py-3 font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
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

          <Link
            to="/properties"
            className="font-medium text-kudu-green hover:underline"
          >
            Browse properties
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <Link
          to="/properties"
          className="font-medium text-kudu-green hover:underline"
        >
          ← Back to catalogue
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-kudu-green/10">
            {property.media?.[0]?.url ? (
              <img
                src={property.media[0].url}
                alt={property.media[0].altText || property.title}
                className="aspect-8/5 h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-8/5 items-center justify-center">
                <span className="font-semibold text-kudu-green">
                  Property images coming soon
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="inline-flex rounded-full bg-kudu-green/10 px-3 py-1 text-sm font-semibold text-kudu-green">
              Verified property
            </span>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-kudu-green">
              {property.title}
            </h1>

            <p className="mt-4 text-lg text-stone-600">
              {property.location.area}, {property.location.city},{" "}
              {property.location.stateRegion}
            </p>

            <p className="mt-3 text-sm font-medium text-stone-600">
              {formatLabel(property.propertyType)}
            </p>

            <p className="mt-6 leading-8 text-stone-700">
              {property.description}
            </p>

            <div className="mt-8 rounded-xl border border-kudu-green/20 bg-white p-5">
              <h2 className="font-semibold text-kudu-green">
                Location privacy
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-600">
                Kudu shows an approximate public location. The exact address
                and coordinates remain protected.
              </p>
            </div>
          </div>
        </section>

        <section
          className="mt-14"
          aria-labelledby="property-amenities-heading"
        >
          <h2
            id="property-amenities-heading"
            className="text-2xl font-semibold text-kudu-green"
          >
            Property amenities
          </h2>

          {property.amenities?.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-3">
              {property.amenities.map((amenity) => (
                <li
                  key={amenity.id}
                  className="rounded-full border border-kudu-green/20 bg-white px-4 py-2 text-sm font-medium"
                >
                  {amenity.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-stone-600">
              No property amenities have been listed.
            </p>
          )}
        </section>

        <section className="mt-14" aria-labelledby="units-heading">
          <h2
            id="units-heading"
            className="text-2xl font-semibold text-kudu-green"
          >
            Units and transparent pricing
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-stone-600">
            Base rent and additional fees are displayed separately so that
            every declared charge remains understandable.
          </p>

          {property.units?.length > 0 ? (
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              {property.units.map((unit) => (
                <article
                  key={unit.id}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {unit.unitName}
                      </h3>

                      <p className="mt-1 text-sm text-stone-600">
                        {formatLabel(unit.unitType)}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-kudu-green/10 px-3 py-1 text-sm font-semibold text-kudu-green">
                      {formatLabel(unit.availability.status)}
                    </span>
                  </div>

                  <p className="mt-4 leading-7 text-stone-600">
                    {unit.description}
                  </p>

                  <dl className="mt-5 grid grid-cols-3 gap-4 border-y border-black/10 py-4 text-sm">
                    <div>
                      <dt className="text-stone-500">Bedrooms</dt>
                      <dd className="mt-1 font-semibold">{unit.bedrooms}</dd>
                    </div>

                    <div>
                      <dt className="text-stone-500">Bathrooms</dt>
                      <dd className="mt-1 font-semibold">{unit.bathrooms}</dd>
                    </div>

                    <div>
                      <dt className="text-stone-500">Occupants</dt>
                      <dd className="mt-1 font-semibold">
                        {unit.maximumOccupants}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5">
                    <p className="text-sm text-stone-500">Base rent</p>

                    <p className="mt-1 text-xl font-bold text-kudu-green">
                      {formatMoney(
                        unit.baseRent.amount,
                        unit.baseRent.currency
                      )}{" "}
                      / {unit.baseRent.billingPeriod}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold">Additional fees</h4>

                    {unit.fees?.length > 0 ? (
                      <ul className="mt-3 grid gap-3">
                        {unit.fees.map((fee) => (
                          <li
                            key={fee.id}
                            className="rounded-xl bg-kudu-ivory p-4"
                          >
                            <div className="flex justify-between gap-4">
                              <span className="font-medium">
                                {fee.feeName}
                              </span>

                              <span className="font-semibold text-kudu-green">
                                {formatMoney(fee.amount, fee.currency)}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-stone-600">
                              {formatLabel(fee.paymentFrequency)}
                              {fee.isMandatory
                                ? " · Mandatory"
                                : " · Optional"}
                              {fee.isRefundable
                                ? " · Refundable"
                                : " · Non-refundable"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-stone-600">
                        No additional fees have been declared.
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-stone-600">
              No units are currently listed for this property.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default PropertyDetailPage;