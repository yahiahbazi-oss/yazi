"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import toast from "react-hot-toast";

const PRESET_COLORS = [
  { color: "#18181b", text: "#ffffff", label: "Noir" },
  { color: "#ef4444", text: "#ffffff", label: "Rouge" },
  { color: "#f97316", text: "#ffffff", label: "Orange" },
  { color: "#eab308", text: "#000000", label: "Jaune" },
  { color: "#22c55e", text: "#ffffff", label: "Vert" },
  { color: "#3b82f6", text: "#ffffff", label: "Bleu" },
  { color: "#8b5cf6", text: "#ffffff", label: "Violet" },
  { color: "#ec4899", text: "#ffffff", label: "Rose" },
  { color: "#06b6d4", text: "#ffffff", label: "Cyan" },
  { color: "#f59e0b", text: "#000000", label: "Ambre" },
  { color: "#64748b", text: "#ffffff", label: "Gris" },
  { color: "#1e293b", text: "#ffffff", label: "Ardoise" },
];

const emptyForm = {
  name: "",
  emoji: "🏷️",
  color: "#18181b",
  text_color: "#ffffff",
  sort_order: 0,
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchCollections = useCallback(async () => {
    const res = await fetch("/api/collections");
    const data = await res.json();
    setCollections(data.collections || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const openNew = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (col) => {
    setForm({
      name: col.name,
      emoji: col.emoji || "🏷️",
      color: col.color || "#18181b",
      text_color: col.text_color || "#ffffff",
      sort_order: col.sort_order || 0,
    });
    setEditingId(col.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Le nom est requis");
    setSaving(true);
    try {
      const url = editingId ? `/api/collections/${editingId}` : "/api/collections";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success(editingId ? "Collection mise à jour" : "Collection créée");
      setShowForm(false);
      fetchCollections();
    } catch (err) {
      toast.error(err.message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const deleteCollection = async (id) => {
    if (!confirm("Supprimer cette collection ?")) return;
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Collection supprimée");
      fetchCollections();
    } catch {
      toast.error("Échec de la suppression");
    }
  };

  const inputClass = "w-full border border-neutral-200 rounded-lg text-neutral-900 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-400 transition-colors bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Collections</h1>
          <p className="text-neutral-500 text-sm mt-1">Créez des collections pour filtrer et mettre en avant vos produits</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle Collection</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🏷️</p>
          <p className="text-neutral-400 text-sm">Aucune collection pour l&apos;instant.</p>
          <p className="text-neutral-400 text-xs mt-1">Ex: Soldes d&apos;été, Black Friday, Nouveautés...</p>
          <button onClick={openNew} className="mt-5 bg-neutral-900 text-white text-sm px-6 py-2 rounded-lg hover:bg-neutral-800 transition-colors">
            Créer une collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              style={{ backgroundColor: col.color }}
            >
              <div className="p-6 flex flex-col items-center text-center" style={{ color: col.text_color }}>
                <span className="text-5xl mb-3 leading-none">{col.emoji}</span>
                <h3 className="font-bold text-lg tracking-wide uppercase">{col.name}</h3>
                <p className="text-[10px] tracking-[0.2em] uppercase mt-1 opacity-60">/{col.slug}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  onClick={() => openEdit(col)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm"
                  style={{ color: col.text_color }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteCollection(col.id)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-red-500/80 hover:text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                  style={{ color: col.text_color }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowForm(false)} />
          <div className="relative bg-white border border-neutral-200 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h2 className="text-neutral-900 font-semibold text-lg">
                {editingId ? "Modifier la collection" : "Nouvelle collection"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Preview card */}
              <div
                className="rounded-xl p-6 flex flex-col items-center text-center shadow-md transition-all"
                style={{ backgroundColor: form.color, color: form.text_color }}
              >
                <span className="text-5xl mb-2 leading-none">{form.emoji || "🏷️"}</span>
                <span className="font-bold text-lg tracking-widest uppercase">{form.name || "Aperçu"}</span>
              </div>

              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Nom *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Ex: Black Friday, Été 2025..."
                  required
                />
              </div>

              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Emoji</label>
                <input
                  type="text"
                  value={form.emoji}
                  onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                  className={inputClass}
                  placeholder="🏷️ 🔥 ✨ ❄️ 🌸..."
                />
                <p className="text-neutral-400 text-[10px] mt-1">Collez ou tapez un emoji</p>
              </div>

              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-2">Couleur d&apos;arrière-plan</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      title={p.label}
                      onClick={() => setForm((f) => ({ ...f, color: p.color, text_color: p.text }))}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${form.color === p.color ? "border-neutral-900 scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                      style={{ backgroundColor: p.color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    className="w-10 h-9 rounded border border-neutral-200 cursor-pointer p-0.5"
                  />
                  <span className="text-xs text-neutral-400">Couleur personnalisée</span>
                </div>
              </div>

              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Couleur du texte</label>
                <div className="flex gap-3">
                  {[["#ffffff", "Blanc"], ["#000000", "Noir"]].map(([val, lbl]) => (
                    <label key={val} className={`flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-2 transition-colors ${form.text_color === val ? "border-neutral-700 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
                      <input type="radio" name="text_color" value={val} checked={form.text_color === val} onChange={() => setForm((p) => ({ ...p, text_color: val }))} className="accent-neutral-900" />
                      <span className="text-sm text-neutral-700">{lbl}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Ordre d&apos;affichage</label>
                <input
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                  className={inputClass}
                  placeholder="0 = en premier"
                />
              </div>

              <button type="submit" disabled={saving} className="w-full bg-neutral-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer la collection"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
