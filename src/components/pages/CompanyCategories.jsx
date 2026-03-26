import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronForwardOutline } from "react-icons/io5";
import {
  FaBuilding,
  FaUserTie,
  FaUsers,
  FaHandshake,
  FaRegBuilding,
  FaChartLine,
  FaGlobe,
} from "react-icons/fa";
import { BsBuilding } from "react-icons/bs";

function CompanyCategories() {
  const navigate = useNavigate();

  const categories = [
    {
      icon: <FaBuilding />,
      title: "Private Limited Company",
      description: "Most popular for startups",
      path: "/company/private-limited",
    },
    {
      icon: <FaUserTie />,
      title: "One Person Company",
      description: "Single founder with limited liability",
      path: "/company/opc",
    },
    {
      icon: <BsBuilding />,
      title: "Proprietorship",
      description: "Simple business run by one person",
      path: "/company/proprietorship",
    },
    {
      icon: <FaUsers />,
      title: "Limited Liability Partnership",
      description: "Partnership with limited liability",
      path: "/company/llp",
    },
    {
      icon: <FaHandshake />,
      title: "Partnership Firm",
      description: "Partnership for two or more people",
      path: "/company/partnership",
    },
    {
      icon: <FaRegBuilding />,
      title: "Section 8 Firms",
      description: "Non-profit entity for charitable purposes",
      path: "/company/section-8",
    },
    {
      icon: <FaChartLine />,
      title: "Public Limited Company",
      description: "Large company structure for public funds",
      path: "/company/public-limited",
    },
    {
      icon: <FaGlobe />,
      title: "MCA Name Approval",
      description: "Reserve a unique name for your company",
      path: "/company/mca-name",
    },
    {
      icon: <FaBuilding />,
      title: "Indian Subsidiary Company",
      description: "Foreign branch registered in India",
      path: "/company/indian-subsidiary",
    },
  ];

  return (
    <div className="min-h-screen bg-white lg:bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Back button */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-800 text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Select your Category
          </button>
        </div>

        {/* Desktop title */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Select Your Category</h1>
        </div>

        {/* Mobile: flat list */}
        <div className="lg:hidden bg-white rounded-xl divide-y divide-gray-100 border border-gray-100 overflow-hidden">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => navigate(category.path)}
              className="flex items-center gap-4 px-4 py-4 active:bg-gray-50 cursor-pointer transition-colors"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
              >
                {React.cloneElement(category.icon, { className: "w-5 h-5 text-white" })}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{category.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
              </div>
              <IoChevronForwardOutline className="text-gray-400 text-lg flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Desktop: centered icon grid */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => navigate(category.path)}
              className="relative cursor-pointer rounded-xl p-8 transition-all duration-200 flex flex-col items-center text-center group bg-[#FAFBFF] border border-[#EFEFEF] shadow-[0_4px_16px_0_#9797970D] hover:shadow-lg"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
              >
                {React.cloneElement(category.icon, { className: "w-7 h-7 text-white" })}
              </div>
              <h3 className="text-lg font-medium mb-1 text-[#022B51]">{category.title}</h3>
              <p className="text-sm text-gray-500">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompanyCategories;
