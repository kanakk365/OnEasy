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

function ObjectsClauseChangeDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('objects-clause-change');

  const processSteps = [
    {
      step: 1,
      title: 'Board Meeting and Resolution',
      description: 'Convene a meeting to discuss the change. Pass a Board resolution to approve the alteration and call a general shareholders meeting.'
    },
    {
      step: 2,
      title: 'Notice for General Meeting',
      description: 'Issue a notice to all shareholders, informing them of the general meeting to pass a special resolution. The notice should clearly state the purpose and details of the proposed alteration.'
    },
    {
      step: 3,
      title: 'Passing of Special Resolution',
      description: 'Conduct the general meeting and pass a special resolution with at least 75% shareholder approval for altering the objects clause.'
    },
    {
      step: 4,
      title: 'Filing with Registrar of Companies (ROC)',
      description: 'File Form MGT-14 with the ROC within 30 days of passing the resolution. Attach the special resolution and updated Memorandum of Association (MOA).'
    },
    {
      step: 5,
      title: 'Regulatory Approvals (if applicable)',
      description: 'If the company is regulated by a specific authority (e.g., SEBI, RBI), secure the required permissions before proceeding.'
    },
    {
      step: 6,
      title: 'ROC Review and Approval',
      description: 'The ROC will review the filed documents and, upon approval, officially register the altered objects clause.'
    },
    {
      step: 7,
      title: 'Update MOA',
      description: 'Once approved, update the MOA to reflect the new objects clause and communicate the change to relevant stakeholders, if necessary.'
    }
  ];

  const documents = [
    'New Business Objects',
    'Ancillary Objects: If any',
    'Certified Copy of Special Resolution',
    'Explanatory Statement',
    'EGM Notice',
    'Form MGT-14'
  ];

  const prerequisites = [
    {
      title: 'Clear and Specific Objectives',
      description: 'The new objects should be clear, specific, and well-defined, ensuring they align with the company\'s vision and business purpose.'
    },
    {
      title: 'Legal Validity of Objectives',
      description: 'All proposed objects must be legal and comply with applicable laws. Unlawful or unethical objectives cannot be added to the Memorandum of Association (MOA).'
    },
    {
      title: 'Board Approval',
      description: 'Obtain approval from the Board of Directors by passing a resolution that authorises the alteration of the objects clause and calls for a shareholders\' meeting to approve the change.'
    },
    {
      title: 'Special Resolution in General Meeting',
      description: 'Conduct a general meeting with the shareholders and pass a special resolution to approve the object clause change. This resolution requires at least 75% of the shareholders\' votes in favour.'
    },
    {
      title: 'Filing with Registrar of Companies (ROC)',
      description: 'After passing the special resolution, file Form MGT-14 with the ROC within 30 days, along with a copy of the resolution and the updated MOA.'
    },
    {
      title: 'Approval from Regulatory Authorities (if applicable)',
      description: 'If the company is governed by specific regulatory bodies (such as SEBI, RBI, or IRDA), secure prior approval before proceeding with the alteration.'
    },
    {
      title: 'Updated Memorandum of Association (MOA)',
      description: 'Ensure that the MOA reflects the new objects clause, keeping it up-to-date and compliant with statutory requirements.'
    },
    {
      title: 'Communication with Stakeholders',
      description: 'If necessary, inform key stakeholders, including investors, lenders, and significant business partners, about the change to ensure transparency.'
    }
  ];

  const aboutSections = [
    {
      id: 'objects-clause-intro',
      title: 'About Objects Clause Amendment',
      content: 'Expanding or modifying your company\'s business activities requires a formal change in the Objects Clause of your Memorandum of Association (MOA). This critical update ensures your company operates within legal boundaries while pursuing new business opportunities.\n\nOur expert team simplifies the entire Objects Clause modification process for you, from drafting the new clause to obtaining shareholder approval and regulatory clearances. You can rest assured that we\'ll handle the legal complexities, allowing you to focus on your business growth.\n\nWhether you\'re diversifying business operations, adding new ventures, or restructuring existing activities, we simplify the legal complexities of Objects Clause modification. Our professional support helps you focus on business growth while we handle the compliance requirements.'
    },
    {
      id: 'what-is-moa',
      title: 'What is the Memorandum of Association (MOA)?',
      content: 'Altering the objects clause of a Private Limited Company involves updating the Memorandum of Association (MOA) section that defines the company\'s purpose and business activities. This change requires careful planning, clear, transparent legal objectives, and approval from the Board of Directors and shareholders through a special resolution. Once approved, the company must file the resolution with the Registrar of Companies (ROC) using Form MGT-14 and any necessary regulatory approvals if governed by specific authorities. Updating the objects clause allows the company to expand or redirect its business activities while complying with legal requirements.'
    },
    {
      id: 'understanding-amendment',
      title: 'Understanding MOA Amendment',
      content: 'An MOA Amendment refers to the process of modifying provisions in the MOA. As per Section 13 of The Companies Act 2013 and the Company Rules Act, this amendment is permissible under specific conditions. Changes are often necessary as a company evolves to reflect adjustments in its objectives, operations, or governance structure.'
    },
    {
      id: 'when-can-amend',
      title: 'When Can an MOA Be Amended?',
      content: 'The MOA can be amended in various circumstances:\n\n• Expansion into New Sectors: When the company plans to enter new industries or business areas beyond its existing objectives.\n\n• Change in Business Focus: Realign the company\'s objectives with a revised business strategy or shift in core focus.\n\n• Adding New Activities: The company wishes to add new activities or services that are not part of the original objects clause.\n\n• Regulatory Compliance: To ensure the company\'s objectives comply with evolving regulatory standards or industry requirements.\n\n• Mergers or Acquisitions: When merging with or acquiring another business, an update is required to reflect the expanded activities or services.'
    },
    {
      id: 'procedure',
      title: 'Procedure for MOA Amendment',
      content: 'Amending the objects Clause involves a structured legal process outlined by The Companies Act. Here\'s a breakdown of the steps:\n\n1. Board Meeting and Resolution: Convene a meeting to discuss the change. Pass a Board resolution to approve the alteration and call a general shareholders meeting.\n\n2. Notice for General Meeting: Issue a notice to all shareholders, informing them of the general meeting to pass a special resolution. The notice should clearly state the purpose and details of the proposed alteration.\n\n3. Passing of Special Resolution: Conduct the general meeting and pass a special resolution with at least 75% shareholder approval for altering the objects clause.\n\n4. Filing with Registrar of Companies (ROC): File Form MGT-14 with the ROC within 30 days of passing the resolution. Attach the special resolution and updated Memorandum of Association (MOA).\n\n5. Regulatory Approvals (if applicable): If the company is regulated by a specific authority (e.g., SEBI, RBI), secure the required permissions before proceeding.\n\n6. ROC Review and Approval: The ROC will review the filed documents and, upon approval, officially register the altered objects clause.\n\n7. Update MOA: Once approved, update the MOA to reflect the new objects clause and communicate the change to relevant stakeholders, if necessary.'
    },
    {
      id: 'critical-considerations',
      title: 'Critical Considerations for Objects Clause Amendments',
      content: '• Strategic Market Analysis & Growth Potential: Understanding market opportunities and growth trajectory involves a comprehensive analysis of market demand, competition, and potential returns for new business activities. This analysis forms the foundation for determining whether the object clause change aligns with long-term business goals and market opportunities.\n\n• Financial & Resource Requirements: Assessing capital needs and resource allocation includes detailed evaluation of required infrastructure, technology, workforce, and working capital investments for new ventures. Includes analysis of funding sources, ROI projections, and impact on existing business finances.\n\n• Operational Feasibility & Integration: Evaluating implementation capability and business integration involves assessment of the company\'s ability to execute new business activities, including infrastructure readiness, skilled workforce availability, and integration with existing operations. Focuses on practical aspects of implementing the proposed changes.\n\n• Compliance & Risk Assessment: Understanding the regulatory landscape and risk factors includes analysis of industry-specific regulations, required licenses, permits, and potential risks in new business areas. Includes evaluation of compliance costs and risk mitigation strategies for new ventures.\n\n• Stakeholder Impact & Management: Managing relationships and expectations involves evaluation of how the change affects shareholders, employees, customers, and business partners. Includes communication strategy and management of stakeholder expectations throughout the transition.'
    },
    {
      id: 'adopting-new-moa',
      title: 'Adopting a New MOA',
      content: 'Companies formed before the Companies Act 2013 may need to adopt a new MOA to comply with contemporary legal frameworks.'
    },
    {
      id: 'why-choose',
      title: 'Streamline Your Objects Clause Amendment Process with OnEasy',
      content: 'At OnEasy, we simplify the Objects Clause amendment process. Our team of experts ensures your amendments are handled efficiently, from drafting resolutions to filing necessary documents with the Registrar of Companies.\n\nContact us today to begin your Objects Clause amendment journey!'
    }
  ];

  const faqs = [
    {
      question: 'What is an objects clause?',
      answer: 'The objects clause defines the primary purpose and scope of a company\'s activities as stated in its Memorandum of Association (MOA).'
    },
    {
      question: 'Why alter the objects clause?',
      answer: 'Companies alter the objects clause to expand, diversify, or refocus business activities legally.'
    },
    {
      question: 'Who approves the alteration of the objects clause?',
      answer: 'The Board of Directors and shareholders must approve the alteration, with a special resolution passed by at least 75% of shareholders.'
    },
    {
      question: 'What form is filed for objects clause alteration?',
      answer: 'Form MGT-14 must be filed with the Registrar of Companies (ROC) and supporting documents.'
    },
    {
      question: 'Is ROC approval required for the change?',
      answer: 'Yes, the ROC reviews and approves the alteration after the special resolution is filed.'
    },
    {
      question: 'Are regulatory approvals needed?',
      answer: 'Regulatory approval may be required if specific authorities like SEBI or RBI govern the company.'
    },
    {
      question: 'How long does the alteration process take?',
      answer: 'The process can take a few weeks, depending on ROC review and, if applicable, regulatory approvals.'
    },
    {
      question: 'What are the costs involved in altering the objects clause?',
      answer: 'Costs vary by region, including ROC, legal, and possible regulatory expenses.'
    },
    {
      question: 'Can the objects clause be altered multiple times?',
      answer: 'Yes, but each alteration requires board and shareholder approval and compliance with legal procedures.'
    },
    {
      question: 'How does an alteration affect the MOA?',
      answer: 'The MOA must be updated to reflect the new objects clause, ensuring all records are current and compliant.'
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
                console.log('Initiating payment for Objects Clause Change:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'objects-clause-change');
                localStorage.setItem('selectedRegistrationTitle', 'Change In Objects Clause');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/objects-clause-change-form');
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
            introTitle="About Objects Clause Amendment"
            introDescription="Expanding or modifying your company's business activities requires a formal change in the Objects Clause of your Memorandum of Association (MOA). This critical update ensures your company operates within legal boundaries while pursuing new business opportunities."
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

export default ObjectsClauseChangeDetails;

