"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { COUNTRIES, getCountryByCode } from "./countries";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [country, setCountry] = useState("TN"); // Default Tunisia
  const [currency, setCurrency] = useState("TND");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectLocation() {
      try {
        // Check localStorage first (user preference)
        const saved = localStorage.getItem("yazi-country");
        if (saved) {
          const countryData = getCountryByCode(saved);
          if (countryData) {
            setCountry(saved);
            setCurrency(countryData.currency);
            setLoading(false);
            return;
          }
        }

        // Detect from IP
        const res = await fetch("/api/geolocation");
        const data = await res.json();
        
        if (data.country) {
          const countryData = getCountryByCode(data.country);
          if (countryData) {
            setCountry(data.country);
            setCurrency(countryData.currency);
            // Save to localStorage
            localStorage.setItem("yazi-country", data.country);
          }
        }
      } catch (error) {
        console.error("Location detection failed:", error);
        // Keep Tunisia as default
      } finally {
        setLoading(false);
      }
    }

    detectLocation();
  }, []);

  const changeCountry = (countryCode) => {
    const countryData = getCountryByCode(countryCode);
    if (countryData) {
      setCountry(countryCode);
      setCurrency(countryData.currency);
      localStorage.setItem("yazi-country", countryCode);
    }
  };

  const countryData = getCountryByCode(country);

  return (
    <LocationContext.Provider
      value={{
        country,
        currency,
        countryData,
        loading,
        changeCountry,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within LocationProvider");
  return context;
}
