import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../utils/api";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/bg.png";

function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get user data from location state
  const userId = location.state?.userId;
  const phone = location.state?.phone;

  // Redirect if no user ID
  if (!userId) {
    navigate("/login");
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!formData.name.trim()) {
        throw new Error("Please enter your full name");
      }
      if (!formData.email.trim()) {
        throw new Error("Please enter your email address");
      }
      if (!formData.password.trim()) {
        throw new Error("Please create a password");
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Update profile via API
      const result = await apiClient.updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log("✅ Profile completed successfully");

      // Redirect to client dashboard
      navigate("/client");
    } catch (err) {
      setError(err.message || "Failed to complete profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl h-[90vh] flex flex-col md:flex-row">
        {/* Left Side - Image Section */}
        <div className="w-full md:w-1/2 h-full">
          <img
            src={bgImage}
            alt="Complete Profile Background"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Right Side - Profile Completion Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="text-center mb-6">
              <img
                src={logo}
                alt="OnEasy Logo"
                className="h-10 md:h-12 mx-auto"
              />
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Please provide your details to continue
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Profile Completion Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Number (Read-only) */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone || ""}
                  disabled
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm"
                />
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent placeholder-gray-400 text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent placeholder-gray-400 text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Create Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password (min. 6 characters)"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent placeholder-gray-400 text-sm"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  You'll use this password to login with your email
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ background: 'linear-gradient(90deg, #01334C 0%, #00486D 100%)' }}
                className="w-full disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:ring-offset-2 flex items-center justify-center text-sm mt-6"
              >
                {isLoading ? (
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
                    Completing Profile...
                  </>
                ) : (
                  "Complete Profile & Continue"
                )}
              </button>
            </form>

            {/* Info Text */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                * All fields are required to access your dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;

