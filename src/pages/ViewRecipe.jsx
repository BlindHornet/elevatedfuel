// Module Imports
import React, { useMemo, useState, useEffect } from "react";
import {
  Heart,
  Pencil,
  Trash2,
  ChevronLeft,
  Star,
  StarHalf,
  Plus,
  Minus,
  CheckCircle,
  Tag,
  Save,
  CalendarCheck,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Firebase Imports
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

// Service Imports
import { deleteRecipeById } from "../lib/addRecipeService";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL; //"munoz.adam@gmail.com";

const decimalToFraction = (value) => {
  const whole = Math.floor(value);
  const decimal = value - whole;

  const fractions = {
    0.25: "1/4",
    0.33: "1/3",
    0.5: "1/2",
    0.66: "2/3",
    0.75: "3/4",
  };

  const roundedDecimal = Math.round(decimal * 100) / 100;
  const fraction = fractions[roundedDecimal];

  if (!fraction) return value.toString();

  if (whole === 0) return fraction;
  return `${whole} ${fraction}`;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function StarRating({ rating, size = "w-4 h-4", label = "" }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating)
      stars.push(<Star key={i} className={`${size} fill-brand text-brand`} />);
    else if (i - 0.5 <= rating)
      stars.push(
        <StarHalf key={i} className={`${size} fill-brand text-brand`} />,
      );
    else stars.push(<Star key={i} className={`${size} text-white/20`} />);
  }
  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
          {label}
        </span>
      )}
      <div className="flex gap-1">{stars}</div>
    </div>
  );
}

export default function ViewRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMealPlanSuccess, setShowMealPlanSuccess] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [imageError, setImageError] = useState(false);

  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, "recipes", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setRecipe(data);
          setServings(toNumber(data.servings) || 1);
        }

        // Check if favorited
        if (currentUser) {
          const favRef = doc(db, "users", currentUser.uid, "favorites", id);
          const favSnap = await getDoc(favRef);
          setIsFavorite(favSnap.exists());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const commentsRef = collection(db, "recipes", id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    fetchData();
    return () => unsubscribe();
  }, [id, currentUser]);

  useEffect(() => {
    async function getRecipe() {
      try {
        const docRef = doc(db, "recipes", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setRecipe(data);
          setServings(toNumber(data.servings) || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const commentsRef = collection(db, "recipes", id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    getRecipe();
    return () => unsubscribe();
  }, [id]);

  const toggleFavorite = async () => {
    if (!currentUser) return alert("Log in to favorite recipes.");
    const favRef = doc(db, "users", currentUser.uid, "favorites", id);
    try {
      if (isFavorite) {
        await deleteDoc(favRef);
        setIsFavorite(false);
      } else {
        await setDoc(favRef, { recipeId: id, favoritedAt: serverTimestamp() });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favorite Error:", err);
    }
  };

  const handleAddToMealPlan = async () => {
    if (!currentUser) {
      alert("Please log in to use the meal planner.");
      return;
    }

    if (!recipe) return;

    try {
      const mealPlanRecipeRef = doc(
        db,
        "users",
        currentUser.uid,
        "mealPlanRecipes",
        id,
      );

      await setDoc(mealPlanRecipeRef, {
        recipeId: id,
        title: recipe.title,
        macros: recipe.macros || {},
        servings: recipe.servings || 1,
        addedAt: serverTimestamp(),
      });

      setShowMealPlanSuccess(true);
    } catch (err) {
      console.error("Error adding to meal plan:", err);
      alert("Failed to add recipe to meal plan.");
    }
  };
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

  const scale = useMemo(
    () => servings / (toNumber(recipe?.servings) || 1),
    [servings, recipe?.servings],
  );

  const scaledMacros = useMemo(() => {
    const m = recipe?.macros || {};
    return {
      calories: Math.round(toNumber(m.calories) * scale),
      protein: Math.round(toNumber(m.protein) * scale),
      carbs: Math.round(toNumber(m.carbs) * scale),
      fat: Math.round(toNumber(m.fat) * scale),
    };
  }, [recipe?.macros, scale]);

  const handleReviewSubmit = async () => {
    if (!currentUser) return alert("Log in to review.");
    setSubmittingReview(true);

    try {
      if (editingCommentId) {
        // Update existing review
        const commentRef = doc(db, "recipes", id, "comments", editingCommentId);
        await updateDoc(commentRef, {
          rating: userRating,
          comment: userComment,
          updatedAt: serverTimestamp(), // Optional: track updates
        });
      } else {
        // Create new review
        await addDoc(collection(db, "recipes", id, "comments"), {
          rating: userRating,
          comment: userComment,
          userName: currentUser.displayName || "User",
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }

      setShowReviewModal(false);
      setUserComment("");
      setEditingCommentId(null);
    } catch (err) {
      console.error("Review Submission Error:", err);
      alert("Failed to save review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      await deleteDoc(doc(db, "recipes", id, "comments", commentId));
    }
  };

  const saveEdit = async (commentId) => {
    const commentRef = doc(db, "recipes", id, "comments", commentId);
    await updateDoc(commentRef, { comment: editValue, rating: editRating });
    setEditingCommentId(null);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-muted">
        Loading Fuel...
      </div>
    );

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* HEADER NAV */}
      <div className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted hover:text-brand transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">
              Back
            </span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-xl bg-card border transition-all ${isFavorite ? "border-red-500 text-red-500" : "border-border text-muted"}`}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>

            {/* ONLY ADMIN SEES EDIT/DELETE */}
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate(`/edit-recipe/${id}`)}
                  className="p-2 rounded-xl bg-card border border-border text-muted hover:text-brand"
                  title="Edit recipe"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl bg-card border border-border text-muted hover:text-danger"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-8">
            {/* IMAGE & RATINGS */}
            <div className="relative aspect-[16/10] rounded-[var(--radius-lg)] overflow-hidden border border-border bg-card">
              {recipe.image && !imageError ? (
                <img
                  src={recipe.image}
                  className="w-full h-full object-cover"
                  alt={recipe.title}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg to-card">
                  <span className="text-3xl font-black uppercase tracking-widest text-muted/30">
                    No Image
                  </span>
                </div>
              )}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 bg-black/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
                <StarRating
                  rating={avgUserRating}
                  label="Avg User Rating"
                  size="w-3.5 h-3.5"
                />
                <div className="h-px bg-white/10 w-full" />
                <StarRating
                  rating={
                    recipe.adminReviewScore ||
                    recipe.adminRating ||
                    recipe.rating ||
                    0
                  }
                  label="Admin Rating"
                  size="w-3.5 h-3.5"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-brand mb-2">
                Description
              </h3>
              <p className="text-muted leading-relaxed whitespace-pre-wrap">
                {recipe.description}
              </p>
            </section>

            {/* INGREDIENTS */}
            <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="text-xl font-bold uppercase tracking-tight mb-6">
                Ingredients
              </h3>
              <div className="grid gap-2">
                {recipe.ingredients?.map((ing, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span>{ing.item || ing.name}</span>
                    <span className="text-brand font-black">
                      {decimalToFraction(toNumber(ing.qty) * scale)} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* EXECUTION STEPS */}
            <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="text-xl font-bold uppercase tracking-tight mb-6">
                Execution Steps
              </h3>
              <div className="space-y-6">
                {recipe.steps?.map((step, i) => (
                  <div key={i} className="flex gap-5">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-sm">
                      {i + 1}
                    </span>
                    <p className="text-muted leading-relaxed pt-1">
                      {typeof step === "object" ? step.text : step}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* USER FEEDBACK */}
            <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="text-xl font-bold uppercase tracking-tight mb-6">
                User Feedback
              </h3>
              <div className="space-y-4">
                {comments.map((rev) => {
                  const isOwner = currentUser?.uid === rev.userId;
                  const canDelete = isAdmin || isOwner;
                  const isEditing = editingCommentId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-bg border border-border"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm font-black text-brand uppercase">
                            {rev.userName}
                          </div>
                          {isEditing ? (
                            <select
                              value={editRating}
                              onChange={(e) =>
                                setEditRating(Number(e.target.value))
                              }
                              className="bg-card text-xs text-brand mt-1 border border-border rounded p-1"
                            >
                              {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map(
                                (n) => (
                                  <option key={n} value={n}>
                                    {n} Stars
                                  </option>
                                ),
                              )}
                            </select>
                          ) : (
                            <StarRating rating={rev.rating} size="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {isOwner && !isEditing && (
                            <button
                              onClick={() => {
                                setEditingCommentId(rev.id);
                                setEditValue(rev.comment);
                                setEditRating(rev.rating);
                              }}
                              className="text-muted hover:text-brand"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => deleteComment(rev.id)}
                              className="text-muted hover:text-danger"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            className="w-full bg-card border border-border rounded-xl p-3 text-sm h-24"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(rev.id)}
                              className="px-4 py-2 bg-brand text-white text-[10px] font-black uppercase rounded-full flex items-center gap-2"
                            >
                              <Save size={12} /> Save
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="px-4 py-2 border border-border text-[10px] font-black uppercase rounded-full"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-text italic">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="sticky top-24 space-y-6">
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-6">
                {recipe.title}
              </h1>

              <div className="flex items-center justify-between bg-bg rounded-2xl p-4 border border-border mb-6">
                <span className="text-xs font-bold uppercase text-muted">
                  Servings
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="text-brand"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-xl font-black">{servings}</span>
                  <button
                    onClick={() => setServings(servings + 1)}
                    className="text-brand"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* MACROS WITH SPECIFIC COLORS */}
              <div className="space-y-3 mb-8">
                <div className="bg-bg border border-border p-3 rounded-xl flex justify-between items-center text-xs font-bold uppercase">
                  <span className="text-red-500">Protein</span>
                  <span className="text-text">{scaledMacros.protein}g</span>
                </div>
                <div className="bg-bg border border-border p-3 rounded-xl flex justify-between items-center text-xs font-bold uppercase">
                  <span className="text-blue-500">Carbs</span>
                  <span className="text-text">{scaledMacros.carbs}g</span>
                </div>
                <div className="bg-bg border border-border p-3 rounded-xl flex justify-between items-center text-xs font-bold uppercase">
                  <span className="text-yellow-500">Fats</span>
                  <span className="text-text">{scaledMacros.fat}g</span>
                </div>
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mb-8">
                {recipe.tags?.map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-1.5 px-3 py-1 bg-brand/5 border border-brand/10 rounded-full text-[10px] font-bold text-brand uppercase"
                  >
                    <Tag size={10} /> {t}
                  </div>
                ))}
              </div>

              {/* URL LINK */}
              {recipe["url-link"] && (
                <a
                  href={recipe["url-link"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 mb-3 rounded-full border border-border bg-bg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted hover:text-brand hover:border-brand transition-all"
                >
                  <Save size={14} /> View Source Link
                </a>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleAddToMealPlan}
                  className="w-full py-4 rounded-full bg-brand text-white font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform"
                >
                  Add to Meal Plan
                </button>
                <button
                  onClick={() => {
                    if (!currentUser) return alert("Please log in to review.");

                    // Check if user already has a review
                    const existingReview = comments.find(
                      (c) => c.userId === currentUser.uid,
                    );

                    if (existingReview) {
                      setEditingCommentId(existingReview.id);
                      setUserRating(existingReview.rating);
                      setUserComment(existingReview.comment);
                    } else {
                      setEditingCommentId(null);
                      setUserRating(5);
                      setUserComment("");
                    }
                    setShowReviewModal(true);
                  }}
                  className="w-full py-4 rounded-full border-2 border-brand text-brand font-black uppercase flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> I Made This
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* MODALS */}
      {showMealPlanSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-card border border-border p-8 rounded-[var(--radius-lg)] max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
              <CalendarCheck className="text-brand" size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Fuel Added!
              </h2>
              <p className="text-muted leading-relaxed">
                Recipe successfully added to your meal plan library. Ready to
                schedule?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/weekly-meal-plan")}
                className="w-full py-4 bg-brand text-white rounded-full font-black uppercase tracking-widest shadow-lg"
              >
                Go to Meal Plan
              </button>
              <button
                onClick={() => setShowMealPlanSuccess(false)}
                className="w-full py-4 border border-border rounded-full font-black uppercase tracking-widest text-muted hover:text-text transition-colors"
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-card border border-border p-8 rounded-[var(--radius-lg)] max-w-md w-full">
            <h2 className="text-2xl font-black uppercase mb-6">
              {editingCommentId ? "Update Your Review" : "Review Fuel"}
            </h2>
            <div className="mb-6">
              <StarRating rating={userRating} size="w-6 h-6" />
              <select
                className="w-full bg-bg border border-border rounded-xl p-3 mt-4"
                value={userRating}
                onChange={(e) => setUserRating(Number(e.target.value))}
              >
                {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="w-full bg-bg border border-border rounded-xl p-4 h-32 mb-6 outline-none focus:border-brand"
              placeholder="Comment..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 border border-border rounded-full font-black uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submittingReview}
                className="flex-1 py-3 bg-brand text-white rounded-full font-black uppercase"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <div className="bg-card p-8 rounded-3xl max-w-sm text-center">
            <h2 className="text-xl font-black mb-6 uppercase">
              Remove Recipe?
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 border border-border rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteRecipeById(id);
                  navigate("/");
                }}
                className="flex-1 py-3 bg-danger text-white rounded-xl"
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
