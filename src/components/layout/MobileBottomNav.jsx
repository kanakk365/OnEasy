import React from "react";
import { Link, useLocation } from "react-router-dom";
import { RiRobot2Line } from "react-icons/ri";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineUser,
} from "react-icons/hi";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: <HiOutlineHome className="w-5 h-5" />, text: "Home", path: "/client" },
    { icon: <HiOutlineClipboardList className="w-5 h-5" />, text: "Compliance", path: "/compliance" },
    { icon: <HiOutlineDocumentText className="w-5 h-5" />, text: "Documents", path: "/documents" },
    { icon: <HiOutlineUser className="w-5 h-5" />, text: "Profile", path: "/settings" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
      <div className="relative w-full h-[70px] bg-transparent">
        {/* SVG Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none flex">
        {/* Left Side */}
        <div className="h-[70px] bg-[#00486d]" style={{ width: 'calc(50% - 60px)' }}></div>
        
        {/* Center Curve */}
        <div className="w-[120px] h-[70px]">
          <svg width="120" height="70" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0,0 L15,0 C25,0 25,8.5 35,21 A32,32 0 0,0 85,21 C95,8.5 95,0 105,0 L120,0 L120,70 L0,70 Z" 
              fill="#00486d" 
            />
          </svg>
        </div>
        
        {/* Right Side */}
        <div className="h-[70px] bg-[#00486d]" style={{ width: 'calc(50% - 60px)' }}></div>
      </div>
        
        {/* Nav Items Container */}
        <div className="relative z-10 w-full h-full flex justify-between items-center px-2">
          {/* Left Items */}
          <div className="flex w-[40%] justify-around">
            <Link
              to={navItems[0].path}
              className={`flex flex-col items-center justify-center space-y-1 w-16 h-full transition-colors ${
                location.pathname === navItems[0].path ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {navItems[0].icon}
              <span className="text-[10px] font-medium">{navItems[0].text}</span>
            </Link>
            <Link
              to={navItems[1].path}
              className={`flex flex-col items-center justify-center space-y-1 w-16 h-full transition-colors ${
                location.pathname === navItems[1].path ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {navItems[1].icon}
              <span className="text-[10px] font-medium">{navItems[1].text}</span>
            </Link>
          </div>

          {/* Spacer for center floating button */}
          <div className="w-[20%]"></div>

          {/* Right Items */}
          <div className="flex w-[40%] justify-around">
            <Link
              to={navItems[2].path}
              className={`flex flex-col items-center justify-center space-y-1 w-16 h-full transition-colors ${
                location.pathname === navItems[2].path ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {navItems[2].icon}
              <span className="text-[10px] font-medium">{navItems[2].text}</span>
            </Link>
            <Link
              to={navItems[3].path}
              className={`flex flex-col items-center justify-center space-y-1 w-16 h-full transition-colors ${
                location.pathname === navItems[3].path ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {navItems[3].icon}
              <span className="text-[10px] font-medium">{navItems[3].text}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Center Button (Bot) */}
      <Link
        to="/ai-agent"
        className="absolute left-1/2 bottom-[42px] -translate-x-1/2 flex items-center justify-center w-[54px] h-[54px] bg-[#bd0008] rounded-full z-[60] shadow-[0_4px_25px_rgba(189,0,8,0.8)] transition-transform hover:scale-105 active:scale-95"
      >
        <RiRobot2Line className="w-7 h-7 text-white" />
      </Link>
    </div>
  );
};

export default MobileBottomNav;
