import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";

function Documents() {
  const navigate = useNavigate();
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [organizationsCount, setOrganizationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        const personalDocsResponse = await apiClient.get('/users-page/personal-documents').catch(() => ({ 
          success: false, 
          data: {
            aadhar_card: [],
            pan_card: [],
            passport: [],
            profile_image: [],
            signature: []
          }
        }));
        
        const personalDocs = [];
        
        if (personalDocsResponse.success && personalDocsResponse.data) {
          // Flatten all documents from all categories
          Object.values(personalDocsResponse.data).forEach(docArray => {
            if (Array.isArray(docArray)) {
              docArray.forEach(doc => {
                personalDocs.push({
                  name: doc.name || doc.type,
                  url: doc.url,
                  type: doc.type
                });
              });
            }
          });
        }
        
        setPersonalDocuments(personalDocs);

        // Fetch organizations count
        const orgResponse = await apiClient.get('/users-page/data').catch(() => ({ 
          success: false, 
          data: { organisations: [] }
        }));
        
        if (orgResponse.success && orgResponse.data && orgResponse.data.organisations) {
          // Filter organizations that have at least one meaningful field
          const validOrgs = orgResponse.data.organisations.filter(org => {
            const hasLegalName = org.legal_name && org.legal_name.trim() !== '' && org.legal_name !== 'N/A';
            const hasTradeName = org.trade_name && org.trade_name.trim() !== '' && org.trade_name !== 'N/A';
            const hasGstin = org.gstin && org.gstin.trim() !== '' && org.gstin !== 'N/A';
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

    loadDocuments();
  }, []);



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

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-1">View and manage your personal and business documents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Documents Card */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/kyc")}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Personal Documents</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {personalDocuments.length} {personalDocuments.length === 1 ? "document" : "documents"}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="text-center py-8">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-sm mb-2">
                {personalDocuments.length > 0 
                  ? `You have ${personalDocuments.length} personal ${personalDocuments.length === 1 ? 'document' : 'documents'}`
                  : "No personal documents found"}
              </p>
              <p className="text-gray-400 text-xs">Click to view and manage your KYC documents</p>
            </div>
          </div>

          {/* Organizations Card */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/organizations-list")}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {organizationsCount} {organizationsCount === 1 ? "company" : "companies"}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="text-center py-8">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="text-gray-500 text-sm mb-2">
                {organizationsCount > 0 
                  ? `You have ${organizationsCount} ${organizationsCount === 1 ? 'company' : 'companies'}`
                  : "No organizations found"}
              </p>
              <p className="text-gray-400 text-xs">Click to view your companies and their documents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;

