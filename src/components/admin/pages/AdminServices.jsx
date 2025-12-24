import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/api';
import { initPaymentWithOrderId } from '../../../utils/payment';

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
    // Step 1: Check payment status first - if payment is pending, return "Open"
    const paymentStatus = (svc.payment_status || '').toLowerCase().trim();
    if (paymentStatus === 'pending' || paymentStatus === 'unpaid') {
      return 'Open';
    }
    
    // Step 2: Check if service_status is "Completed" (case-insensitive) - return "Resolved"
    if (svc.service_status && svc.service_status.trim() !== '') {
      const serviceStatus = svc.service_status.toLowerCase().trim();
      if (serviceStatus === 'completed') {
        return 'Resolved';
      }
      }
      
    // Step 3: If payment is completed and service_status exists (and is not completed), return "Ongoing"
    const isPaymentCompleted = svc.payment_completed || 
                               paymentStatus === 'paid' || 
                               paymentStatus === 'payment_completed' ||
                               svc.razorpay_payment_id ||
                               svc.payment_id;
    
    if (isPaymentCompleted) {
      // If service_status exists (regardless of value, except completed which is handled above), it's Ongoing
      if (svc.service_status && svc.service_status.trim() !== '' && svc.service_status.toLowerCase().trim() !== 'completed') {
        return 'Ongoing';
    }
      // Payment completed but no service_status set yet - still Ongoing
      return 'Ongoing';
    }
    
    // Default for services without payment (shouldn't happen in normal flow, but fallback)
    return 'Open';
  }, []);

  const deriveServiceFromTicket = useCallback((ticketId) => {
    if (!ticketId) return null;
    // Registration Services
    if (ticketId.startsWith('PVT_')) return 'Private Limited Registration';
    if (ticketId.startsWith('OPC_')) return 'OPC Registration';
    if (ticketId.startsWith('LLP_')) return 'LLP Registration';
    if (ticketId.startsWith('PART_') || ticketId.startsWith('PARTNERSHIP_')) return 'Partnership Registration';
    if (ticketId.startsWith('SEC8_') || ticketId.startsWith('SECTION8_')) return 'Section 8 Registration';
    if (ticketId.startsWith('PLC_')) return 'Public Limited Company';
    if (ticketId.startsWith('INDSUB_') || ticketId.startsWith('INDIAN_') || ticketId.startsWith('SUBSIDIARY_')) return 'Indian Subsidiary Company';
    if (ticketId.startsWith('PROP_')) return 'Proprietorship Registration';
    // Startup Services
    if (ticketId.startsWith('SI_') || ticketId.startsWith('STARTUP_')) return 'Startup India Registration';
    // ROC & MCA Services
    if (ticketId.startsWith('MCA_')) return 'MCA Name Approval';
    // Compliance Services
    if (ticketId.startsWith('PTX_')) return 'Professional Tax Registration';
    if (ticketId.startsWith('LAB_')) return 'Labour License Registration';
    if (ticketId.startsWith('UDYAM_')) return 'Udyam Registration / MSME';
    if (ticketId.startsWith('FSSAI_')) return 'FSSAI / Food license';
    if (ticketId.startsWith('TL_')) return 'Trade License';
    if (ticketId.startsWith('ESI_')) return 'Employee State Insurance (ESI) Registration';
    // Tax & Accounting Services
    if (ticketId.startsWith('GST_')) return 'GST Registration';
    if (ticketId.startsWith('IEC_')) return 'Import Export Code (IEC) Registration';
    if (ticketId.startsWith('LUT_')) return 'Letter of Undertaking';
    if (ticketId.startsWith('DSC_')) return 'Digital Signature';
    if (ticketId.startsWith('12A_')) return '12A Registration';
    if (ticketId.startsWith('80G_')) return '80G Registration';
    return null;
  }, []);

  const isTier = useCallback((name) => ['starter', 'growth', 'pro', 'basic'].includes((name || '').toLowerCase()), []);

  const CANONICAL_SERVICES = useMemo(
    () => [
      // Startup Services (9) - from CompanyCategories.jsx
      'Private Limited Company',
      'One Person Company',
      'Proprietorship',
      'Limited Liability Partnership',
      'Partnership Firm',
      'Section 8 Company',
      'Public Limited Company',
      'MCA Name Approval',
      'Indian Subsidiary Company',
      // Registration Services (14) - from RegistrationCategories.jsx
      'Start - Up India Certificate',
      'Professional Tax Registration',
      'Labour License Registration',
      'Provident Fund Registration',
      'GST Registration',
      'Udyam Registration',
      'FSSAI / Food license',
      'Trade License',
      'Import Export Code (IEC) Registration',
      'Letter of Undertaking',
      'Employee State Insurance (ESI) Registration',
      'Digital Signature Certificate',
      '12A Registration',
      '80G Registration',
      // Goods and Services Tax (6) - from GSTCategories.jsx
      'GST Registration',
      'GST Returns',
      'Letter of Undertaking',
      'GST Annual Return Filing',
      'GST Amendment',
      'GST Notice',
      // ROC & MCA Services (17) - from ROCCategories.jsx
      'Director Addition',
      'Share Transfer',
      'Address Change (Registered Office Change)',
      'Charge Creation',
      'Director Removal',
      'MOA Amendment',
      'AOA Amendment',
      'Change In Objects clause',
      'Increase in Share Capital',
      'Name Change - Company',
      'DIN Deactivation',
      'DIN Reactivation',
      'ADT-1',
      'Winding Up - Company',
      'Winding Up - LLP',
      'DIN Application - MCA',
      'INC 20A - MCA',
      // Compliance Services (11) - from ComplianceCategories.jsx
      'FSSAI Renewal',
      'FSSAI Return Filing',
      'Business Plan',
      'HR & Payroll Service',
      'PF Return Filing',
      'ESI Return Filing',
      'Professional Tax Return Filing',
      'Partnership Compliance',
      'Proprietorship Compliance',
      'Company Compliance',
      'Trademark',
      // Tax & Accounting Services (7) - from TaxAccountingCategories.jsx
      'Income Tax Return - Salary',
      'Business - Income Tax Return',
      'House Property - Income Tax Return',
      'Trust - Income Tax Return',
      'Income From Salary, HP and Capital gains',
      'Partnership Firm - ITR',
      'Company - ITR'
    ],
    []
  );

  const normalizeService = useCallback((text) => {
    if (!text) return null;
    const lower = text.toLowerCase();
    
    // Registration Services (14)
    if (lower.includes('private limited')) return 'Private Limited Company';
    if (lower.includes('opc') || lower.includes('one person company')) return 'One Person Company';
    if (lower.includes('propriet')) return 'Proprietorship';
    if (lower.includes('partnership firm') || (lower.includes('partnership') && !lower.includes('llp'))) return 'Partnership Firm';
    if (lower.includes('llp') || lower.includes('limited liability partnership')) return 'Limited Liability Partnership';
    if (lower.includes('section 8') || lower.includes('sec 8')) return 'Section 8 Company';
    if (lower.includes('public limited')) return 'Public Limited Company';
    if (lower.includes('indian subsidiary') || lower.includes('subsidiary')) return 'Indian Subsidiary Company';
    if (lower.includes('mca name')) return 'MCA Name Approval';
    
    // Startup Services (9)
    if (lower.includes('startup india') || lower.includes('start-up india')) return 'Startup India Registration';
    
    // Goods and Services Tax (6)
    if (lower.includes('gst returns') || lower.includes('gst-returns')) return 'GST Returns';
    if (lower.includes('gst annual return') || lower.includes('gst-annual-return') || lower.includes('gst annual return filing')) return 'GST Annual Return Filing';
    if (lower.includes('gst amendment') || lower.includes('gst-amendment')) return 'GST Amendment';
    if (lower.includes('gst notice') || lower.includes('gst-notice')) return 'GST Notice';
    if (lower.includes('gst registration') || lower.includes('gst-registration') || (lower.includes('gst') && !lower.includes('return') && !lower.includes('amendment') && !lower.includes('notice') && !lower.includes('lut'))) return 'GST Registration';
    if (lower.includes('letter of undertaking') || lower.includes('lut') || lower.includes('gst-lut')) return 'Letter of Undertaking';
    
    // ROC & MCA Services (17)
    if (lower.includes('director addition') || lower.includes('director-addition')) return 'Director Addition';
    if (lower.includes('share transfer') || lower.includes('share-transfer')) return 'Share Transfer';
    if (lower.includes('address change') || lower.includes('address-change') || lower.includes('registered office change')) return 'Address Change (Registered Office Change)';
    if (lower.includes('charge creation') || lower.includes('charge-creation')) return 'Charge Creation';
    if (lower.includes('director removal') || lower.includes('director-removal')) return 'Director Removal';
    if (lower.includes('moa amendment') || lower.includes('moa-amendment')) return 'MOA Amendment';
    if (lower.includes('aoa amendment') || lower.includes('aoa-amendment')) return 'AOA Amendment';
    if (lower.includes('objects clause') || lower.includes('objects-clause') || lower.includes('change in objects')) return 'Change In Objects clause';
    if (lower.includes('increase share capital') || lower.includes('increase-share-capital') || lower.includes('increase in share capital')) return 'Increase in Share Capital';
    if (lower.includes('name change company') || lower.includes('name-change-company')) return 'Name Change - Company';
    if (lower.includes('din deactivation') || lower.includes('din-deactivation')) return 'DIN Deactivation';
    if (lower.includes('din reactivation') || lower.includes('din-reactivation')) return 'DIN Reactivation';
    if (lower.includes('adt-1') || lower.includes('adt 1')) return 'ADT-1';
    if (lower.includes('winding up company') || lower.includes('winding-up-company')) return 'Winding Up - Company';
    if (lower.includes('winding up llp') || lower.includes('winding-up-llp')) return 'Winding Up - LLP';
    if (lower.includes('din application') || lower.includes('din-application')) return 'DIN Application - MCA';
    if (lower.includes('inc-20a') || lower.includes('inc 20a') || lower.includes('inc20a')) return 'INC 20A - MCA';
    
    // Compliance Services (11)
    if (lower.includes('professional tax return') || lower.includes('professional-tax-return')) return 'Professional Tax Return Filing';
    if (lower.includes('professional tax') || lower.includes('professional-tax')) return 'Professional Tax Registration';
    if (lower.includes('labour license') || lower.includes('labour-license') || lower.includes('labour licence')) return 'Labour License Registration';
    if (lower.includes('udyam') || lower.includes('msme') || lower.includes('udyog aadhaar')) return 'Udyam Registration';
    if (lower.includes('fssai return') || lower.includes('fssai-return')) return 'FSSAI Return Filing';
    if (lower.includes('fssai renewal') || lower.includes('fssai-renewal')) return 'FSSAI Renewal';
    if (lower.includes('fssai') || lower.includes('food license') || lower.includes('food licence')) return 'FSSAI / Food license';
    if (lower.includes('trade license') || lower.includes('trade-license') || lower.includes('trade licence')) return 'Trade License';
    if (lower.includes('esi return') || lower.includes('esi-return')) return 'ESI Return Filing';
    if (lower.includes('esi') || lower.includes('employee state insurance')) return 'Employee State Insurance (ESI) Registration';
    if (lower.includes('pf return') || lower.includes('pf-return') || lower.includes('provident fund return')) return 'PF Return Filing';
    if (lower.includes('provident fund') || lower.includes('pf registration')) return 'Provident Fund Registration';
    if (lower.includes('business plan') || lower.includes('business-plan')) return 'Business Plan';
    if (lower.includes('hr payroll') || lower.includes('hr-payroll') || lower.includes('hr & payroll')) return 'HR & Payroll Service';
    if (lower.includes('partnership compliance') || lower.includes('partnership-compliance')) return 'Partnership Compliance';
    if (lower.includes('proprietorship compliance') || lower.includes('proprietorship-compliance')) return 'Proprietorship Compliance';
    if (lower.includes('company compliance') || lower.includes('company-compliance')) return 'Company Compliance';
    if (lower.includes('trademark') || lower.includes('trade mark')) return 'Trademark';
    
    // Tax & Accounting Services (7)
    if (lower.includes('import export') || lower.includes('iec') || lower.includes('import-export')) return 'Import Export Code (IEC) Registration';
    if (lower.includes('digital signature') || lower.includes('dsc') || lower.includes('digital-signature') || lower.includes('digital signature certificate')) return 'Digital Signature Certificate';
    if (lower.includes('12a') || lower.includes('12-a')) return '12A Registration';
    if (lower.includes('80g') || lower.includes('80-g')) return '80G Registration';
    if (lower.includes('salary itr') || lower.includes('salary-itr') || (lower.includes('itr') && lower.includes('salary'))) return 'Income Tax Return - Salary';
    if (lower.includes('business itr') || lower.includes('business-itr') || (lower.includes('itr') && lower.includes('business'))) return 'Business - Income Tax Return';
    if (lower.includes('house property itr') || lower.includes('house-property-itr') || (lower.includes('itr') && lower.includes('house property'))) return 'House Property - Income Tax Return';
    if (lower.includes('trust itr') || lower.includes('trust-itr') || (lower.includes('itr') && lower.includes('trust'))) return 'Trust - Income Tax Return';
    if (lower.includes('salary hp capital') || lower.includes('salary-hp-capital')) return 'Income From Salary, HP and Capital gains';
    if (lower.includes('partnership firm itr') || lower.includes('partnership-firm-itr')) return 'Partnership Firm - ITR';
    if (lower.includes('company itr') || lower.includes('company-itr')) return 'Company - ITR';
    
    return null;
  }, []);

  const getServiceName = useCallback((svc) => {
    // First, get the service type from ticket ID (most reliable)
    const ticketDerivedService = svc.ticket_id ? deriveServiceFromTicket(svc.ticket_id) : null;
    const normalizedTicketService = ticketDerivedService ? normalizeService(ticketDerivedService) : null;
    
    // Check for mismatch: if package_name is incorrectly set to "Private Limited Registration" 
    // but ticket ID indicates a different service (Startup India, GST, or Proprietorship)
    const packageNameNormalized = svc.package_name ? normalizeService(svc.package_name) : null;
    const packageNameLower = (svc.package_name || '').toLowerCase();
    const isPackageMismatch = (packageNameLower.includes('private limited registration') || packageNameNormalized === 'Private Limited Company') && 
                              ticketDerivedService && 
                              (ticketDerivedService.includes('Startup India') || ticketDerivedService.includes('GST') || ticketDerivedService.includes('Proprietorship'));
    
    // Build inference chain, prioritizing ticket-derived service
    const inferred =
      normalizeService(svc.service_name) ||
      normalizeService(svc.registration_type) ||
      normalizeService(svc.service_type) ||
      normalizedTicketService ||
      normalizeService(svc.business_name);

    // If package_name is just a tier (Starter/Growth/Pro/Basic), ignore it
    if (isTier(svc.package_name)) {
      return inferred || normalizedTicketService || 'Other';
    }
    
    // If there's a mismatch (package_name says Private Limited but ticket says something else), ignore package_name
    if (isPackageMismatch) {
      return normalizedTicketService || inferred || 'Other';
    }

    // Otherwise, include package_name in the chain
    return (
      inferred ||
      packageNameNormalized ||
      normalizedTicketService ||
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
    const allServices = hasOther ? [...CANONICAL_SERVICES, 'Other'] : [...CANONICAL_SERVICES];
    // Remove duplicates while preserving order
    return [...new Set(allServices)];
  }, [services, getServiceLabel, CANONICAL_SERVICES]);

  const statusList = ['New', 'Payment Done', 'Registered', 'Team Fill Requested'];

  const adminStatusOptions = [
    'Data received',
    'WIP',
    'Awaiting confirmation from the Govt',
    'Data Pending from Client',
    'Payment completed',
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

  const handleDeleteService = async (svc) => {
    if (!svc.ticket_id) {
      alert('Cannot delete service: Ticket ID is missing');
      return;
    }

    const serviceName = getServiceLabel(svc);
    const confirmMessage = `Are you sure you want to permanently delete this service?\n\nService: ${serviceName}\nTicket ID: ${svc.ticket_id}\n\nThis action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('🗑️ Deleting service:', svc.ticket_id);
      const response = await apiClient.delete('/admin/delete-service', {
        body: JSON.stringify({ ticketId: svc.ticket_id })
      });
      console.log('🗑️ Delete service response:', response);

      if (response.success) {
        // Remove from local state immediately
        setServices((prev) => prev.filter((item) => item.ticket_id !== svc.ticket_id));
        
        // Show success message
        alert('Service deleted successfully');
        
        // Refresh the list after a short delay
        setTimeout(async () => {
          await fetchServices();
        }, 300);
      } else {
        throw new Error(response.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error';
      alert('Failed to delete service: ' + errorMessage);
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
      
      if (newProgress === 'Resolved') {
        // For Resolved, always set to Completed (even if detailed status exists)
        statusToSet = 'Completed';
      } else if (newProgress === 'Ongoing') {
        // If current status is detailed, preserve it
        // Otherwise set to WIP (for ongoing work)
        if (isDetailedStatus) {
          statusToSet = currentStatus; // Preserve detailed status
        } else {
          statusToSet = 'WIP';
        }
      } else if (newProgress === 'Open') {
        // If current status is detailed, preserve it
        // Otherwise set to Payment pending (for open/pending payment)
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

  // Helper function to get registration type slug from ticket ID
  const getRegistrationTypeSlug = useCallback((ticketId) => {
    if (!ticketId) return null;
    const tid = ticketId.toString().toUpperCase();
    if (tid.startsWith('PVT_')) return 'private-limited';
    if (tid.startsWith('PROP_')) return 'proprietorship';
    if (tid.startsWith('SI_') || tid.startsWith('STARTUP_')) return 'startup-india';
    if (tid.startsWith('GST_')) return 'gst';
    // For other services, try to infer from service name or return null
    return null;
  }, []);

  // Handle Pay button click - admin pays on behalf of user
  const handlePayClick = async (svc) => {
    try {
      const orderId = svc.razorpay_order_id || svc.order_id;
      if (!orderId) {
        alert('Order ID not found. Cannot initiate payment.');
        return;
      }

      const amount = svc.package_price || svc.amount || 0;
      const registrationType = getRegistrationTypeSlug(svc.ticket_id);
      const ticketId = svc.ticket_id || '';

      await initPaymentWithOrderId(orderId, amount, {
        ticket_id: ticketId,
        registration_type: registrationType,
        package_name: svc.package_name || getServiceLabel(svc)
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Failed to initiate payment. Please try again.');
    }
  };

  // Handle Copy Link button click - copy payment link to clipboard
  const handleCopyLinkClick = async (svc) => {
    try {
      // Prefer stored Razorpay payment link (short URL) if available
      if (!svc.payment_link && !svc.razorpay_order_id && !svc.order_id) {
        alert('No payment link available. Please generate a payment link first.');
        return;
      }

      const paymentUrl =
        svc.payment_link ||
        (() => {
      const frontendUrl = window.location.origin;
      const orderId = svc.razorpay_order_id || svc.order_id;
      const registrationType = getRegistrationTypeSlug(svc.ticket_id);
      const ticketId = svc.ticket_id || '';
      const userId = svc.user_id || '';
          return `${frontendUrl}/payment?orderId=${orderId}&ticketId=${ticketId}&userId=${userId}&type=${
            registrationType || 'service'
          }&autoOpen=true`;
        })();

      // Copy to clipboard
      await navigator.clipboard.writeText(paymentUrl);
      alert('Payment link copied to clipboard! You can now share it via WhatsApp or any other platform.');
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Failed to copy link. Please try again.');
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
            {servicesList.map((s, index) => (
              <option key={`${s}-${index}`} value={s}>
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
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[160px]">Payment</th>
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
                        value={svc.service_status || 'Payment pending'}
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
                        <option value="Open">Open</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal break-words">
                    {formatDateTime(svc.updated_at || svc.confirmed_at || svc.created_at)}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal">
                    <div className="flex gap-2 items-center">
                    <button
                      onClick={() =>
                          navigate(
                            `/admin/client-overview/${svc.user_id || svc.id}?tab=services${
                              svc.ticket_id ? `&ticketId=${svc.ticket_id}` : ''
                            }`
                          )
                      }
                      className="px-3 py-1 text-xs bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors whitespace-nowrap"
                    >
                      View
                    </button>

                      {svc.ticket_id && (
                        <button
                          onClick={() => handleDeleteService(svc)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap flex items-center gap-1"
                          title="Delete service permanently"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal break-words">
                    <div className="flex gap-2 items-center">
                      {/* Pay & Copy Link buttons for pending payments - mirror user Registrations logic */}
                      {svc.service_status &&
                        svc.service_status.toLowerCase().trim() === 'payment pending' &&
                        (svc.razorpay_order_id || svc.order_id) && (
                          <>
                            <button
                              onClick={() => handlePayClick(svc)}
                              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
                            >
                              Pay
                            </button>
                            <button
                              onClick={() => handleCopyLinkClick(svc)}
                              className="px-3 py-1 text-xs font-medium text-[#01334C] border border-[#01334C] rounded-md hover:bg-[#01334C] hover:text-white transition-colors whitespace-nowrap"
                            >
                              Copy Link
                            </button>
                          </>
                      )}
                    </div>
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

