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
import { initPayment } from '../../utils/payment';
import { usePackages } from '../../hooks/usePackages';

function ProvidentFundDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  // Fetch packages from API
  const { packages: apiPackages, loading: packagesLoading } = usePackages('provident-fund');
  
  // Use packages from API, fallback to empty array if loading
  const packages = packagesLoading ? [] : apiPackages;

  const processSteps = [
    {
      step: 1,
      title: 'Application Submission',
      description: 'Submit your PF registration application through the official EPFO portal with all required documents.'
    },
    {
      step: 2,
      title: 'Verification and Approval',
      description: 'EPFO verifies your application and documents. Once approved, you will receive your PF code.'
    },
    {
      step: 3,
      title: 'Setup and Compliance',
      description: 'Set up employee accounts, configure UANs, and begin filing PF returns as per compliance requirements.'
    }
  ];

  const documents = [
    'Business Registration Certificate',
    'PAN Card of the business',
    'PAN Card of directors/owners/partners',
    'Rental Agreement and NOC (Premises)',
    'Latest Electricity bill of the Premises',
    'Bank Statement of the Business',
    'Digital Signature Certificate (DSC)',
    'GST registration',
    'Aadhaar Card of Employees',
    'PAN Card of Employees',
    'Salary details and Joining dates',
    'Specimen Signatures',
    'Consent Letter from Employees',
    'Partnership Deed/MOA & AOA'
  ];

  const prerequisites = [
    {
      title: 'Mandatory Registration',
      description: 'Employers with 20 or more employees (including permanent, contractual, and temporary workers) are required to register for PF.'
    },
    {
      title: 'Voluntary Registration',
      description: 'Employers with fewer than 20 employees can also register voluntarily to offer enhanced employee benefits.'
    },
    {
      title: 'Registration Timeframe',
      description: 'PF registration must be completed within one month of reaching the threshold of 20 employees to avoid penalties.'
    },
    {
      title: 'Special Provisions',
      description: 'Employers with fewer than 20 employees may still be required to register if mandated by the Central Government, or voluntarily if agreed by a majority of employees.'
    }
  ];

  const aboutSections = [
    {
      id: 'epf-overview',
      title: 'Overview of the EPF Scheme',
      content: "The Employees' Provident Fund (EPF) is a government-backed social security initiative aimed at encouraging savings among employees. It ensures that employees have access to financial support post-retirement through contributions made by both the employer and the employee.\n\nAccessing EPF Funds:\n\nEmployees can withdraw their accumulated EPF funds under specific circumstances:\n\n• Retirement: Full withdrawal upon reaching 55 years of age.\n• Unemployment: Withdrawal possible after two months of unemployment.\n• Early Withdrawal: Permitted for emergencies like severe illness.\n• Death: In case of an employee's death, the funds are accessible to their beneficiaries."
    },
    {
      id: 'eligibility-contribution',
      title: 'Employee Eligibility and PF Contribution Requirements',
      content: "All employees are eligible for Provident Fund from their first day of employment. Both employers and employees contribute 12% of the employee's basic salary to the EPF:\n\n• Employee Contribution: 12% of basic pay is contributed to the EPF.\n• Employer Contribution: 12% of basic pay is split, with 3.67% going into the EPF and 8.33% into the Pension Fund (EPS)."
    },
    {
      id: 'why-register',
      title: 'Why Employers Should Register for EPF?',
      content: [
        {
          title: 'Compliance',
          description: "Employers fulfill legal obligations and manage contributions through the EPFO's portal."
        },
        {
          title: 'Risk Protection',
          description: 'Ensures financial security for employees in cases of retirement, illness, or death.'
        },
        {
          title: 'Portability',
          description: 'Employees can transfer their PF accounts when switching jobs.'
        },
        {
          title: 'Retirement Benefits',
          description: 'Includes enrollment in the Employee Pension Scheme (EPS) for a monthly pension post-retirement.'
        },
        {
          title: 'Emergency Financial Support',
          description: 'Accessible funds for emergencies, such as medical treatments or weddings.'
        }
      ]
    },
    {
      id: 'exemptions',
      title: 'Exemptions from Mandatory EPF Registration',
      content: 'Employers with fewer than 20 employees are exempt from mandatory registration but can opt for voluntary registration to offer PF benefits.'
    },
    {
      id: 'how-to-apply',
      title: 'How to Apply for PF Registration Online?',
      content: 'Apply for PF registration through the official EPFO portal. Once your application is verified, you will receive a PF code essential for managing contributions.'
    },
    {
      id: 'why-oneasy',
      title: 'Why Choose OnEasy for PF Registration?',
      content: 'OnEasy streamlines the PF registration process with affordable fees and professional guidance. From documentation to obtaining your PF code, we handle every step, allowing you to focus on your business growth.\n\nLet OnEasy simplify your PF registration process.\n\nContact us today to get started!'
    }
  ];

  const faqs = [
    {
      question: 'What is PF Registration, and who needs to register?',
      answer: "PF registration is the process through which employers register with the Employees' Provident Fund Organisation (EPFO) to provide Provident Fund (PF) benefits to their employees. Any establishment with 20 or more employees is required to register for PF. Employers with fewer employees can register voluntarily."
    },
    {
      question: 'What documents are required for PF registration?',
      answer: 'The key documents include business registration certificates, PAN and Aadhaar cards of the business and employees, proof of address (such as utility bills or rental agreements), bank account details, and employee details like joining dates and salary information.'
    },
    {
      question: 'Can a company with fewer than 20 employees register for PF?',
      answer: 'Yes, companies with fewer than 20 employees can voluntarily register for PF to offer social security benefits to their workforce.'
    },
    {
      question: 'How long does the PF registration process take?',
      answer: 'Typically, the PF registration process can be completed within 5 to 10 working days, provided all documents are in order and the application is submitted correctly.'
    },
    {
      question: 'What is the contribution percentage for PF?',
      answer: "Both the employer and the employee contribute 12% of the employee's basic salary towards PF. The employer's contribution is split between EPF (3.67%) and the Pension Scheme (8.33%)."
    },
    {
      question: 'Is PF registration mandatory for new businesses?',
      answer: 'PF registration becomes mandatory for new businesses once they reach a threshold of 20 employees. The registration must be completed within one month of meeting this requirement.'
    },
    {
      question: 'What happens if a business fails to register for PF on time?',
      answer: 'If a business does not register for PF within the required timeframe, it may face penalties and fines, and may be liable for backdated PF contributions with interest.'
    },
    {
      question: 'Can employees withdraw their PF amount before retirement?',
      answer: 'Yes, employees can withdraw their PF balance early under certain conditions, such as severe illness, unemployment for more than two months, or for significant life events like marriage or education.'
    },
    {
      question: 'Is the PF account transferable when an employee changes jobs?',
      answer: "Yes, PF accounts are fully transferable. Employees can link their existing PF account to the new employer's PF scheme when they switch jobs, ensuring continuity of contributions."
    },
    {
      question: 'How can businesses apply for PF registration online?',
      answer: 'Businesses can apply for PF registration through the official EPFO portal by submitting the required documents and completing the registration process online. Once approved, the establishment receives a PF code for managing employee contributions.'
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
        return (
          <div>
            <PackagesSection
              packages={packages}
              onGetStarted={async (selectedPackage) => {
                try {
                  console.log('Initiating payment for Provident Fund:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'provident-fund');
                  localStorage.setItem('selectedRegistrationTitle', 'Provident Fund Registration');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success && result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/provident-fund-form');
                  }
                } catch (error) {
                  console.error('Payment error:', error);
                  if (error.message !== 'Payment cancelled') {
                    alert(`Payment failed: ${error.message || 'Please try again'}`);
                  }
                }
              }}
            />
          </div>
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
            introTitle="About Provident Fund Registration"
            introDescription="Provident Fund registration is the process by which an employer or establishment registers with the Employees' Provident Fund Organization (EPFO) to become part of the Provident Fund (PF) scheme. This is essential for businesses to ensure their employees are covered under this mandatory savings and pension scheme, which offers financial security in retirement, during medical emergencies, or other unforeseen events. OnEasy provides expert assistance to simplify the PF registration process for businesses. With comprehensive guidance, we ensure that your PF registration is handled efficiently, enabling you to comply with regulatory requirements without any complications."
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
        {/* My Registrations Button - Top Right */}
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

        {/* Tabs */}
        <TopTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
        
        {renderTabContent()}
      </div>
    </div>
  );
}

export default ProvidentFundDetails;

