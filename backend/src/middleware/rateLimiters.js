const {
  ipKeyGenerator,
  rateLimit,
} = require("express-rate-limit");

const fifteenMinutesInMilliseconds =
  15 * 60 * 1000;

function createScopedIpKeyGenerator(scope) {
  return (req) =>
    `${scope}:${ipKeyGenerator(req.ip)}`;
}

function sendAccountRateLimitExceeded(_req, res) {
  return res.status(429).json({
    success: false,
    error: {
      code: "ACCOUNT_RATE_LIMIT_EXCEEDED",
      message:
        "Too many account requests. Please try again later.",
    },
  });
}

const accountApiLimiter = rateLimit({
  windowMs: fifteenMinutesInMilliseconds,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator:
    createScopedIpKeyGenerator("account-api"),
  requestPropertyName: "accountRateLimit",
  handler: sendAccountRateLimitExceeded,
});

const providerEnrolmentLimiter = rateLimit({
  windowMs: fifteenMinutesInMilliseconds,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator:
    createScopedIpKeyGenerator("provider-enrolment"),
  requestPropertyName: "providerEnrolmentRateLimit",
  handler: sendAccountRateLimitExceeded,
});

module.exports = {
  accountApiLimiter,
  providerEnrolmentLimiter,
};