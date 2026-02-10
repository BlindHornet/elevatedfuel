// Module Imports
import React, { useState, useEffect, useMemo } from "react";
import { Star, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

// Firebase Imports
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

function MacroBadge({ label, value, isHighlight }) {
  if (value == null || value === "") return null;
  return (
    <div
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
        isHighlight
          ? "bg-brand/10 border-brand/20 text-brand"
          : "bg-white/5 border-border text-muted"
      }`}
    >
      <span className={isHighlight ? "text-brand" : "text-brand/80"}>
        {label}:
      </span>{" "}
      {value}
      {label === "CAL" ? "" : "g"}
    </div>
  );
}

// Small helper for the star row
function MiniStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5 text-brand">
      <Star size={10} fill="currentColor" />
      <span className="text-[10px] font-black">
        {Number(rating || 0).toFixed(1)}
      </span>
    </div>
  );
}

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function RecipeCard({ recipe }) {
  const [comments, setComments] = useState([]);
  const [imageError, setImageError] = useState(false);
  const calories = recipe?.macros?.calories;
  const adminRating = recipe?.adminReviewScore || recipe?.adminRating || 0; // Admin review score
  const prep = recipe?.prepMinutes;
  const cook = recipe?.cookMinutes;

  // Fetch comments to calculate average user rating
  useEffect(() => {
    if (!recipe?.id) return;

    const commentsRef = collection(db, "recipes", recipe.id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [recipe?.id]);

  // Calculate average user rating from comments or use stored value
  const avgUserRating = useMemo(() => {
    // If admin has set avgUserRating directly, use that
    if (recipe?.avgUserRating != null && recipe.avgUserRating > 0) {
      return toNumber(recipe.avgUserRating);
    }
    // Otherwise calculate from comments
    if (comments.length === 0) return 0;
    const sum = comments.reduce((acc, rev) => acc + toNumber(rev.rating), 0);
    return sum / comments.length;
  }, [comments, recipe?.avgUserRating]);

  const hasImage = recipe.image && recipe.image.trim() !== "";
  const showNoImageText = !hasImage || imageError;

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group w-full block overflow-hidden rounded-[var(--radius-lg)] bg-card border border-border text-left transition-all duration-300 hover:border-brand/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
    >
      {/* IMAGE AREA */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
        {hasImage && !imageError ? (
          <img
            src={recipe.image.trim()}
            alt={recipe.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-start justify-center  pt-12 bg-gradient-to-br from-bg to-card">
            <span className="text-2xl font-black uppercase tracking-widest text-muted/30 ">
              No Image
            </span>
          </div>
        )}

        {/* RATINGS SECTION (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 bg-black/60 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 shadow-2xl">
          {/* Average User Rating */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
              Avg User Rating
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= avgUserRating
                      ? "fill-brand text-brand"
                      : "fill-white/20 text-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 w-full" />

          {/* Admin Rating */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
              Admin Rating
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= adminRating
                      ? "fill-brand text-brand"
                      : "fill-white/20 text-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          {/* TITLE */}
          <div className="text-base font-bold tracking-tight text-text line-clamp-2 group-hover:text-brand transition-colors">
            {recipe.title}
          </div>

          {/* TAGS (Preview) */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <div
                  key={index}
                  className="text-[9px] font-black uppercase tracking-widest text-brand/60 bg-brand/5 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO ROW */}
        <div className="flex items-center gap-4 border-t border-border/50 pt-4">
          {(prep != null || cook != null) && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted">
              <Clock className="h-3.5 w-3.5 text-brand" />
              <span>{Number(prep || 0) + Number(cook || 0)} MIN</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted">
              <Users className="h-3.5 w-3.5 text-brand" />
              <span>{recipe.servings} SERVING(S)</span>
            </div>
          )}
        </div>

        {/* MACROS & CALORIES ROW */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <MacroBadge label="P" value={recipe?.macros?.protein} />
            <MacroBadge label="C" value={recipe?.macros?.carbs} />
            <MacroBadge label="F" value={recipe?.macros?.fat} />
          </div>

          {calories != null && (
            <div className="text-right">
              <div className="text-[10px] font-black text-muted uppercase tracking-tighter">
                Calories
              </div>
              <div className="text-sm font-black text-text leading-none">
                {calories}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
