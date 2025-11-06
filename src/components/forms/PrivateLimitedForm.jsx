import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import { NameApplicationContent, StartupInformationContent, OfficeAddressContent, DirectorDetailsContent, AuthorizationLetterContent } from './steps/PrivateLimitedSteps';
import { submitPrivateLimitedRegistration } from '../../utils/privateLimitedApi';

function PrivateLimitedForm({ packageDetails: propPackageDetails, onClose }) {
  const navigate = useNavigate();
  const [packageDetails, setPackageDetails] = useState(propPackageDetails);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    numberOfDirectors: 1,
    numberOfShareholders: 1
  });
  
  // Load package details from localStorage if not provided as prop
  useEffect(() => {
    if (!packageDetails) {
      const storedPackage = localStorage.getItem('selectedPackage');
      if (storedPackage) {
        try {
          setPackageDetails(JSON.parse(storedPackage));
        } catch (e) {
          console.error('Error parsing package data:', e);
          // If no package data, redirect back
          navigate('/company-categories');
        }
      } else {
        // No package data, redirect back
        navigate('/company-categories');
      }
    }
  }, [packageDetails, navigate]);

  const steps = [
    "Name Application",
    "Basic Company Details",
    "Basic Directors and Shareholders Details",
  ];

  const goBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Go back to previous page or close
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const goNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Submit form on last step
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      console.log('📝 Submitting Private Limited registration...');
      console.log('Form Data:', formData);
      
      // Call API to submit registration
      const result = await submitPrivateLimitedRegistration(formData);
      
      if (result.success) {
        console.log('✅ Registration submitted successfully:', result.data);
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Wait 3 seconds then redirect to dashboard
        setTimeout(() => {
          // Clear stored data after successful submission
          localStorage.removeItem('selectedPackage');
          localStorage.removeItem('paymentDetails');
          
          // Navigate to Private Limited dashboard instead of client dashboard
          navigate('/private-limited-dashboard');
        }, 3000);
      } else {
        console.error('❌ Registration submission failed:', result.message);
        alert(result.message || 'Failed to submit registration. Please try again.');
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <NameApplicationContent formData={formData} setFormData={setFormData} />;
      case 2:
        return <StartupInformationContent formData={formData} setFormData={setFormData} />;
      case 3:
        return <OfficeAddressContent formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f3f5f7]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-[#28303F]">
              Add your Details
            </h1>
            {packageDetails && (
              <p className="text-sm text-gray-600">
                Package: <span className="font-medium">{packageDetails.name}</span> - <span className="font-semibold text-[#00486D]">₹{packageDetails.price}</span>
              </p>
            )}
          </div>

          {/* Stepper */}
          <StepIndicator steps={steps} currentStep={step} />

          <div className="rounded-lg p-6">
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-1.5 rounded-md border border-[#00486D] text-[#00486D] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="px-6 py-1.5 rounded-md text-white font-medium cursor-pointer"
                style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
              >
                {step === 3 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Successfully Submitted!
              </h3>
              <p className="text-gray-600">
                Your application has been submitted successfully. Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PrivateLimitedForm;

