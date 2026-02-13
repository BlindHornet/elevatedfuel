// Module Imports
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Component Imports
import RecipeCard from "../components/RecipeCard";
import SearchFilters from "../components/SearchFilters";
import AdvancedFilters from "../components/AdvancedFilters";
import {
  RecipeGridSkeleton,
  ErrorState,
  EmptyState,
} from "../components/UIElements";

// Hook Imports
import useRecipes from "../hooks/useRecipes";

// Page Imports
import RecipeView from "../pages/ViewRecipe";
import WeeklyMealPlan from "./WeeklyMealPlan";

const TAGS = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
  "Ground Beef",
  "Chicken",
  "Slow Cooker",
];

const RECIPES_PER_PAGE = 9;

export default function Home() {
  // 1. DATA AND STATE MANAGEMENT
  const { recipes = [], loading, error } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  //const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [activePage, setActivePage] = useState("recipes");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState({
    servingTemp: "all", // 'all', 'hot', 'cold'
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

  // 2. LOGIC: Filtering recipes based on search and tags
  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (recipes || []).filter((r) => {
      const title = (r.title || "").toLowerCase();
      const recipeTags = Array.isArray(r.tags) ? r.tags : [];

      // 1. Search Match
      const matchesQuery =
        !q ||
        title.includes(q) ||
        recipeTags.some((t) => String(t).toLowerCase().includes(q));

      // 2. Tag Match (Combines both UI elements)
      const effectiveTags = showAdvanced
        ? advancedFilters.selectedTags
        : [activeTag];
      const matchesTags = showAdvanced
        ? effectiveTags.length === 0 ||
          effectiveTags.every((t) => recipeTags.includes(t))
        : activeTag === "All" || recipeTags.includes(activeTag);

      // 3. Nutrition Match
      let matchesNutrition = true;
      if (showAdvanced) {
        const checkRange = (value, min, max) => {
          const numValue = parseFloat(value);
          if (min !== "" && (isNaN(numValue) || numValue < parseFloat(min)))
            return false;
          if (max !== "" && (isNaN(numValue) || numValue > parseFloat(max)))
            return false;
          return true;
        };

        matchesNutrition =
          checkRange(
            r.macros?.calories,
            advancedFilters.caloriesMin,
            advancedFilters.caloriesMax,
          ) &&
          checkRange(
            r.macros?.carbs,
            advancedFilters.carbsMin,
            advancedFilters.carbsMax,
          ) &&
          checkRange(
            r.macros?.fat,
            advancedFilters.fatsMin,
            advancedFilters.fatsMax,
          ) &&
          checkRange(
            r.macros?.protein,
            advancedFilters.proteinMin,
            advancedFilters.proteinMax,
          );

        // Also check Serving Temp if in advanced mode
        if (advancedFilters.servingTemp !== "all") {
          matchesNutrition =
            matchesNutrition &&
            r.servingTemp?.toLowerCase() === advancedFilters.servingTemp;
        }
      }

      return matchesQuery && matchesTags && matchesNutrition;
    });
  }, [recipes, query, activeTag, showAdvanced, advancedFilters]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Sort by createdAt (newest first) and paginate
  const paginatedRecipes = useMemo(() => {
    const sorted = [...filteredRecipes].sort((a, b) => {
      // Check if createdAt is a Firebase Timestamp (has seconds/nanoseconds) or a Date
      const getTime = (val) => {
        if (!val) return 0;
        if (val.seconds) return val.seconds * 1000; // Firebase Timestamp
        return new Date(val).getTime(); // Date string or object
      };

      return getTime(b.createdAt) - getTime(a.createdAt); // Newest first (descending)
    });

    const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
    const endIndex = startIndex + RECIPES_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  }, [filteredRecipes, currentPage]);

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, activeTag, advancedFilters, showAdvanced]);

  const handleResetFilters = () => {
    setQuery("");
    setActiveTag("All");
    setAdvancedFilters({
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
    setShowAdvanced(false);
    setCurrentPage(1);
  };

  // 3. RENDER: Purely layout coordination
  return (
    <div className="min-h-screen bg-bg text-text selection:bg-brand/30">
      <main className="mx-auto max-w-6xl px-4 py-8 pb-32">
        {activePage === "mealplan" ? (
          <WeeklyMealPlan
            onOpenRecipeId={(id) => {
              const found = recipes.find((r) => r.id === id);
              if (found) {
                setSelectedRecipe(found);
                setActivePage("recipes");
              }
            }}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
              <div className="flex-1">
                <SearchFilters
                  query={query}
                  setQuery={setQuery}
                  activeTag={activeTag}
                  setActiveTag={setActiveTag}
                  tags={TAGS}
                  showAdvanced={showAdvanced}
                  onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
                />
              </div>
              <div className="text-[15px] uppercase tracking-widest text-white/40 font-bold md:mt-2">
                Total {filteredRecipes.length} Recipes
              </div>
            </div>

            {showAdvanced && (
              <AdvancedFilters
                filters={advancedFilters}
                setFilters={setAdvancedFilters}
                tags={TAGS.filter((t) => t !== "All")}
              />
            )}

            {loading ? (
              <RecipeGridSkeleton />
            ) : error ? (
              <ErrorState message={error?.message} />
            ) : filteredRecipes.length === 0 ? (
              <EmptyState onReset={handleResetFilters} />
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedRecipes.map((r) => (
                    <RecipeCard
                      key={r.id}
                      recipe={r}
                      onOpen={() => setSelectedRecipe(r)}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                    {/* First Page Button */}
                    {currentPage !== 1 && (
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="px-3 h-10 rounded-lg border border-border bg-card text-[10px] uppercase font-bold text-text hover:border-brand transition-all"
                      >
                        First
                      </button>
                    )}

                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border bg-card text-text hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {/* ... existing page numbers logic ... */}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border bg-card text-text hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Last Page Button */}
                    {currentPage !== totalPages && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 h-10 rounded-lg border border-border bg-card text-[10px] uppercase font-bold text-text hover:border-brand transition-all"
                      >
                        Last
                      </button>
                    )}
                  </div>
                )}

                {/* Results info */}
                <div className="mt-6 text-center text-sm text-muted">
                  Showing {(currentPage - 1) * RECIPES_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * RECIPES_PER_PAGE,
                    filteredRecipes.length,
                  )}{" "}
                  of {filteredRecipes.length} recipe
                  {filteredRecipes.length !== 1 ? "s" : ""}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* 4. MODALS AND OVERLAYS */}
      {selectedRecipe && (
        <RecipeView
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onNavigateMealPlan={() => setActivePage("mealplan")}
          onDeleted={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
