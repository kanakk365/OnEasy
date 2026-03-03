import React, { useState, useEffect } from "react";
import { FiMessageSquare } from "react-icons/fi";
import complianceApi from "../../../../utils/complianceApi";

const ServiceNotesSection = ({ orgId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orgId) return;

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = complianceApi.getToken();
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(
          `https://oneasycompliance.oneasy.ai/compliance/notes?page=1&limit=20&orgId=${orgId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch service notes");

        const data = await response.json();
        setNotes(data.notes || []);
      } catch (err) {
        console.error("Error fetching service notes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [orgId]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-sm text-gray-400">Loading service notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-red-500">Failed to load notes: {error}</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <FiMessageSquare className="w-12 h-12 text-gray-200 mb-4" />
        <p className="text-sm text-gray-500 font-medium">No Service Notes</p>
        <p className="text-xs text-gray-400 mt-1">
          No service notes have been added for this organization yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#F8F9FA] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-medium text-gray-900">
            Service Notes
          </h3>
          <span className="text-xs text-gray-400">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              {/* Note content */}
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>

              {/* Service name badge */}
              {note.serviceName && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#00486D] border border-blue-100">
                    {note.serviceName}
                  </span>
                </div>
              )}

              {/* Footer info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                  {formatDate(note.createdAt)}
                </span>
                <div className="flex items-center gap-2">
                  {note.createdByUserId && (
                    <span className="text-xs text-gray-400">
                      Added by {note.createdByUserId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceNotesSection;
