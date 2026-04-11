"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Package, DollarSign, TrendingUp,
  AlertCircle, Clock, CheckCircle, Truck, RotateCcw,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Nouvelles Commandes", value: stats?.newOrders || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Confirmées", value: stats?.confirmedOrders || 0, icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Expédiées", value: stats?.shippedOrders || 0, icon: Truck, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Livrées", value: stats?.deliveredOrders || 0, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    { label: "Retournées", value: stats?.returnedOrders || 0, icon: RotateCcw, color: "text-red-500", bg: "bg-red-50" },
    { label: "Total Commandes", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-neutral-700", bg: "bg-neutral-100" },
    { label: "Produits", value: stats?.totalProducts || 0, icon: Package, color: "text-neutral-700", bg: "bg-neutral-100" },
    { label: "Stock Faible", value: stats?.lowStockProducts || 0, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Tableau de Bord</h1>
        <p className="text-neutral-500 text-sm mt-1">Vue d'ensemble de votre boutique</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5">
              <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{card.value}</p>
              <p className="text-neutral-500 text-xs mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="inline-flex p-2 rounded-lg bg-green-50 mb-3"><DollarSign className="w-4 h-4 text-green-500" /></div>
          <p className="text-2xl font-semibold text-neutral-900">{stats?.totalRevenue || 0} <span className="text-sm text-neutral-400 font-normal">TND</span></p>
          <p className="text-neutral-500 text-xs mt-1">Chiffre d'Affaires Total</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="inline-flex p-2 rounded-lg bg-neutral-100 mb-3"><DollarSign className="w-4 h-4 text-neutral-700" /></div>
          <p className="text-2xl font-semibold text-neutral-900">{stats?.totalPaymentsReceived || 0} <span className="text-sm text-neutral-400 font-normal">TND</span></p>
          <p className="text-neutral-500 text-xs mt-1">Paiements Reçus</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-3"><CheckCircle className="w-4 h-4 text-blue-500" /></div>
          <p className="text-2xl font-semibold text-neutral-900">{stats?.paidOrders || 0}</p>
          <p className="text-neutral-500 text-xs mt-1">Commandes Payées</p>
        </div>
      </div>
    </div>
  );
}
