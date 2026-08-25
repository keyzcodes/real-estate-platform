const supabase = require("../config/supabase");

function buildStartingPrices(units) {
  const prices = new Map();

  const availableUnits = units.filter(
    (unit) => unit.availability_status === "available"
  );

  for (const unit of availableUnits) {
    const key = `${unit.currency}:${unit.billing_period}`;
    const amount = Number(unit.base_rent);

    const currentPrice = prices.get(key);

    if (!currentPrice || amount < currentPrice.amount) {
      prices.set(key, {
        amount,
        currency: unit.currency,
        billingPeriod: unit.billing_period,
      });
    }
  }

  return Array.from(prices.values());
}

async function getPublicProperties({
  page,
  limit,
  country,
  state,
  city,
  area,
  propertyType,
  sort,
}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("properties")
    .select(
      `
        id,
        slug,
        title,
        description,
        property_type,
        country_code,
        state_region,
        city,
        area,
        verification_status,
        created_at,
        updated_at,
        property_locations (
          approximate_latitude,
          approximate_longitude,
          verified_at
        ),
        property_units (
          id,
          base_rent,
          currency,
          billing_period,
          availability_status
        )
      `,
      {
        count: "exact",
      }
    );

  if (country) {
    query = query.eq("country_code", country);
  }

  if (state) {
    query = query.ilike("state_region", state);
  }

  if (city) {
    query = query.ilike("city", city);
  }

  if (area) {
    query = query.ilike("area", area);
  }

  if (propertyType) {
    query = query.eq("property_type", propertyType);
  }

  query = query
    .order("created_at", {
      ascending: sort === "oldest",
    })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Unable to retrieve public properties.", {
      cause: error,
    });
  }

  const properties = (data || []).map((property) => {
    const units = property.property_units || [];
    const location = property.property_locations || null;

    return {
      id: property.id,
      slug: property.slug,
      title: property.title,
      description: property.description,
      propertyType: property.property_type,
      verificationStatus: property.verification_status,

      location: {
        countryCode: property.country_code,
        stateRegion: property.state_region,
        city: property.city,
        area: property.area,
        approximateLatitude:
          location?.approximate_latitude !== undefined
            ? Number(location.approximate_latitude)
            : null,
        approximateLongitude:
          location?.approximate_longitude !== undefined
            ? Number(location.approximate_longitude)
            : null,
        isLocationVerified: Boolean(location?.verified_at),
      },

      startingPrices: buildStartingPrices(units),

      availableUnitCount: units.filter(
        (unit) => unit.availability_status === "available"
      ).length,

      coverMedia: null,
      createdAt: property.created_at,
      updatedAt: property.updated_at,
    };
  });

  const totalItems = count || 0;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    properties,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
async function getPublicPropertyBySlug(slug) {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
        id,
        slug,
        title,
        description,
        property_type,
        country_code,
        state_region,
        city,
        area,
        verification_status,
        created_at,
        updated_at,

        property_locations (
          approximate_latitude,
          approximate_longitude,
          verified_at
        ),

        property_amenities (
          amenities (
            id,
            name,
            slug,
            category,
            description,
            allowed_scope
          )
        ),

        property_units (
          id,
          unit_name,
          unit_type,
          description,
          bedrooms,
          bathrooms,
          maximum_occupants,
          base_rent,
          currency,
          billing_period,
          availability_status,
          available_from,

          unit_fees (
            id,
            fee_type,
            fee_name,
            description,
            amount,
            currency,
            payment_frequency,
            is_mandatory,
            is_refundable
          ),

          unit_amenities (
            amenities (
              id,
              name,
              slug,
              category,
              description,
              allowed_scope
            )
          )
        ),

        property_media (
          id,
          unit_id,
          media_type,
          media_category,
          storage_provider,
          storage_key,
          format,
          width_pixels,
          height_pixels,
          duration_seconds,
          alt_text,
          display_order,
          is_cover,
          captured_at,
          verified_at
        )
      `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to retrieve the property.", {
      cause: error,
    });
  }

  if (!data) {
    return null;
  }

  const location = data.property_locations || null;

  const propertyAmenities = (data.property_amenities || [])
    .map((relationship) => relationship.amenities)
    .filter(Boolean)
    .map((amenity) => ({
      id: amenity.id,
      name: amenity.name,
      slug: amenity.slug,
      category: amenity.category,
      description: amenity.description,
      allowedScope: amenity.allowed_scope,
    }));

  const units = (data.property_units || []).map((unit) => ({
    id: unit.id,
    unitName: unit.unit_name,
    unitType: unit.unit_type,
    description: unit.description,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    maximumOccupants: unit.maximum_occupants,

    baseRent: {
      amount: Number(unit.base_rent),
      currency: unit.currency,
      billingPeriod: unit.billing_period,
    },

    availability: {
      status: unit.availability_status,
      availableFrom: unit.available_from,
    },

    fees: (unit.unit_fees || []).map((fee) => ({
      id: fee.id,
      feeType: fee.fee_type,
      feeName: fee.fee_name,
      description: fee.description,
      amount: Number(fee.amount),
      currency: fee.currency,
      paymentFrequency: fee.payment_frequency,
      isMandatory: fee.is_mandatory,
      isRefundable: fee.is_refundable,
    })),

    amenities: (unit.unit_amenities || [])
      .map((relationship) => relationship.amenities)
      .filter(Boolean)
      .map((amenity) => ({
        id: amenity.id,
        name: amenity.name,
        slug: amenity.slug,
        category: amenity.category,
        description: amenity.description,
        allowedScope: amenity.allowed_scope,
      })),
  }));

  const media = (data.property_media || [])
    .sort((first, second) => first.display_order - second.display_order)
    .map((item) => ({
      id: item.id,
      unitId: item.unit_id,
      mediaType: item.media_type,
      mediaCategory: item.media_category,
      url: null,
      format: item.format,
      widthPixels: item.width_pixels,
      heightPixels: item.height_pixels,
      durationSeconds:
        item.duration_seconds === null
          ? null
          : Number(item.duration_seconds),
      altText: item.alt_text,
      displayOrder: item.display_order,
      isCover: item.is_cover,
      capturedAt: item.captured_at,
      verifiedAt: item.verified_at,
    }));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    propertyType: data.property_type,
    verificationStatus: data.verification_status,

    location: {
      countryCode: data.country_code,
      stateRegion: data.state_region,
      city: data.city,
      area: data.area,
      approximateLatitude:
        location?.approximate_latitude !== undefined
          ? Number(location.approximate_latitude)
          : null,
      approximateLongitude:
        location?.approximate_longitude !== undefined
          ? Number(location.approximate_longitude)
          : null,
      isLocationVerified: Boolean(location?.verified_at),
    },

    amenities: propertyAmenities,
    units,
    media,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

module.exports = {
  getPublicProperties,
  getPublicPropertyBySlug,
};