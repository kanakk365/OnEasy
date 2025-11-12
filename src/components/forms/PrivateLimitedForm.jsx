import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import { NameApplicationContent, StartupInformationContent, OfficeAddressContent, DirectorDetailsContent, AuthorizationLetterContent } from './steps/PrivateLimitedSteps';
import { submitPrivateLimitedRegistration } from '../../utils/privateLimitedApi';
import { requestTeamFill } from '../../utils/teamFillApi';

function PrivateLimitedForm({ 
  packageDetails: propPackageDetails, 
  onClose,
  isAdminFilling = false,
  clientId = null,
  ticketId = null,
  initialData = null,
  onStepChange = null
}) {
  const navigate = useNavigate();
  const [packageDetails, setPackageDetails] = useState(propPackageDetails);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showStep1CompleteModal, setShowStep1CompleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oneasyTeamFill, setOneasyTeamFill] = useState(false);
  const [isAdminOrSuperadmin, setIsAdminOrSuperadmin] = useState(false);
  const [isFillingOnBehalf, setIsFillingOnBehalf] = useState(isAdminFilling);
  const [nameApplicationStatus, setNameApplicationStatus] = useState('pending');
  const [formData, setFormData] = useState({
    numberOfDirectors: 1,
    numberOfShareholders: 1
  });
  
  // Check if user is admin or superadmin
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData.role || userData.role_id;
    
    // Check if user is admin (role: 'admin' or role_id: 1 or 2)
    const isAdmin = userRole === 'admin' || userRole === 1 || userRole === 'superadmin' || userRole === 2;
    setIsAdminOrSuperadmin(isAdmin);
    
    // Notify initial step
    if (onStepChange) onStepChange(step);
    
    console.log('👤 User role:', userRole, '| Is Admin/Superadmin:', isAdmin);
  }, []);

  // Load package details and existing registration data if editing
  useEffect(() => {
    const loadFormData = async () => {
      console.log('🔍 Form props:', { isAdminFilling, ticketId, clientId, hasInitialData: !!initialData });
      
      // If admin is filling from modal (passed as props)
      if (isAdminFilling && ticketId) {
        console.log('🔧 Admin filling form from modal for ticket:', ticketId);
        setIsFillingOnBehalf(true);
      } else {
        // Check if admin is filling on behalf of client (from URL params)
        const urlParams = new URLSearchParams(window.location.search);
        const urlClientId = urlParams.get('clientId');
        const urlTicketId = urlParams.get('ticketId');
        
        if (urlClientId && urlTicketId && isAdminOrSuperadmin) {
          console.log('🔧 Admin filling form on behalf of client:', urlClientId, 'Ticket:', urlTicketId);
          setIsFillingOnBehalf(true);
          localStorage.setItem('fillingOnBehalfTicketId', urlTicketId);
          localStorage.setItem('fillingOnBehalfClientId', urlClientId);
        }
      }

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
        } else if (!isFillingOnBehalf) {
          // No package or payment data - redirect back (unless admin filling on behalf)
          console.warn('⚠️ No payment found - redirecting to packages');
          alert('Please complete payment before accessing the registration form.');
          navigate('/company-categories');
          return;
        }
      }

      // Check if we're editing an existing registration
      let registrationData = null;
      
      // If initialData is provided (admin filling from modal), use it
      if (initialData) {
        console.log('📝 Using provided initialData for form');
        registrationData = initialData;
      } else {
        // Otherwise, check localStorage for editing ticket ID
        const editingTicketId = localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId') || ticketId;
        if (editingTicketId) {
          console.log('📝 Loading existing registration for editing:', editingTicketId);
          try {
            const { getRegistrationByTicketId } = await import('../../utils/privateLimitedApi');
            const result = await getRegistrationByTicketId(editingTicketId);
            
            if (result.success && result.data) {
              registrationData = result.data;
            }
          } catch (error) {
            console.error('❌ Error loading existing registration:', error);
          }
        }
      }
      
      // If we have registration data, pre-fill the form
      if (registrationData && registrationData.details) {
        const reg = registrationData.details;
        const dirs = registrationData.directors || [];
        
        // Set the name application status
        setNameApplicationStatus(reg.name_application_status || 'pending');
            
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
            
            console.log('✅ Registration data loaded for editing');
      }
    };

    loadFormData();
  }, [packageDetails, navigate, isAdminOrSuperadmin]);

  const steps = [
    "Name Application",
    "Basic Company Details",
    "Basic Directors and Shareholders Details",
  ];

  const goBack = () => {
    if (step > 1) {
      const newStep = step - 1;
      setStep(newStep);
      if (onStepChange) onStepChange(newStep);
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
        const newStep = 2;
        setStep(newStep);
        if (onStepChange) onStepChange(newStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 4000);
      return;
    }
    
    if (step < 3) {
      const newStep = step + 1;
      setStep(newStep);
      if (onStepChange) onStepChange(newStep);
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

    // Check if we already submitted successfully (use a ref or localStorage flag)
    const submissionKey = `submitting_${ticketId || 'new'}`;
    if (localStorage.getItem(submissionKey) === 'true') {
      console.log('⚠️ Already submitted this registration, preventing duplicate');
      return;
    }

    try {
      setIsSubmitting(true);
      localStorage.setItem(submissionKey, 'true');
      console.log('📝 Submitting Private Limited registration...');
      console.log('Form Data:', formData);
      console.log('🔍 Submitting for clientId:', clientId, '| isAdminFilling:', isAdminFilling, '| ticketId:', ticketId);
      
      // Call API to submit registration (pass clientId if admin filling, pass ticketId if editing)
      const result = await submitPrivateLimitedRegistration(formData, isAdminFilling ? clientId : null, ticketId);
      
      if (result.success) {
        console.log('✅ Registration submitted successfully:', result.data);
        console.log('🎫 Ticket ID created:', result.data.ticket_id);
        console.log('📝 Registration submitted flag:', result.data.registration?.registration_submitted);
        console.log('📊 Full response:', JSON.stringify(result.data, null, 2));
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Wait 3 seconds then redirect to dashboard or close modal
        setTimeout(() => {
          // Clear submission flag
          localStorage.removeItem(submissionKey);
          
          // Clear stored data after successful submission
          if (!isAdminFilling) {
            localStorage.removeItem('selectedPackage');
            localStorage.removeItem('paymentDetails');
            localStorage.removeItem('draftTicketId');
            localStorage.removeItem('editingTicketId');
            localStorage.removeItem('fillingOnBehalfTicketId');
            localStorage.removeItem('fillingOnBehalfClientId');
          }
          
          // If admin filling, use onClose callback or navigate to admin panel
          if (isAdminFilling) {
            if (onClose) {
              onClose(); // Calls handleClose which navigates to /admin/clients
            } else {
              // Fallback if onClose not provided
              const userData = JSON.parse(localStorage.getItem('user') || '{}');
              const userRole = userData.role || userData.role_id;
              if (userRole === 'superadmin' || userRole === 2) {
                navigate('/superadmin/clients');
              } else {
                navigate('/admin/clients');
              }
            }
          } else {
            // Regular user navigation
            navigate('/private-limited-dashboard');
          }
        }, 3000);
      } else {
        console.error('❌ Registration submission failed:', result.message);
        alert(result.message || 'Failed to submit registration. Please try again.');
        localStorage.removeItem(submissionKey); // Clear flag on error
        setIsSubmitting(false); // Re-enable on error
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      alert('Failed to submit form. Please try again.');
      localStorage.removeItem(submissionKey); // Clear flag on error
      setIsSubmitting(false); // Re-enable on error
    }
  };

  const renderStepContent = () => {
    // Admin/Superadmin should be able to fill the form, regular users should see it disabled
    // When admin is filling on behalf, fields should always be enabled
    const isDisabled = (oneasyTeamFill && !isAdminOrSuperadmin) && !isFillingOnBehalf;
    
    switch (step) {
      case 1:
        return <NameApplicationContent formData={formData} setFormData={setFormData} disabled={isDisabled} nameApplicationStatus={nameApplicationStatus} />;
      case 2:
        return <StartupInformationContent formData={formData} setFormData={setFormData} disabled={isDisabled} isAdmin={isAdminOrSuperadmin} />;
      case 3:
        return <OfficeAddressContent formData={formData} setFormData={setFormData} disabled={isDisabled} />;
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

          {/* Admin Filling on Behalf Banner */}
          {isFillingOnBehalf && isAdminOrSuperadmin && (
            <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6 mt-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-blue-900">Admin Mode: Filling Form on Behalf of Client</p>
                <p className="text-sm text-blue-700">You are completing this registration form on behalf of the client. All fields are enabled for you to fill.</p>
              </div>
            </div>
          )}

          {/* OnEasy Team Fill Banner (for regular users) */}
          {oneasyTeamFill && !isAdminOrSuperadmin && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6 mt-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-green-900">OnEasy Team Will Fill This Form</p>
                <p className="text-sm text-green-700">All fields are now read-only. Our team will complete this form for you and notify you once done.</p>
              </div>
            </div>
          )}

          <div className="rounded-lg p-6">
            {renderStepContent()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting || (oneasyTeamFill && !isAdminOrSuperadmin)}
              className={`px-6 py-1.5 rounded-md border border-[#00486D] text-[#00486D] ${(isSubmitting || (oneasyTeamFill && !isAdminOrSuperadmin)) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={(oneasyTeamFill && !isAdminOrSuperadmin) ? async () => {
                // Regular user: Save team fill request and go to dashboard
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
              {(oneasyTeamFill && !isAdminOrSuperadmin) ? 'Go to Dashboard' : (isSubmitting ? 'Submitting...' : (step === 3 ? 'Submit' : 'Next'))}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Floating Button - Oneasy Team Fill (For Users Only) */}
      {!isAdminOrSuperadmin && (
        <button
          type="button"
          onClick={async () => {
            const newState = !oneasyTeamFill;
            setOneasyTeamFill(newState);
            
            // Store team fill state in localStorage
            if (newState) {
              localStorage.setItem('oneasyTeamFill', 'true');
              
              // Save to team fill requests table
              const result = await requestTeamFill();
              if (result.success) {
                console.log('✅ Team fill request saved');
              }
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
      )}

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



















