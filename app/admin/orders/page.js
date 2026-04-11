"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Eye,
  X,
  Phone,
  MapPin,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "all", label: "Tout" },
  { value: "new", label: "Nouvelle", color: "bg-yellow-400" },
  { value: "confirmed", label: "Confirmée", color: "bg-blue-400" },
  { value: "shipped", label: "Expédiée", color: "bg-purple-400" },
  { value: "delivered", label: "Livrée", color: "bg-green-400" },
  { value: "returned", label: "Retournée", color: "bg-red-400" },
  { value: "cancelled", label: "Annulée", color: "bg-gray-400" },
];

const PAYMENT_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payé" },
];

function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-neutral-100`}>
      <span className={`w-1.5 h-1.5 rounded-full ${opt?.color || "bg-gray-400"}`} />
      {opt?.label || status}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const limit = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: statusFilter, page, limit });
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrder = async (id, updates) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Commande mise à jour");
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => ({ ...prev, ...updates }));
      }
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
          o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          o.phone?.includes(search)
      )
    : orders;

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl tracking-wide text-neutral-900">Commandes</h1>
        <p className="text-neutral-400 text-sm mt-1">Gérer les commandes clients</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone ou n° commande"
            className="w-full bg-white border border-neutral-200 rounded-lg text-neutral-900 text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-neutral-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              className={`text-xs px-3 py-2 border transition-colors ${
                statusFilter === opt.value
                  ? "border-neutral-900 text-neutral-900"
                  : "border-neutral-200 text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 text-xs tracking-widest uppercase">
                <th className="text-left px-4 py-3">N° Commande</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Téléphone</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Gouvernorat</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-center px-4 py-3">Statut</th>
                <th className="text-center px-4 py-3">Paiement</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-neutral-400">
                    Chargement...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-neutral-400">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-neutral-900 font-mono text-xs font-medium">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 text-neutral-900">{order.customer_name}</td>
                    <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">{order.phone}</td>
                    <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">{order.governorate}</td>
                    <td className="px-4 py-3 text-right text-neutral-900">{order.total_amount} TND</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${order.payment_status === "paid" ? "text-green-400" : "text-yellow-400"}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-neutral-400 hover:text-neutral-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
            <p className="text-neutral-400 text-xs">
              Page {page} sur {totalPages} ({total} commandes)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedOrder(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white border border-neutral-200 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <div>
                <h2 className="text-neutral-900 font-serif text-lg">{selectedOrder.order_number}</h2>
                <p className="text-neutral-400 text-xs mt-0.5">
                  {new Date(selectedOrder.created_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-neutral-900 text-sm">
                  <User className="w-4 h-4 text-neutral-400" />
                  {selectedOrder.customer_name}
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  {selectedOrder.phone}
                  {selectedOrder.phone2 && ` / ${selectedOrder.phone2}`}
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  {selectedOrder.address}, {selectedOrder.governorate}
                </div>
                {selectedOrder.note && (
                  <div className="flex items-start gap-2 text-neutral-600 text-sm">
                    <FileText className="w-4 h-4 text-neutral-400 mt-0.5" />
                    {selectedOrder.note}
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="border-t border-neutral-200 pt-4">
                <p className="text-neutral-400 text-xs tracking-widest uppercase mb-3">Articles</p>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-neutral-900">
                      {item.name} — {item.size} × {item.quantity}
                    </span>
                    <span className="text-neutral-500">{item.price * item.quantity} TND</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-3 mt-3 border-t border-neutral-200">
                  <span className="text-neutral-900 font-medium">Total</span>
                  <span className="text-neutral-900 font-serif text-lg">{selectedOrder.total_amount} TND</span>
                </div>
              </div>

              {/* Status & Payment Controls */}
              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <div>
                  <p className="text-neutral-400 text-xs tracking-widest uppercase mb-2">Statut</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrder(selectedOrder.id, { status: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-sm px-3 py-2 focus:outline-none focus:border-neutral-400"
                  >
                    {STATUS_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-neutral-400 text-xs tracking-widest uppercase mb-2">Statut Paiement</p>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) =>
                      updateOrder(selectedOrder.id, { payment_status: e.target.value })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-sm px-3 py-2 focus:outline-none focus:border-neutral-400"
                  >
                    {PAYMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-neutral-400 text-xs tracking-widest uppercase mb-2">
                      Paiement Reçu (TND)
                    </p>
                    <input
                      type="number"
                      defaultValue={selectedOrder.payment_received || 0}
                      onBlur={(e) =>
                        updateOrder(selectedOrder.id, {
                          payment_received: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-sm px-3 py-2 focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <p className="text-neutral-400 text-xs tracking-widest uppercase mb-2">
                      Coût Livraison (TND)
                    </p>
                    <input
                      type="number"
                      defaultValue={selectedOrder.delivery_cost || 0}
                      onBlur={(e) =>
                        updateOrder(selectedOrder.id, {
                          delivery_cost: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-sm px-3 py-2 focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
