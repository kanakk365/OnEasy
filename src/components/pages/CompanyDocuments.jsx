import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { BsBuilding, BsArrowRight } from "react-icons/bs";
import { FiChevronLeft } from "react-icons/fi";
import { RiUserLine, RiFileTextLine } from "react-icons/ri";


function CompanyDocuments() {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const [organization, setOrganization] = useState(null);
  const [directorsPartnersDocuments, setDirectorsPartnersDocuments] = useState([]);
  const [organizationDocuments, setOrganizationDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      loadOrganizationAndDocuments();
    }
  }, [orgId]);

  const loadOrganizationAndDocuments = async () => {
    try {
      setLoading(true);

      // Load organization details
      const orgResponse = await getUsersPageData();
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

      // Load documents from registrations
      const storedUser = JSON.parse(
        localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
      );
      const userId = storedUser.id;

      if (!userId) {
        setLoading(false);
        return;
      }

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

      // Extract business documents from registrations and categorize them
      const directorsPartnersDocs = [];
      const organizationDocs = [];

      allRegistrations.forEach((reg) => {
        // Directors/Partners documents
        if (reg.landlord_pan_card_url) directorsPartnersDocs.push({
          name: "Landlord PAN Card",
          url: reg.landlord_pan_card_url,
          type: "landlord_pan_card",
          service: reg.ticket_id || "-"
        });
        if (reg.landlord_aadhaar_card_url) directorsPartnersDocs.push({
          name: "Landlord Aadhaar Card",
          url: reg.landlord_aadhaar_card_url,
          type: "landlord_aadhaar_card",
          service: reg.ticket_id || "-"
        });

        // Extract director documents from directors_data if available
        if (reg.directors_data) {
          try {
            const directorsData = typeof reg.directors_data === 'string'
              ? JSON.parse(reg.directors_data)
              : reg.directors_data;

            if (Array.isArray(directorsData)) {
              directorsData.forEach((director, index) => {
                if (director.aadhaarCardUrl || director.aadhaar_doc_path) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - Aadhaar Card`,
                    url: director.aadhaarCardUrl || director.aadhaar_doc_path,
                    type: "director_aadhaar",
                    service: reg.ticket_id || "-"
                  });
                }
                if (director.panCardUrl || director.pan_doc_path) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - PAN Card`,
                    url: director.panCardUrl || director.pan_doc_path,
                    type: "director_pan",
                    service: reg.ticket_id || "-"
                  });
                }
                if (director.photo_path || director.photoUrl) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - Photo`,
                    url: director.photo_path || director.photoUrl,
                    type: "director_photo",
                    service: reg.ticket_id || "-"
                  });
                }
                if (director.bank_statement_or_utility_bill || director.bankStatementUrl) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - Bank Statement`,
                    url: director.bank_statement_or_utility_bill || director.bankStatementUrl,
                    type: "director_bank_statement",
                    service: reg.ticket_id || "-"
                  });
                }
                if (director.specimen_signature || director.specimenSignatureUrl) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - Signature`,
                    url: director.specimen_signature || director.specimenSignatureUrl,
                    type: "director_signature",
                    service: reg.ticket_id || "-"
                  });
                }
              });
            }
          } catch (e) {
            console.error("Error parsing directors_data:", e);
          }
        }

        // Organization documents
        if (reg.electricity_bill_url) organizationDocs.push({
          name: "Electricity Bill",
          url: reg.electricity_bill_url,
          type: "electricity_bill",
          service: reg.ticket_id || "-"
        });
        if (reg.property_tax_url) organizationDocs.push({
          name: "Property Tax",
          url: reg.property_tax_url,
          type: "property_tax",
          service: reg.ticket_id || "-"
        });
        if (reg.rental_agreement_url) organizationDocs.push({
          name: "Rental Agreement",
          url: reg.rental_agreement_url,
          type: "rental_agreement",
          service: reg.ticket_id || "-"
        });
        if (reg.utility_bill) organizationDocs.push({
          name: "Utility Bill",
          url: reg.utility_bill,
          type: "utility_bill",
          service: reg.ticket_id || "-"
        });
        if (reg.logo_path) organizationDocs.push({
          name: "Company Logo",
          url: reg.logo_path,
          type: "logo",
          service: reg.ticket_id || "-"
        });
        if (reg.pan_entity_doc_path) organizationDocs.push({
          name: "Entity PAN Card",
          url: reg.pan_entity_doc_path,
          type: "pan_entity",
          service: reg.ticket_id || "-"
        });
        if (reg.tan_entity_doc_path) organizationDocs.push({
          name: "Entity TAN Card",
          url: reg.tan_entity_doc_path,
          type: "tan_entity",
          service: reg.ticket_id || "-"
        });
        if (reg.principal_place_photo_url) organizationDocs.push({
          name: "Principal Place Photo",
          url: reg.principal_place_photo_url,
          type: "principal_place_photo",
          service: reg.ticket_id || "-"
        });
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

      setDirectorsPartnersDocuments(deduplicateDocs(directorsPartnersDocs));
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022B51] mx-auto"></div>
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
            onClick={() => navigate("/organizations-list")}
            className="mt-4 px-4 py-2 text-white rounded-lg" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-4 lg:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <button
              onClick={() => navigate("/organizations-list")}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-1"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Company Documents</h1>
          </div>
          <p className="text-gray-500 text-sm italic ml-8 lg:ml-9">Select your document type</p>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 p-4 lg:p-5 mb-4 lg:mb-6 flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
            <BsBuilding className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
              {organization.legalName !== '-' ? organization.legalName : organization.tradeName}
            </h2>
            {organization.tradeName !== '-' && organization.legalName !== '-' && organization.tradeName !== organization.legalName && (
              <p className="text-xs lg:text-sm text-gray-500 mt-0.5 truncate">{organization.tradeName}</p>
            )}
            {organization.gstin !== '-' && (
              <p className="text-[11px] lg:text-xs text-gray-400 mt-0.5 font-mono">GSTIN: {organization.gstin}</p>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Directors/Partners Documents Card */}
          <div
            onClick={() => navigate(`/company-documents/${orgId}/directors`, { state: { orgId } })}
            className="bg-white rounded-2xl p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,-0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 group hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white"
                style={{
                  background:
                    "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                }}
              >
                <RiUserLine className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="text-[#022B51] group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                <BsArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
            </div>

            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 group-hover:text-white mb-1.5 lg:mb-2 transition-colors">
              Directors/Partners
            </h3>
            <p className="text-gray-500 text-xs lg:text-sm mb-6 lg:mb-8 leading-relaxed group-hover:text-white/80 transition-colors">
              View and manage directors/partners KYC documents
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F6FD] group-hover:bg-white/20 flex items-center justify-center text-[#022B51] group-hover:text-white font-semibold text-sm transition-colors">
                {directorsPartnersDocuments.length}
              </div>
              <span className="text-gray-600 text-sm group-hover:text-white/80 transition-colors">
                {directorsPartnersDocuments.length === 1 ? "Document" : "Documents"}
              </span>
            </div>
          </div>

          {/* Business Documents Card */}
          <div
            onClick={() => navigate(`/company-documents/${orgId}/business`, { state: { orgId } })}
            className="bg-white rounded-2xl p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,-0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 group hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white"
                style={{
                  background:
                    "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                }}
              >
                <RiFileTextLine className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="text-[#022B51] group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                <BsArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
            </div>

            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 group-hover:text-white mb-1.5 lg:mb-2 transition-colors">
              Business Documents
            </h3>
            <p className="text-gray-500 text-xs lg:text-sm mb-6 lg:mb-8 leading-relaxed group-hover:text-white/80 transition-colors">
              Access company documents, registrations, and compliance files
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F6FD] group-hover:bg-white/20 flex items-center justify-center text-[#022B51] group-hover:text-white font-semibold text-sm transition-colors">
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

export default CompanyDocuments;
