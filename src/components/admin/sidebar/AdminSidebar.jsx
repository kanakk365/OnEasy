import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RiUser3Line,
  RiUserAddLine,
  RiTicketLine,
  RiSettings3Line,
  RiAlertLine,
  RiFolderSettingsLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { BsBuilding } from "react-icons/bs";
import { HiOutlineUsers } from "react-icons/hi";
import { RiGroupLine } from "react-icons/ri";
import { MdMenu, MdClose } from "react-icons/md";
import {
  IoLogOutOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import useSidebarStore from "../../../stores/sidebarStore";
import useLogoutModalStore from "../../../stores/logoutModalStore";
import LogoutModal from "../../common/LogoutModal";
import { AUTH_CONFIG } from "../../../config/auth";

function AdminSidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebarStore();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const {
    showLogoutModal,
    setShowLogoutModal,
    closeLogoutModal,
    handleLogout,
  } = useLogoutModalStore();

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
    loadUserData();

    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [loadUserData]);

  const menuItems = [
    {
      icon: <HiOutlineUsers />,
      text: "Clients",
      path: "/admin/clients",
      subPaths: [
        "/admin/client-overview",
        "/admin/client-details",
        "/admin/fill-form",
        "/admin/gst-form",
        "/admin/startup-india-form",
        "/admin/proprietorship-form",
        "/admin/private-limited-form",
      ],
    },
    { icon: <RiUserAddLine />, text: "Add User", path: "/admin/add-user" },
    {
      icon: <RiUserAddLine />,
      text: "New Registration",
      path: "/admin/new-registration",
    },
    {
      icon: <RiMoneyDollarCircleLine />,
      text: "Custom Payment",
      path: "/admin/custom-payment",
    },
    { icon: <RiSettings3Line />, text: "Services", path: "/admin/services" },
    {
      icon: <BsBuilding />,
      text: "Organizations",
      path: "/admin/organizations",
    },
    {
      icon: <RiGroupLine />,
      text: "Directors",
      path: "/admin/directors",
    },
    {
      icon: <RiFolderSettingsLine />,
      text: "Documents Vault",
      path: "/admin/documents-vault",
      subPaths: [
        "/admin/client-documents",
        "/admin/client-kyc",
        "/admin/client-directors",
      ],
    },
    {
      icon: <RiAlertLine />,
      text: "Notice Board",
      path: "/admin/notice-board",
    },
    {
      icon: <RiTicketLine />,
      text: "Coupon Code Generator",
      path: "/admin/coupon-generator",
    },
    {
      icon: <RiFolderSettingsLine />,
      text: "CMS for Package",
      path: "/admin/cms-package",
    },
    { icon: <RiUser3Line />, text: "Profile", path: "/admin/profile" },
  ];

  const isActive = (item) => {
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + "/") ||
      (item.subPaths &&
        item.subPaths.some((subPath) => location.pathname.startsWith(subPath)))
    );
  };

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden absolute top-3 left-4 z-[70] bg-[#022b51] p-2 rounded-lg shadow-lg border border-[#26496a]"
        >
          <MdMenu className="w-6 h-6 text-white" />
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
        } h-screen bg-[#022b51] fixed left-0 top-0 flex flex-col hidden lg:flex transition-all duration-300 border-r border-[#022b51]`}
      >
        {/* Logo Section */}
        <div
          className={`${
            isCollapsed ? "px-3" : "px-6"
          } pt-4 pb-4 flex justify-between items-center transition-all duration-300 border-b border-[#26496a]/30`}
        >
          <img
            src="/logo.jpg"
            alt="OnEasy Logo"
            className={`${
              isCollapsed ? "h-8" : "h-10"
            } w-auto transition-all duration-300 ${
              isCollapsed ? "mx-auto" : ""
            } brightness-0 invert`}
          />
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-[#26496a] hover:bg-[#345d82] rounded-lg p-1.5 transition-colors duration-200"
            >
              <IoChevronBackOutline className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Toggle Button for Collapsed State */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mx-auto mt-3 mb-2 bg-[#26496a] hover:bg-[#345d82] rounded-lg p-1.5 transition-colors duration-200"
          >
            <IoChevronForwardOutline className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Navigation */}
        <nav
          className={`flex-1 min-h-0 ${
            isCollapsed ? "px-2" : "px-3"
          } pt-2 pb-0 space-y-0.5 transition-all duration-300 overflow-y-auto overflow-x-hidden`}
        >
          {menuItems.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={`flex items-center ${
                isCollapsed ? "justify-center px-3" : "space-x-2 px-3"
              } py-1.5 rounded-lg transition-all duration-200 ${
                isActive(item)
                  ? "bg-[#26496a] text-white"
                  : "text-gray-300 hover:bg-[#26496a]/50 hover:text-white"
              } group relative`}
              title={isCollapsed ? item.text : ""}
            >
              <span
                className={`${
                  isCollapsed ? "w-auto" : "w-4"
                } flex justify-center`}
              >
                {React.cloneElement(item.icon, {
                  className: `text-sm ${
                    isActive(item) ? "text-white" : "text-gray-400"
                  }`,
                })}
              </span>
              {!isCollapsed && <span className="text-[12.9px]">{item.text}</span>}

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
        <div className="mt-0 border-t border-[#26496a]/30 flex-shrink-0">
          <div
            className={`${
              isCollapsed ? "p-1.5" : "p-2"
            } transition-all duration-300`}
          >
            <div
              className="relative group"
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "space-x-1.5"
                } cursor-pointer p-1.5 hover:bg-[#26496a]/50 rounded-lg transition-all duration-200`}
              >
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt="Profile"
                    className={`${
                      isCollapsed ? "w-6 h-6" : "w-6 h-6"
                    } rounded-full object-cover transition-all duration-300 flex-shrink-0`}
                  />
                ) : (
                  <div
                    className={`${
                      isCollapsed ? "w-6 h-6" : "w-6 h-6"
                    } bg-[#26496a] rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300 flex-shrink-0`}
                  >
                    {userData?.name
                      ? userData.name.charAt(0).toUpperCase()
                      : "A"}
                  </div>
                )}
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white font-medium break-words leading-tight">
                        {userData?.name || "Admin"}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 ml-0.5 transform transition-transform duration-200 group-hover:rotate-90 flex-shrink-0">
                      ›
                    </span>
                  </>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    <div className="font-medium">
                      {userData?.name || "Admin"}
                    </div>
                  </div>
                )}
              </div>

              {isProfileOpen && (
                <div
                  className={`absolute bottom-full ${
                    isCollapsed ? "left-full ml-2" : "left-0"
                  } mb-1 ${
                    isCollapsed ? "w-auto" : "w-full"
                  } bg-[#1a3d5c] rounded-lg shadow-lg py-2 z-50 border border-[#26496a]`}
                >
                  {!isCollapsed && (
                    <div className="px-4 py-2 border-b border-[#26496a]">
                      <div className="text-xs text-gray-400 mb-1">
                        Signed in as
                      </div>
                      <div className="text-sm font-medium text-white">
                        {userData?.name || "Admin"}
                      </div>
                      {userData?.email && (
                        <div className="text-xs text-gray-400 mt-1">
                          {userData.email}
                        </div>
                      )}
                    </div>
                  )}
                  <Link
                    to="/admin/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#26496a] transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap"
                  >
                    <RiUser3Line className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#26496a] transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap"
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
        className={`lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-[#022b51] z-[60] transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-xl`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#26496a]/30">
          <img
            src="/logo.jpg"
            alt="OnEasy Logo"
            className="h-10 w-auto brightness-0 invert"
          />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-[#26496a] rounded-lg transition-colors"
          >
            <MdClose className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Menu Items */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item, index) => {
            const active = isActive(item);
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 transition-all duration-200 ${
                  active
                    ? "bg-[#26496a] border-r-4 border-white text-white"
                    : "text-gray-300 hover:bg-[#26496a]/50 hover:text-white"
                }`}
              >
                <span className="text-2xl mr-4">{item.icon}</span>
                <span className="font-medium text-[15px]">{item.text}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout */}
        <div className="px-4 py-4 border-t border-[#26496a]/30">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowLogoutModal(true);
            }}
            className="w-full flex items-center px-3 py-3 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          >
            <IoLogOutOutline className="text-2xl mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default AdminSidebar;
