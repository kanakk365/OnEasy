import React, { useState, useEffect, useRef } from "react";
import { BsCalendar3 } from "react-icons/bs";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { lookupPincode } from "../../../../utils/pincodeLookup";

const CATEGORY_OPTIONS = [
  "Individual",
  "Hindu undivided family",
  "Partnership Firm",
  "Limited Liability Partnership",
  "Private Limited Company",
  "One Person Company",
  "Section 8 Company",
  "Society",
  "Charitable Trust",
  "Government",
  "Association of Persons",
  "Body of Individuals",
  "Artificial Judicial Person",
];

const BasicDetailsSection = ({
  editingOrg,
  selectedOrg,
  updateOrganizationField,
  handlePanFileUpload,
  handleViewFile,
  formatDate,
}) => {
  const data = editingOrg || selectedOrg;
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [lastAutoFilledState, setLastAutoFilledState] = useState(null);
  const isAutoFillingRef = useRef(false);

  // Log when data changes
  useEffect(() => {
    console.log("[DATA CHANGE] Data updated:", {
      registeredAddressState: data?.registeredAddressState,
      registeredAddressDistrict: data?.registeredAddressDistrict,
      registeredAddressPincode: data?.registeredAddressPincode,
      editingOrgState: editingOrg?.registeredAddressState,
      selectedOrgState: selectedOrg?.registeredAddressState
    });
  }, [data?.registeredAddressState, data?.registeredAddressDistrict, data?.registeredAddressPincode, editingOrg?.registeredAddressState, selectedOrg?.registeredAddressState]);

  // Ensure auto-filled State value persists - restore if it gets cleared
  useEffect(() => {
    if (!editingOrg || !lastAutoFilledState || isAutoFillingRef.current) return;
    
    const currentState = data?.registeredAddressState;
    console.log("[STATE EFFECT] Checking state persistence:", {
      currentState,
      lastAutoFilledState,
      editingOrgState: editingOrg?.registeredAddressState,
      isAutoFilling: isAutoFillingRef.current
    });
    
    // If state was auto-filled but is now empty, restore it immediately
    if ((!currentState || currentState === "-" || currentState.trim() === "") && lastAutoFilledState) {
      console.log("[STATE EFFECT] State was cleared! Attempting to restore:", lastAutoFilledState);
      // Use multiple attempts to ensure it persists
      const restoreState = () => {
        const checkState = (editingOrg || selectedOrg)?.registeredAddressState;
        console.log("[STATE EFFECT] Restore attempt, checkState:", checkState);
        if (!checkState || checkState === "-" || checkState.trim() === "") {
          console.log("[STATE EFFECT] Restoring state to:", lastAutoFilledState);
          updateOrganizationField("registeredAddressState", lastAutoFilledState);
        } else {
          console.log("[STATE EFFECT] State is already set, no restore needed");
        }
      };
      
      // Try immediately
      restoreState();
      
      // Try after a short delay
      const timer1 = setTimeout(restoreState, 100);
      
      // Try after a longer delay
      const timer2 = setTimeout(restoreState, 500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [data?.registeredAddressState, lastAutoFilledState, editingOrg, selectedOrg]);

  return (
    <div className="bg-[#f2f6f7] rounded-xl p-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        New Organizations
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Legal Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Legal Name
          </label>
          {editingOrg ? (
            <input
              type="text"
              value={
                data.legalName && data.legalName !== "-" ? data.legalName : ""
              }
              onChange={(e) =>
                updateOrganizationField("legalName", e.target.value)
              }
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
              placeholder="Enter Legal Name"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              {data.legalName || "-"}
            </div>
          )}
        </div>

        {/* Trade Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trade Name
          </label>
          {editingOrg ? (
            <input
              type="text"
              value={
                data.tradeName && data.tradeName !== "-" ? data.tradeName : ""
              }
              onChange={(e) =>
                updateOrganizationField("tradeName", e.target.value)
              }
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
              placeholder="Enter Trade Name"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              {data.tradeName || "-"}
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="relative">
            {editingOrg ? (
              <select
                value={
                  data.category && data.category !== "-" ? data.category : ""
                }
                onChange={(e) =>
                  updateOrganizationField("category", e.target.value)
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow appearance-none"
              >
                <option value="">Select Category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                {data.category || "-"}
              </div>
            )}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
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
            </div>
          </div>
        </div>

        {/* GSTIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GSTIN
          </label>
          {editingOrg ? (
            <input
              type="text"
              value={data.gstin && data.gstin !== "-" ? data.gstin : ""}
              onChange={(e) => updateOrganizationField("gstin", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
              placeholder="Enter GSTIN"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              {data.gstin || "-"}
            </div>
          )}
        </div>

        {/* PAN Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Number
          </label>
          {editingOrg ? (
            <input
              type="text"
              value={data.panNumber && data.panNumber !== "-" ? data.panNumber : ""}
              onChange={(e) => updateOrganizationField("panNumber", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
              placeholder="Enter PAN Number"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              {data.panNumber || "-"}
            </div>
          )}
        </div>

        {/* Incorporation Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incorporation Date
          </label>
          <div className="relative">
            {editingOrg ? (
              <input
                type="date"
                value={
                  data.incorporationDate && data.incorporationDate !== "-"
                    ? data.incorporationDate
                    : ""
                }
                onChange={(e) =>
                  updateOrganizationField("incorporationDate", e.target.value)
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
              />
            ) : (
              <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center justify-between">
                <span>
                  {data.incorporationDate
                    ? formatDate(data.incorporationDate)
                    : "-"}
                </span>
                <BsCalendar3 className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* PAN File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN File
          </label>
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden items-center p-1">
            <div className="flex-1 px-4 py-2 text-sm text-gray-500 truncate">
              {data.panFile ? "File uploaded" : "Upload file"}
            </div>
            {editingOrg ? (
              <label className="bg-[#00486D] text-white w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#01334C] transition-colors flex-shrink-0">
                <input
                  type="file"
                  onChange={handlePanFileUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <AiOutlineCloudUpload className="w-5 h-5" />
              </label>
            ) : (
              data.panFile && (
                <button
                  onClick={() => handleViewFile(data.panFile)}
                  className="bg-[#00486D] text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#01334C] transition-colors flex-shrink-0"
                >
                  <AiOutlineCloudUpload className="w-5 h-5" />
                </button>
              )
            )}
          </div>
        </div>

        {/* TAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TAN
          </label>
          {editingOrg ? (
            <input
              type="text"
              value={data.tan && data.tan !== "-" ? data.tan : ""}
              onChange={(e) => updateOrganizationField("tan", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
              placeholder="Enter TAN"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              {data.tan || "-"}
            </div>
          )}
        </div>

        {/* CIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CIN
          </label>
          {editingOrg ? (
            <input
              type="text"
              value={data.cin && data.cin !== "-" ? data.cin : ""}
              onChange={(e) => updateOrganizationField("cin", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
              placeholder="Enter CIN"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              {data.cin || "-"}
            </div>
          )}
        </div>

        {/* Registered Address Section */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Registered Office Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Line 1 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1
              </label>
              {editingOrg ? (
                <input
                  type="text"
                  value={
                    data.registeredAddressLine1 && data.registeredAddressLine1 !== "-"
                      ? data.registeredAddressLine1
                      : ""
                  }
                  onChange={(e) =>
                    updateOrganizationField("registeredAddressLine1", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                  placeholder="Enter Address Line 1"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                  {data.registeredAddressLine1 || "-"}
                </div>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              {editingOrg ? (
                <input
                  type="text"
                  value={
                    data.registeredAddressLine2 && data.registeredAddressLine2 !== "-"
                      ? data.registeredAddressLine2
                      : ""
                  }
                  onChange={(e) =>
                    updateOrganizationField("registeredAddressLine2", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                  placeholder="Enter Address Line 2 (Optional)"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                  {data.registeredAddressLine2 || "-"}
                </div>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              {editingOrg ? (
                <input
                  type="text"
                  value={
                    data.registeredAddressDistrict && data.registeredAddressDistrict !== "-"
                      ? data.registeredAddressDistrict
                      : ""
                  }
                  onChange={(e) =>
                    updateOrganizationField("registeredAddressDistrict", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                  placeholder="Enter District"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                  {data.registeredAddressDistrict || "-"}
                </div>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              {editingOrg ? (
                <input
                  type="text"
                  value={
                    data.registeredAddressState && data.registeredAddressState !== "-"
                      ? data.registeredAddressState
                      : ""
                  }
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log("[STATE INPUT] onChange triggered:", {
                      newValue,
                      isAutoFilling: isAutoFillingRef.current,
                      lastAutoFilledState,
                      currentDataState: data?.registeredAddressState
                    });
                    
                    // Don't update if we're currently auto-filling
                    if (isAutoFillingRef.current) {
                      console.log("[STATE INPUT] Blocked onChange - auto-filling in progress");
                      return;
                    }
                    
                    console.log("[STATE INPUT] Updating state field to:", newValue);
                    updateOrganizationField("registeredAddressState", newValue);
                    // If user manually changes it, clear the auto-filled flag
                    if (newValue !== lastAutoFilledState) {
                      console.log("[STATE INPUT] User manually changed state, clearing auto-fill flag");
                      setLastAutoFilledState(null);
                    }
                  }}
                  onBlur={(e) => {
                    console.log("[STATE INPUT] onBlur triggered:", {
                      value: e.target.value,
                      lastAutoFilledState,
                      isAutoFilling: isAutoFillingRef.current
                    });
                    // If field is empty but we have an auto-filled value, restore it
                    if ((!e.target.value || e.target.value.trim() === "") && lastAutoFilledState && !isAutoFillingRef.current) {
                      console.log("[STATE INPUT] Field blurred empty, restoring:", lastAutoFilledState);
                      updateOrganizationField("registeredAddressState", lastAutoFilledState);
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                  placeholder="Enter State"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                  {data.registeredAddressState || "-"}
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              {editingOrg ? (
                <input
                  type="text"
                  value={
                    data.registeredAddressCountry && data.registeredAddressCountry !== "-"
                      ? data.registeredAddressCountry
                      : "India"
                  }
                  onChange={(e) =>
                    updateOrganizationField("registeredAddressCountry", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                  placeholder="Enter Country"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                  {data.registeredAddressCountry || "India"}
                </div>
              )}
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code
              </label>
              {editingOrg ? (
                <div>
                  <div className="relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={
                        data.registeredAddressPincode && data.registeredAddressPincode !== "-"
                          ? String(data.registeredAddressPincode).replace(/\D/g, "").slice(0, 6)
                          : ""
                      }
                      onChange={async (e) => {
                        // Get the raw input value
                        const inputValue = e.target.value;
                        
                        // Remove all non-digit characters and limit to 6 digits
                        const cleanedValue = inputValue.replace(/\D/g, "").slice(0, 6);
                        
                        // Update the field - this should allow all 6 digits
                        updateOrganizationField("registeredAddressPincode", cleanedValue);
                        
                        // Auto-trigger lookup when exactly 6 digits are entered
                        if (cleanedValue.length === 6) {
                          setPincodeLoading(true);
                          setPincodeError("");
                          console.log("[PIN CODE] Starting lookup for:", cleanedValue);
                          try {
                            const result = await lookupPincode(cleanedValue);
                            setPincodeLoading(false);
                            console.log("[PIN CODE] Lookup result:", result);
                            if (result.success) {
                              // Set flag to prevent clearing during auto-fill
                              isAutoFillingRef.current = true;
                              console.log("[PIN CODE] Setting isAutoFillingRef to true");
                              
                              // Update both fields in a single operation to prevent race conditions
                              if (result.state || result.district) {
                                // Store the auto-filled state value
                                if (result.state) {
                                  setLastAutoFilledState(result.state);
                                }
                                
                                // Get current editingOrg to ensure we have the latest state
                                const currentOrg = editingOrg || selectedOrg;
                                if (currentOrg) {
                                  // Update both fields atomically
                                  const updatedFields = {};
                                  if (result.state) {
                                    updatedFields.registeredAddressState = result.state;
                                    console.log("[PIN CODE] Will update State:", result.state);
                                  }
                                  if (result.district) {
                                    updatedFields.registeredAddressDistrict = result.district;
                                    console.log("[PIN CODE] Will update District:", result.district);
                                  }
                                  
                                  // Update each field individually but ensure we use the latest editingOrg
                                  Object.keys(updatedFields).forEach((field, index) => {
                                    setTimeout(() => {
                                      console.log(`[PIN CODE] Updating ${field}:`, updatedFields[field]);
                                      updateOrganizationField(field, updatedFields[field]);
                                    }, index * 10); // Small delay between updates
                                  });
                                }
                              }
                              
                              // Update both fields immediately using functional updates
                              if (result.state) {
                                console.log("[PIN CODE] Auto-filling State:", result.state);
                                setLastAutoFilledState(result.state);
                                updateOrganizationField("registeredAddressState", result.state);
                              }
                              if (result.district) {
                                console.log("[PIN CODE] Auto-filling District:", result.district);
                                updateOrganizationField("registeredAddressDistrict", result.district);
                              }
                            } else {
                              console.log("[PIN CODE] Lookup failed:", result.error);
                              setPincodeError(result.error || "Invalid PIN code");
                            }
                          } catch (error) {
                            console.error("[PIN CODE] Lookup error:", error);
                            setPincodeLoading(false);
                            setPincodeError("Failed to lookup PIN code");
                          }
                        } else {
                          setPincodeError("");
                          // Clear auto-filled flag when PIN code changes
                          if (cleanedValue.length < 6) {
                            setLastAutoFilledState(null);
                          }
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                      placeholder="Enter 6-digit PIN Code"
                      maxLength={6}
                    />
                    {pincodeLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00486D]"></div>
                      </div>
                    )}
                  </div>
                  {pincodeError && (
                    <p className="mt-1 text-xs text-red-600">{pincodeError}</p>
                  )}
                  {!pincodeError && data.registeredAddressPincode && /^\d{6}$/.test(data.registeredAddressPincode) && (
                    <p className="mt-1 text-xs text-green-600">✓ Auto-filled State & District</p>
                  )}
                </div>
              ) : (
                <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                  {data.registeredAddressPincode || "-"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicDetailsSection;
