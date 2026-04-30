import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import MetaPixel from "@/components/MetaPixel";
import GoogleTagManager from "@/components/GoogleTagManager";
import { Toaster } from "react-hot-toast";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";

const SITE_URL = "https://www.yazi.tn";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "YAZI.TN — Vêtements Femme & Homme en Tunisie | ملابس تونس",
    template: "%s | YAZI.TN",
  },
  description:
    "YAZI.TN — Mangez italien, conduisez allemand, habillez-vous tunisien ! Boutique de vêtements en ligne en Tunisie. Robes, hijab, pulls, vestes en daim, jeans, vêtements personnalisés pour femme et homme. Livraison partout en Tunisie. Paiement à la livraison. كُلْ إيطالي، اقُدْ ألماني، البسْ تونسي — متجر ملابس تونس.",
  keywords: [
    // French
    "vêtements tunisie", "boutique vêtements tunisie", "mode femme tunisie", "mode homme tunisie",
    "robe tunisie", "hijab tunisie", "pull tunisie", "veste daim tunisie", "jean tunisie",
    "manteau tunisie", "jupe tunisie", "chemise homme tunisie", "sweat capuche tunisie",
    "t-shirt tunisie", "vêtements en ligne tunisie", "achat vêtements tunisie",
    "livraison tunisie", "paiement à la livraison tunisie", "boutique mode tunisie",
    "tendance mode tunisie 2026", "grande taille tunisie", "vêtements femme tunisie",
    "vêtements homme tunisie", "collection vêtements tunisie", "soldes vêtements tunisie",
    "veste femme tunisie", "veste homme tunisie", "robe soirée tunisie", "abaya tunisie",
    "ensemble femme tunisie", "pantalon femme tunisie", "pantalon homme tunisie",
    "legging tunisie", "cardigan tunisie", "chemise femme tunisie", "blouson tunisie",
    "tunique tunisie", "robe décontractée tunisie", "YAZI tunisie", "yazi.tn",
    // Custom clothing
    "vêtements personnalisés tunisie", "tenue personnalisée tunisie",
    "broderie prénom tunisie", "impression vêtements tunisie",
    "t-shirt personnalisé tunisie", "sweat personnalisé tunisie",
    "vêtements sur mesure tunisie", "cadeau vêtement tunisie",
    "vêtements groupe tunisie", "uniforme personnalisé tunisie",
    // Arabic custom
    "ملابس مخصصة تونس", "تطريز ملابس تونس", "طباعة ملابس تونس",
    "هدية ملابس تونس", "تفصيل ملابس تونس",
    // English custom
    "custom clothes tunisia", "personalised clothing tunisia",
    "custom t-shirt tunisia", "embroidery tunisia", "print on demand tunisia",
    // Arabic
    "ملابس تونس", "متجر ملابس تونسي", "أزياء نسائية تونس", "أزياء رجالية تونس",
    "فستان تونس", "حجاب تونس", "بلوفر تونس", "جاكيت سويدي تونس", "جينز تونس",
    "معطف تونس", "تنورة تونس", "ملابس أون لاين تونس", "شراء ملابس تونس",
    "توصيل تونس", "دفع عند الاستلام تونس", "موضة تونس 2026", "مقاسات كبيرة تونس",
    "عباية تونس", "بدلة نسائية تونس", "قميص رجالي تونس", "بلوزة تونس",
    // English
    "clothes tunisia", "buy clothes online tunisia", "fashion tunisia",
    "women fashion tunisia", "men fashion tunisia", "dress tunisia",
    "hijab tunisia", "suede jacket tunisia", "jacket tunisia", "jeans tunisia",
    "coat tunisia", "online clothing store tunisia", "clothing delivery tunisia",
    "pay on delivery tunisia", "tunisian fashion 2026", "plus size clothes tunisia",
    "YAZI clothing", "YAZI fashion tunisia", "YAZI.TN",
  ],
  authors: [{ name: "YAZI", url: SITE_URL }],
  creator: "YAZI",
  publisher: "YAZI",
  applicationName: "YAZI",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "fr-TN": SITE_URL,
      "ar-TN": SITE_URL,
      "en-TN": SITE_URL,
    },
  },
  openGraph: {
    title: "YAZI.TN — Mangez italien, conduisez allemand, habillez-vous tunisien !",
    description:
      "Boutique mode en ligne en Tunisie. Robes, hijab, pulls, vestes, vêtements personnalisés pour femme et homme. Livraison partout en Tunisie.",
    url: SITE_URL,
    siteName: "YAZI.TN",
    locale: "fr_TN",
    alternateLocale: ["ar_TN", "en_US"],
    type: "website",
    images: [
      {
        url: `${SITE_URL}/images/og-cover.jpg`,
        width: 1200,
        height: 630,
        alt: "YAZI.TN — Boutique vêtements en ligne Tunisie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAZI.TN — Habillez-vous tunisien !",
    description: "Mangez italien, conduisez allemand, habillez-vous tunisien ! Mode femme & homme + vêtements personnalisés. Livraison partout en Tunisie.",
    images: [`${SITE_URL}/images/og-cover.jpg`],
  },
  verification: {
    google: "",
  },
  category: "fashion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <CartProvider>
          <OrganizationJsonLd />
          <WebSiteJsonLd />
          <MetaPixel />
          <GoogleTagManager />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#fff",
                color: "#111",
                border: "1px solid #e5e5e5",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
          />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
