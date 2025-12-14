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

function FSSAIRenewalDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('fssai-renewal');

  const processSteps = [
    {
      step: 1,
      title: 'Application Submission',
      description: 'Submit the FSSAI renewal application with all required documents.'
    },
    {
      step: 2,
      title: 'Document Verification',
      description: 'FSSAI authorities verify the submitted documents and application details.'
    },
    {
      step: 3,
      title: 'License Renewal',
      description: 'Upon successful verification, the FSSAI license is renewed and the certificate is issued.'
    }
  ];

  const documents = [
    'Identity proof of the applicant',
    'Address proof of the business',
    'Registration Certificate of business',
    'NOC from local authorities',
    'FSMS Certificate',
    'Nominee Details',
    'License Modifications',
    'Supporting Documents for Modifications',
    'Additional Licensing Authority Requirements',
    'Additional Documents'
  ];

  const prerequisites = [
    {
      title: 'Application Form',
      description: 'Fill out the appropriate renewal application form available on the FSSAI website.'
    },
    {
      title: 'Current License',
      description: 'Provide details of your current FSSAI license, including the license number and validity period.'
    },
    {
      title: 'Compliance Certificate',
      description: 'Ensure you have complied with food safety regulations during the license\'s validity, including inspections and audits.'
    },
    {
      title: 'Fee Payment',
      description: 'Pay the requisite renewal fee online.'
    },
    {
      title: 'Health and Hygiene Standards',
      description: 'Ensure that your business meets the required health and hygiene standards as mandated by FSSAI.'
    },
    {
      title: 'Additional Requirements',
      description: 'Depending on the category of the food business, there may be specific additional requirements to fulfil.'
    }
  ];

  const aboutSections = [
    {
      id: 'fssai-renewal-intro',
      title: 'About FSSAI Renewal',
      content: 'Obtaining and renewing an FSSAI license or registration is essential for food businesses to comply with legal standards and ensure safety. The Renewal of FSSAI licenses, mandated by the Food Safety and Standards Authority of India, is crucial for maintaining compliance with safety regulations and quality benchmarks. Typically, these licenses are valid for 1 to 5 years, so timely renewal is essential to avoid business interruptions.\n\nAt OnEasy, we offer comprehensive support for renewing your FSSAI license or registration, streamlining the process to ensure your food business adheres to all necessary safety and quality standards.'
    },
    {
      id: 'understanding-fssai',
      title: 'Understanding FSSAI License and Registration',
      content: 'For businesses involved in manufacturing, storing, transporting, or distributing food within India, securing an FSSAI license or registration is a legal requirement. The type of FSSAI license needed depends on the scale and nature of the operation.\n\nThe FSSAI registration process assigns a unique 14-digit number to the Food Business Operator (FBO), which must be displayed on all food packaging. This registration ensures compliance with national food safety standards and provides legal benefits to the food enterprise.'
    },
    {
      id: 'fssai-registration',
      title: 'FSSAI Registration',
      content: 'FSSAI registration is mandatory for small-scale food manufacturers or Food Business Operators (FBOs) with an annual turnover of less than ₹12 lakhs. This registration serves as a fundamental step toward ensuring food safety and standards compliance, allowing small food businesses to operate legally within India.'
    },
    {
      id: 'fssai-license',
      title: 'FSSAI License',
      content: 'An FSSAI license is essential for food enterprises whose turnover exceeds ₹12 lakhs, especially for FBOs engaged in food processing and manufacturing. The license is categorized into two main types based on the scale and nature of the business:\n\n• State License: Suitable for medium-sized food businesses operating within a specific state, typically with a turnover between ₹12 lakhs and ₹20 crores.\n\n• Central License: Required for larger food businesses, particularly those with a turnover exceeding ₹20 crores or involved in import/export activities across multiple states.'
    },
    {
      id: 'validity',
      title: 'Validity of FSSAI License and Registration',
      content: 'FSSAI licenses and registrations are not lifetime credentials; they have specific durations and must be renewed periodically to ensure continuous compliance with food safety standards. Following an FSSAI order effective from 12th January 2023, the validity periods for FSSAI licenses and registrations have been standardized:\n\n• FSSAI Registration: 1 to 5 Years (as per applicant\'s choice)\n\n• FSSAI State License: 1 year\n\n• FSSAI Central License: 1 year\n\nFBOs must ensure timely renewal to avoid disruptions in their food business operations.'
    },
    {
      id: 'renewal-process',
      title: 'Renewal of FSSAI License',
      content: 'Renewing your FSSAI license is a crucial step to undertake before the current license expires. This process is vital to ensure that your food business remains compliant with the latest food safety regulations and standards, avoiding potential legal issues or disruptions in operations. It\'s recommended to initiate the renewal process well before the expiration date for a smooth continuation of your business activities.'
    },
    {
      id: 'benefits',
      title: 'Benefits of Renewing Your FSSAI License/Registration',
      content: 'Renewing your FSSAI license or registration offers several key benefits for the seamless operation and growth of your food business:\n\n• Continuous Legal Compliance: Ensures alignment with current food safety laws and regulations.\n\n• Uninterrupted Business Operations: Facilitates seamless activities without the risk of shutdown due to an expired license.\n\n• Consumer Confidence: Valid FSSAI licenses reassure customers about the safety and quality of food products.\n\n• Avoidance of Penalties: Timely renewal helps prevent fines associated with expired licenses.\n\n• Quality Improvement: Emphasizes the importance of upholding food safety and quality standards.\n\n• Market Expansion: A current FSSAI license is often essential for entering new markets and expanding business operations.\n\n• Brand Credibility: Enhances your brand\'s reputation, showcasing a commitment to food safety.\n\n• Regulatory Updates: Keeps you informed about new regulations and standards in the food industry.\n\n• Risk Management: Minimizes the risk of food safety incidents and legal issues, protecting your business\'s reputation.\n\n• Operational Efficiency: Encourages the review and optimization of food safety practices.'
    },
    {
      id: 'timeline',
      title: 'FSSAI Renewal Timeline',
      content: 'Food Business Operators (FBOs) are advised to begin the renewal process 30 days before their license\'s expiration date. However, to ensure thorough preparation, they can initiate the renewal process as early as 180 days (approximately 6 months) prior to the expiration.'
    },
    {
      id: 'late-fee',
      title: 'Late Fee for Delayed FSSAI License Renewal',
      content: 'If renewal is not initiated at least 30 days before the expiration date, FBOs are subject to a late fee of ₹100 per day. This late fee applies only to licenses, not registrations, and serves to encourage timely renewal.'
    },
    {
      id: 'after-expiry',
      title: 'Renewal of FSSAI License After Expiry Date',
      content: 'For renewals initiated after the expiry date, FBOs can retain the same license number but will incur penalties:\n\n• Up to 90 days late: Three times the regular annual fee.\n\n• 91 to 180 days late: Five times the regular annual fee.'
    },
    {
      id: 'simplify',
      title: 'Simplify FSSAI Renewal with OnEasy',
      content: 'OnEasy is your comprehensive solution for all FSSAI needs. Whether you\'re starting a new food business that requires FSSAI registration, seeking an FSSAI license to expand your operations, or needing a seamless renewal process to maintain your certification, we\'ve got you covered. Our expert team simplifies the entire process, ensuring compliance with food safety regulations. Partner with OnEasy to focus on growing your food business while we handle the complexities of FSSAI compliance, making it a hassle-free experience.'
    }
  ];

  const faqs = [
    {
      question: 'What is the FSSAI Renewal process and why is it important?',
      answer: 'FSSAI Renewal is the process of extending the validity of your existing FSSAI license or registration. It is essential for ensuring continuous legal compliance, avoiding penalties, and maintaining consumer trust in food safety standards.'
    },
    {
      question: 'How often do I need to renew my FSSAI license?',
      answer: 'The renewal period for an FSSAI license depends on its initial validity, which can range from 1 to 5 years. Businesses must renew before the expiration date to avoid penalties and operational disruptions.'
    },
    {
      question: 'When should I start the FSSAI renewal process?',
      answer: 'It is recommended to initiate the renewal process at least 30 days before the expiration date. You can also start as early as 180 days prior to ensure there are no delays.'
    },
    {
      question: 'What happens if I don\'t renew my FSSAI license on time?',
      answer: 'Failure to renew on time may result in a late fee of ₹100 per day. If renewal is delayed beyond the expiration date, penalties apply, and your business could face temporary closure or other legal consequences.'
    },
    {
      question: 'What documents are required for FSSAI renewal?',
      answer: 'Documents typically required for renewal include your current FSSAI license copy, Food Safety Management System (FSMS) certificate, nominee details, modifications (if any), and any additional documents requested by the FSSAI authority.'
    },
    {
      question: 'How much is the penalty for late FSSAI renewal?',
      answer: 'If you initiate the renewal after the license expiry date, penalties vary:\n\n• Up to 90 days late: Three times the annual renewal fee.\n\n• 91 to 180 days late: Five times the annual renewal fee.'
    },
    {
      question: 'Can I continue using my existing license number after renewal?',
      answer: 'Yes, if the renewal process is completed on time, your existing license number will remain valid. If you renew after expiration, you may still keep the same license number but will incur penalties.'
    },
    {
      question: 'Is the FSSAI renewal fee different from the original licensing fee?',
      answer: 'The renewal fee is typically the same as the original licensing fee, although the total cost will depend on the license type (State or Central) and any late fees, if applicable.'
    },
    {
      question: 'Do small food businesses need to renew their FSSAI registration?',
      answer: 'Yes, small food businesses with FSSAI registration (rather than a license) also need to renew their registration to maintain compliance and avoid legal issues. The registration duration typically ranges from 1 to 5 years.'
    },
    {
      question: 'How long does it take to complete the FSSAI renewal process?',
      answer: 'If all documents are submitted correctly, the renewal process usually takes around 15-20 working days. It is recommended to begin early to account for any additional time required by FSSAI authorities.'
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
                console.log('Initiating payment for FSSAI Renewal:', selectedPackage.name);
                localStorage.setItem('selectedRegistrationType', 'fssai-renewal');
                localStorage.setItem('selectedRegistrationTitle', 'FSSAI Renewal');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/fssai-renewal-form');
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
            introTitle="About FSSAI Renewal"
            introDescription="FSSAI license renewal is essential for food businesses to continue their operations legally."
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

export default FSSAIRenewalDetails;

