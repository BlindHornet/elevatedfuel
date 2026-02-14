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
  UserCircle,
  Settings,
  AlertCircle,
  ShoppingCart,
  Zap,
  Lightbulb,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Component Imports
import AppVersion from "./AppVersion";

// Firebase Imports
import { auth } from "../lib/firebase";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

// Settings Modal Component
function SettingsModal({ isOpen, onClose, navigate }) {
  if (!isOpen) return null;

  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full scale-150" />

        <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-black/[0.02] pointer-events-none" />

          {/* Inner glow */}
          <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none" />

          <div className="relative p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand-600/20 backdrop-blur-xl border border-brand/30 flex items-center justify-center shadow-lg shadow-brand/20">
                <Settings className="text-brand" size={24} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white uppercase">
                Settings
              </h3>
            </div>

            <div className="space-y-3">
              {/* What's New - For Everyone */}
              <button
                onClick={() => handleNavigation("/whats-new")}
                className="w-full p-4 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center gap-4 hover:bg-white/[0.06] hover:border-brand/30 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand/20 to-brand-600/20 backdrop-blur-xl border border-brand/30 flex items-center justify-center">
                  <Sparkles className="text-brand" size={20} strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">What's New</div>
                  <div className="text-xs text-white/40">View changelog</div>
                </div>
              </button>

              {/* Conditional Options Based on Admin Status */}
              {isAdmin ? (
                // Admin sees Admin Suggestions Page
                <button
                  onClick={() => handleNavigation("/admin/suggestions")}
                  className="w-full p-4 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center gap-4 hover:bg-white/[0.06] hover:border-brand/30 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 flex items-center justify-center">
                    <Lightbulb
                      className="text-yellow-500"
                      size={20}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">
                      Admin Suggestions
                    </div>
                    <div className="text-xs text-white/40">
                      Review all user suggestions
                    </div>
                  </div>
                </button>
              ) : (
                // Regular users see Make a Suggestion Page
                <button
                  onClick={() => handleNavigation("/suggestions")}
                  className="w-full p-4 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center gap-4 hover:bg-white/[0.06] hover:border-brand/30 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center">
                    <Lightbulb
                      className="text-blue-500"
                      size={20}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">
                      Make a Suggestion
                    </div>
                    <div className="text-xs text-white/40">
                      Share your ideas
                    </div>
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 text-xs font-semibold uppercase text-white/40 tracking-wider hover:text-white/60 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddSelection, setShowAddSelection] = useState(false);

  const hideNavbarPaths = ["/login", "/register"];
  if (hideNavbarPaths.includes(location.pathname)) return null;

  const navItems = [
    { label: "Recipes", path: "/", icon: UtensilsCrossed },
    { label: "Shopping List", path: "/shopping-list", icon: ShoppingCart },
    { label: "Favorites", path: "/favorites", icon: Heart },
    { label: "Meal Plan", path: "/weekly-meal-plan", icon: CalendarDays },
  ];

  const handleSettingsClick = (e) => {
    e.preventDefault();
    setShowSettingsModal(true);
    setMobileNavOpen(false);
  };

  const NavButton = ({ item, isMobile = false }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    if (isMobile) {
      return (
        <button
          onClick={() => {
            navigate(item.path);
            setMobileNavOpen(false);
          }}
          className={`flex flex-row items-center justify-start gap-4 px-5 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 ${
            isActive
              ? "bg-gradient-to-br from-brand to-brand-600 text-white shadow-lg shadow-brand/20 border border-white/20"
              : "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white/80"
          }`}
        >
          <item.icon size={20} strokeWidth={2} />
          <span>{item.label}</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate(item.path)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-br from-brand to-brand-600 text-white shadow-lg shadow-brand/20 scale-[1.02] border border-white/20"
            : "bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] text-white/60 hover:bg-white/[0.06] hover:text-white/80 hover:border-white/[0.1]"
        }`}
      >
        <Icon size={16} strokeWidth={2} />
        {item.label}
      </button>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl">
        {/* Subtle top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-3 items-center h-20 md:flex md:justify-between">
            <div className="md:hidden" />

            {/* Logo */}
            <div
              className="cursor-pointer group flex items-center gap-3 justify-center md:justify-start"
              onClick={() => navigate("/")}
            >
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-brand/30 blur-xl rounded-full group-hover:bg-brand/50 transition-all duration-300" />
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-brand to-brand-600 flex items-center justify-center shadow-lg border border-white/20">
                  <UtensilsCrossed
                    className="text-white"
                    size={22}
                    strokeWidth={2}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tighter text-white leading-none">
                  ELEVATED<span className="text-brand">FUEL</span>
                </h1>
                <div className="sm:hidden flex justify-center mt-1">
                  <AppVersion />
                </div>
                <div className="hidden sm:flex items-center gap-1.5 mt-1">
                  <Sparkles size={10} className="text-brand animate-pulse" />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-semibold">
                    Performance Nutrition <AppVersion />
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="flex justify-end items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <nav className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-xl p-2 rounded-2xl border border-white/[0.06]">
                  {navItems.map((item) => (
                    <NavButton key={item.path} item={item} />
                  ))}
                </nav>

                {/* Add Button */}
                <button
                  onClick={() => setShowAddSelection(true)}
                  className="group relative h-11 w-11 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 hover:scale-110"
                  title="Add Recipe"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-600" />
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-xl" />
                  <div className="absolute inset-0 rounded-xl border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]" />
                  <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-shadow duration-300" />
                  <Plus
                    size={22}
                    strokeWidth={2.5}
                    className="relative text-white"
                  />
                </button>

                {/* Settings Button */}
                <button
                  onClick={handleSettingsClick}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] text-white/60 hover:bg-white/[0.06] hover:text-white/80 hover:border-white/[0.1] transition-all duration-300"
                >
                  <Settings size={20} strokeWidth={2} />
                </button>
              </div>

              {/* Mobile Menu Toggle */}

              <button
                className="md:hidden rounded-xl bg-white/[0.04] backdrop-blur-xl p-3 border border-white/[0.08] text-white/60 hover:text-white/80 transition-colors"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out border-t border-white/[0.06] ${
            mobileNavOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4 space-y-3 bg-black/20 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-3">
              {navItems.map((item) => (
                <NavButton key={item.path} item={item} isMobile />
              ))}

              <button
                onClick={handleSettingsClick}
                className="flex flex-row items-center justify-start gap-4 px-5 py-4 rounded-xl font-semibold text-sm tracking-wide bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-all"
              >
                <UserCircle size={20} strokeWidth={2} />
                Settings
              </button>
            </div>

            {/* Mobile Add Button */}
            <button
              onClick={() => {
                setShowAddSelection(true);
                setMobileNavOpen(false);
              }}
              className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-600" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl" />
              <div className="absolute inset-0 rounded-xl border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]" />
              <Plus
                size={20}
                strokeWidth={2.5}
                className="relative text-white"
              />
              <span className="relative text-white font-semibold uppercase tracking-wide text-sm">
                Add Recipe
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Add Recipe Selection Modal */}
      {showAddSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setShowAddSelection(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md">
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand/20 blur-3xl rounded-full" />

            <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-black/[0.02] pointer-events-none" />

              {/* Inner glow */}
              <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none" />

              <div className="relative p-8">
                <h3 className="text-2xl font-black text-center uppercase tracking-tight text-white mb-8">
                  Choose Method
                </h3>

                <div className="space-y-4">
                  {/* Quick Add Option */}
                  <button
                    onClick={() => {
                      setShowAddSelection(false);
                      navigate("/add-recipe?mode=quick");
                    }}
                    className="w-full p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center gap-5 hover:bg-white/[0.06] hover:border-brand/30 transition-all group text-left shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand/20 to-brand-600/20 backdrop-blur-xl border border-brand/30 flex items-center justify-center shrink-0 shadow-lg shadow-brand/10">
                      <Zap
                        className="text-brand group-hover:scale-110 transition-transform"
                        size={24}
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <div className="font-bold uppercase text-sm tracking-wide text-white">
                        Quick Add
                      </div>
                      <div className="text-xs text-white/40 font-medium mt-1">
                        Title, Link, and Tags only
                      </div>
                    </div>
                  </button>

                  {/* Full Recipe Option */}
                  <button
                    onClick={() => {
                      setShowAddSelection(false);
                      navigate("/add-recipe?mode=full");
                    }}
                    className="group relative w-full p-6 rounded-2xl flex items-center gap-5 hover:scale-[1.02] transition-all text-left overflow-hidden border-0"
                  >
                    {/* Background layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-600 rounded-2xl" />
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                    <div className="absolute inset-0 rounded-2xl border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]" />
                    <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]" />

                    <div className="relative w-14 h-14 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 text-white border border-white/30">
                      <UtensilsCrossed size={24} strokeWidth={2} />
                    </div>
                    <div className="relative">
                      <div className="font-bold uppercase text-sm tracking-wide text-white">
                        Full Recipe
                      </div>
                      <div className="text-xs text-white/60 font-medium mt-1">
                        Complete steps & nutrition
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowAddSelection(false)}
                  className="w-full mt-6 py-3 text-xs font-semibold uppercase text-white/40 tracking-wider hover:text-white/60 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        navigate={navigate}
      />
    </>
  );
}
