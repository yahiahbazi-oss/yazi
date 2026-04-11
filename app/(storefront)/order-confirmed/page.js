"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "—";

  return (
    <div className="pt-24 sm:pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-8"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        <h1 className="font-serif text-3xl sm:text-4xl tracking-wide mb-4">
          Commande Confirmée
        </h1>

        <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
          Merci pour votre commande ! Nous vous contacterons sous peu pour confirmer les détails de livraison.
        </p>

        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-8">
          <p className="text-neutral-400 text-xs tracking-widest uppercase mb-1">
            Numéro de Commande
          </p>
          <p className="text-neutral-900 font-serif text-2xl">#{orderNumber}</p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-neutral-900 hover:text-neutral-500 text-sm tracking-widest uppercase transition-colors"
        >
          Continuer vos Achats
        </Link>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderConfirmedContent />
    </Suspense>
  );
}
