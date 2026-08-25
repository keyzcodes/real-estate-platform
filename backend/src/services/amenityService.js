const supabase = require("../config/supabase");

async function getActiveAmenities() {
  const { data, error } = await supabase
    .from("amenities")
    .select(
      "id, name, slug, category, description, allowed_scope, is_active"
    )
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Unable to retrieve amenities.", {
      cause: error,
    });
  }

  return data.map((amenity) => ({
    id: amenity.id,
    name: amenity.name,
    slug: amenity.slug,
    category: amenity.category,
    description: amenity.description,
    allowedScope: amenity.allowed_scope,
  }));
}

module.exports = {
  getActiveAmenities,
};