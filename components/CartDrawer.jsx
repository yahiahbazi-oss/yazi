"use client";

import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalDelivery, grandTotal } = useCart();

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
                          {item.color && <> Â· <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor: item.color}}></span>{item.colorName}</span></>}
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
                <div className="flex justify-between text-neutral-600 text-sm">
                  <span>Sous-total</span>
                  <span>{totalPrice} TND</span>
                </div>
                {totalDelivery > 0 && (
                  <div className="flex justify-between text-neutral-600 text-sm">
                    <span>Livraison</span>
                    <span>{totalDelivery} TND</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-900">
                  <span className="text-sm tracking-widest uppercase">Total</span>
                  <span className="font-serif text-lg">{grandTotal} TND</span>
                </div>
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
