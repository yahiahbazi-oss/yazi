"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart-context";
import { trackViewContent, trackAddToCart } from "@/lib/pixel-events";
import ProductCard from "@/components/ProductCard";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const BIG_SIZES = ["3XL", "4XL", "5XL"];
const EU_SIZES = ["36", "38", "40", "42", "44", "46", "48"];
const isBigSize = (s) => BIG_SIZES.includes(s);

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", phone2: "", address: "", delegation: "", governorate: "" });
  const [recommendations, setRecommendations] = useState([]);
  const formRef = useRef(null);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      setProduct(data);
      setLoading(false);
      if (data) {
        trackViewContent(data);
        const cv = data.color_variants;
        if (cv && Object.keys(cv).length > 0) {
          setSelectedColor(Object.keys(cv)[0]);
        }
        if (data.recommended_product_ids?.length > 0) {
          const { data: recoData } = await supabase
            .from("products")
            .select("*")
            .in("id", data.recommended_product_ids)
            .eq("is_active", true);
          setRecommendations(recoData || []);
        }
      }
    }
    fetchProduct();
  }, [id]);

  const getImages = () => {
    if (selectedColor && product?.color_variants?.[selectedColor]?.images?.length > 0) {
      return product.color_variants[selectedColor].images;
    }
    if (product?.images?.length > 0) return product.images;
    return [];
  };

  const images = product ? getImages() : [];
  const colorEntries = product?.color_variants ? Object.entries(product.color_variants) : [];

  const handleColorChange = (hex) => {
    setSelectedColor(hex);
    setSelectedImage(0);
  };

  const displayPrice = selectedSize && isBigSize(selectedSize) && product?.big_size_price
    ? product.big_size_price
    : product?.price;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Veuillez sélectionner une taille");
      return;
    }
    const stockForSize = product.stock?.[selectedSize] ?? 0;
    if (stockForSize < quantity) {
      toast.error(`Seulement ${stockForSize} articles disponibles en taille ${selectedSize}`);
      return;
    }

    const colorInfo = selectedColor && product.color_variants?.[selectedColor];
    const cartImage = images[0] || product.images?.[0] || null;
    const effectivePrice = isBigSize(selectedSize) && product.big_size_price
      ? product.big_size_price
      : product.price;

    addItem(
      { ...product, price: effectivePrice, images: [cartImage] },
      selectedSize,
      quantity,
      selectedColor,
      colorInfo?.name
    );
    trackAddToCart(product, quantity);
    toast.success("Ajouté au panier");
  };

  const handleDirectOrder = () => {
    if (!selectedSize) { toast.error("Veuillez sélectionner une taille"); return; }
    if (!orderForm.name.trim()) { toast.error("Veuillez entrer votre nom"); return; }
    if (!orderForm.phone.trim()) { toast.error("Veuillez entrer votre numéro de téléphone"); return; }
    if (!orderForm.governorate) { toast.error("Veuillez choisir un gouvernorat"); return; }
    const effectivePrice = isBigSize(selectedSize) && product.big_size_price ? product.big_size_price : product.price;
    const total = (effectivePrice * quantity).toFixed(2);
    const colorInfo = selectedColor && product.color_variants?.[selectedColor];
    const msg = [
      "Bonjour, je voudrais commander :",
      `*${product.name}*`,
      `Taille : ${selectedSize}`,
      colorInfo ? `Couleur : ${colorInfo.name}` : null,
      `Quantité : ${quantity}`,
      `Prix unitaire : ${effectivePrice} TND`,
      `*Total : ${total} TND*`,
      "",
      "📦 Informations de livraison :",
      `Nom : ${orderForm.name}`,
      `Tél : ${orderForm.phone}`,
      orderForm.phone2 ? `Tél 2 : ${orderForm.phone2}` : null,
      orderForm.address ? `Adresse : ${orderForm.address}` : null,
      orderForm.delegation ? `Délégation : ${orderForm.delegation}` : null,
      `Gouvernorat : ${orderForm.governorate}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/21693733766?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center text-neutral-400">
        Produit introuvable
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col-reverse sm:flex-row gap-3"
        >
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px]">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  onMouseEnter={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 w-16 h-20 bg-neutral-100 rounded-sm overflow-hidden border-2 transition-colors ${
                    selectedImage === i
                      ? "border-neutral-900"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 aspect-[3/4] bg-neutral-50 rounded-sm overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                Pas d&apos;image
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            {product.category ? (
              <p className="text-neutral-400 text-xs tracking-[0.3em] uppercase">{product.category}</p>
            ) : <span />}
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
              <span className="text-neutral-400 text-xs ml-1.5">4.8</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.is_coming_soon && (
              <span className="bg-neutral-700 text-white text-[10px] tracking-widest uppercase px-3 py-1">
                Bientôt disponible
              </span>
            )}
            {!product.is_coming_soon && product.is_trending && (
              <span className="bg-amber-500 text-white text-[10px] tracking-widest uppercase px-3 py-1">
                Tendance 🔥
              </span>
            )}
            {!product.is_coming_soon && product.is_new && (
              <span className="bg-neutral-900 text-white text-[10px] tracking-widest uppercase px-3 py-1">
                Nouveau
              </span>
            )}
            {!product.is_coming_soon && product.compare_price && product.compare_price > product.price && (
              <span className="bg-red-500 text-white text-[10px] tracking-widest uppercase px-3 py-1">
                Promo -{Math.round((1 - product.price / product.compare_price) * 100)}%
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide text-neutral-900 mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <p className="text-4xl font-bold text-neutral-900">
              {displayPrice ?? product.price} <span className="text-2xl font-medium">TND</span>
            </p>
            {!selectedSize || !isBigSize(selectedSize) ? (
              product.compare_price && product.compare_price > product.price && (
                <p className="text-neutral-400 text-lg font-serif line-through">
                  {product.compare_price} TND
                </p>
              )
            ) : null}
          </div>

          <p className={`text-xs mb-4 font-medium ${product.delivery_price ? "text-neutral-500" : "text-green-600"}`}>
            {product.delivery_price ? null : "✅ Livraison gratuite"}
          </p>

          {/* FLASHY TOP CTA - placeholder removed, moved under form */}

          {product.description && (
            <div className="mb-8 pb-6 border-b border-neutral-100">
              <p className="text-neutral-400 text-[10px] tracking-widest uppercase mb-2">Description</p>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Color Selector */}
          {colorEntries.length > 0 && (
            <div className="mb-6">
              <p className="text-neutral-500 text-xs tracking-widest uppercase mb-3">
                Couleur — {selectedColor && product.color_variants[selectedColor]?.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {colorEntries.map(([hex, variant]) => (
                  <button
                    key={hex}
                    onClick={() => handleColorChange(hex)}
                    title={variant.name}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === hex
                        ? "border-neutral-900 ring-2 ring-offset-2 ring-neutral-900"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="mb-6">
            <p className="text-neutral-500 text-xs tracking-widest uppercase mb-3">Taille</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const qty = product.stock?.[size] ?? 0;
                const inStock = qty > 0;
                return (
                  <div key={size} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => inStock && setSelectedSize(size)}
                      disabled={!inStock}
                      className={`w-12 h-12 border text-sm transition-all rounded-sm ${
                      selectedSize === size
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : inStock
                        ? "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                        : "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                    }`}
                    >
                      {size}
                    </button>
                    {inStock && qty <= 5 && (
                      <span className="text-[9px] text-amber-500 font-medium">{qty} left</span>
                    )}
                  </div>
                );
              })}
            </div>
            {product.big_size_price && (
              <div className="mt-3">
                <p className="text-neutral-400 text-[10px] tracking-widest uppercase mb-2">Grandes Tailles — {product.big_size_price} TND</p>
                <div className="flex flex-wrap gap-2">
                  {BIG_SIZES.map((size) => {
                    const qty = product.stock?.[size] ?? 0;
                    const inStock = qty > 0;
                    return (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => inStock && setSelectedSize(size)}
                          disabled={!inStock}
                          className={`w-12 h-12 border text-sm transition-all rounded-sm ${
                          selectedSize === size
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : inStock
                            ? "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                            : "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                        }`}
                        >
                          {size}
                        </button>
                        {inStock && qty <= 5 && (
                          <span className="text-[9px] text-amber-500 font-medium">{qty} left</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {EU_SIZES.some((s) => (product.stock?.[s] ?? 0) > 0) && (
              <div className="mt-4">
                <p className="text-neutral-400 text-[10px] tracking-widest uppercase mb-2">Tailles Européennes (EU)</p>
                <div className="flex flex-wrap gap-2">
                  {EU_SIZES.map((size) => {
                    const qty = product.stock?.[size] ?? 0;
                    const inStock = qty > 0;
                    return (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => inStock && setSelectedSize(size)}
                          disabled={!inStock}
                          className={`w-12 h-12 border text-sm transition-all rounded-sm ${
                          selectedSize === size
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : inStock
                            ? "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                            : "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                        }`}
                        >
                          {size}
                        </button>
                        {inStock && qty <= 5 && (
                          <span className="text-[9px] text-amber-500 font-medium">{qty} left</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Inline Order Form */}
          <div ref={formRef} className="border-2 border-dashed border-neutral-200 rounded-xl p-5 bg-neutral-50/60 space-y-3 mb-5 transition-all duration-500">
            <h3 className="text-neutral-900 text-sm font-semibold tracking-wide mb-1">📦 Informations de livraison</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nom et prénom *"
                value={orderForm.name}
                onChange={(e) => setOrderForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-500 bg-white"
              />
              <input
                type="tel"
                placeholder="Téléphone *"
                value={orderForm.phone}
                onChange={(e) => setOrderForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-500 bg-white"
              />
            </div>
            <input
              type="tel"
              placeholder="Téléphone supplémentaire"
              value={orderForm.phone2}
              onChange={(e) => setOrderForm((p) => ({ ...p, phone2: e.target.value }))}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-500 bg-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Adresse"
                value={orderForm.address}
                onChange={(e) => setOrderForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-500 bg-white"
              />
              <input
                type="text"
                placeholder="Délégation"
                value={orderForm.delegation}
                onChange={(e) => setOrderForm((p) => ({ ...p, delegation: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-500 bg-white"
              />
            </div>
            <select
              value={orderForm.governorate}
              onChange={(e) => setOrderForm((p) => ({ ...p, governorate: e.target.value }))}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-500 bg-white text-neutral-700"
            >
              <option value="">Choisir un gouvernorat *</option>
              {["Ariana","Béja","Ben Arous","Bizerte","Gabès","Gafsa","Jendouba","Kairouan","Kasserine","Kébili","Le Kef","Mahdia","La Manouba","Médenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana","Sousse","Tataouine","Tozeur","Tunis","Zaghouan"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Stock urgency for selected size */}
          {selectedSize && (() => {
            const qty = product.stock?.[selectedSize] ?? 0;
            if (qty > 0 && qty <= 5) {
              return (
                <p className="text-amber-600 text-xs font-medium mb-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                  Plus que {qty} article{qty > 1 ? "s" : ""} en taille {selectedSize} !
                </p>
              );
            }
            return null;
          })()}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-5">
            <p className="text-neutral-500 text-xs tracking-widest uppercase">Quantité</p>
            <div className="inline-flex items-center border border-neutral-200 rounded-sm">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-neutral-400 hover:text-neutral-700 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm text-neutral-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-neutral-400 hover:text-neutral-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {selectedSize && (
              <p className="ml-auto text-sm font-semibold text-neutral-900">
                = {((displayPrice ?? product.price) * quantity).toFixed(2)} TND
              </p>
            )}
          </div>

          {/* FLASHY CTA — under Quantité */}
          {!product.is_coming_soon && (
            <button
              onClick={handleDirectOrder}
              className="w-full mb-4 relative overflow-hidden rounded-xl py-4 text-base font-extrabold tracking-widest uppercase text-white shadow-xl transition-transform active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}
            >
              <span className="absolute inset-0 bg-white/10 animate-pulse rounded-xl" />
              <span className="relative flex items-center justify-center gap-2">
                🛍️ Achetez maintenant
              </span>
            </button>
          )}

          {/* Commander maintenant — primary CTA */}
          {product.is_coming_soon && (
            <div className="w-full bg-neutral-200 text-neutral-400 py-4 text-sm tracking-widest uppercase font-medium text-center rounded-sm cursor-not-allowed mb-3">
              Bientôt disponible
            </div>
          )}

          {/* WhatsApp order */}
          {!product.is_coming_soon && (
            <a
              href={"https://wa.me/21693733766?text=" + encodeURIComponent(
                "Bonjour, je voudrais commander :\n*" + product.name + "*" +
                (selectedSize ? "\nTaille : " + selectedSize : "") +
                (selectedColor && product.color_variants?.[selectedColor] ? "\nCouleur : " + product.color_variants[selectedColor].name : "") +
                "\nQuantité : " + quantity +
                "\nPrix unitaire : " + (displayPrice ?? product.price) + " TND" +
                "\nTotal : " + ((displayPrice ?? product.price) * quantity).toFixed(2) + " TND"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white py-3 text-xs tracking-widest uppercase font-medium transition-all rounded-sm mb-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4 fill-current flex-shrink-0">
                <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.34.63 4.63 1.827 6.64L2.667 29.333l6.907-1.8A13.267 13.267 0 0016.003 29.333c7.36 0 13.33-5.973 13.33-13.333S23.363 2.667 16.003 2.667zm0 24a10.6 10.6 0 01-5.413-1.48l-.387-.233-4.093 1.067 1.093-3.973-.253-.413A10.6 10.6 0 015.337 16c0-5.88 4.787-10.667 10.666-10.667S26.67 10.12 26.67 16 21.882 26.667 16.003 26.667zm5.84-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.947 1.253-.12.213-.24.24-.56.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.147-.147.32-.387.48-.573.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.253-.613-.52-.533-.72-.547-.187-.013-.4-.013-.613-.013-.213 0-.56.08-.853.373-.293.293-1.12 1.093-1.12 2.667 0 1.573 1.147 3.093 1.307 3.307.16.213 2.24 3.413 5.44 4.787.76.333 1.347.533 1.813.68.76.24 1.453.207 2 .127.613-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
              </svg>
              Commander sur WhatsApp
            </a>
          )}

          {/* Add to cart — secondary */}
          {!product.is_coming_soon && (
            <button
              onClick={handleAddToCart}
              className="w-full border border-neutral-300 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 py-3 text-xs tracking-widest uppercase font-medium transition-all flex items-center justify-center gap-2 rounded-sm mb-6"
            >
              <ShoppingBag className="w-4 h-4" />
              Ajouter au Panier
            </button>
          )}

          {/* Trust Badges */}
          <div className="pt-5 border-t border-neutral-100 grid grid-cols-3 gap-3">
            {[
              { icon: "💳", text: "Paiement à la livraison" },
              { icon: "🚚", text: "Livraison rapide" },
              { icon: "🔄", text: "Échange sous 7j" },
            ].map((b) => (
              <div key={b.text} className="flex flex-col items-center gap-1 text-center">
                <span className="text-xl">{b.icon}</span>
                <p className="text-[10px] text-neutral-500 leading-tight">{b.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recommended Products */}
      {recommendations.length > 0 && (
        <div className="mt-16 pt-12 border-t border-neutral-100">
          <p className="text-neutral-400 text-xs tracking-[0.4em] uppercase mb-3 text-center">Vous aimerez aussi</p>
          <h2 className="font-serif text-2xl tracking-wide text-neutral-900 mb-8 text-center">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
