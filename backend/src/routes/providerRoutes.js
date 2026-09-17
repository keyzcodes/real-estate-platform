const express = require("express");

const {
  getProviderWorkspace,
} = require("../controllers/providerController");

const {
  authenticateRequest,
} = require("../middleware/authenticateRequest");

const {
  requireProviderRole,
} = require("../middleware/requireProviderRole");

const router = express.Router();

router.get(
  "/workspace",
  authenticateRequest,
  requireProviderRole,
  getProviderWorkspace
);

module.exports = router;