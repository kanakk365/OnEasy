import React from "react";
import { BsCalendar3 } from "react-icons/bs";
import { AiOutlineCloudUpload } from "react-icons/ai";

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

  return (
    <div className="bg-[#f2f6f7] rounded-xl p-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        New Organizations
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Organisation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organisation Type
          </label>
          <div className="relative">
            {editingOrg ? (
              <input
                type="text"
                value={data.organisationType || ""}
                onChange={(e) =>
                  updateOrganizationField("organisationType", e.target.value)
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                placeholder="Enter Organisation Type"
              />
            ) : (
              <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                {data.organisationType || "-"}
              </div>
            )}
          </div>
        </div>

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

        {/* Registered Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registered Address
          </label>
          {editingOrg ? (
            <input
              type="text"
              value={
                data.registeredAddress && data.registeredAddress !== "-"
                  ? data.registeredAddress
                  : ""
              }
              onChange={(e) =>
                updateOrganizationField("registeredAddress", e.target.value)
              }
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
              placeholder="Enter Registered Address"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 truncate">
              {data.registeredAddress || "-"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicDetailsSection;
