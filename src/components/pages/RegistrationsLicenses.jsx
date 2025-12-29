import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { uploadFileDirect, viewFile, downloadFile } from "../../utils/s3Upload";

function RegistrationsLicenses() {
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
  const [navigationPath, setNavigationPath] = useState([]); // Track navigation: ['incorporation'] -> ['incorporation', 'kyc'] -> etc.

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
    subSubCategory: "",
    subSubSubCategory: "",
    description: "",
    file: null
  });

  // Registrations and Licenses structure based on the diagram
  // Only TWO main headings: Incorporation and Other Registrations
  // KYC is nested under Incorporation
  const registrationsLicensesStructure = {
    incorporation: {
      label: "Incorporation",
      subCategories: {
        kyc: {
          label: "KYC",
          subSubCategories: {
            director_1: {
              label: "DIRECTOR-1",
              subSubSubCategories: {
                pan_card: "PAN CARD",
                aadhar_card: "AADHAR CARD",
                passport_photo: "PASSPORT PHOTO",
                bank_statement: "BANK STATEMENT",
                signature: "SIGNATURE"
              }
            },
            director_2: {
              label: "DIRECTOR-2",
              subSubSubCategories: {
                pan_card: "PAN CARD",
                aadhar_card: "AADHAR CARD",
                passport_photo: "PASSPORT PHOTO",
                bank_statement: "BANK STATEMENT",
                signature: "SIGNATURE"
              }
            }
          }
        },
        e_forms: {
          label: "E Forms",
          subSubCategories: {
            inc_33: "INC-33 (MOA.INC-33)",
            inc_34: "INC-34 (AOA.INC-34)",
            inc_9: "INC-9",
            agile_pro: "AGILE-PRO",
            spice_part_b: "SPICE + PART-B",
            inc_20a: "INC-20A",
            adt_1: "ADT-1"
          }
        },
        certificates: {
          label: "Certificates",
          subSubCategories: {
            pan: "PAN (Name.PAN)",
            tan: "TAN (Name.TAN)",
            coi: "COI (Name.COI)"
          }
        },
        other_documents: {
          label: "Other Documents",
          subSubCategories: {
            supporting_document: "Supporting Document",
            noc_lease_agreement: "NOC/Lease Agreement",
            other_relevant_documents: "Other Relevant Documents"
          }
        }
      }
    },
    other_registrations: {
      label: "Other Registrations",
      subCategories: {
        gst: "GST",
        labour_license: "LABOUR LICENSE",
        trade_license: "TRADE LICENSE",
        msme_registration: "MSME REGISTRATION",
        startup_india: "Startup India"
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
            legalName: org.legal_name || 'N/A',
            tradeName: org.trade_name || 'N/A',
            gstin: org.gstin || 'N/A'
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

      let endpoint = `/users-page/registrations-licenses-documents?organizationId=${currentOrgId}`;
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/registrations-licenses-documents/${currentUserId}?organizationId=${currentOrgId}`;
      }

      const response = await apiClient.get(endpoint).catch(() => ({
        success: false,
        data: {}
      }));

      if (response.success && response.data) {
        // Merge old KYC data (category='kyc') into new structure (category='incorporation', sub_category='kyc')
        const mergedData = { ...response.data };
        if (mergedData.kyc) {
          if (!mergedData.incorporation) {
            mergedData.incorporation = {};
          }
          if (!mergedData.incorporation.kyc) {
            mergedData.incorporation.kyc = mergedData.kyc;
          } else {
            // Merge KYC data if it already exists
            Object.keys(mergedData.kyc).forEach(subCat => {
              if (!mergedData.incorporation.kyc[subCat]) {
                mergedData.incorporation.kyc[subCat] = mergedData.kyc[subCat];
              } else {
                // Merge sub-sub-categories
                Object.keys(mergedData.kyc[subCat]).forEach(subSubCat => {
                  if (!mergedData.incorporation.kyc[subCat][subSubCat]) {
                    mergedData.incorporation.kyc[subCat][subSubCat] = mergedData.kyc[subCat][subSubCat];
                  } else {
                    mergedData.incorporation.kyc[subCat][subSubCat] = [
                      ...mergedData.incorporation.kyc[subCat][subSubCat],
                      ...mergedData.kyc[subCat][subSubCat]
                    ];
                  }
                });
              }
            });
          }
          // Remove old kyc key
          delete mergedData.kyc;
        }
        setDocuments(mergedData);
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
      subSubCategory: "",
      subSubSubCategory: "",
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
      subSubCategory: "",
      subSubSubCategory: "",
      description: "",
      file: null
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
      subSubSubCategory: ""
    });
  };

  const handleSubCategoryChange = (e) => {
    const subCategory = e.target.value;
    setFormData({
      ...formData,
      subCategory,
      subSubCategory: "",
      subSubSubCategory: ""
    });
  };

  const handleSubSubCategoryChange = (e) => {
    setFormData({
      ...formData,
      subSubCategory: e.target.value,
      subSubSubCategory: ""
    });
  };

  const handleSubSubSubCategoryChange = (e) => {
    setFormData({
      ...formData,
      subSubSubCategory: e.target.value
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
    if (!formData.category) {
      showStatus("error", "Please select a category");
      return;
    }

    const categoryData = registrationsLicensesStructure[formData.category];
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
    if (selectedSubCat && typeof selectedSubCat === 'object' && selectedSubCat.subSubCategories) {
      const subSubCategories = selectedSubCat.subSubCategories;
      if (Object.keys(subSubCategories).length > 0 && !formData.subSubCategory) {
        showStatus("error", "Please select a sub-sub-category");
        return;
      }
      
      // Check if sub-sub-sub-category is required (for KYC -> DIRECTOR-1/2 -> documents)
      const selectedSubSubCat = subSubCategories[formData.subSubCategory];
      if (selectedSubSubCat && typeof selectedSubSubCat === 'object' && selectedSubSubCat.subSubSubCategories) {
        const subSubSubCategories = selectedSubSubCat.subSubSubCategories;
        if (Object.keys(subSubSubCategories).length > 0 && !formData.subSubSubCategory) {
          showStatus("error", "Please select a sub-sub-sub-category");
          return;
        }
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
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
        );
        currentUserId = storedUser.id;
      }

      if (!currentUserId || !currentOrgId) {
        showStatus("error", "User ID or Organization ID not found");
        return;
      }

      // Upload directly to S3
      const folder = `user-profiles/${currentUserId}/organizations/${currentOrgId}/business/registrations-licenses/${formData.category}${formData.subCategory ? `/${formData.subCategory}` : ''}${formData.subSubCategory ? `/${formData.subSubCategory}` : ''}${formData.subSubSubCategory ? `/${formData.subSubSubCategory}` : ''}`;
      const { s3Url } = await uploadFileDirect(
        formData.file,
        folder,
        formData.file.name
      );

      // Save S3 URL to database
      let endpoint = "/users-page/upload-registrations-licenses-document";
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/upload-registrations-licenses-document/${currentUserId}`;
      }

      const response = await apiClient.post(endpoint, {
        category: formData.category,
        subCategory: formData.subCategory || null,
        subSubCategory: formData.subSubCategory || null,
        subSubSubCategory: formData.subSubSubCategory || null,
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

      let endpoint = `/users-page/registrations-licenses-documents/${docId}?organizationId=${currentOrgId}`;
      if (isAdmin && currentUserId) {
        endpoint = `/users-page/registrations-licenses-documents/${docId}/${currentUserId}?organizationId=${currentOrgId}`;
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubCategoryLabel = (category, subCategoryKey) => {
    const categoryData = registrationsLicensesStructure[category];
    if (!categoryData) return subCategoryKey;
    const subCat = categoryData.subCategories[subCategoryKey];
    if (typeof subCat === 'string') {
      return subCat;
    } else if (subCat && subCat.label) {
      return subCat.label;
    }
    return subCategoryKey;
  };

  const getSubSubCategoryLabel = (category, subCategoryKey, subSubCategoryKey) => {
    const categoryData = registrationsLicensesStructure[category];
    if (!categoryData) return subSubCategoryKey;
    const subCat = categoryData.subCategories[subCategoryKey];
    if (subCat && typeof subCat === 'object' && subCat.subSubCategories) {
      const subSubCat = subCat.subSubCategories[subSubCategoryKey];
      if (typeof subSubCat === 'string') {
        return subSubCat;
      } else if (subSubCat && subSubCat.label) {
        return subSubCat.label;
      }
      return subSubCategoryKey;
    }
    return subSubCategoryKey;
  };

  const getSubSubSubCategoryLabel = (category, subCategoryKey, subSubCategoryKey, subSubSubCategoryKey) => {
    const categoryData = registrationsLicensesStructure[category];
    if (!categoryData) return subSubSubCategoryKey;
    const subCat = categoryData.subCategories[subCategoryKey];
    if (subCat && typeof subCat === 'object' && subCat.subSubCategories) {
      const subSubCat = subCat.subSubCategories[subSubCategoryKey];
      if (subSubCat && typeof subSubCat === 'object' && subSubCat.subSubSubCategories) {
        return subSubCat.subSubSubCategories[subSubSubCategoryKey] || subSubSubCategoryKey;
      }
    }
    return subSubSubCategoryKey;
  };

  // Render root view (Incorporation and Other Registrations)
  const renderRootView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(registrationsLicensesStructure).map((categoryKey) => {
          const categoryData = registrationsLicensesStructure[categoryKey];
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

  // Render category view (e.g., Incorporation -> shows KYC, E Forms, etc.)
  const renderCategoryView = (categoryKey) => {
    const categoryData = registrationsLicensesStructure[categoryKey];
    const categoryDocs = documents[categoryKey] || {};
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoryData.subCategories).map(([subCatKey, subCatData]) => {
          const subCategoryLabel = typeof subCatData === 'string' ? subCatData : subCatData.label;
          const subCatDocs = categoryDocs[subCatKey] || {};
          const hasDocs = Array.isArray(subCatDocs) ? subCatDocs.length > 0 : Object.keys(subCatDocs).length > 0;
          
          return (
            <div
              key={subCatKey}
              onClick={() => navigateTo([categoryKey, subCatKey])}
              className="bg-white rounded-lg shadow-sm border border-[#F3F3F3] p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-800">{subCategoryLabel}</h4>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {hasDocs && (
                <p className="text-xs text-gray-500 mt-2">
                  {Array.isArray(subCatDocs) ? subCatDocs.length : Object.keys(subCatDocs).length} items
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render sub-category view (e.g., KYC -> shows DIRECTOR-1, DIRECTOR-2)
  const renderSubCategoryView = (categoryKey, subCatKey) => {
    const categoryData = registrationsLicensesStructure[categoryKey];
    const subCatData = categoryData.subCategories[subCatKey];
    const categoryDocs = documents[categoryKey] || {};
    const subCatDocs = categoryDocs[subCatKey] || {};
    
    if (typeof subCatData === 'string') {
      // Direct documents (for other_registrations)
      return renderDocumentsView(subCatDocs);
    }
    
    if (subCatData.subSubCategories) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(subCatData.subSubCategories).map(([subSubCatKey, subSubCatData]) => {
            const subSubCategoryLabel = typeof subSubCatData === 'string' ? subSubCatData : subSubCatData.label;
            const subSubCatDocs = subCatDocs[subSubCatKey] || {};
            const hasDocs = Array.isArray(subSubCatDocs) ? subSubCatDocs.length > 0 : Object.keys(subSubCatDocs).length > 0;
            
            return (
              <div
                key={subSubCatKey}
                onClick={() => navigateTo([categoryKey, subCatKey, subSubCatKey])}
                className="bg-white rounded-lg shadow-sm border border-[#F3F3F3] p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-700">{subSubCategoryLabel}</h5>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {hasDocs && (
                  <p className="text-xs text-gray-500 mt-2">
                    {Array.isArray(subSubCatDocs) ? subSubCatDocs.length : Object.keys(subSubCatDocs).length} items
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    
    return <p className="text-gray-500 text-sm">No subcategories available</p>;
  };

  // Render sub-sub-category view (e.g., DIRECTOR-1 -> shows PAN CARD, AADHAR CARD, etc.)
  const renderSubSubCategoryView = (categoryKey, subCatKey, subSubCatKey) => {
    const categoryData = registrationsLicensesStructure[categoryKey];
    const subCatData = categoryData.subCategories[subCatKey];
    const subSubCatData = subCatData.subSubCategories[subSubCatKey];
    const categoryDocs = documents[categoryKey] || {};
    const subCatDocs = categoryDocs[subCatKey] || {};
    const subSubCatDocs = subCatDocs[subSubCatKey] || {};
    
    if (typeof subSubCatData === 'string') {
      // Direct documents (for E Forms, Certificates, etc.)
      return renderDocumentsView(subSubCatDocs);
    }
    
    if (subSubCatData.subSubSubCategories) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(subSubCatData.subSubSubCategories).map(([subSubSubCatKey, subSubSubCatLabel]) => {
            const docs = subSubCatDocs[subSubSubCatKey] || [];
            const hasDocs = Array.isArray(docs) && docs.length > 0;
            
            return (
              <div
                key={subSubSubCatKey}
                onClick={() => navigateTo([categoryKey, subCatKey, subSubCatKey, subSubSubCatKey])}
                className="bg-white rounded-lg shadow-sm border border-[#F3F3F3] p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-medium text-gray-600">{subSubSubCatLabel}</h6>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {hasDocs && (
                  <p className="text-xs text-gray-500 mt-2">{docs.length} {docs.length === 1 ? 'document' : 'documents'}</p>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    
    return <p className="text-gray-500 text-sm">No items available</p>;
  };

  // Render documents view (final level - shows actual documents)
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
      return renderSubCategoryView(navigationPath[0], navigationPath[1]);
    } else if (navigationPath.length === 3) {
      return renderSubSubCategoryView(navigationPath[0], navigationPath[1], navigationPath[2]);
    } else if (navigationPath.length === 4) {
      const [categoryKey, subCatKey, subSubCatKey, subSubSubCatKey] = navigationPath;
      const categoryDocs = documents[categoryKey] || {};
      const subCatDocs = categoryDocs[subCatKey] || {};
      const subSubCatDocs = subCatDocs[subSubCatKey] || {};
      const docs = subSubCatDocs[subSubSubCatKey] || [];
      return renderDocumentsView(docs);
    }
    return renderRootView();
  };

  // Get breadcrumb path
  const getBreadcrumbPath = () => {
    const path = [];
    if (navigationPath.length > 0) {
      const categoryKey = navigationPath[0];
      const categoryData = registrationsLicensesStructure[categoryKey];
      path.push({ label: categoryData.label, onClick: goToRoot });
      
      if (navigationPath.length > 1) {
        const subCatKey = navigationPath[1];
        const subCategoryLabel = getSubCategoryLabel(categoryKey, subCatKey);
        path.push({ label: subCategoryLabel, onClick: () => navigateTo([categoryKey]) });
        
        if (navigationPath.length > 2) {
          const subSubCatKey = navigationPath[2];
          const subSubCategoryLabel = getSubSubCategoryLabel(categoryKey, subCatKey, subSubCatKey);
          path.push({ label: subSubCategoryLabel, onClick: () => navigateTo([categoryKey, subCatKey]) });
          
          if (navigationPath.length > 3) {
            const subSubSubCatKey = navigationPath[3];
            const subSubSubCategoryLabel = getSubSubSubCategoryLabel(categoryKey, subCatKey, subSubCatKey, subSubSubCatKey);
            path.push({ label: subSubSubCategoryLabel, onClick: () => navigateTo([categoryKey, subCatKey, subSubCatKey]) });
          }
        }
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
                {organization.legalName !== 'N/A' ? organization.legalName : organization.tradeName}
              </h1>
              {organization.tradeName !== 'N/A' && organization.legalName !== 'N/A' && organization.tradeName !== organization.legalName && (
                <p className="text-gray-600 mt-1">{organization.tradeName}</p>
              )}
              {organization.gstin !== 'N/A' && (
                <p className="text-sm text-gray-500 mt-1 font-mono">GSTIN: {organization.gstin}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Registrations and Licenses Documents</h2>
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
              Registrations & Licenses
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
                <h3 className="text-lg font-semibold text-gray-900">Upload Registration/License Document</h3>
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
                    {Object.entries(registrationsLicensesStructure).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                </div>

                {formData.category && registrationsLicensesStructure[formData.category]?.subCategories && (
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
                      {Object.entries(registrationsLicensesStructure[formData.category].subCategories).map(([key, data]) => (
                        <option key={key} value={key}>
                          {typeof data === 'string' ? data : data.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.subCategory && 
                 registrationsLicensesStructure[formData.category]?.subCategories[formData.subCategory] &&
                 typeof registrationsLicensesStructure[formData.category].subCategories[formData.subCategory] === 'object' &&
                 registrationsLicensesStructure[formData.category].subCategories[formData.subCategory].subSubCategories && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-Sub-Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subSubCategory}
                      onChange={handleSubSubCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    >
                      <option value="">Select Sub-Sub-Category</option>
                      {Object.entries(registrationsLicensesStructure[formData.category].subCategories[formData.subCategory].subSubCategories).map(([key, data]) => {
                        const label = typeof data === 'string' ? data : (data.label || key);
                        return <option key={key} value={key}>{label}</option>;
                      })}
                    </select>
                  </div>
                )}

                {formData.subSubCategory && 
                 registrationsLicensesStructure[formData.category]?.subCategories[formData.subCategory]?.subSubCategories?.[formData.subSubCategory] &&
                 typeof registrationsLicensesStructure[formData.category].subCategories[formData.subCategory].subSubCategories[formData.subSubCategory] === 'object' &&
                 registrationsLicensesStructure[formData.category].subCategories[formData.subCategory].subSubCategories[formData.subSubCategory].subSubSubCategories && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-Sub-Sub-Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subSubSubCategory}
                      onChange={handleSubSubSubCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    >
                      <option value="">Select Sub-Sub-Sub-Category</option>
                      {Object.entries(registrationsLicensesStructure[formData.category].subCategories[formData.subCategory].subSubCategories[formData.subSubCategory].subSubSubCategories).map(([key, label]) => (
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
                  disabled={uploading || !formData.file || !formData.category}
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

export default RegistrationsLicenses;

