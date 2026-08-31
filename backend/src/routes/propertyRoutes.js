const express = require("express");

const {
  listProperties,
  getPropertyDetails,
} = require("../controllers/propertyController");

const router = express.Router();

router.get("/", listProperties);
router.get("/:slug", getPropertyDetails);

module.exports = router;