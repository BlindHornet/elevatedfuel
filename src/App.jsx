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
import ShoppingList from "./pages/ShoppingList";

// Settings Pages
import WhatsNewPage from "./pages/settings/WhatsNewPage";
import AdminSuggestionsPage from "./pages/settings/AdminSuggestion";
import MakeSuggestionPage from "./pages/settings/MakeSuggestion";
import SuggestionDetailPage from "./pages/settings/SuggestionDetail";

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
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/whats-new" element={<WhatsNewPage />} />
        <Route path="/suggestions" element={<MakeSuggestionPage />} />
        <Route path="/suggestion/:id" element={<SuggestionDetailPage />} />
        <Route path="/admin/suggestions" element={<AdminSuggestionsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
