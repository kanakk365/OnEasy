import React from "react";

function ClientProfileTab({
  clientProfile,
  userId,
  expandedSection,
  setExpandedSection,
  isEditingPersonalDetails,
  setIsEditingPersonalDetails,
  personalDetailsForm,
  setPersonalDetailsForm,
  savingPersonalDetails,
  handleEditPersonalDetails,
  handleSavePersonalDetails,
  documentUrls,
  handleViewFile,
  handleFileInputChange,
  uploadingDocument,
  uploadDocumentType,
}) {
  return (
    <div className="space-y-6">
      {/* Personal Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setExpandedSection(
              expandedSection === "personal" ? null : "personal",
            );
          }}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Details
              </h3>
              <p className="text-sm text-gray-500">
                Basic information and contact details
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expandedSection === "personal" ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {expandedSection === "personal" && (
          <div className="px-6 py-6 border-t border-gray-100 bg-[#FAFBFC]">
            {/* Edit Button */}
            {!isEditingPersonalDetails && (
              <div className="flex justify-end mb-6">
                <button
                  onClick={handleEditPersonalDetails}
                  className="px-5 py-2 text-white rounded-xl text-sm font-medium transition-all hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                  }}
                >
                  Edit Details
                </button>
              </div>
            )}

            {isEditingPersonalDetails ? (
              /* Edit Mode */
              <div className="space-y-4">
                {/* System Client ID, Custom Client ID, and Client Status in single row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* System Client ID - Read-only */}
                  {userId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        System Client ID
                      </label>
                      <input
                        type="text"
                        value={userId}
                        disabled
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-medium cursor-not-allowed text-sm"
                      />
                    </div>
                  )}

                  {/* Custom Client ID - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Client ID
                    </label>
                    <input
                      type="text"
                      value={personalDetailsForm.customClientId}
                      onChange={(e) =>
                        setPersonalDetailsForm({
                          ...personalDetailsForm,
                          customClientId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent transition-all"
                      placeholder="Enter custom client ID"
                    />
                  </div>

                  {/* Client Status - Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Status
                    </label>
                    <select
                      value={personalDetailsForm.clientStatus}
                      onChange={(e) =>
                        setPersonalDetailsForm({
                          ...personalDetailsForm,
                          clientStatus: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under closure">Under closure</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={personalDetailsForm.name}
                      onChange={(e) =>
                        setPersonalDetailsForm({
                          ...personalDetailsForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent transition-all"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={personalDetailsForm.whatsapp}
                      onChange={(e) =>
                        setPersonalDetailsForm({
                          ...personalDetailsForm,
                          whatsapp: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent transition-all"
                      placeholder="Enter WhatsApp number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={personalDetailsForm.email}
                      onChange={(e) =>
                        setPersonalDetailsForm({
                          ...personalDetailsForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent transition-all"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={personalDetailsForm.dob}
                      onChange={(e) =>
                        setPersonalDetailsForm({
                          ...personalDetailsForm,
                          dob: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={personalDetailsForm.address_line1}
                      onChange={(e) =>
                        setPersonalDetailsForm({
                          ...personalDetailsForm,
                          address_line1: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows="2"
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address
                    </label>
                    <textarea
                      value={personalDetailsForm.business_address}
                      onChange={(e) =>
                        setPersonalDetailsForm({
                          ...personalDetailsForm,
                          business_address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows="2"
                      placeholder="Enter business address"
                    />
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                  <button
                    onClick={() => setIsEditingPersonalDetails(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePersonalDetails}
                    disabled={savingPersonalDetails}
                    className="px-5 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }}
                  >
                    {savingPersonalDetails ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* ID and Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* System Client ID */}
                  {userId && (
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        System Client ID
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {userId}
                      </p>
                    </div>
                  )}

                  {/* Custom Client ID */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Custom Client ID
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {clientProfile?.user?.custom_client_id || "-"}
                    </p>
                  </div>

                  {/* Client Status */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Client Status
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        (clientProfile?.user?.client_status || "Active") ===
                        "Active"
                          ? "bg-green-100 text-green-700"
                          : clientProfile?.user?.client_status === "Inactive"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {clientProfile?.user?.client_status || "Active"}
                    </span>
                  </div>
                </div>

                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Name
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {clientProfile.user?.name || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      WhatsApp
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {clientProfile.user?.whatsapp || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {clientProfile.user?.email || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Date of Birth
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {clientProfile.user?.dob || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Address
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {clientProfile.user?.address_line1 || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Business Address
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {clientProfile.user?.business_address || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            <div className="border-t border-gray-100 pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background:
                      "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h5 className="text-sm font-semibold text-gray-900">
                  Documents
                </h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    Aadhar Card:
                  </span>
                  {(documentUrls.aadhar_card &&
                    typeof documentUrls.aadhar_card === "string") ||
                  (clientProfile.user?.aadhar_card &&
                    typeof clientProfile.user.aadhar_card === "string") ? (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url =
                          documentUrls.aadhar_card ||
                          clientProfile.user?.aadhar_card;
                        if (
                          url &&
                          typeof url === "string" &&
                          url.trim().length > 0
                        ) {
                          await handleViewFile(url);
                        } else {
                          alert("Invalid document URL");
                        }
                      }}
                      className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileInputChange("aadhar_card", e)}
                      disabled={uploadingDocument}
                      className="hidden"
                    />
                    <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                      {uploadingDocument && uploadDocumentType === "aadhar_card"
                        ? "Uploading..."
                        : "Upload"}
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">PAN Card:</span>
                  {(documentUrls.pan_card &&
                    typeof documentUrls.pan_card === "string") ||
                  (clientProfile.user?.pan_card &&
                    typeof clientProfile.user.pan_card === "string") ? (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url =
                          documentUrls.pan_card || clientProfile.user?.pan_card;
                        if (
                          url &&
                          typeof url === "string" &&
                          url.trim().length > 0
                        ) {
                          await handleViewFile(url);
                        } else {
                          alert("Invalid document URL");
                        }
                      }}
                      className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileInputChange("pan_card", e)}
                      disabled={uploadingDocument}
                      className="hidden"
                    />
                    <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                      {uploadingDocument && uploadDocumentType === "pan_card"
                        ? "Uploading..."
                        : "Upload"}
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Signature:</span>
                  {(documentUrls.signature &&
                    typeof documentUrls.signature === "string") ||
                  (clientProfile.user?.signature &&
                    typeof clientProfile.user.signature === "string") ? (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url =
                          documentUrls.signature ||
                          clientProfile.user?.signature;
                        if (
                          url &&
                          typeof url === "string" &&
                          url.trim().length > 0
                        ) {
                          await handleViewFile(url);
                        } else {
                          alert("Invalid document URL");
                        }
                      }}
                      className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileInputChange("signature", e)}
                      disabled={uploadingDocument}
                      className="hidden"
                    />
                    <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                      {uploadingDocument && uploadDocumentType === "signature"
                        ? "Uploading..."
                        : "Upload"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientProfileTab;

