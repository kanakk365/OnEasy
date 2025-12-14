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

function IncreaseShareCapitalDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('increase-share-capital');

  const processSteps = [
    {
      step: 1,
      title: 'Board Meeting and Approval',
      description: 'The process begins with a board meeting, during which the directors discuss the necessity and implications of increasing the authorised share capital. Board approval is documented in a formal resolution.'
    },
    {
      step: 2,
      title: 'Drafting the Resolution',
      description: 'A draft resolution outlining the proposed increase in authorised share capital is prepared. This document includes details such as the new total capital and the number of additional shares to be issued.'
    },
    {
      step: 3,
      title: 'Shareholder Notification and Meeting',
      description: 'Shareholders are notified of the proposed changes and are invited to a general meeting where the resolution will be presented. The notice period for this meeting should comply with the company\'s articles of association and legal requirements.'
    },
    {
      step: 4,
      title: 'Shareholder Approval',
      description: 'The resolution is discussed at the meeting, and shareholders have the opportunity to ask questions and express their views. For it to pass, it typically requires approval from the majority of shareholders present or represented by proxy.'
    },
    {
      step: 5,
      title: 'Amendment of Articles of Association',
      description: 'If approved, the company\'s articles of association are amended to reflect the new authorised share capital. This step may require drafting new articles or amending the relevant clauses.'
    },
    {
      step: 6,
      title: 'Regulatory Filings',
      description: 'The resolution and any amended articles are then submitted to the relevant regulatory body, such as the Registrar of Companies, along with required documents and stipulated fees. This step ensures that the changes are legally recognised.'
    },
    {
      step: 7,
      title: 'Updating Company Records',
      description: 'Finally, the company updates its internal records, including the share register, to reflect the increased authorised share capital and any newly issued shares. All documentation associated with this process must be accurately maintained for compliance and reference.'
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
      description: 'Gain the board of directors\' approval by presenting a clear rationale that aligns with the company\'s strategic goals, highlighting the impact on financial health and shareholder value.'
    },
    {
      title: 'Shareholder Agreement',
      description: 'Obtain support from the majority of shareholders at a general meeting, ensuring transparency by proposing a resolution that details the changes to the capital structure.'
    },
    {
      title: 'Review of Articles of Association',
      description: 'Check the company\'s articles of association to ensure they allow for capital changes; modify them if needed to stay compliant with internal and legal guidelines.'
    },
    {
      title: 'Regulatory Compliance',
      description: 'To ensure the adjustments are legally valid and recognized, complete and submit the necessary paperwork to regulatory bodies and pay any required fees.'
    },
    {
      title: 'Financial Evaluation and Planning',
      description: 'Conduct a detailed financial assessment to confirm that the capital changes will support the company\'s growth strategy, ensuring future financial and economic stability and reduced risk.'
    }
  ];

  const aboutSections = [
    {
      id: 'increase-capital-intro',
      title: 'About Increase in Share Capital',
      content: 'Increasing a company\'s authorised share capital allows it to issue more shares than initially permitted, providing the flexibility to raise additional funds when necessary. This strategic move can support expansion plans, enhance financial stability, and attract investors by offering more shares. It also allows for future growth and investment opportunities, making your company more attractive to potential investors and partners.\n\nHowever, it involves amending the company\'s articles of association and gaining approval from shareholders and regulatory bodies to ensure compliance with legal requirements. Keep in mind that over-dilution of shares can affect existing shareholders\' equity.'
    },
    {
      id: 'what-is-moa',
      title: 'What is the Memorandum of Association (MOA)?',
      content: 'The MOA is a vital document created during the company registration process and is of significant legal importance. It outlines the company\'s objectives, operational limits, and internal regulations, forming a framework for operations and defining the relationship with shareholders. Essentially, it delineates the company\'s scope and legal parameters.'
    },
    {
      id: 'understanding-amendment',
      title: 'Understanding MOA Amendment',
      content: 'An MOA Amendment refers to the process of modifying provisions in the MOA. As per Section 13 of The Companies Act 2013 and the Company Rules Act, this amendment is permissible under specific conditions. Changes are often necessary as a company evolves to reflect adjustments in its objectives, operations, or governance structure.'
    },
    {
      id: 'when-can-amend',
      title: 'When Can an MOA Be Amended?',
      content: 'The MOA contains several essential clauses:\n\n• Name Clause: Identifies the company\'s official name.\n\n• Situation Clause: Specifies the registered office location.\n\n• Object Clause: Describes the company\'s purposes and activities.\n\n• Liability Clause: States the liability of members, whether limited by shares or guarantees.\n\n• Capital Clause: Details the authorized capital, including types and number of shares.\n\n• Subscription Clause: Includes the signatures of the initial subscribers.\n\nAmendments can be made to all clauses except the Subscription Clause.'
    },
    {
      id: 'key-amendments',
      title: 'Key Amendments to the MOA',
      content: '• Changing the Company Name: This requires a special resolution, and government approval may be necessary based on the company\'s type.\n\n• Registered Office Change: Moving the registered office to a different state requires a special resolution and board approval. It must be filed with the relevant Registrars.\n\n• Altering the Object Clause: For public companies, changing the object clause requires a special resolution, public notice, and the ability of dissenting shareholders to exit.\n\n• Liability Clause Changes: To limit Directors\' liability, a resolution must be passed and filed with the registrar within 30 days.\n\n• Capital Clause Alteration: This can occur in a general meeting and must be filed within 30 days. Changes may include subdivision or consolidation of shares.\n\n• Authorized Capital Adjustments: If a company wishes to issue new shares, its authorised capital must be adequate, necessitating an amendment to the MOA.'
    },
    {
      id: 'procedure',
      title: 'Procedure for MOA Amendment',
      content: 'Increasing the authorised share capital involves structured steps to ensure compliance with legal and corporate governance standards. Below is a process that companies typically follow:\n\n1. Board Meeting and Approval: The process begins with a board meeting, during which the directors discuss the necessity and implications of increasing the authorised share capital. Board approval is documented in a formal resolution.\n\n2. Drafting the Resolution: A draft resolution outlining the proposed increase in authorised share capital is prepared. This document includes details such as the new total capital and the number of additional shares to be issued.\n\n3. Shareholder Notification and Meeting: Shareholders are notified of the proposed changes and are invited to a general meeting where the resolution will be presented. The notice period for this meeting should comply with the company\'s articles of association and legal requirements.\n\n4. Shareholder Approval: The resolution is discussed at the meeting, and shareholders have the opportunity to ask questions and express their views. Their approval is a key part of the process, as it ensures that the proposed changes have the support of the company\'s owners. Shareholders discuss the resolution at the general meeting. For it to pass, it typically requires approval from the majority of shareholders present or represented by proxy.\n\n5. Amendment of Articles of Association: If approved, the company\'s articles of association are amended to reflect the new authorised share capital. This step may require drafting new articles or amending the relevant clauses.\n\n6. Regulatory Filings: The resolution and any amended articles are then submitted to the relevant regulatory body, such as the Registrar of Companies, along with required documents and stipulated fees. This step ensures that the changes are legally recognised.\n\n7. Updating Company Records: Finally, the company updates its internal records, including the share register, to reflect the increased authorised share capital and any newly issued shares. All documentation associated with this process must be accurately maintained for compliance and reference.'
    },
    {
      id: 'critical-considerations',
      title: 'Critical Considerations for MOA Amendments',
      content: 'When contemplating an increase in the authorised share capital, companies must evaluate various crucial factors to ensure that the decision aligns with strategic objectives and compliance standards. Below are some key considerations:\n\n• Strategic Objectives: Clearly define the purpose of raising the authorised share capital. This could involve financing expansion projects, entering new markets, enhancing liquidity, or securing financial stability. Ensure that the increase aligns with the company\'s long-term strategic goals.\n\n• Impact on Existing Shareholders: Consider the potential dilution of current shareholders\' equity and voting power. It\'s essential to communicate transparently with existing shareholders about how the changes might affect their stakes in the company.\n\n• Regulatory and Legal Compliance: Ensure adherence to all legal requirements and corporate governance standards, including necessary amendments to the company\'s articles of association and filing obligations with regulatory bodies.\n\n• Financial Considerations: Assess the company\'s financial health and capacity to manage an increase in share capital. Undertake a comprehensive economic analysis to determine how the additional funds will be utilized.\n\n• Market Conditions: Evaluate the current market conditions and the valuation of the company\'s shares to determine if it is the optimal time to issue more shares. Market dynamics can significantly influence the success of the capital increase.\n\n• Investor Relations: Develop a robust investor relations strategy to attract potential investors. Clearly articulate the benefits of the increased share capital and how it will contribute to the company\'s future success.\n\nBy carefully assessing these factors, companies can make informed decisions about increasing their authorised share capital, ensuring that the process supports their growth initiatives while maintaining shareholder trust and regulatory compliance.'
    },
    {
      id: 'adopting-new-moa',
      title: 'Adopting a New MOA',
      content: 'Companies formed before the Companies Act 2013 may need to adopt a new MOA to comply with contemporary legal frameworks.'
    },
    {
      id: 'why-choose',
      title: 'Streamline Your MOA Amendment Process with OnEasy',
      content: 'At OnEasy, we simplify the MOA amendment process. Our team of experts ensures your amendments are handled efficiently, from drafting resolutions to filing necessary documents with the Registrar of Companies.\n\nContact us today to begin your MOA amendment journey!'
    }
  ];

  const faqs = [
    {
      question: 'What is authorised share capital?',
      answer: 'Authorised share capital is the maximum amount of capital a company can raise through issuing shares as authorised in its articles of association.'
    },
    {
      question: 'Why might a company decide to increase its authorised share capital?',
      answer: 'A company may increase its authorised share capital to raise additional funds for expansion projects, improve liquidity, enter new markets, or enhance its financial stability.'
    },
    {
      question: 'What are the primary steps involved in increasing authorised share capital?',
      answer: 'This process generally includes board approval, drafting a resolution, notifying shareholders, obtaining shareholder approval, amending the articles of association, and completing necessary regulatory filings.'
    },
    {
      question: 'How does increasing authorised share capital affect existing shareholders?',
      answer: 'It can dilute existing shareholders\' equity and voting power, which is why transparent communication about the changes is essential.'
    },
    {
      question: 'What legal requirements must be met to increase authorised share capital?',
      answer: 'Companies must comply with amendments to articles of association, adhere to corporate governance standards, and fulfil filing obligations with relevant regulatory agencies.'
    },
    {
      question: 'How long does the process of increasing authorised share capital typically take?',
      answer: 'The duration can vary depending on the complexity of the process, regulatory requirements, and the speed of obtaining necessary approvals.'
    },
    {
      question: 'Can increasing authorised share capital impact a company\'s stock price?',
      answer: 'Yes, depending on market conditions and investor perceptions, changes in authorised share capital can affect the company\'s stock valuation.'
    },
    {
      question: 'What role do shareholders play in the decision to increase authorised share capital?',
      answer: 'Shareholders typically must approve any increase through a vote in a general meeting, as it involves amending the company\'s articles of association.'
    },
    {
      question: 'Are there any risks associated with increasing authorised share capital?',
      answer: 'Risks include potential over-dilution of shares, regulatory compliance challenges, and possible negative impacts on share price and investor confidence if not appropriately managed.'
    },
    {
      question: 'What should a company communicate to its investors about increasing authorised share capital?',
      answer: 'Companies should clearly articulate the purpose of the capital increase, how the funds will be used, and the expected benefits to maintain transparency and investor confidence.'
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
                console.log('Initiating payment for Increase in Share Capital:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'increase-share-capital');
                localStorage.setItem('selectedRegistrationTitle', 'Increase in Share Capital');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/increase-share-capital-form');
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
            introTitle="About Increase in Share Capital"
            introDescription="Increasing a company's authorised share capital allows it to issue more shares than initially permitted, providing the flexibility to raise additional funds when necessary. This strategic move can support expansion plans, enhance financial stability, and attract investors by offering more shares."
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

export default IncreaseShareCapitalDetails;

