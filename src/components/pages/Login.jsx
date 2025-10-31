import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/bg.png";

function Login() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle phone number login
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate phone number
      if (!phoneNumber.trim()) {
        throw new Error("Please enter your phone number");
      }

      // Simulate API call - replace with your actual authentication logic
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to OTP verification page with phone number
      console.log("Phone login:", countryCode + phoneNumber);
      navigate("/verify-otp", {
        state: {
          phoneNumber: countryCode + phoneNumber,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Load Google Identity Services
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your actual Google Client ID
        callback: handleGoogleCallback,
      });

      // Trigger Google Sign-In popup
      window.google.accounts.id.prompt();
    } catch (err) {
      setError("Google login failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle Google authentication callback
  const handleGoogleCallback = (response) => {
    try {
      // Decode the JWT token
      const payload = JSON.parse(atob(response.credential.split(".")[1]));

      console.log("Google login successful:", payload);

      // Store user data (in real app, you'd send this to your backend)
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          loginMethod: "google",
        })
      );

      // Redirect to appropriate dashboard based on user role
      // For demo, redirect to client dashboard
      navigate("/client");
    } catch (err) {
      setError("Failed to process Google login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl h-[90vh]  flex flex-col md:flex-row">
        {/* Left Side - Image Section */}
        <div className="w-full md:w-1/2 h-full">
          <img
            src={bgImage}
            alt="Login Background"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Right Side - Login Form Section */}
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
                Welcome Back
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Enter your phone number to sign in or create an account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              {/* Phone Number Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-12 px-3 border border-gray-300 rounded-l-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent text-sm"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="flex-1 h-12 px-4 border border-gray-300 rounded-r-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent placeholder-gray-400 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ background: 'linear-gradient(90deg, #01334C 0%, #00486D 100%)' }}
                className="w-full disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:ring-offset-2 flex items-center justify-center text-sm"
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
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Separator */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:ring-offset-2 flex items-center justify-center space-x-3 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>
                  {isLoading ? "Signing In..." : "Continue with Google"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
