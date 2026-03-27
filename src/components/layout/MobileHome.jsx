import React from 'react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  {
    icon: '/agent.png',
    title: 'OnEasy AI Assistance',
    description: 'Your smart compliance & business assistant',
    path: '/ai-chat',
    gradient: 'from-red-500 to-red-600',
    shadow: 'shadow-red-200',
    iconBg: 'bg-red-50',
  },
  {
    icon: '/compliance.png',
    title: 'Compliance',
    description: 'Track and manage your compliance requirements',
    path: '/compliance',
    gradient: 'from-[#022B51] to-[#015079]',
    shadow: 'shadow-blue-200',
    iconBg: 'bg-blue-50',
  },
  {
    icon: '/Home.png',
    title: 'Dashboard',
    description: 'Overview of your business at a glance',
    path: '/client',
    gradient: 'from-slate-600 to-slate-700',
    shadow: 'shadow-slate-200',
    iconBg: 'bg-slate-50',
  },
  {
    icon: '/Home.png',
    title: 'Services',
    description: 'Explore our professional services',
    path: '/client-services',
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-200',
    iconBg: 'bg-emerald-50',
  },
  {
    icon: '/Home.png',
    title: 'Registrations',
    description: 'Company registrations and licenses',
    path: '/registrations',
    gradient: 'from-violet-500 to-violet-600',
    shadow: 'shadow-violet-200',
    iconBg: 'bg-violet-50',
  },
  {
    icon: '/document.png',
    title: 'Resources',
    description: 'Browse documents and helpful resources',
    path: '/resources',
    gradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-200',
    iconBg: 'bg-amber-50',
  },
  {
    icon: '/document.png',
    title: 'Documents',
    description: 'Access and manage your documents',
    path: '/documents',
    gradient: 'from-cyan-500 to-cyan-600',
    shadow: 'shadow-cyan-200',
    iconBg: 'bg-cyan-50',
  },
];

const gradientColors = [
  '#022B51, #015079',   // Compliance
  '#022B51, #015079',   // Dashboard
  '#022B51, #015079',   // Services
  '#022B51, #015079',   // Registrations
  '#022B51, #015079',   // Resources
  '#022B51, #015079',   // Documents
];

const MobileHome = () => {
  const navigate = useNavigate();

  return (
    <div className="lg:hidden px-4 pt-4 pb-24">
      {/* Welcome header */}
      <div className="mb-5 px-1">
        <h1 className="text-2xl font-bold text-gray-800">Welcome 👋</h1>
        <p className="text-sm text-gray-500 mt-1">What would you like to do today?</p>
      </div>

      {/* Featured AI Card */}
      <button
        onClick={() => navigate(menuItems[0].path)}
        className="w-full mb-4 p-5 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-200 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <img src="/agent.png" alt="AI" className="w-8 h-8 brightness-0 invert" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-lg">{menuItems[0].title}</p>
            <p className="text-white/70 text-xs mt-0.5">{menuItems[0].description}</p>
          </div>
          <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Grid cards */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.slice(1).map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="p-4 rounded-2xl text-white active:scale-[0.97] transition-all duration-200 text-left shadow-md"
            style={{ background: `linear-gradient(135deg, ${gradientColors[index]})` }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-3 backdrop-blur-sm">
              <img src={item.icon} alt={item.title} className="w-6 h-6 brightness-0 invert" />
            </div>
            <p className="font-semibold text-[14px] leading-tight">{item.title}</p>
            <p className="text-[11px] text-white/70 mt-1 leading-snug line-clamp-2">{item.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileHome;
