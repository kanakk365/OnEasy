import React from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
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
      isHighlighted: true,
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
      title: "Limited Liability Partner...",
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
      title: "MCA Name approval",
      description: "Reserve a unique name for your company",
      path: "/company/mca-name",
    },
    {
      icon: <FaBuilding />,
      title: "Indian Subsidiary Com...",
      description: "Foreign branch registered in India",
      path: "/company/indian-subsidiary",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f3f5f7] ">
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01334C] focus:border-[#01334C] bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => navigate(category.path)}
            className="relative cursor-pointer rounded-xl p-8 transition-all duration-200 flex flex-col items-center text-center group bg-[#FAFBFF] border border-[#EFEFEF] shadow-[0_4px_16px_0_#9797970D] hover:bg-[#01466a] hover:text-white"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#00486d] group-hover:bg-[#25607f]">
              {React.cloneElement(category.icon, {
                className: "w-7 h-7 text-white",
              })}
            </div>
            <h3 className="text-lg font-medium mb-1 text-[#00486D] group-hover:text-white">
              {category.title}
            </h3>
            <p className="text-sm text-gray-500 group-hover:text-gray-300">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompanyCategories;
