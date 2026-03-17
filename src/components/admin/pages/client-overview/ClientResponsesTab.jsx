import React, { useState, useEffect, useCallback } from "react";
import { IoTrashOutline, IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import apiClient from "../../../../utils/api";

const COMPLIANCE_BASE = "https://oneasycompliance.oneasy.ai";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
// Mirrors user-side getOrgName — reads organization_name question key
const getOrgName = (set) => {
  const p = set?.responses?.find((r) => r.questionKey === "organization_name");
  return p?.answer?.value || "Unknown Organization";
};

/* ─── component ────────────────────────────────────────────────────────────── */
const ClientResponsesTab = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseSets, setResponseSets] = useState([]);

  // "suggested-registrations" | "suggested-compliances"
  const [view, setView] = useState("suggested-registrations");
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [search, setSearch] = useState("");

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingSetId, setDeletingSetId] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  /* ── fetch ─────────────────────────────────────────────────────────────── */
  const fetchResponses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const token = apiClient.getToken();
      const res = await fetch(
        `${COMPLIANCE_BASE}/admin/compliance/users/${userId}/responses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const data = await res.json();
      // API returns { userId, totalSets, responseSets: [...] }
      setResponseSets(data.responseSets || []);
    } catch (err) {
      console.error("Error fetching admin responses:", err);
      setError(err.message || "Failed to load responses");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Reset selected set when switching sub-tabs
  useEffect(() => {
    setSelectedSetId(null);
    setSearch("");
  }, [view]);

  /* ── delete ─────────────────────────────────────────────────────────────── */
  const handleDeleteResponseSet = useCallback((e, submissionId) => {
    e.stopPropagation();
    setConfirmDeleteId(submissionId);
  }, []);

  const doConfirmDelete = useCallback(async () => {
    const submissionId = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingSetId(submissionId);
    try {
      const token = apiClient.getToken();
      const res = await fetch(
        `${COMPLIANCE_BASE}/admin/compliance/users/${userId}/responses?submissionId=${encodeURIComponent(submissionId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setResponseSets((prev) =>
          prev.filter((s) => s.submissionId !== submissionId)
        );
        if (selectedSetId === submissionId) setSelectedSetId(null);
        setShowDeleteSuccess(true);
      } else {
        console.error("Delete response set returned non-ok:", res.status);
      }
    } catch (err) {
      console.error("Delete response set failed:", err);
    } finally {
      setDeletingSetId(null);
    }
  }, [confirmDeleteId, selectedSetId, userId]);

  /* ─── loading / error ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchResponses}
          className="mt-4 text-sm font-medium text-red-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ─── JSX ──────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header + sub-tab pills — mirrors Registrations.jsx exactly */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Client Responses</h2>
          <p className="text-sm text-gray-500">
            Suggested registrations and compliances for this client
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("suggested-registrations")}
            className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
              view === "suggested-registrations"
                ? "bg-[#01466a] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Suggested Registrations
          </button>
          <button
            onClick={() => setView("suggested-compliances")}
            className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
              view === "suggested-compliances"
                ? "bg-[#01466a] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Suggested Compliances
          </button>
        </div>
      </div>

      {/* Main content card — matches user-side layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {responseSets.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No responses found</p>
            <p className="text-gray-400 text-sm mt-1">
              This client hasn&apos;t submitted any suggestions yet.
            </p>
          </div>
        ) : !selectedSetId ? (
          /* ── Organization cards grid (list view) ── */
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-5">
              Organizations ({responseSets.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {responseSets.map((set, idx) => {
                const count =
                  view === "suggested-registrations"
                    ? set.suggestedRegistrations?.length || 0
                    : set.suggestedCompliances?.length || 0;
                const isDeleting = deletingSetId === set.submissionId;

                return (
                  <div
                    key={set.submissionId || idx}
                    onClick={() => setSelectedSetId(set.submissionId)}
                    className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-[#01466a] hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                  >
                    {/* Left accent bar on hover */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#01466a] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-bold text-[#00486D] mb-2 line-clamp-2 pr-4">
                        {getOrgName(set)}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Count badge */}
                        <div className="w-8 h-8 rounded-full bg-[#00486D]/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#00486D]">
                            {count}
                          </span>
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={(e) =>
                            handleDeleteResponseSet(e, set.submissionId)
                          }
                          disabled={isDeleting || !!deletingSetId}
                          title="Delete suggestion set"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <svg
                              className="animate-spin h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                          ) : (
                            <IoTrashOutline className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      {view === "suggested-registrations"
                        ? "Registrations"
                        : "Compliances"}{" "}
                      suggested
                    </p>

                    {set.submittedAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(set.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Detail view (suggested items list) ── */
          <div className="animate-in fade-in duration-300">
            {/* Back header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <button
                onClick={() => setSelectedSetId(null)}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-[#00486D] transition-colors"
              >
                <IoChevronBackOutline className="mr-1 w-4 h-4" />
                Back to Organizations
              </button>
              <div className="h-4 w-px bg-gray-300 hidden sm:block" />
              <span className="text-sm text-gray-700 font-semibold hidden sm:inline-block">
                {getOrgName(responseSets.find((s) => s.submissionId === selectedSetId))}
              </span>
            </div>

            {/* Search */}
            <div className="mb-5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${
                  view === "suggested-registrations"
                    ? "registrations"
                    : "compliances"
                }...`}
                className="w-full max-w-xs px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D]"
              />
            </div>

            {/* Items grid — identical card style to user-side */}
            {(() => {
              const activeSet = responseSets.find(
                (s) => s.submissionId === selectedSetId
              );
              const items =
                view === "suggested-registrations"
                  ? activeSet?.suggestedRegistrations || []
                  : activeSet?.suggestedCompliances || [];
              const filtered = items.filter(
                (i) =>
                  !search ||
                  i.name?.toLowerCase().includes(search.toLowerCase())
              );

              return filtered.length > 0 ? (
                <div className="grid gap-4">
                  {filtered.map((item, idx) => (
                    <div
                      key={`${item.code}-${idx}`}
                      className="group bg-white rounded-xl p-6 hover:shadow-md hover:bg-[#01334C] hover:text-white transition-all duration-200 flex items-center justify-between w-full border border-gray-100"
                    >
                      <div>
                        <h5 className="text-base font-semibold text-[#00486D] mb-1 group-hover:text-white">
                          {item.name}
                        </h5>
                        <p className="text-sm text-gray-400 group-hover:text-gray-200 capitalize">
                          {item.category === "registration"
                            ? "Registration required"
                            : item.category?.replace(/_/g, " ") ||
                              "Compliance filing"}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#F5F7FA] group-hover:bg-[#246181] flex items-center justify-center transition-colors flex-shrink-0">
                        <IoChevronForwardOutline className="text-[#00486D] text-xl group-hover:text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    {search
                      ? "No matching suggestions found."
                      : "No suggestions recorded for this organization."}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Confirm Delete Modal ── */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
              <IoTrashOutline className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Suggestion Set?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will permanently remove this organization&apos;s suggestions.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={doConfirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showDeleteSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowDeleteSuccess(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Deleted Successfully
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              The suggestion set has been removed.
            </p>
            <button
              onClick={() => setShowDeleteSuccess(false)}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
              style={{
                background: "linear-gradient(90deg,#01334C 0%,#00486D 100%)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientResponsesTab;
