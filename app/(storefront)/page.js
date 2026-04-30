import HomeClient from "./HomeClient";

export const metadata = {
  title: "YAZI.TN — Vêtements Femme & Homme en Tunisie | Robes Hijab Pull Veste Personnalisée",
  description: "YAZI.TN — Mangez italien, conduisez allemand, habillez-vous tunisien ! Robes, hijab, pulls, vestes en daim, jeans, vêtements personnalisés. Livraison rapide partout en Tunisie. Paiement à la livraison. كُلْ إيطالي، اقُدْ ألماني، البسْ تونسي — ملابس تونس YAZI.",
  keywords: [
    "vêtements personnalisés tunisie", "tenue personnalisée tunisie",
    "broderie tunisie", "impression vêtements tunisie", "t-shirt personnalisé tunisie",
    "sweat personnalisé tunisie", "cadeau vêtement tunisie", "vêtements sur mesure tunisie",
    "ملابس مخصصة تونس", "تطريز تونس", "طباعة ملابس تونس",
    "custom clothes tunisia", "personalised clothing tunisia",
    "YAZI.TN", "yazi.tn",
  ],
  alternates: {
    canonical: "https://www.yazi.tn",
  },
  openGraph: {
    title: "YAZI.TN — Mangez italien, conduisez allemand, habillez-vous tunisien !",
    description: "Boutique mode en ligne en Tunisie. Robes, hijab, pulls, vestes, vêtements personnalisés. Livraison partout en Tunisie.",
    url: "https://www.yazi.tn",
    siteName: "YAZI.TN",
    type: "website",
    images: [{ url: "https://www.yazi.tn/images/og-cover.jpg", width: 1200, height: 630, alt: "YAZI.TN — Boutique mode Tunisie" }],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
