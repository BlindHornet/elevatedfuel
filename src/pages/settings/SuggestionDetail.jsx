// Module Imports
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";

// Firebase Imports
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

export default function SuggestionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser || !id) {
      navigate("/suggestions");
      return;
    }

    loadSuggestion();
  }, [currentUser, id]);

  const loadSuggestion = async () => {
    try {
      const suggestionRef = doc(
        db,
        "users",
        currentUser.uid,
        "suggestions",
        id,
      );
      const snap = await getDoc(suggestionRef);

      if (snap.exists()) {
        setSuggestion({ id: snap.id, ...snap.data() });
      } else {
        alert("Suggestion not found.");
        navigate("/suggestions");
      }
    } catch (error) {
      console.error("Error loading suggestion:", error);
      alert("Failed to load suggestion.");
      navigate("/suggestions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={24} className="text-yellow-500" />;
      case "approved":
      case "completed":
      case "in progress":
        return <CheckCircle size={24} className="text-green-500" />;
      case "rejected":
      case "declined":
        return <XCircle size={24} className="text-red-500" />;
      default:
        return <AlertCircle size={24} className="text-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "approved":
      case "completed":
      case "in progress":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "rejected":
      case "declined":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-muted bg-muted/10 border-muted/20";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!suggestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/suggestions")}
            className="flex items-center gap-2 text-muted hover:text-brand transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">
              Back to Suggestions
            </span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Status Card */}
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl ${getStatusColor(suggestion.status)}`}
              >
                {getStatusIcon(suggestion.status)}
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">
                  Suggestion Details
                </h1>
                <p className="text-muted text-sm">
                  Track the status of your request
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase border ${getStatusColor(suggestion.status)}`}
            >
              {getStatusIcon(suggestion.status)}
              {suggestion.status}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-bg border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase mb-1">
                <Calendar size={14} />
                Submitted
              </div>
              <p className="text-text font-semibold">
                {formatDate(suggestion.createdAt)}
              </p>
            </div>

            <div className="bg-bg border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase mb-1">
                <Clock size={14} />
                Last Updated
              </div>
              <p className="text-text font-semibold">
                {formatDate(suggestion.updatedAt)}
              </p>
            </div>
          </div>

          {/* Submitter Info */}
          <div className="bg-bg border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase mb-2">
              <User size={14} />
              Submitted By
            </div>
            <p className="text-text font-semibold">{suggestion.userName}</p>
            <p className="text-muted text-sm">{suggestion.userEmail}</p>
          </div>

          {/* Suggestion Content */}
          <div className="bg-bg border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase mb-3">
              <MessageSquare size={14} />
              Your Suggestion
            </div>
            <p className="text-text leading-relaxed whitespace-pre-wrap">
              {suggestion.requestText}
            </p>
          </div>
        </div>

        {/* Admin Response (if exists) */}
        {suggestion.adminResponse && (
          <div className="bg-card border border-brand/20 rounded-[var(--radius-lg)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/20">
                <MessageSquare size={20} className="text-brand" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-brand">
                Admin Response
              </h2>
            </div>
            <div className="bg-bg border border-border rounded-xl p-4">
              <p className="text-text leading-relaxed whitespace-pre-wrap">
                {suggestion.adminResponse}
              </p>
            </div>
          </div>
        )}

        {/* Status Explanation */}
        {suggestion.status?.toLowerCase() === "pending" && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-[var(--radius-lg)] p-4">
            <div className="flex items-start gap-3">
              <Clock className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-yellow-500 font-bold uppercase text-sm mb-1">
                  Pending Review
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  Your suggestion is awaiting review by our team. We'll update
                  the status as soon as we've had a chance to look at it.
                </p>
              </div>
            </div>
          </div>
        )}

        {(suggestion.status?.toLowerCase() === "approved" ||
          suggestion.status?.toLowerCase() === "completed") && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-[var(--radius-lg)] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle
                className="text-green-500 flex-shrink-0 mt-1"
                size={20}
              />
              <div>
                <h3 className="text-green-500 font-bold uppercase text-sm mb-1">
                  {suggestion.status}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  Thank you for your suggestion! We've reviewed it and{" "}
                  {suggestion.status?.toLowerCase() === "completed"
                    ? "it has been implemented"
                    : "we're working on implementing it"}
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {(suggestion.status?.toLowerCase() === "rejected" ||
          suggestion.status?.toLowerCase() === "declined") && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-[var(--radius-lg)] p-4">
            <div className="flex items-start gap-3">
              <XCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-red-500 font-bold uppercase text-sm mb-1">
                  Not Moving Forward
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  We appreciate your suggestion, but we're unable to move
                  forward with this at this time. Check the admin response above
                  for more details.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
