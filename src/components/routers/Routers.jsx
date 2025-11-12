import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import OTPVerification from "../pages/OTPVerification";
import ReferralCode from "../pages/ReferralCode";
import Client from "../pages/Client";
import Admin from "../pages/Admin";
import Partner from "../pages/Partner";
import Registrations from "../pages/Registrations";
import RegistrationCategories from "../pages/RegistrationCategories";
import CompanyCategories from "../pages/CompanyCategories";
import CompanyDetails from "../pages/CompanyDetails";
import BusinessDetailsForm from "../pages/BusinessDetailsForm";
import Settings from "../pages/Settings";
import Organization from "../pages/Organization";
import PrivateLimitedForm from "../forms/PrivateLimitedForm";
import PrivateLimitedDashboard from "../pages/PrivateLimitedDashboard";
import PrivateLimitedDetails from "../pages/PrivateLimitedDetails";
import ProprietorshipDetails from "../pages/ProprietorshipDetails";
import ProprietorshipForm from "../forms/ProprietorshipForm";
import ProprietorshipDashboard from "../pages/ProprietorshipDashboard";
import ProprietorshipViewDetails from "../pages/ProprietorshipViewDetails";
import AdminLayout from "../admin/layout/AdminLayout";
import AdminClients from "../admin/pages/AdminClients";
import AdminClientOverview from "../admin/pages/AdminClientOverview";
import AdminProfile from "../admin/pages/AdminProfile";
import AdminFillForm from "../admin/pages/AdminFillForm";
import RegistrationDetailsRouter from "../admin/pages/RegistrationDetailsRouter";
import SuperAdminLayout from "../superadmin/layout/SuperAdminLayout";
import SuperAdminClients from "../superadmin/pages/SuperAdminClients";
import SuperAdminProfile from "../superadmin/pages/SuperAdminProfile";
import SuperAdminFillForm from "../superadmin/pages/SuperAdminFillForm";
import ProtectedRoute from "../common/ProtectedRoute";

function Routers() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/referral" element={<ReferralCode />} />
      
      {/* User Routes - Protected */}
      <Route path="/client" element={
        <ProtectedRoute allowedRoles={['user', 5]}>
          <Client />
        </ProtectedRoute>
      } />
      <Route path="/partner" element={
        <ProtectedRoute allowedRoles={['user', 5]}>
          <Partner />
        </ProtectedRoute>
      } />
      <Route path="/registrations" element={
        <ProtectedRoute>
          <Registrations />
        </ProtectedRoute>
      } />
      <Route path="/registration-categories" element={
        <ProtectedRoute>
          <RegistrationCategories />
        </ProtectedRoute>
      } />
      <Route path="/company-categories" element={
        <ProtectedRoute>
          <CompanyCategories />
        </ProtectedRoute>
      } />
      <Route path="/company/proprietorship" element={
        <ProtectedRoute>
          <ProprietorshipDetails />
        </ProtectedRoute>
      } />
      <Route path="/company/:type" element={
        <ProtectedRoute>
          <CompanyDetails />
        </ProtectedRoute>
      } />
      <Route path="/company-form" element={
        <ProtectedRoute>
          <BusinessDetailsForm />
        </ProtectedRoute>
      } />
      <Route path="/private-limited-form" element={
        <ProtectedRoute>
          <PrivateLimitedForm />
        </ProtectedRoute>
      } />
      <Route path="/private-limited-dashboard" element={
        <ProtectedRoute>
          <PrivateLimitedDashboard />
        </ProtectedRoute>
      } />
      <Route path="/private-limited/view/:ticketId" element={
        <ProtectedRoute>
          <PrivateLimitedDetails />
        </ProtectedRoute>
      } />
      <Route path="/proprietorship-form" element={
        <ProtectedRoute>
          <ProprietorshipForm />
        </ProtectedRoute>
      } />
      <Route path="/proprietorship-dashboard" element={
        <ProtectedRoute>
          <ProprietorshipDashboard />
        </ProtectedRoute>
      } />
      <Route path="/proprietorship/view/:ticketId" element={
        <ProtectedRoute>
          <ProprietorshipViewDetails />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/organization" element={
        <ProtectedRoute>
          <Organization />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes - Protected */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 1, 2]}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="clients" element={<AdminClients />} />
        <Route path="client-overview/:userId" element={<AdminClientOverview />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="client-details/:ticketId" element={<RegistrationDetailsRouter />} />
        <Route path="fill-form/:ticketId" element={<AdminFillForm />} />
      </Route>
      
      {/* SuperAdmin Routes - Protected */}
      <Route path="/superadmin" element={
        <ProtectedRoute allowedRoles={['superadmin', 2]}>
          <SuperAdminLayout />
        </ProtectedRoute>
      }>
        <Route path="clients" element={<SuperAdminClients />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="client-details/:ticketId" element={<RegistrationDetailsRouter />} />
        <Route path="fill-form/:ticketId" element={<SuperAdminFillForm />} />
      </Route>

      {/* Legacy Admin Route (redirects to /admin/clients) */}
      <Route path="/admin-old" element={
        <ProtectedRoute allowedRoles={['admin', 'superadmin', 1, 2]}>
          <Admin />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default Routers;
