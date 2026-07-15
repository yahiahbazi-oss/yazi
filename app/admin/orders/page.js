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
  Truck,
  PackageCheck,
  RefreshCw,
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
  const [sendingToDelivery, setSendingToDelivery] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState({});
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

  const sendToNavexDelivery = async (order) => {
    if (order.navex_tracking_code) {
      toast.error("Commande déjà envoyée à la livraison");
      return;
    }

    setSendingToDelivery(order.id);
    try {
      const res = await fetch("/api/navex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", orderId: order.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Livraison créée! Code: ${data.trackingCode}`);
        fetchOrders();
        if (selectedOrder?.id === order.id) {
          setSelectedOrder((prev) => ({
            ...prev,
            navex_tracking_code: data.trackingCode,
            navex_sent_at: new Date().toISOString(),
          }));
        }
      } else {
        toast.error(data.error || "Échec de création de livraison");
      }
    } catch (err) {
      toast.error("Erreur lors de l'envoi à Navex");
    } finally {
      setSendingToDelivery(null);
    }
  };

  const trackDelivery = async (trackingCode) => {
    try {
      const res = await fetch("/api/navex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "track", trackingCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTrackingStatus((prev) => ({ ...prev, [trackingCode]: data.tracking }));
        toast.success("Statut mis à jour");
      } else {
        toast.error("Échec de suivi de livraison");
      }
    } catch (err) {
      toast.error("Erreur lors du suivi");
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
                <th className="text-left px-4 py-3">Produits</th>
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
                  <td colSpan={9} className="text-center py-12 text-neutral-400">
                    Chargement...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-neutral-400">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.items?.[0]?.image && (
                          <img
                            src={order.items[0].image}
                            alt={order.items[0].name}
                            className="w-12 h-12 object-cover rounded border border-neutral-200"
                          />
                        )}
                        <div className="flex flex-col">
                          {order.items?.slice(0, 2).map((item, i) => (
                            <div key={i} className="text-xs text-neutral-700">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-neutral-400 ml-1">
                                ({item.size} × {item.quantity})
                              </span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <span className="text-xs text-neutral-400">
                              +{order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
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
                  <div key={i} className="flex gap-3 py-2 border-b border-neutral-100 last:border-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded border border-neutral-200"
                      />
                    )}
                    <div className="flex-1 flex justify-between items-start">
                      <div>
                        <p className="text-neutral-900 text-sm font-medium">{item.name}</p>
                        <p className="text-neutral-500 text-xs mt-0.5">
                          Taille: {item.size} × {item.quantity}
                          {item.colorName && ` — ${item.colorName}`}
                        </p>
                      </div>
                      <span className="text-neutral-900 text-sm font-medium">{item.price * item.quantity} TND</span>
                    </div>
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

              {/* Navex Delivery Management */}
              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-neutral-400" />
                  <p className="text-neutral-400 text-xs tracking-widest uppercase">Livraison Navex</p>
                </div>

                {!selectedOrder.navex_tracking_code ? (
                  <button
                    onClick={() => sendToNavexDelivery(selectedOrder)}
                    disabled={sendingToDelivery === selectedOrder.id}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    {sendingToDelivery === selectedOrder.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-4 h-4" />
                        Envoyer à Navex
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">Code de suivi</p>
                      <p className="text-lg font-mono font-bold text-blue-900">{selectedOrder.navex_tracking_code}</p>
                      {selectedOrder.navex_sent_at && (
                        <p className="text-xs text-blue-500 mt-1">
                          Envoyé le {new Date(selectedOrder.navex_sent_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>

                    {trackingStatus[selectedOrder.navex_tracking_code] && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-neutral-500">Statut actuel</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            trackingStatus[selectedOrder.navex_tracking_code].status === "Livrer Paye"
                              ? "bg-green-100 text-green-700"
                              : trackingStatus[selectedOrder.navex_tracking_code].status === "En cours"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {trackingStatus[selectedOrder.navex_tracking_code].status}
                          </span>
                        </div>
                        {trackingStatus[selectedOrder.navex_tracking_code].driver && (
                          <div className="text-xs text-neutral-600">
                            <span className="font-medium">Livreur:</span> {trackingStatus[selectedOrder.navex_tracking_code].driver}
                            {trackingStatus[selectedOrder.navex_tracking_code].driverPhone && (
                              <span className="ml-2">📞 {trackingStatus[selectedOrder.navex_tracking_code].driverPhone}</span>
                            )}
                          </div>
                        )}
                        {trackingStatus[selectedOrder.navex_tracking_code].reason && (
                          <p className="text-xs text-neutral-500">
                            <span className="font-medium">Motif:</span> {trackingStatus[selectedOrder.navex_tracking_code].reason}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => trackDelivery(selectedOrder.navex_tracking_code)}
                      className="w-full flex items-center justify-center gap-2 border border-blue-200 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Actualiser le statut
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
