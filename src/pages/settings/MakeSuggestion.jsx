// Module Imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Lightbulb,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

// Firebase Imports
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

export default function MakeSuggestionPage() {
  const navigate = useNavigate();
  const [suggestionText, setSuggestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentUser = auth.currentUser;

  // Load user's suggestions
  useEffect(() => {
    if (!currentUser) return;

    const suggestionsRef = collection(
      db,
      "users",
      currentUser.uid,
      "suggestions",
    );
    const q = query(suggestionsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedSuggestions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSuggestions(loadedSuggestions);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please log in to submit a suggestion.");
      return;
    }

    if (!suggestionText.trim()) {
      alert("Please enter your suggestion.");
      return;
    }

    setSubmitting(true);

    try {
      const suggestionsRef = collection(
        db,
        "users",
        currentUser.uid,
        "suggestions",
      );

      await addDoc(suggestionsRef, {
        userName: currentUser.displayName || currentUser.email || "Anonymous",
        userEmail: currentUser.email,
        requestText: suggestionText.trim(),
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminResponse: null,
      });

      // Clear form and show success
      setSuggestionText("");
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      alert("Failed to submit suggestion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "approved":
      case "completed":
        return <CheckCircle size={16} className="text-green-500" />;
      case "rejected":
      case "declined":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "approved":
      case "completed":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "rejected":
      case "declined":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-muted bg-muted/10 border-muted/20";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted hover:text-brand transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">
              Back
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Lightbulb className="text-brand" size={20} />
            <h1 className="text-xl font-black uppercase tracking-tight">
              Suggestions
            </h1>
          </div>

          <div className="w-20"></div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <p className="text-green-500 font-semibold">
              Suggestion submitted successfully! We'll review it soon.
            </p>
          </div>
        )}

        {/* Submission Form */}
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand/20">
              <MessageSquare size={24} className="text-brand" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Make a Suggestion
              </h2>
              <p className="text-muted text-sm">
                Share your ideas to help us improve
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted mb-2">
                Your Suggestion
              </label>
              <textarea
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                placeholder="Tell us what you'd like to see..."
                className="w-full bg-bg border border-border rounded-xl p-4 h-40 outline-none focus:border-brand transition-colors resize-none text-text"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !suggestionText.trim()}
              className="w-full py-4 rounded-full bg-brand text-white font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Clock size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Suggestion
                </>
              )}
            </button>
          </form>
        </div>

        {/* User's Suggestions List */}
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
          <h3 className="text-xl font-black uppercase tracking-tight mb-4">
            Your Suggestions
          </h3>

          {suggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/10 mb-4">
                <Lightbulb size={32} className="text-muted" />
              </div>
              <p className="text-muted">
                You haven't submitted any suggestions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  onClick={() => navigate(`/suggestion/${suggestion.id}`)}
                  className="bg-bg border border-border rounded-xl p-4 hover:border-brand/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <p className="text-text leading-relaxed line-clamp-2 group-hover:text-brand transition-colors">
                        {suggestion.requestText}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(suggestion.status)}`}
                    >
                      {getStatusIcon(suggestion.status)}
                      {suggestion.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{formatDate(suggestion.createdAt)}</span>
                    <div className="flex items-center gap-1 text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={14} />
                      <span className="font-semibold uppercase">
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
