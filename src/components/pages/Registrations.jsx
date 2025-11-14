import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import {
  FaRocket,
  FaFileAlt,
  FaCalculator,
  FaBalanceScale,
  FaFileInvoiceDollar,
  FaClipboardCheck,
} from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";

function Registrations() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const services = [
    {
      icon: <FaRocket className="service-icon rocket" />,
      title: "Start up Services",
      description: "Incorporation, funding, and advisory support",
    },
    {
      icon: <FaFileAlt className="service-icon doc" />,
      title: "Registration Services",
      description: "Quick and easy business registrations",
    },
    {
      icon: <FaCalculator className="service-icon gst" />,
      title: "Goods and Services Tax Services",
      description: "GST registration, filing, and compliance",
    },
    {
      icon: <FaBalanceScale className="service-icon mca" />,
      title: "ROC & MCA Services",
      description: "Company law filings and MCA compliance",
    },
    {
      icon: <FaFileInvoiceDollar className="service-icon tax" />,
      title: "Income Tax Services",
      description: "Tax planning, filing, and assessments",
    },
    {
      icon: <FaClipboardCheck className="service-icon compliance" />,
      title: "Compliance Services",
      description: "End to end legal and regulatory compliance",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Select your Services
            </h1>
            <div className="relative w-[400px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoSearchOutline className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for a service (e.g. GST, Income Tax, ROC)"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#01334C] focus:border-[#01334C] bg-white"
              />
            </div>
          </div>
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-2 px-5 relative rounded-lg ${
                  activeTab === "upcoming"
                    ? "bg-[#004568] text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upcoming
              
              </button>
              <button
                onClick={() => setActiveTab("popular")}
                className={`py-2 px-5 relative rounded-lg ${
                  activeTab === "popular"
                    ? "bg-[#004568] text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Popular
                
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="relative group bg-white rounded-2xl p-5 hover:bg-[#01334C] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-between w-full"
              onClick={() => {
                if (service.title === "Start up Services") {
                  navigate("/company-categories");
                } else if (service.title === "Registration Services") {
                  navigate("/registration-categories");
                }
              }}
            >
              <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-[#004568] group-hover:bg-[#246181] text-white`}>
                  {React.cloneElement(service.icon, { className: "h-6 w-6" })}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#00486D] group-hover:text-white">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-200">
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#246181] flex items-center justify-center">
                <MdKeyboardArrowRight className="h-5 w-5 text-[#01334C] group-hover:text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Registrations;

export default Registrations;
