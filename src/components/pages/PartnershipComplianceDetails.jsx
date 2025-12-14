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

function PartnershipComplianceDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('partnership-compliance');

  const processSteps = [
    { step: 1, title: 'Accounting', description: 'Maintain books of accounts and financial records.' },
    { step: 2, title: 'Tax Compliance', description: 'File GST, TDS, and Income Tax returns.' },
    { step: 3, title: 'Statutory Filings', description: 'File PF, ESIC, and Professional Tax returns.' }
  ];

  const documents = [
    'Partnership Deed',
    'PAN Card of the Partnership Firm',
    'Registration Certificate (if registered)',
    'Bank Account Details',
    'KYC Documents of Partners',
    'Income Tax Returns of the Firm',
    'GST Registration Certificate',
    'Financial Statements',
    'Partnership Agreement Amendments',
    'Consent Letter from Partners'
  ];

  const prerequisites = [
    {
      title: 'Partnership Deed',
      description: 'Draft a comprehensive partnership deed outlining the terms, roles, and responsibilities of each partner.'
    },
    {
      title: 'PAN Registration',
      description: 'Obtain a Permanent Account Number (PAN) for the partnership firm from the tax authorities.'
    },
    {
      title: 'Business Registration',
      description: 'If applicable, register the partnership firm with the Registrar of Firms or relevant authority.'
    },
    {
      title: 'Bank Account',
      description: 'Open a separate bank account in the name of the partnership firm.'
    },
    {
      title: 'KYC Compliance',
      description: 'Ensure all partners complete Know Your Customer (KYC) verification with valid identification documents.'
    },
    {
      title: 'Income Tax Compliance',
      description: 'File income tax returns for the partnership firm as per applicable deadlines.'
    },
    {
      title: 'GST Registration',
      description: 'Obtain GST registration if the firm\'s turnover exceeds the threshold limit or if engaged in taxable services.'
    },
    {
      title: 'Accounting Records',
      description: 'Maintain accurate financial records, including books of accounts, profit and loss statements, and balance sheets.'
    },
    {
      title: 'Regular Meetings',
      description: 'Conduct regular meetings among partners to discuss business matters and document minutes of these meetings.'
    },
    {
      title: 'Compliance with Local Laws',
      description: 'Stay updated on and comply with local regulations related to business operations, labor laws, and other relevant statutes.'
    }
  ];

  const aboutSections = [
    {
      id: 'partnership-compliance-intro',
      title: 'About Partnership Compliance',
      content: 'Operating a Partnership Firm in India involves numerous essential financial and legal responsibilities. Ensuring compliance with tax and regulatory requirements is vital for the smooth operation and growth of your business. These responsibilities include filing Income Tax Returns, TDS Returns, GST Returns, EPF Returns, and occasionally undergoing a Tax Audit.\n\nAt OnEasy, we understand the importance of adhering to Indian tax laws and the benefits it can bring to your business. Our comprehensive services are designed to guide business owners through the complexities of compliance. With our support, you can simplify these obligations and ensure a hassle-free experience with the filing processes.\n\nBy partnering with OnEasy, you can stay compliant with income tax on partnership firms and optimize tax benefits, helping your business grow while adhering to regulations.'
    },
    {
      id: 'overview',
      title: 'Partnership Firm Overview',
      content: 'A partnership firm is a business entity created by two or more individuals working together under a single enterprise. Partnership firms are categorized as:\n\n• Registered Partnership Firm: A partnership formally registered with the Registrar of Companies (ROC) and holding a registration certificate.\n\n• Unregistered Partnership Firm: Any partnership without a registration certificate from the Registrar of Firms.\n\nPartnerships are essentially agreements between two or more people who agree to share the profits or losses of a jointly run business. The individuals involved are called partners, and together they form a firm. Partners must be mindful of the partnership firm tax rate and understand how it impacts profit distribution. Transparency, fair dealings, and accurate record-keeping are essential to ensure the firm\'s success.'
    },
    {
      id: 'itr-filing',
      title: 'Income Tax Return Filing for Partnership Firms',
      content: 'All partnership firms in India must file income tax returns annually, even if they haven\'t generated any income or have incurred losses. It\'s essential to understand the tax rate for partnership firms (30%) to make well-informed financial decisions. Filing an NIL return within the due date is mandatory, even if the firm\'s income is zero.'
    },
    {
      id: 'tax-rates',
      title: 'Partnership Firm Tax Rates for AY 2023-24',
      content: 'According to the Income Tax Act, 1961, a partnership firm in India is subject to the following tax rates:\n\n• Income Tax Rate: Partnership firms are taxed at 30% on their taxable income.\n\n• Surcharge: If taxable income exceeds ₹1 crore, a surcharge of 12% applies in addition to income tax.\n\n• Interest on Capital: Firms can claim a deduction of up to 12% for interest paid on capital.\n\n• Health and Education Cess: A 4% Health and Education Cess is applied to the total tax amount, including any surcharge.\n\n• Marginal Relief: If the net income exceeds ₹1 crore, the total payable tax and surcharge will not exceed the tax on ₹1 crore by more than the excess income amount.'
    },
    {
      id: 'mat',
      title: 'Minimum Alternate Tax (MAT) for Partnership Firms',
      content: 'Partnership firms are subject to a Minimum Alternate Tax (MAT), similar to companies. This tax requires that the income tax payable on a partnership firm\'s profits cannot be less than 18.5% of adjusted total income, plus any surcharge, health, and education cess.'
    },
    {
      id: 'deductions',
      title: 'Deductions Allowed',
      content: 'For calculating income tax liability, partnership firms may deduct:\n\n• Remunerations or interest paid to partners if they align with the partnership agreement.\n\n• Salaries, bonuses, and commissions paid to non-working partners of the firm.\n\n• Remunerations to partners for transactions predating the partnership deed.'
    },
    {
      id: 'itr-forms',
      title: 'ITR Forms for Partnership Firms',
      content: 'Partnership firms can file income tax returns through either Form ITR-4 or ITR-5:\n\n• ITR-4: For firms with total income up to ₹50 lakh, with business and professional income computed on a presumptive basis.\n\n• ITR-5: For firms requiring an audit of accounts.'
    },
    {
      id: 'filing-deadlines',
      title: 'Filing Deadlines for Partnership Firms',
      content: 'The due date for filing ITR for partnership firms depends on whether an audit is required:\n\n• Non-audited firms: File returns by July 31.\n\n• Audited firms: File returns by October 31.'
    },
    {
      id: 'gst-filing',
      title: 'GST Return Filing',
      content: 'Partnership firms registered under GST must file returns if their annual turnover exceeds ₹20 lakh. Generally, GST-registered firms need to file GSTR-1, GSTR-3B, and GSTR-9. Firms opting for a composition scheme must file GSTR-4.'
    },
    {
      id: 'tds-filing',
      title: 'TDS Return Filing',
      content: 'If a partnership firm holds a valid TAN, it must file TDS returns based on the type of deduction, such as:\n\n• Form 24Q: TDS on Salary\n\n• Form 27Q: TDS for non-residents or foreign companies\n\n• Form 26QB: TDS on immovable property transactions\n\n• Form 26Q: TDS in other cases'
    },
    {
      id: 'epf-filing',
      title: 'EPF Return Filing',
      content: 'Partnership firms with more than ten employees must register for EPF and file EPF returns as required.'
    },
    {
      id: 'accounting',
      title: 'Accounting and Bookkeeping Requirements',
      content: 'A partnership firm must maintain books of accounts if its turnover exceeds ₹25,00,000 or its business income exceeds ₹2,50,000 in any of the three preceding years.'
    },
    {
      id: 'tax-audit',
      title: 'Tax Audit Requirements',
      content: 'A partnership firm must undergo a tax audit if its turnover or gross receipts exceed ₹1 crore in a financial year or under other specified conditions.'
    },
    {
      id: 'streamline',
      title: 'Streamline Compliance with OnEasy',
      content: 'OnEasy is your trusted partner in ensuring compliance for your partnership firm. We offer end-to-end services, covering various aspects of compliance to help your business stay in good legal and financial standing.\n\nOur services include:\n\n• Income Tax Return Filing: We ensure timely and accurate income tax filing.\n\n• TDS Return Filing: Our team supports accurate TDS filing to meet your reporting obligations.\n\n• GST Return Filing: For GST-registered firms, we make GSTR-1, GSTR-3B, and other returns seamless.\n\n• EPF Return Filing: Our support in EPF filing ensures compliance with employee provident fund regulations.\n\nWith OnEasy\'s assistance, you can focus on growing your business while we handle your compliance needs. Our team provides guidance on income tax regulations, including tax rates, deductions, and filing deadlines, ensuring that you\'re fully compliant and maximizing tax benefits.\n\nAre you ready to simplify your partnership firm\'s compliance needs?\n\nGet started with OnEasy today for a hassle-free tax filing experience.'
    }
  ];

  const faqs = [
    {
      question: 'What are the basic compliance requirements for a partnership firm in India?',
      answer: 'Partnership firms must adhere to various tax filings, including Income Tax Returns, TDS Returns, GST Returns (if applicable), and EPF Returns if they have eligible employees. Compliance also includes maintaining books of accounts and, in some cases, conducting a tax audit.'
    },
    {
      question: 'Is it mandatory for a partnership firm to file an income tax return even if there is no income?',
      answer: 'Yes, all partnership firms are required to file an income tax return annually, regardless of whether they have generated income or incurred losses. Even if the income is zero (NIL), a return must still be filed by the due date.'
    },
    {
      question: 'What are the tax rates applicable to partnership firms?',
      answer: 'Partnership firms are subject to a 30% income tax rate on their taxable income. Additionally, a 12% surcharge is applicable if the taxable income exceeds ₹1 crore, along with a 4% Health and Education Cess on the total tax amount.'
    },
    {
      question: 'Are partnership firms required to register for GST?',
      answer: 'A partnership firm must register for GST if its annual turnover exceeds ₹20 lakhs. Once registered, the firm is required to file GST returns, such as GSTR-1, GSTR-3B, and GSTR-9. If it opts for the composition scheme, then GSTR-4 is applicable.'
    },
    {
      question: 'What deductions are allowed for partnership firms?',
      answer: 'Deductions include salaries, bonuses, or commissions paid to working partners as per the partnership deed. Interest on capital up to 12% is also deductible, provided it complies with the partnership agreement.'
    },
    {
      question: 'What is the due date for filing the income tax return for partnership firms?',
      answer: 'If an audit is not required, the deadline is typically July 31st. If an audit is necessary, the filing date is extended to October 31st of the assessment year.'
    },
    {
      question: 'When is a partnership firm required to undergo a tax audit?',
      answer: 'A tax audit is required if the firm\'s annual turnover, sales, or gross receipts exceed ₹1 crore. Certain other conditions may also require an audit based on income or transactions.'
    },
    {
      question: 'What is the purpose of a TDS return, and when is it required?',
      answer: 'TDS (Tax Deducted at Source) returns are required if the partnership firm has deducted TDS on payments like salaries, rent, or contractor services. The return must be filed quarterly, and the form used depends on the nature of the TDS deduction (e.g., Form 24Q for salaries, Form 26Q for other payments).'
    },
    {
      question: 'Is it mandatory for a partnership firm to register with EPF?',
      answer: 'A partnership firm is required to register for EPF if it employs more than 10 people. Once registered, EPF returns need to be filed periodically to stay compliant with employee provident fund regulations.'
    },
    {
      question: 'What are the consequences of non-compliance for a partnership firm?',
      answer: 'Non-compliance can lead to penalties, interest on unpaid taxes, and potential legal issues. Maintaining compliance ensures that the partnership firm avoids these penalties and operates within the legal framework.'
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
                localStorage.setItem('selectedRegistrationType', 'partnership-compliance');
                localStorage.setItem('selectedRegistrationTitle', 'Partnership Compliance');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/partnership-compliance-form');
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
            introTitle="About Partnership Compliance"
            introDescription="Comprehensive compliance services for partnership firms."
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

export default PartnershipComplianceDetails;

