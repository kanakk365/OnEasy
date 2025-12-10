import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../../utils/api';
import { updateUserDataByUserId } from '../../../utils/usersPageApi';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function AdminClientOverview() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [isAddingUserTask, setIsAddingUserTask] = useState(false);
  const [editingAdminTaskIndex, setEditingAdminTaskIndex] = useState(null);
  const [editingUserTaskIndex, setEditingUserTaskIndex] = useState(null);
  const [currentAdminTask, setCurrentAdminTask] = useState({ date: '', title: '', description: '', type: '' });
  const [currentUserTask, setCurrentUserTask] = useState({ date: '', title: '', description: '', type: '' });
  const [savingTasks, setSavingTasks] = useState(false);
  const [isServiceCardExpanded, setIsServiceCardExpanded] = useState(null); // Track which card index is expanded
  const [serviceStatus, setServiceStatus] = useState('registered');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(null); // Track which card's dropdown is open (by index)
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [isEditingOrganisations, setIsEditingOrganisations] = useState(false);
  const [isEditingWebsites, setIsEditingWebsites] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingWebsites, setSavingWebsites] = useState(false);

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
    const handleClickOutside = (event) => {
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
              } catch (e) {
                websites = [];
              }
            }
            
            return {
              id: org.id || idx + 1,
              organisationType: org.organisation_type || '',
              legalName: org.legal_name || '',
              tradeName: org.trade_name || '',
              gstin: org.gstin || '',
              incorporationDate: org.incorporation_date || '',
              panFile: org.pan_file || null,
              tan: org.tan || '',
              cin: org.cin || '',
              registeredAddress: org.registered_address || '',
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
            gstin: '',
            incorporationDate: '',
            panFile: null,
            tan: '',
            cin: '',
            registeredAddress: '',
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
      
      // Fetch private limited, proprietorship, startup india, and GST registrations
      const [privateLimitedResponse, proprietorshipResponse, startupIndiaResponse, gstResponse] = await Promise.all([
        apiClient.get(`/private-limited/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/proprietorship/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/startup-india/user-registrations/${userId}`).catch(() => ({ success: false, data: [] })),
        apiClient.get(`/gst/user-registrations/${userId}`).catch(() => ({ success: false, data: [] }))
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

      console.log('📊 Private Limited:', privateLimited.length, 'registrations');
      console.log('📊 Proprietorship:', proprietorship.length, 'registrations');
      console.log('📊 Startup India:', startupIndia.length, 'registrations');
      console.log('📊 GST:', gst.length, 'registrations');

      // Keep only paid items (has payment id or payment_status = paid)
      const isPaid = (r) =>
        (r.razorpay_payment_id && String(r.razorpay_payment_id).trim() !== '') ||
        (r.payment_status && String(r.payment_status).toLowerCase() === 'paid');

      // Combine, filter paid, and sort by created_at
      const combined = [...privateLimited, ...proprietorship, ...startupIndia, ...gst]
        .filter(isPaid)
        .sort((a, b) => 
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
    
    const urls = {};
    const documents = {
      aadhar_card: user.aadhar_card,
      pan_card: user.pan_card,
      signature: user.signature
    };

    for (const [key, url] of Object.entries(documents)) {
      if (url && url.includes('s3.') && url.includes('.amazonaws.com')) {
        try {
          const response = await apiClient.post('/private-limited/get-signed-url', { s3Url: url });
          if (response.signedUrl) {
            urls[key] = response.signedUrl;
          } else {
            urls[key] = url;
          }
        } catch (error) {
          console.error(`Error fetching signed URL for ${key}:`, error);
          urls[key] = url;
        }
      } else {
        urls[key] = url;
      }
    }

    setDocumentUrls(urls);
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

  const addUserTask = async () => {
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
      gstin: '',
      incorporationDate: '',
      panFile: null,
      tan: '',
      cin: '',
      registeredAddress: '',
      websites: []
    }]);
  };

  const removeOrganization = (id) => {
    if (organisations.length > 1) {
      setOrganisations(organisations.filter(o => o.id !== id));
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

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveOrganisations = async () => {
    try {
      setSavingOrg(true);
      
      const payload = {
        organisations: organisations.map(org => ({
          organisationType: org.organisationType,
          legalName: org.legalName,
          tradeName: org.tradeName,
          gstin: org.gstin,
          incorporationDate: org.incorporationDate,
          panFile: org.panFile,
          tan: org.tan,
          cin: org.cin,
          registeredAddress: org.registeredAddress,
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

  // Website handlers
  const addWebsite = () => {
    setWebsites([...websites, { 
      id: Date.now(), 
      type: '', 
      url: '', 
      login: '', 
      password: '', 
      showPassword: false 
    }]);
  };

  const removeWebsite = (id) => {
    if (websites.length > 1) {
      setWebsites(websites.filter(w => w.id !== id));
    }
  };

  const updateWebsite = (id, field, value) => {
    setWebsites(websites.map(website => 
      website.id === id ? { ...website, [field]: value } : website
    ));
  };

  const togglePasswordVisibility = (id) => {
    setWebsites(websites.map(website => 
      website.id === id ? { ...website, showPassword: !website.showPassword } : website
    ));
  };

  const handleSaveWebsites = async () => {
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

      // Map progress values to service_status
      let statusToSet = '';
      if (newStatus === 'Completed') {
        statusToSet = 'Completed';
      } else if (newStatus === 'In Progress') {
        statusToSet = 'WIP';
      } else if (newStatus === 'Ongoing') {
        statusToSet = 'Payment pending';
      } else {
        statusToSet = newStatus;
      }

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                  <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-600">{clientProfile.user?.name || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-700">WhatsApp:</span> <span className="text-gray-600">{clientProfile.user?.whatsapp || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-600">{clientProfile.user?.email || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-700">DOB:</span> <span className="text-gray-600">{clientProfile.user?.dob || 'N/A'}</span></div>
                  <div className="col-span-2"><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-600">{clientProfile.user?.address_line1 || 'N/A'}</span></div>
                  <div className="col-span-2"><span className="font-medium text-gray-700">Business Address:</span> <span className="text-gray-600">{clientProfile.user?.business_address || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-700">Category:</span> <span className="text-gray-600">{clientProfile.user?.category || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-700">Sub Category:</span> <span className="text-gray-600">{clientProfile.user?.sub_category || 'N/A'}</span></div>
                </div>

                {/* Documents Section */}
                <div className="border-t border-gray-300 pt-4 mt-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Documents</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Aadhar Card:</span>
                      {documentUrls.aadhar_card || clientProfile.user?.aadhar_card ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = documentUrls.aadhar_card || clientProfile.user.aadhar_card;
                            console.log('Opening Aadhar Card:', url);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          className="ml-2 text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          View
                        </button>
                      ) : (
                        <span className="ml-2 text-gray-600">N/A</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">PAN Card:</span>
                      {documentUrls.pan_card || clientProfile.user?.pan_card ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = documentUrls.pan_card || clientProfile.user.pan_card;
                            console.log('Opening PAN Card:', url);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          className="ml-2 text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          View
                        </button>
                      ) : (
                        <span className="ml-2 text-gray-600">N/A</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Signature:</span>
                      {documentUrls.signature || clientProfile.user?.signature ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = documentUrls.signature || clientProfile.user.signature;
                            console.log('Opening Signature:', url);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          className="ml-2 text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          View
                        </button>
                      ) : (
                        <span className="ml-2 text-gray-600">N/A</span>
                      )}
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
                  <div className="space-y-4">
                    {organisations.map((org, idx) => (
                      <div key={org.id} className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Organization {idx + 1}</h4>
                          {organisations.length > 1 && (
                            <button
                              onClick={() => removeOrganization(org.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Type</label>
                            <input
                              type="text"
                              value={org.organisationType}
                              onChange={(e) => updateOrganization(org.id, 'organisationType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="e.g., Private Limited"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                            <input
                              type="text"
                              value={org.legalName}
                              onChange={(e) => updateOrganization(org.id, 'legalName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Legal name as per registration"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trade Name</label>
                            <input
                              type="text"
                              value={org.tradeName}
                              onChange={(e) => updateOrganization(org.id, 'tradeName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Trading name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                            <input
                              type="text"
                              value={org.gstin}
                              onChange={(e) => updateOrganization(org.id, 'gstin', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="GSTIN number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">TAN</label>
                            <input
                              type="text"
                              value={org.tan}
                              onChange={(e) => updateOrganization(org.id, 'tan', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="TAN number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                            <input
                              type="text"
                              value={org.cin}
                              onChange={(e) => updateOrganization(org.id, 'cin', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="CIN number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Incorporation Date</label>
                            <input
                              type="date"
                              value={org.incorporationDate}
                              onChange={(e) => updateOrganization(org.id, 'incorporationDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
                            <textarea
                              value={org.registeredAddress}
                              onChange={(e) => updateOrganization(org.id, 'registeredAddress', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              rows="2"
                              placeholder="Registered office address"
                            />
                          </div>
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
                  </div>
                ) : clientProfile.user?.organisations && clientProfile.user.organisations.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto -mx-4 md:mx-0 table-responsive">
                      <div className="inline-block min-w-full align-middle px-4 md:px-0">
                        <table className="w-full text-sm table-fixed min-w-[600px]">
                          <colgroup>
                            <col className="w-12" />
                            <col className="w-28" />
                            <col className="w-auto" />
                            <col className="w-auto" />
                            <col className="w-32" />
                            <col className="w-28" />
                            <col className="w-28" />
                          </colgroup>
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">ID</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Type</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Legal Name</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Trade Name</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">GSTIN</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">TAN</th>
                          <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">CIN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientProfile.user.organisations.map((org, idx) => (
                          <React.Fragment key={idx}>
                            <tr 
                              onClick={() => setExpandedOrgId(expandedOrgId === idx ? null : idx)}
                              className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                              <td className="px-2 py-2 text-gray-700 font-medium text-xs">{idx + 1}</td>
                              <td className="px-2 py-2 text-gray-600 text-xs truncate" title={org.organisation_type}>{org.organisation_type || 'N/A'}</td>
                              <td className="px-2 py-2 text-gray-600 text-xs truncate" title={org.legal_name}>{org.legal_name || 'N/A'}</td>
                              <td className="px-2 py-2 text-gray-600 text-xs truncate" title={org.trade_name}>{org.trade_name || 'N/A'}</td>
                              <td className="px-2 py-2 text-gray-600 text-xs truncate" title={org.gstin}>{org.gstin || 'N/A'}</td>
                              <td className="px-2 py-2 text-gray-600 text-xs truncate" title={org.tan}>{org.tan || 'N/A'}</td>
                              <td className="px-2 py-2 text-gray-600 text-xs truncate" title={org.cin}>{org.cin || 'N/A'}</td>
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
                                } catch (e) {
                                  orgWebsites = [];
                                }
                              }
                              
                              return (
                                <tr className="bg-white">
                                  <td colSpan="7" className="p-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                                                } catch (e) {
                                                  orgWebsites = [];
                                                }
                                              }
                                              
                                              const orgToEdit = {
                                                id: org.id || idx + 1,
                                                organisationType: org.organisation_type || '',
                                                legalName: org.legal_name || '',
                                                tradeName: org.trade_name || '',
                                                gstin: org.gstin || '',
                                                incorporationDate: org.incorporation_date || '',
                                                panFile: org.pan_file || null,
                                                tan: org.tan || '',
                                                cin: org.cin || '',
                                                registeredAddress: org.registered_address || '',
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
                                                  gstin: '',
                                                  incorporationDate: '',
                                                  panFile: null,
                                                  tan: '',
                                                  cin: '',
                                                  registeredAddress: '',
                                                  websites: []
                                                });
                                              }
                                              updatedOrgs[idx] = orgToEdit;
                                              setOrganisations(updatedOrgs);
                                              setEditingOrgId(idx);
                                            }}
                                            className="px-4 py-2 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-sm"
                                          >
                                            Edit
                                          </button>
                                        )}
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                                                {org.incorporation_date ? new Date(org.incorporation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
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
                                                        const base64 = await fileToBase64(file);
                                                        updateOrganization(orgInState.id, 'panFile', base64);
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
                                                  <a href={org.pan_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a>
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
                  <p className="text-gray-600">No organisation details available</p>
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
                                <td className="px-2 py-2 text-gray-600 text-xs">{task.date ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td>
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
                                      <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{task.date ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
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
                                <td className="px-2 py-2 text-gray-600 text-xs">{task.date ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td>
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
                                      <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{task.date ? new Date(task.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
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
                
                {/* Name */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{registration.business_name || 'Pending'}</h2>
                  <p className="text-xs text-gray-500 mt-1">
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
                      
                      return 'Registration';
                    })()}
                  </p>
                </div>

                {/* Package */}
                <div className="text-sm text-gray-600">
                  {registration.package_name || 'N/A'}
                </div>

                {/* Status */}
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    registration.status === 'completed' ? 'bg-green-100 text-green-800' :
                    registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {registration.status || 'Pending'}
                  </span>
                </div>

                {/* Status Badge with Dropdown */}
                <div className="relative">
                  {(() => {
                    // Determine progress from service_status
                    const getProgressFromStatus = (status) => {
                      if (!status) return 'Ongoing';
                      const statusLower = status.toLowerCase();
                      if (statusLower === 'completed') return 'Completed';
                      if (statusLower === 'wip' || statusLower === 'data received' || statusLower === 'awaiting confirmation from the govt' || statusLower === 'data pending from client') return 'In Progress';
                      if (statusLower === 'payment pending' || statusLower === 'technical issue') return 'Ongoing';
                      return 'Ongoing';
                    };
                    
                    const currentProgress = getProgressFromStatus(registration.service_status);
                    
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsStatusDropdownOpen(isStatusDropdownOpen === index ? null : index);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                          currentProgress === 'Completed'
                            ? 'bg-green-100 text-green-800' 
                            : currentProgress === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <span>{currentProgress}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    );
                  })()}

                  {/* Dropdown Menu */}
                  {isStatusDropdownOpen === index && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateServiceStatus('Ongoing', registration.ticket_id);
                          setIsStatusDropdownOpen(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 flex items-center gap-2 text-yellow-800 rounded-t-lg"
                      >
                        <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                        Ongoing
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateServiceStatus('In Progress', registration.ticket_id);
                          setIsStatusDropdownOpen(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-blue-800"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        In Progress
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateServiceStatus('Completed', registration.ticket_id);
                          setIsStatusDropdownOpen(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2 text-green-800 rounded-b-lg"
                      >
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        Completed
                      </button>
                    </div>
                  )}
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
        <div className="bg-white rounded-xl p-8 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscriptions</h2>
          <p className="text-gray-600">Subscription details will be displayed here.</p>
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
                                {entry.date ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
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
                                    <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{entry.date ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
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