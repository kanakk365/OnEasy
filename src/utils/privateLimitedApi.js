import apiClient from './api';

/**
 * Submit Private Limited Company Registration
 * @param {object} formData - Complete form data from all steps
 * @returns {Promise} API response
 */
export const submitPrivateLimitedRegistration = async (formData, clientId = null, ticketId = null) => {
  try {
    // Get payment details from localStorage
    const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');
    const packageDetails = JSON.parse(localStorage.getItem('selectedPackage') || '{}');
    
    // Get editing ticket ID if editing existing registration
    const editingTicketId = ticketId || localStorage.getItem('editingTicketId');
    
    // Prepare complete payload
    const payload = {
      step1: formData.step1,
      step2: formData.step2,
      step3: formData.step3,
      directors: formData.directors || [],
      paymentDetails,
      packageDetails,
      clientId, // Pass clientId if admin is filling on behalf
      ticketId: editingTicketId // Pass ticketId if updating existing registration
    };
    
    console.log('🚀 Submitting Private Limited registration...');
    if (clientId) {
      console.log('👤 Filling on behalf of client:', clientId);
    }
    if (editingTicketId) {
      console.log('📝 Updating existing registration:', editingTicketId);
    }
    
    const response = await apiClient.post('/private-limited/register', payload);
    
    console.log('✅ Registration submitted successfully:', response);
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('❌ Error submitting registration:', error);
    
    const errorMessage = error.message || 'Failed to submit registration';
    
    return {
      success: false,
      message: errorMessage,
      error: error
    };
  }
};

/**
 * Get registration by ticket ID
 * @param {string} ticketId - Ticket ID
 * @returns {Promise} API response
 */
export const getRegistrationByTicketId = async (ticketId) => {
  try {
    const response = await apiClient.get(`/private-limited/registration/${ticketId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Error fetching registration:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to fetch registration'
    };
  }
};

/**
 * Get all registrations for current user
 * @returns {Promise} API response
 */
export const getMyRegistrations = async () => {
  try {
    const response = await apiClient.get('/private-limited/registrations');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Error fetching registrations:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to fetch registrations'
    };
  }
};

/**
 * Convert file to base64
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 encoded string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Helper to prepare form data with base64 encoded files
 * @param {object} rawFormData - Raw form data with File objects
 * @returns {Promise<object>} Form data with base64 encoded files
 */
export const prepareFormDataWithFiles = async (rawFormData) => {
  const formData = { ...rawFormData };
  
  // Convert any File objects to base64
  const convertFilesToBase64 = async (obj) => {
    for (const key in obj) {
      if (obj[key] instanceof File) {
        obj[key] = await fileToBase64(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
        await convertFilesToBase64(obj[key]);
      } else if (Array.isArray(obj[key])) {
        for (let i = 0; i < obj[key].length; i++) {
          if (obj[key][i] instanceof File) {
            obj[key][i] = await fileToBase64(obj[key][i]);
          } else if (typeof obj[key][i] === 'object') {
            await convertFilesToBase64(obj[key][i]);
          }
        }
      }
    }
  };
  
  await convertFilesToBase64(formData);
  return formData;
};

/**
 * Get signed URL for S3 file
 * @param {string} s3Url - S3 file URL
 * @returns {Promise<string>} Signed URL
 */
export const getSignedUrl = async (s3Url) => {
  try {
    if (!s3Url) {
      return null;
    }

    // If it's not an S3 URL, return as is (might be base64)
    if (!s3Url.includes('.s3.') || !s3Url.includes('.amazonaws.com')) {
      return s3Url;
    }

    console.log('🔐 Requesting signed URL for:', s3Url);
    
    const response = await apiClient.post('/private-limited/get-signed-url', { s3Url });
    
    console.log('✅ Signed URL received');
    
    return response.signedUrl;
  } catch (error) {
    console.error('❌ Error getting signed URL:', error);
    return s3Url; // Return original URL as fallback
  }
};





