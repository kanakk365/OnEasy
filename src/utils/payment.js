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
              'indian-subsidiary'
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

            apiClient.post('/payment/verify', verifyPayload).then(verifyResponse => {
              if (verifyResponse.success) {
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

























