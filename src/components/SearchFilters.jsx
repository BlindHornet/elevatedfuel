// Module Imports
import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchFilters({
  query,
  setQuery,
  activeTag,
  setActiveTag,
  tags,
  showAdvanced,
  onToggleAdvanced,
}) {
  return (
    <div className="space-y-6 mb-10">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fuel..."
            className="w-full rounded-2xl bg-card border border-border pl-11 pr-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
          />
        </div>

        <button
          onClick={onToggleAdvanced}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium border transition-all ${
            showAdvanced
              ? "bg-brand border-brand text-white"
              : "bg-card border-border text-text hover:border-brand"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Advanced</span>
        </button>
      </div>

      {!showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                activeTag === t
                  ? "bg-brand border-brand text-white"
                  : "bg-transparent border-border text-muted hover:border-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
