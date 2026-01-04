import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { RiFileTextLine, RiBriefcase4Line } from "react-icons/ri";
import { BsArrowRight } from "react-icons/bs";
import { FiChevronLeft } from "react-icons/fi";

function Documents() {
  const navigate = useNavigate();
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [organizationsCount, setOrganizationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
    );
    const userRole = storedUser.role || storedUser.role_id;
    const adminCheck =
      userRole === "admin" ||
      userRole === "superadmin" ||
      userRole === 1 ||
      userRole === 2;
    setIsAdmin(adminCheck);

    if (adminCheck) {
      fetchClients();
    } else {
      loadDocuments();
    }
  }, []);

  useEffect(() => {
    if (isAdmin && selectedClientId) {
      loadClientDocuments(selectedClientId);
    }
  }, [selectedClientId, isAdmin]);

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

  const loadClientDocuments = async (userId) => {
    try {
      setLoading(true);

      // Fetch personal documents for selected client
      const personalDocsResponse = await apiClient
        .get(`/users-page/personal-documents/${userId}`)
        .catch(() => ({
          success: false,
          data: {
            aadhar_card: [],
            pan_card: [],
            passport: [],
            profile_image: [],
            signature: [],
          },
        }));

      const personalDocs = [];

      if (personalDocsResponse.success && personalDocsResponse.data) {
        // Flatten all documents from all categories
        Object.values(personalDocsResponse.data).forEach((docArray) => {
          if (Array.isArray(docArray)) {
            docArray.forEach((doc) => {
              personalDocs.push({
                name: doc.name || doc.type,
                url: doc.url,
                type: doc.type,
              });
            });
          }
        });
      }

      setPersonalDocuments(personalDocs);

      // Fetch organizations count for selected client
      const orgResponse = await apiClient
        .get(`/users-page/user-data/${userId}`)
        .catch(() => ({
          success: false,
          data: { organisations: [] },
        }));

      if (
        orgResponse.success &&
        orgResponse.data &&
        orgResponse.data.organisations
      ) {
        // Filter organizations that have at least one meaningful field
        const validOrgs = orgResponse.data.organisations.filter((org) => {
          const hasLegalName =
            org.legal_name &&
            org.legal_name.trim() !== "" &&
            org.legal_name !== "-";
          const hasTradeName =
            org.trade_name &&
            org.trade_name.trim() !== "" &&
            org.trade_name !== "-";
          const hasGstin =
            org.gstin && org.gstin.trim() !== "" && org.gstin !== "-";
          return hasLegalName || hasTradeName || hasGstin;
        });
        setOrganizationsCount(validOrgs.length);
      } else {
        setOrganizationsCount(0);
      }
    } catch (error) {
      console.error("Error loading client documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
      );
      const userId = storedUser.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      // Fetch personal documents from new endpoint (supports multiple documents)
      const personalDocsResponse = await apiClient
        .get("/users-page/personal-documents")
        .catch(() => ({
          success: false,
          data: {
            aadhar_card: [],
            pan_card: [],
            passport: [],
            profile_image: [],
            signature: [],
          },
        }));

      const personalDocs = [];

      if (personalDocsResponse.success && personalDocsResponse.data) {
        // Flatten all documents from all categories
        Object.values(personalDocsResponse.data).forEach((docArray) => {
          if (Array.isArray(docArray)) {
            docArray.forEach((doc) => {
              personalDocs.push({
                name: doc.name || doc.type,
                url: doc.url,
                type: doc.type,
              });
            });
          }
        });
      }

      setPersonalDocuments(personalDocs);

      // Fetch organizations count
      const orgResponse = await apiClient.get("/users-page/data").catch(() => ({
        success: false,
        data: { organisations: [] },
      }));

      if (
        orgResponse.success &&
        orgResponse.data &&
        orgResponse.data.organisations
      ) {
        // Filter organizations that have at least one meaningful field
        const validOrgs = orgResponse.data.organisations.filter((org) => {
          const hasLegalName =
            org.legal_name &&
            org.legal_name.trim() !== "" &&
            org.legal_name !== "-";
          const hasTradeName =
            org.trade_name &&
            org.trade_name.trim() !== "" &&
            org.trade_name !== "-";
          const hasGstin =
            org.gstin && org.gstin.trim() !== "" && org.gstin !== "-";
          return hasLegalName || hasTradeName || hasGstin;
        });
        setOrganizationsCount(validOrgs.length);
      } else {
        setOrganizationsCount(0);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
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

  const handleClientSelect = (client) => {
    setSelectedClientId(client.user_id);
    setSelectedClient(client);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  // If admin and no client selected, show client selection
  if (isAdmin && !selectedClientId) {
    return (
      <div className="min-h-screen bg-[#f3f5f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">
              Select a client to view and manage their documents
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clients by name, email, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Clients List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D]"></div>
            </div>
          ) : filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div
                  key={client.user_id}
                  onClick={() => handleClientSelect(client)}
                  className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-[#01334C] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {client.name
                            ? client.name.charAt(0).toUpperCase()
                            : "C"}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h3
                            className="text-lg font-semibold text-gray-900 truncate"
                            title={client.name || "-"}
                          >
                            {client.name || "-"}
                          </h3>
                          <p
                            className="text-xs text-gray-500 font-mono truncate"
                            title={client.user_id}
                          >
                            {client.user_id}
                          </p>
                        </div>
                      </div>
                      {client.email && (
                        <p
                          className="text-sm text-gray-600 truncate mb-1"
                          title={client.email}
                        >
                          {client.email}
                        </p>
                      )}
                      {client.phone && (
                        <p
                          className="text-sm text-gray-600 truncate"
                          title={client.phone}
                        >
                          {client.phone}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.593 23.593 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-sm mb-2">No clients found</p>
              <p className="text-gray-400 text-xs">
                {searchQuery
                  ? "Try a different search term"
                  : "No clients available"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (isAdmin && selectedClientId) {
                  setSelectedClientId(null);
                  setSelectedClient(null);
                } else {
                  window.history.back();
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isAdmin && selectedClient ? "Client Documents" : "My Documents"}
            </h1>
          </div>
          <p className="text-gray-500 italic ml-9">
            {isAdmin && selectedClient
              ? `Viewing documents for ${
                  selectedClient.name || selectedClient.user_id
                }`
              : "Select your document type"}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Documents Card */}
          <div
            onClick={() => {
              if (isAdmin && selectedClientId) {
                navigate(`/admin/client-kyc/${selectedClientId}`);
              } else {
                navigate("/kyc");
              }
            }}
            className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 group hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{
                  background:
                    "linear-gradient(160.12deg, #00486D 13.28%, #016599 109.67%)",
                }}
              >
                <RiFileTextLine className="w-6 h-6" />
              </div>
              <div className="text-[#00486D] group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                <BsArrowRight className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors">
              Personal Documents
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed group-hover:text-white/80 transition-colors">
              Manage your KYC and personal identification documents
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F6FD] group-hover:bg-white/20 flex items-center justify-center text-[#00486D] group-hover:text-white font-semibold text-sm transition-colors">
                {personalDocuments.length}
              </div>
              <span className="text-gray-600 text-sm group-hover:text-white/80 transition-colors">
                Documents
              </span>
            </div>
          </div>

          {/* Business Documents Card */}
          <div
            onClick={() => {
              if (isAdmin && selectedClientId) {
                navigate(`/admin/client-organizations/${selectedClientId}`);
              } else {
                navigate("/organization"); // Updated to point to new Organization module
              }
            }}
            className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 group hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{
                  background:
                    "linear-gradient(160.12deg, #00486D 13.28%, #016599 109.67%)",
                }}
              >
                <RiBriefcase4Line className="w-6 h-6" />
              </div>
              <div className="text-[#00486D] group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                <BsArrowRight className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors">
              Business Documents
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed group-hover:text-white/80 transition-colors">
              Access company documents , registrations , and compliance files
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F6FD] group-hover:bg-white/20 flex items-center justify-center text-[#00486D] group-hover:text-white font-semibold text-sm transition-colors">
                {organizationsCount}
              </div>
              <span className="text-gray-600 text-sm group-hover:text-white/80 transition-colors">
                {organizationsCount === 1 ? "Company" : "Categories"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;
