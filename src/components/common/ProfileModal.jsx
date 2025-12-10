import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FiUpload } from 'react-icons/fi';
import apiClient from '../../utils/api';
import { AUTH_CONFIG } from '../../config/auth';

function ProfileModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'male',
    profile_image: ''
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
    currentPassword: ''
  });
  const [hasEmailPassword, setHasEmailPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Debug: Log formData changes, especially phone
  useEffect(() => {
    console.log('📱 formData updated - Phone:', formData.phone, 'Name:', formData.name, 'Email:', formData.email);
  }, [formData]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Always fetch from database via API
      const response = await apiClient.getMe();
      if (response.success && response.data) {
        const user = response.data;
        console.log('📱 ProfileModal - Loading user data from database:');
        console.log('   Phone:', user.phone);
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   All fields:', user);
        
        // Set form data - ensure phone is set exactly like name and email
        const formDataToSet = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          dob: user.dob || '',
          gender: user.gender || 'male',
          profile_image: user.profile_image || ''
        };
        
        console.log('📱 Setting formData:', formDataToSet);
        console.log('📱 Phone value being set:', formDataToSet.phone);
        console.log('📱 Name value being set:', formDataToSet.name);
        console.log('📱 Email value being set:', formDataToSet.email);
        
        setFormData(formDataToSet);
        
        if (user.profile_image) {
          setProfileImage(user.profile_image);
        }
        
        // Check if user has email and password set
        const hasEmail = !!user.email;
        setHasEmailPassword(hasEmail);
        
        // Show password section if user doesn't have email
        if (!hasEmail) {
          setShowPasswordSection(true);
        }
      } else {
        setError('Failed to load user data from database');
      }
    } catch (err) {
      console.error('Error loading user data from database:', err);
      setError('Failed to fetch user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        // Also update formData so it's included in the save
        setFormData(prev => ({
          ...prev,
          profile_image: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // If user doesn't have email/password, set them
      if (!hasEmailPassword) {
        if (!formData.email) {
          setError('Email is required to set password');
          setLoading(false);
          return;
        }
        if (!passwordData.password) {
          setError('Password is required');
          setLoading(false);
          return;
        }
        if (passwordData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        if (passwordData.password !== passwordData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Set email and password
        const response = await apiClient.setEmailPassword(formData.email, passwordData.password);
        
        if (response.success) {
          setSuccess('Email and password set successfully! You can now login with email and password.');
          setHasEmailPassword(true);
          setShowPasswordSection(false);
          setPasswordData({ password: '', confirmPassword: '', currentPassword: '' });
          // Update localStorage
          if (response.data) {
            const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
            if (storedUser) {
              const user = JSON.parse(storedUser);
              user.email = response.data.email;
              localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
            }
          }
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        }
      } else {
        // User has email, try to change password
        if (!passwordData.password) {
          setError('New password is required');
          setLoading(false);
          return;
        }
        if (passwordData.password.length < 6) {
          setError('New password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        if (passwordData.password !== passwordData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }

        // If current password is provided, try to change password
        if (passwordData.currentPassword) {
          try {
            const response = await apiClient.changePassword(passwordData.currentPassword, passwordData.password);
            
            if (response.success) {
              setSuccess('Password changed successfully!');
              setPasswordData({ password: '', confirmPassword: '', currentPassword: '' });
              setShowPasswordSection(false);
              // Reload user data from database after password change
              await loadUserData();
              setTimeout(() => {
                setSuccess('');
              }, 3000);
              setLoading(false);
              return;
            }
          } catch (changePasswordError) {
            // If change password fails because user doesn't have password, try setting it
            if (changePasswordError.message?.includes('Password change not allowed') || 
                changePasswordError.message?.includes('not allowed for this account') ||
                changePasswordError.message?.includes('Current password is incorrect')) {
              // User might not have password or current password is wrong
              // Try setting password if email exists
              if (formData.email) {
                try {
                  const setPasswordResponse = await apiClient.setEmailPassword(formData.email, passwordData.password);
                  
                  if (setPasswordResponse.success) {
                    setSuccess('Password set successfully! You can now login with email and password.');
                    setHasEmailPassword(true);
                    setPasswordData({ password: '', confirmPassword: '', currentPassword: '' });
                    setShowPasswordSection(false);
                    // Reload user data from database after setting password
                    await loadUserData();
                    setTimeout(() => {
                      setSuccess('');
                    }, 3000);
                    setLoading(false);
                    return;
                  }
                } catch (setPasswordError) {
                  throw setPasswordError;
                }
              }
            }
            throw changePasswordError;
          }
        } else {
          // No current password provided, try to set password (user might not have password yet)
          if (!formData.email) {
            setError('Email is required to set password');
            setLoading(false);
            return;
          }
          
          const setPasswordResponse = await apiClient.setEmailPassword(formData.email, passwordData.password);
          
          if (setPasswordResponse.success) {
            setSuccess('Password set successfully! You can now login with email and password.');
            setHasEmailPassword(true);
            setPasswordData({ password: '', confirmPassword: '', currentPassword: '' });
            setShowPasswordSection(false);
            // Reload user data from database after setting password
            await loadUserData();
            setTimeout(() => {
              setSuccess('');
            }, 3000);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data to send
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        profile_image: formData.profile_image
      };

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (!updateData[key]) {
          delete updateData[key];
        }
      });

      const response = await apiClient.updateProfile(updateData);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        // Reload user data from database after update
        await loadUserData();
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loading State */}
          {loading && !formData.name && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01334C]"></div>
              <span className="ml-3 text-gray-600">Loading profile from database...</span>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
              placeholder="Abhishek Boddu"
            />
          </div>

          {/* Email and Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                placeholder="abhishek@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                placeholder="9858015257"
              />
              {/* Debug: Show phone value */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500 mt-1">Debug: {formData.phone || 'empty'}</p>
              )}
            </div>
          </div>

          {/* Date of Birth and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent appearance-none bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-20 h-20 bg-[#01334C] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors">
                <FiUpload className="w-4 h-4" />
                <span className="text-sm font-medium">Update image</span>
              </div>
            </label>
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {hasEmailPassword ? 'Change Password' : 'Set Email & Password'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {hasEmailPassword 
                    ? 'Update your password to keep your account secure'
                    : 'Set your email and password to login with email next time'}
                </p>
              </div>
              {!showPasswordSection && (
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="text-[#01334C] hover:text-[#00486D] text-sm font-medium"
                >
                  {hasEmailPassword ? 'Change Password' : 'Set Password'}
                </button>
              )}
            </div>

            {showPasswordSection && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {hasEmailPassword && (
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password <span className="text-gray-500 text-xs font-normal">(optional if you don't have one)</span>
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                      placeholder="Enter current password (leave empty if setting password for first time)"
                    />
                  </div>
                )}

                {!hasEmailPassword && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Make sure you've entered your email above before setting password.
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    {hasEmailPassword ? 'New Password' : 'Password'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                    placeholder={hasEmailPassword ? 'Enter new password' : 'Enter password (min 6 characters)'}
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    {hasEmailPassword ? 'Confirm New Password' : 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                    placeholder="Confirm password"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Saving...' : hasEmailPassword ? 'Change Password' : 'Set Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({ password: '', confirmPassword: '', currentPassword: '' });
                      setError('');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;

























