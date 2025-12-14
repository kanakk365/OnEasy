import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import apiClient from '../../utils/api'
import logo from '../../assets/logo.png'
import bgImage from '../../assets/bg.png'
import SetEmailPasswordModal from '../common/SetEmailPasswordModal'
import ChangePasswordModal from '../common/ChangePasswordModal'

function OTPVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [showEmailPasswordModal, setShowEmailPasswordModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [userDataAfterOTP, setUserDataAfterOTP] = useState(null)
  const inputRefs = useRef([])

  // Get phone number from location state
  const phoneNumber = location.state?.phoneNumber || '+91 XXXXXXX123'

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    
    setOtp(newOtp)
    
    // Focus the last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length - 1, 3)
    inputRefs.current[lastIndex]?.focus()
  }

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const otpString = otp.join('')
      
      if (otpString.length !== 4) {
        throw new Error('Please enter the complete 4-digit OTP')
      }

      // Call backend API to verify OTP
      const result = await apiClient.verifyOTP(phoneNumber, otpString)

      if (!result.success) {
        throw new Error(result.message || 'OTP verification failed')
      }

      console.log('✅ OTP verification successful')
      console.log('👤 User data:', result.user)
      console.log('🔑 User role:', result.user?.role)
      console.log('🔑 User role_id:', result.user?.role_id)
      console.log('📧 User email:', result.user?.email)
      console.log('🔒 Must change password:', result.user?.must_change_password)
      
      // Check if user has email
      const hasEmail = result.user?.email && 
                       result.user.email.trim() !== '' && 
                       result.user.email !== null && 
                       result.user.email !== undefined
      
      // Check if user must change password (admin-created users)
      const mustChangePassword = result.user?.must_change_password === true
      
      console.log('📧 User has email:', hasEmail)
      console.log('🔒 Must change password:', mustChangePassword)
      
      // Priority 1: If admin created user with email/password, they must change password on first login
      if (mustChangePassword && hasEmail) {
        console.log('⚠️ Admin-created user must change password, showing change password modal')
        setUserDataAfterOTP(result.user)
        setShowChangePasswordModal(true)
        setIsLoading(false)
        return // Don't navigate yet
      }
      
      // Priority 2: If user doesn't have email (new phone-only user), they must set email and password
      if (!hasEmail) {
        console.log('⚠️ User missing email, showing email/password setup modal')
        setUserDataAfterOTP(result.user)
        setShowEmailPasswordModal(true)
        setIsLoading(false)
        return // Don't navigate yet
      }
      
      // User has email and doesn't need to change password - proceed to dashboard
      console.log('✅ User has email and password set, proceeding to dashboard')
      
      // Navigate to appropriate dashboard based on user role
      const userRole = result.user?.role || result.user?.role_id
      console.log('🎯 Detected role for redirect:', userRole)
      
      navigateToDashboard(userRole)
      
    } catch (err) {
      setError(err.message || 'OTP verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return
    
    setIsLoading(true)
    setError('')

    try {
      // Call backend API to resend OTP using apiClient
      await apiClient.phoneLogin(phoneNumber)
      
      // OTP will be sent via SMS (MSG91)
      console.log("✅ OTP resent - check your phone for SMS")
      
      setOtp(['', '', '', '', '', ''])
      setCanResend(false)
      setResendTimer(30)
      
      // Start countdown
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      console.log('✅ OTP resent successfully')
      
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Navigate to dashboard based on role
  const navigateToDashboard = (userRole) => {
    if (userRole === 'superadmin') {
      console.log('➡️ Redirecting to superadmin panel...')
      navigate('/superadmin/clients')
    } else if (userRole === 'admin' || userRole === '1' || userRole === '2') {
      console.log('➡️ Redirecting to admin panel...')
      navigate('/admin/clients')
    } else if (userRole === '3') {
      console.log('➡️ Redirecting to partner dashboard...')
      navigate('/partner')
    } else {
      console.log('➡️ Redirecting to client dashboard...')
      navigate('/client')
    }
  }

  // Handle email/password setup success
  const handleEmailPasswordSuccess = (updatedUser) => {
    console.log('✅ Email and password set successfully')
    setShowEmailPasswordModal(false)
    
    // Navigate to dashboard
    const userRole = updatedUser?.role || updatedUser?.role_id || userDataAfterOTP?.role || userDataAfterOTP?.role_id
    navigateToDashboard(userRole)
  }

  // Handle password change success
  const handlePasswordChangeSuccess = async () => {
    console.log('✅ Password changed successfully')
    setShowChangePasswordModal(false)
    
    // Refresh user data from backend to get updated must_change_password flag
    try {
      const userData = await apiClient.getMe()
      if (userData && userData.user) {
        console.log('🔄 Refreshed user data:', userData.user)
        console.log('🔒 Updated must_change_password:', userData.user.must_change_password)
        
        // Update userDataAfterOTP with fresh data
        setUserDataAfterOTP(userData.user)
      }
    } catch (err) {
      console.error('Error refreshing user data:', err)
    }
    
    // Navigate to dashboard
    const userRole = userDataAfterOTP?.role || userDataAfterOTP?.role_id
    navigateToDashboard(userRole)
  }

  // Start resend timer on component mount
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

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

        {/* Right Side - OTP Verification Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="text-center mb-8">
              <img src={logo} alt="OnEasy Logo" className="h-12 mx-auto" />
            </div>

          {/* Main Heading */}
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 mb-2">Verify Your Mobile</h2>
          <p className="text-sm md:text-base text-gray-600">
            We've sent a 4-digit OTP to {phoneNumber} via SMS
          </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOtp} className="space-y-4 md:space-y-6">
            {/* OTP Input Fields */}
            <div className="flex justify-center space-x-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-10 h-10 md:w-12 md:h-12 text-center text-lg md:text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 4}
              style={{ background: 'linear-gradient(90deg, #01334C 0%, #00486D 100%)' }}
              className="w-full disabled:bg-blue-400 text-white font-medium py-2.5 md:py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center text-sm md:text-base"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            {/* Resend Option */}
            <div className="text-center">
              <p className="text-gray-600">
                Didn't receive code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className={`font-medium ${
                    canResend 
                      ? 'text-blue-600 hover:text-blue-700 cursor-pointer' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canResend ? 'Resend' : `Resend in ${resendTimer}s`}
                </button>
              </p>
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Email/Password Setup Modal - For new users without email */}
      {showEmailPasswordModal && (
        <SetEmailPasswordModal
          isOpen={showEmailPasswordModal}
          onClose={() => {
            // Don't allow closing if required
            if (!userDataAfterOTP) {
              setShowEmailPasswordModal(false)
            }
          }}
          onSuccess={handleEmailPasswordSuccess}
          required={true}
        />
      )}

      {/* Change Password Modal - For admin-created users */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => {
            // Don't allow closing if required
            if (!userDataAfterOTP) {
              setShowChangePasswordModal(false)
            }
          }}
          onSuccess={handlePasswordChangeSuccess}
          required={true}
        />
      )}
    </div>
  )
}

export default OTPVerification
