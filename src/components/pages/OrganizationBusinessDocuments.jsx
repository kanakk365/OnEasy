import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";
import apiClient from "../../utils/api";
import { BsBuilding } from "react-icons/bs";
import { FiChevronLeft } from "react-icons/fi";

function OrganizationBusinessDocuments() {
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

  const businessCategories = [
    {
      id: "company-master-data",
      title: "Company Master Data",
      description: "View and manage company master data documents",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "blue"
    },
    {
      id: "registration-licenses",
      title: "Registration and Licenses",
      description: "View and manage registration and license documents",
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: "green"
    },
    {
      id: "secretarial",
      title: "Secretarial",
      description: "View and manage secretarial documents",
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "purple"
    },
    {
      id: "correspondence",
      title: "Correspondence",
      description: "View and manage correspondence documents",
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
        {/* Header - matching KYC layout */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <button
              onClick={() => {
                if (isAdmin) {
                  navigate(`/admin/client-company-documents/${userId}/${currentOrgId}`);
                } else {
                  const orgIdFromState = location.state?.orgId || currentOrgId;
                  if (orgIdFromState) {
                    navigate(`/company-documents/${orgIdFromState}`);
                  } else {
                    navigate("/organizations-list");
                  }
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-1"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Business Documents</h1>
          </div>
          <p className="text-gray-500 text-sm italic ml-8 lg:ml-9">Select a document category to view and manage</p>
        </div>

        {/* Company Info Card with building icon */}
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

        {/* Business Categories - Vertical list like KYC */}
        <div className="space-y-3 sm:space-y-4">
          {businessCategories.map((category) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,-0,0,0.05)] border border-gray-100 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)] flex items-center justify-between"
                onClick={() => {
                  if (category.id === "company-master-data") {
                    if (isAdmin) {
                      navigate(`/admin/client-company-documents/${userId}/${currentOrgId}/business/company-master-data`, { state: { orgId: currentOrgId, userId } });
                    } else {
                      navigate(`/company-documents/${currentOrgId}/business/company-master-data`, { state: { orgId: currentOrgId } });
                    }
                  } else {
                    if (isAdmin) {
                      navigate(`/admin/client-company-documents/${userId}/${currentOrgId}/business/${category.id}`, { state: { orgId: currentOrgId, userId } });
                    } else {
                      navigate(`/company-documents/${currentOrgId}/business/${category.id}`, { state: { orgId: currentOrgId } });
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

export default OrganizationBusinessDocuments;

