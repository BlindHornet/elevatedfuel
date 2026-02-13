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
    <div className="min-h-screen bg-bg text-text relative overflow-hidden">
      {/* Background glow (mobile + desktop) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-brand/25 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-[360px] h-[360px] bg-brand/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-28 left-1/3 w-[520px] h-[520px] bg-brand/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Form side */}
        <div className="grid place-items-center px-4 py-10 lg:py-0 order-2 lg:order-1">
          <div className="w-full max-w-md">
            {/* Glass card */}
            <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden">
              {/* subtle top sheen */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />

              <div className="relative p-8 sm:p-10">
                {/* Header badge (mobile-friendly) */}
                <div className="flex items-center gap-4 mb-8">
                  {/* <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/25 to-brand-600/15 backdrop-blur-xl border border-brand/30 flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                    <span className="text-2xl font-black text-brand">⚡</span>
                  </div> */}
                  <div>
                    <div className="text-2xl font-black tracking-tight">
                      Elevated <span className="text-brand">Fuel</span>
                    </div>
                    <div className="text-xs uppercase tracking-[0.28em] text-muted">
                      Create your profile
                    </div>
                  </div>
                </div>

                <p className="text-muted -mt-2 mb-6">
                  Where Fueling the Body is Key.
                </p>

                {err && (
                  <div className="mb-6 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                    {err}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                      Name to go by
                    </label>
                    <input
                      className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-5 py-4 text-white border border-white/[0.08] outline-none transition-all focus:border-brand/50 focus:bg-white/[0.06]"
                      placeholder="How should we call you?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                      Email
                    </label>
                    <input
                      className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-5 py-4 text-white border border-white/[0.08] outline-none transition-all focus:border-brand/50 focus:bg-white/[0.06]"
                      type="email"
                      placeholder="name@energy.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                      Password
                    </label>
                    <input
                      className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-5 py-4 text-white border border-white/[0.08] outline-none transition-all focus:border-brand/50 focus:bg-white/[0.06]"
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
                    className="w-full py-4 rounded-2xl bg-brand text-black font-black uppercase tracking-widest shadow-[0_18px_45px_rgba(16,185,129,0.22)] hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50"
                  >
                    {busy ? "Registering..." : "Join Elevated Fuel"}
                  </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted">
                  Already a member?{" "}
                  <Link
                    to="/login"
                    className="text-brand font-bold hover:underline"
                  >
                    Log in here
                  </Link>
                </div>
              </div>
            </div>

            {/* tiny footer note */}
            {/* <div className="mt-6 text-center text-xs text-muted/80">
              By creating an account you agree to keep leveling up.
            </div> */}
          </div>
        </div>

        {/* Visual side (desktop) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[url('https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071')] bg-cover bg-center relative order-1 lg:order-2">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-10 text-right">
            <h2 className="text-4xl font-black tracking-tighter text-brand">
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
    </div>
  );
}
