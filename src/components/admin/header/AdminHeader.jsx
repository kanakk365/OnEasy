import React, { useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import {
  IoCallOutline,
  IoMailOutline,
  IoSearchOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { BiSupport } from "react-icons/bi";
import { MdKeyboardArrowDown } from "react-icons/md";
import useLogoutModalStore from "../../../stores/logoutModalStore";
import LogoutModal from "../../common/LogoutModal";
import { AUTH_CONFIG } from "../../../config/auth";

function AdminHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = React.useState(null);
  const {
    showLogoutModal,
    setShowLogoutModal,
    closeLogoutModal,
    handleLogout,
  } = useLogoutModalStore();
  const profileRef = React.useRef();

  // Load user data from localStorage
  const loadUserData = React.useCallback(() => {
    const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data:", e);
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

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
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
    <header className="bg-[#F8F9FA] py-3 border-b border-gray-200 relative">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-8 lg:px-12">
        {/* Left side - Search */}
        <div className="w-32 md:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchOutline className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="block w-full pl-7 md:pl-9 pr-2 md:pr-3 py-2 text-xs md:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Contact my POC Button */}
          <div className="relative">
            <button
              className="hidden md:flex items-center space-x-2 text-white px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                src="https://ui-avatars.com/api/?name=Support+Team&background=0D8ABC&color=fff"
                alt="POC"
                className="w-5 h-5 rounded-full"
              />
              <span>Contact my POC</span>
              <MdKeyboardArrowDown
                className={`w-4 h-4 transform transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100">
                <a
                  href="tel:+919100152222"
                  className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-200"
                >
                  <IoCallOutline className="w-4 h-4 text-[#00486D]" />
                  <span className="text-sm text-gray-700">Call Support</span>
                </a>
                <a
                  href="mailto:support@oneasy.in"
                  className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-200"
                >
                  <IoMailOutline className="w-4 h-4 text-[#00486D]" />
                  <span className="text-sm text-gray-700">Email Support</span>
                </a>
              </div>
            )}
          </div>

          {/* Talk to Customer Care Button */}
          <button className="hidden sm:flex items-center space-x-2 bg-white border border-[#00486D] text-[#00486D] px-4 py-2 rounded-xl hover:bg-[#00486D] hover:text-white transition-all duration-200 text-sm font-medium">
            <BiSupport className="w-4 h-4" />
            <span>Talk to Customer Care</span>
          </button>

          {/* Notification and Avatar */}
          <div className="flex items-center space-x-3">
            <button
              className="w-10 h-10 rounded-xl text-white cursor-pointer transition-all duration-200 flex items-center justify-center hover:scale-105"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
            >
              <IoMdNotificationsOutline className="w-5 h-5" />
            </button>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-xl overflow-hidden hover:ring-2 hover:ring-[#00486D] transition-all duration-200"
              >
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full text-white flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }}
                  >
                    <span className="text-sm font-medium">
                      {userData?.name
                        ? userData.name.charAt(0).toUpperCase()
                        : "A"}
                    </span>
                  </div>
                )}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">
                      Signed in as
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {userData?.name || "Admin"}
                    </div>
                  </div>
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
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </header>
  );
}

export default AdminHeader;
