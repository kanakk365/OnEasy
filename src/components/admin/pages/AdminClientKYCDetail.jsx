import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../utils/api";
import { uploadFileDirect, viewFile, downloadFile } from "../../../utils/s3Upload";

function AdminClientKYCDetail() {
  const navigate = useNavigate();
  const { userId, documentType } = useParams();
  const [clientInfo, setClientInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);

  const documentTypes = {
    aadhar_card: { 
      label: "Aadhaar Card", 
      description: "Upload Aadhaar card documents (Max 3 documents)"
    },
    pan_card: { 
      label: "PAN Card", 
      description: "Upload PAN card documents (Max 3 documents)"
    },
    passport: { 
      label: "Passport", 
      description: "Upload Passport documents (Max 3 documents)"
    },
    profile_image: { 
      label: "Profile Photo", 
      description: "Upload profile photos (Max 3 documents)"
    },
    signature: { 
      label: "Signature", 
      description: "Upload signature documents (Max 3 documents)"
    },
  };

  const docConfig = documentTypes[documentType] || { label: "Document", description: "" };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    if (message) {
      setTimeout(() => {
        setStatus((current) => (current.message === message ? { type: null, message: "" } : current));
      }, 4000);
    }
  };

  useEffect(() => {
    if (userId && documentType) {
      loadClientAndDocuments();
    }
  }, [userId, documentType]);

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

      // Fetch documents
      const response = await apiClient.get(`/users-page/personal-documents/${userId}`).catch(() => ({ 
        success: false, 
        data: {}
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

    if (file.size > 5 * 1024 * 1024) {
      showStatus("error", "File size must be less than 5MB");
      return;
    }

    if (documents.length >= 3) {
      showStatus("error", `Maximum 3 documents allowed for ${docConfig.label}`);
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      // Upload directly to S3
      const folder = `user-profiles/${userId}/personal`;
      const { s3Url } = await uploadFileDirect(
        file,
        folder,
        file.name
      );

      // Save S3 URL to database
      const response = await apiClient.post(`/users-page/upload-personal-document/${userId}`, {
        documentType: documentType,
        fileUrl: s3Url, // Use fileUrl instead of fileData
        fileName: file.name,
      });

      if (response.success) {
        await loadClientAndDocuments();
        showStatus("success", "Document uploaded successfully");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showStatus("error", error.message || "Failed to upload document. Please try again.");
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
      if (url && typeof url === 'string' && url.trim().length > 0) {
        // Use viewFile utility which handles S3 URLs, base64, and regular URLs
        await viewFile(url);
        return;
      }
      
      // Only try to get signed URL if we have a valid docId (numeric ID, not userId)
      if (docId && typeof docId === 'number' && docId > 0) {
        try {
          const response = await apiClient.get(`/users-page/personal-documents/${docId}/view-url`);
          if (response.success && response.data && response.data.signedUrl) {
            window.open(response.data.signedUrl, "_blank", "noopener,noreferrer");
            return;
          }
        } catch (apiError) {
          // If API call fails, fall back to direct URL if available
          console.warn('Failed to get signed URL, docId might be invalid:', docId);
        }
      }
      
      // Fallback: if we still have a URL, try to open it directly
      if (url && typeof url === 'string' && url.trim().length > 0) {
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
      if (url && typeof url === 'string' && url.trim().length > 0) {
        // Use downloadFile utility which handles S3 URLs and regular URLs
        await downloadFile(url, fileName);
        return;
      }
      
      // Only try to use API endpoint if we have a valid docId (numeric ID, not userId)
      if (docId && typeof docId === 'number' && docId > 0) {
        try {
          const apiBaseUrl = apiClient.baseURL || '';
          const token = apiClient.getToken();
          
          const response = await fetch(`${apiBaseUrl}/users-page/personal-documents/${docId}/download`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to download file");
          }

          const contentDisposition = response.headers.get('Content-Disposition');
          let downloadFileName = fileName || "document";
          
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (fileNameMatch && fileNameMatch[1]) {
              downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
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
          console.warn('Failed to download via API, docId might be invalid:', docId);
          if (url && typeof url === 'string' && url.trim().length > 0) {
            await downloadFile(url, fileName);
          } else {
            throw apiError;
          }
        }
      } else {
        // No valid docId, try URL if available
        if (url && typeof url === 'string' && url.trim().length > 0) {
          await downloadFile(url, fileName);
        } else {
          showStatus("error", "Document URL not available");
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      showStatus("error", error.message || "Failed to download document. Please try again.");
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const response = await apiClient.delete(`/users-page/personal-documents/${docId}/${userId}`);
      
      if (response.success) {
        await loadClientAndDocuments();
        showStatus("success", "Document deleted successfully");
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showStatus("error", error.message || "Failed to delete document. Please try again.");
    }
  };

  // Render icon component (same as KYC)
  const renderDocumentIcon = (docType) => {
    switch (docType) {
      case "aadhar_card":
        return (
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm border border-gray-200">
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
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex flex-col p-2.5">
              <div className="h-2 bg-white/30 rounded mb-1.5"></div>
              <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="h-1.5 bg-white/40 rounded"></div>
                <div className="h-1.5 bg-white/30 rounded w-4/5"></div>
                <div className="h-1 bg-white/25 rounded w-3/5"></div>
              </div>
              <div className="absolute bottom-1.5 left-1 right-1">
                <div className="text-[8px] font-bold text-white text-center tracking-wider">PAN</div>
              </div>
            </div>
          </div>
        );
      case "passport":
        return (
          <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex flex-col">
              <div className="h-2.5 bg-gradient-to-r from-yellow-400/40 to-yellow-500/40"></div>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/5">
                  <div className="w-7 h-7 rounded-full border border-white/50 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white/30"></div>
                  </div>
                </div>
                <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
              </div>
              <div className="h-2 bg-gradient-to-r from-yellow-400/30 to-yellow-500/30"></div>
            </div>
            <div className="absolute bottom-1 left-0 right-0">
              <div className="text-[6px] font-bold text-white/70 text-center tracking-widest">PASSPORT</div>
            </div>
          </div>
        );
      case "profile_image":
        return (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case "signature":
        return (
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12c2-3 4-4 6-3s2 2 1 4" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        );
      default:
        return null;
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/client-kyc/${userId}`)}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to KYC Documents
          </button>
          
          {clientInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-4 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{clientInfo.name || 'N/A'}</span>
                {clientInfo.email && <span className="text-gray-500"> • {clientInfo.email}</span>}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-1">{clientInfo.user_id}</p>
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6">
            <div className="flex items-center gap-4 mb-4">
              {renderDocumentIcon(documentType)}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{docConfig.label}</h1>
                <p className="text-gray-600 mt-1">{docConfig.description}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                documents.length >= 3 
                  ? "bg-red-100 text-red-800" 
                  : documents.length > 0 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {documents.length}/3
              </span>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
          
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, index) => (
                <div
                  key={doc.id || index}
                  className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-[#01334C] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
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
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDocument(doc.id, doc.url || doc.document_url)}
                        className="p-1.5 text-[#01334C] hover:bg-[#01334C] hover:text-white rounded-lg transition-colors"
                        title="View Document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc.id, doc.name || doc.document_name || "document", doc.url || doc.document_url)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-900 truncate" title={doc.name || doc.document_name || `Document ${index + 1}`}>
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
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-12 text-center">
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
              <p className="text-gray-500 text-sm">No documents uploaded yet</p>
              <p className="text-gray-400 text-xs mt-1">Upload your first document below</p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        {documents.length < 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#01334C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-[#01334C]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-base font-medium text-[#01334C]">Uploading...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6 text-[#01334C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-base font-medium text-[#01334C]">
                    {documents.length === 0 ? "Upload Document" : "Upload Another Document"}
                  </span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              PNG, JPG, PDF up to 5MB
            </p>
          </div>
        )}

        {documents.length >= 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              Maximum 3 documents reached for {docConfig.label}. Delete a document to upload a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClientKYCDetail;

