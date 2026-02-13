// Module Imports
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Firebase Imports
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Reset password UI
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const loginUrlForReset = useMemo(() => {
    // Where users should land after they finish reset (optional but recommended)
    // Use your deployed domain:
    return "https://elevated-fuel.netlify.app/Login";
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      nav("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      const code = error?.code || "";
      const map = {
        "auth/invalid-email": "Invalid email address.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/user-not-found": "No account found with that email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setErr(map[code] || error?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onSendReset(e) {
    e.preventDefault();
    setResetMsg("");
    setErr("");
    setResetBusy(true);

    try {
      const to = resetEmail.trim();
      if (!to) {
        setResetMsg("Enter the email you used to register.");
        return;
      }

      // Optional: customize where the action links back to
      // NOTE: The actual email HTML is controlled in Firebase Console Templates.
      const actionCodeSettings = {
        url: loginUrlForReset,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, to, actionCodeSettings);

      setResetMsg(
        "Password reset email sent. Check spam/promotions if you don’t see it.",
      );
    } catch (error) {
      console.error("Reset email error:", error);
      const code = error?.code || "";
      const map = {
        "auth/invalid-email": "That email doesn’t look valid.",
        "auth/user-not-found": "No account found with that email.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setResetMsg(map[code] || "Could not send reset email.");
    } finally {
      setResetBusy(false);
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
            <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />

              <div className="relative p-8 sm:p-10">
                {/* Header badge */}
                <div className="flex items-center gap-4 mb-8">
                  {/* <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/25 to-brand-600/15 backdrop-blur-xl border border-brand/30 flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                    <span className="text-2xl font-black text-brand">⚡</span>
                  </div> */}
                  <div>
                    <div className="text-2xl font-black tracking-tight">
                      Elevated <span className="text-brand">Fuel</span>
                    </div>
                    <div className="text-xs uppercase tracking-[0.28em] text-muted">
                      Welcome back
                    </div>
                  </div>
                </div>

                <p className="text-muted -mt-2 mb-6">
                  Log in to continue your weekly fuel plan.
                </p>

                {err && (
                  <div className="mb-6 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                    {err}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                      Email
                    </label>
                    <input
                      className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-5 py-4 text-white border border-white/[0.08] outline-none transition-all focus:border-brand/50 focus:bg-white/[0.06]"
                      type="email"
                      placeholder="name@fuel.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                      Password
                    </label>
                    <input
                      className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-5 py-4 text-white border border-white/[0.08] outline-none transition-all focus:border-brand/50 focus:bg-white/[0.06]"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setResetMsg("");
                        setResetEmail(email.trim());
                        setShowReset(true);
                      }}
                      className="text-muted hover:text-brand transition-colors"
                    >
                      Forgot password?
                    </button>

                    <Link
                      to="/register"
                      className="text-brand font-bold hover:underline"
                    >
                      Create account
                    </Link>
                  </div>

                  <button
                    disabled={busy}
                    className="w-full py-4 rounded-2xl bg-brand text-black font-black uppercase tracking-widest shadow-[0_18px_45px_rgba(16,185,129,0.22)] hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50"
                  >
                    {busy ? "Logging in..." : "Log In"}
                  </button>
                </form>
              </div>
            </div>

            {/* <div className="mt-6 text-center text-xs text-muted/80">
              Tip: if you don’t see emails, check Promotions/Spam first.
            </div> */}
          </div>
        </div>

        {/* Visual side (desktop) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[url('https://elevated-fuel.netlify.app/social-share.png')] bg-cover bg-center relative order-1 lg:order-2">
          {/* <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" /> */}
          <div className="relative z-10 text-right">
            {/* <h2 className="text-4xl font-black tracking-tighter text-brand">
              ELEVATE
            </h2> */}
          </div>
          <div className="relative z-10 text-right">
            {/* <p className="text-2xl font-light italic max-w-xs ml-auto">
              "The foundation of fitness starts in the kitchen."
            </p> */}
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowReset(false)}
          />
          <div className="relative w-full max-w-md bg-white/[0.05] backdrop-blur-2xl rounded-3xl border border-white/[0.10] shadow-[0_30px_90px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />

            <div className="relative p-6 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-black">Reset your password</div>
                  <div className="text-sm text-muted mt-1">
                    We’ll email you a reset link.
                  </div>
                </div>
                <button
                  onClick={() => setShowReset(false)}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-muted hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={onSendReset} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                    Email
                  </label>
                  <input
                    className="w-full bg-white/[0.04] backdrop-blur-xl rounded-2xl px-5 py-4 text-white border border-white/[0.08] outline-none transition-all focus:border-brand/50 focus:bg-white/[0.06]"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@energy.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {resetMsg && (
                  <div className="text-sm text-muted bg-white/[0.03] border border-white/[0.08] rounded-2xl p-3">
                    {resetMsg}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    className="flex-1 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-bold hover:bg-white/[0.06] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={resetBusy}
                    className="flex-1 py-3 rounded-2xl bg-brand text-black font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {resetBusy ? "Sending..." : "Send Link"}
                  </button>
                </div>

                {/* <div className="text-xs text-muted/80">
                  If it doesn’t arrive, check Promotions/Spam. Some providers
                  delay first-time senders.
                </div> */}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
