import React from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";

const OrganizationList = ({
  searchTerm,
  setSearchTerm,
  currentItems,
  filteredOrgs,
  indexOfFirstItem,
  totalPages,
  currentPage,
  paginate,
  addOrganization,
  setSelectedOrg,
}) => {
  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              List Of Companies
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Your registered organizations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={addOrganization}
            className="bg-[#00486D] hover:bg-[#023752] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            <AiOutlinePlus className="w-4 h-4" />
            Create Company
          </button>

          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00486D] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-6 rounded-xl bg-[#f5f5f5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-white">
                <th className="px-6 py-3 text-left text-sm font-medium bg-[#00486D] rounded-l-xl text-white">
                  Organisation Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium bg-[#00486D] text-white">
                  GST Number
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium bg-[#00486D] rounded-r-xl text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {org.legalName && org.legalName !== "-"
                        ? org.legalName
                        : org.tradeName !== "-"
                        ? org.tradeName
                        : "Unnamed Company"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {org.gstin && org.gstin !== "-" ? org.gstin : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedOrg(org)}
                        style={{
                          background:
                            "linear-gradient(90deg, #00486D 0%, #023752 100%)",
                        }}
                        className="text-white px-6 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No organizations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredOrgs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {String(indexOfFirstItem + 1).padStart(2, "0")} of{" "}
              {filteredOrgs.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 py-1 rounded-lg bg-[#00486D] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#023752] transition-colors cursor-pointer"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 py-1 rounded-lg bg-[#00486D] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#023752] transition-colors cursor-pointer"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationList;
