import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api";
import {
  FiBell,
  FiLink,
  FiUser,
  FiGlobe,
  FiCalendar,
  FiSend,
  FiList,
  FiChevronRight,
} from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";

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
      const res = await apiClient.post("/admin/notices", {
        title,
        description,
        link,
        user_id,
      });
      if (res.success) {
        setTitle("");
        setDescription("");
        setLink("");
        setSelectedClientId("");
        await fetchNotices();
        alert("Notice published successfully!");
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

  if (loading && !notices.length) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
            >
              <BsMegaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Notice Board
              </h1>
              <p className="text-gray-500 italic ml-1">
                Create and manage system-wide announcements
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/notice-management")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#00486D] rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <FiList className="w-5 h-5" />
            Manage All Notices
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Notice Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-[#00486D]" />
                  Create New Notice
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                    placeholder="Enter notice title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow h-32 resize-none"
                    placeholder="Enter detailed description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                        placeholder="https://"
                      />
                      <FiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <div className="relative">
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] appearance-none bg-white transition-shadow"
                        disabled={loadingClients}
                      >
                        <option value="">All Clients (Global)</option>
                        {clients.map((client) => (
                          <option key={client.user_id} value={client.user_id}>
                            {client.name ||
                              client.legal_name ||
                              client.email ||
                              `Client ${client.user_id}`}
                          </option>
                        ))}
                      </select>
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-medium transform active:scale-95"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        Publish Notice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notices Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Notices
                </h2>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {notices.length} Total
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[600px] p-2">
                {notices.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <FiBell className="w-8 h-8 text-gray-300" />
                    </div>
                    <p>No notices published yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notices.slice(0, 5).map((n) => {
                      const client = clients.find(
                        (c) => c.user_id === n.user_id
                      );
                      const isGlobal = !n.user_id;

                      return (
                        <div
                          key={n.id}
                          className="p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            {isGlobal ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 rounded-md">
                                <FiGlobe className="w-3 h-3" /> Global
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 rounded-md max-w-[150px] truncate">
                                <FiUser className="w-3 h-3" />{" "}
                                {client?.name?.split(" ")[0] || "Client"}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              {new Date(n.created_at).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                            {n.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                            {n.description}
                          </p>

                          {n.link && (
                            <a
                              href={n.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#00486D] font-medium hover:underline"
                            >
                              <FiLink className="w-3 h-3" /> Open Link
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {notices.length > 5 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => navigate("/admin/notice-management")}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#00486D] font-medium hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                  >
                    View All Notices <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminNoticeBoard;
