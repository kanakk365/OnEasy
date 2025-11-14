import apiClient from './api';

const API_BASE = '/startup-india';

/**
 * Submit a new Startup India registration
 */
export const submitStartupIndiaRegistration = async (formData) => {
  try {
    console.log('📤 Submitting Startup India registration...');
    
    const response = await apiClient.post(`${API_BASE}/submit`, formData);
    
    console.log('✅ Startup India registration submitted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting Startup India registration:', error);
    throw error;
  }
};

/**
 * Get all Startup India registrations for the current user
 */
export const getMyRegistrations = async () => {
  try {
    const response = await apiClient.get(`${API_BASE}/my-registrations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Startup India registrations:', error);
    throw error;
  }
};

/**
 * Get Startup India registrations for a specific user (Admin only)
 */
export const getUserStartupIndiaRegistrations = async (userId) => {
  try {
    const response = await apiClient.get(`${API_BASE}/user-registrations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user Startup India registrations:', error);
    throw error;
  }
};

/**
 * Get a single Startup India registration by ticket ID
 */
export const getStartupIndiaByTicketId = async (ticketId) => {
  try {
    const response = await apiClient.get(`${API_BASE}/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Startup India registration:', error);
    throw error;
  }
};

/**
 * Update a Startup India registration
 */
export const updateStartupIndiaRegistration = async (ticketId, updateData) => {
  try {
    const response = await apiClient.put(`${API_BASE}/${ticketId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating Startup India registration:', error);
    throw error;
  }
};

/**
 * Get signed URL for viewing/downloading a document
 */
export const getSignedUrl = async (fileUrl) => {
  try {
    const response = await apiClient.get(`${API_BASE}/signed-url`, {
      params: { fileUrl }
    });
    return response.data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};

  try {
    const response = await apiClient.put(`${API_BASE}/${ticketId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating Startup India registration:', error);
    throw error;
  }
};

/**
 * Get signed URL for viewing/downloading a document
 */
export const getSignedUrl = async (fileUrl) => {
  try {
    const response = await apiClient.get(`${API_BASE}/signed-url`, {
      params: { fileUrl }
    });
    return response.data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};
