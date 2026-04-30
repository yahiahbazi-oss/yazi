import { createServerClient } from "@/lib/supabase-server";

const SITE_URL = "https://www.yazi.tn";

export const revalidate = 3600; // regenerate every hour

export default async function sitemap() {
  const supabase = createServerClient();

  // Fetch all active products
  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("is_active", true);

  // Fetch all categories/slugs
  const { data: collections } = await supabase
    .from("collections")
    .select("slug, updated_at");

  const productUrls = (products || []).map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const collectionUrls = (collections || []).map((c) => ({
    url: `${SITE_URL}/?collection=${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const staticUrls = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  return [...staticUrls, ...productUrls, ...collectionUrls];
}
