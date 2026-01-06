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
    "GST",
    "Income Tax",
    "MCA (V2)",
    "MCA (V3)",
    "PF",
    "ESI",
    "P-Tax",
    "Trademarks",
    "Other",
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
        <h3 className="text-lg font-semibold text-gray-900">Website Details</h3>
        {editingOrg && websites.length > 0 && (
          <button
            onClick={addWebsite}
            className="bg-[#00486D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#01334C] transition-colors flex items-center gap-2"
          >
            <AiOutlinePlus className="w-4 h-4" /> Add Directors / Partners
          </button>
        )}
      </div>

      {websites.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {websites.map((website) => (
            /* Using a Card layout for filled state as per image, or simplified form rows */
            <div
              key={website.id}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Website Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website Type
                  </label>
                  {editingOrg ? (
                    <div className="relative">
                      <select
                        value={website.type || ""}
                        onChange={(e) =>
                          updateWebsite(website.id, "type", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00486D] appearance-none"
                      >
                        <option value="">Select Type</option>
                        {WEBSITE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
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
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {website.type || "-"}
                    </div>
                  )}
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  {editingOrg ? (
                    <input
                      type="text"
                      value={website.url || ""}
                      onChange={(e) =>
                        updateWebsite(website.id, "url", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00486D]"
                      placeholder="Enter Website URL"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {website.url ? (
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
                      )}
                    </div>
                  )}
                </div>

                {/* Login */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Login
                  </label>
                  {editingOrg ? (
                    <input
                      type="text"
                      value={website.login || ""}
                      onChange={(e) =>
                        updateWebsite(website.id, "login", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00486D]"
                      placeholder="Enter Login"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {website.login || "-"}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    {editingOrg ? (
                      <input
                        type={website.showPassword ? "text" : "password"}
                        value={website.password || ""}
                        onChange={(e) =>
                          updateWebsite(website.id, "password", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00486D]"
                        placeholder="Enter Password"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                        {website.password
                          ? website.showPassword
                            ? website.password
                            : "••••••••"
                          : "-"}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(website.id)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {website.showPassword ? (
                        <AiOutlineEyeInvisible className="w-5 h-5" />
                      ) : (
                        <AiOutlineEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {editingOrg && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => removeWebsite(website.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CredentialsSection;
