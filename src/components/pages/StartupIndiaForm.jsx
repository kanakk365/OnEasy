import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StepIndicator from "../forms/StepIndicator";
import { Step1Content, Step2Content, Step3Content, Step4Content, Step5Content } from "../forms/FormSteps";
import { submitStartupIndiaRegistration, getStartupIndiaByTicketId } from "../../utils/startupIndiaApi";
import { requestTeamFill } from "../../utils/teamFillApi";

function StartupIndiaForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId');
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
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [oneasyTeamFill, setOneasyTeamFill] = useState(false);
  const [isAdminOrSuperadmin, setIsAdminOrSuperadmin] = useState(false);
  const [isAdminFilling, setIsAdminFilling] = useState(false);
  
  // Check if user is admin or superadmin and if admin is filling
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData.role || '';
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    setIsAdminOrSuperadmin(isAdmin);
    
    // Check if admin is filling for a client
    const searchParams = new URLSearchParams(window.location.search);
    const adminParam = searchParams.get('admin');
    const clientIdParam = searchParams.get('clientId');
    if (adminParam === 'true' && clientIdParam && isAdmin) {
      setIsAdminFilling(true);
    }
    
    // Check if user clicked "OnEasy Team Fill" button
    const teamFillStatus = localStorage.getItem('oneasyTeamFill');
    setOneasyTeamFill(teamFillStatus === 'true');
  }, []);

  // Load draft data if ticketId is provided, or load from localStorage
  useEffect(() => {
    const loadFormData = async () => {
      setLoadingDraft(true);
      
      if (ticketId) {
        // Loading existing draft to edit
        console.log('📝 Loading draft registration:', ticketId);
        try {
          const response = await getStartupIndiaByTicketId(ticketId);
          if (response.success && response.data) {
            const draftData = response.data;
            console.log('✅ Draft data loaded:', draftData);
            
            // Parse directors_data if it's a string
            let directors = [];
            if (draftData.directors_data) {
              try {
                directors = typeof draftData.directors_data === 'string' 
                  ? JSON.parse(draftData.directors_data) 
                  : draftData.directors_data;
              } catch (e) {
                console.warn('Failed to parse directors_data:', e);
              }
            }
            
            // Map database fields to form structure
            setFormData({
              step1: {
                businessName: draftData.business_name || '',
                businessType: draftData.business_type || '',
                natureOfBusiness: draftData.nature_of_business || '',
                businessEmail: draftData.business_email || '',
                businessContactNumber: draftData.business_contact_number || '',
                numberOfDirectorsPartners: draftData.number_of_directors_partners || '',
                mobileAppLink: draftData.mobile_app_link || '',
                websiteLink: draftData.website_link || '',
                numberOfEmployees: draftData.number_of_employees || '',
                logo: draftData.logo_url || '',
                udyamRegistration: draftData.udyam_registration_url || '',
                certificateOfIncorporation: draftData.certificate_of_incorporation_url || '',
                panEntity: draftData.pan_entity_url || '',
                tanEntity: draftData.tan_entity_url || '',
                recognitionOrAwards: draftData.recognition_or_awards || false
              },
              step2: {
                problemSolving: draftData.problem_solving || '',
                solutionProposal: draftData.solution_proposal || '',
                uniquenessOfSolution: draftData.uniqueness_of_solution || '',
                revenueModel: draftData.revenue_model || '',
                innovationNote: draftData.innovation_note || '',
                innovationOptions: (() => {
                  if (!draftData.innovation_options) return [];
                  try {
                    const parsed = typeof draftData.innovation_options === 'string' 
                      ? JSON.parse(draftData.innovation_options)
                      : draftData.innovation_options;
                    return Array.isArray(parsed) ? parsed : [];
                  } catch (e) {
                    console.warn('Failed to parse innovation_options:', e);
                    return [];
                  }
                })(),
                hasIpr: draftData.has_ipr || false,
                iprDocument: draftData.ipr_document_url || ''
              },
              step3: {
                registeredOfficeAddressLine1: draftData.registered_office_address_line1 || '',
                registeredOfficeAddressLine2: draftData.registered_office_address_line2 || '',
                registeredOfficeCity: draftData.registered_office_city || '',
                registeredOfficeState: draftData.registered_office_state || '',
                registeredOfficeCountry: draftData.registered_office_country || 'India',
                registeredOfficePincode: draftData.registered_office_pincode || '',
                registeredOfficeProof: draftData.registered_office_proof_url || ''
              },
              step4: {
                directors: Array.isArray(directors) ? directors : []
              },
              step5: {
                authorizationLetter: draftData.authorization_letter_url || '',
                authorizedRepresentativeName: draftData.authorized_representative_name || '',
                authorizedRepresentativeDesignation: draftData.authorized_representative_designation || ''
              },
              packageDetails: {
                name: draftData.package_name || '',
                price: draftData.package_price || '',
                priceValue: draftData.package_price || ''
              },
              paymentDetails: {
                paymentId: draftData.payment_id || '',
                orderId: draftData.order_id || '',
                payment_status: draftData.payment_status || 'paid'
              }
            });
          }
        } catch (error) {
          console.error('❌ Error loading draft:', error);
          alert('Failed to load draft. Please try again.');
        }
      } else {
        // New registration - load from localStorage
        const selectedPackage = localStorage.getItem('selectedPackage');
        const paymentDetails = localStorage.getItem('paymentDetails');

        if (!selectedPackage || !paymentDetails) {
          alert('Please complete payment before accessing the registration form.');
          navigate('/registration-categories');
          return;
        }

        const packageDetails = JSON.parse(selectedPackage);
        const paymentData = JSON.parse(paymentDetails);
        
        console.log('📦 Loaded package details:', packageDetails);
        console.log('💳 Loaded payment details:', paymentData);
        
        setFormData(prev => ({
          ...prev,
          packageDetails,
          paymentDetails: paymentData
        }));
      }
      
      setLoadingDraft(false);
      
      setLoadingDraft(false);
    };
    
    loadFormData();
  }, [navigate, ticketId]);
  
  // Show loading state while fetching draft
  if (loadingDraft && ticketId) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading draft registration...</p>
        </div>
      </div>
    );
  }

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
    let shouldNavigate = true;
    
    try {
      setIsSubmitting(true);
      console.log('📤 Submitting Startup India registration...', formData);
      
      // Ensure payment and package details are included in submission
      // Preserve package details from formData or use existing values
      const packageName = formData.packageDetails?.name || formData.packageName;
      const packagePrice = formData.packageDetails?.priceValue || formData.packageDetails?.price || formData.packagePrice;
      
      const submissionData = {
        ...formData,
        // Explicitly include payment details
        paymentId: formData.paymentDetails?.paymentId || formData.paymentDetails?.orderId,
        orderId: formData.paymentDetails?.orderId || formData.paymentDetails?.paymentId,
        paymentStatus: formData.paymentDetails?.payment_status || 'paid',
        // Explicitly include package details - preserve existing if available
        packageName: packageName,
        packagePrice: packagePrice,
        packageDetails: {
          name: packageName,
          price: packagePrice,
          priceValue: packagePrice
        },
        // Include ticketId if editing existing draft
        ticketId: ticketId || null
      };
      
      console.log('📦 Package details in submission:', {
        packageName,
        packagePrice,
        formDataPackageDetails: formData.packageDetails
      });
      
      if (ticketId) {
        console.log('📝 Updating existing draft:', ticketId);
      }
      
      try {
        const response = await submitStartupIndiaRegistration(submissionData);
        
        console.log('✅ Registration submitted successfully:', response);
        const ticketId = response.ticketId || response.data?.ticket_id;
        console.log('🎫 Ticket ID:', ticketId);
        
        setShowSuccessModal(true);
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        // Don't show error for empty forms - they're saved as drafts
        if (!apiError.message?.includes('Failed to save')) {
          console.warn('⚠️ Registration might be saved as draft');
        }
      }
      
      // Clear localStorage
      localStorage.removeItem('selectedPackage');
      localStorage.removeItem('paymentDetails');
      localStorage.removeItem('selectedRegistrationType');
      localStorage.removeItem('selectedRegistrationTitle');
      
    } catch (error) {
      console.error('❌ Error submitting registration:', error);
      // Don't block navigation on error - draft might exist
    } finally {
      setIsSubmitting(false);
      
      // Always navigate to dashboard after submission (success or error)
      // Empty forms are saved as drafts and should appear in the dashboard
      if (shouldNavigate) {
        setTimeout(() => {
          navigate('/startup-india-dashboard');
        }, 2000);
      }
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
        return <Step1Content formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2Content formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3Content formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step4Content formData={formData} setFormData={setFormData} />;
      case 5:
        return <Step5Content formData={formData} setFormData={setFormData} />;
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

        {/* Admin Filling on Behalf Banner */}
        {isAdminFilling && isAdminOrSuperadmin && (
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

          <div className="flex justify-between mt-8 mb-24">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-1.5 rounded-md border border-[#CFE6F0] text-[#00486D] cursor-pointer disabled:opacity-50"
              disabled={isSubmitting || (oneasyTeamFill && !isAdminOrSuperadmin)}
            >
              Back
            </button>
            <button
              type="button"
              onClick={(oneasyTeamFill && !isAdminOrSuperadmin) ? async () => {
                // Regular user: Save team fill request and go to dashboard
                setIsSubmitting(true);
                const result = await requestTeamFill('startup-india', ticketId || null);
                if (result.success) {
                  console.log('✅ Team fill request saved');
                }
                setIsSubmitting(false);
                navigate('/startup-india-dashboard');
              } : goNext}
              className="px-6 py-1.5 rounded-md text-white font-medium cursor-pointer disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #01334C 0%, #00486D 100%)' }}
              disabled={isSubmitting}
            >
              {(oneasyTeamFill && !isAdminOrSuperadmin) ? 'Go to Dashboard' : (isSubmitting ? 'Submitting...' : (step === 5 ? 'Submit' : 'Next'))}
            </button>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
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
              <p className="text-sm text-gray-500 italic">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

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
              const result = await requestTeamFill('startup-india', ticketId || null);
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
    </div>
  );
}

export default StartupIndiaForm;
