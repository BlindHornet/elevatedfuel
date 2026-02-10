// Module Imports
import React from "react";
import { useNavigate } from "react-router-dom";

// Component Imports
import AddRecipeForm from "../components/AddRecipeForm";

export default function AddRecipe() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-8 pb-20">
      <AddRecipeForm
        onCreated={() => navigate("/")}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
