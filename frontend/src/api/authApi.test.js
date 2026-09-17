import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import {
  enrolCurrentUserAsProvider,
  getProviderWorkspace,
} from "./authApi";

function createJsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Authenticated account API", () => {
  test("sends the bearer token when enrolling a provider", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        data: {
          providerEnrolment: {
            created: true,
            role: "property_provider",
            roles: [
              "property_provider",
              "property_seeker",
            ],
          },
        },
      })
    );

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      enrolCurrentUserAsProvider(
        "valid-access-token"
      )
    ).resolves.toEqual({
      created: true,
      role: "property_provider",
      roles: [
        "property_provider",
        "property_seeker",
      ],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/v1\/auth\/provider-enrolment$/
      ),
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization:
            "Bearer valid-access-token",
        },
      })
    );
  });

  test("loads the protected provider workspace", async () => {
    const workspace = {
      providerId:
        "94000000-0000-4000-8000-000000000001",
      fullName: "Provider Test User",
      avatarUrl: null,
    };

    const mockFetch = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        data: {
          workspace,
        },
      })
    );

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      getProviderWorkspace("valid-access-token")
    ).resolves.toEqual(workspace);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/api\/v1\/provider\/workspace$/
      ),
      expect.objectContaining({
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization:
            "Bearer valid-access-token",
        },
      })
    );
  });

  test("rejects a missing access token without making a request", async () => {
    const mockFetch = vi.fn();

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      getProviderWorkspace("")
    ).rejects.toMatchObject({
      code: "AUTHENTICATION_REQUIRED",
      status: 401,
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("preserves a controlled provider-access error", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          success: false,
          error: {
            code: "PROVIDER_ACCESS_REQUIRED",
            message:
              "An active property-provider account is required.",
          },
        },
        403
      )
    );

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      getProviderWorkspace("seeker-access-token")
    ).rejects.toMatchObject({
      code: "PROVIDER_ACCESS_REQUIRED",
      status: 403,
    });
  });

  test("returns a controlled network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        new Error("Network unavailable")
      )
    );

    await expect(
      getProviderWorkspace("valid-access-token")
    ).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    });
  });
});