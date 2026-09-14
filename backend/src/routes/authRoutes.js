const express = require("express");

const {
  getCurrentAccount,
} = require("../controllers/authController");

const {
  authenticateRequest,
} = require("../middleware/authenticateRequest");

const router = express.Router();

router.get(
  "/me",
  authenticateRequest,
  getCurrentAccount
);

module.exports = router;