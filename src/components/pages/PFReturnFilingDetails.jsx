import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import building from '../../assets/building.png';
import TopTabs from './company-details/TopTabs';
import PackagesSection from './company-details/PackagesSection';
import ProcessSection from './company-details/ProcessSection';
import DocumentsSection from './company-details/DocumentsSection';
import PrerequisitesSection from './company-details/PrerequisitesSection';
import AboutSection from './company-details/AboutSection';
import FAQSection from './company-details/FAQSection';
import PaymentSuccessPopup from '../common/PaymentSuccessPopup';
import { initPayment } from '../../utils/payment';
import { usePackages } from '../../hooks/usePackages';

function PFReturnFilingDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('pf-return-filing');

  const processSteps = [
    { step: 1, title: 'Data Collection', description: 'Collect employee PF contribution data.' },
    { step: 2, title: 'Statement Preparation', description: 'Prepare monthly PF statements.' },
    { step: 3, title: 'Filing & Payment', description: 'File returns and make PF payments.' }
  ];

  const documents = [
    'EPF Registration Certificate',
    'New employee details',
    'Details of employees who left',
    'Monthly contribution details',
    'Challan for Payment',
    'Form 3A (Annual statement of all employees)',
    'Form 6A (Annual return for EPF)',
    'Salary Register',
    'KYC Documents (PAN, Aadhaar, bank details)',
    'Audit Report (if applicable)'
  ];

  const prerequisites = [
    {
      title: 'EPF Registration',
      description: 'Entities subject to the Employees\' Provident Funds and Miscellaneous Provisions Act, 1952, are required to file PF returns. This includes establishments with 20 or more employees. Those with fewer than 20 employees can voluntarily register.'
    }
  ];

  const aboutSections = [
    {
      id: 'pf-return-intro',
      title: 'About PF Return Filing',
      content: 'Employee Provident Fund (PF) return filing is a crucial obligation for establishments registered under the PF scheme. Maintaining compliance with monthly filing requirements is vital to avoid penalties and ensure adherence to statutory regulations.\n\nAt OnEasy, we understand the importance of this responsibility and are here to guide you through the entire PF return filing process. Our team of experts is committed to providing you with comprehensive support, ensuring you can fulfill your regulatory obligations with ease and confidence.\n\nContact OnEasy today to simplify your PF return filing process with our expert guidance.'
    },
    {
      id: 'epf-overview',
      title: 'EPF Scheme Overview',
      content: 'The EPF Scheme, introduced by the government, aims to promote savings among employees and provide post-retirement benefits, such as pensions. Employees contribute a portion of their salaries to build savings over time, which can be accessed as a lump sum upon retirement or when leaving their jobs.\n\nBoth employers and employees contribute 12% of the basic pay to the EPF. Of the employer\'s contribution, 3.67% goes to the employee\'s EPF account, while the remaining 8.33% is allocated to the Employees\' Pension Fund (EPF).\n\nEmployees can withdraw EPF amounts under various circumstances, including retirement (at or after 58 years of age), unemployment for two months, or in the event of death before reaching the retirement age.'
    },
    {
      id: 'pf-registration',
      title: 'PF Registration Process',
      content: 'PF registration involves enrolling your establishment with the Employees\' Provident Fund Organization (EPFO) to participate in the Provident Fund scheme. This registration is mandatory for organizations with 20 or more employees, while it is voluntary for those with fewer than 20 employees.\n\nUpon registration, employers receive a unique PF code used for all PF-related transactions, including monthly contributions, withdrawals, and filings. Even establishments with fewer than 20 employees can opt for PF registration voluntarily. Employers with PF registration are required to file monthly returns to remain compliant with regulations.'
    },
    {
      id: 'filing-requirements',
      title: 'PF Return Filing Requirements',
      content: 'Filing PF returns entails submitting detailed reports to the EPFO. This process is mandatory for employers registered under the Provident Fund scheme and must be completed monthly by the 25th of each month.\n\nEmployers must provide various data points for return filing, including total contributions made by both employer and employee, details of employees covered under the scheme, and their PF account numbers.'
    },
    {
      id: 'benefits',
      title: 'Benefits of Filing PF Returns',
      content: 'Consistently filing returns offers several advantages for both employers and employees:\n\n• Legal Compliance: Timely filing is a legal obligation, ensuring avoidance of penalties for non-compliance.\n\n• Employee Security: Regular return filing safeguards employee financial security by accurately recording PF contributions.\n\n• Tax Benefits: PF contributions are eligible for tax deductions, allowing employers to maximize financial efficiency.\n\n• Organized Record-Keeping: Systematic return filing facilitates the efficient management of employee benefits.'
    },
    {
      id: 'due-dates',
      title: 'PF Return Due Dates',
      content: 'Due dates for PF returns differ based on the type of establishment:\n\n• Private Establishments: Monthly filings due by the 15th of the following month (e.g., January returns due by February 15).\n\n• Government Establishments: Quarterly filings due at the end of the month following each quarter (e.g., returns for the quarter ending March 31 are due by the end of April).\n\nNote: Missing return due dates can result in penalties and legal consequences.'
    },
    {
      id: 'required-documents',
      title: 'Required Documents for PF Filing',
      content: '• Employer\'s contribution amount to EPF\n\n• Employee\'s contribution amount to EPF\n\n• Electronic Challan cum Return (ECR) copy\n\n• Details of Universal Account Number (UAN) and KYC compliance of employees'
    },
    {
      id: 'filing-forms',
      title: 'PF Filing Forms',
      content: 'Various forms are necessary for PF return filing, including:\n\n• Form 5: Registration of new employees and updates to employee details.\n\n• Form 10: Declaration and nomination of beneficiaries by employees.\n\n• Form 12A: Monthly contribution details for employees.\n\n• Form 3A: Monthly contribution records for employees.\n\n• Form 6A: Annual contribution summary for employees.'
    },
    {
      id: 'annual-filing',
      title: 'Annual PF Return Filing',
      content: 'Annual returns must be submitted by April 30 of each year, utilizing Forms 3A and 6A to report month-wise contributions.'
    },
    {
      id: 'non-compliance',
      title: 'Consequences of Non-Compliance',
      content: 'Failure to comply with PF filing requirements can lead to penalties of up to ₹5,000 per day for delayed filings, jeopardizing employee benefits and pension payments.'
    },
    {
      id: 'filing-procedure',
      title: 'PF Return Filing Procedure',
      content: 'Follow these steps to ensure a smooth PF return filing process:\n\n• PF Registration: Ensure your establishment is registered with the EPFO and has obtained a PF registration number.\n\n• Gather Data: Collect necessary data for employee and employer contributions.\n\n• Prepare Returns: Use the EPFO\'s prescribed format to prepare returns accurately.\n\n• Verification: Double-check the accuracy of the information before submission.\n\n• Submission: File returns electronically via the EPFO\'s online portal by the specified deadline.\n\n• Acknowledgment: Obtain acknowledgment of your filed returns for record-keeping.\n\n• Annual Consolidated Statement: Submit a consolidated statement of all contributions to the EPFO at the end of the financial year.\n\nAt OnEasy, our experts are here to assist you at every stage of the PF return filing process, ensuring accuracy and compliance.'
    },
    {
      id: 'simplify',
      title: 'Streamline Your PF Return Filing with OnEasy',
      content: 'OnEasy simplifies the PF return filing process by providing expert assistance throughout. Our dedicated team ensures accurate preparation of PF returns in line with regulatory requirements. We offer personalized guidance to help you gather necessary data and navigate the filing procedure smoothly. With our expertise, you can avoid errors, meet deadlines, and maintain compliance effortlessly. Our support team is available to address any queries, ensuring a hassle-free experience.\n\nLet OnEasy\'s experts simplify your PF return filing today!'
    }
  ];

  const faqs = [
    {
      question: 'What is PF Return Filing?',
      answer: 'PF return filing is the process of submitting contributions made by both employers and employees to the Employees\' Provident Fund (EPF) to the Employees\' Provident Fund Organization (EPFO) on a monthly basis.'
    },
    {
      question: 'Who is required to file PF returns?',
      answer: 'Any establishment or organization with 20 or more employees must file PF returns. This includes factories, companies, and establishments that are covered under the Employees\' Provident Funds and Miscellaneous Provisions Act, 1952.'
    },
    {
      question: 'What are the due dates for filing PF returns?',
      answer: 'PF returns must be filed by the 15th of the following month for contributions made in the previous month. For example, the return for January must be filed by February 15th.'
    },
    {
      question: 'What information is required for PF return filing?',
      answer: 'To file PF returns, you need the following information:\n\n• Employee details (name, EPF account number, etc.)\n\n• Salary details for the month\n\n• Employer and employee contribution amounts\n\n• Any applicable deductions or adjustments.'
    },
    {
      question: 'How can I file PF returns?',
      answer: 'PF returns can be filed online through the EPFO\'s member portal or through the Unified Portal. Employers can also engage third-party service providers, like OnEasy, to assist with the filing process.'
    },
    {
      question: 'What happens if I miss the due date for filing PF returns?',
      answer: 'Missing the due date can result in penalties and interest charges. It\'s crucial to file on time to avoid these additional costs and maintain compliance with EPF regulations.'
    },
    {
      question: 'Can I make corrections to the filed PF returns?',
      answer: 'Yes, corrections can be made to previously filed PF returns by submitting a revised return. It\'s important to do this as soon as discrepancies are discovered to avoid penalties.'
    },
    {
      question: 'What is the penalty for non-compliance in PF return filing?',
      answer: 'Non-compliance can lead to penalties of up to 10% of the defaulted amount, along with interest on delayed payments. Repeated violations may also attract stricter penalties.'
    },
    {
      question: 'How long do I need to retain records related to PF returns?',
      answer: 'Employers are required to maintain records related to PF contributions, returns, and payments for a minimum of five years, as these may be subject to inspection by EPFO officials.'
    },
    {
      question: 'Can OnEasy assist with PF return filing?',
      answer: 'Yes, OnEasy provides comprehensive PF return filing services, including assistance with calculations, filing and ensuring compliance with all EPFO regulations.'
    }
  ];

  const tabs = [
    { id: 'packages', label: 'Packages' },
    { id: 'process', label: 'Process' },
    { id: 'documents', label: 'Documents' },
    { id: 'prerequisites', label: 'Pre requisites' },
    { id: 'about', label: 'About' },
    { id: 'faq', label: 'FAQ' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'packages':
        if (packagesLoading) {
          return (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#01334C]"></div>
              <p className="mt-2 text-gray-600">Loading packages...</p>
            </div>
          );
        }
        return (
          <PackagesSection
            packages={packages}
            onGetStarted={async (selectedPackage) => {
              try {
                localStorage.setItem('selectedRegistrationType', 'pf-return-filing');
                localStorage.setItem('selectedRegistrationTitle', 'PF Return Filing');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/pf-return-filing-form');
                  }
                }
              } catch (error) {
                if (error.message !== 'Payment cancelled') {
                  alert(`Payment failed: ${error.message || 'Please try again'}`);
                }
              }
            }}
          />
        );
      case 'process':
        return <ProcessSection processSteps={processSteps} />;
      case 'documents':
        return <DocumentsSection documents={documents} illustration={null} />;
      case 'prerequisites':
        return <PrerequisitesSection prerequisites={prerequisites} />;
      case 'about':
        return (
          <AboutSection
            building={building}
            aboutSections={aboutSections}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            introTitle="About PF Return Filing"
            introDescription="Monthly Provident Fund return filing ensures compliance with EPFO regulations."
          />
        );
      case 'faq':
        return <FAQSection faqs={faqs} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/registrations')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            My Registrations
          </button>
        </div>
        <TopTabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />
        {renderTabContent()}
      </div>
      <PaymentSuccessPopup 
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)} 
      />
    </div>
  );
}

export default PFReturnFilingDetails;

