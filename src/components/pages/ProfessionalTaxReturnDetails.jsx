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

function ProfessionalTaxReturnDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('professional-tax-return');

  const processSteps = [
    { step: 1, title: 'Data Collection', description: 'Collect employee professional tax data.' },
    { step: 2, title: 'Statement Preparation', description: 'Prepare professional tax statements.' },
    { step: 3, title: 'Filing & Payment', description: 'File returns and make professional tax payments.' }
  ];

  const documents = [
    'PAN Card',
    'Aadhaar Card',
    'Voter ID or Passport',
    'Bank account details',
    'Salary details or income proof',
    'Registration Certificate of business',
    'PT Registration Certificate',
    'Challans for Professional Tax payments',
    'Details of TDS from salary',
    'Any additional documents required'
  ];

  const prerequisites = [
    {
      title: 'Professional Tax Registration',
      description: 'Ensure your business is registered for professional tax with the relevant state authorities.'
    },
    {
      title: 'Employee Details',
      description: 'Maintain an updated list of all employees liable for professional tax, including their personal and salary information.'
    },
    {
      title: 'Salary and Wage Records',
      description: 'Keep accurate records of employee salaries and wages to calculate the professional tax liability.'
    },
    {
      title: 'Monthly Payment Records',
      description: 'Document the monthly professional tax payments made for employees.'
    },
    {
      title: 'Challan for Payment',
      description: 'Prepare the payment challan for the professional tax contributions due for the relevant period.'
    },
    {
      title: 'Form 5',
      description: 'Ensure Form 5 is accurately filled out, detailing the professional tax deductions for each employee.'
    },
    {
      title: 'KYC Documents',
      description: 'Collect and maintain KYC documents for employees, such as PAN and bank details.'
    },
    {
      title: 'Compliance Knowledge',
      description: 'Familiarize yourself with the latest professional tax regulations applicable in your state.'
    },
    {
      title: 'Audit Reports',
      description: 'If applicable, prepare audit reports to verify compliance with professional tax requirements.'
    }
  ];

  const aboutSections = [
    {
      id: 'pt-return-intro',
      title: 'About Professional Tax Return Filing',
      content: 'Professional Tax Return Filing is mandatory for individuals and businesses liable to pay Professional Tax, which is a tax imposed by the State Government on salaried individuals, professionals, or anyone engaged in a trade, calling, or employment. The Professional Tax Return is a document submitted to the state government that details the tax paid by the individual or business.\n\nFiling Professional Tax Returns can often be complex and time-consuming. At OnEasy, we provide comprehensive Professional Tax Return Filing services to help clients meet their tax obligations. Our team of experts ensures that the entire PT return filing process is completed efficiently and without hassle. From document collection to submission and payment of Professional Tax, we offer end-to-end assistance. Contact us today to leverage our PT return filing service and ensure compliance with state government regulations.'
    },
    {
      id: 'what-is-pt',
      title: 'What is Professional Tax?',
      content: 'Professional Tax is a direct tax imposed on individuals who earn an income through employment, profession, calling, or trade. Unlike the income tax levied by the Central Government, Professional Tax is collected by state governments or union territories in India.\n\nFor salaried individuals, employers are responsible for deducting Professional Tax from their salaries and depositing it with the state government. Self-employed individuals must pay their Professional Tax directly. While the tax calculations and amounts may vary by state, the maximum limit is set at Rs. 2,500 per year.'
    },
    {
      id: 'what-is-pt-return',
      title: 'What is a Professional Tax Return?',
      content: 'A Professional Tax Return is a mandatory document for individuals or businesses liable to pay Professional Tax. It contains information about the income earned and the tax paid during the financial year and must be filed with the relevant state government department.'
    },
    {
      id: 'who-needs-file',
      title: 'Who Needs to File Professional Tax Returns?',
      content: 'All individuals and businesses liable for Professional Tax must file their returns according to state regulations. For salaried employees, the employer handles the deduction and filing, while self-employed individuals are responsible for both.'
    },
    {
      id: 'applicability',
      title: 'Professional Tax Applicability Across India',
      content: 'Professional Tax is applicable in various states across India, including:\n\nAndhra Pradesh, Assam, Bihar, Chhattisgarh, Gujarat, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, and West Bengal.\n\nTaxpayers in these states must file their Professional Tax returns on time to avoid penalties.'
    },
    {
      id: 'slab-rates',
      title: 'Professional Tax Slab Rates',
      content: 'The slab rates for Professional Tax vary by state and are usually categorized based on monthly income:\n\n• Monthly Income less than Rs. 15,000\n\n• Monthly Income between Rs. 15,001 and Rs. 25,000\n\n• Monthly Income above Rs. 25,000\n\nEach state sets its own rates and slabs, so taxpayers should ensure compliance with their specific regulations.'
    },
    {
      id: 'exemptions',
      title: 'Exemptions from Filing Professional Tax Returns',
      content: 'Certain individuals may be exempt from filing Professional Tax Returns under applicable rules, including:\n\n• Individuals with professional tax liability below the prescribed limit.\n\n• Parents of children with mental or permanent disabilities.\n\n• Individuals with permanent physical disabilities, including blindness.\n\n• Members of the armed forces defined by the Army Act of 1950, Air Force Act of 1950, and Navy Act of 1957.\n\n• Badli workers in the textile industry.\n\n• Individuals above 65 years of age.'
    },
    {
      id: 'due-date',
      title: 'PT Return Due Date',
      content: 'The due date for filing Professional Tax Returns varies by state, and all individuals with Professional Tax Registration must comply with these deadlines.'
    },
    {
      id: 'benefits',
      title: 'Benefits of PT Return Filing',
      content: 'Filing the Professional Tax Return has several advantages, such as:\n\n• Avoiding Penalties: Timely filing and payment can help taxpayers avoid penalties and legal issues.\n\n• Compliance: Ensures adherence to applicable laws, preventing future legal complications.\n\n• Improved Creditworthiness: A clean tax record can enhance creditworthiness, making it easier to access financial services.\n\n• Access to Benefits: Filing may facilitate access to social security benefits, including medical insurance and pensions.\n\n• Convenience: The online filing process has simplified and made PT return filing more accessible.\n\n• Increased Government Revenue: Proper filing helps the government monitor tax liabilities and ensure accurate collections.'
    },
    {
      id: 'filing-procedure',
      title: 'Procedure for Professional Tax Return Filing',
      content: 'The general steps for filing a PTRC Return are as follows:\n\n• Obtain Professional Tax Registration Certificate: Ensure you have a PT Registration Certificate from the relevant state authority.\n\n• Determine Applicable Slab and Rate: Identify the correct slab and rate for your income based on state regulations.\n\n• Collect Necessary Documents: Gather all relevant documents, including salary slips and proof of tax payment.\n\n• Prepare the Return: Fill out the return in the prescribed format provided by the state authority.\n\n• Submit the Return: File the return with the required documents to the designated state authority office.\n\n• Pay the Tax: Remit any Professional Tax due along with the return.\n\n• Obtain Acknowledgment: Keep a record of the acknowledgment for the return filing and tax payment.\n\nIt\'s crucial to file returns and pay taxes within the specified deadlines to avoid penalties.'
    },
    {
      id: 'penalties',
      title: 'Penalties for Late Filing',
      content: 'Penalties for not submitting a Professional Tax return on time vary by state. Failure to register, late payment, or missing due dates can result in fines, late fees, and potential legal actions. For instance, in Maharashtra, penalties include:\n\n• Rs. 5 per day for not obtaining PT registration.\n\n• Rs. 1,000 for late filing of the Professional Tax return.\n\n• Interest at 1.25% per month, plus a 10% penalty for late payments.\n\nTo illustrate, delaying a Professional Tax payment of Rs. 1 lakh for 12 months could incur a total penalty of Rs. 12,250, including interest and late filing fees.'
    },
    {
      id: 'why-choose',
      title: 'Why Choose OnEasy for Professional Tax Return Filing?',
      content: 'Our team at OnEasy provides comprehensive assistance for Professional Tax Return Filing, ensuring compliance with state regulations. We file returns promptly, helping clients avoid penalties and legal complications.\n\nOur Professional Tax Return Filing service is designed to be hassle-free, allowing clients to concentrate on their business operations. With competitive pricing, we ensure that our clients receive exceptional value for their money.'
    }
  ];

  const faqs = [
    {
      question: 'What is Professional Tax?',
      answer: 'Professional Tax is a tax levied by state governments on individuals and businesses engaged in a profession, trade, or employment. It is calculated based on income and is mandatory for those liable to pay.'
    },
    {
      question: 'Who needs to file a Professional Tax Return?',
      answer: 'Individuals and businesses that earn income through employment or profession and are subject to Professional Tax must file a return. This includes salaried employees, self-employed individuals, and professionals.'
    },
    {
      question: 'What are the consequences of not filing a Professional Tax Return?',
      answer: 'Failing to file a Professional Tax Return can lead to penalties, interest charges, and legal actions from state authorities. It may also impact your creditworthiness and ability to access financial services.'
    },
    {
      question: 'What is the due date for filing a Professional Tax Return?',
      answer: 'The due date for filing Professional Tax Returns varies by state. It is crucial to check the specific deadlines set by your state government to avoid penalties.'
    },
    {
      question: 'What documents are required for filing a Professional Tax Return?',
      answer: 'Common documents needed include your PAN card, Aadhaar card, salary slips or income proof, Professional Tax registration certificate, and payment receipts for any Professional Tax already paid.'
    },
    {
      question: 'How is Professional Tax calculated?',
      answer: 'Professional Tax is calculated based on the income slabs defined by state governments. Each state has its own slab rates, which determine the amount of tax payable based on monthly or annual income.'
    },
    {
      question: 'Can I claim a refund for excess Professional Tax paid?',
      answer: 'Yes, if you have paid more than your actual liability, you can claim a refund. The process for claiming a refund varies by state, so check with your local tax authority for the correct procedure.'
    },
    {
      question: 'What is the penalty for late filing of a Professional Tax Return?',
      answer: 'Penalties for late filing vary by state but can include daily fines, interest on unpaid amounts, and fixed penalties for late submissions. It is essential to file on time to avoid these penalties.'
    },
    {
      question: 'Do I need to file a Professional Tax Return if my employer deducts it from my salary?',
      answer: 'Yes, even if your employer deducts Professional Tax from your salary, you may still be required to file a return. This ensures compliance with state regulations and provides a record of the tax paid.'
    },
    {
      question: 'How can OnEasy help with Professional Tax Return Filing?',
      answer: 'OnEasy provides comprehensive assistance for Professional Tax Return Filing, ensuring compliance with state regulations, timely submissions, and expert guidance throughout the process to help clients avoid penalties and legal issues.'
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
                localStorage.setItem('selectedRegistrationType', 'professional-tax-return');
                localStorage.setItem('selectedRegistrationTitle', 'Professional Tax Return Filing');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/professional-tax-return-form');
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
            introTitle="About Professional Tax Return Filing"
            introDescription="Professional tax return filing ensures compliance with state-specific regulations."
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

export default ProfessionalTaxReturnDetails;

