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
        const [pl, prop, si, gst, allServices] = await Promise.all([
          apiClient.get(`/private-limited/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
          apiClient.get(`/proprietorship/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
          apiClient.get(`/startup-india/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
          apiClient.get(`/gst/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
          apiClient.get(`/registrations`).catch(() => ({ success: false, data: [] })),
        ]);
        const norm = (resp) =>
          resp.success ? (Array.isArray(resp.data) ? resp.data : resp.data?.data || []) : [];
        // Filter allServices to only include paid registrations (with payment_id)
        const paidAllServices = norm(allServices).filter(reg => 
          (reg.razorpay_payment_id && reg.razorpay_payment_id.trim() !== '') ||
          (reg.payment_id && reg.payment_id.trim() !== '') ||
          (reg.payment_status && reg.payment_status.toLowerCase() === 'paid')
        );
        const combined = [...norm(pl), ...norm(prop), ...norm(si), ...norm(gst), ...paidAllServices];
        
        // Deduplicate based on ticket_id or payment_id
        const seen = new Set();
        const unique = combined.filter(reg => {
          const key = reg.ticket_id || reg.razorpay_payment_id || reg.payment_id || `${reg.user_id}_${reg.package_name}_${reg.created_at}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
        
        const sorted = unique.sort(
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
    // GST Services
    if (tid.startsWith("GST-RETURNS_") || tid.includes("GST-RETURNS")) return "GST Returns";
    if (tid.startsWith("GST-ANNUAL-RETURN_") || tid.includes("GST-ANNUAL-RETURN")) return "GST Annual Return";
    if (tid.startsWith("GST-AMENDMENT_") || tid.includes("GST-AMENDMENT")) return "GST Amendment";
    if (tid.startsWith("GST-NOTICE_") || tid.includes("GST-NOTICE")) return "GST Notice";
    // ROC & MCA Services
    if (tid.startsWith("DIRECTOR-ADDITION_") || tid.includes("DIRECTOR-ADDITION")) return "Director Addition";
    if (tid.startsWith("SHARE-TRANSFER_") || tid.includes("SHARE-TRANSFER")) return "Share Transfer";
    if (tid.startsWith("ADDRESS-CHANGE_") || tid.includes("ADDRESS-CHANGE")) return "Address Change";
    if (tid.startsWith("CHARGE-CREATION_") || tid.includes("CHARGE-CREATION")) return "Charge Creation";
    if (tid.startsWith("DIRECTOR-REMOVAL_") || tid.includes("DIRECTOR-REMOVAL")) return "Director Removal";
    if (tid.startsWith("MOA-AMENDMENT_") || tid.includes("MOA-AMENDMENT")) return "MOA Amendment";
    if (tid.startsWith("AOA-AMENDMENT_") || tid.includes("AOA-AMENDMENT")) return "AOA Amendment";
    if (tid.startsWith("OBJECTS-CLAUSE-CHANGE_") || tid.includes("OBJECTS-CLAUSE")) return "Objects Clause Change";
    if (tid.startsWith("INCREASE-SHARE-CAPITAL_") || tid.includes("INCREASE-SHARE-CAPITAL")) return "Increase Share Capital";
    if (tid.startsWith("NAME-CHANGE-COMPANY_") || tid.includes("NAME-CHANGE-COMPANY")) return "Name Change - Company";
    if (tid.startsWith("DIN-DEACTIVATION_") || tid.includes("DIN-DEACTIVATION")) return "DIN Deactivation";
    if (tid.startsWith("DIN-REACTIVATION_") || tid.includes("DIN-REACTIVATION")) return "DIN Reactivation";
    if (tid.startsWith("ADT-1_") || tid.includes("ADT-1")) return "ADT-1";
    if (tid.startsWith("WINDING-UP-COMPANY_") || tid.includes("WINDING-UP-COMPANY")) return "Winding Up - Company";
    if (tid.startsWith("WINDING-UP-LLP_") || tid.includes("WINDING-UP-LLP")) return "Winding Up - LLP";
    if (tid.startsWith("DIN-APPLICATION_") || tid.includes("DIN-APPLICATION")) return "DIN Application";
    if (tid.startsWith("INC-20A_") || tid.includes("INC-20A")) return "INC 20A";
    // Compliance Services
    if (tid.startsWith("FSSAI-RENEWAL_") || tid.includes("FSSAI-RENEWAL")) return "FSSAI Renewal";
    if (tid.startsWith("FSSAI-RETURN-FILING_") || tid.includes("FSSAI-RETURN-FILING")) return "FSSAI Return Filing";
    if (tid.startsWith("BUSINESS-PLAN_") || tid.includes("BUSINESS-PLAN")) return "Business Plan";
    if (tid.startsWith("HR-PAYROLL_") || tid.includes("HR-PAYROLL")) return "HR & Payroll";
    if (tid.startsWith("PF-RETURN-FILING_") || tid.includes("PF-RETURN-FILING")) return "PF Return Filing";
    if (tid.startsWith("ESI-RETURN-FILING_") || tid.includes("ESI-RETURN-FILING")) return "ESI Return Filing";
    if (tid.startsWith("PROFESSIONAL-TAX-RETURN_") || tid.includes("PROFESSIONAL-TAX-RETURN")) return "Professional Tax Return";
    if (tid.startsWith("PARTNERSHIP-COMPLIANCE_") || tid.includes("PARTNERSHIP-COMPLIANCE")) return "Partnership Compliance";
    if (tid.startsWith("PROPRIETORSHIP-COMPLIANCE_") || tid.includes("PROPRIETORSHIP-COMPLIANCE")) return "Proprietorship Compliance";
    if (tid.startsWith("COMPANY-COMPLIANCE_") || tid.includes("COMPANY-COMPLIANCE")) return "Company Compliance";
    if (tid.startsWith("TRADEMARK_") || tid.includes("TRADEMARK")) return "Trademark";
    // Tax & Accounting Services
    if (tid.startsWith("SALARY-ITR_") || tid.includes("SALARY-ITR")) return "Income Tax Return - Salary";
    if (tid.startsWith("BUSINESS-ITR_") || tid.includes("BUSINESS-ITR")) return "Business - Income Tax Return";
    if (tid.startsWith("HOUSE-PROPERTY-ITR_") || tid.includes("HOUSE-PROPERTY-ITR")) return "House Property - Income Tax Return";
    if (tid.startsWith("TRUST-ITR_") || tid.includes("TRUST-ITR")) return "Trust - Income Tax Return";
    if (tid.startsWith("SALARY-HP-CAPITAL-GAINS_") || tid.includes("SALARY-HP-CAPITAL-GAINS")) return "Income From Salary, HP and Capital gains";
    if (tid.startsWith("PARTNERSHIP-FIRM-ITR_") || tid.includes("PARTNERSHIP-FIRM-ITR")) return "Partnership Firm";
    if (tid.startsWith("COMPANY-ITR_") || tid.includes("COMPANY-ITR")) return "Company - ITR";
    // Fallback to business_name or service_type
    if (reg.business_name) {
      const name = reg.business_name.toLowerCase();
      if (name.includes('gst returns')) return "GST Returns";
      if (name.includes('gst annual return')) return "GST Annual Return";
      if (name.includes('gst amendment')) return "GST Amendment";
      if (name.includes('gst notice')) return "GST Notice";
      if (name.includes('director addition')) return "Director Addition";
      if (name.includes('share transfer')) return "Share Transfer";
      if (name.includes('address change') || name.includes('registered office')) return "Address Change";
      if (name.includes('charge creation')) return "Charge Creation";
      if (name.includes('director removal')) return "Director Removal";
      if (name.includes('moa amendment')) return "MOA Amendment";
      if (name.includes('aoa amendment')) return "AOA Amendment";
      if (name.includes('objects clause')) return "Objects Clause Change";
      if (name.includes('increase share capital')) return "Increase Share Capital";
      if (name.includes('name change')) return "Name Change - Company";
      if (name.includes('din deactivation')) return "DIN Deactivation";
      if (name.includes('din reactivation')) return "DIN Reactivation";
      if (name.includes('adt-1') || name.includes('adt 1')) return "ADT-1";
      if (name.includes('winding up company')) return "Winding Up - Company";
      if (name.includes('winding up llp')) return "Winding Up - LLP";
      if (name.includes('din application')) return "DIN Application";
      if (name.includes('inc-20a') || name.includes('inc 20a')) return "INC 20A";
      if (name.includes('fssai renewal')) return "FSSAI Renewal";
      if (name.includes('fssai return filing')) return "FSSAI Return Filing";
      if (name.includes('business plan')) return "Business Plan";
      if (name.includes('hr payroll')) return "HR & Payroll";
      if (name.includes('pf return filing')) return "PF Return Filing";
      if (name.includes('esi return filing')) return "ESI Return Filing";
      if (name.includes('professional tax return')) return "Professional Tax Return";
      if (name.includes('partnership compliance')) return "Partnership Compliance";
      if (name.includes('proprietorship compliance')) return "Proprietorship Compliance";
      if (name.includes('company compliance')) return "Company Compliance";
      if (name.includes('trademark')) return "Trademark";
      if (name.includes('salary itr') || name.includes('income tax return salary')) return "Income Tax Return - Salary";
      if (name.includes('business itr') || name.includes('business income tax')) return "Business - Income Tax Return";
      if (name.includes('house property itr')) return "House Property - Income Tax Return";
      if (name.includes('trust itr')) return "Trust - Income Tax Return";
      if (name.includes('salary hp capital')) return "Income From Salary, HP and Capital gains";
      if (name.includes('partnership firm itr')) return "Partnership Firm";
      if (name.includes('company itr')) return "Company - ITR";
      // Other registration services
      if (name.includes('esi') && !name.includes('return filing')) return "ESI";
      if (name.includes('section 8') || name.includes('section-8')) return "Section 8";
      if (name.includes('labour license') || name.includes('labour-license')) return "Labour License";
      if (name.includes('dsc') || name.includes('digital signature')) return "DSC";
    }
    return reg.registration_type || reg.service_type || reg.business_name || "Service";
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
    if (t === "gst" || t.includes("gst registration")) return "gst";
    if (t.includes("gst returns")) return "gst-returns";
    if (t.includes("gst annual return")) return "gst-annual-return";
    if (t.includes("gst amendment")) return "gst-amendment";
    if (t.includes("gst notice")) return "gst-notice";
    if (t === "opc") return "opc";
    if (t === "llp") return "llp";
    if (t.includes("partnership")) return "partnership";
    if (t.includes("section 8")) return "section-8";
    if (t.includes("public")) return "public-limited";
    if (t.includes("mca")) return "mca-name-approval";
    if (t.includes("indian")) return "indian-subsidiary";
    if (t.includes("director addition")) return "director-addition";
    if (t.includes("share transfer")) return "share-transfer";
    if (t.includes("address change")) return "address-change";
    if (t.includes("charge creation")) return "charge-creation";
    if (t.includes("director removal")) return "director-removal";
    if (t.includes("moa amendment")) return "moa-amendment";
    if (t.includes("aoa amendment")) return "aoa-amendment";
    if (t.includes("objects clause")) return "objects-clause-change";
    if (t.includes("increase share capital")) return "increase-share-capital";
    if (t.includes("name change")) return "name-change-company";
    if (t.includes("din deactivation")) return "din-deactivation";
    if (t.includes("din reactivation")) return "din-reactivation";
    if (t.includes("adt-1") || t.includes("adt 1")) return "adt-1";
    if (t.includes("winding up company")) return "winding-up-company";
    if (t.includes("winding up llp")) return "winding-up-llp";
    if (t.includes("din application")) return "din-application";
    if (t.includes("inc-20a") || t.includes("inc 20a")) return "inc-20a";
    if (t.includes("fssai renewal")) return "fssai-renewal";
    if (t.includes("fssai return filing")) return "fssai-return-filing";
    if (t.includes("business plan")) return "business-plan";
    if (t.includes("hr payroll")) return "hr-payroll";
    if (t.includes("pf return filing")) return "pf-return-filing";
    if (t.includes("esi return filing")) return "esi-return-filing";
    if (t.includes("professional tax return")) return "professional-tax-return";
    if (t.includes("partnership compliance")) return "partnership-compliance";
    if (t.includes("proprietorship compliance")) return "proprietorship-compliance";
    if (t.includes("company compliance")) return "company-compliance";
    if (t.includes("trademark")) return "trademark";
    if (t.includes("salary itr") || t.includes("income tax return salary")) return "salary-itr";
    if (t.includes("business itr") || t.includes("business income tax")) return "business-itr";
    if (t.includes("house property itr")) return "house-property-itr";
    if (t.includes("trust itr")) return "trust-itr";
    if (t.includes("salary hp capital")) return "salary-hp-capital-gains";
    if (t.includes("partnership firm itr")) return "partnership-firm-itr";
    if (t.includes("company itr")) return "company-itr";
    return "registrations";
  };

  const getTicketId = (reg) => reg.ticket_id || reg.id || "";

  const getDetailRoute = (type, slug) => {
    // Services with forms - use view route
    if (["private-limited", "proprietorship", "startup-india", "gst"].includes(slug)) {
      return null; // Will use view route with ticket ID
    }
    
    // All other services use registration pages (ServiceRegistrations component)
    // GST Services
    if (slug === "gst-returns") return "/registrations/gst-returns";
    if (slug === "gst-annual-return") return "/registrations/gst-annual-return";
    if (slug === "gst-amendment") return "/registrations/gst-amendment";
    if (slug === "gst-notice") return "/registrations/gst-notice";
    if (slug === "lut" || type.toLowerCase().includes("letter of undertaking")) return "/registrations/gst-lut";
    
    // ROC & MCA Services
    if (slug === "director-addition") return "/registrations/director-addition";
    if (slug === "share-transfer") return "/registrations/share-transfer";
    if (slug === "address-change") return "/registrations/address-change";
    if (slug === "charge-creation") return "/registrations/charge-creation";
    if (slug === "director-removal") return "/registrations/director-removal";
    if (slug === "moa-amendment") return "/registrations/moa-amendment";
    if (slug === "aoa-amendment") return "/registrations/aoa-amendment";
    if (slug === "objects-clause-change") return "/registrations/objects-clause-change";
    if (slug === "increase-share-capital") return "/registrations/increase-share-capital";
    if (slug === "name-change-company") return "/registrations/name-change-company";
    if (slug === "din-deactivation") return "/registrations/din-deactivation";
    if (slug === "din-reactivation") return "/registrations/din-reactivation";
    if (slug === "adt-1") return "/registrations/adt-1";
    if (slug === "winding-up-company") return "/registrations/winding-up-company";
    if (slug === "winding-up-llp") return "/registrations/winding-up-llp";
    if (slug === "din-application") return "/registrations/din-application";
    if (slug === "inc-20a") return "/registrations/inc-20a";
    
    // Compliance Services
    if (slug === "fssai-renewal") return "/registrations/fssai-renewal";
    if (slug === "fssai-return-filing") return "/registrations/fssai-return-filing";
    if (slug === "business-plan") return "/registrations/business-plan";
    if (slug === "hr-payroll") return "/registrations/hr-payroll";
    if (slug === "pf-return-filing") return "/registrations/pf-return-filing";
    if (slug === "esi-return-filing") return "/registrations/esi-return-filing";
    if (slug === "professional-tax-return") return "/registrations/professional-tax-return";
    if (slug === "partnership-compliance") return "/registrations/partnership-compliance";
    if (slug === "proprietorship-compliance") return "/registrations/proprietorship-compliance";
    if (slug === "company-compliance") return "/registrations/company-compliance";
    if (slug === "trademark") return "/registrations/trademark";
    
    // Tax & Accounting Services
    if (slug === "salary-itr") return "/registrations/salary-itr";
    if (slug === "business-itr") return "/registrations/business-itr";
    if (slug === "house-property-itr") return "/registrations/house-property-itr";
    if (slug === "trust-itr") return "/registrations/trust-itr";
    if (slug === "salary-hp-capital-gains") return "/registrations/salary-hp-capital-gains";
    if (slug === "partnership-firm-itr") return "/registrations/partnership-firm-itr";
    if (slug === "company-itr") return "/registrations/company-itr";
    
    // Other registration services
    if (slug === "esi" || type.toLowerCase().includes("esi")) return "/registrations/esi";
    if (slug === "section-8") return "/registrations/section-8";
    if (slug === "labour-license" || type.toLowerCase().includes("labour license")) return "/registrations/labour-license";
    if (slug === "dsc" || type.toLowerCase().includes("digital signature")) return "/registrations/dsc";
    
    return null;
  };

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
                { title: "Goods and Services Tax Services", desc: "GST registration, filing, and compliance", onClick: () => navigate("/gst-categories"), comingSoon: false },
                { title: "ROC & MCA Services", desc: "Company law filings and MCA compliance", onClick: () => navigate("/roc-categories"), comingSoon: false },
                { title: "Compliance Services", desc: "Ongoing compliance and regulatory support", onClick: () => navigate("/compliance-categories"), comingSoon: false },
                { title: "Tax & Accounting Services", desc: "Income tax, accounting, and financial services", onClick: () => navigate("/tax-accounting-categories"), comingSoon: false },
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
                      const detailRoute = getDetailRoute(type, slug);
                      // Services with forms - use view route with ticket ID
                      const hasFormRoute = ["private-limited", "proprietorship", "startup-india", "gst"].includes(slug) && ticketId;
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
                              {hasFormRoute ? (
                                <button
                                  onClick={() => navigate(`/${slug}/view/${ticketId}`)}
                                  className="px-3 py-1 text-xs font-medium text-[#00486D] border border-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
                                >
                                  View Details
                                </button>
                              ) : detailRoute ? (
                                <button
                                  onClick={() => navigate(detailRoute)}
                                  className="px-3 py-1 text-xs font-medium text-[#00486D] border border-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
                                >
                                  View Details
                                </button>
                              ) : null}
                              {canEdit ? (
                                <button
                                  onClick={() => handleEdit(reg)}
                                  className="px-3 py-1 text-xs font-medium text-white bg-[#00486D] rounded-md hover:bg-[#003855] transition-colors"
                                >
                                  Edit Registration
                                </button>
                              ) : null}
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
