"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SUPPORTED_CURRENCIES = {
  TND: { symbol: "TND", name: "Tunisian Dinar", flag: "🇹🇳", locale: "fr-TN" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺", locale: "fr-FR" },
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸", locale: "en-US" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧", locale: "en-GB" },
};

const COUNTRY_TO_CURRENCY = {
  TN: "TND", // Tunisia
  DZ: "EUR", // Algeria
  MA: "EUR", // Morocco
  FR: "EUR", // France
  DE: "EUR", // Germany
  IT: "EUR", // Italy
  ES: "EUR", // Spain
  BE: "EUR", // Belgium
  NL: "EUR", // Netherlands
  AT: "EUR", // Austria
  US: "USD", // United States
  CA: "USD", // Canada
  GB: "GBP", // United Kingdom
  IE: "EUR", // Ireland
};

const InternationalContext = createContext(null);

export function InternationalProvider({ children }) {
  const [country, setCountry] = useState("TN");
  const [currency, setCurrency] = useState("TND");
  const [loading, setLoading] = useState(true);
  const [isManual, setIsManual] = useState(false);

  // Detect user location on mount
  useEffect(() => {
    async function detectLocation() {
      try {
        // Check if user manually set currency before
        const savedCurrency = localStorage.getItem("yazi-currency");
        const savedCountry = localStorage.getItem("yazi-country");
        
        if (savedCurrency && savedCountry) {
          setCurrency(savedCurrency);
          setCountry(savedCountry);
          setIsManual(true);
          setLoading(false);
          return;
        }

        // Try to detect via IP geolocation
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          const detectedCountry = data.country_code || "TN";
          const detectedCurrency = COUNTRY_TO_CURRENCY[detectedCountry] || "TND";
          
          setCountry(detectedCountry);
          setCurrency(detectedCurrency);
        }
      } catch (error) {
        console.error("Geolocation detection failed:", error);
        // Default to Tunisia
        setCountry("TN");
        setCurrency("TND");
      } finally {
        setLoading(false);
      }
    }

    detectLocation();
  }, []);

  const changeCurrency = (newCurrency, newCountry) => {
    setCurrency(newCurrency);
    setCountry(newCountry || country);
    setIsManual(true);
    localStorage.setItem("yazi-currency", newCurrency);
    if (newCountry) {
      localStorage.setItem("yazi-country", newCountry);
    }
  };

  const formatPrice = (price, currencyCode = currency) => {
    const currencyInfo = SUPPORTED_CURRENCIES[currencyCode];
    if (!currencyInfo) return `${price} TND`;

    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${currencyInfo.symbol}${price}`;
    }
  };

  const convertPrice = async (priceInTND, toCurrency = currency) => {
    if (toCurrency === "TND") return priceInTND;

    try {
      // Fetch exchange rates from settings
      const response = await fetch("/api/settings");
      const data = await response.json();
      const rates = JSON.parse(data.settings?.exchange_rates || "{}");
      
      const rate = rates[toCurrency] || 1;
      return Math.round((priceInTND / rate) * 100) / 100;
    } catch (error) {
      console.error("Price conversion failed:", error);
      return priceInTND;
    }
  };

  const value = {
    country,
    currency,
    loading,
    isManual,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    changeCurrency,
    formatPrice,
    convertPrice,
  };

  return (
    <InternationalContext.Provider value={value}>
      {children}
    </InternationalContext.Provider>
  );
}

export function useInternational() {
  const context = useContext(InternationalContext);
  if (!context) {
    throw new Error("useInternational must be used within InternationalProvider");
  }
  return context;
}
