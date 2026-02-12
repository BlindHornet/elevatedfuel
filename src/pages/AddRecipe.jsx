import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddRecipeForm from "../components/AddRecipeForm";
import QuickAddForm from "../components/QuickAddForm";

export default function AddRecipe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-8 pb-20">
      {/* If mode is quick, show QuickAddForm; else show the full AddRecipeForm */}
      {mode === "quick" ? (
        <QuickAddForm
          onCreated={() => navigate("/")}
          onCancel={() => navigate(-1)}
        />
      ) : (
        <AddRecipeForm
          onCreated={() => navigate("/")}
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  );
}
