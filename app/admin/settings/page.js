"use client";

import { useEffect, useState } from "react";
import { Settings, Video, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/settings");
      const data = await res.json();
      const url = data.settings?.hero_video_url || "";
      setVideoUrl(url);
      setOriginal(url);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return toast.error("L'URL est requise");
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero_video_url: videoUrl.trim() }),
      });
      if (!res.ok) throw new Error();
      setOriginal(videoUrl.trim());
      toast.success("Paramètres enregistrés");
    } catch {
      toast.error("Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const changed = videoUrl !== original;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Paramètres du site
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Personnalisez l&apos;apparence de votre boutique</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-neutral-900 font-medium mb-1 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Vidéo hero de la page d&apos;accueil
            </h2>
            <p className="text-neutral-400 text-xs mb-4">
              Collez l&apos;URL directe d&apos;une vidéo (Cloudinary, CDN, etc.). Formats supportés : mp4, webm.
            </p>

            {loading ? (
              <div className="h-10 bg-neutral-100 rounded-lg animate-pulse" />
            ) : (
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg text-neutral-900 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-400 transition-colors bg-white"
                placeholder="https://res.cloudinary.com/.../video.webm"
              />
            )}
          </div>

          {/* Video preview */}
          {videoUrl && (
            <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 aspect-video">
              <video
                key={videoUrl}
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !changed || loading}
            className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-40 transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
