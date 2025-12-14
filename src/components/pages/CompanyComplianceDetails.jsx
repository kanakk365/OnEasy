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

function CompanyComplianceDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('company-compliance');

  const processSteps = [
    { step: 1, title: 'Accounting', description: 'Maintain books of accounts and financial records.' },
    { step: 2, title: 'Tax Compliance', description: 'File GST, TDS, and Income Tax returns.' },
    { step: 3, title: 'ROC Compliance', description: 'File annual returns and other ROC filings.' },
    { step: 4, title: 'Statutory Filings', description: 'File PF, ESIC, and Professional Tax returns.' }
  ];

  const documents = [
    'MOA, AOA and COI',
    'PAN Card of the Company',
    'Bank Account Details',
    'KYC Documents of Directors',
    'ITR\'s of the Company',
    'GST Registration Certificate',
    'Financial Statements'
  ];

  const prerequisites = [
    {
      title: 'Updated Bank Statements',
      description: 'All company bank account statements must be up-to-date and reconciled with your books of accounts.'
    },
    {
      title: 'Complete Financial Records',
      description: 'All income, expenses, purchases, and sales transactions should be properly recorded with supporting documents.'
    },
    {
      title: 'Employee Details',
      description: 'Current list of all employees with their salary details, PF/ESI numbers, and tax deduction information.'
    },
    {
      title: 'Director Information',
      description: 'Updated personal details of all directors including DIN (Director Identification Number), address proof, and PAN cards.'
    },
    {
      title: 'Shareholder Records',
      description: 'Current list of all shareholders with their shareholding patterns and any changes during the year.'
    },
    {
      title: 'Business Agreements',
      description: 'Copies of all active contracts, lease agreements, and major business deals made during the period.'
    },
    {
      title: 'GST Records',
      description: 'Monthly purchase and sales registers with GST details, and e-way bills if applicable.'
    },
    {
      title: 'Company Assets List',
      description: 'Updated record of all company assets including purchases, sales, or disposals during the period.'
    }
  ];

  const aboutSections = [
    {
      id: 'company-compliance-intro',
      title: 'About Private Limited Compliance',
      content: 'Private Limited Companies in India must adhere to strict regulatory requirements under the Companies Act 2013. These companies are required to file various returns with the Ministry of Corporate Affairs (MCA) and Income Tax Department throughout the year. Monthly compliances include GST returns, PF/ESI deposits, and TDS payments, while annual compliances cover filing of financial statements, annual returns, and income tax returns.\n\nThe company must maintain statutory registers, conduct mandatory board meetings, and hold Annual General Meetings (AGM). Directors have significant responsibilities including timely disclosure of interests and ensuring all statutory filings are completed within deadlines. Non-compliance can result in heavy penalties, legal actions, and even disqualification of directors.\n\nProper documentation, updated financial records, and maintaining a strong compliance calendar are essential for smooth operations. For better governance, companies should engage professional experts to handle these compliances effectively and avoid any regulatory issues.'
    },
    {
      id: 'overview',
      title: 'Private Limited Company Overview',
      content: 'A Private Limited Company is a formal business structure incorporated under the Companies Act, 2013. It is recognized as a separate legal entity, distinct from its owners (shareholders). Key features include limited liability for its members, a perpetual succession, and a more structured regulatory framework governed by the Ministry of Corporate Affairs (MCA).\n\nThe company is managed by a Board of Directors, and ownership is held by shareholders. This structure is one of the most popular and credible forms of business in India, ideal for startups and growing enterprises seeking funding and scalability.'
    },
    {
      id: 'itr-filing',
      title: 'Income Tax Return Filing for Companies',
      content: 'All private limited companies registered in India must file an Income Tax Return (ITR) every year with the Income Tax Department. This is a mandatory requirement, regardless of whether the company has generated profits, incurred losses, or had no business activity during the financial year. Filing a NIL return on time is compulsory even if the company\'s income is zero.'
    },
    {
      id: 'tax-rates',
      title: 'Company Tax Rates for AY 2025-26',
      content: 'Under the Income Tax Act, 1961, a domestic private limited company is subject to the following tax rates:\n\n• Income Tax Rate: Companies can opt for one of two regimes:\n  - New Regime (Section 115BAA): A flat rate of 22% (plus surcharge and cess), provided no exemptions or incentives are claimed.\n  - Old Regime: A flat rate of 30% (plus surcharge and cess), where the company can claim specified exemptions.\n\n• Surcharge: A surcharge is levied on the tax amount if the net income exceeds certain limits:\n  - 7% if income is between ₹1 crore and ₹10 crore.\n  - 12% if income exceeds ₹10 crore.\n\n• Health and Education Cess: A 4% cess is applied to the final tax amount (including any surcharge).'
    },
    {
      id: 'mat',
      title: 'Minimum Alternate Tax (MAT) for Companies',
      content: 'A private limited company is required to pay a Minimum Alternate Tax (MAT) if the tax payable as per normal provisions is less than 15% of its book profit. This ensures that companies pay a minimum amount of tax. The MAT rate is 15% of the book profit, plus any applicable surcharge and cess.'
    },
    {
      id: 'deductions',
      title: 'Deductions Allowed',
      content: 'For calculating its taxable income, a company can claim deductions for all legitimate expenses incurred "wholly and exclusively" for business purposes. Common deductions include:\n\n• Salaries, wages, and bonuses paid to employees.\n\n• Rent, electricity, and other office operational costs.\n\n• Depreciation on assets as per the Income Tax Act.\n\n• Marketing, advertising, and travel expenses.'
    },
    {
      id: 'itr-form',
      title: 'ITR Form for Companies',
      content: 'The prescribed Income Tax Return form for all private limited companies is Form ITR-6. This form must be filed electronically using a Digital Signature Certificate (DSC).'
    },
    {
      id: 'filing-deadlines',
      title: 'Filing Deadlines for Companies',
      content: 'The due date for filing ITR for a private limited company is October 31st of the assessment year, as all companies are mandatorily required to have their accounts audited.'
    },
    {
      id: 'roc-filings',
      title: 'Annual ROC Filings (Mandatory for Companies)',
      content: 'In addition to income tax, a private limited company must complete its annual compliance with the Registrar of Companies (ROC). This is a critical requirement under the Companies Act, 2013. The two primary forms are:\n\n• Form AOC-4 (Financial Statements): This form is used to file the company\'s audited financial statements, including the Balance Sheet, Profit & Loss Account, and Director\'s Report. The due date is within 30 days of the Annual General Meeting (AGM).\n\n• Form MGT-7 (Annual Return): This form contains a summary of the company\'s information as of the close of the financial year, including details of its shareholders, directors, and shareholding structure. The due date is within 60 days of the AGM.'
    },
    {
      id: 'gst-filing',
      title: 'GST Return Filing',
      content: 'A private limited company registered under GST must file monthly or quarterly returns if its annual turnover exceeds the prescribed threshold (generally ₹40 lakh for goods and ₹20 lakh for services). Key returns include GSTR-1 (for outward supplies) and GSTR-3B (a summary return), along with the annual return in GSTR-9.'
    },
    {
      id: 'tds-filing',
      title: 'TDS Return Filing',
      content: 'If a company holds a valid Tax Deduction and Collection Account Number (TAN), it must file quarterly TDS returns for taxes deducted on payments like salaries, rent, professional fees, and payments to contractors.'
    },
    {
      id: 'epf-filing',
      title: 'EPF Return Filing',
      content: 'A company with 20 or more employees must register for the Employees\' Provident Fund (EPF) and file monthly EPF returns to deposit contributions for its employees.'
    },
    {
      id: 'accounting',
      title: 'Accounting and Bookkeeping Requirements',
      content: 'Under the Companies Act, 2013, every private limited company must maintain proper books of accounts that give a true and fair view of its financial position. These records must be kept at its registered office.'
    },
    {
      id: 'statutory-audit',
      title: 'Statutory Audit Requirements',
      content: 'It is mandatory for every private limited company, regardless of its turnover or profit, to have its financial accounts audited by a practicing Chartered Accountant at the end of every financial year.'
    },
    {
      id: 'streamline',
      title: 'Streamline Your Company\'s Compliance with OnEasy',
      content: 'OnEasy is your trusted partner in ensuring your private limited company remains fully compliant. We offer end-to-end services covering every aspect of statutory and financial compliance to keep your business in good legal standing.\n\nOur services include:\n\n• Annual ROC Filings: We ensure timely filing of your financial statements (AOC-4) and annual return (MGT-7) to avoid heavy penalties.\n\n• Income Tax Return Filing: We handle the preparation and filing of your ITR-6 accurately and on time.\n\n• TDS & GST Return Filing: Our team manages your periodic tax filings to meet all reporting obligations seamlessly.\n\n• Accounting & Audit Support: We provide expert bookkeeping services and coordinate with auditors to ensure your statutory audit is completed smoothly.\n\nWith OnEasy\'s assistance, you can focus on growing your business while we handle the complexities of your compliance needs. Our team provides expert guidance on all regulations, ensuring that you are fully compliant and maximizing your benefits.\n\nAre you ready to simplify your company\'s compliance?\n\nGet started with OnEasy today for a hassle-free and compliant business journey.'
    }
  ];

  const faqs = [
    {
      question: 'What are the mandatory annual compliances for a Private Limited Company?',
      answer: 'Key annual compliances include filing Annual Returns (MGT-7), Financial Statements (AOC-4), Income Tax Returns, holding Annual General Meeting (AGM), and conducting Board Meetings.'
    },
    {
      question: 'How many Board Meetings should be held in a year?',
      answer: 'A minimum of 4 Board Meetings must be held each financial year, with not more than 120 days gap between two consecutive meetings.'
    },
    {
      question: 'What happens if I miss compliance deadlines?',
      answer: 'Missing deadlines can result in monetary penalties, ranging from ₹100 to ₹10,000 per day depending on the compliance. Repeated defaults may lead to legal action or director disqualification.'
    },
    {
      question: 'Do I need to appoint a Company Secretary?',
      answer: 'Companies with paid-up share capital of ₹5 crores or more must appoint a full-time Company Secretary. However, it\'s advisable for all companies to have professional compliance support.'
    },
    {
      question: 'What are the requirements for maintaining company records?',
      answer: 'Companies must maintain statutory registers, financial books, meeting minutes, and all important documents for at least 8 years. These should be kept at the registered office address.'
    },
    {
      question: 'How often should financial statements be prepared?',
      answer: 'Financial statements must be prepared annually, but it\'s recommended to maintain monthly accounts for better financial control and timely compliance.'
    },
    {
      question: 'What are DIN KYC requirements?',
      answer: 'Directors must file DIR-3 KYC annually to keep their Director Identification Number (DIN) active, typically due by September 30th each year.'
    },
    {
      question: 'Can I handle company compliance without professional help?',
      answer: 'While it\'s possible, it\'s not recommended due to the complexity of laws and severe penalties for non-compliance. Professional expertise helps ensure accuracy and timeliness.'
    },
    {
      question: 'What are the consequences of non-compliance?',
      answer: 'Consequences include monetary penalties, legal proceedings, restriction on business activities, director disqualification, and in severe cases, company strike-off.'
    },
    {
      question: 'How often should company details be updated with ROC?',
      answer: 'Any changes in company details (directors, registered office, share capital, etc.) must be reported to ROC within 30 days of such change through appropriate forms.'
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
                localStorage.setItem('selectedRegistrationType', 'company-compliance');
                localStorage.setItem('selectedRegistrationTitle', 'Company Compliance');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/company-compliance-form');
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
            introTitle="About Company Compliance"
            introDescription="Comprehensive compliance services for companies including accounting, tax filings, and ROC compliance."
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

export default CompanyComplianceDetails;

