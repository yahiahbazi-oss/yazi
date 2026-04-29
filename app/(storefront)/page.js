import HomeClient from "./HomeClient";

export const metadata = {
  title: "YAZI — Boutique Vetements en ligne Tunisie | Robes Hijab Pull Vestes",
  description: "YAZI Tunisie — Vetements femme et homme en ligne. Robes, hijab, pulls, vestes en daim, jeans, manteaux. Livraison rapide partout en Tunisie. Paiement a la livraison. متجر ملابس أون لاين في تونس.",
  alternates: {
    canonical: "https://yazi-sable.vercel.app",
  },
  openGraph: {
    title: "YAZI — Boutique Vetements en ligne Tunisie",
    description: "Robes, hijab, pulls, vestes en daim, jeans, manteaux pour femme et homme. Livraison partout en Tunisie.",
    url: "https://yazi-sable.vercel.app",
    siteName: "YAZI Tunisie",
    type: "website",
    images: [{ url: "https://yazi-sable.vercel.app/images/og-cover.jpg", width: 1200, height: 630, alt: "YAZI — Boutique mode Tunisie" }],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
