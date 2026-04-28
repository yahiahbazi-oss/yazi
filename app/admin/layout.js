"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  DollarSign,
  LogOut,
  Menu,
  X,
  Tag,
  Layers,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Tableau de Bord", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tag },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/finances", label: "Finances", icon: DollarSign },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") return children;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 fixed h-full">
        <div className="p-6 border-b border-neutral-200">
          <Link href="/admin" className="text-neutral-900 font-serif text-xl tracking-[0.3em] uppercase">
            YAZI
          </Link>
          <p className="text-neutral-400 text-xs mt-1">Panneau Admin</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active
                    ? "text-neutral-900 bg-neutral-100 border-r-2 border-neutral-900 font-medium"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 text-sm w-full px-2 py-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="text-neutral-900 font-serif text-lg tracking-[0.2em] uppercase">
          YAZI
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-neutral-700">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-14 bottom-0 w-64 bg-white border-r border-neutral-200">
            <nav className="py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                      active
                        ? "text-neutral-900 bg-neutral-100 font-medium"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-4 pt-4 border-t border-neutral-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 text-sm px-2 py-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
