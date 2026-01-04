import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { RiFileTextLine } from "react-icons/ri";
import { FiCheckCircle, FiXCircle, FiChevronLeft } from "react-icons/fi";

function KYC() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({
    aadhar_card: [],
    pan_card: [],
    passport: [],
    profile_image: [],
    signature: [],
  });
  const [loading, setLoading] = useState(true);

  // Render icon component for each document type
  const renderDocumentIcon = (docType) => {
    switch (docType) {
      case "aadhar_card":
        // Aadhaar logo - refined tricolor with chakra
        return (
          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm border border-gray-200">
            {/* Tricolor stripes - more refined */}
            <div className="absolute inset-0 flex flex-col">
              <div className="h-1/3 bg-[#FF9933]"></div>
              <div className="h-1/3 bg-white flex items-center justify-center relative">
                {/* Ashoka Chakra */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#000080"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle cx="12" cy="12" r="1.5" fill="#000080" />
                  {[...Array(24)].map((_, i) => {
                    const angle = (i * 15 - 90) * (Math.PI / 180);
                    const x1 = 12 + 8 * Math.cos(angle);
                    const y1 = 12 + 8 * Math.sin(angle);
                    const x2 = 12 + 9.5 * Math.cos(angle);
                    const y2 = 12 + 9.5 * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#000080"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="h-1/3 bg-[#138808]"></div>
            </div>
          </div>
        );
      case "pan_card":
        // PAN card - more realistic card design
        return (
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex flex-col p-2">
              {/* Card header */}
              <div className="h-1.5 bg-white/30 rounded mb-1"></div>
              {/* Card body lines */}
              <div className="flex-1 flex flex-col justify-center gap-0.5">
                <div className="h-1 bg-white/40 rounded"></div>
                <div className="h-1 bg-white/30 rounded w-4/5"></div>
                <div className="h-1 bg-white/25 rounded w-3/5"></div>
              </div>
              {/* PAN text */}
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-[7px] font-bold text-white text-center tracking-wider">
                  PAN
                </div>
              </div>
            </div>
          </div>
        );
      case "passport":
        // Passport - more realistic book design
        return (
          <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex flex-col">
              {/* Top gold stripe */}
              <div className="h-2 bg-gradient-to-r from-yellow-400/40 to-yellow-500/40"></div>
              {/* Center section with emblem */}
              <div className="flex-1 flex items-center justify-center relative">
                {/* Emblem circle */}
                <div className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/5">
                  <div className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  </div>
                </div>
                {/* Small stars */}
                <div className="absolute top-2 left-2 w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="absolute top-2 right-2 w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
              {/* Bottom gold stripe */}
              <div className="h-1.5 bg-gradient-to-r from-yellow-400/30 to-yellow-500/30"></div>
            </div>
            {/* PASSPORT text */}
            <div className="absolute bottom-0.5 left-0 right-0">
              <div className="text-[5px] font-bold text-white/70 text-center tracking-widest">
                PASSPORT
              </div>
            </div>
          </div>
        );
      case "profile_image":
        // Profile Photo - modern user icon
        return (
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      case "signature":
        // Signature - elegant pen/signature icon
        return (
          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="w-8 h-8 text-amber-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
              {/* Signature curve */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12c2-3 4-4 6-3s2 2 1 4"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

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
      label: "Profile Photo",
      description: "Upload your profile photo",
    },
    {
      value: "signature",
      label: "Signature",
      description: "Upload your signature",
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
            signature: [],
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
          signature: [],
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

  // Calculate Stats
  const totalDocs = documentTypes.length;
  const uploadedCount = documentTypes.filter(
    (type) => documents[type.value]?.length > 0
  ).length;
  const pendingCount = totalDocs - uploadedCount;

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-semibold text-[#00486D] mb-1">
              {uploadedCount}
            </h2>
            <p className="text-gray-900 font-medium">Uploaded</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-[#00486D] mb-1">
              {pendingCount}
            </h2>
            <p className="text-gray-900 font-medium">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-[#00486D] mb-1">
              {totalDocs}
            </h2>
            <p className="text-gray-900 font-medium">Total</p>
          </div>
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
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isUploaded
                        ? "bg-[#00486D] text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-white/10 group-hover:text-white"
                    }`}
                  >
                    <RiFileTextLine className="w-6 h-6" />
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
