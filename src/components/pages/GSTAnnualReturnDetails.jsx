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

function GSTAnnualReturnDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('gst-annual-return');

  const processSteps = [
    {
      step: 1,
      title: 'Data Collection',
      description: 'Gather all annual financial statements, purchase and sales registers, tax payment receipts, and other required documents.'
    },
    {
      step: 2,
      title: 'Data Preparation & Reconciliation',
      description: 'Prepare and reconcile all transactions, ensuring accuracy between monthly/quarterly returns and annual financial statements.'
    },
    {
      step: 3,
      title: 'GSTR-9 Filing',
      description: 'File the annual return (GSTR-9) on the GST portal before the deadline, ensuring all parts are completed accurately.'
    }
  ];

  const documents = [
    'GST Portal Login Credentials',
    'Annual Financial Statements',
    'Purchase Register',
    'Sales Register',
    'HSN Summary of Inward/Outward Supplies',
    'Tax Payment Receipts/Challans',
    'Refund Details',
    'E-way Bill Records',
    'Credit/Debit Note Details'
  ];

  const prerequisites = [
    {
      title: 'Prior Filing Requirements',
      description: 'Prior to filing GSTR-9, ensure timely submission of GSTR-1, GSTR-3B, or GSTR-4 returns, depending on classification, and address any outstanding dues to avoid delays in the filing process.'
    }
  ];

  const aboutSections = [
    {
      id: 'gst-annual-return-intro',
      title: 'About GST Annual Return',
      content: 'GSTR-9 is an essential annual filing for all taxpayers registered under the Goods and Services Tax (GST) system. This comprehensive return encapsulates details on outward and inward supplies, covering transactions conducted throughout the financial year, as regulated by Central GST (CGST), State GST (SGST), and Integrated GST (IGST). GSTR-9 consolidates information from all monthly or quarterly returns submitted within the relevant year, making it a complete record of a business\'s financial and tax details.\n\nAt OnEasy, we are committed to simplifying your GSTR-9 filing process. Recognizing the complexity taxes can bring, we aim to guide you at every step, ensuring accuracy and compliance. With our expertise and client-focused approach, you can confidently complete your GSTR-9 filings with ease.'
    },
    {
      id: 'introduction-gstr9',
      title: 'Introduction to Form GSTR-9',
      content: 'GSTR-9 is a yearly summary report that registered taxpayers must submit. It includes all purchases and sales throughout the year and covers various tax types, including CGST, SGST, and IGST. This return reflects the total sales, purchases, and audit details for the year, effectively summarizing a whole year\'s business transactions and tax information. Filing GSTR-9 is mandatory for businesses with an annual turnover above Rs. 2 crore, while it remains optional for those with turnover up to Rs. 2 crore.'
    },
    {
      id: 'applicability',
      title: 'GST Annual Return Filing – Applicability',
      content: 'The requirement to file Form GSTR-9 extends to various taxpayer categories based on registration status, annual return limits and financial activities. The following entities are obligated to file the annual return:\n\n• Normal Taxpayers: Businesses registered as regular taxpayers under standard tax provisions.\n\n• SEZ Units and SEZ Developers: Units and developers within Special Economic Zones must file Form GSTR-9 to comprehensively report their annual transactions.\n\n• Transition from Composition Scheme: Taxpayers who switched from the composition scheme to regular taxpayer status during the financial year are required to file Form GSTR-9 to document this shift.'
    },
    {
      id: 'exclusions',
      title: 'Exclusions from Form GSTR-9 Filing',
      content: '• Composition Taxpayers: These taxpayers file a different annual return form, GSTR-9A, tailored to their specific needs.\n\n• Casual Taxpayers: Entities engaged in occasional business activities are not required to file Form GSTR-9.\n\n• Non-Resident Taxpayers: Non-resident individuals conducting taxable transactions within India are exempt from filing GSTR-9.\n\n• Input Service Distributors (ISD) and OIDAR Service Providers: ISDs and entities providing Online Information, Database Access, or Retrieval services are also excluded from filing GSTR-9.'
    },
    {
      id: 'types-of-returns',
      title: 'Types of GST Annual Returns',
      content: '• GSTR-9 - This is the standard form for taxpayers with an annual turnover exceeding Rs. 2 crore, summarizing their comprehensive financial details for the year.\n\n• GSTR-9A - This form applies to taxpayers registered under the GST Composition scheme, covering specific requirements for composition taxpayers.\n\n• GSTR-9C - The GSTR-9C form reconciles a taxpayer\'s annual return in GSTR-9 with audited financial statements, required for entities subject to an annual audit.'
    },
    {
      id: 'gst-audit',
      title: 'GST Audit Requirement',
      content: 'GSTR-9C is mandatory for taxpayers with an annual turnover exceeding Rs. 2 crore. This form must be prepared and certified by a Chartered Accountant or Cost Accountant, ensuring accuracy between the annual return and audited financial statements.'
    },
    {
      id: 'gstr9a',
      title: 'Filing GSTR-9A: Composition Scheme Participants',
      content: 'Applicability of GSTR-9A\n\nTaxpayers registered under the GST Composition scheme must file GSTR-9A. This return consolidates the information provided in quarterly returns throughout the fiscal year.\n\nEligibility for GSTR-9A Exemption\n\nCertain taxpayers under the composition scheme, such as Input Service Distributors, non-residents, those subject to Tax Deducted at Source (TDS) under Section 51, e-commerce operators under Tax Collected at Source (TCS) under Section 52, and casual taxpayers, are exempt from filing GSTR-9A.'
    },
    {
      id: 'gstr9c',
      title: 'Filing GSTR-9C: Reconciliation Statement',
      content: 'Purpose of GSTR-9C\n\nGSTR-9C serves to reconcile the taxpayer\'s annual return in GSTR-9 with their audited financial statements for a specific financial year. Certified by a Chartered Accountant, this statement ensures compliance and accuracy in annual filings.\n\nEligibility for GSTR-9C\n\nGSTR-9C is required for taxpayers whose accounts undergo an annual audit, helping to align the GSTR-9 return with audited financial data.'
    },
    {
      id: 'filing-deadline',
      title: 'GSTR-9 Filing Due Date',
      content: 'The GSTR-9 filing deadline is December 31 of the subsequent financial year, or as extended by the government.'
    },
    {
      id: 'late-filing-penalties',
      title: 'Late Filing Penalties',
      content: 'Missing the GSTR-9 filing deadline results in a penalty of Rs. 200 per day (Rs. 100 each for CGST and SGST), with no penalty applicable for IGST. This late fee is capped at 0.25% of the taxpayer\'s quarterly turnover, underscoring the importance of filing on time.'
    },
    {
      id: 'structure-gstr9',
      title: 'Comprehensive Structure of GSTR-9',
      content: 'The GSTR-9 format has six parts, each capturing key details of the financial year\'s transactions:\n\n• Part 1: Basic registration details.\n\n• Part 2: Outward supplies made, inward supplies, and tax details.\n\n• Part 3: Input Tax Credit availed and reversed.\n\n• Part 4: Tax payable and paid for the financial year.\n\n• Part 5: Adjustments for previous financial years.\n\n• Part 6: Miscellaneous details like refunds, demands, and HSN-wise summary.\n\nEach part captures specific financial details to ensure a complete summary of business transactions and tax obligations. If the form feels overwhelming, OnEasy\'s experts are here to guide you through each section, making filing seamless and accurate.'
    },
    {
      id: 'why-oneasy',
      title: 'Why Choose OnEasy for GSTR-9 Form Filing?',
      content: 'Navigating annual tax filings can be complex, but OnEasy simplifies the process. Here\'s how we can help:\n\n• Our team of tax professionals is thoroughly versed in GST regulations. We\'ll walk you through each section to ensure accuracy.\n\n• We ensure your data is correct before submission, minimizing risks of penalties.\n\n• Our timely notifications help you stay on track with deadlines and avoid late fees.\n\n• Our support team is available to answer any questions, ensuring you\'re never left in the dark.\n\n• From data compilation to final submission, we manage every detail of your GSTR-9 filing.\n\nWith OnEasy as your partner, filing your annual return is straightforward, timely, and compliant.\n\nGet started with OnEasy today and experience a reliable, streamlined approach to fulfilling your tax responsibilities.'
    }
  ];

  const faqs = [
    {
      question: 'What is GSTR-9, and who is required to file it?',
      answer: 'GSTR-9 is an annual return that all regular GST-registered taxpayers must file. It provides a comprehensive summary of a taxpayer\'s outward and inward supplies made or received during the financial year, along with the taxes paid. Composition taxpayers file GSTR-9A, while normal taxpayers submit GSTR-9.'
    },
    {
      question: 'What information is required to complete GSTR-9?',
      answer: 'GSTR-9 requires detailed data on the taxpayer\'s annual sales, purchases, tax paid under CGST, SGST, IGST, any late fees, and ITC (Input Tax Credit) availed. This includes monthly or quarterly filings already submitted within the year.'
    },
    {
      question: 'What is the due date for filing GSTR-9?',
      answer: 'The due date for filing GSTR-9 for a particular financial year is typically December 31st of the following financial year, though this deadline can sometimes be extended by the GST authorities.'
    },
    {
      question: 'Is it mandatory to file GSTR-9 if my business turnover is below Rs. 2 crores?',
      answer: 'Filing GSTR-9 is optional for taxpayers whose annual turnover is up to Rs. 2 crores. However, businesses with a turnover exceeding Rs. 2 crores are required to file GSTR-9.'
    },
    {
      question: 'What is the penalty for late filing of GSTR-9?',
      answer: 'If GSTR-9 is not filed by the due date, a late fee of Rs. 200 per day (Rs. 100 each for CGST and SGST) applies, capped at 0.25% of the taxpayer\'s turnover. No late fee is charged for IGST.'
    },
    {
      question: 'Can GSTR-9 be revised once filed?',
      answer: 'No, GSTR-9 cannot be revised after it is filed. It is essential to ensure all details are accurate before submitting, as amendments cannot be made post-filing.'
    },
    {
      question: 'What is the difference between GSTR-9, GSTR-9A, and GSTR-9C?',
      answer: 'GSTR-9 is the standard annual return for regular taxpayers. GSTR-9A is for taxpayers registered under the Composition Scheme. GSTR-9C is a reconciliation statement required for taxpayers with an annual turnover exceeding Rs. 2 crores, certified by a Chartered Accountant or Cost Accountant.'
    },
    {
      question: 'Is GSTR-9 applicable to SEZ Units and SEZ Developers?',
      answer: 'Yes, SEZ Units and SEZ Developers registered as regular taxpayers are also required to file GSTR-9 for comprehensive reporting of financial transactions within the fiscal year.'
    },
    {
      question: 'What records should I keep for filing GSTR-9?',
      answer: 'Taxpayers should keep detailed records of all sales, purchases, ITC claimed, taxes paid, and monthly or quarterly GSTR-1 and GSTR-3B returns filed throughout the financial year. These records help in accurately compiling data for GSTR-9.'
    },
    {
      question: 'What are the different parts in the GSTR-9 form?',
      answer: 'GSTR-9 has six parts, each capturing specific details: Part-1: Basic Registration Details, Part-2: Details of Outward Supplies, Part-3: Input Tax Credit (ITC), Part-4: Tax Paid, Part-5: Previous Financial Year Transactions, Part-6: Miscellaneous Details.'
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
                console.log('Initiating payment for GST Annual Return Filing:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'gst-annual-return');
                localStorage.setItem('selectedRegistrationTitle', 'GST Annual Return Filing');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/gst-annual-return-form');
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
            introTitle="About GST Annual Return"
            introDescription="GSTR-9 is an essential annual filing for all taxpayers registered under the Goods and Services Tax (GST) system. This comprehensive return encapsulates details on outward and inward supplies, covering transactions conducted throughout the financial year."
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

export default GSTAnnualReturnDetails;

