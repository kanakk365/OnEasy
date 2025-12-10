import React from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { getUsersPageData } from "../../utils/usersPageApi";
import { TriangleAlert } from "lucide-react";
import logo from "../../assets/logo.png";

function Client() {
  const navigate = useNavigate();
  const [allServices, setAllServices] = React.useState([]);
  const [loadingService, setLoadingService] = React.useState(true);
  const [notice, setNotice] = React.useState(null);
  const [loadingNotice, setLoadingNotice] = React.useState(true);
  const [activeServiceTab, setActiveServiceTab] = React.useState('Open');
  const [organizations, setOrganizations] = React.useState([]);
  const [loadingOrganizations, setLoadingOrganizations] = React.useState(true);
  const [greeting, setGreeting] = React.useState("");

  React.useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  React.useEffect(() => {
    const loadLatestService = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}");
        const userId = storedUser.id;
        const rawName = storedUser.name || storedUser.fullName || storedUser.email || "there";
        const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        const motivationalLines = [
          `Hi ${userName}, welcome back! Hope you have a good day!`,
          `Great to see you, ${userName}! Let's make today productive!`,
          `${userName}, you're doing amazing. Keep going!`,
          `Welcome, ${userName}! Small steps lead to big wins!`,
          `Hey ${userName}, you've got this! Let's get it done!`
        ];
        const pick = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];
        setGreeting(pick);

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
            new Date(b.created_at || b.createdAt || b.updated_at || 0) - new Date(a.created_at || a.createdAt || a.updated_at || 0)
        );

        setAllServices(sorted);
      } catch (err) {
        console.error("Failed to load latest service:", err);
        setAllServices([]);
      } finally {
        setLoadingService(false);
      }
    };

    loadLatestService();
    const loadNotice = async () => {
      try {
        const res = await apiClient.get('/admin/notices');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setNotice(res.data[0]);
        } else {
          setNotice(null);
        }
      } catch (e) {
        console.error('Failed to fetch notice:', e);
        setNotice(null);
      } finally {
        setLoadingNotice(false);
      }
    };
    loadNotice();
    
    const loadOrganizations = async () => {
      try {
        setLoadingOrganizations(true);
        const response = await getUsersPageData();
        
        if (response.success && response.data) {
          const { organisations } = response.data;
          
          if (organisations && organisations.length > 0) {
            setOrganizations(organisations);
          } else {
            setOrganizations([]);
          }
        } else {
          setOrganizations([]);
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
        setOrganizations([]);
      } finally {
        setLoadingOrganizations(false);
      }
    };
    loadOrganizations();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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

  // Get the latest service for the active tab
  const latestServiceForTab = React.useMemo(() => {
    if (filteredServices.length === 0) return null;
    return filteredServices[0]; // Already sorted by updated_at/created_at
  }, [filteredServices]);

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
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
          {greeting || "Welcome back!"}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          The Intelligent Business Owner Dashboard
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        <div className="col-span-12 lg:col-span-6 space-y-4 md:space-y-6 lg:space-y-8">
          <div className="bg-white rounded-xl p-5 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Notice Board
              </h2>
              <a
                href="#"
                className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 text-sm font-medium hover:underline"
              >
                View all
              </a>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                  <TriangleAlert className="text-white w-5 h-5" />
                </div>
              </div>
              <div>
                {loadingNotice ? (
                  <p className="text-gray-600 text-sm">Loading notice...</p>
                ) : notice ? (
                  <div className="space-y-1">
                    <p className="text-gray-800 text-sm leading-relaxed font-semibold">
                      {notice.title}
                    </p>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {notice.description}
                      {notice.link && (
                        <>
                          {" "}
                          <a
                            href={notice.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 hover:underline ml-1 font-medium"
                          >
                            Learn more
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No notices available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Compliances
              </h2>
            </div>
            <div className="bg-red-50 rounded-lg p-5 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                <p className="text-gray-700 text-sm">
                  GST Filing – Due in 7 days
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                <p className="text-gray-700 text-sm">
                  Income Tax Return – Due in 14 days
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                <p className="text-gray-700 text-sm">
                  ROC Annual Filing – Due in 21 days
                </p>
              </div>
              <button className="mt-2 text-white text-sm px-4 py-2 rounded-lg transition-all duration-200" style={{ background: 'linear-gradient(180deg, #FF3D00 0%, #AD2C04 100%)' }}>
                Get Help
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-4 md:space-y-6 lg:space-y-8">
          {/* <div className="bg-white rounded-lg p-5 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Ongoing Services & Status
              </h2>
              <a
                href="#"
                className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 text-sm font-medium hover:underline"
              >
                View all
              </a>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <p className="text-gray-700 text-sm">
                    Document Collection (In Progress)
                  </p>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <p className="text-gray-700 text-sm">
                    Trademark Filing (Awaiting Approval)
                  </p>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <p className="text-gray-700 text-sm">
                    MSME Registration (Completed)
                  </p>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-lg p-5 mt-6 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Service Requests</h2>
              <a
                href="/client-services"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/client-services');
                }}
                className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 text-sm font-medium hover:underline"
              >
                View all
              </a>
            </div>
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
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              {loadingService ? (
                <div className="text-sm text-gray-500">Loading latest service...</div>
              ) : latestServiceForTab ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
                  <span className="text-gray-900 font-medium">
                    {deriveType(latestServiceForTab)}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {formatServiceName(latestServiceForTab)}
                  </span>
                  <span className={`${getStatusBadgeColor(getStatusLabel(latestServiceForTab))} px-2 py-1 rounded-full text-xs font-medium`}>
                    {getStatusLabel(latestServiceForTab)}
                  </span>
                  <span className="text-gray-600">
                    {formatDate(latestServiceForTab.updated_at || latestServiceForTab.created_at || latestServiceForTab.createdAt)}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No services found in this category.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 ">
          <div className="bg-white rounded-lg p-5 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">List Of Companies</h2>
              <a
                href="/organization"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/organization');
                }}
                className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 text-sm font-medium hover:underline"
              >
                View all
              </a>
            </div>
            <div className="overflow-x-auto">
              <div className="rounded-lg overflow-hidden min-w-[600px]">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium bg-[#F8FAFC] text-[#64748B]">
                  <div className="col-span-2">Logo</div>
                  <div className="col-span-3">Legal Name</div>
                  <div className="col-span-3">IS Name</div>
                  <div className="col-span-2">GST number</div>
                  <div className="col-span-2">Action</div>
                </div>

                {loadingOrganizations ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading organizations...
                  </div>
                ) : organizations.length > 0 ? (
                  organizations.map((org, index) => (
                    <div
                      key={org.id || index}
                      className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border-t border-[#F1F5F9]"
                    >
                      <div className="col-span-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 border border-gray-100">
                          <img
                            src={logo}
                            alt={org.legal_name || "Company"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-sm text-gray-900">
                          {org.legal_name || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-sm text-gray-900">
                          {org.trade_name || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-gray-500">
                          {org.gstin || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <button 
                          onClick={() => navigate('/organization')}
                          className="text-white text-xs px-3 md:px-4 py-1.5 rounded-lg transition-all duration-200 bg-gradient-to-r from-[#01334C] to-[#00486D] hover:from-[#00486D] hover:to-[#002D44]"
                        >
                          View all
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No organizations found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Client;
