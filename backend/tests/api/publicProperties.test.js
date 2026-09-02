const request = require("supertest");

jest.mock("../../src/config/supabase", () => ({}));

jest.mock("../../src/services/propertyService", () => ({
  getPublicProperties: jest.fn(),
  getPublicPropertyBySlug: jest.fn(),
}));

const {
  getPublicProperties,
  getPublicPropertyBySlug,
} = require("../../src/services/propertyService");

const app = require("../../src/app");

describe("Public property catalogue API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/properties", () => {
    test("returns an empty public catalogue successfully", async () => {
      getPublicProperties.mockResolvedValue({
        properties: [],
        pagination: {
          page: 1,
          limit: 12,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const response = await request(app)
        .get("/api/v1/properties")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          properties: [],
          pagination: {
            page: 1,
            limit: 12,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      });

      expect(getPublicProperties).toHaveBeenCalledTimes(1);

      expect(getPublicProperties).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        sort: "newest",
      });

      expect(getPublicPropertyBySlug).not.toHaveBeenCalled();
    });

    test("rejects an unsupported property type before calling the service", async () => {
      const response = await request(app)
        .get("/api/v1/properties?propertyType=hotel")
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toEqual({
  success: false,
  error: {
    code: "INVALID_QUERY_PARAMETERS",
    message: "One or more query parameters are invalid.",
    details: [
      {
        field: "propertyType",
        message: expect.any(String),
      },
    ],
  },
});

      expect(getPublicProperties).not.toHaveBeenCalled();
      expect(getPublicPropertyBySlug).not.toHaveBeenCalled();
    });
  });
    describe("GET /api/v1/properties/:slug", () => {
    test("returns the public not-found response for a nonexistent property", async () => {
      getPublicPropertyBySlug.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/properties/property-that-does-not-exist")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: "PROPERTY_NOT_FOUND",
          message: "The requested property was not found.",
        },
      });

      expect(getPublicPropertyBySlug).toHaveBeenCalledTimes(1);

      expect(getPublicPropertyBySlug).toHaveBeenCalledWith(
        "property-that-does-not-exist"
      );

      expect(getPublicProperties).not.toHaveBeenCalled();
    });

    test("rejects an invalid slug before calling the service", async () => {
      const response = await request(app)
        .get("/api/v1/properties/Demo-Property")
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: "INVALID_PROPERTY_SLUG",
          message: "Property slug has an invalid format.",
        },
      });

      expect(getPublicPropertyBySlug).not.toHaveBeenCalled();
      expect(getPublicProperties).not.toHaveBeenCalled();
    });
  });
    describe("Public error handling", () => {
    test("sanitizes unexpected internal errors", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      getPublicProperties.mockRejectedValue(
        new Error("Sensitive database failure", {
          cause: new Error("Private SQL and credentials"),
        })
      );

      try {
        const response = await request(app)
          .get("/api/v1/properties")
          .expect("Content-Type", /json/)
          .expect(500);

        expect(response.body).toEqual({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "The server could not complete the request.",
          },
        });

        const publicResponse = JSON.stringify(response.body);

        expect(publicResponse).not.toContain(
          "Sensitive database failure"
        );

        expect(publicResponse).not.toContain(
          "Private SQL and credentials"
        );

        expect(publicResponse).not.toContain("stack");

        expect(getPublicProperties).toHaveBeenCalledTimes(1);
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });
});
