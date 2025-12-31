import React, { useState, useEffect } from 'react';
import apiClient from '../../../utils/api';
import { validateCoupon } from '../../../utils/couponApi';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';

function AdminCustomPayment() {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'pending'
  const [step, setStep] = useState(1); // 1: Select User, 2: Select Service & Amount, 3: Payment Link
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [pendingTicketId, setPendingTicketId] = useState(null);

  // Service types for custom payment - use same 64 services as New Registration page
  const serviceTypes = [
    // Startup Services
    { id: 'startup-india', name: 'Startup India (DPIIT Recognition)', category: 'Startup Services' },
    { id: 'business-plan', name: 'Business Plan', category: 'Startup Services' },

    // Registration Services
    { id: 'private-limited', name: 'Private Limited Company', category: 'Registration Services' },
    { id: 'opc', name: 'One Person Company', category: 'Registration Services' },
    { id: 'llp', name: 'Limited Liability Partnership', category: 'Registration Services' },
    { id: 'partnership', name: 'Partnership Firm', category: 'Registration Services' },
    { id: 'proprietorship', name: 'Proprietorship Registration', category: 'Registration Services' },
    { id: 'section-8', name: 'Section 8 Company', category: 'Registration Services' },
    { id: 'public-limited', name: 'Public Limited Company', category: 'Registration Services' },
    { id: 'mca-name-approval', name: 'MCA Name Approval', category: 'Registration Services' },
    { id: 'indian-subsidiary', name: 'Indian Subsidiary', category: 'Registration Services' },

    // Goods and Services Tax Services
    { id: 'gst', name: 'GST Registration', category: 'GST Services' },
    { id: 'gst-returns', name: 'GST Monthly / Quarterly Returns', category: 'GST Services' },
    { id: 'gst-annual-return', name: 'GST Annual Return', category: 'GST Services' },
    { id: 'gst-amendment', name: 'GST Amendment', category: 'GST Services' },
    { id: 'gst-notice', name: 'GST Notice / Scrutiny Reply', category: 'GST Services' },
    { id: 'lut', name: 'GST LUT', category: 'GST Services' },

    // ROC & MCA Services
    { id: 'director-addition', name: 'Director Addition', category: 'ROC & MCA Services' },
    { id: 'director-removal', name: 'Director Removal', category: 'ROC & MCA Services' },
    { id: 'share-transfer', name: 'Share Transfer', category: 'ROC & MCA Services' },
    { id: 'address-change', name: 'Change of Registered Office Address', category: 'ROC & MCA Services' },
    { id: 'charge-creation', name: 'Charge Creation / Modification / Satisfaction', category: 'ROC & MCA Services' },
    { id: 'moa-amendment', name: 'MOA Amendment', category: 'ROC & MCA Services' },
    { id: 'aoa-amendment', name: 'AOA Amendment', category: 'ROC & MCA Services' },
    { id: 'objects-change', name: 'Change in Objects Clause', category: 'ROC & MCA Services' },
    { id: 'increase-share-capital', name: 'Increase in Authorised Share Capital', category: 'ROC & MCA Services' },
    { id: 'company-name-change', name: 'Company Name Change', category: 'ROC & MCA Services' },
    { id: 'din-deactivation', name: 'DIN Deactivation', category: 'ROC & MCA Services' },
    { id: 'din-reactivation', name: 'DIN Reactivation', category: 'ROC & MCA Services' },
    { id: 'adt-1', name: 'ADT-1 (Appointment of Auditor)', category: 'ROC & MCA Services' },
    { id: 'inc-20a', name: 'INC-20A (Commencement of Business)', category: 'ROC & MCA Services' },
    { id: 'winding-up-company', name: 'Winding Up of Company', category: 'ROC & MCA Services' },
    { id: 'winding-up-llp', name: 'Winding Up of LLP', category: 'ROC & MCA Services' },
    { id: 'din-application', name: 'DIN Application', category: 'ROC & MCA Services' },

    // Compliance Services
    { id: 'company-compliance', name: 'Company Annual Compliance', category: 'Compliance Services' },
    { id: 'llp-compliance', name: 'LLP Annual Compliance', category: 'Compliance Services' },
    { id: 'partnership-compliance', name: 'Partnership Firm Compliance', category: 'Compliance Services' },
    { id: 'proprietorship-compliance', name: 'Proprietorship Compliance', category: 'Compliance Services' },
    { id: 'hr-payroll', name: 'HR & Payroll Services', category: 'Compliance Services' },

    // Tax & Accounting Services
    { id: 'professional-tax', name: 'Professional Tax Registration', category: 'Tax & Accounting Services' },
    { id: 'professional-tax-return', name: 'Professional Tax Return Filing', category: 'Tax & Accounting Services' },
    { id: 'provident-fund', name: 'Provident Fund Registration', category: 'Tax & Accounting Services' },
    { id: 'pf-return', name: 'PF Return Filing', category: 'Tax & Accounting Services' },
    { id: 'esi', name: 'ESI Registration', category: 'Tax & Accounting Services' },
    { id: 'esi-return', name: 'ESI Return Filing', category: 'Tax & Accounting Services' },
    { id: 'bookkeeping', name: 'Bookkeeping & Accounting', category: 'Tax & Accounting Services' },

    // FSSAI & Other Licenses
    { id: 'fssai', name: 'FSSAI Registration / License', category: 'Licenses & Registrations' },
    { id: 'fssai-renewal', name: 'FSSAI Renewal', category: 'Licenses & Registrations' },
    { id: 'fssai-return', name: 'FSSAI Return Filing', category: 'Licenses & Registrations' },
    { id: 'trade-license', name: 'Trade License', category: 'Licenses & Registrations' },
    { id: 'labour-license', name: 'Labour License Registration', category: 'Licenses & Registrations' },
    { id: 'udyam', name: 'Udyam / MSME Registration', category: 'Licenses & Registrations' },
    { id: 'iec', name: 'Import Export Code (IEC)', category: 'Licenses & Registrations' },
    { id: 'dsc', name: 'Digital Signature Certificate (DSC)', category: 'Licenses & Registrations' },

    // Trust / NGO Registrations
    { id: '12a', name: '12A Registration', category: 'Trust / NGO Services' },
    { id: '80g', name: '80G Registration', category: 'Trust / NGO Services' },
    { id: 'trust-registration', name: 'Trust / Society / NGO Registration', category: 'Trust / NGO Services' },

    // Income Tax Return Services
    { id: 'salary-itr', name: 'Salary ITR', category: 'Income Tax Return Services' },
    { id: 'business-itr', name: 'Business ITR', category: 'Income Tax Return Services' },
    { id: 'house-property-itr', name: 'House Property ITR', category: 'Income Tax Return Services' },
    { id: 'capital-gains-itr', name: 'Salary + House Property + Capital Gains ITR', category: 'Income Tax Return Services' },
    { id: 'partnership-itr', name: 'Partnership Firm ITR', category: 'Income Tax Return Services' },
    { id: 'company-itr', name: 'Company ITR', category: 'Income Tax Return Services' },
    { id: 'trust-itr', name: 'Trust / NGO ITR', category: 'Income Tax Return Services' },

    // IP / Trademark Services
    { id: 'trademark', name: 'Trademark Registration', category: 'IP & Trademark Services' },

    // Fallback / Misc
    { id: 'custom', name: 'Custom Service', category: 'Other' }
  ];

  // Fetch users (using admin clients endpoint)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Reuse existing admin clients API which already returns all users
        const response = await apiClient.get('/admin/clients');
        if (response.success) {
          // Normalize clients data to simple user objects
          const normalized =
            (response.data || []).map((client) => ({
              id: client.user_id,       // used later for userId
              name: client.name,
              email: client.email,
              phone: client.phone
            })) || [];
          setUsers(normalized);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (step === 1 && activeTab === 'generate') {
      fetchUsers();
    }
  }, [step, activeTab]);

  // Fetch pending payments
  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        setLoadingPending(true);
        const response = await apiClient.get('/admin/registrations/pending-payments');
        if (response.success) {
          setPendingPayments(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching pending payments:', error);
        alert('Failed to fetch pending payments. Please try again.');
      } finally {
        setLoadingPending(false);
      }
    };

    if (activeTab === 'pending') {
      fetchPendingPayments();
    }
  }, [activeTab]);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    );
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedUser(null);
      setSelectedService(null);
      setCustomAmount('');
      setDescription('');
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
    } else if (step === 3) {
      setStep(2);
      setPaymentLink(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const amount = parseFloat(customAmount) || 0;
    if (amount <= 0) {
      setCouponError('Please enter a valid amount first');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    const result = await validateCoupon(couponCode, amount);

    setValidatingCoupon(false);

    if (result.valid) {
      setAppliedCoupon(result);
      setCouponError('');
    } else {
      setAppliedCoupon(null);
      setCouponError(result.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
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
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setGeneratingLink(true);

      const finalPrice = calculateFinalPrice();
      const discountAmount = calculateDiscount();

      const response = await apiClient.post('/admin/registrations/generate-payment-link', {
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
          description: description || `Custom payment for ${selectedService.name}`
        }
      });

      if (response.success) {
        setPaymentLink(response.data.paymentLink);
        setStep(3);
        setPendingTicketId(null);
      } else {
        alert(response.message || 'Failed to generate payment link');
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      alert(error.response?.data?.message || error.message || 'Failed to generate payment link. Please try again.');
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleSendEmail = async () => {
    if (!paymentLink) {
      alert('Please generate payment link first');
      return;
    }

    try {
      setSendingEmail(true);

      const amount = parseFloat(customAmount) || 0;
      const finalPrice = calculateFinalPrice();
      const discountAmount = calculateDiscount();

      const response = await apiClient.post('/admin/registrations/send-payment-link-email', {
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
          description: description || `Custom payment for ${selectedService.name}`
        },
        paymentLink: paymentLink
      });

      if (response.success) {
        alert(`✅ Payment link has been sent to ${selectedUser.email}`);
        // Reset form
        setStep(1);
        setSelectedUser(null);
        setSelectedService(null);
        setCustomAmount('');
        setDescription('');
        setCouponCode('');
         setAppliedCoupon(null);
         setPaymentLink(null);
         setPendingTicketId(null);
      } else {
        alert(response.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(error.response?.data?.message || error.message || 'Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      alert('Payment link copied to clipboard!');
    }
  };

  const handleGeneratePaymentForPending = async (pendingItem) => {
    // Take admin to Generate tab with pre-filled details so they can edit amount before generating link
    setActiveTab('generate');
    setStep(2);
    setSelectedUser({
      id: pendingItem.user_id,
      name: pendingItem.user_name,
      email: pendingItem.user_email
    });
    setSelectedService({
      id: pendingItem.registration_type,
      name: pendingItem.service_name || pendingItem.registration_type
    });
    setCustomAmount(String(pendingItem.package_price || pendingItem.amount || '0'));
    setDescription(`Custom payment for ${pendingItem.service_name || pendingItem.registration_type} (${pendingItem.ticket_id})`);
    setPendingTicketId(pendingItem.ticket_id);
  };

  const handleCollectCashForPending = async (pendingItem) => {
    if (!window.confirm('Confirm that you have collected cash from the client and want to mark this payment as PAID?')) {
      return;
    }

    try {
      const offlinePaymentId = `CASH_${pendingItem.ticket_id || 'UNKNOWN'}_${Date.now().toString().slice(-6)}`;

      const response = await apiClient.post(
        '/payment/update-payment-status',
        {
          payment_id: offlinePaymentId,
          order_id: pendingItem.razorpay_order_id || null,
          status: 'paid',
          ticket_id: pendingItem.ticket_id,
          user_id: pendingItem.user_id,
          registration_type: pendingItem.registration_type
        },
        {
          includeAuth: false // public endpoint like PaymentSuccess
        }
      );

      if (response.success) {
        alert('✅ Cash collected and payment marked as paid successfully.');
        // Refresh pending list
        if (activeTab === 'pending') {
          const idx = pendingPayments.findIndex(p => p.ticket_id === pendingItem.ticket_id);
          if (idx !== -1) {
            const updated = [...pendingPayments];
            updated.splice(idx, 1);
            setPendingPayments(updated);
          }
        }
      } else {
        alert(response.message || 'Failed to mark cash payment as paid. Please try again.');
      }
    } catch (error) {
      console.error('Error marking cash payment as paid:', error);
      alert(error.response?.data?.message || error.message || 'Failed to mark cash payment as paid. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Custom Payment</h1>
        <p className="text-gray-600">Generate payment links for any service with custom amounts</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setActiveTab('generate');
              setStep(1);
              setSelectedUser(null);
              setSelectedService(null);
              setPaymentLink(null);
              setPendingTicketId(null);
            }}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'generate'
                ? 'border-[#01334C] text-[#01334C]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Generate Payment Link
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-[#01334C] text-[#01334C]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Payments
          </button>
        </div>
      </div>

      {/* Pending Payments Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Payments</h2>
          
          {loadingPending ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01334C] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading pending payments...</p>
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending payments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Package</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ticket ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{item.user_name || '-'}</div>
                          <div className="text-sm text-gray-600">{item.user_email || '-'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.service_name || item.registration_type || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.package_name || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{parseFloat(item.package_price || item.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.ticket_id || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleGeneratePaymentForPending(item)}
                            disabled={generatingLink}
                            className="px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {generatingLink ? 'Generating...' : 'Generate Link'}
                          </button>
                          <button
                            onClick={() => handleCollectCashForPending(item)}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
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
          )}
        </div>
      )}

      {/* Generate Payment Link Tab */}
      {activeTab === 'generate' && (
        <>
      {/* Step 1: Select User */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select User</h2>
          
          {/* Search Bar */}
          <div className="mb-6 relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Users List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01334C] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No users found matching your search' : 'No users available'}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#01334C] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{user.name || '-'}</div>
                      <div className="text-sm text-gray-600">{user.email || '-'}</div>
                      <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Service & Amount */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={handleBack}
            className="mb-4 text-[#01334C] hover:text-[#00486D] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Service & Payment Details
          </h2>
          <p className="text-gray-600 mb-6">
            User: <span className="font-medium">{selectedUser?.name}</span> ({selectedUser?.email})
          </p>

          {/* Service Selection (all 64 services, grouped by category) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Service <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedService?.id || ''}
              onChange={(e) => {
                const service = serviceTypes.find(s => s.id === e.target.value);
                setSelectedService(service || null);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent bg-white"
            >
              <option value="">Select a service...</option>
              {Array.from(new Set(serviceTypes.map(s => s.category))).map((category) => (
                <optgroup key={category} label={category}>
                  {serviceTypes
                    .filter(s => s.category === category)
                    .map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter payment description..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
            />
          </div>

          {/* Coupon Code Section */}
          {customAmount && parseFloat(customAmount) > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                    if (appliedCoupon) {
                      setAppliedCoupon(null);
                    }
                  }}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  disabled={validatingCoupon || generatingLink}
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    disabled={generatingLink}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim() || generatingLink}
                    className="px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {validatingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                )}
              </div>
              {appliedCoupon && appliedCoupon.valid && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Coupon applied! {appliedCoupon.discountPercentage}% discount will be applied.
                </div>
              )}
              {couponError && (
                <div className="mt-2 text-sm text-red-600">
                  {couponError}
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          {customAmount && parseFloat(customAmount) > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Price Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Amount:</span>
                  <span className="font-medium">₹{parseFloat(customAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && appliedCoupon.valid && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.discountPercentage}%):</span>
                      <span className="font-medium">-₹{calculateDiscount().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-900 font-semibold">Final Amount:</span>
                      <span className="text-[#01334C] font-bold text-lg">₹{calculateFinalPrice().toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
                {!appliedCoupon && (
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-semibold">Final Amount:</span>
                    <span className="text-[#01334C] font-bold text-lg">₹{parseFloat(customAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Payment Link Button */}
          <button
            onClick={handleGeneratePaymentLink}
            disabled={!selectedService || !customAmount || generatingLink || parseFloat(customAmount) <= 0}
            className="w-full px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generatingLink ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Payment Link'
            )}
          </button>
        </div>
      )}

      {/* Step 3: Payment Link Generated */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={handleBack}
            className="mb-4 text-[#01334C] hover:text-[#00486D] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-semibold">Payment Link Generated Successfully!</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingEmail ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Payment Link to {selectedUser?.email}
                  </>
                )}
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

