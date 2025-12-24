import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import logo from "../../assets/logo.png";

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
            legalName: org.legal_name || 'N/A',
            tradeName: org.trade_name || 'N/A',
            gstin: org.gstin || 'N/A',
            organisationType: org.organisation_type || 'N/A'
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
          service: reg.ticket_id || "N/A"
        });
        if (reg.landlord_aadhaar_card_url) directorsPartnersDocs.push({ 
          name: "Landlord Aadhaar Card", 
          url: reg.landlord_aadhaar_card_url, 
          type: "landlord_aadhaar_card",
          service: reg.ticket_id || "N/A"
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
                    service: reg.ticket_id || "N/A"
                  });
                }
                if (director.panCardUrl || director.pan_doc_path) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - PAN Card`,
                    url: director.panCardUrl || director.pan_doc_path,
                    type: "director_pan",
                    service: reg.ticket_id || "N/A"
                  });
                }
                if (director.photo_path || director.photoUrl) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - Photo`,
                    url: director.photo_path || director.photoUrl,
                    type: "director_photo",
                    service: reg.ticket_id || "N/A"
                  });
                }
                if (director.bank_statement_or_utility_bill || director.bankStatementUrl) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - Bank Statement`,
                    url: director.bank_statement_or_utility_bill || director.bankStatementUrl,
                    type: "director_bank_statement",
                    service: reg.ticket_id || "N/A"
                  });
                }
                if (director.specimen_signature || director.specimenSignatureUrl) {
                  directorsPartnersDocs.push({
                    name: `Director ${index + 1} - Signature`,
                    url: director.specimen_signature || director.specimenSignatureUrl,
                    type: "director_signature",
                    service: reg.ticket_id || "N/A"
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
          service: reg.ticket_id || "N/A"
        });
        if (reg.property_tax_url) organizationDocs.push({ 
          name: "Property Tax", 
          url: reg.property_tax_url, 
          type: "property_tax",
          service: reg.ticket_id || "N/A"
        });
        if (reg.rental_agreement_url) organizationDocs.push({ 
          name: "Rental Agreement", 
          url: reg.rental_agreement_url, 
          type: "rental_agreement",
          service: reg.ticket_id || "N/A"
        });
        if (reg.utility_bill) organizationDocs.push({ 
          name: "Utility Bill", 
          url: reg.utility_bill, 
          type: "utility_bill",
          service: reg.ticket_id || "N/A"
        });
        if (reg.logo_path) organizationDocs.push({ 
          name: "Company Logo", 
          url: reg.logo_path, 
          type: "logo",
          service: reg.ticket_id || "N/A"
        });
        if (reg.pan_entity_doc_path) organizationDocs.push({ 
          name: "Entity PAN Card", 
          url: reg.pan_entity_doc_path, 
          type: "pan_entity",
          service: reg.ticket_id || "N/A"
        });
        if (reg.tan_entity_doc_path) organizationDocs.push({ 
          name: "Entity TAN Card", 
          url: reg.tan_entity_doc_path, 
          type: "tan_entity",
          service: reg.ticket_id || "N/A"
        });
        if (reg.principal_place_photo_url) organizationDocs.push({ 
          name: "Principal Place Photo", 
          url: reg.principal_place_photo_url, 
          type: "principal_place_photo",
          service: reg.ticket_id || "N/A"
        });
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
            onClick={() => navigate("/organizations-list")}
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
            onClick={() => navigate("/organizations-list")}
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
            onClick={() => navigate(`/company-documents/${orgId}/directors`, { state: { orgId } })}
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
            onClick={() => navigate(`/company-documents/${orgId}/business`, { state: { orgId } })}
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

export default CompanyDocuments;

