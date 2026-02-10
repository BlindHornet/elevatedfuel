// Module Imports
import React from "react";
import { X } from "lucide-react";

export default function AdvancedFilters({ filters, setFilters, tags }) {
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag) => {
    setFilters((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const hasActiveFilters =
    filters.servingTemp !== "all" ||
    filters.selectedTags.length > 0 ||
    filters.caloriesMin !== "" ||
    filters.caloriesMax !== "" ||
    filters.carbsMin !== "" ||
    filters.carbsMax !== "" ||
    filters.fatsMin !== "" ||
    filters.fatsMax !== "" ||
    filters.proteinMin !== "" ||
    filters.proteinMax !== "";

  const clearAll = () => {
    setFilters({
      servingTemp: "all",
      selectedTags: [],
      caloriesMin: "",
      caloriesMax: "",
      carbsMin: "",
      carbsMax: "",
      fatsMin: "",
      fatsMax: "",
      proteinMin: "",
      proteinMax: "",
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">Advanced Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-muted hover:text-brand transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Serving Temperature */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Serving Temperature
        </label>
        <div className="flex gap-2">
          {["all", "hot", "cold"].map((temp) => (
            <button
              key={temp}
              onClick={() => updateFilter("servingTemp", temp)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                filters.servingTemp === temp
                  ? "bg-brand border-brand text-white"
                  : "bg-transparent border-border text-muted hover:border-brand"
              }`}
            >
              {temp.charAt(0).toUpperCase() + temp.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Tags (select multiple)
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                filters.selectedTags.includes(tag)
                  ? "bg-brand border-brand text-white"
                  : "bg-transparent border-border text-muted hover:border-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Nutrition Ranges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text">
            Calories
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={filters.caloriesMin}
              onChange={(e) => updateFilter("caloriesMin", e.target.value)}
              className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
            <span className="text-muted text-sm">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.caloriesMax}
              onChange={(e) => updateFilter("caloriesMax", e.target.value)}
              className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text">
            Carbs (g)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={filters.carbsMin}
              onChange={(e) => updateFilter("carbsMin", e.target.value)}
              className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
            <span className="text-muted text-sm">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.carbsMax}
              onChange={(e) => updateFilter("carbsMax", e.target.value)}
              className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
          </div>
        </div>

        {/* Fats */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text">
            Fats (g)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={filters.fatsMin}
              onChange={(e) => updateFilter("fatsMin", e.target.value)}
              className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
            <span className="text-muted text-sm">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.fatsMax}
              onChange={(e) => updateFilter("fatsMax", e.target.value)}
              className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
          </div>
        </div>

        {/* Protein */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text">
            Protein (g)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={filters.proteinMin}
              onChange={(e) => updateFilter("proteinMin", e.target.value)}
              className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
            <span className="text-muted text-sm">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.proteinMax}
              onChange={(e) => updateFilter("proteinMax", e.target.value)}
              className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted">
            Active filters:{" "}
            {[
              filters.servingTemp !== "all" && filters.servingTemp,
              filters.selectedTags.length > 0 &&
                `${filters.selectedTags.length} tag${
                  filters.selectedTags.length > 1 ? "s" : ""
                }`,
              (filters.caloriesMin || filters.caloriesMax) && "calories",
              (filters.carbsMin || filters.carbsMax) && "carbs",
              (filters.fatsMin || filters.fatsMax) && "fats",
              (filters.proteinMin || filters.proteinMax) && "protein",
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
