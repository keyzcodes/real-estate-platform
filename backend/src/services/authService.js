const { z } = require("zod");
const supabase = require("../config/supabase");

const userIdSchema = z.string().uuid();

const roleRecordSchema = z.object({
  role: z.enum([
    "property_seeker",
    "property_provider",
    "admin",
  ]),
});

const activeAccountRecordSchema = z.object({
  id: userIdSchema,
  full_name: z.string().min(1),
  avatar_url: z.string().nullable(),
  account_status: z.literal("active"),
  user_roles: z.array(roleRecordSchema),
});

const accountSelect = [
  "id",
  "full_name",
  "avatar_url",
  "account_status",
  "user_roles(role)",
].join(",");

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

async function getActiveAccount(
  authenticatedSupabaseClient,
  userId
) {
  const userIdResult = userIdSchema.safeParse(userId);

  if (!userIdResult.success) {
    return null;
  }

  if (
    !authenticatedSupabaseClient ||
    typeof authenticatedSupabaseClient.from !== "function"
  ) {
    throw new TypeError(
      "An authenticated Supabase client is required."
    );
  }

  const { data, error } =
    await authenticatedSupabaseClient
      .from("profiles")
      .select(accountSelect)
      .eq("id", userIdResult.data)
      .maybeSingle();

  if (error) {
    const accountReadError = new Error(
      "Unable to read authenticated account."
    );

    accountReadError.cause = error;
    throw accountReadError;
  }

  if (!data || data.account_status !== "active") {
    return null;
  }

  const accountResult =
    activeAccountRecordSchema.safeParse(data);

  if (
    !accountResult.success ||
    accountResult.data.id !== userIdResult.data
  ) {
    throw new Error(
      "Authenticated account data is invalid."
    );
  }

  const roles = accountResult.data.user_roles
    .map((roleRecord) => roleRecord.role)
    .sort();

  return {
    id: accountResult.data.id,
    fullName: accountResult.data.full_name,
    avatarUrl: accountResult.data.avatar_url,
    accountStatus: accountResult.data.account_status,
    roles,
  };
}

module.exports = {
  getActiveAccount,
  validateAccessToken,
};