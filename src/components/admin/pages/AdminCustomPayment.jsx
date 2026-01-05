import React, { useState, useEffect } from "react";
import apiClient from "../../../utils/api";
import { validateCoupon } from "../../../utils/couponApi";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiCreditCard,
  FiCheckCircle,
  FiCopy,
  FiMail,
  FiClock,
  FiDollarSign,
  FiTag,
  FiFileText,
  FiLayers,
  FiAlertCircle,
  FiLink,
  FiRefreshCw,
} from "react-icons/fi";

function AdminCustomPayment() {
  const [activeTab, setActiveTab] = useState("generate"); // 'generate' or 'pending'
  const [step, setStep] = useState(1); // 1: Select User, 2: Select Service & Amount, 3: Payment Link
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingTicketId, setPendingTicketId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Service types for custom payment - use same 64 services as New Registration page
  const serviceTypes = [
    // Startup Services
    {
      id: "startup-india",
      name: "Startup India (DPIIT Recognition)",
      category: "Startup Services",
    },
    {
      id: "business-plan",
      name: "Business Plan",
      category: "Startup Services",
    },

    // Registration Services
    {
      id: "private-limited",
      name: "Private Limited Company",
      category: "Registration Services",
    },
    {
      id: "opc",
      name: "One Person Company",
      category: "Registration Services",
    },
    {
      id: "llp",
      name: "Limited Liability Partnership",
      category: "Registration Services",
    },
    {
      id: "partnership",
      name: "Partnership Firm",
      category: "Registration Services",
    },
    {
      id: "proprietorship",
      name: "Proprietorship Registration",
      category: "Registration Services",
    },
    {
      id: "section-8",
      name: "Section 8 Company",
      category: "Registration Services",
    },
    {
      id: "public-limited",
      name: "Public Limited Company",
      category: "Registration Services",
    },
    {
      id: "mca-name-approval",
      name: "MCA Name Approval",
      category: "Registration Services",
    },
    {
      id: "indian-subsidiary",
      name: "Indian Subsidiary",
      category: "Registration Services",
    },

    // Goods and Services Tax Services
    { id: "gst", name: "GST Registration", category: "GST Services" },
    {
      id: "gst-returns",
      name: "GST Monthly / Quarterly Returns",
      category: "GST Services",
    },
    {
      id: "gst-annual-return",
      name: "GST Annual Return",
      category: "GST Services",
    },
    { id: "gst-amendment", name: "GST Amendment", category: "GST Services" },
    {
      id: "gst-notice",
      name: "GST Notice / Scrutiny Reply",
      category: "GST Services",
    },
    { id: "lut", name: "GST LUT", category: "GST Services" },

    // ROC & MCA Services
    {
      id: "director-addition",
      name: "Director Addition",
      category: "ROC & MCA Services",
    },
    {
      id: "director-removal",
      name: "Director Removal",
      category: "ROC & MCA Services",
    },
    {
      id: "share-transfer",
      name: "Share Transfer",
      category: "ROC & MCA Services",
    },
    {
      id: "address-change",
      name: "Change of Registered Office Address",
      category: "ROC & MCA Services",
    },
    {
      id: "charge-creation",
      name: "Charge Creation / Modification / Satisfaction",
      category: "ROC & MCA Services",
    },
    {
      id: "moa-amendment",
      name: "MOA Amendment",
      category: "ROC & MCA Services",
    },
    {
      id: "aoa-amendment",
      name: "AOA Amendment",
      category: "ROC & MCA Services",
    },
    {
      id: "objects-change",
      name: "Change in Objects Clause",
      category: "ROC & MCA Services",
    },
    {
      id: "increase-share-capital",
      name: "Increase in Authorised Share Capital",
      category: "ROC & MCA Services",
    },
    {
      id: "company-name-change",
      name: "Company Name Change",
      category: "ROC & MCA Services",
    },
    {
      id: "din-deactivation",
      name: "DIN Deactivation",
      category: "ROC & MCA Services",
    },
    {
      id: "din-reactivation",
      name: "DIN Reactivation",
      category: "ROC & MCA Services",
    },
    {
      id: "adt-1",
      name: "ADT-1 (Appointment of Auditor)",
      category: "ROC & MCA Services",
    },
    {
      id: "inc-20a",
      name: "INC-20A (Commencement of Business)",
      category: "ROC & MCA Services",
    },
    {
      id: "winding-up-company",
      name: "Winding Up of Company",
      category: "ROC & MCA Services",
    },
    {
      id: "winding-up-llp",
      name: "Winding Up of LLP",
      category: "ROC & MCA Services",
    },
    {
      id: "din-application",
      name: "DIN Application",
      category: "ROC & MCA Services",
    },

    // Compliance Services
    {
      id: "company-compliance",
      name: "Company Annual Compliance",
      category: "Compliance Services",
    },
    {
      id: "llp-compliance",
      name: "LLP Annual Compliance",
      category: "Compliance Services",
    },
    {
      id: "partnership-compliance",
      name: "Partnership Firm Compliance",
      category: "Compliance Services",
    },
    {
      id: "proprietorship-compliance",
      name: "Proprietorship Compliance",
      category: "Compliance Services",
    },
    {
      id: "hr-payroll",
      name: "HR & Payroll Services",
      category: "Compliance Services",
    },

    // Tax & Accounting Services
    {
      id: "professional-tax",
      name: "Professional Tax Registration",
      category: "Tax & Accounting Services",
    },
    {
      id: "professional-tax-return",
      name: "Professional Tax Return Filing",
      category: "Tax & Accounting Services",
    },
    {
      id: "provident-fund",
      name: "Provident Fund Registration",
      category: "Tax & Accounting Services",
    },
    {
      id: "pf-return",
      name: "PF Return Filing",
      category: "Tax & Accounting Services",
    },
    {
      id: "esi",
      name: "ESI Registration",
      category: "Tax & Accounting Services",
    },
    {
      id: "esi-return",
      name: "ESI Return Filing",
      category: "Tax & Accounting Services",
    },
    {
      id: "bookkeeping",
      name: "Bookkeeping & Accounting",
      category: "Tax & Accounting Services",
    },

    // FSSAI & Other Licenses
    {
      id: "fssai",
      name: "FSSAI Registration / License",
      category: "Licenses & Registrations",
    },
    {
      id: "fssai-renewal",
      name: "FSSAI Renewal",
      category: "Licenses & Registrations",
    },
    {
      id: "fssai-return",
      name: "FSSAI Return Filing",
      category: "Licenses & Registrations",
    },
    {
      id: "trade-license",
      name: "Trade License",
      category: "Licenses & Registrations",
    },
    {
      id: "labour-license",
      name: "Labour License Registration",
      category: "Licenses & Registrations",
    },
    {
      id: "udyam",
      name: "Udyam / MSME Registration",
      category: "Licenses & Registrations",
    },
    {
      id: "iec",
      name: "Import Export Code (IEC)",
      category: "Licenses & Registrations",
    },
    {
      id: "dsc",
      name: "Digital Signature Certificate (DSC)",
      category: "Licenses & Registrations",
    },

    // Trust / NGO Registrations
    { id: "12a", name: "12A Registration", category: "Trust / NGO Services" },
    { id: "80g", name: "80G Registration", category: "Trust / NGO Services" },
    {
      id: "trust-registration",
      name: "Trust / Society / NGO Registration",
      category: "Trust / NGO Services",
    },

    // Income Tax Return Services
    {
      id: "salary-itr",
      name: "Salary ITR",
      category: "Income Tax Return Services",
    },
    {
      id: "business-itr",
      name: "Business ITR",
      category: "Income Tax Return Services",
    },
    {
      id: "house-property-itr",
      name: "House Property ITR",
      category: "Income Tax Return Services",
    },
    {
      id: "capital-gains-itr",
      name: "Salary + House Property + Capital Gains ITR",
      category: "Income Tax Return Services",
    },
    {
      id: "partnership-itr",
      name: "Partnership Firm ITR",
      category: "Income Tax Return Services",
    },
    {
      id: "company-itr",
      name: "Company ITR",
      category: "Income Tax Return Services",
    },
    {
      id: "trust-itr",
      name: "Trust / NGO ITR",
      category: "Income Tax Return Services",
    },

    // IP / Trademark Services
    {
      id: "trademark",
      name: "Trademark Registration",
      category: "IP & Trademark Services",
    },

    // Fallback / Misc
    { id: "custom", name: "Custom Service", category: "Other" },
  ];

  // Fetch users (using admin clients endpoint)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Reuse existing admin clients API which already returns all users
        const response = await apiClient.get("/admin/clients");
        if (response.success) {
          // Normalize clients data to simple user objects
          const normalized =
            (response.data || []).map((client) => ({
              id: client.user_id, // used later for userId
              name: client.name,
              email: client.email,
              phone: client.phone,
            })) || [];
          setUsers(normalized);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (step === 1 && activeTab === "generate") {
      fetchUsers();
    }
  }, [step, activeTab]);

  // Fetch pending payments
  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        setLoadingPending(true);
        const response = await apiClient.get(
          "/admin/registrations/pending-payments"
        );
        if (response.success) {
          setPendingPayments(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching pending payments:", error);
        alert("Failed to fetch pending payments. Please try again.");
      } finally {
        setLoadingPending(false);
      }
    };

    if (activeTab === "pending") {
      fetchPendingPayments();
    }
  }, [activeTab]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    );
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedUser(null);
      setSelectedService(null);
      setCustomAmount("");
      setDescription("");
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError("");
    } else if (step === 3) {
      setStep(2);
      setPaymentLink(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const amount = parseFloat(customAmount) || 0;
    if (amount <= 0) {
      setCouponError("Please enter a valid amount first");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    const result = await validateCoupon(couponCode, amount);

    setValidatingCoupon(false);

    if (result.valid) {
      setAppliedCoupon(result);
      setCouponError("");
    } else {
      setAppliedCoupon(null);
      setCouponError(result.message || "Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

  const calculateFinalPrice = () => {
    const amount = parseFloat(customAmount) || 0;
    if (appliedCoupon && appliedCoupon.valid) {
      return Math.round(appliedCoupon.finalAmount);
    }
    return amount;
  };

  const calculateDiscount = () => {
    if (appliedCoupon && appliedCoupon.valid) {
      return Math.round(appliedCoupon.discountAmount);
    }
    return 0;
  };

  const handleGeneratePaymentLink = async () => {
    if (!selectedUser || !selectedService || !customAmount) {
      alert("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setGeneratingLink(true);

      const finalPrice = calculateFinalPrice();
      const discountAmount = calculateDiscount();

      const response = await apiClient.post(
        "/admin/registrations/generate-payment-link",
        {
          userId: selectedUser.id,
          registrationType: selectedService.id,
          ticketId: pendingTicketId || null,
          packagePlan: {
            name: selectedService.name,
            price: finalPrice,
            priceValue: finalPrice,
            originalPrice: amount,
            discountAmount: discountAmount,
            discountPercentage: appliedCoupon?.discountPercentage || 0,
            couponCode: appliedCoupon ? couponCode.toUpperCase().trim() : null,
            description:
              description || `Custom payment for ${selectedService.name}`,
          },
        }
      );

      if (response.success) {
        setPaymentLink(response.data.paymentLink);
        setStep(3);
        setPendingTicketId(null);
      } else {
        alert(response.message || "Failed to generate payment link");
      }
    } catch (error) {
      console.error("Error generating payment link:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate payment link. Please try again."
      );
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleSendEmail = async () => {
    if (!paymentLink) {
      alert("Please generate payment link first");
      return;
    }

    try {
      setSendingEmail(true);

      const amount = parseFloat(customAmount) || 0;
      const finalPrice = calculateFinalPrice();
      const discountAmount = calculateDiscount();

      const response = await apiClient.post(
        "/admin/registrations/send-payment-link-email",
        {
          userId: selectedUser.id,
          userEmail: selectedUser.email,
          userName: selectedUser.name,
          registrationType: selectedService.id,
          packagePlan: {
            name: selectedService.name,
            price: finalPrice,
            priceValue: finalPrice,
            originalPrice: amount,
            discountAmount: discountAmount,
            discountPercentage: appliedCoupon?.discountPercentage || 0,
            description:
              description || `Custom payment for ${selectedService.name}`,
          },
          paymentLink: paymentLink,
        }
      );

      if (response.success) {
        alert(`✅ Payment link has been sent to ${selectedUser.email}`);
        // Reset form
        setStep(1);
        setSelectedUser(null);
        setSelectedService(null);
        setCustomAmount("");
        setDescription("");
        setCouponCode("");
        setAppliedCoupon(null);
        setPaymentLink(null);
        setPendingTicketId(null);
      } else {
        alert(response.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to send email. Please try again."
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      alert("Payment link copied to clipboard!");
    }
  };

  const handleGeneratePaymentForPending = async (pendingItem) => {
    // Take admin to Generate tab with pre-filled details so they can edit amount before generating link
    setActiveTab("generate");
    setStep(2);
    setSelectedUser({
      id: pendingItem.user_id,
      name: pendingItem.user_name,
      email: pendingItem.user_email,
    });
    setSelectedService({
      id: pendingItem.registration_type,
      name: pendingItem.service_name || pendingItem.registration_type,
    });
    setCustomAmount(
      String(pendingItem.package_price || pendingItem.amount || "0")
    );
    setDescription(
      `Custom payment for ${
        pendingItem.service_name || pendingItem.registration_type
      } (${pendingItem.ticket_id})`
    );
    setPendingTicketId(pendingItem.ticket_id);
  };

  const handleCollectCashForPending = async (pendingItem) => {
    if (
      !window.confirm(
        "Confirm that you have collected cash from the client and want to mark this payment as PAID?"
      )
    ) {
      return;
    }

    try {
      const offlinePaymentId = `CASH_${
        pendingItem.ticket_id || "UNKNOWN"
      }_${Date.now().toString().slice(-6)}`;

      const response = await apiClient.post(
        "/payment/update-payment-status",
        {
          payment_id: offlinePaymentId,
          order_id: pendingItem.razorpay_order_id || null,
          status: "paid",
          ticket_id: pendingItem.ticket_id,
          user_id: pendingItem.user_id,
          registration_type: pendingItem.registration_type,
        },
        {
          includeAuth: false, // public endpoint like PaymentSuccess
        }
      );

      if (response.success) {
        alert("✅ Cash collected and payment marked as paid successfully.");
        // Refresh pending list
        if (activeTab === "pending") {
          const idx = pendingPayments.findIndex(
            (p) => p.ticket_id === pendingItem.ticket_id
          );
          if (idx !== -1) {
            const updated = [...pendingPayments];
            updated.splice(idx, 1);
            setPendingPayments(updated);
          }
        }
      } else {
        alert(
          response.message ||
            "Failed to mark cash payment as paid. Please try again."
        );
      }
    } catch (error) {
      console.error("Error marking cash payment as paid:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to mark cash payment as paid. Please try again."
      );
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Custom Payment
          </h1>
          <p className="text-gray-500 italic ml-1">
            Generate payment links for any service with custom amounts
          </p>
        </div>

        {/* Tabs moved to Header */}
        <div className="flex p-1 bg-gray-100 rounded-xl inline-flex self-start md:self-auto">
          <button
            onClick={() => {
              setActiveTab("generate");
              setStep(1);
              setSelectedUser(null);
              setSelectedService(null);
              setPaymentLink(null);
              setPendingTicketId(null);
            }}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "generate"
                ? "bg-white shadow-sm text-[#01334C]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Generate Link
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "pending"
                ? "bg-white shadow-sm text-[#01334C]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending Payments
          </button>
        </div>
      </div>

      {/* Pending Payments Tab */}
      {activeTab === "pending" && (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
            >
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Payments
              </h2>
              <p className="text-sm text-gray-500">
                Manage pending registration payments
              </p>
            </div>
          </div>

          {loadingPending ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading pending payments...</p>
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              No pending payments found
            </div>
          ) : (
            <div className="p-6">
              <div className="p-4 bg-[#f5f5f5] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="text-white">
                        <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D] rounded-l-xl">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                          Service
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                          Package
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                          Ticket ID
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                          Created
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D] rounded-r-xl">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingPayments.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  background:
                                    "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                                }}
                              >
                                {item.user_name
                                  ? item.user_name.charAt(0).toUpperCase()
                                  : "U"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {item.user_name || "-"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.user_email || "-"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.service_name || item.registration_type || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.package_name || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-[#00486D]">
                            ₹
                            {parseFloat(
                              item.package_price || item.amount || 0
                            ).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                            {item.ticket_id || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() =>
                                  handleGeneratePaymentForPending(item)
                                }
                                disabled={generatingLink}
                                className="px-3 py-1.5 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                                style={{
                                  background:
                                    "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                                }}
                              >
                                {generatingLink
                                  ? "Generating..."
                                  : "Generate Link"}
                              </button>
                              <button
                                onClick={() =>
                                  handleCollectCashForPending(item)
                                }
                                className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                              >
                                Collect Cash
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Payment Link Tab */}
      {activeTab === "generate" && (
        <>
          {/* Step 1: Select User */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }}
                  >
                    <FiUsers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Select User
                    </h2>
                    <p className="text-sm text-gray-500">
                      Choose a client to send payment link to
                    </p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-12 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Users List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  {searchTerm
                    ? "No users found matching your search"
                    : "No users available"}
                </div>
              ) : (
                <div className="p-6">
                  <div className="p-4 bg-[#f5f5f5] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-separate border-spacing-0">
                        <thead>
                          <tr className="text-white">
                            <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D] rounded-l-xl">
                              User Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                              Phone
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-medium bg-[#00486D] rounded-r-xl">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {currentUsers.map((user) => (
                            <tr
                              key={user.id}
                              className="hover:bg-blue-50/50 transition-colors group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{
                                      background:
                                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                                    }}
                                  >
                                    {user.name
                                      ? user.name.charAt(0).toUpperCase()
                                      : "U"}
                                  </div>
                                  <span className="font-medium text-gray-900 group-hover:text-[#00486D] transition-colors">
                                    {user.name || "-"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {user.email || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {user.phone || "-"}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleUserSelect(user)}
                                  className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all hover:opacity-90 shadow-sm"
                                  style={{
                                    background:
                                      "linear-gradient(90deg, #022B51 0%, #015079 100%)",
                                  }}
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredUsers.length > itemsPerPage && (
                      <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Showing{" "}
                          {String(indexOfFirstItem + 1).padStart(2, "0")} of{" "}
                          {filteredUsers.length}
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
          )}

          {/* Step 2: Select Service & Amount */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }}
                  >
                    <FiCreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Payment Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      User:{" "}
                      <span className="font-medium text-gray-900">
                        {selectedUser?.name}
                      </span>{" "}
                      ({selectedUser?.email})
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 max-w-2xl mx-auto">
                {/* Service Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiLayers className="w-4 h-4 text-gray-400" /> Select
                    Service <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedService?.id || ""}
                      onChange={(e) => {
                        const service = serviceTypes.find(
                          (s) => s.id === e.target.value
                        );
                        setSelectedService(service || null);
                      }}
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent bg-white appearance-none"
                    >
                      <option value="">Select a service...</option>
                      {Array.from(
                        new Set(serviceTypes.map((s) => s.category))
                      ).map((category) => (
                        <optgroup key={category} label={category}>
                          {serviceTypes
                            .filter((s) => s.category === category)
                            .map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      <svg
                        className="w-5 h-5"
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
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4 text-gray-400" /> Amount
                    (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-gray-400" /> Description
                    (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter payment description..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                  />
                </div>

                {/* Coupon Code Section */}
                {customAmount && parseFloat(customAmount) > 0 && (
                  <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiTag className="w-4 h-4 text-gray-400" /> Coupon Code
                      (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                          if (appliedCoupon) {
                            setAppliedCoupon(null);
                          }
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent bg-white"
                        disabled={validatingCoupon || generatingLink}
                      />
                      {appliedCoupon ? (
                        <button
                          onClick={handleRemoveCoupon}
                          className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                          disabled={generatingLink}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyCoupon}
                          disabled={
                            validatingCoupon ||
                            !couponCode.trim() ||
                            generatingLink
                          }
                          className="px-5 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                        >
                          {validatingCoupon ? "Applying..." : "Apply"}
                        </button>
                      )}
                    </div>
                    {appliedCoupon && appliedCoupon.valid && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                        <FiCheckCircle className="w-4 h-4" />
                        Coupon applied! {appliedCoupon.discountPercentage}%
                        discount will be applied.
                      </div>
                    )}
                    {couponError && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                        <FiAlertCircle className="w-4 h-4" />
                        {couponError}
                      </div>
                    )}
                  </div>
                )}

                {/* Price Summary */}
                {customAmount && parseFloat(customAmount) > 0 && (
                  <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide">
                      Price Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Original Amount</span>
                        <span className="font-medium text-gray-900">
                          ₹
                          {parseFloat(customAmount || 0).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                      {appliedCoupon && appliedCoupon.valid && (
                        <>
                          <div className="flex justify-between items-center text-sm text-green-700">
                            <span>
                              Discount ({appliedCoupon.discountPercentage}%)
                            </span>
                            <span className="font-medium">
                              -₹{calculateDiscount().toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="h-px bg-blue-200 my-2"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-900 font-bold">
                              Final Amount
                            </span>
                            <span className="text-[#00486D] font-bold text-xl">
                              ₹{calculateFinalPrice().toLocaleString("en-IN")}
                            </span>
                          </div>
                        </>
                      )}
                      {!appliedCoupon && (
                        <>
                          <div className="h-px bg-blue-200 my-2"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-900 font-bold">
                              Final Amount
                            </span>
                            <span className="text-[#00486D] font-bold text-xl">
                              ₹
                              {parseFloat(customAmount || 0).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Generate Payment Link Button */}
                <button
                  onClick={handleGeneratePaymentLink}
                  disabled={
                    !selectedService ||
                    !customAmount ||
                    generatingLink ||
                    parseFloat(customAmount) <= 0
                  }
                  className="w-full px-6 py-3.5 text-white rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  style={{
                    background:
                      "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                  }}
                >
                  {generatingLink ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Payment Link"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Link Generated */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #059669 0%, #10B981 100%)",
                    }}
                  >
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Link Generated!
                    </h2>
                    <p className="text-sm text-gray-500">
                      Payment link is ready to share
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 max-w-2xl mx-auto text-center">
                <div className="mb-8">
                  <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Link Ready
                  </h3>
                  <p className="text-gray-500">
                    A payment link for{" "}
                    <span className="font-semibold text-gray-900">
                      ₹{calculateFinalPrice().toLocaleString("en-IN")}
                    </span>{" "}
                    has been generated for {selectedUser?.name}.
                  </p>
                </div>

                <div className="mb-6 text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiLink className="w-4 h-4 text-gray-400" /> Payment Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paymentLink}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
                    >
                      <FiCopy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="flex-1 px-6 py-3.5 text-white rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    style={{
                      background:
                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }}
                  >
                    {sendingEmail ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiMail className="w-4 h-4" /> Send Email to User
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleBack();
                      setStep(1);
                      setSelectedUser(null);
                      setSelectedService(null);
                      setPaymentLink(null);
                    }}
                    className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiRefreshCw className="w-4 h-4" /> Create Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminCustomPayment;
