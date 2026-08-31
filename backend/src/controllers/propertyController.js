const {
  validatePropertyQuery,
  validatePropertySlug,
} = require("../validators/propertyQueryValidator");

const {
  getPublicProperties,
  getPublicPropertyBySlug,
} = require("../services/propertyService");

async function listProperties(req, res, next) {
  const validationResult = validatePropertyQuery(req.query);

  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_QUERY_PARAMETERS",
        message: "One or more query parameters are invalid.",
        details: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  try {
    const result = await getPublicProperties(
      validationResult.data
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPropertyDetails(req, res, next) {
  const validationResult = validatePropertySlug(req.params.slug);

  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PROPERTY_SLUG",
        message: validationResult.error.issues[0].message,
      },
    });
  }

  try {
    const property = await getPublicPropertyBySlug(
      validationResult.data
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROPERTY_NOT_FOUND",
          message: "The requested property was not found.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listProperties,
  getPropertyDetails,
};