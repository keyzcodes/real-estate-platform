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

function setClientIp(testRequest, clientIp) {
  return testRequest.set(
    "X-Forwarded-For",
    clientIp
  );
}

describe("Account API rate limits", () => {
  let mockRpc;

  beforeEach(() => {
    jest.resetAllMocks();

    mockRpc = jest.fn().mockResolvedValue({
      data: true,
      error: null,
    });

    mockAuthenticateRequest.mockImplementation(
      (req, res, next) => {
        req.auth = {
          userId: testUserId,
          fullName: "Rate Limit Test User",
          avatarUrl: null,
          accountStatus: "active",
          roles: [
            "property_provider",
            "property_seeker",
          ],
        };

        req.supabase = {
          from: jest.fn(),
          rpc: mockRpc,
        };

        return next();
      }
    );
  });

  test("shares the account limit across auth and provider routes", async () => {
    const clientIp = "203.0.113.10";

    for (
      let requestNumber = 0;
      requestNumber < 30;
      requestNumber += 1
    ) {
      await setClientIp(
        request(app)
          .get("/api/v1/auth/me")
          .set(
            "Authorization",
            "Bearer valid-access-token"
          ),
        clientIp
      ).expect(200);
    }

    for (
      let requestNumber = 0;
      requestNumber < 30;
      requestNumber += 1
    ) {
      await setClientIp(
        request(app)
          .get("/api/v1/provider/workspace")
          .set(
            "Authorization",
            "Bearer valid-access-token"
          ),
        clientIp
      ).expect(200);
    }

    const blockedResponse = await setClientIp(
      request(app)
        .get("/api/v1/auth/me")
        .set(
          "Authorization",
          "Bearer valid-access-token"
        ),
      clientIp
    )
      .expect("Content-Type", /json/)
      .expect(429);

    expect(blockedResponse.body).toEqual({
      success: false,
      error: {
        code: "ACCOUNT_RATE_LIMIT_EXCEEDED",
        message:
          "Too many account requests. Please try again later.",
      },
    });

    expect(
      blockedResponse.headers["retry-after"]
    ).toBeDefined();

    expect(
      blockedResponse.headers["x-ratelimit-limit"]
    ).toBeUndefined();

    expect(
      mockAuthenticateRequest
    ).toHaveBeenCalledTimes(60);

    await setClientIp(
      request(app).get("/api/v1/health"),
      clientIp
    ).expect(200);
  });

  test("blocks repeated provider enrolment before authentication", async () => {
    const clientIp = "203.0.113.11";

    for (
      let requestNumber = 0;
      requestNumber < 10;
      requestNumber += 1
    ) {
      await setClientIp(
        request(app)
          .post(
            "/api/v1/auth/provider-enrolment"
          )
          .set(
            "Authorization",
            "Bearer valid-access-token"
          ),
        clientIp
      ).expect(200);
    }

    const blockedResponse = await setClientIp(
      request(app)
        .post(
          "/api/v1/auth/provider-enrolment"
        )
        .set(
          "Authorization",
          "Bearer valid-access-token"
        ),
      clientIp
    )
      .expect("Content-Type", /json/)
      .expect(429);

    expect(blockedResponse.body).toEqual({
      success: false,
      error: {
        code: "ACCOUNT_RATE_LIMIT_EXCEEDED",
        message:
          "Too many account requests. Please try again later.",
      },
    });

    expect(
      blockedResponse.headers["retry-after"]
    ).toBeDefined();

    expect(
      blockedResponse.headers["x-ratelimit-limit"]
    ).toBeUndefined();

    expect(
      mockAuthenticateRequest
    ).toHaveBeenCalledTimes(10);

    expect(mockRpc).toHaveBeenCalledTimes(10);

    await setClientIp(
      request(app)
        .get("/api/v1/auth/me")
        .set(
          "Authorization",
          "Bearer valid-access-token"
        ),
      clientIp
    ).expect(200);

    expect(
      mockAuthenticateRequest
    ).toHaveBeenCalledTimes(11);
  });
});