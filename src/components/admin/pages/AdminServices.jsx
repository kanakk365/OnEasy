import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api";
import { initPaymentWithOrderId } from "../../../utils/payment";
import {
  FiSearch,
  FiFilter,
  FiBriefcase,
  FiMoreVertical,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiCreditCard,
  FiLink,
  FiX,
} from "react-icons/fi";

function AdminServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [serviceFilters, setServiceFilters] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [progressFilters, setProgressFilters] = useState([]);

  // Filter dropdown visibility
  const [showServiceFilterMenu, setShowServiceFilterMenu] = useState(false);
  const [showStatusFilterMenu, setShowStatusFilterMenu] = useState(false);
  const [showProgressFilterMenu, setShowProgressFilterMenu] = useState(false);

  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    dateOfPayment: "",
    person: "",
    remark: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchServices();
    fetchAllClients();
  }, []);

  const fetchAllClients = async () => {
    try {
      const response = await apiClient.get("/admin/clients");
      if (response.success && response.data) {
        // Extract unique client names from all clients
        const clientNames = Array.from(
          new Set(
            response.data
              .map((client) => client.name || client.email || null)
              .filter((name) => name !== null)
          )
        ).sort();
        setAllClients(clientNames);
      }
    } catch (error) {
      console.error("Error fetching all clients:", error);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    clientFilter,
    serviceFilters,
    statusFilters,
    progressFilters,
  ]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/services");
      if (response.success) {
        setServices(response.data || []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      let date;
      if (typeof dateString === "string") {
        if (
          dateString.includes(" ") &&
          !dateString.includes("Z") &&
          !dateString.includes("+") &&
          !dateString.match(/[+-]\d{2}:\d{2}$/)
        ) {
          const isoString = dateString.replace(" ", "T");
          date = new Date(isoString + "Z");
        } else if (
          dateString.includes("T") &&
          !dateString.includes("Z") &&
          !dateString.includes("+") &&
          !dateString.match(/[+-]\d{2}:\d{2}$/)
        ) {
          date = new Date(dateString + "Z");
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return "-";

      const datePart = date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      });

      const timePart = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

      return `${datePart}, ${timePart}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const getStatusLabel = useCallback((svc) => {
    return paymentStatusToDisplay(svc.payment_status);
  }, []);

  const getProgressLabel = useCallback((svc) => {
    return svc.service_status && svc.service_status.trim() !== ""
      ? svc.service_status
      : "";
  }, []);

  const deriveServiceFromTicket = useCallback((ticketId) => {
    if (!ticketId) return null;
    if (ticketId.startsWith("PVT_")) return "Private Limited Registration";
    if (ticketId.startsWith("OPC_")) return "OPC Registration";
    if (ticketId.startsWith("LLP_")) return "LLP Registration";
    if (ticketId.startsWith("PART_") || ticketId.startsWith("PARTNERSHIP_"))
      return "Partnership Registration";
    if (ticketId.startsWith("SEC8_") || ticketId.startsWith("SECTION8_"))
      return "Section 8 Registration";
    if (ticketId.startsWith("PLC_")) return "Public Limited Company";
    if (
      ticketId.startsWith("INDSUB_") ||
      ticketId.startsWith("INDIAN_") ||
      ticketId.startsWith("SUBSIDIARY_")
    )
      return "Indian Subsidiary Company";
    if (ticketId.startsWith("PROP_")) return "Proprietorship Registration";
    if (ticketId.startsWith("SI_") || ticketId.startsWith("STARTUP_"))
      return "Startup India Registration";
    if (ticketId.startsWith("MCA_")) return "MCA Name Approval";
    if (ticketId.startsWith("PTX_")) return "Professional Tax Registration";
    if (ticketId.startsWith("LAB_")) return "Labour License Registration";
    if (ticketId.startsWith("UDYAM_")) return "Udyam Registration / MSME";
    if (ticketId.startsWith("FSSAI_")) return "FSSAI / Food license";
    if (ticketId.startsWith("TL_")) return "Trade License";
    if (ticketId.startsWith("ESI_"))
      return "Employee State Insurance (ESI) Registration";
    if (ticketId.startsWith("GST_")) return "GST Registration";
    if (ticketId.startsWith("IEC_"))
      return "Import Export Code (IEC) Registration";
    if (ticketId.startsWith("LUT_")) return "Letter of Undertaking";
    if (ticketId.startsWith("DSC_")) return "Digital Signature";
    if (ticketId.startsWith("12A_")) return "12A Registration";
    if (ticketId.startsWith("80G_")) return "80G Registration";
    return null;
  }, []);

  const isTier = useCallback(
    (name) =>
      ["starter", "growth", "pro", "basic"].includes(
        (name || "").toLowerCase()
      ),
    []
  );

  const CANONICAL_SERVICES = useMemo(
    () => [
      "Private Limited Company",
      "One Person Company",
      "Proprietorship",
      "Limited Liability Partnership",
      "Partnership Firm",
      "Section 8 Company",
      "Public Limited Company",
      "MCA Name Approval",
      "Indian Subsidiary Company",
      "Start - Up India Certificate",
      "Professional Tax Registration",
      "Labour License Registration",
      "Provident Fund Registration",
      "GST Registration",
      "Udyam Registration",
      "FSSAI / Food license",
      "Trade License",
      "Import Export Code (IEC) Registration",
      "Letter of Undertaking",
      "Employee State Insurance (ESI) Registration",
      "Digital Signature Certificate",
      "12A Registration",
      "80G Registration",
      "GST Returns",
      "GST Annual Return Filing",
      "GST Amendment",
      "GST Notice",
      "Director Addition",
      "Share Transfer",
      "Address Change (Registered Office Change)",
      "Charge Creation",
      "Director Removal",
      "MOA Amendment",
      "AOA Amendment",
      "Change In Objects clause",
      "Increase in Share Capital",
      "Name Change - Company",
      "DIN Deactivation",
      "DIN Reactivation",
      "ADT-1",
      "Winding Up - Company",
      "Winding Up - LLP",
      "DIN Application - MCA",
      "INC 20A - MCA",
      "FSSAI Renewal",
      "FSSAI Return Filing",
      "Business Plan",
      "HR & Payroll Service",
      "PF Return Filing",
      "ESI Return Filing",
      "Professional Tax Return Filing",
      "Partnership Compliance",
      "Proprietorship Compliance",
      "Company Compliance",
      "Trademark",
      "Income Tax Return - Salary",
      "Business - Income Tax Return",
      "House Property - Income Tax Return",
      "Trust - Income Tax Return",
      "Income From Salary, HP and Capital gains",
      "Partnership Firm - ITR",
      "Company - ITR",
    ],
    []
  );

  const normalizeService = useCallback((text) => {
    if (!text) return null;
    const lower = text.toLowerCase();

    if (lower.includes("private limited")) return "Private Limited Company";
    if (lower.includes("opc") || lower.includes("one person company"))
      return "One Person Company";
    if (lower.includes("propriet")) return "Proprietorship";
    if (
      lower.includes("partnership firm") ||
      (lower.includes("partnership") && !lower.includes("llp"))
    )
      return "Partnership Firm";
    if (
      lower.includes("llp") ||
      lower.includes("limited liability partnership")
    )
      return "Limited Liability Partnership";
    if (lower.includes("section 8") || lower.includes("sec 8"))
      return "Section 8 Company";
    if (lower.includes("public limited")) return "Public Limited Company";
    if (lower.includes("indian subsidiary") || lower.includes("subsidiary"))
      return "Indian Subsidiary Company";
    if (lower.includes("mca name")) return "MCA Name Approval";
    if (lower.includes("startup india") || lower.includes("start-up india"))
      return "Startup India Registration";
    if (lower.includes("gst returns")) return "GST Returns";
    if (lower.includes("gst annual return")) return "GST Annual Return Filing";
    if (lower.includes("gst amendment")) return "GST Amendment";
    if (lower.includes("gst notice")) return "GST Notice";
    if (
      lower.includes("gst registration") ||
      (lower.includes("gst") &&
        !lower.includes("return") &&
        !lower.includes("amendment") &&
        !lower.includes("notice") &&
        !lower.includes("lut"))
    )
      return "GST Registration";
    if (lower.includes("letter of undertaking") || lower.includes("lut"))
      return "Letter of Undertaking";
    if (lower.includes("director addition")) return "Director Addition";
    if (lower.includes("share transfer")) return "Share Transfer";
    if (
      lower.includes("address change") ||
      lower.includes("registered office change")
    )
      return "Address Change (Registered Office Change)";
    if (lower.includes("charge creation")) return "Charge Creation";
    if (lower.includes("director removal")) return "Director Removal";
    if (lower.includes("moa amendment")) return "MOA Amendment";
    if (lower.includes("aoa amendment")) return "AOA Amendment";
    if (lower.includes("objects clause") || lower.includes("change in objects"))
      return "Change In Objects clause";
    if (
      lower.includes("increase share capital") ||
      lower.includes("increase in share capital")
    )
      return "Increase in Share Capital";
    if (lower.includes("name change company")) return "Name Change - Company";
    if (lower.includes("din deactivation")) return "DIN Deactivation";
    if (lower.includes("din reactivation")) return "DIN Reactivation";
    if (lower.includes("adt-1") || lower.includes("adt 1")) return "ADT-1";
    if (lower.includes("winding up company")) return "Winding Up - Company";
    if (lower.includes("winding up llp")) return "Winding Up - LLP";
    if (lower.includes("din application")) return "DIN Application - MCA";
    if (lower.includes("inc-20a") || lower.includes("inc 20a"))
      return "INC 20A - MCA";
    if (lower.includes("professional tax return"))
      return "Professional Tax Return Filing";
    if (lower.includes("professional tax"))
      return "Professional Tax Registration";
    if (lower.includes("labour license") || lower.includes("labour licence"))
      return "Labour License Registration";
    if (lower.includes("udyam") || lower.includes("msme"))
      return "Udyam Registration";
    if (lower.includes("fssai return")) return "FSSAI Return Filing";
    if (lower.includes("fssai renewal")) return "FSSAI Renewal";
    if (lower.includes("fssai") || lower.includes("food license"))
      return "FSSAI / Food license";
    if (lower.includes("trade license")) return "Trade License";
    if (lower.includes("esi return")) return "ESI Return Filing";
    if (lower.includes("esi") || lower.includes("employee state insurance"))
      return "Employee State Insurance (ESI) Registration";
    if (lower.includes("pf return") || lower.includes("provident fund return"))
      return "PF Return Filing";
    if (lower.includes("provident fund")) return "Provident Fund Registration";
    if (lower.includes("business plan")) return "Business Plan";
    if (lower.includes("hr payroll") || lower.includes("hr & payroll"))
      return "HR & Payroll Service";
    if (lower.includes("partnership compliance"))
      return "Partnership Compliance";
    if (lower.includes("proprietorship compliance"))
      return "Proprietorship Compliance";
    if (lower.includes("company compliance")) return "Company Compliance";
    if (lower.includes("trademark")) return "Trademark";
    if (lower.includes("import export") || lower.includes("iec"))
      return "Import Export Code (IEC) Registration";
    if (lower.includes("digital signature") || lower.includes("dsc"))
      return "Digital Signature Certificate";
    if (lower.includes("12a")) return "12A Registration";
    if (lower.includes("80g")) return "80G Registration";
    if (lower.includes("salary itr")) return "Income Tax Return - Salary";
    if (lower.includes("business itr")) return "Business - Income Tax Return";
    if (lower.includes("house property itr"))
      return "House Property - Income Tax Return";
    if (lower.includes("trust itr")) return "Trust - Income Tax Return";
    if (lower.includes("salary hp capital"))
      return "Income From Salary, HP and Capital gains";
    if (lower.includes("partnership firm itr")) return "Partnership Firm - ITR";
    if (lower.includes("company itr")) return "Company - ITR";

    return null;
  }, []);

  const getServiceName = useCallback(
    (svc) => {
      const ticketDerivedService = svc.ticket_id
        ? deriveServiceFromTicket(svc.ticket_id)
        : null;
      const normalizedTicketService = ticketDerivedService
        ? normalizeService(ticketDerivedService)
        : null;

      const packageNameNormalized = svc.package_name
        ? normalizeService(svc.package_name)
        : null;
      const packageNameLower = (svc.package_name || "").toLowerCase();
      const isPackageMismatch =
        (packageNameLower.includes("private limited registration") ||
          packageNameNormalized === "Private Limited Company") &&
        ticketDerivedService &&
        (ticketDerivedService.includes("Startup India") ||
          ticketDerivedService.includes("GST") ||
          ticketDerivedService.includes("Proprietorship"));

      const inferred =
        normalizeService(svc.service_name) ||
        normalizeService(svc.registration_type) ||
        normalizeService(svc.service_type) ||
        normalizedTicketService ||
        normalizeService(svc.business_name);

      if (isTier(svc.package_name))
        return inferred || normalizedTicketService || "Other";
      if (isPackageMismatch)
        return normalizedTicketService || inferred || "Other";

      return (
        inferred || packageNameNormalized || normalizedTicketService || "Other"
      );
    },
    [deriveServiceFromTicket, isTier, normalizeService]
  );

  const getServiceLabel = useCallback(
    (svc) => getServiceName(svc),
    [getServiceName]
  );

  const clientsList = useMemo(() => {
    // Combine clients from allClients (all clients) and services (clients with services)
    const clientsFromServices = Array.from(
      new Set(
        services.map(
          (s) => s.name || s.legal_name || s.client_name || s.email || "-"
        )
      )
    );
    
    // Merge both lists and remove duplicates
    const allClientsList = Array.from(
      new Set([...allClients, ...clientsFromServices])
    ).filter((name) => name !== "-"); // Remove "-" placeholder
    
    return allClientsList.sort(); // Sort alphabetically
  }, [services, allClients]);

  const servicesList = useMemo(() => {
    const hasOther = services.some((s) => getServiceLabel(s) === "Other");
    const allServices = hasOther
      ? [...CANONICAL_SERVICES, "Other"]
      : [...CANONICAL_SERVICES];
    return [...new Set(allServices)];
  }, [services, getServiceLabel, CANONICAL_SERVICES]);

  const PAYMENT_STATUS_OPTIONS = [
    "Paid",
    "Partially Paid",
    "Pay later",
    "Open to Pay",
  ];
  const WORK_STATUS_OPTIONS = [
    "Data Received",
    "Awaiting Data",
    "WIP",
    "Data Pending from the client",
    "Awaiting response from the Government",
    "Under Review",
    "Completed",
  ];
  const paymentStatusToDisplay = (dbValue) => {
    if (!dbValue) return "Open to Pay";
    const v = String(dbValue).toLowerCase().replace(/_/g, " ");
    const map = {
      paid: "Paid",
      partially_paid: "Partially Paid",
      "pay later": "Pay later",
      "open to pay": "Open to Pay",
      pending: "Open to Pay",
      unpaid: "Open to Pay",
    };
    return map[v] || PAYMENT_STATUS_OPTIONS.find((o) => o.toLowerCase().replace(/\s/g, "") === v.replace(/\s/g, "")) || dbValue;
  };
  const paymentDisplayToDb = (display) => {
    const map = { Paid: "paid", "Partially Paid": "partially_paid", "Pay later": "pay_later", "Open to Pay": "open_to_pay" };
    return map[display] || display;
  };

  const toggleFromArray = (value, listSetter) => {
    listSetter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleWorkStatusUpdate = async (svc, newWorkStatus) => {
    try {
      if (!svc.ticket_id) return;
      await performStatusUpdate(svc, newWorkStatus, null, null, null);
    } catch (error) {
      console.error("Error updating work status:", error);
      alert("Failed to update work status: " + (error.message || "Unknown error"));
    }
  };

  const handlePaymentStatusUpdate = async (svc, newPaymentStatusDisplay) => {
    try {
      if (!svc.ticket_id) return;
      await performStatusUpdate(svc, null, null, null, newPaymentStatusDisplay);
    } catch (error) {
      console.error("Error updating payment status:", error);
      if (error.response?.data?.requiresPaymentMethod) {
        setPendingStatusUpdate({ svc, newPaymentStatus: newPaymentStatusDisplay });
        setShowPaymentMethodDialog(true);
      } else {
        alert("Failed to update payment status: " + (error.message || "Unknown error"));
      }
    }
  };

  const handlePaymentMethodSelection = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    // Don't close the dialog, show the form instead
  };

  const handlePaymentFormSubmit = async () => {
    if (!pendingStatusUpdate || !selectedPaymentMethod) return;
    if (!paymentFormData.dateOfPayment || !paymentFormData.person) {
      alert("Please fill in Date of Payment and Person fields");
      return;
    }
    const { svc, newStatus, newPaymentStatus } = pendingStatusUpdate;
    try {
      await performStatusUpdate(
        svc,
        newStatus || null,
        selectedPaymentMethod,
        paymentFormData,
        newPaymentStatus || null
      );
      setShowPaymentMethodDialog(false);
      setPendingStatusUpdate(null);
      setSelectedPaymentMethod(null);
      setPaymentFormData({ dateOfPayment: "", person: "", remark: "" });
    } catch (error) {
      console.error("Error updating status with payment method:", error);
      alert("Failed to update: " + (error.message || "Unknown error"));
    }
  };

  const performStatusUpdate = async (svc, newStatus, paymentMethod, paymentDetails = null, paymentStatusDisplay = null) => {
    try {
      const payload = {
        ticketId: svc.ticket_id,
        ...(newStatus != null && newStatus !== "" && { status: newStatus }),
        ...(paymentStatusDisplay != null && paymentStatusDisplay !== "" && { paymentStatus: paymentStatusDisplay }),
        ...(paymentMethod && { paymentMethod }),
        ...(paymentDetails && {
          dateOfPayment: paymentDetails.dateOfPayment,
          person: paymentDetails.person,
          remark: paymentDetails.remark,
        }),
      };
      const response = await apiClient.post("/admin/update-service-status", payload);

      if (response.success) {
        setServices((prev) =>
          prev.map((item) => {
            if (item.ticket_id !== svc.ticket_id) return item;
            const next = { ...item };
            if (newStatus != null && newStatus !== "") next.service_status = newStatus;
            if (paymentStatusDisplay != null && paymentStatusDisplay !== "") next.payment_status = paymentDisplayToDb(paymentStatusDisplay);
            return next;
          })
        );
        setTimeout(() => fetchServices(), 500);
        return;
      }
      if (response.requiresPaymentMethod) {
        setPendingStatusUpdate(paymentStatusDisplay ? { svc, newPaymentStatus: paymentStatusDisplay } : { svc, newStatus });
        setShowPaymentMethodDialog(true);
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (error) {
      if (error.response?.data?.requiresPaymentMethod) {
        setPendingStatusUpdate(paymentStatusDisplay ? { svc, newPaymentStatus: paymentStatusDisplay } : { svc, newStatus });
        setShowPaymentMethodDialog(true);
      } else {
        throw error;
      }
    }
  };

  const handleDeleteService = async (svc) => {
    if (!svc.ticket_id) return;
    const serviceName = getServiceLabel(svc);
    if (
      !window.confirm(
        `Are you sure you want to permanently delete this service?\n\nService: ${serviceName}\nTicket ID: ${svc.ticket_id}\n\nThis action cannot be undone.`
      )
    )
      return;

    try {
      const response = await apiClient.delete("/admin/delete-service", {
        body: JSON.stringify({ ticketId: svc.ticket_id }),
      });
      if (response.success) {
        setServices((prev) =>
          prev.filter((item) => item.ticket_id !== svc.ticket_id)
        );
        setTimeout(async () => {
          await fetchServices();
        }, 300);
      } else {
        throw new Error(response.message || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  const getRegistrationTypeSlug = useCallback((ticketId) => {
    if (!ticketId) return null;
    const tid = ticketId.toString().toUpperCase();
    if (tid.startsWith("PVT_")) return "private-limited";
    if (tid.startsWith("PROP_")) return "proprietorship";
    if (tid.startsWith("SI_") || tid.startsWith("STARTUP_"))
      return "startup-india";
    if (tid.startsWith("GST_")) return "gst";
    return null;
  }, []);

  const handlePayClick = async (svc) => {
    try {
      const orderId = svc.razorpay_order_id || svc.order_id;
      if (!orderId) {
        alert("Order ID not found");
        return;
      }
      const amount = svc.package_price || svc.amount || 0;
      await initPaymentWithOrderId(orderId, amount, {
        ticket_id: svc.ticket_id || "",
        registration_type: getRegistrationTypeSlug(svc.ticket_id),
        package_name: svc.package_name || getServiceLabel(svc),
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message || "Failed to initiate payment");
    }
  };

  const handleCopyLinkClick = async (svc) => {
    try {
      if (!svc.payment_link && !svc.razorpay_order_id && !svc.order_id) {
        alert("No payment link available");
        return;
      }
      const paymentUrl =
        svc.payment_link ||
        (() => {
          const frontendUrl = window.location.origin;
          const orderId = svc.razorpay_order_id || svc.order_id;
          const registrationType = getRegistrationTypeSlug(svc.ticket_id);
          return `${frontendUrl}/payment?orderId=${orderId}&ticketId=${
            svc.ticket_id || ""
          }&userId=${svc.user_id || ""}&type=${
            registrationType || "service"
          }&autoOpen=true`;
        })();
      await navigator.clipboard.writeText(paymentUrl);
      alert("Payment link copied to clipboard!");
    } catch (error) {
      console.error("Error copying link:", error);
      alert("Failed to copy link");
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const paymentStatusDisplay = getStatusLabel(svc);
      const workStatus = (svc.service_status || "").trim();
      const serviceName = getServiceLabel(svc);
      const clientName =
        svc.name || svc.legal_name || svc.client_name || svc.email || "-";
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        clientName.toLowerCase().includes(searchLower) ||
        serviceName.toLowerCase().includes(searchLower) ||
        (svc.ticket_id && svc.ticket_id.toLowerCase().includes(searchLower));

      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(paymentStatusDisplay);

      const matchesService =
        serviceFilters.length === 0 ||
        serviceFilters.includes(serviceName);

      const matchesProgress =
        progressFilters.length === 0 || progressFilters.includes(workStatus);

      return (
        matchesSearch &&
        (clientFilter ? clientName === clientFilter : true) &&
        matchesService &&
        matchesStatus &&
        matchesProgress
      );
    });
  }, [
    services,
    searchTerm,
    clientFilter,
    serviceFilters,
    statusFilters,
    progressFilters,
    getServiceLabel,
    getStatusLabel,
    getProgressLabel,
  ]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
            }}
          >
            <FiBriefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Services
            </h1>
            <p className="text-gray-500 italic ml-1">
              Manage all client services and registrations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchServices}
            className="p-2.5 text-[#00486D] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent text-sm w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D] appearance-none"
          >
            <option value="">All Clients</option>
            {clientsList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
        {/* Services multi-select */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowServiceFilterMenu((v) => !v)}
            className="w-full flex items-center justify-between pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          >
            <span className="truncate">
              {serviceFilters.length === 0
                ? "All Services"
                : `${serviceFilters.length} service${
                    serviceFilters.length > 1 ? "s" : ""
                  } selected`}
            </span>
            <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </button>
          {showServiceFilterMenu && (
            <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
              <button
                type="button"
                onClick={() => setServiceFilters([])}
                className="mb-2 text-xs text-blue-600 hover:underline"
              >
                Clear selection
              </button>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {servicesList.map((s, i) => (
                  <label
                    key={`${s}-${i}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#00486D] focus:ring-[#00486D]"
                      checked={serviceFilters.includes(s)}
                      onChange={() => toggleFromArray(s, setServiceFilters)}
                    />
                    <span className="truncate">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status multi-select */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusFilterMenu((v) => !v)}
            className="w-full flex items-center justify-between pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          >
            <span className="truncate">
              {statusFilters.length === 0
                ? "All Statuses"
                : `${statusFilters.length} status${
                    statusFilters.length > 1 ? "es" : ""
                  } selected`}
            </span>
            <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </button>
          {showStatusFilterMenu && (
            <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
              <button
                type="button"
                onClick={() => setStatusFilters([])}
                className="mb-2 text-xs text-blue-600 hover:underline"
              >
                Clear selection
              </button>
              <div className="space-y-1">
                {PAYMENT_STATUS_OPTIONS.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#00486D] focus:ring-[#00486D]"
                      checked={statusFilters.includes(s)}
                      onChange={() => toggleFromArray(s, setStatusFilters)}
                    />
                    <span className="truncate">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Work status multi-select */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProgressFilterMenu((v) => !v)}
            className="w-full flex items-center justify-between pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          >
            <span className="truncate">
              {progressFilters.length === 0
                ? "All Work status"
                : `${progressFilters.length} selected`}
            </span>
            <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </button>
          {showProgressFilterMenu && (
            <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
              <button
                type="button"
                onClick={() => setProgressFilters([])}
                className="mb-2 text-xs text-blue-600 hover:underline"
              >
                Clear selection
              </button>
              <div className="space-y-1">
                {WORK_STATUS_OPTIONS.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#00486D] focus:ring-[#00486D]"
                      checked={progressFilters.includes(p)}
                      onChange={() => toggleFromArray(p, setProgressFilters)}
                    />
                    <span className="truncate">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#00486D]">
            <FiBriefcase className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">All Services</h2>
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            {filteredServices.length}
          </span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            No services found matching your criteria
          </div>
        ) : (
          <div className="p-4 md:p-6">
            <div className="bg-[#f5f5f5] rounded-xl overflow-hidden">
              <div className="overflow-hidden">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="text-white">
                      <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-medium bg-[#00486D] rounded-l-xl">
                        Client
                      </th>
                      <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-medium bg-[#00486D]">
                        Phone
                      </th>
                      <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-medium bg-[#00486D]">
                        Service
                      </th>
                      <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-medium bg-[#00486D]">
                        Payment Status
                      </th>
                      <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-medium bg-[#00486D]">
                        Work status
                      </th>
                      <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-medium bg-[#00486D] hidden lg:table-cell">
                        Updated
                      </th>
                      <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-medium bg-[#00486D]">
                        Action
                      </th>
                      <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-medium bg-[#00486D] rounded-r-xl">
                        Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentServices.map((svc, index) => (
                      <tr
                        key={`${svc.ticket_id || svc.order_id || index}`}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-2 md:px-3 lg:px-4 py-3">
                          <div className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[120px] md:max-w-[150px]" title={svc.name || svc.legal_name || "-"}>
                            {svc.name || svc.legal_name || "-"}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px] md:max-w-[150px]" title={svc.email || "No email"}>
                            {svc.email || "No email"}
                          </div>
                        </td>
                        <td className="px-2 md:px-3 lg:px-4 py-3 text-xs text-gray-600 font-mono">
                          {svc.phone || "-"}
                        </td>
                        <td
                          className="px-2 md:px-3 lg:px-4 py-3 text-xs text-gray-900 truncate max-w-[120px] md:max-w-[150px]"
                          title={getServiceLabel(svc)}
                        >
                          {getServiceLabel(svc)}
                        </td>
                        <td className="px-2 md:px-3 lg:px-4 py-3">
                          {svc.ticket_id ? (
                            <div className="relative">
                              <select
                                value={paymentStatusToDisplay(svc.payment_status)}
                                onChange={(e) =>
                                  handlePaymentStatusUpdate(svc, e.target.value)
                                }
                                className="w-full max-w-[140px] md:max-w-[160px] pl-1.5 md:pl-2 pr-5 md:pr-6 py-1 md:py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#00486D] appearance-none cursor-pointer"
                              >
                                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                  className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 md:px-3 lg:px-4 py-3">
                          {svc.ticket_id ? (
                            <div className="relative">
                              <select
                                value={svc.service_status || ""}
                                onChange={(e) =>
                                  handleWorkStatusUpdate(svc, e.target.value)
                                }
                                className="w-full max-w-[140px] md:max-w-[200px] pl-1.5 md:pl-2 pr-5 md:pr-6 py-1 md:py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#00486D] appearance-none cursor-pointer"
                              >
                                {[
                                  ...(svc.service_status && !WORK_STATUS_OPTIONS.includes(svc.service_status) ? [svc.service_status] : []),
                                  ...WORK_STATUS_OPTIONS,
                                ].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                  className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 md:px-3 lg:px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                          {formatDateTime(
                            svc.updated_at || svc.confirmed_at || svc.created_at
                          )}
                        </td>
                        <td className="px-2 md:px-3 lg:px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/client-overview/${
                                    svc.user_id || svc.id
                                  }?tab=services${
                                    svc.ticket_id
                                      ? `&ticketId=${svc.ticket_id}`
                                      : ""
                                  }`
                                )
                              }
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            {svc.ticket_id && (
                              <button
                                onClick={() => handleDeleteService(svc)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Service"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-2 md:px-3 lg:px-4 py-3">
                          <div className="flex items-center gap-1 md:gap-2">
                            {(() => {
                              const ps = (svc.payment_status || "").toLowerCase();
                              const needsPayment = ["pending", "unpaid", "open_to_pay", "pay_later"].includes(ps) || ps === "open to pay" || ps === "pay later";
                              return needsPayment && (svc.razorpay_order_id || svc.order_id);
                            })() && (
                                <>
                                  <button
                                    onClick={() => handlePayClick(svc)}
                                    className="p-1 md:p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Pay Now"
                                  >
                                    <FiCreditCard className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCopyLinkClick(svc)}
                                    className="p-1 md:p-1.5 text-[#00486D] hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Copy Link"
                                  >
                                    <FiLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredServices.length > itemsPerPage && (
                <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {String(indexOfFirstItem + 1).padStart(2, "0")} of{" "}
                    {filteredServices.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 py-1 rounded-lg bg-[#00486D] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#023752] transition-colors"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 py-1 rounded-lg bg-[#00486D] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#023752] transition-colors"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Method Dialog */}
      {showPaymentMethodDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPaymentMethod ? "Payment Details" : "Payment Method Required"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedPaymentMethod
                    ? "Please fill in the payment details below."
                    : "Please select how the payment was received."}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentMethodDialog(false);
                  setPendingStatusUpdate(null);
                  setSelectedPaymentMethod(null);
                  setPaymentFormData({
                    dateOfPayment: "",
                    person: "",
                    remark: "",
                  });
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {!selectedPaymentMethod ? (
              <>
                <div className="space-y-3">
                  <button
                    onClick={() => handlePaymentMethodSelection("cash")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-medium transition-colors"
                  >
                    Paid by Cash
                  </button>
                  <button
                    onClick={() => handlePaymentMethodSelection("other")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-medium transition-colors"
                  >
                    Paid by Other Source
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowPaymentMethodDialog(false);
                    setPendingStatusUpdate(null);
                  }}
                  className="mt-4 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPaymentMethod === "cash" ? "Paid by Cash" : "Paid by Other Source"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedPaymentMethod(null)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Change payment method
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Payment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.dateOfPayment}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        dateOfPayment: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.person}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        person: e.target.value,
                      })
                    }
                    placeholder="Enter person name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark
                  </label>
                  <textarea
                    value={paymentFormData.remark}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        remark: e.target.value,
                      })
                    }
                    placeholder="Enter any remarks (optional)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePaymentFormSubmit}
                    className="flex-1 px-4 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] font-medium transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentMethodDialog(false);
                      setPendingStatusUpdate(null);
                      setSelectedPaymentMethod(null);
                      setPaymentFormData({
                        dateOfPayment: "",
                        person: "",
                        remark: "",
                      });
                    }}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminServices;
