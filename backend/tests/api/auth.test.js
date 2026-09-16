const request = require("supertest");

const mockAuthenticateRequest = jest.fn();

jest.mock("../../src/config/supabase", () => ({}));

jest.mock("../../src/middleware/authenticateRequest", () => ({
  authenticateRequest: mockAuthenticateRequest,
}));

const app = require("../../src/app");

const testUserId = "94000000-0000-4000-8000-000000000001";

describe("Current account API", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockAuthenticateRequest.mockImplementation((req, res, next) => {
      req.auth = {
        userId: testUserId,
        fullName: "Authentication Test User",
        avatarUrl: null,
        accountStatus: "active",
        roles: ["property_provider", "property_seeker"],
      };

      req.supabase = {
        from: jest.fn(),
      };

      return next();
    });
  });

  test("returns only the authenticated account's safe information", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer valid-access-token")
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
          roles: ["property_provider", "property_seeker"],
        },
      },
    });

    expect(mockAuthenticateRequest).toHaveBeenCalledTimes(1);

    const middlewareRequest = mockAuthenticateRequest.mock.calls[0][0];

    expect(middlewareRequest.get("authorization")).toBe(
      "Bearer valid-access-token",
    );

    expect(response.body).not.toHaveProperty("accessToken");

    expect(response.body.data.account).not.toHaveProperty("phoneNumber");
  });

  test("does not reach the controller when authentication is rejected", async () => {
    mockAuthenticateRequest.mockImplementation((req, res) =>
      res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "A valid bearer access token is required.",
        },
      }),
    );

    const response = await request(app)
      .get("/api/v1/auth/me")
      .expect("Content-Type", /json/)
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "A valid bearer access token is required.",
      },
    });

    expect(response.body).not.toHaveProperty("data");
  });
  test("sanitizes unexpected authentication failures", async () => {
    const privateError = new Error("Private authentication-service diagnostic");

    mockAuthenticateRequest.mockImplementation((req, res, next) =>
      next(privateError),
    );

    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer valid-access-token")
        .expect("Content-Type", /json/)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "The server could not complete the request.",
        },
      });

      expect(JSON.stringify(response.body)).not.toContain(privateError.message);

      expect(consoleError).toHaveBeenCalledWith(
        "Unhandled application error:",
        privateError,
      );
    } finally {
      consoleError.mockRestore();
    }
  });
  describe("Provider enrolment API", () => {
    let mockRpc;

    beforeEach(() => {
      jest.resetAllMocks();

      mockRpc = jest.fn().mockResolvedValue({
        data: true,
        error: null,
      });

      mockAuthenticateRequest.mockImplementation((req, res, next) => {
        req.auth = {
          userId: testUserId,
          fullName: "Provider Test User",
          avatarUrl: null,
          accountStatus: "active",
          roles: ["property_seeker"],
        };

        req.supabase = {
          rpc: mockRpc,
        };

        return next();
      });
    });

    test("enrols the authenticated account as a provider", async () => {
      const response = await request(app)
        .post("/api/v1/auth/provider-enrolment")
        .set("Authorization", "Bearer valid-access-token")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          providerEnrolment: {
            created: true,
            role: "property_provider",
            roles: ["property_provider", "property_seeker"],
          },
        },
      });

      expect(mockRpc).toHaveBeenCalledTimes(1);
      expect(mockRpc).toHaveBeenCalledWith("enrol_current_user_as_provider");
    });

    test("is safe to repeat for an existing provider", async () => {
      mockRpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const response = await request(app)
        .post("/api/v1/auth/provider-enrolment")
        .expect(200);

      expect(response.body.data.providerEnrolment).toEqual({
        created: false,
        role: "property_provider",
        roles: ["property_provider", "property_seeker"],
      });
    });

    test("does not trust a UUID or role sent by the frontend", async () => {
      await request(app)
        .post("/api/v1/auth/provider-enrolment")
        .send({
          profileId: "95000000-0000-4000-8000-000000000002",
          role: "admin",
        })
        .expect(200);

      expect(mockRpc).toHaveBeenCalledWith("enrol_current_user_as_provider");

      expect(mockRpc.mock.calls[0]).toHaveLength(1);
    });

    test("rejects unauthenticated enrolment requests", async () => {
      mockAuthenticateRequest.mockImplementation((req, res) =>
        res.status(401).json({
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "A valid bearer access token is required.",
          },
        }),
      );

      const response = await request(app)
        .post("/api/v1/auth/provider-enrolment")
        .expect("Content-Type", /json/)
        .expect(401);

      expect(response.body).not.toHaveProperty("data");
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });
});
