import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash2,
  Eye,
  Plus,
  X,
  Check,
} from "lucide-react";

// Firebase Imports
import { db, auth } from "../lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  onSnapshot,
} from "firebase/firestore";

const MEALS = ["Breakfast", "Snack 1", "Lunch", "Snack 2", "Dinner", "Dessert"];
const DAYS_TO_SHOW = 4;

function getDayKey(date) {
  return date.toISOString().split("T")[0];
}

function getDayLabel(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export default function WeeklyMealPlan() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({});
  const [libraryRecipes, setLibraryRecipes] = useState({});
  const [persistentRecipes, setPersistentRecipes] = useState({});
  const [loading, setLoading] = useState(true);
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [mobileAddRecipe, setMobileAddRecipe] = useState(null);
  const [replaceConfirm, setReplaceConfirm] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Library
  useEffect(() => {
    if (!currentUser) return;
    const q = collection(db, "users", currentUser.uid, "mealPlanRecipes");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipesMap = {};
      snapshot.forEach((doc) => {
        recipesMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setLibraryRecipes(recipesMap);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Sync Schedule and Persistent Data
  useEffect(() => {
    if (!currentUser) return;
    const planRef = doc(db, "users", currentUser.uid, "mealPlans", "current");
    const unsubscribe = onSnapshot(planRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMealPlan(data.plan || {});
        setPersistentRecipes(data.persistentRecipes || {});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const getRecipeData = (recipeId) => {
    return libraryRecipes[recipeId] || persistentRecipes[recipeId];
  };

  const saveMealPlan = async (newPlan) => {
    if (!currentUser) return;
    try {
      await setDoc(
        doc(db, "users", currentUser.uid, "mealPlans", "current"),
        {
          plan: newPlan,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("Error saving meal plan:", err);
    }
  };

  const executeAdd = (recipeId, day, meal) => {
    const newPlan = { ...mealPlan };
    if (!newPlan[day]) newPlan[day] = {};
    newPlan[day][meal] = recipeId;
    setMealPlan(newPlan);
    saveMealPlan(newPlan);
    setMobileAddRecipe(null);
    setReplaceConfirm(null);
  };

  const handleMobileSlotClick = (recipe, day, meal) => {
    const existingRecipeId = mealPlan[day]?.[meal];
    if (existingRecipeId) {
      const existingRecipe = getRecipeData(existingRecipeId);
      setReplaceConfirm({
        newRecipe: recipe,
        existingTitle: existingRecipe?.title || "Existing Recipe",
        day,
        meal,
      });
    } else {
      executeAdd(recipe.id, day, meal);
    }
  };

  // FIXED: Logic to remove from schedule only
  const handleDeleteFromSlot = async (dayKey, mealType) => {
    const newPlan = { ...mealPlan };
    if (newPlan[dayKey]) {
      delete newPlan[dayKey][mealType];
      // Clean up empty day objects
      if (Object.keys(newPlan[dayKey]).length === 0) {
        delete newPlan[dayKey];
      }
      setMealPlan(newPlan);

      // Save the entire updated plan
      if (currentUser) {
        try {
          await setDoc(
            doc(db, "users", currentUser.uid, "mealPlans", "current"),
            {
              plan: newPlan,
              updatedAt: serverTimestamp(),
            },
            { merge: false }, // Don't merge - replace the plan entirely
          );
        } catch (err) {
          console.error("Error deleting meal:", err);
        }
      }
    }
    setDeleteConfirm(null);
  };

  const handleDeleteFromLibrary = async (recipeId) => {
    if (!currentUser) return;
    try {
      const recipeToArchive = libraryRecipes[recipeId];
      if (recipeToArchive) {
        const planRef = doc(
          db,
          "users",
          currentUser.uid,
          "mealPlans",
          "current",
        );
        await setDoc(
          planRef,
          {
            persistentRecipes: {
              ...persistentRecipes,
              [recipeId]: recipeToArchive,
            },
          },
          { merge: true },
        );
      }
      await deleteDoc(
        doc(db, "users", currentUser.uid, "mealPlanRecipes", recipeId),
      );
    } catch (err) {
      console.error(err);
    }
    setDeleteConfirm(null);
  };

  const days = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
      addDays(startDate, i),
    );
  }, [startDate]);

  const getDailyTotals = (dayKey) => {
    const dayData = mealPlan[dayKey] || {};
    const totals = { protein: 0, carbs: 0, fat: 0 };
    Object.values(dayData).forEach((recipeId) => {
      const recipe = getRecipeData(recipeId);
      if (recipe && recipe.macros) {
        totals.protein += Number(recipe.macros.protein || 0);
        totals.carbs += Number(recipe.macros.carbs || 0);
        totals.fat += Number(recipe.macros.fat || 0);
      }
    });
    return totals;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg text-text p-4 md:p-8 pb-32">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-brand rounded-full" />
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Fuel <span className="text-brand">Schedule</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-2xl shadow-xl">
            <button
              onClick={() => setStartDate(addDays(startDate, -DAYS_TO_SHOW))}
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="px-6 text-center min-w-[180px]">
              <div className="text-sm font-black uppercase">
                {startDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {addDays(startDate, DAYS_TO_SHOW - 1).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )}
              </div>
            </div>
            <button
              onClick={() => setStartDate(addDays(startDate, DAYS_TO_SHOW))}
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
            >
              <ChevronRight size={24} />
            </button>
            <button
              onClick={() => setStartDate(new Date())}
              className="p-3 hover:bg-white/5 rounded-xl text-brand"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LIBRARY */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-[2rem] p-6 shadow-xl sticky top-28">
              <h2 className="text-base font-black uppercase tracking-widest mb-6 border-b border-border pb-4">
                Fuel Library
              </h2>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(libraryRecipes).map((recipe) => (
                  <div
                    key={recipe.id}
                    draggable
                    onDragStart={() => setDraggedRecipe(recipe)}
                    className="group p-5 bg-bg border border-border rounded-2xl cursor-grab hover:border-brand/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="text-sm font-black uppercase leading-tight">
                        {recipe.title}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                          className="p-2 text-muted hover:text-brand bg-white/5 rounded-lg"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ type: "library", id: recipe.id })
                          }
                          className="p-2 text-muted hover:text-danger bg-white/5 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => setMobileAddRecipe(recipe)}
                          className="p-2 text-brand bg-brand/10 rounded-lg lg:hidden"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 text-[10px] font-black uppercase bg-white/5 p-2 rounded-xl justify-center">
                      <span className="text-danger">
                        P:{recipe.macros?.protein || 0}
                      </span>
                      <span className="text-blue-400">
                        C:{recipe.macros?.carbs || 0}
                      </span>
                      <span className="text-yellow-400">
                        F:{recipe.macros?.fat || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {days.map((day) => {
                const dayKey = getDayKey(day);
                const isToday = dayKey === getDayKey(new Date());
                const totals = getDailyTotals(dayKey);
                return (
                  <div key={dayKey} className="space-y-4">
                    <div
                      className={`p-6 rounded-[2rem] border text-center ${isToday ? "bg-brand/10 border-brand shadow-lg" : "bg-card border-border"}`}
                    >
                      <div className="text-xs font-black uppercase tracking-widest text-muted mb-1">
                        {getDayLabel(day)}
                      </div>
                      <div className="text-3xl font-black tracking-tighter mb-3">
                        {day.getDate()}
                      </div>
                      <div className="flex items-center justify-center gap-3 py-2 px-3 bg-black/40 rounded-full border border-white/10 text-[10px] font-black uppercase">
                        <span className="text-danger">
                          P:{Math.round(totals.protein)}
                        </span>
                        <span className="text-blue-400">
                          C:{Math.round(totals.carbs)}
                        </span>
                        <span className="text-yellow-400">
                          F:{Math.round(totals.fat)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {MEALS.map((mealKey) => {
                        const recipeId = mealPlan[dayKey]?.[mealKey];
                        const recipe = recipeId
                          ? getRecipeData(recipeId)
                          : null;
                        return (
                          <div
                            key={mealKey}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedRecipe)
                                executeAdd(draggedRecipe.id, dayKey, mealKey);
                              setDraggedRecipe(null);
                            }}
                            className={`relative min-h-[130px] rounded-[1.5rem] border-2 border-dashed p-4 ${recipe ? "bg-card border-border shadow-md" : "bg-bg/50 border-white/5"}`}
                          >
                            <div className="text-[10px] font-black uppercase text-muted/50 mb-3">
                              {mealKey}
                            </div>
                            {recipe ? (
                              <div className="space-y-4">
                                <div className="text-xs font-black uppercase leading-tight line-clamp-3">
                                  {recipe.title}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                  <button
                                    onClick={() =>
                                      navigate(`/recipe/${recipe.id}`)
                                    }
                                    className="text-muted hover:text-brand"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        type: "slot",
                                        day: dayKey,
                                        meal: mealKey,
                                      })
                                    }
                                    className="text-muted hover:text-danger"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                <Plus size={32} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {mobileAddRecipe && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex justify-center items-start pt-6 px-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 mb-12 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase">
                Add <span className="text-brand">{mobileAddRecipe.title}</span>
              </h2>
              <button
                onClick={() => setMobileAddRecipe(null)}
                className="p-3 bg-white/10 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-8">
              {days.map((day) => (
                <div key={getDayKey(day)} className="space-y-3">
                  <div className="text-sm font-black uppercase text-brand bg-brand/10 p-3 rounded-xl text-center">
                    {getDayLabel(day)} {day.getDate()}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {MEALS.map((m) => (
                      <button
                        key={m}
                        onClick={() =>
                          handleMobileSlotClick(
                            mobileAddRecipe,
                            getDayKey(day),
                            m,
                          )
                        }
                        className="p-5 text-xs font-black uppercase border-2 border-border rounded-2xl flex justify-between items-center"
                      >
                        {m} <Plus size={16} className="text-brand" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {replaceConfirm && (
        <div className="fixed inset-0 z-[130] bg-black/95 flex items-center justify-center px-4">
          <div className="bg-card border border-border p-8 rounded-[2rem] max-w-sm w-full text-center space-y-6">
            <h2 className="text-xl font-black uppercase">Replace Meal?</h2>
            <p className="text-sm text-muted">
              Replace "{replaceConfirm.existingTitle}" with "
              {replaceConfirm.newRecipe.title}"?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  executeAdd(
                    replaceConfirm.newRecipe.id,
                    replaceConfirm.day,
                    replaceConfirm.meal,
                  )
                }
                className="w-full py-4 bg-brand text-white rounded-xl font-black uppercase text-xs"
              >
                Yes, Replace
              </button>
              <button
                onClick={() => setReplaceConfirm(null)}
                className="w-full py-4 bg-white/5 text-muted rounded-xl font-black uppercase text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center px-4">
          <div className="bg-card border border-border p-8 rounded-[2rem] max-w-sm w-full text-center">
            <h2 className="text-xl font-black uppercase mb-4">
              Confirm Delete
            </h2>
            <p className="text-sm text-muted mb-6">
              Remove from{" "}
              {deleteConfirm.type === "library" ? "library" : "slot"}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-border rounded-full font-black uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteConfirm.type === "library"
                    ? handleDeleteFromLibrary(deleteConfirm.id)
                    : handleDeleteFromSlot(
                        deleteConfirm.day,
                        deleteConfirm.meal,
                      )
                }
                className="flex-1 py-3 bg-danger text-white rounded-full font-black uppercase text-xs"
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
