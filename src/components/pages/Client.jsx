import React from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
import { getUsersPageData } from "../../utils/usersPageApi";
import { TriangleAlert } from "lucide-react";

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
  const [complianceStats, setComplianceStats] = React.useState({
    ongoing: 0,
    upcoming: 0,
    overdue: 0,
    other: 0,
  });
  const [currentNoticeIndex, setCurrentNoticeIndex] = React.useState(0);

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

        const taglines = [
          "Welcome back! Let's make today productive.",
          "You're doing amazing. Keep going!",
          "Small steps lead to big wins!",
          "You've got this! Let's get it done!",
          "Hope you have a great day ahead!",
        ];
        const tagline =
          taglines[Math.floor(Math.random() * taglines.length)];
        setGreeting(`Hi ${userName}, ${tagline}`);

        if (!userId) {
          setAllServices([]);
          return;
        }

        const [pl, prop, si, gst, allServices] = await Promise.all([
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
          apiClient
            .get(`/registrations`)
            .catch(() => ({ success: false, data: [] })),
        ]);

        const normalize = (resp) =>
          resp.success
            ? Array.isArray(resp.data)
              ? resp.data
              : resp.data?.data || []
            : [];

        // Filter generic services (exclude duplicates from specific service tables)
        const specificServiceTicketIds = new Set([
          ...normalize(pl).map(s => s.ticket_id).filter(Boolean),
          ...normalize(prop).map(s => s.ticket_id).filter(Boolean),
          ...normalize(si).map(s => s.ticket_id).filter(Boolean),
          ...normalize(gst).map(s => s.ticket_id).filter(Boolean),
        ]);
        
        // Include generic services that are not in specific service tables
        const genericServices = normalize(allServices).filter(service => {
          const ticketId = service.ticket_id || service.id;
          if (!ticketId) return false;
          // Exclude services that are already in specific tables (SI_, GST_, PROP_, PVT_, PLC_, OPC_)
          const upperTicketId = ticketId.toString().toUpperCase();
          if (upperTicketId.startsWith('SI_') || 
              upperTicketId.startsWith('GST_') || 
              upperTicketId.startsWith('PROP_') ||
              upperTicketId.startsWith('PVT_') ||
              upperTicketId.startsWith('PLC_') ||
              upperTicketId.startsWith('OPC_')) {
            return false;
          }
          // Include if not already in specific service tables
          return !specificServiceTicketIds.has(ticketId);
        });

        const combined = [
          ...normalize(pl),
          ...normalize(prop),
          ...normalize(si),
          ...normalize(gst),
          ...genericServices,
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

  // Auto-scroll carousel every 3 seconds with infinite loop
  React.useEffect(() => {
    if (filteredNotices.length <= 1) return; // No need to scroll if only one or no notices

    const interval = setInterval(() => {
      setCurrentNoticeIndex((prevIndex) => prevIndex + 1);
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [filteredNotices.length]);

  // Handle infinite loop: reset to start when reaching the duplicate at the end
  React.useEffect(() => {
    if (filteredNotices.length <= 1) return;
    
    // When we reach the duplicate (index === filteredNotices.length), reset to 0 without animation
    if (currentNoticeIndex === filteredNotices.length) {
      const timeout = setTimeout(() => {
        setCurrentNoticeIndex(0);
      }, 700); // Wait for animation to complete (700ms)
      
      return () => clearTimeout(timeout);
    }
  }, [currentNoticeIndex, filteredNotices.length]);

  // Reset carousel index when tab changes
  React.useEffect(() => {
    setCurrentNoticeIndex(0);
  }, [activeNoticeTab]);

  const getServiceTab = React.useCallback((reg) => {
    // Step 1: Check payment status first - if payment is pending/unpaid, return "Open"
    const paymentStatus = (reg.payment_status || '').toLowerCase().trim();
    if (paymentStatus === 'pending' || paymentStatus === 'unpaid') {
      return 'Open';
    }
    
    // Step 2: Check if service_status is "completed" (case-insensitive) - return "Completed"
    if (reg.service_status && reg.service_status.trim() !== '') {
      const serviceStatus = reg.service_status.toLowerCase().trim();
      if (serviceStatus === 'completed') {
        return 'Completed';
      }
    }
    
    // Step 3: If payment is completed, check service status
    const isPaymentCompleted = reg.payment_completed || 
                               paymentStatus === 'paid' || 
                               paymentStatus === 'payment_completed' ||
                               reg.razorpay_payment_id ||
                               reg.payment_id;
    
    if (isPaymentCompleted) {
      // Payment completed - if service_status exists (and is not completed), it's "In progress"
      // This includes: WIP, data received, data pending, submitted, etc.
      if (reg.service_status && reg.service_status.trim() !== '') {
        // Already checked for 'completed' above, so any other status means "In progress"
        return 'In progress';
      }
      // Payment completed but no service_status set yet - treat as "In progress"
      return 'In progress';
    }
    
    // Default: no payment or pending payment
    return 'Open';
  }, []);

  const filteredServices = React.useMemo(() => {
    if (!allServices || allServices.length === 0) return [];
    return allServices.filter(
      (service) => getServiceTab(service) === activeServiceTab
    );
  }, [allServices, activeServiceTab, getServiceTab]);

  // Calculate compliance statistics
  React.useEffect(() => {
    if (!allServices || allServices.length === 0) {
      setComplianceStats({ ongoing: 0, upcoming: 0, overdue: 0, other: 0 });
      return;
    }

    let ongoing = 0; // Open + In progress
    let upcoming = 0; // Services with upcoming due dates
    let overdue = 0; // Services past their due date
    let other = 0; // Resolved/Completed or other statuses

    allServices.forEach((service) => {
      const tab = getServiceTab(service);
      const status = getStatusLabel(service).toLowerCase();

      // On-Going: Open and In progress
      if (tab === "Open" || tab === "In progress") {
        ongoing++;
      }
      // Overdue: Check if service has a due date that has passed
      else if (service.due_date) {
        const dueDate = new Date(service.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDate < today && tab !== "Resolved") {
          overdue++;
        } else if (dueDate >= today) {
          upcoming++;
        } else {
          other++;
        }
      }
      // Resolved/Completed go to other
      else if (tab === "Completed" || status.includes("completed")) {
        other++;
      }
      // Everything else that's not ongoing
      else {
        other++;
      }
    });

    setComplianceStats({ ongoing, upcoming, overdue, other });
  }, [allServices, getServiceTab]);


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
    // Prioritize package_name first (like "Starter", "Pro", etc.), then business_name
    const raw = reg.package_name || reg.business_name || reg.service_name || "Service";
    const cleaned = raw.replace(/[-–]\s*Payment\s*Completed/i, "").trim();

    // If the package name is incorrectly set to "Private Limited Registration" but the service type
    // is different (determined by ticket ID), replace it with the correct service name
    const type = deriveType(reg);
    if (cleaned === "Private Limited Registration" && type !== "Private Limited") {
      return `${type}`;
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

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      <div className="mb-8">
        {greeting && (
          <>
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              {greeting.split(',')[0]}
            </h1>
            <p className="text-gray-500">
              {greeting.split(',').slice(1).join(',').trim()}
            </p>
          </>
        )}
      </div>

      {/* Overall Compliances Section - Wrapped in White Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* On-Going Service Requests */}
          <div className="bg-[#ebf0f3] rounded-xl p-5 border border-blue-50">
            <div className="text-3xl font-semibold text-[#023752] mb-2">
              {complianceStats.ongoing}
            </div>
            <div className="text-sm font-medium text-gray-700">
              On-Going Service Requests
            </div>
          </div>
          {/* Up-coming Compliances */}
          <div className="bg-[#ebf0f3] rounded-xl p-5 border border-blue-50">
            <div className="text-3xl font-semibold text-[#023752] mb-2">
              {complianceStats.upcoming}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Up-coming Compliances
            </div>
          </div>
          {/* Overdue Compliances */}
          <div className="bg-[#ebf0f3] rounded-xl p-5 border border-blue-50">
            <div className="text-3xl font-semibold text-[#023752] mb-2">
              {complianceStats.overdue}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Overdue Compliances
            </div>
          </div>
          {/* Other */}
          <div className="bg-[#ebf0f3] rounded-xl p-5 border border-blue-50">
            <div className="text-3xl font-semibold text-[#023752] mb-2">
              {complianceStats.other}
            </div>
            <div className="text-sm font-medium text-gray-700">Other</div>
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
              {["Open", "In progress", "Completed"].map((tab) => (
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
              {loadingService ? (
                <div className="text-center py-8 text-gray-400">
                  Loading services...
                </div>
              ) : filteredServices.length > 0 ? (
                <div>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 py-3 px-2 border-b-2 border-gray-200 mb-2">
                    <div className="col-span-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Service
                    </div>
                    <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                      Status
                    </div>
                    <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                      Date
                    </div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="space-y-0">
                    {filteredServices.slice(0, 5).map((service, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-4 py-4 px-2 border-b border-gray-100 items-center last:border-0 hover:bg-white transition-colors cursor-pointer"
                        onClick={() => {
                          const type = deriveType(service);
                          const slug = getTypeSlug(type);
                          const ticketId = service.ticket_id || service.id;
                          if (slug && ticketId) {
                            navigate(`/${slug}/view/${ticketId}`);
                          }
                        }}
                      >
                        <div className="col-span-6">
                          <div className="text-sm font-semibold text-gray-900">
                            {deriveType(service)}
                          </div>
                          <div className="text-xs font-medium text-gray-500 mt-0.5">
                            {formatServiceName(service)}
                          </div>
                        </div>
                        <div className="col-span-3 flex justify-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                              service.status === "Open" ||
                              getStatusLabel(service) === "Open"
                                ? "bg-[#D1FAE5] text-[#065F46]"
                                : getStatusBadgeColor(getStatusLabel(service))
                            }`}
                          >
                            {getStatusLabel(service)}
                          </span>
                        </div>
                        <div className="col-span-3 text-sm font-medium text-gray-700 text-right">
                          {formatDate(service.updated_at || service.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No services found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Notice Board & Upcoming Compliances */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          {/* Notice Board */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
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

            {/* Notice Tabs */}
            <div className="flex border-b border-gray-100 mb-4">
              <button 
                onClick={() => setActiveNoticeTab('All Notices')}
                className={`pb-2 mr-6 text-sm font-medium transition-colors ${
                  activeNoticeTab === 'All Notices' 
                    ? 'text-[#01334C] border-b-2 border-[#01334C]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Notices
              </button>
              <button 
                onClick={() => setActiveNoticeTab('My Notices')}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeNoticeTab === 'My Notices' 
                    ? 'text-[#01334C] border-b-2 border-[#01334C]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Notices
              </button>
            </div>

            {loadingNotice ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : filteredNotices.length > 0 ? (
              <div className="relative overflow-hidden">
                {/* Carousel Container */}
                <div 
                  className={`flex ${currentNoticeIndex === 0 ? '' : 'transition-transform duration-700 ease-in-out'}`}
                  style={{ transform: `translateX(-${currentNoticeIndex * 100}%)` }}
                >
                  {/* Render all notices + duplicate first notice at the end for infinite loop */}
                  {[...filteredNotices, ...(filteredNotices.length > 1 ? [filteredNotices[0]] : [])].map((noticeItem, index) => (
                    <div 
                      key={index} 
                      className="w-full flex-shrink-0"
                    >
                      <div className="bg-[#FFF9F0] rounded-xl p-6 border border-[#FFF0D4]">
                        <div className="flex items-start space-x-4">
                          <div className="bg-[#FFAB00] rounded-full p-2.5 flex-shrink-0 shadow-sm text-white">
                            <TriangleAlert className="w-5 h-5" />
                          </div>
                          <div className="w-full">
                            <h3 className="text-gray-900 text-sm font-medium mb-1">
                              {noticeItem.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-1">
                              {noticeItem.description}
                            </p>
                            {noticeItem.link && (
                              <a
                                href={noticeItem.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#023752] font-medium text-sm hover:underline"
                              >
                                File Now.
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination dots - only show if multiple notices */}
                {filteredNotices.length > 1 && (
                  <div className="mt-4 flex justify-center space-x-1.5">
                    {filteredNotices.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentNoticeIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          index === (currentNoticeIndex % filteredNotices.length)
                            ? 'bg-gray-800' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to notice ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
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
              My Organizations
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
                <div className="col-span-4">Name</div>
                <div className="col-span-6">GST number</div>
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
                    <div className="col-span-4">
                      <span className="text-sm font-medium text-gray-900 block">
                        {org.legal_name || org.trade_name || "-"}
                      </span>
                    </div>
                    <div className="col-span-6">
                      <span className="text-sm text-gray-500 font-medium">
                        {org.gstin || "-"}
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
