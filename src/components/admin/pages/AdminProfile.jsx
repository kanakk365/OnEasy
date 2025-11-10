import React, { useState, useEffect } from 'react';
import { AUTH_CONFIG } from '../../../config/auth';
import apiClient from '../../../utils/api';

function AdminProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    profileImage: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadUserData();
    loadClients();
  }, []);

  const loadUserData = () => {
    const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.date_of_birth || '',
          gender: userData.gender || '',
          profileImage: userData.profile_image || null
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const loadClients = async () => {
    try {
      const response = await apiClient.get('/admin/clients');
      if (response.success) {
        setClients(response.data || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleClientSelect = async (clientId) => {
    try {
      setSelectedClient(clientId);
      // Load notes for selected client
      const response = await apiClient.get(`/admin/client-notes/${clientId}`);
      if (response.success) {
        setAdminNotes(response.data.admin_notes || '');
        setUserNotes(response.data.user_notes || '');
      }
    } catch (error) {
      console.error('Error loading client notes:', error);
      setAdminNotes('');
      setUserNotes('');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    
    try {
      setSavingNotes(true);
      const response = await apiClient.post('/admin/update-client-notes', {
        userId: selectedClient,
        adminNotes,
        userNotes
      });

      if (response.success) {
        alert('Notes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await apiClient.put('/auth/profile', {
        name: formData.name,
        email: formData.email,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        profile_image: formData.profileImage
      });

      if (response.success) {
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || '{}');
        const updatedUser = {
          ...storedUser,
          name: formData.name,
          email: formData.email,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          profile_image: formData.profileImage
        };
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser));

        // Trigger profile update event
        window.dispatchEvent(new Event('profileUpdated'));

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#28303F]">Profile</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email and Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  placeholder="Mobile number"
                />
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="relative">
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <label className="px-6 py-3 bg-[#01334C] text-white rounded-lg cursor-pointer hover:bg-[#00486D] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  Update image
                </label>
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Profile</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Notes Section for Clients */}
        <div className="bg-white rounded-lg shadow-sm p-8 mt-6">
          <h2 className="text-2xl font-bold text-[#28303F] mb-6">Client Notes</h2>
          
          {/* User Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <select
              value={selectedClient || ''}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">-- Select a user --</option>
              {clients.map((client) => (
                <option key={client.user_id} value={client.user_id}>
                  {client.name || 'Unknown'} - {client.company_name || 'No Company'} ({client.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Notes Form - Only show when user is selected */}
          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Notes - Left Column */}
                <div className="border-r border-gray-200 pr-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Admin Notes (Private)</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
                    placeholder="Enter private admin notes (not visible to user)..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    🔒 These notes are only visible to admin/superadmin.
                  </p>
                </div>

                {/* User Notes - Right Column */}
                <div className="pl-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">User Notes (Visible to User)</h3>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
                    placeholder="Enter notes for user (visible to this user)..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    👁️ These notes will be visible to the user in their profile.
                  </p>
                </div>
              </div>

              {/* Save Notes Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedClient && (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Select a user from the dropdown above to add or edit notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;


