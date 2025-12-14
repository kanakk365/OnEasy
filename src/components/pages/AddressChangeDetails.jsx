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

function AddressChangeDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('address-change');

  const processSteps = [
    {
      step: 1,
      title: 'Board Meeting and Approval',
      description: 'Convene a board meeting to pass a resolution approving the change of registered office address.'
    },
    {
      step: 2,
      title: 'Shareholder Approval (if required)',
      description: 'For moves to different cities or states, obtain shareholder approval through a special resolution in a General Meeting.'
    },
    {
      step: 3,
      title: 'ROC Filing',
      description: 'File Form INC-22 with the ROC within 15 days, including board resolution, address proof, and supporting documents.'
    },
    {
      step: 4,
      title: 'Update Records',
      description: 'Update the registered office address in all company documents, letterheads, signboards, and notify stakeholders.'
    }
  ];

  const documents = [
    'Utility Bill of the new premises',
    'Rental Agreement of the new premises',
    'NOC of the new premises',
    'Building Photos of the new premises',
    'Consent Letter'
  ];

  const prerequisites = [
    {
      title: 'Board Approval',
      description: 'Secure approval from the board of directors.'
    },
    {
      title: 'Review Articles',
      description: 'Check the Articles of Association for relevant provisions.'
    },
    {
      title: 'Legal Compliance',
      description: 'Ensure compliance with local laws regarding address changes.'
    },
    {
      title: 'Verify New Address',
      description: 'Confirm that the new address meets legal requirements.'
    },
    {
      title: 'File Documents',
      description: 'Submit necessary forms to the relevant authorities.'
    },
    {
      title: 'Update Records',
      description: 'Revise internal records and official documents.'
    },
    {
      title: 'Notify Stakeholders',
      description: 'Inform shareholders, creditors, and service providers.'
    },
    {
      title: 'Update Signage',
      description: 'Change physical signage and branding to the new address.'
    }
  ];

  const aboutSections = [
    {
      id: 'address-change-intro',
      title: 'About Registered Office Change',
      content: 'A company\'s registered office is its official address, registered with the Registrar of Companies (ROC), where all formal communications are sent. Listing this address in key company documents such as the Memorandum of Association (MOA) and Articles of Association (AOA) is mandatory. Sometimes, a company may need to change its registered office due to business expansion, better location, or cost management. The Companies Act 2013 provides specific guidelines for this process, including board meetings, shareholder approvals, and ROC filings, depending on whether the relocation is within the same city, across cities, or to another state.\n\nFor businesses seeking a smooth transition of their registered office, OnEasy offers expert support to ensure compliance with all legal requirements.\n\nReady to streamline the process of changing your company\'s registered office? Consult OnEasy\'s experts today for hassle-free, compliant solutions!'
    },
    {
      id: 'what-is-registered-office',
      title: 'What is a Company\'s Registered Office?',
      content: 'A company\'s registered office refers to the official address registered with the ROC in the jurisdiction where the company is incorporated. This is where formal communications, legal documents, and official notices are sent. As per legal requirements, companies must maintain a registered office disclosed in foundational documents like the MOA and AOA.'
    },
    {
      id: 'why-change',
      title: 'Why Change a Registered Office?',
      content: 'Companies may need to change their registered office for various reasons, including:\n\n• Better Location: To move closer to clients, suppliers, or better transportation links.\n\n• Growth and Expansion: After a merger or acquisition or to accommodate an expanding team.\n\n• Cost Efficiency: To save money on rent, taxes, or operational expenses.\n\n• Market Access: To tap into new markets or be closer to a specific customer base.\n\n• Compliance: To meet legal or regulatory requirements.\n\n• Corporate Image: To enhance the brand image by moving to a more prestigious area.'
    },
    {
      id: 'types-of-changes',
      title: 'Types of Registered Office Changes',
      content: 'Depending on a company\'s needs, it may relocate within the same city, across cities, or to another state. The procedural requirements differ based on the nature of the move. Here are the four most common scenarios for changing a company\'s registered office:\n\n• Within the Same City, Town, or Village\n\n• From One City to Another Within the Same ROC Jurisdiction\n\n• From One ROC Jurisdiction to Another Within the Same State\n\n• From One State to Another'
    },
    {
      id: 'procedure-same-city',
      title: 'Procedure for Change of Registered Office Within the Same City',
      content: 'When relocating within the same city, town, or village, the company must follow these steps to ensure compliance:\n\n• Board Meeting: Convene a meeting of the Board of Directors to pass a resolution approving the change and authorize officials to handle the legal process.\n\n• ROC Filing: File Form INC-22 with the ROC within 15 days, including the board resolution, address proof, utility bill, and lease or ownership documents.\n\n• Update Records: Once approved, update the registered office address in all company documents, including letterheads, signboards, and banners.'
    },
    {
      id: 'procedure-different-city',
      title: 'Procedure for Changing Registered Office to Another City Within the Same ROC Jurisdiction',
      content: 'When a company moves its registered office to a different city within the same ROC jurisdiction, additional steps are required:\n\n• Board Meeting and Shareholder Approval: The Board must pass a resolution, and shareholders must approve the change through a special resolution in a General Meeting.\n\n• ROC Filings: Submit Form MGT-14 and INC-22, along with supporting documents such as the special resolution and address proof.\n\n• Update Records: Once approved, update the company\'s registered office address in all relevant documents.'
    },
    {
      id: 'procedure-different-roc',
      title: 'Moving a Registered Office Between ROC Jurisdictions Within the Same State',
      content: 'Relocating across different ROC jurisdictions in the same state requires more formalities, including:\n\n• Board Meeting and General Meeting: Pass resolutions in both Board and General Meetings.\n\n• State Government Notification: Inform the state government about the proposed change.\n\n• Regional Director Approval: Apply to the Regional Director for approval and submit necessary documents, including resolutions and address proofs.\n\n• Final ROC Filings: File Forms INC-28 and INC-22 with the ROC.'
    },
    {
      id: 'procedure-different-state',
      title: 'Moving a Registered Office to Another State',
      content: 'Relocating from one state to another involves a more detailed procedure:\n\n• Board Meeting and General Meeting: Obtain approvals to alter the MOA and shift the registered office.\n\n• Creditor and Debenture Holder Notices: Notify and seek consent from creditors and debenture holders.\n\n• Regional Director Application: Apply to the Regional Director, including supporting documents.\n\n• ROC Filings: After receiving the Regional Director\'s approval, file Forms INC-28 and INC-22 with the ROC.'
    },
    {
      id: 'why-oneasy',
      title: 'Why Choose OnEasy for Registered Office Change Compliance?',
      content: 'OnEasy is your trusted partner for managing the registered office change process, offering a seamless and efficient approach. Our expertise ensures that all necessary legal formalities are handled, avoiding delays and complications. With a dedicated team guiding you through each step—from documentation to ROC filings—OnEasy allows you to focus on your business while we handle the compliance.'
    }
  ];

  const faqs = [
    {
      question: 'What is a registered office of a company?',
      answer: 'The registered office is a company\'s official address, where all formal communications, notices, and legal documents from government authorities are sent.'
    },
    {
      question: 'Why would a company need to change its registered office?',
      answer: 'A company may change its registered office for various reasons, such as expansion, cost management, better market access, improved location, or to meet compliance needs.'
    },
    {
      question: 'What is the procedure to change the registered office within the same city?',
      answer: 'A board resolution must be passed, and Form INC-22 must be filed with the Registrar of Companies (ROC) within 15 days. Necessary address proofs and other documents must also be submitted.'
    },
    {
      question: 'How does changing the registered office to a different city within the same state work?',
      answer: 'The company must pass a board resolution, get shareholder approval, file Forms MGT-14 and INC-22, and submit the required documents to the ROC.'
    },
    {
      question: 'Can a company change its registered office from one state to another?',
      answer: 'Yes, moving a registered office from one state to another involves altering the Memorandum of Association (MOA), obtaining approval from shareholders, creditors, and the Regional Director, and filing with the ROC.'
    },
    {
      question: 'What documents are required to change the registered office?',
      answer: 'The required documents typically include a board resolution, special resolution (if needed), address proof (lease agreement, utility bills), no-objection certificate (NOC) from the owner, and ROC forms.'
    },
    {
      question: 'What is the time limit for informing the ROC after changing the registered office?',
      answer: 'The company must inform the ROC within 15 days of the board resolution or the approval of the change, depending on the type of move, by filing Form INC-22.'
    },
    {
      question: 'Is shareholder approval necessary for every registered office change?',
      answer: 'Shareholder approval is only required when the registered office is being moved to a different city, ROC jurisdiction, or state.'
    },
    {
      question: 'Does the change of a registered office affect the company\'s tax jurisdiction?',
      answer: 'If the company moves to a different state, it may need to update its tax registration, such as GST, with the new address and state jurisdiction.'
    },
    {
      question: 'How long does the registered office change process take to complete?',
      answer: 'The timeline varies depending on the complexity of the move. A move within the same city usually takes a few weeks, while interstate moves involving the Regional Director can take a few months.'
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
                console.log('Initiating payment for Address Change:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'address-change');
                localStorage.setItem('selectedRegistrationTitle', 'Address Change (Registered Office Change)');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/address-change-form');
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
            introTitle="About Registered Office Change"
            introDescription="A company's registered office is its official address, registered with the Registrar of Companies (ROC), where all formal communications are sent. Sometimes, a company may need to change its registered office due to business expansion, better location, or cost management."
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

export default AddressChangeDetails;

