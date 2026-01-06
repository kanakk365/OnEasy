import React from "react";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

const DirectorsPartnersSection = ({
  editingOrg,
  selectedOrg,
  addDirectorPartner,
  removeDirectorPartner,
  updateDirectorPartner,
}) => {
  const data = editingOrg || selectedOrg;
  const directorsPartners = data?.directorsPartners || [];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="mb-4 bg-purple-50 p-4 rounded-xl">
        <img
          src="/empty.svg"
          alt="No Items"
          className="w-16 h-16 opacity-90 mx-auto"
        />
      </div>
      <p className="text-gray-500 text-sm mb-6">
        No Directors / Partners added yet
      </p>
      {editingOrg && (
        <button
          onClick={addDirectorPartner}
          className="bg-[#00486D] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#01334C] transition-colors"
        >
          Add Directors / Partners
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#f2f6f7] rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Directors / Partners Details
        </h3>
        {editingOrg && directorsPartners.length > 0 && (
          <button
            onClick={addDirectorPartner}
            className="bg-[#00486D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#01334C] transition-colors flex items-center gap-2"
          >
            <AiOutlinePlus className="w-4 h-4" /> Add Directors / Partners
          </button>
        )}
      </div>

      {directorsPartners.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#00486D] text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    DIN No.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Date of Addition
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>
                  {editingOrg && (
                    <th className="px-4 py-3 text-center text-sm font-medium">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {directorsPartners.map((dp) => (
                  <tr key={dp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={dp.name || ""}
                          onChange={(e) =>
                            updateDirectorPartner(dp.id, "name", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                          placeholder="Name"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {dp.name || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={dp.dinNumber || ""}
                          onChange={(e) =>
                            updateDirectorPartner(
                              dp.id,
                              "dinNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                          placeholder="DIN No"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {dp.dinNumber || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={dp.contact || ""}
                          onChange={(e) =>
                            updateDirectorPartner(
                              dp.id,
                              "contact",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                          placeholder="Contact"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {dp.contact || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="email"
                          value={dp.email || ""}
                          onChange={(e) =>
                            updateDirectorPartner(
                              dp.id,
                              "email",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                          placeholder="Email"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {dp.email || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={dp.dateOfAddition || ""}
                          // Using text type for date format DD/MM/YYYY placeholder match
                          // logic can be improved but sticking to basic for now
                          onChange={(e) =>
                            updateDirectorPartner(
                              dp.id,
                              "dateOfAddition",
                              e.target.value
                            )
                          }
                          placeholder="DD/MM/YYYY"
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {dp.dateOfAddition || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={dp.status || "Active"}
                          readOnly
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {dp.status || "Active"}
                        </span>
                      )}
                    </td>
                    {editingOrg && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeDirectorPartner(dp.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
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
        </div>
      )}
    </div>
  );
};

export default DirectorsPartnersSection;
