import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProprietorshipByTicketId, getSignedUrl } from '../../utils/proprietorshipApi';

function ProprietorshipViewDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [signedUrls, setSignedUrls] = useState({});

  useEffect(() => {
    fetchRegistrationDetails();
  }, [ticketId]);

  const fetchRegistrationDetails = async () => {
    try {
      const result = await getProprietorshipByTicketId(ticketId);
      if (result.success) {
        setRegistration(result.data);
        // Fetch signed URLs for documents
        await fetchSignedUrls(result.data);
      }
    } catch (error) {
      console.error('Error fetching registration details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSignedUrls = async (registrationData) => {
    const urlsToFetch = {};
    
    // Business documents
    if (registrationData.utility_bill) {
      urlsToFetch['utility_bill'] = registrationData.utility_bill;
    }
    if (registrationData.rental_agreement) {
      urlsToFetch['rental_agreement'] = registrationData.rental_agreement;
    }

    // Proprietor documents
    if (registrationData.aadhaar_card) {
      urlsToFetch['aadhaar_card'] = registrationData.aadhaar_card;
    }
    if (registrationData.passport_photo) {
      urlsToFetch['passport_photo'] = registrationData.passport_photo;
    }
    if (registrationData.pan_card) {
      urlsToFetch['pan_card'] = registrationData.pan_card;
    }
    if (registrationData.bank_statement) {
      urlsToFetch['bank_statement'] = registrationData.bank_statement;
    }
    if (registrationData.name_board) {
      urlsToFetch['name_board'] = registrationData.name_board;
    }

    // Fetch all signed URLs in parallel
    const signedUrlPromises = Object.entries(urlsToFetch).map(async ([key, url]) => {
      const signedUrl = await getSignedUrl(url);
      return [key, signedUrl];
    });

    const signedUrlResults = await Promise.all(signedUrlPromises);
    const signedUrlsMap = Object.fromEntries(signedUrlResults);
    
    setSignedUrls(signedUrlsMap);
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
            onClick={() => navigate('/proprietorship-dashboard')}
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
                {registration.business_name || 'Business Name Pending'}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status || 'pending')}`}>
                {registration.status || 'Pending'}
              </span>
            </div>
            <p className="text-gray-600">Proprietorship Registration Details</p>
          </div>
          <button
            onClick={() => navigate('/proprietorship-dashboard')}
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

        {/* Section 1: Basic Business Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 1: Basic Business Details</h2>
          
          {/* Business Information */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Business Name:</span>
                <p className="text-gray-600">{registration.business_name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Business Email:</span>
                <p className="text-gray-600">{registration.business_email || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Contact Number:</span>
                <p className="text-gray-600">{registration.contact_number || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Nature of Business:</span>
                <p className="text-gray-600">{registration.nature_of_business || 'N/A'}</p>
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

          {/* Business Documents */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Business Documents</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700 block mb-1">Utility Bill:</span>
                {registration.utility_bill ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={signedUrls.utility_bill || registration.utility_bill}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </a>
                    <a
                      href={signedUrls.utility_bill || registration.utility_bill}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
              </div>

              <div>
                <span className="font-medium text-gray-700 block mb-1">Rental Agreement/Affidavit:</span>
                {registration.rental_agreement ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={signedUrls.rental_agreement || registration.rental_agreement}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </a>
                    <a
                      href={signedUrls.rental_agreement || registration.rental_agreement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Additional Business Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Male Employees:</span>
                <p className="text-gray-600">{registration.male_employees || '0'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Female Employees:</span>
                <p className="text-gray-600">{registration.female_employees || '0'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Business Type:</span>
                <p className="text-gray-600">{registration.business_type || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Social Category:</span>
                <p className="text-gray-600">{registration.social_category || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Special Abled:</span>
                <p className="text-gray-600">{registration.special_abled ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">GSTIN Number:</span>
                <p className="text-gray-600">{registration.gstin_number || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date of Incorporation:</span>
                <p className="text-gray-600">{formatDate(registration.date_of_incorporation)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Business Commenced:</span>
                <p className="text-gray-600">{registration.business_commenced ? 'Yes' : 'No'}</p>
              </div>
              {registration.business_commenced && (
                <div>
                  <span className="font-medium text-gray-700">Date of Commencement:</span>
                  <p className="text-gray-600">{formatDate(registration.date_of_commencement)}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Filed ITR:</span>
                <p className="text-gray-600">{registration.filed_itr ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {(registration.bank_name || registration.bank_account_number || registration.ifsc_code) && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Bank Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Bank Name:</span>
                  <p className="text-gray-600">{registration.bank_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Account Number:</span>
                  <p className="text-gray-600">{registration.bank_account_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">IFSC Code:</span>
                  <p className="text-gray-600">{registration.ifsc_code || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Basic Proprietor Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Section 2: Basic Proprietor Details</h2>
          
          {/* Proprietor Information */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Proprietor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-600">{registration.proprietor_name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date of Birth:</span>
                <p className="text-gray-600">{formatDate(registration.date_of_birth)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Occupation Type:</span>
                <p className="text-gray-600">{registration.occupation_type || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{registration.proprietor_email || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Contact Number:</span>
                <p className="text-gray-600">{registration.proprietor_contact || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Permanent Address */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Permanent Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Address Line 1:</span>
                <p className="text-gray-600">{registration.permanent_address_line1 || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Address Line 2:</span>
                <p className="text-gray-600">{registration.permanent_address_line2 || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">City:</span>
                <p className="text-gray-600">{registration.permanent_city || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">State:</span>
                <p className="text-gray-600">{registration.permanent_state || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Country:</span>
                <p className="text-gray-600">{registration.permanent_country || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Pin Code:</span>
                <p className="text-gray-600">{registration.permanent_pincode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Proprietor Documents */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">Proprietor Documents</h3>
            <div className="space-y-3 text-sm">
              {/* Aadhaar Card */}
              <div>
                <span className="font-medium text-gray-700 block mb-1">Aadhaar Card:</span>
                {registration.aadhaar_card ? (
                  <div className="flex items-center gap-2">
                    <a href={signedUrls.aadhaar_card || registration.aadhaar_card} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Download
                    </a>
                    <a href={signedUrls.aadhaar_card || registration.aadhaar_card} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </a>
                  </div>
                ) : (<p className="text-gray-500">N/A</p>)}
              </div>

              {/* Passport Photo */}
              <div>
                <span className="font-medium text-gray-700 block mb-1">Passport Photo:</span>
                {registration.passport_photo ? (
                  <div className="flex items-center gap-2">
                    <a href={signedUrls.passport_photo || registration.passport_photo} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Download
                    </a>
                    <a href={signedUrls.passport_photo || registration.passport_photo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </a>
                  </div>
                ) : (<p className="text-gray-500">N/A</p>)}
              </div>

              {/* PAN Card */}
              <div>
                <span className="font-medium text-gray-700 block mb-1">PAN Card:</span>
                {registration.pan_card ? (
                  <div className="flex items-center gap-2">
                    <a href={signedUrls.pan_card || registration.pan_card} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Download
                    </a>
                    <a href={signedUrls.pan_card || registration.pan_card} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </a>
                  </div>
                ) : (<p className="text-gray-500">N/A</p>)}
              </div>

              {/* Bank Statement */}
              <div>
                <span className="font-medium text-gray-700 block mb-1">Bank Statement:</span>
                {registration.bank_statement ? (
                  <div className="flex items-center gap-2">
                    <a href={signedUrls.bank_statement || registration.bank_statement} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Download
                    </a>
                    <a href={signedUrls.bank_statement || registration.bank_statement} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </a>
                  </div>
                ) : (<p className="text-gray-500">N/A</p>)}
              </div>

              {/* Name Board (Optional) */}
              {registration.name_board && (
                <div>
                  <span className="font-medium text-gray-700 block mb-1">Name Board:</span>
                  <div className="flex items-center gap-2">
                    <a href={signedUrls.name_board || registration.name_board} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Download
                    </a>
                    <a href={signedUrls.name_board || registration.name_board} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProprietorshipViewDetails;

