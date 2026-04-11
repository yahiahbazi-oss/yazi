"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="font-serif text-3xl text-center tracking-[0.2em] uppercase mb-2">
          YAZI
        </h1>
        <p className="text-center text-neutral-400 text-sm mb-10">Panneau Administration</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-neutral-500 text-xs tracking-widest uppercase block mb-2">
              Mot de Passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors"
              placeholder="Entrez le mot de passe admin"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white py-3 rounded-lg text-sm tracking-widest uppercase font-medium transition-colors"
          >
            {loading ? "Connexion..." : "Se Connecter"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
