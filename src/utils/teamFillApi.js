import apiClient from './api';

/**
 * Request OnEasy team to fill the form
 * @param {string} registrationType - Type of registration ('private-limited', 'proprietorship', 'startup-india', 'gst', etc.)
 * @param {string} ticketId - Optional ticket ID if editing an existing registration
 */
export const requestTeamFill = async (registrationType = 'private-limited', ticketId = null) => {
  try {
    const packageDetails = JSON.parse(localStorage.getItem('selectedPackage') || '{}');
    const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');

    // Determine the endpoint based on registration type
    let endpoint = '/private-limited/request-team-fill';
    if (registrationType === 'proprietorship') {
      endpoint = '/proprietorship/request-team-fill';
    } else if (registrationType === 'startup-india') {
      endpoint = '/startup-india/request-team-fill';
    } else if (registrationType === 'gst') {
      endpoint = '/gst/request-team-fill';
    }

    const requestBody = {
      packageDetails,
      paymentDetails,
      registrationType
    };

    // Include ticketId if provided (required for GST, Startup India, Proprietorship)
    if (ticketId) {
      requestBody.ticketId = ticketId;
    }

    const response = await apiClient.post(endpoint, requestBody);

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('❌ Error requesting team fill:', error);
    return {
      success: false,
      message: error.message || 'Failed to request team fill'
    };
  }
};





