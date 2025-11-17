import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/api';
import PrivateLimitedForm from '../../forms/PrivateLimitedForm';
import ProprietorshipForm from '../../forms/ProprietorshipForm';

function AdminFillFormNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, userName, userEmail, registrationType, packagePlan } = location.state || {};
  
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!userId || !registrationType || !packagePlan) {
      alert('Missing required information. Please start again.');
      navigate('/admin/new-registration');
    }
  }, [userId, registrationType, packagePlan, navigate]);

  const handleFormSubmit = async (submittedFormData) => {
    try {
      console.log('📝 Form submitted with data:', submittedFormData);
      setFormData(submittedFormData);
      setShowPaymentModal(true);
      setSubmitting(false);
    } catch (error) {
      console.error('Error preparing form submission:', error);
      alert('Failed to prepare form submission. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSendPaymentLink = async () => {
    try {
      setSubmitting(true);

      console.log('📤 Sending payment link with data:', {
        userId,
        registrationType,
        hasFormData: !!formData,
        formDataKeys: formData ? Object.keys(formData) : [],
        packagePlan
      });

      // Create draft registration and generate payment link
      const response = await apiClient.post('/admin/registrations/create-and-send-payment', {
        userId,
        registrationType,
        formData: formData || {},
        packagePlan
      });

      if (response.success) {
        alert(`Payment link has been sent to ${userEmail}`);
        navigate('/admin/clients');
      } else {
        alert(response.message || response.error || 'Failed to send payment link');
      }
    } catch (error) {
      console.error('Error sending payment link:', error);
      const errorMessage = error.message || error.response?.data?.error || 'Failed to send payment link. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
      setShowPaymentModal(false);
    }
  };

  if (!userId || !registrationType || !packagePlan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Missing required information</p>
          <button
            onClick={() => navigate('/admin/new-registration')}
            className="mt-4 px-4 py-2 bg-[#01334C] text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const packageDetails = {
    name: packagePlan.name,
    price: packagePlan.price,
    priceValue: packagePlan.price
  };

  if (registrationType === 'private-limited') {
    return (
      <>
        <PrivateLimitedForm
          isAdminFilling={true}
          clientId={userId}
          packageDetails={packageDetails}
          onClose={() => navigate('/admin/clients')}
          onFormSubmit={handleFormSubmit}
          ticketId={null}
        />
        {showPaymentModal && (
          <PaymentLinkModal
            isOpen={showPaymentModal}
            userName={userName}
            userEmail={userEmail}
            packagePlan={packagePlan}
            onConfirm={handleSendPaymentLink}
            onCancel={() => setShowPaymentModal(false)}
            loading={submitting}
          />
        )}
      </>
    );
  } else if (registrationType === 'proprietorship') {
    return (
      <>
        <ProprietorshipForm
          isAdminFilling={true}
          clientId={userId}
          packageDetails={packageDetails}
          onClose={() => navigate('/admin/clients')}
          onFormSubmit={handleFormSubmit}
          ticketId={null}
        />
        {showPaymentModal && (
          <PaymentLinkModal
            isOpen={showPaymentModal}
            userName={userName}
            userEmail={userEmail}
            packagePlan={packagePlan}
            onConfirm={handleSendPaymentLink}
            onCancel={() => setShowPaymentModal(false)}
            loading={submitting}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-gray-600">Registration type not supported yet</p>
        <button
          onClick={() => navigate('/admin/clients')}
          className="mt-4 px-4 py-2 bg-[#01334C] text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// Payment Link Confirmation Modal
function PaymentLinkModal({ isOpen, userName, userEmail, packagePlan, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-xl">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Send Payment Link</h2>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">User: <span className="font-medium">{userName}</span></p>
            <p className="text-sm text-gray-600 mb-2">Email: <span className="font-medium">{userEmail}</span></p>
            <p className="text-sm text-gray-600 mb-2">Package: <span className="font-medium">{packagePlan.name}</span></p>
            <p className="text-sm text-gray-600 mb-4">Amount: <span className="font-semibold text-[#01334C]">₹{packagePlan.price.toLocaleString('en-IN')}</span></p>
          </div>

          <p className="text-sm text-gray-700 mb-6">
            A payment link will be sent to the user's email. After payment, the registration will appear in their dashboard.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-12 px-6 bg-[#01334C] hover:bg-[#00486D] text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Payment Link'
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-6 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFillFormNew;

