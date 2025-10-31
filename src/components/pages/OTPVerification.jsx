import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import bgImage from '../../assets/bg.png'

function OTPVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, accept any 4-digit OTP
      console.log('OTP verification successful:', otpString)
      
      // Store user data and redirect to referral page
      localStorage.setItem('user', JSON.stringify({
        phoneNumber: phoneNumber,
        loginMethod: 'phone',
        verified: true
      }))
      
      navigate('/referral')
      
    } catch (err) {
      setError(err.message)
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
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOtp(['', '', '', ''])
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
      
      console.log('OTP resent successfully')
      
    } catch (err) {
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            <div className="flex justify-center space-x-2 md:space-x-3 mb-6">
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
                  className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
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
    </div>
  )
}

export default OTPVerification
