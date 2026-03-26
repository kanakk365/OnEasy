import React, { useState, useEffect, useMemo, useRef } from "react";
import complianceApi from "../../../utils/complianceApi";
import { FiFolderPlus, FiFolder, FiFileText, FiChevronRight, FiUpload, FiX, FiExternalLink, FiUploadCloud, FiEdit2, FiTrash2, FiAlertCircle, FiHome, FiSearch, FiDownload, FiEye } from "react-icons/fi";
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

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [allDocuments, setAllDocuments] = useState([]);
  const [loadingAllDocs, setLoadingAllDocs] = useState(false);
  const [allDocsLoaded, setAllDocsLoaded] = useState(false);
  const searchInputRef = useRef(null);

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

  // Flatten folders for search (with parent path display)
  const flattenFoldersForSearch = (foldersList, parentPath = []) => {
    let result = [];
    for (const folder of foldersList) {
      const pathNames = [...parentPath, folder.name];
      result.push({
        ...folder,
        type: "folder",
        pathNames,
        parentPathDisplay: parentPath.length > 0 ? parentPath.join(" / ") : "Root",
      });
      if (folder.children && folder.children.length > 0) {
        result = result.concat(flattenFoldersForSearch(folder.children, pathNames));
      }
    }
    return result;
  };

  // Build breadcrumb path for a folder from the tree
  const getFolderPath = (foldersList, targetId, currentPath = []) => {
    for (const f of foldersList) {
      if (f.id === targetId) return [...currentPath, f];
      if (f.children && f.children.length > 0) {
        const path = getFolderPath(f.children, targetId, [...currentPath, f]);
        if (path) return path;
      }
    }
    return null;
  };

  // Collect all folder IDs recursively
  const collectAllFolderIds = (foldersList) => {
    let ids = [];
    for (const f of foldersList) {
      ids.push(f.id);
      if (f.children && f.children.length > 0) {
        ids = ids.concat(collectAllFolderIds(f.children));
      }
    }
    return ids;
  };

  // Fetch documents from all folders for search
  const fetchAllDocuments = async () => {
    if (allDocsLoaded || loadingAllDocs) return;
    setLoadingAllDocs(true);
    try {
      const allFolderIds = collectAllFolderIds(folders);
      const allDocs = [];

      const batchSize = 5;
      for (let i = 0; i < allFolderIds.length; i += batchSize) {
        const batch = allFolderIds.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (folderId) => {
            try {
              const res = await complianceApi.get(`/admin/folders/${folderId}/documents?page=1&limit=50`);
              if (res && res.items) {
                return res.items.map(doc => ({
                  ...doc,
                  folderId,
                  type: "document",
                }));
              }
              return [];
            } catch {
              return [];
            }
          })
        );
        results.forEach(docs => allDocs.push(...docs));
      }

      setAllDocuments(allDocs);
      setAllDocsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch all documents:", error);
    } finally {
      setLoadingAllDocs(false);
    }
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

  // Load all documents when user starts searching
  useEffect(() => {
    if (searchQuery.trim().length > 0 && !allDocsLoaded) {
      fetchAllDocuments();
    }
  }, [searchQuery]);

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

  // Navigate to a folder from search results
  const handleSearchFolderClick = (folder) => {
    const path = getFolderPath(folders, folder.id);
    if (path) {
      setCurrentFolder(folder);
      setBreadcrumbs(path);
    } else {
      setCurrentFolder(folder);
      setBreadcrumbs([folder]);
    }
    setSearchQuery("");
  };

  // Navigate to a document's parent folder from search results
  const handleSearchDocumentClick = (doc) => {
    const parentFolder = findFolderById(folders, doc.folderId);
    if (parentFolder) {
      const path = getFolderPath(folders, doc.folderId);
      if (path) {
        setCurrentFolder(parentFolder);
        setBreadcrumbs(path);
      } else {
        setCurrentFolder(parentFolder);
        setBreadcrumbs([parentFolder]);
      }
    }
    setSearchQuery("");
  };

  // Compute search results
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length === 0) return [];

    const results = [];

    // Search folders
    const flatFolders = flattenFoldersForSearch(folders);
    flatFolders.forEach(folder => {
      if (folder.name.toLowerCase().includes(query) ||
        (folder.description && folder.description.toLowerCase().includes(query))) {
        results.push(folder);
      }
    });

    // Search documents
    allDocuments.forEach(doc => {
      const title = (doc.title || doc.name || "").toLowerCase();
      if (title.includes(query)) {
        const parentFolder = findFolderById(folders, doc.folderId);
        const folderPath = parentFolder
          ? getFolderPath(folders, doc.folderId)
          : null;
        const pathDisplay = folderPath
          ? folderPath.map(f => f.name).join(" / ")
          : "Unknown folder";
        results.push({
          ...doc,
          parentPathDisplay: pathDisplay,
          parentFolder,
        });
      }
    });

    return results;
  }, [searchQuery, folders, allDocuments]);

  const isSearching = searchQuery.trim().length > 0;

  // Highlight matching text in search results
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 font-semibold">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
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
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#022B51] rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-medium"
            >
              <FiUpload className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={openCreateFolder}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all shadow-md font-medium" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
            >
              <FiFolderPlus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        </div>

        {/* File Explorer */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          {/* Search Bar + Breadcrumbs Row */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72 flex-shrink-0">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search folders & files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent placeholder:text-gray-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Breadcrumbs - only when not searching */}
            {!isSearching && (
              <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
                <button
                  onClick={() => handleBreadcrumbClick(-1)}
                  className={`hover:text-[#022B51] transition-colors flex items-center gap-1 ${!currentFolder ? 'text-[#022B51]' : ''}`}
                  title="Home"
                >
                  <FiHome className="w-4 h-4" />
                </button>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.id}>
                    <FiChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`hover:text-[#022B51] transition-colors ${index === breadcrumbs.length - 1 ? 'font-semibold text-[#022B51]' : ''}`}
                      title={crumb.name}
                    >
                      <span className="truncate max-w-[150px] inline-block align-bottom">{crumb.name}</span>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Search indicator */}
            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>
                  {loadingAllDocs ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-gray-300 border-t-[#022B51] rounded-full animate-spin"></span>
                      Searching...
                    </span>
                  ) : (
                    <>
                      {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-3 sm:p-6 relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white/80 z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022B51] mb-4"></div>
                <p>Loading Explorer...</p>
              </div>
            ) : (
              isSearching ? (
                /* Search Results View */
                <div>
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((item) => (
                        item.type === "folder" ? (
                          /* Folder Search Result */
                          <button
                            key={`folder-${item.id}`}
                            onClick={() => handleSearchFolderClick(item)}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50/60 transition-all border border-transparent hover:border-blue-100 text-left group"
                          >
                            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                              <BsFolderFill className="w-6 h-6 text-blue-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {highlightMatch(item.name, searchQuery)}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate flex items-center gap-1">
                                <FiFolder className="w-3 h-3 flex-shrink-0" />
                                {item.parentPathDisplay}
                                {item.children?.length > 0 && (
                                  <span className="ml-2 text-gray-300">·</span>
                                )}
                                {item.children?.length > 0 && (
                                  <span>{item.children.length} sub-item{item.children.length > 1 ? "s" : ""}</span>
                                )}
                              </p>
                              {item.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                  {highlightMatch(item.description, searchQuery)}
                                </p>
                              )}
                            </div>
                            <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#022B51] flex-shrink-0 transition-colors" />
                          </button>
                        ) : (
                          /* Document Search Result */
                          <div
                            key={`doc-${item.id}`}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
                          >
                            <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                              <FiFileText className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {highlightMatch(item.title || item.name || "Untitled", searchQuery)}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate flex items-center gap-1">
                                <FiFolder className="w-3 h-3 flex-shrink-0" />
                                {item.parentPathDisplay}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <a
                                href={item.url || "#"}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-all" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
                                title="Download file"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FiDownload className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={item.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#022B51] text-[#022B51] hover:hover:text-white hover:opacity-90 transition-all" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
                                title="View file"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleSearchDocumentClick(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-[#022B51] hover:bg-blue-50 transition-colors"
                                title="Go to folder"
                              >
                                <FiFolder className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    !loadingAllDocs && (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <FiSearch className="w-12 h-12 mb-4 text-gray-200" />
                        <p className="text-sm font-medium text-gray-500">No results found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                /* Normal Explorer View */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 align-top">

                  {/* Create New Folder Card */}
                  <button
                    onClick={openCreateFolder}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200 hover:border-[#022B51] group text-center"
                  >
                    <div className="w-16 h-16 rounded-xl bg-blue-50/50 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                      <FiFolderPlus className="w-8 h-8 text-[#022B51]/70 group-hover:text-[#022B51]" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 group-hover:text-[#022B51]">
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
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#022B51] rounded-full animate-spin mx-auto mb-2"></div>
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
              )
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
                <FiFolderPlus className="w-5 h-5 text-[#022B51]" />
                {isFolderEdit ? "Edit Folder" : "Create New Folder"}
              </h3>
              <button
                onClick={() => setShowFolderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFolderSubmit} className="p-3 sm:p-6 space-y-5">
              {!isFolderEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Creating inside
                  </label>
                  <div className="w-full px-4 py-2.5 border border-gray-100 bg-gray-50 rounded-xl text-gray-600 text-sm font-medium flex items-center gap-2">
                    <span className="text-[#022B51]">
                      {currentFolder ? <FiFolder className="w-4 h-4" /> : <FiFolder className="w-4 h-4" />}
                    </span>
                    {currentFolder ? currentFolder.name : <FiHome className="w-4 h-4" />}
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022B51]/20 focus:border-[#022B51] transition-all"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022B51]/20 focus:border-[#022B51] transition-all resize-none h-20"
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
                    className="w-4 h-4 text-[#022B51] bg-gray-100 border-gray-300 rounded focus:ring-[#022B51]"
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
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-70 flex items-center gap-2" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
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
                <FiUploadCloud className="w-5 h-5 text-[#022B51]" />
                {isDocEdit ? "Edit Document" : "Upload Document"}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} className="p-3 sm:p-6 space-y-5">
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
                          className="w-4 h-4 text-[#022B51] rounded focus:ring-[#022B51]"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#022B51]/20 focus:border-[#022B51] transition-all"
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
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-70 flex items-center gap-2" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
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
            <div className="p-3 sm:p-6 text-center">
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
            <div className="p-3 sm:p-6 text-center">
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
                className="w-full px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
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
