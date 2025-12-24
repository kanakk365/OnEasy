import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../utils/api";
import logo from "../../../assets/logo.png";

function AdminClientCompanyDocuments() {
  const navigate = useNavigate();
  const { userId, orgId } = useParams();
  const [, setClientInfo] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [directorsPartnersDocuments, setDirectorsPartnersDocuments] = useState([]);
  const [organizationDocuments, setOrganizationDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && orgId) {
      loadClientAndOrganization();
    }
  }, [userId, orgId]);

  const loadClientAndOrganization = async () => {
    try {
      setLoading(true);

      // Fetch client info
      const clientResponse = await apiClient.get(`/admin/clients`).catch(() => ({ success: false, data: [] }));
      if (clientResponse.success && clientResponse.data) {
        const client = clientResponse.data.find(c => c.user_id === userId);
        if (client) {
          setClientInfo(client);
        }
      }

      // Fetch organization details
      const orgResponse = await apiClient.get(`/users-page/user-data/${userId}`).catch(() => ({ 
        success: false, 
        data: { organisations: [] }
      }));
      
      if (orgResponse.success && orgResponse.data && orgResponse.data.organisations) {
        const org = orgResponse.data.organisations.find(o => o.id === parseInt(orgId));
        if (org) {
          setOrganization({
            id: org.id,
            legalName: org.legal_name || 'N/A',
            tradeName: org.trade_name || 'N/A',
            gstin: org.gstin || 'N/A',
            organisationType: org.organisation_type || 'N/A'
          });
        }
      }

      // Fetch directors/partners documents count
      const directorsResponse = await apiClient.get(`/users-page/directors-partners-documents/${userId}?organizationId=${orgId}`).catch(() => ({ 
        success: false, 
        data: {}
      }));
      
      let directorsCount = 0;
      if (directorsResponse.success && directorsResponse.data) {
        Object.values(directorsResponse.data).forEach(docArray => {
          if (Array.isArray(docArray)) {
            directorsCount += docArray.length;
          }
        });
      }
      setDirectorsPartnersDocuments(Array(directorsCount).fill(null)); // Just for count display

      // Load business documents from registrations
      const [pl, prop, si, gst] = await Promise.all([
        apiClient.get(`/private-limited/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/proprietorship/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/startup-india/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/gst/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
      ]);

      const normalize = (resp) =>
        resp.success
          ? Array.isArray(resp.data)
            ? resp.data
            : resp.data?.data || []
          : [];

      const allRegistrations = [
        ...normalize(pl),
        ...normalize(prop),
        ...normalize(si),
        ...normalize(gst),
      ];

      // Extract business documents from registrations
      const organizationDocs = [];
      
      allRegistrations.forEach((reg) => {
        if (reg.business_bank_statement_url) organizationDocs.push({ 
          name: "Business Bank Statement", 
          url: reg.business_bank_statement_url, 
          type: "business_bank_statement",
          service: reg.ticket_id || "N/A"
        });
        if (reg.partnership_deed_url) organizationDocs.push({ 
          name: "Partnership Deed", 
          url: reg.partnership_deed_url, 
          type: "partnership_deed",
          service: reg.ticket_id || "N/A"
        });
        if (reg.certificate_of_incorporation_url) organizationDocs.push({ 
          name: "Certificate of Incorporation", 
          url: reg.certificate_of_incorporation_url, 
          type: "certificate_of_incorporation",
          service: reg.ticket_id || "N/A"
        });
      });

      // Deduplicate documents by URL
      const deduplicateDocs = (docs) => {
        const uniqueDocs = [];
        const seenUrls = new Set();
        docs.forEach((doc) => {
          if (doc.url && !seenUrls.has(doc.url)) {
            seenUrls.add(doc.url);
            uniqueDocs.push(doc);
          }
        });
        return uniqueDocs;
      };

      setOrganizationDocuments(deduplicateDocs(organizationDocs));
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
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

  if (!organization) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Organization not found</p>
          <button
            onClick={() => navigate(`/admin/client-organizations/${userId}`)}
            className="mt-4 px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D]"
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/client-organizations/${userId}`)}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Organizations
          </button>
          
          {/* Company Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-[#01334C] flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  src={logo} 
                  alt="Company Logo" 
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {organization.legalName !== 'N/A' ? organization.legalName : organization.tradeName}
                </h1>
                {organization.tradeName !== 'N/A' && organization.legalName !== 'N/A' && organization.tradeName !== organization.legalName && (
                  <p className="text-gray-600 mt-1">{organization.tradeName}</p>
                )}
                {organization.gstin !== 'N/A' && (
                  <p className="text-sm text-gray-500 mt-1 font-mono">GSTIN: {organization.gstin}</p>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Documents</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Directors/Partners Documents Card */}
          <div
            className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/admin/client-directors/${userId}/${orgId}`, { state: { orgId, userId } })}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Directors/Partners</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {directorsPartnersDocuments.length} {directorsPartnersDocuments.length === 1 ? "document" : "documents"}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-purple-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="text-gray-500 text-sm mb-2">
                {directorsPartnersDocuments.length > 0
                  ? `You have ${directorsPartnersDocuments.length} directors/partners ${directorsPartnersDocuments.length === 1 ? 'document' : 'documents'}`
                  : "No directors/partners documents found"}
              </p>
              <p className="text-gray-400 text-xs">Click to view documents by type</p>
            </div>
          </div>

          {/* Business Documents Card */}
          <div
            className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/admin/client-company-documents/${userId}/${orgId}/business`, { state: { orgId, userId } })}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Business Documents</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {organizationDocuments.length} {organizationDocuments.length === 1 ? "document" : "documents"}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-green-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-sm mb-2">
                {organizationDocuments.length > 0
                  ? `${organizationDocuments.length} business ${organizationDocuments.length === 1 ? 'document' : 'documents'} available`
                  : "No business documents found"}
              </p>
              <p className="text-gray-400 text-xs">Click to view and manage business documents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminClientCompanyDocuments;

