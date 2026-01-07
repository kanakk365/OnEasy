import React, { useRef, useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineDownload, AiOutlineEye } from "react-icons/ai";
import { BsCalendar3 } from "react-icons/bs";
import apiClient from "../../../utils/api";

const NotesContent = ({
  adminNotesList,
  userNotesList,
  isAddingUserNote,
  setIsAddingUserNote,
  currentUserNote,
  setCurrentUserNote,
  saving,
  handleUserNoteFileUpload,
  removeUserNoteAttachment,
  handleSaveUserNote,
}) => {
  const fileInputRef = useRef(null);
  const [selectedAdminNote, setSelectedAdminNote] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileViewerUrl, setFileViewerUrl] = useState(null);

  // Fetch signed URL when viewing file changes
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!viewingFile) {
        setFileViewerUrl(null);
        return;
      }

      const fileUrl = viewingFile.url;
      if (!fileUrl || typeof fileUrl !== "string") {
        setFileViewerUrl(null);
        return;
      }

      setFileLoading(true);
      setImageError(false);

      try {
        let urlToUse = fileUrl;
        
        // Check if it's an S3 URL and get signed URL if needed
        const isS3Url = fileUrl.includes(".s3.") || fileUrl.includes("amazonaws.com") || fileUrl.includes("s3://");
        
        if (isS3Url) {
          // Get signed URL for S3 file
          try {
            const response = await apiClient.post("/admin/get-signed-url", { s3Url: fileUrl });
            if (response.success && response.signedUrl) {
              urlToUse = response.signedUrl;
            }
          } catch (error) {
            console.warn("Failed to get signed URL, using direct URL:", error);
          }
        }
        
        // For PDFs, always try to fetch as blob to avoid CORS issues in iframe
        // This works better than loading directly in iframe
        if (getFileType(fileUrl) === "pdf") {
          try {
            const response = await fetch(urlToUse);
            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              setFileViewerUrl(blobUrl);
            } else {
              // If fetch fails, try direct URL as fallback
              setFileViewerUrl(urlToUse);
            }
          } catch (error) {
            console.warn("Failed to fetch PDF as blob, using direct URL:", error);
            // For signed URLs that fail to fetch, try the signed URL directly in iframe
            setFileViewerUrl(urlToUse);
          }
        } else {
          // For non-PDF files, use signed URL if available, otherwise original URL
          setFileViewerUrl(urlToUse);
        }
      } catch (error) {
        console.error("Error preparing file URL:", error);
        setFileViewerUrl(fileUrl); // Fallback to original URL
      } finally {
        setFileLoading(false);
      }
    };

    fetchSignedUrl();
  }, [viewingFile]);

  // Cleanup blob URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (fileViewerUrl && fileViewerUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileViewerUrl);
      }
    };
  }, [fileViewerUrl]);

  const handleOpenAdminAttachment = (file, e) => {
    if (!file) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const fileUrl = (file && (file.url || file.data)) || "";

    if (!fileUrl || typeof fileUrl !== "string") {
      return;
    }

    // Set the file to view in the same page
    setViewingFile({
      url: fileUrl,
      name: file.name || file.file_name || "Attachment",
    });
    setImageError(false); // Reset error state when opening a new file
  };

  const getFileType = (url) => {
    if (!url) return "unknown";
    const extension = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return "image";
    }
    if (extension === "pdf") {
      return "pdf";
    }
    return "other";
  };

  // Reusable Input Component
  const StyledInput = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    className = "",
  }) => (
    <div className={className}>
      <label className="block text-sm text-gray-900 mb-2 font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
        />
        {type === "date" && (
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
            <BsCalendar3 />
          </div>
        )}
      </div>
    </div>
  );

  // File Upload Component
  const FileUploadInput = ({ label }) => (
    <div>
      <label className="block text-sm text-gray-900 mb-2 font-medium">
        {label}
      </label>
      <div className="flex bg-white border border-gray-100 rounded-lg p-1 items-center">
        <div
          className="flex-1 px-4 py-2 text-sm text-gray-400 cursor-pointer truncate"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload file
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#00486D] hover:bg-[#01334C] text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
        >
          <AiOutlineDownload className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUserNoteFileUpload}
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>
      {/* Selected Files List */}
      {currentUserNote.attachments &&
        currentUserNote.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {currentUserNote.attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-100 text-xs"
              >
                <span className="truncate text-gray-600 max-w-[80%]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeUserNoteAttachment(idx)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );

  // Empty State Component
  const EmptySectionState = ({ title, buttonText, onAdd }) => (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <div className="mb-4">
        <img src="/empty.svg" alt="No Items" className="w-16 h-16 opacity-90 mx-auto" />
      </div>
      <p className="text-gray-500 text-sm mb-4">{title}</p>
      {buttonText && (
        <button
          type="button"
          onClick={onAdd}
          className="px-5 py-2.5 bg-[#01334C] text-white rounded-md hover:bg-[#01283a] transition-colors text-xs font-medium"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  return (
    <div className="px-6 pb-6 pt-6">
      <div className="space-y-6">
        {/* Admin Notes Section */}
        <div className="bg-[#F8F9FA] rounded-xl p-6">
          <h3 className="text-[15px] font-medium text-gray-900 mb-4">
            Admin Notes
          </h3>
          {adminNotesList.length > 0 ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-[#00486D] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-xs">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                      Files
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {adminNotesList.map((note, idx) => (
                    <tr
                      key={idx}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedAdminNote(note)}
                    >
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                          {note.date || "-"}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <div
                          className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 whitespace-pre-wrap break-words"
                          title={note.description || "-"}
                        >
                          {note.description || "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                          {note.attachments?.length || 0} Files
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptySectionState title="No Admin Notes Yet" />
          )}
        </div>

        {/* My Notes Section */}
        <div className="bg-[#F8F9FA] rounded-xl p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] font-medium text-gray-900">My Notes</h3>
            {userNotesList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddingUserNote(true)}
                className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
              >
                <AiOutlinePlus className="w-3 h-3" /> Add My Notes
              </button>
            )}
          </div>

          {!isAddingUserNote && userNotesList.length === 0 ? (
            <EmptySectionState
              title="No Notes Yet"
              buttonText="Add My Notes"
              onAdd={() => setIsAddingUserNote(true)}
            />
          ) : (
            <div className="space-y-6">
              {/* Existing Notes Table */}
              {userNotesList.length > 0 && (
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-[#00486D] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Attachment
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {userNotesList.map((note, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                              {note.date || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[200px]">
                              {note.description || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-[#00486D] truncate">
                              {/* Displaying first attachment name or count */}
                              {note.attachments && note.attachments.length > 0
                                ? note.attachments[0].name
                                : "-"}
                              {note.attachments &&
                                note.attachments.length > 1 &&
                                ` +${note.attachments.length - 1} more`}
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              // onClick={() => removeUserNote(note.id)} // Placeholder
                              className="text-[#FF3B30] hover:text-red-700 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add New Note Form */}
              {isAddingUserNote && (
                <div className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <StyledInput
                      label="Date"
                      type="date"
                      value={currentUserNote.date}
                      onChange={(e) =>
                        setCurrentUserNote({
                          ...currentUserNote,
                          date: e.target.value,
                        })
                      }
                      placeholder="Choose Date"
                    />
                    <StyledInput
                      label="Description"
                      value={currentUserNote.description}
                      onChange={(e) =>
                        setCurrentUserNote({
                          ...currentUserNote,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter Task Description"
                    />
                    <FileUploadInput label="Attachment" />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setIsAddingUserNote(false)}
                      className="text-[#FF3B30] hover:text-red-700 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveUserNote}
            disabled={saving}
            className="px-8 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Admin Note Details Modal */}
      {selectedAdminNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                Admin Note Details
              </h4>
              <button
                type="button"
                onClick={() => setSelectedAdminNote(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">
                  Date
                </div>
                <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                  {selectedAdminNote.date || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">
                  Description
                </div>
                <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                  {selectedAdminNote.description || "-"}
                </div>
              </div>

              {selectedAdminNote.clientActionItems &&
                selectedAdminNote.clientActionItems.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Client Action Items
                    </div>
                    <ul className="list-disc list-inside text-gray-800 text-xs space-y-1">
                      {selectedAdminNote.clientActionItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedAdminNote.adminActionItems &&
                selectedAdminNote.adminActionItems.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Admin Action Items
                    </div>
                    <ul className="list-disc list-inside text-gray-800 text-xs space-y-1">
                      {selectedAdminNote.adminActionItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">
                  Files
                </div>
                <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 space-y-1">
                  {selectedAdminNote.attachments &&
                  selectedAdminNote.attachments.length > 0 ? (
                    selectedAdminNote.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="text-xs break-all flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          📎 {file.name || file.file_name || "Attachment"}
                        </span>
                        {file.url || file.data ? (
                          <button
                            type="button"
                            onClick={(e) => handleOpenAdminAttachment(file, e)}
                            className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00486D] text-white hover:bg-[#01334C] flex-shrink-0"
                            title="View file"
                          >
                            <AiOutlineEye className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">No files</div>
                  )}
                </div>
              </div>

            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAdminNote(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
                style={{
                  background:
                    "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate flex-1 mr-4">
                {viewingFile.name}
              </h4>
              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              {fileLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading file...</p>
                  </div>
                </div>
              ) : !fileViewerUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500 p-8">
                    <p className="mb-2">Unable to load file</p>
                    <a
                      href={viewingFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              ) : getFileType(viewingFile.url) === "image" ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-auto">
                  {imageError ? (
                    <div className="text-center text-gray-500 p-8">
                      <p className="mb-2">Unable to display image</p>
                      <a
                        href={fileViewerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open in new tab
                      </a>
                    </div>
                  ) : (
                    <img
                      src={fileViewerUrl}
                      alt={viewingFile.name}
                      className="max-w-full max-h-full object-contain"
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
              ) : getFileType(viewingFile.url) === "pdf" ? (
                <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden relative">
                  <iframe
                    src={fileViewerUrl}
                    className="w-full h-full border-0"
                    title={viewingFile.name}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500 p-8">
                    <p className="mb-4">Preview not available for this file type</p>
                    <a
                      href={fileViewerUrl || viewingFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesContent;
