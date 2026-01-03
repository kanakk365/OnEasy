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
  const [allNotices, setAllNotices] = React.useState([]);
  const [loadingNotice, setLoadingNotice] = React.useState(true);
  const [activeNoticeTab, setActiveNoticeTab] = React.useState("All Notices"); // 'All Notices' or 'My Notices'
  const [activeServiceTab, setActiveServiceTab] = React.useState("Open");
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
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
        );
        const userId = storedUser.id;
        const rawName = storedUser.name || storedUser.fullName || "there";
        const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        const motivationalLines = [
          `Hi ${userName}, welcome back! Hope you have a good day!`,
          `Great to see you, ${userName}! Let's make today productive!`,
          `${userName}, you're doing amazing. Keep going!`,
          `Welcome, ${userName}! Small steps lead to big wins!`,
          `Hey ${userName}, you've got this! Let's get it done!`,
        ];
        const pick =
          motivationalLines[
            Math.floor(Math.random() * motivationalLines.length)
          ];
        setGreeting(pick);

        if (!userId) {
          setAllServices([]);
          return;
        }

        const [pl, prop, si, gst] = await Promise.all([
          apiClient
            .get(`/private-limited/user-registrations/${userId}`)
            .catch(() => ({ success: false, data: [] })),
          apiClient
            .get(`/proprietorship/user-registrations/${userId}`)
            .catch(() => ({ success: false, data: [] })),
          apiClient
            .get(`/startup-india/user-registrations/${userId}`)
            .catch(() => ({ success: false, data: [] })),
          apiClient
            .get(`/gst/user-registrations/${userId}`)
            .catch(() => ({ success: false, data: [] })),
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
            new Date(b.created_at || b.createdAt || b.updated_at || 0) -
            new Date(a.created_at || a.createdAt || a.updated_at || 0)
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
        // Get current user ID to fetch user-specific notices
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
        );
        const userId = storedUser.id;

        // Pass userId as query parameter to get global notices + user-specific notices
        const url = userId
          ? `/admin/notices?userId=${userId}`
          : "/admin/notices";
        const res = await apiClient.get(url);
        if (res.success && Array.isArray(res.data)) {
          // Sort by created_at descending (newest first)
          const sortedNotices = res.data.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });
          setAllNotices(sortedNotices);
        } else {
          setAllNotices([]);
        }
      } catch (e) {
        console.error("Failed to fetch notice:", e);
        setAllNotices([]);
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
        console.error("Error loading organizations:", error);
        setOrganizations([]);
      } finally {
        setLoadingOrganizations(false);
      }
    };
    loadOrganizations();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // Filter notices based on active tab
  const filteredNotices = React.useMemo(() => {
    const storedUser = JSON.parse(
      localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
    );
    const userId = storedUser.id;

    if (activeNoticeTab === "All Notices") {
      // Show only global notices (user_id is null)
      return allNotices.filter((notice) => !notice.user_id);
    } else {
      // Show only user-specific notices (user_id matches current user)
      return allNotices.filter(
        (notice) => notice.user_id && String(notice.user_id) === String(userId)
      );
    }
  }, [allNotices, activeNoticeTab]);

  // Get the latest notice from filtered notices
  const notice = React.useMemo(() => {
    return filteredNotices.length > 0 ? filteredNotices[0] : null;
  }, [filteredNotices]);

  const getServiceTab = React.useCallback((reg) => {
    const status = getStatusLabel(reg);
    if (!status) return "Open";

    const statusLower = status.toLowerCase();

    // Completed statuses go to Resolved
    if (statusLower === "completed" || statusLower === "payment completed") {
      return "Resolved";
    }

    // In Progress statuses
    if (
      statusLower === "wip" ||
      statusLower === "data received" ||
      statusLower === "awaiting confirmation from the govt" ||
      statusLower === "awaiting confirmation from the government" ||
      statusLower === "data pending from client" ||
      statusLower === "in progress" ||
      statusLower === "submitted" ||
      statusLower === "registered"
    ) {
      return "In progress";
    }

    // Technical issues and payment pending are still in progress
    if (
      statusLower === "technical issue" ||
      statusLower === "payment pending"
    ) {
      return "In progress";
    }

    // Default to Open
    return "Open";
  }, []);

  const filteredServices = React.useMemo(() => {
    if (!allServices || allServices.length === 0) return [];
    return allServices.filter(
      (service) => getServiceTab(service) === activeServiceTab
    );
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
    if (
      statusLower === "wip" ||
      statusLower === "data received" ||
      statusLower === "awaiting confirmation from the govt"
    ) {
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
    if (
      statusLower === "payment_completed" ||
      statusLower === "paid" ||
      statusLower === "payment completed"
    ) {
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
    if (tid.startsWith("PART_") || tid.startsWith("PARTNERSHIP_"))
      return "Partnership";
    if (tid.startsWith("SEC8_") || tid.startsWith("SECTION8_"))
      return "Section 8";
    if (tid.startsWith("PVT_")) return "Private Limited";
    if (tid.startsWith("PROP_")) return "Proprietorship";
    if (tid.startsWith("SI_")) return "Startup India";
    if (tid.startsWith("GST_")) return "GST";
    return reg.registration_type || reg.service_type || "Service";
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          The Intelligent Business Owner Dashboard
        </h1>
        <p className="text-gray-500">
          A Unified Hub for Management and Insights
        </p>
      </div>

      {/* Overall Compliances Section - Wrapped in White Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Overall Compliances - 5
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#ebf0f3] rounded-xl p-5 border border-blue-50">
            <div className="text-3xl font-semibold text-[#023752] mb-2">3</div>
            <div className="text-sm font-medium text-gray-700">
              Upcoming Compliances
            </div>
          </div>
          <div className="bg-[#ebf0f3] rounded-xl p-5 border border-blue-50">
            <div className="text-3xl font-semibold text-[#023752] mb-2">0</div>
            <div className="text-sm font-medium text-gray-700">
              Ongoing Services
            </div>
          </div>
          <div className="bg-[#ebf0f3] rounded-xl p-5 border border-blue-50">
            <div className="text-3xl font-semibold text-[#023752] mb-2">2</div>
            <div className="text-sm font-medium text-gray-700">
              Pending Requests
            </div>
          </div>
          <div className="bg-[#ebf0f3] rounded-xl p-5 border border-blue-50">
            <div className="text-3xl font-semibold text-[#023752] mb-2">0</div>
            <div className="text-sm font-medium text-gray-700">
              Upcoming Compliances
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Service Requests */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Service Requests
              </h2>
              <button
                onClick={() => navigate("/client-services")}
                className="text-sm font-medium text-[#00486D] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {/* Tabs */}
            <div className="flex w-full border-b border-gray-100 mb-0">
              {["Open", "In progress", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveServiceTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                    activeServiceTab === tab
                      ? "bg-[#01334C] text-white rounded-tl-2xl rounded-br-2xl"
                      : "text-gray-400 hover:text-gray-600 bg-gray-50/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Service List Items */}
            <div className="bg-[#F8FAFC] rounded-b-xl p-4 min-h-[300px]">
              <div className="space-y-0">
                {loadingService ? (
                  <div className="text-center py-8 text-gray-400">
                    Loading services...
                  </div>
                ) : filteredServices.length > 0 ? (
                  filteredServices.slice(0, 5).map((service, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-4 py-4 px-2 border-b border-gray-100 items-center last:border-0 hover:bg-white transition-colors cursor-pointer"
                    >
                      <div className="col-span-2 text-sm font-medium text-gray-900">
                        #
                        {String(service.ticket_id || service.id)
                          .slice(-5)
                          .toUpperCase()}
                        CIN
                      </div>
                      <div className="col-span-4 text-sm font-medium text-gray-900 truncate">
                        {formatServiceName(service)}
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <span
                          className={`px-6 py-1.5 rounded-full text-sm font-medium ${
                            service.status === "Open" ||
                            getStatusLabel(service) === "Open"
                              ? "bg-[#D1FAE5] text-[#065F46]"
                              : getStatusBadgeColor(getStatusLabel(service))
                          }`}
                        >
                          {getStatusLabel(service)}
                        </span>
                      </div>
                      <div className="col-span-3 text-sm font-medium text-gray-900 text-right">
                        {formatDate(service.updated_at || service.created_at)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    No services found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notice Board & Upcoming Compliances */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          {/* Notice Board */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Notice Board
              </h2>
              <button
                onClick={() => navigate("/notice-board")}
                className="text-sm font-medium text-[#00486D] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {loadingNotice ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : notice ? (
              <div className="bg-[#FFF9F0] rounded-xl p-6 border border-[#FFF0D4]">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#FFAB00] rounded-full p-2.5 flex-shrink-0 shadow-sm text-white">
                    <TriangleAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-sm font-medium mb-1">
                      {notice.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-1">
                      {notice.description}
                    </p>
                    {notice.link && (
                      <a
                        href={notice.link}
                        className="text-[#023752] font-medium text-sm hover:underline"
                      >
                        File Now.
                      </a>
                    )}
                    {/* Pagination dots simulation */}
                    <div className="mt-4 flex space-x-1.5 opacity-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No notices.
              </div>
            )}
          </div>

          {/* Upcoming Compliances */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Compliances
              </h2>
            </div>

            <div className="bg-[#FFF5F3] rounded-xl p-6">
              <ul className="space-y-4 mb-6">
                {[
                  "GST Filing – Due in 7 days",
                  "Income Tax Return – Due in 14 days",
                  "ROC Annual Filing – Due in 21 days",
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF3D00]"></div>
                    <span className="text-sm text-gray-800 font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className="text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(180deg, #FF3D00 0%, #AD2C04 100%)",
                }}
              >
                Get Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List Of Companies */}
      <div className="mt-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              List Of Companies
            </h2>
            <button
              onClick={() => navigate("/organization")}
              className="text-sm font-medium text-[#00486D] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#f2f6f7] rounded-xl text-sm font-medium text-[#023752]">
                <div className="col-span-2">Logo</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-5">GST number</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {loadingOrganizations ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  Loading organizations...
                </div>
              ) : organizations.length > 0 ? (
                organizations.map((org, index) => (
                  <div
                    key={org.id || index}
                    className="grid grid-cols-12 gap-4 px-6 py-4 bg-white border-b border-gray-50 items-center hover:bg-gray-50 transition-colors last:border-0 cursor-pointer"
                  >
                    <div className="col-span-2">
                      <div className="w-12 h-12 rounded-full border border-gray-100 p-2 bg-white shadow-sm flex items-center justify-center">
                        <img
                          src={logo}
                          alt={org.legal_name || "Company"}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-medium text-gray-900 block">
                        {org.legal_name || "OneEasy Technologies Pvt. Ltd."}
                      </span>
                    </div>
                    <div className="col-span-5">
                      <span className="text-sm text-gray-500 font-medium">
                        {org.gstin || "27ABCDE1234F1Z5"}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => navigate("/organization")}
                        className="text-white text-xs px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                        style={{
                          background:
                            "linear-gradient(90deg, #00486D 0%, #023752 100%)",
                        }}
                      >
                        View all
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  No organizations found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Client;
