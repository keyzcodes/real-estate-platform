const {
  createAuthenticatedSupabaseClient,
} = require("../config/supabase");

const {
  getActiveAccount,
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

function sendAccountAccessDenied(res) {
  return res.status(403).json({
    success: false,
    error: {
      code: "ACCOUNT_ACCESS_DENIED",
      message:
        "This account cannot access protected resources.",
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

    const authenticatedSupabaseClient =
      createAuthenticatedSupabaseClient(accessToken);

    const activeAccount = await getActiveAccount(
      authenticatedSupabaseClient,
      authenticatedUser.id
    );

    if (!activeAccount) {
      return sendAccountAccessDenied(res);
    }

    req.auth = {
      userId: activeAccount.id,
      fullName: activeAccount.fullName,
      avatarUrl: activeAccount.avatarUrl,
      accountStatus: activeAccount.accountStatus,
      roles: activeAccount.roles,
    };

    req.supabase = authenticatedSupabaseClient;

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticateRequest,
  parseBearerToken,
};