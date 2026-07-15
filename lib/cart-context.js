"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(8);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yazi-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Fetch default delivery fee from settings
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    async function fetchDeliveryFee() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const fee = parseFloat(data.settings?.default_delivery_fee) || 8;
        setDefaultDeliveryFee(fee);
      } catch {
        // Keep default of 8 if fetch fails
        setDefaultDeliveryFee(8);
      }
    }
    fetchDeliveryFee();
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
    if (quantity < 1) returdelivery fee from settings
  const totalDelivery = items.length === 0 ? 0 : items.reduce(
    (max, item) => {
      // If item has a specific delivery price (including 0 for free delivery), use it
      if (item.deliveryPrice !== null && item.deliveryPrice !== undefined) {
        return Math.max(max, item.deliveryPrice);
      }
      // Otherwise, use the default delivery fee from settings
      return Math.max(max, defaultDeliveryFee
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate delivery fee: use product-specific delivery price if set,
  // otherwise use default 8 TND
  const DEFAULT_DELIVERY_FEE = 8;
  const totalDelivery = items.length === 0 ? 0 : items.reduce(
    (max, item) => {
      // If item has a specific delivery price (including 0 for free delivery), use it
      if (item.deliveryPrice !== null && item.deliveryPrice !== undefined) {
        return Math.max(max, item.deliveryPrice);
      }
      // Otherwise, use the default delivery fee
      return Math.max(max, DEFAULT_DELIVERY_FEE);
    },
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
