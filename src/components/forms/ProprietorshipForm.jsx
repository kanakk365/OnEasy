import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import { BasicBusinessDetailsContent, BasicProprietorDetailsContent } from './steps/ProprietorshipSteps';
import { submitProprietorshipRegistration, getProprietorshipByTicketId } from '../../utils/proprietorshipApi';
import { requestTeamFill, checkTeamFillStatus, requestClientFill, checkClientFillStatus, cancelClientFillRequest } from '../../utils/teamFillApi';

function ProprietorshipForm({ 
  packageDetails: propPackageDetails,
  isAdminFilling = false,
  ticketId: propTicketId = null,
  onFormSubmit = null
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTicketId = searchParams.get('ticketId');
  const ticketId = propTicketId || urlTicketId;
  const [draftTicketId, setDraftTicketId] = useState(ticketId || null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  
  const [packageDetails, setPackageDetails] = useState(propPackageDetails);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ step1: {}, step2: {} });
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [oneasyTeamFill, setOneasyTeamFill] = useState(false);
  const [clientFillRequest, setClientFillRequest] = useState(false);
  const [isAdminOrSuperadmin, setIsAdminOrSuperadmin] = useState(false);
  const [isFillingOnBehalf, setIsFillingOnBehalf] = useState(isAdminFilling);

  // Check if user is admin or superadmin
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData.role || '';
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    setIsAdminOrSuperadmin(isAdmin);
    
    // Check if admin is filling for a client
    const adminParam = searchParams.get('admin');
    const clientIdParam = searchParams.get('clientId');
    if (adminParam === 'true' && clientIdParam && isAdmin) {
      setIsFillingOnBehalf(true);
    }
    
    // Check if user clicked "OnEasy Team Fill" button
    const teamFillStatus = localStorage.getItem('oneasyTeamFill');
    if (teamFillStatus === 'true') {
      setOneasyTeamFill(true);
      console.log('✅ Restored team fill state from localStorage');
    }
  }, [searchParams]);

  // Load draft data if ticketId is provided, or load from localStorage
  useEffect(() => {
    const loadFormData = async () => {
      setLoadingDraft(true);
      
      if (ticketId) {
        // Loading existing draft to edit
        console.log('📝 Loading draft proprietorship registration:', ticketId);
        try {
          const response = await getProprietorshipByTicketId(ticketId);
          if (response.success && response.data) {
            const draftData = response.data.details || response.data;
            console.log('✅ Draft data loaded:', draftData);
            
            setFormData({
              step1: {
                businessName: draftData.business_name || '',
                natureOfBusiness: draftData.nature_of_business || '',
                businessEmail: draftData.business_email || '',
                contactNumber: draftData.contact_number || '',
                addressLine1: draftData.address_line1 || '',
                addressLine2: draftData.address_line2 || '',
                city: draftData.city || '',
                state: draftData.state || '',
                country: draftData.country || 'India',
                pincode: draftData.pincode || '',
                maleEmployees: draftData.male_employees || 0,
                femaleEmployees: draftData.female_employees || 0,
                businessType: draftData.business_type || '',
                socialCategory: draftData.social_category || '',
                specialAbled: draftData.special_abled || false,
                bankName: draftData.bank_name || '',
                bankAccountNumber: draftData.bank_account_number || '',
                ifscCode: draftData.ifsc_code || '',
                additionalUnitName: draftData.additional_unit_name || '',
                additionalUnitAddressLine1: draftData.additional_unit_address_line1 || '',
                additionalUnitAddressLine2: draftData.additional_unit_address_line2 || '',
                additionalUnitCity: draftData.additional_unit_city || '',
                additionalUnitState: draftData.additional_unit_state || '',
                additionalUnitCountry: draftData.additional_unit_country || 'India',
                additionalUnitPincode: draftData.additional_unit_pincode || '',
                hasGSTIN: draftData.has_gstin || false,
                gstinNumber: draftData.gstin_number || '',
                dateOfIncorporation: draftData.date_of_incorporation || '',
                businessCommenced: draftData.business_commenced || false,
                filedITR: draftData.filed_itr || false,
                dateOfCommencement: draftData.date_of_commencement || '',
                utilityBill: draftData.utility_bill || '',
                rentalAgreement: draftData.rental_agreement || ''
              },
              step2: {
                proprietorName: draftData.proprietor_name || '',
                dateOfBirth: draftData.date_of_birth || '',
                occupationType: draftData.occupation_type || '',
                proprietorEmail: draftData.proprietor_email || '',
                proprietorContact: draftData.proprietor_contact || '',
                permanentAddressLine1: draftData.permanent_address_line1 || '',
                permanentAddressLine2: draftData.permanent_address_line2 || '',
                permanentCity: draftData.permanent_city || '',
                permanentState: draftData.permanent_state || '',
                permanentCountry: draftData.permanent_country || 'India',
                permanentPincode: draftData.permanent_pincode || '',
                aadhaarCard: draftData.aadhaar_card || '',
                passportPhoto: draftData.passport_photo || '',
                panCard: draftData.pan_card || '',
                bankStatement: draftData.bank_statement || '',
                nameBoard: draftData.name_board || ''
              },
              packageDetails: {
                name: draftData.package_name || '',
                price: draftData.package_price || '',
                priceValue: draftData.package_price || ''
              },
              paymentDetails: {
                paymentId: draftData.razorpay_payment_id || '',
                orderId: draftData.razorpay_order_id || '',
                payment_status: draftData.payment_status || 'paid'
              },
              ticketId: ticketId // Set ticketId for submission
            });
            
            if (draftData.package_name) {
              setPackageDetails({
                name: draftData.package_name,
                price: draftData.package_price,
                priceValue: draftData.package_price
              });
            }
            
            // Check if team fill request exists in database for this ticket
            try {
              const teamFillCheck = await checkTeamFillStatus('proprietorship', ticketId);
              if (teamFillCheck.exists) {
                setOneasyTeamFill(true);
                // Store in localStorage as well
                localStorage.setItem('oneasyTeamFill', 'true');
                localStorage.setItem(`oneasyTeamFill_${ticketId}`, 'true');
                console.log('✅ Team fill request found in database for ticket:', ticketId);
              } else {
                // Fallback: Check localStorage for backward compatibility
                const globalTeamFillStatus = localStorage.getItem('oneasyTeamFill');
                const ticketTeamFillStatus = localStorage.getItem(`oneasyTeamFill_${ticketId}`);
                if (globalTeamFillStatus === 'true' || ticketTeamFillStatus === 'true') {
                  setOneasyTeamFill(true);
                  console.log('✅ Team fill state restored from localStorage for ticket:', ticketId);
                }
              }
            } catch (error) {
              console.error('❌ Error checking team fill status from DB:', error);
              // Fallback to localStorage if DB check fails
              const globalTeamFillStatus = localStorage.getItem('oneasyTeamFill');
              const ticketTeamFillStatus = localStorage.getItem(`oneasyTeamFill_${ticketId}`);
              if (globalTeamFillStatus === 'true' || ticketTeamFillStatus === 'true') {
                setOneasyTeamFill(true);
                console.log('✅ Team fill state restored from localStorage (fallback) for ticket:', ticketId);
              }
            }

            // Check if client fill request exists for this ticket
            try {
              const clientFillCheck = await checkClientFillStatus('proprietorship', ticketId);
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
          alert('Failed to load draft. Please try again.');
        }
      } else {
        // New registration - load from localStorage
        const storedPackage = localStorage.getItem('selectedPackage');
        const storedPayment = localStorage.getItem('paymentDetails');
        
        if (!storedPackage || !storedPayment) {
          if (!isAdminFilling) {
            alert('Please complete payment before accessing the registration form.');
            navigate('/company-categories');
            return;
          }
        } else {
          try {
            const packageData = JSON.parse(storedPackage);
            const paymentData = JSON.parse(storedPayment);
            setPackageDetails(packageData);
            setFormData(prev => ({
              ...prev,
              packageDetails: packageData,
              paymentDetails: paymentData
            }));
            console.log('✅ Package and payment verified - form access granted');
          } catch (e) {
            console.error('Error parsing package data:', e);
            if (!isAdminFilling) {
              alert('Invalid payment data. Please complete payment first.');
              navigate('/company-categories');
              return;
            }
          }
        }
      }
      
      setLoadingDraft(false);
    };
    
    loadFormData();
  }, [ticketId, navigate, isAdminFilling]);

  useEffect(() => {
    if (ticketId && ticketId !== draftTicketId) {
      setDraftTicketId(ticketId);
    }
  }, [ticketId, draftTicketId]);

  const saveDraft = async ({ reason } = {}) => {
    if (loadingDraft) return;
    if (isSubmitting) return;
    if (isDraftSaving) return;

    try {
      setIsDraftSaving(true);
      const paymentDetails = formData.paymentDetails || JSON.parse(localStorage.getItem('paymentDetails') || '{}');
      const submissionData = {
        step1: formData.step1 || {},
        step2: formData.step2 || {},
        packageDetails: formData.packageDetails || packageDetails,
        paymentDetails,
        ticketId: draftTicketId || ticketId || null
      };

      console.log(`💾 Autosaving Proprietorship draft (${reason || 'unknown'})...`, {
        step,
        ticketId: submissionData.ticketId || null
      });

      const result = await submitProprietorshipRegistration(submissionData);
      const newTicketId = result?.data?.ticketId || result?.ticketId || result?.data?.data?.ticketId;

      if (newTicketId) {
        setDraftTicketId(newTicketId);
        localStorage.setItem('editingTicketId', newTicketId);
        if (!searchParams.get('ticketId')) {
          const qs = new URLSearchParams(window.location.search);
          qs.set('ticketId', newTicketId);
          navigate(`/proprietorship-form?${qs.toString()}`, { replace: true });
        }
      }
    } catch (e) {
      console.error('❌ Autosave Proprietorship draft failed:', e);
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

  const handleNext = () => {
    if (step < 2) {
      saveDraft({ reason: `next-step-${step}` });
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
    const shouldNavigate = !isAdminFilling; // Don't navigate if admin is filling
    
    try {
      // If onFormSubmit callback is provided (new registration flow), use it instead
      if (onFormSubmit && isFillingOnBehalf && !ticketId) {
        console.log('📝 New registration flow - calling onFormSubmit callback');
        await onFormSubmit({
          step1: formData.step1 || {},
          step2: formData.step2 || {}
        });
        setIsSubmitting(false);
        return;
      }

      const paymentDetails = formData.paymentDetails || JSON.parse(localStorage.getItem('paymentDetails') || '{}');
      
      const submissionData = {
        step1: formData.step1 || {},
        step2: formData.step2 || {},
        packageDetails: formData.packageDetails || packageDetails,
        paymentDetails: paymentDetails,
        ticketId: draftTicketId || ticketId // Include ticketId for draft updates
      };

      console.log('📤 Submitting proprietorship registration:', submissionData);
      
      try {
        const result = await submitProprietorshipRegistration(submissionData);
        
        if (result.success) {
          console.log('✅ Registration submitted successfully:', result);
          setShowSuccessModal(true);
        }
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
          navigate('/proprietorship-dashboard');
        }, 2000);
      } else if (isAdminFilling && isAdminOrSuperadmin) {
        // If admin is filling, redirect to admin clients page
        setTimeout(() => {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const userRole = userData.role || userData.role_id;
          if (userRole === 'superadmin' || userRole === 2) {
            navigate('/superadmin/clients');
          } else {
            navigate('/admin/clients');
          }
        }, 2000);
      }
    }
  };

  // updateFormData function removed - not used

  const renderStepContent = () => {
    // Fields should be disabled when:
    // 1. Team fill is requested AND user is not admin AND not admin filling on behalf
    // 2. Client fill is requested AND user is admin (admin can't fill, client should fill - regardless of filling on behalf)
    // Fields should be enabled when:
    // 1. Client fill is requested AND user is the client (client should fill)
    // 2. Admin is filling on behalf AND client fill is NOT requested
    const isDisabled = ((oneasyTeamFill && !isAdminOrSuperadmin) && !isFillingOnBehalf) || 
                       (clientFillRequest && isAdminOrSuperadmin);

    switch (step) {
      case 1:
        return (
          <BasicBusinessDetailsContent
            formData={formData}
            setFormData={setFormData}
            disabled={isDisabled}
          />
        );
      case 2:
        return (
          <BasicProprietorDetailsContent
            formData={formData}
            setFormData={setFormData}
            disabled={isDisabled}
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

        {/* Client Fill Request Banner (for admin - fields disabled) */}
        {clientFillRequest && isAdminOrSuperadmin && (
          <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4 mb-6 mt-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-orange-900">Client Fill Requested</p>
              <p className="text-sm text-orange-700">All fields are disabled. The client has been requested to fill this form. Fields will be enabled once the client completes the form.</p>
            </div>
            <button
              onClick={async () => {
                const currentTicketId = ticketId || localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId');
                if (currentTicketId) {
                  const result = await cancelClientFillRequest('proprietorship', currentTicketId);
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
          <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6 mt-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <p className="font-semibold text-blue-900">Please Fill This Form</p>
              <p className="text-sm text-blue-700">Admin has requested you to complete this form. All fields are enabled for you to fill.</p>
            </div>
          </div>
        )}

        {loadingDraft ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading draft...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg p-6">
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 mb-24">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting || (oneasyTeamFill && !isAdminOrSuperadmin) || (clientFillRequest && isAdminOrSuperadmin)}
              className={`px-6 py-1.5 rounded-md border border-[#00486D] text-[#00486D] ${(isSubmitting || (oneasyTeamFill && !isAdminOrSuperadmin) || (clientFillRequest && isAdminOrSuperadmin && !isFillingOnBehalf)) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={(oneasyTeamFill && !isAdminOrSuperadmin) ? async () => {
                // Regular user: Save team fill request and go to dashboard
                // Get ticketId from props, localStorage, or URL params
                const editingTicketId = localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId');
                const urlParams = new URLSearchParams(window.location.search);
                const urlTicketId = urlParams.get('ticketId');
                const currentTicketId = ticketId || editingTicketId || urlTicketId;
                
                setIsSubmitting(true);
                const result = await requestTeamFill('proprietorship', currentTicketId || null);
                if (result.success) {
                  console.log('✅ Team fill request saved');
                }
                setIsSubmitting(false);
                navigate('/proprietorship-dashboard');
              } : (step < 2 ? handleNext : handleSubmit)}
              disabled={isSubmitting}
              className={`px-6 py-1.5 rounded-md text-white font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
            >
              {(oneasyTeamFill && !isAdminOrSuperadmin) ? 'Go to Dashboard' : (isSubmitting ? 'Submitting...' : (step === 2 ? 'Submit' : 'Next'))}
            </button>
          </div>
        </div>
        )}

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
                  Your proprietorship registration has been submitted successfully.
                </p>
                <p className="text-sm text-gray-500 italic">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Button - Ask Client to Fill (For Admins Only) */}
      {isAdminOrSuperadmin && isFillingOnBehalf && !clientFillRequest && (
        <button
          type="button"
          onClick={async () => {
            const currentTicketId = ticketId || localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId');
            const urlParams = new URLSearchParams(window.location.search);
            const clientIdParam = urlParams.get('clientId');
            const currentClientId = clientIdParam || localStorage.getItem('fillingOnBehalfClientId');
            
            if (!currentTicketId || !currentClientId) {
              alert('Missing ticket ID or client ID. Please try again.');
              return;
            }

            const result = await requestClientFill('proprietorship', currentTicketId, currentClientId);
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
      {isAdminOrSuperadmin && isFillingOnBehalf && clientFillRequest && (
        <button
          type="button"
          onClick={async () => {
            const currentTicketId = ticketId || localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId');
            if (currentTicketId) {
              const result = await cancelClientFillRequest('proprietorship', currentTicketId);
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
      {!isAdminOrSuperadmin && (
        <button
          type="button"
          onClick={async () => {
            // Get ticketId from props, localStorage, or URL params
            const editingTicketId = localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId');
            const urlParams = new URLSearchParams(window.location.search);
            const urlTicketId = urlParams.get('ticketId');
            const currentTicketId = ticketId || editingTicketId || urlTicketId;
            
            const newState = !oneasyTeamFill;
            setOneasyTeamFill(newState);
            
            // Store team fill state in localStorage (both globally and per ticketId)
            if (newState) {
              localStorage.setItem('oneasyTeamFill', 'true');
              if (currentTicketId) {
                localStorage.setItem(`oneasyTeamFill_${currentTicketId}`, 'true');
              }
              
              // Save to team fill requests table
              const result = await requestTeamFill('proprietorship', currentTicketId || null);
              if (result.success) {
                console.log('✅ Team fill request saved');
              }
            } else {
              localStorage.removeItem('oneasyTeamFill');
              if (currentTicketId) {
                localStorage.removeItem(`oneasyTeamFill_${currentTicketId}`);
              }
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

export default ProprietorshipForm;

