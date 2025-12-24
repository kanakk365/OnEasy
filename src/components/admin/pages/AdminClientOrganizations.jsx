import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../utils/api";
import logo from "../../../assets/logo.png";

function AdminClientOrganizations() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [clientInfo, setClientInfo] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadClientAndOrganizations();
    }
  }, [userId]);

  const loadClientAndOrganizations = async () => {
    try {
      setLoading(true);

      // Fetch client info
      const clientResponse = await apiClient.get(`/admin/clients`).catch(() => ({ success: false, data: [] }));
      if (clientResponse.success && clientResponse.data) {
        const client = clientResponse.data.find(c => c.user_id === userId);
        if (client) {
          setClientInfo(client);
        }
      }

      // Fetch organizations
      const orgResponse = await apiClient.get(`/users-page/user-data/${userId}`).catch(() => ({ 
        success: false, 
        data: { organisations: [] }
      }));
      
      if (orgResponse.success && orgResponse.data && orgResponse.data.organisations) {
        const validOrgs = orgResponse.data.organisations.filter(org => {
          const hasLegalName = org.legal_name && org.legal_name.trim() !== '' && org.legal_name !== 'N/A';
          const hasTradeName = org.trade_name && org.trade_name.trim() !== '' && org.trade_name !== 'N/A';
          const hasGstin = org.gstin && org.gstin.trim() !== '' && org.gstin !== 'N/A';
          return hasLegalName || hasTradeName || hasGstin;
        });
        setOrganizations(validOrgs);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/client-documents/${userId}`)}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Client Documents
          </button>

          {clientInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Directors/Partners Documents</h1>
              <div className="mt-2">
                <p className="text-gray-600">
                  <span className="font-medium">{clientInfo.name || 'N/A'}</span>
                  {clientInfo.email && <span className="text-gray-500"> • {clientInfo.email}</span>}
                </p>
                <p className="text-sm text-gray-500 font-mono mt-1">{clientInfo.user_id}</p>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Organization</h2>
          <p className="text-gray-600 mb-6">Choose an organization to view its documents</p>
        </div>

        {/* Organizations List */}
        {organizations.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GSTIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.map((org, index) => (
                  <tr
                    key={org.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-full bg-[#01334C] flex items-center justify-center overflow-hidden mb-2">
                        <img
                          src={logo}
                          alt="Company Logo"
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {org.legal_name !== 'N/A' ? org.legal_name : org.trade_name}
                        </p>
                        {org.trade_name !== 'N/A' && org.legal_name !== 'N/A' && org.trade_name !== org.legal_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Trade: {org.trade_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-gray-900">
                        {org.gstin}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {org.organisation_type || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/client-company-documents/${userId}/${org.id}`, { state: { orgId: org.id, userId } })}
                        className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-md hover:bg-[#00486D] transition-colors font-medium"
                      >
                        View Documents
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.593 23.593 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-sm mb-2">No organizations found</p>
            <p className="text-gray-400 text-xs">This client has no registered organizations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClientOrganizations;

