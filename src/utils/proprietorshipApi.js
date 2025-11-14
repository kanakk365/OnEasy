import apiClient from './api';

/**
 * Submit proprietorship registration
 */
export const submitProprietorshipRegistration = async (formData) => {
  try {
    const response = await apiClient.post('/proprietorship/submit', formData);
    return response;
  } catch (error) {
    console.error('Error submitting proprietorship registration:', error);
    throw error;
  }
};

/**
 * Get all proprietorship registrations for the logged-in user
 */
export const getMyProprietorshipRegistrations = async () => {
  try {
    const response = await apiClient.get('/proprietorship/my-registrations');
    return response;
  } catch (error) {
    console.error('Error fetching proprietorship registrations:', error);
    throw error;
  }
};

/**
 * Get a specific proprietorship registration by ticket ID
 */
export const getProprietorshipByTicketId = async (ticketId) => {
  try {
    const response = await apiClient.get(`/proprietorship/registration/${ticketId}`);
    return response;
  } catch (error) {
    console.error('Error fetching proprietorship registration:', error);
    throw error;
  }
};

/**
 * Get signed URL for S3 document
 */
export const getSignedUrl = async (s3Key) => {
  try {
    if (!s3Key) return null;
    
    // If it's already a full URL or base64, return as is
    if (s3Key.startsWith('http') || s3Key.startsWith('data:')) {
      return s3Key;
    }
    
    const response = await apiClient.post('/proprietorship/get-signed-url', { s3Key });
    return response.data?.signedUrl || s3Key;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return s3Key; // Return original key if error
  }
};



