"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

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

      {/* Featured Products */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-neutral-400 text-xs tracking-[0.4em] uppercase mb-3">Nouveautés</p>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-wide text-neutral-900">La Collection</h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-100 rounded-sm" />
                <div className="mt-4 h-4 bg-neutral-100 rounded w-3/4" />
                <div className="mt-2 h-3 bg-neutral-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-lg">Pas encore de produits</p>
            <p className="text-sm mt-2">Les produits apparaîtront ici une fois ajoutés depuis le tableau de bord</p>
          </div>
        )}

        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-14"
          >
            <Link href="/products" className="inline-flex items-center gap-2 text-neutral-900 hover:text-neutral-500 text-sm tracking-widest uppercase transition-colors">
              Voir Tous les Produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </section>

      {/* Brand Story */}
      <section className="py-20 sm:py-28 border-t border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-neutral-400 text-xs tracking-[0.4em] uppercase mb-3">Notre Philosophie</p>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-wide text-neutral-900 mb-8">Conçu avec Intention</h2>
            <p className="text-neutral-500 leading-relaxed text-sm sm:text-base">
              Chez YAZI, nous croyons que le luxe ne réside pas dans l&apos;excès — mais dans l&apos;intention.
              Chaque pièce de notre collection est conçue avec une attention méticuleuse aux détails,
              utilisant des matériaux premium qui résistent à l&apos;épreuve du temps.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
