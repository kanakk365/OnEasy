import apiClient from './api';

const API_BASE = '/gst';

/**
 * Submit a new GST registration
 */
export const submitGSTRegistration = async (formData) => {
  try {
    console.log('📤 Submitting GST registration...');
    
    const response = await apiClient.post(`${API_BASE}/submit`, formData);
    
    console.log('✅ GST registration submitted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting GST registration:', error);
    throw error;
  }
};

/**
 * Get all GST registrations for the current user
 */
export const getMyGSTRegistrations = async () => {
  try {
    const response = await apiClient.get(`${API_BASE}/my-registrations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching GST registrations:', error);
    throw error;
  }
};

/**
 * Get GST registrations for a specific user (Admin only)
 */
export const getUserGSTRegistrations = async (userId) => {
  try {
    const response = await apiClient.get(`${API_BASE}/user-registrations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user GST registrations:', error);
    throw error;
  }
};

/**
 * Get a single GST registration by ticket ID
 */
export const getGSTByTicketId = async (ticketId) => {
  try {
    const response = await apiClient.get(`${API_BASE}/${ticketId}`);
    return response; // Return full response object, not just response.data
  } catch (error) {
    console.error('Error fetching GST registration:', error);
    throw error;
  }
};

/**
 * Update a GST registration
 */
export const updateGSTRegistration = async (ticketId, updateData) => {
  try {
    const response = await apiClient.put(`${API_BASE}/${ticketId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating GST registration:', error);
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
    return response.data;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};


