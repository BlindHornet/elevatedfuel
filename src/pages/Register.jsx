// Module Imports
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Firebase Imports
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await updateProfile(cred.user, { displayName: name.trim() });
      nav("/", { replace: true });
    } catch (error) {
      console.error("Firebase register error:", error);
      const code = error?.code || "";
      const map = {
        "auth/email-already-in-use": "That email is already registered.",
        "auth/invalid-email": "That email address doesn’t look valid.",
        "auth/weak-password": "Password too weak (min 6 characters).",
        "auth/operation-not-allowed": "Registration is currently disabled.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setErr(map[code] || error?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg text-text">
      {/* Right Side: Form (Order 1 on mobile, Order 2 on desktop) */}
      <div className="grid place-items-center px-4 relative order-2 lg:order-1">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-brand/5 blur-[120px] rounded-full"></div>

        <div className="w-full max-w-sm relative">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">
              Create your profile
            </h1>
            <p className="text-muted mt-2">
              Join the community and start tracking your fuel.
            </p>
          </div>

          {err && (
            <div className="mb-6 rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger animate-in fade-in slide-in-from-top-1">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                Name to go by
              </label>
              <input
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 outline-none focus:border-brand transition-all"
                placeholder="How should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>

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
              <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                Password
              </label>
              <input
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 outline-none focus:border-brand transition-all"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              disabled={busy}
              className="w-full rounded-full bg-brand px-4 py-4 font-bold uppercase tracking-widest text-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {busy ? "Registering..." : "Join Elevated Fuel"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted">
            Already a member?{" "}
            <Link to="/login" className="text-brand font-bold hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>

      {/* Left Side: Visuals (Order 2 on mobile, Order 1 on desktop) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[url('https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071')] bg-cover bg-center relative order-1 lg:order-2">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        <div className="relative z-10 text-right">
          <h2 className="text-4xl font-bold tracking-tighter text-brand">
            ELEVATE
          </h2>
        </div>
        <div className="relative z-10 text-right">
          <p className="text-2xl font-light italic max-w-xs ml-auto">
            "The foundation of fitness starts in the kitchen."
          </p>
        </div>
      </div>
    </div>
  );
}
