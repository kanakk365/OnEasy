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

function DINReactivationDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('din-reactivation');

  const processSteps = [
    {
      step: 1,
      title: 'Clearance of Outstanding Dues',
      description: 'Settle any pending fees related to the DIN, including any penalties for late filing of DIR-3 KYC (INR 5,000 if applicable).'
    },
    {
      step: 2,
      title: 'Compliance with Legal Requirements',
      description: 'Address the reason for deactivation and ensure compliance with all MCA regulations and requirements.'
    },
    {
      step: 3,
      title: 'Document Preparation',
      description: 'Prepare all required documents including PAN Card (self-attested), Address Proof (self-attested), Passport-sized photograph (self-attested), and Digital Signature Certificate (DSC).'
    },
    {
      step: 4,
      title: 'Form Submission',
      description: 'File Form DIR-3 KYC with the Ministry of Corporate Affairs (MCA) either through DIR-3 KYC eForm (for first-time filers or mobile/email updates) or DIR-3 KYC-WEB (for annual updates).'
    },
    {
      step: 5,
      title: 'Fee Payment',
      description: 'Pay any applicable late fees or penalties (INR 5,000 for non-compliance) along with the form submission.'
    },
    {
      step: 6,
      title: 'Processing and Reactivation',
      description: 'The form undergoes Straight Through Processing (STP) for approval. Upon successful approval, the system automatically reactivates the deactivated DIN.'
    }
  ];

  const documents = [
    'Digital Signature Certificate (DSC)',
    'PAN Card',
    'Address Proof',
    'Photograph',
    'The mobile number of the Director',
    'Email address of Director'
  ];

  const prerequisites = [
    {
      title: 'Clearance of Outstanding Dues',
      description: 'Settle any pending fees related to the DIN.'
    },
    {
      title: 'Compliance with Legal Requirements',
      description: 'Address the reason for deactivation and ensure compliance with regulations.'
    },
    {
      title: 'Filing Required Forms',
      description: 'Submit Form DIR-3 to the Ministry of Corporate Affairs (MCA).'
    },
    {
      title: 'Board Approval',
      description: 'Obtain a resolution from the board of directors approving the reactivation.'
    },
    {
      title: 'Proof of Identity',
      description: 'Provide valid identification documents for the director.'
    },
    {
      title: 'Digital Signature',
      description: 'Include the director\'s or authorised person\'s digital signature for form submission.'
    }
  ];

  const aboutSections = [
    {
      id: 'din-reactivation-intro',
      title: 'About DIN Reactivation',
      content: 'Understanding Director Identification Number (DIN)\n\nA Director Identification Number (DIN) is a unique 8-digit identifier issued by the Ministry of Corporate Affairs (MCA) for individuals serving or intending to serve as company directors in India. At OnEasy, we recognize the critical role of DIN in corporate governance and are committed to guiding you through every aspect of DIN management.\n\nKey Features of DIN:\n\n• Mandatory for all current and prospective company directors\n\n• Issued based on guidelines established by the Companies Act amendment\n\n• Valid for the lifetime of the director once issued\n\n• Essential for maintaining transparency in corporate leadership\n\nIf your DIN has been deactivated, don\'t panic. OnEasy offers a comprehensive solution to guide you through the reactivation process efficiently and effectively.'
    },
    {
      id: 'annual-kyc',
      title: 'Annual KYC Requirement: DIR-3 KYC',
      content: 'The MCA mandates an annual Know Your Customer (KYC) update through Form DIR-3 KYC to ensure the accuracy and currency of director information. At OnEasy, we specialize in simplifying this crucial compliance process for you.\n\nDetailed Insights into DIR-3 KYC:\n\n• Applicability: Mandatory for directors with DIN issued on or before March 31st, 2018, whose DIN status is \'approved\'.\n\n• Annual Deadline: September 30th of each year (subject to extensions granted by MCA).\n\n• Types of DIR-3 KYC Forms:\n  - DIR-3 KYC eForm: For first-time filers or those updating their mobile number/email.\n  - DIR-3 KYC-WEB: Simplified version for subsequent annual filings.\n\n• Purpose: To maintain accurate and up-to-date directory information with the Registrar of Companies (ROC).\n\n• Penalty for Non-Compliance: INR 5,000 fine for failing to file within the stipulated timeframe.'
    },
    {
      id: 'deactivation-causes',
      title: 'DIN Deactivation: Causes and Consequences',
      content: 'Failure to comply with the annual DIR-3 KYC filing requirement can lead to DIN deactivation, which can severely impact your ability to serve as a director. OnEasy is here to help you avoid or navigate this situation if it occurs.\n\nDeactivation Process:\n\n• DIN status changes to \'Deactivated due to Non-filing of DIR-3 KYC\' if not filed by the deadline.\n\n• Deactivation restricts the director from being appointed or associated with any company.\n\n• Deactivation can have serious consequences, affecting your existing directorships and corporate responsibilities. It\'s a situation you want to avoid, and OnEasy is here to help you navigate it if it occurs.'
    },
    {
      id: 'reactivation-process',
      title: 'DIN Reactivation: A Step-by-Step Guide with OnEasy',
      content: 'If your DIN has been deactivated, don\'t panic. OnEasy offers a comprehensive solution to guide you through the reactivation process efficiently and effectively.\n\nReactivation Process:\n\n1. Form Submission: File e-form DIR-3 KYC or complete the KYC process through the designated web service.\n\n2. Fee Payment: Pay any applicable late fees or penalties.\n\n3. Processing: The form undergoes Straight Through Processing (STP) for approval.\n\n4. Automatic Reactivation: The system automatically reactivates the deactivated DIN upon successful approval.'
    },
    {
      id: 'on-easy-services',
      title: 'OnEasy\'s Comprehensive DIN Management Services',
      content: 'Our Service Offerings:\n\n• DIN Application Support: Guidance on obtaining the correct version of the DIR-3 KYC form. Assistance is needed to understand the reactivation process requirements. Support in initiating the DIN application or reactivation procedure.\n\n• Meticulous Form Completion: Ensuring accurate entry of personal information as per PAN card. Assistance fills details like father\'s name, nationality, date of birth, and residential address. Is double-checking all entries for consistency and compliance with MCA requirements.\n\n• PAN Verification Process: Is facilitating the PAN verification process with relevant authorities. Ensuring all details match the PAN database for smooth processing.\n\n• Contact Information Update and Verification: Is assisting in updating your latest contact details. Is Guiding you through the OTP verification process for mobile and email. Ensuring all communication channels are correctly registered with MCA.\n\n• Comprehensive Document Preparation: Assisting in preparing self-attested copies of all required documents. Ensuring all documents meet MCA specifications and standards. Organizing and labelling documents for easy reference and submission.\n\n• Digital Signature Application and Management: Is Guiding you through the process of obtaining a valid Digital Signature Certificate. Assisting in applying the digital signature correctly on the DIR-3 KYC form. Ensuring the DSC meets all regulatory requirements.\n\n• Thorough Form Review and Submission: Is conducting a comprehensive review of the completed form for accuracy and completeness. Is Guiding you through the submission process on the MCA portal. Addressing any last-minute queries or concerns before final submission.\n\n• SRN Generation and Tracking: Is assisting in generating the Service Request Number (SRN) for your submission. Guiding how to use the SRN for future reference and tracking. Is monitoring the status of your submission using the SRN.\n\n• Confirmation and Follow-up: Monitoring and confirming the receipt of the acknowledgement email from MCA. Follow up with MCA if there are any delays or issues in processing. Keeps you informed about the status of your DIR-3 KYC submission at every stage.\n\n• Ongoing Compliance Support: Setting up reminders for annual DIR-3 KYC filings. Assists with timely submissions in subsequent years. Is keeping you updated on any changes in MCA regulations or requirements.'
    },
    {
      id: 'why-choose',
      title: 'Why Choose OnEasy for Your DIN Management?',
      content: '• Expertise: Our team of professionals has in-depth knowledge of MCA regulations and DIN management processes.\n\n• Time-Saving: We handle the paperwork, allowing you to focus on your core business activities.\n\n• Error Reduction: Our meticulous approach minimises the risk of errors that could lead to rejections or delays.\n\n• Compliance Assurance: We ensure you comply with all MCA regulations and deadlines.\n\n• Personalized Service: We tailor our approach to meet your needs and circumstances.\n\n• Continuous Support: Our team can always address your queries and provide updates.\n\n• Cost-Effective: By preventing penalties and ensuring smooth processing, we help you avoid unnecessary expenses.'
    },
    {
      id: 'partner-with-us',
      title: 'Don\'t Risk Your Director Status - Partner with OnEasy Today!',
      content: 'Managing your DIN and staying compliant with MCA regulations doesn\'t have to be daunting. Let OnEasy\'s expert team handle the complexities while you focus on steering your company to success. Our comprehensive services ensure that your DIN remains active, your compliance is up-to-date, and your director status is secure.\n\nWhether you\'re a first-time director applying for a DIN, need assistance with annual DIR-3 KYC filing, or require urgent help with DIN reactivation, OnEasy is your trusted partner every step of the way.\n\nTake the First Step Towards Hassle-Free DIN Management\n\nContact OnEasy today to experience the peace of mind that comes with expert DIN management. Our team is ready to assess your needs and provide tailored solutions to ensure compliance with all MCA regulations.\n\nChoose OnEasy for a smooth, efficient, and worry-free DIN management experience!'
    }
  ];

  const faqs = [
    {
      question: 'What is DIN (Director Identification Number)?',
      answer: 'DIN is a unique 8-digit identification number issued to individuals appointed as directors of a company in India. It is mandatory for anyone aspiring to be a director of an Indian company, and it is issued by the Ministry of Corporate Affairs (MCA).'
    },
    {
      question: 'Why is DIN deactivated?',
      answer: 'A DIN is deactivated if the director fails to file the DIR-3 KYC form by the annual deadline (usually September 30th). This is to ensure that the director\'s KYC (Know Your Customer) details are up-to-date with the Ministry of Corporate Affairs (MCA).'
    },
    {
      question: 'How can I reactivate a deactivated DIN?',
      answer: 'A deactivated DIN can be reactivated by filing the DIR-3 KYC form with the MCA, either through the DIR-3 KYC eForm or the DIR-3 KYC web form, depending on whether it is a first-time filing or an annual update.'
    },
    {
      question: 'What documents are required for DIN reactivation?',
      answer: 'To reactivate a DIN, the following documents are typically required: PAN Card (self-attested), Proof of Address (self-attested, such as Aadhaar, Voter ID, or Driving License), Passport-sized photograph (self-attested), Digital Signature Certificate (DSC), and unique personal mobile number and email address for OTP verification.'
    },
    {
      question: 'What is the penalty for failing to file the DIR-3 KYC on time?',
      answer: 'If the DIR-3 KYC form is not filed by the specified deadline, a penalty of INR 5,000 is imposed. This fine must be paid when filing the KYC form to reactivate the DIN.'
    },
    {
      question: 'How long does it take to reactivate a deactivated DIN?',
      answer: 'Once the DIR-3 KYC form is successfully filed and approved by the MCA, the DIN is reactivated immediately. This approval typically happens through Straight Through Processing (STP) for most cases.'
    },
    {
      question: 'Can I file the DIR-3 KYC form myself?',
      answer: 'Yes, directors can file the DIR-3 KYC form through the MCA portal. However, professional assistance is often recommended to ensure all details are correctly filled in, and the required documents are properly submitted.'
    },
    {
      question: 'What is the difference between the DIR-3 KYC eForm and the DIR-3 KYC Web Form?',
      answer: 'The DIR-3 KYC eForm is used by directors to file their KYC details for the first time or update their mobile number or email. The DIR-3 KYC Web Form is a simplified version for directors who have already completed the KYC process, allowing for a more streamlined annual update.'
    },
    {
      question: 'What happens if my DIN remains deactivated for a long time?',
      answer: 'If a DIN remains deactivated, the individual cannot be appointed as a company director, sign essential company documents, or perform any directorial duties until the DIN is reactivated by completing the KYC process.'
    },
    {
      question: 'How can OnEasy help with DIN reactivation?',
      answer: 'OnEasy provides comprehensive support for DIN reactivation, including guidance on the required documentation, help with filling out the DIR-3 KYC form, and smooth submission to the MCA. Our experts handle the process to make reactivating your DIN quick and hassle-free.'
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
                console.log('Initiating payment for DIN Reactivation:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'din-reactivation');
                localStorage.setItem('selectedRegistrationTitle', 'DIN Reactivation');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/din-reactivation-form');
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
            introTitle="About DIN Reactivation"
            introDescription="A Director Identification Number (DIN) is a unique 8-digit identifier issued by the Ministry of Corporate Affairs (MCA) for individuals serving or intending to serve as company directors in India. If your DIN has been deactivated, OnEasy offers a comprehensive solution to guide you through the reactivation process efficiently and effectively."
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

export default DINReactivationDetails;

