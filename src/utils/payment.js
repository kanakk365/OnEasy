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

        // Determine service type from package name or localStorage
        const registrationType = localStorage.getItem('selectedRegistrationType');
        const serviceDescription = registrationType 
          ? `${packageData.name} Package - ${localStorage.getItem('selectedRegistrationTitle') || 'Registration Service'}`
          : `${packageData.name} Package - Private Limited Company`;

        // Configure Razorpay options
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'OnEasy',
          description: serviceDescription,
          order_id: orderId,
          prefill: {
            name: userData.name || '',
            email: userData.email || '',
            contact: userData.phone || ''
          },
          theme: {
            color: '#01334C'
          },
          handler: function (response) {
            // Payment successful - verify on backend
            console.log('Payment successful, verifying...');
            
            // Get registration type from localStorage
            const registrationType = localStorage.getItem('selectedRegistrationType');
            
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageDetails: {
                ...packageData,
                registrationType: registrationType || null // Include registration type
              }
            };

            // Include coupon code if applied
            if (packageData.couponCode) {
              verifyPayload.couponCode = packageData.couponCode;
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
                
                console.log('✅ Payment verified! Draft created. Redirecting to form...');
                
                // Resolve promise with success
                resolve({
                  success: true,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  ticketId: verifyResponse.data?.ticketId,
                  redirect: true
                });
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
              console.log('Payment cancelled by user');
              reject(new Error('Payment cancelled'));
            }
          }
        };

        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', function (response) {
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

























