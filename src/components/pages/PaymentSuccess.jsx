import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../utils/api';

function PaymentSuccess() {
  const logApiError = (label, err) => {
    const resp = err?.response?.data;
    console.error(`❌ ${label}`, {
      message: err?.message,
      responseData: resp,
      status: err?.response?.status
    });
  };

  const logApiResponse = (label, resp) => {
    console.log(`✅ ${label}`, resp);
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Start in "success" state so the user immediately sees a success message
  // Backend verification and redirects still run in the background.
  const [status, setStatus] = useState('success'); // processing, success, error
  const [message, setMessage] = useState('Payment successful! Finalizing your registration...');

  // Determine where to send the user after a successful payment
  const getRedirectPath = (registrationType, ticketId) => {
    if (!registrationType) return '/login';

    const slug = registrationType.toLowerCase();
    const hasTicket = !!ticketId;

    // Core services with dedicated forms & view pages
    const servicesWithForms = ['private-limited', 'proprietorship', 'startup-india', 'gst'];

    // If we know the ticket and it's a core registration service, send to the view-details page
    if (servicesWithForms.includes(slug) && hasTicket) {
      return `/${slug}/view/${ticketId}`;
    }

    // For other services (no dedicated form), send to the registration details page
    // e.g. /registrations/gst-returns, /registrations/business-itr, etc.
    if (slug) {
      return `/registrations/${slug}`;
    }

    // Fallback
    return '/login';
  };

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
        const ticket_id = searchParams.get('ticket_id');
        const registration_type = searchParams.get('registration_type');
        const source = searchParams.get('source') || 'link'; // 'portal' for in-app payments, 'link' for email/copied links

        console.log('💳 Payment success page loaded:', { 
          payment_id, 
          razorpay_payment_id: searchParams.get('razorpay_payment_id'),
          order_id, 
          paymentStatus,
          ticket_id,
          registration_type,
          allParams: Object.fromEntries(searchParams.entries())
        });

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
        // Send razorpay_payment_id explicitly (backend expects this for GST and other services)
          if (payment_id) {
          try {
            const requestPayload = {
              razorpay_payment_id: payment_id, // Send as razorpay_payment_id for consistency
              payment_id: payment_id, // Also send as payment_id for backward compatibility
              order_id: order_id,
              status: paymentStatus || 'paid',
              ...(ticket_id && { ticket_id }),
              ...(registration_type && { registration_type })
            };
            
            console.log('📞 Calling update-payment-status with payload:', JSON.stringify(requestPayload, null, 2));
            
            const updateResponse = await apiClient.post('/payment/update-payment-status', requestPayload, {
              includeAuth: false // Public endpoint
            });

            logApiResponse('Update payment status response', updateResponse);

            if (updateResponse.success) {
              setStatus('success');

              // For portal-initiated payments, send user to details/registration page.
              // For email/copied payment links, always send to login.
              if (source === 'portal' && ticket_id && registration_type) {
                const targetPath = getRedirectPath(registration_type, ticket_id);
                setMessage('Payment successful! Redirecting to your registration...');
                navigate(targetPath); // Redirect immediately
              } else {
                // Fallback: original behaviour – send to login
                setMessage('Payment successful! Redirecting to login...');
                navigate('/login', {
                  state: {
                    message: 'Payment successful! Please login to view your registration.',
                    paymentSuccess: true
                  }
                });
              }
              return;
            }
          } catch (updateError) {
            logApiError('Update payment status error', updateError);
            // Fall through to webhook call
          }
        }

        // Fallback: call public update-payment-status (POST) instead of GET /payment/webhook (which doesn't exist)
        try {
          const fallbackPayload = {
            razorpay_payment_id: payment_id, // Send as razorpay_payment_id for consistency
            payment_id: payment_id, // Also send as payment_id for backward compatibility
            order_id,
            ...(paymentStatus && { status: paymentStatus }),
            ...(ticket_id && { ticket_id }),
            ...(registration_type && { registration_type })
          };
          
          console.log('📞 Calling update-payment-status (fallback) with payload:', JSON.stringify(fallbackPayload, null, 2));
          
          const response = await apiClient.post('/payment/update-payment-status', fallbackPayload, {
            includeAuth: false // Public endpoint
          });

          logApiResponse('Fallback update-payment-status response', response);

          if (response.success) {
            setStatus('success');

            if (source === 'portal' && ticket_id && registration_type) {
              const targetPath = getRedirectPath(registration_type, ticket_id);
              setMessage('Payment successful! Redirecting to your registration...');
              navigate(targetPath); // Redirect immediately
            } else {
              setMessage('Payment successful! Redirecting to login...');
              // Redirect to login immediately
              navigate('/login', {
                state: {
                  message: 'Payment successful! Please login to view your registration.',
                  paymentSuccess: true
                }
              });
            }
          } else {
            setStatus('error');
            setMessage(response.message || 'Payment verification failed. Please contact support.');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } catch (webhookError) {
          logApiError('Fallback update-payment-status error', webhookError);
          // Even if webhook fails, payment might be successful
          // Show success message and redirect to appropriate page
          setStatus('success');

          if (source === 'portal' && ticket_id && registration_type) {
            const targetPath = getRedirectPath(registration_type, ticket_id);
            setMessage('Payment successful! Redirecting to your registration...');
            navigate(targetPath); // Redirect immediately
          } else {
            setMessage('Payment successful! Redirecting to login...');
            navigate('/login', {
              state: {
                message: 'Payment successful! Please login to view your registration.',
                paymentSuccess: true
              }
            });
          }
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
            <div className="text-sm text-gray-500 mb-4">
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
