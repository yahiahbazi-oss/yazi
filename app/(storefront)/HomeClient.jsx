"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Truck, Shield, RefreshCw } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState("all");

  useEffect(() => {
    async function fetchAll() {
      const [{ data: productsData }, collectionsRes] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        fetch("/api/collections"),
      ]);
      setProducts(productsData || []);
      const colData = await collectionsRes.json();
      setCollections(colData.collections || []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const newProducts = useMemo(() => products.filter(p => p.is_new).slice(0, 8), [products]);
  const saleProducts = useMemo(() => 
    products.filter(p => p.compare_price && p.compare_price > p.price).slice(0, 8), 
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (selectedGender === "all") return products.slice(0, 12);
    return products.filter(p => p.gender === selectedGender || p.gender === "unisex").slice(0, 12);
  }, [products, selectedGender]);

  return (
    <div className="bg-gradient-to-b from-white to-neutral-50">
      {/* Modern Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm">Collection Premium 2026</span>
            </motion.div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Style qui
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                inspire
              </span>
            </h1>
            
            <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
              Découvrez des vêtements exceptionnels qui reflètent votre personnalité. Qualité premium, livraison rapide partout en Tunisie.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="#products"
                className="group flex items-center gap-2 bg-white text-neutral-900 hover:bg-amber-400 hover:text-white px-8 py-4 rounded-full font-semibold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Acheter maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition-all"
              >
                Voir tout
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform"
                  >
                    <img
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges - More Modern */}
      <section className="bg-white border-y border-neutral-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Livraison rapide", desc: "2-3 jours en Tunisie", color: "text-blue-600" },
              { icon: Shield, title: "Paiement sécurisé", desc: "À la livraison", color: "text-green-600" },
              { icon: RefreshCw, title: "Échange gratuit", desc: "Sous 7 jours", color: "text-purple-600" },
              { icon: Star, title: "Qualité premium", desc: "100% authentique", color: "text-amber-600" },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <div className={`p-3 rounded-full bg-neutral-100 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections Showcase */}
      {collections.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
                Collections exclusives
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Explorez nos collections soigneusement sélectionnées
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections.map((col, i) => (
                <motion.div
                  key={col.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/collections/${col.slug}`}
                    className="group block relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                    style={{ backgroundColor: col.color }}
                  >
                    {col.image_url && (
                      <img
                        src={col.image_url}
                        alt={col.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                      <span className="text-5xl mb-3">{col.emoji}</span>
                      <h3 className="font-bold text-lg text-center">{col.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section id="products" className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
                  ✨ Nouveautés
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
                  Nouveaux arrivages
                </h2>
              </div>
              <Link
                href="/products?filter=new"
                className="hidden sm:flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                Voir tout
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sales Section */}
      {saleProducts.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
                  🔥 Promotions
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
                  Soldes exceptionnels
                </h2>
              </div>
              <Link
                href="/products?filter=sales"
                className="hidden sm:flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                Voir tout
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {saleProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop by Gender */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Acheter par catégorie
            </h2>
            <div className="flex justify-center gap-3 mt-6">
              {[
                { key: "all", label: "Tout" },
                { key: "women", label: "Femme" },
                { key: "men", label: "Homme" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setSelectedGender(btn.key)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedGender === btn.key
                      ? "bg-neutral-900 text-white shadow-lg scale-105"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-neutral-200 rounded-xl" />
                  <div className="mt-4 h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="mt-2 h-3 bg-neutral-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials - Modern Design */}
      <section className="py-20 px-4 bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white text-sm">4.9/5 · Plus de 1000 avis</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Adoré par nos clients
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                name: "Amira Ben Ali", 
                location: "Tunis",
                rating: 5, 
                text: "Qualité incroyable ! Les tissus sont doux et la coupe est parfaite. Livraison ultra rapide en 2 jours. YAZI est devenue ma marque préférée !" 
              },
              { 
                name: "Mohamed Khalil", 
                location: "Sousse",
                rating: 5, 
                text: "Service impeccable. Le paiement à la livraison est très pratique et rassurant. Les produits correspondent exactement aux photos. Je recommande à 100% !" 
              },
              { 
                name: "Yasmine Trabelsi", 
                location: "Sfax",
                rating: 5, 
                text: "C'est ma 5ème commande et je suis toujours aussi satisfaite ! Les vêtements sont élégants, confortables et durables. Bravo YAZI !" 
              },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-5">
                  &quot;{review.text}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{review.name}</p>
                    <p className="text-white/50 text-xs">{review.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Prêt à élever votre style ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez des milliers de clients satisfaits en Tunisie
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-neutral-900 hover:bg-neutral-100 px-10 py-5 rounded-full text-lg font-bold transition-all shadow-2xl hover:scale-105"
            >
              Découvrir la collection
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
