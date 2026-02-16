import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { FiCheckCircle, FiXCircle, FiChevronLeft } from "react-icons/fi";

const renderDocumentIcon = (docType) => {
  switch (docType) {
    case "aadhar_card":
      return (
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
          <div className="absolute inset-0 flex flex-col">
            <div className="h-1/3 bg-[#FF9933]"></div>
            <div className="h-1/3 bg-white flex items-center justify-center relative">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
        <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0">
          <div className="absolute inset-0 flex flex-col p-1.5">
            <div className="h-1 bg-white/30 rounded mb-0.5"></div>
            <div className="flex-1 flex flex-col justify-center gap-0.5">
              <div className="h-0.5 bg-white/40 rounded"></div>
              <div className="h-0.5 bg-white/30 rounded w-4/5"></div>
              <div className="h-0.5 bg-white/25 rounded w-3/5"></div>
            </div>
            <div className="absolute bottom-0.5 left-1 right-1">
              <div className="text-[5px] font-bold text-white text-center tracking-wider">PAN</div>
            </div>
          </div>
        </div>
      );
    case "passport":
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0">
          <div className="absolute inset-0 flex flex-col">
            <div className="h-1.5 bg-gradient-to-r from-yellow-400/40 to-yellow-500/40"></div>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/5">
                <div className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/30"></div>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-yellow-400/30 to-yellow-500/30"></div>
            <div className="absolute bottom-0.5 left-0 right-0">
              <div className="text-[4px] font-bold text-white/70 text-center tracking-widest">PASSPORT</div>
            </div>
          </div>
        </div>
      );
    case "profile_image":
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    case "attachment":
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
  }
};

function KYC() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({
    aadhar_card: [],
    pan_card: [],
    passport: [],
    profile_image: [],
    attachment: [],
  });
  const [loading, setLoading] = useState(true);


  const documentTypes = [
    {
      value: "passport",
      label: "Passport",
      description: "Upload your Passport",
    },
    {
      value: "pan_card",
      label: "PAN Card",
      description: "Upload your PAN card",
    },
    {
      value: "aadhar_card",
      label: "Aadhaar Card",
      description: "Upload your Aadhaar card",
    },
    {
      value: "profile_image",
      label: "Professional Photo",
      description: "Upload your professional photo",
    },
    {
      value: "attachment",
      label: "Attachments",
      description: "Add attachments with custom names",
    },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

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

      // Fetch personal documents from new endpoint
      const response = await apiClient
        .get("/users-page/personal-documents")
        .catch(() => ({
          success: false,
          data: {
            aadhar_card: [],
            pan_card: [],
            passport: [],
            profile_image: [],
            attachment: [],
          },
        }));

      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        // Fallback to empty structure
        setDocuments({
          aadhar_card: [],
          pan_card: [],
          passport: [],
          profile_image: [],
          attachment: [],
        });
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments({
        aadhar_card: [],
        pan_card: [],
        passport: [],
        profile_image: [],
        signature: [],
      });
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate("/documents")}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              KYC Documents
            </h1>
          </div>
          <p className="text-gray-500 italic ml-9">
            View all your Uploaded documents here
          </p>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {documentTypes.map((docType) => {
            const docList = documents[docType.value] || [];
            const isUploaded = docList.length > 0;

            return (
              <div
                key={docType.value}
                onClick={() => navigate(`/kyc/${docType.value}`)}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-xl transition-opacity ${
                      isUploaded
                        ? "opacity-100"
                        : "opacity-70 group-hover:opacity-100"
                    }`}
                  >
                    {renderDocumentIcon(docType.value)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-white transition-colors">
                      {docType.label}
                    </h3>
                  </div>
                </div>

                {isUploaded ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <FiCheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Uploaded</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <FiXCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Not Uploaded</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default KYC;
