import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/api";

// Map route types to friendly labels
const typeLabels = {
  opc: "OPC",
  llp: "LLP",
  partnership: "Partnership",
  "section-8": "Section 8",
  "public-limited": "Public Limited",
  "mca-name-approval": "MCA Name Approval",
  "indian-subsidiary": "Indian Subsidiary",
  "professional-tax": "Professional Tax",
  "labour-license": "Labour License",
  "udyam": "Udyam / MSME",
  "fssai": "FSSAI / Food License",
  "trade-license": "Trade License",
  "iec": "Import Export Code (IEC)",
  "dsc": "Digital Signature (DSC)",
  "esi": "ESI Registration",
  "registration-12a": "12A Registration",
  "registration-80g": "80G Registration",
  // GST Services (6 categories)
  "gst-registration": "GST Registration",
  "gst-returns": "GST Returns",
  "gst-lut": "Letter of Undertaking",
  "gst-annual-return": "GST Annual Return",
  "gst-amendment": "GST Amendment",
  "gst-notice": "GST Notice",
  // ROC & MCA Services
  "director-addition": "Director Addition",
  "share-transfer": "Share Transfer",
  "address-change": "Address Change",
  "charge-creation": "Charge Creation",
  "director-removal": "Director Removal",
  "moa-amendment": "MOA Amendment",
  "aoa-amendment": "AOA Amendment",
  "objects-clause-change": "Objects Clause Change",
  "increase-share-capital": "Increase Share Capital",
  "name-change-company": "Name Change - Company",
  "din-deactivation": "DIN Deactivation",
  "din-reactivation": "DIN Reactivation",
  "adt-1": "ADT-1",
  "winding-up-company": "Winding Up - Company",
  "winding-up-llp": "Winding Up - LLP",
  "din-application": "DIN Application",
  "inc-20a": "INC 20A",
  // Compliance Services
  "fssai-renewal": "FSSAI Renewal",
  "fssai-return-filing": "FSSAI Return Filing",
  "business-plan": "Business Plan",
  "hr-payroll": "HR & Payroll Service",
  "pf-return-filing": "PF Return Filing",
  "esi-return-filing": "ESI Return Filing",
  "professional-tax-return": "Professional Tax Return Filing",
  "partnership-compliance": "Partnership Compliance",
  "proprietorship-compliance": "Proprietorship Compliance",
  "company-compliance": "Company Compliance",
  "trademark": "Trademark",
  // Tax & Accounting Services
  "salary-itr": "Income Tax Return - Salary",
  "business-itr": "Business - Income Tax Return",
  "house-property-itr": "House Property - Income Tax Return",
  "trust-itr": "Trust - Income Tax Return",
  "salary-hp-capital-gains": "Income From Salary, HP and Capital gains",
  "partnership-firm-itr": "Partnership Firm - ITR",
  "company-itr": "Company - ITR",
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
    case "professional-tax":
      return ticketId.startsWith("PT_") || 
             ticketId.startsWith("PROF_TAX_") ||
             text.includes("professional tax") ||
             businessName === "professional-tax" || businessName === "professional tax";
    case "labour-license":
      return ticketId.startsWith("LAB_") || 
             ticketId.startsWith("LABOUR_") ||
             text.includes("labour license") ||
             businessName === "labour-license" || businessName === "labour license";
    case "udyam":
      return ticketId.startsWith("UDYAM_") || 
             ticketId.startsWith("MSME_") ||
             text.includes("udyam") ||
             text.includes("msme") ||
             businessName === "udyam" || businessName === "msme";
    case "fssai":
      return ticketId.startsWith("FSSAI_") ||
             text.includes("fssai") ||
             text.includes("food license") ||
             businessName === "fssai";
    case "trade-license":
      return ticketId.startsWith("TRADE_") ||
             text.includes("trade license") ||
             businessName === "trade-license" || businessName === "trade license";
    case "iec":
      return ticketId.startsWith("IEC_") ||
             text.includes("import export") ||
             text.includes("iec") ||
             businessName === "iec";
    case "gst-lut":
      return ticketId.startsWith("LUT_") ||
             ticketId.startsWith("GST_LUT_") ||
             text.includes("lut") ||
             text.includes("letter of undertaking") ||
             businessName === "gst-lut" || businessName === "lut";
    case "gst-registration":
      return (ticketId.startsWith("GST_") && !ticketId.includes("GST-RETURNS") && !ticketId.includes("GST-ANNUAL") && 
             !ticketId.includes("GST-AMENDMENT") && !ticketId.includes("GST-NOTICE") && !ticketId.includes("GST_LUT") && 
             !ticketId.includes("LUT_")) ||
             (text.includes("gst registration") && !text.includes("returns") && !text.includes("annual") && 
              !text.includes("amendment") && !text.includes("notice") && !text.includes("lut"));
    case "dsc":
      return ticketId.startsWith("DSC_") ||
             text.includes("digital signature") ||
             text.includes("dsc") ||
             businessName === "dsc";
    case "esi":
      return ticketId.startsWith("ESI_") ||
             text.includes("employee state insurance") ||
             text.includes("esi") ||
             businessName === "esi";
    case "registration-12a":
    case "12a":
      return ticketId.startsWith("12A_") ||
             ticketId.startsWith("REG_12A_") ||
             text.includes("12a") ||
             businessName === "registration-12a" || businessName === "12a";
    case "registration-80g":
    case "80g":
      return ticketId.startsWith("80G_") ||
             ticketId.startsWith("REG_80G_") ||
             text.includes("80g") ||
             businessName === "registration-80g" || businessName === "80g";
    // GST Services
    case "gst-returns":
      return ticketId.startsWith("GST-RETURNS_") || ticketId.includes("GST-RETURNS") ||
             text.includes("gst returns") || text.includes("gst-returns");
    case "gst-annual-return":
      return ticketId.startsWith("GST-ANNUAL-RETURN_") || ticketId.includes("GST-ANNUAL-RETURN") ||
             text.includes("gst annual return") || text.includes("gst-annual-return");
    case "gst-amendment":
      return ticketId.startsWith("GST-AMENDMENT_") || ticketId.includes("GST-AMENDMENT") ||
             text.includes("gst amendment") || text.includes("gst-amendment");
    case "gst-notice":
      return ticketId.startsWith("GST-NOTICE_") || ticketId.includes("GST-NOTICE") ||
             text.includes("gst notice") || text.includes("gst-notice");
    // ROC & MCA Services
    case "director-addition":
      return ticketId.startsWith("DIRECTOR-ADDITION_") || ticketId.includes("DIRECTOR-ADDITION") ||
             text.includes("director addition") || text.includes("director-addition");
    case "share-transfer":
      return ticketId.startsWith("SHARE-TRANSFER_") || ticketId.includes("SHARE-TRANSFER") ||
             text.includes("share transfer") || text.includes("share-transfer");
    case "address-change":
      return ticketId.startsWith("ADDRESS-CHANGE_") || ticketId.includes("ADDRESS-CHANGE") ||
             text.includes("address change") || text.includes("address-change") || text.includes("registered office");
    case "charge-creation":
      return ticketId.startsWith("CHARGE-CREATION_") || ticketId.includes("CHARGE-CREATION") ||
             text.includes("charge creation") || text.includes("charge-creation");
    case "director-removal":
      return ticketId.startsWith("DIRECTOR-REMOVAL_") || ticketId.includes("DIRECTOR-REMOVAL") ||
             text.includes("director removal") || text.includes("director-removal");
    case "moa-amendment":
      return ticketId.startsWith("MOA-AMENDMENT_") || ticketId.includes("MOA-AMENDMENT") ||
             text.includes("moa amendment") || text.includes("moa-amendment");
    case "aoa-amendment":
      return ticketId.startsWith("AOA-AMENDMENT_") || ticketId.includes("AOA-AMENDMENT") ||
             text.includes("aoa amendment") || text.includes("aoa-amendment");
    case "objects-clause-change":
      return ticketId.startsWith("OBJECTS-CLAUSE-CHANGE_") || ticketId.includes("OBJECTS-CLAUSE") ||
             text.includes("objects clause") || text.includes("objects-clause");
    case "increase-share-capital":
      return ticketId.startsWith("INCREASE-SHARE-CAPITAL_") || ticketId.includes("INCREASE-SHARE-CAPITAL") ||
             text.includes("increase share capital") || text.includes("increase-share-capital");
    case "name-change-company":
      return ticketId.startsWith("NAME-CHANGE-COMPANY_") || ticketId.includes("NAME-CHANGE-COMPANY") ||
             text.includes("name change") || text.includes("name-change-company");
    case "din-deactivation":
      return ticketId.startsWith("DIN-DEACTIVATION_") || ticketId.includes("DIN-DEACTIVATION") ||
             text.includes("din deactivation") || text.includes("din-deactivation");
    case "din-reactivation":
      return ticketId.startsWith("DIN-REACTIVATION_") || ticketId.includes("DIN-REACTIVATION") ||
             text.includes("din reactivation") || text.includes("din-reactivation");
    case "adt-1":
      return ticketId.startsWith("ADT-1_") || ticketId.includes("ADT-1") ||
             text.includes("adt-1") || text.includes("adt 1");
    case "winding-up-company":
      return ticketId.startsWith("WINDING-UP-COMPANY_") || ticketId.includes("WINDING-UP-COMPANY") ||
             text.includes("winding up company") || text.includes("winding-up-company");
    case "winding-up-llp":
      return ticketId.startsWith("WINDING-UP-LLP_") || ticketId.includes("WINDING-UP-LLP") ||
             text.includes("winding up llp") || text.includes("winding-up-llp");
    case "din-application":
      return ticketId.startsWith("DIN-APPLICATION_") || ticketId.includes("DIN-APPLICATION") ||
             text.includes("din application") || text.includes("din-application");
    case "inc-20a":
      return ticketId.startsWith("INC-20A_") || ticketId.includes("INC-20A") ||
             text.includes("inc-20a") || text.includes("inc 20a");
    // Compliance Services
    case "fssai-renewal":
      return ticketId.startsWith("FSSAI-RENEWAL_") || ticketId.includes("FSSAI-RENEWAL") ||
             text.includes("fssai renewal") || text.includes("fssai-renewal");
    case "fssai-return-filing":
      return ticketId.startsWith("FSSAI-RETURN-FILING_") || ticketId.includes("FSSAI-RETURN-FILING") ||
             text.includes("fssai return filing") || text.includes("fssai-return-filing");
    case "business-plan":
      return ticketId.startsWith("BUSINESS-PLAN_") || ticketId.includes("BUSINESS-PLAN") ||
             text.includes("business plan") || text.includes("business-plan");
    case "hr-payroll":
      return ticketId.startsWith("HR-PAYROLL_") || ticketId.includes("HR-PAYROLL") ||
             text.includes("hr payroll") || text.includes("hr-payroll");
    case "pf-return-filing":
      return ticketId.startsWith("PF-RETURN-FILING_") || ticketId.includes("PF-RETURN-FILING") ||
             text.includes("pf return filing") || text.includes("pf-return-filing");
    case "esi-return-filing":
      return ticketId.startsWith("ESI-RETURN-FILING_") || ticketId.includes("ESI-RETURN-FILING") ||
             text.includes("esi return filing") || text.includes("esi-return-filing");
    case "professional-tax-return":
      return ticketId.startsWith("PROFESSIONAL-TAX-RETURN_") || ticketId.includes("PROFESSIONAL-TAX-RETURN") ||
             text.includes("professional tax return") || text.includes("professional-tax-return");
    case "partnership-compliance":
      return ticketId.startsWith("PARTNERSHIP-COMPLIANCE_") || ticketId.includes("PARTNERSHIP-COMPLIANCE") ||
             text.includes("partnership compliance") || text.includes("partnership-compliance");
    case "proprietorship-compliance":
      return ticketId.startsWith("PROPRIETORSHIP-COMPLIANCE_") || ticketId.includes("PROPRIETORSHIP-COMPLIANCE") ||
             text.includes("proprietorship compliance") || text.includes("proprietorship-compliance");
    case "company-compliance":
      return ticketId.startsWith("COMPANY-COMPLIANCE_") || ticketId.includes("COMPANY-COMPLIANCE") ||
             text.includes("company compliance") || text.includes("company-compliance");
    case "trademark":
      return ticketId.startsWith("TRADEMARK_") || ticketId.includes("TRADEMARK") ||
             text.includes("trademark");
    // Tax & Accounting Services
    case "salary-itr":
      return ticketId.startsWith("SALARY-ITR_") || ticketId.includes("SALARY-ITR") ||
             text.includes("salary itr") || text.includes("income tax return salary");
    case "business-itr":
      return ticketId.startsWith("BUSINESS-ITR_") || ticketId.includes("BUSINESS-ITR") ||
             text.includes("business itr") || text.includes("business income tax");
    case "house-property-itr":
      return ticketId.startsWith("HOUSE-PROPERTY-ITR_") || ticketId.includes("HOUSE-PROPERTY-ITR") ||
             text.includes("house property itr") || text.includes("house-property-itr");
    case "trust-itr":
      return ticketId.startsWith("TRUST-ITR_") || ticketId.includes("TRUST-ITR") ||
             text.includes("trust itr") || text.includes("trust-itr");
    case "salary-hp-capital-gains":
      return ticketId.startsWith("SALARY-HP-CAPITAL-GAINS_") || ticketId.includes("SALARY-HP-CAPITAL-GAINS") ||
             text.includes("salary hp capital") || text.includes("salary-hp-capital-gains");
    case "partnership-firm-itr":
      return ticketId.startsWith("PARTNERSHIP-FIRM-ITR_") || ticketId.includes("PARTNERSHIP-FIRM-ITR") ||
             text.includes("partnership firm itr") || text.includes("partnership-firm-itr");
    case "company-itr":
      return ticketId.startsWith("COMPANY-ITR_") || ticketId.includes("COMPANY-ITR") ||
             text.includes("company itr") || text.includes("company-itr");
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
        // Use unified registrations endpoint
        const response = await apiClient.get('/registrations');
        const res = response.success ? response : { success: false, data: [] };
        const allRegs = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        
        console.log('📋 Fetched registrations:', allRegs.length);
        
        // Filter to only paid registrations
        const paidRegs = allRegs.filter(reg => 
          (reg.razorpay_payment_id && String(reg.razorpay_payment_id).trim() !== '') ||
          (reg.payment_id && String(reg.payment_id).trim() !== '') ||
          (reg.payment_status && String(reg.payment_status).toLowerCase() === 'paid')
        );
        
        // If type is valid and in typeLabels, filter by type. Otherwise show all.
        let filtered;
        if (type && typeLabels[type]) {
          filtered = paidRegs.filter((reg) => {
            const matches = matchesType(reg, type);
            return matches;
          });
          console.log(`✅ Filtered to ${filtered.length} registrations for type: ${type}`);
        } else {
          // If type is not recognized, show all paid registrations
          console.log(`⚠️ Unknown type "${type}", showing all ${paidRegs.length} registrations`);
          filtered = paidRegs;
        }
        
        // Sort by created_at desc
        filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || a.updated_at || 0);
          const dateB = new Date(b.created_at || b.updated_at || 0);
          return dateB - dateA;
        });
        
        setRegistrations(filtered);
      } catch (err) {
        console.error('❌ Error fetching registrations:', err);
        setError(err.message || "Failed to load registrations");
        setRegistrations([]);
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
            {registrations.map((reg) => {
              const formatDate = (dateString) => {
                if (!dateString) return "N/A";
                const d = new Date(dateString);
                if (isNaN(d.getTime())) return "N/A";
                return d.toLocaleString("en-IN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                });
              };
              
              return (
                <div key={reg.ticket_id || reg.id} className="bg-white rounded-xl shadow p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Ticket ID</div>
                      <div className="font-semibold text-gray-900 mb-4">{reg.ticket_id || "—"}</div>
                      
                      <div className="text-sm text-gray-500 mb-1">Package</div>
                      <div className="text-gray-900 mb-4">
                        {reg.package_name || `${label} Registration`}{" "}
                        {reg.package_price ? (
                          <span className="text-green-600 font-semibold">₹{Number(reg.package_price).toLocaleString("en-IN")}</span>
                        ) : null}
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-1">Payment Status</div>
                      <div className="text-gray-900 capitalize mb-4">{reg.payment_status || "paid"}</div>
                      
                      {reg.created_at && (
                        <>
                          <div className="text-sm text-gray-500 mb-1">Payment Date</div>
                          <div className="text-gray-900 mb-4">{formatDate(reg.created_at)}</div>
                        </>
                      )}
                    </div>
                    <div>
                      {reg.razorpay_payment_id && (
                        <>
                          <div className="text-sm text-gray-500 mb-1">Payment ID</div>
                          <div className="text-gray-900 mb-4">{reg.razorpay_payment_id}</div>
                        </>
                      )}
                      {reg.razorpay_order_id && (
                        <>
                          <div className="text-sm text-gray-500 mb-1">Order ID</div>
                          <div className="text-gray-900 mb-4">{reg.razorpay_order_id}</div>
                        </>
                      )}
                      {reg.service_status && (
                        <>
                          <div className="text-sm text-gray-500 mb-1">Service Status</div>
                          <div className="text-gray-900 font-medium">{reg.service_status}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceRegistrations;

