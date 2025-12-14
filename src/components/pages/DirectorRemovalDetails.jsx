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

function DirectorRemovalDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('director-removal');

  const processSteps = [
    {
      step: 1,
      title: 'Issuance of Special Notice',
      description: 'Issue a special notice as per Section 115 of the Companies Act 2013, sent to the director at least 14 days before the resolution vote.'
    },
    {
      step: 2,
      title: 'Board Meeting & Resolution',
      description: 'Convene a board meeting to acknowledge the resignation or pass a resolution for removal. For shareholder-initiated removal, schedule an EGM with 21 days notice.'
    },
    {
      step: 3,
      title: 'Director\'s Right to be Heard',
      description: 'Allow the director to present their case and submit a written representation, which should be circulated to members or read at the meeting.'
    },
    {
      step: 4,
      title: 'Filing Form DIR-12',
      description: 'Submit Form DIR-12 to the Registrar of Companies within 30 days of the director\'s removal or resignation, along with necessary documentation.'
    },
    {
      step: 5,
      title: 'Update Records',
      description: 'Update the Register of Directors, MCA database, and file amendments under various acts (GST, EPF, ESI, etc.) to reflect the changes.'
    }
  ];

  const documents = [
    'PAN Card of the Director',
    'Aadhar Card of the director',
    'Consent Letter',
    'Company Approval',
    'Digital Signature of Director'
  ];

  const prerequisites = [
    {
      title: 'Issuance of Special Notice',
      description: 'As per Section 115 of the Companies Act 2013, a special notice must be issued to initiate the removal process.'
    },
    {
      title: 'Notice Period to Director',
      description: 'This special notice must be sent to the director in question at least 14 days before the resolution vote, allowing adequate time for response.'
    },
    {
      title: 'Right to be Heard',
      description: 'The director facing removal must be allowed to present their side. They should be allowed to submit a written representation, which could be circulated to members or read at the meeting.'
    },
    {
      title: 'Restriction on Reappointment',
      description: 'Once removed, the director is not eligible for reappointment to the board.'
    },
    {
      title: 'Filing of Form DIR-12',
      description: 'As mandated by the Companies Act 2013, Form DIR-12 must be filled out and submitted to document the official removal of a director.'
    }
  ];

  const aboutSections = [
    {
      id: 'director-removal-intro',
      title: 'About Director Removal',
      content: 'Company directors oversee the management and operations of a business, while shareholders hold ownership of the company. Situations may arise where shareholders decide to remove a director due to inadequate performance or other concerns, or a director may choose to resign. Removing a director is a significant corporate action that requires careful consideration and strict adherence to the legal framework outlined by the Companies Act 2013 or relevant local laws. Whether initiated by an ordinary resolution, board resolution, or judicial order, this process must be conducted fairly, transparently, and in the company\'s best interest.\n\nAt OnEasy, we specialize in navigating the complexities of the director removal or resignation process, ensuring full compliance with legal standards and meticulous attention to detail. Our experts are here to assist you in managing this critical corporate transition smoothly and effectively. Contact us today to get started.'
    },
    {
      id: 'reasons-for-removal',
      title: 'Reasons for Director Removal',
      content: 'According to the Companies Act 2013, a private limited company must appoint at least two directors to commence operations.\n\nShareholders can dismiss a director during the General Meeting, except in cases of government-appointed directors. A director may be subject to removal under various circumstances, including:\n\n• Disqualification as per the Companies Act criteria.\n\n• Absence from board meetings for over a year.\n\n• Violation of Section 184 of the Companies Act by engaging in prohibited transactions.\n\n• Prohibition from participation due to a court or tribunal order.\n\n• Conviction by a court for a criminal offence with a minimum six-month sentence.\n\n• Non-compliance with the regulations and requirements of the Companies Act, 2013.\n\n• Voluntary resignation from the board.'
    },
    {
      id: 'methods-for-removal',
      title: 'Methods for Director Removal from a Company',
      content: 'There are three primary methods for removing a director from a company:\n\n• Resignation by Directors: This method involves directors voluntarily stepping down from their positions.\n\n• Director Absence from Board Meetings: This approach is applicable when a director fails to attend board meetings for 12 months, leading to their removal.\n\n• Shareholder-initiated Removal: This method involves shareholders voting to remove a director from their position.'
    },
    {
      id: 'legal-framework',
      title: 'Legal Framework Governing Director Removal',
      content: 'The removal of a director is governed by the Companies Act 2013, particularly under Section 169, which outlines the legal steps and rules to be followed.\n\n• Section 169: Details the process for legally removing a director.\n\n• Section 115: While mainly discussing the appointment of new directors, this section is crucial for understanding removal rules.\n\n• Section 163: Addresses the selection of directors to ensure fair representation, impacting the decision-making process.\n\n• Rule 23 of the Companies (Management and Administration) Rules, 2014: Provides specific guidelines for proper director removal.'
    },
    {
      id: 'procedure',
      title: 'Procedure for Director Removal',
      content: 'The procedure for removing a director from a company includes several steps:\n\n1. Director\'s Voluntary Resignation: A director can resign by submitting a written notice to the board. The resignation is effective upon receipt by the company or a later specified date. The board should acknowledge the resignation in the next board meeting.\n\n2. Board of Directors Meeting: The board, which is responsible for the company\'s management and decision-making, should schedule a meeting to acknowledge the resignation following Section 173 and Secretarial Standard-1 (SS-1). This meeting should be held within 30 days of receiving the resignation.\n\n3. Notification of Board Meeting: After receiving the resignation letter, notify all directors at their registered addresses 7 days before the meeting.\n\n4. Preparation of Meeting Documents: The meeting notice should include the agenda, explanatory notes, and draft resolution.\n\n5. Conduct the Board Meeting: Convene the board to acknowledge the director\'s resignation.\n\n6. Delegation for ROC Filings: Assign the Company Secretary, CFO, or director to submit the necessary forms and documents to the Registrar of Companies.\n\n7. Disclosure for Listed Companies: Public companies must promptly report their resignation to the stock exchange by Regulation 30 & 46(3) of the SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015.\n\n8. Distribution of Draft Minutes: Within 15 days after the board meeting, send draft minutes to all directors for review.\n\n9. Submission of Form DIR-12: Within 30 days of receiving the resignation notice, the company must submit Form DIR-12 to the ROC along with the necessary documentation.'
    },
    {
      id: 'director-absence',
      title: 'Director Absence from Board Meetings for 12 Months',
      content: 'If a director fails to attend board meetings for twelve months, they are considered to have vacated their position under Section 167. The steps to follow in such cases include:\n\n• Acknowledgement of Vacancy: Recognize the vacancy under applicable corporate governance laws.\n\n• Filing of Form DIR-12: Notify the ROC of the director\'s removal or resignation by filing Form DIR-12.\n\n• Update on MCA Database: Complete the necessary formalities to officially remove the director\'s name from the Ministry of Corporate Affairs (MCA) database.'
    },
    {
      id: 'shareholder-removal',
      title: 'Director Removal by Shareholders',
      content: 'To remove a director through shareholder resolution (typically an Ordinary Resolution unless stated otherwise), follow these steps:\n\n1. Board Meeting Notice: Schedule a Board Meeting and provide at least seven days\' notice to all directors, including the agenda item for the proposed removal.\n\n2. Resolution for EGM: At the Board Meeting, pass a resolution to convene an Extraordinary General Meeting (EGM) and propose the removal resolution for shareholder approval.\n\n3. Issuing EGM Notice: Send notices for the EGM to all shareholders, ensuring a 21-day notice period.\n\n4. Voting at EGM: Present the resolution for the director\'s removal to the shareholders. If the majority supports it, the resolution is passed.\n\n5. Director\'s Right to be Heard: Allow the director to present their case before the resolution is voted on.\n\n6. Filing Forms DIR-11 and DIR-12: After the resolution is passed, complete and submit Form DIR-11 (by the outgoing director, if applicable) and Form DIR-12 (by the company) to the ROC.'
    },
    {
      id: 'penalties',
      title: 'Penalties for Delayed Submission of Form DIR-12',
      content: 'Failure to file Form DIR-12 within 30 days following a director\'s resignation results in escalating penalties based on the delay duration:\n\n• 30 to 60 days: Double the standard government fees.\n\n• 60 to 90 days: Four times the government fees.\n\n• Beyond 90 days: Ten times the government fees.\n\n• Exceeding 180 days: Twelve times the government fees and potential legal actions for compounding offences.'
    },
    {
      id: 'impacts',
      title: 'Impacts and Considerations of Director Removal',
      content: 'The removal of a director has several consequential impacts:\n\n• End of Directorial Responsibilities: The removed director ceases involvement in company management.\n\n• Revocation of Authority: The director loses any power to act or represent the company.\n\n• Potential Legal Ramifications: Non-compliance with legal protocols can lead to legal challenges.\n\n• Impact on Company Reputation: Removing a director can affect the company\'s public image, necessitating discreet management of the process.'
    },
    {
      id: 'filing-amendments',
      title: 'Filing Amendments Under Various Acts',
      content: 'Post-removal, the company may need to file amendments under several acts to update official records, including:\n\n• Goods and Services Tax Act\n\n• Shops and Establishment Act\n\n• Factories Act\n\n• Foreign Exchange Management Act\n\n• Employee Provident Fund (EPF)\n\n• Employee\'s State Insurance (ESI)\n\n• Other relevant labour laws'
    },
    {
      id: 'why-choose',
      title: 'Why Choose OnEasy for Director Removal?',
      content: 'Choosing OnEasy for director removal offers numerous benefits:\n\n• Expertise and Experience: Our team is well-versed in corporate law and the specific procedures of the Companies Act 2013.\n\n• Compliance Assurance: We ensure every step of the director removal process complies with statutory regulations, minimizing legal risks.\n\n• End-to-End Support: From initial consultation to final submission of necessary forms like DIR-12, we provide comprehensive support throughout the process.\n\n• Customized Solutions: We offer tailored advice for your company\'s unique circumstances and objectives.\n\nBy choosing OnEasy, you ensure that the director removal process is executed smoothly, compliantly, and professionally, respecting the interests of all parties involved.'
    }
  ];

  const faqs = [
    {
      question: 'What is the process for removing a director from a company?',
      answer: 'The process typically involves issuing a special notice, allowing the director the right to be heard, holding a general meeting to pass a resolution, and filing Form DIR-12 with the Registrar of Companies.'
    },
    {
      question: 'Can a director resign voluntarily?',
      answer: 'Yes, a director can resign voluntarily by submitting a written notice to the company. The resignation becomes effective upon receipt by the company or on a specified future date.'
    },
    {
      question: 'What are the reasons for removing a director?',
      answer: 'Common reasons include poor performance, non-compliance with legal requirements, absence from board meetings, or actions detrimental to the company\'s interests.'
    },
    {
      question: 'How much notice is required to remove a director?',
      answer: 'A special notice must be given to the director at least 14 days before the resolution to remove them is put to vote.'
    },
    {
      question: 'What rights does a director have during the removal process?',
      answer: 'The director has the right to be heard, which includes submitting a written representation to the shareholders and presenting their case during the meeting.'
    },
    {
      question: 'What forms need to be filed after removing a director?',
      answer: 'Form DIR-12 must be filed with the Registrar of Companies to document the removal of the director, along with any necessary supporting documents.'
    },
    {
      question: 'What happens if the company fails to file Form DIR-12 on time?',
      answer: 'Delayed submission of Form DIR-12 can result in penalties, which increase with the duration of the delay.'
    },
    {
      question: 'Can a director who has been removed be reappointed?',
      answer: 'No, once a director is removed from their position, they are not eligible for reappointment to the board.'
    },
    {
      question: 'What impact does removing a director have on the company?',
      answer: 'The removal of a director can affect the company\'s management, decision-making processes, and potentially its public image. It must be handled with care to mitigate any negative impacts.'
    },
    {
      question: 'Can a director be removed by shareholders without a valid reason?',
      answer: 'Yes, shareholders can remove a director through a vote at a general meeting, even if there is no specific reason, as long as the Companies Act provisions conduct the removal.'
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
                console.log('Initiating payment for Director Removal:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'director-removal');
                localStorage.setItem('selectedRegistrationTitle', 'Director Removal');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/director-removal-form');
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
            introTitle="About Director Removal"
            introDescription="Company directors oversee the management and operations of a business, while shareholders hold ownership of the company. Situations may arise where shareholders decide to remove a director due to inadequate performance or other concerns, or a director may choose to resign."
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

export default DirectorRemovalDetails;

