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

function NameChangeCompanyDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('name-change-company');

  const processSteps = [
    {
      step: 1,
      title: 'Board Resolution',
      description: 'Hold a board meeting to decide on the name change and authorize a Director or Company Secretary (CS) to verify the new name\'s availability with the Ministry of Corporate Affairs (MCA). An Extraordinary General Meeting (EGM) will be scheduled to pass a special resolution.'
    },
    {
      step: 2,
      title: 'Checking Name Availability',
      description: 'Use the MCA\'s RUN (Reserve Unique Name) facility to check if the desired company name is available. After verification, the RoC will confirm its availability.'
    },
    {
      step: 3,
      title: 'Passing a Special Resolution',
      description: 'An EGM is convened, and the shareholders vote on the special resolution to change the company name. After the resolution is passed, the company files the necessary documents with the RoC for approval.'
    },
    {
      step: 4,
      title: 'Filing with RoC',
      description: 'File Form MGT-14 within 30 days of passing the special resolution, followed by Form INC-24 for final name change approval.'
    },
    {
      step: 5,
      title: 'Issuance of New Certificate of Incorporation',
      description: 'After the RoC approves the name change, a new Certificate of Incorporation is issued, officially completing the process.'
    },
    {
      step: 6,
      title: 'Post-Name Change Compliances',
      description: 'Update MOA and AOA, company seals and letterheads, bank accounts, PAN, TAN, statutory registers, website, social media, and business licenses to reflect the new company name.'
    }
  ];

  const documents = [
    'Certificate of Incorporation',
    'Updated MOA and AOA',
    'Digital Signature of the authorized director',
    'Proof of registered business address',
    'List of shareholders and directors'
  ];

  const prerequisites = [
    {
      title: 'Board Resolution',
      description: 'A resolution must be passed by the board of directors approving the name change.'
    },
    {
      title: 'Availability of New Name',
      description: 'Ensure the proposed new name is available and complies with the Ministry of Corporate Affairs (MCA) guidelines.'
    },
    {
      title: 'Shareholder Approval',
      description: 'Obtain approval from shareholders, typically through a special resolution in a general meeting.'
    },
    {
      title: 'Filing of Necessary Forms',
      description: 'Prepare and submit Form INC-1 (for name availability) and Form MGT-14 (for filing the special resolution) to the MCA.'
    },
    {
      title: 'Updated Memorandum and Articles of Association',
      description: 'Amend the Memorandum of Association (MOA) and Articles of Association (AOA) to reflect the new name.'
    },
    {
      title: 'Payment of Fees',
      description: 'Pay any applicable fees associated with the name change process.'
    }
  ];

  const aboutSections = [
    {
      id: 'name-change-intro',
      title: 'About Name Change',
      content: 'In today\'s competitive business environment, a company\'s name represents more than just an identifier; it is a crucial element of its brand identity and corporate culture. A well-thought-out name can shape customer perceptions and significantly influence market presence, leaving a lasting impression on all stakeholders. However, there may come a time when changing a company\'s name becomes necessary. This could happen for various reasons, and while it\'s a strategic decision, it should be undertaken with careful planning and adherence to legal protocols. In India, changing a company\'s name is governed by the Companies Act, 2013. This article will explain the company name change procedure, its importance, and the legal framework involved.\n\nAre you planning to change your company name? OnEasy offers expert assistance and smooth execution of the name change process, ensuring compliance with legal regulations and a seamless transition.\n\nReach out to OnEasy today and take the first step towards redefining your company\'s identity!'
    },
    {
      id: 'company-name-change',
      title: 'Company Name Change',
      content: 'Under the Companies Act 2013, a company can change its name by passing a special resolution in a general meeting, subject to approval by the Registrar of Companies (RoC) and the Central Government. Changing the company name does not create a new legal entity; the same company continues under a different name. This change will not affect:\n\n• The company\'s rights or obligations.\n\n• Any legal proceedings involving or against the company.'
    },
    {
      id: 'legal-provisions',
      title: 'Legal Provisions for Changing a Company\'s Name',
      content: 'According to Section 13(2) of the Companies Act 2013, a company may change its name by passing a special resolution and securing the Central Government\'s approval (delegated to the Registrar of Companies).\n\nSection 4(2) of the Companies Act 2013 prohibits companies from using a name that is identical or too similar to an existing company\'s name, violates the law, or is deemed undesirable by the Central Government (See Rule 8 of Companies (Incorporation) Rules, 2014 for further details).\n\nSection 4(3) of the Companies Act 2013 stipulates that certain words or expressions require prior approval from the Central Government before being included in a company\'s name to avoid giving the impression of a government association.\n\nRestrictions on Name Changes (Rules 29(1) and 29(2) of Companies (Incorporation) Rules, 2014):\n\n• Rule 29(1): Companies that have defaulted in filing documents with the Registrar or have failed to repay deposits or debentures are not permitted to change their names.\n\n• Rule 29(2): A name change application must be filed using Form INC-24 and the applicable fee. Once approved, the Registrar issues a new Certificate of Incorporation in Form INC-25, reflecting the updated name.'
    },
    {
      id: 'when-can-change',
      title: 'When Can a Company Change Its Name?',
      content: 'There are several reasons why a company might decide to change its name, including:\n\n• Transition from Private to Public: When a private limited company goes public, its name may need to be changed as part of the restructuring process.\n\n• Transition from Public to Private: A public company may become a private limited company, which may also involve a name change.\n\n• Voluntary Name Change: A company may voluntarily opt for a name change for strategic reasons, subject to meeting all legal requirements.\n\n• Adaptation to New Business Activities: When a company modifies its business operations, it may change its name to reflect its new direction better.\n\n• Marketing and Rebranding: Companies may change their names as part of a rebranding effort to enhance market positioning or align with current trends.\n\n• Change of Ownership: New ownership often leads to a name change to reflect the new management\'s vision.\n\n• Intellectual Property Considerations: A name change may be needed to strengthen trademark protection or avoid potential conflicts.\n\n• Compliance with RoC Orders: The RoC may require a company to change its name if it conflicts with an existing company\'s name or trademark.\n\n• Leveraging Popularity: A company may change its name to capitalise on the popularity of a specific product or service.'
    },
    {
      id: 'timeline',
      title: 'Timeline for Changing a Company Name',
      content: 'The process generally takes 10 to 15 working days, depending on approval from various regulatory bodies.'
    },
    {
      id: 'procedure',
      title: 'Procedure for Changing a Company Name',
      content: '1. Board Resolution: Hold a board meeting to decide on the name change and authorize a Director or Company Secretary (CS) to verify the new name\'s availability with the Ministry of Corporate Affairs (MCA). An Extraordinary General Meeting (EGM) will be scheduled to pass a special resolution.\n\n2. Checking Name Availability: Use the MCA\'s RUN (Reserve Unique Name) facility to check if the desired company name is available. After verification, the RoC will confirm its availability.\n\n3. Passing a Special Resolution: An EGM is convened, and the shareholders vote on the special resolution to change the company name. After the resolution is passed, the company files the necessary documents with the RoC for approval.\n\n4. Filing with RoC: File Form MGT-14 within 30 days of passing the special resolution, followed by Form INC-24 for final name change approval.\n\n5. Issuance of New Certificate of Incorporation: After the RoC approves the name change, a new Certificate of Incorporation is issued, officially completing the process.\n\nEssential Post-Name Change Compliances:\n\nUpdate the following to reflect the new company name:\n\n• MOA and AOA\n\n• Company seals and letterheads\n\n• Bank accounts, PAN, TAN, and statutory registers\n\n• Website, social media, and business licenses'
    },
    {
      id: 'why-choose',
      title: 'OnEasy: Your Reliable Partner for Company Name Changes',
      content: 'Ready to change your company name? OnEasy guides you through the process, ensuring legal compliance at every step. Our experienced team simplifies complex procedures, providing a smooth and hassle-free transition.\n\nContact OnEasy today to begin your company\'s name-change journey!'
    }
  ];

  const faqs = [
    {
      question: 'What are the primary reasons for changing a company\'s name?',
      answer: 'Companies change names for various reasons, such as rebranding, change in ownership, business restructuring, legal or compliance issues, or to better reflect their business activities and market positioning.'
    },
    {
      question: 'Does changing a company\'s name affect its legal identity?',
      answer: 'No, changing the name does not create a new legal entity. The company remains the same, with all its rights and obligations intact, and any ongoing legal proceedings continue under the new name.'
    },
    {
      question: 'What is the process for changing a company\'s name in India?',
      answer: 'The process involves passing a special resolution in a general meeting, applying for name approval through the MCA\'s RUN (Reserve Unique Name) service, filing the necessary forms (MGT-14 and INC-24), and obtaining a new Certificate of Incorporation from the Registrar of Companies (RoC).'
    },
    {
      question: 'How long does it take to change a company\'s name?',
      answer: 'The name change process typically takes 10 to 15 working days, depending on how quickly the approvals are granted by the RoC and other regulatory bodies.'
    },
    {
      question: 'Can any company change its name, or are there restrictions?',
      answer: 'A company that has defaulted on filing its statutory documents or failed to repay deposits or debentures can only change its name once these defaults are rectified.'
    },
    {
      question: 'Do we need to update our Memorandum and Articles of Association after a name change?',
      answer: 'Yes, you need to update the Memorandum of Association (MOA) and Articles of Association (AOA) to reflect the company\'s new name and file these updates with the RoC.'
    },
    {
      question: 'Is it necessary to obtain approval from shareholders for a name change?',
      answer: 'For the name change to be valid, a special resolution must be passed in a general meeting with the approval of at least 75% of the shareholders.'
    },
    {
      question: 'Should I notify third parties, such as banks and suppliers, about the name change?',
      answer: 'Yes, it is important to inform banks, suppliers, customers, and other business partners about the name change. All official documents, licenses, and registrations should also be updated.'
    },
    {
      question: 'Will the name change affect the company\'s PAN, TAN, and other statutory registrations?',
      answer: 'The company\'s PAN and TAN will remain the same, but you must update the records with the relevant authorities to reflect the new name.'
    },
    {
      question: 'Can I use any name for my company, or are there restrictions?',
      answer: 'The new company name must be unique, not identical or similar to an existing company\'s name. It should also not violate trademarks or be considered undesirable by the RoC or the Central Government. Approval must be obtained through the RUN service.'
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
                console.log('Initiating payment for Name Change - Company:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'name-change-company');
                localStorage.setItem('selectedRegistrationTitle', 'Name Change - Company');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/name-change-company-form');
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
            introTitle="About Name Change"
            introDescription="In today's competitive business environment, a company's name represents more than just an identifier; it is a crucial element of its brand identity and corporate culture. A well-thought-out name can shape customer perceptions and significantly influence market presence."
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

export default NameChangeCompanyDetails;

