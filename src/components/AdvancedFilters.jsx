// Module Imports
import React from "react";
import { X, Thermometer, Tag, Zap, Activity } from "lucide-react";

// ✅ MOVED OUTSIDE: Defining this here prevents the "losing focus" issue
// because React no longer treats it as a new component on every render.
const NutritionInput = ({
  label,
  minKey,
  maxKey,
  colorClass,
  icon: Icon,
  filters,
  updateFilter,
}) => (
  <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:border-white/10">
    <div className="flex items-center gap-2">
      <div
        className={`p-1.5 rounded-lg bg-${colorClass}/10 text-${colorClass}`}
      >
        <Icon size={14} />
      </div>
      <label className="text-[11px] font-black uppercase tracking-widest text-text/70">
        {label}
      </label>
    </div>
    <div className="flex gap-2 items-center">
      <input
        type="number"
        min="0" // Prevents using the arrow keys to go below 0
        placeholder="Min"
        value={filters[minKey]}
        onChange={(e) => updateFilter(minKey, e.target.value)}
        className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-xs font-bold focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-muted/50"
      />
      <div className="w-2 h-px bg-border shrink-0" />
      <input
        type="number"
        min="0" // Prevents using the arrow keys to go below 0
        placeholder="Max"
        value={filters[maxKey]}
        onChange={(e) => updateFilter(maxKey, e.target.value)}
        className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-xs font-bold focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-muted/50"
      />
    </div>
  </div>
);

export default function AdvancedFilters({ filters, setFilters, tags }) {
  // ✅ UPDATED LOGIC: Prevent negative values from entering the state
  const updateFilter = (key, value) => {
    if (value !== "" && Number(value) < 0) return;
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
    <div className="bg-card border border-border rounded-[2rem] p-8 mb-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-brand rounded-full" />
          <h3 className="text-xl font-black uppercase tracking-tighter text-text">
            Refine <span className="text-brand">Fuel</span>
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-brand hover:bg-brand/10 transition-all flex items-center gap-2"
          >
            <X size={12} strokeWidth={3} />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 mb-8">
        {/* Serving Temperature */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted">
            <Thermometer size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Serving Temp
            </span>
          </div>
          <div className="flex p-1 bg-bg border border-border rounded-2xl">
            {["all", "hot", "cold"].map((temp) => (
              <button
                key={temp}
                onClick={() => updateFilter("servingTemp", temp)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filters.servingTemp === temp
                    ? "bg-brand text-white shadow-lg shadow-brand/20"
                    : "text-muted hover:text-text"
                }`}
              >
                {temp}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted">
            <Tag size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Dietary Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = filters.selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    isActive
                      ? "bg-brand/10 border-brand text-brand shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : "bg-bg border-border text-muted hover:border-muted/50"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nutrition Ranges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-border/50">
        <NutritionInput
          label="Calories"
          minKey="caloriesMin"
          maxKey="caloriesMax"
          colorClass="brand"
          icon={Zap}
          filters={filters}
          updateFilter={updateFilter}
        />
        <NutritionInput
          label="Protein"
          minKey="proteinMin"
          maxKey="proteinMax"
          colorClass="red-500"
          icon={Activity}
          filters={filters}
          updateFilter={updateFilter}
        />
        <NutritionInput
          label="Carbs"
          minKey="carbsMin"
          maxKey="carbsMax"
          colorClass="blue-500"
          icon={Activity}
          filters={filters}
          updateFilter={updateFilter}
        />
        <NutritionInput
          label="Fats"
          minKey="fatsMin"
          maxKey="fatsMax"
          colorClass="yellow-500"
          icon={Activity}
          filters={filters}
          updateFilter={updateFilter}
        />
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-8 px-5 py-3 bg-brand/5 border border-brand/10 rounded-2xl">
          <p className="text-[10px] font-bold text-brand uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Filtering by:{" "}
            <span className="text-text">
              {[
                filters.servingTemp !== "all" && `${filters.servingTemp} temp`,
                filters.selectedTags.length > 0 &&
                  `${filters.selectedTags.length} tags`,
                (filters.caloriesMin || filters.caloriesMax) && "calories",
                (filters.proteinMin || filters.proteinMax) && "protein",
                (filters.carbsMin || filters.carbsMax) && "carbs",
                (filters.fatsMin || filters.fatsMax) && "fats",
              ]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
