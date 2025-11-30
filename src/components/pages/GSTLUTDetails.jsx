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

function GSTLUTDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  // Packages as per user requirements
  const packages = [
    {
      name: 'Starter',
      price: '999',
      priceValue: 999,
      originalPrice: '1,999',
      originalPriceValue: 1999,
      period: 'One Time',
      description: 'Basic LUT registration package',
      icon: '★',
      features: [
        'LUT Application',
        'LUT Certificate',
        'GST Exemption'
      ],
      color: 'blue'
    },
    {
      name: 'Growth',
      price: '3,999',
      priceValue: 3999,
      originalPrice: '4,999',
      originalPriceValue: 4999,
      period: 'One Time',
      description: 'Enhanced LUT package',
      icon: '✢',
      features: [
        'LUT Application',
        'LUT Certificate',
        'GST Exemption',
        'GST Registration',
        'CA Consultation',
        'GST returns filings for one month'
      ],
      color: 'blue'
    },
    {
      name: 'Pro',
      price: '10,999',
      priceValue: 10999,
      originalPrice: '13,999',
      originalPriceValue: 13999,
      period: 'One Time',
      description: 'Complete LUT solution',
      icon: '✤',
      features: [
        'LUT Application',
        'LUT Certificate',
        'GST Exemption',
        'GST Registration',
        'CA Consultation',
        'GST returns filings for 12 months'
      ],
      isHighlighted: true,
      color: 'blue'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Document Preparation',
      description: 'Our team helps you prepare all necessary documents including LUT cover letter, GST registration certificate, PAN card, KYC documents, and authorization letter.'
    },
    {
      step: 2,
      title: 'Form GST RFD-11 Submission',
      description: 'We submit the LUT application through Form GST RFD-11 on the GST portal on your behalf, ensuring accuracy and compliance with all requirements.'
    },
    {
      step: 3,
      title: 'LUT Certificate Issuance',
      description: 'Once approved, you receive your LUT certificate valid for one financial year, enabling tax-free exports without upfront IGST payments.'
    }
  ];

  const documents = [
    'Proof of GST Registration',
    'PAN Card of the entity',
    'KYC of authorized person',
    'Canceled Cheque',
    'Authorization Letter for the authorized signatory'
  ];

  const prerequisites = [
    {
      title: 'Eligibility Criteria for LUT Registration',
      description: 'The following are the key eligibility requirements for obtaining an LUT certificate:\n\n• Any registered taxpayer who are engaged in the export of goods and/or services can apply for an LUT. However, individuals who have been prosecuted for tax evasion exceeding Rs. 250 lakh are ineligible.\n• Intent to Supply: The applicant should intend to supply goods or services either within India, to foreign countries, or to Special Economic Zones (SEZs).\n• GST Registration: The business must be registered under GST.\n• Tax-Free Supply: The entity must intend to supply goods without paying integrated tax.'
    }
  ];

  const aboutSections = [
    {
      id: 'understanding-lut',
      title: 'Understanding LUT in GST',
      content: 'LUT, short for Letter of Undertaking, plays a crucial role in the Goods and Services Tax (GST) framework. It enables exporters to export goods or services without the immediate payment of tax, making it a valuable tool for businesses engaged in international trade.'
    },
    {
      id: 'gst-lut-form',
      title: 'GST LUT Form for Exporters',
      content: 'For all registered taxpayers exporting goods or services, it is mandatory to submit a Letter of Undertaking (LUT) through Form GST RFD-11 on the GST portal. This allows exporters to send goods or services without paying IGST upfront.'
    },
    {
      id: 'lut-bond',
      title: 'Understanding the LUT Bond',
      content: 'LUT under GST is valid for one year, and a new LUT must be submitted for each financial year. If the terms of the LUT are not met, the exporter may need to provide a bond to continue exporting without paying IGST.\n\nLUTs and bonds apply in the following cases:\n\n• Zero-Rated Supply to SEZ: Exporting to SEZs without IGST payment.\n• Goods Export: Exporting goods outside India without IGST payment.\n• Service Export: Providing services to clients in foreign countries without IGST payment.'
    },
    {
      id: 'advantages',
      title: 'Advantages of Filing LUT for Exporters',
      content: [
        {
          title: 'Tax-Free Exports',
          description: 'Exporters can carry out transactions without paying taxes upfront, avoiding the need to claim refunds.'
        },
        {
          title: 'Simplified Process',
          description: 'Exporters avoid the complexities of refund claims and reduce follow-up with tax authorities.'
        },
        {
          title: 'Unblocked Working Capital',
          description: 'Funds remain accessible for operational needs instead of being locked in tax payments.'
        },
        {
          title: 'Long-Term Validity',
          description: 'Once filed, the LUT is valid for the entire financial year, reducing repetitive paperwork.'
        }
      ]
    },
    {
      id: 'key-reminders',
      title: 'Key Reminders About LUT Bonds in GST',
      content: 'Validity Period: An LUT is valid for one year from the date of submission.\n\nConditional Acceptance: Failure to meet the terms may result in privilege revocation, and the exporter may need to submit a bond.\n\nAlternative Bonding: Those ineligible for LUT registration can provide a bond, usually with a bank guarantee.\n\nOfficial Letterhead: LUT applications must be submitted on the registered entity\'s letterhead.\n\nPrescribed Form: LUT must be applied through the official GST RFD-11 form.\n\nBank Guarantee Limit: The bank guarantee should not exceed 15% of the bond amount.\n\nBy staying mindful of these points, exporters can ensure a smooth process when filing LUT under GST regulations.'
    },
    {
      id: 'why-oneasy',
      title: 'Simplify LUT Filing with OnEasy',
      content: 'Navigating the complexities of LUT (Letter of Undertaking) filing for exporters is now easier with OnEasy. Our team of experts specializes in streamlining the entire process, allowing you to focus on expanding your export operations. From document preparation to seamless submission of the GST RFD-11 form, we offer end-to-end support to ensure accuracy and compliance at every step. With OnEasy by your side, you can enjoy tax-free exports without the hassle of navigating complex procedures.\n\nContact us today to experience a simplified and efficient GST LUT filing process, empowering your export ventures like never before.'
    }
  ];

  const faqs = [
    {
      question: 'What is a GST LUT (Letter of Undertaking)?',
      answer: 'A GST LUT is a document that allows exporters to export goods or services without paying Integrated Goods and Services Tax (IGST) at the time of supply. It helps businesses reduce their working capital blockage by avoiding upfront tax payments.'
    },
    {
      question: 'Who is eligible to file a GST LUT?',
      answer: 'Any registered taxpayer engaged in exporting goods or services is eligible to file a GST LUT. However, taxpayers prosecuted for tax evasion exceeding Rs. 250 lakh are not eligible.'
    },
    {
      question: 'What is the validity period of a GST LUT?',
      answer: 'A GST LUT is valid for one financial year. Exporters need to renew it by filing a new LUT for each subsequent financial year.'
    },
    {
      question: 'How do I apply for a GST LUT?',
      answer: 'You can apply for a GST LUT by submitting Form GST RFD-11 through the GST portal. The form should be filled out and signed by an authorized person, and the required documents must be uploaded.'
    },
    {
      question: 'What documents are required for GST LUT registration?',
      answer: 'The required documents include a LUT cover letter, GST registration certificate, PAN card, KYC of the authorized person, canceled cheque, IEC code (if applicable), and an authorized signatory letter.'
    },
    {
      question: 'What happens if the conditions of the GST LUT are not met?',
      answer: 'If the exporter fails to meet the conditions of the GST LUT within the specified timeframe, the authorities may withdraw the privileges, and the exporter may be required to furnish a bond.'
    },
    {
      question: 'Can an entity ineligible for GST LUT still export without paying IGST?',
      answer: 'Yes, entities ineligible for LUT can furnish a bond along with a bank guarantee to export goods or services without paying IGST upfront.'
    },
    {
      question: 'What is the process to renew a GST LUT?',
      answer: 'To renew a GST LUT, the exporter must file a fresh LUT through Form GST RFD-11 on the GST portal at the beginning of each financial year.'
    },
    {
      question: 'What are the benefits of filing a GST LUT for exporters?',
      answer: 'Filing a GST LUT allows exporters to export goods and services without paying IGST, thereby improving cash flow, avoiding refund claims, and simplifying the tax filing process.'
    },
    {
      question: 'Is it mandatory for all exporters to file a GST LUT?',
      answer: 'Yes, exporters who wish to export goods or services without paying IGST must file a GST LUT. If they do not file an LUT, they must pay the tax and then claim a refund later.'
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
                  console.log('Initiating payment for GST LUT Registration:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'gst-lut');
                  localStorage.setItem('selectedRegistrationTitle', 'Letter of Undertaking (LUT)');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success && result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/gst-lut-form');
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
            introTitle="About GST LUT Registration"
            introDescription="The GST LUT Form is an essential document that allows you to manage your export transactions without paying Integrated Goods and Services Tax (IGST) at the time of supply. OnEasy is here to help you efficiently complete the GST LUT Form filing process, making your export journey smoother and more efficient."
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

export default GSTLUTDetails;

