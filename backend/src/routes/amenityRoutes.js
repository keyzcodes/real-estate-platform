const express = require("express");
const { listAmenities } = require("../controllers/amenityController");

const router = express.Router();

router.get("/", listAmenities);

module.exports = router;