import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyRegistrations } from "../../utils/privateLimitedApi";

// Map route types to friendly labels
const typeLabels = {
  opc: "OPC",
  llp: "LLP",
  partnership: "Partnership",
  "section-8": "Section 8",
  "public-limited": "Public Limited",
  "mca-name-approval": "MCA Name Approval",
  "indian-subsidiary": "Indian Subsidiary",
};

// Check if a registration row matches the requested type
const matchesType = (reg, type) => {
  // Check ticket_id prefix first (most reliable)
  const ticketId = (reg?.ticket_id || "").toString().toUpperCase();
  
  // Check business_name and package_name
  const businessName = (reg?.business_name || "").toLowerCase();
  const packageName = (reg?.package_name || "").toLowerCase();
  const text = `${businessName} ${packageName}`.toLowerCase();
  
  switch (type) {
    case "opc":
      return ticketId.startsWith("OPC_") || 
             text.includes("opc") || 
             text.includes("one person company") ||
             businessName === "opc";
    case "llp":
      return ticketId.startsWith("LLP_") || 
             text.includes("llp") || 
             text.includes("limited liability partnership") ||
             businessName === "llp";
    case "partnership":
      return ticketId.startsWith("PART_") || 
             ticketId.startsWith("PARTNERSHIP_") ||
             text.includes("partnership") ||
             businessName === "partnership";
    case "section-8":
      return ticketId.startsWith("SEC8_") || 
             ticketId.startsWith("SECTION8_") ||
             text.includes("section 8") || 
             text.includes("section-8") ||
             businessName === "section 8";
    case "public-limited":
      return ticketId.startsWith("PLC_") || 
             ticketId.startsWith("PUBLIC_") ||
             text.includes("public limited") || 
             text.includes("plc") ||
             businessName === "public limited";
    case "mca-name-approval":
      return ticketId.startsWith("MCA_") ||
             text.includes("mca name") || 
             text.includes("mca-name") ||
             businessName === "mca name approval";
    case "indian-subsidiary":
      return ticketId.startsWith("INDIAN_") ||
             text.includes("indian subsidiary") || 
             text.includes("indian-subsidiary") ||
             businessName === "indian subsidiary";
    case "private-limited":
      return ticketId.startsWith("PVT_") || 
             ticketId.startsWith("PRIVATE_") ||
             text.includes("private limited") ||
             text.includes("private-limited") ||
             businessName === "private limited";
    default:
      return false;
  }
};

function ServiceRegistrations() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getMyRegistrations();
        console.log('📋 Fetched registrations:', res);
        if (res.success && Array.isArray(res.data)) {
          console.log(`📊 Total registrations fetched: ${res.data.length}`);
          if (res.data.length > 0) {
            console.log('📋 Sample registration:', res.data[0]);
          }
          
          // If type is valid and in typeLabels, filter by type. Otherwise show all.
          let filtered;
          if (type && typeLabels[type]) {
            filtered = res.data.filter((reg) => {
              const matches = matchesType(reg, type);
              console.log(`🔍 Checking registration ${reg.ticket_id}:`, {
                type,
                ticketId: reg.ticket_id,
                businessName: reg.business_name,
                packageName: reg.package_name,
                matches
              });
              return matches;
            });
            console.log(`✅ Filtered to ${filtered.length} registrations for type: ${type}`);
          } else {
            // If type is not recognized, show all registrations
            console.log(`⚠️ Unknown type "${type}", showing all ${res.data.length} registrations`);
            filtered = res.data;
          }
          
          setRegistrations(filtered);
        } else {
          setError(res.message || "Failed to load registrations");
        }
      } catch (err) {
        console.error('❌ Error fetching registrations:', err);
        setError(err.message || "Failed to load registrations");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [type]);

  const label = typeLabels[type] || "Service";
  const hasValidType = type && typeLabels[type];

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My {label} Registrations</h1>
            <p className="text-gray-600 mt-1">Payments and drafts created for {label}</p>
            {!hasValidType && type && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Unknown service type: {type}. Showing all registrations.
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-[#00486D] border border-[#00486D] rounded-lg hover:bg-[#00486D] hover:text-white transition-colors"
          >
            Back
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">Loading...</div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-red-600">{error}</div>
        )}

        {!loading && !error && registrations.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
            No {label} registrations found.
          </div>
        )}

        {!loading && !error && registrations.length > 0 && (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div key={reg.ticket_id || reg.id} className="bg-white rounded-xl shadow p-5 flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ticket ID</div>
                  <div className="font-semibold text-gray-900">{reg.ticket_id || "—"}</div>
                  <div className="mt-2 text-sm text-gray-500">Package</div>
                  <div className="text-gray-900">
                    {reg.package_name || `${label} Registration`}{" "}
                    {reg.package_price ? (
                      <span className="text-green-600 font-semibold">₹{Number(reg.package_price).toLocaleString("en-IN")}</span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Payment Status</div>
                  <div className="text-gray-900 capitalize">{reg.payment_status || "paid"}</div>
                  {reg.service_status && (
                    <>
                      <div className="mt-2 text-sm text-gray-500">Service Status</div>
                      <div className="text-gray-900 font-medium">{reg.service_status}</div>
                    </>
                  )}
                  {reg.created_at && (
                    <div className="mt-2 text-sm text-gray-500">
                      Payment Date: {new Date(reg.created_at).toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {reg.razorpay_payment_id && <div>Payment ID: {reg.razorpay_payment_id}</div>}
                  {reg.razorpay_order_id && <div>Order ID: {reg.razorpay_order_id}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceRegistrations;

