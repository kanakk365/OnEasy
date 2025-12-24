import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getUsersPageData } from "../../utils/usersPageApi";

function OrganizationBusinessDocuments() {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      loadOrganization();
    }
  }, [orgId]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const orgResponse = await getUsersPageData();
      if (orgResponse.success && orgResponse.data && orgResponse.data.organisations) {
        const org = orgResponse.data.organisations.find(o => o.id === parseInt(orgId));
        if (org) {
          setOrganization({
            id: org.id,
            legalName: org.legal_name || 'N/A',
            tradeName: org.trade_name || 'N/A',
            gstin: org.gstin || 'N/A',
            organisationType: org.organisation_type || 'N/A'
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
              const orgIdFromState = location.state?.orgId || orgId;
              if (orgIdFromState) {
                navigate(`/company-documents/${orgIdFromState}`);
              } else {
                navigate("/organizations-list");
              }
            }}
            className="text-[#01334C] hover:text-[#00486D] mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Company Documents
          </button>

          {organization && (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {organization.legalName !== 'N/A' ? organization.legalName : organization.tradeName}
              </h1>
              {organization.tradeName !== 'N/A' && organization.legalName !== 'N/A' && organization.tradeName !== organization.legalName && (
                <p className="text-gray-600 mt-1">{organization.tradeName}</p>
              )}
              {organization.gstin !== 'N/A' && (
                <p className="text-sm text-gray-500 mt-1 font-mono">GSTIN: {organization.gstin}</p>
              )}
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Documents</h2>
        </div>

        {/* Business Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businessCategories.map((category) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  if (category.id === "company-master-data") {
                    navigate(`/company-documents/${orgId}/business/company-master-data`, { state: { orgId } });
                  } else {
                    navigate(`/company-documents/${orgId}/business/${category.id}`, { state: { orgId } });
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

export default OrganizationBusinessDocuments;

