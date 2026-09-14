const {
  enrolCurrentUserAsProvider,
} = require("../services/authService");

function getCurrentAccount(req, res) {
  const {
    userId,
    fullName,
    avatarUrl,
    accountStatus,
    roles,
  } = req.auth;

  return res.status(200).json({
    success: true,
    data: {
      account: {
        id: userId,
        fullName,
        avatarUrl,
        accountStatus,
        roles,
      },
    },
  });
}

async function enrolProvider(req, res, next) {
  try {
    const created =
      await enrolCurrentUserAsProvider(req.supabase);

    const roles = [
      ...new Set([
        ...req.auth.roles,
        "property_provider",
      ]),
    ].sort();

    return res.status(200).json({
      success: true,
      data: {
        providerEnrolment: {
          created,
          role: "property_provider",
          roles,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}
module.exports = {
  enrolProvider,
  getCurrentAccount,
};