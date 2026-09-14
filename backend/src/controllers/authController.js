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

module.exports = {
  getCurrentAccount,
};