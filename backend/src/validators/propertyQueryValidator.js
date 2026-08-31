const { z } = require("zod");

const locationValue = (maximumLength) =>
  z
    .string()
    .trim()
    .min(1, "The value cannot be blank.")
    .max(maximumLength, `The value cannot exceed ${maximumLength} characters.`)
    .regex(
      /^[\p{L}\p{N}\s.'-]+$/u,
      "The value contains unsupported characters."
    );

const propertyQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be a whole number.")
    .min(1, "Page must be at least 1.")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limit must be a whole number.")
    .min(1, "Limit must be at least 1.")
    .max(50, "Limit cannot exceed 50.")
    .default(12),

  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Country must be a two-letter code.")
    .transform((value) => value.toUpperCase())
    .optional(),

  state: locationValue(100).optional(),

  city: locationValue(100).optional(),

  area: locationValue(150).optional(),

  propertyType: z
    .enum([
      "hostel",
      "apartment_building",
      "house",
      "duplex",
      "bungalow",
      "compound",
    ])
    .optional(),

  sort: z
    .enum(["newest", "oldest"])
    .default("newest"),
});

function validatePropertyQuery(query) {
  return propertyQuerySchema.safeParse(query);
}

module.exports = {
  validatePropertyQuery,
  validatePropertySlug,
};
function validatePropertySlug(slug) {
  return propertySlugSchema.safeParse(slug);
}
const propertySlugSchema = z
  .string()
  .trim()
  .min(1, "Property slug is required.")
  .max(170, "Property slug cannot exceed 170 characters.")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Property slug has an invalid format."
  );