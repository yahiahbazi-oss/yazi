"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yazi-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("yazi-cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, size, quantity, color = null, colorName = null) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.size === size && item.color === color
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `${product.id}-${size}-${color || "none"}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          deliveryPrice: product.delivery_price ?? null,
          size,
          quantity,
          color,
          colorName,
          image: product.images?.[0] || null,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalDelivery = items.reduce(
    (max, item) => Math.max(max, item.deliveryPrice || 0),
    0
  );

  const grandTotal = totalPrice + totalDelivery;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        totalDelivery,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
