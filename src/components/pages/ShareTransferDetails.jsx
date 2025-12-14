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

function ShareTransferDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('share-transfer');

  const processSteps = [
    {
      step: 1,
      title: 'Review AOA and Agreements',
      description: 'Examine the Articles of Association and shareholder agreements for transfer clauses and restrictions.'
    },
    {
      step: 2,
      title: 'Price Determination and Shareholder Notification',
      description: 'Determine share price as per AOA and notify existing shareholders of the transfer opportunity.'
    },
    {
      step: 3,
      title: 'Execute Share Transfer Deed',
      description: 'Complete Form SH-4, pay stamp duty, and have both transferor and transferee sign the deed with witness verification.'
    },
    {
      step: 4,
      title: 'Board Approval and Registration',
      description: 'Obtain board resolution approval, submit documents to the company, and receive new share certificate.'
    }
  ];

  const documents = [
    'PAN Card Of the Transferor',
    'Aadhar Card of the Transferee',
    'Board Resolution',
    'No Objection Certificate (NOC)',
    'Indemnity Bond'
  ];

  const prerequisites = [
    {
      title: 'Review Agreements',
      description: 'Check the shareholder agreement and Articles of Association for transfer clauses.'
    },
    {
      title: 'Obtain Approvals',
      description: 'If required, secure necessary approvals from the board and other shareholders.'
    },
    {
      title: 'Prepare Transfer Form',
      description: 'Complete a stock transfer form with transaction details.'
    },
    {
      title: 'Payment',
      description: 'Ensure consideration for shares is paid.'
    },
    {
      title: 'Stamp Duty',
      description: 'Pay any applicable stamp duty on the transfer.'
    },
    {
      title: 'Update Register',
      description: 'Update the company\'s register of members to reflect the transfer.'
    },
    {
      title: 'Notify the Company',
      description: 'Inform the company and submit the necessary documents.'
    },
    {
      title: 'Issue Share Certificate',
      description: 'If applicable, provide a new share certificate to the transferee.'
    }
  ];

  const aboutSections = [
    {
      id: 'share-transfer-intro',
      title: 'About Share Transfer',
      content: 'The Share Transfer Procedure in a Private Limited Company is a well-organized process that allows the transfer of ownership from one individual to another. Shares represent portions of ownership in a company and can be bought, sold, or transferred. In India, the transfer of shares within a private limited company is governed by the Companies Act 2013, along with the rules and guidelines established by the Ministry of Corporate Affairs (MCA).\n\nAt OnEasy, our team of experts is ready to assist with the Share Transfer process for Private Limited Companies. We ensure that each step complies with the current legal standards and regulations, guaranteeing a smooth transition while maintaining compliance integrity.'
    },
    {
      id: 'meaning-of-share-transfer',
      title: 'Meaning of Share Transfer',
      content: 'Share transfer refers to the process where a shareholder voluntarily transfers their ownership rights and associated obligations of a share in the company. This occurs when a shareholder decides to give up their membership and transfers their shares to another individual who wishes to become a member.\n\nShares in a company are transferred like any movable asset unless restrictions are specified in the company\'s articles of association.'
    },
    {
      id: 'critical-regulations',
      title: 'Critical Regulations for Transfer of Shares in Private Companies',
      content: 'Specific legal provisions regulate the transfer of shares in a private company to ensure compliance with corporate governance standards and maintain the company\'s private status. Section 56(1) & (3) of the Companies Act, 2013, along with Rule 11(1), (2), and (3) of the Companies (Share Capital and Debentures) Rules, 2014, outline the framework for these transfers.'
    },
    {
      id: 'share-transfer-rules',
      title: 'Share Transfer Rules in Private Limited Companies',
      content: 'In Private Limited Companies, the Articles of Association (AOA) govern the share transfer process and must be consulted before starting the transfer. The AOA may impose certain restrictions, including:\n\n• Pre-emptive Rights: Shareholders looking to sell their shares must first offer them to the company\'s existing members at a price determined by the directors or auditors. The shares can be transferred to an external party if no current shareholder is interested.\n\n• Directorial Discretion on Share Transfers: The AOA may give directors the authority to reject a share transfer. This provides directors with significant control over share transfers in Private Limited Companies.'
    },
    {
      id: 'key-participants',
      title: 'Key Participants in the Share Transfer Process',
      content: 'The key parties involved in the share transfer process are:\n\n• Initial subscribers to the company\'s memorandum.\n\n• A legal representative in the event of a shareholder\'s death.\n\n• The transferor – the shareholder wishing to transfer shares.\n\n• The transferee – the recipient of the shares.\n\n• The company facilitating the transfer, whether publicly traded or privately held.'
    },
    {
      id: 'share-transfer-process',
      title: 'Share Transfer Process in a Private Limited Company',
      content: 'The share transfer process follows the company\'s Articles of Association (AOA) and relevant legal guidelines.\n\n• Review the AOA: Examine the AOA to check for any transfer restrictions or conditions.\n\n• Notify the Director: The shareholder intending to transfer shares must formally notify the company\'s director.\n\n• Price Determination: The share price is determined according to the AOA, usually by the directors or auditors. This price is offered first to existing shareholders.\n\n• Notify Shareholders: The company must inform shareholders of the available shares, offer price, and response deadline.\n\n• Share Allocation: If current shareholders express interest, shares are allocated to them. Otherwise, the remaining shares are offered to external parties.\n\nExecuting the Share Transfer:\n\n• Share Transfer Deed: Obtain the official transfer deed (Form SH-4). Exceptions to using Form SH-4 include transfers by directors or nominees for another corporate entity as per Section 187 of the Companies Act, 2013, transfers from directors or nominees of government-controlled corporations, share transfers secure loans to institutions like SBI, scheduled banks, or financial institutions, and transfers involving debentures where standard transfer forms are acceptable.\n\n• Deed Execution: The transferor and transferee must sign the share transfer deed.\n\n• Stamp Duty: The deed must be stamped by the Indian Stamp Act and applicable state rates.\n\n• Witness Verification: A witness must sign the deed, who provides their name and address for validation.\n\n• Document Submission: Submit the signed transfer deed and share certificate to the company.\n\n• Issuance of New Share Certificate: Upon verifying the documents, the company issues a new share certificate to the transferee, recognizing them as the new shareholders.'
    },
    {
      id: 'why-oneasy',
      title: 'OnEasy: Your Trusted Partner in Simplifying Share Transfers',
      content: 'At OnEasy, we specialize in providing comprehensive assistance with the share transfer process. Our expert knowledge and experience navigating corporate regulations ensure a smooth and compliant transfer of shares in Private Limited Companies. From reviewing the Articles of Association to executing the transfer deed, our professionals will guide you through each step.\n\nGet Expert Assistance for Share Transfers Now with OnEasy – Contact Us Today!'
    }
  ];

  const faqs = [
    {
      question: 'What is transferring shares in a Private Limited Company?',
      answer: 'The share transfer process involves notifying the company\'s directors, determining the share price, offering the shares to existing shareholders, executing the transfer deed (Form SH-4), and completing the necessary documentation before issuing a new share certificate.'
    },
    {
      question: 'Can I transfer my shares to anyone outside the company?',
      answer: 'Yes, but the Articles of Association (AOA) usually require you to first offer the shares to existing shareholders. If no existing shareholders are interested, you can transfer them to an external party.'
    },
    {
      question: 'What documents are required for share transfer?',
      answer: 'The essential documents include the Share Transfer Deed (Form SH-4), Share Certificate, buyer\'s PAN card, Board Resolution, No Objection Certificate (NOC), and Indemnity Bond, among others.'
    },
    {
      question: 'How is the price of shares determined for transfer?',
      answer: 'The price of shares is typically determined based on the company\'s Articles of Association (AOA), often set by the company\'s directors or auditors.'
    },
    {
      question: 'Is stamp duty required for a share transfer?',
      answer: 'Yes, the Share Transfer Deed must be stamped in accordance with the Indian Stamp Act. The stamp duty amount depends on the state regulations.'
    },
    {
      question: 'What are the pre-emptive rights of shareholders in share transfer?',
      answer: 'Pre-emptive rights require the shareholder intending to transfer shares to offer them to existing shareholders first, typically at a price determined by the company.'
    },
    {
      question: 'Can the directors refuse to transfer my shares?',
      answer: 'Yes, directors may have the discretion to reject a share transfer, depending on the company\'s Articles of Association (AOA), which grants them this authority.'
    },
    {
      question: 'How long does it take to complete a share transfer?',
      answer: 'The process usually takes a few weeks, but the exact timeline can vary depending on the company\'s internal processes and legal compliance.'
    },
    {
      question: 'What happens if the share transfer documents are incomplete?',
      answer: 'If the documents are incomplete or poorly executed, the company can refuse the share transfer and request the necessary corrections or additional documents.'
    },
    {
      question: 'Do I need the approval of the Board of Directors for a share transfer?',
      answer: 'Yes, the Board of Directors must approve the share transfer, usually through a formal board resolution, as part of the process.'
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
                console.log('Initiating payment for Share Transfer:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'share-transfer');
                localStorage.setItem('selectedRegistrationTitle', 'Share Transfer');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/share-transfer-form');
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
            introTitle="About Share Transfer"
            introDescription="The Share Transfer Procedure in a Private Limited Company is a well-organized process that allows the transfer of ownership from one individual to another. Shares represent portions of ownership in a company and can be bought, sold, or transferred."
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

export default ShareTransferDetails;

