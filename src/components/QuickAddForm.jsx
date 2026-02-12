import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Tag, Sparkles, Zap, Trash2 } from "lucide-react";
import { createRecipe } from "../lib/addRecipeService";

export default function QuickAddForm({ onCreated, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [form, setForm] = useState({
    title: "",
    mediaUrl: "",
    tagsText: "",
    previewImage: "",
  });

  // NEW: Image Fetching Logic (Mirrored from AddRecipeForm)
  useEffect(() => {
    const fetchPreview = async () => {
      const url = form.mediaUrl.trim();
      if (!url || !url.startsWith("http")) return;

      const ytMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?]+)/,
      );
      if (ytMatch) {
        setForm((prev) => ({
          ...prev,
          previewImage: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
        }));
        return;
      }

      setIsAutoFetching(true);
      try {
        const response = await fetch(
          `https://api.microlink.io?url=${encodeURIComponent(url)}`,
        );
        const result = await response.json();
        if (result.status === "success" && result.data.image?.url) {
          setForm((prev) => ({ ...prev, previewImage: result.data.image.url }));
        }
      } catch (err) {
        console.error("Failed to fetch preview:", err);
      } finally {
        setIsAutoFetching(false);
      }
    };

    const timer = setTimeout(fetchPreview, 800);
    return () => clearTimeout(timer);
  }, [form.mediaUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRecipe({
        title: form.title,
        description:
          "Quickly added recipe, will return and edit details later.",
        "url-link": form.mediaUrl,
        image: form.previewImage || "", // Save fetched thumbnail
        tags: form.tagsText
          ? form.tagsText
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : [],
        status: "Pending",
        ingredients: [],
        steps: [],
        macros: { calories: "", protein: "", carbs: "", fat: "" },
        createdAt: new Date().toISOString(),
      });
      onCreated();
    } catch (err) {
      console.error(err);
      alert("Error saving recipe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-brand/30 rounded-full blur-[120px] animate-pulse" />
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="relative p-10">
            <div className="mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-600/20 backdrop-blur-xl border border-brand/30 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-brand" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white mb-1">
                    Quick Add
                  </h1>
                  <p className="text-sm text-white/40 tracking-wide">
                    Save recipes instantly
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="group">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-[0.2em] mb-3">
                  Recipe Name *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Recipe name..."
                  className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-6 py-5 text-white border border-white/[0.08] outline-none transition-all focus:border-brand/50"
                />
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-white/60 uppercase tracking-[0.2em]">
                    <LinkIcon size={14} /> Media Link
                  </label>
                  {isAutoFetching && (
                    <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <input
                  type="url"
                  value={form.mediaUrl}
                  onChange={(e) =>
                    setForm({ ...form, mediaUrl: e.target.value })
                  }
                  placeholder="YouTube, TikTok, Instagram link..."
                  className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-6 py-5 text-white border border-white/[0.08] outline-none focus:border-brand/50"
                />

                {/* NEW: Thumbnail Preview UI */}
                {form.previewImage && (
                  <div className="mt-4 relative group max-w-sm rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={form.previewImage}
                      alt="Preview"
                      className="w-full h-auto object-cover aspect-video"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, previewImage: "" }))
                      }
                      className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/60 uppercase tracking-[0.2em] mb-3">
                  <Tag size={14} /> Tags
                </label>
                <input
                  value={form.tagsText}
                  onChange={(e) =>
                    setForm({ ...form, tagsText: e.target.value })
                  }
                  placeholder="Dinner, High Protein..."
                  className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-6 py-5 text-white border border-white/[0.08] outline-none focus:border-brand/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] text-white/60 font-semibold tracking-wide hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="group relative flex-1 px-8 py-5 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-600" />
            <span className="relative flex items-center justify-center gap-2 text-white font-semibold tracking-wide">
              {submitting ? (
                "Saving..."
              ) : (
                <>
                  <Sparkles size={18} /> Save Recipe
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
