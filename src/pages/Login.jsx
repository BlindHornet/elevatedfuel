// Module Imports
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Firebase Imports
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      nav(from, { replace: true });
    } catch (error) {
      console.error("Firebase login error:", error);

      const code = error?.code || "";
      const map = {
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/user-not-found": "No account found with that email.",
        "auth/wrong-password": "Email or password is incorrect.",
        "auth/invalid-email": "That email address doesn’t look valid.",
        "auth/user-disabled": "This account is disabled.",
        "auth/too-many-requests": "Too many attempts. Try again in a bit.",
        "auth/operation-not-allowed":
          "Email/password sign-in is not enabled in Firebase.",
      };

      setErr(map[code] || error?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    // Inside the return of Login.jsx
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg text-text">
      {/* Left Side: Brand/Visuals */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold tracking-tighter text-brand">
            ELEVATED FUEL
          </h2>
        </div>
        <div className="relative z-10">
          <p className="text-2xl font-light italic">
            "Precision nutrition for peak performance."
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="grid place-items-center px-4 relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand/10 blur-[120px] rounded-full"></div>

        <div className="w-full max-w-sm relative">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted mt-2">
              Fuel your goals. Log in to your dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                Email
              </label>
              <input
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 outline-none focus:border-brand transition-all"
                type="email"
                placeholder="name@energy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                  Password
                </label>
              </div>
              <input
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 outline-none focus:border-brand transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              disabled={busy}
              className="w-full rounded-full bg-brand px-4 py-4 font-bold uppercase tracking-widest text-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {busy ? "Authorizing..." : "Start Fueling →"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted">
            New to the platform?{" "}
            <Link
              to="/register"
              className="text-brand font-bold hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
