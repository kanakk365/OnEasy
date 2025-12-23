import React from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { initPaymentWithOrderId } from "../../utils/payment";

function ClientServices() {
  const [allServices, setAllServices] = React.useState([]);
  const [loadingService, setLoadingService] = React.useState(true);
  const [activeServiceTab, setActiveServiceTab] = React.useState('Open');
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadAllServices = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}");
        const userId = storedUser.id;
        if (!userId) {
          setAllServices([]);
          return;
        }

        const [pl, prop, si, gst] = await Promise.all([
          apiClient.get(`/private-limited/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
          apiClient.get(`/proprietorship/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
          apiClient.get(`/startup-india/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
          apiClient.get(`/gst/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        ]);

        const normalize = (resp) =>
          resp.success
            ? Array.isArray(resp.data)
              ? resp.data
              : resp.data?.data || []
            : [];

        const combined = [
          ...normalize(pl),
          ...normalize(prop),
          ...normalize(si),
          ...normalize(gst),
        ];

        if (combined.length === 0) {
          setAllServices([]);
          return;
        }

        // Deduplicate services by ticket_id to avoid showing the same service multiple times
        const uniqueServices = [];
        const seenTicketIds = new Set();
        
        combined.forEach(service => {
          const ticketId = service.ticket_id || service.id;
          if (ticketId && !seenTicketIds.has(ticketId)) {
            seenTicketIds.add(ticketId);
            uniqueServices.push(service);
          } else if (!ticketId) {
            // Services without ticket_id - include them (shouldn't happen, but handle gracefully)
            uniqueServices.push(service);
          }
        });

        const sorted = uniqueServices.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at || b.createdAt || 0) - new Date(a.updated_at || a.created_at || a.createdAt || 0)
        );

        setAllServices(sorted);
      } catch (err) {
        console.error("Failed to load services:", err);
        setAllServices([]);
      } finally {
        setLoadingService(false);
      }
    };

    loadAllServices();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusLabel = (reg) => {
    // Prioritize admin-set service_status
    if (reg.service_status && typeof reg.service_status === "string") {
      return reg.service_status;
    }
    if (reg.status && typeof reg.status === "string") return reg.status;
    if (reg.payment_status) return reg.payment_status;
    return "Open";
  };

  const getServiceTab = React.useCallback((reg) => {
    // Step 1: Check payment status first - if payment is pending/unpaid, return "Open"
    const paymentStatus = (reg.payment_status || '').toLowerCase().trim();
    if (paymentStatus === 'pending' || paymentStatus === 'unpaid') {
      return 'Open';
    }
    
    // Step 2: Check if service_status is "completed" (case-insensitive) - return "Resolved"
    if (reg.service_status && reg.service_status.trim() !== '') {
      const serviceStatus = reg.service_status.toLowerCase().trim();
      if (serviceStatus === 'completed') {
        return 'Resolved';
      }
    }
    
    // Step 3: If payment is completed and service_status exists (and is not completed), return "In progress"
    const isPaymentCompleted = reg.payment_completed || 
                               paymentStatus === 'paid' || 
                               paymentStatus === 'payment_completed' ||
                               reg.razorpay_payment_id ||
                               reg.payment_id;
    
    if (isPaymentCompleted) {
      // Payment completed - if service_status exists (and is not completed), it's In progress
      if (reg.service_status && reg.service_status.trim() !== '') {
        // Already checked for 'completed' above, so any other status means In progress
        return 'In progress';
      }
      // Payment completed but no service_status set yet - should be in "Open" (payment pending admin action)
      return 'Open';
    }
    
    // Default for services without payment (shouldn't happen in normal flow, but fallback)
    return 'Open';
  }, []);

  const filteredServices = React.useMemo(() => {
    if (!allServices || allServices.length === 0) return [];
    return allServices.filter(service => getServiceTab(service) === activeServiceTab);
  }, [allServices, activeServiceTab, getServiceTab]);

  const getStatusBadgeColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    const statusLower = status.toLowerCase();
    
    // Admin service status colors
    if (statusLower === "completed") {
      return "bg-green-100 text-green-800";
    }
    if (statusLower === "wip" || statusLower === "data received" || statusLower === "awaiting confirmation from the govt") {
      return "bg-blue-100 text-blue-800";
    }
    if (statusLower === "data pending from client") {
      return "bg-yellow-100 text-yellow-800";
    }
    if (statusLower === "technical issue") {
      return "bg-red-100 text-red-800";
    }
    if (statusLower === "payment pending") {
      return "bg-orange-100 text-orange-800";
    }
    
    // Default status colors
    if (statusLower === "payment_completed" || statusLower === "paid" || statusLower === "payment completed") {
      return "bg-green-100 text-green-800";
    }
    if (statusLower === "submitted" || statusLower === "registered") {
      return "bg-blue-100 text-blue-800";
    }
    if (statusLower === "draft") {
      return "bg-gray-100 text-gray-800";
    }
    
    return "bg-gray-100 text-gray-800";
  };

  const formatServiceName = (reg) => {
    // Prioritize package_name first since that's what should show in "Service Name" column
    // (package names like "Starter", "Pro", etc.)
    const raw = reg.package_name || reg.business_name || reg.service_name || "Service";
    const cleaned = raw.replace(/[-–]\s*Payment\s*Completed/i, "").trim();

    // If the package name is incorrectly set to "Private Limited Registration" but the service type
    // is different (determined by ticket ID), replace it with the correct service name
    const type = deriveType(reg);
    if (cleaned === "Private Limited Registration" && type !== "Private Limited") {
      // Check if the type is one of the descriptive services that don't need "Registration" suffix
      const typeLower = type.toLowerCase();
      const hasDescriptiveSuffix = 
        typeLower.includes('return') || 
        typeLower.includes('amendment') || 
        typeLower.includes('compliance') ||
        typeLower.includes('notice') ||
        typeLower.includes('addition') ||
        typeLower.includes('removal') ||
        typeLower.includes('change') ||
        typeLower.includes('creation') ||
        typeLower.includes('transfer') ||
        typeLower.includes('deactivation') ||
        typeLower.includes('reactivation') ||
        typeLower.includes('application') ||
        typeLower.includes('winding up') ||
        typeLower.includes('plan') ||
        typeLower.includes('payroll') ||
        typeLower.includes('itr') ||
        typeLower.includes('tax') ||
        typeLower.includes('license') ||
        typeLower.includes('trademark');
      
      if (hasDescriptiveSuffix) {
        return type; // Use type as-is for descriptive names
      } else {
        return `${type} Registration`; // Append "Registration" for basic service types
      }
    }

    return cleaned;
  };

  const deriveType = (reg) => {
    const tid = (reg.ticket_id || reg.id || "").toString().toUpperCase();
    if (tid.startsWith("OPC_")) return "OPC";
    if (tid.startsWith("LLP_")) return "LLP";
    if (tid.startsWith("PART_") || tid.startsWith("PARTNERSHIP_")) return "Partnership";
    if (tid.startsWith("SEC8_") || tid.startsWith("SECTION8_")) return "Section 8";
    if (tid.startsWith("PVT_")) return "Private Limited";
    if (tid.startsWith("PROP_")) return "Proprietorship";
    if (tid.startsWith("SI_")) return "Startup India";
    if (tid.startsWith("GST_")) return "GST";
    return reg.registration_type || reg.service_type || "Service";
  };

  const getTypeSlug = (type) => {
    const t = type.toLowerCase();
    if (t.includes("private")) return "private-limited";
    if (t.includes("proprietorship")) return "proprietorship";
    if (t.includes("startup")) return "startup-india";
    if (t === "gst" || t.includes("gst registration")) return "gst";
    return null;
  };

  const getTicketId = (reg) => reg.ticket_id || reg.id || "";

  const handleServiceClick = (service) => {
    const type = deriveType(service);
    const slug = getTypeSlug(type);
    const ticketId = getTicketId(service);
    
    // Services with forms - use view route with ticket ID
    const hasFormRoute = ["private-limited", "proprietorship", "startup-india", "gst"].includes(slug) && ticketId;
    
    if (hasFormRoute) {
      navigate(`/${slug}/view/${ticketId}`);
    } else {
      console.warn('No route defined for service type:', type, 'ticketId:', ticketId);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Service Requests</h1>
            <p className="text-gray-600 mt-1">View and manage all your service requests</p>
          </div>
          <button
            onClick={() => navigate('/client')}
            className="px-4 py-2 text-sm font-medium text-[#00486D] border border-[#00486D] rounded-lg hover:bg-[#00486D] hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#F3F3F3]">
          <div className="p-5">
            <div className="flex border-b border-gray-100 mb-4 overflow-x-auto">
              <button 
                onClick={() => setActiveServiceTab('Open')}
                className={`pb-2 mr-4 md:mr-6 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeServiceTab === 'Open' 
                    ? 'text-[#01334C] border-b-2 border-[#01334C]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Open
              </button>
              <button 
                onClick={() => setActiveServiceTab('In progress')}
                className={`pb-2 mr-4 md:mr-6 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeServiceTab === 'In progress' 
                    ? 'text-[#01334C] border-b-2 border-[#01334C]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                In progress
              </button>
              <button 
                onClick={() => setActiveServiceTab('Resolved')}
                className={`pb-2 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeServiceTab === 'Resolved' 
                    ? 'text-[#01334C] border-b-2 border-[#01334C]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Resolved
              </button>
            </div>

            <div className="overflow-x-auto">
              {loadingService ? (
                <div className="text-sm text-gray-500 p-4 text-center">Loading services...</div>
              ) : filteredServices.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Service Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.map((service, index) => (
                      <tr 
                        key={service.ticket_id || service.id || index} 
                        onClick={() => handleServiceClick(service)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {deriveType(service)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatServiceName(service)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            getServiceTab(service) === 'Resolved' 
                              ? 'bg-green-100 text-green-800'
                              : getServiceTab(service) === 'In progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getServiceTab(service)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`${getStatusBadgeColor(getStatusLabel(service))} px-2 py-1 rounded-full text-xs font-medium`}>
                            {getStatusLabel(service)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(service.updated_at || service.created_at || service.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {/* Pay button for pending payments, same logic as Registrations */}
                            {service.service_status === 'Payment pending' &&
                              (service.razorpay_order_id || service.order_id) && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const orderId = service.razorpay_order_id || service.order_id;
                                      const amount = service.package_price || service.amount || 0;
                                      const type = deriveType(service);
                                      const slug = getTypeSlug(type);
                                      const ticketId = getTicketId(service);

                                      await initPaymentWithOrderId(orderId, amount, {
                                        ticket_id: ticketId,
                                        registration_type: slug,
                                        package_name: service.package_name || formatServiceName(service)
                                      });
                                    } catch (error) {
                                      console.error('Payment error:', error);
                                      alert(error.message || 'Failed to initiate payment. Please try again.');
                                    }
                                  }}
                                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                >
                                  Pay
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-sm text-gray-500 p-4 text-center">No services found in this category.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientServices;

