"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="text-neutral-900 font-serif text-2xl sm:text-3xl tracking-[0.3em] uppercase">
            YAZI
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-neutral-500 hover:text-neutral-900 text-sm tracking-widest uppercase transition-colors">
              Accueil
            </Link>
            <Link href="/products" className="text-neutral-500 hover:text-neutral-900 text-sm tracking-widest uppercase transition-colors">
              Collection
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(true)} className="relative text-neutral-500 hover:text-neutral-900 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="md:hidden text-neutral-700" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100">
          <div className="px-4 py-6 flex flex-col gap-4">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-neutral-500 hover:text-neutral-900 text-sm tracking-widest uppercase">Accueil</Link>
            <Link href="/products" onClick={() => setMenuOpen(false)} className="text-neutral-500 hover:text-neutral-900 text-sm tracking-widest uppercase">Collection</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
