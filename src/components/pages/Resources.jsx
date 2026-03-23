import React, { useState, useEffect, useMemo, useRef } from "react";
import complianceApi from "../../utils/complianceApi";
import { FiFolder, FiFileText, FiChevronRight, FiHome, FiDownload, FiEye, FiSearch, FiX } from "react-icons/fi";
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

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [allDocuments, setAllDocuments] = useState([]); // cached docs from all folders
  const [loadingAllDocs, setLoadingAllDocs] = useState(false);
  const [allDocsLoaded, setAllDocsLoaded] = useState(false);
  const searchInputRef = useRef(null);

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

  // Build the breadcrumb path for a folder from the tree
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

  // Flatten all folders recursively for searching
  const flattenFolders = (foldersList, parentPath = []) => {
    let result = [];
    for (const folder of foldersList) {
      const pathNames = [...parentPath, folder.name];
      result.push({
        ...folder,
        type: "folder",
        pathNames, // e.g. ["Invoices", "Service business"]
        parentPathDisplay: parentPath.length > 0 ? parentPath.join(" / ") : "Root",
      });
      if (folder.children && folder.children.length > 0) {
        result = result.concat(flattenFolders(folder.children, pathNames));
      }
    }
    return result;
  };

  // Collect all leaf folder IDs (folders with no children or that might contain documents)
  const collectLeafFolderIds = (foldersList) => {
    let ids = [];
    for (const f of foldersList) {
      ids.push(f.id);
      if (f.children && f.children.length > 0) {
        ids = ids.concat(collectLeafFolderIds(f.children));
      }
    }
    return ids;
  };

  // Fetch documents from all folders for search
  const fetchAllDocuments = async () => {
    if (allDocsLoaded || loadingAllDocs) return;
    setLoadingAllDocs(true);
    try {
      const allFolderIds = collectLeafFolderIds(folders);
      const allDocs = [];

      // Fetch documents from all folders in parallel (batched)
      const batchSize = 5;
      for (let i = 0; i < allFolderIds.length; i += batchSize) {
        const batch = allFolderIds.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (folderId) => {
            try {
              const res = await complianceApi.get(`/compliance/folders/${folderId}/documents?page=1&limit=50`);
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

  // Load all documents when user starts typing in search
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
    // Build full breadcrumb path from root to this folder
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
    const flatFolders = flattenFolders(folders);
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
        // Find parent folder info for display
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

  // Determine items to display in the current view
  const displayFolders = currentFolder ? (currentFolder.children || []) : folders;

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
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent placeholder:text-gray-400 transition-all"
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
                  className={`hover:text-[#00486D] transition-colors flex items-center gap-1 ${!currentFolder ? 'text-[#00486D]' : ''}`}
                  title="Home"
                >
                  <FiHome className="w-4 h-4" />
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
            )}

            {/* Search indicator */}
            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>
                  {loadingAllDocs ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-gray-300 border-t-[#00486D] rounded-full animate-spin"></span>
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
          <div className="flex-1 p-6 relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white/80 z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D] mb-4"></div>
                <p>Loading Explorer...</p>
              </div>
            ) : isSearching ? (
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
                          <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#00486D] flex-shrink-0 transition-colors" />
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
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#022B51] text-white hover:bg-[#015079] transition-colors"
                              title="Download file"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiDownload className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={item.url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#022B51] text-[#022B51] hover:bg-[#022B51] hover:text-white transition-colors"
                              title="View file"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiEye className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleSearchDocumentClick(item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-[#00486D] hover:bg-blue-50 transition-colors"
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
                  ) : (
                    currentDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col items-center p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors border border-gray-100 hover:border-blue-100 group text-center"
                      >
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white transition-colors shadow-sm group-hover:shadow text-gray-400 group-hover:text-blue-500">
                          <FiFileText className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 line-clamp-2 w-full break-words px-2 mb-3" title={doc.title}>
                          {doc.title}
                        </span>
                        <div className="flex items-center gap-2 mt-auto">
                          <a
                            href={doc.url || "#"}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#022B51] text-white hover:bg-[#015079] transition-colors"
                            title="Download file"
                          >
                            <FiDownload className="w-3 h-3" />

                          </a>
                          <a
                            href={doc.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#022B51] text-[#022B51] hover:bg-[#022B51] hover:text-white transition-colors"
                            title="View file"
                          >
                            <FiEye className="w-3 h-3" />

                          </a>
                        </div>
                      </div>
                    ))
                  )
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
