const express = require("express");

const {
  enrolProvider,
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
router.post(
  "/provider-enrolment",
  authenticateRequest,
  enrolProvider
);

module.exports = router;