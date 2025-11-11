import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRegistrations } from '../../utils/privateLimitedApi';

function PrivateLimitedDashboard() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [oneasyTeamFill, setOneasyTeamFill] = useState(false);

  useEffect(() => {
    fetchRegistrations();
    // Check if user clicked "OnEasy Team Fill" button
    const teamFillStatus = localStorage.getItem('oneasyTeamFill');
    setOneasyTeamFill(teamFillStatus === 'true');
  }, []);

  const fetchRegistrations = async () => {
    try {
      const result = await getMyRegistrations();
      if (result.success) {
        setRegistrations(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
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
          <p className="mt-4 text-gray-600">Loading your registrations...</p>
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
            <h1 className="text-2xl font-bold text-[#28303F]">
              Private Limited Company Registrations
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your company registration applications
            </p>
          </div>
          <button
            onClick={() => navigate('/client')}
            className="px-4 py-2 border border-[#00486D] text-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Registrations List */}
        {registrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            {oneasyTeamFill ? (
              <>
                {/* OnEasy Team Fill Mode - Waiting Message */}
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Form Submitted to OnEasy Team
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Please wait while our OnEasy team member completes your registration form. 
                  You will be notified once the form is submitted and processed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/client')}
                    className="px-6 py-2 border border-[#00486D] text-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('oneasyTeamFill');
                      setOneasyTeamFill(false);
                    }}
                    className="px-6 py-2 text-white rounded-md"
                    style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
                  >
                    Start New Registration
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Normal Mode - No Registrations */}
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Registrations Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any Private Limited company registration applications.
                </p>
                <button
                  onClick={() => navigate('/company-categories')}
                  className="px-6 py-2 text-white rounded-md"
                  style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
                >
                  Start New Registration
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#28303F]">
                        {registration.business_name || 'Company Name Pending'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          registration.status || 'pending'
                        )}`}
                      >
                        {registration.status || 'Pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium text-gray-700">Ticket ID:</span>{' '}
                        {registration.ticket_id || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span>{' '}
                        {formatDate(registration.created_at)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Company Type:</span>{' '}
                        {registration.business_type || 'Private Limited'}
                      </div>
                    </div>

                    {registration.business_email && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Email:</span>{' '}
                        {registration.business_email}
                      </div>
                    )}

                    {registration.directors_partners_count && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Directors:</span>{' '}
                        {registration.directors_partners_count}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/private-limited/view/${registration.ticket_id}`)}
                      className="px-4 py-2 text-sm bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Additional Info Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    Last Updated: {formatDate(registration.updated_at)}
                  </div>
                  {registration.authorized_capital && (
                    <div>
                      Authorized Capital: ₹{Number(registration.authorized_capital).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {registrations.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Application Status Information</p>
                <p>
                  Your applications are being processed. You will be notified via email and phone once there are updates. 
                  For any queries, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrivateLimitedDashboard;













