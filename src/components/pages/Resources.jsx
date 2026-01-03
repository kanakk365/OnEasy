import React from "react";
import {
  MdTrendingUp,
  MdLaptopMac,
  MdCalculate,
  MdAccessTime,
  MdArrowForward,
} from "react-icons/md";
import { BsStars } from "react-icons/bs";

const Resources = () => {
  const resources = [
    {
      id: 1,
      icon: <MdTrendingUp className="w-6 h-6 text-white" />,
      category: "Tax Updates",
      title: "Union Budget 2025 Highlights",
      description:
        "Key amendments and their impact on your compliance requirements",
      date: "Coming soon",
      status: "coming_soon",
      badge: "New",
    },
    {
      id: 2,
      icon: <MdLaptopMac className="w-6 h-6 text-white" />,
      category: "Webinar",
      title: "GST Annual Return Masterclass",
      description: "Expert Led Webinar on GSTR-09 & 9C Filing with live Q&A",
      date: "Feb 14, 2025",
      status: "scheduled",
      badge: "New",
    },
    {
      id: 3,
      icon: <MdCalculate className="w-6 h-6 text-white" />,
      category: "Tools",
      title: "TDS Calculator 2.0",
      description: "Advanced TDS computation tool suggestions",
      date: "Available",
      status: "available",
      badge: "New",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f5f7] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          My Resources
        </h1>
        <p className="text-gray-600 mb-8">
          Your comprehensive knowledge hub for compliance excellence
        </p>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <BsStars className="text-yellow-400 w-6 h-6" />
            <h2 className="text-xl font-medium text-gray-900">
              Upcoming & Featured Resources
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="rounded-2xl p-6 border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow duration-300"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0, 72, 109, 0.05) 0%, rgba(0, 139, 211, 0.05) 100%)",
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                    style={{
                      background:
                        "linear-gradient(160.12deg, #00486D 13.28%, #016599 109.67%)",
                    }}
                  >
                    {resource.icon}
                  </div>
                  {resource.badge && (
                    <span className="bg-[#00486D] text-white text-xs font-medium px-3 py-1 rounded-full">
                      {resource.badge}
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <span className="text-[#00486D] text-sm font-medium">
                    {resource.category}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {resource.title}
                </h3>

                <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between pt-4 mt-auto">
                  <div className="flex items-center text-gray-500 text-sm">
                    <MdAccessTime className="w-4 h-4 mr-1.5" />
                    <span>{resource.date}</span>
                  </div>

                  <button className="flex items-center text-[#00486D] text-sm font-semibold group cursor-pointer hover:underline">
                    Learn More
                    <MdArrowForward className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
