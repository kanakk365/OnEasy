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
    </Routes>
  );
}

export default Routers;
