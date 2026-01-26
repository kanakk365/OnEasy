/**
 * PIN Code Lookup Utility
 * Uses the free postalpincode.in API to fetch location details based on PIN code
 */

const PINCODE_API_BASE = 'https://api.postalpincode.in/pincode';

/**
 * Fetch location details from PIN code
 * @param {string} pincode - 6 digit PIN code
 * @returns {Promise<{success: boolean, state?: string, district?: string, city?: string, error?: string}>}
 */
export const lookupPincode = async (pincode) => {
  // Validate PIN code format (6 digits)
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return {
      success: false,
      error: 'Please enter a valid 6-digit PIN code',
    };
  }

  try {
    const response = await fetch(`${PINCODE_API_BASE}/${pincode}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch PIN code details');
    }

    const data = await response.json();
    
    // Check if API returned valid data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        error: 'No data found for this PIN code',
      };
    }

    const result = data[0];
    
    // Check if status is success
    if (result.Status !== 'Success' || !result.PostOffice || result.PostOffice.length === 0) {
      return {
        success: false,
        error: 'Invalid PIN code or no data available',
      };
    }

    // Extract details from first post office (they usually have same state/district)
    const postOffice = result.PostOffice[0];
    
    return {
      success: true,
      state: postOffice.State || '',
      district: postOffice.District || '',
      city: postOffice.Block || postOffice.District || '',
      division: postOffice.Division || '',
      region: postOffice.Region || '',
    };
  } catch (error) {
    console.error('Error looking up PIN code:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch PIN code details. Please try again.',
    };
  }
};

/**
 * Debounced PIN code lookup
 * @param {string} pincode - 6 digit PIN code
 * @param {Function} callback - Callback function with lookup result
 * @param {number} delay - Debounce delay in ms (default: 800ms)
 * @returns {Function} - Debounced function
 */
export const debouncedPincodeLookup = (callback, delay = 800) => {
  let timeoutId;
  
  return async (pincode) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(async () => {
      if (pincode && /^\d{6}$/.test(pincode)) {
        const result = await lookupPincode(pincode);
        callback(result);
      }
    }, delay);
  };
};
