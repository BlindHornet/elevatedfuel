// Module Imports
import React, { useEffect, useState, useMemo } from "react";
import { Search, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Firebase Imports
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

// Component Imports
import RecipeCard from "../components/RecipeCard";

export default function Favorites() {
  const [favRecipes, setFavRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const favsRef = collection(db, "users", auth.currentUser.uid, "favorites");
    const unsubscribe = onSnapshot(favsRef, async (snapshot) => {
      const recipePromises = snapshot.docs.map(async (favDoc) => {
        const recipeSnap = await getDoc(doc(db, "recipes", favDoc.id));
        return recipeSnap.exists()
          ? { id: recipeSnap.id, ...recipeSnap.data() }
          : null;
      });

      const results = await Promise.all(recipePromises);
      setFavRecipes(results.filter((r) => r !== null));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredFavs = useMemo(() => {
    return favRecipes.filter(
      (r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags?.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  }, [favRecipes, searchQuery]);

  if (loading)
    return (
      <div className="p-10 text-center text-muted">Loading Favorites...</div>
    );

  return (
    <div className="min-h-screen bg-bg text-text p-6">
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
          <Heart className="text-red-500 fill-red-500" /> My Favorites
        </h1>

        <div className="relative max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={18}
          />
          <input
            type="text"
            placeholder="Search your favorites..."
            className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-brand transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {filteredFavs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavs.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onOpen={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
            <p className="text-muted font-bold uppercase tracking-widest">
              No matching favorites found.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
