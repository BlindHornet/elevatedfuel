// Module Imports
import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom"; // Added for URL persistence

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
  const [searchParams, setSearchParams] = useSearchParams();

  // Modal state remains local as it doesn't need to persist in URL
  const [selectedRecipe, setSelectedRecipe] = React.useState(null);
  const [activePage, setActivePage] = React.useState("recipes");
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Derived state from URL Search Parameters
  const query = searchParams.get("q") || "";
  const activeTag = searchParams.get("tag") || "All";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Advanced filter state (kept local but could be synced if needed)
  const [advancedFilters, setAdvancedFilters] = React.useState({
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

  // State Update Helpers
  const setQuery = (newQuery) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newQuery) nextParams.set("q", newQuery);
    else nextParams.delete("q");
    nextParams.set("page", "1"); // Reset pagination on search
    setSearchParams(nextParams);
  };

  const setActiveTag = (newTag) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tag", newTag);
    nextParams.set("page", "1"); // Reset pagination on filter
    setSearchParams(nextParams);
  };

  const setCurrentPage = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", newPage.toString());
    setSearchParams(nextParams);
  };

  // 2. LOGIC: Filtering recipes
  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (recipes || []).filter((r) => {
      const title = (r.title || "").toLowerCase();
      const recipeTags = Array.isArray(r.tags) ? r.tags : [];

      const matchesQuery =
        !q ||
        title.includes(q) ||
        recipeTags.some((t) => String(t).toLowerCase().includes(q));

      const effectiveTags = showAdvanced
        ? advancedFilters.selectedTags
        : [activeTag];
      const matchesTags = showAdvanced
        ? effectiveTags.length === 0 ||
          effectiveTags.every((t) => recipeTags.includes(t))
        : activeTag === "All" || recipeTags.includes(activeTag);

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

        if (advancedFilters.servingTemp !== "all") {
          matchesNutrition =
            matchesNutrition &&
            r.servingTemp?.toLowerCase() === advancedFilters.servingTemp;
        }
      }

      return matchesQuery && matchesTags && matchesNutrition;
    });
  }, [recipes, query, activeTag, showAdvanced, advancedFilters]);

  // Scroll to top when page changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Sort by createdAt (newest first) and paginate
  const paginatedRecipes = useMemo(() => {
    const sorted = [...filteredRecipes].sort((a, b) => {
      const getTime = (val) => {
        if (!val) return 0;
        if (val.seconds) return val.seconds * 1000;
        return new Date(val).getTime();
      };
      return getTime(b.createdAt) - getTime(a.createdAt);
    });

    const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
    const endIndex = startIndex + RECIPES_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  }, [filteredRecipes, currentPage]);

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

  const handleResetFilters = () => {
    setSearchParams({}); // Clear all URL params
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
  };

  // 3. RENDER
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
                    {currentPage !== 1 && (
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="px-3 h-10 rounded-lg border border-border bg-card text-[10px] uppercase font-bold text-text hover:border-brand transition-all"
                      >
                        First
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border bg-card text-text hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted px-4">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border bg-card text-text hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

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

                <div className="mt-6 text-center text-sm text-muted">
                  Showing {(currentPage - 1) * RECIPES_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * RECIPES_PER_PAGE,
                    filteredRecipes.length,
                  )}{" "}
                  of {filteredRecipes.length} recipes
                </div>
              </>
            )}
          </>
        )}
      </main>

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
