import React from "react";

function ClientPersonaNotepad({
  setShowNotepad,
  clientPersonaList,
  expandedPersonaId,
  setExpandedPersonaId,
  isAddingPersona,
  setIsAddingPersona,
  currentPersona,
  setCurrentPersona,
  addPersonaEntry,
  removePersonaEntry,
  handleSaveClientPersona,
  fetchClientPersona,
  savingNotes,
}) {
  return (
    <div className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden max-h-[calc(100vh-150px)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00486D] to-[#01334C] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <h3 className="text-white font-semibold">Client Persona</h3>
        </div>
        <button
          onClick={() => setShowNotepad(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="p-4 overflow-y-auto flex-1">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Personality & Preferences
            <span className="ml-2 text-xs text-gray-500">
              (Private - Not visible to client)
            </span>
          </label>

          {/* Add New Entry Button */}
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Persona Entries
            </h4>
            <button
              onClick={() => setIsAddingPersona(true)}
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
              Add Entry
            </button>
          </div>

          {/* Add Entry Form */}
          {isAddingPersona && (
            <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                New Persona Entry
              </h4>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={currentPersona.date}
                  onChange={(e) =>
                    setCurrentPersona({
                      ...currentPersona,
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
                  value={currentPersona.description}
                  onChange={(e) =>
                    setCurrentPersona({
                      ...currentPersona,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe client's personality, preferences, communication style, etc..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addPersonaEntry}
                  className="flex-1 px-3 py-2 bg-[#00486D] text-white rounded-md text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingPersona(false);
                    setCurrentPersona({ date: "", description: "" });
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Persona Entries Table */}
          {clientPersonaList.length > 0 ? (
            <div className="overflow-x-auto table-responsive">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                      Date
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                      Description
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...clientPersonaList]
                    .sort((a, b) => {
                      const dateA = a.date ? new Date(a.date) : new Date(0);
                      const dateB = b.date ? new Date(b.date) : new Date(0);
                      return dateB - dateA; // Newest first
                    })
                    .map((entry, idx) => {
                      const originalIdx = clientPersonaList.findIndex(
                        (e) =>
                          (e.id || clientPersonaList.indexOf(e)) ===
                          (entry.id || clientPersonaList.indexOf(entry)),
                      );
                      return (
                        <React.Fragment key={entry.id || idx}>
                          <tr
                            onClick={() =>
                              setExpandedPersonaId(
                                expandedPersonaId === originalIdx
                                  ? null
                                  : originalIdx,
                              )
                            }
                            className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                          >
                            <td className="px-2 py-2 text-gray-600 text-xs">
                              {entry.date
                                ? new Date(entry.date).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      timeZone: "Asia/Kolkata",
                                    },
                                  )
                                : "-"}
                            </td>
                            <td className="px-2 py-2 text-gray-600 truncate text-xs">
                              {entry.description || "-"}
                            </td>
                            <td className="px-2 py-2 text-gray-600 text-xs">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePersonaEntry(originalIdx);
                                }}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          {expandedPersonaId === originalIdx && (
                            <tr className="bg-gray-50">
                              <td colSpan="3" className="px-3 py-3">
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      Date:
                                    </span>{" "}
                                    <span className="text-gray-600">
                                      {entry.date
                                        ? new Date(
                                            entry.date,
                                          ).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            timeZone: "Asia/Kolkata",
                                          })
                                        : "-"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      Description:
                                    </span>
                                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                      {entry.description || "No description"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4 text-xs">
              No persona entries added yet. Click "Add Entry" to add one.
            </p>
          )}
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={handleSaveClientPersona}
            disabled={savingNotes}
            className="flex-1 px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {savingNotes ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Persona"
            )}
          </button>
          <button
            onClick={() => {
              fetchClientPersona();
              setShowNotepad(false);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientPersonaNotepad;
