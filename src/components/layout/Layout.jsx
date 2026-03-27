import React from "react";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";
import Footer from "../footer/Footer";
import Routers from "../routers/Routers";
import { useLocation } from "react-router-dom";
import useSidebarStore from "../../stores/sidebarStore";
import MobileBottomNav from "./MobileBottomNav";
import MobileHome from "./MobileHome";
import AIAgentFAB from "./AIAgentFAB";

const Layout = () => {
  const location = useLocation();
  const { isCollapsed } = useSidebarStore();
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/verify-otp" ||
    location.pathname === "/referral" ||
    location.pathname === "/payment-success";
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

  const isClientHome = location.pathname === "/client";
  const isAIChat = location.pathname === "/ai-chat";

  if (isAIChat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routers />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-[90px] lg:pb-0">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "lg:ml-[70px]" : "lg:ml-60"
        }`}
      >
        <Header />
        <main className="min-h-[calc(100vh-4rem-90px)] lg:min-h-[calc(100vh-4rem)]">
          {isClientHome && <MobileHome />}
          <div className={isClientHome ? "hidden lg:block" : ""}>
            <Routers />
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
        <AIAgentFAB />
      </div>
    </div>
  );
};

export default Layout;
