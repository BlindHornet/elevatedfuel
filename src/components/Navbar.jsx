// Module Imports
import React, { useState } from "react";
import {
  Menu,
  X,
  Plus,
  CalendarDays,
  Heart,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ onSelectPage, activePage }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Hooks must be called before any conditional returns
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const hideNavbarPaths = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  if (shouldHideNavbar) {
    return null;
  }

  const isFavoritesActive = location.pathname === "/favorites";
  const isRecipesActive = location.pathname === "/";
  const isWeeklyMealPlanActive = location.pathname === "/weekly-meal-plan";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* LOGO / BRAND */}
            <div
              className="cursor-pointer group flex items-center gap-3"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full group-hover:bg-brand/30 transition-colors" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-600 flex items-center justify-center shadow-lg shadow-brand/20">
                  <UtensilsCrossed className="text-white" size={22} />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tighter text-text leading-none">
                  ELEVATED<span className="text-brand">FUEL</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <Sparkles size={10} className="text-brand animate-pulse" />
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted font-black">
                    Performance Nutrition
                  </p>
                </div>
              </div>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-2">
              <nav className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5 mr-4">
                <button
                  onClick={() => navigate("/")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    isRecipesActive
                      ? "bg-brand text-white shadow-lg shadow-brand/20"
                      : "text-muted hover:text-text hover:bg-white/5"
                  }`}
                >
                  <UtensilsCrossed size={14} />
                  Recipes
                </button>

                <button
                  onClick={() => navigate("/favorites")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    isFavoritesActive
                      ? "bg-brand text-white shadow-lg shadow-brand/20"
                      : "text-muted hover:text-text hover:bg-white/5"
                  }`}
                >
                  <Heart
                    size={14}
                    className={isFavoritesActive ? "fill-white" : ""}
                  />
                  Favorites
                </button>

                <button
                  onClick={() => navigate("/weekly-meal-plan")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    isWeeklyMealPlanActive
                      ? "bg-brand text-white shadow-lg shadow-brand/20"
                      : "text-muted hover:text-text hover:bg-white/5"
                  }`}
                >
                  <CalendarDays
                    size={14}
                    className={isWeeklyMealPlanActive ? "fill-white" : ""}
                  />
                  Meal Plan
                </button>
              </nav>

              <button
                onClick={() => navigate("/add-recipe")}
                className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Add Recipe</span>
              </button>
            </div>

            {/* MOBILE TOGGLE */}
            <button
              className="md:hidden rounded-xl bg-white/5 p-2.5 border border-white/10 text-muted"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border ${
            mobileNavOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="p-4 space-y-2 bg-card/50 backdrop-blur-xl">
            <button
              onClick={() => {
                navigate("/");
                setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 font-black uppercase tracking-widest text-xs"
            >
              Recipes
            </button>
            <button
              onClick={() => {
                navigate("/favorites");
                setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 font-black uppercase tracking-widest text-xs"
            >
              Favorites
            </button>
            <button
              onClick={() => {
                navigate("/weekly-meal-plan");
                setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 font-black uppercase tracking-widest text-xs"
            >
              Weekly Meal Plan
            </button>

            <div className="pt-2">
              <button
                onClick={() => {
                  navigate("/add-recipe");
                  setMobileNavOpen(false);
                }}
                className="w-full group relative flex items-center justify-center gap-3 p-4 rounded-xl bg-brand text-white font-black text-sm uppercase tracking-wider"
              >
                <Plus size={20} strokeWidth={3} />
                <span>Add New Recipe</span>
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
