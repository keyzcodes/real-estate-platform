const {
  validateAccessToken,
} = require("../services/authService");

function parseBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") {
    return null;
  }

  const match = authorizationHeader.match(
    /^Bearer +([^\s]+)$/i
  );

  if (!match) {
    return null;
  }

  return match[1];
}

function sendAuthenticationRequired(res) {
  return res.status(401).json({
    success: false,
    error: {
      code: "AUTHENTICATION_REQUIRED",
      message: "A valid bearer access token is required.",
    },
  });
}

async function authenticateRequest(req, res, next) {
  const accessToken = parseBearerToken(
    req.get("authorization")
  );

  if (!accessToken) {
    return sendAuthenticationRequired(res);
  }

  try {
    const authenticatedUser =
      await validateAccessToken(accessToken);

    if (!authenticatedUser) {
      return sendAuthenticationRequired(res);
    }

    req.auth = {
      userId: authenticatedUser.id,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticateRequest,
  parseBearerToken,
};