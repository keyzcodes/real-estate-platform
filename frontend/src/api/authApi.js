const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL;

const apiBaseUrl = (
  configuredApiBaseUrl ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

class AuthApiError extends Error {
  constructor(
    message,
    { code, status, cause } = {}
  ) {
    super(message, { cause });

    this.name = "AuthApiError";
    this.code = code || "AUTH_REQUEST_FAILED";
    this.status = status || 0;
  }
}

async function requestAuthenticatedJson(
  path,
  {
    accessToken,
    method = "GET",
    signal,
  } = {}
) {
  if (
    typeof accessToken !== "string" ||
    accessToken.trim().length === 0
  ) {
    throw new AuthApiError(
      "A signed-in session is required.",
      {
        code: "AUTHENTICATION_REQUIRED",
        status: 401,
      }
    );
  }

  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new AuthApiError(
      "Unable to connect to the account service.",
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
    throw new AuthApiError(
      "The account service returned an invalid response.",
      {
        code: "INVALID_API_RESPONSE",
        status: response.status,
      }
    );
  }

  if (
    !response.ok ||
    responseBody?.success !== true
  ) {
    throw new AuthApiError(
      responseBody?.error?.message ||
        "The account request could not be completed.",
      {
        code:
          responseBody?.error?.code ||
          "AUTH_REQUEST_FAILED",
        status: response.status,
      }
    );
  }

  return responseBody.data;
}

async function enrolCurrentUserAsProvider(
  accessToken,
  { signal } = {}
) {
  const data = await requestAuthenticatedJson(
    "/auth/provider-enrolment",
    {
      accessToken,
      method: "POST",
      signal,
    }
  );

  return data.providerEnrolment;
}

async function getProviderWorkspace(
  accessToken,
  { signal } = {}
) {
  const data = await requestAuthenticatedJson(
    "/provider/workspace",
    {
      accessToken,
      signal,
    }
  );

  return data.workspace;
}

export {
  AuthApiError,
  enrolCurrentUserAsProvider,
  getProviderWorkspace,
};