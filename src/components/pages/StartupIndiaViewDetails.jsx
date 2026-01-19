import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getStartupIndiaByTicketId, getSignedUrl } from '../../utils/startupIndiaApi';

function StartupIndiaViewDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signedUrls, setSignedUrls] = useState({});
  const [directors, setDirectors] = useState([]);

  // Check if this is an admin/superadmin view
  const isSuperAdminView = location.pathname.startsWith('/superadmin/client-details');
  const isAdminView = location.pathname.startsWith('/admin/client-details') || isSuperAdminView;
  
  // Determine the back route based on whether it's an admin view
  const getBackRoute = () => {
    if (isSuperAdminView) return '/superadmin/clients';
    if (isAdminView) return '/admin/clients';
    return '/startup-india-dashboard';
  };

  useEffect(() => {
    fetchRegistration();
  }, [ticketId]);

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStartupIndiaByTicketId(ticketId);
      console.log('📋 Startup India registration fetch result:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        setRegistration(data);
        
        // Parse directors data
        if (data.directors_data) {
          try {
            const parsed = typeof data.directors_data === 'string' 
              ? JSON.parse(data.directors_data) 
              : data.directors_data;
            setDirectors(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            console.warn('Failed to parse directors_data:', e);
            setDirectors([]);
          }
        }
        
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

  const fetchSignedUrls = async (registrationData) => {
    const urlsToFetch = {};
    
    // Step 1 documents
    if (registrationData.logo_url) urlsToFetch['logo_url'] = registrationData.logo_url;
    if (registrationData.udyam_registration_url) urlsToFetch['udyam_registration_url'] = registrationData.udyam_registration_url;
    if (registrationData.certificate_of_incorporation_url) urlsToFetch['certificate_of_incorporation_url'] = registrationData.certificate_of_incorporation_url;
    if (registrationData.pan_entity_url) urlsToFetch['pan_entity_url'] = registrationData.pan_entity_url;
    if (registrationData.tan_entity_url) urlsToFetch['tan_entity_url'] = registrationData.tan_entity_url;
    
    // Step 2 documents
    if (registrationData.ipr_document_url) urlsToFetch['ipr_document_url'] = registrationData.ipr_document_url;
    
    // Step 3 documents
    if (registrationData.registered_office_proof_url) urlsToFetch['registered_office_proof_url'] = registrationData.registered_office_proof_url;
    
    // Step 5 documents
    if (registrationData.authorization_letter_url) urlsToFetch['authorization_letter_url'] = registrationData.authorization_letter_url;
    
    // Fetch all signed URLs
    const urlPromises = Object.entries(urlsToFetch).map(async ([key, url]) => {
      try {
        const signedUrl = await getSignedUrl(url);
        return [key, signedUrl];
      } catch (error) {
        console.error(`Error fetching signed URL for ${key}:`, error);
        return [key, url]; // Fallback to original URL
      }
    });
    
    const fetchedUrls = await Promise.all(urlPromises);
    setSignedUrls(Object.fromEntries(fetchedUrls));
  };

  const handleViewDocument = async (fileUrl) => {
    try {
      const signedUrl = signedUrls[fileUrl] || await getSignedUrl(fileUrl);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to load document');
    }
  };

  const handleDownloadDocument = async (fileUrl, fileName) => {
    try {
      const signedUrl = signedUrls[fileUrl] || await getSignedUrl(fileUrl);
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName || 'document';
      link.click();
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
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
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Registration Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested registration could not be found.'}</p>
          <button
            onClick={() => navigate(getBackRoute())}
            className="px-6 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#003855]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Startup India Registration</h1>
              <p className="text-gray-600 mt-1">Ticket ID: {ticketId}</p>
            </div>
            <div className="flex gap-3">
              {/* Edit button - only for Startup India registrations (SI_ or STARTUP_ tickets) */}
              {(ticketId?.startsWith('SI_') || ticketId?.startsWith('STARTUP_')) && (
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
                        paymentId: registration.payment_id || registration.razorpay_payment_id,
                        timestamp: registration.created_at
                      }));
                      navigate('/startup-india-form');
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
              className="px-4 py-2 text-[#00486D] border border-[#00486D] rounded-lg hover:bg-[#00486D] hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
            </div>
          </div>
        </div>

        {/* Registration Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                registration.status === 'submitted' ? 'bg-green-100 text-green-800' :
                registration.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                registration.status === 'incomplete' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {formatValue(registration.status)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Package Name</p>
              <p className="font-medium">{formatValue(registration.package_name)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Package Price</p>
              <p className="font-medium">₹{registration.package_price ? Number(registration.package_price).toLocaleString('en-IN') : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              {(() => {
                // Use exact same logic as ClientServices.jsx getStatusLabel
                const hasPaymentId = registration.razorpay_payment_id || registration.payment_id;
                const paymentStatus = (registration.payment_status || '').toLowerCase().trim();
                const isPaymentCompleted = registration.payment_completed || 
                                         hasPaymentId ||
                                         paymentStatus === 'paid' || 
                                         paymentStatus === 'payment_completed';
                
                let displayStatus;
                let statusColor;
                
                // If payment is NOT completed, show payment status
                if (!isPaymentCompleted) {
                  if (paymentStatus === 'pending' || paymentStatus === 'unpaid' || paymentStatus === '') {
                    displayStatus = 'Payment pending';
                  } else if (registration.payment_status) {
                    displayStatus = registration.payment_status;
                  } else {
                    displayStatus = 'Payment pending';
                  }
                  statusColor = 'bg-red-100 text-red-800';
                } else {
                  // Payment IS completed, check service_status
                  if (registration.service_status && typeof registration.service_status === "string" && registration.service_status.trim() !== '') {
                    const serviceStatus = registration.service_status.toLowerCase().trim();
                    // Don't show "Payment completed" as service_status if payment is actually completed
                    if (serviceStatus !== 'payment completed' && serviceStatus !== 'payment_completed') {
                      displayStatus = registration.service_status;
                    } else {
                      displayStatus = 'Payment completed';
                    }
                  } else {
                    displayStatus = 'Payment completed';
                  }
                  statusColor = 'bg-green-100 text-green-800';
                }
                
                return (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${statusColor}`}>
                    {displayStatus}
                  </span>
                );
              })()}
            </div>
            {registration.payment_id && (
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-medium text-xs">{registration.payment_id}</p>
              </div>
            )}
            {registration.order_id && (
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium text-xs">{registration.order_id}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Created On</p>
              <p className="font-medium">{formatDate(registration.created_at)}</p>
            </div>
            {registration.submission_date && (
              <div>
                <p className="text-sm text-gray-600">Submitted On</p>
                <p className="font-medium">{formatDate(registration.submission_date)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 1: Business Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Business Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-medium">{formatValue(registration.business_name)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type of Business</p>
              <p className="font-medium">{formatValue(registration.business_type)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Nature of Business</p>
              <p className="font-medium">{formatValue(registration.nature_of_business)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Email</p>
              <p className="font-medium">{formatValue(registration.business_email)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Contact Number</p>
              <p className="font-medium">{formatValue(registration.business_contact_number)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Directors/Partners</p>
              <p className="font-medium">{formatValue(registration.number_of_directors_partners)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile App Link</p>
              <p className="font-medium">
                {registration.mobile_app_link ? (
                  <a href={registration.mobile_app_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {registration.mobile_app_link}
                  </a>
                ) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Website Link</p>
              <p className="font-medium">
                {registration.website_link ? (
                  <a href={registration.website_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {registration.website_link}
                  </a>
                ) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Employees</p>
              <p className="font-medium">{formatValue(registration.number_of_employees)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Recognition or Awards</p>
              <p className="font-medium">{formatValue(registration.recognition_or_awards)}</p>
            </div>
          </div>

          {/* Step 1 Documents */}
          {(registration.logo_url || registration.udyam_registration_url || registration.certificate_of_incorporation_url || registration.pan_entity_url || registration.tan_entity_url) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1 Documents</h3>
              <div className="space-y-3">
                {registration.logo_url && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Company Logo</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleViewDocument(registration.logo_url)}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(registration.logo_url, 'logo')}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {registration.udyam_registration_url && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Udyam Registration</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleViewDocument(registration.udyam_registration_url)}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(registration.udyam_registration_url, 'udyam')}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {registration.certificate_of_incorporation_url && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Certificate of Incorporation</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleViewDocument(registration.certificate_of_incorporation_url)}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(registration.certificate_of_incorporation_url, 'certificate')}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {registration.pan_entity_url && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">PAN Entity</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleViewDocument(registration.pan_entity_url)}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(registration.pan_entity_url, 'pan-entity')}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {registration.tan_entity_url && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">TAN Entity</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleViewDocument(registration.tan_entity_url)}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(registration.tan_entity_url, 'tan-entity')}
                        className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Startup Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Startup Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Problem Solving</p>
              <p className="font-medium">{formatValue(registration.problem_solving)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Solution Proposal</p>
              <p className="font-medium">{formatValue(registration.solution_proposal)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Uniqueness of Solution</p>
              <p className="font-medium">{formatValue(registration.uniqueness_of_solution)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Revenue Model</p>
              <p className="font-medium">{formatValue(registration.revenue_model)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Innovation Note</p>
              <p className="font-medium">{formatValue(registration.innovation_note)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Has IPR</p>
              <p className="font-medium">{formatValue(registration.has_ipr)}</p>
            </div>
            {registration.ipr_document_url && (
              <div>
                <p className="text-sm text-gray-600">IPR Document</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleViewDocument(registration.ipr_document_url)}
                    className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(registration.ipr_document_url, 'ipr-document')}
                    className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Office Address */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Registered Office Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Address Line 1</p>
              <p className="font-medium">{formatValue(registration.registered_office_address_line1)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Address Line 2</p>
              <p className="font-medium">{formatValue(registration.registered_office_address_line2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-medium">{formatValue(registration.registered_office_city)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">State</p>
              <p className="font-medium">{formatValue(registration.registered_office_state)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Country</p>
              <p className="font-medium">{formatValue(registration.registered_office_country)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pin Code</p>
              <p className="font-medium">{formatValue(registration.registered_office_pincode)}</p>
            </div>
            {registration.registered_office_proof_url && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Registered Office Proof</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleViewDocument(registration.registered_office_proof_url)}
                    className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(registration.registered_office_proof_url, 'office-proof')}
                    className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Directors/Partners */}
        {directors.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 4: Directors/Partners Details</h2>
            <div className="space-y-6">
              {directors.map((director, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Director/Partner {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name (as per PAN)</p>
                      <p className="font-medium">{formatValue(director.name)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{formatValue(director.email)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-medium">{formatValue(director.contactNumber)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Authorized Representative</p>
                      <p className="font-medium">{formatValue(director.isAuthorizedRepresentative)}</p>
                    </div>
                    {director.aadhaarCard && (
                      <div>
                        <p className="text-sm text-gray-600">Aadhaar Card</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleViewDocument(director.aadhaarCard)}
                            className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(director.aadhaarCard, `director-${index + 1}-aadhaar`)}
                            className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                    {director.panCard && (
                      <div>
                        <p className="text-sm text-gray-600">PAN Card</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleViewDocument(director.panCard)}
                            className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(director.panCard, `director-${index + 1}-pan`)}
                            className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Authorization Letter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 5: Authorization Letter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registration.authorized_representative_name && (
              <div>
                <p className="text-sm text-gray-600">Authorized Representative Name</p>
                <p className="font-medium">{formatValue(registration.authorized_representative_name)}</p>
              </div>
            )}
            {registration.authorized_representative_designation && (
              <div>
                <p className="text-sm text-gray-600">Authorized Representative Designation</p>
                <p className="font-medium">{formatValue(registration.authorized_representative_designation)}</p>
              </div>
            )}
            {registration.authorization_letter_url && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Authorization Letter</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleViewDocument(registration.authorization_letter_url)}
                    className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(registration.authorization_letter_url, 'authorization-letter')}
                    className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartupIndiaViewDetails;
