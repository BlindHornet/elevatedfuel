// Module Imports
import { Routes, Route, Navigate } from "react-router-dom";

// Component Imports
import RequireAuth from "./auth/RequireAuth";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

//Page Imports
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ViewRecipe from "./pages/ViewRecipe";
import Favorites from "./pages/Favorites";
import EditRecipe from "./pages/EditRecipe";
import AddRecipe from "./pages/AddRecipe";
import WeeklyMealPlan from "./pages/WeeklyMealPlan";
import Storefront from "./pages/Storefront";

export default function App() {
  return (
    <div className="min-h-screen bg-bg">
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route path="/add-recipe" element={<AddRecipe />} />
        <Route path="/recipe/:id" element={<ViewRecipe />} />
        <Route path="/edit-recipe/:id" element={<EditRecipe />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/weekly-meal-plan" element={<WeeklyMealPlan />} />
        <Route path="/recommendations" element={<Storefront />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
