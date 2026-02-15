import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { uploadFileDirect, viewFile, downloadFile } from "../../utils/s3Upload";

function Accounting() {
  const navigate = useNavigate();
  const { orgId, userId } = useParams(); // userId for admin, orgId for both
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [tallyData, setTallyData] = useState([]);
  const [workings, setWorkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'tally_data' or 'workings'
  const [status, setStatus] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    description: "",
    file: null,
  });

  // Determine if this is admin view
  const isAdmin = !!userId;
  const currentOrgId = orgId;

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
      if (isAdmin) {
        // Admin view - fetch organization by userId and orgId
        orgResponse = await apiClient
          .get(`/users-page/user-data/${userId}`)
          .catch(() => ({
            success: false,
            data: { organisations: [] },
          }));
      } else {
        // User view
        orgResponse = await getUsersPageData();
      }

      if (
        orgResponse.success &&
        orgResponse.data &&
        orgResponse.data.organisations
      ) {
        const org = orgResponse.data.organisations.find(
          (o) => o.id === parseInt(currentOrgId),
        );
        if (org) {
          setOrganization({
            id: org.id,
            legalName: org.legal_name || "-",
            tradeName: org.trade_name || "-",
            gstin: org.gstin || "-",
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

      if (isAdmin) {
        currentUserId = userId;
      } else {
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}",
        );
        currentUserId = storedUser.id;
      }

      if (!currentUserId || !currentOrgId) {
        setLoading(false);
        return;
      }

      const endpoint = isAdmin
        ? `/users-page/accounting-documents/${currentUserId}?organizationId=${currentOrgId}`
        : `/users-page/accounting-documents?organizationId=${currentOrgId}`;

      const response = await apiClient.get(endpoint).catch(() => ({
        success: false,
        data: {
          tally_data: [],
          workings: [],
        },
      }));

      if (response.success && response.data) {
        setTallyData(response.data.tally_data || []);
        setWorkings(response.data.workings || []);
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
        setStatus((current) =>
          current.message === message ? { type: null, message: "" } : current,
        );
      }, 4000);
    }
  };

  const handleOpenUploadModal = (type) => {
    setUploadType(type);
    setFormData({
      description: "",
      file: null,
    });
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadType(null);
    setFormData({
      description: "",
      file: null,
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

    setFormData((prev) => ({ ...prev, file }));
  };

  const handleUpload = async () => {
    if (!formData.file) {
      showStatus("error", "Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      let currentUserId;

      if (isAdmin) {
        currentUserId = userId;
      } else {
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}",
        );
        currentUserId = storedUser.id;
      }

      if (!currentUserId || !currentOrgId) {
        showStatus("error", "User ID or Organization ID not found");
        return;
      }

      // Upload directly to S3
      const folder = `user-profiles/${currentUserId}/organizations/${currentOrgId}/business/accounting`;
      const { s3Url } = await uploadFileDirect(
        formData.file,
        folder,
        formData.file.name,
      );

      // Save S3 URL to database
      const endpoint = isAdmin
        ? `/users-page/upload-accounting-document/${currentUserId}`
        : "/users-page/upload-accounting-document";

      const response = await apiClient.post(endpoint, {
        documentType: uploadType,
        fileUrl: s3Url,
        fileName: formData.file.name,
        organizationId: currentOrgId,
        description: formData.description.trim() || null,
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
      showStatus(
        "error",
        error.message || "Failed to upload document. Please try again.",
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
          if (!currentOrgId) {
            showStatus(
              "error",
              "Organization ID is required to view document.",
            );
            return;
          }
          const endpoint = isAdmin
            ? `/users-page/accounting-documents/${docId}/view-url/${userId}?organizationId=${currentOrgId}`
            : `/users-page/accounting-documents/${docId}/view-url?organizationId=${currentOrgId}`;
          const response = await apiClient.get(endpoint);
          if (response.success && response.data && response.data.signedUrl) {
            window.open(
              response.data.signedUrl,
              "_blank",
              "noopener,noreferrer",
            );
            return;
          }
        } catch {
          // If API call fails, fall back to direct URL if available
          console.warn(
            "Failed to get signed URL, docId might be invalid:",
            docId,
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
          if (!currentOrgId) {
            showStatus(
              "error",
              "Organization ID is required to download document.",
            );
            return;
          }
          const apiBaseUrl = apiClient.baseURL || "";
          const token = apiClient.getToken();
          const endpoint = isAdmin
            ? `${apiBaseUrl}/users-page/accounting-documents/${docId}/download/${userId}?organizationId=${currentOrgId}`
            : `${apiBaseUrl}/users-page/accounting-documents/${docId}/download?organizationId=${currentOrgId}`;

          const response = await fetch(endpoint, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to download file");
          }

          const contentDisposition = response.headers.get(
            "Content-Disposition",
          );
          let downloadFileName = fileName || "document";
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
            );
            if (fileNameMatch && fileNameMatch[1]) {
              downloadFileName = fileNameMatch[1].replace(/['"]/g, "");
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
          console.warn(
            "Failed to download via API, docId might be invalid:",
            docId,
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
        error.message || "Failed to download document. Please try again.",
      );
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      let currentUserId;

      if (isAdmin) {
        currentUserId = userId;
      } else {
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}",
        );
        currentUserId = storedUser.id;
      }

      if (!currentUserId || !currentOrgId) {
        showStatus("error", "User ID or Organization ID not found");
        return;
      }

      const endpoint = isAdmin
        ? `/users-page/accounting-documents/${docId}/${currentUserId}?organizationId=${currentOrgId}`
        : `/users-page/accounting-documents/${docId}?organizationId=${currentOrgId}`;

      const response = await apiClient.delete(endpoint);

      if (response.success) {
        await loadDocuments();
        showStatus("success", "Document deleted successfully!");
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showStatus(
        "error",
        error.message || "Failed to delete document. Please try again.",
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
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

  const getBackPath = () => {
    if (isAdmin) {
      return `/admin/client-company-documents/${userId}/${currentOrgId}`;
    } else {
      const orgIdFromState = location.state?.orgId || currentOrgId;
      return `/company-documents/${orgIdFromState}/business/company-master-data`;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(getBackPath())}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to {isAdmin ? "Company Documents" : "Company Master Data"}
          </button>

          {organization && (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {organization.legalName !== "-"
                  ? organization.legalName
                  : organization.tradeName}
              </h1>
              {organization.tradeName !== "-" &&
                organization.legalName !== "-" &&
                organization.tradeName !== organization.legalName && (
                  <p className="text-gray-600 mt-1">{organization.tradeName}</p>
                )}
              {organization.gstin !== "-" && (
                <p className="text-sm text-gray-500 mt-1 font-mono">
                  GSTIN: {organization.gstin}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Accounting</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenUploadModal("tally_data")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Upload Tally Data
              </button>
              <button
                onClick={() => handleOpenUploadModal("workings")}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                + Upload Workings
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {status.message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              status.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Tally Data Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tally Data
          </h3>
          {tallyData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tallyData.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {doc.document_name || "Tally Data"}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.description}
                        </p>
                      )}
                      {doc.uploaded_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Uploaded: {formatDate(doc.uploaded_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        handleViewDocument(doc.id, doc.document_url || doc.url)
                      }
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-[#01334C] border border-[#01334C] rounded-md hover:bg-[#01334C] hover:text-white transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadDocument(
                          doc.id,
                          doc.document_name,
                          doc.document_url || doc.url,
                        )
                      }
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-600 hover:text-white transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
              <p className="text-gray-500 text-sm">
                No tally data uploaded yet
              </p>
            </div>
          )}
        </div>

        {/* Workings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workings</h3>
          {workings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workings.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {doc.document_name || "Workings"}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.description}
                        </p>
                      )}
                      {doc.uploaded_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Uploaded: {formatDate(doc.uploaded_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        handleViewDocument(doc.id, doc.document_url || doc.url)
                      }
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-[#01334C] border border-[#01334C] rounded-md hover:bg-[#01334C] hover:text-white transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadDocument(
                          doc.id,
                          doc.document_name,
                          doc.document_url || doc.url,
                        )
                      }
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-600 hover:text-white transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
              <p className="text-gray-500 text-sm">No workings uploaded yet</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload{" "}
                  {uploadType === "tally_data" ? "Tally Data" : "Workings"}
                </h3>
                <button
                  onClick={handleCloseUploadModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.xls,.xlsx,.csv,.txt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                  />
                  {formData.file && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.file.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCloseUploadModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !formData.file}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#01334C] rounded-md hover:bg-[#00486D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Accounting;
