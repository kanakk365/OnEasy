import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import {
  FaUserPlus,
  FaExchangeAlt,
  FaMapMarkerAlt,
  FaFileContract,
  FaUserMinus,
  FaFileAlt,
  FaEdit,
  FaBuilding,
  FaChartLine,
  FaTag,
  FaPowerOff,
  FaRedo,
  FaFileInvoice,
  FaTimesCircle,
  FaHandshake,
  FaIdCard,
  FaCertificate,
} from "react-icons/fa";

function ROCCategories() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const rocServices = [
    {
      id: 1,
      icon: <FaUserPlus />,
      title: "Director Addition",
      description: "Add new directors to your company",
      path: "/roc/director-addition-details",
    },
    {
      id: 2,
      icon: <FaExchangeAlt />,
      title: "Share Transfer",
      description: "Transfer shares between shareholders",
      path: "/roc/share-transfer-details",
    },
    {
      id: 3,
      icon: <FaMapMarkerAlt />,
      title: "Address Change (Registered Office Change)",
      description: "Update your company's registered office address",
      path: "/roc/address-change-details",
    },
    {
      id: 4,
      icon: <FaFileContract />,
      title: "Charge Creation",
      description: "Create charges on company assets",
      path: "/roc/charge-creation-details",
    },
    {
      id: 5,
      icon: <FaUserMinus />,
      title: "Director Removal",
      description: "Remove directors from your company",
      path: "/roc/director-removal-details",
    },
    {
      id: 6,
      icon: <FaFileAlt />,
      title: "MOA Amendment",
      description: "Amend Memorandum of Association",
      path: "/roc/moa-amendment-details",
    },
    {
      id: 7,
      icon: <FaEdit />,
      title: "AOA Amendment",
      description: "Amend Articles of Association",
      path: "/roc/aoa-amendment-details",
    },
    {
      id: 8,
      icon: <FaBuilding />,
      title: "Change In Objects clause",
      description: "Modify company's main objects clause",
      path: "/roc/objects-clause-change-details",
    },
    {
      id: 9,
      icon: <FaChartLine />,
      title: "Increase in Share Capital",
      description: "Increase authorized share capital",
      path: "/roc/increase-share-capital-details",
    },
    {
      id: 10,
      icon: <FaTag />,
      title: "Name Change - Company",
      description: "Change your company name",
      path: "/roc/name-change-company-details",
    },
    {
      id: 11,
      icon: <FaPowerOff />,
      title: "DIN Deactivation",
      description: "Deactivate Director Identification Number",
      path: "/roc/din-deactivation-details",
    },
    {
      id: 12,
      icon: <FaRedo />,
      title: "DIN Reactivation",
      description: "Reactivate Director Identification Number",
      path: "/roc/din-reactivation-details",
    },
    {
      id: 13,
      icon: <FaFileInvoice />,
      title: "ADT-1",
      description: "Appointment of Auditor",
      path: "/roc/adt-1-details",
    },
    {
      id: 14,
      icon: <FaTimesCircle />,
      title: "Winding Up - Company",
      description: "Wind up a company",
      path: "/roc/winding-up-company-details",
    },
    {
      id: 15,
      icon: <FaHandshake />,
      title: "Winding Up - LLP",
      description: "Wind up a Limited Liability Partnership",
      path: "/roc/winding-up-llp-details",
    },
    {
      id: 16,
      icon: <FaIdCard />,
      title: "DIN Application - MCA",
      description: "Apply for Director Identification Number",
      path: "/roc/din-application-details",
    },
    {
      id: 17,
      icon: <FaCertificate />,
      title: "INC 20A - MCA",
      description: "Declaration for commencement of business",
      path: "/roc/inc-20a-details",
    },
  ];

  const filteredServices = rocServices.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f3f5f7]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          ROC & MCA Services
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

export default ROCCategories;

