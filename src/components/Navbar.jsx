import React, { useState } from "react";
import {
  Menu,
  X,
  Plus,
  CalendarDays,
  Heart,
  UtensilsCrossed,
  Sparkles,
  UserCircle,
  Settings,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Modal Component for "Not Yet Implemented"
function ImplementationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-card border border-border shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
            <AlertCircle className="text-brand" size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight text-text uppercase">
              Coming Soon
            </h3>
            <p className="text-sm text-muted font-medium leading-relaxed">
              The Settings module is currently under development and is{" "}
              <span className="text-brand">not yet implemented</span>.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-brand text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // Modal state

  const hideNavbarPaths = ["/login", "/register"];
  if (hideNavbarPaths.includes(location.pathname)) return null;

  const navItems = [
    { label: "Recipes", path: "/", icon: UtensilsCrossed },
    { label: "Shopping List", path: "/shopping-list", icon: ShoppingCart },
    { label: "Favorites", path: "/favorites", icon: Heart },
    { label: "Meal Plan", path: "/weekly-meal-plan", icon: CalendarDays },
  ];

  // Helper to handle settings click
  const handleSettingsClick = (e) => {
    e.preventDefault();
    setShowSettingsModal(true);
    setMobileNavOpen(false); // Close mobile nav if open
  };

  const NavButton = ({ item, isMobile = false }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const mobileStyles = isActive
      ? "bg-brand text-white shadow-lg shadow-brand/20"
      : "bg-white/5 border border-white/10 text-muted";

    if (isMobile) {
      return (
        <button
          onClick={() => {
            navigate(item.path);
            setMobileNavOpen(false);
          }}
          className={`flex flex-row items-center justify-start gap-4 px-5 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 ${mobileStyles}`}
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => {
          navigate(item.path);
          if (isMobile) setMobileNavOpen(false);
        }}
        className={`flex items-center gap-2 uppercase tracking-[0.15em] transition-all duration-300 ${
          isMobile
            ? "flex-col justify-center aspect-square rounded-2xl font-black text-[10px] border border-white/5"
            : "px-4 py-2 rounded-xl text-[11px] font-black"
        } ${
          isActive
            ? "bg-brand text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]"
            : "text-muted hover:text-text hover:bg-white/10 bg-white/5 md:bg-transparent"
        }`}
      >
        <Icon
          size={isMobile ? 24 : 14}
          className={`${isActive ? "fill-white" : ""} mb-0.5`}
        />
        {item.label}
      </button>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-3 items-center h-20 md:flex md:justify-between">
            <div className="md:hidden" />

            <div
              className="cursor-pointer group flex items-center gap-3 justify-center md:justify-start"
              onClick={() => navigate("/")}
            >
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-brand/20 blur-lg rounded-full group-hover:bg-brand/40 transition-colors" />
                <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-brand to-brand-600 flex items-center justify-center shadow-lg">
                  <UtensilsCrossed className="text-white" size={20} />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-black tracking-tighter text-text leading-none">
                  ELEVATED<span className="text-brand">FUEL</span>
                </h1>
                <div className="hidden sm:flex items-center gap-1 mt-0.5">
                  <Sparkles size={8} className="text-brand animate-pulse" />
                  <p className="text-[8px] uppercase tracking-[0.2em] text-muted font-bold">
                    Performance Nutrition
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 mr-2">
                  {navItems.map((item) => (
                    <NavButton key={item.path} item={item} />
                  ))}
                </nav>

                <button
                  onClick={() => navigate("/add-recipe")}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand text-white shadow-lg hover:scale-110 transition-transform"
                  title="Add Recipe"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>

                <button
                  onClick={handleSettingsClick} // Updated to show modal
                  className="h-10 w-10 flex items-center justify-center rounded-xl border bg-white/5 border-white/5 text-muted hover:text-brand hover:border-brand/20 transition-all"
                >
                  <Settings size={20} />
                </button>
              </div>

              <button
                className="md:hidden rounded-xl bg-white/5 p-2.5 border border-white/10 text-muted"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out bg-bg border-t border-border ${
            mobileNavOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4 space-y-3">
            {/* Grid of 2 for main items, but shorter height */}
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <NavButton key={item.path} item={item} isMobile />
              ))}

              {/* Mobile Settings Button - matching the new slim row style */}
              <button
                onClick={handleSettingsClick}
                className="flex flex-row items-center justify-start gap-4 px-5 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest border border-white/5 bg-white/5 text-muted hover:text-text transition-all"
              >
                <UserCircle size={18} />
                Settings
              </button>
            </div>

            {/* Primary Action Button - Slimmed down */}
            <button
              onClick={() => {
                navigate("/add-recipe");
                setMobileNavOpen(false);
              }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-brand text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-[0.98] transition-all mt-2"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Add Recipe</span>
            </button>
          </div>
        </div>
      </header>

      {/* Render the Modal */}
      <ImplementationModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}
