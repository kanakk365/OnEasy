import React, { useState } from "react";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { BsCalendar3 } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { uploadFileDirect } from "../../../utils/s3Upload";
import { AUTH_CONFIG } from "../../../config/auth";
import { lookupPincode } from "../../../utils/pincodeLookup";

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
              d="M12 15L12 3M12 15L16 11M12 15L8 11"
              stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
              d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17"
              stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
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
              d="M12 15L12 3M12 15L16 11M12 15L8 11"
              stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
              d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17"
              stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
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
        <img
          src="/empty.svg"
          alt="No Items"
          className="w-16 h-16 opacity-90 mx-auto"
        />
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

const OrganisationDetailsContent = ({
  organizations,
  selectedOrgId,
  setSelectedOrgId,
  isAddingNewOrg,
  setIsAddingNewOrg,
  userId,
  saving,
  addOrganization,
  updateOrganization,
  addDirectorPartner,
  updateDirectorPartner,
  addDigitalSignature,
  updateDigitalSignature,
  addWebsite,
  updateWebsite,
  removeWebsite,
  togglePasswordVisibility,
  handleViewFile,
  handleSaveOrganisation,
}) => {

  // Filter out empty organizations for table display
  const savedOrganizations = organizations.filter(
    (org) =>
      (org.legalName && org.legalName.trim() !== "") ||
      (org.tradeName && org.tradeName.trim() !== "") ||
      (org.gstin && org.gstin.trim() !== "")
  );
  const hasNoOrganizations = savedOrganizations.length === 0 && !selectedOrgId;

  return (
    <div className="px-6 pb-6 pt-6 animate-fadeIn">
      <div className="space-y-6">
        {/* Show table if no organization selected */}
        {savedOrganizations.length > 0 && (
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
                    <th className="px-6 py-3 font-medium border-b border-gray-200 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {savedOrganizations.map((org) => (
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

            return <OrganizationFormWithTabs
              key={org.id}
              org={org}
              isAddingNewOrg={isAddingNewOrg}
              setSelectedOrgId={setSelectedOrgId}
              setIsAddingNewOrg={setIsAddingNewOrg}
              updateOrganization={updateOrganization}
              addDirectorPartner={addDirectorPartner}
              updateDirectorPartner={updateDirectorPartner}
              addDigitalSignature={addDigitalSignature}
              updateDigitalSignature={updateDigitalSignature}
              addWebsite={addWebsite}
              updateWebsite={updateWebsite}
              removeWebsite={removeWebsite}
              togglePasswordVisibility={togglePasswordVisibility}
              handleViewFile={handleViewFile}
              handleSaveOrganisation={handleSaveOrganisation}
              saving={saving}
              userId={userId}
              organizations={organizations}
            />;
          })}
      </div>
    </div>
  );
};

// Separate component for the tabbed organization form
const OrganizationFormWithTabs = ({
  org,
  isAddingNewOrg,
  setSelectedOrgId,
  setIsAddingNewOrg,
  updateOrganization,
  addDirectorPartner,
  updateDirectorPartner,
  addDigitalSignature,
  updateDigitalSignature,
  addWebsite,
  updateWebsite,
  removeWebsite,
  togglePasswordVisibility,
  handleViewFile,
  handleSaveOrganisation,
  saving,
  userId,
  organizations,
}) => {
  const [activeTab, setActiveTab] = useState("organization-details");

  const tabs = [
    { key: "organization-details", label: "Organization Details" },
    { key: "directors-partners", label: "Directors / Partners Details" },
    { key: "digital-signatures", label: "Digital Signature Details" },
    { key: "attachments", label: "Attachments" },
    { key: "credentials", label: "Credentials" },
  ];

  return (
    <div className="space-y-6">
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

      {/* Tabs Navigation */}
      <div className="bg-white rounded-t-xl border-b border-gray-200">
        <div className="flex space-x-1 px-4 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-[#00486D] border-b-2 border-[#00486D] -mb-px"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-6 min-h-[400px]">
        {activeTab === "organization-details" && (
          <div className="bg-[#F8F9FA] p-6 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
                    <StyledInput
                      label="PAN Number"
                      value={org.panNumber}
                      onChange={(e) =>
                        updateOrganization(org.id, "panNumber", e.target.value)
                      }
                      placeholder="Enter PAN Number"
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
                    {/* Registered Office Address Section */}
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Registered Office Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Address Line 1 */}
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-700 mb-2 font-medium">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            value={org.registeredAddressLine1 || ""}
                            onChange={(e) =>
                              updateOrganization(
                                org.id,
                                "registeredAddressLine1",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter Address Line 1"
                          />
                        </div>

                        {/* Address Line 2 */}
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-700 mb-2 font-medium">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={org.registeredAddressLine2 || ""}
                            onChange={(e) =>
                              updateOrganization(
                                org.id,
                                "registeredAddressLine2",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter Address Line 2 (Optional)"
                          />
                        </div>

                        {/* District */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-2 font-medium">
                            District
                          </label>
                          <input
                            type="text"
                            value={org.registeredAddressDistrict || ""}
                            onChange={(e) =>
                              updateOrganization(
                                org.id,
                                "registeredAddressDistrict",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter District"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-2 font-medium">
                            State
                          </label>
                          <input
                            type="text"
                            value={org.registeredAddressState || ""}
                            onChange={(e) =>
                              updateOrganization(
                                org.id,
                                "registeredAddressState",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter State"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-2 font-medium">
                            Country
                          </label>
                          <input
                            type="text"
                            value={org.registeredAddressCountry || "India"}
                            onChange={(e) =>
                              updateOrganization(
                                org.id,
                                "registeredAddressCountry",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter Country"
                          />
                        </div>

                        {/* PIN Code */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-2 font-medium">
                            PIN Code
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={
                                (() => {
                                  const pincodeValue = org.registeredAddressPincode 
                                    ? String(org.registeredAddressPincode).replace(/\D/g, "").slice(0, 6)
                                    : "";
                                  console.log("[ORG DETAILS INPUT] Value prop:", {
                                    orgId: org.id,
                                    originalValue: org.registeredAddressPincode,
                                    processedValue: pincodeValue,
                                    length: pincodeValue.length
                                  });
                                  return pincodeValue;
                                })()
                              }
                              onChange={async (e) => {
                                // Get the raw input value
                                const inputValue = e.target.value;
                                console.log("[ORG DETAILS INPUT] onChange triggered:", {
                                  orgId: org.id,
                                  rawInput: inputValue,
                                  inputLength: inputValue.length,
                                  currentOrgValue: org.registeredAddressPincode
                                });
                                
                                // Remove all non-digit characters and limit to 6 digits
                                const cleanedValue = inputValue.replace(/\D/g, "").slice(0, 6);
                                console.log("[ORG DETAILS INPUT] Cleaned value:", {
                                  cleanedValue,
                                  length: cleanedValue.length,
                                  willUpdate: true
                                });
                                
                                // Update the field - this should allow all 6 digits
                                updateOrganization(org.id, "registeredAddressPincode", cleanedValue);
                                
                                // Auto-trigger lookup when exactly 6 digits are entered
                                if (cleanedValue.length === 6) {
                                  console.log("[ORG DETAILS INPUT] 6 digits entered, triggering lookup");
                                  // Store the PIN code value to ensure it persists
                                  const pincodeToPreserve = cleanedValue;
                                  
                                  try {
                                    const result = await lookupPincode(cleanedValue);
                                    console.log("[ORG DETAILS INPUT] Lookup result:", result);
                                    if (result.success) {
                                      // Update State and District, but ensure PIN code is preserved
                                      if (result.state) {
                                        console.log("[ORG DETAILS INPUT] Updating State:", result.state);
                                        updateOrganization(org.id, "registeredAddressState", result.state);
                                      }
                                      if (result.district) {
                                        console.log("[ORG DETAILS INPUT] Updating District:", result.district);
                                        updateOrganization(org.id, "registeredAddressDistrict", result.district);
                                      }
                                      
                                      // Ensure PIN code is preserved after State/District updates
                                      setTimeout(() => {
                                        // Get the current organization from the organizations prop
                                        const currentOrg = organizations.find(o => o.id === org.id);
                                        if (currentOrg && currentOrg.registeredAddressPincode !== pincodeToPreserve) {
                                          console.log("[ORG DETAILS INPUT] PIN code was lost! Restoring:", {
                                            expected: pincodeToPreserve,
                                            actual: currentOrg.registeredAddressPincode,
                                            willRestore: true
                                          });
                                          updateOrganization(org.id, "registeredAddressPincode", pincodeToPreserve);
                                        } else {
                                          console.log("[ORG DETAILS INPUT] PIN code preserved correctly:", {
                                            expected: pincodeToPreserve,
                                            actual: currentOrg?.registeredAddressPincode
                                          });
                                        }
                                      }, 200);
                                    }
                                  } catch (error) {
                                    console.error("[ORG DETAILS INPUT] PIN code lookup error:", error);
                                  }
                                }
                              }}
                              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Enter 6-digit PIN Code"
                              maxLength={6}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
          </div>
        )}

        {activeTab === "directors-partners" && (
          <div className="bg-[#F8F9FA] rounded-xl p-4">
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
          </div>
        )}

        {activeTab === "digital-signatures" && (
          <div className="bg-[#F8F9FA] rounded-xl p-4">
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="bg-[#F8F9FA] rounded-xl p-4">
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
        )}

        {activeTab === "credentials" && (
          <div className="bg-[#F8F9FA] rounded-xl p-4 pb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[15px] font-medium text-gray-900">
                      Credentials
                    </h4>
                    <button
                      type="button"
                      onClick={() => addWebsite(org.id)}
                      className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
                    >
                      <AiOutlinePlus className="w-3 h-3" /> Add Credentials
                    </button>
                  </div>

                  {!org.websites || org.websites.length === 0 ? (
                    <EmptySectionState
                      title="No Credential Details added yet"
                      buttonText="Add Credentials Details"
                      onAdd={() => addWebsite(org.id)}
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#00486D] text-white">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              URL
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Login
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Password
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs">
                              Remarks
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                      {org.websites.map((website) => (
                            <tr key={website.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">
                                <select
                                  value={website.type || ""}
                              onChange={(e) =>
                                updateWebsite(
                                  org.id,
                                  website.id,
                                  "type",
                                  e.target.value
                                )
                              }
                                  className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                                >
                                  <option value="">Select Type</option>
                                  {[
                                    "Income Tax",
                                    "GST",
                                    "Income Tax – TAN Based",
                                    "Professional Tax",
                                    "Provident Fund",
                                    "ESIC",
                                    "MCA",
                                    "Labour license",
                                    "TRACES",
                                    "ICEGATE",
                                    "Service Tax",
                                    "VAT",
                                    "Others 1",
                                    "Others 2",
                                    "Others 3",
                                  ].map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                <input
                                  type="text"
                                  value={website.url || ""}
                              onChange={(e) =>
                                updateWebsite(
                                  org.id,
                                  website.id,
                                  "url",
                                  e.target.value
                                )
                              }
                                  className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                                  placeholder="Enter URL"
                            />
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                <input
                                  type="text"
                                  value={website.login || ""}
                              onChange={(e) =>
                                updateWebsite(
                                  org.id,
                                  website.id,
                                  "login",
                                  e.target.value
                                )
                              }
                                  className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                              placeholder="Enter Login"
                            />
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                <div className="flex items-center gap-2">
                                <input
                                    type={website.showPassword ? "text" : "password"}
                                    value={website.password || ""}
                                  onChange={(e) =>
                                    updateWebsite(
                                      org.id,
                                      website.id,
                                      "password",
                                      e.target.value
                                    )
                                  }
                                    className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                                  placeholder="Enter Password"
                                />
                                  {website.password && (
                                <button
                                      type="button"
                                  onClick={() =>
                                    togglePasswordVisibility(org.id, website.id)
                                  }
                                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                  {website.showPassword ? (
                                        <AiOutlineEyeInvisible className="w-4 h-4" />
                                  ) : (
                                        <AiOutlineEye className="w-4 h-4" />
                                  )}
                                </button>
                                  )}
                              </div>
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                {/* Remarks are admin-only; clients can view but not edit */}
                                {website.remarks || "-"}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => removeWebsite(org.id, website.id)}
                                  className="text-red-500 hover:text-red-700 text-sm font-medium"
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
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
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
    </div>
  );
};

export default OrganisationDetailsContent;
