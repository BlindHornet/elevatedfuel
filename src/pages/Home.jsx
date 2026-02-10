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
            r.macros?.fats,
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

  // Sort by createdAt (newest first) and paginate
  const paginatedRecipes = useMemo(() => {
    const sorted = [...filteredRecipes].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA; // Newest first
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
            <SearchFilters
              query={query}
              setQuery={setQuery}
              activeTag={activeTag}
              setActiveTag={setActiveTag}
              tags={TAGS}
              showAdvanced={showAdvanced}
              onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            />

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
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border bg-card text-text hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage =
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            Math.abs(pageNum - currentPage) <= 1;

                          const showEllipsis =
                            (pageNum === 2 && currentPage > 3) ||
                            (pageNum === totalPages - 1 &&
                              currentPage < totalPages - 2);

                          if (showEllipsis) {
                            return (
                              <span
                                key={pageNum}
                                className="px-2 text-muted text-sm"
                              >
                                ...
                              </span>
                            );
                          }

                          if (!showPage) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-all ${
                                currentPage === pageNum
                                  ? "bg-brand text-white border-brand"
                                  : "bg-card border border-border text-text hover:border-brand"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
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
