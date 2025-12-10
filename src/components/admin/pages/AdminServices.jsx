import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/api';

function AdminServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [progressFilter, setProgressFilter] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiClient.get('/admin/services');
      if (response.success) {
        setServices(response.data || []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let date;
      
      // Handle different date string formats
      if (typeof dateString === 'string') {
        // If it's a space-separated date-time without timezone (e.g., "2025-12-09 10:56:00")
        // PostgreSQL/Supabase stores timestamps in UTC, but when returned as string without timezone,
        // we need to parse it correctly
        if (dateString.includes(' ') && !dateString.includes('Z') && !dateString.includes('+') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
          // Replace space with T for ISO format, then add Z to treat as UTC
          const isoString = dateString.replace(' ', 'T');
          // Parse as UTC (since database stores in UTC)
          date = new Date(isoString + 'Z');
        } else if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
          // ISO format without timezone, treat as UTC
          date = new Date(dateString + 'Z');
        } else {
          // Has timezone info, parse normally
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format in IST (Asia/Kolkata timezone)
      const datePart = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
      
      const timePart = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
      
      return `${datePart}, ${timePart}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const getStatusLabel = useCallback((svc) => {
    if (svc.team_fill_requested) {
      return 'Team Fill Requested';
    }
    if (svc.registration_submitted) {
      return 'Registered';
    }
    if (svc.payment_completed) {
      return 'Payment Done';
    }
    return 'New';
  }, []);

  const getProgressLabel = useCallback((svc) => {
    // Check service_status first (admin-managed status) - this is the source of truth
    if (svc.service_status && svc.service_status.trim() !== '') {
      const status = svc.service_status.toLowerCase().trim();
      
      // Completed statuses
      if (status === 'completed') {
        return 'Completed';
      }
      
      // In Progress statuses
      if (status === 'wip' || 
          status === 'data received' || 
          status === 'awaiting confirmation from the govt' || 
          status === 'awaiting confirmation from the government' ||
          status === 'data pending from client') {
        return 'In Progress';
      }
      
      // Ongoing statuses
      if (status === 'technical issue' || 
          status === 'payment pending' ||
          status === 'payment_pending') {
        return 'Ongoing';
      }
      
      // If service_status exists but doesn't match known values, default based on status
      // This handles edge cases
      if (status === 'submitted' || status === 'registered') {
        return 'In Progress';
      }
    }
    
    // Fallback to other status indicators only if service_status is not set
    if (svc.registration_submitted || svc.status === 'submitted' || svc.status === 'registered') {
      return 'In Progress';
    }
    
    if (svc.payment_completed || svc.payment_status === 'paid') {
      return 'Ongoing';
    }
    
    return 'Ongoing'; // Default for new services
  }, []);

  const deriveServiceFromTicket = useCallback((ticketId) => {
    if (!ticketId) return null;
    if (ticketId.startsWith('OPC_')) return 'OPC Registration';
    if (ticketId.startsWith('LLP_')) return 'LLP Registration';
    if (ticketId.startsWith('PART_') || ticketId.startsWith('PARTNERSHIP_')) return 'Partnership Registration';
    if (ticketId.startsWith('SEC8_') || ticketId.startsWith('SECTION8_')) return 'Section 8 Registration';
    if (ticketId.startsWith('PVT_')) return 'Private Limited Registration';
    if (ticketId.startsWith('PROP_')) return 'Proprietorship Registration';
    if (ticketId.startsWith('SI_')) return 'Startup India Registration';
    if (ticketId.startsWith('GST_')) return 'GST Registration';
    return null;
  }, []);

  const isTier = useCallback((name) => ['starter', 'growth', 'pro', 'basic'].includes((name || '').toLowerCase()), []);

  const CANONICAL_SERVICES = useMemo(
    () => [
      'Private Limited Company',
      'One Person Company',
      'Proprietorship',
      'Partnership Firm',
      'Limited Liability Partnership',
      'Section 8 Company',
      'Public Limited Company',
      'MCA Name Approval',
      'Indian Subsidiary Company',
      'Startup India Registration',
      'Professional Tax Registration',
      'Labour License Registration',
      'Provident Fund Registration',
      'GST Registration',
      'Udyam Registration / MSME',
      'FSSAI / Food license',
      'Trade License',
      'Import Export Code (IEC) Registration',
      'Letter of Undertaking',
      'Employee State Insurance (ESI) Registration',
      'Digital Signature',
      '12A Registration',
      '80G Registration'
    ],
    []
  );

  const normalizeService = useCallback((text) => {
    if (!text) return null;
    const lower = text.toLowerCase();
    if (lower.includes('private limited')) return 'Private Limited Company';
    if (lower.includes('opc') || lower.includes('one person')) return 'One Person Company';
    if (lower.includes('propriet')) return 'Proprietorship';
    if (lower.includes('partnership')) return 'Partnership Firm';
    if (lower.includes('llp')) return 'Limited Liability Partnership';
    if (lower.includes('section 8') || lower.includes('sec 8')) return 'Section 8 Company';
    if (lower.includes('public limited')) return 'Public Limited Company';
    if (lower.includes('mca name')) return 'MCA Name Approval';
    if (lower.includes('subsidiary')) return 'Indian Subsidiary Company';
    if (lower.includes('startup india')) return 'Startup India Registration';
    if (lower.includes('professional tax')) return 'Professional Tax Registration';
    if (lower.includes('labour')) return 'Labour License Registration';
    if (lower.includes('provident fund') || lower.includes('pf ')) return 'Provident Fund Registration';
    if (lower.includes('gst')) return 'GST Registration';
    if (lower.includes('udyam') || lower.includes('msme')) return 'Udyam Registration / MSME';
    if (lower.includes('fssai') || lower.includes('food')) return 'FSSAI / Food license';
    if (lower.includes('trade license')) return 'Trade License';
    if (lower.includes('import export') || lower.includes('iec')) return 'Import Export Code (IEC) Registration';
    if (lower.includes('letter of undertaking') || lower.includes('lou')) return 'Letter of Undertaking';
    if (lower.includes('esi') || lower.includes('employee state insurance')) return 'Employee State Insurance (ESI) Registration';
    if (lower.includes('digital signature') || lower.includes('dsc')) return 'Digital Signature';
    if (lower.includes('12a')) return '12A Registration';
    if (lower.includes('80g')) return '80G Registration';
    return null;
  }, []);

  const getServiceName = useCallback((svc) => {
    const inferred =
      normalizeService(svc.service_name) ||
      normalizeService(svc.registration_type) ||
      normalizeService(svc.service_type) ||
      normalizeService(deriveServiceFromTicket(svc.ticket_id)) ||
      normalizeService(svc.business_name) ||
      normalizeService(svc.package_name);

    // If package_name is just a tier (Starter/Growth/Pro/Basic), ignore it
    if (isTier(svc.package_name)) return inferred || 'Other';

    return (
      inferred ||
      normalizeService(svc.package_name) ||
      'Other'
    );
  }, [deriveServiceFromTicket, isTier, normalizeService]);

  const getServiceLabel = useCallback((svc) => getServiceName(svc), [getServiceName]);

  const clientsList = useMemo(
    () =>
      Array.from(
        new Set(
          services.map((s) => s.name || s.legal_name || s.client_name || s.email || 'N/A')
        )
      ),
    [services]
  );

  const servicesList = useMemo(() => {
    const hasOther = services.some((s) => getServiceLabel(s) === 'Other');
    return hasOther ? [...CANONICAL_SERVICES, 'Other'] : [...CANONICAL_SERVICES];
  }, [services, getServiceLabel, CANONICAL_SERVICES]);

  const statusList = ['New', 'Payment Done', 'Registered', 'Team Fill Requested'];

  const adminStatusOptions = [
    'Data received',
    'WIP',
    'Awaiting confirmation from the Govt',
    'Data Pending from Client',
    'Completed',
    'Technical Issue',
    'Payment pending'
  ];

  const handleStatusUpdate = async (svc, newStatus) => {
    try {
      if (!svc.ticket_id) {
        alert('Ticket ID is required to update status');
        return;
      }
      const payload = { ticketId: svc.ticket_id, status: newStatus };
      console.log('📝 Updating status:', payload);
      const response = await apiClient.post('/admin/update-service-status', payload);
      console.log('📝 Update status response:', response);
      
      if (response.success) {
        // Update local state immediately
        setServices((prev) =>
          prev.map((item) =>
            (item.ticket_id === svc.ticket_id ? { ...item, service_status: newStatus } : item)
          )
        );
        // Small delay to ensure database write completes, then refresh
        setTimeout(async () => {
          await fetchServices();
        }, 500);
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error';
      
      // Check if it's a database column error
      if (errorMessage.includes('service_status') && errorMessage.includes('column')) {
        alert('The service_status column does not exist in the database. Please run the migration SQL first. See backend/migrations/add_service_status_column.sql');
      } else {
        alert('Failed to update status: ' + errorMessage);
      }
    }
  };

  const handleProgressUpdate = async (svc, newProgress) => {
    try {
      if (!svc.ticket_id) {
        alert('Ticket ID is required to update progress');
        return;
      }
      
      // Get current status
      const currentStatus = svc.service_status || '';
      const currentStatusLower = currentStatus.toLowerCase();
      
      // Check if current status is a detailed admin status (should be preserved)
      const detailedStatuses = [
        'data received',
        'awaiting confirmation from the govt',
        'awaiting confirmation from the government',
        'data pending from client',
        'technical issue'
      ];
      const isDetailedStatus = detailedStatuses.some(ds => currentStatusLower.includes(ds));
      
      // Map progress to service_status, but preserve detailed status if it exists
      let statusToSet = '';
      
      if (newProgress === 'Completed') {
        // For Completed, always set to Completed (even if detailed status exists)
        statusToSet = 'Completed';
      } else if (newProgress === 'In Progress') {
        // If current status is detailed, preserve it
        // Otherwise set to WIP
        if (isDetailedStatus) {
          statusToSet = currentStatus; // Preserve detailed status
        } else {
          statusToSet = 'WIP';
        }
      } else if (newProgress === 'Ongoing') {
        // If current status is detailed, preserve it
        // Otherwise set to Payment pending
        if (isDetailedStatus) {
          statusToSet = currentStatus; // Preserve detailed status
        } else {
          statusToSet = 'Payment pending';
        }
      }
      
      // Only update if status actually changed
      if (statusToSet === currentStatus) {
        console.log('📝 Status unchanged, skipping update');
        return;
      }
      
      const payload = { ticketId: svc.ticket_id, status: statusToSet };
      console.log('📝 Updating progress:', payload, 'Current status:', currentStatus);
      const response = await apiClient.post('/admin/update-service-status', payload);
      console.log('📝 Update progress response:', response);
      
      if (response.success) {
        // Update local state immediately with the mapped status
        setServices((prev) =>
          prev.map((item) =>
            (item.ticket_id === svc.ticket_id ? { ...item, service_status: statusToSet } : item)
          )
        );
        // Small delay to ensure database write completes, then refresh
        setTimeout(async () => {
          await fetchServices();
        }, 500);
      } else {
        throw new Error(response.message || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error';
      
      // Check if it's a database column error
      if (errorMessage.includes('service_status') && errorMessage.includes('column')) {
        alert('The service_status column does not exist in the database. Please run the migration SQL first. See backend/migrations/add_service_status_column.sql');
      } else {
        alert('Failed to update progress: ' + errorMessage);
      }
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const status = getStatusLabel(svc);
      const progress = getProgressLabel(svc);
      const serviceName = getServiceLabel(svc);
      const clientName = svc.name || svc.legal_name || svc.client_name || svc.email || 'N/A';

      return (
        (clientFilter ? clientName === clientFilter : true) &&
        (serviceFilter ? serviceName === serviceFilter : true) &&
        (statusFilter ? status === statusFilter : true) &&
        (progressFilter ? progress === progressFilter : true)
      );
    });
  }, [services, clientFilter, serviceFilter, statusFilter, progressFilter, getServiceLabel, getStatusLabel, getProgressLabel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            Services
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            View all client services and registrations
          </p>
        </div>
        <button
          onClick={fetchServices}
          className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Client</label>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            {clientsList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Service</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            {servicesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            {statusList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Progress</label>
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            <option value="Ongoing">Ongoing</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[180px]">Client</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Phone</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">Service</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">Progress</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[140px]">Updated</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredServices.map((svc, index) => (
                <tr key={`${svc.ticket_id || svc.order_id || svc.user_id || 'row'}-${index}`} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal break-words">
                    <div className="font-semibold">{svc.name || svc.legal_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500 break-words">{svc.email || 'No email'}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal break-words">{svc.phone || 'N/A'}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal break-words">{getServiceLabel(svc)}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal">
                    {svc.ticket_id ? (
                      <select
                        value={svc.service_status || getStatusLabel(svc)}
                        onChange={(e) => handleStatusUpdate(svc, e.target.value)}
                        className="w-full max-w-[200px] px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                        style={{ fontSize: '11px' }}
                      >
                        {adminStatusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal">
                    {svc.ticket_id ? (
                      <select
                        value={getProgressLabel(svc)}
                        onChange={(e) => handleProgressUpdate(svc, e.target.value)}
                        className="w-full max-w-[150px] px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                        style={{ fontSize: '11px' }}
                      >
                        <option value="Ongoing">Ongoing</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal break-words">
                    {formatDateTime(svc.updated_at || svc.confirmed_at || svc.created_at)}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal">
                    <button
                      onClick={() =>
                        navigate(`/admin/client-overview/${svc.user_id || svc.id}?tab=services${svc.ticket_id ? `&ticketId=${svc.ticket_id}` : ''}`)
                      }
                      className="px-3 py-1 text-xs bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors whitespace-nowrap"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminServices;

