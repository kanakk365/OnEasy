import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "../forms/StepIndicator";
import { Step1Content, Step2Content, Step3Content, Step4Content, Step5Content } from "../forms/FormSteps";
import { submitStartupIndiaRegistration } from "../../utils/startupIndiaApi";

function StartupIndiaForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: {},
    step2: {},
    step3: {},
    step4: { directors: [] },
    step5: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Load package and payment details from localStorage
  useEffect(() => {
    const packageDetails = JSON.parse(localStorage.getItem('packageDetails') || '{}');
    const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');
    
    console.log('📦 Loaded package details:', packageDetails);
    console.log('💳 Loaded payment details:', paymentDetails);
    
    setFormData(prev => ({
      ...prev,
      packageDetails,
      paymentDetails
    }));
  }, []);

  const goBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      return;
    }
    navigate(-1);
  };

  const goNext = async () => {
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }
    
    // Step 5 - Submit the form
    await handleSubmit();
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('📤 Submitting Startup India registration...', formData);
      
      const response = await submitStartupIndiaRegistration(formData);
      
      if (response.success) {
        console.log('✅ Registration submitted successfully:', response);
        setShowSuccessModal(true);
        
        // Clear localStorage
        localStorage.removeItem('packageDetails');
        localStorage.removeItem('paymentDetails');
        
        // Navigate to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/startup-india-dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error submitting registration:', error);
      alert('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    "Business Details",
    "Startup Information",
    "Office Address",
    "Director/Partner Details",
    "Authorization Letter",
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1Content />;
      case 2:
        return <Step2Content />;
      case 3:
        return <Step3Content />;
      case 4:
        return <Step4Content />;
      case 5:
        return <Step5Content />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold text-[#28303F] mb-6">
          Add your Details
        </h1>

        {/* Stepper */}
        <StepIndicator steps={steps} currentStep={step} />

        <div className="rounded-lg p-6">
          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-1.5 rounded-md border border-[#CFE6F0] text-[#00486D] cursor-pointer disabled:opacity-50"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-1.5 rounded-md text-white font-medium bg-[#6E6E6E] cursor-pointer disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : (step === 5 ? 'Submit' : 'Next')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Your Startup India registration has been submitted successfully.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartupIndiaForm;
