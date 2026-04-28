"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const MESSAGES = [
  "🚚 Livraison rapide partout en Tunisie",
  "💳 Paiement à la livraison disponible",
  "🔄 Échange facile sous 7 jours",
  "✨ Nouveaux articles ajoutés chaque semaine",
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MESSAGES.length);
        setFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-neutral-900 text-white text-xs py-2.5 px-4 flex items-center justify-center relative">
      <p
        className="tracking-widest uppercase text-center transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {MESSAGES[idx]}
      </p>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 text-white/50 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
