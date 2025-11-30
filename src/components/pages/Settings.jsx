import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiEyeOff, FiEye } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { BsCalendar3 } from 'react-icons/bs';
import { AiOutlinePlus } from 'react-icons/ai';
import { getUsersPageData, updateUsersPageData } from '../../utils/usersPageApi';

function Settings() {
  const [expandedSection, setExpandedSection] = useState('client-profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    dob: '',
    address: '',
    businessAddress: '',
    category: '',
    subCategory: '',
    aadharCard: null,
    panCard: null,
    signature: null
  });
  const [organizations, setOrganizations] = useState([
    { 
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
    }
  ]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [isAddingNewOrg, setIsAddingNewOrg] = useState(false);
  const [expandedOrgId, setExpandedOrgId] = useState(null);
  const [adminTasksList, setAdminTasksList] = useState([]);
  const [userTasksList, setUserTasksList] = useState([]);
  const [expandedAdminTaskId, setExpandedAdminTaskId] = useState(null);
  const [expandedUserTaskId, setExpandedUserTaskId] = useState(null);
  const [isAddingUserTask, setIsAddingUserTask] = useState(false);
  const [isAddingAdminTask, setIsAddingAdminTask] = useState(false);
  const [currentUserTask, setCurrentUserTask] = useState({ date: '', title: '', description: '', type: '' });
  const [currentAdminTask, setCurrentAdminTask] = useState({ date: '', title: '', description: '', type: '' });
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [notes, setNotes] = useState('');
  const [adminNotesList, setAdminNotesList] = useState([]);
  const [userNotesList, setUserNotesList] = useState([]);
  const [expandedAdminNoteId, setExpandedAdminNoteId] = useState(null);
  const [expandedUserNoteId, setExpandedUserNoteId] = useState(null);
  const [isAddingUserNote, setIsAddingUserNote] = useState(false);
  const [currentUserNote, setCurrentUserNote] = useState({ date: '', description: '', attachments: [] });
  
  // Load data on mount
  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData.role || '';
    setIsUserAdmin(userRole === 'admin' || userRole === 'superadmin');
    
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await getUsersPageData();
      
      if (response.success && response.data) {
        const { user, websites: userWebsites } = response.data;
        
        // Populate Client Profile data
        setFormData({
          name: user.name || '',
          whatsapp: user.whatsapp || '',
          email: user.email || '',
          dob: user.dob || '',
          address: user.address_line1 || '',
          businessAddress: user.business_address || '',
          category: user.category || '',
          subCategory: user.sub_category || '',
          aadharCard: user.aadhar_card || null,
          panCard: user.pan_card || null,
          signature: user.signature || null
        });
        
        // Populate Organisation Details - now supports multiple organizations with websites
        if (user.organisations && user.organisations.length > 0) {
          setOrganizations(user.organisations.map((org, idx) => {
            // Parse websites from JSON or use empty array
            let websites = [];
            if (org.websites) {
              try {
                websites = typeof org.websites === 'string' ? JSON.parse(org.websites) : org.websites;
                if (!Array.isArray(websites)) websites = [];
              } catch {
                websites = [];
              }
            }
            
            // Map websites to include showPassword
            websites = websites.map(w => ({
              id: w.id || Date.now(),
              type: w.type || '',
              url: w.url || '',
              login: w.login || '',
              password: w.password || '',
              showPassword: false
            }));
            
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
              websites: websites
            };
          }));
        } else if (user.organisation_type || user.legal_name) {
          // Backward compatibility - single organization from old schema
          // Migrate old websites to first organization
          let websites = [];
          if (userWebsites && userWebsites.length > 0) {
            websites = userWebsites.map(w => ({
              id: w.id || Date.now(),
              type: w.website_type || '',
              url: w.website_url || '',
              login: w.login || '',
              password: w.password || '',
              showPassword: false
            }));
          }
          
          setOrganizations([{
            id: 1,
            organisationType: user.organisation_type || '',
            legalName: user.legal_name || '',
            tradeName: user.trade_name || '',
            gstin: user.gstin || '',
            incorporationDate: user.incorporation_date || '',
            panFile: user.pan_file || null,
            tan: user.tan || '',
            cin: user.cin || '',
            registeredAddress: user.registered_address || '',
            websites: websites
          }]);
        }
        
        // Parse admin tasks (array of tasks)
        const adminTasksRaw = user.admin_tasks || '';
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
        const userTasksRaw = user.user_tasks || '';
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
        
        // Populate Notes
        setNotes(user.notes || '');
        
        // Parse admin notes (array of notes)
        const adminNotesRaw = user.admin_notes || '';
        try {
          const notesList = JSON.parse(adminNotesRaw);
          if (Array.isArray(notesList)) {
            setAdminNotesList(notesList);
          } else if (notesList.note !== undefined) {
            setAdminNotesList([notesList]);
          } else if (adminNotesRaw) {
            setAdminNotesList([{ date: '', description: adminNotesRaw, attachments: [] }]);
          }
        } catch {
          if (adminNotesRaw) {
            setAdminNotesList([{ date: '', description: adminNotesRaw, attachments: [] }]);
          }
        }
        
        // Parse user notes (array of notes)
        const userNotesRaw = user.user_notes || '';
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
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveClientProfile = async () => {
    try {
      console.log('💾 Saving Client Profile...');
      setSaving(true);
      
      const payload = {
        clientProfile: {
          name: formData.name,
          whatsapp: formData.whatsapp,
          email: formData.email,
          dob: formData.dob,
          address: formData.address,
          businessAddress: formData.businessAddress,
          category: formData.category,
          subCategory: formData.subCategory,
          aadharCard: formData.aadharCard,
          panCard: formData.panCard,
          signature: formData.signature
        }
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        alert('✅ Client Profile saved successfully!');
        await loadUserData();
      }
    } catch (error) {
      console.error('❌ Error saving Client Profile:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrganisation = async () => {
    try {
      console.log('💾 Saving Organisation Details with Websites...');
      setSaving(true);
      
      const payload = {
        organisations: organizations.map(org => ({
          organisationType: org.organisationType,
          legalName: org.legalName,
          tradeName: org.tradeName,
          gstin: org.gstin,
          incorporationDate: org.incorporationDate,
          panFile: org.panFile,
          tan: org.tan,
          cin: org.cin,
          registeredAddress: org.registeredAddress,
          websites: (org.websites || []).filter(w => w.url && w.url.trim() !== '').map(w => ({
            type: w.type,
            url: w.url,
            login: w.login,
            password: w.password
          }))
        }))
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        alert('✅ Organisation Details saved successfully!');
        setSelectedOrgId(null);
        setIsAddingNewOrg(false);
        await loadUserData();
      }
    } catch (error) {
      console.error('❌ Error saving Organisation:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };


  const handleUserNoteFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentUserNote(prev => ({
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

  const removeUserNoteAttachment = (index) => {
    setCurrentUserNote(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== index)
    }));
  };

  const handleSaveUserNote = async () => {
    try {
      setSaving(true);
      
      // Add new note to list
      const updatedNotesList = [...userNotesList, {
        id: Date.now(),
        date: currentUserNote.date,
        description: currentUserNote.description,
        attachments: currentUserNote.attachments,
        createdAt: new Date().toISOString()
      }];

      const payload = {
        userNotes: JSON.stringify(updatedNotesList)
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        setUserNotesList(updatedNotesList);
        setCurrentUserNote({ date: '', description: '', attachments: [] });
        setIsAddingUserNote(false);
        alert('Note saved successfully!');
        await loadUserData();
      }
    } catch (error) {
      console.error('Error saving user note:', error);
      alert('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  // Note: handleSaveNotes is kept for potential future use if bulk save is needed
  // Currently notes are saved immediately when added via handleSaveUserNote
  const _handleSaveNotes = async () => {
    try {
      console.log('💾 Saving Notes...');
      setSaving(true);
      
      const payload = {
        notes,
        adminNotes: JSON.stringify(adminNotesList),
        userNotes: JSON.stringify(userNotesList)
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        alert('✅ Notes saved successfully!');
        await loadUserData();
      }
    } catch (error) {
      console.error('❌ Error saving Notes:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const addOrganization = () => {
    const newOrg = { 
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
    };
    setOrganizations([...organizations, newOrg]);
    setSelectedOrgId(newOrg.id);
    setIsAddingNewOrg(true);
  };

  const removeOrganization = (id) => {
    if (organizations.length > 1) {
      setOrganizations(organizations.filter(o => o.id !== id));
    }
  };

  const updateOrganization = (id, field, value) => {
    setOrganizations(organizations.map(org => 
      org.id === id ? { ...org, [field]: value } : org
    ));
  };

  const addWebsite = (orgId) => {
    setOrganizations(organizations.map(org => 
      org.id === orgId 
        ? { ...org, websites: [...(org.websites || []), { 
            id: Date.now(), 
            type: '', 
            url: '', 
            login: '', 
            password: '', 
            showPassword: false 
          }] }
        : org
    ));
  };

  const removeWebsite = (orgId, websiteId) => {
    setOrganizations(organizations.map(org => 
      org.id === orgId 
        ? { ...org, websites: (org.websites || []).filter(w => w.id !== websiteId) }
        : org
    ));
  };

  const updateWebsite = (orgId, websiteId, field, value) => {
    setOrganizations(organizations.map(org => 
      org.id === orgId 
        ? { ...org, websites: (org.websites || []).map(website => 
            website.id === websiteId ? { ...website, [field]: value } : website
          ) }
        : org
    ));
  };

  const togglePasswordVisibility = (orgId, websiteId) => {
    setOrganizations(organizations.map(org => 
      org.id === orgId 
        ? { ...org, websites: (org.websites || []).map(website => 
            website.id === websiteId ? { ...website, showPassword: !website.showPassword } : website
          ) }
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

  const addUserTask = async () => {
    if (!currentUserTask.title || !currentUserTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      setSaving(true);
      const updatedTasksList = [...userTasksList, {
        id: Date.now(),
        date: currentUserTask.date,
        title: currentUserTask.title,
        description: currentUserTask.description,
        type: currentUserTask.type,
        createdAt: new Date().toISOString()
      }];

      const payload = {
        userTasks: JSON.stringify(updatedTasksList)
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        setUserTasksList(updatedTasksList);
        setCurrentUserTask({ date: '', title: '', description: '', type: '' });
        setIsAddingUserTask(false);
        alert('Task saved successfully!');
        await loadUserData();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addAdminTask = async () => {
    if (!currentAdminTask.title || !currentAdminTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      setSaving(true);
      const updatedTasksList = [...adminTasksList, {
        id: Date.now(),
        date: currentAdminTask.date,
        title: currentAdminTask.title,
        description: currentAdminTask.description,
        type: currentAdminTask.type,
        createdAt: new Date().toISOString()
      }];

      const payload = {
        adminTasks: JSON.stringify(updatedTasksList)
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        setAdminTasksList(updatedTasksList);
        setCurrentAdminTask({ date: '', title: '', description: '', type: '' });
        setIsAddingAdminTask(false);
        alert('Task saved successfully!');
        await loadUserData();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTasks = async () => {
    try {
      console.log('💾 Saving Tasks...');
      setSaving(true);
      
      const payload = {
        adminTasks: JSON.stringify(adminTasksList),
        userTasks: JSON.stringify(userTasksList)
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        alert('✅ Tasks saved successfully!');
        await loadUserData();
      }
    } catch (error) {
      console.error('❌ Error saving Tasks:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Render functions with direct state access to maintain input focus
  const renderNotesContent = () => {
    return (
      <div className="px-6 pb-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Notes Section - Read Only for Users */}
          <div className="border-r border-gray-200 pr-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Admin Notes
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Read Only</span>
            </h3>
            
            {/* Admin Notes Table - Read Only */}
            {adminNotesList.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Date</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Description</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">Files</th>
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
                            <div className="space-y-2 text-xs">
                              <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-600">{note.date || 'N/A'}</span></div>
                              <div><span className="font-medium text-gray-700">Description:</span><p className="text-gray-600 mt-1">{note.description}</p></div>
                              {note.attachments && note.attachments.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700">Attachments:</span>
                                  <div className="mt-1 space-y-1">
                                    {note.attachments.map((file, fileIdx) => (
                                      <div key={fileIdx}>
                                        {(file.url || file.data) ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const fileUrl = file.url || file.data;
                                              if (fileUrl.startsWith('data:')) {
                                                const link = document.createElement('a');
                                                link.href = fileUrl;
                                                link.download = file.name;
                                                link.target = '_blank';
                                                link.click();
                                              } else {
                                                window.open(fileUrl, '_blank');
                                              }
                                            }}
                                            className="text-blue-600 hover:underline"
                                          >
                                            📎 {file.name}
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
            ) : (
              <p className="text-gray-600 text-center py-4 text-xs">No admin notes</p>
            )}
          </div>

        {/* User Notes Section - Editable */}
        <div className="pl-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">My Notes</h3>
            <button
              onClick={() => setIsAddingUserNote(true)}
              className="flex items-center gap-1 px-2 py-1 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors text-xs"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>

          {/* Add Note Form */}
          {isAddingUserNote && (
            <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">New Note</h4>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={currentUserNote.date}
                  onChange={(e) => setCurrentUserNote({ ...currentUserNote, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={currentUserNote.description}
                  onChange={(e) => setCurrentUserNote({ ...currentUserNote, description: e.target.value })}
                  placeholder="Enter note description..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Attachments</label>
                <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-[#00486D] cursor-pointer">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-xs">Upload</span>
                  <input type="file" multiple onChange={handleUserNoteFileUpload} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                </label>
                {currentUserNote.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {currentUserNote.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-2 py-1 rounded border text-xs">
                        <span className="truncate">{file.name}</span>
                        <button onClick={() => removeUserNoteAttachment(idx)} className="text-red-500 ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={handleSaveUserNote} disabled={saving} className="flex-1 px-3 py-2 bg-[#01334C] text-white rounded-md text-sm">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setIsAddingUserNote(false); setCurrentUserNote({ date: '', description: '', attachments: [] }); }} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* User Notes Table */}
          {userNotesList.length > 0 ? (
            <table className="w-full text-sm">
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
                                    <div key={fileIdx}>
                                      {(file.url || file.data) ? (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const fileUrl = file.url || file.data;
                                            if (fileUrl.startsWith('data:')) {
                                              const link = document.createElement('a');
                                              link.href = fileUrl;
                                              link.download = file.name;
                                              link.target = '_blank';
                                              link.click();
                                            } else {
                                              window.open(fileUrl, '_blank');
                                            }
                                          }}
                                          className="text-blue-600 hover:underline"
                                        >
                                          📎 {file.name}
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
          ) : (
            <p className="text-gray-600 text-center py-4 text-xs">No notes added yet</p>
          )}
        </div>
      </div>
    </div>
    );
  };

  const TasksContent = () => {
    return (
      <div className="px-6 pb-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Tasks Section - Read Only for Users */}
          <div className="border-r border-gray-200 pr-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Admin Tasks
              {!isUserAdmin && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Read Only</span>}
            </h3>
            
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
                              task.type === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.type === 'recurring' ? 'bg-blue-100 text-blue-700' :
                              task.type === 'non-recurring' ? 'bg-green-100 text-green-700' :
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

            {/* Add Admin Task Form - Only for Admins */}
            {isUserAdmin && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {isAddingAdminTask ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={currentAdminTask.date}
                        onChange={(e) => setCurrentAdminTask({ ...currentAdminTask, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={currentAdminTask.title}
                        onChange={(e) => setCurrentAdminTask({ ...currentAdminTask, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                        placeholder="Enter task title"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={currentAdminTask.type}
                        onChange={(e) => setCurrentAdminTask({ ...currentAdminTask, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                      >
                        <option value="">Select type</option>
                        <option value="recurring">Recurring</option>
                        <option value="non-recurring">Non-Recurring</option>
                        <option value="urgent">Urgent</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={currentAdminTask.description}
                        onChange={(e) => setCurrentAdminTask({ ...currentAdminTask, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                        placeholder="Enter task description"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addAdminTask}
                        disabled={saving}
                        className="flex-1 px-3 py-2 bg-[#01334C] text-white rounded text-xs hover:bg-[#00486D] disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingAdminTask(false);
                          setCurrentAdminTask({ date: '', title: '', description: '', type: '' });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded text-xs hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingAdminTask(true)}
                    className="w-full px-3 py-2 bg-[#01334C] text-white rounded text-xs hover:bg-[#00486D] flex items-center justify-center gap-2"
                  >
                    <AiOutlinePlus className="w-4 h-4" />
                    Add Admin Task
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Tasks Section - Editable */}
          <div className="pl-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">My Tasks</h3>
            </div>
            
            {/* User Tasks Table */}
            {userTasksList.length > 0 ? (
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
                              task.type === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.type === 'recurring' ? 'bg-blue-100 text-blue-700' :
                              task.type === 'non-recurring' ? 'bg-green-100 text-green-700' :
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
            ) : (
              <p className="text-gray-600 text-center py-4 text-xs">No tasks added yet</p>
            )}

            {/* Add User Task Form */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {isAddingUserTask ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={currentUserTask.date}
                      onChange={(e) => setCurrentUserTask({ ...currentUserTask, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={currentUserTask.title}
                      onChange={(e) => setCurrentUserTask({ ...currentUserTask, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={currentUserTask.type}
                      onChange={(e) => setCurrentUserTask({ ...currentUserTask, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    >
                      <option value="">Select type</option>
                      <option value="recurring">Recurring</option>
                      <option value="non-recurring">Non-Recurring</option>
                      <option value="urgent">Urgent</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={currentUserTask.description}
                      onChange={(e) => setCurrentUserTask({ ...currentUserTask, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addUserTask}
                      disabled={saving}
                      className="flex-1 px-3 py-2 bg-[#01334C] text-white rounded text-xs hover:bg-[#00486D] disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingUserTask(false);
                        setCurrentUserTask({ date: '', title: '', description: '', type: '' });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded text-xs hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingUserTask(true)}
                  className="w-full px-3 py-2 bg-[#01334C] text-white rounded text-xs hover:bg-[#00486D] flex items-center justify-center gap-2"
                >
                  <AiOutlinePlus className="w-4 h-4" />
                  Add Task
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button 
            onClick={handleSaveTasks}
            disabled={saving}
            className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  };


  const OrganisationDetailsContent = () => {
    // Filter out empty organizations for table display
    const savedOrganizations = organizations.filter(org => org.legalName && org.legalName.trim() !== '');
    const hasNoOrganizations = savedOrganizations.length === 0 && !selectedOrgId;

    return (
      <div className="px-6 pb-6 pt-6">
        <div className="space-y-4">
          {/* Show message if no organizations */}
          {hasNoOrganizations && (
            <div className="text-center py-8 text-gray-500">
              <p>No organizations yet. Click the + button to add a new organization.</p>
            </div>
          )}

          {/* Table and Add Button side by side */}
          {savedOrganizations.length > 0 && !selectedOrgId && (
            <div className="flex items-start gap-4">
              {/* Organizations Table View */}
              <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm table-fixed border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
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
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">ID</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">Type</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">Legal Name</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">Trade Name</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">GSTIN</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">TAN</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs border border-gray-300">CIN</th>
                  </tr>
                </thead>
                <tbody>
                  {savedOrganizations.map((org, idx) => (
                    <React.Fragment key={org.id}>
                      <tr 
                        onClick={() => {
                          setExpandedOrgId(expandedOrgId === idx ? null : idx);
                          setSelectedOrgId(org.id);
                        }}
                        className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-2 py-2 text-gray-700 font-medium text-xs border border-gray-300">{idx + 1}</td>
                        <td className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300" title={org.organisationType}>{org.organisationType || 'N/A'}</td>
                        <td className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300" title={org.legalName}>{org.legalName || 'N/A'}</td>
                        <td className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300" title={org.tradeName}>{org.tradeName || 'N/A'}</td>
                        <td className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300" title={org.gstin}>{org.gstin || 'N/A'}</td>
                        <td className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300" title={org.tan}>{org.tan || 'N/A'}</td>
                        <td className="px-2 py-2 text-gray-600 text-xs truncate border border-gray-300" title={org.cin}>{org.cin || 'N/A'}</td>
                      </tr>
                      {expandedOrgId === idx && (
                        <tr className="bg-white">
                          <td colSpan="7" className="p-6 border border-gray-300">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">{org.legalName || 'Organization Details'}</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1 */}
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Type</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.organisationType || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.gstin || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">TAN</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.tan || 'N/A'}</div>
                                  </div>
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.legalName || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Incorporation Date</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {org.incorporationDate ? new Date(org.incorporationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.cin || 'N/A'}</div>
                                  </div>
                                </div>

                                {/* Column 3 */}
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trade Name</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.tradeName || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN File</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                      {org.panFile ? (
                                        <a href={org.panFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a>
                                      ) : (
                                        'Not uploaded'
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
                                    <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.registeredAddress || 'N/A'}</div>
                                  </div>
                                </div>
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
              
              {/* Add Button beside table */}
              <button
                type="button"
                onClick={addOrganization}
                className="w-12 h-12 bg-[#01334C] text-white rounded-full flex items-center justify-center hover:bg-[#00486D] transition-colors flex-shrink-0"
                title="Add Organization"
              >
                <AiOutlinePlus className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Add Button when no table (empty state) */}
          {hasNoOrganizations && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addOrganization}
                className="w-12 h-12 bg-[#01334C] text-white rounded-full flex items-center justify-center hover:bg-[#00486D] transition-colors"
                title="Add Organization"
              >
                <AiOutlinePlus className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Expanded Organization Card (Edit Mode) */}
          {selectedOrgId && (
            <div className="border-2 border-blue-500 rounded-xl p-6 bg-white shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isAddingNewOrg ? 'New Organization' : 'Edit Organization'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedOrgId(null);
                    setIsAddingNewOrg(false);
                    setExpandedOrgId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {organizations.map((org) => {
                if (org.id !== selectedOrgId) return null;
                
                return (
                  <div key={org.id} className="space-y-4">
                    {/* Row 1: Organisation Type, Legal Name, Trade Name */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Organisation Type</label>
                        <input
                          type="text"
                          value={org.organisationType}
                          onChange={(e) => updateOrganization(org.id, 'organisationType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter organisation type"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Legal Name</label>
                        <input
                          type="text"
                          value={org.legalName}
                          onChange={(e) => updateOrganization(org.id, 'legalName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter legal name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Trade Name</label>
                        <input
                          type="text"
                          value={org.tradeName}
                          onChange={(e) => updateOrganization(org.id, 'tradeName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter trade name"
                        />
                      </div>
                    </div>

                    {/* Row 2: GSTIN, Incorporation Date, PAN File */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN</label>
                        <input
                          type="text"
                          value={org.gstin}
                          onChange={(e) => updateOrganization(org.id, 'gstin', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter GSTIN"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Incorporation Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={org.incorporationDate}
                            onChange={(e) => updateOrganization(org.id, 'incorporationDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="dd-mm-yyyy"
                          />
                          <BsCalendar3 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">PAN File</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={org.panFile ? 'File uploaded' : 'No file chosen'}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const base64 = await fileToBase64(file);
                                  updateOrganization(org.id, 'panFile', base64);
                                }
                              }}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <span className="px-4 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block">
                              edit
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: TAN, CIN, Registered Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">TAN</label>
                        <input
                          type="text"
                          value={org.tan}
                          onChange={(e) => updateOrganization(org.id, 'tan', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter TAN"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">CIN</label>
                        <input
                          type="text"
                          value={org.cin}
                          onChange={(e) => updateOrganization(org.id, 'cin', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter CIN"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Registered Address</label>
                        <textarea
                          rows={3}
                          value={org.registeredAddress}
                          onChange={(e) => updateOrganization(org.id, 'registeredAddress', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                          placeholder="Enter registered address"
                        />
                      </div>
                    </div>

                    {/* Websites Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-900">Website Details</h4>
                        <button
                          type="button"
                          onClick={() => addWebsite(org.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors text-sm"
                        >
                          <AiOutlinePlus className="w-4 h-4" />
                          Add Website
                        </button>
                      </div>
                      
                      {/* Saved Websites Table */}
                      {org.websites && org.websites.filter(w => w.url && w.url.trim() !== '').length > 0 && (
                        <div className="mb-4 overflow-x-auto">
                          <table className="w-full border-collapse bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Type</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">URL</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Login</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Password</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {org.websites.filter(w => w.url && w.url.trim() !== '').map((website) => (
                                <tr key={website.id} className="bg-white border-b border-gray-200">
                                  <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">{website.type || 'N/A'}</td>
                                  <td className="px-4 py-3 border border-gray-300 text-sm">
                                    {website.url ? (
                                      <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {website.url}
                                      </a>
                                    ) : (
                                      <span className="text-gray-600">N/A</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">{website.login || 'N/A'}</td>
                                  <td className="px-4 py-3 border border-gray-300 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-900">
                                        {website.password ? (
                                          website.showPassword ? website.password : '••••••••'
                                        ) : (
                                          'N/A'
                                        )}
                                      </span>
                                      {website.password && (
                                        <button
                                          type="button"
                                          onClick={() => togglePasswordVisibility(org.id, website.id)}
                                          className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                                          title={website.showPassword ? 'Hide password' : 'Show password'}
                                        >
                                          {website.showPassword ? (
                                            <FiEyeOff className="w-4 h-4" />
                                          ) : (
                                            <FiEye className="w-4 h-4" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 border border-gray-300 text-sm">
                                    <button
                                      type="button"
                                      onClick={() => removeWebsite(org.id, website.id)}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      {/* Website Entry Forms */}
                      {(org.websites || []).filter(w => !w.url || w.url.trim() === '').map((website) => (
                        <div key={website.id} className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Website Type</label>
                              <select
                                value={website.type}
                                onChange={(e) => updateWebsite(org.id, website.id, 'type', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                              >
                                <option value="">Select Website Type</option>
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
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Website URL</label>
                              <input
                                type="url"
                                value={website.url}
                                onChange={(e) => updateWebsite(org.id, website.id, 'url', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter website URL"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Login</label>
                              <input
                                type="text"
                                value={website.login}
                                onChange={(e) => updateWebsite(org.id, website.id, 'login', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter login"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Password</label>
                              <div className="relative">
                                <input
                                  type={website.showPassword ? 'text' : 'password'}
                                  value={website.password}
                                  onChange={(e) => updateWebsite(org.id, website.id, 'password', e.target.value)}
                                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Enter password"
                                />
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(org.id, website.id)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {website.showPassword ? (
                                    <FiEye className="w-4 h-4" />
                                  ) : (
                                    <FiEyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() => removeWebsite(org.id, website.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delete Button */}
                    {!isAddingNewOrg && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            removeOrganization(org.id);
                            setSelectedOrgId(null);
                            setIsAddingNewOrg(false);
                            setExpandedOrgId(null);
                          }}
                          className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete Organization
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={async () => {
                await handleSaveOrganisation();
              }}
              disabled={saving}
              className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ClientProfileContent = () => (
    <div className="px-6 pb-6 pt-6">
      <div className="space-y-6">
        {/* Row 1: Name, WhatsApp, Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Name (As Per PAN)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">WhatsApp Number</label>
            <div className="relative">
              <FaWhatsapp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 text-xl" />
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
        </div>

        {/* Row 2: DOB, Address, Business Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Date of Birth</label>
            <div className="relative">
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <BsCalendar3 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter address"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Business Address (If Available)</label>
            <textarea
              value={formData.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Enter business address"
            />
          </div>
        </div>

        {/* Row 3: Category, Sub-Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select Category</option>
              <option value="category1">Category 1</option>
              <option value="category2">Category 2</option>
              <option value="category3">Category 3</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Sub-Category</label>
            <select
              value={formData.subCategory}
              onChange={(e) => handleInputChange('subCategory', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select Sub-Category</option>
              <option value="sub1">Sub-Category 1</option>
              <option value="sub2">Sub-Category 2</option>
              <option value="sub3">Sub-Category 3</option>
            </select>
          </div>
        </div>

        {/* Row 4: Document Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Aadhar Card</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={formData.aadharCard ? formData.aadharCard.name : 'No file chosen'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => handleFileChange('aadharCard', e.target.files[0])}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <span className="px-4 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block">
                  edit
                </span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Pan Card</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={formData.panCard ? formData.panCard.name : 'No file chosen'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => handleFileChange('panCard', e.target.files[0])}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <span className="px-4 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block">
                  edit
                </span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Signature</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={formData.signature ? formData.signature.name : 'No file chosen'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => handleFileChange('signature', e.target.files[0])}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <span className="px-4 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block">
                  edit
                </span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveClientProfile}
            disabled={saving}
            className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  // Define sections metadata only (components rendered inline to maintain state)
  const sections = [
    { id: 'client-profile', label: 'A. Client Profile' },
    { id: 'organisation-details', label: 'B. Organisation Details (with Websites)' },
    { id: 'tasks', label: 'C. Tasks' },
    { id: 'notes', label: 'D. Notes' }
  ];

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01334C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-[15px] font-medium text-black">
                  {section.label}
                </span>
                {expandedSection === section.id ? (
                  <FiChevronUp className="w-5 h-5 text-black" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-black" />
                )}
              </button>

              {/* Accordion Content - Render functions to maintain input focus */}
              {expandedSection === section.id && (
                <div className="border-t border-gray-100">
                  {section.id === 'client-profile' && ClientProfileContent()}
                  {section.id === 'organisation-details' && OrganisationDetailsContent()}
                  {section.id === 'tasks' && TasksContent()}
                  {section.id === 'notes' && renderNotesContent()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;























