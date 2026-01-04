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

  // Reusable Input Component to match design
  const StyledInput = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
  }) => (
    <div>
      <label className="block text-sm text-gray-700 mb-2 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );

  // Reusable Select Component
  const StyledSelect = ({ label, value, onChange, options, placeholder }) => (
    <div>
      <label className="block text-sm text-gray-700 mb-2 font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          value={value || ""}
          onChange={onChange}
          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  // Reusable File Upload Component matching the image design
  const StyledFileUpload = ({
    label,
    fileUrl,
    onFileChange,
    onViewFile,
    onRemoveFile,
    id,
    placeholder,
  }) => (
    <div>
      <label className="block text-sm text-gray-700 mb-2 font-medium">
        {label}
      </label>
      <div className="flex bg-white border border-gray-100 rounded-lg p-1 items-center">
        <label
          htmlFor={id}
          className="flex-1 px-4 py-2 text-sm text-gray-500 cursor-pointer truncate"
        >
          {fileUrl && typeof fileUrl === "string" && fileUrl.trim() !== ""
            ? "File uploaded successfully"
            : placeholder || "Upload file"}
          <input
            type="file"
            id={id}
            onChange={onFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </label>

        {/* Upload/View Button - Dark blue with download icon */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (
              fileUrl &&
              typeof fileUrl === "string" &&
              fileUrl.trim() !== ""
            ) {
              onViewFile(fileUrl);
            } else {
              document.getElementById(id).click();
            }
          }}
          className="bg-[#00486D] text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#01334C] transition-colors flex-shrink-0"
        >
          {fileUrl ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16V8M12 16L9 13M12 16L15 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16V8M12 16L9 13M12 16L15 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  // Empty State Component
  const EmptySectionState = ({ title, buttonText, onAdd }) => (
    <div className="bg-white rounded-xl py-8 px-8 flex flex-col items-center justify-center text-center">
      <div className="mb-4">
        <img src="/empty.svg" alt="No Items" className="w-16 h-16 opacity-90 mx-auto" />
      </div>
      <p className="text-gray-500 text-sm mb-4">{title}</p>
      <button
        type="button"
        onClick={onAdd}
        className="px-5 py-2.5 bg-[#01334C] text-white rounded-md hover:bg-[#01283a] transition-colors text-xs font-medium"
      >
        {buttonText}
      </button>
    </div>
  );

  return (
    <div className="px-6 pb-6 pt-6 animate-fadeIn">
      <div className="space-y-6">
        {/* Show table if no organization selected */}
        {savedOrganizations.length > 0 && !selectedOrgId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Organizations
              </h3>
              <button
                type="button"
                onClick={addOrganization}
                className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-sm flex items-center gap-2"
              >
                <AiOutlinePlus className="w-4 h-4" /> Add Organization
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#00486D] text-white uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 font-medium border-b border-gray-200">
                      Legal Name
                    </th>
                    <th className="px-6 py-3 font-medium border-b border-gray-200">
                      Trade Name
                    </th>
                    <th className="px-6 py-3 font-medium border-b border-gray-200">
                      GSTIN
                    </th>
                    <th className="px-6 py-3 font-medium border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {savedOrganizations.map((org, idx) => (
                    <tr
                      key={org.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrgId(org.id)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {org.legalName || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {org.tradeName || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {org.gstin || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State when no orgs and none selected */}
        {hasNoOrganizations && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AiOutlinePlus className="w-8 h-8 text-[#00486D]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No organizations yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Add your organization details to manage directors, signatures, and
              credentials.
            </p>
            <button
              type="button"
              onClick={addOrganization}
              className="px-6 py-3 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors font-medium text-sm inline-flex items-center gap-2"
            >
              <AiOutlinePlus className="w-5 h-5" />
              Add Organization
            </button>
          </div>
        )}

        {/* Edit Organization Form */}
        {selectedOrgId &&
          organizations.map((org) => {
            if (org.id !== selectedOrgId) return null;

            return (
              <div key={org.id} className="space-y-8">
                {/* Header for Form */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h3 className="text-[16px] font-bold text-gray-900">
                    {isAddingNewOrg ? "New Organizations" : "Edit Organization"}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedOrgId(null);
                      setIsAddingNewOrg(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Basic Details Section */}
                <div className="bg-[#F8F9FA] p-6 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <StyledInput
                      label="Organisation Type"
                      value={org.organisationType}
                      onChange={(e) =>
                        updateOrganization(
                          org.id,
                          "organisationType",
                          e.target.value
                        )
                      }
                      placeholder="Enter Organisation Type"
                    />
                    <StyledInput
                      label="Legal Name"
                      value={org.legalName}
                      onChange={(e) =>
                        updateOrganization(org.id, "legalName", e.target.value)
                      }
                      placeholder="Enter Legal Name"
                    />
                    <StyledInput
                      label="Trade Name"
                      value={org.tradeName}
                      onChange={(e) =>
                        updateOrganization(org.id, "tradeName", e.target.value)
                      }
                      placeholder="Enter Trade Name"
                    />
                    <StyledSelect
                      label="Category"
                      value={org.category}
                      onChange={(e) =>
                        updateOrganization(org.id, "category", e.target.value)
                      }
                      placeholder="Select Category"
                      options={[
                        { value: "Individual", label: "Individual" },
                        {
                          value: "Hindu undivided family",
                          label: "Hindu undivided family",
                        },
                        {
                          value: "Partnership Firm",
                          label: "Partnership Firm",
                        },
                        {
                          value: "Limited Liability Partnership",
                          label: "Limited Liability Partnership",
                        },
                        {
                          value: "Private Limited Company",
                          label: "Private Limited Company",
                        },
                        {
                          value: "One Person Company",
                          label: "One Person Company",
                        },
                        {
                          value: "Section 8 Company",
                          label: "Section 8 Company",
                        },
                        { value: "Society", label: "Society" },
                        {
                          value: "Charitable Trust",
                          label: "Charitable Trust",
                        },
                        { value: "Government", label: "Government" },
                        {
                          value: "Association of Persons",
                          label: "Association of Persons",
                        },
                        {
                          value: "Body of Individuals",
                          label: "Body of Individuals",
                        },
                        {
                          value: "Artificial Judicial Person",
                          label: "Artificial Judicial Person",
                        },
                      ]}
                    />
                    <StyledInput
                      label="GSTIN"
                      value={org.gstin}
                      onChange={(e) =>
                        updateOrganization(org.id, "gstin", e.target.value)
                      }
                      placeholder="Enter GSTIN"
                    />

                    {/* Incorporation Date with Calendar Icon */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
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
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <StyledFileUpload
                      label="PAN File"
                      fileUrl={org.panFile}
                      id={`pan-file-${org.id}`}
                      placeholder="Upload file"
                      onFileChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            if (file.size > 5 * 1024 * 1024)
                              return alert("File size must be less than 5MB");
                            const userData = JSON.parse(
                              localStorage.getItem(
                                AUTH_CONFIG.STORAGE_KEYS.USER
                              ) || "{}"
                            );
                            const currentUserId = userData.id || userId;
                            if (!currentUserId)
                              return alert("User ID not found");

                            const folder = `user-profiles/${currentUserId}/organizations/org-${
                              org.id || "new"
                            }`;
                            const { s3Url } = await uploadFileDirect(
                              file,
                              folder,
                              "pan-file"
                            );
                            updateOrganization(org.id, "panFile", s3Url);
                          } catch (error) {
                            console.error("Error", error);
                            alert("Upload failed");
                          }
                        }
                      }}
                      onViewFile={handleViewFile}
                    />

                    <StyledInput
                      label="TAN"
                      value={org.tan}
                      onChange={(e) =>
                        updateOrganization(org.id, "tan", e.target.value)
                      }
                      placeholder="Enter TAN"
                    />
                    <StyledInput
                      label="CIN"
                      value={org.cin}
                      onChange={(e) =>
                        updateOrganization(org.id, "cin", e.target.value)
                      }
                      placeholder="Enter CIN"
                    />
                    <div className="col-span-1 md:col-span-1">
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Registered Address
                      </label>
                      <input
                        type="text"
                        value={org.registeredAddress}
                        onChange={(e) =>
                          updateOrganization(
                            org.id,
                            "registeredAddress",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter Registered Address"
                      />
                    </div>
                  </div>
                </div>

                {/* Directors / Partners Details Section */}
                <div className="bg-[#F8F9FA] rounded-xl p-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[15px] font-medium text-gray-900">
                      Directors / Partners Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => addDirectorPartner(org.id)}
                      className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
                    >
                      <AiOutlinePlus className="w-3 h-3" /> Add Directors /
                      Patners
                    </button>
                  </div>

                  {!org.directorsPartners ||
                  org.directorsPartners.length === 0 ? (
                    <EmptySectionState
                      title="No Directors / Partners added yet"
                      buttonText="Add Directors / Partners"
                      onAdd={() => addDirectorPartner(org.id)}
                    />
                  ) : (
                    <div className="overflow-x-auto rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-[#00486D] text-white">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              DIN No.
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Contact
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Date of Addition
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {org.directorsPartners.map((dp) => (
                            <tr key={dp.id}>
                              <td className="p-3">
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={dp.name}
                                  onChange={(e) =>
                                    updateDirectorPartner(
                                      org.id,
                                      dp.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Name"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={dp.dinNumber}
                                  onChange={(e) =>
                                    updateDirectorPartner(
                                      org.id,
                                      dp.id,
                                      "dinNumber",
                                      e.target.value
                                    )
                                  }
                                  placeholder="DIN No"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={dp.contact}
                                  onChange={(e) =>
                                    updateDirectorPartner(
                                      org.id,
                                      dp.id,
                                      "contact",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Contact"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="email"
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={dp.email}
                                  onChange={(e) =>
                                    updateDirectorPartner(
                                      org.id,
                                      dp.id,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Email"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="date"
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={dp.dateOfAddition}
                                  onChange={(e) =>
                                    updateDirectorPartner(
                                      org.id,
                                      dp.id,
                                      "dateOfAddition",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td className="p-3">
                                <select
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={dp.status}
                                  onChange={(e) =>
                                    updateDirectorPartner(
                                      org.id,
                                      dp.id,
                                      "status",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option>Active</option>
                                  <option>Inactive</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() =>
                                    removeDirectorPartner(org.id, dp.id)
                                  }
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
                </div>

                {/* Digital Signature Details Section */}
                <div className="bg-[#F8F9FA] rounded-xl p-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[15px] font-medium text-gray-900">
                      Digital Signature Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => addDigitalSignature(org.id)}
                      className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
                    >
                      <AiOutlinePlus className="w-3 h-3" /> Add Digital
                      Signature
                    </button>
                  </div>

                  {!org.digitalSignatures ||
                  org.digitalSignatures.length === 0 ? (
                    <EmptySectionState
                      title="No Digital Signature added yet"
                      buttonText="Add Digital Signature"
                      onAdd={() => addDigitalSignature(org.id)}
                    />
                  ) : (
                    <div className="overflow-x-auto rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-[#00486D] text-white">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              DSC Number
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Expiry Date
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {org.digitalSignatures.map((ds) => (
                            <tr key={ds.id}>
                              <td className="p-3">
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={ds.name}
                                  onChange={(e) =>
                                    updateDigitalSignature(
                                      org.id,
                                      ds.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Name"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={ds.dscNumber}
                                  onChange={(e) =>
                                    updateDigitalSignature(
                                      org.id,
                                      ds.id,
                                      "dscNumber",
                                      e.target.value
                                    )
                                  }
                                  placeholder="DSC Number"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="date"
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={ds.expiryDate}
                                  onChange={(e) =>
                                    updateDigitalSignature(
                                      org.id,
                                      ds.id,
                                      "expiryDate",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td className="p-3">
                                <select
                                  className="w-full px-3 py-2 bg-white rounded-md text-xs border border-gray-100 focus:ring-1 focus:ring-blue-500"
                                  value={ds.status}
                                  onChange={(e) =>
                                    updateDigitalSignature(
                                      org.id,
                                      ds.id,
                                      "status",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option>Active</option>
                                  <option>Inactive</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() =>
                                    removeDigitalSignature(org.id, ds.id)
                                  }
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
                </div>

                {/* Attachments Section */}
                <div className="bg-[#F8F9FA] rounded-xl p-4 mt-6">
                  <h4 className="text-[15px] font-medium text-gray-900 mb-4">
                    Attachments
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StyledFileUpload
                      label="Optional Attachment 1"
                      fileUrl={org.optionalAttachment1}
                      id={`opt-att-1-${org.id}`}
                      placeholder="Upload file"
                      onFileChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            if (file.size > 5 * 1024 * 1024)
                              return alert("File size must be less than 5MB");
                            const userData = JSON.parse(
                              localStorage.getItem(
                                AUTH_CONFIG.STORAGE_KEYS.USER
                              ) || "{}"
                            );
                            const currentUserId = userData.id || userId;
                            if (!currentUserId)
                              return alert("User ID not found");

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
                          } catch (error) {
                            console.error(error);
                            alert("Upload failed");
                          }
                        }
                      }}
                      onViewFile={handleViewFile}
                    />
                    <StyledFileUpload
                      label="Optional Attachment 2"
                      fileUrl={org.optionalAttachment2}
                      id={`opt-att-2-${org.id}`}
                      placeholder="Upload file"
                      onFileChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            if (file.size > 5 * 1024 * 1024)
                              return alert("File size must be less than 5MB");
                            const userData = JSON.parse(
                              localStorage.getItem(
                                AUTH_CONFIG.STORAGE_KEYS.USER
                              ) || "{}"
                            );
                            const currentUserId = userData.id || userId;
                            if (!currentUserId)
                              return alert("User ID not found");

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
                          } catch (error) {
                            console.error(error);
                            alert("Upload failed");
                          }
                        }
                      }}
                      onViewFile={handleViewFile}
                    />
                  </div>
                </div>

                {/* Credentials Details Section */}
                <div className="bg-[#F8F9FA] rounded-xl p-4 mt-6 pb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[15px] font-medium text-gray-900">
                      Credentials Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => addWebsite(org.id)}
                      className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
                    >
                      <AiOutlinePlus className="w-3 h-3" /> Add Credentials
                      Details
                    </button>
                  </div>

                  {!org.websites || org.websites.length === 0 ? (
                    <EmptySectionState
                      title="No Credential Details added yet"
                      buttonText="Add Credentials Details"
                      onAdd={() => addWebsite(org.id)}
                    />
                  ) : (
                    <div className="space-y-4">
                      {org.websites.map((website) => (
                        <div key={website.id} className="relative">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <StyledSelect
                              label="Credential Type"
                              value={website.type}
                              onChange={(e) =>
                                updateWebsite(
                                  org.id,
                                  website.id,
                                  "type",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Website Type"
                              options={[
                                { value: "Income Tax", label: "Income Tax" },
                                { value: "GST", label: "GST" },
                                { value: "MCA", label: "MCA" },
                                { value: "Bank", label: "Bank" },
                              ]}
                            />
                            <StyledInput
                              label="Credential URL"
                              value={website.url}
                              onChange={(e) =>
                                updateWebsite(
                                  org.id,
                                  website.id,
                                  "url",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Website URL"
                            />
                            <StyledInput
                              label="Login"
                              value={website.login}
                              onChange={(e) =>
                                updateWebsite(
                                  org.id,
                                  website.id,
                                  "login",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Login"
                            />
                            <div className="relative">
                              <label className="block text-sm text-gray-700 mb-2 font-medium">
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
                                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Enter Password"
                                />
                                <button
                                  onClick={() =>
                                    togglePasswordVisibility(org.id, website.id)
                                  }
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                  {website.showPassword ? (
                                    <FiEyeOff />
                                  ) : (
                                    <FiEye />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => removeWebsite(org.id, website.id)}
                              className="text-[#FF3B30] hover:text-red-700 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveOrganisation}
                    disabled={saving}
                    className="px-8 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default OrganisationDetailsContent;
