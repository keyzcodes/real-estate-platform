const { getActiveAmenities } = require("../services/amenityService");

async function listAmenities(req, res, next) {
  try {
    const amenities = await getActiveAmenities();

    res.status(200).json({
      success: true,
      data: {
        amenities,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAmenities,
};