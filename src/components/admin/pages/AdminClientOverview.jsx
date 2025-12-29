import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../../utils/api';
import { updateUserDataByUserId } from '../../../utils/usersPageApi';
import { viewFile, uploadFileDirect } from '../../../utils/s3Upload';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function AdminClientOverview() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'services'); // profile, services, compliance, subscriptions
  const [expandedSection, setExpandedSection] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [savingNotes, setSavingNotes] = useState(false);
  const [expandedOrgId, setExpandedOrgId] = useState(null);
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [documentUrls, setDocumentUrls] = useState({});
  const [showNotepad, setShowNotepad] = useState(false);
  const [clientPersonaList, setClientPersonaList] = useState([]);
  const [expandedPersonaId, setExpandedPersonaId] = useState(null);
  const [isAddingPersona, setIsAddingPersona] = useState(false);
  const [currentPersona, setCurrentPersona] = useState({ date: '', description: '' });
  const [adminNotesList, setAdminNotesList] = useState([]);
  const [userNotesList, setUserNotesList] = useState([]);
  const [expandedAdminNoteId, setExpandedAdminNoteId] = useState(null);
  const [expandedUserNoteId, setExpandedUserNoteId] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [currentNote, setCurrentNote] = useState({
    date: '',
    description: '',
    attachments: [],
    adminActionItems: [''],
    clientActionItems: ['']
  });
  // Tasks state
  const [adminTasksList, setAdminTasksList] = useState([]);
  const [userTasksList, setUserTasksList] = useState([]);
  const [expandedAdminTaskId, setExpandedAdminTaskId] = useState(null);
  const [expandedUserTaskId, setExpandedUserTaskId] = useState(null);
  const [isAddingAdminTask, setIsAddingAdminTask] = useState(false);
  const [_isAddingUserTask, setIsAddingUserTask] = useState(false);
  const [_editingAdminTaskIndex] = useState(null);
  const [_editingUserTaskIndex] = useState(null);
  const [currentAdminTask, setCurrentAdminTask] = useState({ date: '', title: '', description: '', type: '' });
  const [currentUserTask, setCurrentUserTask] = useState({ date: '', title: '', description: '', type: '' });
  const [savingTasks, setSavingTasks] = useState(false);
  const [isServiceCardExpanded, setIsServiceCardExpanded] = useState(null); // Track which card index is expanded
  const [_serviceStatus, setServiceStatus] = useState('registered');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(null); // Track which card's dropdown is open (by index)
  const [_visiblePasswords] = useState({});
  const [isEditingOrganisations, setIsEditingOrganisations] = useState(false);
  const [_isEditingWebsites, setIsEditingWebsites] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [savingOrg, setSavingOrg] = useState(false);
  const [_savingWebsites, setSavingWebsites] = useState(false);
  // Personal details editing state
  const [isEditingPersonalDetails, setIsEditingPersonalDetails] = useState(false);
  const [savingPersonalDetails, setSavingPersonalDetails] = useState(false);
  const [personalDetailsForm, setPersonalDetailsForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    dob: '',
    address_line1: '',
    business_address: '',
    customClientId: '',
    clientStatus: '',
  });
  // Document upload state
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState(null);

  useEffect(() => {
    fetchClientDetails();
    fetchClientProfile();
    fetchClientPersona();
    fetchAllRegistrations();
    
    // Set active tab from URL params
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'services', 'compliance', 'subscriptions'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [userId, searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isStatusDropdownOpen !== null) {
        setIsStatusDropdownOpen(null);
      }
    };

    if (isStatusDropdownOpen !== null) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  const handleViewFile = async (fileData) => {
    await viewFile(fileData);
  };

  const handleUploadDocument = async (documentType, file) => {
    if (!file || !userId) {
      alert('Please select a file');
      return;
    }

    setUploadingDocument(true);
    setUploadDocumentType(documentType);
    try {
      // Upload directly to S3
      const folder = `user-profiles/${userId}/personal`;
      const { s3Url } = await uploadFileDirect(
        file,
        folder,
        file.name
      );

      // Save S3 URL to database using admin endpoint
      const response = await apiClient.post(`/users-page/upload-personal-document/${userId}`, {
        documentType: documentType,
        fileUrl: s3Url,
        fileName: file.name,
      });

      if (response.success) {
        alert('Document uploaded successfully!');
        // Refresh client profile to show new document (this will also refresh document URLs)
        await fetchClientProfile();
          } else {
        throw new Error(response.message || 'Upload failed');
          }
        } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploadingDocument(false);
      setUploadDocumentType(null);
      }
  };

  const handleFileInputChange = (documentType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image (JPG, PNG, GIF) or PDF');
      e.target.value = '';
      return;
    }

    handleUploadDocument(documentType, file);
    // Reset input
    e.target.value = '';
  };

  const fetchClientDetails = async () => {
    try {
      const response = await apiClient.get('/admin/clients');
      
      if (response.success) {
        const clientData = response.data.find(c => c.user_id === userId);
        if (clientData) {
          setClient(clientData);
          // Load service status
          setServiceStatus(clientData.service_status || 'registered');
        } else {
          console.error('Client not found');
          navigate('/admin/clients');
        }
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      navigate('/admin/clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientProfile = async () => {
    try {
      const response = await apiClient.get(`/users-page/user-data/${userId}`);
      
      if (response.success && response.data) {
        setClientProfile(response.data);
        
        // Initialize organisations with websites included
        if (response.data.user?.organisations && response.data.user.organisations.length > 0) {
          setOrganisations(response.data.user.organisations.map((org, idx) => {
            // Parse websites from JSONB or use empty array
            let websites = [];
            if (org.websites) {
              try {
                websites = typeof org.websites === 'string' ? JSON.parse(org.websites) : org.websites;
              } catch {
                websites = [];
              }
            }
            
            // Parse directors/partners details
            let directorsPartners = [];
            if (org.directors_partners_details) {
              try {
                directorsPartners = typeof org.directors_partners_details === 'string' 
                  ? JSON.parse(org.directors_partners_details) 
                  : org.directors_partners_details;
                if (!Array.isArray(directorsPartners)) directorsPartners = [];
              } catch {
                directorsPartners = [];
              }
            }
            
            // Parse digital signature details
            let digitalSignatures = [];
            if (org.digital_signature_details) {
              try {
                digitalSignatures = typeof org.digital_signature_details === 'string' 
                  ? JSON.parse(org.digital_signature_details) 
                  : org.digital_signature_details;
                if (!Array.isArray(digitalSignatures)) digitalSignatures = [];
              } catch {
                digitalSignatures = [];
              }
            }
            
            return {
              id: org.id || idx + 1,
              organisationType: org.organisation_type || '',
              legalName: org.legal_name || '',
              tradeName: org.trade_name || '',
              category: org.category || '',
              gstin: org.gstin || '',
              incorporationDate: org.incorporation_date || '',
              panFile: org.pan_file || null,
              tan: org.tan || '',
              cin: org.cin || '',
              registeredAddress: org.registered_address || '',
              directorsPartners: directorsPartners.map((dp, index) => ({
                id: dp.id || `dp-${Date.now()}-${index}`,
                name: dp.name || '',
                dinNumber: dp.din_number || '',
                contact: dp.contact || '',
                email: dp.email || '',
                dateOfAddition: dp.date_of_addition || '',
                status: dp.status || 'Active'
              })),
              digitalSignatures: digitalSignatures.map((ds, index) => ({
                id: ds.id || `ds-${Date.now()}-${index}`,
                name: ds.name || '',
                dscNumber: ds.dsc_number || '',
                expiryDate: ds.expiry_date || '',
                status: ds.status || 'Active'
              })),
              optionalAttachment1: org.optional_attachment_1 || null,
              optionalAttachment2: org.optional_attachment_2 || null,
              websites: websites.map((w, wIdx) => ({
                id: w.id || wIdx + 1,
                type: w.type || '',
                url: w.url || '',
                login: w.login || '',
                password: w.password || '',
                showPassword: false
              }))
            };
          }));
        } else {
          setOrganisations([{ 
            id: 1, 
            organisationType: '',
            legalName: '',
            tradeName: '',
            category: '',
            gstin: '',
            incorporationDate: '',
            panFile: null,
            tan: '',
            cin: '',
            registeredAddress: '',
            directorsPartners: [],
            digitalSignatures: [],
            optionalAttachment1: null,
            optionalAttachment2: null,
            websites: []
          }]);
        }
        
        // Keep separate websites state for backward compatibility but don't use it
        setWebsites([]);
        
        const adminNotesRaw = response.data.user?.admin_notes || '';
        
        // Parse admin notes (array of notes)
        try {
          const notesList = JSON.parse(adminNotesRaw);
          const normalizeNotes = (list) =>
            list.map((n) => ({
              ...n,
              adminActionItems: n.adminActionItems || [],
              clientActionItems: n.clientActionItems || [],
              attachments: n.attachments || []
            }));
          if (Array.isArray(notesList)) {
            setAdminNotesList(normalizeNotes(notesList));
          } else if (notesList.note !== undefined) {
            setAdminNotesList(normalizeNotes([notesList]));
          } else if (adminNotesRaw) {
            setAdminNotesList(
              normalizeNotes([{ date: '', description: adminNotesRaw, attachments: [] }])
            );
          }
        } catch {
          if (adminNotesRaw) {
            setAdminNotesList([
              {
                date: '',
                description: adminNotesRaw,
                attachments: [],
                adminActionItems: [],
                clientActionItems: []
              }
            ]);
          }
        }
        
        // Parse user notes (array of notes)
        const userNotesRaw = response.data.user?.user_notes || '';
        try {
          const notesList = JSON.parse(userNotesRaw);
          if (Array.isArray(notesList)) {
            setUserNotesList(notesList);
          } else if (notesList.note !== undefined) {
            setUserNotesList([notesList]);
          } else if (userNotesRaw) {
            setUserNotesList([{ date: '', description: userNotesRaw, attachments: [] }]);
          }
        } catch {
          if (userNotesRaw) {
            setUserNotesList([{ date: '', description: userNotesRaw, attachments: [] }]);
          }
        }
        
        // Parse admin tasks (array of tasks)
        const adminTasksRaw = response.data.user?.admin_tasks || '';
        try {
          const tasksList = JSON.parse(adminTasksRaw);
          if (Array.isArray(tasksList)) {
            setAdminTasksList(tasksList);
          } else if (adminTasksRaw) {
            setAdminTasksList([{ date: '', title: adminTasksRaw, description: '', type: '' }]);
          }
        } catch {
          if (adminTasksRaw) {
            setAdminTasksList([{ date: '', title: adminTasksRaw, description: '', type: '' }]);
          }
        }
        
        // Parse user tasks (array of tasks)
        const userTasksRaw = response.data.user?.user_tasks || '';
        try {
          const tasksList = JSON.parse(userTasksRaw);
          if (Array.isArray(tasksList)) {
            setUserTasksList(tasksList);
          } else if (userTasksRaw) {
            setUserTasksList([{ date: '', title: userTasksRaw, description: '', type: '' }]);
          }
        } catch {
          if (userTasksRaw) {
            setUserTasksList([{ date: '', title: userTasksRaw, description: '', type: '' }]);
          }
        }
        
        // Fetch signed URLs for documents if they're S3 URLs
        await fetchDocumentSignedUrls(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching client profile:', error);
    }
  };

  const fetchClientPersona = async () => {
    try {
      const response = await apiClient.get(`/admin/client-persona/${userId}`);
      
      if (response.success && response.data) {
        // Parse personaList from response
        if (response.data.personaList && Array.isArray(response.data.personaList)) {
          setClientPersonaList(response.data.personaList);
        } else if (response.data.client_persona) {
          try {
            const parsed = JSON.parse(response.data.client_persona);
            if (Array.isArray(parsed)) {
              setClientPersonaList(parsed);
            } else {
              setClientPersonaList([{ date: new Date().toISOString().split('T')[0], description: response.data.client_persona }]);
            }
          } catch {
            setClientPersonaList([{ date: new Date().toISOString().split('T')[0], description: response.data.client_persona }]);
          }
        } else {
          setClientPersonaList([]);
        }
      }
    } catch (error) {
      console.error('Error fetching client persona:', error);
    }
  };

  const fetchAllRegistrations = async () => {
    try {
      console.log('🔍 Fetching all registrations for user ID:', userId);
      
      // Fetch private limited, proprietorship, startup india, GST, and all other services from registration_details
      const [privateLimitedResponse, proprietorshipResponse, startupIndiaResponse, gstResponse, allServicesResponse] = await Promise.all([
        apiClient.get(`/private-limited/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/proprietorship/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/startup-india/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/gst/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/admin/user-services/${userId}`).catch(() => ({ success: false, data: [] }))
      ]);

      // Handle response structure - check if data is nested
      const privateLimited = privateLimitedResponse.success 
        ? (Array.isArray(privateLimitedResponse.data) ? privateLimitedResponse.data : (privateLimitedResponse.data?.data || []))
        : [];
      const proprietorship = proprietorshipResponse.success 
        ? (Array.isArray(proprietorshipResponse.data) ? proprietorshipResponse.data : (proprietorshipResponse.data?.data || []))
        : [];
      const startupIndia = startupIndiaResponse.success 
        ? (Array.isArray(startupIndiaResponse.data) ? startupIndiaResponse.data : (startupIndiaResponse.data?.data || []))
        : [];
      const gst = gstResponse.success 
        ? (Array.isArray(gstResponse.data) ? gstResponse.data : (gstResponse.data?.data || []))
        : [];
      const allServices = allServicesResponse.success 
        ? (Array.isArray(allServicesResponse.data) ? allServicesResponse.data : (allServicesResponse.data?.data || []))
        : [];

      console.log('📊 Private Limited:', privateLimited.length, 'registrations', privateLimited);
      console.log('📊 Proprietorship:', proprietorship.length, 'registrations', proprietorship);
      console.log('📊 Startup India:', startupIndia.length, 'registrations', startupIndia);
      console.log('📊 GST:', gst.length, 'registrations', gst);
      console.log('📊 Generic Services:', allServices.length, 'registrations', allServices);

      // Include both paid and pending payment registrations
      // Show services that are either paid OR have pending payment status (created by admin with payment link)
      const filterServices = (r) => {
        // Paid services (has payment_id)
        const isPaid = 
          (r.razorpay_payment_id && String(r.razorpay_payment_id).trim() !== '') ||
          (r.payment_id && String(r.payment_id).trim() !== '') ||
          (r.payment_status && String(r.payment_status).toLowerCase() === 'paid');
        
        // Pending payment services (created by admin with payment link)
        // More lenient: show if payment_status is pending/unpaid and has ticket_id (admin created it)
        const isPendingPayment = 
          r.ticket_id && 
          r.payment_status && 
          (String(r.payment_status).toLowerCase() === 'pending' || String(r.payment_status).toLowerCase() === 'unpaid');
        
        const result = isPaid || isPendingPayment;
        
        // Debug logging for pending payments
        if (isPendingPayment && !isPaid) {
          console.log('🔍 Found pending payment service:', {
            ticket_id: r.ticket_id,
            payment_status: r.payment_status,
            service_status: r.service_status,
            user_id: r.user_id,
            package_name: r.package_name
          });
        }
        
        return result;
      };

      // Filter generic services - also filter by userId to ensure we only get this client's services
      const filteredAllServices = allServices.filter(r => {
        // First check if it belongs to this user
        const belongsToUser = r.user_id === userId || r.user_id === String(userId);
        if (!belongsToUser) return false;
        // Then apply the payment filter
        return filterServices(r);
      });

      // Combine, filter by userId, and sort by created_at
      // Also deduplicate by ticket_id to avoid showing the same service multiple times
      const allCombined = [...privateLimited, ...proprietorship, ...startupIndia, ...gst, ...filteredAllServices];
      
      // Filter by userId and payment status, then deduplicate
      const filtered = allCombined.filter(r => {
        // Ensure it belongs to this user
        const belongsToUser = r.user_id === userId || r.user_id === String(userId);
        if (!belongsToUser) {
          // Debug: log if service doesn't belong to user
          if (r.ticket_id && (r.payment_status === 'pending' || r.payment_status === 'unpaid')) {
            console.log('⚠️ Service filtered out (wrong user):', {
              ticket_id: r.ticket_id,
              service_user_id: r.user_id,
              target_user_id: userId,
              payment_status: r.payment_status
            });
          }
          return false;
        }
        const passesFilter = filterServices(r);
        if (!passesFilter && (r.payment_status === 'pending' || r.payment_status === 'unpaid')) {
          console.log('⚠️ Service filtered out (filter failed):', {
            ticket_id: r.ticket_id,
            payment_status: r.payment_status,
            service_status: r.service_status,
            has_payment_id: !!(r.razorpay_payment_id || r.payment_id),
            has_ticket_id: !!r.ticket_id
          });
        }
        return passesFilter;
      });
      
      // Deduplicate by ticket_id
      const seen = new Set();
      const unique = filtered.filter(r => {
        const key = r.ticket_id || r.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      const combined = unique.sort((a, b) => 
        new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0)
      );

      setAllRegistrations(combined);
      console.log('📊 Total registrations for this user:', combined.length);
      console.log('📋 Registrations:', combined);
    } catch (error) {
      console.error('Error fetching all registrations:', error);
    }
  };

  const fetchDocumentSignedUrls = async (user) => {
    if (!user) return;
    
    try {
      // Fetch personal documents from the API (more reliable than user table fields)
      const personalDocsResponse = await apiClient.get(`/users-page/personal-documents/${userId}`).catch(() => ({ 
        success: false, 
        data: {}
      }));
    
    const urls = {};
      
      // Get URLs from personal documents API (preferred)
      if (personalDocsResponse.success && personalDocsResponse.data) {
        Object.keys(personalDocsResponse.data).forEach(docType => {
          const docs = personalDocsResponse.data[docType];
          if (Array.isArray(docs) && docs.length > 0 && docs[0].url) {
            urls[docType] = docs[0].url;
          }
        });
      }
      
      // Fallback to user table fields if personal documents API doesn't have them
      const userTableDocs = {
      aadhar_card: user.aadhar_card,
      pan_card: user.pan_card,
      signature: user.signature
    };

      for (const [key, url] of Object.entries(userTableDocs)) {
        // Only use user table field if we don't already have a URL from personal documents
        if (!urls[key] && url && typeof url === 'string' && url.trim().length > 0) {
          urls[key] = url;
        }
      }

      // Process URLs to get signed URLs for S3 files
      for (const [key, url] of Object.entries(urls)) {
        if (url && typeof url === 'string' && url.includes('s3.') && url.includes('.amazonaws.com')) {
        try {
            const response = await apiClient.post('/admin/get-signed-url', { s3Url: url }).catch(() => ({ success: false }));
            if (response.success && response.signedUrl) {
            urls[key] = response.signedUrl;
            }
            // If signed URL fails, keep original URL
          } catch {
            // Silently fail - keep original URL
            console.warn(`Could not get signed URL for ${key}, using original URL`);
          }
      }
    }

    setDocumentUrls(urls);
    } catch (error) {
      console.error('Error fetching document URLs:', error);
      setDocumentUrls({});
    }
  };

  const handleNoteFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentNote(prev => ({
          ...prev,
          attachments: [...prev.attachments, {
            name: file.name,
            data: reader.result,
            type: file.type,
            size: file.size
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNoteAttachment = (index) => {
    setCurrentNote(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== index)
    }));
  };

  const handleEditNote = (note, index) => {
    setCurrentNote({
      date: note.date,
      description: note.description,
      attachments: note.attachments || [],
      adminActionItems: (note.adminActionItems && note.adminActionItems.length ? note.adminActionItems : ['']),
      clientActionItems: (note.clientActionItems && note.clientActionItems.length ? note.clientActionItems : [''])
    });
    setEditingNoteIndex(index);
    setIsAddingNote(true);
  };

  const handleDeleteNote = async (index) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      setSavingNotes(true);
      const updatedNotesList = adminNotesList.filter((_, idx) => idx !== index);

      const response = await apiClient.post('/admin/update-client-notes', {
        userId,
        adminNotes: JSON.stringify(updatedNotesList),
        userNotes: JSON.stringify(userNotesList)
      });

      if (response.success) {
        setAdminNotesList(updatedNotesList);
        alert('Note deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    } finally {
      setSavingNotes(false);
    }
  };

  // Task handling functions
  const addAdminTask = async () => {
    if (!currentAdminTask.title || !currentAdminTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      setSavingTasks(true);
      const updatedTasksList = [...adminTasksList, {
        id: Date.now(),
        date: currentAdminTask.date,
        title: currentAdminTask.title,
        description: currentAdminTask.description,
        type: currentAdminTask.type,
        createdAt: new Date().toISOString()
      }];

      const payload = {
        adminTasks: JSON.stringify(updatedTasksList),
        userTasks: JSON.stringify(userTasksList)
      };
      
      const response = await updateUserDataByUserId(userId, payload);
      
      if (response.success) {
        setAdminTasksList(updatedTasksList);
        setCurrentAdminTask({ date: '', title: '', description: '', type: '' });
        setIsAddingAdminTask(false);
        alert('Task saved successfully!');
        await fetchClientProfile();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setSavingTasks(false);
    }
  };

  const _addUserTask = async () => {
    if (!currentUserTask.title || !currentUserTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      setSavingTasks(true);
      const updatedTasksList = [...userTasksList, {
        id: Date.now(),
        date: currentUserTask.date,
        title: currentUserTask.title,
        description: currentUserTask.description,
        type: currentUserTask.type,
        createdAt: new Date().toISOString()
      }];

      const payload = {
        adminTasks: JSON.stringify(adminTasksList),
        userTasks: JSON.stringify(updatedTasksList)
      };
      
      const response = await updateUserDataByUserId(userId, payload);
      
      if (response.success) {
        setUserTasksList(updatedTasksList);
        setCurrentUserTask({ date: '', title: '', description: '', type: '' });
        setIsAddingUserTask(false);
        alert('Task saved successfully!');
        await fetchClientProfile();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setSavingTasks(false);
    }
  };

  const handleSaveTasks = async () => {
    try {
      setSavingTasks(true);
      
      const payload = {
        adminTasks: JSON.stringify(adminTasksList),
        userTasks: JSON.stringify(userTasksList)
      };
      
      const response = await updateUserDataByUserId(userId, payload);
      
      if (response.success) {
        alert('✅ Tasks saved successfully!');
        await fetchClientProfile();
      }
    } catch (error) {
      console.error('❌ Error saving Tasks:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingTasks(false);
    }
  };

  const handleSaveAdminNote = async () => {
    try {
      setSavingNotes(true);
      
      let updatedNotesList;
      
      const cleanedAdmin = (currentNote.adminActionItems || []).filter((t) => t && t.trim() !== '');
      const cleanedClient = (currentNote.clientActionItems || []).filter((t) => t && t.trim() !== '');

      if (editingNoteIndex !== null) {
        // Update existing note
        updatedNotesList = adminNotesList.map((note, idx) => 
          idx === editingNoteIndex 
            ? { 
                ...note, 
                date: currentNote.date, 
                description: currentNote.description, 
                attachments: currentNote.attachments, 
                adminActionItems: cleanedAdmin,
                clientActionItems: cleanedClient,
                updatedAt: new Date().toISOString() 
              }
            : note
        );
      } else {
        // Add new note
        updatedNotesList = [...adminNotesList, {
          id: Date.now(),
          date: currentNote.date,
          description: currentNote.description,
          attachments: currentNote.attachments,
          adminActionItems: cleanedAdmin,
          clientActionItems: cleanedClient,
          createdAt: new Date().toISOString()
        }];
      }

      const response = await apiClient.post('/admin/update-client-notes', {
        userId,
        adminNotes: JSON.stringify(updatedNotesList),
        userNotes: JSON.stringify(userNotesList)
      });

      if (response.success) {
        setAdminNotesList(updatedNotesList);
        setCurrentNote({ date: '', description: '', attachments: [], adminActionItems: [''], clientActionItems: [''] });
        setIsAddingNote(false);
        setEditingNoteIndex(null);
        alert(editingNoteIndex !== null ? 'Note updated successfully!' : 'Note saved successfully!');
      }
    } catch (error) {
      console.error('Error saving admin note:', error);
      alert('Failed to save note');
    } finally {
      setSavingNotes(false);
    }
  };

  // Organization handlers
  const addOrganization = () => {
    setOrganisations([...organisations, { 
      id: Date.now(), 
      organisationType: '',
      legalName: '',
      tradeName: '',
      category: '',
      gstin: '',
      incorporationDate: '',
      panFile: null,
      tan: '',
      cin: '',
      registeredAddress: '',
      directorsPartners: [],
      digitalSignatures: [],
      optionalAttachment1: null,
      optionalAttachment2: null,
      websites: []
    }]);
  };

  const removeOrganization = (id) => {
    const updatedOrgs = organisations.filter(o => o.id !== id);
    setOrganisations(updatedOrgs);
    
    // If no organizations left, exit edit mode
    if (updatedOrgs.length === 0) {
      setIsEditingOrganisations(false);
    }
  };

  const updateOrganization = (id, field, value) => {
    setOrganisations(organisations.map(org => 
      org.id === id ? { ...org, [field]: value } : org
    ));
  };

  // Website handlers for organizations
  const addWebsiteToOrg = (orgId) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? { 
            ...org, 
            websites: [...(org.websites || []), { 
              id: Date.now(), 
              type: '', 
              url: '', 
              login: '', 
              password: '', 
              showPassword: false 
            }]
          } 
        : org
    ));
  };

  const removeWebsiteFromOrg = (orgId, websiteId) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? { 
            ...org, 
            websites: (org.websites || []).filter(w => w.id !== websiteId)
          } 
        : org
    ));
  };

  const updateWebsiteInOrg = (orgId, websiteId, field, value) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? { 
            ...org, 
            websites: (org.websites || []).map(website => 
              website.id === websiteId ? { ...website, [field]: value } : website
            )
          } 
        : org
    ));
  };

  const togglePasswordVisibilityInOrg = (orgId, websiteId) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? { 
            ...org, 
            websites: (org.websites || []).map(website => 
              website.id === websiteId ? { ...website, showPassword: !website.showPassword } : website
            )
          } 
        : org
    ));
  };

  // Director/Partner management functions
  const addDirectorPartner = (orgId) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? { 
            ...org, 
            directorsPartners: [...(org.directorsPartners || []), {
              id: Date.now(),
              name: '',
              dinNumber: '',
              contact: '',
              email: '',
              dateOfAddition: '',
              status: 'Active'
            }]
          }
        : org
    ));
  };

  const removeDirectorPartner = (orgId, id) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? { ...org, directorsPartners: (org.directorsPartners || []).filter(dp => dp.id !== id) }
        : org
    ));
  };

  const updateDirectorPartner = (orgId, id, field, value) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? {
            ...org,
            directorsPartners: (org.directorsPartners || []).map(dp =>
              dp.id === id ? { ...dp, [field]: value } : dp
            )
          }
        : org
    ));
  };

  // Digital Signature management functions
  const addDigitalSignature = (orgId) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? { 
            ...org, 
            digitalSignatures: [...(org.digitalSignatures || []), {
              id: Date.now(),
              name: '',
              dscNumber: '',
              expiryDate: '',
              status: 'Active'
            }]
          }
        : org
    ));
  };

  const removeDigitalSignature = (orgId, id) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? { ...org, digitalSignatures: (org.digitalSignatures || []).filter(ds => ds.id !== id) }
        : org
    ));
  };

  const updateDigitalSignature = (orgId, id, field, value) => {
    setOrganisations(organisations.map(org => 
      org.id === orgId 
        ? {
            ...org,
            digitalSignatures: (org.digitalSignatures || []).map(ds =>
              ds.id === id ? { ...ds, [field]: value } : ds
            )
          }
        : org
    ));
  };

  const handleSaveOrganisations = async () => {
    try {
      setSavingOrg(true);
      
      const payload = {
          organisations: organisations.map(org => ({
            organisationType: org.organisationType,
            legalName: org.legalName,
            tradeName: org.tradeName,
            category: org.category || '',
            gstin: org.gstin,
            incorporationDate: org.incorporationDate,
            panFile: org.panFile,
            tan: org.tan,
            cin: org.cin,
            registeredAddress: org.registeredAddress,
            directorsPartners: (org.directorsPartners || []).filter(dp => dp.name || dp.dinNumber || dp.contact || dp.email),
            digitalSignatures: (org.digitalSignatures || []).filter(ds => ds.name || ds.dscNumber),
            optionalAttachment1: org.optionalAttachment1 || null,
            optionalAttachment2: org.optionalAttachment2 || null,
            websites: (org.websites || [])
              // keep rows that have any field filled or were explicitly added
              .filter(w => (w.type || w.url || w.login || w.password))
              .map(w => ({
                type: w.type || '',
                url: w.url || '',
                login: w.login || '',
                password: w.password || ''
              }))
          }))
      };
      
      const response = await updateUserDataByUserId(userId, payload);
      
      if (response.success) {
        alert('✅ Organisation Details saved successfully!');
        setIsEditingOrganisations(false);
        setEditingOrgId(null);
        await fetchClientProfile();
      }
    } catch (error) {
      console.error('❌ Error saving Organisation:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingOrg(false);
    }
  };

  // Delete organization handler
  const handleDeleteOrganization = async (orgIndex) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      setSavingOrg(true);
      
      // Get current organizations and remove the one at the specified index
      const currentOrgs = clientProfile.user?.organisations || [];
      const updatedOrgs = currentOrgs.filter((_, idx) => idx !== orgIndex);
      
      // Map to the expected format for the backend
      const payload = {
        organisations: updatedOrgs.map(org => {
          // Parse websites if needed
          let websites = [];
          if (org.websites) {
            try {
              websites = typeof org.websites === 'string' ? JSON.parse(org.websites) : org.websites;
            } catch {
              websites = [];
            }
          }
          
          return {
            organisationType: org.organisation_type || '',
            legalName: org.legal_name || '',
            tradeName: org.trade_name || '',
            gstin: org.gstin || '',
            incorporationDate: org.incorporation_date || '',
            panFile: org.pan_file || null,
            tan: org.tan || '',
            cin: org.cin || '',
            registeredAddress: org.registered_address || '',
            websites: (websites || []).map(w => ({
              type: w.type || '',
              url: w.url || '',
              login: w.login || '',
              password: w.password || ''
            }))
          };
        })
      };
      
      const response = await updateUserDataByUserId(userId, payload);
      
      if (response.success) {
        alert('✅ Organization deleted successfully!');
        setExpandedOrgId(null);
        await fetchClientProfile();
      }
    } catch (error) {
      console.error('❌ Error deleting organization:', error);
      alert(`❌ Failed to delete: ${error.message}`);
    } finally {
      setSavingOrg(false);
    }
  };

  // Website handlers
  const _addWebsite = () => {
    setWebsites([...websites, { 
      id: Date.now(), 
      type: '', 
      url: '', 
      login: '', 
      password: '', 
      showPassword: false 
    }]);
  };

  const _removeWebsite = (id) => {
    if (websites.length > 1) {
      setWebsites(websites.filter(w => w.id !== id));
    }
  };

  const _updateWebsite = (id, field, value) => {
    setWebsites(websites.map(website => 
      website.id === id ? { ...website, [field]: value } : website
    ));
  };

  const _togglePasswordVisibility = (id) => {
    setWebsites(websites.map(website => 
      website.id === id ? { ...website, showPassword: !website.showPassword } : website
    ));
  };

  const _handleSaveWebsites = async () => {
    try {
      setSavingWebsites(true);
      
      const payload = {
        websites: websites.map(w => ({
          type: w.type,
          url: w.url,
          login: w.login,
          password: w.password
        }))
      };
      
      const response = await updateUserDataByUserId(userId, payload);
      
      if (response.success) {
        alert('✅ Website Details saved successfully!');
        setIsEditingWebsites(false);
        await fetchClientProfile();
      }
    } catch (error) {
      console.error('❌ Error saving Websites:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingWebsites(false);
    }
  };

  // Personal details handlers
  const handleEditPersonalDetails = () => {
    // Initialize form with current values
    setPersonalDetailsForm({
      name: clientProfile?.user?.name || '',
      email: clientProfile?.user?.email || '',
      whatsapp: clientProfile?.user?.whatsapp || '',
      dob: clientProfile?.user?.dob || '',
      address_line1: clientProfile?.user?.address_line1 || '',
      business_address: clientProfile?.user?.business_address || '',
      customClientId: clientProfile?.user?.custom_client_id || '',
      clientStatus: clientProfile?.user?.client_status || 'Active',
    });
    setIsEditingPersonalDetails(true);
  };

  const handleSavePersonalDetails = async () => {
    try {
      setSavingPersonalDetails(true);
      
      // Backend expects data in clientProfile format
      const payload = {
        clientProfile: {
          name: personalDetailsForm.name,
          email: personalDetailsForm.email,
          whatsapp: personalDetailsForm.whatsapp,
          dob: personalDetailsForm.dob,
          address: personalDetailsForm.address_line1,
          businessAddress: personalDetailsForm.business_address,
          customClientId: personalDetailsForm.customClientId || null,
          clientStatus: personalDetailsForm.clientStatus || 'Active',
        }
      };
      
      const response = await updateUserDataByUserId(userId, payload);
      
      if (response.success) {
        alert('✅ Personal details saved successfully!');
        setIsEditingPersonalDetails(false);
        await fetchClientProfile();
      }
    } catch (error) {
      console.error('❌ Error saving personal details:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingPersonalDetails(false);
    }
  };

  const handleSaveClientPersona = async () => {
    try {
      setSavingNotes(true);
      
      const response = await apiClient.post('/admin/update-client-persona', {
        userId,
        personaList: JSON.stringify(clientPersonaList)
      });

      if (response.success) {
        alert('Client persona saved successfully!');
        setShowNotepad(false);
        await fetchClientPersona();
      }
    } catch (error) {
      console.error('Error saving client persona:', error);
      alert('Failed to save client persona');
    } finally {
      setSavingNotes(false);
    }
  };

  const addPersonaEntry = () => {
    if (!currentPersona.description || !currentPersona.description.trim()) {
      alert('Please enter a description');
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: currentPersona.date || new Date().toISOString().split('T')[0],
      description: currentPersona.description,
      createdAt: new Date().toISOString()
    };

    setClientPersonaList([...clientPersonaList, newEntry]);
    setCurrentPersona({ date: '', description: '' });
    setIsAddingPersona(false);
  };

  const removePersonaEntry = (index) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    const updatedList = clientPersonaList.filter((_, idx) => idx !== index);
    setClientPersonaList(updatedList);
  };

  const handleUpdateServiceStatus = async (newStatus, ticketId) => {
    try {
      if (!ticketId) {
        alert('Ticket ID is required to update status');
        return;
      }

      // Use the status directly (no mapping needed)
      const statusToSet = newStatus;

      const response = await apiClient.post('/admin/update-service-status', {
        ticketId,
        status: statusToSet
      });

      console.log('📝 Update status response:', response);

      if (response.success) {
        // Refresh the client data and registrations to show updated status
        await fetchAllRegistrations();
        fetchClientProfile();
        console.log('✅ Service status updated:', newStatus);
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error';
      
      // Check if it's a database column error
      if (errorMessage.includes('service_status') && errorMessage.includes('column')) {
        alert('The service_status column does not exist in the database. Please run the migration SQL first. See backend/migrations/add_service_status_column.sql');
      } else {
        alert('Failed to update status: ' + errorMessage);
      }
    }
  };

  const formatDate = (dateString) => {
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

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let date;
      
      // Handle different date string formats
      if (typeof dateString === 'string') {
        // For date-only fields, extract just the date part (YYYY-MM-DD)
        if (dateString.includes(' ')) {
          // If it has time, extract just the date part
          date = new Date(dateString.split(' ')[0] + 'T00:00:00Z');
        } else if (dateString.includes('T')) {
          // ISO format, extract date part
          date = new Date(dateString.split('T')[0] + 'T00:00:00Z');
        } else {
          // Pure date string (YYYY-MM-DD)
          date = new Date(dateString + 'T00:00:00Z');
        }
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format only the date part in IST (Asia/Kolkata timezone)
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const _getStatusBadge = (client) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-gray-600">Client not found</p>
          <button
            onClick={() => navigate('/admin/clients')}
            className="mt-4 px-4 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C]"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/clients')}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Clients
      </button>

      {/* Top Tabs Navigation */}
      <div className="bg-white rounded-xl p-3 md:p-5 mb-4 md:mb-6 transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
        <div className="flex gap-2 md:gap-4 overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0 scrollbar-hide">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === 'services'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Services
            {allRegistrations.length > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'services'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#01334C] text-white'
              }`}>
                {allRegistrations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'compliance'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Compliance
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'subscriptions'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Subscriptions
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && clientProfile && (
        <div className="space-y-4">
          {/* Personal Details */}
          <div className="bg-white rounded-xl border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012] overflow-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setExpandedSection(expandedSection === 'personal' ? null : 'personal');
              }}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
              <svg className={`w-5 h-5 transition-transform ${expandedSection === 'personal' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'personal' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                {/* Edit Button */}
                {!isEditingPersonalDetails && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={handleEditPersonalDetails}
                      className="px-4 py-2 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm"
                    >
                      Edit
                    </button>
                  </div>
                )}

                {isEditingPersonalDetails ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    {/* System Client ID, Custom Client ID, and Client Status in single row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* System Client ID - Read-only */}
                      {userId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">System Client ID</label>
                          <input
                            type="text"
                            value={userId}
                            disabled
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium cursor-not-allowed text-sm"
                          />
                        </div>
                      )}
                      
                      {/* Custom Client ID - Editable */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Client ID</label>
                        <input
                          type="text"
                          value={personalDetailsForm.customClientId}
                          onChange={(e) => setPersonalDetailsForm({ ...personalDetailsForm, customClientId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Enter custom client ID"
                        />
                      </div>
                      
                      {/* Client Status - Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Status</label>
                        <select
                          value={personalDetailsForm.clientStatus}
                          onChange={(e) => setPersonalDetailsForm({ ...personalDetailsForm, clientStatus: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Under closure">Under closure</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={personalDetailsForm.name}
                          onChange={(e) => setPersonalDetailsForm({ ...personalDetailsForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input
                          type="text"
                          value={personalDetailsForm.whatsapp}
                          onChange={(e) => setPersonalDetailsForm({ ...personalDetailsForm, whatsapp: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Enter WhatsApp number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={personalDetailsForm.email}
                          onChange={(e) => setPersonalDetailsForm({ ...personalDetailsForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={personalDetailsForm.dob}
                          onChange={(e) => setPersonalDetailsForm({ ...personalDetailsForm, dob: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          value={personalDetailsForm.address_line1}
                          onChange={(e) => setPersonalDetailsForm({ ...personalDetailsForm, address_line1: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows="2"
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                        <textarea
                          value={personalDetailsForm.business_address}
                          onChange={(e) => setPersonalDetailsForm({ ...personalDetailsForm, business_address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows="2"
                          placeholder="Enter business address"
                        />
                      </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        onClick={() => setIsEditingPersonalDetails(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePersonalDetails}
                        disabled={savingPersonalDetails}
                        className="px-4 py-2 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm disabled:opacity-50"
                      >
                        {savingPersonalDetails ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-4">
                    {/* System Client ID, Custom Client ID, and Client Status in single row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      {/* System Client ID - Read-only */}
                      {userId && (
                        <div>
                          <span className="font-medium text-gray-700">System Client ID:</span> <span className="text-gray-600 font-medium ml-2">{userId}</span>
                        </div>
                      )}
                      
                      {/* Custom Client ID - Display */}
                      {clientProfile?.user?.custom_client_id && (
                        <div>
                          <span className="font-medium text-gray-700">Custom Client ID:</span> <span className="text-gray-600 font-medium ml-2">{clientProfile.user.custom_client_id}</span>
                        </div>
                      )}
                      
                      {/* Client Status - Display */}
                      <div>
                        <span className="font-medium text-gray-700">Client Status:</span> <span className="text-gray-600 font-medium ml-2">{clientProfile?.user?.client_status || 'Active'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                      <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-600">{clientProfile.user?.name || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-700">WhatsApp:</span> <span className="text-gray-600">{clientProfile.user?.whatsapp || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-600">{clientProfile.user?.email || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-700">DOB:</span> <span className="text-gray-600">{clientProfile.user?.dob || 'N/A'}</span></div>
                      <div className="col-span-2"><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-600">{clientProfile.user?.address_line1 || 'N/A'}</span></div>
                      <div className="col-span-2"><span className="font-medium text-gray-700">Business Address:</span> <span className="text-gray-600">{clientProfile.user?.business_address || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Documents Section */}
                <div className="border-t border-gray-300 pt-4 mt-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Documents</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Aadhar Card:</span>
                      {(documentUrls.aadhar_card && typeof documentUrls.aadhar_card === 'string') || 
                       (clientProfile.user?.aadhar_card && typeof clientProfile.user.aadhar_card === 'string') ? (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = documentUrls.aadhar_card || clientProfile.user?.aadhar_card;
                            if (url && typeof url === 'string' && url.trim().length > 0) {
                            await handleViewFile(url);
                            } else {
                              alert('Invalid document URL');
                            }
                          }}
                          className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-600">N/A</span>
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileInputChange('aadhar_card', e)}
                          disabled={uploadingDocument}
                          className="hidden"
                        />
                        <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                          {uploadingDocument && uploadDocumentType === 'aadhar_card' ? 'Uploading...' : 'Upload'}
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">PAN Card:</span>
                      {(documentUrls.pan_card && typeof documentUrls.pan_card === 'string') || 
                       (clientProfile.user?.pan_card && typeof clientProfile.user.pan_card === 'string') ? (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = documentUrls.pan_card || clientProfile.user?.pan_card;
                            if (url && typeof url === 'string' && url.trim().length > 0) {
                            await handleViewFile(url);
                            } else {
                              alert('Invalid document URL');
                            }
                          }}
                          className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-600">N/A</span>
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileInputChange('pan_card', e)}
                          disabled={uploadingDocument}
                          className="hidden"
                        />
                        <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                          {uploadingDocument && uploadDocumentType === 'pan_card' ? 'Uploading...' : 'Upload'}
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Signature:</span>
                      {(documentUrls.signature && typeof documentUrls.signature === 'string') || 
                       (clientProfile.user?.signature && typeof clientProfile.user.signature === 'string') ? (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = documentUrls.signature || clientProfile.user?.signature;
                            if (url && typeof url === 'string' && url.trim().length > 0) {
                              await handleViewFile(url);
                            } else {
                              alert('Invalid document URL');
                            }
                          }}
                          className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-600">N/A</span>
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileInputChange('signature', e)}
                          disabled={uploadingDocument}
                          className="hidden"
                        />
                        <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                          {uploadingDocument && uploadDocumentType === 'signature' ? 'Uploading...' : 'Upload'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Organisation Details */}
          <div className="bg-white rounded-xl border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012] overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'organisation' ? null : 'organisation')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Organisation Details</h3>
              <svg className={`w-5 h-5 transition-transform ${expandedSection === 'organisation' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'organisation' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                {isEditingOrganisations ? (
                  <div className="space-y-6">
                    {organisations.map((org, idx) => (
                      <div key={org.id} className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                          <h4 className="text-xl font-bold text-gray-900">Organization {idx + 1}</h4>
                          <button
                            onClick={() => removeOrganization(org.id)}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Organisation Type</label>
                            <input
                              type="text"
                              value={org.organisationType}
                              onChange={(e) => updateOrganization(org.id, 'organisationType', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                              placeholder="e.g., Private Limited"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Legal Name</label>
                            <input
                              type="text"
                              value={org.legalName}
                              onChange={(e) => updateOrganization(org.id, 'legalName', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                              placeholder="Legal name as per registration"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trade Name</label>
                            <input
                              type="text"
                              value={org.tradeName}
                              onChange={(e) => updateOrganization(org.id, 'tradeName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Trading name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                              value={org.category || ''}
                              onChange={(e) => updateOrganization(org.id, 'category', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent bg-white"
                            >
                              <option value="">Select Category</option>
                              <option value="Individual">Individual</option>
                              <option value="Hindu undivided family">Hindu undivided family</option>
                              <option value="Partnership Firm">Partnership Firm</option>
                              <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                              <option value="Private Limited Company">Private Limited Company</option>
                              <option value="One Person Company">One Person Company</option>
                              <option value="Section 8 Company">Section 8 Company</option>
                              <option value="Society">Society</option>
                              <option value="Charitable Trust">Charitable Trust</option>
                              <option value="Government">Government</option>
                              <option value="Association of Persons">Association of Persons</option>
                              <option value="Body of Individuals">Body of Individuals</option>
                              <option value="Artificial Judicial Person">Artificial Judicial Person</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                            <input
                              type="text"
                              value={org.gstin}
                              onChange={(e) => updateOrganization(org.id, 'gstin', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent font-mono"
                              placeholder="GSTIN number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">TAN</label>
                            <input
                              type="text"
                              value={org.tan}
                              onChange={(e) => updateOrganization(org.id, 'tan', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent font-mono"
                              placeholder="TAN number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                            <input
                              type="text"
                              value={org.cin}
                              onChange={(e) => updateOrganization(org.id, 'cin', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent font-mono"
                              placeholder="CIN number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Incorporation Date</label>
                            <input
                              type="date"
                              value={org.incorporationDate}
                              onChange={(e) => updateOrganization(org.id, 'incorporationDate', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Registered Address</label>
                            <textarea
                              value={org.registeredAddress}
                              onChange={(e) => updateOrganization(org.id, 'registeredAddress', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent resize-y"
                              rows="3"
                              placeholder="Registered office address"
                            />
                          </div>
                        </div>

                        {/* Director/Partners Details Section */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-semibold text-gray-900">Director/Partners Details</h5>
                            <button
                              onClick={() => addDirectorPartner(org.id)}
                              className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                            >
                              <AiOutlinePlus className="w-4 h-4" />
                              Add Director/Partner
                            </button>
                          </div>

                          {/* Directors/Partners - Card Layout */}
                          {org.directorsPartners && org.directorsPartners.length > 0 && (
                            <div className="space-y-4 mb-4">
                              {org.directorsPartners.map((dp) => (
                                <div key={dp.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                      <input
                                        type="text"
                                        value={dp.name || ''}
                                        onChange={(e) => updateDirectorPartner(org.id, dp.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                        placeholder="Name"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">DIN/Number</label>
                                      <input
                                        type="text"
                                        value={dp.dinNumber || ''}
                                        onChange={(e) => updateDirectorPartner(org.id, dp.id, 'dinNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                        placeholder="DIN/Number"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
                                      <input
                                        type="text"
                                        value={dp.contact || ''}
                                        onChange={(e) => updateDirectorPartner(org.id, dp.id, 'contact', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                        placeholder="Contact"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                      <input
                                        type="email"
                                        value={dp.email || ''}
                                        onChange={(e) => updateDirectorPartner(org.id, dp.id, 'email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                        placeholder="Email"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Date of Addition</label>
                                      <input
                                        type="date"
                                        value={dp.dateOfAddition || ''}
                                        onChange={(e) => updateDirectorPartner(org.id, dp.id, 'dateOfAddition', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                      <select
                                        value={dp.status || 'Active'}
                                        onChange={(e) => updateDirectorPartner(org.id, dp.id, 'status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex justify-end pt-2 border-t border-gray-100">
                                    <button
                                      onClick={() => removeDirectorPartner(org.id, dp.id)}
                                      className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Empty State */}
                          {(!org.directorsPartners || org.directorsPartners.length === 0) && (
                            <div className="text-center py-4 text-gray-500 text-xs">
                              No directors/partners added yet.
                            </div>
                          )}
                        </div>

                        {/* Digital Signature Details Section */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-semibold text-gray-900">Digital Signature Details</h5>
                            <button
                              onClick={() => addDigitalSignature(org.id)}
                              className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                            >
                              <AiOutlinePlus className="w-4 h-4" />
                              Add Digital Signature
                            </button>
                          </div>

                          {/* Digital Signatures - Card Layout */}
                          {org.digitalSignatures && org.digitalSignatures.length > 0 && (
                            <div className="space-y-4 mb-4">
                              {org.digitalSignatures.map((ds) => (
                                <div key={ds.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                      <input
                                        type="text"
                                        value={ds.name || ''}
                                        onChange={(e) => updateDigitalSignature(org.id, ds.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                        placeholder="Name"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">DSC Number</label>
                                      <input
                                        type="text"
                                        value={ds.dscNumber || ''}
                                        onChange={(e) => updateDigitalSignature(org.id, ds.id, 'dscNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                        placeholder="DSC Number"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
                                      <input
                                        type="date"
                                        value={ds.expiryDate || ''}
                                        onChange={(e) => updateDigitalSignature(org.id, ds.id, 'expiryDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                      <select
                                        value={ds.status || 'Active'}
                                        onChange={(e) => updateDigitalSignature(org.id, ds.id, 'status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                      >
                                        <option value="Active">Active</option>
                                        <option value="In-active">In-active</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex justify-end pt-2 border-t border-gray-100">
                                    <button
                                      onClick={() => removeDigitalSignature(org.id, ds.id)}
                                      className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Empty State */}
                          {(!org.digitalSignatures || org.digitalSignatures.length === 0) && (
                            <div className="text-center py-4 text-gray-500 text-xs">
                              No digital signatures added yet.
                            </div>
                          )}
                        </div>

                        {/* Attachments Section (Admin Only) */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-4">Attachments</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Optional Attachment 1 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Optional Attachment 1</label>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const base64 = reader.result;
                                      updateOrganization(org.id, 'optionalAttachment1', base64);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                id={`optional-attachment-1-${org.id}`}
                              />
                              <label
                                htmlFor={`optional-attachment-1-${org.id}`}
                                className="cursor-pointer inline-block"
                              >
                                {org.optionalAttachment1 ? (
                                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                    <p className="text-xs text-gray-700">File uploaded</p>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        updateOrganization(org.id, 'optionalAttachment1', null);
                                      }}
                                      className="text-xs text-red-600 hover:text-red-800 mt-1"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <span className="px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block text-xs">
                                    Upload File
                                  </span>
                                )}
                              </label>
                            </div>

                            {/* Optional Attachment 2 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Optional Attachment 2</label>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const base64 = reader.result;
                                      updateOrganization(org.id, 'optionalAttachment2', base64);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                id={`optional-attachment-2-${org.id}`}
                              />
                              <label
                                htmlFor={`optional-attachment-2-${org.id}`}
                                className="cursor-pointer inline-block"
                              >
                                {org.optionalAttachment2 ? (
                                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                    <p className="text-xs text-gray-700">File uploaded</p>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        updateOrganization(org.id, 'optionalAttachment2', null);
                                      }}
                                      className="text-xs text-red-600 hover:text-red-800 mt-1"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <span className="px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block text-xs">
                                    Upload File
                                  </span>
                                )}
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Website Details Section */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-md font-semibold text-gray-900">Website Details</h5>
                            <button
                              onClick={() => addWebsiteToOrg(org.id)}
                              className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                            >
                              <AiOutlinePlus className="w-4 h-4" />
                              Add Website
                            </button>
                          </div>

                          {org.websites && org.websites.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse bg-white text-sm">
                                <thead>
                                  <tr className="bg-gray-100 border-b border-gray-300">
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">Type</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">URL</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">Login</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">Password</th>
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {org.websites.map((website) => (
                                    <tr key={website.id} className="bg-white border-b border-gray-200">
                                      <td className="px-3 py-2 border border-gray-300">
                                        <select
                                          value={website.type}
                                          onChange={(e) => updateWebsiteInOrg(org.id, website.id, 'type', e.target.value)}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        >
                                          <option value="">Select Type</option>
                                          <option value="Income Tax">Income Tax</option>
                                          <option value="GST">GST</option>
                                          <option value="Income Tax – TAN Based">Income Tax – TAN Based</option>
                                          <option value="Professional Tax">Professional Tax</option>
                                          <option value="Provident Fund">Provident Fund</option>
                                          <option value="ESIC">ESIC</option>
                                          <option value="MCA">MCA</option>
                                          <option value="Labour license">Labour license</option>
                                          <option value="TRACES">TRACES</option>
                                          <option value="ICEGATE">ICEGATE</option>
                                          <option value="Service Tax">Service Tax</option>
                                          <option value="VAT">VAT</option>
                                          <option value="Others 1">Others 1</option>
                                          <option value="Others 2">Others 2</option>
                                          <option value="Others 3">Others 3</option>
                                        </select>
                                      </td>
                                      <td className="px-3 py-2 border border-gray-300">
                                        <input
                                          type="text"
                                          value={website.url}
                                          onChange={(e) => updateWebsiteInOrg(org.id, website.id, 'url', e.target.value)}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          placeholder="Website URL"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border border-gray-300">
                                        <input
                                          type="text"
                                          value={website.login}
                                          onChange={(e) => updateWebsiteInOrg(org.id, website.id, 'login', e.target.value)}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          placeholder="Login ID"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border border-gray-300">
                                        <div className="relative">
                                          <input
                                            type={website.showPassword ? 'text' : 'password'}
                                            value={website.password}
                                            onChange={(e) => updateWebsiteInOrg(org.id, website.id, 'password', e.target.value)}
                                            className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                                            placeholder="Password"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => togglePasswordVisibilityInOrg(org.id, website.id)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                          >
                                            {website.showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                          </button>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 border border-gray-300">
                                        <button
                                          onClick={() => removeWebsiteFromOrg(org.id, website.id)}
                                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No websites added yet. Click "Add Website" to add one.</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addOrganization}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-[#01334C] hover:text-[#01334C] transition-colors flex items-center justify-center gap-2"
                    >
                      <AiOutlinePlus className="w-5 h-5" />
                      Add Another Organization
                    </button>
                    
                    {/* Save/Cancel Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                      <button
                        onClick={() => {
                          setIsEditingOrganisations(false);
                          fetchClientProfile(); // Reset to original data
                        }}
                        className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveOrganisations}
                        disabled={savingOrg}
                        className="px-6 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors text-sm font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
                      >
                        {savingOrg ? 'Saving...' : 'Save Organizations'}
                      </button>
                    </div>
                  </div>
                ) : clientProfile.user?.organisations && clientProfile.user.organisations.length > 0 ? (
                  <div className="space-y-4">
                    {/* Header with Add Button */}
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Organizations ({clientProfile.user.organisations.length})</h4>
                      <button
                        onClick={() => {
                          // Initialize organisations state from clientProfile if not already set
                          if (organisations.length === 0 && clientProfile.user?.organisations) {
                            const existingOrgs = clientProfile.user.organisations.map((org, idx) => {
                              let websites = [];
                              if (org.websites) {
                                try {
                                  websites = typeof org.websites === 'string' ? JSON.parse(org.websites) : org.websites;
                                } catch {
                                  websites = [];
                                }
                              }
                              
                              // Parse directors/partners details
                              let directorsPartners = [];
                              if (org.directors_partners_details) {
                                try {
                                  directorsPartners = typeof org.directors_partners_details === 'string' 
                                    ? JSON.parse(org.directors_partners_details) 
                                    : org.directors_partners_details;
                                  if (!Array.isArray(directorsPartners)) directorsPartners = [];
                                } catch {
                                  directorsPartners = [];
                                }
                              }
                              
                              // Parse digital signature details
                              let digitalSignatures = [];
                              if (org.digital_signature_details) {
                                try {
                                  digitalSignatures = typeof org.digital_signature_details === 'string' 
                                    ? JSON.parse(org.digital_signature_details) 
                                    : org.digital_signature_details;
                                  if (!Array.isArray(digitalSignatures)) digitalSignatures = [];
                                } catch {
                                  digitalSignatures = [];
                                }
                              }
                              
                              return {
                                id: org.id || idx + 1,
                                organisationType: org.organisation_type || '',
                                legalName: org.legal_name || '',
                                tradeName: org.trade_name || '',
                                category: org.category || '',
                                gstin: org.gstin || '',
                                incorporationDate: org.incorporation_date || '',
                                panFile: org.pan_file || null,
                                tan: org.tan || '',
                                cin: org.cin || '',
                                registeredAddress: org.registered_address || '',
                                directorsPartners: directorsPartners.map((dp, index) => ({
                                  id: dp.id || `dp-${Date.now()}-${index}`,
                                  name: dp.name || '',
                                  dinNumber: dp.din_number || '',
                                  contact: dp.contact || '',
                                  email: dp.email || '',
                                  dateOfAddition: dp.date_of_addition || '',
                                  status: dp.status || 'Active'
                                })),
                                digitalSignatures: digitalSignatures.map((ds, index) => ({
                                  id: ds.id || `ds-${Date.now()}-${index}`,
                                  name: ds.name || '',
                                  dscNumber: ds.dsc_number || '',
                                  expiryDate: ds.expiry_date || '',
                                  status: ds.status || 'Active'
                                })),
                                optionalAttachment1: org.optional_attachment_1 || null,
                                optionalAttachment2: org.optional_attachment_2 || null,
                                websites: websites
                              };
                            });
                            setOrganisations(existingOrgs);
                          }
                          setIsEditingOrganisations(true);
                        }}
                        className="px-5 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                      >
                        <AiOutlinePlus className="w-5 h-5" />
                        Add Organization
                      </button>
                    </div>
                    <div className="overflow-x-auto -mx-4 md:mx-0 table-responsive">
                      <div className="inline-block min-w-full align-middle px-4 md:px-0">
                        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                          <colgroup>
                            <col className="w-12" />
                            <col className="w-24" />
                            <col style={{ minWidth: '150px' }} />
                            <col style={{ minWidth: '120px' }} />
                            <col className="w-32" />
                            <col className="w-24" />
                            <col className="w-24" />
                            <col className="w-24" />
                          </colgroup>
                      <thead className="bg-[#01334C]">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">ID</th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">Type</th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">Legal Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">Trade Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">GSTIN</th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">TAN</th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">CIN</th>
                          <th className="px-4 py-3 text-left font-semibold text-white text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientProfile.user.organisations.map((org, idx) => (
                          <React.Fragment key={idx}>
                            <tr 
                              onClick={() => setExpandedOrgId(expandedOrgId === idx ? null : idx)}
                              className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${expandedOrgId === idx ? 'bg-gray-50' : 'bg-white'}`}
                            >
                              <td className="px-4 py-3 text-gray-700 font-semibold text-sm">{idx + 1}</td>
                              <td className="px-4 py-3 text-gray-700 text-sm truncate" title={org.organisation_type}>{org.organisation_type || 'N/A'}</td>
                              <td className="px-4 py-3 text-gray-700 font-medium text-sm truncate" title={org.legal_name}>{org.legal_name || 'N/A'}</td>
                              <td className="px-4 py-3 text-gray-600 text-sm truncate" title={org.trade_name}>{org.trade_name || 'N/A'}</td>
                              <td className="px-4 py-3 text-gray-600 text-sm font-mono truncate" title={org.gstin}>{org.gstin || 'N/A'}</td>
                              <td className="px-4 py-3 text-gray-600 text-sm font-mono truncate" title={org.tan}>{org.tan || 'N/A'}</td>
                              <td className="px-4 py-3 text-gray-600 text-sm font-mono truncate" title={org.cin}>{org.cin || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrganization(idx);
                                  }}
                                  disabled={savingOrg}
                                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium disabled:opacity-50 transition-colors shadow-sm hover:shadow"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                            {expandedOrgId === idx && (() => {
                              const isEditingThisOrg = editingOrgId === idx;
                              // Find or get organization from state
                              let orgInState = organisations[idx];
                              // If not found in state, try to match by id
                              if (!orgInState && org.id) {
                                orgInState = organisations.find(o => o.id === org.id);
                              }
                              // Parse websites from org
                              let orgWebsites = [];
                              if (isEditingThisOrg && orgInState?.websites) {
                                orgWebsites = orgInState.websites || [];
                              } else if (org.websites) {
                                try {
                                  orgWebsites = typeof org.websites === 'string' ? JSON.parse(org.websites) : org.websites;
                                } catch {
                                  orgWebsites = [];
                                }
                              }
                              
                              // Parse directors/partners and digital signatures for view mode
                              let orgDirectorsPartners = [];
                              let orgDigitalSignatures = [];
                              if (!isEditingThisOrg) {
                                if (org.directors_partners_details) {
                                  try {
                                    orgDirectorsPartners = typeof org.directors_partners_details === 'string' 
                                      ? JSON.parse(org.directors_partners_details) 
                                      : org.directors_partners_details;
                                    if (!Array.isArray(orgDirectorsPartners)) orgDirectorsPartners = [];
                                  } catch {
                                    orgDirectorsPartners = [];
                                  }
                                }
                                if (org.digital_signature_details) {
                                  try {
                                    orgDigitalSignatures = typeof org.digital_signature_details === 'string' 
                                      ? JSON.parse(org.digital_signature_details) 
                                      : org.digital_signature_details;
                                    if (!Array.isArray(orgDigitalSignatures)) orgDigitalSignatures = [];
                                  } catch {
                                    orgDigitalSignatures = [];
                                  }
                                }
                              }
                              
                              return (
                                <tr className="bg-white">
                                  <td colSpan="8" className="p-0">
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 mx-2 my-2">
                                      <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900">{isEditingThisOrg ? (orgInState?.legalName || 'Organization Details') : (org.legal_name || 'Organization Details')}</h4>
                                        {!isEditingThisOrg && !isEditingOrganisations && (
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              // Create org object to edit
                                              let orgWebsites = [];
                                              if (org.websites) {
                                                try {
                                                  orgWebsites = typeof org.websites === 'string' ? JSON.parse(org.websites) : org.websites;
                                } catch {
                                                  orgWebsites = [];
                                                }
                                              }
                                              
                                              // Parse directors/partners details
                                              let directorsPartners = [];
                                              if (org.directors_partners_details) {
                                                try {
                                                  directorsPartners = typeof org.directors_partners_details === 'string' 
                                                    ? JSON.parse(org.directors_partners_details) 
                                                    : org.directors_partners_details;
                                                  if (!Array.isArray(directorsPartners)) directorsPartners = [];
                                                } catch {
                                                  directorsPartners = [];
                                                }
                                              }
                                              
                                              // Parse digital signature details
                                              let digitalSignatures = [];
                                              if (org.digital_signature_details) {
                                                try {
                                                  digitalSignatures = typeof org.digital_signature_details === 'string' 
                                                    ? JSON.parse(org.digital_signature_details) 
                                                    : org.digital_signature_details;
                                                  if (!Array.isArray(digitalSignatures)) digitalSignatures = [];
                                                } catch {
                                                  digitalSignatures = [];
                                                }
                                              }
                                              
                                              const orgToEdit = {
                                                id: org.id || idx + 1,
                                                organisationType: org.organisation_type || '',
                                                legalName: org.legal_name || '',
                                                tradeName: org.trade_name || '',
                                                category: org.category || '',
                                                gstin: org.gstin || '',
                                                incorporationDate: org.incorporation_date || '',
                                                panFile: org.pan_file || null,
                                                tan: org.tan || '',
                                                cin: org.cin || '',
                                                registeredAddress: org.registered_address || '',
                                                directorsPartners: directorsPartners.map((dp, index) => ({
                                                  id: dp.id || `dp-${Date.now()}-${index}`,
                                                  name: dp.name || '',
                                                  dinNumber: dp.din_number || '',
                                                  contact: dp.contact || '',
                                                  email: dp.email || '',
                                                  dateOfAddition: dp.date_of_addition || '',
                                                  status: dp.status || 'Active'
                                                })),
                                                digitalSignatures: digitalSignatures.map((ds, index) => ({
                                                  id: ds.id || `ds-${Date.now()}-${index}`,
                                                  name: ds.name || '',
                                                  dscNumber: ds.dsc_number || '',
                                                  expiryDate: ds.expiry_date || '',
                                                  status: ds.status || 'Active'
                                                })),
                                                optionalAttachment1: org.optional_attachment_1 || null,
                                                optionalAttachment2: org.optional_attachment_2 || null,
                                                websites: orgWebsites.map((w, wIdx) => ({
                                                  id: w.id || Date.now() + wIdx,
                                                  type: w.type || '',
                                                  url: w.url || '',
                                                  login: w.login || '',
                                                  password: w.password || '',
                                                  showPassword: false
                                                }))
                                              };
                                              
                                              // Update organisations state - ensure array is long enough
                                              const updatedOrgs = [...organisations];
                                              while (updatedOrgs.length <= idx) {
                                                updatedOrgs.push({
                                                  id: Date.now() + updatedOrgs.length,
                                                  organisationType: '',
                                                  legalName: '',
                                                  tradeName: '',
                                                  category: '',
                                                  gstin: '',
                                                  incorporationDate: '',
                                                  panFile: null,
                                                  tan: '',
                                                  cin: '',
                                                registeredAddress: '',
                                                directorsPartners: [],
                                                digitalSignatures: [],
                                                optionalAttachment1: null,
                                                optionalAttachment2: null,
                                                websites: []
                                              });
                                              }
                                              updatedOrgs[idx] = orgToEdit;
                                              setOrganisations(updatedOrgs);
                                              setEditingOrgId(idx);
                                            }}
                                            className="px-5 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                          >
                                            Edit
                                          </button>
                                        )}
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                        {/* Column 1 */}
                                        <div className="space-y-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Type</label>
                                            {isEditingThisOrg ? (
                                              <input
                                                type="text"
                                                value={orgInState?.organisationType || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'organisationType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                              />
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.organisation_type || 'N/A'}</div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                                            {isEditingThisOrg ? (
                                              <input
                                                type="text"
                                                value={orgInState?.gstin || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'gstin', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                              />
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.gstin || 'N/A'}</div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">TAN</label>
                                            {isEditingThisOrg ? (
                                              <input
                                                type="text"
                                                value={orgInState?.tan || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'tan', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                              />
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.tan || 'N/A'}</div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Column 2 */}
                                        <div className="space-y-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                                            {isEditingThisOrg ? (
                                              <input
                                                type="text"
                                                value={orgInState?.legalName || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'legalName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                              />
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.legal_name || 'N/A'}</div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Incorporation Date</label>
                                            {isEditingThisOrg ? (
                                              <input
                                                type="date"
                                                value={orgInState?.incorporationDate || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'incorporationDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                              />
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {org.incorporation_date ? new Date(org.incorporation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'N/A'}
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                                            {isEditingThisOrg ? (
                                              <input
                                                type="text"
                                                value={orgInState?.cin || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'cin', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                              />
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.cin || 'N/A'}</div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Column 3 */}
                                        <div className="space-y-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Trade Name</label>
                                            {isEditingThisOrg ? (
                                              <input
                                                type="text"
                                                value={orgInState?.tradeName || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'tradeName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                              />
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.trade_name || 'N/A'}</div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            {isEditingThisOrg ? (
                                              <select
                                                value={orgInState?.category || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'category', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                              >
                                                <option value="">Select Category</option>
                                                <option value="Individual">Individual</option>
                                                <option value="Hindu undivided family">Hindu undivided family</option>
                                                <option value="Partnership Firm">Partnership Firm</option>
                                                <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                                                <option value="Private Limited Company">Private Limited Company</option>
                                                <option value="One Person Company">One Person Company</option>
                                                <option value="Section 8 Company">Section 8 Company</option>
                                                <option value="Society">Society</option>
                                                <option value="Charitable Trust">Charitable Trust</option>
                                                <option value="Government">Government</option>
                                                <option value="Association of Persons">Association of Persons</option>
                                                <option value="Body of Individuals">Body of Individuals</option>
                                                <option value="Artificial Judicial Person">Artificial Judicial Person</option>
                                              </select>
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.category || 'N/A'}</div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">PAN File</label>
                                            {isEditingThisOrg ? (
                                              <div className="flex items-center gap-1.5">
                                                <input
                                                  type="text"
                                                  readOnly
                                                  value={orgInState?.panFile ? 'File uploaded' : 'No file chosen'}
                                                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-md text-xs bg-gray-50 text-gray-500"
                                                />
                                                <label className="cursor-pointer flex-shrink-0">
                                                  <input
                                                    type="file"
                                                    onChange={async (e) => {
                                                      const file = e.target.files[0];
                                                      if (file) {
                                                        try {
                                                          // Validate file size (max 5MB)
                                                          if (file.size > 5 * 1024 * 1024) {
                                                            alert('File size must be less than 5MB');
                                                            e.target.value = '';
                                                            return;
                                                          }
                                                          
                                                          // Upload directly to S3
                                                          const folder = `user-profiles/${userId}/organizations/org-${orgInState.id || 'new'}`;
                                                          const { s3Url } = await uploadFileDirect(
                                                            file,
                                                            folder,
                                                            'pan-file'
                                                          );
                                                          
                                                          // Store S3 URL instead of base64
                                                          updateOrganization(orgInState.id, 'panFile', s3Url);
                                                        } catch (error) {
                                                          console.error('Error uploading PAN file:', error);
                                                          alert('Failed to upload file. Please try again.');
                                                          e.target.value = '';
                                                        }
                                                      }
                                                    }}
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                  />
                                                  <span className="px-2 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-xs whitespace-nowrap">
                                                    {orgInState?.panFile ? 'Change' : 'Upload'}
                                                  </span>
                                                </label>
                                              </div>
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                                {org.pan_file ? (
                                                  <button
                                                    onClick={() => handleViewFile(org.pan_file)}
                                                    className="text-blue-600 hover:underline"
                                                  >
                                                    View File
                                                  </button>
                                                ) : (
                                                  'Not uploaded'
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
                                            {isEditingThisOrg ? (
                                              <textarea
                                                rows={3}
                                                value={orgInState?.registeredAddress || ''}
                                                onChange={(e) => updateOrganization(orgInState.id, 'registeredAddress', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y"
                                              />
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.registered_address || 'N/A'}</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Director/Partners Details Section */}
                                      <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                          <h5 className="text-md font-semibold text-gray-900">Director/Partners Details</h5>
                                          {isEditingThisOrg && (
                                            <button
                                              onClick={() => addDirectorPartner(orgInState.id)}
                                              className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                                            >
                                              <AiOutlinePlus className="w-4 h-4" />
                                              Add Director/Partner
                                            </button>
                                          )}
                                        </div>

                                        {/* Directors/Partners - Card Layout */}
                                        {((isEditingThisOrg && orgInState?.directorsPartners) || (!isEditingThisOrg && orgDirectorsPartners)) && 
                                        (() => {
                                          const directorsList = isEditingThisOrg ? (orgInState?.directorsPartners || []) : (orgDirectorsPartners || []);
                                          return directorsList.length > 0;
                                        })() && (
                                          <div className="space-y-4 mb-4">
                                            {(() => {
                                              const list = isEditingThisOrg ? (orgInState?.directorsPartners || []) : (orgDirectorsPartners || []);
                                              return list;
                                            })().map((dp) => (
                                              <div key={dp.id || `dp-${Date.now()}`} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={dp.name || ''}
                                                        onChange={(e) => updateDirectorPartner(orgInState.id, dp.id, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                        placeholder="Name"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">{dp.name || 'N/A'}</div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">DIN/Number</label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={dp.dinNumber || ''}
                                                        onChange={(e) => updateDirectorPartner(orgInState.id, dp.id, 'dinNumber', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                        placeholder="DIN/Number"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">{dp.din_number || dp.dinNumber || 'N/A'}</div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={dp.contact || ''}
                                                        onChange={(e) => updateDirectorPartner(orgInState.id, dp.id, 'contact', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                        placeholder="Contact"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">{dp.contact || 'N/A'}</div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="email"
                                                        value={dp.email || ''}
                                                        onChange={(e) => updateDirectorPartner(orgInState.id, dp.id, 'email', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                        placeholder="Email"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">{dp.email || 'N/A'}</div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Date of Addition</label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="date"
                                                        value={dp.dateOfAddition || ''}
                                                        onChange={(e) => updateDirectorPartner(orgInState.id, dp.id, 'dateOfAddition', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                        {dp.date_of_addition ? formatDateOnly(dp.date_of_addition) : (dp.dateOfAddition ? formatDateOnly(dp.dateOfAddition) : 'N/A')}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                                    {isEditingThisOrg ? (
                                                      <select
                                                        value={dp.status || 'Active'}
                                                        onChange={(e) => updateDirectorPartner(orgInState.id, dp.id, 'status', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                      >
                                                        <option value="Active">Active</option>
                                                        <option value="Inactive">Inactive</option>
                                                      </select>
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">{dp.status || 'Active'}</div>
                                                    )}
                                                  </div>
                                                </div>
                                                {isEditingThisOrg && (
                                                  <div className="flex justify-end pt-2 border-t border-gray-100">
                                                    <button
                                                      onClick={() => removeDirectorPartner(orgInState.id, dp.id)}
                                                      className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                                                    >
                                                      Remove
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Empty State */}
                                        {((!isEditingThisOrg && (!orgDirectorsPartners || orgDirectorsPartners.length === 0)) || 
                                        (isEditingThisOrg && (!orgInState?.directorsPartners || orgInState.directorsPartners.length === 0))) && (
                                          <div className="text-center py-4 text-gray-500 text-xs">
                                            No directors/partners added yet.
                                          </div>
                                        )}
                                      </div>

                                      {/* Digital Signature Details Section */}
                                      <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                          <h5 className="text-md font-semibold text-gray-900">Digital Signature Details</h5>
                                          {isEditingThisOrg && (
                                            <button
                                              onClick={() => addDigitalSignature(orgInState.id)}
                                              className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                                            >
                                              <AiOutlinePlus className="w-4 h-4" />
                                              Add Digital Signature
                                            </button>
                                          )}
                                        </div>

                                        {/* Digital Signatures - Card Layout */}
                                        {(() => {
                                          const signaturesList = isEditingThisOrg ? (orgInState?.digitalSignatures || []) : (orgDigitalSignatures || []);
                                          return signaturesList.length > 0;
                                        })() && (
                                          <div className="space-y-4 mb-4">
                                            {(() => {
                                              return isEditingThisOrg ? (orgInState?.digitalSignatures || []) : (orgDigitalSignatures || []);
                                            })().map((ds) => (
                                              <div key={ds.id || `ds-${Date.now()}`} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={ds.name || ''}
                                                        onChange={(e) => updateDigitalSignature(orgInState.id, ds.id, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                        placeholder="Name"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">{ds.name || 'N/A'}</div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">DSC Number</label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="text"
                                                        value={ds.dscNumber || ''}
                                                        onChange={(e) => updateDigitalSignature(orgInState.id, ds.id, 'dscNumber', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                        placeholder="DSC Number"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">{ds.dsc_number || ds.dscNumber || 'N/A'}</div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
                                                    {isEditingThisOrg ? (
                                                      <input
                                                        type="date"
                                                        value={ds.expiryDate || ''}
                                                        onChange={(e) => updateDigitalSignature(orgInState.id, ds.id, 'expiryDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                      />
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                                        {ds.expiry_date ? formatDateOnly(ds.expiry_date) : (ds.expiryDate ? formatDateOnly(ds.expiryDate) : 'N/A')}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                                    {isEditingThisOrg ? (
                                                      <select
                                                        value={ds.status || 'Active'}
                                                        onChange={(e) => updateDigitalSignature(orgInState.id, ds.id, 'status', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                                                      >
                                                        <option value="Active">Active</option>
                                                        <option value="In-active">In-active</option>
                                                      </select>
                                                    ) : (
                                                      <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">{ds.status || 'Active'}</div>
                                                    )}
                                                  </div>
                                                </div>
                                                {isEditingThisOrg && (
                                                  <div className="flex justify-end pt-2 border-t border-gray-100">
                                                    <button
                                                      onClick={() => removeDigitalSignature(orgInState.id, ds.id)}
                                                      className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                                                    >
                                                      Remove
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Empty State */}
                                        {((!isEditingThisOrg && (!orgDigitalSignatures || orgDigitalSignatures.length === 0)) || 
                                        (isEditingThisOrg && (!orgInState?.digitalSignatures || orgInState.digitalSignatures.length === 0))) && (
                                          <div className="text-center py-4 text-gray-500 text-xs">
                                            No digital signatures added yet.
                                          </div>
                                        )}
                                      </div>

                                      {/* Attachments Section (Admin Only) */}
                                      <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h5 className="text-md font-semibold text-gray-900 mb-4">Attachments</h5>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* Optional Attachment 1 */}
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Optional Attachment 1</label>
                                            {isEditingThisOrg ? (
                                              <div>
                                                <input
                                                  type="file"
                                                  onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                      const reader = new FileReader();
                                                      reader.onloadend = () => {
                                                        const base64 = reader.result;
                                                        updateOrganization(orgInState.id, 'optionalAttachment1', base64);
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }
                                                  }}
                                                  className="hidden"
                                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                  id={`optional-attachment-1-view-${idx}`}
                                                />
                                                <label
                                                  htmlFor={`optional-attachment-1-view-${idx}`}
                                                  className="cursor-pointer inline-block"
                                                >
                                                  {orgInState?.optionalAttachment1 ? (
                                                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                                      <p className="text-xs text-gray-700">File uploaded</p>
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          updateOrganization(orgInState.id, 'optionalAttachment1', null);
                                                        }}
                                                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                                                      >
                                                        Remove
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <span className="px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block text-xs">
                                                      Upload File
                                                    </span>
                                                  )}
                                                </label>
                                              </div>
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                                {org.optional_attachment_1 ? (
                                                  <button
                                                    onClick={() => handleViewFile(org.optional_attachment_1)}
                                                    className="text-blue-600 hover:underline text-xs"
                                                  >
                                                    View File
                                                  </button>
                                                ) : (
                                                  <p className="text-gray-500 text-xs">No file uploaded</p>
                                                )}
                                              </div>
                                            )}
                                          </div>

                                          {/* Optional Attachment 2 */}
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Optional Attachment 2</label>
                                            {isEditingThisOrg ? (
                                              <div>
                                                <input
                                                  type="file"
                                                  onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                      const reader = new FileReader();
                                                      reader.onloadend = () => {
                                                        const base64 = reader.result;
                                                        updateOrganization(orgInState.id, 'optionalAttachment2', base64);
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }
                                                  }}
                                                  className="hidden"
                                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                  id={`optional-attachment-2-view-${idx}`}
                                                />
                                                <label
                                                  htmlFor={`optional-attachment-2-view-${idx}`}
                                                  className="cursor-pointer inline-block"
                                                >
                                                  {orgInState?.optionalAttachment2 ? (
                                                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                                      <p className="text-xs text-gray-700">File uploaded</p>
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          updateOrganization(orgInState.id, 'optionalAttachment2', null);
                                                        }}
                                                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                                                      >
                                                        Remove
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <span className="px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block text-xs">
                                                      Upload File
                                                    </span>
                                                  )}
                                                </label>
                                              </div>
                                            ) : (
                                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                                {org.optional_attachment_2 ? (
                                                  <button
                                                    onClick={() => handleViewFile(org.optional_attachment_2)}
                                                    className="text-blue-600 hover:underline text-xs"
                                                  >
                                                    View File
                                                  </button>
                                                ) : (
                                                  <p className="text-gray-500 text-xs">No file uploaded</p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Website Details Section */}
                                      <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                          <h5 className="text-md font-semibold text-gray-900">Website Details</h5>
                                          {isEditingThisOrg && (
                                            <button
                                              onClick={() => addWebsiteToOrg(orgInState.id)}
                                              className="px-3 py-1.5 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm inline-flex items-center gap-1"
                                            >
                                              <AiOutlinePlus className="w-4 h-4" />
                                              Add Website
                                            </button>
                                          )}
                                        </div>

                                        {orgWebsites && orgWebsites.length > 0 ? (
                                          <div className="overflow-x-auto">
                                            <table className="w-full border-collapse bg-white text-sm">
                                              <thead>
                                                <tr className="bg-gray-100 border-b border-gray-300">
                                                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">Type</th>
                                                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">URL</th>
                                                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">Login</th>
                                                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">Password</th>
                                                  {isEditingThisOrg && <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">Actions</th>}
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {(orgWebsites || []).map((website) => (
                                                  <tr key={website.id} className="bg-white border-b border-gray-200">
                                                    <td className="px-3 py-2 border border-gray-300">
                                                      {isEditingThisOrg ? (
                                                        <select
                                                          value={website.type}
                                                          onChange={(e) => updateWebsiteInOrg(orgInState.id, website.id, 'type', e.target.value)}
                                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        >
                                                          <option value="">Select Type</option>
                                                          <option value="Income Tax">Income Tax</option>
                                                          <option value="GST">GST</option>
                                                          <option value="Income Tax – TAN Based">Income Tax – TAN Based</option>
                                                          <option value="Professional Tax">Professional Tax</option>
                                                          <option value="Provident Fund">Provident Fund</option>
                                                          <option value="ESIC">ESIC</option>
                                                          <option value="MCA">MCA</option>
                                                          <option value="Labour license">Labour license</option>
                                                          <option value="TRACES">TRACES</option>
                                                          <option value="ICEGATE">ICEGATE</option>
                                                          <option value="Service Tax">Service Tax</option>
                                                          <option value="VAT">VAT</option>
                                                          <option value="Others 1">Others 1</option>
                                                          <option value="Others 2">Others 2</option>
                                                          <option value="Others 3">Others 3</option>
                                                        </select>
                                                      ) : (
                                                        website.type || 'N/A'
                                                      )}
                                                    </td>
                                                    <td className="px-3 py-2 border border-gray-300">
                                                      {isEditingThisOrg ? (
                                                        <input
                                                          type="text"
                                                          value={website.url}
                                                          onChange={(e) => updateWebsiteInOrg(orgInState.id, website.id, 'url', e.target.value)}
                                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        />
                                                      ) : (
                                                        website.url ? (
                                                          <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                            {website.url}
                                                          </a>
                                                        ) : (
                                                          'N/A'
                                                        )
                                                      )}
                                                    </td>
                                                    <td className="px-3 py-2 border border-gray-300">
                                                      {isEditingThisOrg ? (
                                                        <input
                                                          type="text"
                                                          value={website.login}
                                                          onChange={(e) => updateWebsiteInOrg(orgInState.id, website.id, 'login', e.target.value)}
                                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        />
                                                      ) : (
                                                        website.login || 'N/A'
                                                      )}
                                                    </td>
                                                    <td className="px-3 py-2 border border-gray-300">
                                                      {isEditingThisOrg ? (
                                                        <div className="relative">
                                                          <input
                                                            type={website.showPassword ? 'text' : 'password'}
                                                            value={website.password}
                                                            onChange={(e) => updateWebsiteInOrg(orgInState.id, website.id, 'password', e.target.value)}
                                                            className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                                                          />
                                                          <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibilityInOrg(orgInState.id, website.id)}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                          >
                                                            {website.showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        website.password ? '••••••••' : 'N/A'
                                                      )}
                                                    </td>
                                                    {isEditingThisOrg && (
                                                      <td className="px-3 py-2 border border-gray-300">
                                                        <button
                                                          onClick={() => removeWebsiteFromOrg(orgInState.id, website.id)}
                                                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                        >
                                                          Remove
                                                        </button>
                                                      </td>
                                                    )}
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <p className="text-gray-500 text-sm">No websites added yet.</p>
                                        )}

                                        {isEditingThisOrg && (
                                          <div className="mt-4 flex justify-end gap-2">
                                            <button
                                              onClick={() => {
                                                setEditingOrgId(null);
                                                fetchClientProfile();
                                              }}
                                              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={async () => {
                                                await handleSaveOrganisations();
                                              }}
                                              disabled={savingOrg}
                                              className="px-4 py-2 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm disabled:opacity-50"
                                            >
                                              {savingOrg ? 'Saving...' : 'Save Changes'}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })()}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No organisation details available</p>
                    <button
                      onClick={() => {
                        // Initialize with one empty organization
                        setOrganisations([{
                          id: Date.now(),
                          organisationType: '',
                          legalName: '',
                          tradeName: '',
                          category: '',
                          gstin: '',
                          incorporationDate: '',
                          panFile: null,
                          tan: '',
                          cin: '',
                          registeredAddress: '',
                          websites: []
                        }]);
                        setIsEditingOrganisations(true);
                      }}
                      className="px-5 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <AiOutlinePlus className="w-5 h-5" />
                      Add Organization
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Website Details section removed - Websites are now managed within each organization */}

          {/* Tasks */}
          <div className="bg-white rounded-xl border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012] overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'tasks' ? null : 'tasks')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
              <svg className={`w-5 h-5 transition-transform ${expandedSection === 'tasks' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'tasks' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Admin Tasks - Left Side */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Admin Tasks (Editable)</h4>
                      <button
                        onClick={() => setIsAddingAdminTask(true)}
                        className="flex items-center gap-1 px-2 py-1 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>

                    {/* Add Admin Task Form */}
                    {isAddingAdminTask && (
                      <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">New Admin Task</h4>
                        
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={currentAdminTask.date}
                            onChange={(e) => setCurrentAdminTask({ ...currentAdminTask, date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={currentAdminTask.title}
                            onChange={(e) => setCurrentAdminTask({ ...currentAdminTask, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Enter task title"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={currentAdminTask.type}
                            onChange={(e) => setCurrentAdminTask({ ...currentAdminTask, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">Select type</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={currentAdminTask.description}
                            onChange={(e) => setCurrentAdminTask({ ...currentAdminTask, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Enter task description"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={addAdminTask}
                            disabled={savingTasks}
                            className="flex-1 px-3 py-2 bg-[#00486D] text-white rounded-md text-sm"
                          >
                            {savingTasks ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingAdminTask(false);
                              setCurrentAdminTask({ date: '', title: '', description: '', type: '' });
                            }}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Admin Tasks Table */}
                    {adminTasksList.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                            <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Date</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Title</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Type</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                          {adminTasksList.map((task, idx) => (
                            <React.Fragment key={task.id || idx}>
                              <tr 
                                onClick={() => setExpandedAdminTaskId(expandedAdminTaskId === idx ? null : idx)}
                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                              >
                                <td className="px-2 py-2 text-gray-600 text-xs">{task.date ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'N/A'}</td>
                                <td className="px-2 py-2 text-gray-600 truncate text-xs">{task.title || 'N/A'}</td>
                                <td className="px-2 py-2 text-gray-600 text-xs">
                                  {task.type ? (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      task.type === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                      task.type === 'completed' ? 'bg-green-100 text-green-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                                    </span>
                                  ) : 'N/A'}
                                </td>
                                <td className="px-2 py-2 text-gray-600 truncate text-xs">{task.description || 'N/A'}</td>
                          </tr>
                              {expandedAdminTaskId === idx && (
                                <tr className="bg-gray-50">
                                  <td colSpan="4" className="px-3 py-3">
                                    <div className="space-y-2 text-xs">
                                      <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{task.date ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'N/A'}</span></div>
                                      <div><span className="font-medium text-gray-700">Title:</span> <span className="text-gray-600">{task.title || 'N/A'}</span></div>
                                      <div><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-600">{task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1) : 'N/A'}</span></div>
                                      <div><span className="font-medium text-gray-700">Description:</span><p className="text-gray-600 mt-1 whitespace-pre-wrap">{task.description || 'No description'}</p></div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    ) : (
                      <p className="text-gray-600 text-center py-4 text-xs">No admin tasks added yet</p>
                    )}
                  </div>

                  {/* User Tasks - Right Side */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">User Tasks (Read Only)</h4>
                    </div>

                    {/* User Tasks Table */}
                    {userTasksList.length > 0 ? (
                      <div className="overflow-x-auto table-responsive">
                        <table className="w-full text-sm min-w-[500px]">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Date</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Title</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Type</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userTasksList.map((task, idx) => (
                            <React.Fragment key={task.id || idx}>
                              <tr 
                                onClick={() => setExpandedUserTaskId(expandedUserTaskId === idx ? null : idx)}
                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                              >
                                <td className="px-2 py-2 text-gray-600 text-xs">{task.date ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'N/A'}</td>
                                <td className="px-2 py-2 text-gray-600 truncate text-xs">{task.title || 'N/A'}</td>
                                <td className="px-2 py-2 text-gray-600 text-xs">
                                  {task.type ? (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      task.type === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                      task.type === 'completed' ? 'bg-green-100 text-green-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                                    </span>
                                  ) : 'N/A'}
                                </td>
                                <td className="px-2 py-2 text-gray-600 truncate text-xs">{task.description || 'N/A'}</td>
                              </tr>
                              {expandedUserTaskId === idx && (
                                <tr className="bg-gray-50">
                                  <td colSpan="4" className="px-3 py-3">
                                    <div className="space-y-2 text-xs">
                                      <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{task.date ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'N/A'}</span></div>
                                      <div><span className="font-medium text-gray-700">Title:</span> <span className="text-gray-600">{task.title || 'N/A'}</span></div>
                                      <div><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-600">{task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1) : 'N/A'}</span></div>
                                      <div><span className="font-medium text-gray-700">Description:</span><p className="text-gray-600 mt-1 whitespace-pre-wrap">{task.description || 'No description'}</p></div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4 text-xs">No user tasks added yet</p>
                    )}
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleSaveTasks}
                    disabled={savingTasks}
                    className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingTasks ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012] overflow-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setExpandedSection(expandedSection === 'notes' ? null : 'notes');
              }}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              <svg className={`w-5 h-5 transition-transform ${expandedSection === 'notes' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedSection === 'notes' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Notes - Left Side */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Admin Notes (Editable)</h4>
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="flex items-center gap-1 px-2 py-1 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
              {/* Add/Edit Note Form */}
              {isAddingNote && (
                <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{editingNoteIndex !== null ? 'Edit Note' : 'New Note'}</h4>
                  
                  {/* Date */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={currentNote.date}
                      onChange={(e) => setCurrentNote({ ...currentNote, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Client Action Items</label>
                      {(currentNote.clientActionItems || ['']).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...currentNote.clientActionItems];
                              updated[idx] = e.target.value;
                              setCurrentNote({ ...currentNote, clientActionItems: updated });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Add client action item"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCurrentNote({ ...currentNote, clientActionItems: [...(currentNote.clientActionItems || []), ''] })}
                        className="mt-1 text-xs text-[#00486D] hover:underline"
                      >
                        + Add client action item
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Admin Action Items</label>
                      {(currentNote.adminActionItems || ['']).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...currentNote.adminActionItems];
                              updated[idx] = e.target.value;
                              setCurrentNote({ ...currentNote, adminActionItems: updated });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Add admin action item"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCurrentNote({ ...currentNote, adminActionItems: [...(currentNote.adminActionItems || []), ''] })}
                        className="mt-1 text-xs text-[#00486D] hover:underline"
                      >
                        + Add admin action item
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={currentNote.description}
                        onChange={(e) => setCurrentNote({ ...currentNote, description: e.target.value })}
                        placeholder="Enter note description..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Attachments</label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-[#00486D] cursor-pointer">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-xs">Upload</span>
                      <input type="file" multiple onChange={handleNoteFileUpload} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                    </label>
                    {currentNote.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {currentNote.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white px-2 py-1 rounded border text-xs">
                            <span className="truncate">{file.name}</span>
                            <button onClick={() => removeNoteAttachment(idx)} className="text-red-500 ml-2">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={handleSaveAdminNote} disabled={savingNotes} className="flex-1 px-3 py-2 bg-[#00486D] text-white rounded-md text-sm">
                      {savingNotes ? 'Saving...' : (editingNoteIndex !== null ? 'Update' : 'Save')}
                    </button>
                    <button onClick={() => { setIsAddingNote(false); setEditingNoteIndex(null); setCurrentNote({ date: '', description: '', attachments: [] }); }} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Notes Table */}
              {adminNotesList.length > 0 ? (
                <div className="overflow-x-auto table-responsive">
                  <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Attachments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminNotesList.map((note, idx) => (
                      <React.Fragment key={note.id || idx}>
                        <tr 
                          onClick={() => setExpandedAdminNoteId(expandedAdminNoteId === idx ? null : idx)}
                          className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                        >
                          <td className="px-2 py-2 text-gray-600 text-xs">{note.date || 'N/A'}</td>
                          <td className="px-2 py-2 text-gray-600 truncate text-xs">{note.description || 'N/A'}</td>
                          <td className="px-2 py-2 text-gray-600 text-xs">{note.attachments?.length || 0}</td>
                        </tr>
                        {expandedAdminNoteId === idx && (
                          <tr className="bg-gray-50">
                            <td colSpan="3" className="px-3 py-3">
                              <div className="flex justify-between">
                                <div className="space-y-2 text-xs flex-1">
                                  <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{note.date || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-700">Description:</span><p className="text-gray-600 mt-1">{note.description}</p></div>
                                  {note.clientActionItems && note.clientActionItems.length > 0 && (
                                    <div>
                                      <span className="font-medium text-gray-700">Client Action Items:</span>
                                      <ul className="list-disc list-inside text-gray-600 text-xs mt-1 space-y-1">
                                        {note.clientActionItems.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {note.adminActionItems && note.adminActionItems.length > 0 && (
                                    <div>
                                      <span className="font-medium text-gray-700">Admin Action Items:</span>
                                      <ul className="list-disc list-inside text-gray-600 text-xs mt-1 space-y-1">
                                        {note.adminActionItems.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {note.attachments && note.attachments.length > 0 && (
                                    <div>
                                      <span className="font-medium text-gray-700">Attachments:</span>
                                      <div className="mt-1 space-y-1">
                                        {note.attachments.map((file, fileIdx) => (
                                          <div key={fileIdx} className="flex items-center gap-1">
                                            {(file.url || file.data) ? (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  const fileUrl = file.url || file.data;
                                                  console.log('📎 Opening file:', file.name);
                                                  console.log('📎 File type:', file.type);
                                                  console.log('📎 Has URL:', !!file.url);
                                                  console.log('📎 Has Data:', !!file.data);
                                                  
                                                  if (fileUrl) {
                                                    // For base64 data, create a downloadable link
                                                    if (fileUrl.startsWith('data:')) {
                                                      console.log('📎 Opening base64 file...');
                                                      const link = document.createElement('a');
                                                      link.href = fileUrl;
                                                      link.download = file.name;
                                                      link.target = '_blank';
                                                      document.body.appendChild(link);
                                                      link.click();
                                                      document.body.removeChild(link);
                                                    } else {
                                                      console.log('📎 Opening S3 URL...');
                                                      window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                                    }
                                                  } else {
                                                    console.error('❌ No file URL or data found');
                                                  }
                                                }}
                                                className="text-blue-600 hover:underline text-left bg-transparent border-none p-0 cursor-pointer flex items-center gap-1"
                                              >
                                                📎 <span className="underline">{file.name}</span>
                                              </button>
                                            ) : (
                                              <span className="text-gray-600">📎 {file.name}</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2 ml-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditNote(note, idx);
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs whitespace-nowrap"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNote(idx);
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs whitespace-nowrap"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4 text-xs">No admin notes</p>
              )}
                </div>

                {/* User Notes - Right Side (Read Only) */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">User Notes (Read Only)</h4>
                  
                  {userNotesList.length > 0 ? (
                    <div className="overflow-x-auto table-responsive">
                      <table className="w-full text-sm min-w-[500px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Date</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Description</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Files</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userNotesList.map((note, idx) => (
                          <React.Fragment key={note.id || idx}>
                            <tr 
                              onClick={() => setExpandedUserNoteId(expandedUserNoteId === idx ? null : idx)}
                              className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                            >
                              <td className="px-2 py-2 text-gray-600 text-xs">{note.date || 'N/A'}</td>
                              <td className="px-2 py-2 text-gray-600 truncate text-xs">{note.description || 'N/A'}</td>
                              <td className="px-2 py-2 text-gray-600 text-xs">{note.attachments?.length || 0}</td>
                            </tr>
                            {expandedUserNoteId === idx && (
                              <tr className="bg-gray-50">
                                <td colSpan="3" className="px-3 py-3">
                                  <div className="space-y-2 text-xs">
                                    <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{note.date || 'N/A'}</span></div>
                                    <div><span className="font-medium text-gray-700">Description:</span><p className="text-gray-600 mt-1">{note.description}</p></div>
                                    {note.attachments && note.attachments.length > 0 && (
                                      <div>
                                        <span className="font-medium text-gray-700">Attachments:</span>
                                        <div className="mt-1 space-y-1">
                                          {note.attachments.map((file, fileIdx) => (
                                            <div key={fileIdx} className="flex items-center gap-1">
                                              {(file.url || file.data) ? (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const fileUrl = file.url || file.data;
                                                    console.log('📎 Opening user file:', file.name);
                                                    console.log('📎 File type:', file.type);
                                                    
                                                    if (fileUrl) {
                                                      if (fileUrl.startsWith('data:')) {
                                                        console.log('📎 Downloading base64 file...');
                                                        const link = document.createElement('a');
                                                        link.href = fileUrl;
                                                        link.download = file.name;
                                                        link.target = '_blank';
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                      } else {
                                                        console.log('📎 Opening S3 URL...');
                                                        window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                                      }
                                                    }
                                                  }}
                                                  className="text-blue-600 hover:underline text-left bg-transparent border-none p-0 cursor-pointer flex items-center gap-1"
                                                >
                                                  📎 <span className="underline">{file.name}</span>
                                                </button>
                                              ) : (
                                                <span className="text-gray-600">📎 {file.name}</span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4 text-xs">No user notes</p>
                  )}
                </div>
              </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {allRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
              <p className="text-gray-600">No registrations found for this client.</p>
            </div>
          ) : (
            allRegistrations.map((registration, index) => (
              <div key={registration.ticket_id} className="bg-white rounded-xl border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
                {/* Top Section - Light Blue Background - Clickable */}
                <div 
                  onClick={() => setIsServiceCardExpanded(isServiceCardExpanded === index ? null : index)}
                  className="bg-blue-50 p-6 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-blue-100 transition-colors rounded-t-xl"
                >
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[#01334C] text-white flex items-center justify-center font-semibold text-lg">
                  {registration.business_name ? registration.business_name.charAt(0).toUpperCase() : 
                   registration.ticket_id?.startsWith('PVT_') ? 'P' : 
                   registration.ticket_id?.startsWith('SI_') ? 'S' : 
                   registration.ticket_id?.startsWith('PROP_') ? 'Pr' :
                   registration.ticket_id?.startsWith('GST_') ? 'G' : 'R'}
                </div>
                
                {/* Service & business name */}
                <div className="flex-1">
                  {/* Primary: Service name (e.g. Private Limited, Proprietorship) */}
                  <h2 className="text-xl font-semibold text-gray-900">
                    {(() => {
                      // Determine registration type by ticket_id prefix first
                      const tid = registration.ticket_id || '';
                      if (tid.startsWith('GST_')) return 'GST Registration';
                      if (tid.startsWith('SI_')) return 'Startup India';
                      if (tid.startsWith('PROP_')) return 'Proprietorship';
                      if (tid.startsWith('PVT_')) return 'Private Limited';
                      if (tid.startsWith('OPC_')) return 'OPC Registration';
                      if (tid.startsWith('LLP_')) return 'LLP Registration';
                      
                      // Fallback: Check package/business name to determine type
                      const packageName = (registration.package_name || '').toLowerCase();
                      const businessName = (registration.business_name || '').toLowerCase();
                      
                      if (packageName.includes('opc') || businessName.includes('opc')) return 'OPC Registration';
                      if (packageName.includes('llp') || businessName.includes('llp')) return 'LLP Registration';
                      if (packageName.includes('gst') || businessName.includes('gst')) return 'GST Registration';
                      if (packageName.includes('startup') || businessName.includes('startup')) return 'Startup India';
                      if (packageName.includes('proprietorship') || businessName.includes('proprietorship')) return 'Proprietorship';
                      if (packageName.includes('private limited') || businessName.includes('private limited')) return 'Private Limited';
                      
                      return registration.package_name || 'Registration';
                    })()}
                  </h2>
                  {/* Secondary: Business name (if any) */}
                  <p className="text-xs text-gray-500 mt-1">
                    {registration.business_name || (registration.ticket_id ? `Ticket: ${registration.ticket_id}` : 'No business name')}
                  </p>
                </div>

                {/* Service Status Dropdown */}
                <div className="relative">
                  {(() => {
                    const serviceStatusOptions = [
                      'Payment pending',
                      'Payment completed',
                      'Data received',
                      'WIP',
                      'Awaiting confirmation from the Govt',
                      'Data Pending from Client',
                      'Completed',
                      'Technical Issue'
                    ];
                    
                    const currentStatus = registration.service_status || 'Payment pending';
                    
                    const getStatusBadgeColor = (status) => {
                      const statusLower = (status || '').toLowerCase();
                      if (statusLower === 'completed' || statusLower === 'payment completed') return 'bg-green-100 text-green-800';
                      if (statusLower === 'wip' || statusLower === 'data received' || statusLower === 'awaiting confirmation from the govt' || statusLower === 'data pending from client') return 'bg-blue-100 text-blue-800';
                      if (statusLower === 'payment pending' || statusLower === 'technical issue') return 'bg-yellow-100 text-yellow-800';
                      return 'bg-gray-100 text-gray-800';
                    };
                    
                    return (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsStatusDropdownOpen(isStatusDropdownOpen === index ? null : index);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(currentStatus)}`}
                        >
                          <span>{currentStatus}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isStatusDropdownOpen === index && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                            {serviceStatusOptions.map((option, optIndex) => (
                              <button
                                key={option}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateServiceStatus(option, registration.ticket_id);
                                  setIsStatusDropdownOpen(null);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                  optIndex === 0 ? 'rounded-t-lg' : ''
                                } ${
                                  optIndex === serviceStatusOptions.length - 1 ? 'rounded-b-lg' : ''
                                } ${
                                  currentStatus === option ? 'bg-blue-50 font-semibold' : ''
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${
                                  option === 'Completed' || option === 'Payment completed' ? 'bg-green-600' :
                                  option === 'WIP' || option === 'Data received' || option === 'Awaiting confirmation from the Govt' || option === 'Data Pending from Client' ? 'bg-blue-600' :
                                  'bg-yellow-600'
                                }`}></span>
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Chevron Icon */}
              <svg className={`w-5 h-5 text-gray-600 transition-transform ml-4 ${isServiceCardExpanded === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Bottom Section - White Background - Expandable */}
            {isServiceCardExpanded === index && (
              <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Ticket ID */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">Ticket ID:</span>
                    <p className="text-gray-900 mt-1">{registration.ticket_id}</p>
                  </div>

                  {/* Package */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">Package:</span>
                    <p className="text-gray-900 mt-1">
                      {registration.package_name} - <span className="text-green-600 font-semibold">₹{registration.package_price?.toLocaleString('en-IN')}</span>
                    </p>
                  </div>

                  {/* Payment Date */}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Payment Date:</span>
                    <p className="text-gray-900 mt-1">{formatDate(registration.created_at)}</p>
                  </div>

                  {/* Business Name */}
                  {registration.business_name && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-700">Business Name:</span>
                      <p className="text-gray-900 mt-1">{registration.business_name}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={async () => {
                      // Determine registration type
                      const ticketId = registration.ticket_id;
                      const packageName = (registration.package_name || '').toLowerCase();
                      const packagePrice = registration.package_price;
                      
                      // Check ticket_id prefix first
                      if (ticketId?.startsWith('GST_')) {
                        navigate(`/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`);
                      } else if (ticketId?.startsWith('SI_')) {
                        navigate(`/admin/startup-india-form?ticketId=${ticketId}&admin=true&clientId=${userId}`);
                      } else if (ticketId?.startsWith('PROP_')) {
                        navigate(`/admin/proprietorship-form?ticketId=${ticketId}&admin=true&clientId=${userId}`);
                      } else if (ticketId?.startsWith('PVT_')) {
                        // Check if this is actually a GST registration with wrong prefix
                        // GST packages: Starter (₹2,599), Growth (₹5,599), Pro (₹12,999)
                        if (packageName.includes('gst') || 
                            packagePrice === 2599 || packagePrice === 5599 || packagePrice === 12999) {
                          // This is likely a GST registration with wrong ticketId prefix
                          // Try to find the correct GST ticketId by checking GST registrations
                          try {
                            const gstResponse = await apiClient.get(`/gst/user-registrations/${userId}`);
                            if (gstResponse.success && gstResponse.data) {
                              const gstRegs = Array.isArray(gstResponse.data) ? gstResponse.data : (gstResponse.data?.data || []);
                              // Find GST registration with matching package price
                              const matchingGST = gstRegs.find(reg => 
                                reg.package_price === packagePrice || 
                                (reg.package_name && reg.package_name.toLowerCase().includes('gst'))
                              );
                              if (matchingGST && matchingGST.ticket_id?.startsWith('GST_')) {
                                // Use the correct GST ticketId
                                navigate(`/admin/gst-form?ticketId=${matchingGST.ticket_id}&admin=true&clientId=${userId}`);
                                return;
                              }
                            }
                          } catch (err) {
                            console.error('Error fetching GST registrations:', err);
                          }
                          // If no matching GST found, still try to navigate to GST form with the current ticketId
                          // The form will handle it or show an error
                          navigate(`/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`);
                        } else {
                          navigate(`/admin/client-details/${ticketId}`);
                        }
                      } else {
                        // Fallback: Check package details to determine type
                        if (packageName.includes('gst') || 
                            packagePrice === 2599 || packagePrice === 5599 || packagePrice === 12999) {
                          navigate(`/admin/gst-form?ticketId=${ticketId}&admin=true&clientId=${userId}`);
                        } else {
                          navigate(`/admin/client-details/${ticketId}`);
                        }
                      }
                    }}
                    className="px-4 py-2 text-sm bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors whitespace-nowrap"
                  >
                    {(registration.ticket_id?.startsWith('SI_') || registration.ticket_id?.startsWith('PROP_') || registration.ticket_id?.startsWith('GST_')) && (registration.status === 'draft' || registration.status === 'incomplete') ? 'Fill Form' : 'View Details'}
                  </button>
                </div>
              </div>
              </div>
            )}
          </div>
            ))
          )}
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-xl p-8 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance</h2>
          <p className="text-gray-600">Compliance information will be displayed here.</p>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-xl p-8 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012] space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscriptions</h2>
          {(() => {
            // Paid services only
            const paidServices = allRegistrations.filter((r) => {
              const status = (r.payment_status || '').toLowerCase();
              const serviceStatus = (r.service_status || '').toLowerCase();
              const hasPaymentId =
                (r.razorpay_payment_id && String(r.razorpay_payment_id).trim() !== '') ||
                (r.payment_id && String(r.payment_id).trim() !== '');
              return status === 'paid' || serviceStatus === 'payment completed' || hasPaymentId;
            });

            const getServiceName = (registration) => {
              const tid = registration.ticket_id || '';
              if (tid.startsWith('GST_')) return 'GST Registration';
              if (tid.startsWith('SI_')) return 'Startup India';
              if (tid.startsWith('PROP_')) return 'Proprietorship';
              if (tid.startsWith('PVT_')) return 'Private Limited';
              if (tid.startsWith('OPC_')) return 'OPC Registration';
              if (tid.startsWith('LLP_')) return 'LLP Registration';

              const packageName = (registration.package_name || '').toLowerCase();
              const businessName = (registration.business_name || '').toLowerCase();

              if (packageName.includes('opc') || businessName.includes('opc')) return 'OPC Registration';
              if (packageName.includes('llp') || businessName.includes('llp')) return 'LLP Registration';
              if (packageName.includes('gst') || businessName.includes('gst')) return 'GST Registration';
              if (packageName.includes('startup') || businessName.includes('startup')) return 'Startup India';
              if (packageName.includes('proprietorship') || businessName.includes('proprietorship')) return 'Proprietorship';
              if (packageName.includes('private limited') || businessName.includes('private limited')) return 'Private Limited';

              return registration.package_name || 'Registration';
            };

            if (paidServices.length === 0) {
              return <p className="text-gray-600">No paid services found for this client.</p>;
            }

            return (
              <div className="space-y-3">
                {paidServices.map((registration) => (
                  <div key={registration.ticket_id || registration.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{registration.business_name || `Ticket: ${registration.ticket_id}`}</p>
                      <h3 className="text-lg font-semibold text-gray-900">{getServiceName(registration)}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {registration.updated_at || registration.created_at
                          ? new Date(registration.updated_at || registration.created_at || registration.createdAt || '').toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              timeZone: 'Asia/Kolkata'
                            })
                          : 'Date not available'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {registration.service_status || 'Payment completed'}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Floating Notepad Button - Admin Only */}
      {activeTab === 'profile' && (
        <>
          <button
            onClick={() => setShowNotepad(!showNotepad)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#00486D] text-white rounded-full shadow-lg hover:bg-[#01334C] transition-all duration-300 flex items-center justify-center z-[9998] hover:scale-110"
            title="Quick Notes"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Notepad Modal */}
          {showNotepad && (
            <div className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden max-h-[calc(100vh-150px)] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#00486D] to-[#01334C] px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 className="text-white font-semibold">Client Persona</h3>
                </div>
                <button
                  onClick={() => setShowNotepad(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="p-4 overflow-y-auto flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Personality & Preferences
                    <span className="ml-2 text-xs text-gray-500">(Private - Not visible to client)</span>
                  </label>
                  
                  {/* Add New Entry Button */}
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Persona Entries</h4>
                    <button
                      onClick={() => setIsAddingPersona(true)}
                      className="flex items-center gap-1 px-2 py-1 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Entry
                    </button>
                  </div>

                  {/* Add Entry Form */}
                  {isAddingPersona && (
                    <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">New Persona Entry</h4>
                      
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={currentPersona.date}
                          onChange={(e) => setCurrentPersona({ ...currentPersona, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                          value={currentPersona.description}
                          onChange={(e) => setCurrentPersona({ ...currentPersona, description: e.target.value })}
                    placeholder="Describe client's personality, preferences, communication style, etc..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                      <div className="flex gap-2">
                        <button
                          onClick={addPersonaEntry}
                          className="flex-1 px-3 py-2 bg-[#00486D] text-white rounded-md text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingPersona(false);
                            setCurrentPersona({ date: '', description: '' });
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Persona Entries Table */}
                  {clientPersonaList.length > 0 ? (
                    <div className="overflow-x-auto table-responsive">
                      <table className="w-full text-sm min-w-[500px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Date</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Description</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...clientPersonaList].sort((a, b) => {
                          const dateA = a.date ? new Date(a.date) : new Date(0);
                          const dateB = b.date ? new Date(b.date) : new Date(0);
                          return dateB - dateA; // Newest first
                        }).map((entry, idx) => {
                          const originalIdx = clientPersonaList.findIndex(e => (e.id || clientPersonaList.indexOf(e)) === (entry.id || clientPersonaList.indexOf(entry)));
                          return (
                          <React.Fragment key={entry.id || idx}>
                            <tr 
                              onClick={() => setExpandedPersonaId(expandedPersonaId === originalIdx ? null : originalIdx)}
                              className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                            >
                              <td className="px-2 py-2 text-gray-600 text-xs">
                                {entry.date ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'N/A'}
                              </td>
                              <td className="px-2 py-2 text-gray-600 truncate text-xs">{entry.description || 'N/A'}</td>
                              <td className="px-2 py-2 text-gray-600 text-xs">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePersonaEntry(originalIdx);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                            {expandedPersonaId === originalIdx && (
                              <tr className="bg-gray-50">
                                <td colSpan="3" className="px-3 py-3">
                                  <div className="space-y-2 text-xs">
                                    <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{entry.date ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'N/A'}</span></div>
                                    <div><span className="font-medium text-gray-700">Description:</span><p className="text-gray-600 mt-1 whitespace-pre-wrap">{entry.description || 'No description'}</p></div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4 text-xs">No persona entries added yet. Click "Add Entry" to add one.</p>
                  )}
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveClientPersona}
                    disabled={savingNotes}
                    className="flex-1 px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {savingNotes ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Persona'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      fetchClientPersona();
                      setShowNotepad(false);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminClientOverview;