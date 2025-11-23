import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initPayment } from '../../utils/payment';
import PackagesSection from './company-details/PackagesSection';

function RegistrationPackageSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrationType, registrationTitle } = location.state || {};
  const [loading, setLoading] = useState(false);

  // Default packages for registration services
  const defaultPackages = {
    'gst': [
      {
        name: 'Basic',
        price: '1,499',
        priceValue: 1499,
        period: 'One Time',
        description: 'Standard GST registration',
        icon: '★',
        features: [
          'GST Registration Certificate',
          'GSTIN Number',
          'Digital Signature Certificate',
          'Email Support'
        ]
      },
      {
        name: 'Premium',
        price: '2,999',
        priceValue: 2999,
        period: 'One Time',
        description: 'GST with additional services',
        icon: '✢',
        features: [
          'GST Registration Certificate',
          'GSTIN Number',
          'Digital Signature Certificate',
          'FSSAI Registration',
          'Priority Support',
          'CA Consultation (15 mins)'
        ],
        isHighlighted: true
      }
    ],
    'udyam': [
      {
        name: 'Basic',
        price: '999',
        priceValue: 999,
        period: 'One Time',
        description: 'MSME/Udyam registration',
        icon: '★',
        features: [
          'Udyam Registration Certificate',
          'Udyam Registration Number',
          'Email Support',
          'Digital Certificate'
        ]
      },
      {
        name: 'Premium',
        price: '1,999',
        priceValue: 1999,
        period: 'One Time',
        description: 'Complete MSME package',
        icon: '✤',
        features: [
          'Udyam Registration Certificate',
          'Udyam Registration Number',
          'Priority Support',
          'CA Consultation (15 mins)',
          'GST Registration Assistance',
          'Digital Certificate'
        ],
        isHighlighted: true
      }
    ],
    'professional-tax': [
      {
        name: 'Basic',
        price: '1,299',
        priceValue: 1299,
        period: 'One Time',
        description: 'Professional tax registration',
        icon: '★',
        features: [
          'Professional Tax Registration',
          'Registration Certificate',
          'Email Support'
        ]
      },
      {
        name: 'Premium',
        price: '2,499',
        priceValue: 2499,
        period: 'One Time',
        description: 'Complete professional tax package',
        icon: '✤',
        features: [
          'Professional Tax Registration',
          'Registration Certificate',
          'Priority Support',
          'CA Consultation (15 mins)',
          'Compliance Guidance'
        ],
        isHighlighted: true
      }
    ],
    'labour-license': [
      {
        name: 'Basic',
        price: '1,999',
        priceValue: 1999,
        period: 'One Time',
        description: 'Labour license registration',
        icon: '★',
        features: [
          'Labour License Certificate',
          'Registration Number',
          'Email Support'
        ]
      },
      {
        name: 'Premium',
        price: '3,499',
        priceValue: 3499,
        period: 'One Time',
        description: 'Complete labour license package',
        icon: '✤',
        features: [
          'Labour License Certificate',
          'Registration Number',
          'Priority Support',
          'CA Consultation (15 mins)',
          'Compliance Assistance'
        ],
        isHighlighted: true
      }
    ],
    'provident-fund': [
      {
        name: 'Basic',
        price: '1,499',
        priceValue: 1499,
        period: 'One Time',
        description: 'PF registration',
        icon: '★',
        features: [
          'PF Registration',
          'Registration Certificate',
          'Email Support'
        ]
      },
      {
        name: 'Premium',
        price: '2,999',
        priceValue: 2999,
        period: 'One Time',
        description: 'Complete PF package',
        icon: '✤',
        features: [
          'PF Registration',
          'Registration Certificate',
          'Priority Support',
          'CA Consultation (15 mins)',
          'Employee Benefits Guidance'
        ],
        isHighlighted: true
      }
    ],
    'fssai': [
      {
        name: 'Basic',
        price: '1,999',
        priceValue: 1999,
        period: 'One Time',
        description: 'FSSAI food license',
        icon: '★',
        features: [
          'FSSAI License',
          'License Number',
          'Email Support'
        ]
      },
      {
        name: 'Premium',
        price: '3,499',
        priceValue: 3499,
        period: 'One Time',
        description: 'Complete FSSAI package',
        icon: '✤',
        features: [
          'FSSAI License',
          'License Number',
          'Priority Support',
          'CA Consultation (15 mins)',
          'Compliance Assistance'
        ],
        isHighlighted: true
      }
    ],
    'trade-license': [
      {
        name: 'Basic',
        price: '1,499',
        priceValue: 1499,
        period: 'One Time',
        description: 'Trade license registration',
        icon: '★',
        features: [
          'Trade License',
          'License Number',
          'Email Support'
        ]
      },
      {
        name: 'Premium',
        price: '2,999',
        priceValue: 2999,
        period: 'One Time',
        description: 'Complete trade license package',
        icon: '✤',
        features: [
          'Trade License',
          'License Number',
          'Priority Support',
          'CA Consultation (15 mins)',
          'Renewal Assistance'
        ],
        isHighlighted: true
      }
    ],
    'iec': [
      {
        name: 'Basic',
        price: '1,999',
        priceValue: 1999,
        period: 'One Time',
        description: 'IEC registration',
        icon: '★',
        features: [
          'IEC Registration',
          'IEC Code',
          'Email Support'
        ]
      },
      {
        name: 'Premium',
        price: '3,499',
        priceValue: 3499,
        period: 'One Time',
        description: 'Complete IEC package',
        icon: '✤',
        features: [
          'IEC Registration',
          'IEC Code',
          'Priority Support',
          'CA Consultation (15 mins)',
          'Import/Export Guidance'
        ],
        isHighlighted: true
      }
    ]
  };

  // Get packages for the selected registration type
  const packages = defaultPackages[registrationType] || defaultPackages['gst'];

  const handleGetStarted = async (pkg) => {
    try {
      setLoading(true);
      console.log('💳 Initiating payment for:', registrationType, pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', registrationType);
      localStorage.setItem('selectedRegistrationTitle', registrationTitle || registrationType);

      // Initiate payment
      const result = await initPayment({
        name: `${registrationTitle || registrationType} - ${pkg.name}`,
        price: pkg.price,
        priceValue: pkg.priceValue,
        ...pkg
      });

      if (result.success && result.redirect) {
        console.log('✅ Payment successful! Redirecting to form...');
        
        // Navigate to the appropriate form based on registration type
        const formRoutes = {
          'gst': '/gst-registration-form',
          'udyam': '/udyam-registration-form',
          'professional-tax': '/professional-tax-form',
          'labour-license': '/labour-license-form',
          'provident-fund': '/provident-fund-form',
          'fssai': '/fssai-form',
          'trade-license': '/trade-license-form',
          'iec': '/iec-form'
        };

        const formRoute = formRoutes[registrationType] || '/registration-form';
        navigate(formRoute);
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

  if (!registrationType) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No registration type selected</p>
          <button
            onClick={() => navigate('/registration-categories')}
            className="px-6 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
            {registrationTitle || registrationType}
          </h1>
          <p className="text-gray-600">
            Choose a package to get started with your registration
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

export default RegistrationPackageSelection;


