import React, { useState } from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { IoCallOutline, IoMailOutline, IoSearchOutline, IoLogOutOutline } from 'react-icons/io5';
import { BiSupport } from 'react-icons/bi';
import { MdKeyboardArrowDown } from 'react-icons/md';
import useLogoutModalStore from '../../../stores/logoutModalStore';
import LogoutModal from '../../common/LogoutModal';
import { AUTH_CONFIG } from '../../../config/auth';

function AdminHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = React.useState(null);
  const { showLogoutModal, setShowLogoutModal, closeLogoutModal, handleLogout } = useLogoutModalStore();
  const profileRef = React.useRef();

  // Load user data from localStorage
  const loadUserData = React.useCallback(() => {
    const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  React.useEffect(() => {
    // Load initial user data
    loadUserData();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [loadUserData]);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white py-3 border-b border-gray-200 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 lg:px-12">
        {/* Left side - Search */}
        <div className="w-32 md:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchOutline className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search" 
              className="block w-full pl-7 md:pl-9 pr-2 md:pr-3 py-1.5 text-xs md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Contact my POC Button */}
          <div className="relative">
            <button 
              className="hidden md:flex items-center space-x-2 bg-[#01334C] hover:bg-[#00486D] text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img 
                src="https://ui-avatars.com/api/?name=Support+Team&background=0D8ABC&color=fff" 
                alt="POC" 
                className="w-5 h-5 rounded-full"
              />
              <span>Contact my POC</span>
              <MdKeyboardArrowDown className={`w-4 h-4 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                <a href="tel:+919100152222" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-200">
                  <IoCallOutline className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Call Support</span>
                </a>
                <a href="mailto:support@oneasy.in" className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-200">
                  <IoMailOutline className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Email Support</span>
                </a>
              </div>
            )}
          </div>

          {/* Talk to Customer Care Button */}
          <button className="hidden sm:flex items-center space-x-2 bg-white border border-[#01334C] text-[#01334C] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm">
            <BiSupport className="w-4 h-4" />
            <span>Talk to Customer Care</span>
          </button>

          {/* Notification and Avatar */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#01334C] w-8 h-8 rounded-full text-white cursor-pointer hover:bg-[#00486D] transition-colors duration-200 flex items-center justify-center">
              <IoMdNotificationsOutline className="w-4 h-4" />
            </div>
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-[#00486D] transition-all duration-200"
              >
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#01334C] text-white flex items-center justify-center">
                    <span className="text-sm">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
                    </span>
                  </div>
                )}
              </button>
              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                >
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowLogoutModal(true);
                    }} 
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <IoLogOutOutline className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={closeLogoutModal} onConfirm={handleLogout} />
    </header>
  );
}

export default AdminHeader;

























