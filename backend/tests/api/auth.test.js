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

describe("Current account API", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockAuthenticateRequest.mockImplementation(
      (req, res, next) => {
        req.auth = {
          userId: testUserId,
          fullName: "Authentication Test User",
          avatarUrl: null,
          accountStatus: "active",
          roles: [
            "property_provider",
            "property_seeker",
          ],
        };

        req.supabase = {
          from: jest.fn(),
        };

        return next();
      }
    );
  });

  test("returns only the authenticated account's safe information", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set(
        "Authorization",
        "Bearer valid-access-token"
      )
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        account: {
          id: testUserId,
          fullName: "Authentication Test User",
          avatarUrl: null,
          accountStatus: "active",
          roles: [
            "property_provider",
            "property_seeker",
          ],
        },
      },
    });

    expect(
      mockAuthenticateRequest
    ).toHaveBeenCalledTimes(1);

    const middlewareRequest =
      mockAuthenticateRequest.mock.calls[0][0];

    expect(
      middlewareRequest.get("authorization")
    ).toBe("Bearer valid-access-token");

    expect(response.body).not.toHaveProperty(
      "accessToken"
    );

    expect(response.body.data.account).not.toHaveProperty(
      "phoneNumber"
    );
  });

  test("does not reach the controller when authentication is rejected", async () => {
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
      .get("/api/v1/auth/me")
      .expect("Content-Type", /json/)
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message:
          "A valid bearer access token is required.",
      },
    });

    expect(response.body).not.toHaveProperty("data");
  });
});