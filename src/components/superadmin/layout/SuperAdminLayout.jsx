import React from 'react';
import { Outlet } from 'react-router-dom';
import SupersuperadminSidebar from '../sidebar/SupersuperadminSidebar';
import SupersuperadminHeader from '../header/SupersuperadminHeader';
import useSidebarStore from '../../../stores/sidebarStore';

function SupersuperadminLayout() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SupersuperadminSidebar />

      {/* Main Content Area - Matches user layout structure */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-[70px]' : 'lg:ml-60'
        }`}
      >
        {/* Header */}
        <SupersuperadminHeader />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SupersuperadminLayout;


