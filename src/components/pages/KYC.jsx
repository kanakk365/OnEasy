import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { FiCheckCircle, FiXCircle, FiChevronLeft } from "react-icons/fi";

// ─── Document Illustrations ──────────────────────────────────────────────────

const AadhaarCardIllustration = () => (
  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md" style={{ background: "linear-gradient(135deg, #1a6b3c 0%, #0d4a28 100%)" }}>
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Card background */}
      <rect width="56" height="56" fill="url(#aadhaarBg)" rx="12"/>
      <defs>
        <linearGradient id="aadhaarBg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a6b3c"/>
          <stop offset="1" stopColor="#0d4a28"/>
        </linearGradient>
      </defs>

      {/* Top saffron stripe */}
      <rect x="0" y="0" width="56" height="6" rx="12" fill="#FF9933"/>
      <rect x="0" y="0" width="56" height="6" fill="#FF9933"/>
      {/* White stripe */}
      <rect x="0" y="6" width="56" height="5" fill="white"/>
      {/* Green stripe */}
      <rect x="0" y="11" width="56" height="6" fill="#138808"/>

      {/* Card body - white */}
      <rect x="3" y="18" width="50" height="35" rx="4" fill="white" fillOpacity="0.95"/>

      {/* Ashoka Chakra */}
      <circle cx="28" cy="30" r="7" stroke="#000080" strokeWidth="1" fill="none"/>
      <circle cx="28" cy="30" r="1.5" fill="#000080"/>
      {[...Array(24)].map((_, i) => {
        const angle = (i * 15 - 90) * (Math.PI / 180);
        const x1 = 28 + 4.5 * Math.cos(angle);
        const y1 = 30 + 4.5 * Math.sin(angle);
        const x2 = 28 + 6.5 * Math.cos(angle);
        const y2 = 30 + 6.5 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="0.7" strokeLinecap="round"/>;
      })}

      {/* AADHAAR text */}
      <text x="28" y="48" textAnchor="middle" fill="#333" fontSize="5" fontWeight="bold" fontFamily="Arial">AADHAAR</text>
    </svg>
  </div>
);

const PANCardIllustration = () => (
  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="panBg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f5f0e0"/>
          <stop offset="1" stopColor="#e8e0c8"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" fill="url(#panBg)" rx="12"/>

      {/* Header bar */}
      <rect x="3" y="3" width="50" height="12" rx="4" fill="#1a3f6b"/>

      {/* Header text */}
      <text x="28" y="10" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold" fontFamily="Arial">INCOME TAX DEPT</text>
      <text x="28" y="14" textAnchor="middle" fill="#aac4e8" fontSize="3" fontFamily="Arial">GOVT. OF INDIA</text>

      {/* Photo placeholder */}
      <rect x="6" y="18" width="14" height="17" rx="2" fill="#c8d8e8" stroke="#a0b4c8" strokeWidth="0.5"/>
      <circle cx="13" cy="23" r="4" fill="#8fa8c0"/>
      <ellipse cx="13" cy="32" rx="5" ry="3" fill="#8fa8c0"/>

      {/* Info lines */}
      <rect x="23" y="20" width="28" height="2" rx="1" fill="#666" fillOpacity="0.5"/>
      <rect x="23" y="25" width="22" height="2" rx="1" fill="#666" fillOpacity="0.4"/>
      <rect x="23" y="30" width="25" height="2" rx="1" fill="#666" fillOpacity="0.4"/>

      {/* PAN number area */}
      <rect x="6" y="39" width="44" height="8" rx="2" fill="#1a3f6b" fillOpacity="0.1" stroke="#1a3f6b" strokeOpacity="0.2" strokeWidth="0.5"/>
      <text x="28" y="45" textAnchor="middle" fill="#1a3f6b" fontSize="5.5" fontWeight="bold" fontFamily="monospace">ABCDE1234F</text>

      {/* PAN label */}
      <text x="6" y="53" fill="#666" fontSize="4" fontFamily="Arial">Permanent Account Number</text>
    </svg>
  </div>
);

const PassportIllustration = () => (
  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="passportBg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a2f6b"/>
          <stop offset="1" stopColor="#0d1f4a"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#f7d774"/>
          <stop offset="1" stopColor="#c9a227"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" fill="url(#passportBg)" rx="12"/>

      {/* Gold border lines */}
      <rect x="4" y="4" width="48" height="48" rx="8" stroke="#c9a227" strokeWidth="0.7" fill="none"/>
      <rect x="6" y="6" width="44" height="44" rx="6" stroke="#f7d774" strokeWidth="0.3" fill="none"/>

      {/* Emblem circle */}
      <circle cx="28" cy="24" r="11" fill="#c9a227" fillOpacity="0.15" stroke="#c9a227" strokeWidth="0.5"/>

      {/* Lion capital (simplified) */}
      {/* Base */}
      <rect x="22" y="31" width="12" height="1.5" rx="0.7" fill="#c9a227"/>
      {/* Central pillar */}
      <rect x="26" y="22" width="4" height="9" rx="1" fill="#c9a227" fillOpacity="0.8"/>
      {/* Lions heads (simplified with circles) */}
      <circle cx="24" cy="22" r="2.5" fill="#c9a227" fillOpacity="0.7"/>
      <circle cx="32" cy="22" r="2.5" fill="#c9a227" fillOpacity="0.7"/>
      {/* Wheel */}
      <circle cx="28" cy="30" r="2" stroke="#c9a227" strokeWidth="0.6" fill="none"/>
      <line x1="28" y1="28" x2="28" y2="32" stroke="#c9a227" strokeWidth="0.4"/>
      <line x1="26" y1="30" x2="30" y2="30" stroke="#c9a227" strokeWidth="0.4"/>

      {/* INDIA text */}
      <text x="28" y="41" textAnchor="middle" fill="#f7d774" fontSize="5.5" fontWeight="bold" fontFamily="Arial" letterSpacing="2">INDIA</text>

      {/* PASSPORT text */}
      <text x="28" y="50" textAnchor="middle" fill="#c9a227" fontSize="4" fontFamily="Arial" letterSpacing="1">PASSPORT</text>
    </svg>
  </div>
);

const ProfilePhotoIllustration = () => (
  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="profileBg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f9cf9"/>
          <stop offset="1" stopColor="#2563eb"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" fill="url(#profileBg)" rx="12"/>

      {/* Photo frame */}
      <rect x="8" y="6" width="40" height="44" rx="4" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.4" strokeWidth="0.7"/>

      {/* Person silhouette */}
      <circle cx="28" cy="22" r="8" fill="white" fillOpacity="0.9"/>
      <ellipse cx="28" cy="42" rx="13" ry="10" fill="white" fillOpacity="0.9"/>

      {/* Face lines */}
      <circle cx="28" cy="22" r="6" fill="#2563eb" fillOpacity="0.3"/>
      <circle cx="28" cy="44" rx="10" fill="#2563eb" fillOpacity="0.2"/>

      {/* Camera icon bottom right */}
      <rect x="38" y="38" width="14" height="14" rx="7" fill="white" fillOpacity="0.2"/>
      <circle cx="45" cy="45" r="3" stroke="white" strokeWidth="1.2" fill="none"/>
      <circle cx="45" cy="45" r="1.2" fill="white"/>
    </svg>
  </div>
);

const AttachmentIllustration = () => (
  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="attachBg" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1"/>
          <stop offset="1" stopColor="#4338ca"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" fill="url(#attachBg)" rx="12"/>

      {/* Document */}
      <rect x="12" y="8" width="26" height="34" rx="3" fill="white" fillOpacity="0.95"/>
      {/* Folded corner */}
      <path d="M32 8L38 14H32V8Z" fill="#e0e0e0"/>
      {/* Lines on document */}
      <rect x="16" y="20" width="16" height="1.5" rx="0.7" fill="#6366f1" fillOpacity="0.4"/>
      <rect x="16" y="24" width="18" height="1.5" rx="0.7" fill="#6366f1" fillOpacity="0.3"/>
      <rect x="16" y="28" width="14" height="1.5" rx="0.7" fill="#6366f1" fillOpacity="0.3"/>
      <rect x="16" y="32" width="17" height="1.5" rx="0.7" fill="#6366f1" fillOpacity="0.3"/>

      {/* Paperclip */}
      <path d="M36 16 Q45 16 45 26 Q45 38 33 38 Q22 38 22 28 Q22 20 30 20 Q38 20 38 27 Q38 34 32 34"
        stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* Plus badge */}
      <circle cx="44" cy="44" r="8" fill="white" fillOpacity="0.25"/>
      <line x1="44" y1="40" x2="44" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="44" x2="48" y2="44" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
);

const renderDocumentIcon = (docType) => {
  switch (docType) {
    case "aadhar_card":
      return <AadhaarCardIllustration />;
    case "pan_card":
      return <PANCardIllustration />;
    case "passport":
      return <PassportIllustration />;
    case "profile_image":
      return <ProfilePhotoIllustration />;
    case "attachment":
      return <AttachmentIllustration />;
    default:
      return (
        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
                        : "opacity-80 group-hover:opacity-100"
                    }`}
                  >
                    {renderDocumentIcon(docType.value)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-white transition-colors">
                      {docType.label}
                    </h3>
                    <p className="text-sm text-gray-400 group-hover:text-white/60 transition-colors mt-0.5">
                      {docType.description}
                    </p>
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
