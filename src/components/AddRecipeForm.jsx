// Module Imports
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Star,
  StarHalf,
  ChefHat,
  Clock,
  Users,
  Flame,
  Thermometer,
  Link as LinkIcon,
} from "lucide-react";

// Firebase Imports
import { createRecipe } from "../lib/addRecipeService";
import { auth } from "../lib/firebase";

const UNIT_OPTIONS = [
  "g",
  "oz",
  "lb",
  "ml",
  "tsp",
  "tbsp",
  "cup",
  "pcs",
  "can",
  "jar",
  "whole",
  "packet",
  "box",
  "serving",
];

const DEFAULT_RECIPE = {
  title: "",
  description: "",
  tagsText: "",
  prepMinutes: "",
  cookMinutes: "",
  servings: "",
  servingTemp: "hot",
  macros: { calories: "", protein: "", carbs: "", fat: "" },
  mediaUrl: "",
  previewImage: "",
  ingredients: [{ qty: "", unit: "g", item: "" }],
  steps: [{ text: "" }],
  rating: 0,
  avgUserRating: 0,
  adminReviewScore: 0,
  submissionComment: "",
};

function StarRating({ value, onChange, disabled }) {
  const handleMove = (e, index) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    onChange(index + (isHalf ? 0.5 : 1));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const displayValue = i + 1;
          const isFull = value >= displayValue;
          const isHalf = value >= i + 0.5 && value < displayValue;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={(e) => handleMove(e, i)}
              className={`p-1 transition-all hover:scale-125 ${
                isFull || isHalf ? "text-brand" : "text-white/10"
              }`}
            >
              {isHalf ? (
                <StarHalf size={32} fill="currentColor" />
              ) : (
                <Star size={32} fill={isFull ? "currentColor" : "none"} />
              )}
            </button>
          );
        })}
      </div>
      <span className="text-xs font-black text-brand tracking-widest uppercase">
        {value > 0 ? `${value} Stars` : "No Rating Set"}
      </span>
    </div>
  );
}

export default function AddRecipeForm({
  initialRecipe = null,
  onSubmit = null,
  onCreated,
  onCancel,
  headerText = "Create New Recipe",
  submitText = "Create Recipe",
}) {
  const [form, setForm] = useState(initialRecipe || DEFAULT_RECIPE);
  const [submitting, setSubmitting] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

  const normalizeEmail = (v) => (v || "").trim().toLowerCase();
  const isAdminEmail = (email) =>
    normalizeEmail(email) &&
    normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL);

  // keep these (not used by UI, but fine)
  const currentUser = auth.currentUser;
  const isAdmin = isAdminEmail(currentUser?.email);

  useEffect(() => {
    if (!initialRecipe) return;

    const incoming = initialRecipe;

    // map rating field from stored adminRating/userRating if present
    const hydratedRating =
      Number(
        incoming.adminRating ?? incoming.userRating ?? incoming.rating ?? 0,
      ) || 0;

    const hydrated = {
      ...DEFAULT_RECIPE,
      ...incoming,

      macros: { ...DEFAULT_RECIPE.macros, ...(incoming.macros || {}) },

      previewImage: incoming.previewImage || incoming.image || "",
      mediaUrl: incoming.mediaUrl || incoming["url-link"] || "",
      rating: hydratedRating,

      tagsText: Array.isArray(incoming.tags)
        ? incoming.tags.join(", ")
        : incoming.tagsText || "",
    };

    hydrated.ingredients =
      Array.isArray(incoming.ingredients) && incoming.ingredients.length
        ? incoming.ingredients
        : DEFAULT_RECIPE.ingredients;

    hydrated.steps =
      Array.isArray(incoming.steps) && incoming.steps.length
        ? incoming.steps
        : DEFAULT_RECIPE.steps;

    setForm(hydrated);
  }, [initialRecipe]);

  // Image Fetching Logic
  useEffect(() => {
    const fetchPreview = async () => {
      const url = form.mediaUrl.trim();
      if (!url || !url.startsWith("http")) return;

      // 1. YouTube Direct Extraction (Instant & Reliable)
      const ytMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?]+)/,
      );
      if (ytMatch) {
        update(
          "previewImage",
          `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
        );
        return;
      }

      // 2. Microlink for Everything Else (Instagram, TikTok, Pinterest)
      setIsAutoFetching(true);
      try {
        const response = await fetch(
          `https://api.microlink.io?url=${encodeURIComponent(url)}`,
        );
        const result = await response.json();

        if (result.status === "success" && result.data.image?.url) {
          update("previewImage", result.data.image.url);
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

  const isEditMode = initialRecipe !== null && onSubmit !== null;

  const update = (path, val) => {
    setForm((prev) => {
      const next = { ...prev };
      if (path.includes(".")) {
        const [k1, k2] = path.split(".");
        next[k1] = { ...next[k1], [k2]: val };
      } else {
        next[path] = val;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Re-check admin at submit-time
      const isAdminNow = isAdminEmail(auth.currentUser?.email);

      // Do NOT persist the UI rating field directly.
      // Admin submissions => both adminReviewScore and avgUserRating
      // Non-admin submissions => userRating
      const { rating, ...formWithoutRating } = form;
      const ratingValue = Number(rating || 0);

      const submissionData = {
        ...formWithoutRating,
        image: form.previewImage || "",
        "url-link": form.mediaUrl,
        ingredients: [...form.ingredients].reverse(),
        steps: [...form.steps].reverse(),

        status: isAdminNow ? "Approved" : "Pending",

        avgUserRating: Number(form.avgUserRating || 0),
        adminReviewScore: isAdminNow ? Number(form.adminReviewScore || 0) : 0,
        ...(isAdminNow
          ? { adminRating: ratingValue }
          : { userRating: ratingValue }),

        tags: form.tagsText
          ? form.tagsText
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
      };

      if (isEditMode) await onSubmit(submissionData);
      else {
        await createRecipe(submissionData);

        setForm(DEFAULT_RECIPE);
      }

      onCreated();

      //window.scrollTo(0, 0); This should now be handled in my ScrollToTop component
    } catch (err) {
      console.error(err);
      alert("Error saving recipe.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-muted/40";
  const labelClass =
    "text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-3 flex items-center gap-2";
  const sectionClass = "bg-card border border-border rounded-2xl p-6 shadow-sm";

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
      {/* HERO HEADER */}
      <div
        className={`${sectionClass} bg-gradient-to-br from-card to-bg relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand/10 rounded-2xl">
              <ChefHat className="w-6 h-6 text-brand" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-text">
              {headerText}
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>
                <span>Recipe Name *</span>
              </label>
              <input
                required
                className={`${inputClass} text-lg font-bold`}
                placeholder="e.g. Garlic Butter Salmon"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span>Description *</span>
              </label>
              <textarea
                required
                className={`${inputClass} resize-none min-h-[120px]`}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA URL & PREVIEW */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-1">
          <label className={labelClass}>
            <LinkIcon size={14} />
            <span>Media (URL-Link)</span>
          </label>
          {isAutoFetching && (
            <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <input
          type="url"
          className={inputClass}
          placeholder="Paste YouTube, Instagram, TikTok, or Pinterest link..."
          value={form.mediaUrl}
          onChange={(e) => update("mediaUrl", e.target.value)}
        />

        {form.previewImage && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">
              Auto-Fetched Thumbnail:
            </p>
            <div className="relative group max-w-sm rounded-2xl overflow-hidden border border-border shadow-md mx-auto sm:mx-0">
              <img
                src={form.previewImage}
                alt="Preview"
                className="w-full h-auto object-cover aspect-video"
              />
              <button
                type="button"
                onClick={() => update("previewImage", "")}
                className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILS GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={sectionClass}>
          <label className={labelClass}>
            <Clock size={16} />
            <span>Prep Time *</span>
          </label>
          <input
            type="number"
            required
            className={inputClass}
            value={form.prepMinutes}
            onChange={(e) => update("prepMinutes", e.target.value)}
          />
        </div>
        <div className={sectionClass}>
          <label className={labelClass}>
            <Flame size={16} />
            <span>Cook Time *</span>
          </label>
          <input
            type="number"
            required
            className={inputClass}
            value={form.cookMinutes}
            onChange={(e) => update("cookMinutes", e.target.value)}
          />
        </div>
        <div className={sectionClass}>
          <label className={labelClass}>
            <Users size={16} />
            <span>Servings *</span>
          </label>
          <input
            type="number"
            required
            className={inputClass}
            value={form.servings}
            onChange={(e) => update("servings", e.target.value)}
          />
        </div>
        <div className={sectionClass}>
          <label className={labelClass}>
            <Thermometer size={16} />
            <span>Serve *</span>
          </label>
          <select
            required
            className={inputClass}
            value={form.servingTemp}
            onChange={(e) => update("servingTemp", e.target.value)}
          >
            <option value="hot">Hot</option>
            <option value="cold">Cold</option>
          </select>
        </div>
      </div>

      {/* MACROS */}
      <div className={sectionClass}>
        <label className={labelClass}>
          <span>Macros (Per Serving) *</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["calories", "protein", "carbs", "fat"].map((macro) => (
            <div key={macro}>
              <label className="text-[9px] uppercase font-black text-muted mb-1 block">
                {macro}
              </label>
              <input
                type="number"
                required
                className={inputClass}
                value={form.macros[macro]}
                onChange={(e) => update(`macros.${macro}`, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* INGREDIENTS */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-6">
          <label className={labelClass}>
            <span>Ingredients *</span>
          </label>
          <button
            type="button"
            onClick={() =>
              update("ingredients", [
                { qty: "", unit: "g", item: "" },
                ...form.ingredients,
              ])
            }
            className="px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-black uppercase text-brand flex items-center gap-2 hover:bg-brand/20 transition-all"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
        <div className="space-y-3">
          {form.ingredients.map((ing, i) => (
            <div
              key={i}
              className="flex gap-2 p-2 bg-bg/50 rounded-xl border border-border/50"
            >
              <input
                placeholder="Qty"
                className="w-20 bg-card border border-border rounded-lg px-3 py-2 text-sm"
                value={ing.qty}
                onChange={(e) => {
                  const next = [...form.ingredients];
                  next[i].qty = e.target.value;
                  update("ingredients", next);
                }}
              />
              <select
                className="bg-card border border-border rounded-lg px-2 py-2 text-xs"
                value={ing.unit}
                onChange={(e) => {
                  const next = [...form.ingredients];
                  next[i].unit = e.target.value;
                  update("ingredients", next);
                }}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <input
                placeholder="Item..."
                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm"
                value={ing.item}
                onChange={(e) => {
                  const next = [...form.ingredients];
                  next[i].item = e.target.value;
                  update("ingredients", next);
                }}
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "ingredients",
                    form.ingredients.filter((_, idx) => idx !== i),
                  )
                }
                className="p-2 text-muted hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-6">
          <label className={labelClass}>
            <span>Instructions *</span>
          </label>
          <button
            type="button"
            onClick={() => update("steps", [{ text: "" }, ...form.steps])}
            className="px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-black uppercase text-brand flex items-center gap-2 hover:bg-brand/20 transition-all"
          >
            <Plus size={14} /> Add Step
          </button>
        </div>
        <div className="space-y-4">
          {form.steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 bg-bg/50 rounded-xl border border-border/50"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand/20 border-2 border-brand/40 flex items-center justify-center text-xs font-black text-brand">
                {form.steps.length - i}
              </div>
              <textarea
                className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-sm resize-none min-h-[80px]"
                value={step.text}
                onChange={(e) => {
                  const next = [...form.steps];
                  next[i].text = e.target.value;
                  update("steps", next);
                }}
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "steps",
                    form.steps.filter((_, idx) => idx !== i),
                  )
                }
                className="p-2 text-muted hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RATING & TAGS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={sectionClass}>
          <label className={labelClass}>
            <Star size={16} />
            <span>Official Rating</span>
          </label>
          <StarRating
            value={form.rating}
            onChange={(v) => update("rating", v)}
            disabled={submitting}
          />
        </div>
        <div className={sectionClass}>
          <label className={labelClass}>
            <span>Tags *</span>
          </label>
          <input
            required
            className={inputClass}
            placeholder="High Protein, Dinner..."
            value={form.tagsText}
            onChange={(e) => update("tagsText", e.target.value)}
          />
        </div>
      </div>

      {/* SUBMIT ACTIONS */}
      <div className={`${sectionClass} bg-gradient-to-br from-brand/5 to-bg`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-full border-2 border-border text-sm font-black uppercase tracking-widest text-muted hover:text-text transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-4 rounded-full bg-brand text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
          >
            {submitting ? "Saving Recipe..." : submitText}
          </button>
        </div>
      </div>
    </form>
  );
}
