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

function AOAAmendmentDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('aoa-amendment');

  const processSteps = [
    {
      step: 1,
      title: 'Board of Directors Meeting',
      description: 'Convene a Board meeting by Section 173 and Secretarial Standard (SS-1). Notify all directors at least 7 days in advance, discuss and pass the necessary resolution to amend the AOA, and determine the date, time, and venue for a General Meeting.'
    },
    {
      step: 2,
      title: 'Convene General Meeting',
      description: 'Issue written notice for the General Meeting at least 21 days in advance. Clearly state the meeting details and the business to be transacted. Hold the General Meeting on the scheduled date and pass a Special Resolution for the AOA amendment.'
    },
    {
      step: 3,
      title: 'File Form MGT-14 with ROC',
      description: 'File Form MGT-14 with the Registrar of Companies (ROC) within 30 days after passing the Special Resolution. Include certified true copies of the resolutions, meeting notices, altered AOA, attendance sheet, and consent for any shorter notice, if applicable.'
    },
    {
      step: 4,
      title: 'Effect of AOA Amendment',
      description: 'The revised Articles of Association take effect once the board resolution is passed. Ensure all copies of the AOA reflect the amendments to maintain accuracy and compliance.'
    }
  ];

  const documents = [
    'Board Resolution',
    'Shareholders\' Special Resolution',
    'Draft of Amended AOA',
    'Form MGT-14',
    'Notice of Meeting',
    'Minutes of the Meeting'
  ];

  const prerequisites = [
    {
      title: 'Board Approval',
      description: 'A resolution must be passed by the board of directors approving the proposed amendments to the Articles of Association.'
    },
    {
      title: 'Shareholder Approval',
      description: 'The amendment typically requires approval from the shareholders in a general meeting, usually through a special resolution.'
    },
    {
      title: 'Notice of Meeting',
      description: 'All shareholders must be given adequate notice regarding the meeting where the amendment will be discussed, specifying the nature of the proposed changes.'
    },
    {
      title: 'Drafting the Amendment',
      description: 'The specific changes to the AOA should be clearly drafted, detailing the proposed modifications.'
    },
    {
      title: 'Filing of Relevant Forms',
      description: 'After obtaining shareholder approval, necessary forms, such as Form MGT-14 (for filing the resolution with the Ministry of Corporate Affairs), must be submitted.'
    },
    {
      title: 'Payment of Fees',
      description: 'The applicable fees for the amendment must be paid according to the Ministry of Corporate Affairs (MCA) guidelines.'
    },
    {
      title: 'Compliance with Legal Requirements',
      description: 'Ensure the proposed amendments comply with the Companies Act and other relevant regulations.'
    }
  ];

  const aboutSections = [
    {
      id: 'aoa-amendment-intro',
      title: 'About AOA Amendment',
      content: 'AOA Amendment refers to the procedure of modifying a company\'s Articles of Association. Altering the AOA allows a company to update its rules in response to new circumstances, comply with legal obligations, or align with changing business objectives and strategies.\n\nAt OnEasy, we recognise the importance of AOA amendments and offer expert guidance to navigate this complex process. Our team ensures compliance with regulatory requirements and simplifies the process for you.'
    },
    {
      id: 'what-is-aoa',
      title: 'Articles of Association (AOA)',
      content: 'The Articles of Association (AOA) are a fundamental document governing a company\'s internal management and operations. These articles outline the rules and regulations essential for effective governance and management within the company. A company registered at the time of incorporation can amend its AOA after incorporation whenever necessary to enhance its management. AOA amendments are vital for companies to remain compliant and efficient. After making any changes to the AOA, the company must file Form MGT-14 with the Ministry of Corporate Affairs.'
    },
    {
      id: 'what-are-aoa',
      title: 'What are Articles of Association?',
      content: 'The Articles of Association (AOA) are crucial for a company\'s governance and administration. They consist of the rules, regulations, and bylaws that govern the company\'s internal management and operations. As an integral part of a company\'s constitution, the AOA defines various aspects of functioning, including:\n\n• Roles of Directors: Guidelines on director responsibilities and procedures for their appointment or removal.\n\n• Shareholder Rights: Clarification of shareholder entitlements, such as voting rights, dividends, and share transfers.\n\n• Board Meetings: Protocols for conducting meetings of the board of directors.\n\n• General Meetings: Regulations for significant company meetings, including decision voting procedures.\n\n• Profit Distribution: Rules governing the allocation of the company\'s profits to shareholders.\n\n• Borrowing Regulations: Guidelines on how the company can obtain loans.\n\n• Amendment Procedures: Processes for updating the AOA.\n\n• Dissolution Procedures: Steps to close the company and distribute its assets.\n\n• Company Seal: Regulations regarding using a company seal, if applicable.\n\nIt is essential to note that the AOA can be modified through a formal legal process by the provisions of the Companies Act or other relevant laws.'
    },
    {
      id: 'when-can-amend',
      title: 'When Can a Company Amend its AOA?',
      content: 'A company can alter its Articles of Association (AOA) under various circumstances, including:\n\n• Conversion of a Private Company into a Public Company: This often necessitates substantial changes to the AOA to meet additional regulatory requirements.\n\n• Conversion of a Public Company into a Private Company: The AOA must be amended to reflect reduced regulatory requirements.\n\n• Changes in Existing Articles:\n  - Change in Business Objectives: When business activities evolve, the AOA should reflect these changes.\n  - Change in Share Capital: Amendments may be needed if the company intends to increase or decrease its share capital.\n  - Change of Company Name: The AOA must be updated to indicate a new name.\n  - Alteration of Share Classes: New share classes or existing modifications may require AOA revisions.\n  - Alteration of Share Rights: Changes in voting rights or dividend preferences necessitate updates to the AOA.\n  - Change of Registered Office: The AOA should be modified to show a new registered office address.\n  - Change in Board Structure: Amendments may be required to adjust the composition or powers of the Board of Directors.\n\n• Conversion of Company Type: Transitioning between private and public companies often requires significant AOA changes.\n\n• Compliance with Legal Requirements: Amendments may be necessary to ensure adherence to updated company laws or regulations.\n\n• Approval of Special Resolutions: The AOA must reflect any changes that require shareholder approval through a special resolution.'
    },
    {
      id: 'critical-requirements',
      title: 'Critical Requirements for Amending a Company\'s AOA',
      content: 'To amend the Articles of Association (AOA), the following key rules must be adhered to:\n\n• Legal Compliance: Changes must align with the Companies Act and the company\'s Memorandum.\n\n• Special Agreement for Entrenchment: If special, hard-to-change rules are added, all private company members must agree, or a majority vote is required for public companies.\n\n• Approval for Changing Company Type: A majority approval (Special Resolution) is necessary to convert the company type.'
    },
    {
      id: 'procedure',
      title: 'Procedure for AOA Amendment',
      content: 'A company may modify, remove, or add articles as follows:\n\nStep 1: Board of Directors Meeting\n• Convene a Meeting: Schedule a Board meeting by Section 173 and Secretarial Standard (SS-1).\n• Notice Issuance: Notify all directors at least 7 days in advance, or provide shorter notice if the matter is urgent. Include supporting documents such as the agenda and draft resolution.\n• Board Resolution: Discuss and pass the necessary resolution to amend the AOA. Designate a Company Secretary or Director to sign and file the relevant forms with the Registrar of Companies.\n• General Meeting Arrangements: Determine the date, time, and venue for a General Meeting and approve the draft notice, including the required explanatory statement.\n• Circulate Draft Minutes: Prepare and distribute draft minutes within 15 days of the Board meeting for comments and feedback.\n\nStep 2: Convene General Meeting\n• Issue Notice: Provide written notice for the General Meeting at least 21 days in advance through various means, ensuring it reaches all relevant parties, including Directors and Members.\n• Notice Content: Clearly state the meeting details and the business to be transacted.\n• Conduct the Meeting: Hold the General Meeting on the scheduled date and pass a Special Resolution for the AOA amendment.\n• Disclosure to Stock Exchange: Share meeting proceedings with the Stock Exchange within 24 hours and post the information on the company\'s website within 2 working days.\n• Prepare Minutes: Draft detailed meeting minutes, obtain signatures, and compile them following established procedures.\n\nStep 3: File Form MGT-14 with ROC\n• Submit Form MGT-14: File with the Registrar of Companies (ROC) within 30 days after passing the Special Resolution at the General Meeting.\n• Required Attachments: Include the certified true copies of the resolutions, meeting notices, altered AOA, attendance sheet, and consent for any shorter notice, if applicable.\n• Document Consistency: Ensure all copies of the AOA reflect the amendments to maintain accuracy and compliance.\n\nStep 4: Effect of AOA Amendment\n• The revised Articles of Association take effect once the board resolution is passed. These modifications hold the same legal authority as the original articles, provided they comply with the Companies Act and the company\'s Memorandum. Ensuring these changes are accurately reflected in all copies of the Articles of Association is vital.'
    },
    {
      id: 'why-choose',
      title: 'Streamlining AOA Amendments with OnEasy',
      content: 'At OnEasy, we provide comprehensive assistance with amending companies\' Articles of Association (AOA). Our expert team guides businesses through the entire process, ensuring that all modifications comply with the relevant provisions of the Companies Act. We offer end-to-end support, from drafting the necessary resolutions to preparing the revised AOA and filing the required forms with the Registrar of Companies.\n\nContact us today to ensure your AOA Amendments are managed efficiently and by legal requirements.'
    }
  ];

  const faqs = [
    {
      question: 'What are the Articles of Association (AOA)?',
      answer: 'The Articles of Association are the rules and regulations governing the internal management of a company, outlining the rights and responsibilities of shareholders, directors, and officers. A company\'s internal management.'
    },
    {
      question: 'Why would a company need to amend its AOA?',
      answer: 'A company may need to amend its AOA to reflect changes in business operations, comply with new regulations, modify shareholder rights, or adjust its corporate structure.'
    },
    {
      question: 'What is the process for amending the AOA?',
      answer: 'The process typically involves convening a Board meeting to propose the amendment, passing a special resolution at a General Meeting, and filing Form MGT-14 with the Registrar of Companies.'
    },
    {
      question: 'Who can initiate an AOA amendment?',
      answer: 'Amendments can be initiated by the company\'s Board of Directors or shareholders, usually requiring a special resolution for approval.'
    },
    {
      question: 'What types of changes can be made to the AOA?',
      answer: 'Changes can include modifications to shareholder rights, changes in business objectives, alterations in share capital, and amendments related to the company\'s governance structure.'
    },
    {
      question: 'Is shareholder approval required for AOA amendments?',
      answer: 'Yes, a special resolution must be passed at a General Meeting, which typically requires the approval of at least 75% of the votes cast by shareholders.'
    },
    {
      question: 'What documents are required for AOA amendment?',
      answer: 'Required documents generally include the notice of the General Meeting, the resolution passed, the revised AOA, attendance sheets, and other supporting documents as needed.'
    },
    {
      question: 'How long does it take to amend the AOA?',
      answer: 'The timeline can vary, but the amendment process can typically be completed within a few weeks, depending on the scheduling of meetings and regulatory filing requirements.'
    },
    {
      question: 'What are the legal requirements for amending the AOA?',
      answer: 'Amendments must comply with the provisions of the Companies Act and any other applicable laws, ensuring they do not contravene existing legal regulations.'
    },
    {
      question: 'What happens if the AOA is not amended when necessary?',
      answer: 'Failing to amend the AOA when required to ensure compliance with legal obligations may lead to penalties, legal disputes, or operational inefficiencies.'
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
                console.log('Initiating payment for AOA Amendment:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'aoa-amendment');
                localStorage.setItem('selectedRegistrationTitle', 'AOA Amendment');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/aoa-amendment-form');
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
            introTitle="About AOA Amendment"
            introDescription="AOA Amendment refers to the procedure of modifying a company's Articles of Association. Altering the AOA allows a company to update its rules in response to new circumstances, comply with legal obligations, or align with changing business objectives and strategies."
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

export default AOAAmendmentDetails;

