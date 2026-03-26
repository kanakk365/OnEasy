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
      <div className="min-h-screen pt-16 lg:pt-0 bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022B51] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-12">
        {/* Header - matching OrganizationBusinessDocuments layout */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
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
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Company Master Data</h1>
          </div>
          <p className="text-gray-500 italic ml-9">Select a document category to view and manage</p>
        </div>

        {/* Company Info Card with building icon - matching OrganizationBusinessDocuments */}
        {organization && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
              <BsBuilding className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {organization.legalName !== '-' ? organization.legalName : organization.tradeName}
              </h2>
              {organization.tradeName !== '-' && organization.legalName !== '-' && organization.tradeName !== organization.legalName && (
                <p className="text-sm text-gray-500 mt-0.5">{organization.tradeName}</p>
              )}
              {organization.gstin !== '-' && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">GSTIN: {organization.gstin}</p>
              )}
            </div>
          </div>
        )}

        {/* Master Data Categories - Vertical list like OrganizationBusinessDocuments */}
        <div className="space-y-4">
          {masterDataCategories.map((category) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)] flex items-center justify-between"
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
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${colorClasses.iconBg} group-hover:bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-white transition-colors">{category.title}</h3>
                    <p className="text-sm text-gray-400 group-hover:text-white/60 mt-0.5 transition-colors">{category.description}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CompanyMasterData;
