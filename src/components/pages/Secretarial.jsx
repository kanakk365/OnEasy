import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { uploadFileDirect, viewFile, downloadFile } from "../../utils/s3Upload";

function Secretarial() {
  const navigate = useNavigate();
  const { orgId, userId } = useParams();
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);
  const [navigationPath, setNavigationPath] = useState([]);

  const isAdmin = !!userId;
  const currentOrgId = orgId || location.state?.orgId;
  const userIdFromParams = userId || location.state?.userId;

  const navigateTo = (path) => {
    setNavigationPath(path);
  };

  const goToRoot = () => {
    setNavigationPath([]);
  };

  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    description: "",
    file: null
  });

  // Secretarial structure - can be customized
  const secretarialStructure = {
    board_meetings: {
      label: "Board Meetings",
      subCategories: {
        notices: "Notices",
        minutes: "Minutes",
        resolutions: "Resolutions",
        attendance: "Attendance Sheets"
      }
    },
    general_meetings: {
      label: "General Meetings",
      subCategories: {
        notices: "Notices",
        minutes: "Minutes",
        resolutions: "Resolutions",
        attendance: "Attendance Sheets"
      }
    },
    annual_filings: {
      label: "Annual Filings",
      subCategories: {
        mca_returns: "MCA Returns",
        annual_returns: "Annual Returns",
        financial_statements: "Financial Statements"
      }
    },
    compliance_documents: {
      label: "Compliance Documents",
      subCategories: {
        roc_filings: "ROC Filings",
        statutory_reports: "Statutory Reports",
        other_compliance: "Other Compliance"
      }
    }
  };

  useEffect(() => {
    if (currentOrgId) {
      loadOrganization();
      loadDocuments();
    }
  }, [currentOrgId, userIdFromParams]);

  const loadOrganization = async () => {
    try {
      let orgResponse;
      
      if (isAdmin && userIdFromParams) {
        orgResponse = await apiClient.get(`/users-page/user-data/${userIdFromParams}`).catch(() => ({
          success: false,
          data: { organisations: [] }
        }));
      } else {
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
      if (isAdmin && userIdFromParams) {
        currentUserId = userIdFromParams;
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

      let endpoint = `/users-page/secretarial-documents?organizationId=${currentOrgId}`;
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/secretarial-documents/${currentUserId}?organizationId=${currentOrgId}`;
      }

      const response = await apiClient.get(endpoint).catch(() => ({
        success: false,
        data: {}
      }));

      if (response.success && response.data) {
        setDocuments(response.data || {});
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

  const handleOpenUploadModal = () => {
    setFormData({
      category: "",
      subCategory: "",
      description: "",
      file: null
    });
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setFormData({
      category: "",
      subCategory: "",
      description: "",
      file: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category: e.target.value,
      subCategory: ""
    });
  };

  const handleSubCategoryChange = (e) => {
    setFormData({
      ...formData,
      subCategory: e.target.value
    });
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
    if (!formData.category || !formData.subCategory) {
      showStatus("error", "Please select category and sub-category");
      return;
    }

    if (!formData.file) {
      showStatus("error", "Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      let currentUserId;
      if (isAdmin && userIdFromParams) {
        currentUserId = userIdFromParams;
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
      const folder = `user-profiles/${currentUserId}/organizations/${currentOrgId}/business/secretarial/${formData.category}/${formData.subCategory}`;
      const { s3Url } = await uploadFileDirect(
        formData.file,
        folder,
        formData.file.name
      );

      let endpoint = "/users-page/upload-secretarial-document";
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/upload-secretarial-document/${currentUserId}`;
      }

      const response = await apiClient.post(endpoint, {
        category: formData.category,
        subCategory: formData.subCategory,
        fileUrl: s3Url,
        fileName: formData.file.name,
        organizationId: currentOrgId,
        description: formData.description.trim() || null
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

  const handleViewDocument = async (doc) => {
    const url = doc.document_url;
    if (url && typeof url === 'string' && url.trim().length > 0) {
      await viewFile(url);
    } else {
      showStatus("error", "Document URL not available");
    }
  };

  const handleDownloadDocument = async (doc) => {
    const url = doc.document_url;
    const fileName = doc.document_name || 'document';
    if (url && typeof url === 'string' && url.trim().length > 0) {
      await downloadFile(url, fileName);
    } else {
      showStatus("error", "Document URL not available");
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      let currentUserId;
      if (isAdmin && userIdFromParams) {
        currentUserId = userIdFromParams;
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

      let endpoint = `/users-page/secretarial-documents/${docId}?organizationId=${currentOrgId}`;
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/secretarial-documents/${docId}/${currentUserId}?organizationId=${currentOrgId}`;
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render root view
  const renderRootView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(secretarialStructure).map((categoryKey) => {
          const categoryData = secretarialStructure[categoryKey];
          const categoryDocs = documents[categoryKey] || {};
          const hasDocuments = Object.keys(categoryDocs).length > 0;
          
          return (
            <div
              key={categoryKey}
              onClick={() => navigateTo([categoryKey])}
              className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{categoryData.label}</h3>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {hasDocuments && (
                <p className="text-sm text-gray-500 mt-2">
                  {Object.keys(categoryDocs).length} {Object.keys(categoryDocs).length === 1 ? 'category' : 'categories'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render category view
  const renderCategoryView = (categoryKey) => {
    const categoryData = secretarialStructure[categoryKey];
    const categoryDocs = documents[categoryKey] || {};
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoryData.subCategories).map(([subCatKey, subCatLabel]) => {
          const subCatDocs = categoryDocs[subCatKey] || [];
          const hasDocs = Array.isArray(subCatDocs) && subCatDocs.length > 0;
          
          return (
            <div
              key={subCatKey}
              onClick={() => navigateTo([categoryKey, subCatKey])}
              className="bg-white rounded-lg shadow-sm border border-[#F3F3F3] p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-800">{subCatLabel}</h4>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {hasDocs && (
                <p className="text-xs text-gray-500 mt-2">
                  {subCatDocs.length} {subCatDocs.length === 1 ? 'document' : 'documents'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render documents view
  const renderDocumentsView = (docs) => {
    if (!Array.isArray(docs) || docs.length === 0) {
      return <p className="text-gray-500 text-sm">No documents uploaded yet</p>;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.document_name || 'Document'}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(doc.uploaded_at)}</p>
                {doc.description && (
                  <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleViewDocument(doc)}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                View
              </button>
              <button
                onClick={() => handleDownloadDocument(doc)}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Get current view based on navigation path
  const getCurrentView = () => {
    if (navigationPath.length === 0) {
      return renderRootView();
    } else if (navigationPath.length === 1) {
      return renderCategoryView(navigationPath[0]);
    } else if (navigationPath.length === 2) {
      const [categoryKey, subCatKey] = navigationPath;
      const categoryDocs = documents[categoryKey] || {};
      const docs = categoryDocs[subCatKey] || [];
      return renderDocumentsView(docs);
    }
    return renderRootView();
  };

  // Get breadcrumb path
  const getBreadcrumbPath = () => {
    const path = [];
    if (navigationPath.length > 0) {
      const categoryKey = navigationPath[0];
      const categoryData = secretarialStructure[categoryKey];
      path.push({ label: categoryData.label, onClick: goToRoot });
      
      if (navigationPath.length > 1) {
        const subCatKey = navigationPath[1];
        const subCatLabel = categoryData.subCategories[subCatKey];
        path.push({ label: subCatLabel, onClick: () => navigateTo([categoryKey]) });
      }
    }
    return path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Notification */}
        {status.message && (
          <div className="fixed inset-0 z-40 flex items-start justify-end pointer-events-none">
            <div className="mt-20 mr-6 w-full max-w-xs pointer-events-auto">
              <div
                className={`rounded-xl px-4 py-3 text-sm shadow-lg border flex items-start justify-between gap-3 animate-fade-in ${
                  status.type === "error"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-green-50 text-green-800 border-green-200"
                }`}
              >
                <p>{status.message}</p>
                <button
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
            onClick={() => {
              if (isAdmin && userIdFromParams) {
                navigate(`/admin/client-company-documents/${userIdFromParams}/${currentOrgId}/business`, { 
                  state: { orgId: currentOrgId, userId: userIdFromParams } 
                });
              } else {
                const orgIdFromState = location.state?.orgId || currentOrgId;
                if (orgIdFromState) {
                  navigate(`/company-documents/${orgIdFromState}/business`, { state: { orgId: orgIdFromState } });
                } else {
                  navigate("/organizations-list");
                }
              }
            }}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Business Documents
          </button>

          {organization && (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {organization.legalName !== '-' ? organization.legalName : organization.tradeName}
              </h1>
              {organization.tradeName !== '-' && organization.legalName !== '-' && organization.tradeName !== organization.legalName && (
                <p className="text-gray-600 mt-1">{organization.tradeName}</p>
              )}
              {organization.gstin !== '-' && (
                <p className="text-sm text-gray-500 mt-1 font-mono">GSTIN: {organization.gstin}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Secretarial Documents</h2>
            <button
              onClick={handleOpenUploadModal}
              className="px-4 py-2 text-sm font-medium text-white bg-[#01334C] rounded-md hover:bg-[#00486D] transition-colors"
            >
              + Upload Document
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {navigationPath.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <button
              onClick={goToRoot}
              className="text-[#01334C] hover:text-[#00486D] font-medium"
            >
              Secretarial
            </button>
            {getBreadcrumbPath().map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-gray-400">/</span>
                <button
                  onClick={item.onClick}
                  className="text-[#01334C] hover:text-[#00486D] font-medium"
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Main Content - Navigation Based */}
        <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6">
          {getCurrentView()}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Secretarial Document</h3>
                <button
                  onClick={handleCloseUploadModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(secretarialStructure).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                </div>

                {formData.category && secretarialStructure[formData.category]?.subCategories && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={handleSubCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    >
                      <option value="">Select Sub-Category</option>
                      {Object.entries(secretarialStructure[formData.category].subCategories).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    accept=".pdf,.xls,.xlsx,.csv,.txt,.doc,.docx,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                  />
                  {formData.file && (
                    <p className="text-xs text-gray-500 mt-1">{formData.file.name}</p>
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
                  disabled={uploading || !formData.file || !formData.category || !formData.subCategory}
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

export default Secretarial;

