import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initPayment } from '../../utils/payment';
import PackagesSection from './company-details/PackagesSection';

function StartupIndiaPackageSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Packages as per the 2nd image
  const packages = [
    {
      name: 'Starter',
      price: '2,999',
      priceValue: 2999,
      period: 'One Time',
      description: 'Basic Startup India registration',
      icon: '★',
      features: [
        'Application Filing',
        'DPIIT Registration',
        'Startup India certificate'
      ]
    },
    {
      name: 'Growth',
      price: '5,999',
      priceValue: 5999,
      period: 'One Time',
      description: 'Enhanced Startup India package',
      icon: '✢',
      features: [
        'Business Consultation',
        'Application Filing',
        'DPIIT Registration',
        'Startup India certificate',
        'Class 3 digital Signature'
      ]
    },
    {
      name: 'Pro',
      price: '14,999',
      priceValue: 14999,
      period: 'One Time',
      description: 'Complete Startup India solution',
      icon: '✤',
      features: [
        'Pitch Deck',
        'Startup Course',
        'Business Consultation',
        'Application Filing',
        'DPIIT Registration',
        'Startup India certificate',
        'Class 3 digital Signature'
      ],
      isHighlighted: true
    }
  ];

  const handleGetStarted = async (pkg) => {
    try {
      setLoading(true);
      console.log('💳 Initiating payment for Startup India:', pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', 'startup-india');
      localStorage.setItem('selectedRegistrationTitle', 'Start - Up India Certificate');

      // Initiate payment
      const result = await initPayment({
        name: `Startup India - ${pkg.name}`,
        price: pkg.price,
        priceValue: pkg.priceValue,
        ...pkg
      });

      if (result.success && result.redirect) {
        console.log('✅ Payment successful! Redirecting to form...');
        navigate('/startup-india-form');
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
            Start - Up India Certificate
          </h1>
          <p className="text-gray-600">
            Choose a package to get started with your Startup India registration
          </p>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-700">Processing payment...</p>
            </div>
          </div>
        )}

        <PackagesSection packages={packages} onGetStarted={handleGetStarted} />
      </div>
    </div>
  );
}

export default StartupIndiaPackageSelection;


