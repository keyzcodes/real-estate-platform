const { z } = require("zod");
const supabase = require("../config/supabase");

const userIdSchema = z.string().uuid();

async function validateAccessToken(accessToken) {
  if (
    typeof accessToken !== "string" ||
    accessToken.trim().length === 0
  ) {
    return null;
  }

  const { data, error } =
    await supabase.auth.getClaims(accessToken);

  if (error) {
    return null;
  }

  const userIdResult = userIdSchema.safeParse(
    data?.claims?.sub
  );

  if (!userIdResult.success) {
    return null;
  }

  return {
    id: userIdResult.data,
  };
}

module.exports = {
  validateAccessToken,
};