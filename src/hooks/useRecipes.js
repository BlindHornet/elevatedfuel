// Module Imports
import { useEffect, useState } from "react";

// Firebase Imports
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const ref = collection(db, "recipes");

    // Optional: sort by title (requires documents to have title field)
    const q = query(ref, orderBy("title"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRecipes(results);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore recipes error:", err);
        setError(err?.message || "Failed to load recipes.");
        setLoading(false);
      },
    );

    // ✅ cleanup (required for onSnapshot)
    return () => unsubscribe();
  }, []);

  return { recipes, loading, error };
}
