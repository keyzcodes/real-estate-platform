function getProviderWorkspace(req, res) {
  const {
    userId,
    fullName,
    avatarUrl,
  } = req.auth;

  return res.status(200).json({
    success: true,
    data: {
      workspace: {
        providerId: userId,
        fullName,
        avatarUrl,
      },
    },
  });
}

module.exports = {
  getProviderWorkspace,
};