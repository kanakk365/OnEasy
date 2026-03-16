import React, { useState, useEffect } from "react";
import complianceApi from "../../../utils/complianceApi";
import { FiFolderPlus, FiFolder, FiFileText, FiChevronDown, FiChevronRight, FiExternalLink } from "react-icons/fi";
import { BsFolderFill } from "react-icons/bs";

const FolderItem = ({ folder, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [fetchedDocs, setFetchedDocs] = useState(false);

  const hasChildren = folder.children && folder.children.length > 0;

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await complianceApi.get(`/admin/folders/${folder.id}/documents?page=1&limit=20`);
      if (res && res.items) {
        setDocuments(res.items);
      }
      setFetchedDocs(true);
    } catch (error) {
      console.error("Failed to fetch documents for folder:", folder.id, error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleToggleExpand = () => {
    if (!expanded && !fetchedDocs) {
      fetchDocuments();
    }
    setExpanded(!expanded);
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className="p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50 group flex items-start gap-3 mb-2"
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <button 
          className="mt-1 shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={handleToggleExpand}
        >
          {expanded ? <FiChevronDown className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
        </button>

        <div className="text-[#00486D] mt-1 shrink-0">
          {folder.depth > 0 ? <FiFolder className="w-6 h-6" /> : <BsFolderFill className="w-6 h-6 text-blue-500" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 truncate" title={folder.name}>
              {folder.name}
            </h3>
            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-mono">
              ID: {folder.id}
            </span>
          </div>
          {folder.description && (
            <p className="text-sm text-gray-500 truncate mt-0.5" title={folder.description}>
              {folder.description}
            </p>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="flex flex-col w-full">
          {loadingDocs ? (
            <div 
              className="py-2 text-sm text-gray-400 flex items-center gap-2 mb-2"
              style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
            >
              <div className="w-3 h-3 border-2 border-gray-300 border-t-[#00486D] rounded-full animate-spin"></div>
              Loading documents...
            </div>
          ) : (
            documents.length > 0 && (
              <div className="mb-2 space-y-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-lg hover:border-blue-200 transition-colors shadow-sm"
                    style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate" title={doc.title}>
                          {doc.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate" title={doc.fileName}>
                          {doc.fileName || doc.type}
                        </p>
                      </div>
                    </div>
                    {doc.url && (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Document"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
          
          {hasChildren && folder.children.map((child) => (
            <FolderItem key={child.id} folder={child} level={level + 1} />
          ))}

          {!loadingDocs && documents.length === 0 && !hasChildren && (
            <div 
              className="py-2 text-xs text-gray-400 italic mb-2"
              style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
            >
              This folder is empty.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function AdminResources() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalFolders, setTotalFolders] = useState(0);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const res = await complianceApi.get("/admin/folders?page=1&limit=50");
      if (res && res.items) {
        setFolders(res.items);
        setTotalFolders(res.total || res.items.length);
      }
    } catch (e) {
      console.error("Failed to fetch folders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Folder name is required");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name,
        description,
      };
      // "If it is a folder, then don't send parent ID. If it is a sub folder, then send a parent ID"
      if (parentId.trim() !== "") {
        payload.parentId = parentId.trim();
      }

      const res = await complianceApi.post("/admin/folders", payload);
      // Compliance Api throws on error, so if we reach here it succeeded
      setName("");
      setDescription("");
      setParentId("");
      await fetchFolders();
      alert("Folder created successfully!");
    } catch (e) {
      console.error("Failed to save folder:", e);
      alert("Failed to save folder. Note: Make sure the backend endpoint is available.");
    } finally {
      setSaving(false);
    }
  };

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
                Resources
              </h1>
              <p className="text-gray-500 italic ml-1">
                Manage Folders, Subfolders, and Documents
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Folder Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiFolderPlus className="w-5 h-5 text-[#00486D]" />
                  Create Folder
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                    placeholder="e.g. Q1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow resize-none h-24"
                    placeholder="e.g. Quarter 1 Documents"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                    placeholder="Enter parent ID for subfolder"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Leave blank to create a main folder. Provide an ID to create a subfolder inside it.
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiFolderPlus className="w-4 h-4" />
                        Create Folder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Folder List / Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiFolder className="w-5 h-5 text-[#00486D]" />
                  Explorer
                </h2>
                {totalFolders > 0 && (
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {totalFolders} Root Items
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D] mb-4"></div>
                    <p>Loading folders...</p>
                  </div>
                ) : folders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <FiFolder className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-700">No Folders Found</p>
                    <p className="text-sm mt-1">Create a new folder to get started.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {folders.map((folder) => (
                      <FolderItem key={folder.id} folder={folder} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminResources;
