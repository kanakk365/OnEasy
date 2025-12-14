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

function DINDeactivationDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('din-deactivation');

  const processSteps = [
    {
      step: 1,
      title: 'Clearance of Dues',
      description: 'Ensure any outstanding dues or obligations related to the directorship are cleared before the director\'s exit to maintain financial compliance.'
    },
    {
      step: 2,
      title: 'Board Approval',
      description: 'The company\'s board must pass a formal resolution approving the director\'s resignation or removal. This is essential for documenting the decision in official records.'
    },
    {
      step: 3,
      title: 'Filing of Required Returns',
      description: 'Complete all necessary filings, such as annual returns or compliance documents, to maintain accurate and up-to-date records with the authorities.'
    },
    {
      step: 4,
      title: 'Submission of Forms',
      description: 'Submit Form DIR-11 (for the director\'s resignation) and Form DIR-12 (for updating the company\'s records regarding the directorship changes) to the Ministry of Corporate Affairs (MCA).'
    },
    {
      step: 5,
      title: 'DIN Deactivation',
      description: 'Once all documentation is submitted and verified, the MCA will process the deactivation of the DIN, ensuring that the director\'s identification number is invalidated for the specific directorship.'
    }
  ];

  const documents = [
    'PAN of the Director',
    'Aadhar of the director',
    'Letter of Deactivation request',
    'Digital Signature',
    'Board Resolution'
  ];

  const prerequisites = [
    {
      title: 'Clearance of Dues',
      description: 'Any outstanding dues or obligations related to the directorship should be cleared before the director\'s exit to ensure that the company is financially compliant.'
    },
    {
      title: 'Board Approval',
      description: 'The company\'s board must pass a formal resolution approving the director\'s resignation or removal. This is essential for documenting the decision in official records.'
    },
    {
      title: 'Filing of Required Returns',
      description: 'All necessary filings, such as annual returns or compliance documents, must be completed to maintain accurate and up-to-date records with the authorities.'
    }
  ];

  const aboutSections = [
    {
      id: 'din-deactivation-intro',
      title: 'About DIN Deactivation',
      content: 'DIN Deactivation is crucial for ensuring corporate governance integrity in India. It involves removing a Director\'s Identification Number when a director resigns, is terminated, or fails to comply with legal obligations. This action safeguards against unauthorized use and maintains accurate company records. Proper procedures and documentation are essential for a smooth deactivation process.\n\nIf you need any assistance regarding DIN deactivation, feel free to contact OnEasy. We\'ll ensure a smooth and hassle-free process.'
    },
    {
      id: 'overview-of-din',
      title: 'Overview of DIN',
      content: 'The Directors Identification Number (DIN) is a critical element of corporate governance in India. Introduced by the Ministry of Corporate Affairs (MCA) in 2006, the DIN serves as a unique identifier for individuals taking directorship roles in companies. This system ensures proper identification of directors and enhances transparency and accountability within the corporate environment. The DIN builds trust and integrity in corporate operations by maintaining a centralised database.'
    },
    {
      id: 'importance',
      title: 'Importance of DIN Deactivation',
      content: 'Deactivating a DIN is a vital procedure that is necessary under specific conditions to maintain the integrity of corporate governance. Here are the main reasons why a DIN may need to be deactivated:\n\n• Resignation or Termination: When a director resigns or is removed, deactivating their DIN ensures that no unauthorized actions are taken in their name and that the company\'s records remain accurate.\n\n• Non-compliance: Directors must comply with various legal requirements. If they fail to do so, their DIN may be deactivated, ensuring only compliant individuals retain their directorial positions.\n\n• Fraudulent Activities: If a director is involved in fraud or unethical behaviour, deactivating their DIN helps protect the company from further risks and ensures that the person cannot misuse their powers.\n\n• Change of Status: When a director transitions to a different role, such as an employee or consultant, deactivating their DIN ensures that corporate records are updated and responsibilities are clearly defined.'
    },
    {
      id: 'advantages',
      title: 'Advantages of DIN Deactivation',
      content: 'Deactivating a DIN offers several key benefits:\n\n• Regulatory Compliance: By deactivating DINs when needed, companies ensure adherence to legal standards and help maintain compliance with corporate laws.\n\n• Limitation of Liability: Deactivation protects the outgoing director from being held responsible for the company\'s actions after their resignation.\n\n• Transparency in Records: Ensuring that records are accurate and up-to-date improves transparency and strengthens stakeholder trust in the company\'s governance practices.'
    },
    {
      id: 'disadvantages',
      title: 'Disadvantages of DIN Deactivation',
      content: 'Despite the benefits, there are a few challenges associated with DIN deactivation:\n\n• Loss of Authority: Once deactivated, the individual can only serve as a director in a company once their DIN is reactivated, which may limit future opportunities.\n\n• Reactivation Complications: The reactivation process can be time-consuming and involves additional procedures, which may delay future engagements.\n\n• Reputational Impact: Deactivation of a DIN might lead to questions about the individual\'s professional conduct, potentially affecting their reputation and career prospects.'
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: 'DIN deactivation is a vital step in maintaining a robust corporate governance structure. It ensures regulatory compliance, protects the interests of directors, and helps maintain transparency within the corporate environment. Companies can efficiently manage this process by adhering to proper documentation and legal procedures.\n\nFor personalised support with DIN deactivation or related matters, OnEasy will guide you through every step, ensuring compliance and clarity in corporate governance.'
    }
  ];

  const faqs = [
    {
      question: 'What is DIN deactivation?',
      answer: 'DIN deactivation refers to invalidating a Director Identification Number (DIN), a unique identifier for directors in India, when they resign, are removed, or become disqualified.'
    },
    {
      question: 'When should a DIN be deactivated?',
      answer: 'A DIN should be deactivated when a director resigns, is removed from the company, fails to comply with regulatory requirements, or is involved in fraudulent activities.'
    },
    {
      question: 'Who is responsible for initiating the DIN deactivation process?',
      answer: 'Once a director resigns or is removed, the company is responsible for initiating the deactivation by submitting necessary filings and forms to the Ministry of Corporate Affairs (MCA).'
    },
    {
      question: 'What forms are required for DIN deactivation?',
      answer: 'The primary forms needed are Form DIR-11 (for the director\'s resignation) and Form DIR-12 (for updating the company\'s records regarding the directorship changes).'
    },
    {
      question: 'Can a DIN be reactivated after deactivation?',
      answer: 'Yes, a DIN can be reactivated by following the appropriate procedures with the MCA, provided the director fulfils all regulatory requirements.'
    },
    {
      question: 'What are the consequences of not deactivating a DIN after a director\'s resignation?',
      answer: 'Failure to deactivate a DIN could result in the director being held liable for the company\'s activities even after their resignation and could affect the company\'s regulatory compliance.'
    },
    {
      question: 'Is there a fee for deactivating a DIN?',
      answer: 'While the MCA does not charge a specific fee for DIN deactivation, fees may apply for filing certain forms, such as DIR-11 and DIR-12.'
    },
    {
      question: 'Can a DIN be deactivated due to non-compliance?',
      answer: 'If a director fails to comply with statutory requirements, their DIN may be deactivated as a penalty for non-compliance.'
    },
    {
      question: 'What happens if a director holds multiple directorships?',
      answer: 'The DIN is only deactivated partially if a director resigns from one company but continues with others. Deactivation only applies to the specific directorship from which the director has resigned.'
    },
    {
      question: 'How long does it take to complete the DIN deactivation process?',
      answer: 'The time frame for DIN deactivation depends on completing the required filings and document submission. Once all documentation is in order, it can typically take a few days to process.'
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
                console.log('Initiating payment for DIN Deactivation:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'din-deactivation');
                localStorage.setItem('selectedRegistrationTitle', 'DIN Deactivation');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/din-deactivation-form');
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
            introTitle="About DIN Deactivation"
            introDescription="DIN Deactivation is crucial for ensuring corporate governance integrity in India. It involves removing a Director's Identification Number when a director resigns, is terminated, or fails to comply with legal obligations."
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

export default DINDeactivationDetails;

