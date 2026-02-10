// Module Imports
import React, { useEffect } from "react";
import { X } from "lucide-react";

// Reusable Skeleton using theme variables
export function RecipeGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[var(--radius-lg)] bg-card border border-border"
        >
          <div className="aspect-[16/10] w-full bg-white/5 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
            </div>
            <div className="h-16 w-full bg-white/5 rounded-2xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Standard Error State
export function ErrorState({ message }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-card p-10 text-center border border-border">
      <div className="text-lg font-semibold text-text">Database error</div>
      <div className="mt-2 text-sm text-muted">
        {message || "Something went wrong while loading recipes."}
      </div>
    </div>
  );
}

// State for when no search results are found
export function EmptyState({ onReset }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-card p-10 text-center border border-border">
      <div className="text-lg font-semibold text-text">No recipes found</div>
      <div className="mt-2 text-sm text-muted">
        Your database returned no results.
      </div>
      <div className="mt-6 flex justify-center">
        <button
          onClick={onReset}
          className="rounded-xl bg-brand px-6 py-2 text-sm font-bold uppercase tracking-wider text-white hover:opacity-90 transition-all"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}

// Global Modal Wrapper
export function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[var(--radius-lg)] bg-card border border-border shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur">
          <div className="font-bold text-lg tracking-tight text-text">
            {title}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10 text-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
