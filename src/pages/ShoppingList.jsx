// Module Imports
import React, { useEffect, useMemo, useState } from "react";
import { Trash2, ShoppingBag, CheckCircle2, Circle } from "lucide-react";

// Firebase Imports
import { db, auth } from "../lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDeleteList, setShowConfirmDeleteList] = useState(false);

  // Keep sorted without mutating the incoming array
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) =>
      (a?.name || "").localeCompare(b?.name || ""),
    );
  }, [items]);

  useEffect(() => {
    let unsubList = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      // clean up any prior list listener if auth changes
      if (unsubList) {
        unsubList();
        unsubList = null;
      }

      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const listRef = doc(db, "users", user.uid, "shoppingList", "current");
      unsubList = onSnapshot(listRef, (snap) => {
        const data = snap.exists() ? snap.data() : null;
        const listItems = Array.isArray(data?.items) ? data.items : [];
        setItems(listItems);
        setLoading(false);
      });
    });

    return () => {
      if (unsubList) unsubList();
      unsubscribeAuth();
    };
  }, []);

  const toggleItem = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const newItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );

    await updateDoc(doc(db, "users", user.uid, "shoppingList", "current"), {
      items: newItems,
    });
  };

  const clearList = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // This is called ONLY from the modal confirmation
    await setDoc(
      doc(db, "users", user.uid, "shoppingList", "current"),
      { items: [] },
      { merge: true },
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-white p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Shopping <span className="text-brand">List</span>
            </h1>
            <p className="text-muted text-xs font-bold uppercase tracking-widest mt-1">
              {sortedItems.length} Items Total
            </p>
          </div>

          {sortedItems.length > 0 && (
            <button
              onClick={() => setShowConfirmDeleteList(true)}
              className="p-3 bg-danger/10 text-danger rounded-full"
              title="Delete list"
            >
              <Trash2 size={20} />
            </button>
          )}
        </header>

        <div className="space-y-3">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                item.checked
                  ? "bg-white/5 border-transparent opacity-50"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                {item.checked ? (
                  <CheckCircle2 className="text-brand" />
                ) : (
                  <Circle className="text-muted" />
                )}
                <div>
                  <p
                    className={`font-black uppercase tracking-tight ${
                      item.checked ? "line-through" : ""
                    }`}
                  >
                    {item.name}
                  </p>
                  <p className="text-[10px] font-bold text-muted uppercase">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {sortedItems.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-[2.5rem]">
              <ShoppingBag
                size={48}
                className="mx-auto text-muted mb-4 opacity-20"
              />
              <p className="text-muted font-black uppercase tracking-widest text-xs">
                Your list is empty
              </p>
            </div>
          )}
        </div>
      </div>

      {showConfirmDeleteList && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-4">
          <div className="bg-card border border-border p-8 rounded-[var(--radius-lg)] max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
              <Trash2 className="text-brand text-red-400" size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Delete Shopping List?
              </h2>
              <p className="text-muted leading-relaxed">
                Are you sure you want to delete your shopping list?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  await clearList();
                  setShowConfirmDeleteList(false);
                }}
                className="w-full py-4 bg-danger text-white rounded-full font-black uppercase tracking-widest shadow-lg"
              >
                Delete Shopping List
              </button>

              <button
                onClick={() => setShowConfirmDeleteList(false)}
                className="w-full py-4 border border-border rounded-full font-black uppercase tracking-widest text-muted hover:text-text transition-colors"
              >
                Keep My Stuff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
