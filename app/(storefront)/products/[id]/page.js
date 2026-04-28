"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart-context";
import { trackViewContent, trackAddToCart } from "@/lib/pixel-events";

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
          {product.category && (
            <p className="text-neutral-400 text-xs tracking-[0.3em] uppercase mb-2">
              {product.category}
            </p>
          )}

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
          <div className="flex items-center gap-3 mb-2">
            <p className="text-neutral-900 text-2xl font-serif">
              {displayPrice ?? product.price} TND
            </p>
            {!selectedSize || !isBigSize(selectedSize) ? (
              product.compare_price && product.compare_price > product.price && (
                <p className="text-neutral-400 text-lg font-serif line-through">
                  {product.compare_price} TND
                </p>
              )
            ) : null}
          </div>



          {product.description && (
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">
              {product.description}
            </p>
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

          {/* Stock urgency for selected size */}
          {selectedSize && (() => {
            const qty = product.stock?.[selectedSize] ?? 0;
            if (qty > 0 && qty <= 5) {
              return (
                <p className="text-amber-600 text-xs font-medium mb-4 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                  Plus que {qty} article{qty > 1 ? "s" : ""} en taille {selectedSize} !
                </p>
              );
            }
            return null;
          })()}

          {/* Quantity */}
          <div className="mb-8">
            <p className="text-neutral-500 text-xs tracking-widest uppercase mb-3">Quantité</p>
            <div className="inline-flex items-center border border-neutral-200 rounded-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm text-neutral-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          {product.is_coming_soon ? (
            <div className="w-full bg-neutral-200 text-neutral-400 py-4 text-sm tracking-widest uppercase font-medium text-center rounded-sm cursor-not-allowed">
              Bient\u00f4t disponible
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-4 text-sm tracking-widest uppercase font-medium transition-colors flex items-center justify-center gap-2 rounded-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Ajouter au Panier
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
