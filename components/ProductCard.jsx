"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ProductCard({ product, index = 0 }) {
  const [hoveredColor, setHoveredColor] = useState(null);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const cv = product.color_variants && typeof product.color_variants === "object" ? product.color_variants : null;
  const colors = cv ? Object.keys(cv) : [];
  const defaultColor = colors[0] || null;

  const getColorImages = (colorKey) => {
    if (cv && colorKey && cv[colorKey]?.images?.length) return cv[colorKey].images;
    if (product.images?.length) return product.images;
    return [];
  };

  // Image display logic:
  // 1. Color circle hovered → first image of that color
  // 2. Card hovered (no color hover) → second image of default color
  // 3. Default → first image of default color
  let displayImage;
  if (hoveredColor) {
    const imgs = getColorImages(hoveredColor);
    displayImage = imgs[0] || null;
  } else if (isCardHovered) {
    const imgs = getColorImages(defaultColor);
    displayImage = imgs[1] || imgs[0] || null;
  } else {
    const imgs = getColorImages(defaultColor);
    displayImage = imgs[0] || null;
  }

  const discountPct =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div
          className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm"
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-sm">
              Pas d&apos;image
            </div>
          )}

          {/* Left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_coming_soon && (
              <span className="bg-neutral-700 text-white text-[10px] tracking-widest uppercase px-3 py-1 font-medium">
                Bient&ocirc;t
              </span>
            )}
            {!product.is_coming_soon && product.is_new && (
              <span className="bg-neutral-900 text-white text-[10px] tracking-widest uppercase px-3 py-1 font-medium">
                Nouveau
              </span>
            )}
            {!product.is_coming_soon && product.is_trending && (
              <span className="bg-amber-500 text-white text-[10px] tracking-widest uppercase px-3 py-1 font-medium">
                Tendance 🔥
              </span>
            )}
          </div>

          {/* Discount badge — big & flashy top-right */}
          {discountPct && !product.is_coming_soon && (
            <div className="absolute top-2 right-2">
              <span className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-50" />
                <span className="relative bg-red-500 text-white font-black text-base px-3 py-1 rounded-full shadow-lg leading-none">
                  -{discountPct}%
                </span>
              </span>
            </div>
          )}

          {/* Coming soon overlay */}
          {product.is_coming_soon && (
            <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-6">
              <span className="text-white text-xs tracking-widest uppercase">
                Bient&ocirc;t disponible
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-neutral-900 text-sm tracking-wide group-hover:text-neutral-500 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-neutral-900 text-sm font-medium">{product.price} TND</p>
            {product.compare_price && product.compare_price > product.price && (
              <p className="text-neutral-400 text-sm line-through">{product.compare_price} TND</p>
            )}
          </div>
        </div>
      </Link>

      {/* Color circles — outside Link so clicking doesn't navigate */}
      {colors.length > 0 && (
        <div className="flex gap-2 pt-2 flex-wrap">
          {colors.slice(0, 6).map((hex) => (
            <button
              key={hex}
              onMouseEnter={() => setHoveredColor(hex)}
              onMouseLeave={() => setHoveredColor(null)}
              onClick={(e) => {
                e.preventDefault();
                setHoveredColor((prev) => (prev === hex ? null : hex));
              }}
              title={hex}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-125 ${
                hoveredColor === hex
                  ? "border-neutral-900 scale-125 shadow-md"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
          {colors.length > 6 && (
            <span className="text-[10px] text-neutral-400 self-center">+{colors.length - 6}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
