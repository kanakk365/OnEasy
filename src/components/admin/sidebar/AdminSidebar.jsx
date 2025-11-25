import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RiUser3Line, RiUserAddLine, RiTicketLine } from "react-icons/ri";
import { HiOutlineUsers } from "react-icons/hi";
import {
  MdMenu,
  MdClose,
} from "react-icons/md";
import {
  IoLogOutOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import useSidebarStore from "../../../stores/sidebarStore";
import useLogoutModalStore from "../../../stores/logoutModalStore";
import LogoutModal from "../../common/LogoutModal";
import { AUTH_CONFIG } from "../../../config/auth";
import apiClient from "../../../utils/api";
import logo from "../../../assets/logo.png";

function AdminSidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebarStore();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const { showLogoutModal, setShowLogoutModal, closeLogoutModal, handleLogout } = useLogoutModalStore();

  // Load user data directly from database
  const loadUserData = React.useCallback(async () => {
    try {
      const response = await apiClient.getMe();
      
      if (response.success && response.data) {
        console.log('✅ AdminSidebar - Fetched user data from database:', response.data);
        setUserData(response.data);
        // Also update localStorage for other components that might need it
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.data));
      } else {
        console.error('❌ AdminSidebar - Failed to fetch user data:', response);
        // Fallback to localStorage if API fails
        const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        if (storedUser) {
          try {
            setUserData(JSON.parse(storedUser));
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }
      }
    } catch (error) {
      console.error('❌ AdminSidebar - Error fetching user data from database:', error);
      // Fallback to localStorage if API fails
      const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
    }
  }, []);

  React.useEffect(() => {
    // Load initial user data from database
    loadUserData();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadUserData(); // Fetch fresh data from database
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [loadUserData]);

  const menuItems = [
    { icon: <HiOutlineUsers />, text: "Clients", path: "/admin/clients", subPaths: ['/admin/client-overview', '/admin/client-details', '/admin/fill-form', '/admin/gst-form', '/admin/startup-india-form', '/admin/proprietorship-form', '/admin/private-limited-form'] },
    { icon: <RiUserAddLine />, text: "Add User", path: "/admin/add-user" },
    { icon: <RiUserAddLine />, text: "New Registration", path: "/admin/new-registration" },
    { icon: <RiTicketLine />, text: "Coupon Code Generator", path: "/admin/coupon-generator" },
    { icon: <RiUser3Line />, text: "Profile", path: "/admin/profile" },
  ];

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden absolute top-3 left-4 z-[70] bg-white p-2 rounded-lg shadow-lg border border-gray-200"
        >
          <MdMenu className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[50]"
          style={{
            background: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`${
          isCollapsed ? "w-[70px]" : "w-[240px]"
        } h-screen bg-white fixed left-0 top-0 flex flex-col hidden lg:flex transition-all duration-300 border-r border-gray-200`}
      >
        {/* Logo Section */}
        <div
          className={`${
            isCollapsed ? "px-3" : "px-6"
          } pt-4 pb-4 flex justify-between items-center transition-all duration-300 border-b border-gray-100`}
        >
          <img
            src={logo}
            alt="OnEasy Logo"
            className={`${
              isCollapsed ? "h-8" : "h-10"
            } w-auto transition-all duration-300 ${
              isCollapsed ? "mx-auto" : ""
            }`}
          />
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-gray-100 hover:bg-gray-200 rounded-lg p-1.5 transition-colors duration-200"
            >
              <IoChevronBackOutline className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 ${
            isCollapsed ? "px-2" : "px-4"
          } pt-3 space-y-2.5 transition-all duration-300`}
        >
          {menuItems.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={`flex items-center ${
                isCollapsed ? "justify-center px-2" : "space-x-3 px-3"
              } py-2 rounded-lg transition-all duration-200 ${
                location.pathname === item.path || 
                location.pathname.startsWith(item.path + '/') ||
                (item.subPaths && item.subPaths.some(subPath => location.pathname.startsWith(subPath)))
                  ? "bg-[#01334C] text-white"
                  : "text-gray-700 hover:bg-gray-50"
              } group relative`}
              title={isCollapsed ? item.text : ""}
            >
              <span
                className={`${
                  isCollapsed ? "w-auto" : "w-5"
                } flex justify-center`}
              >
                {React.cloneElement(item.icon, {
                  className: `text-base ${
                    location.pathname === item.path || 
                    location.pathname.startsWith(item.path + '/') ||
                    (item.subPaths && item.subPaths.some(subPath => location.pathname.startsWith(subPath)))
                      ? "text-white"
                      : "text-gray-400"
                  }`,
                })}
              </span>
              {!isCollapsed && <span className="text-[13px]">{item.text}</span>}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.text}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Toggle Button for Collapsed State */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mx-auto mt-3 mb-2 bg-gray-100 hover:bg-gray-200 rounded-lg p-1.5 transition-colors duration-200"
          >
            <IoChevronForwardOutline className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Profile Section */}
        <div className="mt-auto border-t border-gray-100">
          <div
            className={`${
              isCollapsed ? "p-2" : "p-4"
            } transition-all duration-300`}
          >
            <div
              className="relative group"
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "space-x-3"
                } cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-all duration-200`}
              >
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt="Profile"
                    className={`${
                      isCollapsed ? "w-8 h-8" : "w-6 h-6"
                    } rounded-full object-cover transition-all duration-300`}
                  />
                ) : (
                  <div
                    className={`${
                      isCollapsed ? "w-8 h-8" : "w-6 h-6"
                    } bg-[#01334C] rounded-full flex items-center justify-center text-white text-xs transition-all duration-300`}
                  >
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                {!isCollapsed && (
                  <>
                    <div>
                      <div className="text-[11px] text-gray-500">
                        Welcome 👋
                      </div>
                      <div className="text-[13px] text-gray-700">
                        {userData?.name || 'Admin'}
                      </div>
                    </div>
                    <span className="text-base text-gray-400 ml-auto transform transition-transform duration-200 group-hover:rotate-90">
                      ›
                    </span>
                  </>
                )}
              </div>

              {isProfileOpen && (
                <div
                  className={`absolute bottom-full ${
                    isCollapsed ? "left-full ml-2" : "left-0"
                  } mb-1 ${
                    isCollapsed ? "w-auto" : "w-full"
                  } bg-white rounded-lg shadow-lg py-2 z-50`}
                >
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap"
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

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-white z-[60] transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-xl`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <img src={logo} alt="OnEasy Logo" className="h-10 w-auto" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Menu Items */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#e8f4f8] to-transparent border-r-4 border-[#00486D] text-[#00486D]"
                    : "text-[#5A5A5A] hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl mr-4">{item.icon}</span>
                <span className="font-medium text-[15px]">{item.text}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowLogoutModal(true);
            }}
            className="w-full flex items-center px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <IoLogOutOutline className="text-2xl mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={closeLogoutModal} onConfirm={handleLogout} />
    </>
  );
}

export default AdminSidebar;






















