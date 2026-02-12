import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";

const AssignedComplianceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Use passed state or fallback values
  const complianceData = location.state || {
    name: "TDS - 2026",
    details: [
      { period: "Q1", year: "2026", dueDate: "15 July", status: "Done" },
      { period: "Q2", year: "2026", dueDate: "15 Oct", status: "Done" },
      { period: "Q3", year: "2026", dueDate: "15 Jan", status: "Pending" },
      { period: "Q4", year: "2026", dueDate: "15 May", status: "Pending" },
    ],
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "done":
        return "text-green-500 bg-green-50"; // Light mock background just in case, but text color is main
      case "pending":
        return "text-[#FF8A00]";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-800 hover:text-gray-600 transition-colors mr-2"
          >
            <IoChevronBackOutline className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {complianceData.name || `Compliance ${id}`}
          </h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          View and manage all assigned compliances for this client
        </p>
      </div>

      {/* Details Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[200px]">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-[#023752] text-white py-4 px-8">
          <div className="text-sm font-medium">Period</div>
          <div className="text-sm font-medium">Year</div>
          <div className="text-sm font-medium">Due Date</div>
          <div className="text-sm font-medium">Status</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {complianceData.details ? (
            complianceData.details.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-4 py-6 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="text-gray-700 font-medium">{item.period}</div>
                <div className="text-gray-700">{item.year}</div>
                <div className="text-gray-700">{item.dueDate}</div>
                <div className={`font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="grid grid-cols-4 py-6 px-8 border-b border-gray-100 hover:bg-gray-50">
                <div className="text-gray-700 font-medium">Q1</div>
                <div className="text-gray-700">2026</div>
                <div className="text-gray-700">15 July</div>
                <div className="font-medium text-green-500">Done</div>
              </div>
              <div className="grid grid-cols-4 py-6 px-8 border-b border-gray-100 hover:bg-gray-50">
                <div className="text-gray-700 font-medium">Q2</div>
                <div className="text-gray-700">2026</div>
                <div className="text-gray-700">15 Oct</div>
                <div className="font-medium text-green-500">Done</div>
              </div>
              <div className="grid grid-cols-4 py-6 px-8 border-b border-gray-100 hover:bg-gray-50">
                <div className="text-gray-700 font-medium">Q3</div>
                <div className="text-gray-700">2026</div>
                <div className="text-gray-700">15 Jan</div>
                <div className="font-medium text-[#FF8A00]">Pending</div>
              </div>
              <div className="grid grid-cols-4 py-6 px-8 border-b-0 hover:bg-gray-50">
                <div className="text-gray-700 font-medium">Q4</div>
                <div className="text-gray-700">2026</div>
                <div className="text-gray-700">15 May</div>
                <div className="font-medium text-[#FF8A00]">Pending</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedComplianceDetails;
