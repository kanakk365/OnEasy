import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/api';
import PrivateLimitedForm from '../../forms/PrivateLimitedForm';

function AdminFillForm() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get client info from localStorage
      const storedClientInfo = localStorage.getItem('adminFillingForClient');
      if (storedClientInfo) {
        setClientInfo(JSON.parse(storedClientInfo));
      }

      // Load form data
      const response = await apiClient.get(`/private-limited/registration/${ticketId}`);
      
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      alert('Failed to load form data. Please try again.');
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    localStorage.removeItem('adminFillingForClient');
    navigate('/admin/clients');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
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
    <div className="flex h-[calc(100vh-4rem)] bg-[#f3f5f7]">
      {/* Left Sidebar for Form Steps */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#01334C]">Private Limited Registration</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Back to Clients"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {clientInfo && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-sm font-semibold text-blue-900">Filling for Client</p>
              <p className="text-xs text-blue-700 mt-1">{clientInfo.clientName}</p>
              <p className="text-xs text-blue-600 mt-0.5">Ticket: {clientInfo.ticketId}</p>
            </div>
          )}
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
          clientId={clientInfo?.clientId}
          ticketId={ticketId}
          initialData={formData}
          onClose={handleClose}
          onStepChange={setCurrentStep}
        />
      </div>
    </div>
  );
}

export default AdminFillForm;

