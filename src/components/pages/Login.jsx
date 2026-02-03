import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import apiClient from "../../utils/api";
import { AUTH_CONFIG } from "../../config/auth";
const logo = "/logo.jpg";
import ChangePasswordModal from "../common/ChangePasswordModal";
import SetEmailPasswordModal from "../common/SetEmailPasswordModal";
import ForgotPasswordModal from "../common/ForgotPasswordModal";
import ResetPasswordModal from "../common/ResetPasswordModal";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignupMode, setIsSignupMode] = useState(false); // Toggle between login and signup
  const [loginMethod, setLoginMethod] = useState("phone"); // 'phone' or 'email'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode] = useState("+91");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [userDataAfterLogin, setUserDataAfterLogin] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Phone OTP flow state (single-page OTP verification)
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpPhoneNumber, setOtpPhoneNumber] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const otpInputRefs = useRef([]);
  const [showEmailPasswordModal, setShowEmailPasswordModal] = useState(false);
  const [userDataAfterOTP, setUserDataAfterOTP] = useState(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Check for reset token in URL (from email link)
  useEffect(() => {
    const token = searchParams.get('resetToken');
    if (token) {
      setResetToken(token);
      setShowResetPasswordModal(true);
      // Clear token from URL without full navigation
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Check for payment success message from location state
  useEffect(() => {
    if (location.state?.paymentSuccess && location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!name.trim()) {
        throw new Error("Please enter your name");
      }
      if (!phoneNumber.trim()) {
        throw new Error("Please enter your phone number");
      }
      if (!email.trim() || !password.trim()) {
        throw new Error("Please enter your email and password");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Format phone number (remove country code if included)
      const phone = phoneNumber.replace(/^\+91/, "").replace(/\s+/g, "");
      if (phone.length !== 10) {
        throw new Error("Please enter a valid 10-digit phone number");
      }

      // Call backend API for signup
      const data = await apiClient.signup({ name, email, password, phone });

      console.log("✅ Signup successful");
      console.log("📱 User phone number:", data.user?.phone);

      // Ensure phone number is stored in localStorage
      if (data.user && data.user.phone) {
        const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.phone = data.user.phone;
          localStorage.setItem(
            AUTH_CONFIG.STORAGE_KEYS.USER,
            JSON.stringify(user),
          );
        }
      }

      // Navigate to client dashboard (new users are always clients)
      navigate("/client");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to appropriate dashboard
  const navigateToDashboard = (user) => {
    const userRole = user?.role_id;
    const userRoleString = user?.role;

    console.log("🚀 Navigating based on role_id:", userRole);

    // Check by role_id or role string
    if (
      userRole === "1" ||
      userRole === "2" ||
      userRole === 1 ||
      userRole === 2 ||
      userRoleString === "admin" ||
      userRoleString === "superadmin"
    ) {
      console.log("➡️  Redirecting to /admin/clients");
      navigate("/admin/clients");
    } else if (
      userRole === "3" ||
      userRole === 3 ||
      userRoleString === "partner"
    ) {
      console.log("➡️  Redirecting to /partner");
      navigate("/partner");
    } else {
      console.log("➡️  Redirecting to /client");
      navigate("/client");
    }
  };

  // Handle password change success
  const handlePasswordChangeSuccess = async () => {
    // After password change, refresh user data from backend
    try {
      const userData = await apiClient.getMe();
      if (userData && userData.user) {
        console.log(
          "🔄 Refreshed user data after password change:",
          userData.user,
        );
        console.log(
          "🔒 Updated must_change_password:",
          userData.user.must_change_password,
        );
        navigateToDashboard(userData.user);
      } else if (userDataAfterLogin) {
        // Fallback to existing user data
        const updatedUser = {
          ...userDataAfterLogin,
          must_change_password: false,
        };
        navigateToDashboard(updatedUser);
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
      // Fallback to existing user data
      if (userDataAfterLogin) {
        const updatedUser = {
          ...userDataAfterLogin,
          must_change_password: false,
        };
        navigateToDashboard(updatedUser);
      }
    }
  };

  // ----- PHONE OTP HELPERS (single-page) -----

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length - 1, 3);
    otpInputRefs.current[lastIndex]?.focus();
  };

  // Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!email.trim() || !password.trim()) {
        throw new Error("Please enter your email and password");
      }

      // Call backend API for email login
      const data = await apiClient.emailLogin(email, password);

      console.log("✅ Email login successful");
      console.log("📊 User data received:", data.user);
      console.log("🔐 User role:", data.user?.role);
      console.log("🔐 User role_id:", data.user?.role_id);
      console.log("🔐 Must change password:", data.user?.must_change_password);

      // Check if user must change password
      if (data.user?.must_change_password) {
        // Store user data and show password change modal
        setUserDataAfterLogin(data.user);
        setShowChangePasswordModal(true);
        setIsLoading(false);
        return; // Don't navigate yet
      }

      // Navigate to appropriate dashboard based on role
      navigateToDashboard(data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

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

      const fullPhoneNumber = countryCode + phoneNumber;

      // Call backend API to send OTP using apiClient
      await apiClient.phoneLogin(fullPhoneNumber);

      console.log("✅ OTP sent successfully to:", fullPhoneNumber);

      // Switch to OTP step (single-page flow)
      setIsOtpStep(true);
      setOtp(["", "", "", ""]);
      setOtpPhoneNumber(fullPhoneNumber);
      setCanResend(false);
      setResendTimer(30);

      // Start resend timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP (single-page)
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const otpString = otp.join("");

      if (otpString.length !== 4) {
        throw new Error("Please enter the complete 4-digit OTP");
      }

      if (!otpPhoneNumber) {
        throw new Error("Phone number missing. Please try again.");
      }

      const result = await apiClient.verifyOTP(otpPhoneNumber, otpString);

      if (!result.success) {
        throw new Error(result.message || "OTP verification failed");
      }

      console.log("✅ OTP verification successful");
      console.log("👤 User data:", result.user);

      const hasEmail =
        result.user?.email &&
        result.user.email.trim() !== "" &&
        result.user.email !== null &&
        result.user.email !== undefined;

      const mustChangePassword = result.user?.must_change_password === true;

      // 1) Admin-created user with email/password → must change password
      if (mustChangePassword && hasEmail) {
        console.log(
          "⚠️ Admin-created user must change password, showing change password modal",
        );
        setUserDataAfterLogin(result.user);
        setShowChangePasswordModal(true);
        setIsLoading(false);
        return;
      }

      // 2) Phone-only user without email → must set email/password
      if (!hasEmail) {
        console.log(
          "⚠️ User missing email, showing email/password setup modal",
        );
        setUserDataAfterOTP(result.user);
        setShowEmailPasswordModal(true);
        setIsLoading(false);
        return;
      }

      // 3) Normal flow → go to dashboard
      navigateToDashboard(result.user);
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP (single-page)
  const handleResendOtp = async () => {
    if (!canResend || !otpPhoneNumber) return;

    setIsLoading(true);
    setError("");

    try {
      await apiClient.phoneLogin(otpPhoneNumber);
      console.log("✅ OTP resent - check your phone for SMS");

      setOtp(["", "", "", ""]);
      setCanResend(false);
      setResendTimer(30);

      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email/password setup success (for phone-only users)
  const handleEmailPasswordSuccess = (updatedUser) => {
    console.log("✅ Email and password set successfully");
    setShowEmailPasswordModal(false);

    const userForNav =
      updatedUser || userDataAfterOTP || userDataAfterLogin || null;
    if (userForNav) {
      navigateToDashboard(userForNav);
    } else {
      navigate("/client");
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
    } catch {
      setError("Google login failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle Google authentication callback
  const handleGoogleCallback = async (response) => {
    try {
      // Send credential to backend
      const result = await apiClient.googleLogin(response.credential);

      console.log("✅ Google login successful");

      // Navigate to appropriate dashboard based on role
      const userRole = result.user?.role_id;

      if (userRole === "1" || userRole === "2") {
        navigate("/admin/clients");
      } else if (userRole === "3") {
        navigate("/partner");
      } else {
        navigate("/client");
      }
    } catch (err) {
      setError(err.message || "Failed to process Google login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#002845]">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/b.svg')`,
          backgroundSize: "100% 75%",
          backgroundPosition: "center 0%",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#002845]/50 to-[#002845]"></div>

      {/* Top Light Effect */}
      <div
        className="absolute z-0"
        style={{
          width: "1000px",
          height: "200px",
          top: "-132px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#FFFFFF40",
          filter: "blur(100px)",
        }}
      ></div>

      {/* Logo */}
      <div className="z-10 mb-8">
        <img src={logo} alt="OneEasy" className="h-10 md:h-12" />
      </div>

      {/* Main Card */}
      <div className="bg-white w-full max-w-[500px] p-8 md:p-10 rounded-2xl shadow-2xl z-10 relative mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            {isSignupMode ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isSignupMode
              ? "Sign up to get started"
              : "Sign In to your account"}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Tabs (Login Only) */}
        {!isSignupMode && (
          <div className="flex mb-8 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
                loginMethod === "phone"
                  ? "text-[#01334C]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Phone Number
              {loginMethod === "phone" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#01334C]"></div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
                loginMethod === "email"
                  ? "text-[#01334C]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Email Id
              {loginMethod === "email" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#01334C]"></div>
              )}
            </button>
          </div>
        )}

        {/* Forms */}
        {isSignupMode ? (
          /* Signup Form */
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-[#01334C] placeholder-gray-400 text-sm transition-all"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex gap-3">
                <div className="w-20 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-500">
                  {countryCode}
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter your Phone Number"
                  maxLength="10"
                  className="flex-1 h-12 px-4 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-[#01334C] placeholder-gray-400 text-sm transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-[#01334C] placeholder-gray-400 text-sm transition-all"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-[#01334C] placeholder-gray-400 text-sm transition-all"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-[#01334C] placeholder-gray-400 text-sm transition-all"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#01334C] hover:bg-[#024466] text-white font-medium rounded-lg transition-colors flex items-center justify-center mt-6"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        ) : (
          /* Login Forms */
          <>
            {loginMethod === "phone" ? (
              !isOtpStep ? (
                // Step 1: Enter phone and send OTP
                <form onSubmit={handlePhoneLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-3">
                      <div className="w-20 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                        {countryCode}
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter your Phone Number"
                        maxLength="10"
                        className="flex-1 h-12 px-4 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-[#01334C] placeholder-gray-400 text-sm transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.trim().length !== 10}
                    className="w-full h-12 bg-[#01334C] hover:bg-[#024466] text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                // Step 2: Enter OTP
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      We've sent a 4-digit OTP to {otpPhoneNumber} via SMS
                    </p>
                  </div>

                  <div className="flex justify-center space-x-2 mb-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="w-10 h-10 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.join("").length !== 4}
                    className="w-full h-12 bg-[#01334C] hover:bg-[#024466] text-white font-medium rounded-lg transition-colors flex items-center justify-center disabled:bg-blue-400"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </button>

                  <div className="text-center text-sm">
                    <p className="text-gray-600">
                      Didn't receive code?{" "}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={!canResend || isLoading}
                        className={`font-medium ${
                          canResend
                            ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {canResend ? "Resend" : `Resend in ${resendTimer}s`}
                      </button>
                    </p>
                  </div>
                </form>
              )
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-12 px-4 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-[#01334C] placeholder-gray-400 text-sm transition-all"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    className="w-full h-12 px-4 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-[#01334C] placeholder-gray-400 text-sm transition-all"
                    disabled={isLoading}
                  />
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-sm text-[#01334C] font-medium hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#01334C] hover:bg-[#024466] text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">Or</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
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
              <span className="text-gray-600">Google</span>
            </button>
          </>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-8 z-10 text-gray-400 text-sm">
        {isSignupMode ? (
          <p>
            Already have an account?{" "}
            <button
              onClick={() => setIsSignupMode(false)}
              className="text-white font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p>
            Do not have an account?{" "}
            <button
              onClick={() => setIsSignupMode(true)}
              className="text-white font-medium hover:underline"
            >
              Sign Up
            </button>
          </p>
        )}
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => {
            if (!userDataAfterLogin?.must_change_password) {
              setShowChangePasswordModal(false);
            }
          }}
          onSuccess={handlePasswordChangeSuccess}
          required={userDataAfterLogin?.must_change_password || false}
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        />
      )}

      {/* Reset Password Modal - shown when user clicks link in email */}
      {showResetPasswordModal && (
        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          onClose={() => {
            setShowResetPasswordModal(false);
            setResetToken(null);
          }}
          token={resetToken}
        />
      )}

      {/* Email/Password Setup Modal - For new phone-only users */}
      {showEmailPasswordModal && (
        <SetEmailPasswordModal
          isOpen={showEmailPasswordModal}
          onClose={() => {
            // Don't allow closing if required
            if (!userDataAfterOTP) {
              setShowEmailPasswordModal(false);
            }
          }}
          onSuccess={handleEmailPasswordSuccess}
          required={true}
        />
      )}
    </div>
  );
}

export default Login;
