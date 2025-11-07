import apiClient from './api';

/**
 * Request OnEasy team to fill the form
 */
export const requestTeamFill = async () => {
  try {
    const packageDetails = JSON.parse(localStorage.getItem('selectedPackage') || '{}');
    const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');

    const response = await apiClient.post('/private-limited/request-team-fill', {
      packageDetails,
      paymentDetails
    });

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


