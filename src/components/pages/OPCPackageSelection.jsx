import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initPayment } from '../../utils/payment';
import PackagesSection from './company-details/PackagesSection';

function OPCPackageSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Packages - same as Private Limited Company
  const packages = [
    {
      name: 'Starter',
      price: '12,999',
      priceValue: 12999,
      period: 'One Time',
      description: 'For solo entrepreneurs',
      icon: '★',
      features: [
        'Company Name Reservation',
        'DSC for Director',
        'DIN Application',
        'MOA & AOA Drafting',
        'SPICe+ Form Filing',
        'Certificate of Incorporation',
        'PAN & TAN Application',
        'GST Registration (if applicable)'
      ]
    },
    {
      name: 'Growth',
      price: '16,999',
      priceValue: 16999,
      period: 'One Time',
      description: 'As your business scales',
      icon: '✢',
      features: [
        'Everything in Starter',
        'Professional Tax Registration',
        'Shops & Establishment License',
        'MSME Registration',
        'Bank Account Opening Assistance',
        'CA Consultation (15 mins)',
        'Priority Support'
      ],
      isHighlighted: true
    },
    {
      name: 'Pro',
      price: '25,499',
      priceValue: 25499,
      period: 'One Time',
      description: 'For more complex businesses',
      icon: '✤',
      features: [
        'Everything in Growth',
        'Startup India Registration',
        'FSSAI License (if applicable)',
        'Trade License',
        'CA Consultation (30 mins)',
        'Dedicated Account Manager',
        '1 Year Compliance Support',
        'Legal Document Templates'
      ]
    }
  ];

  const handleGetStarted = async (pkg) => {
    try {
      setLoading(true);
      console.log('💳 Initiating payment for OPC:', pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', 'opc');
      localStorage.setItem('selectedRegistrationTitle', 'One Person Company Registration');

      // Initiate payment
      const result = await initPayment({
        name: `OPC - ${pkg.name}`,
        price: pkg.price,
        priceValue: pkg.priceValue,
        ...pkg
      });

      if (result.success && result.redirect) {
        console.log('✅ Payment successful! Redirecting to form...');
        navigate('/opc-form');
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
            onClick={() => navigate('/company-categories')}
            className="flex items-center gap-2 text-[#01334C] hover:text-[#00486D] mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            One-Person Company (OPC) Registration
          </h1>
          <p className="text-gray-600">
            Choose a package to get started with your OPC registration
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

export default OPCPackageSelection;

