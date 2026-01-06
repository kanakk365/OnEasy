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
