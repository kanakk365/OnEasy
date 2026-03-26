import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RiDashboardLine,
  RiRobot2Line,
  RiFileEditLine,
  RiUser3Line,
  RiTaskLine,
} from "react-icons/ri";
import {
  MdOutlineSubscriptions,
  MdOutlineArticle,
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

function Sidebar() {
  const location = useLocation();
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
  const menuItems = [
    { icon: <RiDashboardLine />, text: "Dashboard", path: "/client" },
    { icon: <RiUser3Line />, text: "Profile", path: "/settings" },
    {
      icon: <HiOutlineClipboardList />,
      text: "Registrations",
      path: "/registrations",
    },
    { icon: <MdOutlineArticle />, text: "Compliance", path: "/compliance" },
    {
      icon: <RiTaskLine />,
      text: "Assigned Compliances",
      path: "/assigned-compliances",
    },
    { icon: <RiRobot2Line />, text: "AI Agent", path: "/ai-agent" },
    { icon: <TbCopy />, text: "Resources", path: "/resources" },
    { icon: <RiFileEditLine />, text: "My Documents", path: "/documents" },

    { icon: <BsBuilding />, text: "My Organizations", path: "/organization" },
    // {
    //   icon: <MdOutlineSubscriptions />,
    //   text: "Invoices",
    //   path: "/subscriptions",
    // },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`${isCollapsed ? "w-[70px]" : "w-[240px]"
          } h-screen bg-[#022b51] fixed left-0 top-0 hidden lg:flex flex-col transition-all duration-300 border-r border-[#022b51]`}
      >
        {/* Logo Section with Toggle Button */}
        <div
          className={`${isCollapsed ? "px-2" : "px-6"
            } pt-4 pb-4 flex justify-between items-center transition-all duration-300 border-b border-white/10`}
        >
          <img
            src="/logo-white.png"
            alt="OnEasy Logo"
            className={`${isCollapsed ? "h-7 max-w-[50px] object-contain" : "h-10"
              } w-auto transition-all duration-300 ${isCollapsed ? "mx-auto" : ""
              }`}
          />
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-lg p-1.5 hover:opacity-80 transition-all duration-200"
              style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
            >
              <IoChevronBackOutline className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Toggle Button for Collapsed State */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mx-auto mt-3 mb-2 rounded-lg p-1.5 hover:opacity-80 transition-all duration-200"
            style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
          >
            <IoChevronForwardOutline className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Navigation */}
        <nav
          className={`flex-1 ${isCollapsed ? "px-2" : "px-4"
            } pt-3 space-y-2.5 transition-all duration-300`}
        >
          {menuItems.map((item, index) => {
            const isActive = item.path === "/registrations"
              ? isRegistrationsActive
              : location.pathname === item.path;
            return (
            <Link
              to={item.path}
              key={index}
              className={`flex items-center ${isCollapsed ? "justify-center px-2" : "space-x-3 px-3"
                } py-2 rounded-lg transition-all duration-200 ${isActive
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
                } group relative`}
              style={isActive ? { background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" } : {}}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(1,80,121,0.5)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = ""; }}
              title={isCollapsed ? item.text : ""}
            >
              <span
                className={`${isCollapsed ? "w-auto" : "w-5"
                  } flex justify-center`}
              >
                {React.cloneElement(item.icon, {
                  className: `text-base ${location.pathname === item.path
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
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
          );
          })}
        </nav>

        {/* Profile Section */}
        <div className="mt-auto border-t border-white/10">
          <div
            className={`${isCollapsed ? "p-2" : "p-4"
              } transition-all duration-300`}
          >
            <div
              className="relative group"
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div
                className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"
                  } cursor-pointer p-2 hover:bg-[#015079]/50 rounded-lg transition-all duration-200`}
              >
                {userData?.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt="Profile"
                    className={`${isCollapsed ? "w-8 h-8" : "w-6 h-6"
                      } rounded-full object-cover transition-all duration-300`}
                  />
                ) : (
                  <div
                    className={`${isCollapsed ? "w-8 h-8" : "w-6 h-6"
                      } bg-[#015079] rounded-full flex items-center justify-center text-white text-xs transition-all duration-300`}
                  >
                    {userData?.name
                      ? userData.name.charAt(0).toUpperCase()
                      : "A"}
                  </div>
                )}
                {!isCollapsed && (
                  <>
                    <div>
                      <div className="text-[11px] text-gray-400">
                        Welcome 👋
                      </div>
                      <div className="text-[13px] text-white">
                        {userData?.name || "User"}
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
                  className={`absolute bottom-full ${isCollapsed ? "left-full ml-2" : "left-0"
                    } mb-1 ${isCollapsed ? "w-auto" : "w-full"
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

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default Sidebar;
