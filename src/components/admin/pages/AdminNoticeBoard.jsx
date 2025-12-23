import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api";

function AdminNoticeBoard() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const fetchNotices = async () => {
    try {
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

  useEffect(() => {
    fetchNotices();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const res = await apiClient.get("/admin/clients");
      if (res.success) {
        setClients(res.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch clients:", e);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSave = async () => {
    if (!title || !description) {
      alert("Title and description are required");
      return;
    }
    try {
      setSaving(true);
      // If selectedClientId is empty, send null (global notice), otherwise send the client ID
      const user_id = selectedClientId || null;
      const res = await apiClient.post("/admin/notices", { title, description, link, user_id });
      if (res.success) {
        setTitle("");
        setDescription("");
        setLink("");
        setSelectedClientId("");
        await fetchNotices();
      } else {
        alert(res.message || "Failed to create notice");
      }
    } catch (e) {
      console.error("Failed to save notice:", e);
      alert("Failed to save notice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notice Board</h1>
          <p className="text-sm text-gray-600">Create a notice to show on all user dashboards</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm mb-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
              placeholder="Notice title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C] h-24"
              placeholder="Notice description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
              placeholder="https://"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Client (optional)</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
              disabled={loadingClients}
            >
              <option value="">All Clients (Global Notice)</option>
              {clients.map((client) => (
                <option key={client.user_id} value={client.user_id}>
                  {client.name || client.legal_name || client.email || `Client ${client.user_id}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Leave as "All Clients" for a global notice visible to everyone, or select a specific client for a private notice
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Publish Notice"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Existing Notices</h2>
          <button
            onClick={() => navigate("/admin/notice-management")}
            className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors font-medium"
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No notices found.</div>
        ) : (
          <>
          <div className="divide-y divide-gray-100">
              {notices.slice(0, 5).map((n) => {
                const client = clients.find(c => c.user_id === n.user_id);
                const isGlobal = !n.user_id;
                return (
              <div key={n.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                          {isGlobal ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              Global
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                              Client: {client?.name || client?.email || `ID: ${n.user_id}`}
                            </span>
                          )}
                        </div>
                    <p className="text-sm text-gray-700 mt-1">{n.description}</p>
                    {n.link && (
                      <a
                        href={n.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#01334C] hover:underline mt-1 inline-block"
                      >
                        {n.link}
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
                );
              })}
            </div>
            {notices.length > 5 && (
              <div className="px-4 py-3 text-center border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing 5 of {notices.length} notices.{" "}
                  <button
                    onClick={() => navigate("/admin/notice-management")}
                    className="text-[#01334C] hover:underline font-medium"
                  >
                    View all
                  </button>
                </p>
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminNoticeBoard;

