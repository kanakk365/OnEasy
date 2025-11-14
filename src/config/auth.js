// Authentication configuration
export const AUTH_CONFIG = {
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  
  // API endpoints (replace with your actual backend URLs)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  
  // Login endpoints
  ENDPOINTS: {
    SIGNUP: '/auth/signup',
    EMAIL_LOGIN: '/auth/email-login',
    PHONE_LOGIN: '/auth/phone-login',
    VERIFY_OTP: '/auth/verify-otp',
    GOOGLE_LOGIN: '/auth/google-login',
    REFRESH_TOKEN: '/auth/refresh-token',
    GET_ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout'
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    USER: 'user',
    TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token'
  }
}

// Helper function to get user from localStorage
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error parsing stored user:', error)
    return null
  }
}

// Helper function to store user data
export const storeUser = (userData) => {
  try {
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData))
  } catch (error) {
    console.error('Error storing user data:', error)
  }
}

// Helper function to clear user data
export const clearUserData = () => {
  try {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER)
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
  } catch (error) {
    console.error('Error clearing user data:', error)
  }
}


