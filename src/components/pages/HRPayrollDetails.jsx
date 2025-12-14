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

function HRPayrollDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('hr-payroll');

  const processSteps = [
    { step: 1, title: 'Employee Data Collection', description: 'Collect employee information and salary details.' },
    { step: 2, title: 'Payroll Processing', description: 'Process salaries, deductions, and statutory compliance.' },
    { step: 3, title: 'Statutory Filings', description: 'File PF, ESIC, TDS returns and generate Form 16.' }
  ];

  const documents = [
    'Employment Application',
    'Resume/CV',
    'Offer Letter',
    'Employee Contract',
    'Tax Forms (W-4 or equivalent)',
    'Identification Documents (PAN, Aadhaar Card)',
    'Work Eligibility Documents (visa, permit)',
    'Non-Disclosure Agreement (if applicable)',
    'Bank Details (for direct deposit)',
    'Time and Attendance Records',
    'Compensation Structure',
    'Benefits Enrolment Forms',
    'Performance Evaluation Forms',
    'Comprehensive Employee Records'
  ];

  const prerequisites = [
    {
      title: 'Business Registration',
      description: 'Ensure your business is legally registered and compliant with local regulations.'
    },
    {
      title: 'Employer Identification Number (EIN)',
      description: 'Obtain an EIN from the tax authorities for tax reporting purposes.'
    },
    {
      title: 'Payroll System',
      description: 'Choose a reliable payroll system that meets your business needs.'
    },
    {
      title: 'HR Policies and Procedures',
      description: 'Develop clear HR policies regarding recruitment, onboarding, leave, and termination.'
    },
    {
      title: 'Job Descriptions',
      description: 'Create detailed job descriptions for all positions to guide hiring and performance management.'
    },
    {
      title: 'Employee Handbook',
      description: 'Prepare an employee handbook outlining company policies, benefits, and expectations.'
    },
    {
      title: 'Compliance Knowledge',
      description: 'Familiarize yourself with labour laws, tax regulations, and industry standards relevant to your business.'
    },
    {
      title: 'Data Security Measures',
      description: 'Implement data protection and privacy measures to safeguard employee information.'
    },
    {
      title: 'Training for HR Staff',
      description: 'Ensure HR personnel are trained in payroll processes and compliance requirements.'
    },
    {
      title: 'Communication Plan',
      description: 'Establish a communication strategy for informing employees about policies, benefits and changes.'
    }
  ];

  const aboutSections = [
    {
      id: 'hr-payroll-intro',
      title: 'About HR & Payroll Service',
      content: 'OnEasy offers a comprehensive HR and Payroll Software service designed to streamline your business\'s payroll processing and tax compliance. Our team of experts provides a dedicated accountant to manage your payroll and tax filings, ensuring adherence to government regulations and minimizing legal risks.\n\nOur Services Include:\n\n• Monthly Payroll Processing: Efficient handling of employee salaries.\n\n• TDS, ESI, and PF Filing: Ensuring all statutory deductions are accurately calculated and submitted.\n\n• We easily manage employee data, track attendance, generate payslips, and automate payroll processes.\n\n• Real-Time Financial Insights: Gain a clear view of your financials to facilitate informed decision-making.\n\nAt OnEasy, we are committed to delivering top-notch HR and Payroll software services tailored for businesses in India. Contact our experts today to discover how we can enhance your operational efficiency and compliance.'
    },
    {
      id: 'what-is-payroll',
      title: 'What is Payroll Processing?',
      content: 'Payroll refers to the list of employees eligible for compensation from your organization. It encompasses the total amounts paid to employees, along with the development of pay policies that include flexible benefits and leave encashment guidelines.\n\nEffective payroll management also involves creating payslip components such as basic pay, variable pay, HRA, and LTA, as well as gathering essential payroll inputs like those from your food vendor.\n\nFurthermore, payroll and HR management include timely salary disbursements and ensuring that statutory deductions such as TDS and PF are submitted to the appropriate authorities.'
    },
    {
      id: 'payroll-cycle',
      title: 'The Payroll Processing Cycle',
      content: 'Pre-Payroll Activities:\n\n• Defining Payroll Policies: Establishing approved standards for payroll management, including attendance and benefits policies.\n\n• Input Gathering: Collecting necessary data from various departments to ensure accurate payroll calculations.\n\nInput Validation:\n\n• Verifying the collected data to avoid any discrepancies that could disrupt the payroll process.\n\nPayroll Calculation:\n\n• Feeding validated data into the payroll system to calculate the net pay after taxes and other deductions.\n\nPost-Payroll Activities:\n\n• Statutory Compliance: Ensuring adherence to all relevant regulations, including deductions for EPF, TDS, and ESI.\n\n• Payroll Accounting: Maintaining accurate records in your books of accounts, reflecting salary expenses.\n\n• Payout: Disbursing salaries through preferred methods like bank transfers for convenience.\n\n• Reporting: Preparing detailed reports on employee costs by department or location.'
    },
    {
      id: 'payroll-methods',
      title: 'Payroll Management Methods',
      content: 'Excel-Based Payroll Management: Suitable for businesses with a few employees, this method involves calculations on Excel sheets. However, it may lead to errors and challenges in managing employee records.\n\nOutsourcing Payroll: By outsourcing payroll, you can entrust the process to an external agency. OnEasy ensures compliance with all payroll needs, allowing you to focus on core business activities.'
    },
    {
      id: 'challenges',
      title: 'Challenges in Payroll Management',
      content: 'Managing payroll can be complex due to:\n\n• Statutory Compliance Requirements: Non-compliance can result in penalties and legal issues.\n\n• Data Dependencies: Gathering accurate data from multiple sources can be cumbersome.'
    },
    {
      id: 'why-choose',
      title: 'Why Choose OnEasy\'s HR and Payroll Management?',
      content: 'At OnEasy, we understand the challenges businesses face in managing HR and payroll processes. Our comprehensive service is designed to meet your specific needs. Our team of accounting and payroll specialists offers the following benefits:\n\n• All-in-One Payroll Support: Our integrated HR and payroll management service provides comprehensive support, with advanced web and mobile applications for real-time payroll monitoring.\n\n• Virtual Legal Assistance: Enjoy access to virtual CA/CS/Law services for any legal queries related to your business or employees.\n\n• Compliance Management: Stay updated on labour laws and ensure compliance at all times with our dedicated team.\n\n• Simplified Payroll Processing: Using the latest payroll software, we simplify employee payroll management, ensuring timely and accurate payments.\n\n• Additional Services: We also manage labour compliance, including EPF registrations, TDS return filings, and IT returns, handled by our legal experts.\n\n• Electronic System: Our electronic platform enables you to create pay orders and track new hires seamlessly.\n\nChoose OnEasy for HR and Payroll Management to experience hassle-free compliance with government regulations and streamlined HR processes.\n\nContact us today to learn how we can support your business\'s growth.'
    }
  ];

  const faqs = [
    {
      question: 'What are HR and Payroll services?',
      answer: 'HR and Payroll services encompass a range of functions related to employee management, including payroll processing, benefits administration, compliance with labour laws, recruitment and employee relations.'
    },
    {
      question: 'Why should I outsource my HR and Payroll services?',
      answer: 'Outsourcing HR and Payroll services can save time, reduce operational costs, ensure compliance with labour laws and provide access to expertise that may not be available in-house.'
    },
    {
      question: 'What is included in payroll processing?',
      answer: 'Payroll processing typically includes calculating employee salaries, deductions for taxes and benefits, issuing pay checks and ensuring compliance with statutory requirements such as TDS, ESI, and PF filings.'
    },
    {
      question: 'How do you ensure compliance with labour laws?',
      answer: 'We stay updated on the latest labour laws and regulations, regularly review our processes and provide training for our team to ensure compliance in all aspects of HR and Payroll management.'
    },
    {
      question: 'Can your payroll system integrate with our existing HR software?',
      answer: 'Yes, our payroll system is designed to integrate seamlessly with various HR software and platforms, ensuring smooth data transfer and management.'
    },
    {
      question: 'How do you handle employee data confidentiality and security?',
      answer: 'We prioritize data security by implementing robust security measures, including encryption and restricted access, to protect sensitive employee information in compliance with data protection laws.'
    },
    {
      question: 'What are the typical costs associated with HR and Payroll services?',
      answer: 'Costs vary based on the size of your organization, the complexity of your HR needs, and the specific services required. We offer tailored packages to meet your budget and requirements.'
    },
    {
      question: 'What happens if there is an error in payroll processing?',
      answer: 'If an error occurs, we have processes in place to identify and rectify issues promptly. We work closely with our clients to resolve any discrepancies and ensure accurate corrections are made.'
    },
    {
      question: 'What support do you provide after implementing HR and Payroll services?',
      answer: 'We offer ongoing support through dedicated account managers, regular updates on compliance changes, and assistance with any HR or payroll inquiries you may have, ensuring you have the resources you need for smooth operations.'
    },
    {
      question: 'How can we get started with your HR and Payroll services?',
      answer: 'Getting started is easy! Contact us to discuss your HR and Payroll needs, and we will provide you with a customized proposal outlining our services, pricing, and next steps to set up your account.'
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
                localStorage.setItem('selectedRegistrationType', 'hr-payroll');
                localStorage.setItem('selectedRegistrationTitle', 'HR & Payroll Service');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/hr-payroll-form');
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
            introTitle="About HR & Payroll Service"
            introDescription="Comprehensive HR and payroll management services for your business."
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

export default HRPayrollDetails;

