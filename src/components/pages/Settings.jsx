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
      registeredAddress: ''
    }
  ]);
  const [websites, setWebsites] = useState([
    { id: 1, type: '', url: '', login: '', password: '', showPassword: false }
  ]);
  const [tasks, setTasks] = useState([
    { id: 1, title: '', description: '', type: '', date: '' }
  ]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);
  const [notes, setNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [userNotesAttachments, setUserNotesAttachments] = useState([]);
  
  // Load data on mount
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await getUsersPageData();
      
      if (response.success && response.data) {
        const { user, websites: userWebsites, tasks: userTasks } = response.data;
        
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
        
        // Populate Organisation Details - now supports multiple organizations
        if (user.organisations && user.organisations.length > 0) {
          setOrganizations(user.organisations.map((org, idx) => ({
            id: org.id || idx + 1,
            organisationType: org.organisation_type || '',
            legalName: org.legal_name || '',
            tradeName: org.trade_name || '',
            gstin: org.gstin || '',
            incorporationDate: org.incorporation_date || '',
            panFile: org.pan_file || null,
            tan: org.tan || '',
            cin: org.cin || '',
            registeredAddress: org.registered_address || ''
          })));
        } else if (user.organisation_type || user.legal_name) {
          // Backward compatibility - single organization from old schema
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
            registeredAddress: user.registered_address || ''
          }]);
        }
        
        // Populate Websites
        if (userWebsites && userWebsites.length > 0) {
          setWebsites(userWebsites.map(w => ({
            id: w.id || Date.now(),
            type: w.website_type || '',
            url: w.website_url || '',
            login: w.login || '',
            password: w.password || '',
            showPassword: false
          })));
        }
        
        // Populate Tasks
        if (userTasks && userTasks.length > 0) {
          setTasks(userTasks.map(t => ({
            id: t.id || Date.now(),
            title: t.task_title || '',
            description: t.task_description || '',
            type: t.task_type || '',
            date: t.task_date || ''
          })));
        }
        
        // Populate Notes
        setNotes(user.notes || '');
        setAdminNotes(user.admin_notes || '');
        setUserNotes(user.user_notes || '');
        setUserNotesAttachments(user.user_notes_attachments || []);
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
      console.log('💾 Saving Organisation Details...');
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
          registeredAddress: org.registeredAddress
        }))
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        alert('✅ Organisation Details saved successfully!');
        await loadUserData();
      }
    } catch (error) {
      console.error('❌ Error saving Organisation:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWebsites = async () => {
    try {
      console.log('💾 Saving Website Details...');
      setSaving(true);
      
      const payload = {
        websites: websites.map(w => ({
          type: w.type,
          url: w.url,
          login: w.login,
          password: w.password
        }))
      };
      
      const response = await updateUsersPageData(payload);
      
      if (response.success) {
        alert('✅ Website Details saved successfully!');
        await loadUserData();
      }
    } catch (error) {
      console.error('❌ Error saving Websites:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTasks = async () => {
    try {
      console.log('💾 Saving Tasks...');
      setSaving(true);
      
      const payload = {
        tasks: tasks.map(t => ({
          title: t.title,
          description: t.description,
          type: t.type,
          date: t.date
        }))
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

  const handleSaveNotes = async () => {
    try {
      console.log('💾 Saving Notes...');
      setSaving(true);
      
      const payload = {
        notes,
        adminNotes,
        userNotes,
        userNotesAttachments
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
    setOrganizations([...organizations, { 
      id: Date.now(), 
      organisationType: '',
      legalName: '',
      tradeName: '',
      gstin: '',
      incorporationDate: '',
      panFile: null,
      tan: '',
      cin: '',
      registeredAddress: ''
    }]);
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
  
  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const addTask = () => {
    const newTask = { 
      id: Date.now(), 
      title: '', 
      description: '', 
      type: '',
      date: ''
    };
    setTasks([...tasks, newTask]);
    setSelectedTaskId(newTask.id);
    setIsAddingNewTask(true);
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
      setIsAddingNewTask(false);
    }
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  // Render functions with direct state access to maintain input focus
  const renderNotesContent = () => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData.role || userData.role_id;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin' || userRole === 1 || userRole === 2;

    return (
      <div className="px-6 pb-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Notes Section */}
          <div className="border-r border-gray-200 pr-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Admin Notes
              {!isAdmin && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Read Only</span>
              )}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Admin Only)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => isAdmin && setAdminNotes(e.target.value)}
                  rows={12}
                  disabled={!isAdmin}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${
                    !isAdmin ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder={isAdmin ? "Enter admin notes here (not visible to user)..." : "Admin notes (read-only)"}
                />
                <p className="text-xs text-gray-500 mt-2">
                  🔒 These notes are only visible to admin and will not be shared with the user.
                </p>
              </div>

              {/* Admin Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Attachments</label>
                {isAdmin ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        // Handle admin file upload
                        console.log('Admin files:', e.target.files);
                      }}
                      className="hidden"
                      id="admin-notes-attachments"
                    />
                    <label htmlFor="admin-notes-attachments" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <svg className="mx-auto h-12 w-12 text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No attachments available</p>
                    <p className="text-xs text-gray-400">Admin only section</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* User Notes Section */}
        <div className="pl-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Notes</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Visible to User)</label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Enter notes here..."
              />
              <p className="text-xs text-gray-500 mt-2">
                👁️ These notes are visible to the user.
              </p>
            </div>

            {/* User Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Attachments</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    // Handle user file upload
                    const files = Array.from(e.target.files);
                    console.log('User files:', files);
                    // Convert to base64 or upload to S3
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setUserNotesAttachments(prev => [...prev, {
                          name: file.name,
                          size: file.size,
                          type: file.type,
                          data: reader.result
                        }]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="hidden"
                  id="user-notes-attachments"
                />
                <label htmlFor="user-notes-attachments" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, PNG, JPG up to 10MB</p>
                </label>
              </div>

              {/* Show uploaded files */}
              {userNotesAttachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {userNotesAttachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        {file.size && (
                          <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                        )}
                        {file.url && (
                          <a
                            href={file.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs ml-2"
                          >
                            Download
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => setUserNotesAttachments(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
        <button 
          onClick={handleSaveNotes}
          disabled={saving}
          className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
    );
  };

  const TasksContent = () => {
    const savedTasks = tasks.filter(t => t.title && t.title.trim() !== '');
    const hasNoTasks = savedTasks.length === 0 && !selectedTaskId;

    return (
      <div className="px-6 pb-6 pt-6">
        <div className="space-y-4">
          {/* Add Button aligned with table */}
          <div className="flex justify-between items-center">
            <div></div>
            <button
              type="button"
              onClick={addTask}
              className="w-12 h-12 bg-[#01334C] text-white rounded-full flex items-center justify-center hover:bg-[#00486D] transition-colors"
            >
              <AiOutlinePlus className="w-6 h-6" />
            </button>
          </div>

          {/* Show message if no tasks */}
          {hasNoTasks && (
            <div className="text-center py-8 text-gray-500">
              <p>No tasks yet. Click the + button to add a new task.</p>
            </div>
          )}

          {/* Tasks Table View */}
          {savedTasks.length > 0 && !selectedTaskId && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Header</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {savedTasks.map((task) => (
                    <tr 
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{task.title || 'Untitled'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {task.date ? new Date(task.date).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        }) : 'No date'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {task.type && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.type === 'urgent' ? 'bg-red-100 text-red-700' :
                            task.type === 'recurring' ? 'bg-blue-100 text-blue-700' :
                            task.type === 'non-recurring' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                        {task.description || 'No description'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Expanded Task Card (Edit Mode) */}
          {selectedTaskId && (
            <div className="border-2 border-blue-500 rounded-xl p-6 bg-white shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isAddingNewTask ? 'New Task' : 'Edit Task'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedTaskId(null);
                    setIsAddingNewTask(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Task Header (Title) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Task Header</label>
                    <input
                      type="text"
                      value={tasks.find(t => t.id === selectedTaskId)?.title || ''}
                      onChange={(e) => updateTask(selectedTaskId, 'title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter task header/title"
                    />
                  </div>

                  {/* Task Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={tasks.find(t => t.id === selectedTaskId)?.date || ''}
                      onChange={(e) => updateTask(selectedTaskId, 'date', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Task Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={tasks.find(t => t.id === selectedTaskId)?.description || ''}
                      onChange={(e) => updateTask(selectedTaskId, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      placeholder="Enter task description"
                    />
                  </div>

                  {/* Task Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Task</label>
                    <select
                      value={tasks.find(t => t.id === selectedTaskId)?.type || ''}
                      onChange={(e) => updateTask(selectedTaskId, 'type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="">Select type</option>
                      <option value="recurring">Recurring</option>
                      <option value="non-recurring">Non-Recurring</option>
                      <option value="urgent">Urgent</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => removeTask(selectedTaskId)}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete Task
                </button>
              </div>
            </div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={async () => {
                await handleSaveTasks();
                setSelectedTaskId(null);
                setIsAddingNewTask(false);
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

  const WebsiteDetailsContent = () => (
    <div className="px-6 pb-6 pt-6">
      <div className="space-y-4">
        {websites.map((website, index) => (
          <div key={website.id} className="flex items-end gap-4">
            {/* Website Type */}
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">Website Type</label>
              <input
                type="text"
                value={website.type}
                onChange={(e) => updateWebsite(website.id, 'type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website type"
              />
            </div>

            {/* Website URL */}
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">Website URL</label>
              <input
                type="url"
                value={website.url}
                onChange={(e) => updateWebsite(website.id, 'url', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website URL"
              />
            </div>

            {/* Login */}
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">Login</label>
              <input
                type="text"
                value={website.login}
                onChange={(e) => updateWebsite(website.id, 'login', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter login"
              />
            </div>

            {/* Password */}
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">Password</label>
              <div className="relative">
                <input
                  type={website.showPassword ? 'text' : 'password'}
                  value={website.password}
                  onChange={(e) => updateWebsite(website.id, 'password', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-[#E8EFF5] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(website.id)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {website.showPassword ? (
                    <FiEye className="w-5 h-5" />
                  ) : (
                    <FiEyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Add Button - Only show on first row */}
            {index === 0 && (
              <button
                type="button"
                onClick={addWebsite}
                className="w-12 h-12 bg-[#01334C] text-white rounded-full flex items-center justify-center hover:bg-[#00486D] transition-colors flex-shrink-0"
              >
                <AiOutlinePlus className="w-6 h-6" />
              </button>
            )}
          </div>
        ))}
        
        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveWebsites}
            disabled={saving}
            className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const OrganisationDetailsContent = () => (
    <div className="px-6 pb-6 pt-6">
      <div className="space-y-6">
        {/* Add Organization Button - Top Right */}
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

        {/* Organization Entries */}
        {organizations.map((org, orgIndex) => (
          <div key={org.id} className="border-2 border-gray-200 rounded-lg p-6 relative">
            {/* Delete Button - Show if more than 1 organization */}
            {organizations.length > 1 && (
              <button
                type="button"
                onClick={() => removeOrganization(org.id)}
                className="absolute top-4 right-4 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                title="Remove Organization"
              >
                ×
              </button>
            )}

            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Organization {orgIndex + 1}
            </h4>

            <div className="space-y-4">
              {/* Row 1: Organisation Type, Legal Name, Trade Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Organisation Type</label>
                  <input
                    type="text"
                    value={org.organisationType}
                    onChange={(e) => updateOrganization(org.id, 'organisationType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organisation type"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Legal Name</label>
                  <input
                    type="text"
                    value={org.legalName}
                    onChange={(e) => updateOrganization(org.id, 'legalName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter legal name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Trade Name</label>
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
                  <label className="block text-sm text-gray-600 mb-2">GSTIN</label>
                  <input
                    type="text"
                    value={org.gstin}
                    onChange={(e) => updateOrganization(org.id, 'gstin', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter GSTIN"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Incorporation Date</label>
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
                  <label className="block text-sm text-gray-600 mb-2">PAN File</label>
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
                  <label className="block text-sm text-gray-600 mb-2">TAN</label>
                  <input
                    type="text"
                    value={org.tan}
                    onChange={(e) => updateOrganization(org.id, 'tan', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter TAN"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">CIN</label>
                  <input
                    type="text"
                    value={org.cin}
                    onChange={(e) => updateOrganization(org.id, 'cin', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter CIN"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Registered Address</label>
                  <textarea
                    rows={3}
                    value={org.registeredAddress}
                    onChange={(e) => updateOrganization(org.id, 'registeredAddress', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder="Enter registered address"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveOrganisation}
            disabled={saving}
            className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

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
    { id: 'organisation-details', label: 'B. Organisation Details' },
    { id: 'website-details', label: 'C. Website Details' },
    { id: 'tasks', label: 'D. Tasks' },
    { id: 'notes', label: 'E. Notes' }
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
                  {section.id === 'website-details' && WebsiteDetailsContent()}
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





