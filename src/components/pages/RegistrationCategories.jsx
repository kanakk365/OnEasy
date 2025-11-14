import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import {
  FaCertificate,
  FaUserTie,
  FaIndustry,
  FaUsers,
  FaFileInvoiceDollar,
  FaStore,
  FaShoppingCart,
  FaGlobe,
  FaFileContract,
  FaShieldAlt,
  FaKey,
  FaHandHoldingHeart,
  FaDonate,
  FaBuilding,
} from "react-icons/fa";

function RegistrationCategories() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const registrationTypes = [
    {
      id: 1,
      title: "Start - Up India Certificate",
      description: "Get certified under Start-Up India initiative",
      icon: <FaCertificate />,
      path: "/startup-india-form",
    },
    {
      id: 2,
      title: "Professional Tax Registration",
      description: "Register for professional tax compliance",
      icon: <FaUserTie />,
    },
    {
      id: 3,
      title: "Labour License Registration",
      description: "Obtain labor license for your business",
      icon: <FaIndustry />,
    },
    {
      id: 4,
      title: "Provident Fund Registration",
      description: "Register for PF and employee benefits",
      icon: <FaUsers />,
    },
    {
      id: 5,
      title: "GST Registration",
      description: "Register for Goods and Services Tax",
      icon: <FaFileInvoiceDollar />,
    },
    {
      id: 6,
      title: "Udyam Registration",
      description: "MSME/Udyog Aadhaar registration",
      icon: <FaStore />,
    },
    {
      id: 7,
      title: "FSSAI / Food license",
      description: "Food safety and standards authority license",
      icon: <FaShoppingCart />,
    },
    {
      id: 8,
      title: "Trade License",
      description: "Municipal trade license for business operations",
      icon: <FaBuilding />,
    },
    {
      id: 9,
      title: "Import Export Code (IEC) Registration",
      description: "IEC for import/export business",
      icon: <FaGlobe />,
    },
    {
      id: 10,
      title: "Letter of Undertaking",
      description: "LOU for business transactions",
      icon: <FaFileContract />,
    },
    {
      id: 11,
      title: "Employee State Insurance (ESI) Registration",
      description: "ESI registration for employee insurance",
      icon: <FaShieldAlt />,
    },
    {
      id: 12,
      title: "Digital Signature Certificate",
      description: "DSC for digital authentication",
      icon: <FaKey />,
    },
    {
      id: 13,
      title: "12A Registration",
      description: "Income tax exemption for NGOs/Trusts",
      icon: <FaHandHoldingHeart />,
    },
    {
      id: 14,
      title: "80G Registration",
      description: "Tax deduction certificate for donations",
      icon: <FaDonate />,
    },
  ];

  // Filter registrations based on search term
  const filteredRegistrations = registrationTypes.filter(
    (reg) =>
      reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f3f5f7]">
      {/* Header with Search */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Select Your Category
        </h1>
        <div className="relative w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchOutline className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for a Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01334C] focus:border-[#01334C] bg-white"
          />
        </div>
      </div>

      {/* Registration Types Grid */}
      {filteredRegistrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              onClick={() => registration.path && navigate(registration.path)}
              className="relative cursor-pointer rounded-xl p-8 transition-all duration-200 flex flex-col items-center text-center group bg-[#FAFBFF] border border-[#EFEFEF] shadow-[0_4px_16px_0_#9797970D] hover:bg-[#01466a] hover:text-white"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#00486d] group-hover:bg-[#25607f]">
                {React.cloneElement(registration.icon, {
                  className: "w-7 h-7 text-white",
                })}
              </div>
              <h3 className="text-lg font-medium mb-1 text-[#00486D] group-hover:text-white">
                {registration.title}
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-gray-300">
                {registration.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No registration types found</p>
        </div>
      )}
    </div>
  );
}

export default RegistrationCategories;

import { IoSearchOutline } from "react-icons/io5";
import {
  FaCertificate,
  FaUserTie,
  FaIndustry,
  FaUsers,
  FaFileInvoiceDollar,
  FaStore,
  FaShoppingCart,
  FaGlobe,
  FaFileContract,
  FaShieldAlt,
  FaKey,
  FaHandHoldingHeart,
  FaDonate,
  FaBuilding,
} from "react-icons/fa";

function RegistrationCategories() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const registrationTypes = [
    {
      id: 1,
      title: "Start - Up India Certificate",
      description: "Get certified under Start-Up India initiative",
      icon: <FaCertificate />,
      path: "/startup-india-form",
    },
    {
      id: 2,
      title: "Professional Tax Registration",
      description: "Register for professional tax compliance",
      icon: <FaUserTie />,
    },
    {
      id: 3,
      title: "Labour License Registration",
      description: "Obtain labor license for your business",
      icon: <FaIndustry />,
    },
    {
      id: 4,
      title: "Provident Fund Registration",
      description: "Register for PF and employee benefits",
      icon: <FaUsers />,
    },
    {
      id: 5,
      title: "GST Registration",
      description: "Register for Goods and Services Tax",
      icon: <FaFileInvoiceDollar />,
    },
    {
      id: 6,
      title: "Udyam Registration",
      description: "MSME/Udyog Aadhaar registration",
      icon: <FaStore />,
    },
    {
      id: 7,
      title: "FSSAI / Food license",
      description: "Food safety and standards authority license",
      icon: <FaShoppingCart />,
    },
    {
      id: 8,
      title: "Trade License",
      description: "Municipal trade license for business operations",
      icon: <FaBuilding />,
    },
    {
      id: 9,
      title: "Import Export Code (IEC) Registration",
      description: "IEC for import/export business",
      icon: <FaGlobe />,
    },
    {
      id: 10,
      title: "Letter of Undertaking",
      description: "LOU for business transactions",
      icon: <FaFileContract />,
    },
    {
      id: 11,
      title: "Employee State Insurance (ESI) Registration",
      description: "ESI registration for employee insurance",
      icon: <FaShieldAlt />,
    },
    {
      id: 12,
      title: "Digital Signature Certificate",
      description: "DSC for digital authentication",
      icon: <FaKey />,
    },
    {
      id: 13,
      title: "12A Registration",
      description: "Income tax exemption for NGOs/Trusts",
      icon: <FaHandHoldingHeart />,
    },
    {
      id: 14,
      title: "80G Registration",
      description: "Tax deduction certificate for donations",
      icon: <FaDonate />,
    },
  ];

  // Filter registrations based on search term
  const filteredRegistrations = registrationTypes.filter(
    (reg) =>
      reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f3f5f7]">
      {/* Header with Search */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Select Your Category
        </h1>
        <div className="relative w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchOutline className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for a Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01334C] focus:border-[#01334C] bg-white"
          />
        </div>
      </div>

      {/* Registration Types Grid */}
      {filteredRegistrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              onClick={() => registration.path && navigate(registration.path)}
              className="relative cursor-pointer rounded-xl p-8 transition-all duration-200 flex flex-col items-center text-center group bg-[#FAFBFF] border border-[#EFEFEF] shadow-[0_4px_16px_0_#9797970D] hover:bg-[#01466a] hover:text-white"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#00486d] group-hover:bg-[#25607f]">
                {React.cloneElement(registration.icon, {
                  className: "w-7 h-7 text-white",
                })}
              </div>
              <h3 className="text-lg font-medium mb-1 text-[#00486D] group-hover:text-white">
                {registration.title}
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-gray-300">
                {registration.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No registration types found</p>
        </div>
      )}
    </div>
  );
}

export default RegistrationCategories;
