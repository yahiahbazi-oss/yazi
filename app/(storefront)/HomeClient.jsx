"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { useLocation } from "@/lib/location-context";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGender, setActiveGender] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const { country, loading: locationLoading } = useLocation();

  useEffect(() => {
    async function fetchAll() {
      if (locationLoading) return;
      const res = await fetch(`/api/products?country=ALL`);
      const data = await res.json();
      const allProducts = (data.products || []).filter(p => {
        if (!p.is_active) return false;
        if (p.target_countries && Array.isArray(p.target_countries)) {
          return p.target_countries.includes(country);
        }
        return true;
      });
      setProducts(allProducts);
      setLoading(false);
    }
    fetchAll();
  }, [country, locationLoading]);

  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [products]);

  const hasNew = useMemo(() => products.some((p) => p.is_new), [products]);
  const hasSales = useMemo(() => products.some((p) => p.compare_price && p.compare_price > p.price), [products]);
  const hasGrandTailles = useMemo(
    () => products.some((p) => p.big_size_price && ["3XL", "4XL", "5XL"].some((s) => (p.stock?.[s] ?? 0) > 0)),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeGender && p.gender !== activeGender && p.gender !== "unisex") return false;
      if (activeCategory === "nouveaute") return p.is_new;
      if (activeCategory === "soldes") return p.compare_price && p.compare_price > p.price;
      if (activeCategory === "grandes-tailles")
        return p.big_size_price && ["3XL", "4XL", "5XL"].some((s) => (p.stock?.[s] ?? 0) > 0);
      if (activeCategory && p.category !== activeCategory) return false;
      return true;
    });
  }, [products, activeGender, activeCategory]);

  // Unified tab list — gender tabs + category tabs in one scrollable row
  const allTabs = [
    { key: null, label: "Tout", group: "gender" },
    { key: "men", label: "Homme", group: "gender" },
    { key: "women", label: "Femme", group: "gender" },
    ...(hasNew ? [{ key: "nouveaute", label: "Nouveauté", group: "cat", special: "new" }] : []),
    ...(hasSales ? [{ key: "soldes", label: "Soldes", group: "cat", special: "sales" }] : []),
    ...(hasGrandTailles ? [{ key: "grandes-tailles", label: "Grandes Tailles", group: "cat" }] : []),
    ...categories.map((c) => ({ key: c, label: c, group: "cat" })),
  ];

  function handleTab(tab) {
    if (tab.group === "gender") {
      setActiveGender(tab.key);
      setActiveCategory(null);
    } else {
      setActiveCategory(tab.key);
      setActiveGender(null);
    }
  }

  function isTabActive(tab) {
    if (tab.group === "gender") return activeGender === tab.key && !activeCategory;
    return activeCategory === tab.key && !activeGender;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Page heading + filter tabs — fixed under navbar */}
      <div className="pt-20 sm:pt-24 border-b border-neutral-100 bg-white">
        {/* Title row */}
        <div className="flex items-baseline justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-3">
          <h1 className="font-serif text-2xl sm:text-3xl tracking-wide text-neutral-900">
            La Collection
          </h1>
          {!loading && (
            <p className="text-neutral-400 text-[11px] tracking-wide">
              {filteredProducts.length} article{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Underline-style filter tabs — horizontally scrollable */}
        <div className="sticky top-16 sm:top-20 z-30 bg-white border-b border-neutral-100 overflow-x-auto hide-scrollbar">
          <div className="flex min-w-max px-4 sm:px-6">
            {allTabs.map((tab) => {
              const active = isTabActive(tab);
              return (
                <button
                  key={String(tab.key) + tab.group}
                  onClick={() => handleTab(tab)}
                  className={`px-4 py-3 sm:py-3.5 text-[11px] tracking-[0.2em] uppercase whitespace-nowrap border-b-2 transition-all duration-150 ${
                    active
                      ? "border-neutral-900 text-neutral-900 font-semibold"
                      : tab.special === "sales"
                      ? "border-transparent text-red-400 hover:text-red-600 hover:border-red-300"
                      : "border-transparent text-neutral-400 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product grid — full-bleed 2-col with 1px dividers, like stillhere.nyc */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-neutral-200">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white animate-pulse">
              <div className="aspect-[3/4] bg-neutral-100" />
              <div className="px-3 pt-3 pb-5">
                <div className="h-3 bg-neutral-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-neutral-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-neutral-200">
          {filteredProducts.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              overridePrice={activeCategory === "grandes-tailles" && product.big_size_price ? product.big_size_price : null}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-32">
          <p className="text-neutral-400 text-sm tracking-wide">Aucun article dans cette catégorie</p>
        </div>
      )}

      {/* Testimonials */}
      <section className="bg-neutral-950 py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase mb-3">Avis clients</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-wide">
              Ce qu&apos;ils disent de nous
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Amira B.", rating: 5, text: "Qualité exceptionnelle, les vêtements sont exactement comme sur les photos. Livraison en 2 jours !" },
              { name: "Mohamed K.", rating: 5, text: "Le paiement à la livraison m'a vraiment rassuré. Produit impeccable, coupe parfaite. Je recommande vivement." },
              { name: "Yasmine T.", rating: 5, text: "J'ai commandé 3 fois et je suis toujours ravie. Tissu premium, service au top. YAZI c'est ma marque !" },
            ].map((r, idx) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.07] transition-colors"
              >
                <span className="absolute top-4 right-5 text-4xl text-white/10 font-serif leading-none select-none" aria-hidden="true">&quot;</span>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(r.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/75 text-sm leading-relaxed mb-6">{r.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs font-semibold">
                    {r.name[0]}
                  </div>
                  <p className="text-white/40 text-xs tracking-widest uppercase">{r.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
