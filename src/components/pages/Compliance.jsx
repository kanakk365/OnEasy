import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { uploadFileDirect, viewFile, downloadFile } from "../../utils/s3Upload";

function Compliance() {
  const navigate = useNavigate();
  const { orgId, userId } = useParams(); // userId for admin, orgId for both
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);

  // Determine if this is admin view
  const isAdmin = !!userId;
  const currentOrgId = orgId || location.state?.orgId;
  const userIdFromParams = userId || location.state?.userId;

  // Form state for upload
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    subSubCategory: "",
    description: "",
    file: null,
  });

  // Compliance structure based on the diagram
  const complianceStructure = {
    gst: {
      label: "GST",
      subCategories: {
        gst_returns: "GST Returns",
        gstr_2a: "GSTR-2A",
        gtr_2b: "GTR-2B",
        gst_working_excel: "GST Working Excel",
      },
    },
    tds: {
      label: "TDS",
      subCategories: {
        q1: {
          label: "Q1",
          subSubCategories: {
            challans: "Challans",
            other_client_data: "Any other client data",
          },
        },
        q2: {
          label: "Q2",
          subSubCategories: {
            challans: "Challans",
            other_client_data: "Any other client data",
          },
        },
        q3: {
          label: "Q3",
          subSubCategories: {
            challans: "Challans",
            other_client_data: "Any other client data",
          },
        },
        q4: {
          label: "Q4",
          subSubCategories: {
            challans: "Challans",
            other_client_data: "Any other client data",
          },
        },
        tds_working_excel: "TDS Working Excel",
      },
    },
    pf: {
      label: "PF",
      subCategories: {
        pf_returns: "PF Returns",
        pf_challans: "PF Challans",
      },
    },
    payroll: {
      label: "Payroll",
      subCategories: {
        pay_month: {
          label: "Pay Month",
          subSubCategories: {
            salary_workings: "Salary Workings",
          },
        },
      },
    },
    pt: {
      label: "PT",
      subCategories: {
        pt_returns: "PT Returns",
        pt_challans: "PT Challans",
      },
    },
    income_tax: {
      label: "Income Tax",
      subCategories: {
        tax_audit: {
          label: "Tax Audit",
          subSubCategories: {
            all_from_non_audit: "All from Non Audit",
            form_3cb_ca_3cd: "Form 3cb/ca & 3cd",
            workings_if_any: "Workings if any",
          },
        },
        non_audit: {
          label: "Non Audit",
          subSubCategories: {
            itr: "ITR",
            form_26as: "form 26AS",
            computation: "Computation",
            ais_tis: "AIS/TIS",
            other_docs_if_any: "Other docs if any",
          },
        },
      },
    },
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
        orgResponse = await apiClient
          .get(`/users-page/user-data/${userIdFromParams}`)
          .catch(() => ({
            success: false,
            data: { organisations: [] },
          }));
      } else {
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
      if (isAdmin && userIdFromParams) {
        currentUserId = userIdFromParams;
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

      let endpoint = `/users-page/compliance-documents?organizationId=${currentOrgId}`;
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/compliance-documents/${currentUserId}?organizationId=${currentOrgId}`;
      }

      const response = await apiClient.get(endpoint).catch(() => ({
        success: false,
        data: {},
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
        setStatus((current) =>
          current.message === message ? { type: null, message: "" } : current,
        );
      }, 4000);
    }
  };

  const handleOpenUploadModal = () => {
    setFormData({
      category: "",
      subCategory: "",
      subSubCategory: "",
      description: "",
      file: null,
    });
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setFormData({
      category: "",
      subCategory: "",
      subSubCategory: "",
      description: "",
      file: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData({
      ...formData,
      category,
      subCategory: "",
      subSubCategory: "",
    });
  };

  const handleSubCategoryChange = (e) => {
    const subCategory = e.target.value;
    setFormData({
      ...formData,
      subCategory,
      subSubCategory: "",
    });
  };

  const handleSubSubCategoryChange = (e) => {
    setFormData({
      ...formData,
      subSubCategory: e.target.value,
    });
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
    if (!formData.category) {
      showStatus("error", "Please select a category");
      return;
    }

    const categoryData = complianceStructure[formData.category];
    if (!categoryData) {
      showStatus("error", "Invalid category selected");
      return;
    }

    // Check if sub-category is required
    const subCategories = categoryData.subCategories;
    if (Object.keys(subCategories).length > 0 && !formData.subCategory) {
      showStatus("error", "Please select a sub-category");
      return;
    }

    // Check if sub-sub-category is required
    const selectedSubCat = subCategories[formData.subCategory];
    if (
      selectedSubCat &&
      typeof selectedSubCat === "object" &&
      selectedSubCat.subSubCategories
    ) {
      const subSubCategories = selectedSubCat.subSubCategories;
      if (
        Object.keys(subSubCategories).length > 0 &&
        !formData.subSubCategory
      ) {
        showStatus("error", "Please select a sub-sub-category");
        return;
      }
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
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}",
        );
        currentUserId = storedUser.id;
      }

      if (!currentUserId || !currentOrgId) {
        showStatus("error", "User ID or Organization ID not found");
        return;
      }

      // Upload directly to S3
      const folder = `user-profiles/${currentUserId}/organizations/${currentOrgId}/business/compliance/${formData.category}${formData.subCategory ? `/${formData.subCategory}` : ""}${formData.subSubCategory ? `/${formData.subSubCategory}` : ""}`;
      const { s3Url } = await uploadFileDirect(
        formData.file,
        folder,
        formData.file.name,
      );

      // Save S3 URL to database
      let endpoint = "/users-page/upload-compliance-document";
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/upload-compliance-document/${currentUserId}`;
      }

      const response = await apiClient.post(endpoint, {
        category: formData.category,
        subCategory: formData.subCategory || null,
        subSubCategory: formData.subSubCategory || null,
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

  const handleViewDocument = async (doc) => {
    const url = doc.document_url;
    if (url && typeof url === "string" && url.trim().length > 0) {
      await viewFile(url);
    } else {
      showStatus("error", "Document URL not available");
    }
  };

  const handleDownloadDocument = async (doc) => {
    const url = doc.document_url;
    const fileName = doc.document_name || "document";
    if (url && typeof url === "string" && url.trim().length > 0) {
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
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}",
        );
        currentUserId = storedUser.id;
      }

      if (!currentUserId || !currentOrgId) {
        showStatus("error", "User ID or Organization ID not found");
        return;
      }

      let endpoint = `/users-page/compliance-documents/${docId}?organizationId=${currentOrgId}`;
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/compliance-documents/${docId}/${currentUserId}?organizationId=${currentOrgId}`;
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
      showStatus(
        "error",
        error.message || "Failed to delete document. Please try again.",
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSubCategoryLabel = (category, subCategoryKey) => {
    const categoryData = complianceStructure[category];
    if (!categoryData) return subCategoryKey;
    const subCat = categoryData.subCategories[subCategoryKey];
    if (typeof subCat === "string") {
      return subCat;
    } else if (subCat && subCat.label) {
      return subCat.label;
    }
    return subCategoryKey;
  };

  const getSubSubCategoryLabel = (
    category,
    subCategoryKey,
    subSubCategoryKey,
  ) => {
    const categoryData = complianceStructure[category];
    if (!categoryData) return subSubCategoryKey;
    const subCat = categoryData.subCategories[subCategoryKey];
    if (subCat && typeof subCat === "object" && subCat.subSubCategories) {
      return subCat.subSubCategories[subSubCategoryKey] || subSubCategoryKey;
    }
    return subSubCategoryKey;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022B51] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Toast Notification */}
        {status.message && (
          <div className="fixed inset-0 z-40 flex items-start justify-end pointer-events-none">
            <div className="mt-20 mr-4 sm:mr-6 w-full max-w-xs pointer-events-auto">
              <div
                className={`rounded-xl px-4 py-3 text-sm shadow-lg border flex items-start justify-between gap-3 animate-fade-in ${
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
        <div className="mb-4 lg:mb-6">
          <button
            onClick={() => {
              if (isAdmin && userIdFromParams) {
                navigate(
                  `/admin/client-company-documents/${userIdFromParams}/${currentOrgId}/business/company-master-data`,
                  {
                    state: { orgId: currentOrgId, userId: userIdFromParams },
                  },
                );
              } else {
                const orgIdFromState = location.state?.orgId || currentOrgId;
                if (orgIdFromState) {
                  navigate(
                    `/company-documents/${orgIdFromState}/business/company-master-data`,
                    { state: { orgId: orgIdFromState } },
                  );
                } else {
                  navigate("/organizations-list");
                }
              }
            }}
            className="text-[#022B51] hover:text-[#022B51] mb-4 flex items-center gap-2 -ml-1 lg:ml-0"
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
            <span className="text-sm lg:text-base">Back to Company Master Data</span>
          </button>

          {organization && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,-0,0,0.05)] border border-gray-100 p-4 sm:p-6 mb-4 lg:mb-6">
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                {organization.legalName !== "-"
                  ? organization.legalName
                  : organization.tradeName}
              </h1>
              {organization.tradeName !== "-" &&
                organization.legalName !== "-" &&
                organization.tradeName !== organization.legalName && (
                  <p className="text-sm lg:text-base text-gray-600 mt-1">{organization.tradeName}</p>
                )}
              {organization.gstin !== "-" && (
                <p className="text-xs lg:text-sm text-gray-500 mt-1 font-mono">
                  GSTIN: {organization.gstin}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              Compliance Documents
            </h2>
            <button
              onClick={handleOpenUploadModal}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm lg:text-base font-medium text-white rounded-lg lg:rounded-md hover:opacity-90 transition-all shadow-sm" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
            >
              + Upload Document
            </button>
          </div>
        </div>

        {/* Documents by Category */}
        {Object.keys(complianceStructure).map((categoryKey) => {
          const categoryData = complianceStructure[categoryKey];
          const categoryDocs = documents[categoryKey] || {};

          return (
            <div
              key={categoryKey}
              className="bg-white rounded-xl lg:rounded-2xl shadow-[0_2px_8px_rgba(0,-0,0,0.05)] border border-gray-100 p-4 sm:p-6 mb-4 lg:mb-6"
            >
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
                {categoryData.label}
              </h3>

              {Object.keys(categoryDocs).length === 0 ? (
                <div className="text-center py-8 lg:py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm lg:text-base">
                    No documents uploaded yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(categoryDocs).map(
                    ([subCatKey, subCatDocs]) => {
                      if (
                        typeof subCatDocs === "object" &&
                        !Array.isArray(subCatDocs)
                      ) {
                        // Has sub-sub-categories
                        return Object.entries(subCatDocs).map(
                          ([subSubCatKey, docs]) => (
                            <div
                              key={`${subCatKey}-${subSubCatKey}`}
                              className="border-l-4 border-blue-500 pl-4 mb-4"
                            >
                              <h4 className="text-sm lg:text-base font-medium text-gray-800 mb-3">
                                {getSubCategoryLabel(categoryKey, subCatKey)} -{" "}
                                {getSubSubCategoryLabel(
                                  categoryKey,
                                  subCatKey,
                                  subSubCatKey,
                                )}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                {docs.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="bg-gray-50/50 hover:bg-gray-50 rounded-xl p-4 border border-gray-100 transition-all hover:shadow-md hover:border-gray-200"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm lg:text-base font-medium text-gray-900 truncate" title={doc.document_name || "Document"}>
                                          {doc.document_name || "Document"}
                                        </p>
                                        <p className="text-[11px] lg:text-xs text-gray-400 mt-1">
                                          {formatDate(doc.uploaded_at)}
                                        </p>
                                        {doc.description && (
                                          <p className="text-[11px] lg:text-xs text-gray-500 mt-1 truncate" title={doc.description}>
                                            {doc.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                      <button
                                        onClick={() => handleViewDocument(doc)}
                                        className="flex-1 px-3 py-2 text-xs lg:text-sm font-medium text-[#022B51] border border-[#022B51] rounded-lg hover:bg-[#015079] hover:text-white transition-colors"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadDocument(doc)
                                        }
                                        className="flex-1 px-3 py-2 text-xs lg:text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                                      >
                                        Download
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteDocument(doc.id)
                                        }
                                        className="flex-none px-3 py-2 text-xs lg:text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                        title="Delete"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                        );
                      } else {
                        // Direct documents under sub-category
                        return (
                          <div
                            key={subCatKey}
                            className="border-l-4 border-blue-500 pl-4 mb-4"
                          >
                            <h4 className="text-sm lg:text-base font-medium text-gray-800 mb-3">
                              {getSubCategoryLabel(categoryKey, subCatKey)}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                              {subCatDocs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="bg-gray-50/50 hover:bg-gray-50 rounded-xl p-4 border border-gray-100 transition-all hover:shadow-md hover:border-gray-200"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm lg:text-base font-medium text-gray-900 truncate" title={doc.document_name || "Document"}>
                                        {doc.document_name || "Document"}
                                      </p>
                                      <p className="text-[11px] lg:text-xs text-gray-400 mt-1">
                                        {formatDate(doc.uploaded_at)}
                                      </p>
                                      {doc.description && (
                                        <p className="text-[11px] lg:text-xs text-gray-500 mt-1 truncate" title={doc.description}>
                                          {doc.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                    <button
                                      onClick={() => handleViewDocument(doc)}
                                      className="flex-1 px-3 py-2 text-xs lg:text-sm font-medium text-[#022B51] border border-[#022B51] rounded-lg hover:bg-[#015079] hover:text-white transition-colors"
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDownloadDocument(doc)
                                      }
                                      className="flex-1 px-3 py-2 text-xs lg:text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
                                    >
                                      Download
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteDocument(doc.id)
                                      }
                                      className="flex-none px-3 py-2 text-xs lg:text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                      title="Delete"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    },
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
            <div className="bg-white rounded-xl shadow-xl max-w-[95vw] sm:max-w-md w-full mx-4 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Compliance Document
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
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022B51]"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(complianceStructure).map(([key, data]) => (
                      <option key={key} value={key}>
                        {data.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.category &&
                  complianceStructure[formData.category]?.subCategories && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub-Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.subCategory}
                        onChange={handleSubCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022B51]"
                      >
                        <option value="">Select Sub-Category</option>
                        {Object.entries(
                          complianceStructure[formData.category].subCategories,
                        ).map(([key, data]) => (
                          <option key={key} value={key}>
                            {typeof data === "string" ? data : data.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                {formData.subCategory &&
                  complianceStructure[formData.category]?.subCategories[
                    formData.subCategory
                  ] &&
                  typeof complianceStructure[formData.category].subCategories[
                    formData.subCategory
                  ] === "object" &&
                  complianceStructure[formData.category].subCategories[
                    formData.subCategory
                  ].subSubCategories && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub-Sub-Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.subSubCategory}
                        onChange={handleSubSubCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022B51]"
                      >
                        <option value="">Select Sub-Sub-Category</option>
                        {Object.entries(
                          complianceStructure[formData.category].subCategories[
                            formData.subCategory
                          ].subSubCategories,
                        ).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022B51]"
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
                    accept=".pdf,.xls,.xlsx,.csv,.txt,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022B51]"
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
                  disabled={uploading || !formData.file || !formData.category}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
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

export default Compliance;
