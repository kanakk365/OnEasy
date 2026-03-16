import React, { useState, useEffect } from "react";
import complianceApi from "../../../utils/complianceApi";
import { FiFolderPlus, FiFolder, FiFileText, FiChevronRight, FiUpload, FiX, FiExternalLink, FiUploadCloud } from "react-icons/fi";
import { BsFolderFill } from "react-icons/bs";

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

  // Form State - Folder
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [savingFolder, setSavingFolder] = useState(false);

  // Form State - Upload
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Folder name is required");
      return;
    }
    try {
      setSavingFolder(true);
      const payload = { name, description };
      if (parentId.trim() !== "") {
        payload.parentId = parentId.trim();
      }

      await complianceApi.post("/admin/folders", payload);
      setName("");
      setDescription("");
      setParentId("");
      setShowFolderModal(false);
      await fetchFolders();
      alert("Folder created successfully!");
    } catch (e) {
      console.error("Failed to save folder:", e);
      alert("Failed to save folder.");
    } finally {
      setSavingFolder(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert("Please provide a title");
      return;
    }
    if (!uploadFile) {
      alert("Please select a file to upload");
      return;
    }
    // ensure we're inside a folder
    if (!currentFolder) {
       alert("Please navigate into a folder first to upload a document.");
       return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", uploadTitle);
      formData.append("folderIds", currentFolder.id);
      formData.append("file", uploadFile);

      const url = "https://oneasycompliance.oneasy.ai/admin/folders/documents/upload";
      const token = complianceApi.getToken();
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert("Document uploaded successfully");
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle("");
        fetchDocuments(currentFolder.id);
      } else {
        alert(data.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload error. Please check console.");
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
            {currentFolder && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#00486D] rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-medium"
              >
                <FiUpload className="w-4 h-4" />
                Upload File
              </button>
            )}
            <button
              onClick={() => {
                setParentId(currentFolder ? currentFolder.id : "");
                setShowFolderModal(true);
              }}
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
                  onClick={() => {
                    setParentId(currentFolder ? currentFolder.id : "");
                    setShowFolderModal(true);
                  }}
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
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-blue-100 group text-center"
                  >
                    <BsFolderFill className="w-16 h-16 text-blue-400 group-hover:text-blue-500 mb-3 transition-colors drop-shadow-sm" />
                    <span className="text-sm font-medium text-gray-800 line-clamp-2 w-full break-words" title={folder.name}>
                      {folder.name}
                    </span>
                    {folder.children?.length > 0 && (
                      <span className="text-[10px] text-gray-400 mt-1">
                        {folder.children.length} item(s)
                      </span>
                    )}
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
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white transition-colors shadow-sm group-hover:shadow relative text-gray-400 group-hover:text-blue-500">
                        <FiFileText className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 line-clamp-2 w-full break-words">
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 truncate w-full">
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

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiFolderPlus className="w-5 h-5 text-[#00486D]" />
                Create New Folder
              </h3>
              <button 
                onClick={() => setShowFolderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateFolder} className="p-6 space-y-5">
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
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUploadCloud className="w-5 h-5 text-[#00486D]" />
                Upload Document
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadDocument} className="p-6 space-y-5">
              <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                <FiFolder className="w-5 h-5 shrink-0 mt-0.5" />
                <span>
                  Uploading to: <strong>{currentFolder?.name || 'Unknown'}</strong>
                </span>
              </div>

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
                  Select File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
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
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminResources;
