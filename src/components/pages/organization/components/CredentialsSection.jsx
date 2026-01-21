import React from "react";
import {
  AiOutlinePlus,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";

const CredentialsSection = ({
  editingOrg,
  selectedOrg,
  addWebsite,
  updateWebsite,
  togglePasswordVisibility,
  removeWebsite,
}) => {
  const data = editingOrg || selectedOrg;
  const websites = data?.websites || [];

  const WEBSITE_TYPES = [
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
  ];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="mb-4 bg-purple-50 p-4 rounded-xl">
        <img
          src="/empty.svg"
          alt="No Items"
          className="w-16 h-16 opacity-90 mx-auto"
        />
      </div>
      <p className="text-gray-500 text-sm mb-6">No Website Details added yet</p>
      {editingOrg && (
        <button
          onClick={addWebsite}
          className="bg-[#00486D] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#01334C] transition-colors"
        >
          Add Website Details
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#f2f6f7] rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Credentials</h3>
        {editingOrg && (
          <button
            onClick={addWebsite}
            className="bg-[#00486D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#01334C] transition-colors flex items-center gap-2"
          >
            <AiOutlinePlus className="w-4 h-4" /> Add Credentials
          </button>
        )}
      </div>

      {websites.length === 0 ? (
        <EmptyState />
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
                {editingOrg && (
                  <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {websites.map((website) => (
                <tr key={website.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {editingOrg ? (
                      <select
                        value={website.type || ""}
                        onChange={(e) =>
                          updateWebsite(website.id, "type", e.target.value)
                        }
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                      >
                        <option value="">Select Type</option>
                        {WEBSITE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    ) : (
                      website.type || "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {editingOrg ? (
                      <input
                        type="text"
                        value={website.url || ""}
                        onChange={(e) =>
                          updateWebsite(website.id, "url", e.target.value)
                        }
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                        placeholder="Enter URL"
                      />
                    ) : (
                      website.url ? (
                        <a
                          href={
                            website.url.startsWith("http")
                              ? website.url
                              : `https://${website.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {website.url}
                        </a>
                      ) : (
                        "-"
                      )
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {editingOrg ? (
                      <input
                        type="text"
                        value={website.login || ""}
                        onChange={(e) =>
                          updateWebsite(website.id, "login", e.target.value)
                        }
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                        placeholder="Enter Login"
                      />
                    ) : (
                      website.login || "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <div className="flex items-center gap-2">
                      {editingOrg ? (
                        <input
                          type={website.showPassword ? "text" : "password"}
                          value={website.password || ""}
                          onChange={(e) =>
                            updateWebsite(website.id, "password", e.target.value)
                          }
                          className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                          placeholder="Enter Password"
                        />
                      ) : (
                        <span>
                          {website.password
                            ? website.showPassword
                              ? website.password
                              : "••••••••"
                            : "-"}
                        </span>
                      )}
                      {website.password && (
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(website.id)}
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
                  {editingOrg && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeWebsite(website.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CredentialsSection;
