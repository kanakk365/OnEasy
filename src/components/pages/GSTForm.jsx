import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StepIndicator from "../forms/StepIndicator";
import { Step1Content, Step2Content } from "../forms/GSTSteps";
import { submitGSTRegistration, getGSTByTicketId } from "../../utils/gstApi";
import { requestTeamFill, checkClientFillStatus, requestClientFill, cancelClientFillRequest } from "../../utils/teamFillApi";

function GSTForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  const [draftTicketId, setDraftTicketId] = useState(ticketId || null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: {},
    step2: { directors: [] }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [oneasyTeamFill, setOneasyTeamFill] = useState(false);
  const [clientFillRequest, setClientFillRequest] = useState(false);
  const [isAdminOrSuperadmin, setIsAdminOrSuperadmin] = useState(false);
  const [isAdminFilling, setIsAdminFilling] = useState(false);
  const [clientId, setClientId] = useState(null);
  
  useEffect(() => {
    if (ticketId && ticketId !== draftTicketId) {
      setDraftTicketId(ticketId);
    }
  }, [ticketId, draftTicketId]);

  // Check if user is admin or superadmin and if admin is filling
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData.role || '';
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    setIsAdminOrSuperadmin(isAdmin);
    
    // Check if admin is filling for a client
    const adminParam = searchParams.get('admin');
    const clientIdParam = searchParams.get('clientId');
    if (adminParam === 'true' && clientIdParam && isAdmin) {
      setIsAdminFilling(true);
      setClientId(clientIdParam);
    }
    
    // Check if user clicked "OnEasy Team Fill" button
    const teamFillStatus = localStorage.getItem('oneasyTeamFill');
    setOneasyTeamFill(teamFillStatus === 'true');
  }, [searchParams]);

  // Load draft data if ticketId is provided, or load from localStorage
  useEffect(() => {
    const loadFormData = async () => {
      setLoadingDraft(true);
      
      if (ticketId) {
        // Loading existing draft to edit
        console.log('📝 Loading draft registration:', ticketId);
        try {
          const response = await getGSTByTicketId(ticketId);
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
                tradeName: draftData.trade_name || '',
                natureOfBusiness: draftData.nature_of_business || '',
                constitutionOfBusiness: draftData.constitution_of_business || '',
                businessEmail: draftData.business_email || '',
                contactNumber: draftData.business_phone || draftData.contact_number || '',
                addressLine1: draftData.address_line1 || '',
                addressLine2: draftData.address_line2 || '',
                city: draftData.city || '',
                state: draftData.state || '',
                country: draftData.country || 'India',
                pincode: draftData.pincode || '',
                additionalAddressLine1: draftData.additional_address_line1 || '',
                additionalAddressLine2: draftData.additional_address_line2 || '',
                additionalCity: draftData.additional_city || '',
                additionalState: draftData.additional_state || '',
                additionalPincode: draftData.additional_pincode || '',
                electricityBill: draftData.electricity_bill_url || '',
                propertyTax: draftData.property_tax_url || '',
                rentalAgreement: draftData.rental_agreement_url || '',
                landlordPanCard: draftData.landlord_pan_card_url || '',
                landlordAadhaarCard: draftData.landlord_aadhaar_card_url || '',
                businessPanCard: draftData.pan_card_url || '',
                principalPlacePhoto: draftData.principal_place_photo_url || '',
                businessBankStatement: draftData.business_bank_statement_url || '',
                numberOfDirectorsPartners: draftData.number_of_directors_partners || 1,
                cinLlpNumber: draftData.cin_llp_number || '',
                partnershipDeed: draftData.partnership_deed_url || '',
                certificateOfIncorporation: draftData.certificate_of_incorporation_url || ''
              },
              step2: {
                directors: directors.length > 0 ? directors : [{
                  name: '',
                  isAuthorizedSignatory: 'No',
                  aadhaarCard: '',
                  passportPhoto: '',
                  panCard: '',
                  email: '',
                  mobileNumber: ''
                }]
              }
            });

            // Check if client fill request exists for this ticket
            try {
              const clientFillCheck = await checkClientFillStatus('gst', ticketId);
              if (clientFillCheck.exists) {
                setClientFillRequest(true);
                console.log('✅ Client fill request found in database for ticket:', ticketId);
              }
            } catch (error) {
              console.error('❌ Error checking client fill status from DB:', error);
            }
          }
        } catch (error) {
          console.error('❌ Error loading draft:', error);
        }
      } else {
        // Load package and payment details from localStorage
        const selectedPackage = JSON.parse(localStorage.getItem('selectedPackage') || '{}');
        const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');
        
        setFormData(prev => ({
          ...prev,
          packageDetails: selectedPackage,
          paymentDetails: paymentDetails
        }));
      }
      
      setLoadingDraft(false);
    };
    
    loadFormData();
  }, [ticketId]);

  const nextStep = () => {
    if (step < 2) {
      // Save draft before moving to next step
      saveDraft({ reason: `next-step-${step}` });
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleTeamFillRequest = async () => {
    try {
      // Get ticketId from URL params, localStorage, or props
      const editingTicketId = localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId');
      const currentTicketId = ticketId || editingTicketId;
      
      // Pass ticketId if available (for existing registrations)
      const result = await requestTeamFill('gst', currentTicketId || null);
      if (result.success) {
        setOneasyTeamFill(true);
        localStorage.setItem('oneasyTeamFill', 'true');
        return result;
      }
      return result;
    } catch (error) {
      console.error('Error requesting team fill:', error);
      return { success: false, message: error.message };
    }
  };

  const handleSubmit = async (shouldNavigate = true) => {
    try {
      setIsSubmitting(true);
      console.log('📤 Submitting GST registration...', formData);
      
      // Ensure payment and package details are included in submission
      const packageName = formData.packageDetails?.name || formData.packageName;
      const packagePrice = formData.packageDetails?.priceValue || formData.packageDetails?.price || formData.packagePrice;
      
      const submissionData = {
        ...formData,
        paymentId: formData.paymentDetails?.paymentId || formData.paymentDetails?.orderId,
        orderId: formData.paymentDetails?.orderId || formData.paymentDetails?.paymentId,
        paymentStatus: formData.paymentDetails?.payment_status || 'paid',
        packageName: packageName,
        packagePrice: packagePrice,
        packageDetails: {
          name: packageName,
          price: packagePrice,
          priceValue: packagePrice
        },
        ticketId: draftTicketId || ticketId || null,
        // Pass clientId if admin is filling on behalf
        ...(isAdminFilling && clientId ? { clientId } : {})
      };
      
      if (ticketId) {
        console.log('📝 Updating existing draft:', ticketId);
      }
      
      try {
        const response = await submitGSTRegistration(submissionData);
        
        console.log('✅ Registration submitted successfully:', response);
        const ticketId = response.ticketId || response.data?.ticket_id;
        console.log('🎫 Ticket ID:', ticketId);
        
        if (ticketId) {
          setDraftTicketId(ticketId);
          localStorage.setItem('editingTicketId', ticketId);
          if (!searchParams.get('ticketId')) {
            const qs = new URLSearchParams(window.location.search);
            qs.set('ticketId', ticketId);
            navigate(`/gst-form?${qs.toString()}`, { replace: true });
          }
        }

        setShowSuccessModal(true);
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
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
    } finally {
      setIsSubmitting(false);
      
      // Always navigate after submission
      if (shouldNavigate) {
        setTimeout(() => {
          // If admin is filling, navigate back to client overview, otherwise to user dashboard
          if (isAdminFilling && clientId) {
            navigate(`/admin/client-overview/${clientId}`);
          } else {
            navigate('/gst-dashboard');
          }
        }, 2000);
      }
    }
  };

  const saveDraft = async ({ reason } = {}) => {
    if (loadingDraft) return;
    if (isSubmitting) return;
    if (isDraftSaving) return;

    try {
      setIsDraftSaving(true);
      console.log(`💾 Autosaving GST draft (${reason || 'unknown'})...`, { step, ticketId: draftTicketId || ticketId || null });
      await handleSubmit(false);
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Debounced autosave whenever formData changes
  useEffect(() => {
    const t = setTimeout(() => {
      saveDraft({ reason: 'debounced-change' });
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const steps = [
    "Basic Business Details",
    "Proprietor/Partner/Director Details"
  ];

  const renderStepContent = () => {
    // Fields should be disabled when:
    // 1. Team fill is requested AND user is not admin AND not admin filling on behalf
    // 2. Client fill is requested AND user is admin (admin can't fill, client should fill - regardless of filling on behalf)
    // Fields should be enabled when:
    // 1. Client fill is requested AND user is the client (client should fill)
    // 2. Admin is filling on behalf AND client fill is NOT requested
    const isDisabled = ((oneasyTeamFill && !isAdminOrSuperadmin) && !isAdminFilling) || 
                       (clientFillRequest && isAdminOrSuperadmin);
    
    switch (step) {
      case 1:
        return <Step1Content formData={formData} setFormData={setFormData} disabled={isDisabled} />;
      case 2:
        return <Step2Content formData={formData} setFormData={setFormData} disabled={isDisabled} />;
      default:
        return null;
    }
  };

  if (loadingDraft) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      {/* Admin Banner */}
      {isAdminFilling && (
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6 mt-6 mx-auto max-w-6xl flex items-center gap-3">
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
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6 mt-6 mx-auto max-w-6xl flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-green-900">OnEasy Team Will Fill This Form</p>
            <p className="text-sm text-green-700">All fields are now read-only. Our team will complete this form for you and notify you once done.</p>
          </div>
        </div>
      )}

      {/* Client Fill Request Banner (for admin - fields disabled) */}
      {clientFillRequest && isAdminOrSuperadmin && (
        <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4 mb-6 mt-6 mx-auto max-w-6xl flex items-center gap-3">
          <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-orange-900">Client Fill Requested</p>
            <p className="text-sm text-orange-700">All fields are disabled. The client has been requested to fill this form. Fields will be enabled once the client completes the form.</p>
          </div>
          <button
            onClick={async () => {
              if (ticketId) {
                const result = await cancelClientFillRequest('gst', ticketId);
                if (result.success) {
                  setClientFillRequest(false);
                  alert('Client fill request cancelled. Fields are now enabled.');
                } else {
                  alert('Failed to cancel client fill request. Please try again.');
                }
              }
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* Client Fill Request Banner (for client - fields enabled) */}
      {clientFillRequest && !isAdminOrSuperadmin && (
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6 mt-6 mx-auto max-w-6xl flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <div>
            <p className="font-semibold text-blue-900">Please Fill This Form</p>
            <p className="text-sm text-blue-700">Admin has requested you to complete this form. All fields are enabled for you to fill.</p>
          </div>
        </div>
      )}

      {/* Floating Button - Ask Client to Fill (For Admins Only) */}
      {isAdminOrSuperadmin && isAdminFilling && !clientFillRequest && (
        <button
          type="button"
          onClick={async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const clientIdParam = urlParams.get('clientId');
            
            if (!ticketId || !clientIdParam) {
              alert('Missing ticket ID or client ID. Please try again.');
              return;
            }

            const result = await requestClientFill('gst', ticketId, clientIdParam);
            if (result.success) {
              setClientFillRequest(true);
              alert('Client has been requested to fill the form. Fields are now disabled for you.');
            } else {
              alert(result.message || 'Failed to request client fill. Please try again.');
            }
          }}
          className="fixed bottom-8 right-8 px-6 py-4 rounded-full shadow-2xl font-medium text-white transition-all duration-300 hover:scale-105 z-40 bg-orange-600 hover:bg-orange-700"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Ask Client to Fill
          </span>
        </button>
      )}

      {/* Floating Button - Client Fill Requested (For Admins - to cancel) */}
      {isAdminOrSuperadmin && isAdminFilling && clientFillRequest && (
        <button
          type="button"
          onClick={async () => {
            if (ticketId) {
              const result = await cancelClientFillRequest('gst', ticketId);
              if (result.success) {
                setClientFillRequest(false);
                alert('Client fill request cancelled. Fields are now enabled.');
              } else {
                alert(result.message || 'Failed to cancel client fill request. Please try again.');
              }
            }
          }}
          className="fixed bottom-8 right-8 px-6 py-4 rounded-full shadow-2xl font-medium text-white transition-all duration-300 hover:scale-105 z-40 bg-green-600 hover:bg-green-700"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Client Fill Requested (Click to Cancel)
          </span>
        </button>
      )}

      {/* Floating Button - Oneasy Team Fill (For Users Only) */}
      {!isAdminOrSuperadmin && !isAdminFilling && (
        <button
          type="button"
          onClick={async () => {
            const newState = !oneasyTeamFill;
            setOneasyTeamFill(newState);
            
            // Store team fill state in localStorage
            if (newState) {
              localStorage.setItem('oneasyTeamFill', 'true');
              
              // Save to team fill requests table
              const result = await handleTeamFillRequest();
              if (result && result.success) {
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

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-[#28303F]">
            Add your Details
          </h1>
          {formData.packageDetails && (
            <p className="text-sm text-gray-600">
              Package: <span className="font-medium">{formData.packageDetails.name}</span> - <span className="font-semibold text-[#00486D]">₹{formData.packageDetails.price || formData.packageDetails.priceValue}</span>
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={steps.length} steps={steps} />

        {/* Form Content - White Box */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 mb-24">
          <button
            onClick={prevStep}
            disabled={step === 1 || (oneasyTeamFill && !isAdminOrSuperadmin) || (clientFillRequest && isAdminOrSuperadmin)}
            className={`px-6 py-1.5 rounded-md border border-[#00486D] text-[#00486D] ${
              (step === 1 || (oneasyTeamFill && !isAdminOrSuperadmin) || (clientFillRequest && isAdminOrSuperadmin && !isAdminFilling))
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            Back
          </button>
          <button
            onClick={(oneasyTeamFill && !isAdminOrSuperadmin) ? async () => {
              // Regular user: Save team fill request and go to dashboard
              setIsSubmitting(true);
              const result = await handleTeamFillRequest();
              if (result && result.success) {
                console.log('✅ Team fill request saved');
              }
              setIsSubmitting(false);
              navigate('/gst-dashboard');
            } : (step < steps.length ? nextStep : () => handleSubmit(true))}
            disabled={isSubmitting || (oneasyTeamFill && !isAdminOrSuperadmin)}
            className={`px-6 py-1.5 rounded-md text-white font-medium ${
              (isSubmitting || (oneasyTeamFill && !isAdminOrSuperadmin))
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
            style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
          >
            {(oneasyTeamFill && !isAdminOrSuperadmin) ? 'Go to Dashboard' : (isSubmitting ? 'Submitting...' : (step < steps.length ? 'Next' : 'Submit'))}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Registration Submitted Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Your GST registration has been submitted. You will be redirected to your dashboard shortly.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/gst-dashboard');
                }}
                className="px-6 py-3 bg-[#00486D] text-white rounded-lg font-medium hover:bg-[#01334C] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GSTForm;

