import React, { useRef, useState } from "react";
import { AiOutlinePlus, AiOutlineDownload } from "react-icons/ai";
import { BsCalendar3 } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { uploadFileDirect } from "../../../utils/s3Upload";

// Reusable Input Component - moved outside to prevent recreation
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

// Empty State Component - moved outside to prevent recreation
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
  removeUserNote,
  handleViewFile,
  updateUserNote,
  organizations = [],
  userId,
}) => {
  const fileInputRef = useRef(null);
  const [selectedAdminNote, setSelectedAdminNote] = useState(null);
  const [selectedUserNote, setSelectedUserNote] = useState(null);
  const [isEditingUserNote, setIsEditingUserNote] = useState(false);
  const [editedUserNote, setEditedUserNote] = useState(null);

  const getOrgName = (orgId) => {
    if (!orgId || !Array.isArray(organizations)) return "-";
    const match = organizations.find(
      (o) => String(o.id) === String(orgId),
    );
    return match?.legalName || match?.tradeName || "-";
  };

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
                      Organization
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-xs">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {adminNotesList.map((note, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAdminNote(note)}
                    >
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                          {note.date || "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[200px]">
                          {getOrgName(note.organizationId)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[400px]">
                          {note.description || "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          className="flex items-center gap-1 px-3 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs font-medium"
                        >
                          <AiOutlineEye className="w-4 h-4" />
                          View Details
                        </button>
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

        {/* Admin Note Details Modal */}
        {selectedAdminNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
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
                {/* Date */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Date
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                    {selectedAdminNote.date || "-"}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Description
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                    {selectedAdminNote.description || "-"}
                  </div>
                </div>

                {/* Client Action Items */}
                {selectedAdminNote.clientActionItems && selectedAdminNote.clientActionItems.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Client Action Items
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      <ul className="list-disc list-inside space-y-1">
                        {selectedAdminNote.clientActionItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Admin Action Items */}
                {selectedAdminNote.adminActionItems && selectedAdminNote.adminActionItems.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Admin Action Items
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      <ul className="list-disc list-inside space-y-1">
                        {selectedAdminNote.adminActionItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Files */}
                {selectedAdminNote.attachments && selectedAdminNote.attachments.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Files
                    </div>
                    <div className="space-y-2">
                      {selectedAdminNote.attachments.map((file, idx) => {
                        // Determine file URL - could be in url, data, or the file itself is a string URL
                        const fileUrl = file.url || file.data || (typeof file === 'string' ? file : null);
                        const fileName = file.name || (typeof file === 'string' ? file : `Attachment ${idx + 1}`);
                        
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border border-gray-100"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <svg
                                className="w-4 h-4 text-gray-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-xs text-gray-800 truncate">
                                {fileName}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (fileUrl) {
                                  handleViewFile(fileUrl);
                                } else {
                                  alert('File URL not available');
                                }
                              }}
                              className="p-1 text-[#00486D] hover:text-[#01334C] transition-colors flex-shrink-0"
                              title="View file"
                            >
                              <AiOutlineEye className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


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
                          Organization
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
                        <tr 
                          key={idx}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedUserNote(note)}
                        >
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                              {note.date || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate">
                              {getOrgName(note.organizationId)}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to remove this note?')) {
                                  removeUserNote(note);
                                }
                              }}
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
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Organization
                      </label>
                      <select
                        value={currentUserNote.organizationId || ""}
                        onChange={(e) =>
                          setCurrentUserNote({
                            ...currentUserNote,
                            organizationId: e.target.value || null,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select organization</option>
                        {organizations.map((org, idx) => (
                          <option key={org.id || idx} value={org.id}>
                            {org.legalName || org.tradeName || `Organization ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
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

        {/* User Note Details Modal */}
        {selectedUserNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h4 className="text-sm font-semibold text-gray-900">
                  {isEditingUserNote ? "Edit My Note" : "My Note Details"}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserNote(null);
                    setIsEditingUserNote(false);
                    setEditedUserNote(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-4 space-y-3 text-sm">
                {/* Organization */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Organization
                  </div>
                  {isEditingUserNote ? (
                    <select
                      value={editedUserNote?.organizationId || selectedUserNote.organizationId || ""}
                      onChange={(e) => setEditedUserNote({ ...editedUserNote, organizationId: e.target.value || null })}
                      className="w-full px-3 py-2 bg-white rounded-md border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                    >
                      <option value="">Select organization</option>
                      {organizations.map((org, idx) => (
                        <option key={org.id || idx} value={org.id}>
                          {org.legalName || org.tradeName || `Organization ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {getOrgName(selectedUserNote.organizationId) || "-"}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Date
                  </div>
                  {isEditingUserNote ? (
                    <input
                      type="date"
                      value={editedUserNote?.date || selectedUserNote.date || ""}
                      onChange={(e) => setEditedUserNote({ ...editedUserNote, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-md border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {selectedUserNote.date || "-"}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Description
                  </div>
                  {isEditingUserNote ? (
                    <textarea
                      value={editedUserNote?.description || selectedUserNote.description || ""}
                      onChange={(e) => setEditedUserNote({ ...editedUserNote, description: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-md border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#00486D] min-h-[80px]"
                      placeholder="Enter note description"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                      {selectedUserNote.description || "-"}
                    </div>
                  )}
                </div>

                {/* Files/Attachments */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Attachments
                  </div>
                  {isEditingUserNote ? (
                    <div className="space-y-2">
                      {/* Existing attachments */}
                      {(editedUserNote?.attachments || selectedUserNote.attachments || []).map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border border-gray-100"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg
                              className="w-4 h-4 text-gray-500 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-xs text-gray-800 truncate">
                              {file.name || file.file_name || `Attachment ${idx + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(file.url || file.data) && (
                              <button
                                onClick={() => {
                                  const fileUrl = file.url || file.data;
                                  if (fileUrl) {
                                    handleViewFile(fileUrl);
                                  }
                                }}
                                className="p-1 text-[#00486D] hover:text-[#01334C] transition-colors"
                                title="View file"
                              >
                                <AiOutlineEye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const updatedAttachments = (editedUserNote?.attachments || selectedUserNote.attachments || []).filter((_, i) => i !== idx);
                                setEditedUserNote({ ...editedUserNote, attachments: updatedAttachments });
                              }}
                              className="p-1 text-red-600 hover:text-red-700 transition-colors"
                              title="Remove file"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* File upload input */}
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Add Attachment
                        </label>
                        <div className="flex bg-white border border-gray-200 rounded-lg p-1 items-center">
                          <div
                            className="flex-1 px-3 py-2 text-xs text-gray-400 cursor-pointer truncate"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Click to upload files
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#00486D] hover:bg-[#01334C] text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                          >
                            <AiOutlineDownload className="w-4 h-4" />
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={async (e) => {
                              const files = Array.from(e.target.files);
                              if (files.length === 0) return;

                              try {
                                // Get user ID
                                let currentUserId = userId;
                                if (!currentUserId) {
                                  const userData = JSON.parse(
                                    localStorage.getItem("user") || "{}"
                                  );
                                  currentUserId = userData.id || userData.user_id;
                                }

                                if (!currentUserId) {
                                  alert("User ID not found. Please refresh the page.");
                                  return;
                                }

                                // Upload each file to S3
                                const uploadedFiles = [];
                                for (const file of files) {
                                  try {
                                    if (file.size > 5 * 1024 * 1024) {
                                      alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                                      continue;
                                    }

                                    const folder = `user-notes/${currentUserId}`;
                                    const { s3Url } = await uploadFileDirect(file, folder, file.name);

                                    uploadedFiles.push({
                                      name: file.name,
                                      url: s3Url,
                                      type: file.type,
                                      size: file.size,
                                    });
                                  } catch (error) {
                                    console.error(`Error uploading ${file.name}:`, error);
                                    alert(`Failed to upload ${file.name}. Please try again.`);
                                  }
                                }

                                // Update editedUserNote with new attachments
                                if (uploadedFiles.length > 0) {
                                  setEditedUserNote({
                                    ...editedUserNote,
                                    attachments: [
                                      ...(editedUserNote?.attachments || selectedUserNote.attachments || []),
                                      ...uploadedFiles,
                                    ],
                                  });
                                }

                                // Reset file input
                                e.target.value = "";
                              } catch (error) {
                                console.error("Error in file upload:", error);
                                alert("Failed to upload files. Please try again.");
                              }
                            }}
                            className="hidden"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedUserNote.attachments && selectedUserNote.attachments.length > 0 ? (
                        selectedUserNote.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border border-gray-100"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <svg
                                className="w-4 h-4 text-gray-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-xs text-gray-800 truncate">
                                {file.name || file.file_name || `Attachment ${idx + 1}`}
                              </span>
                            </div>
                            {(file.url || file.data) && (
                              <button
                                onClick={() => {
                                  const fileUrl = file.url || file.data;
                                  if (fileUrl) {
                                    handleViewFile(fileUrl);
                                  }
                                }}
                                className="p-1 text-[#00486D] hover:text-[#01334C] transition-colors"
                                title="View file"
                              >
                                <AiOutlineEye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500 px-3 py-2">No files</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-3 border-t border-gray-100 flex justify-between">
                <div>
                  {!isEditingUserNote && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this note?')) {
                          if (removeUserNote) {
                            await removeUserNote(selectedUserNote);
                            setSelectedUserNote(null);
                          }
                        }
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditingUserNote ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingUserNote(false);
                          setEditedUserNote(null);
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (updateUserNote) {
                            const success = await updateUserNote(editedUserNote, selectedUserNote);
                            if (success) {
                              setSelectedUserNote(null);
                              setIsEditingUserNote(false);
                              setEditedUserNote(null);
                            }
                          }
                        }}
                        disabled={saving}
                        className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-50"
                        style={{
                          background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                        }}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingUserNote(true);
                        setEditedUserNote({
                          organizationId: selectedUserNote.organizationId || null,
                          date: selectedUserNote.date || "",
                          description: selectedUserNote.description || "",
                          attachments: selectedUserNote.attachments || [],
                        });
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
                      style={{
                        background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesContent;
