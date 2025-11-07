import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import OTPVerification from "../pages/OTPVerification";
import ReferralCode from "../pages/ReferralCode";
import Client from "../pages/Client";
import Admin from "../pages/Admin";
import Partner from "../pages/Partner";
import Registrations from "../pages/Registrations";
import CompanyCategories from "../pages/CompanyCategories";
import CompanyDetails from "../pages/CompanyDetails";
import BusinessDetailsForm from "../pages/BusinessDetailsForm";
import Settings from "../pages/Settings";
import Organization from "../pages/Organization";
import PrivateLimitedForm from "../forms/PrivateLimitedForm";
import PrivateLimitedDashboard from "../pages/PrivateLimitedDashboard";
import PrivateLimitedDetails from "../pages/PrivateLimitedDetails";
import AdminLayout from "../admin/layout/AdminLayout";
import AdminClients from "../admin/pages/AdminClients";
import AdminProfile from "../admin/pages/AdminProfile";
import AdminFillForm from "../admin/pages/AdminFillForm";
import SuperAdminLayout from "../superadmin/layout/SuperAdminLayout";
import SuperAdminClients from "../superadmin/pages/SuperAdminClients";
import SuperAdminProfile from "../superadmin/pages/SuperAdminProfile";
import SuperAdminFillForm from "../superadmin/pages/SuperAdminFillForm";

function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/referral" element={<ReferralCode />} />
      <Route path="/client" element={<Client />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/partner" element={<Partner />} />
      <Route path="/registrations" element={<Registrations />} />
      <Route path="/company-categories" element={<CompanyCategories />} />
      <Route path="/company/:type" element={<CompanyDetails />} />
      <Route path="/company-form" element={<BusinessDetailsForm />} />
      <Route path="/private-limited-form" element={<PrivateLimitedForm />} />
      <Route path="/private-limited-dashboard" element={<PrivateLimitedDashboard />} />
      <Route path="/private-limited/view/:ticketId" element={<PrivateLimitedDetails />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/organization" element={<Organization />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="clients" element={<AdminClients />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="client-details/:ticketId" element={<PrivateLimitedDetails />} />
        <Route path="fill-form/:ticketId" element={<AdminFillForm />} />
      </Route>
      
      {/* SuperAdmin Routes */}
      <Route path="/superadmin" element={<SuperAdminLayout />}>
        <Route path="clients" element={<SuperAdminClients />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="client-details/:ticketId" element={<PrivateLimitedDetails />} />
        <Route path="fill-form/:ticketId" element={<SuperAdminFillForm />} />
      </Route>
    </Routes>
  );
}

export default Routers;
