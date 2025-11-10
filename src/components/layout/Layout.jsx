import React from "react";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";
import Footer from "../footer/Footer";
import Routers from "../routers/Routers";
import { useLocation } from "react-router-dom";
import useSidebarStore from "../../stores/sidebarStore";

const Layout = () => {
  const location = useLocation();
  const { isCollapsed } = useSidebarStore();
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/verify-otp" ||
    location.pathname === "/referral";
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="min-h-screen">
          <Routers />
        </main>
      </div>
    );
  }

  if (isAdminRoute || isSuperAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routers />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "lg:ml-[70px]" : "lg:ml-60"
        }`}
      >
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">
          <Routers />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
