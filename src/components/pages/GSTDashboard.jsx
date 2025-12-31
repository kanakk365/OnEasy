import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyGSTRegistrations } from '../../utils/gstApi';

function GSTDashboard() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const result = await getMyGSTRegistrations();
      console.log('📊 GST registrations response:', result);
      
      // Handle different response structures
      if (result.success) {
        setRegistrations(result.data || []);
      } else if (Array.isArray(result)) {
        setRegistrations(result);
      } else if (result.data) {
        setRegistrations(Array.isArray(result.data) ? result.data : []);
      } else {
        setRegistrations([]);
      }
      
      console.log('📋 Registrations set:', result.success ? result.data?.length : result.length || 0);
    } catch (error) {
      console.error('❌ Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
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
              GST Registrations
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your GST registration applications
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
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Registrations Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any GST registrations yet.
            </p>
            <button
              onClick={() => navigate('/gst-details')}
              className="px-6 py-3 bg-[#00486D] text-white rounded-md hover:bg-[#003855] transition-colors"
            >
              Start New Registration
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => {
              const ticketId = registration.ticket_id || registration.id;
              const isDraft = registration.status?.toLowerCase() === 'draft';
              const isIncomplete = registration.status?.toLowerCase() === 'incomplete';
              
              return (
                <div
                  key={ticketId}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#28303F]">
                          {registration.business_name || 'GST Registration'}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}
                        >
                          {registration.status || 'Draft'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Ticket ID:</span>{' '}
                          <span className="text-[#00486D]">{ticketId}</span>
                        </div>
                        <div>
                          <span className="font-medium">Package:</span>{' '}
                          {registration.package_name || '-'}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>{' '}
                          ₹{registration.package_price ? Number(registration.package_price).toLocaleString('en-IN') : '-'}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {formatDate(registration.created_at || registration.submission_date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem('editingTicketId', ticketId);
                          if (registration.package_name) {
                            localStorage.setItem('selectedPackage', JSON.stringify({
                              name: registration.package_name,
                              price: registration.package_price,
                              priceValue: registration.package_price
                            }));
                          }
                          if (registration.order_id || registration.razorpay_payment_id) {
                            localStorage.setItem('paymentDetails', JSON.stringify({
                              orderId: registration.order_id,
                              paymentId: registration.razorpay_payment_id,
                              timestamp: registration.created_at
                            }));
                          }
                          navigate(`/gst-form?ticketId=${ticketId}`);
                        }}
                        className="px-4 py-2 text-sm bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {isDraft || isIncomplete ? 'Continue Filling' : 'Edit Registration'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/gst/view/${ticketId}`);
                        }}
                        className="px-4 py-2 text-sm border border-[#00486D] text-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GSTDashboard;


