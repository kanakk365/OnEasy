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

function GSTAmendmentDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('gst-amendment');

  const processSteps = [
    {
      step: 1,
      title: 'Document Preparation',
      description: 'Gather all required documents including GST certificate, PAN, address proof, and supporting documents for the amendment.'
    },
    {
      step: 2,
      title: 'Amendment Application',
      description: 'File the amendment application using Form GST REG-14 on the GST portal with all necessary details and documents.'
    },
    {
      step: 3,
      title: 'Approval & Update',
      description: 'Wait for GST officer approval (for core field amendments) or automatic processing (for non-core amendments) and receive updated GST certificate.'
    }
  ];

  const documents = [
    'GST Certificate',
    'Business PAN',
    'Aadhar Card',
    'Bank Statement',
    'New Address Proof',
    'Partnership Deed',
    'Authorization Letter',
    'Cancelled Cheque',
    'Change Declaration'
  ];

  const prerequisites = [
    {
      title: 'Valid GSTIN',
      description: 'You must have a valid GSTIN and active GST registration.'
    },
    {
      title: 'GST Portal Access',
      description: 'GST portal login credentials are required to file the amendment application.'
    },
    {
      title: 'Authentication Method',
      description: 'DSC (Digital Signature Certificate) or EVC (Electronic Verification Code) is required for authentication.'
    },
    {
      title: 'Time Limits',
      description: 'Regular returns: Before September end of next financial year. Annual returns: Before December 31 of next financial year.'
    },
    {
      title: 'Essential Documents',
      description: 'Original tax invoice needing amendment, supporting documents, and proof of payment (if applicable) must be ready.'
    },
    {
      title: 'Compliance Requirements',
      description: 'Up-to-date return filing, no pending tax dues, and proper books of accounts are necessary.'
    },
    {
      title: 'Technical Requirements',
      description: 'Internet access, registered email and mobile number, and access to GST portal are essential.'
    }
  ];

  const aboutSections = [
    {
      id: 'gst-amendment-intro',
      title: 'About GST Amendment',
      content: 'After obtaining GST registration, businesses may encounter situations where updating certain details is necessary, leading to a GST amendment. A GST amendment involves modifying or updating the information initially provided at registration. These changes can include updates to business details, contact information, or other essential specifics. Amendments ensure that all information shared with tax authorities remains accurate, reflecting any shifts in business operations or structure. Staying current with GST registration details helps businesses maintain compliance and avoid penalties.\n\nOnEasy\'s experts are here to assist with GST amendments. Our knowledgeable team offers comprehensive support, making the amendment process seamless and ensuring full compliance with regulatory requirements. With OnEasy, businesses can adapt to evolving needs efficiently and effectively.'
    },
    {
      id: 'gst-registration',
      title: 'GST Registration',
      content: 'Under the Goods and Services Tax (GST) framework, GST registration is mandatory for businesses and individuals with turnover exceeding government-specified limits. Once registered, a unique Goods and Services Tax Identification Number (GSTIN) is issued for filing returns, paying taxes, and complying with GST regulations. OnEasy makes the registration process simple and stress-free.'
    },
    {
      id: 'types-of-amendments',
      title: 'Types of GST Registration Amendments',
      content: 'GST amendments are categorized based on the required authorization level and processing timelines. Specific sections of the registration application may require justification for any changes.\n\n• Core Field Amendments: This category includes significant information updates, such as the legal business name and principal business location. Core field changes require governing authority approval and usually take 15 working days for confirmation.\n\n• Non-Core Field Amendments: These updates, covering items like bank details, business descriptions, and authorized representatives, do not need official approval and can be made directly online.\n\n• Updating Contact Information: A secure verification process, including OTP (One-Time Password) authentication, is required for changes to contact email or mobile numbers, ensuring accuracy and security.'
    },
    {
      id: 'eligibility',
      title: 'Eligibility Criteria for GST Registration Amendments',
      content: 'Any taxpayer, including normal taxpayers, GST practitioners, non-resident taxable persons, and others, may apply for amendments to GST registration under specific circumstances.'
    },
    {
      id: 'key-amendments',
      title: 'Key Amendments for Business Changes',
      content: '• Business Name Changes: When a business\'s legal name changes, the GST registration certificate remains valid, but the GST records need updating to reflect the new name. Using FORM GST REG-14 on the GST portal within 15 days of the change ensures compliance.\n\n• Address Changes: For address changes in principal or additional business locations, FORM GST REG-14 is required, along with supporting documents such as property tax receipts or lease agreements, based on ownership type.\n\n• Changes in Promoter or Partner Information: When there are changes in the stakeholders responsible for business operations, businesses should file an amendment application within 15 days.\n\n• Updating Mobile Number or Email: Changes in contact details can be done directly on the GST Common Portal without filing a formal amendment application, maintaining up-to-date records effortlessly.\n\n• Changes in PAN Information: Any changes to PAN cannot be amended in the current GST registration and will require new GST registration due to its link with GST compliance.'
    },
    {
      id: 'deadlines-procedures',
      title: 'GST Amendment Deadlines and Procedures',
      content: '• Notification and Submission Deadline: Taxpayers must notify the GST portal of relevant changes within 15 days of the event necessitating the amendment.\n\n• Approval Process: The GST officer reviews core field changes within 15 working days. Upon approval, changes are backdated to the event date. Non-core amendments are generally processed automatically and require no officer approval.\n\n• Automatic Processing: If the officer does not take action within the specified timeframe, the requested amendments are automatically approved, and the updated GST certificate is accessible on the GST portal.'
    },
    {
      id: 'why-oneasy',
      title: 'How OnEasy Simplifies GST Amendments',
      content: 'At OnEasy, we ensure businesses can handle GST amendments efficiently. Whether amending core fields such as business location or making updates to non-core fields, OnEasy\'s experienced team guides clients through every step. Our platform simplifies the application process on the GST Common Portal, from filing to document verification. With OnEasy, businesses can navigate regulatory requirements with ease, staying fully compliant without administrative burden.\n\nGet started with OnEasy today and experience smooth, reliable GST compliance.'
    }
  ];

  const faqs = [
    {
      question: 'What is a GST Amendment?',
      answer: 'A GST Amendment is the process of updating or changing details in your GST registration, such as business information, contact details, or key personnel. It ensures your GST information remains accurate and complies with tax regulations.'
    },
    {
      question: 'When is a GST Amendment necessary?',
      answer: 'GST amendments are necessary when there are significant changes to your business details, like a change in business name, principal address, additional places of business, or changes in directors or partners.'
    },
    {
      question: 'What are Core Field Amendments in GST?',
      answer: 'Core Field Amendments refer to critical changes like business name (if PAN remains the same), principal place of business, additional business locations, and stakeholder information. These amendments require approval from a GST officer.'
    },
    {
      question: 'What are Non-Core Field Amendments in GST?',
      answer: 'Non-Core Field Amendments involve changes that don\'t require GST officer approval. These include updates to bank details, email address, phone number, and minor adjustments in goods and services provided.'
    },
    {
      question: 'How do I update my GST-registered business address?',
      answer: 'You can update your business address through a GST amendment by filing Form GST REG-14 on the GST portal within 15 days of the change. Proof of the new address, such as a rental agreement or utility bill, will be required.'
    },
    {
      question: 'Can I change my business name in the GST registration?',
      answer: 'Yes, you can apply for a business name change under GST by submitting a Core Field Amendment in Form GST REG-14. Approval from a GST officer is required, and once approved, the new name will reflect on your GST registration.'
    },
    {
      question: 'Is it possible to amend the PAN associated with GST registration?',
      answer: 'No, PAN cannot be amended in an existing GST registration. If there\'s a change in PAN due to reconstitution of the business type, you must apply for a new GST registration.'
    },
    {
      question: 'How long does it take to process a GST amendment?',
      answer: 'For Core Field Amendments, approval may take up to 15 working days. If a GST officer requires additional information, they will notify you within this period. Non-Core Field Amendments are typically processed instantly online.'
    },
    {
      question: 'Can I make multiple amendments to my GST registration at once?',
      answer: 'You can make multiple changes in a single amendment application. However, if you have an active Application Reference Number (ARN) from a pending amendment, you\'ll need to wait until it\'s processed before submitting a new amendment application.'
    },
    {
      question: 'What should I do if my GST amendment application is rejected?',
      answer: 'If your amendment application is rejected, you will receive a notification with reasons. You can address the issues and reapply or seek assistance for clarification if needed.'
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
                console.log('Initiating payment for GST Amendment:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'gst-amendment');
                localStorage.setItem('selectedRegistrationTitle', 'GST Amendment');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/gst-amendment-form');
                  }
                }
              } catch (error) {
                console.error('Payment error:', error);
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
            introTitle="About GST Amendment"
            introDescription="After obtaining GST registration, businesses may encounter situations where updating certain details is necessary, leading to a GST amendment. A GST amendment involves modifying or updating the information initially provided at registration."
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
      <PaymentSuccessPopup 
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)} 
      />
    </div>
  );
}

export default GSTAmendmentDetails;

