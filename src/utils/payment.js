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
  try {
    // Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Get user data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.phone && !userData.email) {
      throw new Error('User information not found. Please login again.');
    }

    // Create order on backend
    console.log('Creating payment order for:', packageData.name);
    const orderResponse = await apiClient.post('/payment/create-order', {
      amount: packageData.priceValue,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      packageName: packageData.name
    });

    if (!orderResponse.success) {
      throw new Error(orderResponse.message || 'Failed to create payment order');
    }

    const { orderId, amount, currency, keyId } = orderResponse.data;

    // Configure Razorpay options
    const options = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: 'OnEasy',
      description: `${packageData.name} Package - Private Limited Company`,
      order_id: orderId,
      prefill: {
        name: userData.name || '',
        email: userData.email || '',
        contact: userData.phone || ''
      },
      theme: {
        color: '#01334C'
      },
      handler: async function (response) {
        // Payment successful - verify on backend
        try {
          console.log('Payment successful, verifying...');
          const verifyResponse = await apiClient.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verifyResponse.success) {
            // Payment verified successfully
            return {
              success: true,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id
            };
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          throw error;
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Payment cancelled by user');
        }
      }
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      throw new Error(response.error.description || 'Payment failed');
    });

    razorpay.open();

  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
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

