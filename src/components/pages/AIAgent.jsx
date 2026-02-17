import React from "react";
import { RiUser3Line, RiRocketLine, RiFileTextLine } from "react-icons/ri";

const AIAgent = () => {
  const agents = [
    {
      name: "Profile AI Agent",
      icon: <RiUser3Line className="w-12 h-12 mb-4 text-blue-600" />,
      link: "https://profile.oneasy.ai",
      description:
        "Manage and optimize your profile effortlessly with AI assistance.",
      color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    },
    {
      name: "Startup AI Agent",
      icon: <RiRocketLine className="w-12 h-12 mb-4 text-green-600" />,
      link: "https://startup.oneasy.ai",
      description:
        "Get strategic insights and support for your startup journey.",
      color: "bg-green-50 border-green-200 hover:border-green-400",
    },
    {
      name: "Proposal AI Agent",
      icon: <RiFileTextLine className="w-12 h-12 mb-4 text-purple-600" />,
      link: "https://proposal.oneasy.ai",
      description: "Generate professional, winning proposals in seconds.",
      color: "bg-purple-50 border-purple-200 hover:border-purple-400",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI Agents Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <a
              key={index}
              href={agent.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-8 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${agent.color} group`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-white rounded-full shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  {agent.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900">
                  {agent.name}
                </h2>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {agent.description}
                </p>
                <div className="mt-6 px-6 py-2 bg-white text-gray-800 rounded-full text-sm font-semibold shadow-sm group-hover:shadow-md transition-all">
                  Launch Agent →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
