"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCart } from "@/lib/cart-context";
import GovernorateSelect from "@/components/GovernorateSelect";
import { trackInitiateCheckout, trackPurchase } from "@/lib/pixel-events";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, totalDelivery, grandTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    phone2: "",
    governorate: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    if (items.length > 0) trackInitiateCheckout(items, grandTotal);
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Veuillez entrer votre nom");
    if (!form.phone.trim())
      return toast.error("Veuillez entrer votre num\u00e9ro de t\u00e9l\u00e9phone");
    const rawDigits = form.phone.trim().replace(/\D/g, "");
    const phoneDigits = rawDigits.startsWith("216") && rawDigits.length === 11 ? rawDigits.slice(3) : rawDigits;
    if (phoneDigits.length !== 8)
      return toast.error("Num\u00e9ro invalide : doit contenir 8 chiffres (ex: 93733766)");
    if (form.phone2.trim()) {
      const raw2 = form.phone2.trim().replace(/\D/g, "");
      const phone2Digits = raw2.startsWith("216") && raw2.length === 11 ? raw2.slice(3) : raw2;
      if (phone2Digits.length !== 8)
        return toast.error("2\u00e8me num\u00e9ro invalide : doit contenir 8 chiffres");
    }
    if (!form.governorate)
      return toast.error("Veuillez s\u00e9lectionner votre gouvernorat");
    if (!form.address.trim())
      return toast.error("Veuillez entrer votre adresse");
    if (items.length === 0) return toast.error("Votre panier est vide");

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          phone2: form.phone2.trim() || null,
          governorate: form.governorate,
          address: form.address.trim(),
          note: form.note.trim() || null,
          items: items.map((item) => ({
            product_id: item.productId,
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            colorName: item.colorName,
            deliveryPrice: item.deliveryPrice,
          })),
          total_amount: grandTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Echec de la commande");
      trackPurchase(data.order_number, items, grandTotal);
      clearCart();
      router.push(`/order-confirmed?order=${data.order_number}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-neutral-400 px-4">
        <p className="text-lg mb-2">Votre panier est vide</p>
        <a href="/products" className="text-neutral-900 text-sm underline">
          Parcourir les produits
        </a>
      </div>
    );
  }

  const inputClass =
    "w-full border border-neutral-200 rounded-lg text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-400";

  return (
    <div className="pt-24 sm:pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-serif text-3xl sm:text-4xl tracking-wide text-neutral-900">
          Valider la Commande
        </h1>
        <p className="text-neutral-400 text-sm mt-2">
          Paiement a la livraison
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-5"
        >
          <div>
            <label className="text-neutral-500 text-xs tracking-widest uppercase block mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Votre nom complet"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-neutral-500 text-xs tracking-widest uppercase block mb-2">
                Telephone *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+216 XX XXX XXX"
                required
              />
            </div>
            <div>
              <label className="text-neutral-500 text-xs tracking-widest uppercase block mb-2">
                2eme Telephone (optionnel)
              </label>
              <input
                type="tel"
                name="phone2"
                value={form.phone2}
                onChange={handleChange}
                className={inputClass}
                placeholder="+216 XX XXX XXX"
              />
            </div>
          </div>
          <div>
            <label className="text-neutral-500 text-xs tracking-widest uppercase block mb-2">
              Gouvernorat *
            </label>
            <GovernorateSelect
              value={form.governorate}
              onChange={handleChange}
              name="governorate"
              required
            />
          </div>
          <div>
            <label className="text-neutral-500 text-xs tracking-widest uppercase block mb-2">
              Adresse *
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Votre adresse complete de livraison"
              required
            />
          </div>
          <div>
            <label className="text-neutral-500 text-xs tracking-widest uppercase block mb-2">
              Note (optionnel)
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Instructions speciales..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white py-4 text-sm tracking-widest uppercase font-medium transition-colors rounded-lg"
          >
            {submitting ? "Envoi en cours..." : "Confirmer la Commande"}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
            <h2 className="text-neutral-900 font-serif text-lg tracking-widest uppercase mb-6">
              Recapitulatif
            </h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-18 bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-900 text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-neutral-400 text-xs">
                      Taille: {item.size} x {item.quantity}
                      {item.colorName && ` - ${item.colorName}`}
                    </p>
                    <p className="text-neutral-900 text-sm mt-1 font-medium">
                      {item.price * item.quantity} TND
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 pt-4 space-y-2">
              <div className="flex justify-between text-neutral-600 text-sm">
                <span>Sous-total</span>
                <span>{totalPrice} TND</span>
              </div>
              <div className="flex justify-between text-neutral-600 text-sm">
                <span>Livraison</span>
                <span className={totalDelivery === 0 ? "text-green-600" : ""}>
                  {totalDelivery === 0 ? "Gratuite" : `${totalDelivery} TND`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-900 pt-2 border-t border-neutral-200">
                <span className="text-sm tracking-widest uppercase font-medium">
                  Total
                </span>
                <span className="font-serif text-xl">{grandTotal} TND</span>
              </div>
              <p className="text-neutral-400 text-xs mt-2">
                Paiement a la livraison
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}