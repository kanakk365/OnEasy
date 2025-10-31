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

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && <Sidebar />}
      <div
        className={
          !isAuthPage
            ? `transition-all duration-300 ${
                isCollapsed ? "lg:ml-[70px]" : "lg:ml-60"
              }`
            : ""
        }
      >
        {!isAuthPage && <Header />}
        <main className="min-h-[calc(100vh-4rem)]">
          <Routers />
        </main>
        {!isAuthPage && <Footer />}
      </div>
    </div>
  );
};

export default Layout;
