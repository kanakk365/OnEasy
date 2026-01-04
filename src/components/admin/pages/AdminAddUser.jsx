import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";
import apiClient from "../../../utils/api";

function AdminAddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const generatePassword = () => {
    // Generate a random password with 8 characters
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password,
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");
    // Check if it's a valid 10-digit Indian mobile number
    return digits.length === 10 && /^[6-9]/.test(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.password.trim()) {
      setError("Please enter a password");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Validate phone number (now mandatory)
    if (!formData.phone.trim()) {
      setError("Please enter a mobile number");
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.createUser({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim() || null,
        phone: formData.phone.trim(),
      });

      if (response.success) {
        setSuccess(
          `User created successfully! An email with login credentials has been sent to ${formData.email}`
        );
        // Reset form
        setFormData({
          email: "",
          password: "",
          name: "",
          phone: "",
        });

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess("");
        }, 5000);
      } else {
        setError(
          response.message || "Failed to create user. Please try again."
        );
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => navigate("/admin/clients")}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Add New User</h1>
        </div>
        <p className="text-gray-500 italic ml-9">
          Create a new user account. An email with login credentials will be
          sent automatically.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          {/* Card Header with Icon */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
            >
              <FiUser className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900">
                User Details
              </h2>
              <p className="text-sm text-gray-500">
                Fill in the information below to create a new user
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Optional) */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter user's name"
                  className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent placeholder-gray-400 text-sm transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="user@example.com"
                  className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent placeholder-gray-400 text-sm transition-all"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Mobile Field (Required) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent placeholder-gray-400 text-sm transition-all"
                  disabled={loading}
                  maxLength="10"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <FiInfo className="w-3 h-3" />
                User can login with this mobile number
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter password (min. 6 characters)"
                    className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent placeholder-gray-400 text-sm transition-all"
                    disabled={loading}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  disabled={loading}
                  className="px-4 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Generate
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {success}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-100 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 px-6 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating User...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/clients")}
                disabled={loading}
                className="px-6 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-start">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 mr-4"
              style={{
                background: "linear-gradient(180deg, #3B82F6 0%, #6366F1 100%)",
              }}
            >
              <FiInfo className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-2">
                What happens next?
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  An email with login credentials will be sent to the user's
                  email address
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  The user can login with the provided email and password
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  The user will be prompted to change their password on first
                  login
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAddUser;
