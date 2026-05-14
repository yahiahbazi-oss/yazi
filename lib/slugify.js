/**
 * Convert a product name to a URL-friendly slug.
 * e.g. "ZAALOUNI T-SHIRT" → "zaalouni-t-shirt"
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
    .trim()
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-");            // dedupe hyphens
}

/**
 * Generate a unique slug for a product, appending -2, -3 … if duplicates exist.
 * @param {object} supabase - Supabase server client
 * @param {string} name     - Product name
 * @param {string} [excludeId] - ID of current product to exclude (for updates)
 */
export async function generateUniqueSlug(supabase, name, excludeId = null) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (true) {
    let query = supabase.from("products").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query;
    if (!data || data.length === 0) break;
    counter++;
    slug = `${base}-${counter}`;
  }

  return slug;
}
