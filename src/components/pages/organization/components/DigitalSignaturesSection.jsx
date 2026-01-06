import React from "react";
import { AiOutlinePlus } from "react-icons/ai";

const DigitalSignaturesSection = ({
  editingOrg,
  selectedOrg,
  addDigitalSignature,
  removeDigitalSignature,
  updateDigitalSignature,
}) => {
  const data = editingOrg || selectedOrg;
  const digitalSignatures = data?.digitalSignatures || [];

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
        No Digital Signature added yet
      </p>
      {editingOrg && (
        <button
          onClick={addDigitalSignature}
          className="bg-[#00486D] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#01334C] transition-colors"
        >
          Add Digital Signature
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#f2f6f7] rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Digital Signature Details
        </h3>
        {editingOrg && digitalSignatures.length > 0 && (
          <button
            onClick={addDigitalSignature}
            className="bg-[#00486D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#01334C] transition-colors flex items-center gap-2"
          >
            <AiOutlinePlus className="w-4 h-4" /> Add Digital Signature
          </button>
        )}
      </div>

      {digitalSignatures.length === 0 ? (
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
                    DSC Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Expiry Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>
                  {editingOrg && (
                    <th className="px-4 py-3 text-center text-sm font-medium">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {digitalSignatures.map((ds) => (
                  <tr key={ds.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={ds.name || ""}
                          onChange={(e) =>
                            updateDigitalSignature(
                              ds.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                          placeholder="Name"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {ds.name || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={ds.dscNumber || ""}
                          onChange={(e) =>
                            updateDigitalSignature(
                              ds.id,
                              "dscNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                          placeholder="DSC Number"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {ds.dscNumber || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={ds.expiryDate || ""}
                          onChange={(e) =>
                            updateDigitalSignature(
                              ds.id,
                              "expiryDate",
                              e.target.value
                            )
                          }
                          placeholder="DD/MM/YYYY"
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#00486D]"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {ds.expiryDate || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingOrg ? (
                        <input
                          type="text"
                          value={ds.status || "Active"}
                          readOnly
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">
                          {ds.status || "Active"}
                        </span>
                      )}
                    </td>
                    {editingOrg && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeDigitalSignature(ds.id)}
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

export default DigitalSignaturesSection;
