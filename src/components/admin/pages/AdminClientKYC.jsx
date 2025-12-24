import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../utils/api";

function AdminClientKYC() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [clientInfo, setClientInfo] = useState(null);
  const [documents, setDocuments] = useState({
    aadhar_card: [],
    pan_card: [],
    passport: [],
    profile_image: [],
    signature: []
  });
  const [loading, setLoading] = useState(true);

  // Render icon component for each document type (same as KYC.jsx)
  const renderDocumentIcon = (docType) => {
    switch (docType) {
      case "aadhar_card":
        return (
          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm border border-gray-200">
            <div className="absolute inset-0 flex flex-col">
              <div className="h-1/3 bg-[#FF9933]"></div>
              <div className="h-1/3 bg-white flex items-center justify-center relative">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#000080" strokeWidth="1.5" fill="none"/>
                  <circle cx="12" cy="12" r="1.5" fill="#000080"/>
                  {[...Array(24)].map((_, i) => {
                    const angle = (i * 15 - 90) * (Math.PI / 180);
                    const x1 = 12 + 8 * Math.cos(angle);
                    const y1 = 12 + 8 * Math.sin(angle);
                    const x2 = 12 + 9.5 * Math.cos(angle);
                    const y2 = 12 + 9.5 * Math.sin(angle);
                    return (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="0.8" strokeLinecap="round"/>
                    );
                  })}
                </svg>
              </div>
              <div className="h-1/3 bg-[#138808]"></div>
            </div>
          </div>
        );
      case "pan_card":
        return (
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex flex-col p-2">
              <div className="h-1.5 bg-white/30 rounded mb-1"></div>
              <div className="flex-1 flex flex-col justify-center gap-0.5">
                <div className="h-1 bg-white/40 rounded"></div>
                <div className="h-1 bg-white/30 rounded w-4/5"></div>
                <div className="h-0.5 bg-white/25 rounded w-3/5"></div>
              </div>
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-[7px] font-bold text-white text-center tracking-wider">PAN</div>
              </div>
            </div>
          </div>
        );
      case "passport":
        return (
          <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex flex-col">
              <div className="h-2 bg-gradient-to-r from-yellow-400/40 to-yellow-500/40"></div>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/5">
                  <div className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  </div>
                </div>
                <div className="absolute top-2 left-2 w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="absolute top-2 right-2 w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-yellow-400/30 to-yellow-500/30"></div>
            </div>
            <div className="absolute bottom-0.5 left-0 right-0">
              <div className="text-[5px] font-bold text-white/70 text-center tracking-widest">PASSPORT</div>
            </div>
          </div>
        );
      case "profile_image":
        return (
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case "signature":
        return (
          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12c2-3 4-4 6-3s2 2 1 4" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const documentTypes = [
    { 
      value: "aadhar_card", 
      label: "Aadhaar Card", 
      description: "Upload and view Aadhaar card documents"
    },
    { 
      value: "pan_card", 
      label: "PAN Card", 
      description: "Upload and view PAN card documents"
    },
    { 
      value: "passport", 
      label: "Passport", 
      description: "Upload and view Passport documents"
    },
    { 
      value: "profile_image", 
      label: "Profile Photo", 
      description: "Upload and view profile photos"
    },
    { 
      value: "signature", 
      label: "Signature", 
      description: "Upload and view signature documents"
    },
  ];

  useEffect(() => {
    if (userId) {
      loadClientAndDocuments();
    }
  }, [userId]);

  const loadClientAndDocuments = async () => {
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
      const response = await apiClient.get(`/users-page/personal-documents/${userId}`).catch(() => ({ 
        success: false, 
        data: {
          aadhar_card: [],
          pan_card: [],
          passport: [],
          profile_image: [],
          signature: []
        }
      }));

      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        setDocuments({
          aadhar_card: [],
          pan_card: [],
          passport: [],
          profile_image: [],
          signature: []
        });
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments({
        aadhar_card: [],
        pan_card: [],
        passport: [],
        profile_image: [],
        signature: []
      });
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(`/admin/client-documents/${userId}`)}
              className="text-[#01334C] hover:text-[#00486D] mb-2 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Client Documents
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">KYC Documents</h1>
            {clientInfo && (
              <p className="text-gray-600 mt-1">
                {clientInfo.name || 'N/A'} • {clientInfo.user_id}
              </p>
            )}
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentTypes.map((docType) => {
            const docList = documents[docType.value] || [];

            return (
              <div
                key={docType.value}
                className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/admin/client-kyc/${userId}/${docType.value}`)}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {renderDocumentIcon(docType.value)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{docType.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{docType.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    docList.length >= 3 
                      ? "bg-red-100 text-red-800" 
                      : docList.length > 0 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {docList.length}/3
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminClientKYC;

