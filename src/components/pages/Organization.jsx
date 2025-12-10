import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsersPageData, updateUsersPageData } from '../../utils/usersPageApi';
import { BsCalendar3 } from 'react-icons/bs';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { AiOutlinePlus } from 'react-icons/ai';
import logo from '../../assets/logo.png';

function Organization() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      const response = await getUsersPageData();
      
      if (response.success && response.data) {
        const { organisations } = response.data;
        
        if (organisations && organisations.length > 0) {
          setOrganizations(organisations.map(org => {
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
            
            return {
              id: org.id,
              organisationType: org.organisation_type || 'N/A',
              legalName: org.legal_name || 'N/A',
              tradeName: org.trade_name || 'N/A',
              gstin: org.gstin || 'N/A',
              incorporationDate: org.incorporation_date || 'N/A',
              tan: org.tan || 'N/A',
              cin: org.cin || 'N/A',
              registeredAddress: org.registered_address || 'N/A',
              panFile: org.pan_file || null,
              websites: websites.map((w, index) => {
                // Ensure unique IDs - use existing id or generate one with index offset
                const baseId = Date.now();
                return {
                  ...w, // Spread to create a new object
                  id: w.id || (baseId + index * 1000), // Ensure unique IDs with index offset
                  showPassword: w.showPassword || false
                };
              })
            };
          }));
        }
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Website management functions
  const handleEditWebsites = () => {
    if (selectedOrg) {
      handleEditOrganization();
    }
  };

  const addWebsite = () => {
    if (!editingOrg) {
      // If not in edit mode, enter edit mode first
      handleEditWebsites();
      return;
    }
    
    const updatedOrg = {
      ...editingOrg,
      websites: [...(editingOrg.websites || []), {
        id: Date.now(),
        type: '',
        url: '',
        login: '',
        password: '',
        showPassword: false
      }]
    };
    setEditingOrg(updatedOrg);
  };

  const removeWebsite = (websiteId) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      websites: (editingOrg.websites || []).filter(w => w.id !== websiteId)
    };
    setEditingOrg(updatedOrg);
  };

  const updateWebsite = (websiteId, field, value) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      websites: (editingOrg.websites || []).map(website => {
        // Create a new object for the matching website, keep others as-is
        if (website.id === websiteId) {
          return { ...website, [field]: value };
        }
        // Return a copy to avoid reference issues
        return { ...website };
      })
    };
    setEditingOrg(updatedOrg);
  };

  const togglePasswordVisibility = (websiteId) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      websites: (editingOrg.websites || []).map(website =>
        website.id === websiteId ? { ...website, showPassword: !website.showPassword } : website
      )
    };
    setEditingOrg(updatedOrg);
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

  const handleEditOrganization = () => {
    // Create a copy with websites initialized if needed
    let websites = selectedOrg.websites || [];
    if (!Array.isArray(websites)) websites = [];
    
    // Ensure each website has a unique ID
    let idCounter = Date.now();
    const orgToEdit = {
      ...selectedOrg,
      websites: websites.map((w) => ({
        ...w, // Spread to create a new object
        id: w.id || (idCounter++), // Ensure unique IDs with counter
        showPassword: w.showPassword || false
      }))
    };
    setEditingOrg(orgToEdit);
  };

  const updateOrganizationField = (field, value) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      [field]: value
    };
    setEditingOrg(updatedOrg);
  };

  const handleSaveOrganization = async () => {
    if (!editingOrg) return;
    
    // Validate that at least one required field is filled
    const hasLegalName = editingOrg.legalName && editingOrg.legalName.trim() !== '' && editingOrg.legalName !== 'N/A';
    const hasTradeName = editingOrg.tradeName && editingOrg.tradeName.trim() !== '' && editingOrg.tradeName !== 'N/A';
    const hasGstin = editingOrg.gstin && editingOrg.gstin.trim() !== '' && editingOrg.gstin !== 'N/A';
    
    // At least one of legal name, trade name, or GST number should be filled
    if (!hasLegalName && !hasTradeName && !hasGstin) {
      alert('⚠️ Please fill at least one of the following: Legal Name, Trade Name, or GST Number');
      return;
    }
    
    try {
      setSaving(true);
      
      // Find the organization in the organizations array and update it
      const updatedOrganizations = organizations.map(org =>
        org.id === editingOrg.id ? editingOrg : org
      );
      
      // Filter out empty organizations (those with no meaningful data)
      const validOrganizations = updatedOrganizations.filter(org => {
        const hasLegalName = org.legalName && org.legalName.trim() !== '' && org.legalName !== 'N/A';
        const hasTradeName = org.tradeName && org.tradeName.trim() !== '' && org.tradeName !== 'N/A';
        const hasGstin = org.gstin && org.gstin.trim() !== '' && org.gstin !== 'N/A';
        return hasLegalName || hasTradeName || hasGstin;
      });
      
      // If no valid organizations, don't save
      if (validOrganizations.length === 0) {
        alert('⚠️ Please fill at least one organization with required details before saving.');
        setSaving(false);
        return;
      }
      
      const payload = {
        organisations: validOrganizations.map(org => ({
          organisationType: org.organisationType !== 'N/A' ? org.organisationType : '',
          legalName: org.legalName !== 'N/A' ? org.legalName : '',
          tradeName: org.tradeName !== 'N/A' ? org.tradeName : '',
          gstin: org.gstin !== 'N/A' ? org.gstin : '',
          incorporationDate: org.incorporationDate !== 'N/A' ? org.incorporationDate : '',
          panFile: org.panFile,
          tan: org.tan !== 'N/A' ? org.tan : '',
          cin: org.cin !== 'N/A' ? org.cin : '',
          registeredAddress: org.registeredAddress !== 'N/A' ? org.registeredAddress : '',
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
        alert('✅ Organization Details saved successfully!');
        setOrganizations(validOrganizations);
        // If the saved org is still valid, keep it selected, otherwise clear selection
        const savedOrg = validOrganizations.find(o => o.id === editingOrg.id);
        if (savedOrg) {
          setSelectedOrg(savedOrg);
        } else {
          setSelectedOrg(null);
        }
        setEditingOrg(null);
        await loadOrganizationData();
      }
    } catch (error) {
      console.error('❌ Error saving organization:', error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrg(null);
    // If it was a new organization, remove it from the list
    if (selectedOrg && !selectedOrg.id || selectedOrg.id > Date.now() - 10000) {
      // It's a new organization (created less than 10 seconds ago), remove it
      setOrganizations(organizations.filter(o => o.id !== selectedOrg.id));
      setSelectedOrg(null);
    } else {
      // Restore original selectedOrg
      const org = organizations.find(o => o.id === selectedOrg.id);
      if (org) setSelectedOrg(org);
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
    setSelectedOrg(newOrg);
    setEditingOrg(newOrg);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01334C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  // Empty state is now handled in the default return below

  // If an organization is selected, show detailed view
  if (selectedOrg) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedOrg(null)}
          className="mb-6 flex items-center text-[#01334C] hover:text-[#00486D] font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to List
        </button>

        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingOrg ? (editingOrg.legalName !== 'N/A' ? editingOrg.legalName : 'Edit Organization') : selectedOrg.legalName}
            </h1>
            {!editingOrg && (
              <p className="text-gray-600 mt-2">
                View organization information
              </p>
            )}
          </div>
          {!editingOrg && (
            <button
              onClick={handleEditOrganization}
              className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Organization
            </button>
          )}
        </div>

        {/* Organization Details Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Row 1: Organisation Type, Legal Name, Trade Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organisation Type
                  </label>
                  {editingOrg ? (
                    <input
                      type="text"
                      value={editingOrg.organisationType !== 'N/A' ? editingOrg.organisationType : ''}
                      onChange={(e) => updateOrganizationField('organisationType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter organisation type"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900">{selectedOrg.organisationType}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Name
                  </label>
                  {editingOrg ? (
                    <input
                      type="text"
                      value={editingOrg.legalName !== 'N/A' ? editingOrg.legalName : ''}
                      onChange={(e) => updateOrganizationField('legalName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter legal name"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 font-semibold">{selectedOrg.legalName}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trade Name
                  </label>
                  {editingOrg ? (
                    <input
                      type="text"
                      value={editingOrg.tradeName !== 'N/A' ? editingOrg.tradeName : ''}
                      onChange={(e) => updateOrganizationField('tradeName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter trade name"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900">{selectedOrg.tradeName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: GSTIN, Incorporation Date, PAN File */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GSTIN
                  </label>
                  {editingOrg ? (
                    <input
                      type="text"
                      value={editingOrg.gstin !== 'N/A' ? editingOrg.gstin : ''}
                      onChange={(e) => updateOrganizationField('gstin', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter GSTIN"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 font-mono">{selectedOrg.gstin}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incorporation Date
                  </label>
                  {editingOrg ? (
                    <div className="relative">
                      <input
                        type="date"
                        value={editingOrg.incorporationDate !== 'N/A' ? editingOrg.incorporationDate : ''}
                        onChange={(e) => updateOrganizationField('incorporationDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <BsCalendar3 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                      <BsCalendar3 className="text-gray-400 mr-2" />
                      <p className="text-gray-900">{formatDate(selectedOrg.incorporationDate)}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN File
                  </label>
                  {editingOrg ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={editingOrg.panFile ? 'File uploaded' : 'No file chosen'}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const base64 = await fileToBase64(file);
                              updateOrganizationField('panFile', base64);
                            }
                          }}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <span className="px-4 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block">
                          {editingOrg.panFile ? 'Change' : 'Upload'}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900">
                        {selectedOrg.panFile ? (
                          <span className="text-green-600 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Uploaded
                          </span>
                        ) : (
                          'Not uploaded'
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: TAN, CIN, Registered Address */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TAN
                  </label>
                  {editingOrg ? (
                    <input
                      type="text"
                      value={editingOrg.tan !== 'N/A' ? editingOrg.tan : ''}
                      onChange={(e) => updateOrganizationField('tan', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter TAN"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 font-mono">{selectedOrg.tan}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIN
                  </label>
                  {editingOrg ? (
                    <input
                      type="text"
                      value={editingOrg.cin !== 'N/A' ? editingOrg.cin : ''}
                      onChange={(e) => updateOrganizationField('cin', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter CIN"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 font-mono">{selectedOrg.cin}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registered Address
                  </label>
                  {editingOrg ? (
                    <textarea
                      rows={3}
                      value={editingOrg.registeredAddress !== 'N/A' ? editingOrg.registeredAddress : ''}
                      onChange={(e) => updateOrganizationField('registeredAddress', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      placeholder="Enter registered address"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900">{selectedOrg.registeredAddress}</p>
                    </div>
                  )}
                </div>
              </div>

                {/* Website Details Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Website Details</h3>
                  {editingOrg && (
                    <button
                      onClick={addWebsite}
                      className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
                    >
                      <AiOutlinePlus className="w-4 h-4 mr-2" />
                      Add Website
                    </button>
                  )}
                </div>

                {/* Empty State Message */}
                {!editingOrg && (!selectedOrg.websites || selectedOrg.websites.length === 0 || selectedOrg.websites.every(w => !w.url || w.url.trim() === '')) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No websites added yet. Click "Edit Organization" to add websites.</p>
                  </div>
                )}

                {/* Saved Websites Table */}
                {((editingOrg || selectedOrg)?.websites || []).filter(w => w.url && w.url.trim() !== '').length > 0 && (
                  <div className="overflow-x-auto mb-4 table-responsive">
                    <table className="w-full border-collapse bg-white min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-300">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Type</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">URL</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Login</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(editingOrg || selectedOrg)?.websites?.filter(w => w.url && w.url.trim() !== '').map((website) => (
                          <tr key={website.id} className="bg-white border-b border-gray-200">
                            <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                              {editingOrg ? (
                                <select
                                  value={website.type}
                                  onChange={(e) => updateWebsite(website.id, 'type', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm appearance-none bg-white"
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
                            <td className="px-4 py-3 border border-gray-300 text-sm">
                              {editingOrg ? (
                                <input
                                  type="url"
                                  value={website.url}
                                  onChange={(e) => updateWebsite(website.id, 'url', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Enter URL"
                                />
                              ) : (
                                website.url ? (
                                  <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {website.url}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">N/A</span>
                                )
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                              {editingOrg ? (
                                <input
                                  type="text"
                                  value={website.login}
                                  onChange={(e) => updateWebsite(website.id, 'login', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Enter login"
                                />
                              ) : (
                                website.login || 'N/A'
                              )}
                            </td>
                            <td className="px-4 py-3 border border-gray-300 text-sm">
                              {editingOrg ? (
                                <div className="relative">
                                  <input
                                    type={website.showPassword ? 'text' : 'password'}
                                    value={website.password}
                                    onChange={(e) => updateWebsite(website.id, 'password', e.target.value)}
                                    className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                                    placeholder="Enter password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(website.id)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  >
                                    {website.showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-900">{website.password ? '••••••••' : 'N/A'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* New Website Entry Forms */}
                {editingOrg && (editingOrg.websites || []).filter(w => !w.url || w.url.trim() === '').length > 0 && (
                  <div className="space-y-4">
                    {(editingOrg.websites || []).filter(w => !w.url || w.url.trim() === '').map((website) => (
                      <div key={website.id} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Website Type</label>
                            <select
                              value={website.type}
                              onChange={(e) => updateWebsite(website.id, 'type', e.target.value)}
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
                              onChange={(e) => updateWebsite(website.id, 'url', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Enter website URL"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Login</label>
                            <input
                              type="text"
                              value={website.login}
                              onChange={(e) => updateWebsite(website.id, 'login', e.target.value)}
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
                                onChange={(e) => updateWebsite(website.id, 'password', e.target.value)}
                                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter password"
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(website.id)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {website.showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
          
          {/* Save/Cancel Buttons for Organization Details and Websites */}
          {editingOrg && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrganization}
                disabled={saving}
                className="px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium disabled:opacity-50 inline-flex items-center"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: Show table view
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            List Of Companies
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Your registered organizations
          </p>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="px-5 py-2 text-sm text-[#01334C] hover:text-[#00486D] font-medium hover:underline"
        >
          View all
        </button>
      </div>

      {/* Table and Add Button */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1 bg-white rounded-xl overflow-hidden transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
        <div className="overflow-x-auto table-responsive">
          <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Logo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                GST Number
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {organizations.map((org, index) => (
              <tr 
                key={org.id} 
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
              >
                {/* Logo */}
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-full bg-[#01334C] flex items-center justify-center overflow-hidden">
                    <img 
                      src={logo} 
                      alt="Company Logo" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </td>

                {/* Name */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {org.legalName !== 'N/A' ? org.legalName : org.tradeName}
                    </p>
                    {org.tradeName !== 'N/A' && org.legalName !== 'N/A' && org.tradeName !== org.legalName && (
                      <p className="text-xs text-gray-500 mt-1">
                        Trade: {org.tradeName}
                      </p>
                    )}
                    {org.organisationType !== 'N/A' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {org.organisationType}
                      </p>
                    )}
                  </div>
                </td>

                {/* GST Number */}
                <td className="px-6 py-4">
                  <p className="text-sm font-mono text-gray-900">
                    {org.gstin}
                  </p>
                  {org.incorporationDate !== 'N/A' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Since: {formatDate(org.incorporationDate)}
                    </p>
                  )}
                </td>

                {/* Action */}
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setSelectedOrg(org)}
                    className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors font-medium"
                  >
                    View all
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </div>
        
        {/* Add Organization Button */}
        <button
          type="button"
          onClick={addOrganization}
          className="w-12 h-12 bg-[#01334C] text-white rounded-full flex items-center justify-center hover:bg-[#00486D] transition-colors flex-shrink-0"
          title="Add Organization"
        >
          <AiOutlinePlus className="w-6 h-6" />
        </button>
      </div>

      {/* Empty State Message */}
      {organizations.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
          <p className="text-gray-600">
            No organizations yet. Click the + button above to add a new organization.
          </p>
        </div>
      )}

      {/* Edit Button */}
      <div className="mt-6 flex justify-end">
        {/* <button 
          onClick={() => navigate('/settings')}
          className="px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
         
        </button> */}
      </div>
    </div>
  );
}

export default Organization;