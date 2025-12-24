import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../utils/api";

function AdminClientDocuments() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [clientInfo, setClientInfo] = useState(null);
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [organizationsCount, setOrganizationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadClientData();
    }
  }, [userId]);

  const loadClientData = async () => {
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

      // Fetch personal documents
      const personalDocsResponse = await apiClient.get(`/users-page/personal-documents/${userId}`).catch(() => ({ 
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
      const orgResponse = await apiClient.get(`/users-page/user-data/${userId}`).catch(() => ({ 
        success: false, 
        data: { organisations: [] }
      }));
      
      if (orgResponse.success && orgResponse.data && orgResponse.data.organisations) {
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
      console.error("Error loading client data:", error);
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

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/documents-vault")}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Documents Vault
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Client Documents</h1>
            {clientInfo && (
              <div className="mt-2">
                <p className="text-gray-600">
                  <span className="font-medium">{clientInfo.name || 'N/A'}</span>
                  {clientInfo.email && <span className="text-gray-500"> • {clientInfo.email}</span>}
                </p>
                <p className="text-sm text-gray-500 font-mono mt-1">{clientInfo.user_id}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Documents Card */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/admin/client-kyc/${userId}`)}
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
                  ? `${personalDocuments.length} personal ${personalDocuments.length === 1 ? 'document' : 'documents'}`
                  : "No personal documents found"}
              </p>
              <p className="text-gray-400 text-xs">Click to view and manage KYC documents</p>
            </div>
          </div>

          {/* Organizations Card */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/admin/client-organizations/${userId}`)}
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
                  d="M21 13.255A23.593 23.593 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-sm mb-2">
                {organizationsCount > 0
                  ? `You have ${organizationsCount} registered ${organizationsCount === 1 ? 'company' : 'companies'}`
                  : "No organizations found"}
              </p>
              <p className="text-gray-400 text-xs">Click to view and manage organization documents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminClientDocuments;

