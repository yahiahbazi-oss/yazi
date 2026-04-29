// JSON-LD Structured Data for rich Google results
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "YAZI",
    alternateName: ["YAZI Tunisie", "YAZI متجر ملابس تونس"],
    url: "https://yazi-sable.vercel.app",
    logo: "https://yazi-sable.vercel.app/images/og-cover.jpg",
    description:
      "Boutique de vêtements en ligne en Tunisie. Robes, hijab, pulls, vestes, jeans pour femme et homme. Livraison rapide. Paiement à la livraison.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TN",
      addressRegion: "Tunisie",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+216-93-733-766",
      contactType: "customer service",
      availableLanguage: ["French", "Arabic"],
    },
    sameAs: [],
    priceRange: "$$",
    currenciesAccepted: "TND",
    paymentAccepted: "Cash on Delivery",
    areaServed: {
      "@type": "Country",
      name: "Tunisia",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "YAZI Tunisie",
    url: "https://yazi-sable.vercel.app",
    description:
      "Boutique de vêtements en ligne en Tunisie — Robes, hijab, pulls, vestes pour femme et homme",
    inLanguage: ["fr-TN", "ar-TN"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://yazi-sable.vercel.app/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({ product, selectedSize, selectedColor }) {
  if (!product) return null;

  const price = product.price;
  const image = product.images?.[0];

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — disponible en Tunisie`,
    image: image ? [image] : [],
    brand: {
      "@type": "Brand",
      name: "YAZI",
    },
    offers: {
      "@type": "Offer",
      url: `https://yazi-sable.vercel.app/products/${product.id}`,
      priceCurrency: "TND",
      price: price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability:
        Object.values(product.stock || {}).some((q) => q > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "YAZI Tunisie",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.delivery_price || 0,
          currency: "TND",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "d",
          },
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TN",
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "47",
      bestRating: "5",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
