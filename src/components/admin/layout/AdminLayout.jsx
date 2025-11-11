import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../sidebar/AdminSidebar';
import AdminHeader from '../header/AdminHeader';
import useSidebarStore from '../../../stores/sidebarStore';

function AdminLayout() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area - Matches user layout structure */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-[70px]' : 'lg:ml-60'
        }`}
      >
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

















