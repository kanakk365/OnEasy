import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FiTrash2, FiMessageSquare, FiX } from "react-icons/fi";
import complianceApi from "../../../../utils/complianceApi";

const PAYMENT_STATUS_OPTIONS = [
  "Paid",
  "Partially Paid",
  "Payment Pending",
  "Pay later",
  "Open to Pay",
];
const WORK_STATUS_OPTIONS = [
  "Data pending from client",
  "Data Received",
  "Awaiting Data",
  "WIP",
  "Awaiting response from the Government",
  "On Hold",
  "Under Review",
  "Completed",
  "Client Withdrawl"
];

function paymentStatusToDisplay(dbValue) {
  if (!dbValue) return "Open to Pay";
  const v = String(dbValue).toLowerCase().replace(/_/g, " ");
  const map = {
    paid: "Paid",
    partially_paid: "Partially Paid",
    "pay later": "Pay later",
    "open to pay": "Open to Pay",
    pending: "Open to Pay",
    unpaid: "Open to Pay",
  };
  return map[v] || dbValue;
}

function ClientServicesTab({
  allRegistrations,
  userId,
  navigate,
  isServiceCardExpanded,
  setIsServiceCardExpanded,
  handleUpdateWorkStatus,
  handleUpdatePaymentStatus,
  handleDeleteService,
  formatDate,
  apiClient,
}) {
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const handleViewNotes = async () => {
    setShowNotesPanel(true);
    setLoadingNotes(true);
    setNotes([]);
    try {
      const token = complianceApi.getToken();
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `https://oneasycompliance.oneasy.ai/admin/compliance/notes?userId=${userId}&page=1&limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch notes");

      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Services</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewNotes}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all duration-200"
            title="View Notes"
          >
            <FiMessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Notes</span>
          </button>
          <button
            onClick={() => navigate(`/admin/new-registration?userId=${userId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-all duration-200 shadow-md"
            title="New Registration"
          >
            <AiOutlinePlus className="w-5 h-5" />
            <span className="text-sm font-medium">New Registration</span>
          </button>
        </div>
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
                  isServiceCardExpanded === index ? null : index,
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

                {/* Payment Status + Work status dropdowns + Delete */}
                <div
                  className="relative flex items-center gap-2 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  {registration.ticket_id && (
                    <>
                      <select
                        value={paymentStatusToDisplay(
                          registration.payment_status,
                        )}
                        onChange={(e) => {
                          const value = e.target.value;
                          const normalized = value.toLowerCase().trim();
                          const hasOnlinePaymentId =
                            !!registration.razorpay_payment_id ||
                            !!registration.payment_id;
                          const shouldOpenDialog =
                            normalized === "paid" && !hasOnlinePaymentId;
                          handleUpdatePaymentStatus(
                            registration.ticket_id,
                            value,
                            shouldOpenDialog,
                          );
                        }}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-[#00486D] focus:outline-none cursor-pointer min-w-[120px]"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <select
                        value={registration.service_status || ""}
                        onChange={(e) =>
                          handleUpdateWorkStatus(
                            registration.ticket_id,
                            e.target.value,
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-1 focus:ring-[#00486D] focus:outline-none cursor-pointer min-w-[140px] max-w-[200px]"
                      >
                        {[
                          ...(registration.service_status &&
                            !WORK_STATUS_OPTIONS.includes(
                              registration.service_status,
                            )
                            ? [registration.service_status]
                            : []),
                          ...WORK_STATUS_OPTIONS,
                        ].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

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
                className={`w-5 h-5 text-gray-600 transition-transform ml-4 ${isServiceCardExpanded === index ? "rotate-180" : ""
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
                          ₹{registration.package_price?.toLocaleString("en-IN")}
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
                            `/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`,
                          );
                        } else if (ticketId?.startsWith("SI_")) {
                          navigate(
                            `/admin/startup-india-form?ticketId=${ticketId}&admin=true&clientId=${userId}`,
                          );
                        } else if (ticketId?.startsWith("PROP_")) {
                          navigate(
                            `/admin/proprietorship-form?ticketId=${ticketId}&admin=true&clientId=${userId}`,
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
                                `/gst/user-registrations/${userId}`,
                              );
                              if (gstResponse.success && gstResponse.data) {
                                const gstRegs = Array.isArray(gstResponse.data)
                                  ? gstResponse.data
                                  : gstResponse.data?.data || [];
                                // Find GST registration with matching package price
                                const matchingGST = gstRegs.find(
                                  (reg) =>
                                    reg.package_price === packagePrice ||
                                    (reg.package_name &&
                                      reg.package_name
                                        .toLowerCase()
                                        .includes("gst")),
                                );
                                if (
                                  matchingGST &&
                                  matchingGST.ticket_id?.startsWith("GST_")
                                ) {
                                  // Use the correct GST ticketId
                                  navigate(
                                    `/admin/gst-form?ticketId=${matchingGST.ticket_id}&admin=true&clientId=${userId}`,
                                  );
                                  return;
                                }
                              }
                            } catch (err) {
                              console.error(
                                "Error fetching GST registrations:",
                                err,
                              );
                            }
                            // If no matching GST found, still try to navigate to GST form with the current ticketId
                            // The form will handle it or show an error
                            navigate(
                              `/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`,
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
                              `/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`,
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

      {/* Notes Panel Modal */}
      {showNotesPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 border border-gray-100 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  All notes for this client
                </p>
              </div>
              <button
                onClick={() => {
                  setShowNotesPanel(false);
                  setNotes([]);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingNotes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D]"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FiMessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm font-medium">No notes found</p>
                  <p className="text-xs mt-1">
                    No notes have been added for this service yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </span>
                        {note.createdByUserId && (
                          <span className="text-xs text-gray-400">
                            by {note.createdByUserId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientServicesTab;
