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
import RegistrationPackageSelection from "../pages/RegistrationPackageSelection";
import RegistrationForm from "../forms/RegistrationForm";
import CompanyCategories from "../pages/CompanyCategories";
import CompanyDetails from "../pages/CompanyDetails";
import StartupIndiaForm from "../pages/StartupIndiaForm";
import StartupIndiaDetails from "../pages/StartupIndiaDetails";
import StartupIndiaViewDetails from "../pages/StartupIndiaViewDetails";
import StartupIndiaDashboard from "../pages/StartupIndiaDashboard";
import Settings from "../pages/Settings";
import Organization from "../pages/Organization";
import CouponCodeGenerator from "../pages/CouponCodeGenerator";
import PrivateLimitedForm from "../forms/PrivateLimitedForm";
import PrivateLimitedDashboard from "../pages/PrivateLimitedDashboard";
import PrivateLimitedDetails from "../pages/PrivateLimitedDetails";
import ProprietorshipDetails from "../pages/ProprietorshipDetails";
import ProprietorshipForm from "../forms/ProprietorshipForm";
import ProprietorshipDashboard from "../pages/ProprietorshipDashboard";
import ProprietorshipViewDetails from "../pages/ProprietorshipViewDetails";
import GSTDetails from "../pages/GSTDetails";
import GSTPackageSelection from "../pages/GSTPackageSelection";
import GSTForm from "../pages/GSTForm";
import GSTDashboard from "../pages/GSTDashboard";
import GSTViewDetails from "../pages/GSTViewDetails";
import PaymentSuccess from "../pages/PaymentSuccess";
import AdminLayout from "../admin/layout/AdminLayout";
import AdminClients from "../admin/pages/AdminClients";
import AdminClientOverview from "../admin/pages/AdminClientOverview";
import AdminProfile from "../admin/pages/AdminProfile";
import AdminFillForm from "../admin/pages/AdminFillForm";
import AdminAddUser from "../admin/pages/AdminAddUser";
import AdminNewRegistration from "../admin/pages/AdminNewRegistration";
import AdminFillFormNew from "../admin/pages/AdminFillFormNew";
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
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/referral" element={<ReferralCode />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      
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
      <Route path="/registration-packages" element={
        <ProtectedRoute>
          <RegistrationPackageSelection />
        </ProtectedRoute>
      } />
      <Route path="/gst-registration-form" element={
        <ProtectedRoute>
          <RegistrationForm />
        </ProtectedRoute>
      } />
      <Route path="/udyam-registration-form" element={
        <ProtectedRoute>
          <RegistrationForm />
        </ProtectedRoute>
      } />
      <Route path="/professional-tax-form" element={
        <ProtectedRoute>
          <RegistrationForm />
        </ProtectedRoute>
      } />
      <Route path="/labour-license-form" element={
        <ProtectedRoute>
          <RegistrationForm />
        </ProtectedRoute>
      } />
      <Route path="/provident-fund-form" element={
        <ProtectedRoute>
          <RegistrationForm />
        </ProtectedRoute>
      } />
      <Route path="/fssai-form" element={
        <ProtectedRoute>
          <RegistrationForm />
        </ProtectedRoute>
      } />
      <Route path="/trade-license-form" element={
        <ProtectedRoute>
          <RegistrationForm />
        </ProtectedRoute>
      } />
      <Route path="/iec-form" element={
        <ProtectedRoute>
          <RegistrationForm />
        </ProtectedRoute>
      } />
      <Route path="/registration-form" element={
        <ProtectedRoute>
          <RegistrationForm />
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
      <Route path="/startup-india-details" element={
        <ProtectedRoute>
          <StartupIndiaDetails />
        </ProtectedRoute>
      } />
      <Route path="/startup-india-form" element={
        <ProtectedRoute>
          <StartupIndiaForm />
        </ProtectedRoute>
      } />
      <Route path="/startup-india/view/:ticketId" element={
        <ProtectedRoute>
          <StartupIndiaViewDetails />
        </ProtectedRoute>
      } />
      <Route path="/startup-india-dashboard" element={
        <ProtectedRoute>
          <StartupIndiaDashboard />
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
      <Route path="/gst-details" element={
        <ProtectedRoute>
          <GSTDetails />
        </ProtectedRoute>
      } />
      <Route path="/gst-package-selection" element={
        <ProtectedRoute>
          <GSTPackageSelection />
        </ProtectedRoute>
      } />
      <Route path="/gst-form" element={
        <ProtectedRoute>
          <GSTForm />
        </ProtectedRoute>
      } />
      <Route path="/gst-dashboard" element={
        <ProtectedRoute>
          <GSTDashboard />
        </ProtectedRoute>
      } />
      <Route path="/gst/view/:ticketId" element={
        <ProtectedRoute>
          <GSTViewDetails />
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
        <Route path="add-user" element={<AdminAddUser />} />
        <Route path="new-registration" element={<AdminNewRegistration />} />
        <Route path="fill-form-new" element={<AdminFillFormNew />} />
        <Route path="coupon-generator" element={<CouponCodeGenerator />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="client-details/:ticketId" element={<RegistrationDetailsRouter />} />
        <Route path="fill-form/:ticketId" element={<AdminFillForm />} />
        {/* Admin form routes - these use AdminLayout */}
        <Route path="gst-form" element={<GSTForm />} />
        <Route path="startup-india-form" element={<StartupIndiaForm />} />
        <Route path="proprietorship-form" element={<ProprietorshipForm />} />
        <Route path="private-limited-form" element={<PrivateLimitedForm />} />
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
