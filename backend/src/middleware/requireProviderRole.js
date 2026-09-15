function requireProviderRole(req, res, next) {
  const roles = req.auth?.roles;

  if (
    !Array.isArray(roles) ||
    !roles.includes("property_provider")
  ) {
    return res.status(403).json({
      success: false,
      error: {
        code: "PROVIDER_ACCESS_REQUIRED",
        message:
          "An active property-provider account is required.",
      },
    });
  }

  return next();
}

module.exports = {
  requireProviderRole,
};