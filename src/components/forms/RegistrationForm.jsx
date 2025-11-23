import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../utils/api';

function RegistrationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get registration type from localStorage or location
  const registrationType = localStorage.getItem('selectedRegistrationType') || 
                          location.state?.registrationType || 'gst';
  const registrationTitle = localStorage.getItem('selectedRegistrationTitle') || 
                            location.state?.registrationTitle || 'Registration';

  useEffect(() => {
    // Check if payment was completed
    const selectedPackage = localStorage.getItem('selectedPackage');
    const paymentDetails = localStorage.getItem('paymentDetails');

    if (!selectedPackage || !paymentDetails) {
      alert('Please complete payment before accessing the registration form.');
      navigate('/registration-categories');
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get payment details
      const selectedPackage = JSON.parse(localStorage.getItem('selectedPackage') || '{}');
      const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');

      // Submit registration
      const response = await apiClient.post('/registrations/create', {
        registrationType,
        formData,
        packageDetails: selectedPackage,
        paymentDetails: {
          razorpay_order_id: paymentDetails.orderId,
          razorpay_payment_id: paymentDetails.paymentId,
          payment_status: 'paid'
        }
      });

      if (response.success) {
        setSuccess('Registration submitted successfully!');
        
        // Clear localStorage
        localStorage.removeItem('selectedPackage');
        localStorage.removeItem('paymentDetails');
        localStorage.removeItem('selectedRegistrationType');
        localStorage.removeItem('selectedRegistrationTitle');

        // Navigate to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  // Basic form fields - can be customized per registration type
  const renderFormFields = () => {
    const commonFields = (
      <>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1 || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              name="state"
              value={formData.state || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
            required
          />
        </div>
      </>
    );

    // Add registration-specific fields
    if (registrationType === 'gst') {
      return (
        <>
          {commonFields}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PAN Number *
            </label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
              required
            />
          </div>
        </>
      );
    }

    if (registrationType === 'udyam') {
      return (
        <>
          {commonFields}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aadhar Number *
            </label>
            <input
              type="text"
              name="aadharNumber"
              value={formData.aadharNumber || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
              required
            />
          </div>
        </>
      );
    }

    return commonFields;
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/registration-categories')}
              className="flex items-center gap-2 text-[#01334C] hover:text-[#00486D] mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {registrationTitle} Form
            </h1>
            <p className="text-gray-600">
              Please fill in the details to complete your registration
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormFields()}

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/registration-categories')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;


