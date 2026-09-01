const forbiddenPublicKeys = new Set([
  "streetAddress",
  "street_address",
  "exactLatitude",
  "exact_latitude",
  "exactLongitude",
  "exact_longitude",
  "createdBy",
  "created_by",
  "providerId",
  "provider_id",
  "verifiedBy",
  "verified_by",
  "uploadedBy",
  "uploaded_by",
  "storageProvider",
  "storage_provider",
  "storageKey",
  "storage_key",
  "administratorId",
  "administrator_id",
]);

function findForbiddenFields(value, path = "$", matches = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      findForbiddenFields(item, `${path}[${index}]`, matches);
    });

    return matches;
  }

  if (value === null || typeof value !== "object") {
    return matches;
  }

  Object.entries(value).forEach(([key, nestedValue]) => {
    const fieldPath = `${path}.${key}`;

    if (forbiddenPublicKeys.has(key)) {
      matches.push(fieldPath);
    }

    findForbiddenFields(nestedValue, fieldPath, matches);
  });

  return matches;
}

module.exports = {
  forbiddenPublicKeys,
  findForbiddenFields,
};
