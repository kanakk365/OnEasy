import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRegistrationByTicketId } from '../../utils/privateLimitedApi';
import apiClient from '../../utils/api';

function PrivateLimitedDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [directors, setDirectors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editData, setEditData] = useState({
    nameApplicationStatus: '',
    businessName: '',
    businessNameOption2: '',
    nameReason: '',
    statusMessage: ''
  });

  // Check if this is an admin/superadmin view
  const isSuperAdminView = location.pathname.startsWith('/superadmin/client-details');
  const isAdminView = location.pathname.startsWith('/admin/client-details') || isSuperAdminView;
  
  // Determine the back route based on whether it's an admin view
  const getBackRoute = () => {
    if (isSuperAdminView) return '/superadmin/clients';
    if (isAdminView) return '/admin/clients';
    return '/private-limited-dashboard';
  };

  useEffect(() => {
    fetchRegistrationDetails();
  }, [ticketId]);

  const fetchRegistrationDetails = async () => {
    try {
      const result = await getRegistrationByTicketId(ticketId);
      if (result.success) {
        setRegistration(result.data.details);
        setDirectors(result.data.directors || []);
        // Initialize edit data
        setEditData({
          nameApplicationStatus: result.data.details.name_application_status || 'pending',
          businessName: result.data.details.business_name || '',
          businessNameOption2: result.data.details.business_name_option2 || '',
          nameReason: result.data.details.name_reason || '',
          statusMessage: result.data.details.status_message || ''
        });
      }
    } catch (error) {
      console.error('Error fetching registration details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await apiClient.post('/private-limited/update-status', {
        ticketId,
        nameApplicationStatus: editData.nameApplicationStatus,
        businessName: editData.businessName,
        businessNameOption2: editData.businessNameOption2,
        nameReason: editData.nameReason,
        statusMessage: editData.statusMessage
      });

      if (response.success) {
        alert('Status updated successfully! User has been notified via email.');
        fetchRegistrationDetails(); // Refresh data
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Not Found</h3>
          <p className="text-gray-600 mb-4">The registration you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(getBackRoute())}
            className="px-6 py-2 text-white rounded-md"
            style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#28303F]">
                {registration.business_name || 'Company Name Pending'}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status || 'pending')}`}>
                {registration.status || 'Pending'}
              </span>
            </div>
            <p className="text-gray-600">Registration Details</p>
          </div>
          <div className="flex gap-3">
            {/* Edit button - for both admin and user */}
            <button
              onClick={() => {
                // Store the ticket ID and redirect to form for editing
                localStorage.setItem('editingTicketId', ticketId);
                localStorage.setItem('selectedPackage', JSON.stringify({
                  name: registration.package_name,
                  price: registration.package_price,
                  priceValue: registration.package_price
                }));
                localStorage.setItem('paymentDetails', JSON.stringify({
                  orderId: registration.razorpay_order_id,
                  paymentId: registration.razorpay_payment_id,
                  timestamp: registration.created_at
                }));
                
                // Navigate to appropriate form page
                if (isAdminView) {
                  navigate('/private-limited-form');
                } else {
                  navigate('/private-limited-form');
                }
              }}
              className="px-4 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Registration
            </button>
            <button
              onClick={() => navigate(getBackRoute())}
              className="px-4 py-2 border border-[#00486D] text-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Registration Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Ticket ID:</span>
              <p className="text-gray-600">{registration.ticket_id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Submitted On:</span>
              <p className="text-gray-600">{formatDate(registration.created_at)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Package:</span>
              <p className="text-gray-600">{registration.package_name || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Package Price:</span>
              <p className="text-gray-600">₹{registration.package_price ? Number(registration.package_price).toLocaleString('en-IN') : 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Payment Status:</span>
              <p className="text-gray-600 capitalize">{registration.payment_status || 'Unpaid'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Razorpay Payment ID:</span>
              <p className="text-gray-600 text-xs">{registration.razorpay_payment_id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Admin Control Panel */}
        {isAdminView && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Controls - Name Application Status
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {isEditing ? 'Cancel' : 'Edit Status'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status of Name Application *
                  </label>
                  <select
                    value={editData.nameApplicationStatus}
                    onChange={(e) => setEditData({ ...editData, nameApplicationStatus: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="resubmission">Resubmission Required</option>
                  </select>
                </div>

                {/* Show name fields if Resubmission is selected */}
                {editData.nameApplicationStatus === 'resubmission' && (
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-800 mb-3 font-medium">
                      ⚠️ Resubmission Mode: User will be asked to provide new company names
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Suggested Name Option 1
                        </label>
                        <input
                          type="text"
                          value={editData.businessName}
                          onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Leave blank if user should provide new names"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Suggested Name Option 2
                        </label>
                        <input
                          type="text"
                          value={editData.businessNameOption2}
                          onChange={(e) => setEditData({ ...editData, businessNameOption2: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Leave blank if user should provide new names"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Message to User */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to User (optional)
                  </label>
                  <textarea
                    value={editData.statusMessage}
                    onChange={(e) => setEditData({ ...editData, statusMessage: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter any additional instructions or comments for the user..."
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Save & Notify User
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Current Status:</span>
                    <p className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      editData.nameApplicationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      editData.nameApplicationStatus === 'resubmission' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {editData.nameApplicationStatus === 'approved' ? '✓ Approved' :
                       editData.nameApplicationStatus === 'resubmission' ? '⚠ Resubmission Required' :
                       '⏳ Pending'}
                    </p>
                  </div>
                  {editData.statusMessage && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700">Admin Message:</span>
                      <p className="mt-1 text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                        {editData.statusMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User View - Status Update Notification */}
        {!isAdminView && registration.name_application_status && registration.name_application_status !== 'pending' && (
          <div className={`rounded-lg shadow-md p-6 mb-6 border-2 ${
            registration.name_application_status === 'approved' 
              ? 'bg-green-50 border-green-300' 
              : 'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                registration.name_application_status === 'approved' 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`}>
                {registration.name_application_status === 'approved' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  registration.name_application_status === 'approved' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {registration.name_application_status === 'approved' 
                    ? '✅ Your Company Name Has Been Approved!' 
                    : '⚠️ Name Resubmission Required'}
                </h3>
                {registration.status_message && (
                  <div className="bg-white p-4 rounded border border-gray-200 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Message from OnEasy:</p>
                    <p className="text-sm text-gray-600">{registration.status_message}</p>
                  </div>
                )}
                {registration.name_application_status === 'approved' && (
                  <p className="text-sm text-green-700">
                    Your proposed company name has been approved. You can proceed with the next steps of your registration.
                  </p>
                )}
                {registration.name_application_status === 'resubmission' && (
                  <p className="text-sm text-yellow-700">
                    Please review the feedback and submit new company names as requested.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Name Application */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Name Application</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Business Name (Option 1):</span>
              <p className="text-gray-600">{registration.business_name || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Business Name (Option 2):</span>
              <p className="text-gray-600">{registration.business_name_option2 || 'N/A'}</p>
            </div>
            {registration.name_reason && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Reason for Names:</span>
                <p className="text-gray-600">{registration.name_reason}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Company Type:</span>
              <p className="text-gray-600">{registration.business_type || 'N/A'}</p>
            </div>
            {registration.nature_of_business && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Nature of Business:</span>
                <p className="text-gray-600">{registration.nature_of_business}</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Basic Company Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Basic Company Details</h2>
          
          {/* Directors & Capital Info */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Directors & Capital Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Number of Proposed Directors:</span>
                <p className="text-gray-600">{registration.directors_partners_count || 0}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Number of Proposed Shareholders:</span>
                <p className="text-gray-600">{registration.shareholders_count || 0}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Authorized Capital:</span>
                <p className="text-gray-600">₹{registration.authorized_capital ? Number(registration.authorized_capital).toLocaleString('en-IN') : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Paid-Up Capital:</span>
                <p className="text-gray-600">₹{registration.paid_up_capital ? Number(registration.paid_up_capital).toLocaleString('en-IN') : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Company Email:</span>
                <p className="text-gray-600">{registration.business_email || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Contact Number:</span>
                <p className="text-gray-600">{registration.business_contact_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Registered Office Address */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Registered Office Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Address Line 1:</span>
                <p className="text-gray-600">{registration.address_line1 || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Address Line 2:</span>
                <p className="text-gray-600">{registration.address_line2 || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">City:</span>
                <p className="text-gray-600">{registration.city || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">State:</span>
                <p className="text-gray-600">{registration.state || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Country:</span>
                <p className="text-gray-600">{registration.country || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Pin Code:</span>
                <p className="text-gray-600">{registration.pincode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Admin Fields */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Admin Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Approved Company Name:</span>
                <p className="text-gray-600">{registration.approved_company_name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Name Approval Letter:</span>
                <p className={registration.name_approval_letter ? "text-blue-600" : "text-gray-500"}>
                  {registration.name_approval_letter ? '✓ Uploaded (PDF)' : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* NOC & Documents */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">NOC from Landlord</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="font-medium text-gray-700">NOC Date:</span>
                <p className="text-gray-600">{registration.noc_date ? formatDate(registration.noc_date) : 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Landlord Name:</span>
                <p className="text-gray-600">{registration.landlord_name || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Registered Premises Address:</span>
                <p className="text-gray-600">{registration.registered_premises_address || 'N/A'}</p>
              </div>
            </div>
            
            <h3 className="text-md font-semibold text-gray-800 mb-3">Utility Bill</h3>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Utility Bill (Electricity/Similar):</span>
              <p className={registration.utility_bill ? "text-blue-600" : "text-gray-500"}>
                {registration.utility_bill ? '✓ Uploaded' : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Directors Information */}
        {directors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Directors & Shareholders Details</h2>
            <div className="space-y-6">
              {directors.map((director, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {director.relation_with_company || 'Director'} {idx + 1}
                  </h3>
                  
                  {/* Basic Information */}
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <p className="text-gray-600">{director.director_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Relation:</span>
                        <p className="text-gray-600">{director.relation_with_company || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Designation:</span>
                        <p className="text-gray-600">{director.designation || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Education:</span>
                        <p className="text-gray-600">{director.educational_qualification || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date of Birth:</span>
                        <p className="text-gray-600">{director.date_of_birth ? formatDate(director.date_of_birth) : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Gender:</span>
                        <p className="text-gray-600">{director.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Occupation:</span>
                        <p className="text-gray-600">{director.occupation_type || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Place of Birth:</span>
                        <p className="text-gray-600">
                          {director.place_of_birth_district || director.place_of_birth_state 
                            ? `${director.place_of_birth_district || 'N/A'}, ${director.place_of_birth_state || 'N/A'}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shareholder Information */}
                  {(director.relation_with_company === 'Shareholder' || director.relation_with_company === 'Both Director and Shareholder' || director.number_of_shares) && (
                    <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Shareholder Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Number of Shares:</span>
                          <p className="text-gray-600">{director.number_of_shares || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Face Value per Share:</span>
                          <p className="text-gray-600">₹{director.face_value_per_share || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Total Equity:</span>
                          <p className="text-gray-600">₹{director.total_equity ? Number(director.total_equity).toLocaleString('en-IN') : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Share Percentage:</span>
                          <p className="text-gray-600">{director.share_percentage ? director.share_percentage + '%' : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">PAN Number:</span>
                        <p className="text-gray-600">{director.pan_number || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-600">{director.director_email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Contact Number:</span>
                        <p className="text-gray-600">{director.director_contact || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Permanent Address */}
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Permanent Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Address Line 1:</span>
                        <p className="text-gray-600">{director.permanent_address_line1 || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Address Line 2:</span>
                        <p className="text-gray-600">{director.permanent_address_line2 || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">City:</span>
                        <p className="text-gray-600">{director.permanent_city || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">State:</span>
                        <p className="text-gray-600">{director.permanent_state || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Country:</span>
                        <p className="text-gray-600">{director.permanent_country || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Pin Code:</span>
                        <p className="text-gray-600">{director.permanent_pincode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Present Address */}
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Present Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Address Line 1:</span>
                        <p className="text-gray-600">{director.present_address_line1 || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Address Line 2:</span>
                        <p className="text-gray-600">{director.present_address_line2 || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">City:</span>
                        <p className="text-gray-600">{director.present_city || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">State:</span>
                        <p className="text-gray-600">{director.present_state || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Country:</span>
                        <p className="text-gray-600">{director.present_country || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Pin Code:</span>
                        <p className="text-gray-600">{director.present_pincode || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Duration of Stay:</span>
                        <p className="text-gray-600">{director.duration_of_stay_years || 0} years, {director.duration_of_stay_months || 0} months</p>
                      </div>
                    </div>
                  </div>

                  {/* Bank & Other Company Details */}
                  <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Authorized Signatory:</span>
                        <p className="text-gray-600">{director.is_authorized_signatory ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Director in Other Company:</span>
                        <p className="text-gray-600">
                          {director.is_director_in_other_company && director.other_company_name
                            ? `${director.other_company_name} (${director.other_company_position || 'N/A'})`
                            : 'No'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Shareholder in Other Company:</span>
                        <p className="text-gray-600">
                          {director.is_shareholder_in_other_company && director.other_shareholder_company_name
                            ? `${director.other_shareholder_company_name} (${director.other_company_shares || 'N/A'} shares)`
                            : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Documents Submitted</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Aadhaar Card:</span>
                        <p className={director.aadhaar_doc_path ? "text-blue-600" : "text-gray-500"}>
                          {director.aadhaar_doc_path ? '✓ Uploaded' : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Passport Photo:</span>
                        <p className={director.photo_path ? "text-blue-600" : "text-gray-500"}>
                          {director.photo_path ? '✓ Uploaded' : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">PAN Card:</span>
                        <p className={director.pan_doc_path ? "text-blue-600" : "text-gray-500"}>
                          {director.pan_doc_path ? '✓ Uploaded' : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Bank Statement/Utility Bill:</span>
                        <p className={director.bank_statement_or_utility_bill ? "text-blue-600" : "text-gray-500"}>
                          {director.bank_statement_or_utility_bill ? '✓ Uploaded' : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Specimen Signature:</span>
                        <p className={director.specimen_signature ? "text-blue-600" : "text-gray-500"}>
                          {director.specimen_signature ? '✓ Uploaded' : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default PrivateLimitedDetails;

