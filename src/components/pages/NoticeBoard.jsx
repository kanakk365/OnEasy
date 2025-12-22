import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { TriangleAlert } from "lucide-react";

function NoticeBoard() {
  const navigate = useNavigate();
  const [allNotices, setAllNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Notices'); // 'All Notices' or 'My Notices'

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      // Get current user ID to fetch user-specific notices
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = storedUser.id;
      
      // Pass userId as query parameter to get global notices + user-specific notices
      const url = userId ? `/admin/notices?userId=${userId}` : '/admin/notices';
      const res = await apiClient.get(url);
      if (res.success && Array.isArray(res.data)) {
        // Sort by created_at descending (newest first)
        const sortedNotices = res.data.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        setAllNotices(sortedNotices);
      } else {
        setAllNotices([]);
      }
    } catch (e) {
      console.error("Failed to fetch notices:", e);
      setAllNotices([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter notices based on active tab
  const filteredNotices = useMemo(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = storedUser.id;

    if (activeTab === 'All Notices') {
      // Show only global notices (user_id is null)
      return allNotices.filter(notice => !notice.user_id);
    } else {
      // Show only user-specific notices (user_id matches current user)
      return allNotices.filter(notice => notice.user_id && String(notice.user_id) === String(userId));
    }
  }, [allNotices, activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notice Board</h1>
            <p className="text-gray-600 mt-1">View all important notices and announcements</p>
          </div>
          <button
            onClick={() => navigate("/client")}
            className="px-4 py-2 text-sm font-medium text-[#00486D] border border-[#00486D] rounded-lg hover:bg-[#00486D] hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#F3F3F3]">
          <div className="p-5">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-4 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('All Notices')}
                className={`pb-2 mr-4 md:mr-6 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'All Notices' 
                    ? 'text-[#01334C] border-b-2 border-[#01334C]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Notices
              </button>
              <button 
                onClick={() => setActiveTab('My Notices')}
                className={`pb-2 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'My Notices' 
                    ? 'text-[#01334C] border-b-2 border-[#01334C]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Notices
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-gray-500 p-4 text-center">Loading notices...</div>
            ) : filteredNotices.length === 0 ? (
              <div className="text-sm text-gray-500 p-4 text-center">
                {activeTab === 'All Notices' 
                  ? 'No global notices available.' 
                  : 'No notices assigned to you.'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-amber-50 p-4 rounded-lg flex items-start space-x-3 border border-amber-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                        <TriangleAlert className="text-white w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-gray-800 text-base leading-relaxed font-semibold">
                          {notice.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notice.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {notice.description}
                        {notice.link && (
                          <>
                            {" "}
                            <a
                              href={notice.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 hover:underline ml-1 font-medium"
                            >
                              Learn more
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoticeBoard;

