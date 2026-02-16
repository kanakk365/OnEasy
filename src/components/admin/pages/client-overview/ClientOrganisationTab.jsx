import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import { lookupPincode } from "../../../../utils/pincodeLookup";
import { uploadFileDirect } from "../../../../utils/s3Upload";
import OrganizationNotesSection from "../../../pages/organization/components/OrganizationNotesSection";
import OrganizationTasksSection from "../../../pages/organization/components/OrganizationTasksSection";

function ClientOrganisationTab({
  clientProfile,
  userId,
  organisations,
  setOrganisations,
  isEditingOrganisations,
  setIsEditingOrganisations,
  expandedOrgId,
  setExpandedOrgId,
  editingOrgId,
  setEditingOrgId,
  activeOrgTab,
  setActiveOrgTab,
  savingOrg,
  addOrganization,
  removeOrganization,
  updateOrganization,
  handleSaveOrganisations,
  handleDeleteOrganization,
  addWebsiteToOrg,
  removeWebsiteFromOrg,
  updateWebsiteInOrg,
  togglePasswordVisibilityInOrg,
  addDirectorPartner,
  removeDirectorPartner,
  updateDirectorPartner,
  addDigitalSignature,
  removeDigitalSignature,
  updateDigitalSignature,
  navigate,
  formatDateOnly,
  fetchClientProfile,
  handleViewFile,
  expandedSection,
  setExpandedSection,
  adminNotesList = [],
  userNotesList = [],
  adminTasksList = [],
  userTasksList = [],
  handleDeleteNote,
  handleSaveAdminNoteInline,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(
              expandedSection === "organisation" ? null : "organisation",
            )
          }
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                Organisation Details
              </h3>
              <p className="text-sm text-gray-500">
                Company information and documents
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expandedSection === "organisation" ? "rotate-180" : ""
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
        {expandedSection === "organisation" && (
          <div className="px-6 py-6 border-t border-gray-100 bg-[#FAFBFC]">
            {isEditingOrganisations ? (
              <div className="space-y-6">
                {organisations.map((org, idx) => (
                  <div
                    key={org.id}
                    className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                      <h4 className="text-xl font-bold text-gray-900">
                        Organization {idx + 1}
                      </h4>
                      <button
                        onClick={() => removeOrganization(org.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Legal Name
                        </label>
                        <input
                          type="text"
                          value={org.legalName}
                          onChange={(e) =>
                            updateOrganization(
                              org.id,
                              "legalName",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                          placeholder="Legal name as per registration"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trade Name
                        </label>
                        <input
                          type="text"
                          value={org.tradeName}
                          onChange={(e) =>
                            updateOrganization(
                              org.id,
                              "tradeName",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Trading name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={org.category || ""}
                          onChange={(e) =>
                            updateOrganization(
                              org.id,
                              "category",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent bg-white"
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GSTIN
                        </label>
                        <input
                          type="text"
                          value={org.gstin}
                          onChange={(e) =>
                            updateOrganization(org.id, "gstin", e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent font-mono"
                          placeholder="GSTIN number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          value={org.panNumber || ""}
                          onChange={(e) =>
                            updateOrganization(
                              org.id,
                              "panNumber",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent font-mono"
                          placeholder="PAN number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          TAN
                        </label>
                        <input
                          type="text"
                          value={org.tan}
                          onChange={(e) =>
                            updateOrganization(org.id, "tan", e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent font-mono"
                          placeholder="TAN number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CIN
                        </label>
                        <input
                          type="text"
                          value={org.cin}
                          onChange={(e) =>
                            updateOrganization(org.id, "cin", e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent font-mono"
                          placeholder="CIN number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Incorporation Date
                        </label>
                        <input
                          type="date"
                          value={org.incorporationDate}
                          onChange={(e) =>
                            updateOrganization(
                              org.id,
                              "incorporationDate",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                        />
                      </div>
                      {/* Registered Office Address Section */}
                      <div className="md:col-span-2">
                        <h5 className="text-sm font-semibold text-gray-900 mb-4">
                          Registered Office Address
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Address Line 1 */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address Line 1
                            </label>
                            <input
                              type="text"
                              value={org.registeredAddressLine1 || ""}
                              onChange={(e) =>
                                updateOrganization(
                                  org.id,
                                  "registeredAddressLine1",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                              placeholder="Enter Address Line 1"
                            />
                          </div>

                          {/* Address Line 2 */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address Line 2
                            </label>
                            <input
                              type="text"
                              value={org.registeredAddressLine2 || ""}
                              onChange={(e) =>
                                updateOrganization(
                                  org.id,
                                  "registeredAddressLine2",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                              placeholder="Enter Address Line 2 (Optional)"
                            />
                          </div>

                          {/* District */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              District
                            </label>
                            <input
                              type="text"
                              value={org.registeredAddressDistrict || ""}
                              onChange={(e) =>
                                updateOrganization(
                                  org.id,
                                  "registeredAddressDistrict",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                              placeholder="Enter District"
                            />
                          </div>

                          {/* State */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              value={org.registeredAddressState || ""}
                              onChange={(e) =>
                                updateOrganization(
                                  org.id,
                                  "registeredAddressState",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                              placeholder="Enter State"
                            />
                          </div>

                          {/* Country */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              value={org.registeredAddressCountry || "India"}
                              onChange={(e) =>
                                updateOrganization(
                                  org.id,
                                  "registeredAddressCountry",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                              placeholder="Enter Country"
                            />
                          </div>

                          {/* PIN Code */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              PIN Code
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={org.registeredAddressPincode || ""}
                                onChange={async (e) => {
                                  // Get the raw input value
                                  const inputValue = e.target.value;

                                  // Remove all non-digit characters and limit to 6 digits
                                  const cleanedValue = inputValue
                                    .replace(/\D/g, "")
                                    .slice(0, 6);

                                  // Update the field - this should allow all 6 digits
                                  updateOrganization(
                                    org.id,
                                    "registeredAddressPincode",
                                    cleanedValue,
                                  );

                                  // Auto-trigger lookup when exactly 6 digits are entered
                                  if (cleanedValue.length === 6) {
                                    // Store PIN code to preserve it
                                    const pincodeToPreserve = cleanedValue;

                                    try {
                                      const result =
                                        await lookupPincode(cleanedValue);
                                      if (result.success) {
                                        if (result.state) {
                                          updateOrganization(
                                            org.id,
                                            "registeredAddressState",
                                            result.state,
                                          );
                                        }
                                        if (result.district) {
                                          updateOrganization(
                                            org.id,
                                            "registeredAddressDistrict",
                                            result.district,
                                          );
                                        }

                                        // Ensure PIN code is preserved after State/District updates
                                        setTimeout(() => {
                                          const currentOrg = organisations.find(
                                            (o) => o.id === org.id,
                                          );
                                          if (
                                            currentOrg &&
                                            currentOrg.registeredAddressPincode !==
                                              pincodeToPreserve
                                          ) {
                                            updateOrganization(
                                              org.id,
                                              "registeredAddressPincode",
                                              pincodeToPreserve,
                                            );
                                          }
                                        }, 200);
                                      }
                                    } catch (error) {
                                      console.error(
                                        "PIN code lookup error:",
                                        error,
                                      );
                                    }
                                  }
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                                placeholder="Enter 6-digit PIN Code"
                                maxLength={6}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Director/Partners Details Section */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-md font-semibold text-gray-900">
                          Director/Partners Details
                        </h5>
                        <button
                          onClick={() => addDirectorPartner(org.id)}
                          className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                        >
                          <AiOutlinePlus className="w-4 h-4" />
                          Add Director/Partner
                        </button>
                      </div>

                      {/* Directors/Partners - Card Layout */}
                      {org.directorsPartners &&
                        org.directorsPartners.length > 0 && (
                          <div className="space-y-4 mb-4">
                            {org.directorsPartners.map((dp) => (
                              <div
                                key={dp.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      value={dp.name || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      placeholder="Name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      DIN/Number
                                    </label>
                                    <input
                                      type="text"
                                      value={dp.dinNumber || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "dinNumber",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      placeholder="DIN/Number"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Contact
                                    </label>
                                    <input
                                      type="text"
                                      value={dp.contact || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "contact",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      placeholder="Contact"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      value={dp.email || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "email",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      placeholder="Email"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Date of Addition
                                    </label>
                                    <input
                                      type="date"
                                      value={dp.dateOfAddition || ""}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "dateOfAddition",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Status
                                    </label>
                                    <select
                                      value={dp.status || "Active"}
                                      onChange={(e) =>
                                        updateDirectorPartner(
                                          org.id,
                                          dp.id,
                                          "status",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="Inactive">Inactive</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex justify-end pt-2 border-t border-gray-100">
                                  <button
                                    onClick={() =>
                                      removeDirectorPartner(org.id, dp.id)
                                    }
                                    className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
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
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-md font-semibold text-gray-900">
                          Digital Signature Details
                        </h5>
                        <button
                          onClick={() => addDigitalSignature(org.id)}
                          className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                        >
                          <AiOutlinePlus className="w-4 h-4" />
                          Add Digital Signature
                        </button>
                      </div>

                      {/* Digital Signatures - Card Layout */}
                      {org.digitalSignatures &&
                        org.digitalSignatures.length > 0 && (
                          <div className="space-y-4 mb-4">
                            {org.digitalSignatures.map((ds) => (
                              <div
                                key={ds.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      value={ds.name || ""}
                                      onChange={(e) =>
                                        updateDigitalSignature(
                                          org.id,
                                          ds.id,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      placeholder="Name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      DSC Number
                                    </label>
                                    <input
                                      type="text"
                                      value={ds.dscNumber || ""}
                                      onChange={(e) =>
                                        updateDigitalSignature(
                                          org.id,
                                          ds.id,
                                          "dscNumber",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      placeholder="DSC Number"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Expiry Date
                                    </label>
                                    <input
                                      type="date"
                                      value={ds.expiryDate || ""}
                                      onChange={(e) =>
                                        updateDigitalSignature(
                                          org.id,
                                          ds.id,
                                          "expiryDate",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Status
                                    </label>
                                    <select
                                      value={ds.status || "Active"}
                                      onChange={(e) =>
                                        updateDigitalSignature(
                                          org.id,
                                          ds.id,
                                          "status",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="In-active">
                                        In-active
                                      </option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex justify-end pt-2 border-t border-gray-100">
                                  <button
                                    onClick={() =>
                                      removeDigitalSignature(org.id, ds.id)
                                    }
                                    className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
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

                    {/* Attachments Section (Admin Only) */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h5 className="text-md font-semibold text-gray-900 mb-4">
                        Attachments
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Optional Attachment 1 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Optional Attachment 1
                          </label>
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64 = reader.result;
                                  updateOrganization(
                                    org.id,
                                    "optionalAttachment1",
                                    base64,
                                  );
                                };
                                reader.readAsDataURL(file);
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
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateOrganization(
                                      org.id,
                                      "optionalAttachment1",
                                      null,
                                    );
                                  }}
                                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <span className="px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block text-xs">
                                Upload File
                              </span>
                            )}
                          </label>
                        </div>

                        {/* Optional Attachment 2 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Optional Attachment 2
                          </label>
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64 = reader.result;
                                  updateOrganization(
                                    org.id,
                                    "optionalAttachment2",
                                    base64,
                                  );
                                };
                                reader.readAsDataURL(file);
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
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    updateOrganization(
                                      org.id,
                                      "optionalAttachment2",
                                      null,
                                    );
                                  }}
                                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <span className="px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block text-xs">
                                Upload File
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Website Details Section */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-md font-semibold text-gray-900">
                          Credentials
                        </h5>
                        <button
                          onClick={() => addWebsiteToOrg(org.id)}
                          className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                        >
                          <AiOutlinePlus className="w-4 h-4" />
                          Add Website
                        </button>
                      </div>

                      {org.websites && org.websites.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white text-sm">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                  Type
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                  URL
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                  Login
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                  Password
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                  Remarks
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {org.websites.map((website) => (
                                <tr
                                  key={website.id}
                                  className="bg-white border-b border-gray-200"
                                >
                                  <td className="px-3 py-2 border border-gray-300">
                                    <select
                                      value={website.type}
                                      onChange={(e) =>
                                        updateWebsiteInOrg(
                                          org.id,
                                          website.id,
                                          "type",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="">Select Type</option>
                                      <option value="Income Tax">
                                        Income Tax
                                      </option>
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
                                      <option value="Service Tax">
                                        Service Tax
                                      </option>
                                      <option value="VAT">VAT</option>
                                      <option value="Others 1">Others 1</option>
                                      <option value="Others 2">Others 2</option>
                                      <option value="Others 3">Others 3</option>
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="text"
                                      value={website.url}
                                      onChange={(e) =>
                                        updateWebsiteInOrg(
                                          org.id,
                                          website.id,
                                          "url",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="Website URL"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="text"
                                      value={website.login}
                                      onChange={(e) =>
                                        updateWebsiteInOrg(
                                          org.id,
                                          website.id,
                                          "login",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="Login ID"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <div className="relative">
                                      <input
                                        type={
                                          website.showPassword
                                            ? "text"
                                            : "password"
                                        }
                                        value={website.password}
                                        onChange={(e) =>
                                          updateWebsiteInOrg(
                                            org.id,
                                            website.id,
                                            "password",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                                        placeholder="Password"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          togglePasswordVisibilityInOrg(
                                            org.id,
                                            website.id,
                                          )
                                        }
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                      >
                                        {website.showPassword ? (
                                          <FiEyeOff className="w-4 h-4" />
                                        ) : (
                                          <FiEye className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <input
                                      type="text"
                                      value={website.remarks || ""}
                                      onChange={(e) =>
                                        updateWebsiteInOrg(
                                          org.id,
                                          website.id,
                                          "remarks",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="Enter remarks"
                                    />
                                  </td>
                                  <td className="px-3 py-2 border border-gray-300">
                                    <button
                                      onClick={() =>
                                        removeWebsiteFromOrg(org.id, website.id)
                                      }
                                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No websites added yet. Click "Add Website" to add one.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addOrganization}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-[#01334C] hover:text-[#01334C] transition-colors flex items-center justify-center gap-2"
                >
                  <AiOutlinePlus className="w-5 h-5" />
                  Add Another Organization
                </button>

                {/* Save/Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => {
                      setIsEditingOrganisations(false);
                      fetchClientProfile(); // Reset to original data
                    }}
                    className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOrganisations}
                    disabled={savingOrg}
                    className="px-6 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors text-sm font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {savingOrg ? "Saving..." : "Save Organizations"}
                  </button>
                </div>
              </div>
            ) : clientProfile.user?.organisations &&
              clientProfile.user.organisations.length > 0 ? (
              <div className="space-y-4">
                {/* Header with Add Button */}
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Organizations ({clientProfile.user.organisations.length})
                  </h4>
                  <button
                    onClick={() => {
                      // Initialize organisations state from clientProfile if not already set
                      if (
                        organisations.length === 0 &&
                        clientProfile.user?.organisations
                      ) {
                        const existingOrgs =
                          clientProfile.user.organisations.map((org, idx) => {
                            let websites = [];
                            if (org.websites) {
                              try {
                                websites =
                                  typeof org.websites === "string"
                                    ? JSON.parse(org.websites)
                                    : org.websites;
                              } catch {
                                websites = [];
                              }
                            }

                            // Parse directors/partners details
                            let directorsPartners = [];
                            if (org.directors_partners_details) {
                              try {
                                directorsPartners =
                                  typeof org.directors_partners_details ===
                                  "string"
                                    ? JSON.parse(org.directors_partners_details)
                                    : org.directors_partners_details;
                                if (!Array.isArray(directorsPartners))
                                  directorsPartners = [];
                              } catch {
                                directorsPartners = [];
                              }
                            }

                            // Parse digital signature details
                            let digitalSignatures = [];
                            if (org.digital_signature_details) {
                              try {
                                digitalSignatures =
                                  typeof org.digital_signature_details ===
                                  "string"
                                    ? JSON.parse(org.digital_signature_details)
                                    : org.digital_signature_details;
                                if (!Array.isArray(digitalSignatures))
                                  digitalSignatures = [];
                              } catch {
                                digitalSignatures = [];
                              }
                            }

                            return {
                              id: org.id || idx + 1,
                              organisationType: org.organisation_type || "",
                              legalName: org.legal_name || "",
                              tradeName: org.trade_name || "",
                              category: org.category || "",
                              gstin: org.gstin || "",
                              incorporationDate: org.incorporation_date || "",
                              panFile: org.pan_file || null,
                              tan: org.tan || "",
                              cin: org.cin || "",
                              registeredAddress: org.registered_address || "",
                              directorsPartners: directorsPartners.map(
                                (dp, index) => ({
                                  id: dp.id || `dp-${Date.now()}-${index}`,
                                  name: dp.name || "",
                                  dinNumber: dp.din_number || "",
                                  contact: dp.contact || "",
                                  email: dp.email || "",
                                  dateOfAddition: dp.date_of_addition || "",
                                  status: dp.status || "Active",
                                }),
                              ),
                              digitalSignatures: digitalSignatures.map(
                                (ds, index) => ({
                                  id: ds.id || `ds-${Date.now()}-${index}`,
                                  name: ds.name || "",
                                  dscNumber: ds.dsc_number || "",
                                  expiryDate: ds.expiry_date || "",
                                  status: ds.status || "Active",
                                }),
                              ),
                              optionalAttachment1:
                                org.optional_attachment_1 || null,
                              optionalAttachment2:
                                org.optional_attachment_2 || null,
                              websites: websites,
                            };
                          });
                        setOrganisations(existingOrgs);
                      }
                      setIsEditingOrganisations(true);
                    }}
                    className="px-5 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <AiOutlinePlus className="w-5 h-5" />
                    Add Organization
                  </button>
                </div>
                <div className="overflow-x-auto -mx-4 md:mx-0 table-responsive">
                  <div className="inline-block min-w-full align-middle px-4 md:px-0">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <colgroup>
                        <col className="w-12" />
                        <col className="w-24" />
                        <col style={{ minWidth: "150px" }} />
                        <col style={{ minWidth: "120px" }} />
                        <col className="w-32" />
                        <col className="w-24" />
                        <col className="w-24" />
                        <col className="w-24" />
                      </colgroup>
                      <thead className="bg-[#01334C]">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">
                            Category
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">
                            Legal Name
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">
                            Trade Name
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">
                            GSTIN
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">
                            TAN
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">
                            CIN
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientProfile.user.organisations.map((org, idx) => (
                          <React.Fragment key={idx}>
                            <tr
                              onClick={() =>
                                setExpandedOrgId(
                                  expandedOrgId === idx ? null : idx,
                                )
                              }
                              className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                                expandedOrgId === idx
                                  ? "bg-gray-50"
                                  : "bg-white"
                              }`}
                            >
                              <td className="px-4 py-3 text-gray-700 font-semibold text-sm">
                                {idx + 1}
                              </td>
                              <td
                                className="px-4 py-3 text-gray-700 text-sm truncate"
                                title={org.category}
                              >
                                {org.category || "-"}
                              </td>
                              <td
                                className="px-4 py-3 text-gray-700 font-medium text-sm truncate"
                                title={org.legal_name}
                              >
                                {org.legal_name || "-"}
                              </td>
                              <td
                                className="px-4 py-3 text-gray-600 text-sm truncate"
                                title={org.trade_name}
                              >
                                {org.trade_name || "-"}
                              </td>
                              <td
                                className="px-4 py-3 text-gray-600 text-sm font-mono truncate"
                                title={org.gstin}
                              >
                                {org.gstin || "-"}
                              </td>
                              <td
                                className="px-4 py-3 text-gray-600 text-sm font-mono truncate"
                                title={org.tan}
                              >
                                {org.tan || "-"}
                              </td>
                              <td
                                className="px-4 py-3 text-gray-600 text-sm font-mono truncate"
                                title={org.cin}
                              >
                                {org.cin || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrganization(idx);
                                  }}
                                  disabled={savingOrg}
                                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium disabled:opacity-50 transition-colors shadow-sm hover:shadow"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                            {expandedOrgId === idx &&
                              (() => {
                                const isEditingThisOrg = editingOrgId === idx;
                                // Find or get organization from state
                                let orgInState = organisations[idx];
                                // If not found in state, try to match by id
                                if (!orgInState && org.id) {
                                  orgInState = organisations.find(
                                    (o) => o.id === org.id,
                                  );
                                }
                                // Parse websites from org
                                let orgWebsites = [];
                                if (isEditingThisOrg && orgInState?.websites) {
                                  orgWebsites = orgInState.websites || [];
                                } else if (org.websites) {
                                  try {
                                    orgWebsites =
                                      typeof org.websites === "string"
                                        ? JSON.parse(org.websites)
                                        : org.websites;
                                  } catch {
                                    orgWebsites = [];
                                  }
                                }

                                // Parse directors/partners and digital signatures for view mode
                                let orgDirectorsPartners = [];
                                let orgDigitalSignatures = [];
                                if (!isEditingThisOrg) {
                                  if (org.directors_partners_details) {
                                    try {
                                      orgDirectorsPartners =
                                        typeof org.directors_partners_details ===
                                        "string"
                                          ? JSON.parse(
                                              org.directors_partners_details,
                                            )
                                          : org.directors_partners_details;
                                      if (!Array.isArray(orgDirectorsPartners))
                                        orgDirectorsPartners = [];
                                    } catch {
                                      orgDirectorsPartners = [];
                                    }
                                  }
                                  if (org.digital_signature_details) {
                                    try {
                                      orgDigitalSignatures =
                                        typeof org.digital_signature_details ===
                                        "string"
                                          ? JSON.parse(
                                              org.digital_signature_details,
                                            )
                                          : org.digital_signature_details;
                                      if (!Array.isArray(orgDigitalSignatures))
                                        orgDigitalSignatures = [];
                                    } catch {
                                      orgDigitalSignatures = [];
                                    }
                                  }
                                }

                                return (
                                  <tr className="bg-white">
                                    <td colSpan="8" className="p-0">
                                      <div className="bg-white rounded-xl border border-gray-200 p-6 mx-2 my-2">
                                        <div className="flex justify-between items-center mb-4">
                                          <h4 className="text-lg font-semibold text-gray-900">
                                            {isEditingThisOrg
                                              ? orgInState?.legalName ||
                                                "Organization Details"
                                              : org.legal_name ||
                                                "Organization Details"}
                                          </h4>
                                          {!isEditingThisOrg &&
                                            !isEditingOrganisations && (
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  // Create org object to edit
                                                  let orgWebsites = [];
                                                  if (org.websites) {
                                                    try {
                                                      orgWebsites =
                                                        typeof org.websites ===
                                                        "string"
                                                          ? JSON.parse(
                                                              org.websites,
                                                            )
                                                          : org.websites;
                                                    } catch {
                                                      orgWebsites = [];
                                                    }
                                                  }

                                                  // Parse directors/partners details
                                                  let directorsPartners = [];
                                                  if (
                                                    org.directors_partners_details
                                                  ) {
                                                    try {
                                                      directorsPartners =
                                                        typeof org.directors_partners_details ===
                                                        "string"
                                                          ? JSON.parse(
                                                              org.directors_partners_details,
                                                            )
                                                          : org.directors_partners_details;
                                                      if (
                                                        !Array.isArray(
                                                          directorsPartners,
                                                        )
                                                      )
                                                        directorsPartners = [];
                                                    } catch {
                                                      directorsPartners = [];
                                                    }
                                                  }

                                                  // Parse digital signature details
                                                  let digitalSignatures = [];
                                                  if (
                                                    org.digital_signature_details
                                                  ) {
                                                    try {
                                                      digitalSignatures =
                                                        typeof org.digital_signature_details ===
                                                        "string"
                                                          ? JSON.parse(
                                                              org.digital_signature_details,
                                                            )
                                                          : org.digital_signature_details;
                                                      if (
                                                        !Array.isArray(
                                                          digitalSignatures,
                                                        )
                                                      )
                                                        digitalSignatures = [];
                                                    } catch {
                                                      digitalSignatures = [];
                                                    }
                                                  }

                                                  const orgToEdit = {
                                                    id: org.id || idx + 1,
                                                    organisationType:
                                                      org.organisation_type ||
                                                      "",
                                                    legalName:
                                                      org.legal_name || "",
                                                    tradeName:
                                                      org.trade_name || "",
                                                    category:
                                                      org.category || "",
                                                    gstin: org.gstin || "",
                                                    incorporationDate:
                                                      org.incorporation_date ||
                                                      "",
                                                    panFile:
                                                      org.pan_file || null,
                                                    tan: org.tan || "",
                                                    cin: org.cin || "",
                                                    registeredAddress:
                                                      org.registered_address ||
                                                      "",
                                                    directorsPartners:
                                                      directorsPartners.map(
                                                        (dp, index) => ({
                                                          id:
                                                            dp.id ||
                                                            `dp-${Date.now()}-${index}`,
                                                          name: dp.name || "",
                                                          dinNumber:
                                                            dp.din_number || "",
                                                          contact:
                                                            dp.contact || "",
                                                          email: dp.email || "",
                                                          dateOfAddition:
                                                            dp.date_of_addition ||
                                                            "",
                                                          status:
                                                            dp.status ||
                                                            "Active",
                                                        }),
                                                      ),
                                                    digitalSignatures:
                                                      digitalSignatures.map(
                                                        (ds, index) => ({
                                                          id:
                                                            ds.id ||
                                                            `ds-${Date.now()}-${index}`,
                                                          name: ds.name || "",
                                                          dscNumber:
                                                            ds.dsc_number || "",
                                                          expiryDate:
                                                            ds.expiry_date ||
                                                            "",
                                                          status:
                                                            ds.status ||
                                                            "Active",
                                                        }),
                                                      ),
                                                    optionalAttachment1:
                                                      org.optional_attachment_1 ||
                                                      null,
                                                    optionalAttachment2:
                                                      org.optional_attachment_2 ||
                                                      null,
                                                    websites: orgWebsites.map(
                                                      (w, wIdx) => ({
                                                        id:
                                                          w.id ||
                                                          Date.now() + wIdx,
                                                        type: w.type || "",
                                                        url: w.url || "",
                                                        login: w.login || "",
                                                        password:
                                                          w.password || "",
                                                        remarks:
                                                          w.remarks || "",
                                                        showPassword: false,
                                                      }),
                                                    ),
                                                  };

                                                  // Update organisations state - ensure array is long enough
                                                  const updatedOrgs = [
                                                    ...organisations,
                                                  ];
                                                  while (
                                                    updatedOrgs.length <= idx
                                                  ) {
                                                    updatedOrgs.push({
                                                      id:
                                                        Date.now() +
                                                        updatedOrgs.length,
                                                      organisationType: "",
                                                      legalName: "",
                                                      tradeName: "",
                                                      category: "",
                                                      gstin: "",
                                                      incorporationDate: "",
                                                      panFile: null,
                                                      tan: "",
                                                      cin: "",
                                                      registeredAddress: "",
                                                      directorsPartners: [],
                                                      digitalSignatures: [],
                                                      optionalAttachment1: null,
                                                      optionalAttachment2: null,
                                                      websites: [],
                                                    });
                                                  }
                                                  updatedOrgs[idx] = orgToEdit;
                                                  setOrganisations(updatedOrgs);
                                                  setEditingOrgId(idx);
                                                }}
                                                className="px-5 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                              >
                                                Edit
                                              </button>
                                            )}
                                        </div>

                                        {/* Horizontal Tabs */}
                                        <div className="border-b border-gray-200 mb-6">
                                          <div className="flex space-x-8">
                                            {[
                                              {
                                                id: "organization-details",
                                                label: "Organization Details",
                                              },
                                              {
                                                id: "directors-partners",
                                                label:
                                                  "Directors / Partners Details",
                                              },
                                              {
                                                id: "digital-signatures",
                                                label:
                                                  "Digital Signature Details",
                                              },
                                              {
                                                id: "attachments",
                                                label: "Attachments",
                                              },
                                              {
                                                id: "credentials",
                                                label: "Credentials",
                                              },
                                              {
                                                id: "notes",
                                                label: "Notes",
                                              },
                                              {
                                                id: "tasks",
                                                label: "Tasks",
                                              },
                                            ].map((tab) => (
                                              <button
                                                key={tab.id}
                                                onClick={() => {
                                                  setActiveOrgTab(tab.id);
                                                }}
                                                className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                                                  activeOrgTab === tab.id
                                                    ? "border-b-2 border-[#01334C] text-[#01334C]"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                              >
                                                {tab.label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Organization Details Tab */}
                                        {activeOrgTab ===
                                          "organization-details" && (
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                            {/* Column 1 */}
                                            <div className="space-y-4">
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  GSTIN
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <input
                                                    type="text"
                                                    value={
                                                      orgInState?.gstin || ""
                                                    }
                                                    onChange={(e) =>
                                                      updateOrganization(
                                                        orgInState.id,
                                                        "gstin",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                                  />
                                                ) : (
                                                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                    {org.gstin || "-"}
                                                  </div>
                                                )}
                                              </div>
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  PAN Number
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <input
                                                    type="text"
                                                    value={
                                                      orgInState?.panNumber ||
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      updateOrganization(
                                                        orgInState.id,
                                                        "panNumber",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                                  />
                                                ) : (
                                                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                    {org.pan_number || "-"}
                                                  </div>
                                                )}
                                              </div>
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  TAN
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <input
                                                    type="text"
                                                    value={
                                                      orgInState?.tan || ""
                                                    }
                                                    onChange={(e) =>
                                                      updateOrganization(
                                                        orgInState.id,
                                                        "tan",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                                  />
                                                ) : (
                                                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                    {org.tan || "-"}
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {/* Column 2 */}
                                            <div className="space-y-4">
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Legal Name
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <input
                                                    type="text"
                                                    value={
                                                      orgInState?.legalName ||
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      updateOrganization(
                                                        orgInState.id,
                                                        "legalName",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                  />
                                                ) : (
                                                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                    {org.legal_name || "-"}
                                                  </div>
                                                )}
                                              </div>
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Incorporation Date
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <input
                                                    type="date"
                                                    value={
                                                      orgInState?.incorporationDate ||
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      updateOrganization(
                                                        orgInState.id,
                                                        "incorporationDate",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                  />
                                                ) : (
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
                                                    {org.incorporation_date
                                                      ? new Date(
                                                          org.incorporation_date,
                                                        ).toLocaleDateString(
                                                          "en-IN",
                                                          {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                            timeZone:
                                                              "Asia/Kolkata",
                                                          },
                                                        )
                                                      : "-"}
                                                  </div>
                                                )}
                                              </div>
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  CIN
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <input
                                                    type="text"
                                                    value={
                                                      orgInState?.cin || ""
                                                    }
                                                    onChange={(e) =>
                                                      updateOrganization(
                                                        orgInState.id,
                                                        "cin",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                                  />
                                                ) : (
                                                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                    {org.cin || "-"}
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {/* Column 3 */}
                                            <div className="space-y-4">
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Trade Name
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <input
                                                    type="text"
                                                    value={
                                                      orgInState?.tradeName ||
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      updateOrganization(
                                                        orgInState.id,
                                                        "tradeName",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                  />
                                                ) : (
                                                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                    {org.trade_name || "-"}
                                                  </div>
                                                )}
                                              </div>
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Category
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <select
                                                    value={
                                                      orgInState?.category || ""
                                                    }
                                                    onChange={(e) =>
                                                      updateOrganization(
                                                        orgInState.id,
                                                        "category",
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                  >
                                                    <option value="">
                                                      Select Category
                                                    </option>
                                                    <option value="Individual">
                                                      Individual
                                                    </option>
                                                    <option value="Hindu undivided family">
                                                      Hindu undivided family
                                                    </option>
                                                    <option value="Partnership Firm">
                                                      Partnership Firm
                                                    </option>
                                                    <option value="Limited Liability Partnership">
                                                      Limited Liability
                                                      Partnership
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
                                                    <option value="Society">
                                                      Society
                                                    </option>
                                                    <option value="Charitable Trust">
                                                      Charitable Trust
                                                    </option>
                                                    <option value="Government">
                                                      Government
                                                    </option>
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
                                                ) : (
                                                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                    {org.category || "-"}
                                                  </div>
                                                )}
                                              </div>
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  PAN File
                                                </label>
                                                {isEditingThisOrg ? (
                                                  <div className="flex items-center gap-1.5">
                                                    <input
                                                      type="text"
                                                      readOnly
                                                      value={
                                                        orgInState?.panFile
                                                          ? "File uploaded"
                                                          : "No file chosen"
                                                      }
                                                      className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-md text-xs bg-gray-50 text-gray-500"
                                                    />
                                                    <label className="cursor-pointer flex-shrink-0">
                                                      <input
                                                        type="file"
                                                        onChange={async (e) => {
                                                          const file =
                                                            e.target.files[0];
                                                          if (file) {
                                                            try {
                                                              // Validate file size (max 5MB)
                                                              if (
                                                                file.size >
                                                                5 * 1024 * 1024
                                                              ) {
                                                                alert(
                                                                  "File size must be less than 5MB",
                                                                );
                                                                e.target.value =
                                                                  "";
                                                                return;
                                                              }

                                                              // Upload directly to S3
                                                              const folder = `user-profiles/${userId}/organizations/org-${
                                                                orgInState.id ||
                                                                "new"
                                                              }`;
                                                              const { s3Url } =
                                                                await uploadFileDirect(
                                                                  file,
                                                                  folder,
                                                                  "pan-file",
                                                                );

                                                              // Store S3 URL instead of base64
                                                              updateOrganization(
                                                                orgInState.id,
                                                                "panFile",
                                                                s3Url,
                                                              );
                                                            } catch (error) {
                                                              console.error(
                                                                "Error uploading PAN file:",
                                                                error,
                                                              );
                                                              alert(
                                                                "Failed to upload file. Please try again.",
                                                              );
                                                              e.target.value =
                                                                "";
                                                            }
                                                          }
                                                        }}
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                      />
                                                      <span className="px-2 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-xs whitespace-nowrap">
                                                        {orgInState?.panFile
                                                          ? "Change"
                                                          : "Upload"}
                                                      </span>
                                                    </label>
                                                  </div>
                                                ) : (
                                                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                    {org.pan_file ? (
                                                      <button
                                                        onClick={() =>
                                                          handleViewFile(
                                                            org.pan_file,
                                                          )
                                                        }
                                                        className="text-blue-600 hover:underline"
                                                      >
                                                        View File
                                                      </button>
                                                    ) : (
                                                      "Not uploaded"
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                              {/* Registered Office Address Section */}
                                              <div className="md:col-span-2">
                                                <h5 className="text-sm font-semibold text-gray-900 mb-3">
                                                  Registered Office Address
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  {/* Address Line 1 */}
                                                  <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                      Address Line 1
                                                    </label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={
                                                          orgInState?.registeredAddressLine1 ||
                                                          ""
                                                        }
                                                        onChange={(e) =>
                                                          updateOrganization(
                                                            orgInState.id,
                                                            "registeredAddressLine1",
                                                            e.target.value,
                                                          )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        placeholder="Enter Address Line 1"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                        {org.registered_address_line1 ||
                                                          "-"}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Address Line 2 */}
                                                  <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                      Address Line 2
                                                    </label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={
                                                          orgInState?.registeredAddressLine2 ||
                                                          ""
                                                        }
                                                        onChange={(e) =>
                                                          updateOrganization(
                                                            orgInState.id,
                                                            "registeredAddressLine2",
                                                            e.target.value,
                                                          )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        placeholder="Enter Address Line 2 (Optional)"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                        {org.registered_address_line2 ||
                                                          "-"}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* District */}
                                                  <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                      District
                                                    </label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={
                                                          orgInState?.registeredAddressDistrict ||
                                                          ""
                                                        }
                                                        onChange={(e) =>
                                                          updateOrganization(
                                                            orgInState.id,
                                                            "registeredAddressDistrict",
                                                            e.target.value,
                                                          )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        placeholder="Enter District"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                        {org.registered_address_district ||
                                                          "-"}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* State */}
                                                  <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                      State
                                                    </label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={
                                                          orgInState?.registeredAddressState ||
                                                          ""
                                                        }
                                                        onChange={(e) =>
                                                          updateOrganization(
                                                            orgInState.id,
                                                            "registeredAddressState",
                                                            e.target.value,
                                                          )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        placeholder="Enter State"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                        {org.registered_address_state ||
                                                          "-"}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Country */}
                                                  <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                      Country
                                                    </label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={
                                                          orgInState?.registeredAddressCountry ||
                                                          "India"
                                                        }
                                                        onChange={(e) =>
                                                          updateOrganization(
                                                            orgInState.id,
                                                            "registeredAddressCountry",
                                                            e.target.value,
                                                          )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        placeholder="Enter Country"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                        {org.registered_address_country ||
                                                          "India"}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* PIN Code */}
                                                  <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                      PIN Code
                                                    </label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={
                                                          orgInState?.registeredAddressPincode ||
                                                          ""
                                                        }
                                                        onChange={async (e) => {
                                                          // Get the raw input value
                                                          const inputValue =
                                                            e.target.value;

                                                          // Remove all non-digit characters and limit to 6 digits
                                                          const cleanedValue =
                                                            inputValue
                                                              .replace(
                                                                /\D/g,
                                                                "",
                                                              )
                                                              .slice(0, 6);

                                                          // Update the field - this should allow all 6 digits
                                                          updateOrganization(
                                                            orgInState.id,
                                                            "registeredAddressPincode",
                                                            cleanedValue,
                                                          );

                                                          // Auto-trigger lookup when exactly 6 digits are entered
                                                          if (
                                                            cleanedValue.length ===
                                                            6
                                                          ) {
                                                            // Store PIN code to preserve it
                                                            const pincodeToPreserve =
                                                              cleanedValue;

                                                            try {
                                                              const result =
                                                                await lookupPincode(
                                                                  cleanedValue,
                                                                );
                                                              if (
                                                                result.success
                                                              ) {
                                                                if (
                                                                  result.state
                                                                ) {
                                                                  updateOrganization(
                                                                    orgInState.id,
                                                                    "registeredAddressState",
                                                                    result.state,
                                                                  );
                                                                }
                                                                if (
                                                                  result.district
                                                                ) {
                                                                  updateOrganization(
                                                                    orgInState.id,
                                                                    "registeredAddressDistrict",
                                                                    result.district,
                                                                  );
                                                                }

                                                                // Ensure PIN code is preserved after State/District updates
                                                                setTimeout(
                                                                  () => {
                                                                    const currentOrg =
                                                                      organisations.find(
                                                                        (o) =>
                                                                          o.id ===
                                                                          orgInState.id,
                                                                      );
                                                                    if (
                                                                      currentOrg &&
                                                                      currentOrg.registeredAddressPincode !==
                                                                        pincodeToPreserve
                                                                    ) {
                                                                      updateOrganization(
                                                                        orgInState.id,
                                                                        "registeredAddressPincode",
                                                                        pincodeToPreserve,
                                                                      );
                                                                    }
                                                                  },
                                                                  200,
                                                                );
                                                              }
                                                            } catch (error) {
                                                              console.error(
                                                                "PIN code lookup error:",
                                                                error,
                                                              );
                                                            }
                                                          }
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        placeholder="Enter 6-digit PIN Code"
                                                        maxLength={6}
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                        {org.registered_address_pincode ||
                                                          "-"}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Directors/Partners Tab */}
                                        {activeOrgTab ===
                                          "directors-partners" && (
                                          <div>
                                            {/* Director/Partners Details Section */}
                                            <div className="pt-6">
                                              <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-md font-semibold text-gray-900">
                                                  Director/Partners Details
                                                </h5>
                                                {isEditingThisOrg && (
                                                  <button
                                                    onClick={() =>
                                                      addDirectorPartner(
                                                        orgInState.id,
                                                      )
                                                    }
                                                    className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                                                  >
                                                    <AiOutlinePlus className="w-4 h-4" />
                                                    Add Director/Partner
                                                  </button>
                                                )}
                                              </div>

                                              {/* Directors/Partners - Card Layout */}
                                              {((isEditingThisOrg &&
                                                orgInState?.directorsPartners) ||
                                                (!isEditingThisOrg &&
                                                  orgDirectorsPartners)) &&
                                                (() => {
                                                  const directorsList =
                                                    isEditingThisOrg
                                                      ? orgInState?.directorsPartners ||
                                                        []
                                                      : orgDirectorsPartners ||
                                                        [];
                                                  return (
                                                    directorsList.length > 0
                                                  );
                                                })() && (
                                                  <div className="space-y-4 mb-4">
                                                    {(() => {
                                                      const list =
                                                        isEditingThisOrg
                                                          ? orgInState?.directorsPartners ||
                                                            []
                                                          : orgDirectorsPartners ||
                                                            [];
                                                      return list;
                                                    })().map((dp) => (
                                                      <div
                                                        key={
                                                          dp.id ||
                                                          `dp-${Date.now()}`
                                                        }
                                                        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                                                      >
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                          <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                              Name
                                                            </label>
                                                            {isEditingThisOrg ? (
                                                              <input
                                                                type="text"
                                                                value={
                                                                  dp.name || ""
                                                                }
                                                                onChange={(e) =>
                                                                  updateDirectorPartner(
                                                                    orgInState.id,
                                                                    dp.id,
                                                                    "name",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                                placeholder="Name"
                                                              />
                                                            ) : (
                                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                                {dp.name || "-"}
                                                              </div>
                                                            )}
                                                          </div>
                                                          <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                              DIN/Number
                                                            </label>
                                                            {isEditingThisOrg ? (
                                                              <input
                                                                type="text"
                                                                value={
                                                                  dp.dinNumber ||
                                                                  ""
                                                                }
                                                                onChange={(e) =>
                                                                  updateDirectorPartner(
                                                                    orgInState.id,
                                                                    dp.id,
                                                                    "dinNumber",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                                placeholder="DIN/Number"
                                                              />
                                                            ) : (
                                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                                {dp.din_number ||
                                                                  dp.dinNumber ||
                                                                  "-"}
                                                              </div>
                                                            )}
                                                          </div>
                                                          <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                              Contact
                                                            </label>
                                                            {isEditingThisOrg ? (
                                                              <input
                                                                type="text"
                                                                value={
                                                                  dp.contact ||
                                                                  ""
                                                                }
                                                                onChange={(e) =>
                                                                  updateDirectorPartner(
                                                                    orgInState.id,
                                                                    dp.id,
                                                                    "contact",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                                placeholder="Contact"
                                                              />
                                                            ) : (
                                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                                {dp.contact ||
                                                                  "-"}
                                                              </div>
                                                            )}
                                                          </div>
                                                          <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                              Email
                                                            </label>
                                                            {isEditingThisOrg ? (
                                                              <input
                                                                type="email"
                                                                value={
                                                                  dp.email || ""
                                                                }
                                                                onChange={(e) =>
                                                                  updateDirectorPartner(
                                                                    orgInState.id,
                                                                    dp.id,
                                                                    "email",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                                placeholder="Email"
                                                              />
                                                            ) : (
                                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                                {dp.email ||
                                                                  "-"}
                                                              </div>
                                                            )}
                                                          </div>
                                                          <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                              Date of Addition
                                                            </label>
                                                            {isEditingThisOrg ? (
                                                              <input
                                                                type="date"
                                                                value={
                                                                  dp.dateOfAddition ||
                                                                  ""
                                                                }
                                                                onChange={(e) =>
                                                                  updateDirectorPartner(
                                                                    orgInState.id,
                                                                    dp.id,
                                                                    "dateOfAddition",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                              />
                                                            ) : (
                                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                                {dp.date_of_addition
                                                                  ? formatDateOnly(
                                                                      dp.date_of_addition,
                                                                    )
                                                                  : dp.dateOfAddition
                                                                    ? formatDateOnly(
                                                                        dp.dateOfAddition,
                                                                      )
                                                                    : "-"}
                                                              </div>
                                                            )}
                                                          </div>
                                                          <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                              Status
                                                            </label>
                                                            {isEditingThisOrg ? (
                                                              <select
                                                                value={
                                                                  dp.status ||
                                                                  "Active"
                                                                }
                                                                onChange={(e) =>
                                                                  updateDirectorPartner(
                                                                    orgInState.id,
                                                                    dp.id,
                                                                    "status",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                              >
                                                                <option value="Active">
                                                                  Active
                                                                </option>
                                                                <option value="Inactive">
                                                                  Inactive
                                                                </option>
                                                              </select>
                                                            ) : (
                                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                                {dp.status ||
                                                                  "Active"}
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                        {isEditingThisOrg && (
                                                          <div className="flex justify-end pt-2 border-t border-gray-100">
                                                            <button
                                                              onClick={() =>
                                                                removeDirectorPartner(
                                                                  orgInState.id,
                                                                  dp.id,
                                                                )
                                                              }
                                                              className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                                                            >
                                                              Remove
                                                            </button>
                                                          </div>
                                                        )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}

                                              {/* Empty State */}
                                              {((!isEditingThisOrg &&
                                                (!orgDirectorsPartners ||
                                                  orgDirectorsPartners.length ===
                                                    0)) ||
                                                (isEditingThisOrg &&
                                                  (!orgInState?.directorsPartners ||
                                                    orgInState.directorsPartners
                                                      .length === 0))) && (
                                                <div className="text-center py-4 text-gray-500 text-xs">
                                                  No directors/partners added
                                                  yet.
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Digital Signatures Tab */}
                                        {activeOrgTab ===
                                          "digital-signatures" && (
                                          <div>
                                            {/* Digital Signature Details Section */}
                                            <div className="pt-6">
                                              <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-md font-semibold text-gray-900">
                                                  Digital Signature Details
                                                </h5>
                                                {isEditingThisOrg && (
                                                  <button
                                                    onClick={() =>
                                                      addDigitalSignature(
                                                        orgInState.id,
                                                      )
                                                    }
                                                    className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                                                  >
                                                    <AiOutlinePlus className="w-4 h-4" />
                                                    Add Digital Signature
                                                  </button>
                                                )}
                                              </div>

                                              {/* Digital Signatures - Card Layout */}
                                              {(() => {
                                                const signaturesList =
                                                  isEditingThisOrg
                                                    ? orgInState?.digitalSignatures ||
                                                      []
                                                    : orgDigitalSignatures ||
                                                      [];
                                                return (
                                                  signaturesList.length > 0
                                                );
                                              })() && (
                                                <div className="space-y-4 mb-4">
                                                  {(() => {
                                                    return isEditingThisOrg
                                                      ? orgInState?.digitalSignatures ||
                                                          []
                                                      : orgDigitalSignatures ||
                                                          [];
                                                  })().map((ds) => (
                                                    <div
                                                      key={
                                                        ds.id ||
                                                        `ds-${Date.now()}`
                                                      }
                                                      className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                                                    >
                                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Name
                                                          </label>
                                                          {isEditingThisOrg ? (
                                                            <input
                                                              type="text"
                                                              value={
                                                                ds.name || ""
                                                              }
                                                              onChange={(e) =>
                                                                updateDigitalSignature(
                                                                  orgInState.id,
                                                                  ds.id,
                                                                  "name",
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                              placeholder="Name"
                                                            />
                                                          ) : (
                                                            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                              {ds.name || "-"}
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            DSC Number
                                                          </label>
                                                          {isEditingThisOrg ? (
                                                            <input
                                                              type="text"
                                                              value={
                                                                ds.dscNumber ||
                                                                ""
                                                              }
                                                              onChange={(e) =>
                                                                updateDigitalSignature(
                                                                  orgInState.id,
                                                                  ds.id,
                                                                  "dscNumber",
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                              placeholder="DSC Number"
                                                            />
                                                          ) : (
                                                            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                              {ds.dsc_number ||
                                                                ds.dscNumber ||
                                                                "-"}
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Expiry Date
                                                          </label>
                                                          {isEditingThisOrg ? (
                                                            <input
                                                              type="date"
                                                              value={
                                                                ds.expiryDate ||
                                                                ""
                                                              }
                                                              onChange={(e) =>
                                                                updateDigitalSignature(
                                                                  orgInState.id,
                                                                  ds.id,
                                                                  "expiryDate",
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                            />
                                                          ) : (
                                                            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                              {ds.expiry_date
                                                                ? formatDateOnly(
                                                                    ds.expiry_date,
                                                                  )
                                                                : ds.expiryDate
                                                                  ? formatDateOnly(
                                                                      ds.expiryDate,
                                                                    )
                                                                  : "-"}
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Status
                                                          </label>
                                                          {isEditingThisOrg ? (
                                                            <select
                                                              value={
                                                                ds.status ||
                                                                "Active"
                                                              }
                                                              onChange={(e) =>
                                                                updateDigitalSignature(
                                                                  orgInState.id,
                                                                  ds.id,
                                                                  "status",
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                            >
                                                              <option value="Active">
                                                                Active
                                                              </option>
                                                              <option value="In-active">
                                                                In-active
                                                              </option>
                                                            </select>
                                                          ) : (
                                                            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                              {ds.status ||
                                                                "Active"}
                                                            </div>
                                                          )}
                                                        </div>
                                                      </div>
                                                      {isEditingThisOrg && (
                                                        <div className="flex justify-end pt-2 border-t border-gray-100">
                                                          <button
                                                            onClick={() =>
                                                              removeDigitalSignature(
                                                                orgInState.id,
                                                                ds.id,
                                                              )
                                                            }
                                                            className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                                                          >
                                                            Remove
                                                          </button>
                                                        </div>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                              {/* Empty State */}
                                              {((!isEditingThisOrg &&
                                                (!orgDigitalSignatures ||
                                                  orgDigitalSignatures.length ===
                                                    0)) ||
                                                (isEditingThisOrg &&
                                                  (!orgInState?.digitalSignatures ||
                                                    orgInState.digitalSignatures
                                                      .length === 0))) && (
                                                <div className="text-center py-4 text-gray-500 text-xs">
                                                  No digital signatures added
                                                  yet.
                                                </div>
                                              )}
                                            </div>

                                            {/* Attachments Section (Admin Only) */}
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                              <h5 className="text-md font-semibold text-gray-900 mb-4">
                                                Attachments
                                              </h5>

                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Optional Attachment 1 */}
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Optional Attachment 1
                                                  </label>
                                                  {isEditingThisOrg ? (
                                                    <div>
                                                      <input
                                                        type="file"
                                                        onChange={(e) => {
                                                          const file =
                                                            e.target.files[0];
                                                          if (file) {
                                                            const reader =
                                                              new FileReader();
                                                            reader.onloadend =
                                                              () => {
                                                                const base64 =
                                                                  reader.result;
                                                                updateOrganization(
                                                                  orgInState.id,
                                                                  "optionalAttachment1",
                                                                  base64,
                                                                );
                                                              };
                                                            reader.readAsDataURL(
                                                              file,
                                                            );
                                                          }
                                                        }}
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                        id={`optional-attachment-1-view-${idx}`}
                                                      />
                                                      <label
                                                        htmlFor={`optional-attachment-1-view-${idx}`}
                                                        className="cursor-pointer inline-block"
                                                      >
                                                        {orgInState?.optionalAttachment1 ? (
                                                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                                            <p className="text-xs text-gray-700">
                                                              File uploaded
                                                            </p>
                                                            <button
                                                              type="button"
                                                              onClick={(e) => {
                                                                e.preventDefault();
                                                                updateOrganization(
                                                                  orgInState.id,
                                                                  "optionalAttachment1",
                                                                  null,
                                                                );
                                                              }}
                                                              className="text-xs text-red-600 hover:text-red-800 mt-1"
                                                            >
                                                              Remove
                                                            </button>
                                                          </div>
                                                        ) : (
                                                          <span className="px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block text-xs">
                                                            Upload File
                                                          </span>
                                                        )}
                                                      </label>
                                                    </div>
                                                  ) : (
                                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                                      {org.optional_attachment_1 ? (
                                                        <button
                                                          onClick={() =>
                                                            handleViewFile(
                                                              org.optional_attachment_1,
                                                            )
                                                          }
                                                          className="text-blue-600 hover:underline text-xs"
                                                        >
                                                          View File
                                                        </button>
                                                      ) : (
                                                        <p className="text-gray-500 text-xs">
                                                          No file uploaded
                                                        </p>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Optional Attachment 2 */}
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Optional Attachment 2
                                                  </label>
                                                  {isEditingThisOrg ? (
                                                    <div>
                                                      <input
                                                        type="file"
                                                        onChange={(e) => {
                                                          const file =
                                                            e.target.files[0];
                                                          if (file) {
                                                            const reader =
                                                              new FileReader();
                                                            reader.onloadend =
                                                              () => {
                                                                const base64 =
                                                                  reader.result;
                                                                updateOrganization(
                                                                  orgInState.id,
                                                                  "optionalAttachment2",
                                                                  base64,
                                                                );
                                                              };
                                                            reader.readAsDataURL(
                                                              file,
                                                            );
                                                          }
                                                        }}
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                        id={`optional-attachment-2-view-${idx}`}
                                                      />
                                                      <label
                                                        htmlFor={`optional-attachment-2-view-${idx}`}
                                                        className="cursor-pointer inline-block"
                                                      >
                                                        {orgInState?.optionalAttachment2 ? (
                                                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                                            <p className="text-xs text-gray-700">
                                                              File uploaded
                                                            </p>
                                                            <button
                                                              type="button"
                                                              onClick={(e) => {
                                                                e.preventDefault();
                                                                updateOrganization(
                                                                  orgInState.id,
                                                                  "optionalAttachment2",
                                                                  null,
                                                                );
                                                              }}
                                                              className="text-xs text-red-600 hover:text-red-800 mt-1"
                                                            >
                                                              Remove
                                                            </button>
                                                          </div>
                                                        ) : (
                                                          <span className="px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block text-xs">
                                                            Upload File
                                                          </span>
                                                        )}
                                                      </label>
                                                    </div>
                                                  ) : (
                                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                                      {org.optional_attachment_2 ? (
                                                        <button
                                                          onClick={() =>
                                                            handleViewFile(
                                                              org.optional_attachment_2,
                                                            )
                                                          }
                                                          className="text-blue-600 hover:underline text-xs"
                                                        >
                                                          View File
                                                        </button>
                                                      ) : (
                                                        <p className="text-gray-500 text-xs">
                                                          No file uploaded
                                                        </p>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Attachments Tab */}
                                        {activeOrgTab === "attachments" && (
                                          <div className="pt-6">
                                            <h5 className="text-md font-semibold text-gray-900 mb-2">
                                              Attachments
                                            </h5>
                                            <p className="text-sm text-gray-600 mb-4 max-w-xl">
                                              Upload and manage all company
                                              documents for this organization in
                                              the dedicated Company Documents
                                              section.
                                            </p>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                navigate(
                                                  `/admin/client-company-documents/${userId}/${orgInState.id}`,
                                                  {
                                                    state: {
                                                      orgId: orgInState.id,
                                                      userId,
                                                    },
                                                  },
                                                )
                                              }
                                              className="px-6 py-2 bg-[#00486D] text-white rounded-lg text-sm font-semibold hover:bg-[#01334C] transition-colors"
                                            >
                                              Go to Company Documents
                                            </button>
                                          </div>
                                        )}

                                        {/* Credentials Tab */}
                                        {activeOrgTab === "credentials" && (
                                          <div>
                                            {/* Website Details Section */}
                                            <div className="pt-6">
                                              <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-md font-semibold text-gray-900">
                                                  Credentials
                                                </h5>
                                                {isEditingThisOrg && (
                                                  <button
                                                    onClick={() =>
                                                      addWebsiteToOrg(
                                                        orgInState.id,
                                                      )
                                                    }
                                                    className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                                                  >
                                                    <AiOutlinePlus className="w-4 h-4" />
                                                    Add Website
                                                  </button>
                                                )}
                                              </div>

                                              {orgWebsites &&
                                              orgWebsites.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                  <table className="w-full border-collapse bg-white text-sm">
                                                    <thead>
                                                      <tr className="bg-gray-100 border-b border-gray-300">
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                                          Type
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                                          URL
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                                          Login
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                                          Password
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                                          Remarks
                                                        </th>
                                                        {isEditingThisOrg && (
                                                          <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                                                            Actions
                                                          </th>
                                                        )}
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {(orgWebsites || []).map(
                                                        (website) => (
                                                          <tr
                                                            key={website.id}
                                                            className="bg-white border-b border-gray-200"
                                                          >
                                                            <td className="px-3 py-2 border border-gray-300">
                                                              {isEditingThisOrg ? (
                                                                <select
                                                                  value={
                                                                    website.type
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    updateWebsiteInOrg(
                                                                      orgInState.id,
                                                                      website.id,
                                                                      "type",
                                                                      e.target
                                                                        .value,
                                                                    )
                                                                  }
                                                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                >
                                                                  <option value="">
                                                                    Select Type
                                                                  </option>
                                                                  <option value="Income Tax">
                                                                    Income Tax
                                                                  </option>
                                                                  <option value="GST">
                                                                    GST
                                                                  </option>
                                                                  <option value="Income Tax – TAN Based">
                                                                    Income Tax –
                                                                    TAN Based
                                                                  </option>
                                                                  <option value="Professional Tax">
                                                                    Professional
                                                                    Tax
                                                                  </option>
                                                                  <option value="Provident Fund">
                                                                    Provident
                                                                    Fund
                                                                  </option>
                                                                  <option value="ESIC">
                                                                    ESIC
                                                                  </option>
                                                                  <option value="MCA">
                                                                    MCA
                                                                  </option>
                                                                  <option value="Labour license">
                                                                    Labour
                                                                    license
                                                                  </option>
                                                                  <option value="TRACES">
                                                                    TRACES
                                                                  </option>
                                                                  <option value="ICEGATE">
                                                                    ICEGATE
                                                                  </option>
                                                                  <option value="Service Tax">
                                                                    Service Tax
                                                                  </option>
                                                                  <option value="VAT">
                                                                    VAT
                                                                  </option>
                                                                  <option value="Others 1">
                                                                    Others 1
                                                                  </option>
                                                                  <option value="Others 2">
                                                                    Others 2
                                                                  </option>
                                                                  <option value="Others 3">
                                                                    Others 3
                                                                  </option>
                                                                </select>
                                                              ) : (
                                                                website.type ||
                                                                "-"
                                                              )}
                                                            </td>
                                                            <td className="px-3 py-2 border border-gray-300">
                                                              {isEditingThisOrg ? (
                                                                <input
                                                                  type="text"
                                                                  value={
                                                                    website.url
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    updateWebsiteInOrg(
                                                                      orgInState.id,
                                                                      website.id,
                                                                      "url",
                                                                      e.target
                                                                        .value,
                                                                    )
                                                                  }
                                                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                />
                                                              ) : website.url ? (
                                                                <a
                                                                  href={
                                                                    website.url
                                                                  }
                                                                  target="_blank"
                                                                  rel="noopener noreferrer"
                                                                  className="text-blue-600 hover:underline"
                                                                >
                                                                  {website.url}
                                                                </a>
                                                              ) : (
                                                                "-"
                                                              )}
                                                            </td>
                                                            <td className="px-3 py-2 border border-gray-300">
                                                              {isEditingThisOrg ? (
                                                                <input
                                                                  type="text"
                                                                  value={
                                                                    website.login
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    updateWebsiteInOrg(
                                                                      orgInState.id,
                                                                      website.id,
                                                                      "login",
                                                                      e.target
                                                                        .value,
                                                                    )
                                                                  }
                                                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                />
                                                              ) : (
                                                                website.login ||
                                                                "-"
                                                              )}
                                                            </td>
                                                            <td className="px-3 py-2 border border-gray-300">
                                                              {isEditingThisOrg ? (
                                                                <div className="relative">
                                                                  <input
                                                                    type={
                                                                      website.showPassword
                                                                        ? "text"
                                                                        : "password"
                                                                    }
                                                                    value={
                                                                      website.password
                                                                    }
                                                                    onChange={(
                                                                      e,
                                                                    ) =>
                                                                      updateWebsiteInOrg(
                                                                        orgInState.id,
                                                                        website.id,
                                                                        "password",
                                                                        e.target
                                                                          .value,
                                                                      )
                                                                    }
                                                                    className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                                                                  />
                                                                  <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                      togglePasswordVisibilityInOrg(
                                                                        orgInState.id,
                                                                        website.id,
                                                                      )
                                                                    }
                                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                                  >
                                                                    {website.showPassword ? (
                                                                      <FiEyeOff className="w-4 h-4" />
                                                                    ) : (
                                                                      <FiEye className="w-4 h-4" />
                                                                    )}
                                                                  </button>
                                                                </div>
                                                              ) : website.password ? (
                                                                "••••••••"
                                                              ) : (
                                                                "-"
                                                              )}
                                                            </td>
                                                            <td className="px-3 py-2 border border-gray-300">
                                                              {isEditingThisOrg ? (
                                                                <input
                                                                  type="text"
                                                                  value={
                                                                    website.remarks ||
                                                                    ""
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    updateWebsiteInOrg(
                                                                      orgInState.id,
                                                                      website.id,
                                                                      "remarks",
                                                                      e.target
                                                                        .value,
                                                                    )
                                                                  }
                                                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                  placeholder="Enter remarks"
                                                                />
                                                              ) : (
                                                                website.remarks ||
                                                                "-"
                                                              )}
                                                            </td>
                                                            {isEditingThisOrg && (
                                                              <td className="px-3 py-2 border border-gray-300">
                                                                <button
                                                                  onClick={() =>
                                                                    removeWebsiteFromOrg(
                                                                      orgInState.id,
                                                                      website.id,
                                                                    )
                                                                  }
                                                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                                >
                                                                  Remove
                                                                </button>
                                                              </td>
                                                            )}
                                                          </tr>
                                                        ),
                                                      )}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              ) : (
                                                <p className="text-gray-500 text-sm">
                                                  No websites added yet.
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {activeOrgTab === "notes" && (
                                          <div className="mt-6">
                                            <OrganizationNotesSection
                                              adminNotesList={adminNotesList || []}
                                              userNotesList={userNotesList || []}
                                              organizationId={org?.id}
                                              handleViewFile={handleViewFile}
                                              organisations={organisations}
                                              userId={userId}
                                              onAddNote={() => {
                                                // Redirect to Admin Client Overview Notes tab to add note
                                                navigate(`/admin/client-overview/${userId}?tab=notes&orgId=${org?.id}`);
                                              }}
                                              onSaveAdminNote={handleSaveAdminNoteInline ? async (editedNote, noteIndex) => {
                                                // noteIndex is already the index in the full adminNotesList
                                                if (noteIndex !== -1) {
                                                  await handleSaveAdminNoteInline(editedNote, noteIndex);
                                                } else {
                                                  console.error("Could not find note in adminNotesList");
                                                }
                                              } : undefined}
                                              onDeleteNote={handleDeleteNote ? (index, note) => {
                                                // Find the note in the full adminNotesList
                                                const fullIndex = adminNotesList.findIndex(
                                                  (n) => (n.id && note.id && n.id === note.id) || n === note
                                                );
                                                if (fullIndex !== -1) {
                                                  handleDeleteNote(fullIndex);
                                                }
                                              } : undefined}
                                            />
                                          </div>
                                        )}

                                        {activeOrgTab === "tasks" && (
                                          <div className="mt-6">
                                            <OrganizationTasksSection
                                              adminTasksList={adminTasksList || []}
                                              userTasksList={userTasksList || []}
                                              organizationId={org?.id}
                                              onAddTask={() => {
                                                // Redirect to Admin Client Overview Tasks tab to add task
                                                navigate(`/admin/client-overview/${userId}?tab=tasks&orgId=${org?.id}`);
                                              }}
                                            />
                                          </div>
                                        )}


                                        {/* Action Buttons - Outside tabs */}
                                        {isEditingThisOrg && (
                                          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-2">
                                            <button
                                              onClick={() => {
                                                setEditingOrgId(null);
                                                fetchClientProfile();
                                              }}
                                              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={async () => {
                                                await handleSaveOrganisations();
                                              }}
                                              disabled={savingOrg}
                                              className="px-4 py-2 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm disabled:opacity-50"
                                            >
                                              {savingOrg
                                                ? "Saving..."
                                                : "Save Changes"}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })()}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No organisation details available
                </p>
                <button
                  onClick={() => {
                    // Initialize with one empty organization
                    setOrganisations([
                      {
                        id: Date.now(),
                        organisationType: "",
                        legalName: "",
                        tradeName: "",
                        category: "",
                        gstin: "",
                        incorporationDate: "",
                        panFile: null,
                        tan: "",
                        cin: "",
                        registeredAddress: "",
                        websites: [],
                      },
                    ]);
                    setIsEditingOrganisations(true);
                  }}
                  className="px-5 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                >
                  <AiOutlinePlus className="w-5 h-5" />
                  Add Organization
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Website Details section removed - Websites are now managed within each organization */}
    </div>
  );
}

export default ClientOrganisationTab;
