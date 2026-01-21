import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import logo from "../../assets/logo.png";

function OrganizationsList() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await getUsersPageData();
      
      if (response.success && response.data) {
        const { organisations } = response.data;
        
        if (organisations && organisations.length > 0) {
          // Filter organizations that have at least one meaningful field
          const validOrgs = organisations.filter(org => {
            const hasLegalName = org.legal_name && org.legal_name.trim() !== '' && org.legal_name !== '-';
            const hasTradeName = org.trade_name && org.trade_name.trim() !== '' && org.trade_name !== '-';
            const hasGstin = org.gstin && org.gstin.trim() !== '' && org.gstin !== '-';
            return hasLegalName || hasTradeName || hasGstin;
          });
          
          setOrganizations(validOrgs.map(org => {
            // Debug: Log GSTIN value to help identify random values
            if (org.gstin && org.gstin.trim() !== '' && org.gstin !== '-') {
              console.log(`Organization ${org.id} has GSTIN:`, org.gstin);
            }
            
            return {
              id: org.id,
              legalName: org.legal_name || '-',
              tradeName: org.trade_name || '-',
              gstin: org.gstin || '-',
              organisationType: org.organisation_type || '-',
              incorporationDate: org.incorporation_date || null
            };
          }));
        } else {
          setOrganizations([]);
        }
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

  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
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
            onClick={() => navigate("/documents")}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Documents
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">My Organizations</h1>
          <p className="text-gray-600 mt-1">Select a company to view its documents</p>
        </div>

        {/* Organizations Grid */}
        {organizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/company-documents/${org.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-[#01334C] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={logo} 
                      alt="Company Logo" 
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {org.legalName !== '-' ? org.legalName : org.tradeName}
                    </h3>
                    {org.tradeName !== '-' && org.legalName !== '-' && org.tradeName !== org.legalName && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {org.tradeName}
                      </p>
                    )}
                    {org.organisationType !== '-' && (
                      <p className="text-xs text-gray-400 mt-1">
                        {org.organisationType}
                      </p>
                    )}
                    {org.gstin !== '-' && (
                      <p className="text-xs font-mono text-gray-600 mt-2">
                        GSTIN: {org.gstin}
                      </p>
                    )}
                    {org.incorporationDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Since: {formatDate(org.incorporationDate)}
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-gray-500 text-sm">No organizations found</p>
            <p className="text-gray-400 text-xs mt-1">Add organizations in My Companies section</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationsList;

