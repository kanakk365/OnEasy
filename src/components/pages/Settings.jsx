import React, { useState, useEffect } from 'react';
import { FiUpload } from 'react-icons/fi';
import apiClient from '../../utils/api';
import { AUTH_CONFIG } from '../../config/auth';

function Settings() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'male',
    profile_image: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setInitialLoading(true);
      const response = await apiClient.getMe();
      if (response.success && response.data) {
        const user = response.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          dob: user.dob || '',
          gender: user.gender || 'male',
          profile_image: user.profile_image || ''
        });
        if (user.profile_image) {
          setProfileImage(user.profile_image);
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      // Try to load from localStorage as fallback
      const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          dob: user.dob || '',
          gender: user.gender || 'male',
          profile_image: user.profile_image || ''
        });
      }
    } finally {
      setInitialLoading(false);
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
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Reload user data to reflect changes
        setTimeout(() => {
          loadUserData();
          // Dispatch event to notify Sidebar and Header to update
          window.dispatchEvent(new Event('profileUpdated'));
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01334C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Error/Success Messages */}
          {error && (
            <div className="m-6 mb-0 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="m-6 mb-0 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b border-gray-200">
              Personal Information
            </h2>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email and Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
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
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent transition-all"
                  placeholder="Phone number"
                />
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent appearance-none bg-white transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Profile Image */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-[#01334C] rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="inline-flex items-center space-x-2 px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors">
                      <FiUpload className="w-5 h-5" />
                      <span className="font-medium">Update Image</span>
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;

