import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RiDashboardLine, RiRobot2Line, RiFileEditLine, RiUser3Line } from "react-icons/ri";
import {
  MdOutlineSubscriptions,
  MdOutlineArticle,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import { BsBuilding } from "react-icons/bs";
import { TbCopy } from "react-icons/tb";
import {
  IoLogOutOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import useSidebarStore from "../../stores/sidebarStore";
import useLogoutModalStore from "../../stores/logoutModalStore";
import LogoutModal from "../common/LogoutModal";
import { AUTH_CONFIG } from "../../config/auth";
import logo from "../../assets/logo.png";

function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebarStore();
  const isRegistrationsActive =
    location.pathname === "/registrations" ||
    location.pathname === "/company-categories" ||
    location.pathname.startsWith("/company/") ||
    location.pathname === "/private-limited-form" ||
    location.pathname === "/private-limited-dashboard" ||
    location.pathname.startsWith("/private-limited/view/") ||
    location.pathname === "/company-form";
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const { showLogoutModal, setShowLogoutModal, closeLogoutModal, handleLogout } = useLogoutModalStore();

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
  const menuItems = [
    { icon: <RiDashboardLine />, text: "Dashboard", path: "/client" },
    {
      icon: <HiOutlineClipboardList />,
      text: "Registrations",
      path: "/registrations",
    },
    { icon: <MdOutlineArticle />, text: "Compliance", path: "/compliance" },
    { icon: <RiRobot2Line />, text: "AI Agent", path: "/ai-agent" },
    { icon: <TbCopy />, text: "Resources", path: "/resources" },
    { icon: <RiFileEditLine />, text: "My Documents", path: "/documents" },
    {
      icon: <MdOutlineSubscriptions />,
      text: "Subscriptions",
      path: "/subscriptions",
    },
    { icon: <BsBuilding />, text: "Organization", path: "/organization" },
    { icon: <RiUser3Line />, text: "Profile", path: "/settings" },
  ];

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => {
            console.log(
              "Mobile menu button clicked, current state:",
              isMobileMenuOpen
            );
            setIsMobileMenuOpen(true);
          }}
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
            "-webkit-backdrop-filter": "blur(10px)",
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
        {/* Logo Section with Toggle Button */}
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

        {/* Toggle Button for Collapsed State */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mx-auto mt-3 mb-2 bg-gray-100 hover:bg-gray-200 rounded-lg p-1.5 transition-colors duration-200"
          >
            <IoChevronForwardOutline className="w-4 h-4 text-gray-600" />
          </button>
        )}

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
                (
                  item.path === "/registrations"
                    ? isRegistrationsActive
                    : location.pathname === item.path
                )
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
                    location.pathname === item.path
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
                        {userData?.name || 'User'}
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
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-[60] transform transition-transform duration-300 translate-x-0 flex flex-col">
          {/* Debug info */}
          {console.log(
            "Mobile sidebar rendering, isMobileMenuOpen:",
            isMobileMenuOpen
          )}
          {/* Mobile Sidebar Header */}
          <div className="px-6 pt-4 pb-4 flex justify-between items-center border-b border-gray-200">
            <img src={logo} alt="OnEasy Logo" className="h-10 w-auto" />
            <button
              onClick={() => {
                console.log("Close button clicked");
                setIsMobileMenuOpen(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <MdClose className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 pt-3 space-y-2.5">
            {menuItems.map((item, index) => (
              <Link
                to={item.path}
                key={index}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                  (
                    item.path === "/client"
                      ? location.pathname === "/client"
                      : item.text === "Registrations"
                      ? isRegistrationsActive
                      : location.pathname === item.path
                  )
                    ? "bg-slate-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Profile Section */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3 flex-1">
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#01334C] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData?.email || userData?.phone || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <IoLogOutOutline className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default Sidebar;

                  )
                    ? "bg-slate-800 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Profile Section */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3 flex-1">
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#01334C] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData?.email || userData?.phone || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <IoLogOutOutline className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default Sidebar;