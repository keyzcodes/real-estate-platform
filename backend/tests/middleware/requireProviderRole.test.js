const {
  requireProviderRole,
} = require("../../src/middleware/requireProviderRole");

function createResponse() {
  const response = {};

  response.status = jest.fn(() => response);
  response.json = jest.fn(() => response);

  return response;
}

describe("Provider-role authorization middleware", () => {
  test("allows an authenticated property provider", () => {
    const req = {
      auth: {
        roles: [
          "property_provider",
          "property_seeker",
        ],
      },
    };

    const res = createResponse();
    const next = jest.fn();

    requireProviderRole(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("rejects a property seeker without provider access", () => {
    const req = {
      auth: {
        roles: ["property_seeker"],
      },
    };

    const res = createResponse();
    const next = jest.fn();

    requireProviderRole(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "PROVIDER_ACCESS_REQUIRED",
        message:
          "An active property-provider account is required.",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("does not treat administrator access as provider access", () => {
    const req = {
      auth: {
        roles: ["admin", "property_seeker"],
      },
    };

    const res = createResponse();
    const next = jest.fn();

    requireProviderRole(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects a request without authenticated account context", () => {
    const req = {};
    const res = createResponse();
    const next = jest.fn();

    requireProviderRole(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("ignores a provider role forged in request data", () => {
    const req = {
      auth: {
        roles: ["property_seeker"],
      },
      body: {
        role: "property_provider",
      },
      query: {
        role: "property_provider",
      },
      headers: {
        "x-user-role": "property_provider",
      },
    };

    const res = createResponse();
    const next = jest.fn();

    requireProviderRole(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});