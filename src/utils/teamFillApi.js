import apiClient from './api';

/**
 * Request OnEasy team to fill the form
 * @param {string} registrationType - Type of registration ('private-limited', 'proprietorship', 'startup-india', 'gst', etc.)
 * @param {string} ticketId - Optional ticket ID if editing an existing registration
 */
export const requestTeamFill = async (registrationType = 'private-limited', ticketId = null) => {
  try {
    console.log('📞 requestTeamFill called with:', { registrationType, ticketId });
    
    const packageDetails = JSON.parse(localStorage.getItem('selectedPackage') || '{}');
    const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');
    
    console.log('📦 Package details from localStorage:', packageDetails);
    console.log('💳 Payment details from localStorage:', paymentDetails);

    // Determine the endpoint based on registration type
    let endpoint = '/private-limited/request-team-fill';
    if (registrationType === 'proprietorship') {
      endpoint = '/proprietorship/request-team-fill';
    } else if (registrationType === 'startup-india') {
      endpoint = '/startup-india/request-team-fill';
    } else if (registrationType === 'gst') {
      endpoint = '/gst/request-team-fill';
    }

    console.log('🌐 Using endpoint:', endpoint);

    const requestBody = {
      packageDetails,
      paymentDetails,
      registrationType
    };

    // Include ticketId if provided (required for GST, Startup India, Proprietorship)
    if (ticketId) {
      requestBody.ticketId = ticketId;
      console.log('🎫 Including ticketId in request:', ticketId);
    } else {
      console.log('⚠️ No ticketId provided');
    }

    console.log('📤 Sending request body:', requestBody);
    console.log('📤 Full request:', {
      endpoint,
      method: 'POST',
      body: requestBody
    });

    const response = await apiClient.post(endpoint, requestBody);
    
    console.log('📥 API response received:', response);
    console.log('📥 Response data:', response.data || response);

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('❌ Error requesting team fill:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    return {
      success: false,
      message: error.message || 'Failed to request team fill'
    };
  }
};





