import apiClient from './api';

/**
 * Check if team fill request exists for a ticketId
 * @param {string} registrationType - Type of registration ('private-limited', 'proprietorship', 'startup-india', 'gst', etc.)
 * @param {string} ticketId - Ticket ID to check
 */
export const checkTeamFillStatus = async (registrationType = 'private-limited', ticketId) => {
  try {
    if (!ticketId) {
      return { success: false, exists: false };
    }

    // Determine the endpoint based on registration type
    let endpoint = `/private-limited/team-fill-status/${ticketId}`;
    if (registrationType === 'proprietorship') {
      endpoint = `/proprietorship/team-fill-status/${ticketId}`;
    } else if (registrationType === 'startup-india') {
      endpoint = `/startup-india/team-fill-status/${ticketId}`;
    } else if (registrationType === 'gst') {
      endpoint = `/gst/team-fill-status/${ticketId}`;
    }

    const response = await apiClient.get(endpoint);
    
    if (response.success && response.data) {
      return {
        success: true,
        exists: response.data.exists || false,
        request: response.data.request || null
      };
    }

    return { success: false, exists: false };
  } catch (error) {
    console.error('Error checking team fill status:', error);
    return { success: false, exists: false };
  }
};

/**
 * Check if client fill request exists for a ticketId
 * @param {string} registrationType - Type of registration ('private-limited', 'proprietorship', 'startup-india', 'gst', etc.)
 * @param {string} ticketId - Ticket ID to check
 */
export const checkClientFillStatus = async (registrationType = 'private-limited', ticketId) => {
  try {
    if (!ticketId) {
      return { success: false, exists: false };
    }

    // Determine the endpoint based on registration type
    let endpoint = `/private-limited/client-fill-status/${ticketId}`;
    if (registrationType === 'proprietorship') {
      endpoint = `/proprietorship/client-fill-status/${ticketId}`;
    } else if (registrationType === 'startup-india') {
      endpoint = `/startup-india/client-fill-status/${ticketId}`;
    } else if (registrationType === 'gst') {
      endpoint = `/gst/client-fill-status/${ticketId}`;
    }

    const response = await apiClient.get(endpoint);
    
    if (response.success && response.data) {
      return {
        success: true,
        exists: response.data.exists || false,
        request: response.data.request || null
      };
    }

    return { success: false, exists: false };
  } catch (error) {
    console.error('Error checking client fill status:', error);
    return { success: false, exists: false };
  }
};

/**
 * Request client to fill the form (Admin only)
 * @param {string} registrationType - Type of registration ('private-limited', 'proprietorship', 'startup-india', 'gst', etc.)
 * @param {string} ticketId - Ticket ID
 * @param {string} clientId - Client User ID
 */
export const requestClientFill = async (registrationType = 'private-limited', ticketId, clientId) => {
  try {
    if (!ticketId || !clientId) {
      return { success: false, message: 'Ticket ID and Client ID are required' };
    }

    // Determine the endpoint based on registration type
    let endpoint = '/private-limited/request-client-fill';
    if (registrationType === 'proprietorship') {
      endpoint = '/proprietorship/request-client-fill';
    } else if (registrationType === 'startup-india') {
      endpoint = '/startup-india/request-client-fill';
    } else if (registrationType === 'gst') {
      endpoint = '/gst/request-client-fill';
    }

    const response = await apiClient.post(endpoint, {
      ticketId,
      clientId,
      registrationType
    });

    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Error requesting client fill:', error);
    return {
      success: false,
      message: error.message || 'Failed to request client fill'
    };
  }
};

/**
 * Cancel client fill request (Admin only)
 * @param {string} registrationType - Type of registration ('private-limited', 'proprietorship', 'startup-india', 'gst', etc.)
 * @param {string} ticketId - Ticket ID
 */
export const cancelClientFillRequest = async (registrationType = 'private-limited', ticketId) => {
  try {
    if (!ticketId) {
      return { success: false, message: 'Ticket ID is required' };
    }

    // Determine the endpoint based on registration type
    let endpoint = `/private-limited/client-fill-status/${ticketId}`;
    if (registrationType === 'proprietorship') {
      endpoint = `/proprietorship/client-fill-status/${ticketId}`;
    } else if (registrationType === 'startup-india') {
      endpoint = `/startup-india/client-fill-status/${ticketId}`;
    } else if (registrationType === 'gst') {
      endpoint = `/gst/client-fill-status/${ticketId}`;
    }

    const response = await apiClient.delete(endpoint);

    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Error cancelling client fill request:', error);
    return {
      success: false,
      message: error.message || 'Failed to cancel client fill request'
    };
  }
};

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





