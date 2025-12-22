import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api";

function AdminNoticeManagement() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [editingNotice, setEditingNotice] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    link: "",
    user_id: ""
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedClientFilter, setSelectedClientFilter] = useState("");

  useEffect(() => {
    fetchNotices();
    fetchClients();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/notices");
      if (res.success) {
        setNotices(res.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch notices:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await apiClient.get("/admin/clients");
      if (res.success) {
        setClients(res.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch clients:", e);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice.id);
    setEditForm({
      title: notice.title || "",
      description: notice.description || "",
      link: notice.link || "",
      user_id: notice.user_id || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingNotice(null);
    setEditForm({
      title: "",
      description: "",
      link: "",
      user_id: ""
    });
  };

  const handleSaveEdit = async (noticeId) => {
    if (!editForm.title || !editForm.description) {
      alert("Title and description are required");
      return;
    }
    try {
      setSaving(true);
      const user_id = editForm.user_id || null;
      const res = await apiClient.put(`/admin/notices/${noticeId}`, {
        title: editForm.title,
        description: editForm.description,
        link: editForm.link,
        user_id: user_id
      });
      if (res.success) {
        await fetchNotices();
        setEditingNotice(null);
        setEditForm({
          title: "",
          description: "",
          link: "",
          user_id: ""
        });
      } else {
        alert(res.message || "Failed to update notice");
      }
    } catch (e) {
      console.error("Failed to update notice:", e);
      alert("Failed to update notice");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) {
      return;
    }
    try {
      setDeleting(noticeId);
      const res = await apiClient.delete(`/admin/notices/${noticeId}`);
      if (res.success) {
        await fetchNotices();
      } else {
        alert(res.message || "Failed to delete notice");
      }
    } catch (e) {
      console.error("Failed to delete notice:", e);
      alert("Failed to delete notice");
    } finally {
      setDeleting(null);
    }
  };

  const getClientName = (userId) => {
    if (!userId) return "Global";
    const client = clients.find(c => c.user_id === userId);
    return client?.name || client?.legal_name || client?.email || `Client ${userId}`;
  };

  // Filter notices based on selected client
  const filteredNotices = React.useMemo(() => {
    if (!selectedClientFilter) {
      return notices; // Show all if no filter selected
    }
    return notices.filter(notice => {
      if (selectedClientFilter === "global") {
        return !notice.user_id; // Show only global notices
      }
      return notice.user_id && String(notice.user_id) === String(selectedClientFilter);
    });
  }, [notices, selectedClientFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notice Management</h1>
          <p className="text-sm text-gray-600">View, edit, and delete notices</p>
        </div>
        <button
          onClick={() => navigate("/admin/notice-board")}
          className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors font-medium"
        >
          Back to Create Notice
        </button>
      </div>

      {/* Filter by Client */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Client</label>
        <select
          value={selectedClientFilter}
          onChange={(e) => setSelectedClientFilter(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C] text-sm"
        >
          <option value="">All Clients</option>
          <option value="global">Global Notices Only</option>
          {clients.map((client) => (
            <option key={client.user_id} value={client.user_id}>
              {client.name || client.legal_name || client.email || `Client ${client.user_id}`}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500">No notices found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedClientFilter === "global" 
                ? `Global Notices (${filteredNotices.length})`
                : selectedClientFilter
                ? `Client Notices (${filteredNotices.length})`
                : `All Notices (${filteredNotices.length})`}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredNotices.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                {selectedClientFilter
                  ? "No notices found for the selected filter."
                  : "No notices found."}
              </div>
            ) : (
              filteredNotices.map((notice) => {
              const isEditing = editingNotice === notice.id;
              return (
                <div key={notice.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C] h-24"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                        <input
                          type="text"
                          value={editForm.link}
                          onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                          placeholder="https://"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Client</label>
                        <select
                          value={editForm.user_id}
                          onChange={(e) => setEditForm({ ...editForm, user_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                        >
                          <option value="">All Clients (Global Notice)</option>
                          {clients.map((client) => (
                            <option key={client.user_id} value={client.user_id}>
                              {client.name || client.legal_name || client.email || `Client ${client.user_id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(notice.id)}
                          disabled={saving}
                          className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-900">{notice.title}</h3>
                          {notice.user_id ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                              Client: {getClientName(notice.user_id)}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              Global
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notice.description}</p>
                        {notice.link && (
                          <a
                            href={notice.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#01334C] hover:underline inline-block mb-2"
                          >
                            {notice.link}
                          </a>
                        )}
                        <div className="text-xs text-gray-500">
                          Created: {new Date(notice.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="px-3 py-1.5 text-xs bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          disabled={deleting === notice.id}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {deleting === notice.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNoticeManagement;

