"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocation } from "@/lib/location-context";

function productHref(product) {
  const nameSlug = product.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const uuidPrefix = product.id.split("-")[0];
  return `/products/${nameSlug}-${uuidPrefix}`;
}

export default function ProductCard({ product, index = 0, overridePrice = null }) {
  const [hoveredColor, setHoveredColor] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const { country, countryData } = useLocation();

  const getPriceForCountry = () => {
    if (overridePrice !== null) return overridePrice;
    if (product.prices && product.prices[country]) return product.prices[country].price;
    return product.price || 0;
  };

  const getCurrencySymbol = () => {
    if (product.prices && product.prices[country]) {
      const currency = product.prices[country].currency;
      return countryData?.currency === currency ? countryData.symbol : currency;
    }
    return "TND";
  };

  const price = getPriceForCountry();
  const currencySymbol = getCurrencySymbol();

  const cv = product.color_variants && typeof product.color_variants === "object" ? product.color_variants : null;
  const colors = cv ? Object.keys(cv) : [];
  const defaultColor = colors[0] || null;

  const getColorImages = (colorKey) => {
    if (cv && colorKey && cv[colorKey]?.images?.length) return cv[colorKey].images;
    if (product.images?.length) return product.images;
    return [];
  };

  let displayImage;
  if (hoveredColor) {
    displayImage = getColorImages(hoveredColor)[0] || null;
  } else if (selectedColor) {
    displayImage = getColorImages(selectedColor)[0] || null;
  } else if (isCardHovered) {
    const imgs = getColorImages(defaultColor);
    displayImage = imgs[1] || imgs[0] || null;
  } else {
    displayImage = getColorImages(defaultColor)[0] || null;
  }

  const discountPct =
    product.compare_price && product.compare_price > price
      ? Math.round((1 - price / product.compare_price) * 100)
      : null;

  return (
    <div className="bg-white group">
      <Link href={productHref(product)} className="block">
        {/* Full-bleed image — no rounded corners, covers full column */}
        <div
          className="relative aspect-[3/4] overflow-hidden bg-neutral-100"
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-sm">
              Pas d&apos;image
            </div>
          )}

          {/* Badges — minimal, top-left, text only (like stillhere) */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_coming_soon && (
              <span className="text-white text-[10px] tracking-[0.2em] uppercase font-medium drop-shadow-sm">
                Bientôt
              </span>
            )}
            {!product.is_coming_soon && product.is_new && (
              <span className="text-white text-[10px] tracking-[0.2em] uppercase font-medium drop-shadow-sm">
                Nouveau
              </span>
            )}
            {!product.is_coming_soon && product.is_trending && (
              <span className="text-white text-[10px] tracking-[0.2em] uppercase font-medium drop-shadow-sm">
                Tendance
              </span>
            )}
          </div>

          {/* Discount badge — top right */}
          {discountPct && !product.is_coming_soon && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 leading-none">
              -{discountPct}%
            </span>
          )}

          {product.is_coming_soon && (
            <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-4">
              <span className="text-white text-[10px] tracking-widest uppercase">
                Bientôt disponible
              </span>
            </div>
          )}
        </div>

        {/* Product info — minimal, left-aligned */}
        <div className="px-3 pt-3 pb-4 bg-white">
          <p className="text-neutral-900 text-[12px] sm:text-[13px] leading-snug mb-1 line-clamp-2">
            {product.name}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-neutral-700 text-[12px] sm:text-[13px]">{price} {currencySymbol}</p>
            {!overridePrice && product.compare_price && product.compare_price > price && (
              <p className="text-neutral-400 text-[11px] line-through">{product.compare_price} {currencySymbol}</p>
            )}
          </div>
        </div>
      </Link>

      {/* Color swatches below info — outside Link */}
      {colors.length > 0 && (
        <div className="flex gap-1.5 px-3 pb-4 flex-wrap">
          {colors.slice(0, 8).map((hex) => (
            <button
              key={hex}
              onMouseEnter={() => setHoveredColor(hex)}
              onMouseLeave={() => setHoveredColor(null)}
              onClick={(e) => {
                e.preventDefault();
                setSelectedColor((prev) => (prev === hex ? null : hex));
              }}
              title={cv?.[hex]?.name || hex}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                (hoveredColor === hex || (!hoveredColor && selectedColor === hex))
                  ? "scale-125 ring-1 ring-offset-1 ring-neutral-700"
                  : "ring-1 ring-neutral-200 hover:scale-110"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
          {colors.length > 8 && (
            <span className="text-[10px] text-neutral-400 self-center">+{colors.length - 8}</span>
          )}
        </div>
      )}
    </div>
  );
}
