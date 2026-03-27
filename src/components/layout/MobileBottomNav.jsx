import React from "react";
import { Link, useLocation } from "react-router-dom";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: "/Home.png", text: "Home", path: "/client" },
    { icon: "/compliance.png", text: "Compliance", path: "/compliance" },
    { icon: "/document.png", text: "Documents", path: "/documents" },
    { icon: "/user.png", text: "Profile", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
      <div className="relative w-full h-[70px] bg-transparent">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none flex">
          <div className="h-[70px] flex-1" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }} />
          <div className="w-[120px] h-[70px]">
            <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#022B51" />
                  <stop offset="100%" stopColor="#015079" />
                </linearGradient>
              </defs>
              <path d="M0,0 L15,0 C25,0 25,8.5 35,21 A32,32 0 0,0 85,21 C95,8.5 95,0 105,0 L120,0 L120,70 L0,70 Z" fill="url(#navGrad)" />
            </svg>
          </div>
          <div className="h-[70px] flex-1" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }} />
        </div>

        {/* Nav Items */}
        <div className="relative z-10 w-full h-full flex justify-between items-center px-2">
          <div className="flex w-[40%] justify-around">
            {navItems.slice(0, 2).map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center space-y-0.5 w-16 h-full">
                  <img src={item.icon} alt={item.text} className={`w-5 h-5 transition-all ${active ? "brightness-0 invert" : "brightness-0 invert opacity-50"}`} />
                  <span className={`text-[10px] transition-colors ${active ? "text-white font-semibold" : "text-gray-400 font-medium"}`}>{item.text}</span>
                  {active && <div className="w-4 h-0.5 bg-white rounded-full" />}
                </Link>
              );
            })}
          </div>
          <div className="w-[20%]" />
          <div className="flex w-[40%] justify-around">
            {navItems.slice(2).map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center space-y-0.5 w-16 h-full">
                  <img src={item.icon} alt={item.text} className={`w-5 h-5 transition-all ${active ? "brightness-0 invert" : "brightness-0 invert opacity-50"}`} />
                  <span className={`text-[10px] transition-colors ${active ? "text-white font-semibold" : "text-gray-400 font-medium"}`}>{item.text}</span>
                  {active && <div className="w-4 h-0.5 bg-white rounded-full" />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center AI Button */}
      <Link
        to="/ai-chat"
        className="absolute left-1/2 bottom-[42px] -translate-x-1/2 flex items-center justify-center w-[54px] h-[54px] rounded-full z-[60] transition-transform hover:scale-105 active:scale-95 bg-[#bd0008] shadow-[0_4px_25px_rgba(189,0,8,0.8)]"
      >
        <img src="/agent.png" alt="AI Agent" className="w-7 h-7 brightness-0 invert" />
      </Link>
    </div>
  );
};

export default MobileBottomNav;
