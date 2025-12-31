import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";

function CompanyMasterData() {
  const navigate = useNavigate();
  const { orgId, userId } = useParams(); // userId for admin, orgId for both
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine if this is admin view
  const isAdmin = !!userId;
  const currentOrgId = orgId;

  useEffect(() => {
    if (currentOrgId) {
      loadOrganization();
    }
  }, [currentOrgId, userId]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      let orgResponse;
      
      if (isAdmin) {
        // Admin view - fetch organization by userId and orgId
        orgResponse = await apiClient.get(`/users-page/user-data/${userId}`).catch(() => ({
          success: false,
          data: { organisations: [] }
        }));
      } else {
        // User view
        orgResponse = await getUsersPageData();
      }

      if (orgResponse.success && orgResponse.data && orgResponse.data.organisations) {
        const org = orgResponse.data.organisations.find(o => o.id === parseInt(currentOrgId));
        if (org) {
          setOrganization({
            id: org.id,
            legalName: org.legal_name || '-',
            tradeName: org.trade_name || '-',
            gstin: org.gstin || '-',
            organisationType: org.organisation_type || '-'
          });
        }
      }
    } catch (error) {
      console.error("Error loading organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const masterDataCategories = [
    {
      id: "client-data",
      title: "Client Data",
      description: "View and manage client data documents",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "blue"
    },
    {
      id: "accounting",
      title: "Accounting",
      description: "View and manage accounting documents",
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: "green"
    },
    {
      id: "compliance",
      title: "Compliance",
      description: "View and manage compliance documents",
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "purple"
    },
    {
      id: "annual-compliance",
      title: "Annual Compliance",
      description: "View and manage annual compliance documents",
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "orange"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        iconBg: "bg-blue-50"
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-800",
        iconBg: "bg-green-50"
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        iconBg: "bg-purple-50"
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        iconBg: "bg-orange-50"
      }
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
            onClick={() => {
              if (isAdmin) {
                navigate(`/admin/client-company-documents/${userId}/${currentOrgId}/business`, { state: { orgId: currentOrgId, userId } });
              } else {
                const orgIdFromState = location.state?.orgId || currentOrgId;
                if (orgIdFromState) {
                  navigate(`/company-documents/${orgIdFromState}/business`, { state: { orgId: orgIdFromState } });
                } else {
                  navigate("/organizations-list");
                }
              }
            }}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Business Documents
          </button>

          {organization && (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {organization.legalName !== '-' ? organization.legalName : organization.tradeName}
              </h1>
              {organization.tradeName !== '-' && organization.legalName !== '-' && organization.tradeName !== organization.legalName && (
                <p className="text-gray-600 mt-1">{organization.tradeName}</p>
              )}
              {organization.gstin !== '-' && (
                <p className="text-sm text-gray-500 mt-1 font-mono">GSTIN: {organization.gstin}</p>
              )}
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Master Data</h2>
        </div>

        {/* Master Data Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {masterDataCategories.map((category) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  if (category.id === "client-data") {
                    if (isAdmin) {
                      navigate(`/admin/client-company-documents/${userId}/${currentOrgId}/business/company-master-data/client-data`, { state: { orgId: currentOrgId, userId } });
                    } else {
                      navigate(`/company-documents/${currentOrgId}/business/company-master-data/client-data`, { state: { orgId: currentOrgId } });
                    }
                  } else if (category.id === "accounting") {
                    if (isAdmin) {
                      navigate(`/admin/client-company-documents/${userId}/${currentOrgId}/business/company-master-data/accounting`, { state: { orgId: currentOrgId, userId } });
                    } else {
                      navigate(`/company-documents/${currentOrgId}/business/company-master-data/accounting`, { state: { orgId: currentOrgId } });
                    }
                  } else if (category.id === "compliance") {
                    if (isAdmin) {
                      navigate(`/admin/client-company-documents/${userId}/${currentOrgId}/business/company-master-data/compliance`, { state: { orgId: currentOrgId, userId } });
                    } else {
                      navigate(`/company-documents/${currentOrgId}/business/company-master-data/compliance`, { state: { orgId: currentOrgId } });
                    }
                  } else if (category.id === "annual-compliance") {
                    if (isAdmin) {
                      navigate(`/admin/client-company-documents/${userId}/${currentOrgId}/business/company-master-data/annual-compliance`, { state: { orgId: currentOrgId, userId } });
                    } else {
                      navigate(`/company-documents/${currentOrgId}/business/company-master-data/annual-compliance`, { state: { orgId: currentOrgId } });
                    }
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${colorClasses.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CompanyMasterData;

