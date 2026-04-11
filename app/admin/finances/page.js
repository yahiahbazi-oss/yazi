"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, CheckCircle, RotateCcw } from "lucide-react";

export default function FinancesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const res = await fetch("/api/orders?limit=1000");
      const data = await res.json();
      setOrders(data.orders || []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const delivered = orders.filter((o) => o.status === "delivered");
  const returned = orders.filter((o) => o.status === "returned");
  const paid = orders.filter((o) => o.payment_status === "paid");
  const pending = orders.filter((o) => o.payment_status === "pending" && o.status !== "cancelled" && o.status !== "returned");

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const deliveredRevenue = delivered.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const returnedAmount = returned.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const paymentsReceived = orders.reduce((sum, o) => sum + (o.payment_received || 0), 0);
  const pendingPayments = deliveredRevenue - paymentsReceived;
  const totalDeliveryCost = orders.reduce((sum, o) => sum + (o.delivery_cost || 0), 0);

  const cards = [
    { label: "Chiffre d'Affaires Prévu", value: `${totalRevenue} TND`, icon: DollarSign, color: "text-neutral-900", bg: "bg-neutral-100" },
    { label: "Revenus Livrés", value: `${deliveredRevenue} TND`, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Paiements Reçus", value: `${paymentsReceived} TND`, icon: TrendingUp, color: "text-neutral-900", bg: "bg-neutral-100" },
    { label: "Paiements En Attente", value: `${Math.max(0, pendingPayments)} TND`, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Retours (Pertes)", value: `${returnedAmount} TND`, icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
    { label: "Coûts de Livraison", value: `${totalDeliveryCost} TND`, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl tracking-wide text-neutral-900">
          Finances
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Revenus, paiements et coûts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-neutral-200 rounded-lg p-5"
            >
              <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-xl font-serif text-neutral-900">{card.value}</p>
              <p className="text-neutral-400 text-xs mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Paid Orders Table */}
      <div className="mb-6">
        <h2 className="text-neutral-900 font-serif text-lg mb-4">
          Historique des Paiements ({paid.length} commandes payées)
        </h2>
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 text-xs tracking-widest uppercase">
                  <th className="text-left px-4 py-3">N° Commande</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-right px-4 py-3">Total Commande</th>
                  <th className="text-right px-4 py-3">Reçu</th>
                  <th className="text-right px-4 py-3">Coût Livraison</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {paid.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-neutral-400">
                      Aucune commande payée
                    </td>
                  </tr>
                ) : (
                  paid.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="px-4 py-3 text-neutral-900 font-mono text-xs font-medium">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 text-neutral-900">{order.customer_name}</td>
                      <td className="px-4 py-3 text-right text-neutral-900">{order.total_amount} TND</td>
                      <td className="px-4 py-3 text-right text-green-600">
                        {order.payment_received || 0} TND
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-400">
                        {order.delivery_cost || 0} TND
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Returned Orders */}
      {returned.length > 0 && (
        <div>
          <h2 className="text-neutral-900 font-serif text-lg mb-4">
            Retours ({returned.length})
          </h2>
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 text-xs tracking-widest uppercase">
                    <th className="text-left px-4 py-3">N° Commande</th>
                    <th className="text-left px-4 py-3">Client</th>
                    <th className="text-right px-4 py-3">Montant</th>
                    <th className="text-left px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {returned.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-100">
                      <td className="px-4 py-3 text-red-600 font-mono text-xs">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 text-neutral-900">{order.customer_name}</td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {order.total_amount} TND
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
