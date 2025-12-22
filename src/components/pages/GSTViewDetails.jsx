import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getGSTByTicketId, getSignedUrl } from '../../utils/gstApi';

function GSTViewDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signedUrls, setSignedUrls] = useState({});

  // Check if this is an admin/superadmin view
  const isSuperAdminView = location.pathname.startsWith('/superadmin/client-details');
  const isAdminView = location.pathname.startsWith('/admin/client-details') || isSuperAdminView;
  
  // Determine the back route based on whether it's an admin view
  const getBackRoute = () => {
    if (isSuperAdminView) return '/superadmin/clients';
    if (isAdminView) return '/admin/clients';
    return '/gst-dashboard';
  };

  useEffect(() => {
    fetchRegistration();
  }, [ticketId]);

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGSTByTicketId(ticketId);
      console.log('📋 GST registration fetch result:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        setRegistration(data);
        
        // Fetch signed URLs for documents
        await fetchSignedUrls(data);
      } else {
        console.error('❌ Registration not found or invalid response:', response);
        setError('Registration not found');
      }
    } catch (err) {
      console.error('❌ Error fetching registration:', err);
      setError(err.message || 'Failed to load registration details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignedUrls = async (data) => {
    const urls = {};
    const documentFields = [
      'electricity_bill_url',
      'property_tax_url',
      'rental_agreement_url',
      'landlord_pan_card_url',
      'landlord_aadhaar_card_url',
      'pan_card_url',
      'principal_place_photo_url',
      'business_bank_statement_url',
      'partnership_deed_url',
      'certificate_of_incorporation_url'
    ];

    for (const field of documentFields) {
      if (data[field]) {
        try {
          const urlResponse = await getSignedUrl(data[field]);
          if (urlResponse.success && urlResponse.url) {
            urls[field] = urlResponse.url;
          }
        } catch (err) {
          console.warn(`Failed to get signed URL for ${field}:`, err);
        }
      }
    }

    setSignedUrls(urls);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'incomplete':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
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

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Registration Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            {error || 'The registration you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <button
            onClick={() => navigate(getBackRoute())}
            className="px-6 py-3 bg-[#00486D] text-white rounded-md hover:bg-[#003855] transition-colors"
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#28303F]">
              GST Registration Details
            </h1>
            <p className="text-gray-600 mt-1">
              Ticket ID: <span className="font-medium text-[#00486D]">{ticketId}</span>
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Edit button - only for GST registrations (GST_ tickets) */}
            {ticketId?.startsWith('GST_') && (
              <button
                onClick={() => {
                  // Navigate to appropriate form page based on user role
                  if (isSuperAdminView) {
                    // SuperAdmin: Navigate to fill-form page within superadmin layout
                    navigate(`/superadmin/fill-form/${ticketId}`);
                  } else if (isAdminView) {
                    // Admin: Navigate to fill-form page within admin layout
                    navigate(`/admin/fill-form/${ticketId}`);
                  } else {
                    // Regular user: Navigate to regular form page
                    localStorage.setItem('editingTicketId', ticketId);
                    localStorage.setItem('selectedPackage', JSON.stringify({
                      name: registration.package_name,
                      price: registration.package_price,
                      priceValue: registration.package_price
                    }));
                    localStorage.setItem('paymentDetails', JSON.stringify({
                      orderId: registration.order_id || registration.razorpay_order_id,
                      paymentId: registration.razorpay_payment_id || registration.payment_id,
                      timestamp: registration.created_at
                    }));
                    navigate('/gst-form');
                  }
                }}
                className="px-4 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Registration
              </button>
            )}
            <button
              onClick={() => navigate(getBackRoute())}
              className="px-4 py-2 border border-[#00486D] text-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
            >
              Back to Dashboard
            </button>
            <span
              className={`px-4 py-2 rounded-md text-sm font-medium ${getStatusColor(registration.status)}`}
            >
              {registration.status || 'Draft'}
            </span>
          </div>
        </div>

        {/* Registration Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Business Information */}
          <div>
            <h2 className="text-lg font-semibold text-[#28303F] mb-4 pb-2 border-b">
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Business Name:</span>
                <p className="text-gray-900">{formatValue(registration.business_name)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Nature of Business:</span>
                <p className="text-gray-900">{formatValue(registration.nature_of_business)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Constitution of Business:</span>
                <p className="text-gray-900">{formatValue(registration.constitution_of_business)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{formatValue(registration.business_email)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Phone:</span>
                <p className="text-gray-900">{formatValue(registration.business_phone)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Number of Directors/Partners:</span>
                <p className="text-gray-900">{formatValue(registration.number_of_directors_partners)}</p>
              </div>
              {registration.cin_llp_number && (
                <div>
                  <span className="text-sm font-medium text-gray-600">CIN/LLP Number:</span>
                  <p className="text-gray-900">{formatValue(registration.cin_llp_number)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Registered Office Address */}
          {(registration.address_line1 || registration.city || registration.state || registration.pincode) && (
            <div>
              <h2 className="text-lg font-semibold text-[#28303F] mb-4 pb-2 border-b">
                Registered Office Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Address Line 1:</span>
                  <p className="text-gray-900">{formatValue(registration.address_line1)}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Address Line 2:</span>
                  <p className="text-gray-900">{formatValue(registration.address_line2)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">City:</span>
                  <p className="text-gray-900">{formatValue(registration.city)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">State:</span>
                  <p className="text-gray-900">{formatValue(registration.state)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Country:</span>
                  <p className="text-gray-900">{formatValue(registration.country || 'India')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Pincode:</span>
                  <p className="text-gray-900">{formatValue(registration.pincode)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Place of Business */}
          {(registration.additional_address_line1 || registration.additional_city || registration.additional_state) && (
            <div>
              <h2 className="text-lg font-semibold text-[#28303F] mb-4 pb-2 border-b">
                Additional Place of Business
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Address Line 1:</span>
                  <p className="text-gray-900">{formatValue(registration.additional_address_line1)}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Address Line 2:</span>
                  <p className="text-gray-900">{formatValue(registration.additional_address_line2)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">City:</span>
                  <p className="text-gray-900">{formatValue(registration.additional_city)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">State:</span>
                  <p className="text-gray-900">{formatValue(registration.additional_state)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Pincode:</span>
                  <p className="text-gray-900">{formatValue(registration.additional_pincode)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Package & Payment Information */}
          <div>
            <h2 className="text-lg font-semibold text-[#28303F] mb-4 pb-2 border-b">
              Package & Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Package:</span>
                <p className="text-gray-900">{formatValue(registration.package_name)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <p className="text-gray-900">
                  {registration.package_price ? `₹${Number(registration.package_price).toLocaleString('en-IN')}` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                <p className="text-gray-900">{formatValue(registration.payment_status)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Payment ID:</span>
                <p className="text-gray-900">{formatValue(registration.razorpay_payment_id || registration.payment_id)}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h2 className="text-lg font-semibold text-[#28303F] mb-4 pb-2 border-b">
              Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registration.electricity_bill_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Electricity Bill:</span>
                  <div className="mt-1">
                    {signedUrls.electricity_bill_url ? (
                      <a href={signedUrls.electricity_bill_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.property_tax_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Property Tax:</span>
                  <div className="mt-1">
                    {signedUrls.property_tax_url ? (
                      <a href={signedUrls.property_tax_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.rental_agreement_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Rental Agreement/Sale Deed/Affidavit:</span>
                  <div className="mt-1">
                    {signedUrls.rental_agreement_url ? (
                      <a href={signedUrls.rental_agreement_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.landlord_pan_card_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Landlord PAN Card:</span>
                  <div className="mt-1">
                    {signedUrls.landlord_pan_card_url ? (
                      <a href={signedUrls.landlord_pan_card_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.landlord_aadhaar_card_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Landlord Aadhaar Card:</span>
                  <div className="mt-1">
                    {signedUrls.landlord_aadhaar_card_url ? (
                      <a href={signedUrls.landlord_aadhaar_card_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.pan_card_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Business PAN Card:</span>
                  <div className="mt-1">
                    {signedUrls.pan_card_url ? (
                      <a href={signedUrls.pan_card_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.principal_place_photo_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Principal Place Photo:</span>
                  <div className="mt-1">
                    {signedUrls.principal_place_photo_url ? (
                      <a href={signedUrls.principal_place_photo_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.business_bank_statement_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Business Bank Statement:</span>
                  <div className="mt-1">
                    {signedUrls.business_bank_statement_url ? (
                      <a href={signedUrls.business_bank_statement_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.partnership_deed_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Partnership Deed:</span>
                  <div className="mt-1">
                    {signedUrls.partnership_deed_url ? (
                      <a href={signedUrls.partnership_deed_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
              {registration.certificate_of_incorporation_url && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Certificate of Incorporation:</span>
                  <div className="mt-1">
                    {signedUrls.certificate_of_incorporation_url ? (
                      <a href={signedUrls.certificate_of_incorporation_url} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                    ) : <span className="text-gray-500">Processing...</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Directors/Partners Information */}
          {registration.directors_data && (
            <div>
              <h2 className="text-lg font-semibold text-[#28303F] mb-4 pb-2 border-b">
                Directors/Partners Information
              </h2>
              {(() => {
                try {
                  const directors = typeof registration.directors_data === 'string' 
                    ? JSON.parse(registration.directors_data) 
                    : registration.directors_data;
                  
                  if (Array.isArray(directors) && directors.length > 0) {
                    return directors.map((director, index) => (
                      <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-3">Director/Partner {index + 1}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Name:</span>
                            <p className="text-gray-900">{formatValue(director.name)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Email:</span>
                            <p className="text-gray-900">{formatValue(director.email)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Mobile Number:</span>
                            <p className="text-gray-900">{formatValue(director.mobileNumber)}</p>
                          </div>
                          {director.isAuthorizedSignatory && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Authorized Signatory:</span>
                              <p className="text-gray-900">{formatValue(director.isAuthorizedSignatory)}</p>
                            </div>
                          )}
                          {director.aadhaarCardUrl && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Aadhaar Card:</span>
                              <div className="mt-1">
                                <a href={director.aadhaarCardUrl} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                              </div>
                            </div>
                          )}
                          {director.panCardUrl && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">PAN Card:</span>
                              <div className="mt-1">
                                <a href={director.panCardUrl} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                              </div>
                            </div>
                          )}
                          {director.passportPhotoUrl && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Passport Photo:</span>
                              <div className="mt-1">
                                <a href={director.passportPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-[#00486D] hover:underline">View Document</a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  }
                } catch (e) {
                  console.error('Error parsing directors_data:', e);
                }
                return null;
              })()}
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h2 className="text-lg font-semibold text-[#28303F] mb-4 pb-2 border-b">
              Timestamps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Created At:</span>
                <p className="text-gray-900">{formatDate(registration.created_at)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Updated At:</span>
                <p className="text-gray-900">{formatDate(registration.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GSTViewDetails;

