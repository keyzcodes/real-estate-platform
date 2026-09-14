const mockValidateAccessToken = jest.fn();

jest.mock("../../src/services/authService", () => ({
  validateAccessToken: mockValidateAccessToken,
}));

const {
  authenticateRequest,
  parseBearerToken,
} = require("../../src/middleware/authenticateRequest");

function createRequest(authorizationHeader) {
  return {
    get: jest.fn((headerName) => {
      if (headerName === "authorization") {
        return authorizationHeader;
      }

      return undefined;
    }),
  };
}

function createResponse() {
  const response = {};

  response.status = jest.fn(() => response);
  response.json = jest.fn(() => response);

  return response;
}

describe("Bearer-token parsing", () => {
  test("extracts a token from a valid authorization header", () => {
    expect(
      parseBearerToken("Bearer valid-access-token")
    ).toBe("valid-access-token");
  });

  test("accepts the bearer scheme without case sensitivity", () => {
    expect(
      parseBearerToken("bearer valid-access-token")
    ).toBe("valid-access-token");
  });

  test("accepts multiple spaces between the scheme and token", () => {
    expect(
      parseBearerToken("Bearer   valid-access-token")
    ).toBe("valid-access-token");
  });

  test.each([
    ["a missing header", undefined],
    ["a null header", null],
    ["an empty header", ""],
    ["a different authentication scheme", "Basic credentials"],
    ["Bearer without a token", "Bearer"],
    ["leading whitespace", " Bearer valid-access-token"],
    ["trailing whitespace", "Bearer valid-access-token "],
    ["multiple credentials", "Bearer first-token second-token"],
  ])("rejects %s", (description, authorizationHeader) => {
    expect(parseBearerToken(authorizationHeader)).toBeNull();
  });
});

describe("Authentication middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ["a missing authorization header", undefined],
    ["a malformed authorization header", "Basic credentials"],
  ])("rejects %s before token validation", async (
    description,
    authorizationHeader
  ) => {
    const req = createRequest(authorizationHeader);
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(mockValidateAccessToken).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "A valid bearer access token is required.",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("attaches only the validated UUID to the request", async () => {
    mockValidateAccessToken.mockResolvedValue({
      id: "94000000-0000-4000-8000-000000000001",
    });

    const req = createRequest(
      "Bearer valid-access-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(mockValidateAccessToken).toHaveBeenCalledWith(
      "valid-access-token"
    );
    expect(req.auth).toEqual({
      userId: "94000000-0000-4000-8000-000000000001",
    });
    expect(req.auth).not.toHaveProperty("accessToken");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  test("rejects a token that Supabase cannot validate", async () => {
    mockValidateAccessToken.mockResolvedValue(null);

    const req = createRequest(
      "Bearer invalid-access-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "A valid bearer access token is required.",
      },
    });
    expect(req.auth).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards unexpected service failures to Express", async () => {
    const serviceError = new Error(
      "Authentication service unavailable"
    );

    mockValidateAccessToken.mockRejectedValue(serviceError);

    const req = createRequest(
      "Bearer validly-shaped-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(next).toHaveBeenCalledWith(serviceError);
    expect(req.auth).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});