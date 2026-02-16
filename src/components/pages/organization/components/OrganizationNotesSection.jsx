import React, { useMemo, useState } from "react";
import { AiOutlinePlus, AiOutlineEye } from "react-icons/ai";
import { BsCalendar3 } from "react-icons/bs";
import { FiUpload, FiX } from "react-icons/fi";
import { uploadFileDirect } from "../../../../utils/s3Upload";

const EmptySectionState = ({ title }) => (
  <div className="flex flex-col items-center justify-center text-center py-10">
    <div className="mb-4">
      <img src="/empty.svg" alt="No Items" className="w-16 h-16 opacity-90 mx-auto" />
    </div>
    <p className="text-gray-500 text-sm">{title}</p>
  </div>
);

const OrganizationNotesSection = ({
  adminNotesList = [],
  userNotesList = [],
  organizationId,
  handleViewFile,
  onAddNote,
  onDeleteNote,
  onDeleteUserNote,
  organisations = [],
  onSaveAdminNote,
  onSaveUserNote,
  userId,
}) => {
  const [selectedAdminNote, setSelectedAdminNote] = useState(null);
  const [selectedUserNote, setSelectedUserNote] = useState(null);
  const [isEditingAdminNote, setIsEditingAdminNote] = useState(false);
  const [isEditingUserNote, setIsEditingUserNote] = useState(false);
  const [editedAdminNote, setEditedAdminNote] = useState(null);
  const [editedUserNote, setEditedUserNote] = useState(null);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  // Filter notes by organization ID
  const filteredAdminNotes = useMemo(() => {
    if (!organizationId) return [];
    return adminNotesList.filter(
      (note) => String(note.organizationId) === String(organizationId)
    );
  }, [adminNotesList, organizationId]);

  const filteredUserNotes = useMemo(() => {
    if (!organizationId) return [];
    return userNotesList.filter(
      (note) => String(note.organizationId) === String(organizationId)
    );
  }, [userNotesList, organizationId]);

  return (
    <div className="space-y-6">
      {/* Admin Notes Section */}
      <div className="bg-[#F8F9FA] rounded-xl p-6">
        <h3 className="text-[15px] font-medium text-gray-900 mb-4">
          Admin Notes
        </h3>
        {filteredAdminNotes.length > 0 ? (
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAdminNotes.map((note, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
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
                      <button
                        onClick={() => setSelectedAdminNote(note)}
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

      {/* User Notes Section */}
      <div className="bg-[#F8F9FA] rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[15px] font-medium text-gray-900">My Notes</h3>
          {onAddNote && (
            <button
              type="button"
              onClick={onAddNote}
              className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
            >
              <AiOutlinePlus className="w-3 h-3" /> Add Note
            </button>
          )}
        </div>
        {filteredUserNotes.length > 0 ? (
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
                    Attachments
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUserNotes.map((note, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
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
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-[#00486D]">
                        {note.attachments && note.attachments.length > 0
                          ? `${note.attachments.length} file(s)`
                          : "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedUserNote(note)}
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
          <EmptySectionState title="No Notes Yet" />
        )}
      </div>

      {/* Admin Note Details Modal */}
      {selectedAdminNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h4 className="text-sm font-semibold text-gray-900">
                {isEditingAdminNote ? "Edit Admin Note" : "Admin Note Details"}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSelectedAdminNote(null);
                  setIsEditingAdminNote(false);
                  setEditedAdminNote(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 text-sm">
              {isEditingAdminNote && editedAdminNote ? (
                <>
                  {/* Organization */}
                  {organisations && organisations.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <select
                        value={editedAdminNote.organizationId || ""}
                        onChange={(e) =>
                          setEditedAdminNote({
                            ...editedAdminNote,
                            organizationId: e.target.value || "",
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00486D]"
                      >
                        <option value="">Select organization</option>
                        {organisations.map((org, idx) => (
                          <option key={org.id || idx} value={org.id}>
                            {org.legalName || org.tradeName || org.legal_name || org.trade_name || `Organization ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editedAdminNote.date || ""}
                      onChange={(e) =>
                        setEditedAdminNote({
                          ...editedAdminNote,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00486D]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editedAdminNote.description || ""}
                      onChange={(e) =>
                        setEditedAdminNote({
                          ...editedAdminNote,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter note description..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00486D] min-h-[100px]"
                    />
                  </div>

                  {/* Client Action Items */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Client Action Items
                    </label>
                    {(editedAdminNote.clientActionItems || [""]).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...(editedAdminNote.clientActionItems || [])];
                            updated[idx] = e.target.value;
                            setEditedAdminNote({
                              ...editedAdminNote,
                              clientActionItems: updated,
                            });
                          }}
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00486D]"
                          placeholder="Add client action item"
                        />
                        {(editedAdminNote.clientActionItems || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editedAdminNote.clientActionItems.filter((_, i) => i !== idx);
                              setEditedAdminNote({
                                ...editedAdminNote,
                                clientActionItems: updated.length > 0 ? updated : [""],
                              });
                            }}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditedAdminNote({
                          ...editedAdminNote,
                          clientActionItems: [...(editedAdminNote.clientActionItems || []), ""],
                        })
                      }
                      className="text-xs text-[#00486D] hover:underline"
                    >
                      + Add client action item
                    </button>
                  </div>

                  {/* Admin Action Items */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Admin Action Items
                    </label>
                    {(editedAdminNote.adminActionItems || [""]).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...(editedAdminNote.adminActionItems || [])];
                            updated[idx] = e.target.value;
                            setEditedAdminNote({
                              ...editedAdminNote,
                              adminActionItems: updated,
                            });
                          }}
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00486D]"
                          placeholder="Add admin action item"
                        />
                        {(editedAdminNote.adminActionItems || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editedAdminNote.adminActionItems.filter((_, i) => i !== idx);
                              setEditedAdminNote({
                                ...editedAdminNote,
                                adminActionItems: updated.length > 0 ? updated : [""],
                              });
                            }}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditedAdminNote({
                          ...editedAdminNote,
                          adminActionItems: [...(editedAdminNote.adminActionItems || []), ""],
                        })
                      }
                      className="text-xs text-[#00486D] hover:underline"
                    >
                      + Add admin action item
                    </button>
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Attachments
                    </label>
                    <label
                      className={`flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed rounded-lg ${
                        uploadingAttachments
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-[#00486D] cursor-pointer bg-white"
                      }`}
                    >
                      {uploadingAttachments ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00486D]"></div>
                          <span className="text-xs text-gray-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Click to upload files</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          if (files.length === 0) return;
                          setUploadingAttachments(true);
                          try {
                            const uploadPromises = files.map(async (file) => {
                              try {
                                const folder = `admin-notes/${userId || 'default'}`;
                                const { s3Url } = await uploadFileDirect(
                                  file,
                                  folder,
                                  `${Date.now()}-${file.name}`
                                );
                                return {
                                  name: file.name,
                                  url: s3Url,
                                  type: file.type,
                                  size: file.size,
                                };
                              } catch (error) {
                                console.error(`Error uploading ${file.name}:`, error);
                                return null;
                              }
                            });
                            const uploadedFiles = await Promise.all(uploadPromises);
                            const validFiles = uploadedFiles.filter(f => f !== null);
                            setEditedAdminNote({
                              ...editedAdminNote,
                              attachments: [...(editedAdminNote.attachments || []), ...validFiles],
                            });
                          } catch (error) {
                            console.error("Error uploading files:", error);
                          } finally {
                            setUploadingAttachments(false);
                          }
                        }}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={uploadingAttachments}
                      />
                    </label>
                    {editedAdminNote.attachments && editedAdminNote.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {editedAdminNote.attachments.map((file, idx) => {
                          const fileUrl = file.url || file.data || (typeof file === 'string' ? file : null);
                          const fileName = file.name || (typeof file === 'string' ? file : `Attachment ${idx + 1}`);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs"
                            >
                              <span className="truncate text-gray-700 flex-1">{fileName}</span>
                              <div className="flex items-center gap-2">
                                {fileUrl && handleViewFile && (
                                  <button
                                    type="button"
                                    onClick={() => handleViewFile(fileUrl)}
                                    className="p-1 text-[#00486D] hover:text-[#01334C]"
                                    title="View file"
                                  >
                                    <AiOutlineEye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = editedAdminNote.attachments.filter((_, i) => i !== idx);
                                    setEditedAdminNote({
                                      ...editedAdminNote,
                                      attachments: updated,
                                    });
                                  }}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  {/* Organization */}
                  {selectedAdminNote.organizationId && organisations && organisations.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Organization
                      </div>
                      <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                        {(() => {
                          const match = organisations.find(
                            (o) => String(o.id) === String(selectedAdminNote.organizationId)
                          );
                          return match?.legalName || match?.tradeName || match?.legal_name || match?.trade_name || "-";
                        })()}
                      </div>
                    </div>
                  )}

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
                              {fileUrl && handleViewFile && (
                                <button
                                  onClick={() => handleViewFile(fileUrl)}
                                  className="p-1 text-[#00486D] hover:text-[#01334C] transition-colors flex-shrink-0"
                                  title="View file"
                                >
                                  <AiOutlineEye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center sticky bottom-0 bg-white">
              {isEditingAdminNote ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAdminNote(false);
                      setEditedAdminNote(null);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex gap-2">
                    {onDeleteNote && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const noteIndex = adminNotesList.findIndex(
                            (note) =>
                              (note.id && selectedAdminNote.id && note.id === selectedAdminNote.id) ||
                              note === selectedAdminNote
                          );
                          if (noteIndex !== -1 && window.confirm("Are you sure you want to delete this note?")) {
                            onDeleteNote(noteIndex, selectedAdminNote);
                            setSelectedAdminNote(null);
                            setIsEditingAdminNote(false);
                            setEditedAdminNote(null);
                          }
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                    {onSaveAdminNote && (
                      <button
                        type="button"
                        onClick={async () => {
                          const noteIndex = adminNotesList.findIndex(
                            (note) =>
                              (note.id && selectedAdminNote.id && note.id === selectedAdminNote.id) ||
                              note === selectedAdminNote
                          );
                          if (noteIndex !== -1) {
                            await onSaveAdminNote(editedAdminNote, noteIndex);
                            setIsEditingAdminNote(false);
                            setEditedAdminNote(null);
                            setSelectedAdminNote(null);
                          }
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
                        style={{
                          background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                        }}
                      >
                        Save
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {onDeleteNote && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const noteIndex = adminNotesList.findIndex(
                          (note) =>
                            (note.id && selectedAdminNote.id && note.id === selectedAdminNote.id) ||
                            note === selectedAdminNote
                        );
                        if (noteIndex !== -1 && window.confirm("Are you sure you want to delete this note?")) {
                          onDeleteNote(noteIndex, selectedAdminNote);
                          setSelectedAdminNote(null);
                        }
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdminNote(null);
                        setIsEditingAdminNote(false);
                        setEditedAdminNote(null);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    {onSaveAdminNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingAdminNote(true);
                          setEditedAdminNote({
                            organizationId: selectedAdminNote.organizationId || "",
                            date: selectedAdminNote.date || "",
                            description: selectedAdminNote.description || "",
                            attachments: selectedAdminNote.attachments || [],
                            adminActionItems:
                              selectedAdminNote.adminActionItems && selectedAdminNote.adminActionItems.length
                                ? selectedAdminNote.adminActionItems
                                : [""],
                            clientActionItems:
                              selectedAdminNote.clientActionItems && selectedAdminNote.clientActionItems.length
                                ? selectedAdminNote.clientActionItems
                                : [""],
                            id: selectedAdminNote.id,
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Note Details Modal */}
      {selectedUserNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
            <div className="px-6 py-4 space-y-4 text-sm">
              {isEditingUserNote && editedUserNote ? (
                <>
                  {/* Organization */}
                  {organisations && organisations.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <select
                        value={editedUserNote.organizationId || ""}
                        onChange={(e) =>
                          setEditedUserNote({
                            ...editedUserNote,
                            organizationId: e.target.value || "",
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00486D]"
                      >
                        <option value="">Select organization</option>
                        {organisations.map((org, idx) => (
                          <option key={org.id || idx} value={org.id}>
                            {org.legalName || org.tradeName || org.legal_name || org.trade_name || `Organization ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editedUserNote.date || ""}
                      onChange={(e) =>
                        setEditedUserNote({
                          ...editedUserNote,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00486D]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editedUserNote.description || ""}
                      onChange={(e) =>
                        setEditedUserNote({
                          ...editedUserNote,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter note description..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00486D] min-h-[100px]"
                    />
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Attachments
                    </label>
                    <label
                      className={`flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed rounded-lg ${
                        uploadingAttachments
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-[#00486D] cursor-pointer bg-white"
                      }`}
                    >
                      {uploadingAttachments ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00486D]"></div>
                          <span className="text-xs text-gray-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Click to upload files</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          if (files.length === 0) return;
                          setUploadingAttachments(true);
                          try {
                            const uploadPromises = files.map(async (file) => {
                              try {
                                const folder = `user-notes/${userId || 'default'}`;
                                const { s3Url } = await uploadFileDirect(
                                  file,
                                  folder,
                                  `${Date.now()}-${file.name}`
                                );
                                return {
                                  name: file.name,
                                  url: s3Url,
                                  type: file.type,
                                  size: file.size,
                                };
                              } catch (error) {
                                console.error(`Error uploading ${file.name}:`, error);
                                return null;
                              }
                            });
                            const uploadedFiles = await Promise.all(uploadPromises);
                            const validFiles = uploadedFiles.filter(f => f !== null);
                            setEditedUserNote({
                              ...editedUserNote,
                              attachments: [...(editedUserNote.attachments || []), ...validFiles],
                            });
                          } catch (error) {
                            console.error("Error uploading files:", error);
                          } finally {
                            setUploadingAttachments(false);
                          }
                        }}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={uploadingAttachments}
                      />
                    </label>
                    {editedUserNote.attachments && editedUserNote.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {editedUserNote.attachments.map((file, idx) => {
                          const fileUrl = file.url || file.data || (typeof file === 'string' ? file : null);
                          const fileName = file.name || (typeof file === 'string' ? file : `Attachment ${idx + 1}`);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs"
                            >
                              <span className="truncate text-gray-700 flex-1">{fileName}</span>
                              <div className="flex items-center gap-2">
                                {fileUrl && handleViewFile && (
                                  <button
                                    type="button"
                                    onClick={() => handleViewFile(fileUrl)}
                                    className="p-1 text-[#00486D] hover:text-[#01334C]"
                                    title="View file"
                                  >
                                    <AiOutlineEye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = editedUserNote.attachments.filter((_, i) => i !== idx);
                                    setEditedUserNote({
                                      ...editedUserNote,
                                      attachments: updated,
                                    });
                                  }}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  {/* Organization */}
                  {selectedUserNote.organizationId && organisations && organisations.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Organization
                      </div>
                      <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                        {(() => {
                          const match = organisations.find(
                            (o) => String(o.id) === String(selectedUserNote.organizationId)
                          );
                          return match?.legalName || match?.tradeName || match?.legal_name || match?.trade_name || "-";
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Date
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {selectedUserNote.date || "-"}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Description
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                      {selectedUserNote.description || "-"}
                    </div>
                  </div>

                  {/* Files */}
                  {selectedUserNote.attachments && selectedUserNote.attachments.length > 0 ? (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Files
                      </div>
                      <div className="space-y-2">
                        {selectedUserNote.attachments.map((file, idx) => {
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
                              {fileUrl && handleViewFile && (
                                <button
                                  onClick={() => handleViewFile(fileUrl)}
                                  className="p-1 text-[#00486D] hover:text-[#01334C] transition-colors flex-shrink-0"
                                  title="View file"
                                >
                                  <AiOutlineEye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Files
                      </div>
                      <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                        <span className="text-xs text-gray-500">No files</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center sticky bottom-0 bg-white">
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
                  <div className="flex gap-2">
                    {onDeleteUserNote && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const noteIndex = userNotesList.findIndex(
                            (note) =>
                              (note.id && selectedUserNote.id && note.id === selectedUserNote.id) ||
                              note === selectedUserNote
                          );
                          if (noteIndex !== -1 && window.confirm("Are you sure you want to delete this note?")) {
                            onDeleteUserNote(noteIndex, selectedUserNote);
                            setSelectedUserNote(null);
                            setIsEditingUserNote(false);
                            setEditedUserNote(null);
                          }
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                    {onSaveUserNote && (
                      <button
                        type="button"
                        onClick={async () => {
                          const noteIndex = userNotesList.findIndex(
                            (note) =>
                              (note.id && selectedUserNote.id && note.id === selectedUserNote.id) ||
                              note === selectedUserNote
                          );
                          if (noteIndex !== -1) {
                            await onSaveUserNote(editedUserNote, noteIndex);
                            setIsEditingUserNote(false);
                            setEditedUserNote(null);
                            setSelectedUserNote(null);
                          }
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
                        style={{
                          background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                        }}
                      >
                        Save
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {onDeleteUserNote && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const noteIndex = userNotesList.findIndex(
                          (note) =>
                            (note.id && selectedUserNote.id && note.id === selectedUserNote.id) ||
                            note === selectedUserNote
                        );
                        if (noteIndex !== -1 && window.confirm("Are you sure you want to delete this note?")) {
                          onDeleteUserNote(noteIndex, selectedUserNote);
                          setSelectedUserNote(null);
                        }
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserNote(null);
                        setIsEditingUserNote(false);
                        setEditedUserNote(null);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    {onSaveUserNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingUserNote(true);
                          setEditedUserNote({
                            organizationId: selectedUserNote.organizationId || "",
                            date: selectedUserNote.date || "",
                            description: selectedUserNote.description || "",
                            attachments: selectedUserNote.attachments || [],
                            id: selectedUserNote.id,
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationNotesSection;
