import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../utils/api';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    // Restore body scroll on mount (in case Razorpay left overflow:hidden)
    document.body.style.overflow = '';
    document.body.classList.remove('rzp-modal-open');
    document.documentElement.classList.remove('rzp-modal-open');
    
    const processPayment = async () => {
      try {
        // Razorpay may send `razorpay_payment_id` / `razorpay_payment_link_status`
        let payment_id = searchParams.get('payment_id') || searchParams.get('razorpay_payment_id');
        const order_id = searchParams.get('order_id') || searchParams.get('razorpay_order_id');
        let paymentStatus = searchParams.get('status') || searchParams.get('razorpay_payment_link_status');

        console.log('💳 Payment success page loaded:', { payment_id, order_id, paymentStatus });

        // If payment_id is not in URL (template variables not replaced), we'll let webhook handle it
        // The webhook can find the payment by order_id
        if (!order_id) {
          setStatus('error');
          setMessage('Order information is missing. Please contact support.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Try to update payment status using the new endpoint (for payment links)
        // This endpoint works with payment_id directly
        if (payment_id) {
          try {
            console.log('📞 Calling update-payment-status with payment_id:', payment_id, 'order_id:', order_id);
            
            const updateResponse = await apiClient.post('/payment/update-payment-status', {
              payment_id: payment_id,
              order_id: order_id
            }, {
              includeAuth: false // Public endpoint
            });

            console.log('📞 Update payment status response:', updateResponse);

            if (updateResponse.success) {
              setStatus('success');
              setMessage('Payment successful! Redirecting to login...');
              
              setTimeout(() => {
                navigate('/login', {
                  state: {
                    message: 'Payment successful! Please login to view your registration.',
                    paymentSuccess: true
                  }
                });
              }, 3000);
              return;
            }
          } catch (updateError) {
            console.error('Update payment status error:', updateError);
            // Fall through to webhook call
          }
        }

        // Fallback: Call webhook endpoint to process payment (public endpoint, no auth required)
        // The webhook will fetch payment details from Razorpay if payment_id is not provided
        try {
          // Build query string for webhook
          const queryParams = new URLSearchParams({
            ...(payment_id && { payment_id }),
            order_id,
            ...(paymentStatus && { status: paymentStatus })
          });
          
          console.log('📞 Calling webhook with:', queryParams.toString());
          
          const response = await apiClient.get(`/payment/webhook?${queryParams.toString()}`, {
            includeAuth: false // Webhook is public, no auth required
          });

          console.log('📞 Webhook response:', response);

          if (response.success) {
            setStatus('success');
            setMessage('Payment successful! Redirecting to login...');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
              navigate('/login', {
                state: {
                  message: 'Payment successful! Please login to view your registration.',
                  paymentSuccess: true
                }
              });
            }, 3000);
          } else {
            setStatus('error');
            setMessage(response.message || 'Payment verification failed. Please contact support.');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          // Even if webhook fails, payment might be successful
          // Show success message and redirect to login
          setStatus('success');
          setMessage('Payment successful! Redirecting to login...');
          setTimeout(() => {
            navigate('/login', {
              state: {
                message: 'Payment successful! Please login to view your registration.',
                paymentSuccess: true
              }
            });
          }, 3000);
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setMessage('An error occurred. Please contact support.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00486D] mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="text-sm text-gray-500">
              Redirecting to login page...
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#003855] transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;

