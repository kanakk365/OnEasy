import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEye } from "react-icons/fi";

function ClientNotesTab({
  adminNotesList,
  userNotesList,
  isAddingNote,
  setIsAddingNote,
  editingNoteIndex,
  setEditingNoteIndex,
  currentNote,
  setCurrentNote,
  savingNotes,
  handleSaveAdminNote,
  handleEditNote,
  handleDeleteNote,
  handleNoteFileUpload,
  removeNoteAttachment,
  uploadingAttachments,
  organisations,
  selectedAdminNote,
  setSelectedAdminNote,
  selectedUserNote,
  setSelectedUserNote,
  handleViewFile,
}) {
  return (
        <div className="px-6 pb-6 pt-6">
          <div className="space-y-6">
            {/* Admin Notes Section */}
            <div className="bg-[#F8F9FA] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-medium text-gray-900">
                  Admin Notes (Editable)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNote(true)}
                  className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
                >
                  <AiOutlinePlus className="w-3 h-3" />
                  Add Note
                </button>
              </div>

              {/* Add/Edit Note Form */}
              {isAddingNote && (
                <div className="mb-4 p-4 bg-white border border-gray-100 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    {editingNoteIndex !== null ? "Edit Note" : "New Note"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Organization
                      </label>
                      <select
                        value={currentNote.organizationId || ""}
                        onChange={(e) =>
                          setCurrentNote({
                            ...currentNote,
                            organizationId: e.target.value || "",
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select organization</option>
                        {organisations.map((org, idx) => (
                          <option key={org.id || idx} value={org.id}>
                            {org.legalName || org.tradeName || `Organization ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Date
                      </label>
                      <input
                        type="date"
                        value={currentNote.date}
                        onChange={(e) =>
                          setCurrentNote({
                            ...currentNote,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Description
                      </label>
                      <textarea
                        value={currentNote.description}
                        onChange={(e) =>
                          setCurrentNote({
                            ...currentNote,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter note description..."
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Client Action Items
                      </label>
                      {(currentNote.clientActionItems || [""]).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 mb-2"
                          >
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const updated = [
                                  ...(currentNote.clientActionItems || []),
                                ];
                                updated[idx] = e.target.value;
                                setCurrentNote({
                                  ...currentNote,
                                  clientActionItems: updated,
                                });
                              }}
                              className="flex-1 px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Add client action item"
                            />
                          </div>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentNote({
                            ...currentNote,
                            clientActionItems: [
                              ...(currentNote.clientActionItems || []),
                              "",
                            ],
                          })
                        }
                        className="mt-1 text-xs text-[#00486D] hover:underline"
                      >
                        + Add client action item
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Admin Action Items
                      </label>
                      {(currentNote.adminActionItems || [""]).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 mb-2"
                          >
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const updated = [
                                  ...(currentNote.adminActionItems || []),
                                ];
                                updated[idx] = e.target.value;
                                setCurrentNote({
                                  ...currentNote,
                                  adminActionItems: updated,
                                });
                              }}
                              className="flex-1 px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Add admin action item"
                            />
                          </div>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentNote({
                            ...currentNote,
                            adminActionItems: [
                              ...(currentNote.adminActionItems || []),
                              "",
                            ],
                          })
                        }
                        className="mt-1 text-xs text-[#00486D] hover:underline"
                      >
                        + Add admin action item
                      </button>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="mt-4">
                    <label className="block text-sm text-gray-900 mb-2 font-medium">
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
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          <span className="text-xs text-gray-600">Click to upload files</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        onChange={handleNoteFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={uploadingAttachments}
                      />
                    </label>
                    {currentNote.attachments && currentNote.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {currentNote.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs"
                          >
                            <span className="truncate text-gray-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeNoteAttachment(idx)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setIsAddingNote(false);
                        setEditingNoteIndex(null);
                        setCurrentNote({
                          date: "",
                          description: "",
                          attachments: [],
                        });
                      }}
                      className="text-[#FF3B30] hover:text-red-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAdminNote}
                      disabled={savingNotes}
                      className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold disabled:opacity-50"
                    >
                      {savingNotes
                        ? "Saving..."
                        : editingNoteIndex !== null
                        ? "Update"
                        : "Save"}
                    </button>
                  </div>
                </div>
              )}

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
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Attachment
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {adminNotesList.map((note, idx) => {
                        const getShortDescription = (text) => {
                          if (!text || typeof text !== "string") return "-";
                          const words = text.trim().split(/\s+/);
                          if (words.length <= 5) return text;
                          return words.slice(0, 5).join(" ") + "...";
                        };
                        const getOrgName = (orgId) => {
                          if (!orgId) return "-";
                          const match = organisations.find(
                            (o) => String(o.id) === String(orgId)
                          );
                          return (
                            match?.legalName ||
                            match?.tradeName ||
                            `Org ${match?.id || ""}` ||
                            "-"
                          );
                        };
                        return (
                          <tr
                            key={note.id || idx}
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
                              <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[200px]">
                                {getShortDescription(note.description)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                                {note.attachments?.length || 0} file(s)
                              </div>
                            </td>
                            <td className="p-3">
                              <button
                                className="flex items-center gap-1 px-3 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs font-medium"
                              >
                                <FiEye className="w-4 h-4" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="mb-4">
                    <img src="/empty.svg" alt="No Items" className="w-16 h-16 opacity-90 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No Admin Notes Yet</p>
                </div>
              )}
            </div>

            {/* User Notes Section */}
            <div className="bg-[#F8F9FA] rounded-xl p-6">
              <h3 className="text-[15px] font-medium text-gray-900 mb-4">
                User Notes (Read Only)
              </h3>
              {userNotesList.length > 0 ? (
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
                      {userNotesList.map((note, idx) => {
                        const getShortDescription = (text) => {
                          if (!text || typeof text !== "string") return "-";
                          const words = text.trim().split(/\s+/);
                          if (words.length <= 5) return text;
                          return words.slice(0, 5).join(" ") + "...";
                        };
                        const getOrgName = (orgId) => {
                          if (!orgId) return "-";
                          const match = organisations.find(
                            (o) => String(o.id) === String(orgId)
                          );
                          return (
                            match?.legalName ||
                            match?.tradeName ||
                            `Org ${match?.id || ""}` ||
                            "-"
                          );
                        };
                        return (
                          <tr
                            key={note.id || idx}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedUserNote(note)}
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
                              <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[200px]">
                                {getShortDescription(note.description)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                                {note.attachments?.length || 0} file(s)
                              </div>
                            </td>
                            <td className="p-3">
                              <button
                                className="flex items-center gap-1 px-3 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs font-medium"
                              >
                                <FiEye className="w-4 h-4" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="mb-4">
                    <img src="/empty.svg" alt="No Items" className="w-16 h-16 opacity-90 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">No User Notes Yet</p>
                </div>
              )}
            </div>

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
                      Organization
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {(() => {
                        if (!selectedAdminNote.organizationId) return "-";
                        const match = organisations.find(
                          (o) =>
                            String(o.id) ===
                            String(selectedAdminNote.organizationId)
                        );
                        return (
                          match?.legalName ||
                          match?.tradeName ||
                          `Org ${match?.id || ""}` ||
                          "-"
                        );
                      })()}
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
                        <ul className="list-disc list-inside text-gray-800 text-xs space-y-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-100">
                          {selectedAdminNote.clientActionItems.map(
                            (item, idx) => (
                              <li key={idx}>{item}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {selectedAdminNote.adminActionItems &&
                    selectedAdminNote.adminActionItems.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          Admin Action Items
                        </div>
                        <ul className="list-disc list-inside text-gray-800 text-xs space-y-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-100">
                          {selectedAdminNote.adminActionItems.map(
                            (item, idx) => (
                              <li key={idx}>{item}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Files
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 space-y-2">
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
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const fileUrl = file.url || file.data;
                                  if (fileUrl) {
                                    await handleViewFile(fileUrl);
                                  }
                                }}
                                className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00486D] text-white hover:bg-[#01334C] flex-shrink-0"
                                title="View file"
                              >
                                <FiEye className="w-4 h-4" />
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
                <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const noteIndex = adminNotesList.findIndex(
                        (note) =>
                          (note.id &&
                            selectedAdminNote.id &&
                            note.id === selectedAdminNote.id) ||
                          note === selectedAdminNote
                      );
                      if (noteIndex !== -1) {
                        handleDeleteNote(noteIndex);
                        setSelectedAdminNote(null);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAdminNote(null)}
                      className="px-4 py-1.5 text-xs font-semibold text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const noteIndex = adminNotesList.findIndex(
                          (note) =>
                            (note.id &&
                              selectedAdminNote.id &&
                              note.id === selectedAdminNote.id) ||
                            note === selectedAdminNote
                        );
                        if (noteIndex !== -1) {
                          handleEditNote(selectedAdminNote, noteIndex);
                          setSelectedAdminNote(null);
                        }
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
                      style={{
                        background:
                          "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Note Details Modal */}
          {selectedUserNote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h4 className="text-sm font-semibold text-gray-900">
                    User Note Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedUserNote(null)}
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
                      {selectedUserNote.date || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Description
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                      {selectedUserNote.description || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Files
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 space-y-2">
                      {selectedUserNote.attachments &&
                      selectedUserNote.attachments.length > 0 ? (
                        selectedUserNote.attachments.map((file, idx) => (
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
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const fileUrl = file.url || file.data;
                                  if (fileUrl) {
                                    await handleViewFile(fileUrl);
                                  }
                                }}
                                className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00486D] text-white hover:bg-[#01334C] flex-shrink-0"
                                title="View file"
                              >
                                <FiEye className="w-4 h-4" />
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
              </div>
            </div>
          )}
        </div>
  );
}

export default ClientNotesTab;