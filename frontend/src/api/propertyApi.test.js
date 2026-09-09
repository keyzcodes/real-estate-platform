import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import {
  ApiError,
  createPropertyQuery,
  getProperties,
  getPropertyBySlug,
} from "./propertyApi";

const fetchMock = vi.fn();

function createJsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

async function captureRejection(request) {
  try {
    await request;
  } catch (error) {
    return error;
  }

  throw new Error("Expected the request to reject.");
}

describe("propertyApi", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("builds a query from supported non-empty filters", () => {
    const query = createPropertyQuery({
      page: 2,
      city: "Port Harcourt",
      area: "   ",
      propertyType: "house",
      sort: "oldest",
      unsupportedFilter: "ignored",
    });

    expect(query).toBe(
      "page=2&city=Port+Harcourt&propertyType=house&sort=oldest",
    );
  });

  test("requests and returns the public property catalogue", async () => {
    const data = {
      properties: [{ id: "property-1" }],
      pagination: {
        page: 2,
        limit: 12,
        totalItems: 13,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    };

    fetchMock.mockResolvedValue(
      createJsonResponse({
        success: true,
        data,
      }),
    );

    const controller = new AbortController();

    const result = await getProperties(
      {
        page: 2,
        city: "Maiduguri",
        sort: "oldest",
      },
      {
        signal: controller.signal,
      },
    );

    expect(result).toEqual(data);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/properties\?page=2&city=Maiduguri&sort=oldest$/,
      ),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );
  });

  test("encodes a slug and returns one property", async () => {
    const property = {
      id: "property-1",
      slug: "green-view-annex",
    };

    fetchMock.mockResolvedValue(
      createJsonResponse({
        success: true,
        data: {
          property,
        },
      }),
    );

    const result = await getPropertyBySlug("green view/annex");

    expect(result).toEqual(property);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/properties\/green%20view%2Fannex$/,
      ),
      expect.objectContaining({
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }),
    );
  });

  test("converts a rejected API response into an ApiError", async () => {
    const details = [
      {
        field: "slug",
        message: "The property does not exist.",
      },
    ];

    fetchMock.mockResolvedValue(
      createJsonResponse(
        {
          success: false,
          error: {
            code: "PROPERTY_NOT_FOUND",
            message: "The requested property was not found.",
            details,
          },
        },
        {
          ok: false,
          status: 404,
        },
      ),
    );

    const error = await captureRejection(
      getPropertyBySlug("missing-property"),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      name: "ApiError",
      code: "PROPERTY_NOT_FOUND",
      status: 404,
      message: "The requested property was not found.",
      details,
    });
  });

  test("rejects an invalid JSON response safely", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 502,
      json: vi
        .fn()
        .mockRejectedValue(new SyntaxError("Unexpected response")),
    });

    const error = await captureRejection(getProperties());

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      code: "INVALID_API_RESPONSE",
      status: 502,
      message: "The property service returned an invalid response.",
    });
  });

  test("converts a network failure into a safe ApiError", async () => {
    const networkError = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValue(networkError);

    const error = await captureRejection(getProperties());

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
      message: "Unable to connect to the property service.",
    });
    expect(error.cause).toBe(networkError);
  });

  test("preserves request cancellation errors", async () => {
    const abortError = Object.assign(
      new Error("The operation was aborted."),
      {
        name: "AbortError",
      },
    );

    fetchMock.mockRejectedValue(abortError);

    const error = await captureRejection(getProperties());

    expect(error).toBe(abortError);
  });
});