"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success("Catégorie ajoutée");
      setNewName("");
      fetchCategories();
    } catch (err) {
      toast.error(err.message || "Échec de l'ajout");
    } finally {
      setAdding(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      toast.success("Suppriméé");
      fetchCategories();
    } catch {
      toast.error("Échec de la suppression");
    }
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      toast.success("Mis à jour");
      setEditingId(null);
      fetchCategories();
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Catégories</h1>
        <p className="text-neutral-500 text-sm mt-1">Gérer les catégories de produits</p>
      </div>

      {/* Add form */}
      <form onSubmit={addCategory} className="flex gap-3 mb-8 max-w-md">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nom de la catégorie"
          className="flex-1 border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400 transition-colors"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-neutral-400 text-sm py-8">Aucune catégorie pour le moment.</p>
      ) : (
        <div className="max-w-md space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between border border-neutral-200 rounded-lg px-4 py-3"
            >
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-400"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(cat.id)}
                  />
                  <button onClick={() => saveEdit(cat.id)} className="text-green-600 hover:text-green-700">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm text-neutral-700">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
