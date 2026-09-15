const mockGetActiveAccount = jest.fn();
const mockValidateAccessToken = jest.fn();
const mockCreateAuthenticatedSupabaseClient = jest.fn();

jest.mock("../../src/services/authService", () => ({
  getActiveAccount: mockGetActiveAccount,
  validateAccessToken: mockValidateAccessToken,
}));

jest.mock("../../src/config/supabase", () => ({
  createAuthenticatedSupabaseClient:
    mockCreateAuthenticatedSupabaseClient,
}));

const {
  authenticateRequest,
  parseBearerToken,
} = require("../../src/middleware/authenticateRequest");

const testUserId =
  "94000000-0000-4000-8000-000000000001";

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

function createActiveAccount() {
  return {
    id: testUserId,
    fullName: "Authentication Test User",
    avatarUrl: null,
    accountStatus: "active",
    roles: [
      "property_provider",
      "property_seeker",
    ],
  };
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
    jest.resetAllMocks();
  });

  test.each([
    ["a missing authorization header", undefined],
    ["a malformed authorization header", "Basic credentials"],
  ])(
    "rejects %s before token validation",
    async (description, authorizationHeader) => {
      const req = createRequest(authorizationHeader);
      const res = createResponse();
      const next = jest.fn();

      await authenticateRequest(req, res, next);

      expect(mockValidateAccessToken).not.toHaveBeenCalled();
      expect(
        mockCreateAuthenticatedSupabaseClient
      ).not.toHaveBeenCalled();
      expect(mockGetActiveAccount).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message:
            "A valid bearer access token is required.",
        },
      });

      expect(req.auth).toBeUndefined();
      expect(req.supabase).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    }
  );

  test("attaches the active account and authenticated client", async () => {
    const authenticatedSupabaseClient = {
      from: jest.fn(),
      rpc: jest.fn(),
    };

    mockValidateAccessToken.mockResolvedValue({
      id: testUserId,
    });

    mockCreateAuthenticatedSupabaseClient.mockReturnValue(
      authenticatedSupabaseClient
    );

    mockGetActiveAccount.mockResolvedValue(
      createActiveAccount()
    );

    const req = createRequest(
      "Bearer valid-access-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(mockValidateAccessToken).toHaveBeenCalledWith(
      "valid-access-token"
    );

    expect(
      mockCreateAuthenticatedSupabaseClient
    ).toHaveBeenCalledWith("valid-access-token");

    expect(mockGetActiveAccount).toHaveBeenCalledWith(
      authenticatedSupabaseClient,
      testUserId
    );

    expect(req.auth).toEqual({
      userId: testUserId,
      fullName: "Authentication Test User",
      avatarUrl: null,
      accountStatus: "active",
      roles: [
        "property_provider",
        "property_seeker",
      ],
    });

    expect(req.auth).not.toHaveProperty("accessToken");
    expect(req.supabase).toBe(
      authenticatedSupabaseClient
    );

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  test("rejects a valid token without an active account", async () => {
    const authenticatedSupabaseClient = {
      from: jest.fn(),
    };

    mockValidateAccessToken.mockResolvedValue({
      id: testUserId,
    });

    mockCreateAuthenticatedSupabaseClient.mockReturnValue(
      authenticatedSupabaseClient
    );

    mockGetActiveAccount.mockResolvedValue(null);

    const req = createRequest(
      "Bearer valid-access-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(mockGetActiveAccount).toHaveBeenCalledWith(
      authenticatedSupabaseClient,
      testUserId
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "ACCOUNT_ACCESS_DENIED",
        message:
          "This account cannot access protected resources.",
      },
    });

    expect(req.auth).toBeUndefined();
    expect(req.supabase).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects a token that Supabase cannot validate", async () => {
    mockValidateAccessToken.mockResolvedValue(null);

    const req = createRequest(
      "Bearer invalid-access-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(
      mockCreateAuthenticatedSupabaseClient
    ).not.toHaveBeenCalled();
    expect(mockGetActiveAccount).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message:
          "A valid bearer access token is required.",
      },
    });

    expect(req.auth).toBeUndefined();
    expect(req.supabase).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards unexpected validation failures to Express", async () => {
    const serviceError = new Error(
      "Authentication service unavailable"
    );

    mockValidateAccessToken.mockRejectedValue(
      serviceError
    );

    const req = createRequest(
      "Bearer validly-shaped-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(next).toHaveBeenCalledWith(serviceError);
    expect(
      mockCreateAuthenticatedSupabaseClient
    ).not.toHaveBeenCalled();
    expect(mockGetActiveAccount).not.toHaveBeenCalled();

    expect(req.auth).toBeUndefined();
    expect(req.supabase).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("forwards authenticated-client creation failures to Express", async () => {
    const clientError = new Error(
      "Unable to create authenticated client"
    );

    mockValidateAccessToken.mockResolvedValue({
      id: testUserId,
    });

    mockCreateAuthenticatedSupabaseClient.mockImplementation(
      () => {
        throw clientError;
      }
    );

    const req = createRequest(
      "Bearer valid-access-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(next).toHaveBeenCalledWith(clientError);
    expect(mockGetActiveAccount).not.toHaveBeenCalled();

    expect(req.auth).toBeUndefined();
    expect(req.supabase).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("forwards account-read failures to Express", async () => {
    const accountError = new Error(
      "Unable to read authenticated account."
    );

    const authenticatedSupabaseClient = {
      from: jest.fn(),
    };

    mockValidateAccessToken.mockResolvedValue({
      id: testUserId,
    });

    mockCreateAuthenticatedSupabaseClient.mockReturnValue(
      authenticatedSupabaseClient
    );

    mockGetActiveAccount.mockRejectedValue(
      accountError
    );

    const req = createRequest(
      "Bearer valid-access-token"
    );
    const res = createResponse();
    const next = jest.fn();

    await authenticateRequest(req, res, next);

    expect(next).toHaveBeenCalledWith(accountError);
    expect(req.auth).toBeUndefined();
    expect(req.supabase).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});