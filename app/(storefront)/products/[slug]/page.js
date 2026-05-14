import { createServerClient } from "@/lib/supabase-server";
import ProductDetailClient from "./ProductDetailClient";

const SITE_URL = "https://www.yazi.tn";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// First segment of a UUID is 8 hex chars
const UUID_PREFIX_RE = /^[0-9a-f]{8}$/i;

async function getProduct(supabase, slugParam) {
  // Full UUID → look up directly
  if (UUID_RE.test(slugParam)) {
    const { data } = await supabase.from("products").select("*").eq("id", slugParam).single();
    return data;
  }
  // "name-slug-b0d104cc" format → last segment is UUID first segment
  const parts = slugParam.split("-");
  const uuidPrefix = parts[parts.length - 1];
  if (UUID_PREFIX_RE.test(uuidPrefix)) {
    const { data: all } = await supabase.from("products").select("*").eq("is_active", true);
    return (all || []).find((p) => p.id.startsWith(uuidPrefix)) || null;
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = createServerClient();
  const product = await getProduct(supabase, slug);

  if (!product) {
    return {
      title: "Produit introuvable | YAZI Tunisie",
      robots: { index: false, follow: false },
    };
  }

  const canonicalSlug = slug; // keep the slug as-is for canonical
  const genderLabel =
    product.gender === "men" ? "Homme" : product.gender === "women" ? "Femme" : "Unisexe";
  const priceLabel = `${product.price} TND`;
  const title = `${product.name} — ${genderLabel} | YAZI Tunisie`;
  const description =
    product.description
      ? `${product.description.slice(0, 140)} — ${priceLabel}. Livraison partout en Tunisie. Paiement a la livraison.`
      : `Acheter ${product.name} pour ${genderLabel.toLowerCase()} a ${priceLabel}. Livraison partout en Tunisie. Paiement a la livraison.`;

  const image = product.images?.[0];

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category || "",
      `${product.name} tunisie`,
      `acheter ${product.name}`,
      `${product.name} prix tunisie`,
      `${product.category || "vetement"} tunisie`,
      `mode ${genderLabel.toLowerCase()} tunisie`,
      "vetements tunisie",
      "livraison tunisie",
      "paiement a la livraison",
      "boutique mode tunisie",
      "YAZI tunisie",
    ].filter(Boolean),
    alternates: {
      canonical: `${SITE_URL}/products/${canonicalSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${canonicalSlug}`,
      siteName: "YAZI Tunisie",
      type: "website",
      images: image
        ? [{ url: image, width: 800, height: 1000, alt: product.name }]
        : [{ url: `${SITE_URL}/images/og-cover.jpg`, width: 1200, height: 630, alt: "YAZI Tunisie" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [`${SITE_URL}/images/og-cover.jpg`],
    },
  };
}

export default function ProductPage() {
  return <ProductDetailClient />;
}
