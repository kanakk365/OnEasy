import React from "react";
import { TriangleAlert } from "lucide-react";
import logo from "../../assets/logo.png";

function Client() {
  React.useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
          The Intelligent Business Owner Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          A Unified Hub for Management and Insights
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        <div className="col-span-12 lg:col-span-6 space-y-4 md:space-y-6 lg:space-y-8">
          <div className="bg-white rounded-xl p-5 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Notice Board
              </h2>
              <a
                href="#"
                className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 text-sm font-medium hover:underline"
              >
                View all
              </a>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                  <TriangleAlert className="text-white w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Important announcement from OneEasy ROC Filing deadline
                  approaching –
                  <a
                    href="#"
                    className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 hover:underline ml-1 font-medium"
                  >
                    File Now
                  </a>
                  <span className="text-gray-500">.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Compliances
              </h2>
            </div>
            <div className="bg-red-50 rounded-lg p-5 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                <p className="text-gray-700 text-sm">
                  GST Filing – Due in 7 days
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                <p className="text-gray-700 text-sm">
                  Income Tax Return – Due in 14 days
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                <p className="text-gray-700 text-sm">
                  ROC Annual Filing – Due in 21 days
                </p>
              </div>
              <button className="mt-2 text-white text-sm px-4 py-2 rounded-lg transition-all duration-200" style={{ background: 'linear-gradient(180deg, #FF3D00 0%, #AD2C04 100%)' }}>
                Get Help
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-4 md:space-y-6 lg:space-y-8">
          <div className="bg-white rounded-lg p-5 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Ongoing Services & Status
              </h2>
              <a
                href="#"
                className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 text-sm font-medium hover:underline"
              >
                View all
              </a>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <p className="text-gray-700 text-sm">
                    Document Collection (In Progress)
                  </p>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <p className="text-gray-700 text-sm">
                    Trademark Filing (Awaiting Approval)
                  </p>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <p className="text-gray-700 text-sm">
                    MSME Registration (Completed)
                  </p>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 mt-6 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Service Requests</h2>
              <a
                href="#"
                className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 text-sm font-medium hover:underline"
              >
                View all
              </a>
            </div>
            <div className="flex border-b border-gray-100 mb-4 overflow-x-auto">
              <button className="text-[#01334C] border-b-2 border-[#01334C] pb-2 mr-4 md:mr-6 text-xs md:text-sm font-medium whitespace-nowrap">
                Open
              </button>
              <button className="text-gray-500 pb-2 mr-4 md:mr-6 text-xs md:text-sm font-medium whitespace-nowrap">
                In progress
              </button>
              <button className="text-gray-500 pb-2 text-xs md:text-sm font-medium whitespace-nowrap">
                Resolved
              </button>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
                <span className="text-gray-600">#12CIN</span>
                <span className="text-gray-900 font-medium">Incorporation</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Open
                </span>
                <span className="text-gray-600">Jul 20, 2024</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 ">
          <div className="bg-white rounded-lg p-5 transition-all duration-300 cursor-pointer border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">List Of Companies</h2>
              <a
                href="#"
                className="text-[#01334C] hover:text-[#00486D] transition-colors duration-200 text-sm font-medium hover:underline"
              >
                View all
              </a>
            </div>
            <div className="overflow-x-auto">
              <div className="rounded-lg overflow-hidden min-w-[600px]">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium bg-[#F8FAFC] text-[#64748B]">
                  <div className="col-span-2">Logo</div>
                  <div className="col-span-4">Name</div>
                  <div className="col-span-4">GST number</div>
                  <div className="col-span-2">Action</div>
                </div>

                {[1, 2, 3].map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border-t border-[#F1F5F9]"
                  >
                    <div className="col-span-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 border border-gray-100">
                        <img
                          src={logo}
                          alt="OnEasy"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="col-span-4 flex items-center">
                      <span className="text-sm text-gray-900">
                        OnEasy Technologies Pvt. Ltd.
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center">
                      <span className="text-sm text-gray-500">
                        27ABCDE1234F1Z5
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <button className="text-white text-xs px-3 md:px-4 py-1.5 rounded-lg transition-all duration-200 bg-gradient-to-r from-[#01334C] to-[#00486D] hover:from-[#00486D] hover:to-[#002D44]">
                        View all
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Client;
