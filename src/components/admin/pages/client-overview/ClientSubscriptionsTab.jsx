import React from "react";

function ClientSubscriptionsTab({ allRegistrations }) {
  return (
        <div className="bg-white rounded-xl p-8 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012] space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subscriptions
          </h2>
          {(() => {
            // Paid services only
            const paidServices = allRegistrations.filter((r) => {
              const status = (r.payment_status || "").toLowerCase();
              const serviceStatus = (r.service_status || "").toLowerCase();
              const hasPaymentId =
                (r.razorpay_payment_id &&
                  String(r.razorpay_payment_id).trim() !== "") ||
                (r.payment_id && String(r.payment_id).trim() !== "");
              return (
                status === "paid" ||
                serviceStatus === "payment completed" ||
                hasPaymentId
              );
            });

            const getServiceName = (registration) => {
              const tid = registration.ticket_id || "";
              if (tid.startsWith("GST_")) return "GST Registration";
              if (tid.startsWith("SI_")) return "Startup India";
              if (tid.startsWith("PROP_")) return "Proprietorship";
              if (tid.startsWith("PVT_")) return "Private Limited";
              if (tid.startsWith("OPC_")) return "OPC Registration";
              if (tid.startsWith("LLP_")) return "LLP Registration";

              const packageName = (
                registration.package_name || ""
              ).toLowerCase();
              const businessName = (
                registration.business_name || ""
              ).toLowerCase();

              if (packageName.includes("opc") || businessName.includes("opc"))
                return "OPC Registration";
              if (packageName.includes("llp") || businessName.includes("llp"))
                return "LLP Registration";
              if (packageName.includes("gst") || businessName.includes("gst"))
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
            };

            if (paidServices.length === 0) {
              return (
                <p className="text-gray-600">
                  No paid services found for this client.
                </p>
              );
            }

            return (
              <div className="space-y-3">
                {paidServices.map((registration) => (
                  <div
                    key={registration.ticket_id || registration.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-gray-500">
                        {registration.business_name ||
                          `Ticket: ${registration.ticket_id}`}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getServiceName(registration)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {registration.updated_at || registration.created_at
                          ? new Date(
                              registration.updated_at ||
                                registration.created_at ||
                                registration.createdAt ||
                                ""
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              timeZone: "Asia/Kolkata",
                            })
                          : "Date not available"}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {registration.service_status || "Payment completed"}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
  );
}

export default ClientSubscriptionsTab;