import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateCoupon } from '../../../utils/couponApi';
import apiClient from '../../../utils/api';

function PaymentLinkGeneration({ user, registrationType, packagePlan, onBack, onPaymentLinkGenerated }) {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [paymentLinkData, setPaymentLinkData] = useState(null);
  const [_showEmailOption, setShowEmailOption] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    const result = await validateCoupon(couponCode, packagePlan.price);

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
    if (appliedCoupon && appliedCoupon.valid) {
      return Math.round(appliedCoupon.finalAmount);
    }
    return packagePlan.price;
  };

  const calculateDiscount = () => {
    if (appliedCoupon && appliedCoupon.valid) {
      return Math.round(appliedCoupon.discountAmount);
    }
    return 0;
  };

  const handleGeneratePaymentLink = async () => {
    try {
      setGeneratingLink(true);

      const finalPrice = calculateFinalPrice();
      const discountAmount = calculateDiscount();

      const response = await apiClient.post('/admin/registrations/generate-payment-link', {
        userId: user.id,
        registrationType: registrationType.id,
        packagePlan: {
          ...packagePlan,
          price: finalPrice,
          priceValue: finalPrice,
          originalPrice: packagePlan.price,
          discountAmount: discountAmount,
          discountPercentage: appliedCoupon?.discountPercentage || 0,
          couponCode: appliedCoupon ? couponCode.toUpperCase().trim() : null
        }
      });

      if (response.success) {
        setPaymentLink(response.data.paymentLink);
        setPaymentLinkData(response.data); // Store the full response data
        setShowEmailOption(true);
        if (onPaymentLinkGenerated) {
          onPaymentLinkGenerated(response.data);
        }
      } else {
        alert(response.message || 'Failed to generate payment link');
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      alert(error.message || 'Failed to generate payment link. Please try again.');
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

      const response = await apiClient.post('/admin/registrations/send-payment-link-email', {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        registrationType: registrationType.id,
        packagePlan: {
          ...packagePlan,
          price: calculateFinalPrice(),
          priceValue: calculateFinalPrice(),
          originalPrice: packagePlan.price,
          discountAmount: calculateDiscount(),
          discountPercentage: appliedCoupon?.discountPercentage || 0
        },
        paymentLink: paymentLink
      });

      if (response.success) {
        alert(`✅ Payment link has been sent to ${user.email}`);
        navigate('/admin/new-registration');
      } else {
        alert(response.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(error.message || 'Failed to send email. Please try again.');
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

  const handleContinueToForm = () => {
    if (!paymentLink) {
      alert('Please generate payment link first');
      return;
    }
    
    // Extract ticketId from payment link or use from paymentLinkData
    let ticketId = null;
    if (paymentLinkData?.ticketId) {
      ticketId = paymentLinkData.ticketId;
    } else if (paymentLink) {
      // Try to extract from URL
      try {
        const urlParams = new URLSearchParams(paymentLink.split('?')[1]);
        ticketId = urlParams.get('ticketId');
      } catch (e) {
        console.error('Error parsing payment link:', e);
      }
    }

    // Navigate to client overview page with Services tab active
    // The admin can then click "Fill Form" button for the specific registration
    const url = `/admin/client-overview/${user.id}?tab=services${ticketId ? `&ticketId=${ticketId}` : ''}`;
    navigate(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <div className="mb-6 md:mb-8">
        <button
          onClick={onBack}
          className="mb-4 text-[#01334C] hover:text-[#00486D] flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
          Generate Payment Link
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          User: <span className="font-medium">{user.name}</span> | 
          Service: <span className="font-medium">{registrationType.name}</span> | 
          Package: <span className="font-medium">{packagePlan.name}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        {/* Package Details */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Package Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Package:</span>
              <span className="font-medium">{packagePlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Original Price:</span>
              <span className="font-medium">₹{packagePlan.price.toLocaleString('en-IN')}</span>
            </div>
            {appliedCoupon && appliedCoupon.valid && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.discountPercentage}%):</span>
                  <span className="font-medium">-₹{calculateDiscount().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Final Price:</span>
                  <span className="text-[#01334C] font-bold text-lg">₹{calculateFinalPrice().toLocaleString('en-IN')}</span>
                </div>
              </>
            )}
            {!appliedCoupon && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">Final Price:</span>
                <span className="text-[#01334C] font-bold text-lg">₹{packagePlan.price.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Coupon Code Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Have a coupon code? (Optional)
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

        {/* Generate Payment Link Button */}
        {!paymentLink && (
          <button
            onClick={handleGeneratePaymentLink}
            disabled={generatingLink}
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
        )}

        {/* Payment Link Display */}
        {paymentLink && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
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
                    Send Payment Link to {user.email}
                  </>
                )}
              </button>
              <button
                onClick={handleContinueToForm}
                className="w-full px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium"
              >
                Continue to Fill Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentLinkGeneration;

