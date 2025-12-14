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

function ADT1Details() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('adt-1');

  const processSteps = [
    {
      step: 1,
      title: 'Auditor Appointment',
      description: 'Appoint an auditor through a board resolution. For new companies, this must be done within 30 days of incorporation. For existing companies, the appointment is made at the Annual General Meeting (AGM).'
    },
    {
      step: 2,
      title: 'Obtain Auditor Consent',
      description: 'Obtain written consent from the auditor confirming their acceptance of the appointment and their eligibility certificate confirming they are not disqualified under Section 141 of the Companies Act.'
    },
    {
      step: 3,
      title: 'Prepare Required Documents',
      description: 'Prepare all necessary documents including board resolution, auditor\'s written consent, auditor\'s eligibility certificate, and company\'s intimation to the auditor.'
    },
    {
      step: 4,
      title: 'Complete Form ADT-1',
      description: 'Fill out Form ADT-1 with all required information including auditor\'s category, membership number, contact details, PAN number, appointment duration, and appointment date.'
    },
    {
      step: 5,
      title: 'Digital Signature',
      description: 'Ensure the form is digitally signed by the authorized director and the auditor using their Digital Signature Certificates (DSC).'
    },
    {
      step: 6,
      title: 'File with ROC',
      description: 'File Form ADT-1 with the Registrar of Companies (ROC) through the MCA portal within 15 days of the auditor\'s appointment or AGM, as applicable.'
    }
  ];

  const documents = [
    'Board resolution for auditor appointment',
    'Auditor\'s written consent',
    'Auditor\'s eligibility certificate',
    'Company\'s intimation to the auditor',
    'Digital Signature of Auditor'
  ];

  const prerequisites = [
    {
      title: 'Company incorporation documents',
      description: 'Ensure all company incorporation documents are in order and available for reference.'
    },
    {
      title: 'Auditor appointment details',
      description: 'Have complete details about the auditor appointment, including the date and method of appointment.'
    },
    {
      title: 'Valid Director Identification Numbers (DINs)',
      description: 'Ensure all directors have valid DINs as they will be required for filing the form.'
    },
    {
      title: 'Digital Signature Certificate (DSC)',
      description: 'Obtain valid Digital Signature Certificates for both the authorized director and the auditor.'
    },
    {
      title: 'Auditor\'s consent and eligibility certificate',
      description: 'Obtain written consent from the auditor and their eligibility certificate confirming they are not disqualified under Section 141 of the Companies Act.'
    },
    {
      title: 'Board resolution for auditor appointment',
      description: 'Pass a board resolution approving the appointment of the auditor.'
    },
    {
      title: 'Company and auditor details',
      description: 'Have all necessary details about the company and the auditor ready, including contact information, PAN numbers, and membership numbers.'
    }
  ];

  const aboutSections = [
    {
      id: 'adt-1-intro',
      title: 'About Form ADT-1',
      content: 'Form ADT-1 is a crucial document that companies must file with the Registrar of Companies (ROC) to report the appointment of their auditor. At OnEasy, we understand the importance of this process and are here to guide you through it.\n\nKey Points:\n\n• New companies must appoint their first auditor within 30 days of incorporation\n\n• Form ADT-1 must be filed within 15 days of the auditor\'s appointment\n\n• The first auditor serves until the first Annual General Meeting (AGM)\n\n• The AGM should occur within 9 months from the end of the financial year of incorporation\n\nOnEasy is committed to helping you navigate these requirements and avoid any penalties or legal issues.'
    },
    {
      id: 'why-matters',
      title: 'Why Form ADT-1 Matters?',
      content: 'Form ADT-1 is a legal requirement under Section 139 (1) of the Companies Act, 2013. It must be filed annually after the AGM to maintain compliance. The form includes essential details about the appointed auditor, and timely filing is crucial to avoid fines.'
    },
    {
      id: 'who-needs',
      title: 'Who Needs to File Form ADT-1?',
      content: 'All companies, regardless of their type (public, private, listed, or unlisted), must file Form ADT-1.'
    },
    {
      id: 'when-to-file',
      title: 'When to File Form ADT-1?',
      content: '• For new companies: Within 15 days of the first board meeting (which should be held within 30 days of incorporation)\n\n• For existing companies: Within 15 days of the AGM where the auditor was appointed or reappointed'
    },
    {
      id: 'information-required',
      title: 'Information Required for Form ADT-1',
      content: 'When you work with OnEasy to file Form ADT-1, we\'ll help you gather all necessary information, including:\n\n• Auditor\'s category (firm or individual)\n\n• Chartered Accountancy membership number\n\n• Auditor\'s contact details\n\n• PAN number\n\n• Appointment duration\n\n• Previous auditor\'s details (if applicable)\n\n• Appointment date and AGM details\n\n• Casual vacancy details (if applicable)'
    },
    {
      id: 'penalties',
      title: 'Penalties for Late Filing',
      content: 'To help you avoid penalties, OnEasy emphasizes timely filing. Late filing penalties are as follows:\n\n• Delay up to 30 days: 2x normal fee\n\n• Delay 31-60 days: 4x normal fee\n\n• Delay 61-90 days: 6x normal fee\n\n• Delay 91-180 days: 10x normal fee\n\n• Delay over 180 days: 12x normal fee'
    },
    {
      id: 'on-easy-services',
      title: 'OnEasy\'s Form ADT-1 Filing Services',
      content: 'At OnEasy, we offer comprehensive assistance for Form ADT-1 filing:\n\n• Document Preparation: We help prepare all necessary documents.\n\n• Thorough Review: Our experts ensure all documents are accurate and compliant.\n\n• Efficient Filing: We handle the Form ADT-1 filing process with precision.\n\n• Compliance Assurance: We ensure your company meets all legal requirements.\n\n• Timely Updates: We keep you informed about any changes or requirements in the filing process.\n\nChoose OnEasy for a smooth, worry-free Form ADT-1 filing experience. Let us help you maintain compliance and avoid penalties while you focus on growing your business.'
    }
  ];

  const faqs = [
    {
      question: 'What is Form ADT-1?',
      answer: 'Form ADT-1 is a form used by companies to inform the Registrar of Companies (ROC) about the appointment of an auditor, as per Section 139 of the Companies Act, 2013. This form must be filed within the prescribed timeline to ensure compliance with the law.'
    },
    {
      question: 'When should Form ADT-1 be filed?',
      answer: 'For newly incorporated companies, Form ADT-1 must be filed within 15 days of the first board meeting in which the auditor is appointed. For existing companies, it should be filed within 15 days of the Annual General Meeting (AGM) where the auditor is appointed or reappointed.'
    },
    {
      question: 'Is it mandatory to file Form ADT-1 for the first auditor\'s appointment?',
      answer: 'Although Rule 4(2) of the Companies (Audit and Auditors) Rules, 2014 does not explicitly mention filing Form ADT-1 for the first auditor, it is recommended to file the form for better compliance and to avoid any future discrepancies.'
    },
    {
      question: 'What happens if Form ADT-1 is not filed on time?',
      answer: 'Failure to file Form ADT-1 within the prescribed timeline can lead to penalties. The penalty increases with the delay in filing, with fines ranging from two times the normal fee to up to twelve times the normal fee, depending on the delay period.'
    },
    {
      question: 'Who is responsible for filing Form ADT-1?',
      answer: 'The company is responsible for filing Form ADT-1, not the auditor. It is the company\'s duty to ensure the form is filed within the required timeframe after the auditor\'s appointment.'
    },
    {
      question: 'What information is required in Form ADT-1?',
      answer: 'Form ADT-1 requires details such as the auditor\'s name, membership number, PAN number, email ID, address, appointment date, and the duration of their appointment. Additionally, if there is a vacancy, the form also requires the reason and date for such vacancy.'
    },
    {
      question: 'What are the documents required for filing Form ADT-1?',
      answer: 'The key documents required for filing Form ADT-1 include: Board resolution appointing the auditor, written consent from the auditor, a certificate from the auditor confirming they are not disqualified under Section 141 of the Companies Act, and a copy of the intimation sent to the auditor by the company.'
    },
    {
      question: 'Can Form ADT-1 be filed for casual vacancy appointments?',
      answer: 'Yes, Form ADT-1 must be filed even in the case of a casual vacancy, notifying the ROC about the appointment of a new auditor.'
    },
    {
      question: 'Is there any fee associated with filing Form ADT-1?',
      answer: 'Yes, filing Form ADT-1 involves a nominal fee, which increases based on the company\'s authorized capital. Additional fees will be levied if there is a delay in filing the form beyond the prescribed timeline.'
    },
    {
      question: 'What is the process for filing Form ADT-1?',
      answer: 'The company needs to prepare the required documents, ensure all details are accurate, and file Form ADT-1 with the ROC through the MCA portal. Companies can choose to hire professional services, like OnEasy, to handle the filing process efficiently and ensure full compliance.'
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
                console.log('Initiating payment for ADT-1:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'adt-1');
                localStorage.setItem('selectedRegistrationTitle', 'ADT-1');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/adt-1-form');
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
            introTitle="About Form ADT-1"
            introDescription="Form ADT-1 is a crucial document that companies must file with the Registrar of Companies (ROC) to report the appointment of their auditor. It must be filed within 15 days of the auditor's appointment to ensure compliance with the Companies Act, 2013."
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

export default ADT1Details;

