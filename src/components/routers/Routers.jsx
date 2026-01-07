import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import OTPVerification from "../pages/OTPVerification";
import ReferralCode from "../pages/ReferralCode";
import Client from "../pages/Client";
import ClientServices from "../pages/ClientServices";
import NoticeBoard from "../pages/NoticeBoard";
import Admin from "../pages/Admin";
import Partner from "../pages/Partner";
import Registrations from "../pages/Registrations";
import RegistrationCategories from "../pages/RegistrationCategories";
import GSTCategories from "../pages/GSTCategories";
import ROCCategories from "../pages/ROCCategories";
import ComplianceCategories from "../pages/ComplianceCategories";
import ComplianceChat from "../pages/ComplianceChat";
import Resources from "../pages/Resources";
import TaxAccountingCategories from "../pages/TaxAccountingCategories";
import RegistrationPackageSelection from "../pages/RegistrationPackageSelection";
import RegistrationForm from "../forms/RegistrationForm";
import CompanyCategories from "../pages/CompanyCategories";
import CompanyDetails from "../pages/CompanyDetails";
import OPCDetails from "../pages/OPCDetails";
import ServiceRegistrations from "../pages/ServiceRegistrations";
import LLPDetails from "../pages/LLPDetails";
import PartnershipDetails from "../pages/PartnershipDetails";
import Section8Details from "../pages/Section8Details";
import PublicLimitedDetails from "../pages/PublicLimitedDetails";
import MCANameApprovalDetails from "../pages/MCANameApprovalDetails";
import IndianSubsidiaryDetails from "../pages/IndianSubsidiaryDetails";
import StartupIndiaForm from "../pages/StartupIndiaForm";
import StartupIndiaDetails from "../pages/StartupIndiaDetails";
import StartupIndiaViewDetails from "../pages/StartupIndiaViewDetails";
import StartupIndiaDashboard from "../pages/StartupIndiaDashboard";
import Settings from "../pages/Settings";
import Organization from "../pages/organization/index";
import Documents from "../pages/Documents";
import BusinessDocuments from "../pages/BusinessDocuments";
import BusinessDirectorsKYC from "../pages/BusinessDirectorsKYC";
import BusinessDirectorsDocumentDetail from "../pages/BusinessDirectorsDocumentDetail";
import OrganizationBusinessDocuments from "../pages/OrganizationBusinessDocuments";
import CompanyMasterData from "../pages/CompanyMasterData";
import ClientData from "../pages/ClientData";
import Accounting from "../pages/Accounting";
import Compliance from "../pages/Compliance";
import AnnualCompliance from "../pages/AnnualCompliance";
import RegistrationsLicenses from "../pages/RegistrationsLicenses";
import Secretarial from "../pages/Secretarial";
import Correspondence from "../pages/Correspondence";
import OrganizationsList from "../pages/OrganizationsList";
import CompanyDocuments from "../pages/CompanyDocuments";
import KYC from "../pages/KYC";
import KYCDocumentDetail from "../pages/KYCDocumentDetail";
import CouponCodeGenerator from "../pages/CouponCodeGenerator";
import PrivateLimitedForm from "../forms/PrivateLimitedForm";
import PrivateLimitedDashboard from "../pages/PrivateLimitedDashboard";
import PrivateLimitedDetails from "../pages/PrivateLimitedDetails";
import ProprietorshipDetails from "../pages/ProprietorshipDetails";
import ProprietorshipForm from "../forms/ProprietorshipForm";
import ProprietorshipDashboard from "../pages/ProprietorshipDashboard";
import ProprietorshipViewDetails from "../pages/ProprietorshipViewDetails";
import GSTDetails from "../pages/GSTDetails";
import GSTRegistrationDetails from "../pages/GSTRegistrationDetails";
import GSTReturnsDetails from "../pages/GSTReturnsDetails";
import GSTAnnualReturnDetails from "../pages/GSTAnnualReturnDetails";
import GSTAmendmentDetails from "../pages/GSTAmendmentDetails";
import GSTNoticeDetails from "../pages/GSTNoticeDetails";
import DirectorAdditionDetails from "../pages/DirectorAdditionDetails";
import ShareTransferDetails from "../pages/ShareTransferDetails";
import AddressChangeDetails from "../pages/AddressChangeDetails";
import ChargeCreationDetails from "../pages/ChargeCreationDetails";
import DirectorRemovalDetails from "../pages/DirectorRemovalDetails";
import MOAAmendmentDetails from "../pages/MOAAmendmentDetails";
import AOAAmendmentDetails from "../pages/AOAAmendmentDetails";
import ObjectsClauseChangeDetails from "../pages/ObjectsClauseChangeDetails";
import IncreaseShareCapitalDetails from "../pages/IncreaseShareCapitalDetails";
import NameChangeCompanyDetails from "../pages/NameChangeCompanyDetails";
import DINDeactivationDetails from "../pages/DINDeactivationDetails";
import DINReactivationDetails from "../pages/DINReactivationDetails";
import ADT1Details from "../pages/ADT1Details";
import WindingUpCompanyDetails from "../pages/WindingUpCompanyDetails";
import WindingUpLLPDetails from "../pages/WindingUpLLPDetails";
import DINApplicationDetails from "../pages/DINApplicationDetails";
import INC20ADetails from "../pages/INC20ADetails";
import GSTPackageSelection from "../pages/GSTPackageSelection";
import GSTForm from "../pages/GSTForm";
import GSTDashboard from "../pages/GSTDashboard";
import GSTViewDetails from "../pages/GSTViewDetails";
import PaymentSuccess from "../pages/PaymentSuccess";
import UdyamDetails from "../pages/UdyamDetails";
import TradeLicenseDetails from "../pages/TradeLicenseDetails";
import FSSAIDetails from "../pages/FSSAIDetails";
import ProfessionalTaxDetails from "../pages/ProfessionalTaxDetails";
import ProvidentFundDetails from "../pages/ProvidentFundDetails";
import LabourLicenseDetails from "../pages/LabourLicenseDetails";
import IECDetails from "../pages/IECDetails";
import DSCDetails from "../pages/DSCDetails";
import ESIDetails from "../pages/ESIDetails";
import GSTLUTDetails from "../pages/GSTLUTDetails";
import Registration80GDetails from "../pages/Registration80GDetails";
import Registration12ADetails from "../pages/Registration12ADetails";
import FSSAIRenewalDetails from "../pages/FSSAIRenewalDetails";
import FSSAIReturnFilingDetails from "../pages/FSSAIReturnFilingDetails";
import BusinessPlanDetails from "../pages/BusinessPlanDetails";
import HRPayrollDetails from "../pages/HRPayrollDetails";
import PFReturnFilingDetails from "../pages/PFReturnFilingDetails";
import ESIReturnFilingDetails from "../pages/ESIReturnFilingDetails";
import ProfessionalTaxReturnDetails from "../pages/ProfessionalTaxReturnDetails";
import PartnershipComplianceDetails from "../pages/PartnershipComplianceDetails";
import ProprietorshipComplianceDetails from "../pages/ProprietorshipComplianceDetails";
import CompanyComplianceDetails from "../pages/CompanyComplianceDetails";
import TrademarkDetails from "../pages/TrademarkDetails";
import SalaryITRDetails from "../pages/SalaryITRDetails";
import BusinessITRDetails from "../pages/BusinessITRDetails";
import HousePropertyITRDetails from "../pages/HousePropertyITRDetails";
import TrustITRDetails from "../pages/TrustITRDetails";
import SalaryHPCapitalGainsDetails from "../pages/SalaryHPCapitalGainsDetails";
import PartnershipFirmITRDetails from "../pages/PartnershipFirmITRDetails";
import CompanyITRDetails from "../pages/CompanyITRDetails";
import AdminLayout from "../admin/layout/AdminLayout";
import AdminClients from "../admin/pages/AdminClients";
import AdminClientOverview from "../admin/pages/AdminClientOverview";
import AdminProfile from "../admin/pages/AdminProfile";
import AdminFillForm from "../admin/pages/AdminFillForm";
import AdminAddUser from "../admin/pages/AdminAddUser";
import AdminNewRegistration from "../admin/pages/AdminNewRegistration";
import AdminFillFormNew from "../admin/pages/AdminFillFormNew";
import RegistrationDetailsRouter from "../admin/pages/RegistrationDetailsRouter";
import AdminServices from "../admin/pages/AdminServices";
import AdminNoticeBoard from "../admin/pages/AdminNoticeBoard";
import AdminNoticeManagement from "../admin/pages/AdminNoticeManagement";
import AdminCMSPackage from "../admin/pages/AdminCMSPackage";
import AdminCustomPayment from "../admin/pages/AdminCustomPayment";
import AdminDocumentsVault from "../admin/pages/AdminDocumentsVault";
import AdminClientDocuments from "../admin/pages/AdminClientDocuments";
import AdminClientKYC from "../admin/pages/AdminClientKYC";
import AdminClientKYCDetail from "../admin/pages/AdminClientKYCDetail";
import AdminClientDirectorsKYC from "../admin/pages/AdminClientDirectorsKYC";
import AdminClientDirectorsDetail from "../admin/pages/AdminClientDirectorsDetail";
import AdminClientOrganizations from "../admin/pages/AdminClientOrganizations";
import AdminClientCompanyDocuments from "../admin/pages/AdminClientCompanyDocuments";
import AdminOrganizations from "../admin/pages/AdminOrganizations";
import AdminDirectors from "../admin/pages/AdminDirectors";
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
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={["user", 5]}>
            <Client />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-services"
        element={
          <ProtectedRoute allowedRoles={["user", 5]}>
            <ClientServices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notice-board"
        element={
          <ProtectedRoute allowedRoles={["user", 5]}>
            <NoticeBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/partner"
        element={
          <ProtectedRoute allowedRoles={["user", 5]}>
            <Partner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registrations"
        element={
          <ProtectedRoute>
            <Registrations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration-categories"
        element={
          <ProtectedRoute>
            <RegistrationCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-categories"
        element={
          <ProtectedRoute>
            <GSTCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc-categories"
        element={
          <ProtectedRoute>
            <ROCCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance-categories"
        element={
          <ProtectedRoute>
            <ComplianceCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance"
        element={
          <ProtectedRoute>
            <ComplianceChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-accounting-categories"
        element={
          <ProtectedRoute>
            <TaxAccountingCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-accounting/salary-itr-details"
        element={
          <ProtectedRoute>
            <SalaryITRDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-accounting/business-itr-details"
        element={
          <ProtectedRoute>
            <BusinessITRDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-accounting/house-property-itr-details"
        element={
          <ProtectedRoute>
            <HousePropertyITRDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-accounting/trust-itr-details"
        element={
          <ProtectedRoute>
            <TrustITRDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-accounting/multi-income-itr-details"
        element={
          <ProtectedRoute>
            <SalaryHPCapitalGainsDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-accounting/partnership-firm-itr-details"
        element={
          <ProtectedRoute>
            <PartnershipFirmITRDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-accounting/company-itr-details"
        element={
          <ProtectedRoute>
            <CompanyITRDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration-packages"
        element={
          <ProtectedRoute>
            <RegistrationPackageSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/udyam"
        element={
          <ProtectedRoute>
            <UdyamDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/trade-license"
        element={
          <ProtectedRoute>
            <TradeLicenseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/fssai"
        element={
          <ProtectedRoute>
            <FSSAIDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/professional-tax"
        element={
          <ProtectedRoute>
            <ProfessionalTaxDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/provident-fund"
        element={
          <ProtectedRoute>
            <ProvidentFundDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/labour-license"
        element={
          <ProtectedRoute>
            <LabourLicenseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/iec"
        element={
          <ProtectedRoute>
            <IECDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/dsc"
        element={
          <ProtectedRoute>
            <DSCDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/esi"
        element={
          <ProtectedRoute>
            <ESIDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/gst-lut"
        element={
          <ProtectedRoute>
            <GSTLUTDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/registration-80g"
        element={
          <ProtectedRoute>
            <Registration80GDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration/registration-12a"
        element={
          <ProtectedRoute>
            <Registration12ADetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-registration-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/udyam-registration-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professional-tax-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/labour-license-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provident-fund-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fssai-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trade-license-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/iec-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration-form"
        element={
          <ProtectedRoute>
            <RegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-categories"
        element={
          <ProtectedRoute>
            <CompanyCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/opc"
        element={
          <ProtectedRoute>
            <OPCDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/llp"
        element={
          <ProtectedRoute>
            <LLPDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/partnership"
        element={
          <ProtectedRoute>
            <PartnershipDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/section-8"
        element={
          <ProtectedRoute>
            <Section8Details />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/public-limited"
        element={
          <ProtectedRoute>
            <PublicLimitedDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/mca-name-approval"
        element={
          <ProtectedRoute>
            <MCANameApprovalDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/mca-name"
        element={
          <ProtectedRoute>
            <MCANameApprovalDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/indian-subsidiary"
        element={
          <ProtectedRoute>
            <IndianSubsidiaryDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/proprietorship"
        element={
          <ProtectedRoute>
            <ProprietorshipDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/:type"
        element={
          <ProtectedRoute>
            <CompanyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registrations/:type"
        element={
          <ProtectedRoute>
            <ServiceRegistrations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/startup-india-details"
        element={
          <ProtectedRoute>
            <StartupIndiaDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/startup-india-form"
        element={
          <ProtectedRoute>
            <StartupIndiaForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/startup-india/view/:ticketId"
        element={
          <ProtectedRoute>
            <StartupIndiaViewDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/startup-india-dashboard"
        element={
          <ProtectedRoute>
            <StartupIndiaDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/private-limited-form"
        element={
          <ProtectedRoute>
            <PrivateLimitedForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/private-limited-dashboard"
        element={
          <ProtectedRoute>
            <PrivateLimitedDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/private-limited/view/:ticketId"
        element={
          <ProtectedRoute>
            <PrivateLimitedDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proprietorship-form"
        element={
          <ProtectedRoute>
            <ProprietorshipForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proprietorship-dashboard"
        element={
          <ProtectedRoute>
            <ProprietorshipDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proprietorship/view/:ticketId"
        element={
          <ProtectedRoute>
            <ProprietorshipViewDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-details"
        element={
          <ProtectedRoute>
            <GSTDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-registration-details"
        element={
          <ProtectedRoute>
            <GSTRegistrationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-returns-details"
        element={
          <ProtectedRoute>
            <GSTReturnsDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-annual-return-details"
        element={
          <ProtectedRoute>
            <GSTAnnualReturnDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-amendment-details"
        element={
          <ProtectedRoute>
            <GSTAmendmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-notice-details"
        element={
          <ProtectedRoute>
            <GSTNoticeDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/director-addition-details"
        element={
          <ProtectedRoute>
            <DirectorAdditionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/share-transfer-details"
        element={
          <ProtectedRoute>
            <ShareTransferDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/address-change-details"
        element={
          <ProtectedRoute>
            <AddressChangeDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/charge-creation-details"
        element={
          <ProtectedRoute>
            <ChargeCreationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/director-removal-details"
        element={
          <ProtectedRoute>
            <DirectorRemovalDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/moa-amendment-details"
        element={
          <ProtectedRoute>
            <MOAAmendmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/aoa-amendment-details"
        element={
          <ProtectedRoute>
            <AOAAmendmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/objects-clause-change-details"
        element={
          <ProtectedRoute>
            <ObjectsClauseChangeDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/increase-share-capital-details"
        element={
          <ProtectedRoute>
            <IncreaseShareCapitalDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/name-change-company-details"
        element={
          <ProtectedRoute>
            <NameChangeCompanyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/din-deactivation-details"
        element={
          <ProtectedRoute>
            <DINDeactivationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/din-reactivation-details"
        element={
          <ProtectedRoute>
            <DINReactivationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/adt-1-details"
        element={
          <ProtectedRoute>
            <ADT1Details />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/winding-up-company-details"
        element={
          <ProtectedRoute>
            <WindingUpCompanyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/winding-up-llp-details"
        element={
          <ProtectedRoute>
            <WindingUpLLPDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/din-application-details"
        element={
          <ProtectedRoute>
            <DINApplicationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roc/inc-20a-details"
        element={
          <ProtectedRoute>
            <INC20ADetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/fssai-renewal-details"
        element={
          <ProtectedRoute>
            <FSSAIRenewalDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/fssai-return-filing-details"
        element={
          <ProtectedRoute>
            <FSSAIReturnFilingDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/business-plan-details"
        element={
          <ProtectedRoute>
            <BusinessPlanDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/hr-payroll-details"
        element={
          <ProtectedRoute>
            <HRPayrollDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/pf-return-filing-details"
        element={
          <ProtectedRoute>
            <PFReturnFilingDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/esi-return-filing-details"
        element={
          <ProtectedRoute>
            <ESIReturnFilingDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/professional-tax-return-details"
        element={
          <ProtectedRoute>
            <ProfessionalTaxReturnDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/partnership-compliance-details"
        element={
          <ProtectedRoute>
            <PartnershipComplianceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/proprietorship-compliance-details"
        element={
          <ProtectedRoute>
            <ProprietorshipComplianceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/company-compliance-details"
        element={
          <ProtectedRoute>
            <CompanyComplianceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance/trademark-details"
        element={
          <ProtectedRoute>
            <TrademarkDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-package-selection"
        element={
          <ProtectedRoute>
            <GSTPackageSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-form"
        element={
          <ProtectedRoute>
            <GSTForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst-dashboard"
        element={
          <ProtectedRoute>
            <GSTDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst/view/:ticketId"
        element={
          <ProtectedRoute>
            <GSTViewDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <ProtectedRoute>
            <Organization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-documents"
        element={
          <ProtectedRoute>
            <BusinessDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-directors"
        element={
          <ProtectedRoute>
            <BusinessDirectorsKYC />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-directors/:documentType"
        element={
          <ProtectedRoute>
            <BusinessDirectorsDocumentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations-list"
        element={
          <ProtectedRoute>
            <OrganizationsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId"
        element={
          <ProtectedRoute>
            <CompanyDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/directors"
        element={
          <ProtectedRoute>
            <BusinessDirectorsKYC />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/directors/:documentType"
        element={
          <ProtectedRoute>
            <BusinessDirectorsDocumentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business"
        element={
          <ProtectedRoute>
            <OrganizationBusinessDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business/company-master-data"
        element={
          <ProtectedRoute>
            <CompanyMasterData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business/company-master-data/client-data"
        element={
          <ProtectedRoute>
            <ClientData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business/company-master-data/accounting"
        element={
          <ProtectedRoute>
            <Accounting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business/company-master-data/compliance"
        element={
          <ProtectedRoute>
            <Compliance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business/company-master-data/annual-compliance"
        element={
          <ProtectedRoute>
            <AnnualCompliance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business/registration-licenses"
        element={
          <ProtectedRoute>
            <RegistrationsLicenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business/secretarial"
        element={
          <ProtectedRoute>
            <Secretarial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-documents/:orgId/business/correspondence"
        element={
          <ProtectedRoute>
            <Correspondence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kyc"
        element={
          <ProtectedRoute>
            <KYC />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kyc/:documentType"
        element={
          <ProtectedRoute>
            <KYCDocumentDetail />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes - Protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin", 1, 2]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="clients" element={<AdminClients />} />
        <Route
          path="client-overview/:userId"
          element={<AdminClientOverview />}
        />
        <Route path="add-user" element={<AdminAddUser />} />
        <Route path="new-registration" element={<AdminNewRegistration />} />
        <Route path="custom-payment" element={<AdminCustomPayment />} />
        <Route path="fill-form-new" element={<AdminFillFormNew />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="organizations" element={<AdminOrganizations />} />
        <Route path="directors" element={<AdminDirectors />} />
        <Route path="documents-vault" element={<AdminDocumentsVault />} />
        <Route
          path="client-documents/:userId"
          element={<AdminClientDocuments />}
        />
        <Route path="client-kyc/:userId" element={<AdminClientKYC />} />
        <Route
          path="client-kyc/:userId/:documentType"
          element={<AdminClientKYCDetail />}
        />
        <Route
          path="client-organizations/:userId"
          element={<AdminClientOrganizations />}
        />
        <Route
          path="client-company-documents/:userId/:orgId"
          element={<AdminClientCompanyDocuments />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business"
          element={<OrganizationBusinessDocuments />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business/company-master-data"
          element={<CompanyMasterData />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business/company-master-data/client-data"
          element={<ClientData />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business/company-master-data/accounting"
          element={<Accounting />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business/company-master-data/compliance"
          element={<Compliance />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business/company-master-data/annual-compliance"
          element={<AnnualCompliance />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business/registration-licenses"
          element={<RegistrationsLicenses />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business/secretarial"
          element={<Secretarial />}
        />
        <Route
          path="client-company-documents/:userId/:orgId/business/correspondence"
          element={<Correspondence />}
        />
        <Route
          path="client-directors/:userId/:orgId"
          element={<AdminClientDirectorsKYC />}
        />
        <Route
          path="client-directors/:userId/:orgId/:documentType"
          element={<AdminClientDirectorsDetail />}
        />
        <Route path="notice-board" element={<AdminNoticeBoard />} />
        <Route path="notice-management" element={<AdminNoticeManagement />} />
        <Route path="coupon-generator" element={<CouponCodeGenerator />} />
        <Route path="cms-package" element={<AdminCMSPackage />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route
          path="client-details/:ticketId"
          element={<RegistrationDetailsRouter />}
        />
        <Route path="fill-form/:ticketId" element={<AdminFillForm />} />
        {/* Admin form routes - these use AdminLayout */}
        <Route path="gst-form" element={<GSTForm />} />
        <Route path="startup-india-form" element={<StartupIndiaForm />} />
        <Route path="proprietorship-form" element={<ProprietorshipForm />} />
        <Route path="private-limited-form" element={<PrivateLimitedForm />} />
      </Route>

      {/* SuperAdmin Routes - Protected */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={["superadmin", 2]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="clients" element={<SuperAdminClients />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route
          path="client-details/:ticketId"
          element={<RegistrationDetailsRouter />}
        />
        <Route path="fill-form/:ticketId" element={<SuperAdminFillForm />} />
      </Route>

      {/* Legacy Admin Route (redirects to /admin/clients) */}
      <Route
        path="/admin-old"
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin", 1, 2]}>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default Routers;
