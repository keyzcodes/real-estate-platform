const mockGetClaims = jest.fn();

jest.mock("../../src/config/supabase", () => ({
  auth: {
    getClaims: mockGetClaims,
  },
}));

const {
  validateAccessToken,
} = require("../../src/services/authService");

describe("Authentication service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns only the UUID from validated token claims", async () => {
    mockGetClaims.mockResolvedValue({
      data: {
        claims: {
          sub: "94000000-0000-4000-8000-000000000001",
          role: "authenticated",
          user_metadata: {
            registration_intent: "provider",
          },
        },
      },
      error: null,
    });

    await expect(
      validateAccessToken("valid-access-token")
    ).resolves.toEqual({
      id: "94000000-0000-4000-8000-000000000001",
    });

    expect(mockGetClaims).toHaveBeenCalledTimes(1);
    expect(mockGetClaims).toHaveBeenCalledWith(
      "valid-access-token"
    );
  });

  test("returns null when Supabase rejects the token", async () => {
    mockGetClaims.mockResolvedValue({
      data: null,
      error: {
        message: "Invalid JWT",
      },
    });

    await expect(
      validateAccessToken("invalid-access-token")
    ).resolves.toBeNull();
  });

  test("returns null when the validated claims have no UUID", async () => {
    mockGetClaims.mockResolvedValue({
      data: {
        claims: {
          sub: "not-a-uuid",
        },
      },
      error: null,
    });

    await expect(
      validateAccessToken("invalid-subject-token")
    ).resolves.toBeNull();
  });

  test("does not call Supabase when no token is provided", async () => {
    await expect(
      validateAccessToken("")
    ).resolves.toBeNull();

    expect(mockGetClaims).not.toHaveBeenCalled();
  });

  test("propagates an unexpected authentication-service failure", async () => {
    const serviceError = new Error(
      "Authentication service unavailable"
    );

    mockGetClaims.mockRejectedValue(serviceError);

    await expect(
      validateAccessToken("validly-shaped-token")
    ).rejects.toBe(serviceError);
  });
});