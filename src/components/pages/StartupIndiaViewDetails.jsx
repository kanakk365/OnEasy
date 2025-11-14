import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStartupIndiaByTicketId, getSignedUrl } from '../../utils/startupIndiaApi';

function StartupIndiaViewDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegistration();
  }, [ticketId]);

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      const response = await getStartupIndiaByTicketId(ticketId);
      
      if (response.success) {
        setRegistration(response.data);
      } else {
        setError('Registration not found');
      }
    } catch (err) {
      console.error('Error fetching registration:', err);
      setError('Failed to load registration details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (fileUrl) => {
    try {
      const signedUrl = await getSignedUrl(fileUrl);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to load document');
    }
  };

  const handleDownloadDocument = async (fileUrl, fileName) => {
    try {
      const signedUrl = await getSignedUrl(fileUrl);
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName || 'document';
      link.click();
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
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

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Registration Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested registration could not be found.'}</p>
          <button
            onClick={() => navigate(-1)}
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
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-[#00486D] border border-[#00486D] rounded-lg hover:bg-[#00486D] hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-medium">{registration.business_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Type</p>
              <p className="font-medium">{registration.business_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Email</p>
              <p className="font-medium">{registration.business_email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Number</p>
              <p className="font-medium">{registration.business_contact_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Employees</p>
              <p className="font-medium">{registration.number_of_employees || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                registration.status === 'submitted' ? 'bg-green-100 text-green-800' :
                registration.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {registration.status || 'N/A'}
              </span>
            </div>
          </div>
          
          {registration.nature_of_business && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Nature of Business</p>
              <p className="font-medium">{registration.nature_of_business}</p>
            </div>
          )}
        </div>

        {/* Package Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Package & Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Package Name</p>
              <p className="font-medium">{registration.package_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Package Price</p>
              <p className="font-medium">₹{registration.package_price || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                registration.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {registration.payment_status || 'N/A'}
              </span>
            </div>
            {registration.payment_id && (
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-medium">{registration.payment_id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        {(registration.logo_url || registration.udyam_registration_url || registration.certificate_of_incorporation_url) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
            <div className="space-y-3">
              {registration.logo_url && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Company Logo</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleViewDocument(registration.logo_url)}
                      className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(registration.logo_url, 'logo')}
                      className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors"
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
                      className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(registration.udyam_registration_url, 'udyam')}
                      className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors"
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
                      className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(registration.certificate_of_incorporation_url, 'certificate')}
                      className="px-4 py-2 text-[#00486D] hover:bg-[#00486D] hover:text-white border border-[#00486D] rounded transition-colors"
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
    </div>
  );
}

export default StartupIndiaViewDetails;



