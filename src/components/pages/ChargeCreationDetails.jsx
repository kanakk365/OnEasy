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

function ChargeCreationDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('charge-creation');

  const processSteps = [
    {
      step: 1,
      title: 'Board Approval',
      description: 'Obtain a formal resolution from the board of directors to authorize the creation of the charge.'
    },
    {
      step: 2,
      title: 'Document Preparation',
      description: 'Prepare the loan agreement, charge instrument, and all required identification and valuation documents.'
    },
    {
      step: 3,
      title: 'Charge Registration',
      description: 'Register the charge with the Registrar of Companies (ROC) within the specified timeframe to ensure legal validity.'
    },
    {
      step: 4,
      title: 'Compliance and Updates',
      description: 'Ensure all compliance requirements are met and update company records to reflect the charge creation.'
    }
  ];

  const documents = [
    'Loan Agreement',
    'Board Resolution',
    'Charge Instrument',
    'Registration Forms',
    'Identification Documents (If Any)',
    'Valuation Reports (If Any)'
  ];

  const prerequisites = [
    {
      title: 'Board Approval',
      description: 'A formal resolution from the board of directors is required to authorise the creation of the charge.'
    },
    {
      title: 'Existence of Debt',
      description: 'There must be a clear debt or obligation that the charge is securing.'
    },
    {
      title: 'Deciding on Charge Type',
      description: 'Based on the asset type and terms agreed with the lender, choose whether the charge will be fixed or floating.'
    },
    {
      title: 'Legal Compliance',
      description: 'Ensure compliance with local laws governing charge creation to validate its enforceability.'
    },
    {
      title: 'Asset Identification',
      description: 'Identify the charged assets and valuations to avoid disputes.'
    }
  ];

  const aboutSections = [
    {
      id: 'charge-creation-intro',
      title: 'About Charge Creation',
      content: 'Charge Creation refers to establishing a legal claim on a company\'s assets to secure loans or obligations. By implementing a charge, businesses can access vital capital while providing lenders assurance and a priority claim in the event of default. Charges may be categorized as fixed, linked to specific assets, or floating, encompassing a pool of assets. This process not only enhances the financial credibility of the organization but can also result in more favourable borrowing terms. A thorough understanding of charge creation, which we aim to provide, is crucial for effective debt management and sustainable business growth.'
    },
    {
      id: 'what-is-charge',
      title: 'What is Charge Creation?',
      content: 'Charge creation is a critical financial tool that helps businesses secure loans by establishing a legal claim over their assets. It acts as a safety measure for lenders—when a business borrows money, it can offer its assets as collateral. This legal claim, known as a "charge," assures lenders that they have priority over the assets in case the borrower defaults on the loan. Charges can be classified as fixed or floating based on the type of assets and terms of the agreement.'
    },
    {
      id: 'why-create-charge',
      title: 'Why is a Charge Created?',
      content: 'Charges are more than just legal formalities; they play a vital role in a business\'s financial ecosystem. Here\'s why companies create charges:\n\n• To Secure Financing: Companies often require capital for expansion, operations, or unforeseen expenses. Creating a charge allows them to offer their assets as collateral to lenders.\n\n• Reducing Lender Risk: A secured loan poses less risk to lenders compared to unsecured loans, often leading to more favorable terms like lower interest rates.\n\n• Supporting Growth: Access to secured loans enables companies to seize growth opportunities, whether expanding operations, launching new products, or entering new markets.\n\n• Building Financial Credibility: Properly managing secured debts can enhance a company\'s credit rating, showing solid financial responsibility.'
    },
    {
      id: 'types-of-charges',
      title: 'Types of Charges',
      content: 'It\'s essential to understand the different types of charges when going through the charge creation process:\n\n• Fixed Charge: This charge is tied to specific assets, such as property, equipment, or machinery. The borrower cannot sell or dispose of these assets without the lender\'s consent, providing high security to lenders.\n\n• Floating Charge: This charge covers a fluctuating pool of assets like inventory or receivables. The company can use these assets in day-to-day operations, but if it defaults, the charge becomes "crystallised" and turns into a fixed charge over the existing assets.\n\n• Specific Charge: This focuses on particular assets, giving lenders clear rights over those specific items.\n\n• General Charge: Covering multiple assets or categories, this type of charge offers companies some flexibility in managing assets, often associated with floating charges.'
    },
    {
      id: 'advantages',
      title: 'Advantages of Charge Creation',
      content: 'Creating a charge offers various advantages that can positively impact a company\'s financial health:\n\n• Access to Funds: Companies can secure the financing needed for operational or strategic needs by using assets as collateral.\n\n• Lower Interest Rates: Secured loans often come with lower interest rates than unsecured loans, as they pose less risk to lenders.\n\n• Priority in Case of Bankruptcy: In liquidation, secured creditors have priority over unsecured creditors, increasing their chances of recovering loans.\n\n• Operational Flexibility: Floating charges allow companies to use their assets while securing financing, providing operational freedom.'
    },
    {
      id: 'disadvantages',
      title: 'Disadvantages of Charge Creation',
      content: 'While charge creation has its advantages, there are some drawbacks to consider:\n\n• Risk of Losing Assets: If the company defaults on the loan, it risks losing the charged assets, which may impact its operations.\n\n• Complex Legal Processes: Creating a charge can be complex and may require legal expertise to draft documents and meet compliance requirements.\n\n• Costs: Legal fees, filing fees, and other costs associated with creating and registering the charge can add up.\n\n• Restrictions on Operations: Depending on the terms, some charges may restrict the company\'s ability to operate or take on additional loans, potentially limiting growth.\n\n• Public Information: Registered charges are publicly available, which could affect the company\'s reputation or future financing opportunities.'
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: 'Charge creation is essential for businesses to secure loans and manage debt efficiently. By understanding the types of charges, necessary steps, and documentation involved, companies can effectively use this mechanism to fuel growth while minimizing risks. To ensure smooth charge creation and compliance, it\'s advisable to consult with legal and financial experts. This protects the company\'s interests and fosters a culture of responsible economic management.\n\nAt OnEasy, we simplify the charge creation process and offer expert guidance to ensure your business remains compliant while securing the financing it needs to thrive. Contact us to learn how we can assist with your charge creation needs!'
    }
  ];

  const faqs = [
    {
      question: 'What is charge creation in business finance?',
      answer: 'Charge creation is a legal process where a company offers its assets as collateral to secure a loan. It ensures that the lender has a legal claim on those assets if the borrower defaults.'
    },
    {
      question: 'What types of charges can a company create?',
      answer: 'A company can create two main charges: a fixed charge on specific assets like property or equipment and a floating charge on assets that may change, like inventory or receivables.'
    },
    {
      question: 'What is the difference between a fixed and a floating charge?',
      answer: 'A fixed charge is tied to specific, identifiable assets that the company cannot sell or transfer without the lender\'s approval. A floating charge covers assets fluctuating in value or quantity, such as stock or receivables, which the company can use daily.'
    },
    {
      question: 'Why do companies create charges?',
      answer: 'Companies create charges to secure loans or credit from lenders by offering assets as collateral. This reduces the lender\'s risk and can result in more favourable loan terms, like lower interest rates.'
    },
    {
      question: 'What are the prerequisites for creating a charge?',
      answer: 'The main prerequisites include board approval, an explicit loan agreement, identification of assets to be charged, and ensuring compliance with applicable legal regulations.'
    },
    {
      question: 'How is a charge registered?',
      answer: 'After creating a charge, companies must register it with relevant authorities, such as the Registrar of Companies, within a specified period. Failure to register can make the charge invalid and unenforceable.'
    },
    {
      question: 'What documents are required for charge creation?',
      answer: 'Key documents include the loan agreement, board resolution approving the charge, a charging instrument (detailing the terms), identification documents of authorized signatories, and valuation reports for the charged assets.'
    },
    {
      question: 'What are the benefits of creating a charge?',
      answer: 'Charge creation allows businesses to access secured loans, often with lower interest rates. It also enhances the company\'s credibility and provides lenders with a legal claim on assets, reducing their risk.'
    },
    {
      question: 'What happens if a company defaults on a loan with a charge?',
      answer: 'If a company defaults on a loan, the lender can enforce the charge and claim the secured assets to recover the loan amount. In the case of a floating charge, the assets become crystallized, turning into a fixed charge.'
    },
    {
      question: 'Is it mandatory to register a charge?',
      answer: 'Yes, registering a charge is crucial for its legal validity. Unregistered charges may not hold up in court, and lenders may lose their priority claim over the assets.'
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
                console.log('Initiating payment for Charge Creation:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'charge-creation');
                localStorage.setItem('selectedRegistrationTitle', 'Charge Creation');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/charge-creation-form');
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
            introTitle="About Charge Creation"
            introDescription="Charge Creation refers to establishing a legal claim on a company's assets to secure loans or obligations. By implementing a charge, businesses can access vital capital while providing lenders assurance and a priority claim in the event of default."
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

export default ChargeCreationDetails;

