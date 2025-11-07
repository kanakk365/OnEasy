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
    { id: 1, title: '', description: '', type: '' }
  ]);
  const [notes, setNotes] = useState('');
  
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
            type: t.task_type || ''
          })));
        }
        
        // Populate Notes
        setNotes(user.notes || '');
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
          type: t.type
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
        notes
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
    setTasks([...tasks, { 
      id: Date.now(), 
      title: '', 
      description: '', 
      type: '' 
    }]);
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  // Render functions with direct state access to maintain input focus
  const renderNotesContent = () => (
    <div className="px-6 pb-6 pt-6">
      <div className="space-y-6">
        {/* Notes Textarea */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Enter your notes here..."
          />
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveNotes}
            disabled={saving}
            className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const TasksContent = () => (
    <div className="px-6 pb-6 pt-6">
      <div className="space-y-6">
        {/* Add Button in top-right */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addTask}
            className="w-12 h-12 bg-[#01334C] text-white rounded-full flex items-center justify-center hover:bg-[#00486D] transition-colors"
          >
            <AiOutlinePlus className="w-6 h-6" />
          </button>
        </div>

        {/* Task Rows */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Task Title */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Task Title</label>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Task Description</label>
                <textarea
                  value={task.description}
                  onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="Enter task description"
                />
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Task Type</label>
                <select
                  value={task.type}
                  onChange={(e) => updateTask(task.id, 'type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Type of task</option>
                  <option value="recurring">Recurring</option>
                  <option value="non-recurring">Non-Recurring</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveTasks}
            disabled={saving}
            className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

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

