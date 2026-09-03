import { useEffect, useState } from "react";
import { getProperties } from "../api/propertyApi";

function formatPropertyType(propertyType) {
  return propertyType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatPrice(price) {
  if (!price) {
    return "Price unavailable";
  }

  const amount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);

  return `${amount} / ${price.billingPeriod}`;
}

function PropertyCard({ property }) {
  const startingPrice = property.startingPrices?.[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex aspect-8/5 items-center justify-center bg-kudu-green/10">
        {property.coverMedia?.url ? (
          <img
            src={property.coverMedia.url}
            alt={property.coverMedia.altText || property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-kudu-green">
            Property image coming soon
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-kudu-green/10 px-3 py-1 text-xs font-semibold text-kudu-green">
            Verified property
          </span>

          <span className="text-sm text-stone-600">
            {property.availableUnitCount}{" "}
            {property.availableUnitCount === 1 ? "unit" : "units"} available
          </span>
        </div>

        <h3 className="mt-4 text-xl font-semibold text-stone-900">
          {property.title}
        </h3>

        <p className="mt-2 text-sm text-stone-600">
          {property.location.area}, {property.location.city},{" "}
          {property.location.stateRegion}
        </p>

        <p className="mt-3 line-clamp-2 leading-7 text-stone-700">
          {property.description}
        </p>

        <div className="mt-5 border-t border-black/10 pt-4">
          <p className="text-sm text-stone-600">Starting from</p>

          <p className="mt-1 text-lg font-bold text-kudu-green">
            {formatPrice(startingPrice)}
          </p>

          <p className="mt-2 text-sm text-stone-600">
            {formatPropertyType(property.propertyType)}
          </p>
        </div>
      </div>
    </article>
  );
}

function PropertyCataloguePage() {
  const [searchFields, setSearchFields] = useState({
    city: "",
    propertyType: "",
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: "newest",
  });

  const [catalogue, setCatalogue] = useState({
    properties: [],
    pagination: null,
  });

  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProperties() {
      setStatus("loading");
      setErrorMessage("");

      try {
        const data = await getProperties(filters, {
          signal: controller.signal,
        });

        setCatalogue(data);
        setStatus("success");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setErrorMessage(error.message);
        setStatus("error");
      }
    }

    loadProperties();

    return () => {
      controller.abort();
    };
  }, [filters]);

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setSearchFields((currentFields) => ({
      ...currentFields,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();

    setFilters((currentFilters) => ({
      ...currentFilters,
      city: searchFields.city.trim() || undefined,
      propertyType: searchFields.propertyType || undefined,
      page: 1,
    }));
  }

  function handleSortChange(event) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      sort: event.target.value,
      page: 1,
    }));
  }

  return (
    <div className="min-h-screen bg-kudu-ivory text-stone-900">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <a
            href="/"
            className="text-2xl font-bold tracking-tight text-kudu-green"
          >
            Kudu
          </a>

          <nav aria-label="Primary navigation">
            <a
              href="/properties"
              className="font-medium text-kudu-green hover:underline"
            >
              Browse properties
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-black/10">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-kudu-green">
              Verified rental discovery
            </p>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-kudu-green sm:text-5xl lg:text-6xl">
              Find a property with fewer surprises.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              Browse verified rental properties, compare transparent prices
              and understand additional fees before making contact.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-10 grid max-w-4xl gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto]"
              aria-label="Property search"
            >
              <label className="grid gap-2">
                <span className="text-sm font-medium text-stone-700">
                  Location
                </span>

                <input
                  type="search"
                  name="city"
                  value={searchFields.city}
                  onChange={handleFieldChange}
                  placeholder="Search by city"
                  className="min-h-12 rounded-lg border border-black/20 bg-white px-4 text-stone-900 outline-none transition focus:border-kudu-green"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-stone-700">
                  Property type
                </span>

                <select
                  name="propertyType"
                  value={searchFields.propertyType}
                  onChange={handleFieldChange}
                  className="min-h-12 rounded-lg border border-black/20 bg-white px-4 text-stone-900 outline-none transition focus:border-kudu-green"
                >
                  <option value="">All property types</option>
                  <option value="hostel">Hostel</option>
                  <option value="apartment_building">
                    Apartment building
                  </option>
                  <option value="house">House</option>
                  <option value="duplex">Duplex</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="compound">Compound</option>
                </select>
              </label>

              <button
                type="submit"
                className="min-h-12 self-end rounded-lg bg-kudu-green px-6 font-semibold text-white transition hover:opacity-90"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12"
          aria-labelledby="catalogue-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-kudu-green">
                Public catalogue
              </p>

              <h2
                id="catalogue-heading"
                className="mt-2 text-3xl font-semibold tracking-tight"
              >
                Available properties
              </h2>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                Sort properties
              </span>

              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="min-h-11 rounded-lg border border-black/20 bg-white px-4"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          {status === "loading" && (
            <div
              className="mt-10 rounded-2xl border border-black/10 bg-white px-6 py-16 text-center"
              role="status"
            >
              <p className="font-semibold text-kudu-green">
                Loading verified properties…
              </p>
            </div>
          )}

          {status === "error" && (
            <div
              className="mt-10 rounded-2xl border border-black/10 bg-white px-6 py-16 text-center"
              role="alert"
            >
              <h3 className="text-xl font-semibold text-kudu-green">
                We couldn’t load the properties
              </h3>

              <p className="mt-3 text-stone-600">{errorMessage}</p>

              <button
                type="button"
                onClick={() => setFilters((current) => ({ ...current }))}
                className="mt-6 rounded-lg bg-kudu-green px-5 py-3 font-semibold text-white"
              >
                Try again
              </button>
            </div>
          )}

          {status === "success" && catalogue.properties.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-kudu-green/40 bg-white/50 px-6 py-16 text-center">
              <h3 className="text-xl font-semibold text-kudu-green">
                No properties found
              </h3>

              <p className="mt-3 text-stone-600">
                Try another city or property type.
              </p>
            </div>
          )}

          {status === "success" && catalogue.properties.length > 0 && (
            <>
              <p className="mt-8 text-sm text-stone-600">
                {catalogue.pagination?.totalItems ?? catalogue.properties.length}{" "}
                verified{" "}
                {(catalogue.pagination?.totalItems ??
                  catalogue.properties.length) === 1
                  ? "property"
                  : "properties"}{" "}
                found
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {catalogue.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-5 py-8 text-sm text-stone-600 sm:px-8 lg:px-12">
          Kudu helps property seekers discover verified rentals with
          transparent pricing and privacy-conscious locations.
        </div>
      </footer>
    </div>
  );
}

export default PropertyCataloguePage;