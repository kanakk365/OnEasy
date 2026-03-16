import React, { useState, useEffect } from "react";
import complianceApi from "../../../utils/complianceApi";
import { FiFolderPlus, FiFolder, FiFileText, FiChevronRight, FiUpload, FiX, FiExternalLink, FiUploadCloud, FiEdit2, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { BsFolderFill } from "react-icons/bs";
import SuccessModal from "../../common/SuccessModal";

function AdminResources() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentFolder, setCurrentFolder] = useState(null); // null means root
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // Current Folder Contents
  const [currentDocuments, setCurrentDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Modals
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Delete Target: { type: 'folder' | 'document', item: Object }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State - Folder
  const [isFolderEdit, setIsFolderEdit] = useState(false);
  const [editFolderId, setEditFolderId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [savingFolder, setSavingFolder] = useState(false);

  // Form State - Upload
  const [isDocEdit, setIsDocEdit] = useState(false);
  const [editDocId, setEditDocId] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);

  // Success / Error Modal States
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: "", message: "" });

  const showError = (title, message) => setErrorModal({ isOpen: true, title, message });
  const showSuccess = (title, message) => setSuccessModal({ isOpen: true, title, message });

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const res = await complianceApi.get("/admin/folders?page=1&limit=50");
      if (res && res.items) {
        setFolders(res.items);
        
        // If we are currently inside a folder, we might need to update its reference
        if (currentFolder) {
          const updatedCurrent = findFolderById(res.items, currentFolder.id);
          if (updatedCurrent) {
            setCurrentFolder(updatedCurrent);
            updateBreadcrumbs(res.items, currentFolder.id);
          } else {
            // Folder might have been deleted or moved, fallback to root
            setCurrentFolder(null);
            setBreadcrumbs([]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch folders:", e);
    } finally {
      setLoading(false);
    }
  };

  const flattenFolders = (foldersList, prefix = "") => {
    let flat = [];
    foldersList.forEach(f => {
      flat.push({ ...f, label: prefix + f.name });
      if (f.children && f.children.length > 0) {
        flat = flat.concat(flattenFolders(f.children, prefix + f.name + " / "));
      }
    });
    return flat;
  };

  const findFolderById = (foldersList, id) => {
    for (const f of foldersList) {
      if (f.id === id) return f;
      if (f.children && f.children.length > 0) {
        const found = findFolderById(f.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateBreadcrumbs = (foldersList, targetId) => {
    const findPath = (list, id, currentPath = []) => {
      for (const f of list) {
        if (f.id === id) return [...currentPath, f];
        if (f.children && f.children.length > 0) {
          const path = findPath(f.children, id, [...currentPath, f]);
          if (path) return path;
        }
      }
      return null;
    };
    const newPath = findPath(foldersList, targetId);
    if (newPath) setBreadcrumbs(newPath);
  };

  const fetchDocuments = async (folderId) => {
    try {
      setLoadingDocs(true);
      const res = await complianceApi.get(`/admin/folders/${folderId}/documents?page=1&limit=50`);
      if (res && res.items) {
        setCurrentDocuments(res.items);
      } else {
        setCurrentDocuments([]);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setCurrentDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (currentFolder) {
      fetchDocuments(currentFolder.id);
    } else {
      setCurrentDocuments([]);
    }
  }, [currentFolder]);

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    setBreadcrumbs([...breadcrumbs, folder]);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      const targetFolder = breadcrumbs[index];
      setCurrentFolder(targetFolder);
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  const openCreateFolder = () => {
    setIsFolderEdit(false);
    setEditFolderId(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setParentId(currentFolder ? currentFolder.id : "");
    setShowFolderModal(true);
  };

  const openEditFolder = (folder, e) => {
    e.stopPropagation(); // prevent folder click
    setIsFolderEdit(true);
    setEditFolderId(folder.id);
    setName(folder.name || "");
    setDescription(folder.description || "");
    setIsActive(folder.isActive ?? true);
    setParentId(currentFolder ? currentFolder.id : "");
    setShowFolderModal(true);
  };

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError("Validation Error", "Folder name is required");
      return;
    }
    try {
      setSavingFolder(true);
      if (isFolderEdit) {
        // Edit flow
        const payload = { 
          name, 
          description,
          isActive
        };
        await complianceApi.put(`/admin/folders/${editFolderId}`, payload); // using PUT on apiClient usually routes correctly, but wait, API specifies PATCH /admin/folders/:id
        // Since complianceApi wrapper might only have PUT, let's use the underlying fetch or standard .request if needed.
        // complianceApi.request explicitly lets us override. We can also just use complianceApi.request(`/admin/folders/${editFolderId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        await complianceApi.request(`/admin/folders/${editFolderId}`, { 
          method: 'PATCH', 
          body: JSON.stringify(payload) 
        });
        showSuccess("Folder Updated", "Folder updated successfully!");
      } else {
        // Create flow
        const payload = { name, description };
        if (parentId.trim() !== "") {
          payload.parentId = parentId.trim();
        }
        await complianceApi.post("/admin/folders", payload);
        showSuccess("Folder Created", "Folder created successfully!");
      }
      
      setShowFolderModal(false);
      await fetchFolders();
    } catch (e) {
      console.error("Failed to save folder:", e);
      showError("Save Failed", "Failed to save folder. Please try again.");
    } finally {
      setSavingFolder(false);
    }
  };

  const openDeletePrompt = (type, item, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setDeleteTarget({ type, item });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      if (deleteTarget.type === 'folder') {
        await complianceApi.delete(`/admin/folders/${deleteTarget.item.id}`);
        showSuccess("Deleted", "Folder deleted successfully");
        setShowDeleteModal(false);
        setDeleteTarget(null);
        await fetchFolders();
      } else if (deleteTarget.type === 'document') {
        await complianceApi.delete(`/admin/folders/documents/${deleteTarget.item.id}`);
        showSuccess("Deleted", "Document deleted successfully");
        setShowDeleteModal(false);
        setDeleteTarget(null);
        if (currentFolder) {
          fetchDocuments(currentFolder.id);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
      showError("Delete Failed", "Failed to delete. Make sure it is completely empty or you have correct permissions.");
    } finally {
      setDeleting(false);
    }
  };

  const openUploadModal = () => {
    setIsDocEdit(false);
    setEditDocId(null);
    setUploadTitle("");
    setUploadFile(null);
    setSelectedFolderIds(currentFolder ? [currentFolder.id] : []);
    setShowUploadModal(true);
  };

  const openEditDocumentModal = (doc, e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDocEdit(true);
    setEditDocId(doc.id);
    setUploadTitle(doc.title || "");
    setUploadFile(null); // File is optional on edit
    setShowUploadModal(true);
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      showError("Validation Error", "Please provide a title");
      return;
    }
    if (!isDocEdit && !uploadFile) {
      showError("Validation Error", "Please select a file to upload");
      return;
    }
    
    // ensure at least one folder is selected
    if (!isDocEdit && selectedFolderIds.length === 0) {
       showError("Validation Error", "Please select at least one folder to upload to.");
       return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", uploadTitle);
      
      if (uploadFile) {
        formData.append("file", uploadFile);
      }
      
      if (!isDocEdit) {
        selectedFolderIds.forEach(id => {
          formData.append("folderIds", id);
        });
      }

      const token = complianceApi.getToken();
      let url = "https://oneasycompliance.oneasy.ai/admin/folders/documents/upload";
      let method = "POST";

      if (isDocEdit) {
        url = `https://oneasycompliance.oneasy.ai/admin/folders/documents/${editDocId}`;
        method = "PATCH";
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Success", `Document ${isDocEdit ? 'updated' : 'uploaded'} successfully`);
        setShowUploadModal(false);
        if (currentFolder) {
          fetchDocuments(currentFolder.id);
        }
      } else {
        showError("Upload Failed", data.message || "Failed to process document");
      }
    } catch (error) {
      console.error("Upload/Edit error:", error);
      showError("Upload Error", "Error processing document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Determine items to display in the current view
  const displayFolders = currentFolder ? (currentFolder.children || []) : folders;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
            >
              <BsFolderFill className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Resources Manager
              </h1>
              <p className="text-gray-500 italic ml-1">
                Manage Folders and Documents
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
              <button
                onClick={openUploadModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#00486D] rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-medium"
              >
                <FiUpload className="w-4 h-4" />
                Upload File
              </button>
            <button
              onClick={openCreateFolder}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md font-medium"
            >
              <FiFolderPlus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        </div>

        {/* File Explorer */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          {/* Breadcrumbs */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => handleBreadcrumbClick(-1)}
              className={`hover:text-[#00486D] transition-colors ${!currentFolder ? 'font-semibold text-[#00486D]' : ''}`}
            >
              Root
            </button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <FiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`hover:text-[#00486D] transition-colors ${index === breadcrumbs.length - 1 ? 'font-semibold text-[#00486D]' : ''}`}
                  title={crumb.name}
                >
                  <span className="truncate max-w-[150px] inline-block align-bottom">{crumb.name}</span>
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white/80 z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D] mb-4"></div>
                <p>Loading Explorer...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 align-top">
                
                {/* Create New Folder Card */}
                <button
                  onClick={openCreateFolder}
                  className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200 hover:border-[#00486D] group text-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-blue-50/50 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                     <FiFolderPlus className="w-8 h-8 text-[#00486D]/70 group-hover:text-[#00486D]" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-[#00486D]">
                    New Folder
                  </span>
                </button>

                {/* Folders */}
                {displayFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderClick(folder)}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-blue-100 group text-center relative"
                  >
                    {/* Action buttons on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 z-10">
                      <div 
                        onClick={(e) => openEditFolder(folder, e)} 
                        className="p-1.5 text-blue-500 bg-white border border-gray-100 shadow-sm rounded-md hover:bg-blue-50 transition-colors"
                        title="Edit Folder"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </div>
                      <div 
                        onClick={(e) => openDeletePrompt('folder', folder, e)} 
                        className="p-1.5 text-red-500 bg-white border border-gray-100 shadow-sm rounded-md hover:bg-red-50 transition-colors"
                        title="Delete Folder"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="opacity-90 group-hover:opacity-100 transition-opacity w-full flex flex-col items-center">
                      <BsFolderFill className="w-16 h-16 text-blue-400 group-hover:text-blue-500 mb-3 drop-shadow-sm transition-colors" />
                      <span className="text-sm font-medium text-gray-800 line-clamp-2 w-full px-2" title={folder.name}>
                        {folder.name}
                      </span>
                      {folder.children?.length > 0 && (
                        <span className="text-[10px] text-gray-400 mt-1">
                          {folder.children.length} sub-item(s)
                        </span>
                      )}
                    </div>
                  </button>
                ))}

                {/* Documents (only inside a folder) */}
                {currentFolder && (
                  loadingDocs ? (
                    <div className="col-span-full py-8 text-center text-sm text-gray-400">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-[#00486D] rounded-full animate-spin mx-auto mb-2"></div>
                      Loading documents...
                    </div>
                  ) : currentDocuments.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group text-center relative"
                      title={doc.title}
                    >
                      {/* Action buttons on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 z-10">
                        <div 
                          onClick={(e) => openEditDocumentModal(doc, e)} 
                          className="p-1.5 text-blue-500 bg-white border border-gray-100 shadow-sm rounded-md hover:bg-blue-50 transition-colors"
                          title="Edit Document"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </div>
                        <div 
                          onClick={(e) => openDeletePrompt('document', doc, e)} 
                          className="p-1.5 text-red-500 bg-white border border-gray-100 shadow-sm rounded-md hover:bg-red-50 transition-colors"
                          title="Delete Document"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white transition-colors shadow-sm group-hover:shadow relative text-gray-400 group-hover:text-blue-500">
                        <FiFileText className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 line-clamp-2 w-full break-words px-2">
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 truncate w-full px-2">
                        {doc.fileName || doc.type}
                      </span>
                    </a>
                  ))
                )}

                {/* Empty State */}
                {displayFolders.length === 0 && (!currentFolder || (currentFolder && currentDocuments.length === 0 && !loadingDocs)) && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                    <p className="text-sm">Create a folder or upload a document.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiFolderPlus className="w-5 h-5 text-[#00486D]" />
                {isFolderEdit ? "Edit Folder" : "Create New Folder"}
              </h3>
              <button 
                onClick={() => setShowFolderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFolderSubmit} className="p-6 space-y-5">
              {!isFolderEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Creating inside
                  </label>
                  <div className="w-full px-4 py-2.5 border border-gray-100 bg-gray-50 rounded-xl text-gray-600 text-sm font-medium flex items-center gap-2">
                    <span className="text-[#00486D]">
                      {currentFolder ? <FiFolder className="w-4 h-4" /> : <FiFolder className="w-4 h-4" />}
                    </span>
                    {currentFolder ? currentFolder.name : "Root Directory"}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Folder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D]/20 focus:border-[#00486D] transition-all"
                  placeholder="e.g. Q1 Reports"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D]/20 focus:border-[#00486D] transition-all resize-none h-20"
                  placeholder="Optional details..."
                />
              </div>

              {isFolderEdit && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="folderIsActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#00486D] bg-gray-100 border-gray-300 rounded focus:ring-[#00486D]"
                  />
                  <label htmlFor="folderIsActive" className="text-sm font-medium text-gray-700">
                    Active Folder
                  </label>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFolder}
                  className="px-5 py-2.5 text-sm font-medium bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {savingFolder && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {isFolderEdit ? "Update Folder" : "Create Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload / Edit Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUploadCloud className="w-5 h-5 text-[#00486D]" />
                {isDocEdit ? "Edit Document" : "Upload Document"}
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleDocumentSubmit} className="p-6 space-y-5">
              {!isDocEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select Folders <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto bg-gray-50 p-2 space-y-1">
                    {flattenFolders(folders).map((f) => (
                      <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1.5 rounded transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedFolderIds.includes(f.id)} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedFolderIds([...selectedFolderIds, f.id]);
                            else setSelectedFolderIds(selectedFolderIds.filter(id => id !== f.id));
                          }}
                          className="w-4 h-4 text-[#00486D] rounded focus:ring-[#00486D]" 
                        />
                        <span className="text-gray-700 font-medium">{f.label}</span>
                      </label>
                    ))}
                    {folders.length === 0 && (
                      <p className="text-sm text-gray-400 p-2 text-center">No folders available. Create a folder first.</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D]/20 focus:border-[#00486D] transition-all"
                  placeholder="e.g. Q1 Income Tax Return"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select File {!isDocEdit && <span className="text-red-500">*</span>}
                  {isDocEdit && <span className="text-gray-400 ml-1 font-normal">(Leave blank to keep current)</span>}
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={!isDocEdit}
                  />
                  <FiFileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  {uploadFile ? (
                    <p className="text-sm font-medium text-blue-600 truncate px-4">{uploadFile.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Click to browse or drag & drop</p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 text-sm font-medium bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {uploading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {isDocEdit ? "Update Document" : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete {deleteTarget?.type === 'folder' ? 'Folder' : 'Document'}?
              </h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>{deleteTarget?.item?.name || deleteTarget?.item?.title}</strong>? This action cannot be undone.
              </p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
      />

      {/* Error Modal */}
      {errorModal.isOpen && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in-up">
             <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FiAlertCircle className="w-8 h-8 text-red-500" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">
                 {errorModal.title || "An error occurred"}
               </h3>
               <p className="text-sm text-gray-500">
                 {errorModal.message || "Failed to process the request."}
               </p>
             </div>
             <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
               <button
                 onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                 className="w-full px-5 py-2.5 text-sm font-medium bg-[#01334C] hover:bg-[#00486D] text-white rounded-xl transition-colors"
               >
                 Okay
               </button>
             </div>
           </div>
         </div>
      )}

    </div>
  );
}

export default AdminResources;
