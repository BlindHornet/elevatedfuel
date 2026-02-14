import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Save,
  Filter,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  collectionGroup,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AdminSuggestionsPage() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Wait for auth to be ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user?.email);
      console.log("Admin email from env:", ADMIN_EMAIL);
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is logged in
    if (!currentUser) {
      alert("Please log in to access this page.");
      navigate("/");
      return;
    }

    // Check if user is admin
    if (!isAdmin) {
      console.log(
        "Access denied. User email:",
        currentUser.email,
        "Admin email:",
        ADMIN_EMAIL,
      );
      alert("Access denied. Admin only.");
      navigate("/");
      return;
    }

    loadAllSuggestions();
  }, [isAdmin, authLoading, currentUser]);

  const loadAllSuggestions = async () => {
    try {
      setLoading(true);

      const suggestionsQuery = query(
        collectionGroup(db, "suggestions"),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(suggestionsQuery);
      const loadedSuggestions = [];

      snapshot.docs.forEach((docSnap) => {
        const pathParts = docSnap.ref.path.split("/");
        const userId = pathParts[1];

        loadedSuggestions.push({
          id: docSnap.id,
          userId: userId,
          ...docSnap.data(),
        });
      });

      setSuggestions(loadedSuggestions);
    } catch (error) {
      console.error("Error loading suggestions:", error);
      alert("Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminResponse(suggestion.adminResponse || "");
    setNewStatus(suggestion.status || "Pending");
  };

  const handleUpdateSuggestion = async () => {
    if (!selectedSuggestion) return;

    setSaving(true);

    try {
      const suggestionRef = doc(
        db,
        "users",
        selectedSuggestion.userId,
        "suggestions",
        selectedSuggestion.id,
      );

      await updateDoc(suggestionRef, {
        status: newStatus,
        adminResponse: adminResponse.trim() || null,
        updatedAt: serverTimestamp(),
      });

      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === selectedSuggestion.id
            ? {
                ...s,
                status: newStatus,
                adminResponse: adminResponse.trim() || null,
              }
            : s,
        ),
      );

      setSelectedSuggestion({
        ...selectedSuggestion,
        status: newStatus,
        adminResponse: adminResponse.trim() || null,
      });

      alert("Suggestion updated successfully!");
    } catch (error) {
      console.error("Error updating suggestion:", error);
      alert("Failed to update suggestion.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "approved":
      case "completed":
      case "in progress":
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
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  const statusCounts = {
    all: suggestions.length,
    pending: suggestions.filter((s) => s.status?.toLowerCase() === "pending")
      .length,
    approved: suggestions.filter((s) => s.status?.toLowerCase() === "approved")
      .length,
    "in progress": suggestions.filter(
      (s) => s.status?.toLowerCase() === "in progress",
    ).length,
    completed: suggestions.filter(
      (s) => s.status?.toLowerCase() === "completed",
    ).length,
    rejected: suggestions.filter((s) => s.status?.toLowerCase() === "rejected")
      .length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="text-muted">
          {authLoading
            ? "Checking authentication..."
            : "Loading suggestions..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      <div className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
              Admin - All Suggestions
            </h1>
          </div>

          <div className="w-20"></div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={16} className="text-muted" />
                <span className="text-xs font-bold uppercase text-muted">
                  Filter by Status
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "all",
                  "pending",
                  "approved",
                  "in progress",
                  "completed",
                  "rejected",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border transition-all ${
                      filterStatus === status
                        ? "bg-brand text-white border-brand"
                        : "bg-bg border-border text-muted hover:border-brand/50"
                    }`}
                  >
                    {status} ({statusCounts[status] || 0})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredSuggestions.length === 0 ? (
                <div className="bg-card border border-border rounded-[var(--radius-lg)] p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/10 mb-4">
                    <Lightbulb size={32} className="text-muted" />
                  </div>
                  <p className="text-muted">
                    No suggestions found for this filter.
                  </p>
                </div>
              ) : (
                filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`bg-card border rounded-[var(--radius-lg)] p-4 cursor-pointer transition-all ${
                      selectedSuggestion?.id === suggestion.id
                        ? "border-brand shadow-lg"
                        : "border-border hover:border-brand/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <p className="text-text leading-relaxed line-clamp-2 mb-2">
                          {suggestion.requestText}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <div className="flex items-center gap-1">
                            <User size={12} />
                            {suggestion.userName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(suggestion.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border flex-shrink-0 ${getStatusColor(suggestion.status)}`}
                      >
                        {getStatusIcon(suggestion.status)}
                        {suggestion.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            {selectedSuggestion ? (
              <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight mb-4">
                    Suggestion Details
                  </h2>

                  <div className="bg-bg border border-border rounded-xl p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted" />
                        <span className="text-sm font-semibold">
                          {selectedSuggestion.userName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-muted" />
                        <span className="text-sm text-muted">
                          {selectedSuggestion.userEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted" />
                        <span className="text-sm text-muted">
                          {formatDate(selectedSuggestion.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg border border-border rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase mb-2">
                      <MessageSquare size={14} />
                      Suggestion
                    </div>
                    <p className="text-text leading-relaxed whitespace-pre-wrap">
                      {selectedSuggestion.requestText}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase text-muted mb-2">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl p-3 text-text outline-none focus:border-brand"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase text-muted mb-2">
                      Admin Response (Optional)
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Provide feedback to the user..."
                      className="w-full bg-bg border border-border rounded-xl p-3 h-32 outline-none focus:border-brand resize-none text-text"
                    />
                  </div>

                  <button
                    onClick={handleUpdateSuggestion}
                    disabled={saving}
                    className="w-full py-3 rounded-full bg-brand text-white font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Clock size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Suggestion
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-[var(--radius-lg)] p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/10 mb-4">
                  <MessageSquare size={32} className="text-muted" />
                </div>
                <p className="text-muted">
                  Select a suggestion to view details and respond
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
