import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsersPageData } from '../../utils/usersPageApi';
import { BsCalendar3 } from 'react-icons/bs';
import logo from '../../assets/logo.png';

function Organization() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);

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
          setOrganizations(organisations.map(org => ({
            id: org.id,
            organisationType: org.organisation_type || 'N/A',
            legalName: org.legal_name || 'N/A',
            tradeName: org.trade_name || 'N/A',
            gstin: org.gstin || 'N/A',
            incorporationDate: org.incorporation_date || 'N/A',
            tan: org.tan || 'N/A',
            cin: org.cin || 'N/A',
            registeredAddress: org.registered_address || 'N/A',
            panFile: org.pan_file || null
          })));
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

  if (!organizations || organizations.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
        <div className="bg-white rounded-xl p-12 text-center transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
          <div className="mb-6">
            <svg 
              className="w-24 h-24 mx-auto text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            No Organizations Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please add your organization details in the Profile page first.
          </p>
          <button 
            onClick={() => navigate('/settings')}
            className="inline-block px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{selectedOrg.legalName}</h1>
          <p className="text-gray-600 mt-2">
            View organization information. To edit, go to{' '}
            <button onClick={() => navigate('/settings')} className="text-blue-600 hover:underline">
              Profile → Organization Details
            </button>
          </p>
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
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900">{selectedOrg.organisationType}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900 font-semibold">{selectedOrg.legalName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trade Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900">{selectedOrg.tradeName}</p>
                  </div>
                </div>
              </div>

              {/* Row 2: GSTIN, Incorporation Date, PAN File */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GSTIN
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900 font-mono">{selectedOrg.gstin}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incorporation Date
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                    <BsCalendar3 className="text-gray-400 mr-2" />
                    <p className="text-gray-900">{formatDate(selectedOrg.incorporationDate)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN File
                  </label>
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
                </div>
              </div>

              {/* Row 3: TAN, CIN, Registered Address */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TAN
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900 font-mono">{selectedOrg.tan}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIN
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900 font-mono">{selectedOrg.cin}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registered Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900">{selectedOrg.registeredAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button 
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Organization
            </button>
          </div>
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

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
        <table className="w-full">
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

      {/* Edit Button */}
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => navigate('/settings')}
          className="px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Organizations
        </button>
      </div>
    </div>
  );
}

export default Organization;










