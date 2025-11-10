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

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get client info from localStorage
      const storedClientInfo = localStorage.getItem('adminFillingForClient');
      if (storedClientInfo) {
        const parsed = JSON.parse(storedClientInfo);
        console.log('📋 Client info from localStorage:', parsed);
        setClientInfo(parsed);
      } else {
        console.warn('⚠️ No client info found in localStorage');
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

  return (
    <PrivateLimitedForm 
      isAdminFilling={true}
      clientId={clientInfo?.clientId}
      ticketId={ticketId}
      initialData={formData}
      onClose={handleClose}
    />
  );
}

export default AdminFillForm;

