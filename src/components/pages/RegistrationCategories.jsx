import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { FaFileAlt } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";

function RegistrationCategories() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const registrationTypes = [
    {
      id: 1,
      title: "Start - Up India Certificate",
      description: "Get certified under Start-Up India initiative",
    },
    {
      id: 2,
      title: "Professional Tax Registration",
      description: "Register for professional tax compliance",
    },
    {
      id: 3,
      title: "Labour License Registration",
      description: "Obtain labor license for your business",
    },
    {
      id: 4,
      title: "Provident Fund Registration",
      description: "Register for PF and employee benefits",
    },
    {
      id: 5,
      title: "GST Registration",
      description: "Register for Goods and Services Tax",
    },
    {
      id: 6,
      title: "Udyam Registration",
      description: "MSME/Udyog Aadhaar registration",
    },
    {
      id: 7,
      title: "FSSAI / Food license",
      description: "Food safety and standards authority license",
    },
    {
      id: 8,
      title: "Trade License",
      description: "Municipal trade license for business operations",
    },
    {
      id: 9,
      title: "Import Export Code (IEC) Registration",
      description: "IEC for import/export business",
    },
    {
      id: 10,
      title: "Letter of Undertaking",
      description: "LOU for business transactions",
    },
    {
      id: 11,
      title: "Employee State Insurance (ESI) Registration",
      description: "ESI registration for employee insurance",
    },
    {
      id: 12,
      title: "Digital Signature Certificate",
      description: "DSC for digital authentication",
    },
    {
      id: 13,
      title: "12A Registration",
      description: "Income tax exemption for NGOs/Trusts",
    },
    {
      id: 14,
      title: "80G Registration",
      description: "Tax deduction certificate for donations",
    },
  ];

  // Filter registrations based on search term
  const filteredRegistrations = registrationTypes.filter((reg) =>
    reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Registration Services
              </h1>
              <p className="text-gray-600 mt-1">
                Select a registration type to get started
              </p>
            </div>
            <button
              onClick={() => navigate('/registrations')}
              className="px-4 py-2 border border-[#00486D] text-[#00486D] rounded-md hover:bg-[#00486D] hover:text-white transition-colors"
            >
              ← Back to Services
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchOutline className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for a registration type (e.g. GST, PF, FSSAI)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-[#01334C] bg-white"
            />
          </div>
        </div>

        {/* Registration Types List */}
        <div className="space-y-4">
          {filteredRegistrations.length > 0 ? (
            filteredRegistrations.map((registration) => (
              <div
                key={registration.id}
                className="relative group bg-white rounded-2xl p-5 hover:bg-[#01334C] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-between w-full border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]"
                onClick={() => {
                  // Navigation will be added later for each type
                  console.log('Selected:', registration.title);
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-[#004568] group-hover:bg-[#246181] text-white">
                    <FaFileAlt className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#00486D] group-hover:text-white">
                      {registration.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-200">
                      {registration.description}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#246181] flex items-center justify-center">
                  <MdKeyboardArrowRight className="h-5 w-5 text-[#01334C] group-hover:text-white" />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600">No registration types found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        {filteredRegistrations.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Need Help Choosing?</p>
                <p>
                  Our team can help you select the right registrations for your business. 
                  Contact us for personalized guidance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrationCategories;

