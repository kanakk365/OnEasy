import React from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../sidebar/SuperAdminSidebar';
import SuperAdminHeader from '../header/SuperAdminHeader';
import useSidebarStore from '../../../stores/sidebarStore';

function SuperAdminLayout() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content Area - Matches user layout structure */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-[70px]' : 'lg:ml-60'
        }`}
      >
        {/* Header */}
        <SuperAdminHeader />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;



