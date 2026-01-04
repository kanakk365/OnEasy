import React from "react";

const NotesContent = ({
  adminNotesList,
  userNotesList,
  expandedAdminNoteId,
  setExpandedAdminNoteId,
  expandedUserNoteId,
  setExpandedUserNoteId,
  isAddingUserNote,
  setIsAddingUserNote,
  currentUserNote,
  setCurrentUserNote,
  saving,
  handleUserNoteFileUpload,
  removeUserNoteAttachment,
  handleSaveUserNote,
}) => {
  return (
    <div className="px-6 pb-6 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Notes Section - Read Only for Users */}
        <div className="border-r border-gray-200 pr-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Admin Notes
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Read Only
            </span>
          </h3>

          {/* Admin Notes Table - Read Only */}
          {adminNotesList.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Date
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Description
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Files
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminNotesList.map((note, idx) => (
                  <React.Fragment key={note.id || idx}>
                    <tr
                      onClick={() =>
                        setExpandedAdminNoteId(
                          expandedAdminNoteId === idx ? null : idx
                        )
                      }
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {note.date || "-"}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate text-xs">
                        {note.description || "-"}
                      </td>
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {note.attachments?.length || 0}
                      </td>
                    </tr>
                    {expandedAdminNoteId === idx && (
                      <tr className="bg-gray-50">
                        <td colSpan="3" className="px-3 py-3">
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">
                                Date:
                              </span>{" "}
                              <span className="text-gray-600">
                                {note.date || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Description:
                              </span>
                              <p className="text-gray-600 mt-1">
                                {note.description}
                              </p>
                            </div>
                            {note.attachments &&
                              note.attachments.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Attachments:
                                  </span>
                                  <div className="mt-1 space-y-1">
                                    {note.attachments.map((file, fileIdx) => (
                                      <div key={fileIdx}>
                                        {file.url || file.data ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const fileUrl =
                                                file.url || file.data;
                                              if (fileUrl.startsWith("data:")) {
                                                const link =
                                                  document.createElement("a");
                                                link.href = fileUrl;
                                                link.download = file.name;
                                                link.target = "_blank";
                                                link.click();
                                              } else {
                                                window.open(fileUrl, "_blank");
                                              }
                                            }}
                                            className="text-blue-600 hover:underline"
                                          >
                                            📎 {file.name}
                                          </button>
                                        ) : (
                                          <span className="text-gray-600">
                                            📎 {file.name}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-center py-4 text-xs">
              No admin notes
            </p>
          )}
        </div>

        {/* User Notes Section - Editable */}
        <div className="pl-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">My Notes</h3>
            <button
              onClick={() => setIsAddingUserNote(true)}
              className="flex items-center gap-1 px-2 py-1 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add
            </button>
          </div>

          {/* Add Note Form */}
          {isAddingUserNote && (
            <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                New Note
              </h4>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={currentUserNote.date}
                  onChange={(e) =>
                    setCurrentUserNote({
                      ...currentUserNote,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={currentUserNote.description}
                  onChange={(e) =>
                    setCurrentUserNote({
                      ...currentUserNote,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter note description..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-[#00486D] cursor-pointer">
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
                  <span className="text-xs">Upload</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleUserNoteFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
                {currentUserNote.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {currentUserNote.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white px-2 py-1 rounded border text-xs"
                      >
                        <span className="truncate">{file.name}</span>
                        <button
                          onClick={() => removeUserNoteAttachment(idx)}
                          className="text-red-500 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveUserNote}
                  disabled={saving}
                  className="flex-1 px-3 py-2 bg-[#00486D] text-white rounded-md text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsAddingUserNote(false);
                    setCurrentUserNote({
                      date: "",
                      description: "",
                      attachments: [],
                    });
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* User Notes Table */}
          {userNotesList.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Date
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Description
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Files
                  </th>
                </tr>
              </thead>
              <tbody>
                {userNotesList.map((note, idx) => (
                  <React.Fragment key={note.id || idx}>
                    <tr
                      onClick={() =>
                        setExpandedUserNoteId(
                          expandedUserNoteId === idx ? null : idx
                        )
                      }
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {note.date || "-"}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate text-xs">
                        {note.description || "-"}
                      </td>
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {note.attachments?.length || 0}
                      </td>
                    </tr>
                    {expandedUserNoteId === idx && (
                      <tr className="bg-gray-50">
                        <td colSpan="3" className="px-3 py-3">
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">
                                Date:
                              </span>{" "}
                              <span className="text-gray-600">
                                {note.date || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Description:
                              </span>
                              <p className="text-gray-600 mt-1">
                                {note.description}
                              </p>
                            </div>
                            {note.attachments &&
                              note.attachments.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Attachments:
                                  </span>
                                  <div className="mt-1 space-y-1">
                                    {note.attachments.map((file, fileIdx) => (
                                      <div key={fileIdx}>
                                        {file.url || file.data ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const fileUrl =
                                                file.url || file.data;
                                              if (fileUrl.startsWith("data:")) {
                                                const link =
                                                  document.createElement("a");
                                                link.href = fileUrl;
                                                link.download = file.name;
                                                link.target = "_blank";
                                                link.click();
                                              } else {
                                                window.open(fileUrl, "_blank");
                                              }
                                            }}
                                            className="text-blue-600 hover:underline"
                                          >
                                            📎 {file.name}
                                          </button>
                                        ) : (
                                          <span className="text-gray-600">
                                            📎 {file.name}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-center py-4 text-xs">
              No notes added yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesContent;
