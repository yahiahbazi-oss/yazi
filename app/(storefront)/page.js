"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGender, setActiveGender] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  const hasNew = useMemo(() => products.some((p) => p.is_new), [products]);
  const hasSales = useMemo(
    () => products.some((p) => p.compare_price && p.compare_price > p.price),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeGender && p.gender !== activeGender && p.gender !== "Unisexe")
        return false;
      if (activeCategory === "nouveaute") return p.is_new;
      if (activeCategory === "soldes")
        return p.compare_price && p.compare_price > p.price;
      if (activeCategory && p.category !== activeCategory) return false;
      return true;
    });
  }, [products, activeGender, activeCategory]);

  const genderBtns = [
    { key: null, label: "Tous" },
    { key: "Homme", label: "Homme" },
    { key: "Femme", label: "Femme" },
  ];

  const categoryBtns = [
    { key: null, label: "Tout", special: null },
    ...(hasNew
      ? [{ key: "nouveaute", label: "Nouveauté ✨", special: "new" }]
      : []),
    ...(hasSales
      ? [{ key: "soldes", label: "Soldes 🔥", special: "sales" }]
      : []),
    ...categories.map((c) => ({ key: c, label: c, special: null })),
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://res.cloudinary.com/dxoje33mm/video/upload/v1759755548/wc_s1ovwb.webm"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/70 text-xs sm:text-sm tracking-[0.4em] uppercase mb-6"
          >
            Collection Premium
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-6xl sm:text-8xl lg:text-9xl text-white tracking-[0.15em] uppercase mb-8"
          >
            YAZI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/70 text-sm sm:text-base max-w-lg mx-auto mb-10 leading-relaxed"
          >
            Élégance intemporelle conçue pour l&apos;individu moderne.
            Découvrez des vêtements qui parlent sans mots.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-neutral-900 px-8 py-3.5 text-sm tracking-widest uppercase font-medium transition-colors rounded-sm"
            >
              Acheter Maintenant
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-neutral-400 text-xs tracking-[0.4em] uppercase mb-3">
            Découvrez
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-wide text-neutral-900">
            La Collection
          </h2>
        </motion.div>

        {/* Gender filter */}
        <div className="flex justify-center gap-2 mb-5 flex-wrap">
          {genderBtns.map((btn) => (
            <button
              key={String(btn.key)}
              onClick={() => setActiveGender(btn.key)}
              className={`px-7 py-2.5 text-xs tracking-widest uppercase font-medium transition-all rounded-sm ${
                activeGender === btn.key
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categoryBtns.map((btn) => (
            <button
              key={String(btn.key)}
              onClick={() => setActiveCategory(btn.key)}
              className={`px-4 py-1.5 text-xs tracking-widest uppercase font-medium transition-all rounded-full ${
                activeCategory === btn.key
                  ? btn.special === "sales"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-neutral-900 text-white"
                  : btn.special === "sales"
                  ? "border border-red-400 text-red-500 hover:bg-red-50"
                  : btn.special === "new"
                  ? "border border-neutral-600 text-neutral-700 hover:bg-neutral-100"
                  : "border border-neutral-200 text-neutral-500 hover:border-neutral-500 hover:text-neutral-800"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-100 rounded-sm" />
                <div className="mt-4 h-4 bg-neutral-100 rounded w-3/4" />
                <div className="mt-2 h-3 bg-neutral-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-lg">Aucun produit dans cette catégorie</p>
          </div>
        )}
      </section>
    </div>
  );
}
