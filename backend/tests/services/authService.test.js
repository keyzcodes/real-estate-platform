const mockGetClaims = jest.fn();

jest.mock("../../src/config/supabase", () => ({
  auth: {
    getClaims: mockGetClaims,
  },
}));

const {
  getActiveAccount,
  validateAccessToken,
} = require("../../src/services/authService");

const testUserId =
  "94000000-0000-4000-8000-000000000001";

function createActiveAccountRecord(overrides = {}) {
  return {
    id: testUserId,
    full_name: "Authentication Test User",
    avatar_url: null,
    account_status: "active",
    user_roles: [
      {
        role: "property_seeker",
      },
      {
        role: "property_provider",
      },
    ],
    ...overrides,
  };
}

function createAuthenticatedClient({
  data = createActiveAccountRecord(),
  error = null,
} = {}) {
  const mockMaybeSingle = jest.fn().mockResolvedValue({
    data,
    error,
  });

  const mockEq = jest.fn(() => ({
    maybeSingle: mockMaybeSingle,
  }));

  const mockSelect = jest.fn(() => ({
    eq: mockEq,
  }));

  const mockFrom = jest.fn(() => ({
    select: mockSelect,
  }));

  return {
    client: {
      from: mockFrom,
    },
    mockEq,
    mockFrom,
    mockMaybeSingle,
    mockSelect,
  };
}

describe("Access-token validation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns only the UUID from validated token claims", async () => {
    mockGetClaims.mockResolvedValue({
      data: {
        claims: {
          sub: testUserId,
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
      id: testUserId,
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

describe("Active account lookup", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns safe profile information and database roles", async () => {
    const {
      client,
      mockEq,
      mockFrom,
      mockSelect,
    } = createAuthenticatedClient();

    await expect(
      getActiveAccount(client, testUserId)
    ).resolves.toEqual({
      id: testUserId,
      fullName: "Authentication Test User",
      avatarUrl: null,
      accountStatus: "active",
      roles: [
        "property_provider",
        "property_seeker",
      ],
    });

    expect(mockFrom).toHaveBeenCalledWith("profiles");

    expect(mockSelect).toHaveBeenCalledWith(
      "id,full_name,avatar_url,account_status,user_roles(role)"
    );

    expect(mockEq).toHaveBeenCalledWith(
      "id",
      testUserId
    );
  });

  test.each([
    "suspended",
    "pending_verification",
  ])("rejects a %s account", async (accountStatus) => {
    const { client } = createAuthenticatedClient({
      data: createActiveAccountRecord({
        account_status: accountStatus,
      }),
    });

    await expect(
      getActiveAccount(client, testUserId)
    ).resolves.toBeNull();
  });

  test("returns null when the profile does not exist", async () => {
    const { client } = createAuthenticatedClient({
      data: null,
    });

    await expect(
      getActiveAccount(client, testUserId)
    ).resolves.toBeNull();
  });

  test("rejects an invalid user UUID before querying the database", async () => {
    const { client, mockFrom } =
      createAuthenticatedClient();

    await expect(
      getActiveAccount(client, "not-a-uuid")
    ).resolves.toBeNull();

    expect(mockFrom).not.toHaveBeenCalled();
  });

  test("propagates a controlled account-read failure", async () => {
    const { client } = createAuthenticatedClient({
      data: null,
      error: {
        message: "Database unavailable",
      },
    });

    await expect(
      getActiveAccount(client, testUserId)
    ).rejects.toThrow(
      "Unable to read authenticated account."
    );
  });

  test("fails closed when a database role is invalid", async () => {
    const { client } = createAuthenticatedClient({
      data: createActiveAccountRecord({
        user_roles: [
          {
            role: "untrusted_role",
          },
        ],
      }),
    });

    await expect(
      getActiveAccount(client, testUserId)
    ).rejects.toThrow(
      "Authenticated account data is invalid."
    );
  });
});