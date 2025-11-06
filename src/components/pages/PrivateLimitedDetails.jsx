import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRegistrationByTicketId } from '../../utils/privateLimitedApi';

function PrivateLimitedDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [directors, setDirectors] = useState([]);

  useEffect(() => {
    fetchRegistrationDetails();
  }, [ticketId]);

  const fetchRegistrationDetails = async () => {
    try {
      const result = await getRegistrationByTicketId(ticketId);
      if (result.success) {
        setRegistration(result.data.details);
        setDirectors(result.data.directors || []);
      }
    } catch (error) {
      console.error('Error fetching registration details:', error);
    } finally {
      setLoading(false);
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
            onClick={() => navigate('/private-limited-dashboard')}
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
          <button
            onClick={() => navigate('/private-limited-dashboard')}
            className="px-4 py-2 border border-[#00486D] text-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
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

