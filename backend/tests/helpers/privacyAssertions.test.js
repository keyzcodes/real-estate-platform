const {
  findForbiddenFields,
} = require("./privacyAssertions");

describe("Public response privacy assertions", () => {
  test("accepts a response containing only public fields", () => {
    const publicResponse = {
      success: true,
      data: {
        property: {
          id: "property-1",
          title: "Green View Residence",
          location: {
            city: "Maiduguri",
            area: "Bolori",
            approximateLatitude: 11.847,
            approximateLongitude: 13.157,
          },
          units: [
            {
              id: "unit-1",
              baseRent: {
                amount: 300000,
                currency: "NGN",
                billingPeriod: "yearly",
              },
            },
          ],
        },
      },
    };

    expect(findForbiddenFields(publicResponse)).toEqual([]);
  });

  test("detects forbidden fields anywhere inside nested objects and arrays", () => {
    const unsafeResponse = {
      success: true,
      data: {
        property: {
          street_address: "Private address",
          units: [
            {
              privateLocation: {
                exactLatitude: 11.8465,
                exact_longitude: 13.1571,
              },
              media: [
                {
                  storageKey: "private/property/image",
                  uploaded_by: "private-user-id",
                },
              ],
            },
          ],
        },
      },
    };

    expect(findForbiddenFields(unsafeResponse)).toEqual([
      "$.data.property.street_address",
      "$.data.property.units[0].privateLocation.exactLatitude",
      "$.data.property.units[0].privateLocation.exact_longitude",
      "$.data.property.units[0].media[0].storageKey",
      "$.data.property.units[0].media[0].uploaded_by",
    ]);
  });
});