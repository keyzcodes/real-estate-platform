const request = require("supertest");

const mockAuthenticateRequest = jest.fn();

jest.mock("../../src/config/supabase", () => ({}));

jest.mock(
  "../../src/middleware/authenticateRequest",
  () => ({
    authenticateRequest: mockAuthenticateRequest,
  })
);

const app = require("../../src/app");

const testUserId =
  "94000000-0000-4000-8000-000000000001";

function provideAuthenticatedAccount(roles) {
  mockAuthenticateRequest.mockImplementation(
    (req, res, next) => {
      req.auth = {
        userId: testUserId,
        fullName: "Provider Workspace User",
        avatarUrl: null,
        accountStatus: "active",
        roles,
      };

      req.supabase = {
        from: jest.fn(),
        rpc: jest.fn(),
      };

      return next();
    }
  );
}

describe("Provider workspace API", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    provideAuthenticatedAccount([
      "property_provider",
      "property_seeker",
    ]);
  });

  test("allows an authenticated property provider", async () => {
    const response = await request(app)
      .get("/api/v1/provider/workspace")
      .set(
        "Authorization",
        "Bearer valid-access-token"
      )
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        workspace: {
          providerId: testUserId,
          fullName: "Provider Workspace User",
          avatarUrl: null,
        },
      },
    });

    expect(
      mockAuthenticateRequest
    ).toHaveBeenCalledTimes(1);

    expect(response.body).not.toHaveProperty(
      "accessToken"
    );
  });

  test("rejects a seeker even when a provider role is forged in a header", async () => {
    provideAuthenticatedAccount([
      "property_seeker",
    ]);

    const response = await request(app)
      .get("/api/v1/provider/workspace")
      .set("X-User-Role", "property_provider")
      .expect("Content-Type", /json/)
      .expect(403);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "PROVIDER_ACCESS_REQUIRED",
        message:
          "An active property-provider account is required.",
      },
    });

    expect(response.body).not.toHaveProperty("data");
  });

  test("rejects a request before role checking when authentication fails", async () => {
    mockAuthenticateRequest.mockImplementation(
      (req, res) =>
        res.status(401).json({
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message:
              "A valid bearer access token is required.",
          },
        })
    );

    const response = await request(app)
      .get("/api/v1/provider/workspace")
      .expect("Content-Type", /json/)
      .expect(401);

    expect(response.body).not.toHaveProperty("data");
  });
});