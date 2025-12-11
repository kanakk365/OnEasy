import React from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";

function Registrations() {
  const navigate = useNavigate();
  const [view, setView] = React.useState("services");
  const [allServices, setAllServices] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showComingSoon, setShowComingSoon] = React.useState(false);

  React.useEffect(() => {
    if (view !== "my") return;
    const load = async () => {
      setLoading(true);
      try {
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
        );
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
        const norm = (resp) =>
          resp.success ? (Array.isArray(resp.data) ? resp.data : resp.data?.data || []) : [];
        const combined = [...norm(pl), ...norm(prop), ...norm(si), ...norm(gst)];
        const sorted = combined.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at || b.createdAt || 0) -
            new Date(a.updated_at || a.created_at || a.createdAt || 0)
        );
        setAllServices(sorted);
      } catch (err) {
        console.error("Load registrations failed", err);
        setAllServices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [view]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const statusLabel = (reg) => {
    if (reg.service_status) return reg.service_status;
    if (reg.status) return reg.status;
    if (reg.payment_status) return reg.payment_status;
    return "Open";
  };

  const badge = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const s = status.toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-800";
    if (["wip", "data received", "awaiting confirmation from the govt", "awaiting confirmation from the government", "data pending from client", "in progress", "submitted", "registered"].includes(s))
      return "bg-blue-100 text-blue-800";
    if (s === "technical issue") return "bg-red-100 text-red-800";
    if (s === "payment pending") return "bg-orange-100 text-orange-800";
    if (s === "draft") return "bg-gray-100 text-gray-800";
    if (s === "paid" || s === "payment_completed") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const deriveType = (reg) => {
    const tid = (reg.ticket_id || reg.id || "").toString().toUpperCase();
    if (tid.startsWith("PVT_")) return "Private Limited";
    if (tid.startsWith("PROP_")) return "Proprietorship";
    if (tid.startsWith("SI_")) return "Startup India";
    if (tid.startsWith("GST_")) return "GST";
    if (tid.startsWith("OPC_")) return "OPC";
    if (tid.startsWith("LLP_")) return "LLP";
    if (tid.startsWith("PART_") || tid.startsWith("PARTNERSHIP_")) return "Partnership";
    if (tid.startsWith("SEC8_") || tid.startsWith("SECTION8_")) return "Section 8";
    return reg.registration_type || reg.service_type || "Service";
  };

  const formatName = (reg) => {
    const raw = reg.business_name || reg.package_name || "Service";
    return raw.replace(/[-–]\s*Payment\s*Completed/i, "").trim();
  };

  const getTypeSlug = (type) => {
    const t = type.toLowerCase();
    if (t.includes("private")) return "private-limited";
    if (t.includes("proprietorship")) return "proprietorship";
    if (t.includes("startup")) return "startup-india";
    if (t === "gst") return "gst";
    if (t === "opc") return "opc";
    if (t === "llp") return "llp";
    if (t.includes("partnership")) return "partnership";
    if (t.includes("section 8")) return "section-8";
    if (t.includes("public")) return "public-limited";
    if (t.includes("mca")) return "mca-name-approval";
    if (t.includes("indian")) return "indian-subsidiary";
    return "registrations";
  };

  const getTicketId = (reg) => reg.ticket_id || reg.id || "";

  const filtered = allServices.filter((s) => {
    if (!search) return true;
    const text = `${deriveType(s)} ${formatName(s)}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleEdit = (reg) => {
    const type = deriveType(reg).toLowerCase();
    if (type.includes("private")) return navigate("/private-limited-form");
    if (type.includes("proprietorship")) return navigate("/proprietorship-form");
    if (type.includes("startup")) return navigate("/startup-india-form");
    if (type === "gst") return navigate("/gst-form");
    // non-form services: no edit
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Select your Services</h1>
            <div className="relative w-[400px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoSearchOutline className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a service (e.g. GST, Income Tax, ROC)"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01334C] focus:border-[#01334C] bg-white"
              />
            </div>
          </div>
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setView("services")}
                className={`py-2 px-5 relative rounded-lg ${
                  view === "services" ? "bg-[#004568] text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setView("my")}
                className={`py-2 px-5 relative rounded-lg ${
                  view === "my" ? "bg-[#004568] text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Registrations
              </button>
            </div>
          </div>
        </div>

        {view === "services" ? (
          <>
            <div className="grid gap-4">
              {[
                { title: "Start up Services", desc: "Incorporation, funding, and advisory support", onClick: () => navigate("/company-categories"), comingSoon: false },
                { title: "Registration Services", desc: "Quick and easy business registrations", onClick: () => navigate("/registration-categories"), comingSoon: false },
                { title: "Goods and Services Tax Services", desc: "GST registration, filing, and compliance", onClick: () => setShowComingSoon(true), comingSoon: true },
                { title: "ROC & MCA Services", desc: "Company law filings and MCA compliance", onClick: () => setShowComingSoon(true), comingSoon: true },
                { title: "Compliance Services", desc: "Ongoing compliance and regulatory support", onClick: () => setShowComingSoon(true), comingSoon: true },
                { title: "Tax & Accounting Services", desc: "Income tax, accounting, and financial services", onClick: () => setShowComingSoon(true), comingSoon: true },
              ].map((service, idx) => (
                <div
                  key={idx}
                  className="relative group bg-white rounded-2xl p-5 hover:bg-[#01334C] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-between w-full"
                  onClick={service.onClick}
                >
                  <div>
                    <h3 className="text-lg font-medium text-[#00486D] group-hover:text-white">
                      {service.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-200">
                      {service.desc}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#246181] flex items-center justify-center">
                    <span className="text-[#01334C] group-hover:text-white text-lg">→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon Popup */}
            {showComingSoon && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Blurred Background */}
                <div 
                  className="absolute inset-0 backdrop-blur-lg"
                  onClick={() => setShowComingSoon(false)}
                ></div>
                
                {/* Popup Content */}
                <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Coming Soon!
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      We're working hard to bring you this amazing service. We'll deliver it as soon as possible!
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Stay tuned for updates and exciting new features.
                    </p>
                    <button
                      onClick={() => setShowComingSoon(false)}
                      className="w-full bg-[#00486D] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#003855] transition-colors duration-200"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-[#F3F3F3]">
            <div className="p-5 overflow-x-auto">
              {loading ? (
                <div className="text-sm text-gray-500 p-4 text-center">Loading registrations...</div>
              ) : filtered.length > 0 ? (
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
                    {filtered.map((reg, idx) => {
                      const type = deriveType(reg);
                      const canEdit = ["private limited", "proprietorship", "startup india", "gst"].some((t) =>
                        type.toLowerCase().includes(t)
                      );
                      const slug = getTypeSlug(type);
                      const ticketId = getTicketId(reg);
                      const hasDetailRoute = ["private-limited", "proprietorship", "startup-india", "gst"].includes(slug) && ticketId;
                      return (
                        <tr key={reg.ticket_id || reg.id || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {type}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatName(reg)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`${badge(statusLabel(reg))} px-2 py-1 rounded-full text-xs font-medium`}>
                              {statusLabel(reg)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(reg.updated_at || reg.created_at || reg.createdAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (hasDetailRoute) {
                                    navigate(`/${slug}/view/${ticketId}`);
                                  } else {
                                    navigate(`/registrations/${slug}`);
                                  }
                                }}
                                className="px-3 py-1 text-xs font-medium text-[#00486D] border border-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
                              >
                                View Details
                              </button>
                              {canEdit ? (
                                <button
                                  onClick={() => handleEdit(reg)}
                                  className="px-3 py-1 text-xs font-medium text-white bg-[#00486D] rounded-md hover:bg-[#003855] transition-colors"
                                >
                                  Edit Registration
                                </button>
                              ) : (
                                <span className="text-xs text-gray-500">N/A</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-sm text-gray-500 p-4 text-center">No registrations found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Registrations;
