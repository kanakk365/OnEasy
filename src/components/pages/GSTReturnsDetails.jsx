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

function GSTReturnsDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('gst-returns');

  const processSteps = [
    {
      step: 1,
      title: 'Data Collection',
      description: 'Gather all sales and purchase invoices, credit/debit notes, and supporting documents.'
    },
    {
      step: 2,
      title: 'Data Preparation',
      description: 'Organize and prepare GST return data, ensuring accuracy and completeness.'
    },
    {
      step: 3,
      title: 'Return Filing',
      description: 'File GSTR-1, GSTR-3B, and other applicable returns on the GST portal before deadlines.'
    }
  ];

  const documents = [
    'GSTIN Certificate & Business PAN',
    'Business Bank Account Details',
    'GST Portal Login Credentials',
    'Sales & Purchase Invoices',
    'Credit/Debit Notes',
    'Export/Import Documentation',
    'E-way Bills',
    'Bank Statements & Payment Receipts',
    'Reconciliation Statements'
  ];

  const prerequisites = [
    {
      title: 'GST Registration Requirement',
      description: 'Any business or individual registered under the GST framework must file GST returns. This requirement applies to entities with an annual aggregate turnover exceeding the threshold set by the tax authorities, which may vary for different taxpayer categories, including standard taxpayers and those opting for the composition scheme.'
    }
  ];

  const aboutSections = [
    {
      id: 'gst-returns-intro',
      title: 'About GST Returns',
      content: 'In India, every organization registered under GST is required to file GST returns according to their business operations—be it monthly, quarterly, or annually. While this obligation may seem overwhelming, our team of GST professionals at OnEasy simplifies the process, making it easier for you to navigate through the necessary requirements. It\'s crucial for taxpayers to meet the specified deadlines for their GST submissions, as these returns are essential for the government to assess the nation\'s tax responsibilities.\n\nFile Your GST Returns with OnEasy Today!'
    },
    {
      id: 'what-is-gst-return',
      title: 'What is a GST Return?',
      content: 'A GST return is a comprehensive statement capturing all financial transactions of a GST-registered individual or entity, detailing both revenues and expenditures. Each holder of a GSTIN is mandated to submit this return to the tax authorities, enabling them to accurately determine net tax liability.\n\nKey components of GST returns include:\n\n• Purchases: Detailed records of purchases made by the taxpayer.\n\n• Sales: Comprehensive logs of sales activities.\n\n• Output GST (On Sales): Information on GST charged on sales.\n\n• Input Tax Credit (GST Paid on Purchases): GST paid on purchases that can be deducted from the GST owed on sales.\n\nFor those needing assistance with GST return filing or managing compliance, OnEasy offers dedicated GST services to streamline the process.'
    },
    {
      id: 'types-of-gst-returns',
      title: 'Types of GST Returns',
      content: 'The Goods and Services Tax (GST) system comprises 13 types of returns, each catering to specific aspects of a taxpayer\'s financial dealings. Not all taxpayers are required to file every return; the specific filings depend on the taxpayer\'s category and details of their GST registration.\n\nHere\'s a brief overview of the 13 GST returns:\n\n• GSTR-1: Details of outward supplies (sales).\n\n• GSTR-3B: Summary of sales and purchases, including tax payments.\n\n• GSTR-4: For Composition Scheme taxpayers, summarizing turnover and tax.\n\n• GSTR-5: For non-resident taxpayers conducting taxable transactions in India.\n\n• GSTR-5A: For providers of online database services.\n\n• GSTR-6: For Input Service Distributors detailing ITC distribution.\n\n• GSTR-7: For entities required to deduct TDS under GST.\n\n• GSTR-8: For e-commerce operators reporting platform transactions.\n\n• GSTR-9: Annual comprehensive return summarizing all filings.\n\n• GSTR-10: Final return upon cancellation of GST registration.\n\n• GSTR-11: For Unique Identity Number holders claiming refunds.\n\n• CMP-08: Quarterly statement for Composition Scheme taxpayers.\n\n• ITC-04: For manufacturers declaring goods sent to and received from job workers.\n\nIn addition, there are statements for input tax credits:\n\n• GSTR-2A: Dynamic return for inward supplies.\n\n• GSTR-2B: Static snapshot of inward supplies based on previous filings.\n\nFor small taxpayers in the Quarterly Return Monthly Payment (QRMP) scheme, the Invoice Furnishing Facility (IFF) allows B2B sales declarations in the first two months of a quarter, with tax payments required monthly using Form PMT-06.'
    },
    {
      id: 'filing-deadlines',
      title: 'Filing Deadlines and Penalties',
      content: 'Late filing of GST returns can lead to penalties and interest charges. It\'s essential for businesses to submit on time to avoid these costs. Key points include:\n\n• All registered taxpayers must file returns regularly, even with no business activity.\n\n• Late filings result in delayed subsequent filings.\n\n• Penalties for late submissions include Rs. 100 per day for each CGST and SGST, with a maximum of Rs. 5,000.'
    },
    {
      id: 'how-to-file',
      title: 'How to File GST Returns with OnEasy',
      content: 'As a leading business service platform in India, OnEasy offers comprehensive GST services, having assisted thousands of business owners with GST registration and return filing.\n\nOutsource Your GST Compliance to OnEasy\n\nRelieve yourself of the compliance burden by outsourcing your GST requirements to OnEasy. Our dedicated GST advisors will guide you through every step of the filing process, ensuring a smooth and efficient experience.\n\nBenefits of Choosing OnEasy for GST Returns:\n\n• A knowledgeable relationship manager will assist you throughout the process, ensuring timely filing and addressing specific needs, like invoice uploads.\n\n• We send reminders well before deadlines to help you avoid penalties.\n\n• Receive updates on your GST return filing status from your advisor.\n\n• Your returns are prepared with our comprehensive system, ensuring accuracy and timely submission.\n\n• All financial transactions and invoices are recorded seamlessly, enabling hassle-free filing of ITR, TDS, and GST.\n\nEnsure Compliance with OnEasy\n\nContact our experts today to experience seamless filing with dedicated assistance at every stage! With OnEasy, your business can remain compliant and avoid penalties by filing GST returns on time.'
    }
  ];

  const faqs = [
    {
      question: 'What is a GST return?',
      answer: 'A GST return is a document that contains details of income, sales, purchases, and other related transactions for a registered taxpayer. It is submitted to the tax authorities to determine the taxpayer\'s GST liability.'
    },
    {
      question: 'Who is required to file GST returns?',
      answer: 'Any individual or business registered under the Goods and Services Tax (GST) is required to file GST returns. This includes taxpayers with an annual turnover exceeding the prescribed threshold.'
    },
    {
      question: 'What are the types of GST returns?',
      answer: 'There are several types of GST returns, including GSTR-1 (outward supplies), GSTR-3B (summary of sales and purchases), and GSTR-9 (annual return). The specific returns required depend on the taxpayer\'s registration category and business activities.'
    },
    {
      question: 'What is the frequency of filing GST returns?',
      answer: 'The frequency of filing GST returns varies based on the taxpayer\'s turnover and type of registration. Regular taxpayers generally file monthly returns, while those under the composition scheme may file quarterly.'
    },
    {
      question: 'What happens if I miss the GST return filing deadline?',
      answer: 'If you miss the filing deadline, you may incur penalties, interest on late payment, and restrictions on filing subsequent returns. It is important to file returns on time to avoid these consequences.'
    },
    {
      question: 'Can I revise my GST returns?',
      answer: 'Yes, you can revise certain types of GST returns. However, there are specific timelines and conditions for revising returns, and it\'s advisable to do so as soon as possible.'
    },
    {
      question: 'What documents are required for filing GST returns?',
      answer: 'Common documents required include sales invoices, purchase invoices, debit/credit notes, and any supporting documents related to input tax credit claims.'
    },
    {
      question: 'How do I file GST returns online?',
      answer: 'GST returns can be filed online through the Goods and Services Tax Network (GSTN) portal. Taxpayers need to log in using their GSTIN, fill in the required details, and submit the return electronically.'
    },
    {
      question: 'What is the penalty for late filing of GST returns?',
      answer: 'The penalty for late filing is Rs. 100 per day for each of CGST and SGST, with a maximum penalty of Rs. 5,000. Additionally, interest is charged on the unpaid tax amount.'
    },
    {
      question: 'Can I claim Input Tax Credit (ITC) while filing GST returns?',
      answer: 'Yes, you can claim Input Tax Credit (ITC) on eligible purchases when filing your GST returns, provided you have valid invoices and the purchases are used for business purposes.'
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
                console.log('Initiating payment for GST Returns:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'gst-returns');
                localStorage.setItem('selectedRegistrationTitle', 'GST Returns');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/gst-returns-form');
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
            introTitle="About GST Returns"
            introDescription="In India, every organization registered under GST is required to file GST returns according to their business operations—be it monthly, quarterly, or annually. While this obligation may seem overwhelming, our team of GST professionals at OnEasy simplifies the process, making it easier for you to navigate through the necessary requirements."
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

export default GSTReturnsDetails;

