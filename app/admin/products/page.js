"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import toast from "react-hot-toast";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const BIG_SIZES = ["3XL", "4XL", "5XL"];
const EU_SIZES = ["36", "38", "40", "42", "44", "46", "48"];

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  compare_price: "",
  big_size_price: "",
  category_id: "",
  gender: "unisex",
  color_variants: {},
  is_new: false,
  is_trending: false,
  is_coming_soon: false,
  delivery_price: null,
  collection_slugs: [],
  recommended_product_ids: [],
  stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, "3XL": 0, "4XL": 0, "5XL": 0, "36": 0, "38": 0, "40": 0, "42": 0, "44": 0, "46": 0, "48": 0 },
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);

  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [colorImageUrl, setColorImageUrl] = useState("");
  const [editingColor, setEditingColor] = useState(null);
  const [recoSearch, setRecoSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  }, []);

  const fetchCollections = useCallback(async () => {
    const res = await fetch("/api/collections");
    const data = await res.json();
    setCollections(data.collections || []);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCollections();
  }, [fetchProducts, fetchCategories, fetchCollections]);

  const openNew = () => {
    setForm({ ...emptyProduct });
    setEditingId(null);
    setEditingColor(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      compare_price: product.compare_price || "",
      big_size_price: product.big_size_price || "",
      category_id: product.category_id || "",
      gender: product.gender || "unisex",
      color_variants: product.color_variants || {},
      is_new: product.is_new || false,
      is_trending: product.is_trending || false,
      is_coming_soon: product.is_coming_soon || false,
      delivery_price: product.delivery_price,
      collection_slugs: product.collection_slugs || [],
      recommended_product_ids: product.recommended_product_ids || [],
      stock: product.stock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, "3XL": 0, "4XL": 0, "5XL": 0, "36": 0, "38": 0, "40": 0, "42": 0, "44": 0, "46": 0, "48": 0 },
    });
    setEditingId(product.id);
    setEditingColor(null);
    setShowForm(true);
  };

  const addColor = () => {
    if (!colorName.trim() || !colorCode.trim()) return toast.error("Enter color name and code");
    const hex = colorCode.startsWith("#") ? colorCode : `#${colorCode}`;
    if (form.color_variants[hex]) return toast.error("Color already exists");
    setForm((p) => ({
      ...p,
      color_variants: { ...p.color_variants, [hex]: { name: colorName.trim(), images: [] } },
    }));
    setColorName("");
    setColorCode("#000000");
  };

  const removeColor = (hex) => {
    setForm((p) => {
      const updated = { ...p.color_variants };
      delete updated[hex];
      return { ...p, color_variants: updated };
    });
    if (editingColor === hex) setEditingColor(null);
  };

  const addImageToColor = (hex) => {
    if (!colorImageUrl.trim()) return;
    setForm((p) => {
      const v = p.color_variants[hex];
      return {
        ...p,
        color_variants: {
          ...p.color_variants,
          [hex]: { ...v, images: [...v.images, colorImageUrl.trim()] },
        },
      };
    });
    setColorImageUrl("");
  };

  const removeImageFromColor = (hex, i) => {
    setForm((p) => {
      const v = p.color_variants[hex];
      return {
        ...p,
        color_variants: {
          ...p.color_variants,
          [hex]: { ...v, images: v.images.filter((_, idx) => idx !== i) },
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.price || parseFloat(form.price) <= 0) return toast.error("Valid price is required");
    setSaving(true);
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), compare_price: form.compare_price !== '' && form.compare_price !== null ? parseFloat(form.compare_price) : null, big_size_price: form.big_size_price !== '' && form.big_size_price !== null ? parseFloat(form.big_size_price) : null, category_id: form.category_id || null, delivery_price: form.delivery_price !== null && form.delivery_price !== '' ? parseFloat(form.delivery_price) : null }),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Product updated" : "Product created");
      setShowForm(false);
      fetchProducts();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (product) => {
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !product.is_active }),
    });
    fetchProducts();
  };

  const totalStock = (stock) => stock ? Object.values(stock).reduce((s, v) => s + (v || 0), 0) : 0;

  const getFirstImage = (product) => {
    const cv = product.color_variants;
    if (cv && typeof cv === "object") {
      const first = Object.values(cv)[0];
      if (first?.images?.[0]) return first.images[0];
    }
    if (product.images?.[0]) return product.images[0];
    return null;
  };

  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || "";

  const inputClass = "w-full border border-neutral-200 rounded-lg text-neutral-900 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-400 transition-colors bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Products</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your product catalog & stock</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-neutral-400"><p>No products yet. Add your first product!</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className={`bg-white border rounded-xl overflow-hidden ${product.is_active ? "border-neutral-200" : "border-red-200 opacity-60"}`}>
              <div className="aspect-[4/3] bg-neutral-100 relative">
                {getFirstImage(product) ? (
                  <img src={getFirstImage(product)} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-300 text-sm">No Image</div>
                )}
                {!product.is_active && <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded">Hidden</div>}
                {product.gender && product.gender !== "unisex" && (
                  <div className="absolute top-2 left-2 bg-white/90 text-neutral-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">{product.gender}</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-neutral-900 text-sm font-medium">{product.name}</h3>
                    <p className="text-neutral-400 text-xs">{getCategoryName(product.category_id) || product.category || "â€”"}</p>
                  </div>
                  <span className="text-neutral-900 text-sm font-semibold">{product.price} TND</span>
                </div>
                <p className={`text-xs mb-1 ${product.delivery_price ? 'text-neutral-500' : 'text-green-600'}`}>
                  {product.delivery_price ? `Livraison: ${product.delivery_price} TND` : 'Livraison gratuite'}
                </p>
                {product.color_variants && Object.keys(product.color_variants).length > 0 && (
                  <div className="flex gap-1.5 mt-2 mb-2">
                    {Object.entries(product.color_variants).map(([hex, v]) => (
                      <div key={hex} title={v.name} className="w-4 h-4 rounded-full border border-neutral-200" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3 mb-3">
                  {SIZES.map((size) => {
                    const qty = product.stock?.[size] || 0;
                    return (
                      <div key={size} className="text-center">
                        <p className="text-[10px] text-neutral-400">{size}</p>
                        <p className={`text-xs ${qty === 0 ? "text-red-400" : qty <= 3 ? "text-amber-500" : "text-neutral-600"}`}>{qty}</p>
                      </div>
                    );
                  })}
                  <div className="text-center ml-auto">
                    <p className="text-[10px] text-neutral-400">Total</p>
                    <p className="text-xs text-neutral-800 font-medium">{totalStock(product.stock)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-neutral-100">
                  <button onClick={() => openEdit(product)} className="flex items-center gap-1 text-neutral-400 hover:text-neutral-700 text-xs transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => toggleActive(product)} className="text-neutral-400 hover:text-neutral-700 text-xs transition-colors">
                    {product.is_active ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="ml-auto text-neutral-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowForm(false)} />
          <div className="relative bg-white border border-neutral-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-neutral-900 font-semibold text-lg">{editingId ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Product name" required />
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`${inputClass} resize-none`} rows={3} placeholder="Product description" />
              </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Price (TND) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className={inputClass} placeholder="0.00" required />
                </div>
                <div>
                  <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Prix barré (TND)</label>
                  <input type="number" step="0.01" value={form.compare_price} onChange={(e) => setForm((p) => ({ ...p, compare_price: e.target.value }))} className={inputClass} placeholder="Ex: 120.00" />
                  <p className="text-neutral-400 text-[10px] mt-1">Laissez vide si pas de remise</p>
                </div>
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Prix Grandes Tailles 3XL-5XL (TND)</label>
                <input type="number" step="0.01" value={form.big_size_price} onChange={(e) => setForm((p) => ({ ...p, big_size_price: e.target.value }))} className={inputClass} placeholder="Laissez vide si même prix" />
                <p className="text-neutral-400 text-[10px] mt-1">Si renseigné, ce prix s&apos;applique quand le client choisit 3XL, 4XL ou 5XL</p>
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Category</label>
                <select value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))} className={inputClass}>
                  <option value="">&#x2014; Select &#x2014;</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Genre</label>
                <div className="flex gap-3">
                  {["men", "women", "unisex"].map((g) => (
                    <button key={g} type="button" onClick={() => setForm((p) => ({ ...p, gender: g }))}
                      className={`px-4 py-2 rounded-lg border text-sm capitalize transition-colors ${form.gender === g ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Variants */}
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-2">Color Variants</label>
                <div className="flex gap-2 mb-3 items-center flex-wrap">
                  <input type="color" value={colorCode} onChange={(e) => setColorCode(e.target.value)} className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5" />
                  <input type="text" value={colorCode} onChange={(e) => setColorCode(e.target.value)} className="w-24 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" placeholder="#000000" />
                  <input type="text" value={colorName} onChange={(e) => setColorName(e.target.value)} className="flex-1 min-w-[120px] border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" placeholder="Color name" />
                  <button type="button" onClick={addColor} className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-neutral-800 transition-colors">Add</button>
                </div>
                {Object.entries(form.color_variants).length > 0 && (
                  <div className="space-y-3">
                    {Object.entries(form.color_variants).map(([hex, variant]) => (
                      <div key={hex} className="border border-neutral-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border border-neutral-200" style={{ backgroundColor: hex }} />
                            <span className="text-sm font-medium text-neutral-700">{variant.name}</span>
                            <span className="text-xs text-neutral-400">{hex}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setEditingColor(editingColor === hex ? null : hex)} className="text-xs text-neutral-500 hover:text-neutral-700">
                              {editingColor === hex ? "Done" : `Images (${variant.images.length})`}
                            </button>
                            <button type="button" onClick={() => removeColor(hex)} className="text-neutral-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                        {editingColor === hex && (
                          <div className="mt-2 pt-2 border-t border-neutral-100">
                            <div className="flex gap-2 mb-2">
                              <input type="text" value={colorImageUrl} onChange={(e) => setColorImageUrl(e.target.value)} className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" placeholder="Paste image URL" />
                              <button type="button" onClick={() => addImageToColor(hex)} className="px-3 py-2 bg-neutral-100 rounded-lg text-neutral-600 hover:bg-neutral-200 transition-colors">
                                <Upload className="w-4 h-4" />
                              </button>
                            </div>
                            {variant.images.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {variant.images.map((url, i) => (
                                  <div key={i} className="relative w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden group">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImageFromColor(hex, i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <X className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Livraison */}
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Livraison</label>
                <div className="flex gap-3 mb-2">
                  <button type="button" onClick={() => setForm((p) => ({ ...p, delivery_price: null }))}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${form.delivery_price === null || form.delivery_price === undefined ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                    Livraison gratuite
                  </button>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, delivery_price: p.delivery_price || '' }))}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${form.delivery_price !== null && form.delivery_price !== undefined ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                    Prix fixe
                  </button>
                </div>
                {form.delivery_price !== null && form.delivery_price !== undefined && (
                  <input type="number" step="0.01" min="0" value={form.delivery_price} onChange={(e) => setForm((p) => ({ ...p, delivery_price: e.target.value }))} className={inputClass} placeholder="Frais de livraison (TND)" />
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Stock S → XXL</label>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((size) => (
                    <div key={size}>
                      <p className="text-neutral-500 text-xs text-center mb-1">{size}</p>
                      <input type="number" min="0" value={form.stock[size] || 0}
                        onChange={(e) => setForm((p) => ({ ...p, stock: { ...p.stock, [size]: parseInt(e.target.value) || 0 } }))}
                        className={`${inputClass} text-center`} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Stock Grandes Tailles (3XL → 5XL)</label>
                <div className="grid grid-cols-3 gap-2">
                  {BIG_SIZES.map((size) => (
                    <div key={size}>
                      <p className="text-neutral-500 text-xs text-center mb-1">{size}</p>
                      <input type="number" min="0" value={form.stock[size] || 0}
                        onChange={(e) => setForm((p) => ({ ...p, stock: { ...p.stock, [size]: parseInt(e.target.value) || 0 } }))}
                        className={`${inputClass} text-center`} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Stock Tailles Européennes (36 → 48)</label>
                <div className="grid grid-cols-4 gap-2">
                  {EU_SIZES.map((size) => (
                    <div key={size}>
                      <p className="text-neutral-500 text-xs text-center mb-1">{size}</p>
                      <input type="number" min="0" value={form.stock[size] || 0}
                        onChange={(e) => setForm((p) => ({ ...p, stock: { ...p.stock, [size]: parseInt(e.target.value) || 0 } }))}
                        className={`${inputClass} text-center`} />
                    </div>
                  ))}
                </div>
              </div>

              {collections.length > 0 && (
                <div>
                  <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-2">Collections</label>
                  <div className="flex flex-wrap gap-2">
                    {collections.map((col) => {
                      const checked = (form.collection_slugs || []).includes(col.slug);
                      return (
                        <label key={col.slug} className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 transition-colors ${checked ? "border-neutral-700 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
                          <input type="checkbox" checked={checked}
                            onChange={(e) => {
                              const slugs = form.collection_slugs || [];
                              setForm((p) => ({ ...p, collection_slugs: e.target.checked ? [...slugs, col.slug] : slugs.filter((s) => s !== col.slug) }));
                            }}
                            className="w-4 h-4 accent-neutral-900" />
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                          <span className="text-sm text-neutral-700">{col.emoji} {col.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Products Picker */}
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Produits Recommandés</label>
                <p className="text-neutral-400 text-[11px] mb-3">Ces produits s&apos;afficheront sous ce produit comme suggestions d&apos;achat</p>
                <input
                  type="text"
                  value={recoSearch}
                  onChange={(e) => setRecoSearch(e.target.value)}
                  className={inputClass + " mb-2"}
                  placeholder="Rechercher un produit..."
                />
                <div className="border border-neutral-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-neutral-100">
                  {products
                    .filter((p) => p.id !== editingId && p.name.toLowerCase().includes(recoSearch.toLowerCase()))
                    .map((p) => {
                      const checked = (form.recommended_product_ids || []).includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const ids = form.recommended_product_ids || [];
                              setForm((prev) => ({
                                ...prev,
                                recommended_product_ids: e.target.checked
                                  ? [...ids, p.id]
                                  : ids.filter((rid) => rid !== p.id),
                              }));
                            }}
                            className="w-4 h-4 accent-neutral-900 flex-shrink-0"
                          />
                          {getFirstImage(p) && (
                            <img src={getFirstImage(p)} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />
                          )}
                          <span className="text-sm text-neutral-700 flex-1 truncate">{p.name}</span>
                          <span className="text-xs text-neutral-400 flex-shrink-0">{p.price} TND</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_new} onChange={(e) => setForm((p) => ({ ...p, is_new: e.target.checked }))} className="w-4 h-4 rounded border-neutral-300 accent-neutral-900" />
                <span className="text-sm text-neutral-600">Nouveau</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_trending} onChange={(e) => setForm((p) => ({ ...p, is_trending: e.target.checked }))} className="w-4 h-4 rounded border-neutral-300 accent-neutral-900" />
                <span className="text-sm text-neutral-600">Tendance 🔥</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_coming_soon} onChange={(e) => setForm((p) => ({ ...p, is_coming_soon: e.target.checked }))} className="w-4 h-4 rounded border-neutral-300 accent-neutral-900" />
                <span className="text-sm text-neutral-600">Bientôt disponible</span>
              </label>

              <button type="submit" disabled={saving} className="w-full bg-neutral-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
