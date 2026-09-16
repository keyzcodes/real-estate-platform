const express = require("express");

const {
  enrolProvider,
  getCurrentAccount,
} = require("../controllers/authController");

const { authenticateRequest } = require("../middleware/authenticateRequest");

const { providerEnrolmentLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.get("/me", authenticateRequest, getCurrentAccount);
router.post(
  "/provider-enrolment",
  providerEnrolmentLimiter,
  authenticateRequest,
  enrolProvider,
);

module.exports = router;
