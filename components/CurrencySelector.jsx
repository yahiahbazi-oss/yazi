"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { useInternational } from "@/lib/international-context";

export default function CurrencySelector() {
  const { currency, changeCurrency, supportedCurrencies, loading } = useInternational();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return null;

  const currentCurrency = supportedCurrencies[currency];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-sm"
        aria-label="Change currency"
      >
        <Globe className="w-4 h-4 text-neutral-600" />
        <span className="font-medium text-neutral-700">
          {currentCurrency.flag} {currency}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Choisir la devise
                </p>
              </div>
              {Object.entries(supportedCurrencies).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => {
                    changeCurrency(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    currency === code
                      ? "bg-neutral-900 text-white"
                      : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{info.flag}</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{code}</p>
                      <p
                        className={`text-xs ${
                          currency === code ? "text-white/70" : "text-neutral-500"
                        }`}
                      >
                        {info.name}
                      </p>
                    </div>
                  </div>
                  {currency === code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
