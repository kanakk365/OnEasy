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

  const loadUserData = async () => {
    try {
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
        if (user.profile_image) {
          setProfileImage(user.profile_image);
        }
      }
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
        setTimeout(() => {
          onClose();
          // Reload page to reflect changes
          window.location.reload();
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
              value={formData.name}
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
                value={formData.email}
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
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                placeholder="9858015257"
              />
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


