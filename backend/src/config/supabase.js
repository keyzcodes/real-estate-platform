const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY environment variable."
  );
}

function createStatelessAuthOptions() {
  return {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  };
}

const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: createStatelessAuthOptions(),
  }
);

function createAuthenticatedSupabaseClient(accessToken) {
  const normalizedAccessToken =
    typeof accessToken === "string" ? accessToken.trim() : "";

  if (!normalizedAccessToken) {
    throw new TypeError("A validated access token is required.");
  }

  return createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${normalizedAccessToken}`,
        },
      },
      auth: createStatelessAuthOptions(),
    }
  );
}

module.exports = supabase;
module.exports.createAuthenticatedSupabaseClient =
  createAuthenticatedSupabaseClient;