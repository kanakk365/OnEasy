import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/api';

function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, signups, subscribed, pending-payments, oneasy-form-fill, support-requests

  useEffect(() => {
    fetchClients();
  }, []);

  // Refresh when returning from fill form page
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ Page focused, refreshing clients...');
      fetchClients();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchClients = async () => {
    try {
      // Fetch all registrations
      const response = await apiClient.get('/admin/clients');
      
      if (response.success) {
        console.log('📊 Clients data:', response.data);
        setClients(response.data || []);
        
        // Log Harsha's status for debugging
        const harsha = response.data?.find(c => c.phone === '+917569460743');
        if (harsha) {
          console.log('👤 Harsha status:', {
            team_fill_requested: harsha.team_fill_requested,
            registration_submitted: harsha.registration_submitted,
            ticket_id: harsha.ticket_id
          });
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const _formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (client) => {
    if (client.team_fill_requested) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Team Fill Requested
        </span>
      );
    } else if (client.registration_submitted) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Registered
        </span>
      );
    } else if (client.payment_completed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Payment Done
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          New
        </span>
      );
    }
  };

  const filteredClients = clients.filter(client => {
    // Debug: log how many clients have team_fill_requested flag
    if (filter === 'oneasy-form-fill') {
      const teamFillClients = clients.filter(c => c.team_fill_requested);
      console.log('🧪 Oneasy Form Fill filter selected. Raw clients with team_fill_requested=true:', teamFillClients);
    }
    if (filter === 'all') return true;
    if (filter === 'signups') {
      return (
        !client.registration_submitted &&
        !client.team_fill_requested &&
        !client.payment_completed &&
        !client.ticket_id
      );
    }
    if (filter === 'subscribed') {
      // Users who have taken at least one service (any ticket/registration/payment)
      return (
        !!client.ticket_id ||
        !!client.registration_submitted ||
        !!client.payment_completed
      );
    }
    if (filter === 'pending-payments') {
      return (
        client.payment_completed === false &&
        (client.registration_submitted || client.ticket_id)
      );
    }
    if (filter === 'oneasy-form-fill') {
      return client.team_fill_requested;
    }
    if (filter === 'support-requests') {
      // Clients who have raised support tickets (future-friendly; flag may arrive from backend)
      return !!client.has_support_request;
    }
    const keep = true;
    console.log('🎯 Filtered client row:', {
      filter,
      user_id: client.user_id,
      name: client.name,
      team_fill_requested: client.team_fill_requested,
      registration_submitted: client.registration_submitted,
      ticket_id: client.ticket_id
    });
    return keep;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
          Clients
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Manage client signups, pending payments and Oneasy form fill requests
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-5 mb-6 transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({clients.length})
          </button>
          <button
            onClick={() => setFilter('signups')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'signups'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Signups ({
              clients.filter(
                c =>
                  !c.registration_submitted &&
                  !c.team_fill_requested &&
                  !c.payment_completed &&
                  !c.ticket_id
              ).length
            })
          </button>
          <button
            onClick={() => setFilter('pending-payments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending-payments'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Payments ({
              clients.filter(
                c =>
                  c.payment_completed === false &&
                  (c.registration_submitted || c.ticket_id)
              ).length
            })
          </button>
          <button
            onClick={() => setFilter('subscribed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'subscribed'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Subscribed Users ({
              clients.filter(
                c =>
                  c.ticket_id ||
                  c.registration_submitted ||
                  c.payment_completed
              ).length
            })
          </button>
          <button
            onClick={() => setFilter('oneasy-form-fill')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'oneasy-form-fill'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Oneasy Form Fill ({clients.filter(c => c.team_fill_requested).length})
          </button>
          <button
            onClick={() => setFilter('support-requests')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'support-requests'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Support Requests ({
              clients.filter(c => c.has_support_request).length
            })
          </button>
        </div>
      </div>

      {/* Clients Table/List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Clients Found</h3>
          <p className="text-gray-600">No clients match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
          {/* Table View */}
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone Number</th>
                {filter === 'support-requests' && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Support Request</th>
                )}
                {filter !== 'support-requests' && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.user_id}
                  onClick={() => navigate(`/admin/client-overview/${client.user_id}`)}
                  className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#01334C] text-white flex items-center justify-center font-semibold text-sm">
                        {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <span className="font-medium text-gray-900">{client.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{client.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{client.phone || 'N/A'}</td>
                  {filter === 'support-requests' && (
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.support_requests && client.support_requests.length > 0 ? (
                        <div className="space-y-1">
                          {client.support_requests.map((req, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{client.name}</span> for <span className="font-medium">{req.service_name || 'this service'}</span> wants to contact you
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No support requests</span>
                      )}
                    </td>
                  )}
                  {filter !== 'support-requests' && (
                    <td className="px-6 py-4">{getStatusBadge(client)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminClients;























