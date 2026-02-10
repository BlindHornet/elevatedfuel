// Module Imports
import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Firebase Auth Import
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(() => {
    const role =
      user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        ? "admin"
        : "user";
    return { user, role, loading };
  }, [user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
