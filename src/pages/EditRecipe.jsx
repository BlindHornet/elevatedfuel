// Module Imports
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Component Imports
import AddRecipeForm from "../components/AddRecipeForm";

const DEFAULT_RECIPE = {
  title: "",
  description: "",
  tagsText: "",
  prepMinutes: "",
  cookMinutes: "",
  servings: "",
  servingTemp: "hot",
  macros: { calories: "", protein: "", carbs: "", fat: "" },
  mediaUrl: "",
  ingredients: [{ qty: "", unit: "g", item: "" }],
  steps: [{ text: "" }],
  rating: 0,
  submissionComment: "",
};

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialRecipe, setInitialRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const snap = await getDoc(doc(db, "recipes", id));
        if (!snap.exists()) {
          setInitialRecipe(null);
          return;
        }

        const data = snap.data();

        // Map stored fields into AddRecipeForm shape
        const merged = {
          ...DEFAULT_RECIPE,
          ...data,
          macros: { ...DEFAULT_RECIPE.macros, ...(data.macros || {}) },
          tagsText: Array.isArray(data.tags)
            ? data.tags.join(", ")
            : data.tagsText || "",
          mediaUrl: data["url-link"] || data.mediaUrl || "",
          // Convert numeric values to strings for form inputs
          prepMinutes: String(data.prepMinutes || ""),
          cookMinutes: String(data.cookMinutes || ""),
          servings: String(data.servings || ""),
          // Reverse arrays for "Add to Top" UX (form displays newest first)
          ingredients:
            Array.isArray(data.ingredients) && data.ingredients.length
              ? [...data.ingredients].reverse().map((ing) => ({
                  qty: String(ing.qty || ""),
                  unit: ing.unit || "g",
                  item: String(ing.item || ""),
                }))
              : [...DEFAULT_RECIPE.ingredients],
          steps:
            Array.isArray(data.steps) && data.steps.length
              ? [...data.steps].reverse().map((step) => ({
                  text: String(step.text || ""),
                }))
              : [...DEFAULT_RECIPE.steps],
        };

        setInitialRecipe(merged);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setInitialRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleUpdate = async (submissionData) => {
    // Process tags from comma-separated string to array
    const tags = (submissionData.tagsText || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Prepare payload for Firestore
    const payload = {
      ...submissionData,
      tags,
      "url-link": submissionData.mediaUrl,
      // Remove tagsText from the final payload (it's only used in the form)
      tagsText: undefined,
    };

    // Clean up undefined values
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key],
    );

    await updateDoc(doc(db, "recipes", id), payload);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-4 sm:p-8">
        <div className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted">Loading recipe...</div>
        </div>
      </div>
    );
  }

  if (!initialRecipe) {
    return (
      <div className="min-h-screen bg-bg p-4 sm:p-8">
        <div className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-6">
          <div className="text-sm text-muted">Recipe not found.</div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 rounded-xl border border-border text-sm font-bold text-muted hover:text-text hover:bg-white/5 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-8 pb-20">
      <AddRecipeForm
        initialRecipe={initialRecipe}
        onSubmit={handleUpdate}
        onCreated={() => navigate(`/recipe/${id}`)}
        onCancel={() => navigate(-1)}
        headerText="Edit Recipe"
        submitText="Update Recipe"
      />
    </div>
  );
}
