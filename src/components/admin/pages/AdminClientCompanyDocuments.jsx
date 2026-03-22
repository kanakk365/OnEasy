import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../utils/api";
import logo from "../../../assets/logo.png";
import { BsArrowRight } from "react-icons/bs";
import { FiChevronLeft } from "react-icons/fi";
import { RiUserLine, RiFileTextLine } from "react-icons/ri";

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
            legalName: org.legal_name || '-',
            tradeName: org.trade_name || '-',
            gstin: org.gstin || '-',
            organisationType: org.organisation_type || '-'
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
          service: reg.ticket_id || "-"
        });
        if (reg.partnership_deed_url) organizationDocs.push({ 
          name: "Partnership Deed", 
          url: reg.partnership_deed_url, 
          type: "partnership_deed",
          service: reg.ticket_id || "-"
        });
        if (reg.certificate_of_incorporation_url) organizationDocs.push({ 
          name: "Certificate of Incorporation", 
          url: reg.certificate_of_incorporation_url, 
          type: "certificate_of_incorporation",
          service: reg.ticket_id || "-"
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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate(`/admin/client-organizations/${userId}`)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Company Documents</h1>
          </div>
          <p className="text-gray-500 italic ml-9">Select your document type</p>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#01334C] flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {organization.legalName !== '-' ? organization.legalName : organization.tradeName}
            </h2>
            {organization.tradeName !== '-' && organization.legalName !== '-' && organization.tradeName !== organization.legalName && (
              <p className="text-sm text-gray-500 mt-0.5">{organization.tradeName}</p>
            )}
            {organization.gstin !== '-' && (
              <p className="text-xs text-gray-400 mt-0.5 font-mono">GSTIN: {organization.gstin}</p>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Directors/Partners Documents Card */}
          <div
            onClick={() => navigate(`/admin/client-directors/${userId}/${orgId}`, { state: { orgId, userId } })}
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
                <RiUserLine className="w-6 h-6" />
              </div>
              <div className="text-[#00486D] group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                <BsArrowRight className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors">
              Directors/Partners
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed group-hover:text-white/80 transition-colors">
              View and manage directors/partners KYC documents
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F6FD] group-hover:bg-white/20 flex items-center justify-center text-[#00486D] group-hover:text-white font-semibold text-sm transition-colors">
                {directorsPartnersDocuments.length}
              </div>
              <span className="text-gray-600 text-sm group-hover:text-white/80 transition-colors">
                {directorsPartnersDocuments.length === 1 ? "Document" : "Documents"}
              </span>
            </div>
          </div>

          {/* Business Documents Card */}
          <div
            onClick={() => navigate(`/admin/client-company-documents/${userId}/${orgId}/business`, { state: { orgId, userId } })}
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
              Business Documents
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed group-hover:text-white/80 transition-colors">
              Access company documents, registrations, and compliance files
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F6FD] group-hover:bg-white/20 flex items-center justify-center text-[#00486D] group-hover:text-white font-semibold text-sm transition-colors">
                {organizationDocuments.length}
              </div>
              <span className="text-gray-600 text-sm group-hover:text-white/80 transition-colors">
                {organizationDocuments.length === 1 ? "Document" : "Documents"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminClientCompanyDocuments;
