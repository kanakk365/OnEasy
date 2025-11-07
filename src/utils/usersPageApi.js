import apiClient from './api';

/**
 * Get all user data for Users page (Client Profile, Organisation, Websites, Tasks, Notes)
 */
export const getUsersPageData = async () => {
  try {
    console.log('🔍 Fetching users page data...');
    const response = await apiClient.request('/users-page/data', {
      method: 'GET'
    });
    console.log('✅ Users page data fetched:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching users page data:', error);
    throw error;
  }
};

/**
 * Update all user data from Users page
 */
export const updateUsersPageData = async (data) => {
  try {
    console.log('💾 Updating users page data...');
    console.log('📤 Sending payload:', data);
    
    const response = await apiClient.post('/users-page/update', data);
    
    console.log('✅ Users page data updated:', response);
    return response;
  } catch (error) {
    console.error('❌ Error updating users page data:', error);
    console.error('Error details:', error.response || error.message || error);
    throw error;
  }
};

