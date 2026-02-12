import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiCheckCircle, FiClock } from "react-icons/fi";

const AssignedCompliances = () => {
  const navigate = useNavigate();

  // Mock data based on the image provided
  const compliances = [
    {
      id: 1,
      name: "GST - 2026",
      type: "monthly",
      stats: {
        done: 2,
        pending: 10,
      },
      totalItems: 12,
      progress: [
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    {
      id: 2,
      name: "TDS - 2026",
      type: "monthly",
      stats: {
        done: 1,
        pending: 3,
      },
      totalItems: 4,
      progress: [true, false, false, false],
    },
    {
      id: 3,
      name: "ITR Filing - 2026",
      type: "monthly",
      stats: {
        done: 0,
        pending: 1,
      },
      totalItems: 1,
      progress: [false],
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <IoChevronBackOutline className="w-5 h-5 mr-1" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Assigned Compliances
        </h1>
        <p className="text-gray-500 italic">
          View and manage all assigned compliances for this client
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {compliances.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                {item.type}
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 font-medium">Done</span>
                </div>
                <span className="font-bold text-gray-900">
                  {item.stats.done}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiClock className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700 font-medium">Pending</span>
                </div>
                <span className="font-bold text-gray-900">
                  {String(item.stats.pending).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center space-x-1 mt-auto">
              {item.progress.map((isDone, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDone ? "bg-[#023752]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedCompliances;
