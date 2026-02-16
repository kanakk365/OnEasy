import React from "react";
import { FaMagic } from "react-icons/fa";
import { GoLaw } from "react-icons/go";
import {
  RiRobot2Line,
  RiChat1Line,
  RiHistoryLine,
  RiProfileLine,
} from "react-icons/ri";

const AIAgent = () => {
  return (
    <div className="min-h-screen bg-[#f3f5f7] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">AI Agent</h1>
          <p className="text-gray-600">
            Your personal AI assistant for all compliance and registration
            queries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Profile Builder Card */}
          <a href="https://profile.oneasy.ai">
            <button
              className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 flex flex-col items-start text-left w-full min-h-[160px] hover:scale-105 active:scale-100"
              onClick={() => console.log("Start New Session")}
            >
              <div className="flex justify-between items-start w-full mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
                    <RiProfileLine className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Profile Builder
                  </h3>
                </div>
                {/* Top Right Badge */}
                <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-[10px] text-white font-bold"></span>
                  <span className="text-sm font-medium text-gray-600">
                    #1 Trending
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-sm">
                Personalized profile builder to optimize your business
                registration
              </p>
            </button>
          </a>

          {/* LegalPick Card */}
          <a href="https://startup.oneasy.ai">
            <button
              className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 flex flex-col items-start text-left w-full min-h-[160px] hover:scale-105 active:scale-100"
              onClick={() => console.log("View History")}
            >
              <div className="flex justify-between items-start w-full mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
                    <GoLaw className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Legal Pick
                  </h3>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-[10px] text-white font-bold"></span>
                  <span className="text-sm font-medium text-gray-600">
                    Most used
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-sm">
                Quickly picks and explains the ideal legal entity for
                registering your organization
              </p>
            </button>
          </a>

          {/* Proposal Flow */}
          <a href="https://proposal.oneasy.ai">
            <button className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 flex flex-col items-start text-left w-full min-h-[160px] hover:scale-105 active:scale-100">
              <div className="flex justify-between items-start w-full mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
                    <FaMagic className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Proposal Flow
                  </h3>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-[10px] text-white font-bold"></span>
                  <span className="text-sm font-medium text-gray-600">
                    Most used
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-sm">
                tool that thinks like a sales pro. Generate, design, and brand
                high-converting proposals in under 30 seconds.
              </p>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
