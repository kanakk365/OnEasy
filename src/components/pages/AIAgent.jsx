import React from "react";
import {
  RiUser3Line,
  RiRocketLine,
  RiFileTextLine,
  RiLightbulbLine,
  RiShareBoxLine,
} from "react-icons/ri";

const AIAgent = () => {
  const agents = [
    {
      name: "Profile AI",
      role: "Optimization Expert",
      icon: <RiUser3Line className="w-6 h-6 text-[#0ea5e9]" />,
      link: "https://profile.oneasy.ai",
      tags: ["Resume", "LinkedIn"],
      description: "Manage and optimize your profile effortlessly with AI assistance.",
      buttonText: "Launch Agent",
    },
    {
      name: "Startup AI",
      role: "Strategic Consultant",
      icon: <RiRocketLine className="w-6 h-6 text-[#0ea5e9]" />,
      link: "https://startup.oneasy.ai",
      tags: ["Planning", "Strategy"],
      description: "Get strategic insights and support for your startup journey.",
      buttonText: "Launch Agent",
    },
    {
      name: "Proposal AI",
      role: "Sales Copywriter",
      icon: <RiFileTextLine className="w-6 h-6 text-[#0ea5e9]" />,
      link: "https://proposal.oneasy.ai",
      tags: ["Pitch", "B2B"],
      description: "Generate professional, winning proposals in seconds.",
      buttonText: "Launch Agent",
    },
    {
      name: "Validator AI",
      role: "Business Analyst",
      icon: <RiLightbulbLine className="w-6 h-6 text-[#0ea5e9]" />,
      link: "https://businessmodel.oneasy.ai/",
      tags: ["Market", "Finance"],
      description: "Validate your business idea before you build it with an AI consultant.",
      buttonText: "Start Validation",
    },
  ];

  return (
    <div className="relative bg-[#f4f6f8] py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="relative z-10 max-w-[1400px] mx-auto">
        <div className="mb-16 md:mb-24 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-[44px] leading-tight font-semibold text-[#0a192f] tracking-tight mb-5">
            Supercharge Your Workflow
          </h1>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {agents.map((agent, index) => (
            <div
              key={index}
              className="relative rounded-[40px] bg-gradient-to-br from-white via-[#f8fcff] to-[#e6f4fc] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-white hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full"
            >
              <a href={agent.link} target="_blank" rel="noopener noreferrer" className="absolute top-8 right-8 text-black cursor-pointer hover:text-[#0ea5e9] transition-colors">
                <RiShareBoxLine className="w-6 h-6" />
              </a>

              <div className="w-14 h-14 rounded-full bg-[#afe4fa] flex items-center justify-center mb-6 shadow-inner">
                {agent.icon}
              </div>
              
              <h2 className="text-[28px] font-medium text-black tracking-tight mb-3">
                {agent.name}
              </h2>
              
            

              <p className="text-[#64748b] text-[15px] leading-relaxed mb-10 flex-grow">
                {agent.description}
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <a
                  href={agent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center py-4 rounded-full bg-gradient-to-r from-white/90 to-[#e0f4fc] border border-white hover:border-[#99dffc] hover:shadow-[0_4px_12px_rgba(153,223,252,0.3)] text-black text-[16px] font-semibold transition-all duration-300"
                >
                  {agent.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
