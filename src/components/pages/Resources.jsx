import React, { useState, useEffect } from "react";
import complianceApi from "../../utils/complianceApi";
import { FiFolder, FiFileText, FiChevronRight } from "react-icons/fi";
import { BsFolderFill } from "react-icons/bs";

function Resources() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentFolder, setCurrentFolder] = useState(null); // null means root
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // Current Folder Contents
  const [currentDocuments, setCurrentDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const res = await complianceApi.get("/compliance/folders?page=1&limit=50");
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
      const res = await complianceApi.get(`/compliance/folders/${folderId}/documents?page=1&limit=50`);
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

  // Determine items to display in the current view
  const displayFolders = currentFolder ? (currentFolder.children || []) : folders;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Resources
              </h1>
              <p className="text-gray-500 italic ml-1">
                Browse available resources and documents
              </p>
            </div>
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
                {/* Folders */}
                {displayFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderClick(folder)}
                    className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-blue-100 group text-center relative"
                  >
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
                    <p className="text-sm">This folder is empty.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;
