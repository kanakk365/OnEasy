import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import {
  FaCertificate,
  FaFileAlt,
  FaFileInvoice,
  FaUsers,
  FaBuilding,
  FaFileContract,
  FaHandshake,
  FaUserTie,
  FaBriefcase,
  FaTrademark,
} from "react-icons/fa";

function ComplianceCategories() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const complianceServices = [
    {
      id: 1,
      icon: <FaCertificate />,
      title: "FSSAI Renewal",
      description: "Renew your FSSAI license",
      path: "/compliance/fssai-renewal-details",
    },
    {
      id: 2,
      icon: <FaFileAlt />,
      title: "FSSAI Return Filing",
      description: "File your FSSAI returns",
      path: "/compliance/fssai-return-filing-details",
    },
    {
      id: 3,
      icon: <FaFileInvoice />,
      title: "Business Plan",
      description: "Create a comprehensive business plan",
      path: "/compliance/business-plan-details",
    },
    {
      id: 4,
      icon: <FaUsers />,
      title: "HR & Payroll Service",
      description: "Manage HR and payroll compliance",
      path: "/compliance/hr-payroll-details",
    },
    {
      id: 5,
      icon: <FaBuilding />,
      title: "PF Return Filing",
      description: "File your Provident Fund returns",
      path: "/compliance/pf-return-filing-details",
    },
    {
      id: 6,
      icon: <FaFileContract />,
      title: "ESI Return Filing",
      description: "File your Employee State Insurance returns",
      path: "/compliance/esi-return-filing-details",
    },
    {
      id: 7,
      icon: <FaFileAlt />,
      title: "Professional Tax Return Filing",
      description: "File your professional tax returns",
      path: "/compliance/professional-tax-return-details",
    },
    {
      id: 8,
      icon: <FaHandshake />,
      title: "Partnership Compliance",
      description: "Ensure partnership firm compliance",
      path: "/compliance/partnership-compliance-details",
    },
    {
      id: 9,
      icon: <FaUserTie />,
      title: "Proprietorship Compliance",
      description: "Maintain proprietorship compliance",
      path: "/compliance/proprietorship-compliance-details",
    },
    {
      id: 10,
      icon: <FaBriefcase />,
      title: "Company Compliance",
      description: "Ensure company regulatory compliance",
      path: "/compliance/company-compliance-details",
    },
    {
      id: 11,
      icon: <FaTrademark />,
      title: "Trademark",
      description: "Register and manage your trademarks",
      path: "/compliance/trademark-details",
    },
  ];

  const filteredServices = complianceServices.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f3f5f7]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Compliance Services
        </h1>
        <div className="relative w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchOutline className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for a service"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01334C] focus:border-[#01334C] bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            onClick={() => navigate(service.path)}
            className="relative cursor-pointer rounded-xl p-8 transition-all duration-200 flex flex-col items-center text-center group bg-[#FAFBFF] border border-[#EFEFEF] shadow-[0_4px_16px_0_#9797970D] hover:bg-[#01466a] hover:text-white"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#00486d] group-hover:bg-[#25607f]">
              {React.cloneElement(service.icon, {
                className: "w-7 h-7 text-white",
              })}
            </div>
            <h3 className="text-lg font-medium mb-1 text-[#00486D] group-hover:text-white">
              {service.title}
            </h3>
            <p className="text-sm text-gray-500 group-hover:text-gray-300">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComplianceCategories;

