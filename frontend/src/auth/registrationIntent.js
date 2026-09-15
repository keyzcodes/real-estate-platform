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
  window.sessionStorage.removeItem(registrationIntentStorageKey);
}

export {
  clearRegistrationIntent,
  normalizeRegistrationIntent,
  readRegistrationIntent,
  storeRegistrationIntent,
};