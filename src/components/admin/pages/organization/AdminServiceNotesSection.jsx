import React, { useState, useEffect } from "react";
import { FiMessageSquare } from "react-icons/fi";
import complianceApi from "../../../../utils/complianceApi";

const AdminServiceNotesSection = ({ userId, orgId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = complianceApi.getToken();
        if (!token) throw new Error("Authentication token not found");

        let url = `https://oneasycompliance.oneasy.ai/admin/compliance/notes?userId=${userId}&page=1&limit=20`;
        if (orgId) {
          url += `&orgId=${orgId}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

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
  }, [userId, orgId]);

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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022B51] mx-auto"></div>
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
      <div className="bg-[#F8F9FA] rounded-xl p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-medium text-gray-900">
            Service Notes
          </h3>
          <span className="text-xs text-gray-400">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead className="text-white" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-xs">
                  Service
                </th>
                <th className="px-4 py-3 text-left font-medium text-xs">
                  Content
                </th>
                <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                  Added By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {notes.map((note) => (
                <tr
                  key={note.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 whitespace-nowrap">
                      {formatDate(note.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {note.serviceName ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#022B51] border border-blue-100">
                        {note.serviceName}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-800 whitespace-pre-wrap max-w-[300px]">
                      {note.content}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-500">
                      {note.createdByUserId || "-"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminServiceNotesSection;
