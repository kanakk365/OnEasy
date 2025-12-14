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

function ProprietorshipComplianceDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('proprietorship-compliance');

  const processSteps = [
    { step: 1, title: 'Accounting', description: 'Maintain books of accounts and financial records.' },
    { step: 2, title: 'Tax Compliance', description: 'File GST, TDS, and Income Tax returns.' },
    { step: 3, title: 'Statutory Filings', description: 'File PF, ESIC, and Professional Tax returns.' }
  ];

  const documents = [
    'PAN Card',
    'Bank Account Details',
    'Aadhaar Card',
    'Advance Tax Payment Challans',
    'Form 16, 16A, and 26AS'
  ];

  const prerequisites = [
    {
      title: 'Business Registration',
      description: 'If applicable, register your proprietorship under relevant local or state regulations.'
    },
    {
      title: 'PAN Registration',
      description: 'Obtain a Permanent Account Number (PAN) for the proprietorship from the tax authorities.'
    },
    {
      title: 'GST Registration',
      description: 'Register for Goods and Services Tax (GST) if your turnover exceeds the threshold limit or if you are engaged in taxable supplies.'
    },
    {
      title: 'Bank Account',
      description: 'Open a separate bank account in the name of the proprietorship for business transactions.'
    },
    {
      title: 'KYC Documents',
      description: 'Prepare and maintain Know Your Customer (KYC) documents for identification, such as Aadhaar and other identity proofs.'
    },
    {
      title: 'Accounting Records',
      description: 'Maintain accurate financial records, including books of accounts, profit and loss statements, and balance sheets.'
    },
    {
      title: 'Income Tax Compliance',
      description: 'File income tax returns as per the applicable deadlines and regulations.'
    },
    {
      title: 'Licenses and Permits',
      description: 'Obtain any necessary licenses or permits specific to your industry or location.'
    },
    {
      title: 'Regular Audits',
      description: 'Conduct regular financial audits if required, especially if your business has significant revenue.'
    },
    {
      title: 'Compliance with Local Laws',
      description: 'Stay updated on and comply with local regulations, labor laws, and other relevant statutes.'
    }
  ];

  const aboutSections = [
    {
      id: 'proprietorship-compliance-intro',
      title: 'About Proprietorship Compliance',
      content: 'Running a Sole Proprietorship in India involves fulfilling essential financial and legal responsibilities to ensure smooth operations and compliance with tax regulations. This includes filing Income Tax Returns, TDS Returns, GST Returns, EPF Returns, maintaining accurate accounting records, and, in certain cases, completing a Tax Audit.\n\nFor sole proprietorships, filing tax returns is a key requirement under Indian law. At OnEasy, we understand the importance of compliance and the opportunities it provides for optimizing tax benefits. Our comprehensive services are designed to guide business owners through the compliance process with ease and efficiency, ensuring accuracy and saving valuable time.\n\nWith OnEasy, proprietors can fulfill tax obligations while maximizing tax benefits, helping their businesses thrive within regulatory standards.'
    },
    {
      id: 'overview',
      title: 'Proprietorship Overview',
      content: 'A sole proprietorship is the simplest business structure in India, where one individual fully owns and manages the business.'
    },
    {
      id: 'itr-filing',
      title: 'Income Tax Return Filing for Proprietorship',
      content: 'For tax purposes, a proprietorship is treated as an extension of its owner, meaning that the income tax rules for individuals apply directly. Since proprietorships are not considered separate legal entities, the proprietor\'s PAN is used for filing returns on behalf of the business.'
    },
    {
      id: 'is-itr-necessary',
      title: 'Is ITR Filing Necessary for Proprietorships?',
      content: 'Yes, under the Income Tax Act, proprietorships must file returns if the proprietor\'s income exceeds the threshold based on age:\n\n• Below 60 Years: Income above ₹3 lakhs\n\n• 60-80 Years: Income above ₹3 lakhs\n\n• Above 80 Years: Income above ₹5 lakhs'
    },
    {
      id: 'tax-slabs',
      title: 'Income Tax Slab Rates for Proprietorships',
      content: 'For the fiscal year 2023-2024, tax rates for proprietors are based on income and age. The new tax regime allows higher rebates up to ₹7 lakh for individuals.\n\nProprietor\'s Age - Below 60 Years:\n• Up to Rs. 2,50,000: 0%\n• Rs. 2,50,001 to Rs. 5,00,000: 5%\n• Rs. 5,00,001 to Rs. 10,00,000: 20%\n• Above Rs. 10,00,000: 30%\n\nProprietor\'s Age - 60-80 Years:\n• Up to Rs. 3,00,000: 0%\n• Rs. 3,00,001 to Rs. 5,00,000: 5%\n• Rs. 5,00,001 to Rs. 10,00,000: 20%\n• Above Rs. 10,00,000: 30%\n\nProprietor\'s Age - Above 80 Years:\n• Up to Rs. 5,00,000: 0%\n• Rs. 5,00,001 to Rs. 10,00,000: 20%\n• Above Rs. 10,00,000: 30%'
    },
    {
      id: 'alternate-regime',
      title: 'Alternate Tax Regime (Section 115BAC)',
      content: 'Under this regime, proprietors can opt for simplified tax rates by forfeiting specific exemptions and deductions, offering flexibility based on income levels.'
    },
    {
      id: 'presumptive-taxation',
      title: 'Presumptive Taxation Scheme for Proprietorships',
      content: 'The Presumptive Taxation Scheme under Section 44AD simplifies tax for small businesses, allowing taxes to be calculated based on presumptive income and minimizing record-keeping obligations.'
    },
    {
      id: 'filing-deadlines',
      title: 'ITR Filing Deadlines',
      content: 'The filing deadline for proprietorships depends on audit requirements:\n\n• No Audit Required: July 31st\n\n• Audit Required: September 30th\n\n• International Transactions: November 30th'
    },
    {
      id: 'tds-filing',
      title: 'TDS Return Filing',
      content: 'If proprietors hold a TAN, TDS returns are mandatory and vary based on the type of deduction (e.g., salary, property, non-residents).'
    },
    {
      id: 'gst-filing',
      title: 'GST Return Filing',
      content: 'For businesses exceeding a turnover of ₹20 lakhs, GST registration is required, and GSTR-1 and GSTR-3B forms must be filed regularly.'
    },
    {
      id: 'epf-filing',
      title: 'EPF Return Filing',
      content: 'Employers with 20+ employees must register for EPF and file periodic EPF returns.'
    },
    {
      id: 'accounting',
      title: 'Accounting and Bookkeeping',
      content: 'Proprietors with turnover over ₹25 lakhs or business income over ₹2.5 lakhs are required to maintain proper records.'
    },
    {
      id: 'audit-requirements',
      title: 'Audit Requirements',
      content: 'Audits are mandatory for:\n\n• Turnover above ₹5 crore\n\n• Professional income above ₹50 lakh\n\n• Businesses under presumptive tax schemes (in specific cases)\n\nAudits, performed by a Chartered Accountant, verify financial accuracy and legal compliance.'
    },
    {
      id: 'streamline',
      title: 'Streamline Proprietorship Compliance with OnEasy',
      content: 'OnEasy is here to support all compliance needs for sole proprietorships. We offer seamless Income Tax Return filing, TDS return assistance, and hassle-free GST filing, covering both GSTR-1 and GSTR-3B. OnEasy also provides EPF return filing and other essential compliance services.\n\nWith OnEasy\'s expert team and intuitive platform, proprietors can focus on growing their business while we handle compliance, ensuring financial accuracy and regulatory adherence.\n\nReady to simplify your proprietorship compliance with OnEasy? Get started today!'
    }
  ];

  const faqs = [
    {
      question: 'What is a Sole Proprietorship?',
      answer: 'A sole proprietorship is the simplest business form in India, where one individual owns and operates the business. This setup doesn\'t distinguish between the owner and the business for tax purposes.'
    },
    {
      question: 'Do Proprietorships Need to File Income Tax Returns?',
      answer: 'Yes, proprietorships must file income tax returns based on the income and age of the proprietor. Filing within deadlines is essential, especially for claiming deductions and carrying forward any losses.'
    },
    {
      question: 'What Are the Income Tax Slabs for Proprietorships?',
      answer: 'Proprietorships are taxed according to the personal tax slab rates of the proprietor, with varying rates based on age and income range.'
    },
    {
      question: 'What Are the Compliance Requirements for a Proprietorship?',
      answer: 'Proprietorships must comply with various tax and regulatory requirements, including income tax return filing, GST return filing (if applicable), TDS returns, EPF returns, and maintaining accurate accounting records.'
    },
    {
      question: 'How Does GST Registration Apply to Proprietorships?',
      answer: 'Proprietorships with annual turnover exceeding Rs. 20 lakh (Rs. 10 lakh for specific states) must register for GST. Registered proprietorships are required to file regular GST returns, such as GSTR-1 and GSTR-3B.'
    },
    {
      question: 'What is the Presumptive Taxation Scheme for Proprietorships?',
      answer: 'The Presumptive Taxation Scheme under Section 44AD is available for small businesses. It allows proprietors to pay taxes based on a presumed income, simplifying compliance by reducing the need for detailed accounting.'
    },
    {
      question: 'Is an Audit Required for a Proprietorship?',
      answer: 'An audit is required if a proprietorship\'s turnover exceeds Rs. 5 crore (or Rs. 50 lakh for professionals) or if the business opts for certain presumptive tax schemes. The audit must be conducted by a certified Chartered Accountant.'
    },
    {
      question: 'Which ITR Forms Are Used for Filing Proprietorship Tax Returns?',
      answer: 'Proprietorships generally use ITR-3 for business income filings. If opting for presumptive taxation, ITR-4 can be used, which simplifies the filing process for small taxpayers.'
    },
    {
      question: 'What is the Due Date for Filing Proprietorship Income Tax Returns?',
      answer: 'The due date varies: if no audit is required, the deadline is July 31st; if an audit is needed, the deadline is September 30th; for businesses with international transactions, the due date is November 30th.'
    },
    {
      question: 'Are Proprietors Required to File TDS Returns?',
      answer: 'If a proprietorship has a valid Tax Deduction Account Number (TAN) and makes specific payments requiring TDS, it must file TDS returns quarterly. Examples include TDS on salaries, property sales, and other payments to contractors.'
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
                localStorage.setItem('selectedRegistrationType', 'proprietorship-compliance');
                localStorage.setItem('selectedRegistrationTitle', 'Proprietorship Compliance');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/proprietorship-compliance-form');
                  }
                }
              } catch (error) {
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
            introTitle="About Proprietorship Compliance"
            introDescription="Comprehensive compliance services for proprietorship businesses."
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

export default ProprietorshipComplianceDetails;

