import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRegistrations } from "../../utils/privateLimitedApi";

function OPCRegistrations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const res = await getMyRegistrations();
        if (res.success && Array.isArray(res.data)) {
          // Filter OPC entries saved in registration_details table
          const filtered = res.data.filter((reg) => {
            const name = (reg?.business_name || reg?.package_name || "").toLowerCase();
            return name.includes("opc");
          });
          setRegistrations(filtered);
        } else {
          setError(res.message || "Failed to load registrations");
        }
      } catch (err) {
        setError(err.message || "Failed to load registrations");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My OPC Registrations</h1>
            <p className="text-gray-600 mt-1">Payments and drafts created for OPC</p>
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
            No OPC registrations found.
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
                    {reg.package_name || "OPC Registration"}{" "}
                    {reg.package_price ? (
                      <span className="text-green-600 font-semibold">₹{Number(reg.package_price).toLocaleString("en-IN")}</span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Payment Status</div>
                  <div className="text-gray-900 capitalize">{reg.payment_status || "paid"}</div>
                  {reg.created_at && (
                    <div className="mt-2 text-sm text-gray-500">
                      Payment Date: {new Date(reg.created_at).toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  {reg.razorpay_payment_id && (
                    <div>Payment ID: {reg.razorpay_payment_id}</div>
                  )}
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

export default OPCRegistrations;

