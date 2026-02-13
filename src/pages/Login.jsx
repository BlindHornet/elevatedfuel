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

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  // const loginUrlForReset = useMemo(() => {
  //   return "https://elevated-fuel.netlify.app/Login";
  // }, []);

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

      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, to, actionCodeSettings);

      // Updated success message
      setResetMsg(
        "Reset link sent! Please check your inbox. If you don't see it, check your spam folder.",
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
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-brand/25 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-[360px] h-[360px] bg-brand/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-28 left-1/3 w-[520px] h-[520px] bg-brand/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Form side */}
        <div className="grid place-items-center px-4 py-10 lg:py-0 order-2 lg:order-1">
          <div className="w-full max-w-md">
            <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="relative p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-8">
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
          </div>
        </div>

        {/* Visual side (desktop) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[url('https://knockoutpw.online/social-share.png')] bg-cover bg-center relative order-1 lg:order-2"></div>
      </div>

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop - blurred and darkened to pop the modal */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setShowReset(false)}
          />

          {/* Modal Container - Centered Overlay */}
          <div
            className="
        relative w-full max-w-md
        bg-[#121212] backdrop-blur-2xl
        border border-white/[0.12]
        shadow-[0_30px_90px_rgba(0,0,0,0.8)]
        rounded-[32px]
        overflow-hidden
        z-[101]
        animate-in fade-in zoom-in-95 duration-200
      "
            role="dialog"
          >
            {/* Top Sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.08] to-transparent" />

            <div className="relative p-8 sm:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Reset Password
                  </h3>
                  <p className="text-sm text-muted mt-2">
                    We'll send a recovery link to your email.
                  </p>
                </div>
                <button
                  onClick={() => setShowReset(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={onSendReset} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-semibold text-muted">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-white/[0.05] rounded-2xl px-5 py-4 text-white border border-white/[0.10] outline-none transition-all focus:border-brand/60"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@fuel.com"
                    required
                  />
                </div>

                {resetMsg && (
                  <div className="space-y-3">
                    <div className="text-sm text-brand bg-brand/10 border border-brand/20 rounded-2xl p-4">
                      {resetMsg}
                    </div>

                    {/* Explicit spam notification if the email was successfully sent */}
                    {!resetMsg.includes("Could not") &&
                      !resetMsg.includes("Enter the email") && (
                        <div className="flex items-center gap-2 px-4 text-xs text-muted/80">
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                          <p>
                            Pro-tip: Don't forget to check your{" "}
                            <strong>spam folder</strong>!
                          </p>
                        </div>
                      )}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    disabled={resetBusy}
                    className="w-full py-4 rounded-2xl bg-brand text-black font-black uppercase tracking-widest disabled:opacity-50 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                  >
                    {resetBusy ? "Sending..." : "Send Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    className="w-full py-4 rounded-2xl bg-white/[0.05] border border-white/[0.10] text-white font-bold hover:bg-white/[0.10] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
