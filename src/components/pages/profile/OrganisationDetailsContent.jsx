import React from "react";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { BsCalendar3 } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import { uploadFileDirect } from "../../../utils/s3Upload";
import { AUTH_CONFIG } from "../../../config/auth";

const OrganisationDetailsContent = ({
  organizations,
  selectedOrgId,
  setSelectedOrgId,
  isAddingNewOrg,
  setIsAddingNewOrg,
  expandedOrgId,
  setExpandedOrgId,
  userId,
  saving,
  addOrganization,
  updateOrganization,
  addDirectorPartner,
  removeDirectorPartner,
  updateDirectorPartner,
  addDigitalSignature,
  removeDigitalSignature,
  updateDigitalSignature,
  addWebsite,
  removeWebsite,
  updateWebsite,
  togglePasswordVisibility,
  handleViewFile,
  handleSaveOrganisation,
}) => {
  // Filter out empty organizations for table display
  const savedOrganizations = organizations.filter(
    (org) =>
      (org.organisationType && org.organisationType.trim() !== "") ||
      (org.legalName && org.legalName.trim() !== "") ||
      (org.tradeName && org.tradeName.trim() !== "") ||
      (org.gstin && org.gstin.trim() !== "")
  );
  const hasNoOrganizations = savedOrganizations.length === 0 && !selectedOrgId;

  return (
    <div className="px-6 pb-6 pt-6">
      <div className="space-y-4">
        {/* Show message if no organizations */}
        {hasNoOrganizations && (
          <div className="text-center py-8 text-gray-500">
            <p>
              No organizations yet. Click the + button to add a new
              organization.
            </p>
          </div>
        )}

        {/* Table and Add Button side by side */}
        {savedOrganizations.length > 0 && !selectedOrgId && (
          <div className="flex items-start gap-4">
            {/* Organizations Table View */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm table-fixed border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                <colgroup>
                  <col className="w-12" />
                  <col className="w-auto" />
                  <col className="w-auto" />
                  <col className="w-32" />
                  <col className="w-28" />
                  <col className="w-28" />
                </colgroup>
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">
                      ID
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">
                      Legal Name
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">
                      Trade Name
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">
                      GSTIN
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">
                      TAN
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">
                      CIN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {savedOrganizations.map((org, idx) => (
                    <React.Fragment key={org.id}>
                      <tr
                        onClick={() => {
                          setExpandedOrgId(expandedOrgId === idx ? null : idx);
                          setSelectedOrgId(org.id);
                        }}
                        className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-2 py-2 text-gray-700 font-medium text-xs border border-gray-300">
                          {idx + 1}
                        </td>
                        <td
                          className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300"
                          title={org.legalName}
                        >
                          {org.legalName || "-"}
                        </td>
                        <td
                          className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300"
                          title={org.tradeName}
                        >
                          {org.tradeName || "-"}
                        </td>
                        <td
                          className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300"
                          title={org.gstin}
                        >
                          {org.gstin || "-"}
                        </td>
                        <td
                          className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300"
                          title={org.tan}
                        >
                          {org.tan || "-"}
                        </td>
                        <td
                          className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300"
                          title={org.cin}
                        >
                          {org.cin || "-"}
                        </td>
                      </tr>
                      {expandedOrgId === idx && (
                        <tr className="bg-white">
                          <td
                            colSpan="6"
                            className="p-6 border border-gray-300"
                          >
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                {org.legalName || "Organization Details"}
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1 */}
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      GSTIN
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.gstin || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      TAN
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.tan || "-"}
                                    </div>
                                  </div>
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Legal Name
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.legalName || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Incorporation Date
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 flex items-center gap-2">
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
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      {org.incorporationDate
                                        ? new Date(
                                            org.incorporationDate
                                          ).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          })
                                        : "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      CIN
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.cin || "-"}
                                    </div>
                                  </div>
                                </div>

                                {/* Column 3 */}
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Trade Name
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.tradeName || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Category
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.category || "-"}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      PAN File
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.panFile ? (
                                        <button
                                          onClick={() =>
                                            handleViewFile(org.panFile)
                                          }
                                          className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                          View File
                                        </button>
                                      ) : (
                                        "Not uploaded"
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Registered Address
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.registeredAddress || "-"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Button beside table */}
            <button
              type="button"
              onClick={addOrganization}
              className="w-12 h-12 bg-[#00486D] text-white rounded-full flex items-center justify-center hover:bg-[#01334C] transition-colors flex-shrink-0"
              title="Add Organization"
            >
              <AiOutlinePlus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Add Button when no table (empty state) */}
        {hasNoOrganizations && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addOrganization}
              className="w-12 h-12 bg-[#00486D] text-white rounded-full flex items-center justify-center hover:bg-[#01334C] transition-colors"
              title="Add Organization"
            >
              <AiOutlinePlus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Expanded Organization Card (Edit Mode) */}
        {selectedOrgId && (
          <div className="border-2 border-blue-500 rounded-xl p-6 bg-white shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isAddingNewOrg ? "New Organization" : "Edit Organization"}
              </h3>
              <button
                onClick={() => {
                  setSelectedOrgId(null);
                  setIsAddingNewOrg(false);
                  setExpandedOrgId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
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

            {organizations.map((org) => {
              if (org.id !== selectedOrgId) return null;

              return (
                <div key={org.id} className="space-y-4">
                  {/* Row 1: Legal Name, Trade Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Legal Name
                      </label>
                      <input
                        type="text"
                        value={org.legalName}
                        onChange={(e) =>
                          updateOrganization(
                            org.id,
                            "legalName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter legal name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trade Name
                      </label>
                      <input
                        type="text"
                        value={org.tradeName}
                        onChange={(e) =>
                          updateOrganization(
                            org.id,
                            "tradeName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter trade name"
                      />
                    </div>
                  </div>

                  {/* Row 1.5: Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={org.category || ""}
                        onChange={(e) =>
                          updateOrganization(org.id, "category", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="">Select Category</option>
                        <option value="Individual">Individual</option>
                        <option value="Hindu undivided family">
                          Hindu undivided family
                        </option>
                        <option value="Partnership Firm">
                          Partnership Firm
                        </option>
                        <option value="Limited Liability Partnership">
                          Limited Liability Partnership
                        </option>
                        <option value="Private Limited Company">
                          Private Limited Company
                        </option>
                        <option value="One Person Company">
                          One Person Company
                        </option>
                        <option value="Section 8 Company">
                          Section 8 Company
                        </option>
                        <option value="Society">Society</option>
                        <option value="Charitable Trust">
                          Charitable Trust
                        </option>
                        <option value="Government">Government</option>
                        <option value="Association of Persons">
                          Association of Persons
                        </option>
                        <option value="Body of Individuals">
                          Body of Individuals
                        </option>
                        <option value="Artificial Judicial Person">
                          Artificial Judicial Person
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: GSTIN, Incorporation Date, PAN File */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={org.gstin}
                        onChange={(e) =>
                          updateOrganization(org.id, "gstin", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter GSTIN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Incorporation Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={org.incorporationDate}
                          onChange={(e) =>
                            updateOrganization(
                              org.id,
                              "incorporationDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="dd-mm-yyyy"
                        />
                        <BsCalendar3 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PAN File
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={
                            org.panFile ? "File uploaded" : "No file chosen"
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("File size must be less than 5MB");
                                    e.target.value = "";
                                    return;
                                  }

                                  const userData = JSON.parse(
                                    localStorage.getItem(
                                      AUTH_CONFIG.STORAGE_KEYS.USER
                                    ) || "{}"
                                  );
                                  const currentUserId = userData.id || userId;

                                  if (!currentUserId) {
                                    alert(
                                      "User ID not found. Please refresh the page."
                                    );
                                    e.target.value = "";
                                    return;
                                  }

                                  const folder = `user-profiles/${currentUserId}/organizations/org-${
                                    org.id || "new"
                                  }`;
                                  const { s3Url } = await uploadFileDirect(
                                    file,
                                    folder,
                                    "pan-file"
                                  );

                                  updateOrganization(org.id, "panFile", s3Url);
                                  alert("File uploaded successfully!");
                                } catch (error) {
                                  console.error(
                                    "Error uploading PAN file:",
                                    error
                                  );
                                  alert(
                                    "Failed to upload file. Please try again."
                                  );
                                  e.target.value = "";
                                }
                              }
                            }}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <span className="px-4 py-3 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors inline-block">
                            edit
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: TAN, CIN, Registered Address */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        TAN
                      </label>
                      <input
                        type="text"
                        value={org.tan}
                        onChange={(e) =>
                          updateOrganization(org.id, "tan", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter TAN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CIN
                      </label>
                      <input
                        type="text"
                        value={org.cin}
                        onChange={(e) =>
                          updateOrganization(org.id, "cin", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter CIN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Registered Address
                      </label>
                      <textarea
                        rows={3}
                        value={org.registeredAddress}
                        onChange={(e) =>
                          updateOrganization(
                            org.id,
                            "registeredAddress",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        placeholder="Enter registered address"
                      />
                    </div>
                  </div>

                  {/* Director/Partners Details Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900">
                        Director/Partners Details
                      </h4>
                      <button
                        type="button"
                        onClick={() => addDirectorPartner(org.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-sm"
                      >
                        <AiOutlinePlus className="w-4 h-4" />
                        Add Director/Partner
                      </button>
                    </div>

                    {/* Directors/Partners Table */}
                    {org.directorsPartners &&
                      org.directorsPartners.length > 0 && (
                        <div className="overflow-x-auto mb-4">
                          <table className="w-full border-collapse bg-white min-w-[800px]">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  DIN/Number
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Contact
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Email
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Date of Addition
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Status
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {org.directorsPartners.map((dp) => (
                                <tr
                                  key={dp.id}
                                  className="border-b border-gray-200"
                                >
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="text"
                                      value={dp.name || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="Name"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="text"
                                      value={dp.dinNumber || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "dinNumber",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="DIN/Number"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="text"
                                      value={dp.contact || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "contact",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="Contact"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="email"
                                      value={dp.email || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "email",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="Email"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="date"
                                      value={dp.dateOfAddition || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "dateOfAddition",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <select
                                      value={dp.status || "Active"}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "status",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="Inactive">Inactive</option>
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <button
                                      onClick={() =>
                                        removeDirectorPartner(org.id, dp.id)
                                      }
                                      className="text-red-600 hover:text-red-800 text-xs font-medium"
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

                    {/* Empty State */}
                    {(!org.directorsPartners ||
                      org.directorsPartners.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        No directors/partners added yet.
                      </div>
                    )}
                  </div>

                  {/* Digital Signature Details Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900">
                        Digital Signature Details
                      </h4>
                      <button
                        type="button"
                        onClick={() => addDigitalSignature(org.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-sm"
                      >
                        <AiOutlinePlus className="w-4 h-4" />
                        Add Digital Signature
                      </button>
                    </div>

                    {/* Digital Signatures Table */}
                    {org.digitalSignatures &&
                      org.digitalSignatures.length > 0 && (
                        <div className="overflow-x-auto mb-4">
                          <table className="w-full border-collapse bg-white min-w-[600px]">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  DSC Number
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Expiry Date
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Status
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-300 text-xs">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {org.digitalSignatures.map((ds) => (
                                <tr
                                  key={ds.id}
                                  className="border-b border-gray-200"
                                >
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="text"
                                      value={ds.name || ""}
                                      onChange={(e) =>
                                        updateDigitalSignature(
                                          org.id,
                                          ds.id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="Name"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="text"
                                      value={ds.dscNumber || ""}
                                      onChange={(e) =>
                                        updateDigitalSignature(
                                          org.id,
                                          ds.id,
                                          "dscNumber",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="DSC Number"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="date"
                                      value={ds.expiryDate || ""}
                                      onChange={(e) =>
                                        updateDigitalSignature(
                                          org.id,
                                          ds.id,
                                          "expiryDate",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <select
                                      value={ds.status || "Active"}
                                      onChange={(e) =>
                                        updateDigitalSignature(
                                          org.id,
                                          ds.id,
                                          "status",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="In-active">
                                        In-active
                                      </option>
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <button
                                      onClick={() =>
                                        removeDigitalSignature(org.id, ds.id)
                                      }
                                      className="text-red-600 hover:text-red-800 text-xs font-medium"
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

                    {/* Empty State */}
                    {(!org.digitalSignatures ||
                      org.digitalSignatures.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        No digital signatures added yet.
                      </div>
                    )}
                  </div>

                  {/* Attachments Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      Attachments
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Optional Attachment 1 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Optional Attachment 1
                        </label>
                        <div>
                          <input
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("File size must be less than 5MB");
                                    e.target.value = "";
                                    return;
                                  }

                                  const userData = JSON.parse(
                                    localStorage.getItem(
                                      AUTH_CONFIG.STORAGE_KEYS.USER
                                    ) || "{}"
                                  );
                                  const currentUserId = userData.id || userId;

                                  if (!currentUserId) {
                                    alert(
                                      "User ID not found. Please refresh the page."
                                    );
                                    e.target.value = "";
                                    return;
                                  }

                                  const folder = `organizations/${currentUserId}/org-${
                                    org.id || "new"
                                  }`;
                                  const { s3Url } = await uploadFileDirect(
                                    file,
                                    folder,
                                    "optional-attachment-1"
                                  );

                                  updateOrganization(
                                    org.id,
                                    "optionalAttachment1",
                                    s3Url
                                  );
                                  alert("File uploaded successfully!");
                                } catch (error) {
                                  console.error("Error uploading file:", error);
                                  alert(
                                    "Failed to upload file. Please try again."
                                  );
                                  e.target.value = "";
                                }
                              }
                            }}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            id={`optional-attachment-1-${org.id}`}
                          />
                          <label
                            htmlFor={`optional-attachment-1-${org.id}`}
                            className="cursor-pointer inline-block"
                          >
                            {org.optionalAttachment1 ? (
                              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                <p className="text-xs text-gray-700">
                                  File uploaded
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      await handleViewFile(
                                        org.optionalAttachment1
                                      );
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    View File
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      updateOrganization(
                                        org.id,
                                        "optionalAttachment1",
                                        null
                                      );
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="px-3 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors inline-block text-xs">
                                Upload File
                              </span>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Optional Attachment 2 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Optional Attachment 2
                        </label>
                        <div>
                          <input
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("File size must be less than 5MB");
                                    e.target.value = "";
                                    return;
                                  }

                                  const userData = JSON.parse(
                                    localStorage.getItem(
                                      AUTH_CONFIG.STORAGE_KEYS.USER
                                    ) || "{}"
                                  );
                                  const currentUserId = userData.id || userId;

                                  if (!currentUserId) {
                                    alert(
                                      "User ID not found. Please refresh the page."
                                    );
                                    e.target.value = "";
                                    return;
                                  }

                                  const folder = `organizations/${currentUserId}/org-${
                                    org.id || "new"
                                  }`;
                                  const { s3Url } = await uploadFileDirect(
                                    file,
                                    folder,
                                    "optional-attachment-2"
                                  );

                                  updateOrganization(
                                    org.id,
                                    "optionalAttachment2",
                                    s3Url
                                  );
                                  alert("File uploaded successfully!");
                                } catch (error) {
                                  console.error("Error uploading file:", error);
                                  alert(
                                    "Failed to upload file. Please try again."
                                  );
                                  e.target.value = "";
                                }
                              }
                            }}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            id={`optional-attachment-2-${org.id}`}
                          />
                          <label
                            htmlFor={`optional-attachment-2-${org.id}`}
                            className="cursor-pointer inline-block"
                          >
                            {org.optionalAttachment2 ? (
                              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                <p className="text-xs text-gray-700">
                                  File uploaded
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      await handleViewFile(
                                        org.optionalAttachment2
                                      );
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    View File
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      updateOrganization(
                                        org.id,
                                        "optionalAttachment2",
                                        null
                                      );
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="px-3 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors inline-block text-xs">
                                Upload File
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Websites Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-900">
                        Credentials
                      </h4>
                      <button
                        type="button"
                        onClick={() => addWebsite(org.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-sm"
                      >
                        <AiOutlinePlus className="w-4 h-4" />
                        Add Website
                      </button>
                    </div>

                    {/* Saved Websites Table */}
                    {org.websites &&
                      org.websites.filter((w) => w.url && w.url.trim() !== "")
                        .length > 0 && (
                        <div className="mb-4 overflow-x-auto">
                          <table className="w-full border-collapse bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">
                                  URL
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">
                                  Login
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">
                                  Password
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">
                                  Remarks
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {org.websites
                                .filter((w) => w.url && w.url.trim() !== "")
                                .map((website) => (
                                  <tr
                                    key={website.id}
                                    className="bg-white border-b border-gray-200"
                                  >
                                    <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                                      {website.type || "-"}
                                    </td>
                                    <td className="px-4 py-3 border border-gray-300 text-sm">
                                      {website.url ? (
                                        <a
                                          href={website.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          {website.url}
                                        </a>
                                      ) : (
                                        <span className="text-gray-600">-</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                                      {website.login || "-"}
                                    </td>
                                    <td className="px-4 py-3 border border-gray-300 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-900">
                                          {website.password
                                            ? website.showPassword
                                              ? website.password
                                              : "••••••••"
                                            : "-"}
                                        </span>
                                        {website.password && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              togglePasswordVisibility(
                                                org.id,
                                                website.id
                                              )
                                            }
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                                            title={
                                              website.showPassword
                                                ? "Hide password"
                                                : "Show password"
                                            }
                                          >
                                            {website.showPassword ? (
                                              <FiEyeOff className="w-4 h-4" />
                                            ) : (
                                              <FiEye className="w-4 h-4" />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                                      {website.remarks || "-"}
                                    </td>
                                    <td className="px-4 py-3 border border-gray-300 text-sm">
                                      {/* Action buttons can be added here */}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {/* Website Entry Forms */}
                    {(org.websites || [])
                      .filter((w) => !w.url || w.url.trim() === "")
                      .map((website) => (
                        <div
                          key={website.id}
                          className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Website Type
                              </label>
                              <select
                                value={website.type}
                                onChange={(e) =>
                                  updateWebsite(
                                    org.id,
                                    website.id,
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                              >
                                <option value="">Select Website Type</option>
                                <option value="Income Tax">Income Tax</option>
                                <option value="GST">GST</option>
                                <option value="Income Tax – TAN Based">
                                  Income Tax – TAN Based
                                </option>
                                <option value="Professional Tax">
                                  Professional Tax
                                </option>
                                <option value="Provident Fund">
                                  Provident Fund
                                </option>
                                <option value="ESIC">ESIC</option>
                                <option value="MCA">MCA</option>
                                <option value="Labour license">
                                  Labour license
                                </option>
                                <option value="TRACES">TRACES</option>
                                <option value="ICEGATE">ICEGATE</option>
                                <option value="Service Tax">Service Tax</option>
                                <option value="VAT">VAT</option>
                                <option value="Others 1">Others 1</option>
                                <option value="Others 2">Others 2</option>
                                <option value="Others 3">Others 3</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Website URL
                              </label>
                              <input
                                type="url"
                                value={website.url}
                                onChange={(e) =>
                                  updateWebsite(
                                    org.id,
                                    website.id,
                                    "url",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter website URL"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Login
                              </label>
                              <input
                                type="text"
                                value={website.login}
                                onChange={(e) =>
                                  updateWebsite(
                                    org.id,
                                    website.id,
                                    "login",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter login"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Password
                              </label>
                              <div className="relative">
                                <input
                                  type={
                                    website.showPassword ? "text" : "password"
                                  }
                                  value={website.password}
                                  onChange={(e) =>
                                    updateWebsite(
                                      org.id,
                                      website.id,
                                      "password",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Enter password"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    togglePasswordVisibility(org.id, website.id)
                                  }
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {website.showPassword ? (
                                    <FiEye className="w-4 h-4" />
                                  ) : (
                                    <FiEyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Remarks
                              </label>
                              <input
                                type="text"
                                value={website.remarks || ""}
                                onChange={(e) =>
                                  updateWebsite(
                                    org.id,
                                    website.id,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter remarks"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() => removeWebsite(org.id, website.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={async () => {
              await handleSaveOrganisation();
            }}
            disabled={saving}
            className="px-8 py-3 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganisationDetailsContent;
