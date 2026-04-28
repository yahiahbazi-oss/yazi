"use client";

import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <h2 className="text-neutral-900 font-serif text-lg tracking-widest uppercase">Panier</h2>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <ShoppingBag className="w-12 h-12 mb-4" />
                  <p className="text-sm tracking-widest uppercase">Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-24 bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-neutral-900 text-sm truncate">{item.name}</h3>
                        <p className="text-neutral-500 text-xs mt-0.5">
                          Taille: {item.size}
                          {item.color && <> &middot; <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor: item.color}}></span>{item.colorName}</span></>}
                        </p>
                        <p className="text-neutral-900 text-sm mt-1 font-medium">{item.price} TND</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-neutral-400 hover:text-neutral-700">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-neutral-900 text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-neutral-400 hover:text-neutral-700">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="ml-auto text-neutral-400 hover:text-red-500 text-xs">Retirer</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-neutral-100 space-y-4">
                <div className="flex justify-between text-neutral-900">
                  <span className="text-sm tracking-widest uppercase">Total</span>
                  <span className="font-serif text-lg">{totalPrice.toFixed(2)} TND</span>
                </div>
                <a
                  href={"https://wa.me/21693733766?text=" + encodeURIComponent(
                    "Bonjour, je voudrais passer ma commande YAZI :\n\n" +
                    items.map((item) =>
                      `• ${item.name}\n  Taille : ${item.size}${item.colorName ? ` | Couleur : ${item.colorName}` : ""}\n  Qté : ${item.quantity} × ${item.price} TND = ${(item.price * item.quantity).toFixed(2)} TND`
                    ).join("\n\n") +
                    `\n\n💰 Total : ${totalPrice.toFixed(2)} TND`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white text-center py-3 text-sm tracking-widest uppercase font-medium transition-all rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4 fill-current flex-shrink-0">
                    <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.34.63 4.63 1.827 6.64L2.667 29.333l6.907-1.8A13.267 13.267 0 0016.003 29.333c7.36 0 13.33-5.973 13.33-13.333S23.363 2.667 16.003 2.667zm0 24a10.6 10.6 0 01-5.413-1.48l-.387-.233-4.093 1.067 1.093-3.973-.253-.413A10.6 10.6 0 015.337 16c0-5.88 4.787-10.667 10.666-10.667S26.67 10.12 26.67 16 21.882 26.667 16.003 26.667zm5.84-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.947 1.253-.12.213-.24.24-.56.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.147-.147.32-.387.48-.573.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.253-.613-.52-.533-.72-.547-.187-.013-.4-.013-.613-.013-.213 0-.56.08-.853.373-.293.293-1.12 1.093-1.12 2.667 0 1.573 1.147 3.093 1.307 3.307.16.213 2.24 3.413 5.44 4.787.76.333 1.347.533 1.813.68.76.24 1.453.207 2 .127.613-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
                  </svg>
                  Commander via WhatsApp
                </a>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-neutral-900 hover:bg-neutral-800 text-white text-center py-3 text-sm tracking-widest uppercase font-medium transition-colors rounded-lg"
                >
                  Commander
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
