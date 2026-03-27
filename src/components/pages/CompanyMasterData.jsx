import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { BsBuilding } from "react-icons/bs";
import { FiChevronLeft } from "react-icons/fi";

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
        <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022B51] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-4 lg:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - matching OrganizationBusinessDocuments layout */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
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
              className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-1"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Company Master Data</h1>
          </div>
          <p className="text-gray-500 text-sm italic ml-8 lg:ml-9">Select a document category to view and manage</p>
        </div>

        {/* Company Info Card with building icon - matching OrganizationBusinessDocuments */}
        {organization && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,-0,0,0.05)] border border-gray-100 p-4 lg:p-5 mb-4 lg:mb-6 flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
              <BsBuilding className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                {organization.legalName !== '-' ? organization.legalName : organization.tradeName}
              </h2>
              {organization.tradeName !== '-' && organization.legalName !== '-' && organization.tradeName !== organization.legalName && (
                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 truncate">{organization.tradeName}</p>
              )}
              {organization.gstin !== '-' && (
                <p className="text-[11px] lg:text-xs text-gray-400 mt-0.5 font-mono">GSTIN: {organization.gstin}</p>
              )}
            </div>
          </div>
        )}

        {/* Master Data Categories - Vertical list like OrganizationBusinessDocuments */}
        <div className="space-y-3 sm:space-y-4">
          {masterDataCategories.map((category) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,-0,0,0.05)] border border-gray-100 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)] flex items-center justify-between"
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
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 ${colorClasses.iconBg} group-hover:bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors`}>
                    <div className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center">
                      {category.icon}
                    </div>
                  </div>
                  <div className="mt-1 sm:mt-0">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-white transition-colors">{category.title}</h3>
                    <p className="text-xs lg:text-sm text-gray-400 group-hover:text-white/60 mt-0.5 lg:mt-1 transition-colors leading-relaxed pr-2">{category.description}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
