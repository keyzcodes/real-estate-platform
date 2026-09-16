const registrationIntentStorageKey = "kudu.registration-intent";

const allowedRegistrationIntents = new Set([
  "seeker",
  "provider",
]);

function normalizeRegistrationIntent(value) {
  return allowedRegistrationIntents.has(value)
    ? value
    : "seeker";
}

function storeRegistrationIntent(value) {
  const normalizedIntent = normalizeRegistrationIntent(value);

  window.sessionStorage.setItem(
    registrationIntentStorageKey,
    normalizedIntent
  );

  return normalizedIntent;
}

function readRegistrationIntent() {
  return normalizeRegistrationIntent(
    window.sessionStorage.getItem(registrationIntentStorageKey)
  );
}

function clearRegistrationIntent() {
  try {
    window.sessionStorage.removeItem(registrationIntentStorageKey);
  } catch {
    // This UI hint is not a credential. Cleanup must not block sign-out.
  }
}

export {
  clearRegistrationIntent,
  normalizeRegistrationIntent,
  readRegistrationIntent,
  storeRegistrationIntent,
};