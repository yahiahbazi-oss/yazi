"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ProductCard({ product, index = 0 }) {
  // Get first image from color_variants or legacy images
  const getImage = () => {
    const cv = product.color_variants;
    if (cv && typeof cv === "object") {
      const first = Object.values(cv)[0];
      if (first?.images?.[0]) return first.images[0];
    }
    if (product.images?.[0]) return product.images[0];
    return null;
  };

  // Get available colors
  const colors = product.color_variants ? Object.keys(product.color_variants) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/products/${product.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm">
          {getImage() ? (
            <img
              src={getImage()}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-sm">Pas d&apos;image</div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
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
                Tendance
              </span>
            )}
            {!product.is_coming_soon && product.compare_price && product.compare_price > product.price && (
              <span className="bg-red-500 text-white text-[10px] tracking-widest uppercase px-3 py-1 font-medium">
                -{Math.round((1 - product.price / product.compare_price) * 100)}%
              </span>
            )}
          </div>

          {/* Coming soon overlay */}
          {product.is_coming_soon && (
            <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-6">
              <span className="text-white text-xs tracking-widest uppercase">Bient&ocirc;t disponible</span>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-neutral-900 text-sm tracking-wide group-hover:text-neutral-500 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-neutral-900 text-sm">{product.price} TND</p>
            {product.compare_price && product.compare_price > product.price && (
              <p className="text-neutral-400 text-sm line-through">{product.compare_price} TND</p>
            )}
          </div>
          {colors.length > 0 && (
            <div className="flex gap-1 pt-1">
              {colors.slice(0, 5).map((hex) => (
                <div key={hex} className="w-3 h-3 rounded-full border border-neutral-200" style={{ backgroundColor: hex }} />
              ))}
              {colors.length > 5 && <span className="text-[10px] text-neutral-400 ml-1">+{colors.length - 5}</span>}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
