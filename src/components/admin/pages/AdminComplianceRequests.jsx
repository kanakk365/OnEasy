import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api";
import {
  FiSearch,
  FiRefreshCw,
  FiFileText,
  FiEye,
  FiAlertCircle,
} from "react-icons/fi";

function AdminComplianceRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/compliance-requests");
      if (response.success) {
        setRequests(response.data || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching compliance requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return "-";
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(term) ||
      (r.email || "").toLowerCase().includes(term) ||
      (r.company_name || "").toLowerCase().includes(term) ||
      (r.service_name || "").toLowerCase().includes(term)
    );
  });

  const getViewRoute = (row) => {
    const tid = (row.ticket_id || "").toString().toUpperCase();
    if (tid.startsWith("PVT_")) return `/private-limited/view/${row.ticket_id}`;
    if (tid.startsWith("PROP_")) return `/proprietorship/view/${row.ticket_id}`;
    if (tid.startsWith("SI_")) return `/startup-india/view/${row.ticket_id}`;
    if (tid.startsWith("GST_")) return `/gst/view/${row.ticket_id}`;
    return null;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
            }}
          >
            <FiFileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Compliance Requests
            </h1>
            <p className="text-gray-500 italic ml-1">
              Paid registrations from suggested compliance services
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchRequests}
            className="p-2.5 text-[#00486D] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by client, company, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent text-sm w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#00486D]">
            <FiFileText className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Compliance Payments
          </h2>
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            {filteredRequests.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <FiRefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-spin" />
            Loading compliance requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            No compliance payments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#00486D] text-white">
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Client Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((row, index) => {
                  const viewRoute = getViewRoute(row);
                  return (
                    <tr
                      key={row.ticket_id || index}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {row.name || "-"}
                        </div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.company_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.service_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.package_price != null
                          ? `₹${Number(row.package_price).toLocaleString("en-IN")}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {viewRoute ? (
                          <button
                            onClick={() => navigate(viewRoute)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00486D] text-white text-xs font-medium rounded-lg hover:bg-[#01334C] transition-colors"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            View
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navigate("/admin/client-overview/" + row.user_id)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            Client
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminComplianceRequests;
