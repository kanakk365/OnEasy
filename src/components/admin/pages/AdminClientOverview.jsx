import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/api';

function AdminClientOverview() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, services, compliance, subscriptions
  const [expandedSection, setExpandedSection] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [expandedOrgId, setExpandedOrgId] = useState(null);
  const [documentUrls, setDocumentUrls] = useState({});

  useEffect(() => {
    fetchClientDetails();
    fetchClientProfile();
  }, [userId]);

  const fetchClientDetails = async () => {
    try {
      const response = await apiClient.get('/admin/clients');
      
      if (response.success) {
        const clientData = response.data.find(c => c.user_id === userId);
        if (clientData) {
          setClient(clientData);
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
        setAdminNotes(response.data.user?.admin_notes || '');
        
        // Fetch signed URLs for documents if they're S3 URLs
        await fetchDocumentSignedUrls(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching client profile:', error);
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

  const handleSaveAdminNotes = async () => {
    try {
      setSavingNotes(true);
      const response = await apiClient.post('/admin/update-client-notes', {
        userId,
        adminNotes,
        userNotes: clientProfile?.user?.user_notes || ''
      });

      if (response.success) {
        alert('Admin notes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving admin notes:', error);
      alert('Failed to save admin notes');
    } finally {
      setSavingNotes(false);
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
      <div className="bg-white rounded-xl p-5 mb-6 transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'compliance'
                ? 'bg-[#01334C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Compliance
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
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
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Organisation Details</h3>
              <svg className={`w-5 h-5 transition-transform ${expandedSection === 'organisation' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'organisation' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                {clientProfile.user?.organisations && clientProfile.user.organisations.length > 0 ? (
                  <div className="space-y-4">
                    <table className="w-full text-sm table-fixed">
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
                            {expandedOrgId === idx && (
                              <tr className="bg-white">
                                <td colSpan="7" className="p-6">
                                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{org.legal_name || 'Organization Details'}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {/* Column 1 */}
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Type</label>
                                          <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.organisation_type || 'N/A'}</div>
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
                                          <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.legal_name || 'N/A'}</div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Incorporation Date</label>
                                          <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {org.incorporation_date ? new Date(org.incorporation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
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
                                          <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.trade_name || 'N/A'}</div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">PAN File</label>
                                          <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                                            {org.pan_file ? (
                                              <a href={org.pan_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a>
                                            ) : (
                                              'Not uploaded'
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
                                          <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{org.registered_address || 'N/A'}</div>
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
                ) : (
                  <p className="text-gray-600">No organisation details available</p>
                )}
              </div>
            )}
          </div>

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
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                {clientProfile.tasks && clientProfile.tasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Title</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientProfile.tasks.map((task, idx) => (
                          <tr key={idx} className="border-b border-gray-200">
                            <td className="px-4 py-2 text-gray-600">{task.title || 'N/A'}</td>
                            <td className="px-4 py-2 text-gray-600">{task.date || 'N/A'}</td>
                            <td className="px-4 py-2 text-gray-600">{task.description || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No tasks available</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012] overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'notes' ? null : 'notes')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              <svg className={`w-5 h-5 transition-transform ${expandedSection === 'notes' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'notes' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Admin Notes - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Editable)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                      placeholder="Add admin notes here..."
                    />
                    <button
                      onClick={handleSaveAdminNotes}
                      disabled={savingNotes}
                      className="mt-2 px-4 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors disabled:opacity-50"
                    >
                      {savingNotes ? 'Saving...' : 'Save Admin Notes'}
                    </button>
                  </div>

                  {/* User Notes - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Notes (Read Only)</label>
                    <textarea
                      value={clientProfile.user?.user_notes || ''}
                      readOnly
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      placeholder="No user notes"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {/* Client Card - Same as Profile */}
          <div className="bg-white rounded-xl overflow-hidden border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            {/* Top Section - Light Blue Background */}
            <div className="bg-blue-50 p-6 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[#01334C] text-white flex items-center justify-center font-semibold text-lg">
                  {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                </div>
                
                {/* Name */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{client.name || 'Unknown'}</h2>
                </div>

                {/* Email */}
                <div className="text-sm text-gray-600">
                  {client.email || 'N/A'}
                </div>

                {/* Phone */}
                <div className="text-sm text-gray-600">
                  {client.phone || 'N/A'}
                </div>

                {/* Status Badge */}
                {getStatusBadge(client)}
              </div>
            </div>

            {/* Bottom Section - White Background */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Ticket ID */}
                  {client.ticket_id && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Ticket ID:</span>
                      <p className="text-gray-900 mt-1">{client.ticket_id}</p>
                    </div>
                  )}

                  {/* Package */}
                  {client.package_name && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Package:</span>
                      <p className="text-gray-900 mt-1">
                        {client.package_name} - <span className="text-green-600 font-semibold">₹{client.package_price?.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  )}

                  {/* Payment Date */}
                  {client.payment_date && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Payment Date:</span>
                      <p className="text-gray-900 mt-1">{formatDate(client.payment_date)}</p>
                    </div>
                  )}

                  {/* Company Name */}
                  {client.company_name && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-700">Company:</span>
                      <p className="text-gray-900 mt-1">{client.company_name}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-6">
                  {client.ticket_id && (
                    <button
                      onClick={() => navigate(`/admin/client-details/${client.ticket_id}`)}
                      className="px-4 py-2 text-sm bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                  )}
                  {client.team_fill_requested && !client.registration_submitted && (
                    <button
                      onClick={() => navigate(`/admin/fill-form/${client.ticket_id}`)}
                      className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap"
                    >
                      Fill Form
                    </button>
                  )}
                  {client.team_fill_requested && client.registration_submitted && (
                    <div className="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Form Filled
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
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
    </div>
  );
}

export default AdminClientOverview;

