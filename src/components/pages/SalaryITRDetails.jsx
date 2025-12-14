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

function SalaryITRDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('salary-itr');

  const processSteps = [
    {
      step: 1,
      title: 'Login to the Portal',
      description: 'Visit the Income Tax Department e-filing website.'
    },
    {
      step: 2,
      title: 'Select the Right ITR Form',
      description: 'Choose the form based on your income sources.'
    },
    {
      step: 3,
      title: 'Complete and Submit',
      description: 'Fill in the necessary details and submit your ITR.'
    },
    {
      step: 4,
      title: 'E-Verify Your Return',
      description: 'After submission, verify your return to complete the process.'
    }
  ];

  const documents = [
    'PAN (Permanent Account Number)',
    'Aadhaar (linked to PAN)',
    'Bank account details',
    'Salary slips',
    'Form 16 and Form 26AS',
    'Home loan details',
    'Interest certificates from banks',
    'Proof of tax-saving investments'
  ];

  const prerequisites = [
    {
      title: 'PAN Card',
      description: 'Mandatory for filing your ITR.'
    },
    {
      title: 'Income Details',
      description: 'Information on all income sources (salary, business, rental, interest).'
    },
    {
      title: 'Form 16/16A',
      description: 'Obtain from your employer for salary details and TDS.'
    },
    {
      title: 'Bank Statements',
      description: 'Confirm interest income and relevant transactions.'
    },
    {
      title: 'Investment Proofs',
      description: 'Receipts for deductions (Sections 80C, 80D, etc.).'
    },
    {
      title: 'Previous Year\'s ITR',
      description: 'Reference for consistency in reporting.'
    },
    {
      title: 'Tax Payment Receipts',
      description: 'Records of advance tax and self-assessment payments.'
    },
    {
      title: 'Aadhaar Number',
      description: 'Mandatory linkage with PAN for filing.'
    },
    {
      title: 'Other Relevant Documents',
      description: 'Capital gains statements, foreign income details, etc.'
    }
  ];

  const aboutSections = [
    {
      id: 'itr-intro',
      title: 'About Income Tax Return (ITR) E-Filing Services',
      content: 'Filing Income Tax Returns (ITR) is a fundamental obligation for every taxpayer in India, ensuring compliance with the country\'s tax laws. This process involves reporting all income sources, deductions, and tax liabilities to the Income Tax Department. For the Financial Year 2023-24 (Assessment Year 2024-25), the deadline for submitting your ITR without incurring a late fee is July 31, 2024.\n\nFiling your ITR early helps to avoid errors and last-minute technical glitches, facilitating a smoother submission process. At OnEasy, we simplify the ITR e-filing journey, allowing you to submit your returns online effortlessly. Our service streamlines each step, ensuring a faster, efficient, and secure e-filing experience.\n\nWith expert guidance available throughout the process, OnEasy guarantees a hassle-free ITR e-filing experience, allowing you to fulfill your tax obligations with ease.'
    },
    {
      id: 'what-is-itr',
      title: 'What is an Income Tax Return (ITR)?',
      content: 'An Income Tax Return (ITR) is a form used by taxpayers to report their income and tax payments to the Income Tax Department. There are seven different ITR forms (ITR 1 to ITR 7), and the appropriate form depends on various factors, including income sources, total earnings, and taxpayer type (individuals, Hindu Undivided Families (HUFs), companies, etc.). Timely and accurate completion of ITR is essential to comply with tax regulations.'
    },
    {
      id: 'who-needs-file',
      title: 'Who Needs to E-File an Income Tax Return?',
      content: 'E-filing of ITR is not only a legal duty but also a financial responsibility that applies to various groups under different circumstances. Here\'s a breakdown of who is required to e-file:\n\n• Salaried Individuals: Mandatory if total income before deductions exceeds the basic exemption limit.\n\n• Firms: All corporate entities, including private limited companies, LLPs, and traditional partnerships, must file annually, regardless of profit or loss.\n\n• Directors and Partners: Individuals serving as directors or partners must reflect their income and financial activities in the ITR.\n\n• Dividend Earners: Required if you receive dividends from sources like mutual funds, bonds, equities, or fixed deposits.\n\n• Charity and Religious Trusts: Income from managing charity funds or voluntary contributions must be reported.\n\n• Tax Refunds: Individuals and businesses eligible for refunds must e-file to claim taxes overpaid.\n\n• NRIs and Tech Professionals: Required if income from India surpasses exemption limits or involves specific transactions.'
    },
    {
      id: 'eligibility',
      title: 'Eligibility for Income Tax Filing',
      content: 'In India, e-filing is required under certain conditions:\n\nBasic Exemption Limits:\n\n• Individuals under 60 years: ₹2.5 lakh\n\n• Individuals between 60 and 80 years: ₹3 lakh\n\n• Individuals over 80 years: ₹5 lakh\n\nAdditionally, even if income is below these limits, e-filing is mandatory if high-value transactions occur, such as:\n\n• Depositing ₹1 crore or more in current accounts\n\n• Spending over ₹2 lakh on foreign travel\n\n• Incurring electricity expenses exceeding ₹1 lakh'
    },
    {
      id: 'itr-forms',
      title: 'Income Tax Return Forms in India',
      content: 'The ITR e-filing process utilizes various forms tailored for different taxpayers:\n\n• ITR-1 (SAHAJ): For individuals with income from salary or pension below ₹50 lakh and who own one house property.\n\n• ITR-2: Suitable for NRIs, company directors, or individuals with capital gains or multiple house properties.\n\n• ITR-3: Designed for professionals and individuals with a proprietorship business.\n\n• ITR-4: For those opting for presumptive taxation with business income below ₹2 crore.\n\n• ITR-5: For partnerships, LLPs, and associations.\n\n• ITR-6: Applicable to companies registered in India.\n\n• ITR-7: For entities like charitable trusts and scientific research institutions.'
    },
    {
      id: 'due-dates',
      title: 'Key Due Dates for ITR Filing',
      content: 'For Assessment Year (AY) 2024-25, the deadline for e-filing varies:\n\n• Individuals and Non-Audit Entities: July 31, 2024\n\n• Taxpayers Under Tax Audit: October 31, 2024\n\n• Taxpayers Covered Under Transfer Pricing: November 30, 2024\n\n• Revised/Belated Returns: December 31, 2024'
    },
    {
      id: 'benefits',
      title: 'Benefits of Income Tax E-Filing',
      content: 'E-filing offers numerous advantages:\n\n• Legal Documentation: Serves as proof of income and taxes paid, aiding in identity verification and income assessments for loans or property purchases.\n\n• Claim Tax Benefits: Allows you to claim deductions, reducing tax liability.\n\n• Essential for Financial Transactions: Required for loan and visa applications, showcasing financial stability.\n\n• Avoid Penalties: Timely e-filing helps avoid late fees and interest charges.\n\n• Carry Forward Losses: Enables you to carry forward financial losses to offset future profits, a benefit forfeited if ITR is not filed timely.\n\n• Refund Claims: Necessary to claim refunds on overpaid taxes.'
    },
    {
      id: 'penalties',
      title: 'Penalties for Late Filing',
      content: 'Missing the ITR filing deadline incurs penalties, including:\n\n• Interest: 1% per month on unpaid tax under Section 234A.\n\n• Late Fee: Rs. 5,000 (or Rs. 1,000 for income below Rs. 5 lakh) under Section 234F.'
    },
    {
      id: 'e-filing-procedure',
      title: 'E-Filing Procedure',
      content: 'E-filing can be done online through the Income Tax Department\'s e-filing portal. Here\'s how:\n\n• Login to the Portal: Visit the Income Tax Department e-filing website.\n\n• Select the Right ITR Form: Choose the form based on your income sources.\n\n• Complete and Submit: Fill in the necessary details and submit your ITR.\n\n• E-Verify Your Return: After submission, verify your return to complete the process.\n\nAt OnEasy, we are committed to making your ITR e-filing experience seamless, efficient, and compliant. Let us help you navigate the complexities of income tax filing and ensure that you meet all your obligations effortlessly.'
    }
  ];

  const faqs = [
    {
      question: 'What is ITR e-filing?',
      answer: 'ITR e-filing refers to the electronic submission of your Income Tax Return through the Income Tax Department\'s online portal. It allows taxpayers to report their income, deductions, and tax liabilities conveniently.'
    },
    {
      question: 'Who is required to e-file an Income Tax Return?',
      answer: 'Individuals, Hindu Undivided Families (HUFs), firms, companies, and other entities with income exceeding the basic exemption limit are required to e-file their ITR. Specific conditions apply based on income sources and categories.'
    },
    {
      question: 'What documents do I need for ITR e-filing?',
      answer: 'Essential documents include your PAN, Aadhaar number, bank account details, salary slips, Form 16, Form 26AS, and proof of deductions or tax-saving investments.'
    },
    {
      question: 'What are the different ITR forms available?',
      answer: 'There are several ITR forms, including ITR-1 (SAHAJ), ITR-2, ITR-3, ITR-4, ITR-5, ITR-6, and ITR-7. The choice of form depends on your income sources and taxpayer status.'
    },
    {
      question: 'What is the deadline for e-filing ITR for AY 2024-25?',
      answer: 'The deadline for e-filing ITR for individuals and non-audit entities is July 31, 2024. For taxpayers under audit, it is October 31, 2024, and for those covered under transfer pricing, it is November 30, 2024.'
    },
    {
      question: 'Can I file my ITR after the deadline?',
      answer: 'Yes, you can file a belated return after the deadline, but it may incur penalties, and you will miss out on some benefits, such as carrying forward losses.'
    },
    {
      question: 'How can I e-file my ITR?',
      answer: 'To e-file your ITR, visit the Income Tax Department\'s e-filing portal, log in, select the appropriate ITR form, fill in the required details, and submit your return. Don\'t forget to e-verify your return.'
    },
    {
      question: 'What are the penalties for late ITR filing?',
      answer: 'If you miss the filing deadline, you may face a penalty of up to ₹5,000 (or ₹1,000 if your income is below ₹5 lakh) and interest on unpaid taxes at the rate of 1% per month under Section 234A.'
    },
    {
      question: 'How can I claim a tax refund through e-filing?',
      answer: 'To claim a tax refund, you need to e-file your ITR accurately, reflecting your income and tax payments. The refund will be processed by the Income Tax Department once your return is verified.'
    },
    {
      question: 'Is it safe to e-file my ITR?',
      answer: 'Yes, e-filing is safe and secure. The Income Tax Department uses encryption and other security measures to protect taxpayer information during the e-filing process.'
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
                localStorage.setItem('selectedRegistrationType', 'salary-itr');
                localStorage.setItem('selectedRegistrationTitle', 'Income Tax Return - Salary');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/tax-accounting/salary-itr-form');
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
            introTitle="About Income Tax Return (ITR) E-Filing Services"
            introDescription="Filing Income Tax Returns (ITR) is a fundamental obligation for every taxpayer in India, ensuring compliance with the country's tax laws."
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
        <TopTabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />
        {renderTabContent()}
      </div>
      <PaymentSuccessPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
      />
    </div>
  );
}

export default SalaryITRDetails;

