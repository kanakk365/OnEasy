import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import { BasicBusinessDetailsContent, BasicProprietorDetailsContent } from './steps/ProprietorshipSteps';
import { submitProprietorshipRegistration } from '../../utils/proprietorshipApi';

function ProprietorshipForm() {
  const navigate = useNavigate();
  const [packageDetails, setPackageDetails] = useState(null);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  // Load package details from localStorage
  useEffect(() => {
    const storedPackage = localStorage.getItem('selectedPackage');
    const storedPayment = localStorage.getItem('paymentDetails');
    
    if (storedPackage && storedPayment) {
      try {
        setPackageDetails(JSON.parse(storedPackage));
        console.log('✅ Package and payment verified - form access granted');
      } catch (e) {
        console.error('Error parsing package data:', e);
        alert('Invalid payment data. Please complete payment first.');
        navigate('/company-categories');
        return;
      }
    } else {
      console.warn('⚠️ No payment found - redirecting to packages');
      alert('Please complete payment before accessing the registration form.');
      navigate('/company-categories');
      return;
    }
  }, [navigate]);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');
      
      const submissionData = {
        ...formData,
        packageDetails,
        paymentDetails
      };

      console.log('📤 Submitting proprietorship registration:', submissionData);
      
      const result = await submitProprietorshipRegistration(submissionData);
      
      if (result.success) {
        console.log('✅ Registration submitted successfully');
        setShowSuccessModal(true);
        
        // Clear localStorage
        localStorage.removeItem('selectedPackage');
        localStorage.removeItem('paymentDetails');
        localStorage.removeItem('draftTicketId');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/proprietorship-dashboard');
        }, 2000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert(error.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <BasicBusinessDetailsContent
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <BasicProprietorDetailsContent
            formData={formData}
            setFormData={setFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7] py-8">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-[#28303F]">
            Add your Details
          </h1>
          {packageDetails && (
            <p className="text-sm text-gray-600">
              Package: <span className="font-medium">{packageDetails.name}</span> - <span className="font-semibold text-[#00486D]">₹{Number(packageDetails.priceValue || packageDetails.price).toLocaleString('en-IN')}</span>
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <StepIndicator
          steps={[
            'Basic Business Details',
            'Basic Proprietor Details'
          ]}
          currentStep={step}
        />

        {/* Step Content */}
        <div className="rounded-lg p-6">
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className={`px-6 py-1.5 rounded-md border border-[#00486D] text-[#00486D] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={step < 2 ? handleNext : handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-1.5 rounded-md text-white font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
            >
              {isSubmitting ? 'Submitting...' : (step === 2 ? 'Submit' : 'Next')}
            </button>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Your proprietorship registration has been submitted successfully. 
                You will be redirected to your dashboard.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D] mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProprietorshipForm;

