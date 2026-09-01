const mockMaybeSingle = jest.fn();

const mockEq = jest.fn(() => ({
  maybeSingle: mockMaybeSingle,
}));

const mockSelect = jest.fn(() => ({
  eq: mockEq,
}));

const mockFrom = jest.fn(() => ({
  select: mockSelect,
}));

jest.mock("../../src/config/supabase", () => ({
  from: mockFrom,
}));

const {
  getPublicPropertyBySlug,
} = require("../../src/services/propertyService");

const {
  findForbiddenFields,
} = require("../helpers/privacyAssertions");

describe("Property service privacy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("transforms property details without exposing private fields", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "property-1",
        slug: "green-view-residence",
        title: "Green View Residence",
        description: "A verified rental property.",
        property_type: "apartment_building",
        country_code: "NG",
        state_region: "Borno",
        city: "Maiduguri",
        area: "Bolori",
        verification_status: "verified",
        created_at: "2026-09-01T10:00:00Z",
        updated_at: "2026-09-01T11:00:00Z",

        created_by: "private-administrator-id",
        provider_id: "private-provider-id",

        property_locations: {
          approximate_latitude: "11.847",
          approximate_longitude: "13.157",
          verified_at: "2026-09-01T09:00:00Z",

          street_address: "Private exact address",
          exact_latitude: "11.8465",
          exact_longitude: "13.1571",
          verified_by: "private-verifier-id",
        },

        property_amenities: [
          {
            amenities: {
              id: "amenity-1",
              name: "Running Water",
              slug: "running-water",
              category: "utilities",
              description: "Regular water supply.",
              allowed_scope: "both",
            },
          },
        ],

        property_units: [
          {
            id: "unit-1",
            unit_name: "Unit A",
            unit_type: "self_contained",
            description: "Private self-contained unit.",
            bedrooms: 1,
            bathrooms: 1,
            maximum_occupants: 2,
            base_rent: "300000",
            currency: "NGN",
            billing_period: "yearly",
            availability_status: "available",
            available_from: "2026-09-01",

            provider_id: "private-provider-id",

            unit_fees: [
              {
                id: "fee-1",
                fee_type: "caution",
                fee_name: "Refundable caution deposit",
                description: "Refundable under the tenancy conditions.",
                amount: "30000",
                currency: "NGN",
                payment_frequency: "one_time",
                is_mandatory: true,
                is_refundable: true,
              },
            ],

            unit_amenities: [
              {
                amenities: {
                  id: "amenity-2",
                  name: "Wardrobe",
                  slug: "wardrobe",
                  category: "interior",
                  description: "A fitted wardrobe.",
                  allowed_scope: "unit",
                },
              },
            ],
          },
        ],

        property_media: [
          {
            id: "media-1",
            unit_id: null,
            media_type: "image",
            media_category: "exterior",
            format: "jpg",
            width_pixels: 1200,
            height_pixels: 800,
            duration_seconds: null,
            alt_text: "Exterior property view",
            display_order: 0,
            is_cover: true,
            captured_at: "2026-09-01T08:00:00Z",
            verified_at: "2026-09-01T09:00:00Z",

            storage_provider: "private-storage-provider",
            storage_key: "private/property/image",
            uploaded_by: "private-uploader-id",
            verified_by: "private-verifier-id",
          },
        ],
      },
      error: null,
    });

    const property = await getPublicPropertyBySlug(
      "green-view-residence"
    );

    expect(findForbiddenFields(property)).toEqual([]);

    expect(property.location).toEqual({
      countryCode: "NG",
      stateRegion: "Borno",
      city: "Maiduguri",
      area: "Bolori",
      approximateLatitude: 11.847,
      approximateLongitude: 13.157,
      isLocationVerified: true,
    });

    expect(property.units[0].baseRent).toEqual({
      amount: 300000,
      currency: "NGN",
      billingPeriod: "yearly",
    });

    expect(property.units[0].fees[0]).toMatchObject({
      feeType: "caution",
      amount: 30000,
      isMandatory: true,
      isRefundable: true,
    });

    expect(property.media[0].url).toBeNull();
    expect(property.media[0]).not.toHaveProperty("storageKey");
    expect(property.media[0]).not.toHaveProperty("uploadedBy");

    expect(mockFrom).toHaveBeenCalledWith("properties");
    expect(mockEq).toHaveBeenCalledWith(
      "slug",
      "green-view-residence"
    );

    const selectedFields = mockSelect.mock.calls[0][0];

    expect(selectedFields).not.toMatch(
      /street_address|exact_latitude|exact_longitude|created_by|provider_id|storage_provider|storage_key|uploaded_by|verified_by/
    );
  });
});