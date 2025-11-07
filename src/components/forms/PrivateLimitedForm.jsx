import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import { NameApplicationContent, StartupInformationContent, OfficeAddressContent, DirectorDetailsContent, AuthorizationLetterContent } from './steps/PrivateLimitedSteps';
import { submitPrivateLimitedRegistration } from '../../utils/privateLimitedApi';
import { requestTeamFill } from '../../utils/teamFillApi';

function PrivateLimitedForm({ packageDetails: propPackageDetails, onClose }) {
  const navigate = useNavigate();
  const [packageDetails, setPackageDetails] = useState(propPackageDetails);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showStep1CompleteModal, setShowStep1CompleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oneasyTeamFill, setOneasyTeamFill] = useState(false);
  const [formData, setFormData] = useState({
    numberOfDirectors: 1,
    numberOfShareholders: 1
  });
  
  // Load package details and existing registration data if editing
  useEffect(() => {
    const loadFormData = async () => {
      if (!packageDetails) {
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
          // No package or payment data - redirect back
          console.warn('⚠️ No payment found - redirecting to packages');
          alert('Please complete payment before accessing the registration form.');
          navigate('/company-categories');
          return;
        }
      }

      // Check if we're editing an existing registration
      const editingTicketId = localStorage.getItem('editingTicketId');
      if (editingTicketId) {
        console.log('📝 Loading existing registration for editing:', editingTicketId);
        try {
          const { getRegistrationByTicketId } = await import('../../utils/privateLimitedApi');
          const result = await getRegistrationByTicketId(editingTicketId);
          
          if (result.success && result.data) {
            const reg = result.data.details;
            const dirs = result.data.directors || [];
            
            // Pre-fill form data
            setFormData({
              step1: {
                nameOption1: reg.business_name || '',
                nameOption2: reg.business_name_option2 || '',
                nameReason: reg.name_reason || '',
                companyType: reg.business_type || '',
                natureOfBusiness: reg.nature_of_business || ''
              },
              step2: {
                numberOfDirectors: reg.directors_partners_count || 2,
                numberOfShareholders: reg.shareholders_count || 1,
                authorizedCapital: reg.authorized_capital || '',
                paidUpCapital: reg.paid_up_capital || '',
                companyEmail: reg.business_email || '',
                contactNumber: reg.business_contact_number || '',
                addressLine1: reg.address_line1 || '',
                addressLine2: reg.address_line2 || '',
                city: reg.city || '',
                state: reg.state || '',
                country: reg.country || 'India',
                pincode: reg.pincode || '',
                nocDate: reg.noc_date || '',
                landlordName: reg.landlord_name || '',
                registeredPremisesAddress: reg.registered_premises_address || '',
                utilityBill: reg.utility_bill || null
              },
              step3: {},
              directors: dirs.map(d => ({
                name: d.director_name || '',
                relation: d.relation_with_company || '',
                designation: d.designation || '',
                numberOfShares: d.number_of_shares || '',
                faceValue: d.face_value_per_share || '',
                totalEquity: d.total_equity || '',
                sharePercentage: d.share_percentage || '',
                educationalQualification: d.educational_qualification || '',
                dateOfBirth: d.date_of_birth || '',
                gender: d.gender || '',
                placeOfBirthDistrict: d.place_of_birth_district || '',
                placeOfBirthState: d.place_of_birth_state || '',
                occupationType: d.occupation_type || '',
                panNumber: d.pan_number || '',
                email: d.director_email || '',
                contactNumber: d.director_contact || '',
                permanentAddressLine1: d.permanent_address_line1 || '',
                permanentAddressLine2: d.permanent_address_line2 || '',
                permanentCity: d.permanent_city || '',
                permanentState: d.permanent_state || '',
                permanentCountry: d.permanent_country || 'India',
                permanentPincode: d.permanent_pincode || '',
                presentAddressLine1: d.present_address_line1 || '',
                presentAddressLine2: d.present_address_line2 || '',
                presentCity: d.present_city || '',
                presentState: d.present_state || '',
                presentCountry: d.present_country || 'India',
                presentPincode: d.present_pincode || '',
                durationYears: d.duration_of_stay_years || '',
                durationMonths: d.duration_of_stay_months || '',
                isAuthorizedSignatory: d.is_authorized_signatory ? 'Yes' : 'No',
                specimenSignature: d.specimen_signature || null,
                isDirectorInOtherCompany: d.is_director_in_other_company ? 'Yes' : 'No',
                otherCompanyName: d.other_company_name || '',
                otherCompanyPosition: d.other_company_position || '',
                isShareholderInOtherCompany: d.is_shareholder_in_other_company ? 'Yes' : 'No',
                otherShareholderCompanyName: d.other_shareholder_company_name || '',
                otherCompanyShares: d.other_company_shares || '',
                otherCompanyShareValue: d.other_company_share_value || '',
                aadhaarCard: d.aadhaar_doc_path || null,
                passportPhoto: d.photo_path || null,
                panCard: d.pan_doc_path || null,
                bankStatementOrUtilityBill: d.bank_statement_or_utility_bill || null
              }))
            });
            
            console.log('✅ Existing registration data loaded for editing');
          }
        } catch (error) {
          console.error('❌ Error loading existing registration:', error);
        }
      }
    };

    loadFormData();
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
    if (step === 1) {
      // Show success modal for step 1
      setShowStep1CompleteModal(true);
      
      // Wait 4 seconds then move to step 2
      setTimeout(() => {
        setShowStep1CompleteModal(false);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 4000);
      return;
    }
    
    if (step < 3) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Submit form on last step
    handleSubmit();
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress, ignoring duplicate click');
      return;
    }

    try {
      setIsSubmitting(true);
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
          localStorage.removeItem('draftTicketId');
          localStorage.removeItem('editingTicketId');
          
          // Navigate to Private Limited dashboard instead of client dashboard
          navigate('/private-limited-dashboard');
        }, 3000);
      } else {
        console.error('❌ Registration submission failed:', result.message);
        alert(result.message || 'Failed to submit registration. Please try again.');
        setIsSubmitting(false); // Re-enable on error
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      alert('Failed to submit form. Please try again.');
      setIsSubmitting(false); // Re-enable on error
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <NameApplicationContent formData={formData} setFormData={setFormData} disabled={oneasyTeamFill} />;
      case 2:
        return <StartupInformationContent formData={formData} setFormData={setFormData} disabled={oneasyTeamFill} />;
      case 3:
        return <OfficeAddressContent formData={formData} setFormData={setFormData} disabled={oneasyTeamFill} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`min-h-screen bg-[#f3f5f7] ${showStep1CompleteModal ? 'transition-all duration-300' : ''}`}>
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

          {/* OnEasy Team Fill Banner */}
          {oneasyTeamFill && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-green-800">OnEasy Team Will Fill This Form</p>
                <p className="text-sm text-green-700">All fields are now read-only. Our team will complete this form for you.</p>
              </div>
            </div>
          )}

          <div className="rounded-lg p-6">
            {renderStepContent()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting || oneasyTeamFill}
              className={`px-6 py-1.5 rounded-md border border-[#00486D] text-[#00486D] ${(isSubmitting || oneasyTeamFill) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={oneasyTeamFill ? async () => {
                // Save team fill request to database
                setIsSubmitting(true);
                const result = await requestTeamFill();
                if (result.success) {
                  console.log('✅ Team fill request saved');
                }
                setIsSubmitting(false);
                navigate('/private-limited-dashboard');
              } : goNext}
              disabled={isSubmitting}
              className={`px-6 py-1.5 rounded-md text-white font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
            >
              {oneasyTeamFill ? 'Go to Dashboard' : (isSubmitting ? 'Submitting...' : (step === 3 ? 'Submit' : 'Next'))}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Floating Button - Oneasy Team Fill */}
      <button
        type="button"
        onClick={() => {
          const newState = !oneasyTeamFill;
          setOneasyTeamFill(newState);
          // Store team fill state in localStorage
          if (newState) {
            localStorage.setItem('oneasyTeamFill', 'true');
          } else {
            localStorage.removeItem('oneasyTeamFill');
          }
        }}
        className={`fixed bottom-8 right-8 px-6 py-4 rounded-full shadow-2xl font-medium text-white transition-all duration-300 hover:scale-105 z-40 ${
          oneasyTeamFill 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-[#01334C] hover:bg-[#00486D]'
        }`}
      >
        {oneasyTeamFill ? (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            OnEasy Team Will Fill
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Do you want OnEasy team to fill?
          </span>
        )}
      </button>

      {/* Step 1 Complete Modal */}
      {showStep1CompleteModal && (
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
                Thank You!
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Thank you for submitting your proposed company name! We will now proceed with the application to the Ministry of Corporate Affairs. In the meantime, please begin completing the form and uploading the required documents in the sections below.
              </p>
            </div>
          </div>
        </div>
      )}

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

