import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api";
import {
  FiSearch,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiGlobe,
  FiFileText,
} from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { RiGroupLine } from "react-icons/ri";

function AdminDirectors() {
  const navigate = useNavigate();
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [loadingOrgDetails, setLoadingOrgDetails] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch all organizations and extract directors
  const fetchDirectors = async () => {
    try {
      setLoading(true);
      
      // Fetch all organizations - backend now returns directors data directly
      const orgResponse = await apiClient.get("/admin/organizations");
      if (!orgResponse.success || !orgResponse.data) {
        setDirectors([]);
        return;
      }

      const organizations = orgResponse.data;
      const allDirectors = [];

      // Extract directors from all organizations
      organizations.forEach((org) => {
        let directorsPartners = org.directors_partners_details || [];
        
        // Ensure it's an array
        if (!Array.isArray(directorsPartners)) {
          directorsPartners = [];
        }

        // Add directors with organization info
        directorsPartners.forEach((director) => {
          allDirectors.push({
            ...director,
            organizationId: org.id,
            organizationUserId: org.user_id,
            organizationName: org.legalName || org.tradeName || "N/A",
            clientName: org.clientName || "N/A",
            clientEmail: org.clientEmail || "N/A",
            gstin: org.gstin || "N/A",
            // Use director's dateOfAddition, or fallback to organization created_at
            dateOfAddition: director.dateOfAddition || director.date_of_addition || org.created_at || null,
            // Store organization data for quick access
            _organizationData: org,
          });
        });
      });

      setDirectors(allDirectors);
    } catch (error) {
      console.error("Error fetching directors:", error);
      setDirectors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectors();
  }, []);

  // Get unique organizations and clients for filters
  const organizationsList = useMemo(() => {
    const orgs = Array.from(
      new Set(directors.map((d) => d.organizationName))
    ).filter((name) => name !== "N/A");
    return orgs.sort();
  }, [directors]);

  const clientsList = useMemo(() => {
    const clients = Array.from(
      new Set(directors.map((d) => d.clientName))
    ).filter((name) => name !== "N/A");
    return clients.sort();
  }, [directors]);

  // Filter directors
  const filteredDirectors = useMemo(() => {
    return directors.filter((director) => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !searchTerm ||
        (director.name && director.name.toLowerCase().includes(searchLower)) ||
        (director.email && director.email.toLowerCase().includes(searchLower)) ||
        (director.contact &&
          director.contact.toLowerCase().includes(searchLower)) ||
        ((director.dinNumber || director.din_number) &&
          (director.dinNumber || director.din_number).toLowerCase().includes(searchLower)) ||
        (director.organizationName &&
          director.organizationName.toLowerCase().includes(searchLower)) ||
        (director.clientName &&
          director.clientName.toLowerCase().includes(searchLower));

      const matchesOrganization =
        !organizationFilter || director.organizationName === organizationFilter;

      const matchesClient =
        !clientFilter || director.clientName === clientFilter;

      return matchesSearch && matchesOrganization && matchesClient;
    });
  }, [directors, searchTerm, organizationFilter, clientFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDirectors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDirectors = filteredDirectors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, organizationFilter, clientFilter]);

  // Handle director row click to show organization details
  const handleDirectorClick = async (director) => {
    try {
      setLoadingOrgDetails(true);
      const userDataResponse = await apiClient
        .get(`/users-page/user-data/${director.organizationUserId}`)
        .catch(() => ({ success: false, data: { organisations: [] } }));
      
      if (userDataResponse.success && userDataResponse.data?.organisations) {
        const foundOrg = userDataResponse.data.organisations.find(
          (o) =>
            o.id === director.organizationId ||
            String(o.id) === String(director.organizationId) ||
            (o.legal_name === director.organizationName && o.gstin === director.gstin)
        );
        
        if (foundOrg) {
          // Parse JSON fields
          let directorsPartners = [];
          if (foundOrg.directors_partners_details) {
            try {
              directorsPartners =
                typeof foundOrg.directors_partners_details === "string"
                  ? JSON.parse(foundOrg.directors_partners_details)
                  : foundOrg.directors_partners_details;
              if (!Array.isArray(directorsPartners)) directorsPartners = [];
            } catch {
              directorsPartners = [];
            }
          }
          
          let digitalSignatures = [];
          if (foundOrg.digital_signature_details) {
            try {
              digitalSignatures =
                typeof foundOrg.digital_signature_details === "string"
                  ? JSON.parse(foundOrg.digital_signature_details)
                  : foundOrg.digital_signature_details;
              if (!Array.isArray(digitalSignatures)) digitalSignatures = [];
            } catch {
              digitalSignatures = [];
            }
          }
          
          let websites = [];
          if (foundOrg.websites) {
            try {
              websites =
                typeof foundOrg.websites === "string"
                  ? JSON.parse(foundOrg.websites)
                  : foundOrg.websites;
              if (!Array.isArray(websites)) websites = [];
            } catch {
              websites = [];
            }
          }

          setSelectedOrganization({
            id: foundOrg.id,
            userId: director.organizationUserId,
            organisationType: foundOrg.organisation_type || "-",
            legalName: foundOrg.legal_name || "-",
            tradeName: foundOrg.trade_name || "-",
            category: foundOrg.category || "-",
            gstin: foundOrg.gstin || "-",
            incorporationDate: foundOrg.incorporation_date || "-",
            panFile: foundOrg.pan_file || null,
            tan: foundOrg.tan || "-",
            cin: foundOrg.cin || "-",
            registeredAddress: foundOrg.registered_address || "-",
            directorsPartners: directorsPartners,
            digitalSignatures: digitalSignatures,
            websites: websites,
            clientName: director.clientName,
            clientEmail: director.clientEmail,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching organization details:", error);
      alert("Failed to load organization details");
    } finally {
      setLoadingOrgDetails(false);
    }
  };

  // Handle edit button click
  const handleEditOrganization = () => {
    if (selectedOrganization) {
      // Navigate to organizations page - the page will need to handle opening the specific org
      navigate(`/admin/organizations`);
      // Store the org ID in sessionStorage so the organizations page can auto-open it
      sessionStorage.setItem('editOrganizationId', selectedOrganization.id);
      sessionStorage.setItem('editOrganizationUserId', selectedOrganization.userId);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00486D] rounded-lg">
                <RiGroupLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Directors</h1>
                <p className="text-sm text-gray-600">
                  View all directors from organizations
                </p>
              </div>
            </div>
            <button
              onClick={fetchDirectors}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search directors by name, email, contact, DIN..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00486D] text-sm"
                />
              </div>

              {/* Organization Filter */}
              <select
                value={organizationFilter}
                onChange={(e) => setOrganizationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00486D] text-sm"
              >
                <option value="">All Organizations</option>
                {organizationsList.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>

              {/* Client Filter */}
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00486D] text-sm"
              >
                <option value="">All Clients</option>
                {clientsList.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Directors Table */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FiRefreshCw className="w-8 h-8 text-[#00486D] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading directors...</p>
          </div>
        ) : filteredDirectors.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <BsBuilding className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              No directors found
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || organizationFilter || clientFilter
                ? "Try adjusting your filters"
                : "Directors will appear here once organizations are created"}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Director Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        DIN Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Organization
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Date Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDirectors.map((director, index) => (
                      <tr
                        key={index}
                        onClick={() => handleDirectorClick(director)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">
                              {director.name || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {director.dinNumber || director.din_number || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {director.contact ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              {director.contact}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {director.email ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              {director.email}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {director.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <FiCheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <FiXCircle className="w-3 h-3" />
                              {director.status || "Inactive"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <BsBuilding className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900">
                              {director.organizationName || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {director.clientName || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {director.dateOfAddition ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              {(() => {
                                try {
                                  const dateStr = director.dateOfAddition;
                                  // Handle different date formats
                                  let dateObj;
                                  if (typeof dateStr === 'string') {
                                    // Try parsing the date string
                                    if (dateStr.includes('/')) {
                                      // Handle DD/MM/YYYY format
                                      const parts = dateStr.split('/');
                                      if (parts.length === 3) {
                                        dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
                                      } else {
                                        dateObj = new Date(dateStr);
                                      }
                                    } else {
                                      dateObj = new Date(dateStr);
                                    }
                                  } else {
                                    dateObj = new Date(dateStr);
                                  }
                                  
                                  if (isNaN(dateObj.getTime())) {
                                    return dateStr; // Return original string if invalid date
                                  }
                                  
                                  return dateObj.toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  });
                                } catch {
                                  return director.dateOfAddition; // Return original if parsing fails
                                }
                              })()}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredDirectors.length)}{" "}
                  of {filteredDirectors.length} directors
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Organization Details Modal */}
        {selectedOrganization && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h4 className="text-lg font-semibold text-gray-900">
                  Organization Details
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedOrganization(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              {loadingOrgDetails ? (
                <div className="p-12 text-center">
                  <FiRefreshCw className="w-8 h-8 text-[#00486D] animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading organization details...</p>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-6">
                  {/* Client Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Client Information</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 text-gray-900 font-medium">{selectedOrganization.clientName || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedOrganization.clientEmail || "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Organization Basic Info */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Organization Details</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Organization Type:</span>
                        <span className="ml-2 text-gray-900">{selectedOrganization.organisationType || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 text-gray-900">{selectedOrganization.category || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Legal Name:</span>
                        <span className="ml-2 text-gray-900 font-medium">{selectedOrganization.legalName || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Trade Name:</span>
                        <span className="ml-2 text-gray-900">{selectedOrganization.tradeName || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">GSTIN:</span>
                        <span className="ml-2 text-gray-900 font-mono">{selectedOrganization.gstin || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">CIN:</span>
                        <span className="ml-2 text-gray-900 font-mono">{selectedOrganization.cin || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">TAN:</span>
                        <span className="ml-2 text-gray-900 font-mono">{selectedOrganization.tan || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Incorporation Date:</span>
                        <span className="ml-2 text-gray-900">{selectedOrganization.incorporationDate || "-"}</span>
                      </div>
                    </div>
                    {selectedOrganization.registeredAddress && (
                      <div className="mt-4">
                        <span className="text-gray-500 text-sm">Registered Address:</span>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrganization.registeredAddress}</p>
                      </div>
                    )}
                  </div>

                  {/* Directors/Partners */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <RiGroupLine className="w-4 h-4" />
                      Directors / Partners ({selectedOrganization.directorsPartners?.length || 0})
                    </h5>
                    {selectedOrganization.directorsPartners && selectedOrganization.directorsPartners.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">DIN</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Contact</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedOrganization.directorsPartners.map((dp, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2">{dp.name || "-"}</td>
                                <td className="px-3 py-2 font-mono">{dp.dinNumber || dp.din_number || "-"}</td>
                                <td className="px-3 py-2">{dp.contact || "-"}</td>
                                <td className="px-3 py-2">{dp.email || "-"}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    dp.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}>
                                    {dp.status || "Active"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No directors/partners added</p>
                    )}
                  </div>

                  {/* Websites */}
                  {selectedOrganization.websites && selectedOrganization.websites.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FiGlobe className="w-4 h-4" />
                        Websites ({selectedOrganization.websites.length})
                      </h5>
                      <div className="space-y-2">
                        {selectedOrganization.websites.map((website, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-3 text-sm">
                            <div className="font-medium text-gray-900">{website.url || "-"}</div>
                            {website.remarks && (
                              <div className="text-gray-500 mt-1">{website.remarks}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setSelectedOrganization(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleEditOrganization}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2"
                  style={{
                    background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                  }}
                >
                  <FiEdit className="w-4 h-4" />
                  Edit Organization
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDirectors;
