import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StepIndicator from "../forms/StepIndicator";
import { Step1Content, Step2Content, Step3Content, Step4Content, Step5Content } from "../forms/FormSteps";
import { submitStartupIndiaRegistration, getStartupIndiaByTicketId } from "../../utils/startupIndiaApi";
import { requestTeamFill, checkTeamFillStatus, requestClientFill, checkClientFillStatus, cancelClientFillRequest } from "../../utils/teamFillApi";

function StartupIndiaForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  const [draftTicketId, setDraftTicketId] = useState(ticketId || null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
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
  const [clientFillRequest, setClientFillRequest] = useState(false);
  const [isAdminOrSuperadmin, setIsAdminOrSuperadmin] = useState(false);
  const [isAdminFilling, setIsAdminFilling] = useState(false);
  const [clientId, setClientId] = useState(null);
  const justLoadedDataRef = useRef(false); // Track if we just loaded data to prevent immediate autosave
  
  // Keep draftTicketId in sync when URL ticketId changes
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
    const searchParams = new URLSearchParams(window.location.search);
    const adminParam = searchParams.get('admin');
    const clientIdParam = searchParams.get('clientId');
    
    // Check if admin is filling - either from URL params or if admin is on admin route
    if (isAdmin) {
      const isOnAdminRoute = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/superadmin/');
      const hasClientId = !!clientIdParam;
      
      // Admin is filling if:
      // 1. URL has admin=true AND clientId, OR
      // 2. Admin is on admin route AND has clientId (fallback for cases where admin param might be missing)
      if ((adminParam === 'true' && hasClientId) || (isOnAdminRoute && hasClientId)) {
        setIsAdminFilling(true);
        setClientId(clientIdParam);
        console.log('✅ Admin filling detected:', { adminParam, clientIdParam, isOnAdminRoute });
      }
    }
    
    // Check if user clicked "OnEasy Team Fill" button
    const teamFillStatus = localStorage.getItem('oneasyTeamFill');
    setOneasyTeamFill(teamFillStatus === 'true');
  }, []);

  // Load draft data if ticketId is provided, or load from localStorage
  useEffect(() => {
    const loadFormData = async () => {
      setLoadingDraft(true);
      
      // Safety timeout: if loading takes more than 10 seconds, stop loading
      const loadingTimeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout - stopping loading state');
        setLoadingDraft(false);
      }, 10000);
      
      if (ticketId) {
        // Loading existing draft to edit
        console.log('📝 Loading draft registration:', ticketId);
        try {
          const response = await getStartupIndiaByTicketId(ticketId);
          console.log('📥 Full API response:', response);
          console.log('📥 Response type:', typeof response);
          console.log('📥 Response keys:', Object.keys(response || {}));
          
          // API client returns parsed JSON directly: { success: true, data: {...} }
          // Check if response has success and data properties
          if (!response) {
            console.error('❌ No response from API');
            alert('Failed to load registration data. Please try again.');
            return;
          }
          
          if (!response.success) {
            console.error('❌ API returned error:', response);
            alert(response.message || 'Failed to load registration data. Please try again.');
            return;
          }
          
          if (!response.data) {
            console.error('❌ No data in API response:', response);
            alert('Registration data not found. Please try again.');
            return;
          }
          
          const draftData = response.data;
          console.log('📥 API Response structure:', {
            success: response.success,
            hasData: !!response.data,
            dataKeys: Object.keys(draftData || {}),
            businessName: draftData.business_name,
            businessType: draftData.business_type,
            businessEmail: draftData.business_email,
            businessContactNumber: draftData.business_contact_number,
            natureOfBusiness: draftData.nature_of_business
          });
          
          // Verify we have actual data
          if (!draftData.business_name && !draftData.business_email && !draftData.business_contact_number) {
            console.warn('⚠️ Warning: API returned empty or incomplete data');
            console.warn('⚠️ Draft data object:', draftData);
          }
          
          console.log('✅ Draft data loaded:', draftData);
            console.log('📋 Draft data fields:', {
              business_name: draftData.business_name,
              business_type: draftData.business_type,
              nature_of_business: draftData.nature_of_business,
              business_email: draftData.business_email,
              business_contact_number: draftData.business_contact_number
            });
            
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
            const mappedFormData = {
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
                // Preserve payment IDs - use empty string only if truly null/undefined, not if they exist
                paymentId: draftData.razorpay_payment_id || draftData.payment_id || draftData.razorpay_order_id || '',
                orderId: draftData.order_id || draftData.razorpay_order_id || draftData.razorpay_payment_id || '',
                razorpay_payment_id: draftData.razorpay_payment_id || null,
                razorpay_order_id: draftData.razorpay_order_id || null,
                payment_status: draftData.payment_status || 'paid'
              }
            };
            
            console.log('📝 Mapped form data:', mappedFormData);
            console.log('📝 Step1 data:', mappedFormData.step1);
            console.log('📝 Step1 businessName:', mappedFormData.step1.businessName);
            console.log('📝 Step1 businessType:', mappedFormData.step1.businessType);
            console.log('📝 Step1 businessEmail:', mappedFormData.step1.businessEmail);
            console.log('📝 Step1 businessContactNumber:', mappedFormData.step1.businessContactNumber);
            
            // Verify we have actual data before setting
            if (!mappedFormData.step1.businessName && !mappedFormData.step2.problemSolving && !mappedFormData.step3.registeredOfficeAddressLine1) {
              console.warn('⚠️ Warning: Loaded form data appears to be empty');
            }
            
            // Set formData with all loaded data - set directly (no merge needed on initial load)
            // Mark that we just loaded data to prevent immediate autosave
            justLoadedDataRef.current = true;
            
            setFormData(mappedFormData);
            
            // CRITICAL: Set draftTicketId so subsequent saves update (not create new records)
            setDraftTicketId(ticketId);
            localStorage.setItem('editingTicketId', ticketId);
            localStorage.setItem('draftTicketId', ticketId);
            
            console.log('✅ Form data loaded and ticketId set:', ticketId);
            
            // Reset the flag after a short delay to allow autosave to work normally
            setTimeout(() => {
              justLoadedDataRef.current = false;
            }, 2000);

            // Check if team fill request exists for this ticket
            try {
              const teamFillCheck = await checkTeamFillStatus('startup-india', ticketId);
              if (teamFillCheck.exists) {
                setOneasyTeamFill(true);
                // Store in localStorage as well
                localStorage.setItem('oneasyTeamFill', 'true');
                localStorage.setItem(`oneasyTeamFill_${ticketId}`, 'true');
                console.log('✅ Team fill request found in database for ticket:', ticketId);
              }
            } catch (error) {
              console.error('❌ Error checking team fill status from DB:', error);
            }

            // Check if client fill request exists for this ticket
            try {
              const clientFillCheck = await checkClientFillStatus('startup-india', ticketId);
              if (clientFillCheck.exists) {
                setClientFillRequest(true);
                console.log('✅ Client fill request found in database for ticket:', ticketId);
              }
            } catch (error) {
              console.error('❌ Error checking client fill status from DB:', error);
            }
        } catch (error) {
          console.error('❌ Error loading draft:', error);
          console.error('❌ Error details:', error.message, error.stack);
          alert('Failed to load draft. Please try again.');
        } finally {
          // Always set loading to false, even if there was an error
          clearTimeout(loadingTimeout);
          setLoadingDraft(false);
        }
      } else {
        // New registration - load from localStorage
        // Check if we have a ticketId from localStorage that should be loaded
        const editingTicketId = localStorage.getItem('editingTicketId');
        const draftTicketIdFromStorage = localStorage.getItem('draftTicketId');
        const ticketIdToLoad = editingTicketId || draftTicketIdFromStorage;
        
        // If we have a ticketId in localStorage, try to load it (user clicked Edit)
        if (ticketIdToLoad && !ticketId) {
          console.log('📋 Found ticketId in localStorage, loading data:', ticketIdToLoad);
          // Update URL to include ticketId and reload
          const qs = new URLSearchParams(window.location.search);
          qs.set('ticketId', ticketIdToLoad);
          navigate(`/startup-india-form?${qs.toString()}`, { replace: true });
          return; // Exit early, useEffect will re-run with ticketId in URL
        }
        
        const selectedPackage = localStorage.getItem('selectedPackage');
        const paymentDetails = localStorage.getItem('paymentDetails');

        // Allow admin to fill forms even without payment (for admin-initiated registrations)
        if (!selectedPackage || !paymentDetails) {
          // Check if admin is filling - need to check URL params directly since state might not be set yet
          const searchParams = new URLSearchParams(window.location.search);
          const adminParam = searchParams.get('admin');
          const clientIdParam = searchParams.get('clientId');
          const isAdminFillingCheck = adminParam === 'true' && clientIdParam;
          
          if (!isAdminFillingCheck) {
            alert('Please complete payment before accessing the registration form.');
            navigate('/registration-categories');
            return;
          } else {
            // Admin filling - set default package/payment details
            console.log('👤 Admin filling detected - allowing form access without payment');
            const defaultPackage = { name: 'Startup India Registration', price: 0, priceValue: 0 };
            const defaultPayment = { paymentId: null, orderId: null, payment_status: 'unpaid' };
            setFormData(prev => ({
              ...prev,
              packageDetails: defaultPackage,
              paymentDetails: defaultPayment
            }));
          }
        } else {
          const packageDetails = JSON.parse(selectedPackage);
          const paymentData = JSON.parse(paymentDetails);
          
          console.log('📦 Loaded package details:', packageDetails);
          console.log('💳 Loaded payment details:', paymentData);
          
          // If we have a draft ticket ID from payment verification, use it
          if (draftTicketIdFromStorage) {
            console.log('📋 Found draft ticket ID in localStorage:', draftTicketIdFromStorage);
            setDraftTicketId(draftTicketIdFromStorage);
            // Update URL to include ticketId so subsequent saves update (not create new)
            const qs = new URLSearchParams(window.location.search);
            qs.set('ticketId', draftTicketIdFromStorage);
            navigate(`/startup-india-form?${qs.toString()}`, { replace: true });
          }
          
          setFormData(prev => ({
            ...prev,
            packageDetails,
            paymentDetails: paymentData
          }));
        }
      }
      
      // Clear timeout and set loading to false (for new registration path)
      clearTimeout(loadingTimeout);
      setLoadingDraft(false);
    };
    
    loadFormData();
    
    // Cleanup function to clear timeout if component unmounts
    return () => {
      // This will be handled by the clearTimeout calls in the function
    };
  }, [navigate, ticketId]);

  // Debug: Log formData changes to see if it's being reset
  useEffect(() => {
    if (ticketId && formData.step1) {
      console.log('🔍 FormData state updated:', {
        hasStep1: !!formData.step1,
        step1Keys: Object.keys(formData.step1 || {}),
        businessName: formData.step1.businessName,
        businessType: formData.step1.businessType,
        natureOfBusiness: formData.step1.natureOfBusiness,
        businessEmail: formData.step1.businessEmail
      });
    }
  }, [formData, ticketId]);

  const buildSubmissionData = () => {
    // Preserve package details from formData or use existing values
    const packageName = formData.packageDetails?.name || formData.packageName;
    const packagePrice =
      formData.packageDetails?.priceValue ||
      formData.packageDetails?.price ||
      formData.packagePrice;

    return {
      ...formData,
      // Ensure step structure is preserved
      step1: formData.step1 || {},
      step2: formData.step2 || {},
      step3: formData.step3 || {},
      step4: formData.step4 || { directors: [] },
      step5: formData.step5 || {},
      // Explicitly include payment details - check multiple possible field names
      // CRITICAL: Preserve payment IDs - don't overwrite with empty strings
      paymentId: formData.paymentId || 
                 formData.paymentDetails?.razorpay_payment_id || 
                 formData.paymentDetails?.paymentId || 
                 null, // Use null instead of empty string to preserve existing values
      orderId: formData.orderId || 
               formData.paymentDetails?.razorpay_order_id || 
               formData.paymentDetails?.orderId || 
               null, // Use null instead of empty string to preserve existing values
      // Also include the paymentDetails object to preserve all payment info
      paymentDetails: formData.paymentDetails || {
        paymentId: formData.paymentId || null,
        orderId: formData.orderId || null,
        razorpay_payment_id: formData.paymentDetails?.razorpay_payment_id || null,
        razorpay_order_id: formData.paymentDetails?.razorpay_order_id || null,
        payment_status: formData.paymentStatus || formData.paymentDetails?.payment_status || 'paid'
      },
      paymentStatus: formData.paymentStatus || 
                     formData.paymentDetails?.payment_status || 
                     'paid',
      // Explicitly include package details - preserve existing if available
      packageName: packageName,
      packagePrice: packagePrice,
      packageDetails: {
        name: packageName,
        price: packagePrice,
        priceValue: packagePrice
      },
      // Include ticketId if editing existing draft
      ticketId: draftTicketId || ticketId || null,
      // Include clientId if admin is filling
      clientId: isAdminFilling && clientId ? clientId : null
    };
  };

  const saveDraft = async ({ reason } = {}) => {
    // Avoid draft saves while loading an existing draft, or while the final submit is in progress
    if (loadingDraft) {
      console.log('⏸️ Skipping autosave - draft is loading');
      return;
    }
    if (isSubmitting) {
      console.log('⏸️ Skipping autosave - final submission in progress');
      return; // Don't autosave during final submission
    }
    if (isDraftSaving) {
      console.log('⏸️ Skipping autosave - draft save already in progress');
      return; // Prevent concurrent saves
    }
    if (justLoadedDataRef.current) {
      console.log('⏸️ Skipping autosave - data just loaded, waiting for user input');
      return; // Don't autosave immediately after loading data
    }

    try {
      setIsDraftSaving(true);
      
      // Check for existing ticketId from multiple sources before creating new
      const existingTicketId = draftTicketId || 
                               ticketId || 
                               localStorage.getItem('editingTicketId') ||
                               localStorage.getItem('draftTicketId') ||
                               null;
      
      const submissionData = buildSubmissionData();
      
      // CRITICAL: Always use existing ticketId if we have one to prevent creating duplicates
      if (existingTicketId) {
        submissionData.ticketId = existingTicketId;
        console.log(`💾 Using existing ticketId for draft save: ${existingTicketId}`);
      }
      
      // Only log autosave if it's not a debounced change (to reduce console spam)
      if (reason !== 'debounced-change') {
        console.log(`💾 Autosaving Startup India draft (${reason || 'unknown'})...`, {
          step,
          ticketId: submissionData.ticketId || null,
          existingTicketId
        });
      }

      const response = await submitStartupIndiaRegistration(submissionData);
      const newTicketId = response.ticketId || response.data?.ticket_id;

      if (newTicketId) {
        // Store ticketId in multiple places to ensure it's always available
        setDraftTicketId(newTicketId);
        localStorage.setItem('editingTicketId', newTicketId);
        localStorage.setItem('draftTicketId', newTicketId);

        // Ensure URL has ticketId so subsequent saves update (not create new)
        const currentUrlTicketId = new URLSearchParams(window.location.search).get('ticketId');
        if (!currentUrlTicketId) {
          const qs = new URLSearchParams(window.location.search);
          qs.set('ticketId', newTicketId);
          navigate(`/startup-india-form?${qs.toString()}`, { replace: true });
        }
        
        console.log('✅ TicketId stored and URL updated:', newTicketId);
      }
    } catch (e) {
      console.error('❌ Autosave Startup India draft failed:', e);
      // Don't block user navigation on autosave failure
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Debounced autosave whenever formData changes
  // Skip autosave only if submitting, loading, or draft is currently saving
  useEffect(() => {
    // Don't autosave if:
    // 1. Currently loading draft data (prevent saving empty form during load)
    // 2. Currently submitting (final submit in progress)
    // 3. Draft is currently saving (prevent concurrent saves)
    // 4. We just loaded data (prevent autosave loop after initial load)
    if (loadingDraft || isSubmitting || isDraftSaving || justLoadedDataRef.current) {
      return;
    }
    
    // Only autosave if we have a ticketId (editing existing) or if form has actual data
    const hasData = formData.step1?.businessName || 
                    formData.step2?.problemSolving || 
                    formData.step3?.registeredOfficeAddressLine1;
    const hasTicketId = draftTicketId || ticketId;
    
    // Don't autosave empty forms unless we're editing (have ticketId)
    if (!hasData && !hasTicketId) {
      return;
    }
    
    const t = setTimeout(() => {
      saveDraft({ reason: 'debounced-change' });
    }, 1500); // Increased debounce time to reduce frequency
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, loadingDraft, isSubmitting, isDraftSaving]);
  
  // Show loading state while fetching draft
  // Also show loading if we have ticketId but formData is empty (data not loaded yet)
  // Show loading state only while actively fetching data
  // Don't check formData content - it might be empty even after loading completes
  if (loadingDraft && ticketId) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration data...</p>
          <p className="mt-2 text-sm text-gray-500">Ticket ID: {ticketId}</p>
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
      await saveDraft({ reason: `next-step-${step}` });
      setStep((s) => s + 1);
      return;
    }
    
    // Step 5 - Submit the form
    // Don't call saveDraft here - handleSubmit will handle the final save
    // This prevents duplicate submissions
    await handleSubmit();
  };
  
  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('⚠️ Already submitting, skipping duplicate call');
      return;
    }
    
    // Small delay to let any in-flight autosave complete
    // This prevents race conditions where autosave and submit both try to create records
    if (isDraftSaving) {
      console.log('⏳ Waiting for autosave to complete before final submission...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    let shouldNavigate = true;
    
    try {
      setIsSubmitting(true);
      console.log('📤 Submitting Startup India registration...', formData);
      
      // Get the most up-to-date ticketId from all possible sources
      const currentTicketId = draftTicketId || 
                              ticketId || 
                              localStorage.getItem('editingTicketId') ||
                              localStorage.getItem('draftTicketId') ||
                              null;
      
      const submissionData = {
        ...buildSubmissionData(),
        // CRITICAL: Always use existing ticketId to UPDATE instead of creating new record
        // This prevents duplicates when clicking submit
        ticketId: currentTicketId
      };
      
      console.log('🎫 Using ticketId for final submission:', currentTicketId);
      
      console.log('📦 Submission data structure:', {
        hasStep1: !!submissionData.step1,
        hasStep2: !!submissionData.step2,
        hasStep3: !!submissionData.step3,
        hasStep4: !!submissionData.step4,
        hasStep5: !!submissionData.step5,
        clientId: submissionData.clientId,
        isAdminFilling,
        step1Keys: submissionData.step1 ? Object.keys(submissionData.step1) : [],
        step1Data: submissionData.step1,
        allKeys: Object.keys(submissionData)
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
          // If admin is filling for a client, redirect to admin clients page
          if (isAdminFilling && isAdminOrSuperadmin) {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userRole = userData.role || userData.role_id;
            if (userRole === 'superadmin' || userRole === 2) {
              navigate('/superadmin/clients');
            } else {
              navigate('/admin/clients');
            }
          } else {
            // Regular user navigation
            navigate('/startup-india-dashboard');
          }
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
    // Fields should be disabled when:
    // 1. Team fill is requested AND user is not admin AND not admin filling on behalf
    // 2. Client fill is requested AND user is admin (admin can't fill, client should fill - regardless of filling on behalf)
    // Fields should be enabled when:
    // 1. Client fill is requested AND user is the client (client should fill)
    // 2. Admin is filling on behalf AND client fill is NOT requested
    // Fields should be disabled when:
    // 1. Team fill is requested AND user is not admin AND not admin filling on behalf
    // 2. Client fill is requested AND user is admin (admin can't fill, client should fill)
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
      case 3:
        return <Step3Content formData={formData} setFormData={setFormData} disabled={isDisabled} />;
      case 4:
        return <Step4Content formData={formData} setFormData={setFormData} disabled={isDisabled} />;
      case 5:
        return <Step5Content formData={formData} setFormData={setFormData} disabled={isDisabled} />;
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
                if (ticketId) {
                  const result = await cancelClientFillRequest('startup-india', ticketId);
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

        <div className="rounded-lg p-6">
          {renderStepContent()}

          <div className="flex justify-between mt-8 mb-24">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-1.5 rounded-md border border-[#CFE6F0] text-[#00486D] cursor-pointer disabled:opacity-50"
              disabled={isSubmitting || (oneasyTeamFill && !isAdminOrSuperadmin) || (clientFillRequest && isAdminOrSuperadmin)}
            >
              Back
            </button>
            <button
              type="button"
              onClick={(oneasyTeamFill && !isAdminOrSuperadmin) ? async () => {
                // Regular user: Save team fill request and go to dashboard
                // Get ticketId from URL params, localStorage, or props
                const editingTicketId = localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId');
                const currentTicketId = ticketId || editingTicketId;
                
                setIsSubmitting(true);
                const result = await requestTeamFill('startup-india', currentTicketId || null);
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

            const result = await requestClientFill('startup-india', ticketId, clientIdParam);
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
              const result = await cancelClientFillRequest('startup-india', ticketId);
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
            // Get ticketId from URL params, localStorage, or props
            const editingTicketId = localStorage.getItem('editingTicketId') || localStorage.getItem('fillingOnBehalfTicketId');
            const currentTicketId = ticketId || editingTicketId;
            
            const newState = !oneasyTeamFill;
            setOneasyTeamFill(newState);
            
            // Store team fill state in localStorage
            if (newState) {
              localStorage.setItem('oneasyTeamFill', 'true');
              
              // Save to team fill requests table
              const result = await requestTeamFill('startup-india', currentTicketId || null);
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
