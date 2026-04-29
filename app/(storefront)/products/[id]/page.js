import { createServerClient } from "@/lib/supabase-server";
import ProductDetailClient from "./ProductDetailClient";

const SITE_URL = "https://yazi-sable.vercel.app";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, price, category, gender, images, compare_price")
    .eq("id", id)
    .single();

  if (!product) {
    return {
      title: "Produit introuvable | YAZI Tunisie",
      robots: { index: false, follow: false },
    };
  }

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
      canonical: `${SITE_URL}/products/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${id}`,
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
