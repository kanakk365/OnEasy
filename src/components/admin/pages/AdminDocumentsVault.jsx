import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api";
import {
  FiSearch,
  FiFolder,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiFilter,
  FiAlertCircle,
} from "react-icons/fi";

function AdminDocumentsVault() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClients();
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchClients = async () => {
    try {
      setLoading(true);
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
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (client.name && client.name.toLowerCase().includes(query)) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.phone && client.phone.includes(query)) ||
      (client.user_id && client.user_id.toLowerCase().includes(query))
    );
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
            >
              <FiFolder className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Documents Vault
              </h1>
              <p className="text-gray-500 italic ml-1">
                Select a client to manage their documents
              </p>
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="grid grid-cols-1 gap-4 mb-6 max-w-2xl">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, phone or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D]"
            />
          </div>
        </div>

        {/* Clients Table Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="p-4 bg-[#f5f5f5] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="text-white">
                      <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D] rounded-l-xl">
                        User ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                        Client Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                        Contact Info
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D] rounded-r-xl">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentClients.length > 0 ? (
                      currentClients.map((client) => (
                        <tr
                          key={client.user_id}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 font-mono">
                              {client.user_id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#00486D] flex items-center justify-center text-xs font-bold">
                                {client.name
                                  ? client.name.charAt(0).toUpperCase()
                                  : "C"}
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {client.name || "-"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {client.email || "-"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {client.phone || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/client-documents/${client.user_id}`
                                )
                              }
                              className="flex items-center gap-2 px-3 py-1.5 bg-[#01334C]/10 text-[#01334C] rounded-lg hover:bg-[#01334C] hover:text-white transition-colors text-xs font-medium"
                            >
                              <FiFolder className="w-4 h-4" /> View Documents
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          <FiAlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p>No clients found</p>
                          {searchQuery && (
                            <p className="text-sm mt-1">
                              Try adjusting your search terms
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {filteredClients.length > itemsPerPage && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredClients.length)} of{" "}
                  {filteredClients.length} clients
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-[#00486D] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003652]"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-[#00486D] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003652]"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDocumentsVault;
