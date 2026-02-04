import apiClient from './api';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize payment
export const initPayment = async (packageData) => {
  return new Promise((resolve, reject) => {
    // Load Razorpay script
    loadRazorpayScript().then(isScriptLoaded => {
      if (!isScriptLoaded) {
        reject(new Error('Failed to load Razorpay SDK'));
        return;
      }

      // Get user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.phone && !userData.email) {
        reject(new Error('User information not found. Please login again.'));
        return;
      }

      // Create order on backend with coupon info
      console.log('Creating payment order for:', packageData.name);
      const orderPayload = {
        amount: packageData.priceValue,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        packageName: packageData.name
      };

      // If user came from "Suggested Compliances", attach metadata to the order notes
      // so backend can persist + admin can filter strictly.
      try {
        const raw = localStorage.getItem('suggestedComplianceMeta');
        if (raw) {
          const meta = JSON.parse(raw);
          if (meta && meta.source === 'compliance_chat_suggested') {
            orderPayload.notes = {
              source: 'compliance_chat_suggested',
              suggested_compliance_code: meta.code || null,
              suggested_compliance_name: meta.name || null,
              suggested_compliance_category: meta.category || null
            };
          }
        }
      } catch {
        // ignore
      }

      // Add coupon info if available
      if (packageData.couponCode) {
        orderPayload.couponCode = packageData.couponCode;
        orderPayload.originalAmount = packageData.originalPriceValue || packageData.priceValue;
        orderPayload.discountAmount = packageData.discountAmount || 0;
        orderPayload.discountPercentage = packageData.discountPercentage || 0;
      }

      apiClient.post('/payment/create-order', orderPayload).then(orderResponse => {
        if (!orderResponse.success) {
          reject(new Error(orderResponse.message || 'Failed to create payment order'));
          return;
        }

        const { orderId, amount, currency, keyId } = orderResponse.data;

        // Determine service type from localStorage or fallback to package name
        const storedRegistrationType = localStorage.getItem('selectedRegistrationType');
        const detectedTypeFromName = (() => {
          const name = (packageData.name || '').toLowerCase();
          if (name.includes('opc') || name.includes('one person company')) return 'opc';
          if (name.includes('llp') || name.includes('limited liability partnership')) return 'llp';
          if (name.includes('partnership')) return 'partnership';
          if (name.includes('section 8') || name.includes('section-8')) return 'section-8';
          if (name.includes('public limited') || name.includes('plc')) return 'public-limited';
          if (name.includes('mca name') || name.includes('mca-name')) return 'mca-name-approval';
          if (name.includes('indian subsidiary') || name.includes('indian-subsidiary')) return 'indian-subsidiary';
          if (name.includes('proprietorship') || name.includes('proprietor')) return 'proprietorship';
          if (name.includes('gst') || name.includes('goods and services tax')) return 'gst';
          if (name.includes('startup') || name.includes('startup india')) return 'startup-india';
          if (name.includes('private limited') || name.includes('private-limited') || name.includes('pvt ltd') || name.includes('pvt. ltd')) return 'private-limited';
          // Registration services
          if (name.includes('professional tax') || name.includes('professional-tax')) return 'professional-tax';
          if (name.includes('labour license') || name.includes('labour-license')) return 'labour-license';
          if (name.includes('udyam') || name.includes('msme')) return 'udyam';
          if (name.includes('fssai') || name.includes('food license')) return 'fssai';
          if (name.includes('trade license') || name.includes('trade-license')) return 'trade-license';
          if (name.includes('iec') || name.includes('import export')) return 'iec';
          if (name.includes('lut') || name.includes('letter of undertaking')) return 'lut';
          if (name.includes('dsc') || name.includes('digital signature')) return 'dsc';
          if (name.includes('esi') || name.includes('employee state insurance')) return 'esi';
          if (name.includes('12a') || name.includes('registration-12a')) return 'registration-12a';
          if (name.includes('80g') || name.includes('registration-80g')) return 'registration-80g';
          if (name.includes('provident fund') || name.includes('provident-fund')) return 'provident-fund';
          // GST Services (except gst-registration which has form)
          if (name.includes('gst returns') || name.includes('gst-returns')) return 'gst-returns';
          if (name.includes('gst annual return') || name.includes('gst-annual-return')) return 'gst-annual-return';
          if (name.includes('gst amendment') || name.includes('gst-amendment')) return 'gst-amendment';
          if (name.includes('gst notice') || name.includes('gst-notice')) return 'gst-notice';
          // ROC & MCA Services
          if (name.includes('director addition') || name.includes('director-addition')) return 'director-addition';
          if (name.includes('share transfer') || name.includes('share-transfer')) return 'share-transfer';
          if (name.includes('address change') || name.includes('address-change') || name.includes('registered office')) return 'address-change';
          if (name.includes('charge creation') || name.includes('charge-creation')) return 'charge-creation';
          if (name.includes('director removal') || name.includes('director-removal')) return 'director-removal';
          if (name.includes('moa amendment') || name.includes('moa-amendment')) return 'moa-amendment';
          if (name.includes('aoa amendment') || name.includes('aoa-amendment')) return 'aoa-amendment';
          if (name.includes('objects clause') || name.includes('objects-clause')) return 'objects-clause-change';
          if (name.includes('increase share capital') || name.includes('increase-share-capital')) return 'increase-share-capital';
          if (name.includes('name change') || name.includes('name-change-company')) return 'name-change-company';
          if (name.includes('din deactivation') || name.includes('din-deactivation')) return 'din-deactivation';
          if (name.includes('din reactivation') || name.includes('din-reactivation')) return 'din-reactivation';
          if (name.includes('adt-1') || name.includes('adt 1')) return 'adt-1';
          if (name.includes('winding up company') || name.includes('winding-up-company')) return 'winding-up-company';
          if (name.includes('winding up llp') || name.includes('winding-up-llp')) return 'winding-up-llp';
          if (name.includes('din application') || name.includes('din-application')) return 'din-application';
          if (name.includes('inc-20a') || name.includes('inc 20a')) return 'inc-20a';
          // Compliance Services
          if (name.includes('fssai renewal') || name.includes('fssai-renewal')) return 'fssai-renewal';
          if (name.includes('fssai return filing') || name.includes('fssai-return-filing')) return 'fssai-return-filing';
          if (name.includes('business plan') || name.includes('business-plan')) return 'business-plan';
          if (name.includes('hr payroll') || name.includes('hr-payroll')) return 'hr-payroll';
          if (name.includes('pf return filing') || name.includes('pf-return-filing')) return 'pf-return-filing';
          if (name.includes('esi return filing') || name.includes('esi-return-filing')) return 'esi-return-filing';
          if (name.includes('professional tax return') || name.includes('professional-tax-return')) return 'professional-tax-return';
          if (name.includes('partnership compliance') || name.includes('partnership-compliance')) return 'partnership-compliance';
          if (name.includes('proprietorship compliance') || name.includes('proprietorship-compliance')) return 'proprietorship-compliance';
          if (name.includes('company compliance') || name.includes('company-compliance')) return 'company-compliance';
          if (name.includes('trademark')) return 'trademark';
          // Tax & Accounting Services
          if (name.includes('salary itr') || name.includes('salary-itr') || name.includes('income tax return salary')) return 'salary-itr';
          if (name.includes('business itr') || name.includes('business-itr') || name.includes('business income tax')) return 'business-itr';
          if (name.includes('house property itr') || name.includes('house-property-itr')) return 'house-property-itr';
          if (name.includes('trust itr') || name.includes('trust-itr')) return 'trust-itr';
          if (name.includes('salary hp capital') || name.includes('salary-hp-capital-gains')) return 'salary-hp-capital-gains';
          if (name.includes('partnership firm itr') || name.includes('partnership-firm-itr')) return 'partnership-firm-itr';
          if (name.includes('company itr') || name.includes('company-itr')) return 'company-itr';
          return null;
        })();
        const registrationType = storedRegistrationType || detectedTypeFromName;

        // If localStorage was empty but we detected from name, store it for downstream flows
        if (!storedRegistrationType && detectedTypeFromName) {
          localStorage.setItem('selectedRegistrationType', detectedTypeFromName);
        }

        const serviceDescription = registrationType 
          ? `${packageData.name} Package - ${localStorage.getItem('selectedRegistrationTitle') || 'Registration Service'}`
          : `${packageData.name} Package - Private Limited Company`;

        // Store original body overflow to restore later
        const originalBodyOverflow = document.body.style.overflow;
        
        // Restore scroll helper function
        const restoreScroll = () => {
          document.body.style.overflow = originalBodyOverflow || '';
          // Also remove any Razorpay-added classes that might block scroll
          document.body.classList.remove('rzp-modal-open');
          document.documentElement.classList.remove('rzp-modal-open');
        };

        // Configure Razorpay options
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'OnEasy',
          description: serviceDescription,
          order_id: orderId,
          // After successful payment, Razorpay will redirect here (covers email link flow too)
          callback_url: 'https://businessportal.oneasy.ai/',
          prefill: {
            name: userData.name || '',
            email: userData.email || '',
            contact: userData.phone || ''
          },
          theme: {
            color: '#01334C'
          },
          handler: function (response) {
            // Restore scroll immediately when payment succeeds
            restoreScroll();
            
            // Payment successful - verify on backend
            const paymentTimestamp = new Date().toISOString();
            const paymentId = response.razorpay_payment_id;
            const orderId = response.razorpay_order_id;
            
            console.log('🔵 ===== PAYMENT HANDLER CALLED =====');
            console.log('🔵 Timestamp:', paymentTimestamp);
            console.log('🔵 Payment ID:', paymentId);
            console.log('🔵 Order ID:', orderId);
            console.log('🔵 Stack trace:', new Error().stack);
            console.log('🔵 ===================================');
            
            // Check if we've already processed this payment
            const paymentKey = `payment_processed_${paymentId}`;
            const alreadyProcessed = sessionStorage.getItem(paymentKey);
            
            if (alreadyProcessed) {
              console.warn('⚠️ [DUPLICATE PREVENTION] Payment verification already in progress for:', paymentId);
              console.warn('⚠️ [DUPLICATE PREVENTION] First call timestamp:', alreadyProcessed);
              console.warn('⚠️ [DUPLICATE PREVENTION] Skipping duplicate verification call');
              return; // Prevent duplicate call
            }
            
            // Mark payment as being processed
            sessionStorage.setItem(paymentKey, paymentTimestamp);
            console.log('✅ [DUPLICATE PREVENTION] Marked payment as being processed:', paymentId);
            
            // Payment successful - verify on backend
            console.log('Payment successful, verifying...');
            
            // Get registration type from localStorage or fallback to detected type
            const registrationType = localStorage.getItem('selectedRegistrationType') || detectedTypeFromName || null;
            const registrationTypeLower = registrationType?.toLowerCase() || '';
            const servicesWithoutForms = [
              'opc',
              'llp',
              'partnership',
              'section-8',
              'public-limited',
              'mca-name-approval',
              'indian-subsidiary',
              // Registration services without forms (except startup-india and gst-registration)
              'professional-tax',
              'labour-license',
              'udyam',
              'fssai',
              'trade-license',
              'iec',
              'lut',
              'gst-lut',
              'dsc',
              'esi',
              '12a',
              'registration-12a',
              '80g',
              'registration-80g',
              'provident-fund',
              // GST Services (except gst-registration which has form)
              'gst-returns',
              'gst-annual-return',
              'gst-amendment',
              'gst-notice',
              // ROC & MCA Services
              'director-addition',
              'share-transfer',
              'address-change',
              'charge-creation',
              'director-removal',
              'moa-amendment',
              'aoa-amendment',
              'objects-clause-change',
              'increase-share-capital',
              'name-change-company',
              'din-deactivation',
              'din-reactivation',
              'adt-1',
              'winding-up-company',
              'winding-up-llp',
              'din-application',
              'inc-20a',
              // Compliance Services
              'fssai-renewal',
              'fssai-return-filing',
              'business-plan',
              'hr-payroll',
              'pf-return-filing',
              'esi-return-filing',
              'professional-tax-return',
              'partnership-compliance',
              'proprietorship-compliance',
              'company-compliance',
              'trademark',
              // Tax & Accounting Services
              'salary-itr',
              'business-itr',
              'house-property-itr',
              'trust-itr',
              'salary-hp-capital-gains',
              'partnership-firm-itr',
              'company-itr'
            ];
            const hasForm = !servicesWithoutForms.includes(registrationTypeLower);
            
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageDetails: packageData, // Send package details for invoice email
              registrationType: registrationType // Send registration type to backend
            };

            console.log('🔎 Verify payload prepared:', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              registrationType,
              hasForm
            });

            // Include coupon code if applied
            if (packageData.couponCode) {
              verifyPayload.couponCode = packageData.couponCode;
            }

            // For services without forms, show popup immediately (optimistic), verify in background
            if (!hasForm) {
              console.log('✅ Payment successful! No form required. Showing popup immediately (optimistic).');
              resolve({
                success: true,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                ticketId: null,
                redirect: false,
                showPopup: true
              });
            }

            console.log('📞 [FRONTEND] Calling /payment/verify API...');
            console.log('📞 [FRONTEND] Payload:', JSON.stringify(verifyPayload, null, 2));
            console.log('📞 [FRONTEND] Call timestamp:', new Date().toISOString());
            
            apiClient.post('/payment/verify', verifyPayload).then(verifyResponse => {
              console.log('✅ [FRONTEND] Payment verification response received:', {
                success: verifyResponse.success,
                ticketId: verifyResponse.data?.ticketId,
                timestamp: new Date().toISOString()
              });
              
              // Clear the processing flag on success
              sessionStorage.removeItem(paymentKey);
              
              if (verifyResponse.success) {
                // Clear suggested-compliance marker once we successfully verified payment
                try {
                  localStorage.removeItem('suggestedComplianceMeta');
                } catch {
                  // ignore
                }
                // Payment verified successfully - store package data
                localStorage.setItem('selectedPackage', JSON.stringify(packageData));
                localStorage.setItem('paymentDetails', JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  timestamp: new Date().toISOString()
                }));
                
                // Store draft ticket ID if returned from backend
                if (verifyResponse.data?.ticketId) {
                  localStorage.setItem('draftTicketId', verifyResponse.data.ticketId);
                  console.log('📋 Draft ticket ID stored:', verifyResponse.data.ticketId);
                }
                
                if (hasForm) {
                console.log('✅ Payment verified! Draft created. Redirecting to form...');
                resolve({
                  success: true,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  ticketId: verifyResponse.data?.ticketId,
                  redirect: true
                });
                } else {
                  console.log('✅ Payment verified (background). No form required.');
                  // Already resolved for popup; nothing else to do
                }
              } else {
                reject(new Error('Payment verification failed'));
              }
            }).catch(error => {
              console.error('Payment verification error:', error);
              reject(error);
            });
          },
          modal: {
            ondismiss: function() {
              // Restore scroll when modal is dismissed
              restoreScroll();
              console.log('Payment cancelled by user');
              reject(new Error('Payment cancelled'));
            }
          }
        };

        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', function (response) {
          // Restore scroll on payment failure
          restoreScroll();
          console.error('Payment failed:', response.error);
          reject(new Error(response.error.description || 'Payment failed'));
        });

        razorpay.open();

      }).catch(error => {
        console.error('Order creation error:', error);
        reject(error);
      });

    }).catch(error => {
      console.error('Script loading error:', error);
      reject(error);
    });
  });
};

// Payment handler for testing
export const testPayment = async (packageData) => {
  console.log('Test payment initiated for:', packageData);
  alert(`Test Payment\nPackage: ${packageData.name}\nAmount: ₹${packageData.price}`);
  return {
    success: true,
    message: 'Test payment successful',
    orderId: `test_order_${Date.now()}`,
    paymentId: `test_payment_${Date.now()}`
  };
};

// Initialize payment with existing order ID (for pending payments)
export const initPaymentWithOrderId = async (orderId, amount, registrationData = {}) => {
  return new Promise((resolve, reject) => {
    // Load Razorpay script
    loadRazorpayScript().then(isScriptLoaded => {
      if (!isScriptLoaded) {
        reject(new Error('Failed to load Razorpay SDK'));
        return;
      }

      // Get user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.phone && !userData.email) {
        reject(new Error('User information not found. Please login again.'));
        return;
      }

      // Get Razorpay key from backend
      apiClient.get('/payment/key').then(keyResponse => {
        if (!keyResponse.success) {
          reject(new Error(keyResponse.message || 'Failed to get Razorpay key'));
          return;
        }

        const { keyId } = keyResponse.data;

        // Store original body overflow to restore later
        const originalBodyOverflow = document.body.style.overflow;
        
        // Restore scroll helper function
        const restoreScroll = () => {
          document.body.style.overflow = originalBodyOverflow || '';
          document.body.classList.remove('rzp-modal-open');
          document.documentElement.classList.remove('rzp-modal-open');
        };

        const serviceDescription = registrationData.package_name 
          ? `Payment for ${registrationData.package_name}`
          : 'Payment for service';

        // Configure Razorpay options
        const options = {
          key: keyId,
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          name: 'OnEasy',
          description: serviceDescription,
          order_id: orderId,
          callback_url: 'https://businessportal.oneasy.ai/payment-success',
          prefill: {
            name: userData.name || '',
            email: userData.email || '',
            contact: userData.phone || ''
          },
          theme: {
            color: '#01334C'
          },
          handler: function (response) {
            const paymentTimestamp2 = new Date().toISOString();
            const paymentId2 = response.razorpay_payment_id;
            const orderId2 = response.razorpay_order_id;
            
            console.log('🔵 ===== PAYMENT HANDLER CALLED (initPaymentWithOrderId) =====');
            console.log('🔵 Timestamp:', paymentTimestamp2);
            console.log('🔵 Payment ID:', paymentId2);
            console.log('🔵 Order ID:', orderId2);
            console.log('🔵 Stack trace:', new Error().stack);
            console.log('🔵 ============================================================');
            
            // Check if we've already processed this payment
            const paymentKey2 = `payment_processed_${paymentId2}`;
            const alreadyProcessed2 = sessionStorage.getItem(paymentKey2);
            
            if (alreadyProcessed2) {
              console.warn('⚠️ [DUPLICATE PREVENTION] Payment verification already in progress (initPaymentWithOrderId):', paymentId2);
              console.warn('⚠️ [DUPLICATE PREVENTION] First call timestamp:', alreadyProcessed2);
              console.warn('⚠️ [DUPLICATE PREVENTION] Skipping duplicate verification call');
              return; // Prevent duplicate call
            }
            
            // Mark payment as being processed
            sessionStorage.setItem(paymentKey2, paymentTimestamp2);
            console.log('✅ [DUPLICATE PREVENTION] Marked payment as being processed (initPaymentWithOrderId):', paymentId2);
            
            console.log('Payment successful:', response);
            restoreScroll();
            
            // Verify payment
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...(registrationData.ticket_id && { ticket_id: registrationData.ticket_id }),
              ...(registrationData.registration_type && { registration_type: registrationData.registration_type })
            };
            
            console.log('📞 [FRONTEND] Calling /payment/verify API (initPaymentWithOrderId)...');
            console.log('📞 [FRONTEND] Payload:', JSON.stringify(verifyPayload, null, 2));
            console.log('📞 [FRONTEND] Call timestamp:', new Date().toISOString());
            
            apiClient.post('/payment/verify', verifyPayload).then(verifyResponse => {
              console.log('✅ [FRONTEND] Payment verification response received (initPaymentWithOrderId):', {
                success: verifyResponse.success,
                ticketId: verifyResponse.data?.ticketId,
                timestamp: new Date().toISOString()
              });
              
              // Clear the processing flag on success
              sessionStorage.removeItem(paymentKey2);
              
              if (verifyResponse.success) {
                resolve({
                  success: true,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id
                });
                // Redirect to payment success page with additional context so we know where to send user next
                const params = new URLSearchParams({
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  source: 'portal'
                });
                if (registrationData.ticket_id) {
                  params.set('ticket_id', registrationData.ticket_id);
                }
                if (registrationData.registration_type) {
                  params.set('registration_type', registrationData.registration_type);
                }
                window.location.href = `/payment-success?${params.toString()}`;
              } else {
                reject(new Error('Payment verification failed'));
              }
            }).catch(error => {
              console.error('❌ [FRONTEND] Payment verification error (initPaymentWithOrderId):', error);
              console.error('❌ [FRONTEND] Error timestamp:', new Date().toISOString());
              // Clear the processing flag on error
              sessionStorage.removeItem(paymentKey2);
              reject(error);
            });
          },
          modal: {
            ondismiss: function() {
              restoreScroll();
              console.log('Payment cancelled by user');
              reject(new Error('Payment cancelled'));
            }
          }
        };

        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', function (response) {
          restoreScroll();
          console.error('Payment failed:', response.error);
          reject(new Error(response.error.description || 'Payment failed'));
        });

        razorpay.open();

      }).catch(error => {
        console.error('Error getting Razorpay key:', error);
        reject(error);
      });

    }).catch(error => {
      console.error('Script loading error:', error);
      reject(error);
    });
  });
};

























