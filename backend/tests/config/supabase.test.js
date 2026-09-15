const mockCreateClient = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: mockCreateClient,
}));

const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalSupabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY;

describe("Supabase client configuration", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY =
      "test-publishable-key";
  });

  afterAll(() => {
    if (originalSupabaseUrl === undefined) {
      delete process.env.SUPABASE_URL;
    } else {
      process.env.SUPABASE_URL = originalSupabaseUrl;
    }

    if (originalSupabasePublishableKey === undefined) {
      delete process.env.SUPABASE_PUBLISHABLE_KEY;
    } else {
      process.env.SUPABASE_PUBLISHABLE_KEY =
        originalSupabasePublishableKey;
    }
  });

  test("creates the public client without backend session persistence", () => {
    const publicClient = {};

    mockCreateClient.mockReturnValue(publicClient);

    const supabase = require("../../src/config/supabase");

    expect(supabase).toBe(publicClient);
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "test-publishable-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  });

  test("creates a stateless client carrying the authenticated user's token", () => {
    const publicClient = {};
    const authenticatedClient = {};

    mockCreateClient
      .mockReturnValueOnce(publicClient)
      .mockReturnValueOnce(authenticatedClient);

    const supabase = require("../../src/config/supabase");

    const result =
      supabase.createAuthenticatedSupabaseClient(
        "validated-access-token"
      );

    expect(result).toBe(authenticatedClient);
    expect(mockCreateClient).toHaveBeenNthCalledWith(
      2,
      "https://example.supabase.co",
      "test-publishable-key",
      {
        global: {
          headers: {
            Authorization:
              "Bearer validated-access-token",
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  });

  test("rejects an empty access token", () => {
    mockCreateClient.mockReturnValue({});

    const supabase = require("../../src/config/supabase");

    expect(() =>
      supabase.createAuthenticatedSupabaseClient("   ")
    ).toThrow("A validated access token is required.");

    expect(mockCreateClient).toHaveBeenCalledTimes(1);
  });
});