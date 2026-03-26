import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { uploadFileDirect, viewFile, downloadFile } from "../../utils/s3Upload";
import { RiUploadCloud2Line } from "react-icons/ri";
import { FiChevronLeft, FiEye, FiDownload, FiTrash2 } from "react-icons/fi";

const renderStatementIcon = (type) => {
  if (type === "bank_statement") {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 bg-gradient-to-br from-[#065F46] to-[#10B981] rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
};

function ClientData() {
  const navigate = useNavigate();
  const { orgId, userId } = useParams(); // userId for admin, orgId for both
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [bankStatements, setBankStatements] = useState([]);
  const [loanStatements, setLoanStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'bank_statement' or 'loan_statement'
  const [status, setStatus] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);

  // Determine if this is admin view
  // Check both params and location state for userId (in case it's passed via state)
  const userIdFromParams = userId || location.state?.userId;
  const isAdmin = !!userIdFromParams;
  const currentOrgId = orgId || location.state?.orgId;

  // Debug logging
  useEffect(() => {
    console.log('ClientData - userId from params:', userId);
    console.log('ClientData - userId from state:', location.state?.userId);
    console.log('ClientData - orgId:', orgId);
    console.log('ClientData - isAdmin:', isAdmin);
    console.log('ClientData - current URL:', window.location.pathname);
  }, [userId, location.state, orgId, isAdmin]);

  const [formData, setFormData] = useState({
    bankName: "",
    periodFrom: "",
    periodTo: "",
    file: null
  });

  useEffect(() => {
    if (currentOrgId) {
      loadOrganization();
      loadDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrgId, userId]);

  const loadOrganization = async () => {
    try {
      let orgResponse;
      const effectiveUserId = userIdFromParams || location.state?.userId;

      if (isAdmin && effectiveUserId) {
        // Admin view - fetch organization by userId and orgId
        orgResponse = await apiClient.get(`/users-page/user-data/${effectiveUserId}`).catch(() => ({
          success: false,
          data: { organisations: [] }
        }));
      } else {
        // User view
        orgResponse = await getUsersPageData();
      }

      if (orgResponse.success && orgResponse.data && orgResponse.data.organisations) {
        const org = orgResponse.data.organisations.find(o => o.id === parseInt(currentOrgId));
        if (org) {
          setOrganization({
            id: org.id,
            legalName: org.legal_name || '-',
            tradeName: org.trade_name || '-',
            gstin: org.gstin || '-'
          });
        }
      }
    } catch (error) {
      console.error("Error loading organization:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);

      let currentUserId;
      const effectiveUserId = userIdFromParams || location.state?.userId;
      if (isAdmin && effectiveUserId) {
        currentUserId = effectiveUserId;
      } else {
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
        );
        currentUserId = storedUser.id;
      }

      if (!currentUserId || !currentOrgId) {
        setLoading(false);
        return;
      }

      // Use endpoint with userId in path for admin, regular endpoint for user
      let endpoint = `/users-page/client-data-documents?organizationId=${currentOrgId}`;
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/client-data-documents/${currentUserId}?organizationId=${currentOrgId}`;
      }

      const response = await apiClient.get(endpoint).catch(() => ({
        success: false,
        data: {
          bank_statement: [],
          loan_statement: []
        }
      }));

      if (response.success && response.data) {
        setBankStatements(response.data.bank_statement || []);
        setLoanStatements(response.data.loan_statement || []);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    if (message) {
      setTimeout(() => {
        setStatus((current) => (current.message === message ? { type: null, message: "" } : current));
      }, 4000);
    }
  };

  const handleOpenUploadModal = (type) => {
    setUploadType(type);
    setFormData({
      bankName: "",
      periodFrom: "",
      periodTo: "",
      file: null
    });
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadType(null);
    setFormData({
      bankName: "",
      periodFrom: "",
      periodTo: "",
      file: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showStatus("error", "File size must be less than 10MB");
      return;
    }

    setFormData(prev => ({ ...prev, file }));
  };

  const handleUpload = async () => {
    if (!formData.bankName.trim()) {
      showStatus("error", "Bank name is required");
      return;
    }

    if (!formData.periodFrom || !formData.periodTo) {
      showStatus("error", "Please select both start and end dates");
      return;
    }

    if (new Date(formData.periodFrom) > new Date(formData.periodTo)) {
      showStatus("error", "Start date cannot be after end date");
      return;
    }

    if (!formData.file) {
      showStatus("error", "Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      let currentUserId;
      const effectiveUserId = userIdFromParams || location.state?.userId;
      if (isAdmin && effectiveUserId) {
        currentUserId = effectiveUserId;
      } else {
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
        );
        currentUserId = storedUser.id;
      }

      if (!currentUserId || !currentOrgId) {
        showStatus("error", "User ID or Organization ID not found");
        return;
      }

      // Upload directly to S3
      const folder = `user-profiles/${currentUserId}/organizations/${currentOrgId}/business/client-data`;
      const { s3Url } = await uploadFileDirect(
        formData.file,
        folder,
        formData.file.name
      );

      // Save S3 URL to database
      // Use endpoint with userId in path for admin, regular endpoint for user
      let endpoint = "/users-page/upload-client-data-document";
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/upload-client-data-document/${currentUserId}`;
      }

      const response = await apiClient.post(endpoint, {
        documentType: uploadType,
        fileUrl: s3Url, // Use fileUrl instead of fileData
        fileName: formData.file.name,
        organizationId: currentOrgId,
        bankName: formData.bankName.trim(),
        periodFrom: formData.periodFrom,
        periodTo: formData.periodTo
      });

      if (response.success) {
        await loadDocuments();
        showStatus("success", "Document uploaded successfully!");
        handleCloseUploadModal();
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
          if (!currentOrgId) {
            showStatus("error", "Organization ID is required to view document.");
            return;
          }
          let endpoint = `/users-page/client-data-documents/${docId}/view-url?organizationId=${currentOrgId}`;
          if (isAdmin && userId) {
            endpoint = `/users-page/client-data-documents/${docId}/view-url/${userId}?organizationId=${currentOrgId}`;
          }
          const response = await apiClient.get(endpoint);
          if (response.success && response.data && response.data.signedUrl) {
            window.open(response.data.signedUrl, "_blank", "noopener,noreferrer");
            return;
          }
        } catch {
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
          if (!currentOrgId) {
            showStatus("error", "Organization ID is required to download document.");
            return;
          }
          const apiBaseUrl = apiClient.baseURL || '';
          const token = apiClient.getToken();
          let endpoint = `${apiBaseUrl}/users-page/client-data-documents/${docId}/download?organizationId=${currentOrgId}`;
          if (isAdmin && userId) {
            endpoint = `${apiBaseUrl}/users-page/client-data-documents/${docId}/download/${userId}?organizationId=${currentOrgId}`;
          }
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
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

          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = downloadFileName;
          document.body.appendChild(link);
          link.click();
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
      if (!currentOrgId) {
        showStatus("error", "Organization ID is required for deletion.");
        return;
      }
      let endpoint = `/users-page/client-data-documents/${docId}?organizationId=${currentOrgId}`;
      if (isAdmin && userId) {
        endpoint = `/users-page/client-data-documents/${docId}/${userId}?organizationId=${currentOrgId}`;
      }
      const response = await apiClient.delete(endpoint);
      if (response.success) {
        await loadDocuments();
        showStatus("success", "Document deleted successfully!");
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showStatus("error", error.message || "Failed to delete document. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const totalDocs = bankStatements.length + loanStatements.length;

  if (loading) {
    return (
      <div className="min-h-screen pt-16 lg:pt-0 bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022B51] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-12">
        {/* Toast Notification */}
        {status.message && (
          <div className="fixed inset-0 z-[60] flex items-start justify-end pointer-events-none">
            <div className="mt-20 mr-6 w-full max-w-xs pointer-events-auto">
              <div
                className={`rounded-xl px-4 py-3 text-sm shadow-lg border flex items-start justify-between gap-3 ${status.type === "error"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-green-50 text-green-800 border-green-200"
                  }`}
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {status.type === "error" ? "Something went wrong" : "Success"}
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

        {/* Header - matching KYCDocumentDetail layout */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                const effectiveUserId = userIdFromParams || location.state?.userId;
                const effectiveOrgId = currentOrgId || location.state?.orgId;

                console.log('Back button clicked - isAdmin:', isAdmin, 'userId:', effectiveUserId, 'orgId:', effectiveOrgId);

                if (isAdmin && effectiveUserId && effectiveOrgId) {
                  navigate(`/admin/client-company-documents/${effectiveUserId}/${effectiveOrgId}/business/company-master-data`, {
                    state: { orgId: effectiveOrgId, userId: effectiveUserId }
                  });
                } else {
                  const orgIdFromState = location.state?.orgId || currentOrgId;
                  if (orgIdFromState) {
                    navigate(`/company-documents/${orgIdFromState}/business/company-master-data`, { state: { orgId: orgIdFromState } });
                  } else {
                    navigate("/organizations-list");
                  }
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Client Data</h1>
          </div>
          <div className="ml-9 flex items-center justify-between">
            <p className="text-gray-500 italic">Upload and manage bank & loan statements</p>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                totalDocs > 0
                  ? "bg-blue-50 text-[#022B51]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {totalDocs} {totalDocs === 1 ? "Document" : "Documents"}
            </span>
          </div>
        </div>

        {/* Bank Statements Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Bank Statements</h2>
            <button
              onClick={() => handleOpenUploadModal('bank_statement')}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}
            >
              + Upload Bank Statement
            </button>
          </div>
          {bankStatements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankStatements.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between group hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-3">
                    {renderStatementIcon("bank_statement")}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate" title={doc.bank_name}>
                        {doc.bank_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(doc.period_from)} - {formatDate(doc.period_to)}
                      </p>
                      {doc.document_name && (
                        <p className="text-xs text-gray-400 mt-1 truncate" title={doc.document_name}>{doc.document_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleViewDocument(doc.id, doc.document_url || doc.url)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <FiEye className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc.id, doc.document_name, doc.document_url || doc.url)}
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
              <div className="mx-auto mb-4 flex justify-center">
                {renderStatementIcon("bank_statement")}
              </div>
              <p className="text-gray-500 font-medium">No bank statements uploaded yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your bank statements to get started</p>
            </div>
          )}
        </div>

        {/* Loan Statements Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Loan Statements</h2>
            <button
              onClick={() => handleOpenUploadModal('loan_statement')}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ background: 'linear-gradient(160.12deg, #065F46 13.28%, #10B981 109.67%)' }}
            >
              + Upload Loan Statement
            </button>
          </div>
          {loanStatements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loanStatements.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between group hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-3">
                    {renderStatementIcon("loan_statement")}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate" title={doc.bank_name}>
                        {doc.bank_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(doc.period_from)} - {formatDate(doc.period_to)}
                      </p>
                      {doc.document_name && (
                        <p className="text-xs text-gray-400 mt-1 truncate" title={doc.document_name}>{doc.document_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleViewDocument(doc.id, doc.document_url || doc.url)}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <FiEye className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc.id, doc.document_name, doc.document_url || doc.url)}
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
              <div className="mx-auto mb-4 flex justify-center">
                {renderStatementIcon("loan_statement")}
              </div>
              <p className="text-gray-500 font-medium">No loan statements uploaded yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your loan statements to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
          <style>{`
            /* Make native date picker calendar bigger */
            input[type="date"]::-webkit-calendar-picker-indicator {
              cursor: pointer;
              width: 24px;
              height: 24px;
            }
            input[type="date"]::-webkit-datetime-edit {
              font-size: 16px;
              padding: 4px 0;
            }
          `}</style>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Upload {uploadType === 'bank_statement' ? 'Bank' : 'Loan'} Statement
              </h3>
              <button
                onClick={handleCloseUploadModal}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent"
                  placeholder="Enter bank name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.periodFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, periodFrom: e.target.value }))}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent"
                    max={formData.periodTo || undefined}
                    style={{ fontSize: '16px', minHeight: '48px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.periodTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, periodTo: e.target.value }))}
                    className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent"
                    min={formData.periodFrom || undefined}
                    style={{ fontSize: '16px', minHeight: '48px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3 sm:p-6 text-center cursor-pointer transition-all duration-200 ${
                    uploading
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                      : formData.file
                      ? "border-green-300 bg-green-50/30"
                      : "border-blue-200 hover:border-[#022B51] hover:bg-blue-50/30"
                  }`}
                >
                  {formData.file ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-900 font-medium text-sm">{formData.file.name}</p>
                      <p className="text-gray-500 text-xs mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#022B51] mb-3">
                        <RiUploadCloud2Line className="w-6 h-6" />
                      </div>
                      <p className="text-gray-900 font-medium text-sm mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-500 text-xs">
                        PDF, JPG, JPEG or PNG (max. 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCloseUploadModal}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-3 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientData;
