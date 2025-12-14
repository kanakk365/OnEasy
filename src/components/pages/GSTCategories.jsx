import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import {
  FaFileInvoiceDollar,
  FaFileAlt,
  FaFileContract,
  FaCalendarAlt,
  FaEdit,
  FaBell,
} from "react-icons/fa";

function GSTCategories() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const gstServices = [
    {
      id: 1,
      icon: <FaFileInvoiceDollar />,
      title: "GST Registration",
      description: "Register for Goods and Services Tax",
      path: "/gst-registration-details",
    },
    {
      id: 2,
      icon: <FaFileAlt />,
      title: "GST Returns",
      description: "File your GST returns regularly",
      path: "/gst-returns-details",
    },
    {
      id: 3,
      icon: <FaFileContract />,
      title: "Letter of Undertaking",
      description: "Apply for GST LUT for exports",
      path: "/registration/gst-lut",
    },
    {
      id: 4,
      icon: <FaCalendarAlt />,
      title: "GST Annual Return Filing",
      description: "File your annual GST return",
      path: "/gst-annual-return-details",
    },
    {
      id: 5,
      icon: <FaEdit />,
      title: "GST Amendment",
      description: "Amend your GST registration details",
      path: "/gst-amendment-details",
    },
    {
      id: 6,
      icon: <FaBell />,
      title: "GST Notice",
      description: "Respond to GST notices and queries",
      path: "/gst-notice-details",
    },
  ];

  const filteredServices = gstServices.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f3f5f7]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Goods and Services Tax Services
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

export default GSTCategories;

