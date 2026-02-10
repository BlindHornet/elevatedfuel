// Module Imports
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash2,
  GripVertical,
  Calendar,
  Eye,
} from "lucide-react";

// Firebase Imports
import { db, auth } from "../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  onSnapshot,
} from "firebase/firestore";

const MEALS = ["Breakfast", "Snack", "Lunch", "Snack", "Dinner", "Dessert"];
const DAYS_TO_SHOW = 7; // Show 7 days rolling

// Generate day keys based on date
function getDayKey(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}

function getDayLabel(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function weekKey(startDate) {
  // Use the start date to create a unique key for this 7-day period
  return getDayKey(startDate);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmt(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function emptySlots() {
  const slots = {};
  // Create slots for 7 days from start date
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const dayKey = `day_${i}`; // day_0, day_1, day_2, etc.
    slots[dayKey] = {};
    for (let j = 0; j < MEALS.length; j++) {
      slots[dayKey][`${MEALS[j]}_${j}`] = null;
    }
  }
  return slots;
}

export default function WeeklyMealPlan() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState(() => emptySlots());
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [error, setError] = useState("");
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'library', id } or { type: 'slot', day, meal }
  const [selectedRecipeForMobile, setSelectedRecipeForMobile] = useState(null); // For mobile tap-to-add

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const periodId = useMemo(() => weekKey(startDate), [startDate]);
  const endDate = useMemo(
    () => addDays(startDate, DAYS_TO_SHOW - 1),
    [startDate],
  );

  useEffect(() => {
    if (!currentUser) return;
    const recipesRef = collection(
      db,
      "users",
      currentUser.uid,
      "mealPlanRecipes",
    );
    return onSnapshot(recipesRef, (snapshot) => {
      setAvailableRecipes(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
  }, [currentUser]);

  useEffect(() => {
    async function loadWeek() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const snap = await getDoc(
          doc(db, "users", currentUser.uid, "mealPlans", periodId),
        );
        setSlots(snap.exists() ? snap.data().slots : emptySlots());
      } catch (e) {
        setError("Could not load meal plan.");
      } finally {
        setLoading(false);
      }
    }
    loadWeek();
  }, [periodId, currentUser]);

  async function saveSlots(newSlots) {
    if (!currentUser) return;
    try {
      await setDoc(
        doc(db, "users", currentUser.uid, "mealPlans", periodId),
        {
          periodId,
          startDate: startDate.toISOString(),
          slots: newSlots,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (e) {
      setError("Could not save changes.");
    }
  }

  const handleDrop = async (targetDay, targetMeal) => {
    if (!draggedRecipe) return;
    const { recipe, sourceDay, sourceMeal } = draggedRecipe;
    const newSlots = structuredClone(slots);
    if (sourceDay && sourceMeal) newSlots[sourceDay][sourceMeal] = null;
    newSlots[targetDay][targetMeal] = {
      recipeId: recipe.recipeId || recipe.id,
      title: recipe.title,
    };
    setSlots(newSlots);
    await saveSlots(newSlots);
    setDraggedRecipe(null);
  };

  const handleDeleteFromLibrary = async (recipeId) => {
    if (!currentUser) return;
    try {
      await deleteDoc(
        doc(db, "users", currentUser.uid, "mealPlanRecipes", recipeId),
      );
      setDeleteConfirm(null);
    } catch (e) {
      console.error("Error deleting recipe:", e);
      alert("Failed to delete recipe from library.");
    }
  };

  const handleDeleteFromSlot = async (day, mealKey) => {
    const newSlots = structuredClone(slots);
    newSlots[day][mealKey] = null;
    setSlots(newSlots);
    await saveSlots(newSlots);
    setDeleteConfirm(null);
  };

  const handleMobileTapToAdd = async (day, mealKey) => {
    if (!selectedRecipeForMobile) return;

    const newSlots = structuredClone(slots);
    newSlots[day][mealKey] = {
      recipeId: selectedRecipeForMobile.recipeId || selectedRecipeForMobile.id,
      title: selectedRecipeForMobile.title,
    };
    setSlots(newSlots);
    await saveSlots(newSlots);
    setSelectedRecipeForMobile(null);
  };

  if (!currentUser)
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text font-black uppercase">
        Please Log In
      </div>
    );

  return (
    <div className="min-h-screen bg-bg pb-20 text-text">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              Meal Plan
            </h1>
            <div className="text-sm text-muted">
              {fmt(startDate)} – {fmt(endDate)}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStartDate(addDays(startDate, -7))}
              className="p-2 rounded-xl border border-border bg-card hover:bg-bg transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setStartDate(today);
              }}
              className="px-4 py-2 rounded-xl border border-border bg-card font-bold text-sm hover:bg-bg transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setStartDate(addDays(startDate, 7))}
              className="p-2 rounded-xl border border-border bg-card hover:bg-bg transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px,1fr] gap-6">
          {/* SIDEBAR - RECIPE LIBRARY */}
          <div className="bg-card border border-border rounded-2xl p-4 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand mb-4">
              My Recipes ({availableRecipes.length})
            </h3>
            {selectedRecipeForMobile && (
              <div className="mb-3 p-2 bg-brand/10 border border-brand/20 rounded-lg text-xs text-brand font-bold text-center">
                Tap a meal slot to add: {selectedRecipeForMobile.title}
              </div>
            )}
            <div className="space-y-2">
              {availableRecipes.length === 0 ? (
                <div className="text-sm text-muted text-center py-8">
                  No recipes yet. Add recipes from the recipe viewer!
                </div>
              ) : (
                availableRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedRecipe({ recipe });
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onClick={() => {
                      // On mobile, tap to select recipe
                      if (window.innerWidth < 1024) {
                        setSelectedRecipeForMobile(recipe);
                      }
                    }}
                    className={`bg-bg border rounded-xl p-3 cursor-move hover:border-brand/40 transition-all group ${
                      selectedRecipeForMobile?.id === recipe.id
                        ? "border-brand bg-brand/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical
                        size={16}
                        className="text-muted group-hover:text-brand flex-shrink-0"
                      />
                      <span className="text-sm font-bold truncate flex-1">
                        {recipe.title}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recipe/${recipe.recipeId}`);
                          }}
                          className="p-1.5 rounded-lg hover:bg-brand/10 text-muted hover:text-brand transition-all"
                          title="View Recipe"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({
                              type: "library",
                              id: recipe.id,
                            });
                          }}
                          className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-all"
                          title="Remove from Library"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CALENDAR GRID */}
          <div className="bg-card border border-border rounded-2xl p-4">
            {loading ? (
              <div className="text-center py-20 text-muted font-bold uppercase tracking-widest">
                Loading Plan...
              </div>
            ) : (
              <>
                {/* DESKTOP VIEW */}
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-[900px]">
                    {/* Header Row: Dates */}
                    <div className="grid grid-cols-7 gap-3 mb-4">
                      {Array.from({ length: DAYS_TO_SHOW }).map((_, idx) => {
                        const date = addDays(startDate, idx);
                        const isToday =
                          date.toDateString() === new Date().toDateString();
                        const dayLabel = getDayLabel(date);

                        return (
                          <div
                            key={`day-${idx}`}
                            className={`text-center p-3 rounded-xl border ${isToday ? "bg-brand/10 border-brand/40" : "bg-bg border-border"}`}
                          >
                            <div
                              className={`font-black text-sm ${isToday ? "text-brand" : ""}`}
                            >
                              {dayLabel}
                            </div>
                            <div className="text-xs text-muted">
                              {fmt(date)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Meal Rows */}
                    <div className="grid grid-cols-7 gap-3">
                      {MEALS.map((mealType, mIdx) => (
                        <React.Fragment key={`${mealType}-${mIdx}`}>
                          {Array.from({ length: DAYS_TO_SHOW }).map(
                            (_, dayIdx) => {
                              const dayKey = `day_${dayIdx}`;
                              const mealKey = `${mealType}_${mIdx}`;
                              const cell = slots[dayKey]?.[mealKey];

                              return (
                                <div
                                  key={`${dayKey}-${mealKey}`}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={() => handleDrop(dayKey, mealKey)}
                                  className={`min-h-[110px] rounded-xl border-2 border-dashed p-2 transition-all ${
                                    cell
                                      ? "bg-brand/5 border-brand/20"
                                      : "bg-bg/50 border-border hover:border-brand/30"
                                  }`}
                                >
                                  <div className="text-[10px] font-black uppercase text-muted mb-2 tracking-tighter">
                                    {mealType}
                                  </div>
                                  {cell ? (
                                    <div
                                      draggable
                                      onDragStart={(e) => {
                                        setDraggedRecipe({
                                          recipe: cell,
                                          sourceDay: dayKey,
                                          sourceMeal: mealKey,
                                        });
                                        e.dataTransfer.effectAllowed = "move";
                                      }}
                                      className="bg-card border border-brand/20 rounded-lg p-2 h-[70px] flex flex-col justify-between cursor-move shadow-sm hover:shadow-md transition-all"
                                    >
                                      <div className="text-xs font-bold truncate mb-2">
                                        {cell.title}
                                      </div>
                                      <div className="flex items-center gap-1 justify-end">
                                        <button
                                          onClick={() =>
                                            navigate(`/recipe/${cell.recipeId}`)
                                          }
                                          className="p-1 rounded-md hover:bg-brand/10 text-muted hover:text-brand transition-all"
                                          title="View Recipe"
                                        >
                                          <Eye size={12} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setDeleteConfirm({
                                              type: "slot",
                                              day: dayKey,
                                              meal: mealKey,
                                            })
                                          }
                                          className="p-1 rounded-md hover:bg-danger/10 text-muted hover:text-danger transition-all"
                                          title="Remove from Slot"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-[70px] flex items-center justify-center text-xs text-muted/50">
                                      Drop here
                                    </div>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MOBILE VIEW */}
                <div className="lg:hidden space-y-6">
                  {Array.from({ length: DAYS_TO_SHOW }).map((_, dayIdx) => {
                    const date = addDays(startDate, dayIdx);
                    const isToday =
                      date.toDateString() === new Date().toDateString();
                    const dayLabel = getDayLabel(date);
                    const dayKey = `day_${dayIdx}`;

                    return (
                      <div
                        key={dayKey}
                        className="bg-bg rounded-2xl border border-border overflow-hidden"
                      >
                        {/* Day Header */}
                        <div
                          className={`p-4 border-b border-border ${isToday ? "bg-brand/10" : "bg-card"}`}
                        >
                          <div
                            className={`font-black text-lg ${isToday ? "text-brand" : "text-text"}`}
                          >
                            {dayLabel}
                          </div>
                          <div className="text-xs text-muted">{fmt(date)}</div>
                        </div>

                        {/* Meals for this day */}
                        <div className="p-4 space-y-3">
                          {MEALS.map((mealType, mIdx) => {
                            const mealKey = `${mealType}_${mIdx}`;
                            const cell = slots[dayKey]?.[mealKey];

                            return (
                              <div key={mealKey}>
                                <div className="text-[10px] font-black uppercase text-muted mb-2 tracking-wider">
                                  {mealType}
                                </div>
                                <div
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={() => handleDrop(dayKey, mealKey)}
                                  onClick={() => {
                                    // On mobile, tap empty slot to add selected recipe
                                    if (!cell && selectedRecipeForMobile) {
                                      handleMobileTapToAdd(dayKey, mealKey);
                                    }
                                  }}
                                  className={`min-h-[80px] rounded-xl border-2 border-dashed p-3 transition-all ${
                                    cell
                                      ? "bg-brand/5 border-brand/20"
                                      : selectedRecipeForMobile
                                        ? "bg-brand/10 border-brand cursor-pointer hover:bg-brand/20"
                                        : "bg-card border-border"
                                  }`}
                                >
                                  {cell ? (
                                    <div
                                      draggable
                                      onDragStart={(e) => {
                                        setDraggedRecipe({
                                          recipe: cell,
                                          sourceDay: dayKey,
                                          sourceMeal: mealKey,
                                        });
                                        e.dataTransfer.effectAllowed = "move";
                                      }}
                                      className="bg-card border border-brand/20 rounded-lg p-3 cursor-move shadow-sm"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="text-sm font-bold flex-1">
                                          {cell.title}
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(
                                                `/recipe/${cell.recipeId}`,
                                              );
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-brand/10 text-muted hover:text-brand transition-all"
                                            title="View Recipe"
                                          >
                                            <Eye size={14} />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteConfirm({
                                                type: "slot",
                                                day: dayKey,
                                                meal: mealKey,
                                              });
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-all"
                                            title="Remove"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-[50px] flex items-center justify-center text-xs text-muted/50">
                                      {selectedRecipeForMobile
                                        ? "Tap to add recipe"
                                        : "Select a recipe first"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* HELP TEXT */}
        <div className="mt-6 text-xs text-muted bg-card border border-border rounded-xl p-4">
          <p className="mb-2">
            <span className="font-bold text-brand">How to use:</span>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add recipes from the recipe viewer using "Add to Meal Plan"</li>
            <li className="hidden lg:list-item">
              Drag recipes from the sidebar to any day and meal slot
            </li>
            <li className="lg:hidden">
              Tap a recipe in the sidebar to select it, then tap an empty meal
              slot to add it
            </li>
            <li>Click the eye icon to view the recipe details</li>
            <li>Use the same recipe multiple times in different slots</li>
            <li>Navigate weeks using the arrow buttons</li>
          </ul>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-card border border-border p-8 rounded-[var(--radius-lg)] max-w-sm w-full text-center">
            <h2 className="text-xl font-black uppercase mb-4">
              Confirm Delete
            </h2>
            <p className="text-sm text-muted mb-6">
              {deleteConfirm.type === "library"
                ? "Remove this recipe from your meal plan library? It will be removed from all scheduled meals."
                : "Remove this recipe from this meal slot?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-border rounded-full font-black uppercase text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "library") {
                    handleDeleteFromLibrary(deleteConfirm.id);
                  } else {
                    handleDeleteFromSlot(deleteConfirm.day, deleteConfirm.meal);
                  }
                }}
                className="flex-1 py-3 bg-danger text-white rounded-full font-black uppercase text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
