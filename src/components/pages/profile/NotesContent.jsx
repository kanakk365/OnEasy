import React, { useRef } from "react";
import { AiOutlinePlus, AiOutlineDownload } from "react-icons/ai";
import { BsCalendar3 } from "react-icons/bs";

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
                    <tr key={idx}>
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                          {note.date || "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate">
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
    </div>
  );
};

export default NotesContent;
