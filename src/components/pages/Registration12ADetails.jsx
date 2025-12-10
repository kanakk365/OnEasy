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

function Registration12ADetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages: apiPackages, loading: packagesLoading } = usePackages('12a');
  
  // Use packages from API, fallback to empty array if loading
  const packages = packagesLoading ? [] : apiPackages;

  const processSteps = [
    {
      step: 1,
      title: 'Application Submission',
      description: 'Submit Form 10A application online with all required documents including registration certificate, objectives documentation, and financial statements.'
    },
    {
      step: 2,
      title: 'Additional Information and Verification',
      description: 'The Commissioner may request additional information to verify the organization\'s authenticity and charitable purpose.'
    },
    {
      step: 3,
      title: 'Approval and Registration',
      description: 'Upon satisfaction, a written order granting Section 12A registration is issued. The registration remains valid indefinitely unless cancelled.'
    }
  ];

  const documents = [
    'Registration Certificate',
    'Self-certified institution establishment proof',
    'Organization\'s objectives documentation',
    'Annual financial statements for the last 3 years',
    'Activities conducted by the organization',
    'Copy of any prior rejection orders'
  ];

  const prerequisites = [
    {
      title: 'Eligible Organizations for Section 12A Registration',
      description: 'The following types of organizations are eligible for Section 12A registration:\n\n• Trusts: Public charitable trusts, religious trusts, and other trusts established for charitable or religious activities.\n• Institutions: Charitable or religious institutions, such as schools, hospitals, and other similar establishments.\n• NGOs: Nonprofits engaged in social welfare, community development, or environmental protection.\n• Societies: Societies registered under the Societies Registration Act, 1860, with a charitable or religious focus.\n• Section 8 Companies: Nonprofits registered under Section 8 of the Companies Act 2013 for purposes such as promoting art, science, commerce, sports, education, research, or social welfare.'
    },
    {
      title: 'Eligibility Criteria for Form 12A',
      description: 'To file Form 12A, an organization must meet certain criteria:\n\n• The organization must have a clear charitable purpose as defined in the Income Tax Act, such as providing relief to the poor, education, or environmental protection.\n• Public utility objectives also qualify as charitable purposes.\n• The organization should have no profit motive.\n• Organizations involved in trade or commerce can register only if trade receipts make up less than 20% of total income.\n• Private or family trusts are not eligible.\n• Activities must genuinely benefit the public to qualify.'
    }
  ];

  const aboutSections = [
    {
      id: 'understanding-section-12a',
      title: 'Understanding Section 12A of the Income Tax Act',
      content: 'Upon establishing a Trust, NGO, or nonprofit organization, it is necessary to register under Section 12A of the Income Tax Act to claim exemptions offered by Sections 11 and 12. Section 12A enables nonprofit entities, such as charitable trusts, welfare societies, religious institutions, and other nonprofit organizations, to enjoy full tax exemption under the Income Tax Act of 1961.\n\nIf a nonprofit trust or NGO does not register for 12A, its financial receipts and transactions are fully taxable. Note that private or family trusts are not eligible for this exemption and cannot apply for 12A Registration.'
    },
    {
      id: 'benefits',
      title: 'Benefits of 12A Registration',
      content: [
        {
          title: 'Application of Income',
          description: 'Funds utilized for charitable or religious purposes are considered in income applications, meaning that these expenses are counted when calculating the nonprofit\'s taxable income.'
        },
        {
          title: 'Income Tax Exemption',
          description: 'Registered nonprofits receive exemption from income tax, allowing them to allocate more resources toward their social initiatives.'
        },
        {
          title: 'Income Accumulation',
          description: 'Registered entities can set aside income for future use, provided that no more than 15% of the funds are reserved for charitable purposes.'
        },
        {
          title: 'Exclusion from Total Income',
          description: 'Income applied toward charitable purposes is excluded from total income, reducing the organization\'s tax liability.'
        },
        {
          title: 'Grant Eligibility',
          description: 'Section 12A registered NGOs qualify to receive grants from both domestic and international sources, including agencies and institutions that specifically support registered entities.'
        },
        {
          title: 'One-Time Registration',
          description: 'Registration under Section 12A is granted once, with no need for renewal, and remains active until cancelled.'
        },
        {
          title: 'Flexible Benefits',
          description: 'NGOs registered under Form 12A can access the benefits of this registration whenever needed without requiring renewals, providing a flexible approach to tax exemptions.'
        }
      ]
    },
    {
      id: 'form-10a',
      title: 'Filing Form 10A for Registration',
      content: 'Form 10A is essential for entities registering under Section 12A. The entire process is online, requiring a digital signature for verification. The application, along with required documents, should be submitted to the Commissioner of Income Tax. This online process ensures efficiency and ease in meeting registration requirements.'
    },
    {
      id: 'validity',
      title: 'Validity of Section 12A Registration',
      content: 'Once obtained, Section 12A registration remains valid indefinitely unless cancelled by the Income Tax Department. Unlike other registrations, Section 12A does not require renewal.'
    },
    {
      id: 'procedure',
      title: '12A Registration Procedure',
      content: 'The procedure involves the following steps:\n\n• Application Submission: The applicant files an online application with supporting documents.\n• Additional Information Request: The Commissioner may request further details to verify the organization\'s authenticity.\n• Approval and Written Order: Upon satisfaction, a written order granting Section 12A registration is issued to the applicant.\n• Registration Privileges: Once approved, the organization can access the benefits of Section 12A registration.\n• Rejection Notification: If the application is incomplete or non-compliant, the Commissioner may reject it, and the applicant will be informed of the reasons.\n\nBy following these steps, organizations can complete Form 12A to receive tax benefits under Section 12A of the Income Tax Act.'
    },
    {
      id: 'why-oneasy',
      title: 'How OnEasy Can Assist with 12A Registration',
      content: 'At OnEasy, we simplify the 12A registration process, providing expert support at every step. Our team ensures all requirements are met, documentation is prepared accurately, and the registration process is managed efficiently. With extensive knowledge of the process, we help nonprofits navigate the legalities with ease, ensuring compliance with the necessary formalities. Let OnEasy be your trusted partner in obtaining Section 12A registration for your nonprofit organization.'
    }
  ];

  const faqs = [
    {
      question: 'What is 12A Registration, and who needs it?',
      answer: '12A Registration is a one-time registration granted by the Income Tax Department that provides tax exemptions for nonprofit organizations, such as trusts, NGOs, and Section 8 companies. It is essential for organizations seeking tax relief on surplus income dedicated to charitable or religious purposes.'
    },
    {
      question: 'What are the benefits of obtaining 12A Registration?',
      answer: 'Organizations with 12A Registration enjoy several benefits, including income tax exemptions on funds applied to charitable purposes, eligibility for grants, and the ability to accumulate income for future use, which helps reduce tax liabilities.'
    },
    {
      question: 'Who is eligible to apply for 12A Registration?',
      answer: 'Entities like public charitable trusts, religious trusts, societies, Section 8 companies, and NGOs engaged in social welfare or charitable activities are eligible for 12A Registration. However, private or family trusts are not eligible.'
    },
    {
      question: 'Is 12A Registration a one-time process?',
      answer: 'Yes, 12A Registration is granted as a one-time process. Once registered, the status remains valid unless it is cancelled or revoked by the Income Tax Department.'
    },
    {
      question: 'What is the difference between 12A and 80G Registration?',
      answer: '12A Registration provides tax exemption to the nonprofit organization itself, while 80G Registration allows donors to receive tax deductions on donations made to the organization. Both registrations are beneficial but serve different purposes.'
    },
    {
      question: 'What documents are required for 12A Registration?',
      answer: 'Key documents required include a self-certified copy of the trust deed or organization\'s constitution, registration certificates, financial statements for the previous three years, and a detailed note on the organization\'s activities.'
    },
    {
      question: 'Can an organization apply for both 12A and 80G Registration?',
      answer: 'Yes, an organization can apply for both 12A and 80G registrations. While 12A Registration benefits the organization by offering tax exemptions, 80G Registration provides tax deduction benefits to donors, encouraging more donations.'
    },
    {
      question: 'How long does it take to obtain 12A Registration?',
      answer: 'The timeframe can vary based on the application\'s completeness and the processing time of the Income Tax Department. Typically, it takes a few weeks after submission, though delays may occur if additional documents are requested.'
    },
    {
      question: 'Can 12A Registration be cancelled?',
      answer: 'Yes, the Income Tax Department may cancel 12A Registration if the organization fails to comply with regulatory guidelines or is found engaging in activities not aligned with charitable purposes.'
    },
    {
      question: 'Is 12A Registration mandatory for NGOs to receive grants?',
      answer: 'While not mandatory in all cases, 12A Registration significantly increases an NGO\'s eligibility to receive grants from both domestic and international sources, as many funding agencies require it as a prerequisite for financial support.'
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
        return (
          <div>
            <PackagesSection
              packages={packages}
              onGetStarted={async (selectedPackage) => {
                try {
                  console.log('Initiating payment for 12A Registration:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'registration-12a');
                  localStorage.setItem('selectedRegistrationTitle', '12A Registration');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success) {
                    if (result.showPopup) {
                      console.log('✅ Payment successful! Showing popup...');
                      setShowPaymentPopup(true);
                    } else if (result.redirect) {
                      console.log('✅ Payment successful! Redirecting to form...');
                      navigate('/registration-12a-form');
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
          </div>
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
            introTitle="About 12A Registration"
            introDescription="12A Registration, granted by the Income Tax Department, is a one-time registration available for trusts and other nonprofit organizations. The primary purpose of this registration is to secure an exemption from income tax payments. Most organizations apply for 12A Registration shortly after establishment. Nonprofit entities, including Section 8 Companies, Trusts, and NGOs, benefit from income tax exemptions on their surplus income once they obtain 12A Registration. At OnEasy, we understand the importance of Section 12A registration for nonprofit organizations. Our team provides comprehensive guidance and support throughout the registration process, helping you unlock the tax benefits and privileges available under Section 12A of the Income Tax Act. Contact OnEasy today to start your journey toward Section 12A registration, and let us handle the technicalities while you focus on driving positive social impact."
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
            onClick={() => navigate('/registrations/registration-12a')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            My Registrations
          </button>
        </div>

        {/* Payment Success Popup */}
        {showPaymentPopup && (
          <PaymentSuccessPopup onClose={() => setShowPaymentPopup(false)} />
        )}

        {/* Tabs */}
        <TopTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
        
        {renderTabContent()}
      </div>
    </div>
  );
}

export default Registration12ADetails;

