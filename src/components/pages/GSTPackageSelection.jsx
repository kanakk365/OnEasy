import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initPayment } from '../../utils/payment';
import PackagesSection from './company-details/PackagesSection';
import { usePackages } from '../../hooks/usePackages';

function GSTPackageSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Fetch packages from API
  const { packages: apiPackages, loading: packagesLoading } = usePackages('gst');

  const handleGetStarted = async (pkg) => {
    try {
      setLoading(true);
      console.log('💳 Initiating payment for GST:', pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', 'gst');
      localStorage.setItem('selectedRegistrationTitle', 'GST Registration');

      // Initiate payment
      const result = await initPayment({
        name: `GST Registration - ${pkg.name}`,
        price: pkg.price,
        priceValue: pkg.priceValue,
        ...pkg
      });

      if (result.success && result.redirect) {
        console.log('✅ Payment successful! Redirecting to form...');
        navigate('/gst-form');
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error.message !== 'Payment cancelled') {
        alert(`Payment failed: ${error.message || 'Please try again'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/registration-categories')}
            className="flex items-center gap-2 text-[#01334C] hover:text-[#00486D] mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            GST Registration
          </h1>
          <p className="text-gray-600">
            Choose a package to get started with your GST registration
          </p>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-700">Processing payment...</p>
            </div>
          </div>
        )}

        {packagesLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#01334C]"></div>
            <p className="mt-2 text-gray-600">Loading packages...</p>
          </div>
        ) : (
          <PackagesSection packages={apiPackages} onGetStarted={handleGetStarted} />
        )}
      </div>
    </div>
  );
}

export default GSTPackageSelection;


