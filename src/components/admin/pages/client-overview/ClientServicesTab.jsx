import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FiTrash2 } from "react-icons/fi";

function ClientServicesTab({
  allRegistrations,
  userId,
  navigate,
  isServiceCardExpanded,
  setIsServiceCardExpanded,
  isStatusDropdownOpen,
  setIsStatusDropdownOpen,
  handleUpdateServiceStatus,
  handleDeleteService,
  formatDate,
  apiClient,
}) {
  return (
        <div className="space-y-4">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
            <button
              onClick={() =>
                navigate(`/admin/new-registration?userId=${userId}`)
              }
              className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-all duration-200 shadow-md"
              title="New Registration"
            >
              <AiOutlinePlus className="w-5 h-5" />
              <span className="text-sm font-medium">New Registration</span>
            </button>
          </div>

          {allRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
              <p className="text-gray-600">
                No registrations found for this client.
              </p>
            </div>
          ) : (
            allRegistrations.map((registration, index) => (
              <div
                key={registration.ticket_id}
                className="bg-white rounded-xl border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]"
              >
                {/* Top Section - Light Blue Background - Clickable */}
                <div
                  onClick={() =>
                    setIsServiceCardExpanded(
                      isServiceCardExpanded === index ? null : index
                    )
                  }
                  className="bg-blue-50 p-6 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-blue-100 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#01334C] text-white flex items-center justify-center font-semibold text-lg">
                      {registration.business_name
                        ? registration.business_name.charAt(0).toUpperCase()
                        : registration.ticket_id?.startsWith("PVT_")
                        ? "P"
                        : registration.ticket_id?.startsWith("SI_")
                        ? "S"
                        : registration.ticket_id?.startsWith("PROP_")
                        ? "Pr"
                        : registration.ticket_id?.startsWith("GST_")
                        ? "G"
                        : "R"}
                    </div>

                    {/* Service & business name */}
                    <div className="flex-1">
                      {/* Primary: Service name (e.g. Private Limited, Proprietorship) */}
                      <h2 className="text-xl font-semibold text-gray-900">
                        {(() => {
                          // Determine registration type by ticket_id prefix first
                          const tid = registration.ticket_id || "";
                          if (tid.startsWith("GST_")) return "GST Registration";
                          if (tid.startsWith("SI_")) return "Startup India";
                          if (tid.startsWith("PROP_")) return "Proprietorship";
                          if (tid.startsWith("PVT_")) return "Private Limited";
                          if (tid.startsWith("OPC_")) return "OPC Registration";
                          if (tid.startsWith("LLP_")) return "LLP Registration";

                          // Fallback: Check package/business name to determine type
                          const packageName = (
                            registration.package_name || ""
                          ).toLowerCase();
                          const businessName = (
                            registration.business_name || ""
                          ).toLowerCase();

                          if (
                            packageName.includes("opc") ||
                            businessName.includes("opc")
                          )
                            return "OPC Registration";
                          if (
                            packageName.includes("llp") ||
                            businessName.includes("llp")
                          )
                            return "LLP Registration";
                          if (
                            packageName.includes("gst") ||
                            businessName.includes("gst")
                          )
                            return "GST Registration";
                          if (
                            packageName.includes("startup") ||
                            businessName.includes("startup")
                          )
                            return "Startup India";
                          if (
                            packageName.includes("proprietorship") ||
                            businessName.includes("proprietorship")
                          )
                            return "Proprietorship";
                          if (
                            packageName.includes("private limited") ||
                            businessName.includes("private limited")
                          )
                            return "Private Limited";

                          return registration.package_name || "Registration";
                        })()}
                      </h2>
                      {/* Secondary: Business name (if any) */}
                      <p className="text-xs text-gray-500 mt-1">
                        {registration.business_name ||
                          (registration.ticket_id
                            ? `Ticket: ${registration.ticket_id}`
                            : "No business name")}
                      </p>
                    </div>

                    {/* Service Status Dropdown + Delete */}
                    <div className="relative flex items-center gap-3">
                      {(() => {
                        const serviceStatusOptions = [
                          "Payment pending",
                          "Payment completed",
                          "Data received",
                          "WIP",
                          "Awaiting confirmation from the Govt",
                          "Data Pending from Client",
                          "Completed",
                          "Technical Issue",
                        ];

                        const currentStatus =
                          registration.service_status || "Payment pending";

                        const getStatusBadgeColor = (status) => {
                          const statusLower = (status || "").toLowerCase();
                          if (
                            statusLower === "completed" ||
                            statusLower === "payment completed"
                          )
                            return "bg-green-100 text-green-800";
                          if (
                            statusLower === "wip" ||
                            statusLower === "data received" ||
                            statusLower ===
                              "awaiting confirmation from the govt" ||
                            statusLower === "data pending from client"
                          )
                            return "bg-blue-100 text-blue-800";
                          if (
                            statusLower === "payment pending" ||
                            statusLower === "technical issue"
                          )
                            return "bg-yellow-100 text-yellow-800";
                          return "bg-gray-100 text-gray-800";
                        };

                        return (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsStatusDropdownOpen(
                                  isStatusDropdownOpen === index ? null : index
                                );
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(
                                currentStatus
                              )}`}
                            >
                              <span>{currentStatus}</span>
                              <svg
                                className="w-4 h-4"
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

                            {/* Dropdown Menu */}
                            {isStatusDropdownOpen === index && (
                              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                                {serviceStatusOptions.map(
                                  (option, optIndex) => (
                                    <button
                                      key={option}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateServiceStatus(
                                          option,
                                          registration.ticket_id
                                        );
                                        setIsStatusDropdownOpen(null);
                                      }}
                                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                        optIndex === 0 ? "rounded-t-lg" : ""
                                      } ${
                                        optIndex ===
                                        serviceStatusOptions.length - 1
                                          ? "rounded-b-lg"
                                          : ""
                                      } ${
                                        currentStatus === option
                                          ? "bg-blue-50 font-semibold"
                                          : ""
                                      }`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          option === "Completed" ||
                                          option === "Payment completed"
                                            ? "bg-green-600"
                                            : option === "WIP" ||
                                              option === "Data received" ||
                                              option ===
                                                "Awaiting confirmation from the Govt" ||
                                              option ===
                                                "Data Pending from Client"
                                            ? "bg-blue-600"
                                            : "bg-yellow-600"
                                        }`}
                                      ></span>
                                      {option}
                                    </button>
                                  )
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {registration.ticket_id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteService(registration);
                          }}
                          className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete Service"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chevron Icon */}
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform ml-4 ${
                      isServiceCardExpanded === index ? "rotate-180" : ""
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
                </div>

                {/* Bottom Section - White Background - Expandable */}
                {isServiceCardExpanded === index && (
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Ticket ID */}
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">
                            Ticket ID:
                          </span>
                          <p className="text-gray-900 mt-1">
                            {registration.ticket_id}
                          </p>
                        </div>

                        {/* Package */}
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">
                            Package:
                          </span>
                          <p className="text-gray-900 mt-1">
                            {registration.package_name} -{" "}
                            <span className="text-green-600 font-semibold">
                              ₹
                              {registration.package_price?.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </p>
                        </div>

                        {/* Payment Date */}
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Payment Date:
                          </span>
                          <p className="text-gray-900 mt-1">
                            {formatDate(registration.created_at)}
                          </p>
                        </div>

                        {/* Business Name */}
                        {registration.business_name && (
                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-700">
                              Business Name:
                            </span>
                            <p className="text-gray-900 mt-1">
                              {registration.business_name}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-6">
                        <button
                          onClick={async () => {
                            // Determine registration type
                            const ticketId = registration.ticket_id;
                            const packageName = (
                              registration.package_name || ""
                            ).toLowerCase();
                            const packagePrice = registration.package_price;

                            // Check ticket_id prefix first
                            if (ticketId?.startsWith("GST_")) {
                              navigate(
                                `/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`
                              );
                            } else if (ticketId?.startsWith("SI_")) {
                              navigate(
                                `/admin/startup-india-form?ticketId=${ticketId}&admin=true&clientId=${userId}`
                              );
                            } else if (ticketId?.startsWith("PROP_")) {
                              navigate(
                                `/admin/proprietorship-form?ticketId=${ticketId}&admin=true&clientId=${userId}`
                              );
                            } else if (ticketId?.startsWith("PVT_")) {
                              // Check if this is actually a GST registration with wrong prefix
                              // GST packages: Starter (₹2,599), Growth (₹5,599), Pro (₹12,999)
                              if (
                                packageName.includes("gst") ||
                                packagePrice === 2599 ||
                                packagePrice === 5599 ||
                                packagePrice === 12999
                              ) {
                                // This is likely a GST registration with wrong ticketId prefix
                                // Try to find the correct GST ticketId by checking GST registrations
                                try {
                                  const gstResponse = await apiClient.get(
                                    `/gst/user-registrations/${userId}`
                                  );
                                  if (gstResponse.success && gstResponse.data) {
                                    const gstRegs = Array.isArray(
                                      gstResponse.data
                                    )
                                      ? gstResponse.data
                                      : gstResponse.data?.data || [];
                                    // Find GST registration with matching package price
                                    const matchingGST = gstRegs.find(
                                      (reg) =>
                                        reg.package_price === packagePrice ||
                                        (reg.package_name &&
                                          reg.package_name
                                            .toLowerCase()
                                            .includes("gst"))
                                    );
                                    if (
                                      matchingGST &&
                                      matchingGST.ticket_id?.startsWith("GST_")
                                    ) {
                                      // Use the correct GST ticketId
                                      navigate(
                                        `/admin/gst-form?ticketId=${matchingGST.ticket_id}&admin=true&clientId=${userId}`
                                      );
                                      return;
                                    }
                                  }
                                } catch (err) {
                                  console.error(
                                    "Error fetching GST registrations:",
                                    err
                                  );
                                }
                                // If no matching GST found, still try to navigate to GST form with the current ticketId
                                // The form will handle it or show an error
                                navigate(
                                  `/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`
                                );
                              } else {
                                navigate(`/admin/client-details/${ticketId}`);
                              }
                            } else {
                              // Fallback: Check package details to determine type
                              if (
                                packageName.includes("gst") ||
                                packagePrice === 2599 ||
                                packagePrice === 5599 ||
                                packagePrice === 12999
                              ) {
                                navigate(
                                  `/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`
                                );
                              } else {
                                navigate(`/admin/client-details/${ticketId}`);
                              }
                            }
                          }}
                          className="px-4 py-2 text-sm bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors whitespace-nowrap"
                        >
                          {(registration.ticket_id?.startsWith("SI_") ||
                            registration.ticket_id?.startsWith("PROP_") ||
                            registration.ticket_id?.startsWith("GST_")) &&
                          (registration.status === "draft" ||
                            registration.status === "incomplete")
                            ? "Fill Form"
                            : "View Details"}
            </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
  );
}

export default ClientServicesTab;