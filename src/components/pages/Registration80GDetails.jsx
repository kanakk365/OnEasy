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
import { initPayment } from '../../utils/payment';

function Registration80GDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  // Packages as per user requirements - only 2 packages
  const packages = [
    {
      name: 'Starter',
      price: '9,999',
      priceValue: 9999,
      period: 'One Time',
      description: 'Basic 80G registration package',
      icon: '★',
      features: [
        '80G Application',
        '80G Registration',
        '80G Temporary Registration certificate'
      ],
      color: 'blue'
    },
    {
      name: 'Growth',
      price: '16,999',
      priceValue: 16999,
      period: 'One Time',
      description: 'Complete 80G and 12A registration package',
      icon: '✢',
      features: [
        '80G Application',
        '80G Registration',
        '80G Temporary Registration certificate',
        'Form 12A Application',
        'Form 12A Registration'
      ],
      isHighlighted: true,
      color: 'blue'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Application Submission',
      description: 'Submit Form 10A for provisional 80G registration or Form 10G for regular registration to the Commissioner of Income Tax Department along with all required documents.'
    },
    {
      step: 2,
      title: 'Document Examination and Verification',
      description: 'The Income Tax Department reviews the provided documents. If additional information is needed, officials may request further documents within a specified timeframe.'
    },
    {
      step: 3,
      title: 'Certificate Issuance',
      description: 'Upon satisfactory verification, the Commissioner issues the 80G Certificate. Provisional registration is valid for 3 years, and regular registration is valid for 5 years after renewal.'
    }
  ];

  const documents = [
    'Form 10A/ 10G',
    'Trust deed/Section 8 Company certificate',
    'MOA and AOA (Section 8 companies only)',
    'PAN card of the organization',
    'Bank Statement of the organization',
    'Organization\'s past 3-year audited accounts',
    'List of trustees/members/directors',
    'List of activities carried out by the organization'
  ];

  const prerequisites = [
    {
      title: 'Eligibility Criteria for 80G Registration',
      description: 'To qualify for 80G registration, charitable organizations must meet these criteria:\n\n• Legal Structure: The organization must be registered under a recognized legal structure in India, such as a trust, society, or nonprofit company.\n• Non-Profit Objective: The primary focus should be on charitable activities, not profit generation.\n• Proper Documentation: The organization must keep accurate financial records and have its accounts audited annually to comply with income tax regulations.\n• Compliance with Statutory Requirements: The organization must adhere to the requirements under Sections 11 and 12 of the Income Tax Act to qualify for 80G registration.\n• Non-Exempt Business Income: Organizations should avoid non-exempt income from business activities. If they have business income, it must be separately recorded, and donations should be used only for charitable purposes.\n• Non-Exclusive Focus: The organization should not exclusively benefit a specific religious community or caste.\n• Darpan Portal Registration: For registration or revalidation, organizations must obtain a Darpan Portal registration number from Niti Aayog, especially if they receive or plan to receive government grants or assistance.\n• Audit Reports: If the NGO\'s income exceeds the threshold specified under the Income Tax Act, it must be audited by a chartered accountant.\n• Utilization of Funds: At least 85% of the income must be used for the organization\'s objectives within India to ensure funds are effectively utilized for charitable purposes.'
    }
  ];

  const aboutSections = [
    {
      id: 'what-is-section-80g',
      title: 'What is Section 80G?',
      content: 'Section 80G of the Income Tax Act, 1961, enables individuals and entities to claim tax deductions on donations made to eligible charitable organizations. When an organization receives an 80G certificate, it is recognized by the Income Tax Department as eligible for tax-exempt donations. Donors contributing to such organizations can claim tax deductions on the donation amount, up to a specified limit, helping reduce their tax liability and promoting charitable giving.'
    },
    {
      id: 'what-is-80g-registration',
      title: 'What is 80G Registration?',
      content: '80G registration allows donors to claim tax deductions on donations made to certified charitable organizations. This registration provides tax benefits to both donors and recipients. Charitable organizations registered under Section 80G can receive tax-deductible donations, and donors can claim deductions on these donations in their income tax returns.\n\nThe Finance Act, 2020, introduced changes to India\'s 80G registration provisions, including the requirement for organizations with 80G registration to file annual returns, verification of donors by the Income Tax Department, and potential reassessment or revocation for non-compliance.'
    },
    {
      id: 'importance',
      title: 'Importance of 80G Registration',
      content: 'Under Section 80G of the Income Tax Act, donors - including individuals, corporations, and associations - are entitled to claim tax deductions for contributions made to NGOs. The deduction is governed by Section 80G provisions, with a stipulated ceiling of ten percent of the donor\'s gross total income. The provision exclusively applies to monetary donations.\n\nFor compliance purposes, NGOs must issue donation receipts specifying their 80G certificate number and date to establish the certification validity period.'
    },
    {
      id: 'benefits',
      title: 'Benefits of 80G Registration',
      content: [
        {
          title: 'Tax Deductions',
          description: 'Donors can claim deductions of up to 50% or 100% of their donations, depending on the type of organization.'
        },
        {
          title: 'Enhanced Credibility',
          description: '80G registered organizations are seen as trustworthy, attracting more donors.'
        },
        {
          title: 'Increased Donations',
          description: 'Tax benefits make organizations more appealing to donors, increasing donations from both individuals and businesses.'
        },
        {
          title: 'Wider Reach',
          description: '80G registration allows charities to connect with a broader range of donors, boosting their fundraising potential.'
        },
        {
          title: 'Compliance and Transparency',
          description: '80G registration ensures that the organization meets legal standards and operates transparently.'
        }
      ]
    },
    {
      id: 'validity-renewal',
      title: '80G Registration Validity and Renewal',
      content: 'The initial provisional registration under Section 80G is valid for three years. After this period, organizations must renew their registration. Once renewed, the registration remains valid for five years. To maintain the benefits of 80G registration, organizations must renew it every five years.'
    },
    {
      id: 'provisional-process',
      title: 'Provisional 80G Registration Process',
      content: 'To get an 80G Registration Certificate, follow these four steps:\n\n• Application Submission: Submit Form No. 10A for 80G registration to the Commissioner of the Income Tax Department in the organization\'s jurisdiction.\n• Document Examination: The Income Tax Department will review the provided documents.\n• Additional Information: If more information is needed, officials may request further documents. These should be provided within the specified timeframe.\n• Certification Issuance: If satisfied with the verification, the Commissioner will issue the 80G Certificate to the organization.'
    },
    {
      id: 'transition',
      title: 'Transition from Provisional to Regular 80G Registration',
      content: 'Before the provisional registration expires, NGOs must apply for regular registration, which is valid for five years. This stage involves a comprehensive review of the NGO\'s activities and finances.'
    },
    {
      id: 'regular-process',
      title: 'Process for Regular 80G Registration',
      content: 'Submit Form 10G: Complete Form 10G and submit it with the required documents to the Income Tax Department.\n\nInspection: The Income Tax Officer (ITO) may conduct an on-site inspection.\n\nApproval: Upon a satisfactory review, the NGO receives regular 80G registration, valid for five years.'
    },
    {
      id: 'why-oneasy',
      title: 'Simplify 80G Registration with OnEasy!',
      content: 'Streamline your 80G registration process with OnEasy. Our experts will assist with every step, from the application submission to obtaining the 80G certificate, providing you with a smooth and efficient experience. Let us handle the process so you can focus on your charitable work.'
    }
  ];

  const faqs = [
    {
      question: 'What is 80G registration?',
      answer: '80G registration is a certification under Section 80G of the Income Tax Act, allowing donors to claim tax deductions on contributions made to charitable organizations registered under this section.'
    },
    {
      question: 'Who is eligible for 80G registration?',
      answer: 'NGOs, trusts, societies, and non-profit Section 8 companies that operate solely for charitable purposes are eligible, provided they meet specific legal and compliance criteria.'
    },
    {
      question: 'What are the benefits of obtaining 80G registration for an NGO?',
      answer: '80G registration helps NGOs attract more donors by allowing them to offer tax deductions on donations, enhancing their credibility and increasing their fundraising potential.'
    },
    {
      question: 'How can donors claim tax deductions on donations made to an 80G-registered organization?',
      answer: 'Donors can claim deductions when filing their income tax returns by providing the donation receipt, which includes the organization\'s 80G certificate details.'
    },
    {
      question: 'How long is the 80G certificate valid?',
      answer: 'The initial provisional 80G registration is valid for three years, and after renewal, it is valid for five years. It must be renewed every five years thereafter to maintain its validity.'
    },
    {
      question: 'What documents are required to apply for 80G registration?',
      answer: 'Documents such as trust deed or registration certificate, PAN card, bank statements, audited accounts of the past three years, list of trustees, and a record of activities are required.'
    },
    {
      question: 'Can a newly formed NGO apply for 80G registration?',
      answer: 'Yes, a newly formed NGO can apply for provisional 80G registration, which is initially granted for three years.'
    },
    {
      question: 'What are the tax deduction limits for donations under 80G?',
      answer: 'Donations are eligible for either a 50% or 100% deduction of the contributed amount, depending on the type of organization and subject to certain conditions.'
    },
    {
      question: 'How does an NGO apply for renewal of 80G registration?',
      answer: 'NGOs need to apply for renewal using Form 10A or 10G, six months before the expiry of the current certificate or within six months of the beginning of their activities.'
    },
    {
      question: 'Can an 80G registration be revoked?',
      answer: 'Yes, the Income Tax Department can revoke 80G registration if the organization fails to meet compliance requirements or is found to misuse funds or not fulfil charitable objectives.'
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
                  console.log('Initiating payment for 80G Registration:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'registration-80g');
                  localStorage.setItem('selectedRegistrationTitle', '80G Registration');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success && result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/registration-80g-form');
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
            introTitle="About 80G Registration"
            introDescription="Registering your NGO under Section 80G can significantly improve your donor appeal by offering them tax deductions on their contributions. This financial incentive makes donations to your organization more attractive, enhancing your fundraising efforts. For charitable organizations seeking 80G registration, OnEasy is here to assist. Our team will guide you through the entire 80G registration process, making it smooth and efficient."
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
    </div>
  );
}

export default Registration80GDetails;

