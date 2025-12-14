import React from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";

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

        const sorted = combined.sort(
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
    const status = getStatusLabel(reg);
    if (!status) return 'Open';
    
    const statusLower = status.toLowerCase();
    
    // Completed statuses go to Resolved
    if (statusLower === 'completed') {
      return 'Resolved';
    }
    
    // In Progress statuses
    if (statusLower === 'wip' || 
        statusLower === 'data received' || 
        statusLower === 'awaiting confirmation from the govt' ||
        statusLower === 'awaiting confirmation from the government' ||
        statusLower === 'data pending from client' ||
        statusLower === 'in progress' ||
        statusLower === 'submitted' ||
        statusLower === 'registered') {
      return 'In progress';
    }
    
    // Technical issues and payment pending are still in progress
    if (statusLower === 'technical issue' || statusLower === 'payment pending') {
      return 'In progress';
    }
    
    // Default to Open
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
    if (statusLower === "payment_completed" || statusLower === "paid") {
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
    const raw = reg.business_name || reg.package_name || "Service";
    return raw.replace(/[-–]\s*Payment\s*Completed/i, "").trim();
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.map((service, index) => (
                      <tr key={service.ticket_id || service.id || index} className="hover:bg-gray-50 transition-colors">
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

