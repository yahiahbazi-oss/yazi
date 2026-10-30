"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";

function productHref(product) {
  const nameSlug = product.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `/products/${nameSlug}-${product.id.split("-")[0]}`;
}

function HangerSvg() {
  return (
    <svg width="62" height="44" viewBox="0 0 62 44" fill="none" aria-hidden="true">
      {/* Hook over the rod */}
      <path
        d="M31 14 L31 6 C31 1.5 36 0 39.5 1 C44 2.5 45 9 41 12"
        stroke="#b0aba3"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left shoulder */}
      <line x1="31" y1="14" x2="3" y2="42" stroke="#c4bfb8" strokeWidth="2" strokeLinecap="round" />
      {/* Right shoulder */}
      <line x1="31" y1="14" x2="59" y2="42" stroke="#c4bfb8" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom bar */}
      <line x1="3" y1="42" x2="59" y2="42" stroke="#c4bfb8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SkeletonHanger() {
  return (
    <div className="flex flex-col items-center flex-shrink-0 animate-pulse">
      <div className="w-px h-6 bg-neutral-200" />
      <div className="w-[62px] h-[44px] opacity-30">
        <HangerSvg />
      </div>
      <div className="w-24 h-32 sm:w-28 sm:h-36 bg-neutral-200 rounded-2xl -mt-1" />
      <div className="mt-5 space-y-1.5 w-[110px]">
        <div className="h-2.5 bg-neutral-200 rounded-full w-full" />
        <div className="h-2.5 bg-neutral-200 rounded-full w-3/4 mx-auto" />
        <div className="h-2 bg-neutral-100 rounded-full w-1/2 mx-auto" />
      </div>
    </div>
  );
}

function HangingItem({ product, index, onClick }) {
  const [hovered, setHovered] = useState(false);

  const image =
    product.images?.[0] ||
    (product.color_variants
      ? Object.values(product.color_variants)[0]?.images?.[0]
      : null);

  const discountPct =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.45), type: "spring", damping: 16, stiffness: 200 }}
      className="flex flex-col items-center cursor-pointer flex-shrink-0 select-none"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Wire from rod */}
      <div className="w-px h-6 bg-neutral-300/80" />

      {/* Hanger shape */}
      <HangerSvg />

      {/* Clothing image with 3D rotation */}
      <motion.div
        animate={{ rotateY: hovered ? 0 : -22, scale: hovered ? 1.09 : 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 180 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative -mt-1"
      >
        {/* Discount badge */}
        {discountPct && (
          <span className="absolute -top-1 -right-1 z-10 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow leading-none">
            -{discountPct}%
          </span>
        )}
        {product.is_new && !discountPct && (
          <span className="absolute -top-1 -right-1 z-10 bg-neutral-800 text-white text-[8px] font-medium px-1.5 py-0.5 rounded-full shadow leading-none">
            New
          </span>
        )}

        {image ? (
          <img
            src={image}
            alt={product.name}
            draggable={false}
            className="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 object-contain"
            style={{
              filter: hovered
                ? "drop-shadow(0 24px 32px rgba(0,0,0,0.32))"
                : "drop-shadow(0 6px 16px rgba(0,0,0,0.14))",
              transition: "filter 0.4s ease",
            }}
          />
        ) : (
          <div className="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 bg-neutral-200 rounded-2xl flex items-center justify-center">
            <span className="text-neutral-400 text-[9px]">No image</span>
          </div>
        )}

        {/* Floor shadow */}
        <motion.div
          animate={{ scaleX: hovered ? 1.3 : 0.8, opacity: hovered ? 0.2 : 0.1 }}
          transition={{ duration: 0.4 }}
          className="absolute -bottom-2 left-1/2 origin-center h-2 w-16 -translate-x-1/2 bg-black rounded-full blur-md"
        />
      </motion.div>

      {/* Name + price */}
      <div className="mt-5 text-center w-[110px] sm:w-[124px]">
        <p className="text-neutral-700 text-[10px] sm:text-[11px] font-medium leading-snug line-clamp-2">
          {product.name}
        </p>
        <p className="text-neutral-400 text-[9px] sm:text-[10px] mt-1">{product.price} TND</p>
      </div>
    </motion.div>
  );
}

function SpotlightModal({ product, onClose, onOrder }) {
  const colorEntries = product.color_variants
    ? Object.entries(product.color_variants)
    : [];
  const [selectedColor, setSelectedColor] = useState(colorEntries[0]?.[0] ?? null);

  const image =
    (selectedColor && product.color_variants?.[selectedColor]?.images?.[0]) ||
    product.images?.[0] ||
    null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,13,11,0.72)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.84, opacity: 0, y: 32 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.84, opacity: 0, y: 32 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="relative w-full max-w-[300px] sm:max-w-[340px] rounded-[28px] overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(158deg, #f7f3ee 0%, #ede8e1 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top controls row */}
        <div className="relative px-5 pt-5 pb-0 flex items-start justify-between min-h-[52px]">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-white transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Color selector — vertical stack, top right */}
          {colorEntries.length > 0 && (
            <div className="flex flex-col gap-2 items-end">
              {colorEntries.slice(0, 6).map(([hex, variant]) => (
                <motion.button
                  key={hex}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSelectedColor(hex)}
                  title={variant.name}
                  className={`w-7 h-7 rounded-full shadow transition-all duration-200 ${
                    selectedColor === hex
                      ? "ring-2 ring-offset-2 ring-neutral-800 scale-110"
                      : "ring-1 ring-neutral-200/80 hover:scale-110"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product image — reacts to color change */}
        <div className="flex items-end justify-center px-8 pt-2" style={{ minHeight: 210 }}>
          <AnimatePresence mode="wait">
            {image ? (
              <motion.img
                key={image}
                initial={{ opacity: 0, scale: 0.88, rotateY: -18 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.22 }}
                src={image}
                alt={product.name}
                className="h-[190px] sm:h-[220px] w-auto object-contain"
                style={{ filter: "drop-shadow(0 32px 48px rgba(0,0,0,0.24))" }}
              />
            ) : (
              <div className="h-[190px] w-[150px] bg-neutral-200/70 rounded-2xl" />
            )}
          </AnimatePresence>
        </div>

        {/* Product details */}
        <div className="px-5 pt-5 pb-5">
          {product.category && (
            <p className="text-neutral-400 text-[9px] tracking-[0.4em] uppercase text-center mb-1">
              {product.category}
            </p>
          )}
          <h2 className="font-serif text-[1.45rem] leading-tight text-neutral-900 text-center mb-1">
            {product.name}
          </h2>
          {selectedColor && product.color_variants?.[selectedColor] && (
            <p className="text-neutral-400 text-[11px] text-center">
              {product.color_variants[selectedColor].name}
            </p>
          )}
          <p className="text-neutral-900 text-xl font-bold text-center mt-2 mb-5">
            {product.price} TND
          </p>

          <button
            onClick={onOrder}
            className="w-full bg-neutral-900 hover:bg-neutral-800 active:scale-[0.97] text-white py-4 rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Commander
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VirtualRailSection({ products, loading = false }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [products]);

  const hasGenders = useMemo(
    () => products.some((p) => p.gender === "men" || p.gender === "women"),
    [products]
  );

  const tabs = useMemo(() => [
    { key: null, label: "Tout", isGender: false },
    ...(hasGenders
      ? [
          { key: "men", label: "Homme", isGender: true },
          { key: "women", label: "Femme", isGender: true },
        ]
      : []),
    ...categories.map((c) => ({ key: c, label: c, isGender: false })),
  ], [categories, hasGenders]);

  const railProducts = useMemo(() => {
    const tab = tabs.find((t) => t.key === activeCategory);
    let filtered = products.filter((p) => p.is_active !== false);
    if (tab?.isGender) {
      filtered = filtered.filter((p) => p.gender === activeCategory || p.gender === "unisex");
    } else if (activeCategory) {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    return filtered.slice(0, 14);
  }, [products, activeCategory, tabs]);

  return (
    <>
      <section
        className="relative flex flex-col overflow-hidden"
        style={{
          minHeight: "100svh",
          background: "linear-gradient(180deg, #eceae5 0%, #f4f1ec 50%, #e8e4de 100%)",
        }}
      >
        {/* Ceiling shade */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-neutral-400/15 to-transparent pointer-events-none" />
        {/* Floor shade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-400/15 to-transparent pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10 text-center pt-14 sm:pt-16 pb-6 px-4 shrink-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-neutral-400 text-[8px] sm:text-[9px] tracking-[0.55em] uppercase mb-2"
          >
            Collection Premium 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-[0.2em] uppercase text-neutral-900"
          >
            YAZI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-neutral-400/80 text-[8px] sm:text-[9px] tracking-[0.4em] uppercase mt-1"
          >
            Virtual Store — touchez pour commander
          </motion.p>
        </div>

        {/* Rail + hanging products */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          {/* The metal rod */}
          <div className="relative shrink-0">
            <div
              style={{
                height: 4,
                background: "linear-gradient(to bottom, #d8d4ce 0%, #7e7a74 50%, #d4d0ca 100%)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.28)",
              }}
            />
            {/* Rod end caps */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-5 rounded-l-sm"
              style={{ background: "linear-gradient(to right, #666, #999)" }} />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-5 rounded-r-sm"
              style={{ background: "linear-gradient(to left, #666, #999)" }} />
          </div>

          {/* Horizontally scrollable items */}
          <div className="overflow-x-auto hide-scrollbar flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={String(activeCategory)}
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -48 }}
                transition={{ duration: 0.26, ease: "easeInOut" }}
                className="flex gap-4 sm:gap-6 md:gap-8 px-8 sm:px-16 py-4 items-start"
                style={{
                  width: "max-content",
                  minWidth: "100vw",
                  justifyContent: !loading && railProducts.length < 5 ? "center" : undefined,
                }}
              >
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonHanger key={i} />)
                ) : railProducts.length > 0 ? (
                  railProducts.map((product, i) => (
                    <HangingItem
                      key={product.id}
                      product={product}
                      index={i}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))
                ) : (
                  <div className="min-w-[100vw] flex items-center justify-center py-16 text-neutral-400 text-sm">
                    Aucun produit dans cette catégorie
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle floor line */}
        <div className="absolute inset-x-0 bottom-[72px] h-px bg-neutral-300/50 z-0" />

        {/* Category tabs */}
        <div className="relative z-10 shrink-0 py-3.5 sm:py-4 px-4 border-t border-neutral-300/40 bg-white/30 backdrop-blur-sm">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5 justify-start sm:justify-center flex-nowrap">
            {tabs.map((tab) => (
              <motion.button
                key={String(tab.key)}
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveCategory(tab.key)}
                className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-200 ${
                  activeCategory === tab.key
                    ? "bg-neutral-900 text-white shadow-md"
                    : "bg-white/75 border border-neutral-200 text-neutral-600 hover:border-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlight modal */}
      <AnimatePresence>
        {selectedProduct && (
          <SpotlightModal
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOrder={() => router.push(productHref(selectedProduct))}
          />
        )}
      </AnimatePresence>
    </>
  );
}
