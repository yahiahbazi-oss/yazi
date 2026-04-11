"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    async function fetchProducts() {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (gender !== "all") {
        query = query.or(`gender.eq.${gender},gender.eq.unisex`);
      }
      if (category !== "all") {
        query = query.eq("category_id", category);
      }

      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [gender, category]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(data || []);
    }
    fetchCategories();
  }, []);

  return (
    <div className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <p className="text-neutral-400 text-xs tracking-[0.4em] uppercase mb-3">Explorer</p>
        <h1 className="font-serif text-4xl sm:text-5xl tracking-wide text-neutral-900">Notre Collection</h1>
      </motion.div>

      {/* Gender Filter */}
      <div className="flex justify-center gap-3 mb-6">
        {[
          { value: "all", label: "Tout" },
          { value: "men", label: "Homme" },
          { value: "women", label: "Femme" },
        ].map((g) => (
          <button
            key={g.value}
            onClick={() => setGender(g.value)}
            className={`text-xs tracking-widest uppercase px-5 py-2.5 border rounded-full transition-colors ${
              gender === g.value
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          <button
            onClick={() => setCategory("all")}
            className={`text-xs tracking-widest uppercase px-4 py-2 border rounded-full transition-colors ${
              category === "all"
                ? "border-neutral-900 text-neutral-900 font-medium"
                : "border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`text-xs tracking-widest uppercase px-4 py-2 border rounded-full transition-colors ${
                category === cat.id
                  ? "border-neutral-900 text-neutral-900 font-medium"
                  : "border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-neutral-100 rounded-sm" />
              <div className="mt-3 h-4 bg-neutral-100 rounded w-3/4" />
              <div className="mt-2 h-3 bg-neutral-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-neutral-400">
          <p>Aucun produit trouvé</p>
        </div>
      )}
    </div>
  );
}
