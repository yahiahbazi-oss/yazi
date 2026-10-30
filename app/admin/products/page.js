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
  gender: "men",
  color_variants: {},
  images: [],
  gif_url: "",
  show_gif_on_home: false,
  is_new: false,
  is_trending: false,
  is_coming_soon: false,
  delivery_price: null,
  recommended_product_ids: [],
  stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, "3XL": 0, "4XL": 0, "5XL": 0, "36": 0, "38": 0, "40": 0, "42": 0, "44": 0, "46": 0, "48": 0 },
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);

  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [colorImageUrl, setColorImageUrl] = useState("");
  const [editingColor, setEditingColor] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [recoSearch, setRecoSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products?country=ALL");
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
    // Collections removed
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
      gender: product.gender === "women" ? "women" : "men",
      color_variants: product.color_variants || {},
      images: product.images || [],
      gif_url: product.gif_url || "",
      show_gif_on_home: product.show_gif_on_home || false,
      is_new: product.is_new || false,
      is_trending: product.is_trending || false,
      is_coming_soon: product.is_coming_soon || false,
      delivery_price: product.delivery_price,
      recommended_product_ids: product.recommended_product_ids || [],
      stock: product.stock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, "3XL": 0, "4XL": 0, "5XL": 0, "36": 0, "38": 0, "40": 0, "42": 0, "44": 0, "46": 0, "48": 0 },
    });
    setEditingId(product.id);
    setEditingColor(null);
    setMainImageUrl("");
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

  const addMainImage = () => {
    if (!mainImageUrl.trim()) return;
    setForm((p) => ({ ...p, images: [...(p.images || []), mainImageUrl.trim()] }));
    setMainImageUrl("");
  };

  const removeMainImage = (i) => {
    setForm((p) => ({ ...p, images: (p.images || []).filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nom du produit requis");
    if (!form.price || parseInt(form.price) <= 0) return toast.error("Prix valide requis");

    setSaving(true);
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description?.trim() || null,
          price: parseInt(form.price),
          compare_price: form.compare_price !== "" && form.compare_price !== null ? parseInt(form.compare_price) : null,
          big_size_price: form.big_size_price !== "" && form.big_size_price !== null ? parseInt(form.big_size_price) : null,
          category_id: form.category_id || null,
          gender: form.gender,
          color_variants: form.color_variants,
          images: form.images || [],
          gif_url: form.gif_url?.trim() || null,
          show_gif_on_home: form.show_gif_on_home || false,
          is_new: form.is_new,
          is_trending: form.is_trending,
          is_coming_soon: form.is_coming_soon,
          delivery_price: form.delivery_price !== null && form.delivery_price !== "" ? parseInt(form.delivery_price) : null,
          stock: form.stock,
          recommended_product_ids: form.recommended_product_ids,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Produit modifié ✓" : "Produit créé ✓");
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
                  <img src={getFirstImage(product)} alt={product.name} className="w-full h-full object-contain" />
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
              
              {/* Pricing — simple TND integers */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Prix TND *</label>
                  <input type="number" step="1" min="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className={inputClass} placeholder="89" required />
                </div>
                <div>
                  <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Prix Barré TND</label>
                  <input type="number" step="1" min="0" value={form.compare_price} onChange={(e) => setForm((p) => ({ ...p, compare_price: e.target.value }))} className={inputClass} placeholder="120" />
                </div>
                <div>
                  <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Grandes Tailles TND</label>
                  <input type="number" step="1" min="0" value={form.big_size_price} onChange={(e) => setForm((p) => ({ ...p, big_size_price: e.target.value }))} className={inputClass} placeholder="99" />
                </div>
              </div>

              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Catégorie <span className="text-neutral-400 normal-case tracking-normal">(optionnel)</span></label>
                <select value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))} className={inputClass}>
                  <option value="">— Aucune catégorie —</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Genre</label>
                <div className="flex gap-3">
                  {[{ value: "men", label: "Homme" }, { value: "women", label: "Femme" }].map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setForm((p) => ({ ...p, gender: value }))}
                      className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${form.gender === value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Images principales */}
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-1.5">Images du produit <span className="text-neutral-400 normal-case tracking-normal">(URLs — JPG, PNG, GIF autorisés)</span></label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={mainImageUrl}
                    onChange={(e) => setMainImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMainImage(); } }}
                    className={inputClass}
                    placeholder="https://... (image ou GIF)"
                  />
                  <button type="button" onClick={addMainImage} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors whitespace-nowrap">
                    Ajouter
                  </button>
                </div>
                {(form.images || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(form.images || []).map((url, i) => (
                      <div key={i} className="relative w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden group border border-neutral-200">
                        <img src={url} alt="" className="w-full h-full object-contain" />
                        {url.toLowerCase().endsWith(".gif") && (
                          <span className="absolute top-0.5 left-0.5 bg-violet-500 text-white text-[8px] px-1 rounded font-bold">GIF</span>
                        )}
                        <button type="button" onClick={() => removeMainImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GIF principal pour la page d'accueil */}
              <div className="border border-violet-200 bg-violet-50/40 rounded-xl p-4 space-y-3">
                <label className="text-violet-900 text-xs tracking-wider uppercase block font-semibold">🎬 GIF page d&apos;accueil</label>
                <p className="text-violet-700 text-xs">Si vous ajoutez un lien GIF ici, il sera affiché et joué automatiquement sur la page d&apos;accueil à la place de l&apos;image principale.</p>
                <input
                  type="url"
                  value={form.gif_url}
                  onChange={(e) => setForm((p) => ({ ...p, gif_url: e.target.value }))}
                  className={inputClass}
                  placeholder="https://res.cloudinary.com/... (lien .gif)"
                />
                {form.gif_url && (
                  <div className="flex items-center gap-3">
                    <img src={form.gif_url} alt="GIF preview" className="w-16 h-16 object-contain rounded-lg border border-neutral-200 bg-neutral-100" />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.show_gif_on_home}
                        onChange={(e) => setForm((p) => ({ ...p, show_gif_on_home: e.target.checked }))}
                        className="w-4 h-4 rounded accent-violet-600"
                      />
                      <span className="text-sm text-neutral-700 font-medium">Afficher ce GIF sur la page d&apos;accueil</span>
                    </label>
                  </div>
                )}
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
                                    <img src={url} alt="" className="w-full h-full object-contain" />
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
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${form.delivery_price === null || form.delivery_price === undefined ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                    Gratuite
                  </button>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, delivery_price: p.delivery_price || "" }))}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${form.delivery_price !== null && form.delivery_price !== undefined ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                    Prix fixe (TND)
                  </button>
                </div>
                {form.delivery_price !== null && form.delivery_price !== undefined && (
                  <input type="number" step="1" min="0" value={form.delivery_price} onChange={(e) => setForm((p) => ({ ...p, delivery_price: e.target.value }))} className={inputClass} placeholder="Ex: 8" />
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-2">Stock S → XXL</label>
                <p className="text-neutral-400 text-[10px] mb-3">Cochez les tailles disponibles en stock.</p>
                <div className="grid grid-cols-5 gap-3">
                  {SIZES.map((size) => {
                    const qty = form.stock[size] || 0;
                    const isEnabled = qty > 0;
                    return (
                      <div key={size}>
                        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg hover:bg-neutral-50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={isEnabled}
                            onChange={(e) => {
                              const newQty = e.target.checked ? 999 : 0;
                              setForm((p) => ({ ...p, stock: { ...p.stock, [size]: newQty } }));
                            }}
                            className="w-4 h-4 rounded border-neutral-300 accent-neutral-900" 
                          />
                          <span className="text-sm font-medium text-neutral-700">{size}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-2">Stock Grandes Tailles (3XL → 5XL)</label>
                <div className="grid grid-cols-3 gap-3">
                  {BIG_SIZES.map((size) => {
                    const qty = form.stock[size] || 0;
                    const isEnabled = qty > 0;
                    return (
                      <div key={size}>
                        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg hover:bg-neutral-50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={isEnabled}
                            onChange={(e) => {
                              const newQty = e.target.checked ? 999 : 0;
                              setForm((p) => ({ ...p, stock: { ...p.stock, [size]: newQty } }));
                            }}
                            className="w-4 h-4 rounded border-neutral-300 accent-neutral-900" 
                          />
                          <span className="text-sm font-medium text-neutral-700">{size}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-neutral-500 text-xs tracking-wider uppercase block mb-2">Stock Tailles Européennes (36 → 48)</label>
                <div className="grid grid-cols-4 gap-3">
                  {EU_SIZES.map((size) => {
                    const qty = form.stock[size] || 0;
                    const isEnabled = qty > 0;
                    return (
                      <div key={size}>
                        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg hover:bg-neutral-50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={isEnabled}
                            onChange={(e) => {
                              const newQty = e.target.checked ? 999 : 0;
                              setForm((p) => ({ ...p, stock: { ...p.stock, [size]: newQty } }));
                            }}
                            className="w-4 h-4 rounded border-neutral-300 accent-neutral-900" 
                          />
                          <span className="text-sm font-medium text-neutral-700">{size}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

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
                            <img src={getFirstImage(p)} alt="" className="w-8 h-8 object-contain rounded flex-shrink-0" />
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
