import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/api';
import PrivateLimitedForm from '../../forms/PrivateLimitedForm';

function SuperAdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, registered, team-fill
  const [showFormForClient, setShowFormForClient] = useState(null); // { clientId, ticketId, clientName }

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      console.log('🔄 SuperAdmin fetching clients...');
      // Fetch all registrations
      const response = await apiClient.get('/admin/clients');
      
      console.log('📊 SuperAdmin clients response:', response);
      
      if (response.success) {
        console.log('✅ SuperAdmin clients data:', response.data);
        setClients(response.data || []);
      } else {
        console.error('❌ SuperAdmin response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      console.error('Error details:', error.response || error.message);
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
    if (filter === 'all') return true;
    if (filter === 'registered') return client.registration_submitted;
    if (filter === 'team-fill') return client.team_fill_requested;
    return true;
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
          Manage all client registrations and team fill requests
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-5 mb-6 transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
          <div className="flex gap-4">
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
              onClick={() => setFilter('registered')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'registered'
                  ? 'bg-[#01334C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Registered ({clients.filter(c => c.registration_submitted).length})
            </button>
            <button
              onClick={() => setFilter('team-fill')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'team-fill'
                  ? 'bg-[#01334C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Team Fill Requests ({clients.filter(c => c.team_fill_requested).length})
            </button>
          </div>
        </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Clients Found
            </h3>
            <p className="text-gray-600">
              No clients match the selected filter criteria.
            </p>
          </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filteredClients.map((client) => (
            <div
              key={client.user_id}
              className="bg-white rounded-xl p-5 md:p-6 transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012] hover:[box-shadow:0px_6px_16px_0px_#00000018]"
            >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[#01334C] text-white flex items-center justify-center font-semibold text-lg">
                        {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-[#28303F]">
                          {client.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">{client.phone}</p>
                      </div>

                      {getStatusBadge(client)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      {client.email && (
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>{' '}
                          {client.email}
                        </div>
                      )}
                      {client.ticket_id && (
                        <div>
                          <span className="font-medium text-gray-700">Ticket ID:</span>{' '}
                          {client.ticket_id}
                        </div>
                      )}
                      {client.company_name && (
                        <div>
                          <span className="font-medium text-gray-700">Company:</span>{' '}
                          {client.company_name}
                        </div>
                      )}
                    </div>

                    {client.package_name && (
                      <div className="mt-3 text-sm">
                        <span className="font-medium text-gray-700">Package:</span>{' '}
                        {client.package_name} - <span className="text-green-600 font-semibold">₹{client.package_price?.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {client.payment_date && (
                      <div className="mt-2 text-xs text-gray-500">
                        Payment Date: {formatDate(client.payment_date)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {client.ticket_id && (
                      <button
                        onClick={() => navigate(`/superadmin/client-details/${client.ticket_id}`)}
                        className="px-4 py-2 text-sm bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors"
                      >
                        View Details
                      </button>
                    )}
                    {client.team_fill_requested && !client.registration_submitted && (
                      <button
                        onClick={() => setShowFormForClient({ 
                          clientId: client.user_id, 
                          ticketId: client.ticket_id,
                          clientName: client.name || client.phone 
                        })}
                        className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        Fill Form
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Form Modal Overlay - Full Screen */}
      {showFormForClient && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <SuperAdminFormWrapper 
            clientId={showFormForClient.clientId}
            ticketId={showFormForClient.ticketId}
            clientName={showFormForClient.clientName}
            onClose={() => {
              setShowFormForClient(null);
              fetchClients(); // Refresh clients list
            }}
          />
        </div>
      )}
    </div>
  );
}

// Wrapper component to handle superadmin form logic with sidebar layout
function SuperAdminFormWrapper({ clientId, ticketId, clientName, onClose }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadClientFormData();
  }, [ticketId]);

  const loadClientFormData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/private-limited/registration/${ticketId}`);
      
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      alert('Failed to load form data. Please try again.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Name Application", description: "Choose your company name" },
    { number: 2, title: "Basic Company Details", description: "Business information" },
    { number: 3, title: "Directors & Shareholders", description: "Director details" }
  ];

  return (
    <div className="flex h-screen bg-[#f3f5f7]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#01334C]">Private Limited Registration</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close Form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
            <p className="text-sm font-semibold text-blue-900">Filling for Client</p>
            <p className="text-xs text-blue-700 mt-1">{clientName}</p>
            <p className="text-xs text-blue-600 mt-0.5">Ticket: {ticketId}</p>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Registration Steps
          </h3>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative ${index !== steps.length - 1 ? 'pb-4' : ''}`}
              >
                {index !== steps.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentStep === step.number
                        ? 'bg-[#01334C] text-white'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        currentStep === step.number ? 'text-[#01334C]' : 'text-gray-600'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>All fields are required</span>
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 overflow-y-auto">
        <PrivateLimitedForm 
          isAdminFilling={true}
          clientId={clientId}
          ticketId={ticketId}
          initialData={formData}
          onClose={onClose}
          onStepChange={setCurrentStep}
        />
      </div>
    </div>
  );
}

export default SuperAdminClients;

