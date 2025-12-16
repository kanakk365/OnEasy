import apiClient from './api';

const API_BASE = '/support';

/**
 * Create a support request
 * @param {string} serviceName - Name of the service
 * @param {string} packageName - Name of the package (optional)
 * @param {string} message - Custom message (optional)
 */
export const createSupportRequest = async (serviceName, packageName = null, message = null) => {
  try {
    const response = await apiClient.post(`${API_BASE}/create-request`, {
      serviceName,
      packageName,
      message
    });
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error creating support request:', error);
    return {
      success: false,
      message: error.message || 'Failed to create support request'
    };
  }
};

/**
 * Get all support requests for current user
 */
export const getMySupportRequests = async () => {
  try {
    const response = await apiClient.get(`${API_BASE}/my-requests`);
    return response;
  } catch (error) {
    console.error('Error fetching support requests:', error);
    throw error;
  }
};

