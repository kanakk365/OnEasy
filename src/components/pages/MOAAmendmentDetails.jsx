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

function MOAAmendmentDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('moa-amendment');

  const processSteps = [
    {
      step: 1,
      title: 'Board Approval',
      description: 'Draft a board resolution outlining the intent to amend the MOA and obtain board approval.'
    },
    {
      step: 2,
      title: 'Draft Special Resolution',
      description: 'Prepare a comprehensive special resolution that includes all details of the proposed changes while ensuring compliance with the Companies Act.'
    },
    {
      step: 3,
      title: 'Notice of General Meeting',
      description: 'Issue a formal notice to all members for an Extraordinary General Meeting (EGM), adhering to the statutory notice period.'
    },
    {
      step: 4,
      title: 'Conduct the EGM',
      description: 'Present proposed amendments for discussion and ensure transparent voting on the special resolution, requiring at least three-fourths approval.'
    },
    {
      step: 5,
      title: 'Regulatory Compliance and Filings',
      description: 'File Form MGT-14 and supporting documents with the Registrar of Companies within the stipulated time, along with payment of applicable fees.'
    },
    {
      step: 6,
      title: 'Registrar\'s Approval and Finalization',
      description: 'Wait for the RoC to review and approve the amendments, after which the changes take effect.'
    },
    {
      step: 7,
      title: 'Update Company Records',
      description: 'Revise all internal documents, update the MOA, and notify stakeholders about the changes.'
    }
  ];

  const documents = [
    'Revised MOA',
    'Certified Copy of Special Resolution',
    'Explanatory Statement',
    'EGM Notice',
    'Form MGT-14'
  ];

  const prerequisites = [
    {
      title: 'Board Approval',
      description: 'A resolution must be passed by the board of directors approving the proposed amendment to the MOA.'
    },
    {
      title: 'Shareholder Approval',
      description: 'The amendment typically requires approval from the shareholders in a general meeting, often through a special resolution.'
    },
    {
      title: 'Notice of Meeting',
      description: 'Adequate notice must be given to all shareholders regarding the meeting where the amendment will be discussed.'
    },
    {
      title: 'Drafting the Amendment',
      description: 'The specific changes to the MOA should be clearly drafted, outlining the proposed modifications.'
    },
    {
      title: 'Filing of Relevant Forms',
      description: 'Necessary forms, such as Form MGT-14 (for filing the resolution) and possibly Form INC-27 (for certain types of amendments), must be submitted to the Ministry of Corporate Affairs (MCA).'
    },
    {
      title: 'Payment of Fees',
      description: 'Applicable fees for the amendment must be paid as per the MCA guidelines.'
    },
    {
      title: 'Compliance with Legal Requirements',
      description: 'Ensure that the proposed amendments comply with the Companies Act and any other relevant laws or regulations.'
    }
  ];

  const aboutSections = [
    {
      id: 'moa-amendment-intro',
      title: 'About MOA Amendment',
      content: 'Companies often need to amend their Memorandum of Association (MOA) periodically to align with changes in their operational, structural, or strategic goals. The MOA serves as the foundational legal document that defines a company\'s scope, objectives, and operational boundaries.\n\nAt OnEasy, we recognize the importance of MOA amendments and offer expert guidance to navigate this complex process. Our team ensures compliance with regulatory requirements and simplifies the intricacies of MOA clauses for you.'
    },
    {
      id: 'what-is-moa',
      title: 'What is the Memorandum of Association (MOA)?',
      content: 'The MOA is a vital document created during the company registration process, holding significant legal importance. It outlines the company\'s objectives, operational limits, and internal regulations, forming a framework for operations and defining the relationship with shareholders. Essentially, it delineates the company\'s scope and legal parameters.'
    },
    {
      id: 'understanding-amendment',
      title: 'Understanding MOA Amendment',
      content: 'An MOA Amendment refers to the process of modifying provisions in the MOA. As per Section 13 of The Companies Act, 2013, along with the Company Rules Act, this amendment is permissible under specific conditions. Changes are often necessary as a company evolves to reflect adjustments in its objectives, operations, or governance structure.'
    },
    {
      id: 'when-can-amend',
      title: 'When can an MOA be amended?',
      content: 'The MOA contains several essential clauses:\n\n• Name Clause: Identifies the company\'s official name.\n\n• Situation Clause: Specifies the registered office location.\n\n• Object Clause: Describes the company\'s purposes and activities.\n\n• Liability Clause: States the liability of members, whether limited by shares or guarantees.\n\n• Capital Clause: Details the authorized capital, including types and number of shares.\n\n• Subscription Clause: Includes the signatures of the initial subscribers.\n\nAmendments can be made to all clauses except the Subscription Clause.'
    },
    {
      id: 'key-amendments',
      title: 'Key Amendments to the MOA',
      content: '• Changing the Company Name: Requires a special resolution; government approval may be necessary based on the company\'s type.\n\n• Registered Office Change: Moving the registered office to a different state requires a special resolution and board approval. It must be filed with the relevant Registrars.\n\n• Altering the Object Clause: For public companies, changing the object clause requires a special resolution, public notice, and allowing dissenting shareholders to exit.\n\n• Liability Clause Changes: Limiting the liability of Directors requires passing a resolution and filing it with the registrar within 30 days.\n\n• Capital Clause Alteration: This can occur in a general meeting and must be filed within 30 days. Changes may include subdivision or consolidation of shares.\n\n• Authorized Capital Adjustments: If a company wishes to issue new shares, its authorized capital must be adequate, necessitating an amendment to the MOA.'
    },
    {
      id: 'procedure',
      title: 'Procedure for MOA Amendment',
      content: 'Amending the MOA involves a structured legal process outlined by The Companies Act. Here\'s a breakdown of the steps:\n\n1. Prepare for the Amendment: Draft a board resolution that outlines the intent to amend the MOA and obtain board approval.\n\n2. Draft the Special Resolution: Include comprehensive details of the proposed changes while ensuring compliance with the Companies Act.\n\n3. Notice of General Meeting: Issue a formal notice to all members, adhering to the statutory notice period.\n\n4. Conduct the EGM: Present proposed amendments for discussion and ensure transparent voting on the special resolution.\n\n5. Regulatory Compliance and Filings: File Form MGT-14 and supporting documents with the Registrar of Companies within the stipulated time.\n\n6. Registrar\'s Approval and Finalization: Wait for the RoC to review and approve the amendments, after which the changes take effect.\n\n7. Update Company Records: Revise all internal documents and notify stakeholders about the MOA changes.'
    },
    {
      id: 'key-considerations',
      title: 'Key Considerations for MOA Amendments',
      content: '• Capital Clause Alterations: Must align with the Articles of Association.\n\n• Liability Clause Changes: Require timely filing with the registrar post-approval.\n\n• Registered Office Clause: Proof of the new address must be submitted within 30 days.\n\n• Restrictions for Companies Limited by Guarantee: Amendments cannot extend profit-sharing to non-members.'
    },
    {
      id: 'adopting-new-moa',
      title: 'Adopting a New MOA',
      content: 'Companies formed before the Companies Act, 2013 may need to adopt a new MOA to comply with contemporary legal frameworks.'
    },
    {
      id: 'why-choose',
      title: 'Streamline Your MOA Amendment Process with OnEasy',
      content: 'At OnEasy, we simplify the MOA amendment process. Our team of experts ensures your amendments are handled efficiently, from drafting resolutions to filing necessary documents with the Registrar of Companies.\n\nContact us today to begin your MOA amendment journey!'
    }
  ];

  const faqs = [
    {
      question: 'What is an MOA Amendment?',
      answer: 'An MOA Amendment refers to the formal process of altering the provisions of a company\'s Memorandum of Association, which is a foundational document outlining the company\'s objectives, scope, and operational boundaries.'
    },
    {
      question: 'Why would a company need to amend its MOA?',
      answer: 'Companies may need to amend their MOA to reflect changes in their objectives, business activities, registered office location, or to comply with new regulations or business strategies.'
    },
    {
      question: 'What clauses in the MOA can be amended?',
      answer: 'Typically, amendments can be made to the Name Clause, Situation Clause, Object Clause, Liability Clause, and Capital Clause, but the Subscription Clause cannot be altered.'
    },
    {
      question: 'What is the process for amending the MOA?',
      answer: 'The process generally involves drafting a board resolution, obtaining approval from shareholders during an Extraordinary General Meeting (EGM), filing the necessary documents with the Registrar of Companies (RoC), and paying any applicable fees.'
    },
    {
      question: 'What documents are required for an MOA amendment?',
      answer: 'Essential documents include the revised MOA, a certified copy of the special resolution passed at the EGM, an explanatory statement, a notice of the EGM, and Form MGT-14 for submission to the RoC.'
    },
    {
      question: 'How long does it take to amend the MOA?',
      answer: 'The timeframe for amending the MOA can vary depending on the complexity of the changes and the processing time of the Registrar of Companies, but it typically takes a few weeks to complete the entire process.'
    },
    {
      question: 'Is it necessary to conduct an EGM for MOA amendments?',
      answer: 'Yes, an Extraordinary General Meeting (EGM) is required to pass a special resolution for MOA amendments, as per the provisions of the Companies Act.'
    },
    {
      question: 'What is a special resolution, and how is it passed?',
      answer: 'A special resolution is a resolution that requires approval from at least three-fourths of the shareholders present and voting at the EGM. It must be clearly stated in the meeting notice and discussed before the vote.'
    },
    {
      question: 'What are the consequences of not amending the MOA when required?',
      answer: 'Failing to amend the MOA when necessary can result in non-compliance with legal regulations, leading to penalties, legal disputes, or restrictions on the company\'s operations.'
    },
    {
      question: 'Can a company amend its MOA without legal assistance?',
      answer: 'While it is possible for a company to initiate an MOA amendment without legal assistance, it is highly recommended to seek expert guidance to ensure compliance with legal requirements and to avoid any potential pitfalls during the process.'
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
                console.log('Initiating payment for MOA Amendment:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'moa-amendment');
                localStorage.setItem('selectedRegistrationTitle', 'MOA Amendment');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/moa-amendment-form');
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
            introTitle="About MOA Amendment"
            introDescription="Companies often need to amend their Memorandum of Association (MOA) periodically to align with changes in their operational, structural, or strategic goals. The MOA serves as the foundational legal document that defines a company's scope, objectives, and operational boundaries."
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

export default MOAAmendmentDetails;

