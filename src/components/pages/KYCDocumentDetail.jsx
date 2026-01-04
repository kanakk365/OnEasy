import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { uploadFileDirect, viewFile, downloadFile } from "../../utils/s3Upload";
import { RiFileTextLine, RiUploadCloud2Line } from "react-icons/ri";
import { FiChevronLeft, FiEye, FiDownload, FiTrash2 } from "react-icons/fi";

function KYCDocumentDetail() {
  const navigate = useNavigate();
  const { documentType } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);

  const documentTypes = {
    aadhar_card: {
      label: "Aadhaar Card",
      description: "Upload your Aadhaar card documents (Max 3 documents)",
    },
    pan_card: {
      label: "PAN Card",
      description: "Upload your PAN card documents (Max 3 documents)",
    },
    passport: {
      label: "Passport",
      description: "Upload your Passport documents (Max 3 documents)",
    },
    profile_image: {
      label: "Profile Photo",
      description: "Upload your profile photos (Max 3 documents)",
    },
    signature: {
      label: "Signature",
      description: "Upload your signature documents (Max 3 documents)",
    },
  };

  const docConfig = documentTypes[documentType] || {
    label: "Document",
    description: "",
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    if (message) {
      setTimeout(() => {
        setStatus((current) =>
          current.message === message ? { type: null, message: "" } : current
        );
      }, 4000);
    }
  };

  useEffect(() => {
    if (documentType) {
      loadDocuments();
    }
  }, [documentType]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiClient
        .get("/users-page/personal-documents")
        .catch(() => ({
          success: false,
          data: {},
        }));

      if (response.success && response.data && response.data[documentType]) {
        setDocuments(response.data[documentType] || []);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showStatus("error", "File size must be less than 5MB");
      return;
    }

    // Check if already 3 documents uploaded
    if (documents.length >= 3) {
      showStatus("error", `Maximum 3 documents allowed for ${docConfig.label}`);
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      // Get user ID
      const storedUser = JSON.parse(
        localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
      );
      const userId = storedUser.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Upload directly to S3
      const folder = `user-profiles/${userId}/personal`;
      const { s3Url } = await uploadFileDirect(
        file,
        folder,
        file.name,
        (progress) => {
          // Progress tracking can be added here if needed
          console.log(`Upload progress: ${progress}%`);
        }
      );

      // Save S3 URL to database
      const response = await apiClient.post(
        "/users-page/upload-personal-document",
        {
          documentType: documentType,
          fileUrl: s3Url, // Use fileUrl instead of fileData
          fileName: file.name,
        }
      );

      if (response.success) {
        // Reload documents
        await loadDocuments();
        showStatus("success", "Document uploaded successfully");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showStatus(
        "error",
        error.message || "Failed to upload document. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = async (docId, url) => {
    if (!docId && !url) {
      showStatus("error", "Document not available");
      return;
    }

    try {
      // If we have a URL, use it directly (prefer this over docId to avoid 404s)
      if (url && typeof url === "string" && url.trim().length > 0) {
        // Use viewFile utility which handles S3 URLs, base64, and regular URLs
        await viewFile(url);
        return;
      }

      // Only try to get signed URL if we have a valid docId (numeric ID, not userId)
      if (docId && typeof docId === "number" && docId > 0) {
        try {
          const response = await apiClient.get(
            `/users-page/personal-documents/${docId}/view-url`
          );
          if (response.success && response.data && response.data.signedUrl) {
            window.open(
              response.data.signedUrl,
              "_blank",
              "noopener,noreferrer"
            );
            return;
          }
        } catch {
          // If API call fails, fall back to direct URL if available
          console.warn(
            "Failed to get signed URL, docId might be invalid:",
            docId
          );
        }
      }

      // Fallback: if we still have a URL, try to open it directly
      if (url && typeof url === "string" && url.trim().length > 0) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        showStatus("error", "Document URL not available");
      }
    } catch (error) {
      console.error("View error:", error);
      showStatus("error", "Failed to open document. Please try again.");
    }
  };

  const handleDownloadDocument = async (docId, fileName, url) => {
    if (!docId && !url) {
      showStatus("error", "Document not available");
      return;
    }

    try {
      // If we have a URL, use it directly (prefer this over docId to avoid 404s)
      if (url && typeof url === "string" && url.trim().length > 0) {
        // Use downloadFile utility which handles S3 URLs and regular URLs
        await downloadFile(url, fileName);
        return;
      }

      // Only try to use API endpoint if we have a valid docId (numeric ID, not userId)
      if (docId && typeof docId === "number" && docId > 0) {
        try {
          // Use backend endpoint that streams the file directly (avoids CORS)
          const apiBaseUrl = apiClient.baseURL || "";
          const token = apiClient.getToken();

          const response = await fetch(
            `${apiBaseUrl}/users-page/personal-documents/${docId}/download`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to download file");
          }

          // Get filename from Content-Disposition header or use provided name
          const contentDisposition = response.headers.get(
            "Content-Disposition"
          );
          let downloadFileName = fileName || "document";

          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
            );
            if (fileNameMatch && fileNameMatch[1]) {
              downloadFileName = fileNameMatch[1].replace(/['"]/g, "");
              // Decode URI component if needed
              try {
                downloadFileName = decodeURIComponent(downloadFileName);
              } catch {
                // Keep original if decode fails
              }
            }
          }

          // Get blob from response
          const blob = await response.blob();

          // Create a temporary URL for the blob
          const blobUrl = window.URL.createObjectURL(blob);

          // Create a temporary anchor element and trigger download
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = downloadFileName;
          document.body.appendChild(link);
          link.click();

          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } catch (apiError) {
          // If API call fails, fall back to direct URL if available
          console.warn(
            "Failed to download via API, docId might be invalid:",
            docId
          );
          if (url && typeof url === "string" && url.trim().length > 0) {
            await downloadFile(url, fileName);
          } else {
            throw apiError;
          }
        }
      } else {
        // No valid docId, try URL if available
        if (url && typeof url === "string" && url.trim().length > 0) {
          await downloadFile(url, fileName);
        } else {
          showStatus("error", "Document URL not available");
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      showStatus(
        "error",
        error.message || "Failed to download document. Please try again."
      );
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const response = await apiClient.delete(
        `/users-page/personal-documents/${docId}`
      );

      if (response.success) {
        await loadDocuments();
        showStatus("success", "Document deleted successfully");
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showStatus(
        "error",
        error.message || "Failed to delete document. Please try again."
      );
    }
  };

  // Render icon component for document type
  const renderDocumentIcon = (docType) => {
    switch (docType) {
      case "aadhar_card":
        // Aadhaar logo - refined tricolor with chakra
        return (
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm border border-gray-200">
            {/* Tricolor stripes - more refined */}
            <div className="absolute inset-0 flex flex-col">
              <div className="h-1/3 bg-[#FF9933]"></div>
              <div className="h-1/3 bg-white flex items-center justify-center relative">
                {/* Ashoka Chakra */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
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
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex flex-col p-2.5">
              {/* Card header */}
              <div className="h-2 bg-white/30 rounded mb-1.5"></div>
              {/* Card body lines */}
              <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="h-1.5 bg-white/40 rounded"></div>
                <div className="h-1.5 bg-white/30 rounded w-4/5"></div>
                <div className="h-1 bg-white/25 rounded w-3/5"></div>
              </div>
              {/* PAN text */}
              <div className="absolute bottom-1.5 left-1 right-1">
                <div className="text-[8px] font-bold text-white text-center tracking-wider">
                  PAN
                </div>
              </div>
            </div>
          </div>
        );
      case "passport":
        // Passport - more realistic book design
        return (
          <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex flex-col">
              {/* Top gold stripe */}
              <div className="h-2.5 bg-gradient-to-r from-yellow-400/40 to-yellow-500/40"></div>
              {/* Center section with emblem */}
              <div className="flex-1 flex items-center justify-center relative">
                {/* Emblem circle */}
                <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/5">
                  <div className="w-7 h-7 rounded-full border border-white/50 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white/30"></div>
                  </div>
                </div>
                {/* Small stars */}
                <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
              </div>
              {/* Bottom gold stripe */}
              <div className="h-2 bg-gradient-to-r from-yellow-400/30 to-yellow-500/30"></div>
            </div>
            {/* PASSPORT text */}
            <div className="absolute bottom-1 left-0 right-0">
              <div className="text-[6px] font-bold text-white/70 text-center tracking-widest">
                PASSPORT
              </div>
            </div>
          </div>
        );
      case "profile_image":
        // Profile Photo - modern user icon
        return (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="w-10 h-10 text-white"
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
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="w-10 h-10 text-amber-700"
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
        {status.message && (
          <div className="fixed inset-0 z-40 flex items-start justify-end pointer-events-none">
            <div className="mt-20 mr-6 w-full max-w-xs pointer-events-auto">
              <div
                className={`rounded-xl px-4 py-3 text-sm shadow-lg border flex items-start justify-between gap-3 ${
                  status.type === "error"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-green-50 text-green-800 border-green-200"
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {status.type === "error" ? "Error" : "Success"}
                  </p>
                  <p className="mt-1 text-xs">{status.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus({ type: null, message: "" })}
                  className="ml-2 text-xs font-semibold opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={() => navigate("/kyc")}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{docConfig.label}</h1>
          </div>
          <div className="ml-9 flex items-center justify-between">
            <p className="text-gray-500 italic">
              {docConfig.description}
            </p>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                documents.length >= 3 
                  ? "bg-red-50 text-red-600" 
                  : documents.length > 0 
                  ? "bg-blue-50 text-[#00486D]" 
                  : "bg-gray-100 text-gray-600"
              }`}>
                {documents.length}/3 Uploaded
            </span>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="mb-8">
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, index) => (
                <div
                  key={doc.id || index}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between group hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 bg-[#00486D] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                       <RiFileTextLine className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate" title={doc.name || doc.document_name || `Document ${index + 1}`}>
                        {doc.name || doc.document_name || `Document ${index + 1}`}
                      </p>
                      {doc.uploadedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleViewDocument(doc.id, doc.url || doc.document_url)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <FiEye className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc.id, doc.name || doc.document_name || "document", doc.url || doc.document_url)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <FiDownload className="w-4 h-4" /> Download
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="flex-none p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RiFileTextLine className="w-8 h-8 text-gray-400" />
               </div>
               <p className="text-gray-500 font-medium">No documents uploaded yet</p>
               <p className="text-gray-400 text-sm mt-1">Upload your {docConfig.label} to get started</p>
             </div>
          )}
        </div>

        {/* Upload Section */}
        {documents.length < 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Document</h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              className="hidden"
              disabled={uploading}
            />
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                uploading 
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed" 
                  : "border-blue-200 hover:border-[#00486D] hover:bg-blue-50/30"
              }`}
            >
              {uploading ? (
                 <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D] mb-3"></div>
                    <p className="text-[#00486D] font-medium">Uploading your document...</p>
                 </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-[#00486D] mb-4">
                    <RiUploadCloud2Line className="w-7 h-7" />
                  </div>
                  <p className="text-gray-900 font-medium text-lg mb-1">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">SVG, PNG, JPG or PDF (max. 5MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {documents.length >= 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-center gap-2">
            <span className="text-yellow-600 font-medium">ⓘ</span>
            <p className="text-sm text-yellow-800 font-medium">
              Maximum limit reached. Remove a document to upload a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KYCDocumentDetail;
