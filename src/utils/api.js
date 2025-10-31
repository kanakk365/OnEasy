import { AUTH_CONFIG } from '../config/auth';

// API Client utility
class APIClient {
  constructor() {
    this.baseURL = AUTH_CONFIG.API_BASE_URL;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
  }

  // Get headers with auth token
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        // Clear auth data
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        
        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.includeAuth !== false),
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // Authentication methods
  async phoneLogin(phone) {
    return this.post(AUTH_CONFIG.ENDPOINTS.PHONE_LOGIN, { phone }, { includeAuth: false });
  }

  async verifyOTP(phone, otp) {
    const response = await this.post(
      AUTH_CONFIG.ENDPOINTS.VERIFY_OTP,
      { phone, otp },
      { includeAuth: false }
    );

    // Store token and user data
    if (response.success && response.token) {
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
      
      if (response.refreshToken) {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
    }

    return response;
  }

  async googleLogin(credential) {
    const response = await this.post(
      AUTH_CONFIG.ENDPOINTS.GOOGLE_LOGIN,
      { credential },
      { includeAuth: false }
    );

    // Store token and user data
    if (response.success && response.token) {
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
      
      if (response.refreshToken) {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
    }

    return response;
  }

  async logout() {
    try {
      await this.post(AUTH_CONFIG.ENDPOINTS.LOGOUT);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  async getMe() {
    return this.get(AUTH_CONFIG.ENDPOINTS.GET_ME);
  }

  // User methods
  async updateProfile(data) {
    return this.put('/users/profile', data);
  }

  // Company methods
  async getCompanies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/companies?${queryString}` : '/companies';
    return this.get(endpoint);
  }

  async getCompany(id) {
    return this.get(`/companies/${id}`);
  }

  async createCompany(data) {
    return this.post('/companies', data);
  }

  async updateCompany(id, data) {
    return this.put(`/companies/${id}`, data);
  }

  async deleteCompany(id) {
    return this.delete(`/companies/${id}`);
  }

  // Registration methods
  async getRegistrations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/registrations?${queryString}` : '/registrations';
    return this.get(endpoint);
  }

  async getRegistration(id) {
    return this.get(`/registrations/${id}`);
  }

  async createRegistration(data) {
    return this.post('/registrations', data);
  }

  async updateRegistration(id, data) {
    return this.put(`/registrations/${id}`, data);
  }

  async addRegistrationNote(id, content) {
    return this.post(`/registrations/${id}/notes`, { content });
  }

  // Referral methods
  async getMyReferralCode() {
    return this.get('/referrals/my-code');
  }

  async getMyReferrals() {
    return this.get('/referrals/my-referrals');
  }

  async applyReferralCode(referralCode) {
    return this.post('/referrals/apply', { referralCode });
  }

  async claimReferralReward(id) {
    return this.post(`/referrals/${id}/claim`);
  }
}

// Export a singleton instance
const apiClient = new APIClient();
export default apiClient;



