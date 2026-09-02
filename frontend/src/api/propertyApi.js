const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const apiBaseUrl = (
  configuredApiBaseUrl || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

const supportedPropertyFilters = [
  "page",
  "limit",
  "country",
  "state",
  "city",
  "area",
  "propertyType",
  "sort",
];

class ApiError extends Error {
  constructor(message, { code, status, details, cause } = {}) {
    super(message, { cause });

    this.name = "ApiError";
    this.code = code || "UNKNOWN_API_ERROR";
    this.status = status || 0;
    this.details = details || [];
  }
}

function createPropertyQuery(filters = {}) {
  const query = new URLSearchParams();

  for (const key of supportedPropertyFilters) {
    const value = filters[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      query.set(key, String(value));
    }
  }

  return query.toString();
}

async function requestJson(path, { signal } = {}) {
  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "Unable to connect to the property service.",
      {
        code: "NETWORK_ERROR",
        cause: error,
      }
    );
  }

 let responseBody;

  try {
    responseBody = await response.json();
  } catch {
    throw new ApiError(
      "The property service returned an invalid response.",
      {
        code: "INVALID_API_RESPONSE",
        status: response.status,
      }
    );
  }

  if (!response.ok || responseBody?.success !== true) {
    throw new ApiError(
      responseBody?.error?.message ||
        "The property request could not be completed.",
      {
        code:
          responseBody?.error?.code ||
          "PROPERTY_REQUEST_FAILED",
        status: response.status,
        details: responseBody?.error?.details,
      }
    );
  }

  return responseBody.data;
}

async function getProperties(filters = {}, { signal } = {}) {
  const query = createPropertyQuery(filters);
  const path = query ? `/properties?${query}` : "/properties";

  return requestJson(path, { signal });
}

async function getPropertyBySlug(slug, { signal } = {}) {
  const encodedSlug = encodeURIComponent(slug);
  const data = await requestJson(
    `/properties/${encodedSlug}`,
    { signal }
  );

  return data.property;
}

export {
  ApiError,
  createPropertyQuery,
  getProperties,
  getPropertyBySlug,
};
