"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart-context";
import { useLocation } from "@/lib/location-context";
import { trackViewContent, trackAddToCart } from "@/lib/pixel-events";
import ProductCard from "@/components/ProductCard";
import { ProductJsonLd } from "@/components/JsonLd";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const BIG_SIZES = ["3XL", "4XL", "5XL"];
const EU_SIZES = ["36", "38", "40", "42", "44", "46", "48"];
const isBigSize = (s) => BIG_SIZES.includes(s);

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { country, countryData } = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", phone2: "", address: "", delegation: "", governorate: "" });
  const [recommendations, setRecommendations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const formRef = useRef(null);
  
  // Get price for user's country
  const getProductPrice = () => {
    if (!product) return 0;
    
    // Try to get price from multi-country pricing
    if (product.prices && product.prices[country]) {
      return product.prices[country].price;
    }
    
    // Fallback to default price (usually TND)
    return product.price || 0;
  };
  
  // Get delivery fee for user's country
  const getDeliveryFee = () => {
    if (!product) return 8;
    
    // Try to get delivery fee from multi-country settings
    if (product.delivery_fees && product.delivery_fees[country]) {
      return product.delivery_fees[country];
    }
    
    // Fallback to product delivery_price or default 8
    return product.delivery_price ?? 8;
  };
  
  // Get currency symbol for display
  const getCurrencySymbol = () => {
    if (product && product.prices && product.prices[country]) {
      const currency = product.prices[country].currency;
      return countryData?.currency === currency ? countryData.symbol : currency;
    }
    return countryData?.symbol || "TND";
  };

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const UUID_PREFIX_RE = /^[0-9a-f]{8}$/i;

  useEffect(() => {
    async function fetchProduct() {
      let data = null;
      if (UUID_RE.test(slug)) {
        // Full UUID
        const res = await supabase.from("products").select("*").eq("id", slug).single();
        data = res.data;
      } else {
        // "name-slug-b0d104cc" — extract UUID prefix from last segment
        const parts = slug.split("-");
        const uuidPrefix = parts[parts.length - 1];
        if (UUID_PREFIX_RE.test(uuidPrefix)) {
          const res = await supabase.from("products").select("*");
          data = (res.data || []).find((p) => p.id.startsWith(uuidPrefix)) || null;
        }
      }
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
  }, [slug]);

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

  const basePrice = getProductPrice();
  const currencySymbol = getCurrencySymbol();

  const displayPrice = selectedSize && isBigSize(selectedSize) && product?.big_size_price
    ? product.big_size_price
    : basePrice;

  const isValidPhone = (p) => {
    const d = p.replace(/[\s\-().]/g, "");
    return /^\d{8}$/.test(d) || /^(\+216|216)\d{8}$/.test(d);
  };

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

  const handleDirectOrder = async () => {
    if (!selectedSize) { toast.error("Veuillez sélectionner une taille"); formRef.current?.scrollIntoView({ behavior: "smooth" }); return; }
    if (!orderForm.name.trim()) { toast.error("Veuillez entrer votre nom"); formRef.current?.scrollIntoView({ behavior: "smooth" }); return; }
    if (!orderForm.phone.trim()) { toast.error("Veuillez entrer votre numéro de téléphone"); return; }
    if (!isValidPhone(orderForm.phone)) { toast.error("Numéro invalide — ex: 12345678 ou +21612345678"); return; }
    if (!orderForm.address.trim()) { toast.error("Veuillez entrer votre adresse"); return; }
    if (!orderForm.governorate) { toast.error("Veuillez choisir un gouvernorat"); return; }

    const effectivePrice = isBigSize(selectedSize) && product.big_size_price ? product.big_size_price : basePrice;
    const subtotal = effectivePrice * quantity;
    
    // Calculate delivery fee using multi-country settings
    const deliveryFee = getDeliveryFee();
    
    const total = subtotal + deliveryFee;
    const colorInfo = selectedColor && product.color_variants?.[selectedColor];

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: orderForm.name.trim(),
          phone: orderForm.phone.trim(),
          phone2: orderForm.phone2?.trim() || null,
          address: orderForm.address.trim() + (orderForm.delegation?.trim() ? `, ${orderForm.delegation.trim()}` : ""),
          governorate: orderForm.governorate,
          note: null,
          items: [{
            product_id: product.id,
            product_name: product.name,
            size: selectedSize,
            color: colorInfo ? colorInfo.name : null,
            color_hex: selectedColor || null,
            quantity,
            price: effectivePrice,
            image: images[0] || product.images?.[0] || null,
          }],
          total_amount: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la commande");
      setOrderPlaced(data.order_number);
      setOrderForm({ name: "", phone: "", phone2: "", address: "", delegation: "", governorate: "" });
      setQuantity(1);
    } catch (err) {
      toast.error(err.message || "Une erreur est survenue, veuillez réessayer");
    } finally {
      setSubmitting(false);
    }
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

  if (orderPlaced) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-10 border border-neutral-100">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl text-neutral-900 mb-2">Commande confirmée !</h2>
          <p className="text-neutral-400 text-sm mb-6">Votre commande a bien été reçue. Notre équipe vous contactera bientôt pour confirmer la livraison.</p>
          <div className="bg-neutral-50 rounded-xl px-6 py-4 mb-8 border border-neutral-100">
            <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Numéro de commande</p>
            <p className="text-2xl font-bold text-neutral-900 tracking-wide">{orderPlaced}</p>
          </div>
          <button
            onClick={() => setOrderPlaced(null)}
            className="w-full border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 py-3 text-xs tracking-widest uppercase font-medium transition-all rounded-sm"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProductJsonLd product={product} selectedSize={selectedSize} selectedColor={selectedColor} />
      <div className="pt-24 sm:pt-28 pb-28 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Image Gallery — sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col-reverse sm:flex-row gap-3"
        >
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] hide-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  onMouseEnter={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 w-16 h-20 bg-neutral-100 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? "border-neutral-900 shadow-md"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 bg-neutral-50 rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="w-full h-auto block"
              />
            ) : (
              <div className="w-full py-20 flex items-center justify-center text-neutral-300">
                Pas d&apos;image
              </div>
            )}

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-700" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-700" />
                </button>
                {/* Dot indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === selectedImage ? "w-5 bg-neutral-800" : "w-1.5 bg-neutral-400/60"
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
        </div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            {product.category ? (
              <p className="text-neutral-400 text-[10px] tracking-[0.35em] uppercase">{product.category}</p>
            ) : <span />}
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((i) => <span key={i} className="text-amber-400 text-xs">★</span>)}
              <span className="text-neutral-400 text-xs ml-1.5">4.8</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.is_coming_soon && (
              <span className="bg-neutral-700/90 backdrop-blur-sm text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full font-medium">
                Bientôt disponible
              </span>
            )}
            {!product.is_coming_soon && product.is_trending && (
              <span className="bg-amber-500/90 text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full font-medium">
                Tendance 🔥
              </span>
            )}
            {!product.is_coming_soon && product.is_new && (
              <span className="bg-neutral-900/90 text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full font-medium">
                Nouveau ✨
              </span>
            )}
            {!product.is_coming_soon && product.compare_price && product.compare_price > basePrice && (
              <span className="bg-red-500 text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full font-medium">
                Promo -{Math.round((1 - basePrice / product.compare_price) * 100)}%
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide text-neutral-900 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price block */}
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <p className="text-4xl font-bold text-neutral-900 tracking-tight">
              {displayPrice} <span className="text-xl font-medium text-neutral-600">{currencySymbol}</span>
            </p>
            {(!selectedSize || !isBigSize(selectedSize)) && product.compare_price && product.compare_price > basePrice && (
              <>
                <p className="text-neutral-400 text-lg line-through">{product.compare_price} {currencySymbol}</p>
                <span className="text-red-500 text-sm font-bold bg-red-50 px-2 py-0.5 rounded-lg">
                  -{Math.round((1 - basePrice / product.compare_price) * 100)}%
                </span>
              </>
            )}
          </div>
          <p className={`text-xs mb-5 font-medium ${getDeliveryFee() === 0 ? "text-green-600" : "text-neutral-400"}`}>
            {getDeliveryFee() === 0 ? "✅ Livraison gratuite" : `+ ${getDeliveryFee()} ${currencySymbol} livraison`}
          </p>

          {product.description && (
            <div className="mb-8 pb-6 border-b border-neutral-100">
              <p className="text-neutral-400 text-[10px] tracking-[0.35em] uppercase mb-2">Description</p>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Color Selector */}
          {colorEntries.length > 0 && (
            <div className="mb-6">
              <p className="text-neutral-500 text-xs tracking-[0.2em] uppercase mb-3">
                Couleur
                {selectedColor && (
                  <span className="ml-2 text-neutral-800 font-semibold normal-case tracking-normal">
                    — {product.color_variants[selectedColor]?.name}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {colorEntries.map(([hex, variant]) => (
                  <button
                    key={hex}
                    onClick={() => handleColorChange(hex)}
                    title={variant.name}
                    className={`w-10 h-10 rounded-full transition-all ${
                      selectedColor === hex
                        ? "ring-2 ring-offset-2 ring-neutral-900 scale-110"
                        : "ring-1 ring-neutral-200 hover:ring-neutral-400 hover:scale-110"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="mb-6">
            <p className="text-neutral-500 text-xs tracking-[0.2em] uppercase mb-3">Taille</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const qty = product.stock?.[size] ?? 0;
                const inStock = qty > 0;
                return (
                  <div key={size} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => inStock && setSelectedSize(size)}
                      disabled={!inStock}
                      className={`w-12 h-12 border text-sm font-medium transition-all rounded-xl ${
                        selectedSize === size
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                          : inStock
                          ? "border-neutral-200 text-neutral-700 hover:border-neutral-700 hover:bg-neutral-50"
                          : "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {size}
                    </button>
                    {inStock && qty <= 5 && (
                      <span className="text-[9px] text-amber-500 font-semibold">{qty} left</span>
                    )}
                  </div>
                );
              })}
            </div>
            {product.big_size_price && (
              <div className="mt-4">
                <p className="text-neutral-400 text-[10px] tracking-[0.2em] uppercase mb-2">Grandes Tailles — {product.big_size_price} TND</p>
                <div className="flex flex-wrap gap-2">
                  {BIG_SIZES.map((size) => {
                    const qty = product.stock?.[size] ?? 0;
                    const inStock = qty > 0;
                    return (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => inStock && setSelectedSize(size)}
                          disabled={!inStock}
                          className={`w-12 h-12 border text-sm font-medium transition-all rounded-xl ${
                            selectedSize === size
                              ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                              : inStock
                              ? "border-neutral-200 text-neutral-700 hover:border-neutral-700 hover:bg-neutral-50"
                              : "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                          }`}
                        >
                          {size}
                        </button>
                        {inStock && qty <= 5 && (
                          <span className="text-[9px] text-amber-500 font-semibold">{qty} left</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {EU_SIZES.some((s) => (product.stock?.[s] ?? 0) > 0) && (
              <div className="mt-4">
                <p className="text-neutral-400 text-[10px] tracking-[0.2em] uppercase mb-2">Tailles Européennes (EU)</p>
                <div className="flex flex-wrap gap-2">
                  {EU_SIZES.map((size) => {
                    const qty = product.stock?.[size] ?? 0;
                    const inStock = qty > 0;
                    return (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => inStock && setSelectedSize(size)}
                          disabled={!inStock}
                          className={`w-12 h-12 border text-sm font-medium transition-all rounded-xl ${
                            selectedSize === size
                              ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                              : inStock
                              ? "border-neutral-200 text-neutral-700 hover:border-neutral-700 hover:bg-neutral-50"
                              : "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                          }`}
                        >
                          {size}
                        </button>
                        {inStock && qty <= 5 && (
                          <span className="text-[9px] text-amber-500 font-semibold">{qty} left</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Inline Order Form */}
          <div ref={formRef} className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50/50 space-y-3 mb-5">
            <h3 className="text-neutral-800 text-sm font-semibold tracking-wide mb-1 flex items-center gap-2">
              <span className="text-base">📦</span> Informations de livraison
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nom et prénom *"
                value={orderForm.name}
                onChange={(e) => setOrderForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/10 bg-white transition-all placeholder:text-neutral-400"
              />
              <input
                type="tel"
                placeholder="Téléphone *"
                value={orderForm.phone}
                onChange={(e) => setOrderForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/10 bg-white transition-all placeholder:text-neutral-400"
              />
            </div>
            <input
              type="tel"
              placeholder="Téléphone supplémentaire (optionnel)"
              value={orderForm.phone2}
              onChange={(e) => setOrderForm((p) => ({ ...p, phone2: e.target.value }))}
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/10 bg-white transition-all placeholder:text-neutral-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Adresse *"
                value={orderForm.address}
                onChange={(e) => setOrderForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/10 bg-white transition-all placeholder:text-neutral-400"
              />
              <input
                type="text"
                placeholder="Délégation"
                value={orderForm.delegation}
                onChange={(e) => setOrderForm((p) => ({ ...p, delegation: e.target.value }))}
                className="w-full border border-neutral-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/10 bg-white transition-all placeholder:text-neutral-400"
              />
            </div>
            <select
              value={orderForm.governorate}
              onChange={(e) => setOrderForm((p) => ({ ...p, governorate: e.target.value }))}
              className="w-full border border-neutral-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-neutral-700 focus:ring-2 focus:ring-neutral-900/10 bg-white transition-all text-neutral-700"
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
                       <p className="text-amber-600 text-xs font-semibold mb-3 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-amber-500 urgency-dot inline-block flex-shrink-0" />
                         Plus que {qty} article{qty > 1 ? "s" : ""} disponible{qty > 1 ? "s" : ""} en taille {selectedSize}
                       </p>
                     );
                   }
                   return null;
                 })()}

                 {/* Quantity */}
                 <div className="flex items-center gap-4 mb-5">
                   <p className="text-neutral-500 text-xs tracking-[0.2em] uppercase">Quantité</p>
                   <div className="inline-flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-2.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors">
                       <Minus className="w-3.5 h-3.5" />
                     </button>
                     <span className="w-10 text-center text-sm font-medium text-neutral-900">{quantity}</span>
                     <button onClick={() => setQuantity(quantity + 1)} className="px-3.5 py-2.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors">
                       <Plus className="w-3.5 h-3.5" />
                     </button>
                   </div>
                   {selectedSize && (
                     <p className="ml-auto text-sm font-bold text-neutral-900">
                       = {((displayPrice ?? product.price) * quantity).toFixed(2)} {currencySymbol}
                     </p>
                   )}
                 </div>

                 {/* Primary CTA */}
                 {!product.is_coming_soon && (
                   <button
                     onClick={handleDirectOrder}
                     disabled={submitting}
                     className="w-full mb-3 relative overflow-hidden rounded-2xl py-4 text-sm font-bold tracking-[0.2em] uppercase text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl"
                     style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #374151 100%)" }}
                   >
                     <span className="relative flex items-center justify-center gap-2">
                       {submitting ? "⏳ Confirmation en cours..." : "🛍️ Commander maintenant"}
                     </span>
                   </button>
                 )}

                 {product.is_coming_soon && (
                   <div className="w-full bg-neutral-100 text-neutral-400 py-4 text-sm tracking-[0.2em] uppercase font-medium text-center rounded-2xl cursor-not-allowed mb-3">
                     Bientôt disponible
                   </div>
                 )}

                 {/* WhatsApp order */}
                 {!product.is_coming_soon && (
                   <a
                     href={"https://wa.me/21693733766?text=" + encodeURIComponent(
                       "Bonjour, je voudrais commander :\n\n" +
                       "*" + product.name + "*" +
                       (selectedSize ? "\nTaille : " + selectedSize : "") +
                       (selectedColor && product.color_variants?.[selectedColor] ? "\nCouleur : " + product.color_variants[selectedColor].name : "") +
                       "\nQuantité : " + quantity +
                       "\nPrix unitaire : " + (displayPrice ?? product.price) + " TND" +
                       "\nTotal : " + ((displayPrice ?? product.price) * quantity).toFixed(2) + " TND" +
                       (images[0] ? "\n\n📷 Image : " + images[0] : "") +
                       (orderForm.name ? "\n\n👤 Nom : " + orderForm.name : "") +
                       (orderForm.phone ? "\n📞 Téléphone : " + orderForm.phone : "") +
                       (orderForm.address ? "\n📍 Adresse : " + orderForm.address + (orderForm.delegation ? ", " + orderForm.delegation : "") : "") +
                       (orderForm.governorate ? "\n🏛️ Gouvernorat : " + orderForm.governorate : "")
                     )}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3.5 text-xs tracking-[0.2em] uppercase font-semibold transition-all rounded-2xl mb-3 shadow-sm"
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
                     className="w-full border border-neutral-200 hover:border-neutral-800 text-neutral-600 hover:text-neutral-900 py-3.5 text-xs tracking-[0.2em] uppercase font-medium transition-all flex items-center justify-center gap-2 rounded-2xl mb-6 hover:bg-neutral-50"
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
                     <div key={b.text} className="flex flex-col items-center gap-1.5 text-center py-3 px-2 rounded-xl bg-neutral-50">
                       <span className="text-xl">{b.icon}</span>
                       <p className="text-[10px] text-neutral-500 leading-tight font-medium">{b.text}</p>
                     </div>
                   ))}
                 </div>
        </motion.div>
      </div>

      {/* Recommended Products */}
      {recommendations.length > 0 && (
        <div className="mt-16 pt-12 border-t border-neutral-100">
          <p className="text-neutral-400 text-[10px] tracking-[0.5em] uppercase mb-3 text-center">Vous aimerez aussi</p>
          <h2 className="font-serif text-2xl tracking-wide text-neutral-900 mb-8 text-center">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Mobile sticky CTA */}
    {!product.is_coming_soon && (
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-neutral-100 px-4 py-3 flex gap-2.5 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.12)]">
        <button
          onClick={handleDirectOrder}
          disabled={submitting}
          className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-3 text-xs tracking-[0.2em] uppercase font-semibold rounded-xl transition-all disabled:opacity-60"
        >
          {submitting ? "⏳..." : "🛍️ Commander"}
        </button>
        <a
          href={"https://wa.me/21693733766"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 bg-[#25D366] rounded-xl text-white flex-shrink-0"
          aria-label="Commander sur WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-current">
            <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.34.63 4.63 1.827 6.64L2.667 29.333l6.907-1.8A13.267 13.267 0 0016.003 29.333c7.36 0 13.33-5.973 13.33-13.333S23.363 2.667 16.003 2.667zm0 24a10.6 10.6 0 01-5.413-1.48l-.387-.233-4.093 1.067 1.093-3.973-.253-.413A10.6 10.6 0 015.337 16c0-5.88 4.787-10.667 10.666-10.667S26.67 10.12 26.67 16 21.882 26.667 16.003 26.667zm5.84-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.947 1.253-.12.213-.24.24-.56.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.147-.147.32-.387.48-.573.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.253-.613-.52-.533-.72-.547-.187-.013-.4-.013-.613-.013-.213 0-.56.08-.853.373-.293.293-1.12 1.093-1.12 2.667 0 1.573 1.147 3.093 1.307 3.307.16.213 2.24 3.413 5.44 4.787.76.333 1.347.533 1.813.68.76.24 1.453.207 2 .127.613-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
          </svg>
        </a>
      </div>
    )}
    </>
  );
}
