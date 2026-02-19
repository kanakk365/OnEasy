import { AUTH_CONFIG } from "../config/auth";

const COMPLIANCE_BASE_URL = "https://oneasycompliance.oneasy.ai";

class ComplianceAPIClient {
  getToken() {
    return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${COMPLIANCE_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
          localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      console.error("Compliance API Error:", error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // Compliance Items
  async getComplianceItems() {
    return this.get("/admin/compliance/compliance-items");
  }

  async createComplianceItem(data) {
    return this.post("/admin/compliance/compliance-items", data);
  }

  async updateComplianceItem(id, data) {
    return this.put(`/admin/compliance/compliance-items/${id}`, data);
  }

  async deleteComplianceItem(id) {
    return this.delete(`/admin/compliance/compliance-items/${id}`);
  }

  // Compliance Rules
  async getComplianceRules() {
    return this.get("/admin/compliance/compliance-rules");
  }

  async createComplianceRule(data) {
    return this.post("/admin/compliance/compliance-rules", data);
  }

  async updateComplianceRule(id, data) {
    return this.put(`/admin/compliance/compliance-rules/${id}`, data);
  }

  async deleteComplianceRule(id) {
    return this.delete(`/admin/compliance/compliance-rules/${id}`);
  }
}

const complianceApi = new ComplianceAPIClient();
export default complianceApi;
