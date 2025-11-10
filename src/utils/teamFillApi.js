import apiClient from './api';

/**
 * Request OnEasy team to fill the form
 * @param {string} ticketId - Registration ticket ID
 * @returns {Promise} API response
 */
export const requestTeamFill = async (ticketId) => {
  try {
    console.log('🎯 Requesting team fill for ticket:', ticketId);
    const response = await apiClient.post('/team-fill-requests', { ticketId });
    console.log('✅ Team fill request created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error requesting team fill:', error);
    throw error;
  }
};

/**
 * Get all team fill requests (admin only)
 * @returns {Promise} API response with team fill requests
 */
export const getTeamFillRequests = async () => {
  try {
    const response = await apiClient.get('/team-fill-requests');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching team fill requests:', error);
    throw error;
  }
};

/**
 * Update team fill request status (admin only)
 * @param {string} requestId - Request ID
 * @param {string} status - New status
 * @returns {Promise} API response
 */
export const updateTeamFillRequest = async (requestId, status) => {
  try {
    const response = await apiClient.put(`/team-fill-requests/${requestId}`, { status });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating team fill request:', error);
    throw error;
  }
};

