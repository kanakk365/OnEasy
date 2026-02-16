import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import apiClient from "../../../utils/api";

function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchClients();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchClients = async () => {
    try {
      const response = await apiClient.get("/admin/clients");

      if (response.success) {
        setClients(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        (client.name && client.name.toLowerCase().includes(searchLower)) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
        (client.primary_organization_name && client.primary_organization_name.toLowerCase().includes(searchLower)) ||
        (client.company_name && client.company_name.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    if (filter === "all") return true;
    if (filter === "signups") {
      return (
        !client.registration_submitted &&
        !client.team_fill_requested &&
        !client.payment_completed &&
        !client.ticket_id
      );
    }
    if (filter === "subscribed") {
      return (
        !!client.ticket_id ||
        !!client.registration_submitted ||
        !!client.payment_completed
      );
    }
    if (filter === "pending-payments") {
      return (
        client.payment_completed === false &&
        (client.registration_submitted || client.ticket_id)
      );
    }
    if (filter === "oneasy-form-fill") {
      return client.team_fill_requested;
    }
    if (filter === "support-requests") {
      return !!client.has_support_request;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const handleDeleteClient = async (e, client) => {
    e.stopPropagation();
    const confirmMessage = `Are you sure you want to permanently delete this client?\n\nName: ${
      client.name || "Unknown"
    }\nEmail: ${client.email || "-"}\nPhone: ${
      client.phone || "-"
    }\n\nThis will also delete their services and related records.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await apiClient.delete("/admin/clients/delete", {
        body: JSON.stringify({ userId: client.user_id }),
      });

      if (response.success) {
        setClients((prev) => prev.filter((c) => c.user_id !== client.user_id));
        alert("Client deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      const errorMessage =
        error.message || error.response?.data?.message || "Unknown error";
      alert("Failed to delete client: " + errorMessage);
    }
  };

  const filterTabs = [
    { key: "all", label: "All", count: clients.length },
    {
      key: "signups",
      label: "Signups",
      count: clients.filter(
        (c) =>
          !c.registration_submitted &&
          !c.team_fill_requested &&
          !c.payment_completed &&
          !c.ticket_id
      ).length,
    },
    {
      key: "pending-payments",
      label: "Pending Payments",
      count: clients.filter(
        (c) =>
          c.payment_completed === false &&
          (c.registration_submitted || c.ticket_id)
      ).length,
    },
    {
      key: "subscribed",
      label: "Subscribed Users",
      count: clients.filter(
        (c) => c.ticket_id || c.registration_submitted || c.payment_completed
      ).length,
    },
    {
      key: "oneasy-form-fill",
      label: "Oneasy Form Fill",
      count: clients.filter((c) => c.team_fill_requested).length,
    },
    {
      key: "support-requests",
      label: "Support Requests",
      count: clients.filter((c) => c.has_support_request).length,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Clients</h1>
        <p className="text-gray-500 italic">
          Manage client signups, pending payments and Oneasy form fill requests
        </p>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name, email, phone, or organization name..."
              className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent transition-all"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === tab.key
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                filter === tab.key
                  ? {
                      background:
                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }
                  : {}
              }
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Clients Found
          </h3>
          <p className="text-gray-500">
            No clients match the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#f2f6f7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-white">
                  <th className="px-3 py-3 text-left text-sm font-medium bg-[#00486D] rounded-l-xl">
                    Client Name
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium bg-[#00486D]">
                    Organisation Name
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium bg-[#00486D]">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium bg-[#00486D]">
                    Phone Number
                  </th>
                  {filter === "support-requests" && (
                    <th className="px-3 py-3 text-left text-sm font-medium bg-[#00486D]">
                      Support Request
                    </th>
                  )}
                  <th className="px-3 py-3 text-center text-sm font-medium bg-[#00486D] rounded-r-xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((client) => (
                  <tr
                    key={client.user_id}
                    onClick={() =>
                      navigate(`/admin/client-overview/${client.user_id}`)
                    }
                    className="bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-semibold text-xs flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                          }}
                        >
                          {client.name
                            ? client.name.charAt(0).toUpperCase()
                            : "C"}
                        </div>
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {client.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 truncate max-w-xs">
                      {client.primary_organization_name || "-"}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 truncate max-w-xs">
                      {client.email || "-"}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600">
                      {client.phone || "-"}
                    </td>
                    {filter === "support-requests" && (
                      <td className="px-3 py-4 text-sm text-gray-700">
                        {client.support_requests &&
                        client.support_requests.length > 0 ? (
                          <div className="space-y-1">
                            {client.support_requests.map((req, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">
                                  {client.name}
                                </span>{" "}
                                for{" "}
                                <span className="font-medium">
                                  {req.service_name || "this service"}
                                </span>{" "}
                                wants to contact you
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            No support requests
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/admin/client-overview/${client.user_id}`
                            );
                          }}
                          className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                          style={{
                            background:
                              "linear-gradient(90deg, #00486D 0%, #023752 100%)",
                          }}
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClient(e, client)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredClients.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {String(indexOfFirstItem + 1).padStart(2, "0")} -{" "}
                {String(
                  Math.min(indexOfLastItem, filteredClients.length)
                ).padStart(2, "0")}{" "}
                of {filteredClients.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                  }}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                  }}
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminClients;
