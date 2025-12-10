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

function IECDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages: apiPackages, loading: packagesLoading } = usePackages('iec');
  
  // Use packages from API, fallback to empty array if loading
  const packages = packagesLoading ? [] : apiPackages;

  const processSteps = [
    {
      step: 1,
      title: 'Information & Document Preparation',
      description: 'We provide detailed information about the IEC application process and assist in preparing all necessary documentation.'
    },
    {
      step: 2,
      title: 'Application Submission',
      description: 'We submit your IEC application to DGFT on your behalf, ensuring a smooth and timely process.'
    },
    {
      step: 3,
      title: 'Tracking & IEC Certificate Delivery',
      description: 'We track the progress of your application, follow up with authorities, and ensure your IEC certificate is delivered promptly once approved.'
    }
  ];

  const documents = [
    'Proof of Establishment/Registration',
    'Rental Agreement and NOC (Firm)',
    'Latest utility bill of the Firm (Electricity Bill)',
    'Aadhaar Card of the firm\'s member',
    'Bank Statement of the firm',
    'Two Colour Photographs of the Director'
  ];

  const prerequisites = [
    {
      title: 'Prerequisites for IEC Registration',
      description: 'To apply for an IEC, businesses must have the following:\n\n• Valid login credentials to the DGFT Portal (after registering on the DGFT website)\n• A valid PAN in the name of the business, along with corresponding details such as name and date of incorporation\n• A bank account in the firm\'s name with an active business address\n\nThese details will be verified with the Income Tax Department.'
    }
  ];

  const aboutSections = [
    {
      id: 'iec-intro',
      title: 'Import Export Code (IEC)',
      content: 'An Import & Export Code is mandatory for any business engaged in importing or exporting goods from India. The IEC is a 10-digit unique number issued by the DGFT.\n\nBefore importing goods into India, an importer must ensure that their business is registered for both GST and IEC, as these are required to clear customs. Failure to have both GST and IEC Code Registration may result in goods being held at the port, leading to demurrage charges or even destruction of goods.\n\nOnEasy is here to make this process simple. Our end-to-end IEC registration services help you easily obtain the required IEC certificate and import-export license, ensuring that you\'re well-prepared to explore the world of global trade.\n\nGet Your IEC Number Today with OnEasy!'
    },
    {
      id: 'why-iec',
      title: 'Why IEC is Important for Your Business?',
      content: [
        {
          title: 'Access to Global Markets',
          description: 'The IEC enables your business to enter the global marketplace, unlocking opportunities for growth and expansion.'
        },
        {
          title: 'Hassle-free Online Registration',
          description: 'The IEC registration process is entirely online and requires minimal documentation.'
        },
        {
          title: 'Lifetime Validity',
          description: 'The IEC is valid for a lifetime as long as your business exists, with no need for renewals or periodic updates.'
        },
        {
          title: 'Reduced Risk of Illegal Goods',
          description: 'The requirement for authentic business details makes it difficult for illegal goods to be transported under IEC registration.'
        },
        {
          title: 'Access to Benefits and Subsidies',
          description: 'Importers and exporters with IEC registration can take advantage of various benefits, including subsidies from Customs, Export Promotion Councils, and more.'
        },
        {
          title: 'No Annual Compliance',
          description: 'Once registered, businesses with IEC do not need to fulfill any specific compliance requirements, such as annual filings or returns.'
        }
      ]
    },
    {
      id: 'iec-validity',
      title: 'IEC Code Validity',
      content: 'The IEC is a one-time registration that is valid for life. As long as your business is operational, there is no need to renew or update your IEC registration. This is unlike other tax registrations such as GST, where annual filings are required.\n\nBecause the IEC is a one-time registration without additional compliance, it is highly recommended for all importers and exporters to obtain an IEC once their business is established.'
    },
    {
      id: 'who-can-apply',
      title: 'Who Can Apply for an IEC?',
      content: 'The IEC can be obtained by businesses of various structures, including:\n\n• Proprietorship Firm\n• Partnership Firm\n• Limited Liability Partnership (LLP)\n• Private Limited Company\n• Trust\n• Hindu Undivided Family (HUF)\n• Society'
    },
    {
      id: 'how-oneasy-helps',
      title: 'Streamline Your IEC Application with OnEasy',
      content: 'OnEasy can assist you in obtaining an Importer Exporter Code (IEC) with ease.\n\nHere\'s how we can help:\n\n• Information & Guidance: We provide detailed information about the IEC application process, eligibility criteria, and required documents.\n• Document Preparation: Our experts assist in preparing and reviewing all necessary documentation.\n• Application Submission: We submit your IEC application to DGFT on your behalf, ensuring a smooth and timely process.\n• Tracking & Follow-up: We track the progress of your application and follow up with authorities to avoid delays.\n• Delivery of IEC Certificate: Once approved, we ensure that your IEC certificate is delivered promptly.\n• Expert Consultation: OnEasy offers professional guidance on any queries related to IEC registration or international trade.\n\nBy using OnEasy for your IEC registration, you can save time and ensure that the process is handled smoothly, allowing you to focus on your import-export operations.\n\nGet Started with OnEasy Today!'
    }
  ];

  const faqs = [
    {
      question: 'What is an Import Export Code (IEC)?',
      answer: 'IEC is a 10-digit unique identification number issued by the Directorate General of Foreign Trade (DGFT). It is mandatory for any business or individual to import or export goods from India.'
    },
    {
      question: 'Who requires an IEC?',
      answer: 'Any individual or business entity involved in the import or export of goods and services in India must obtain an IEC before commencing such transactions.'
    },
    {
      question: 'Is IEC registration mandatory for all businesses?',
      answer: 'Yes, IEC registration is mandatory for any individual or entity involved in international trade of goods or services. Without it, customs clearance and foreign exchange payments cannot be processed.'
    },
    {
      question: 'How long does it take to get an IEC?',
      answer: 'Typically, the IEC is issued within 5-7 working days after the application is submitted along with the required documents to DGFT.'
    },
    {
      question: 'What documents are required to apply for an IEC?',
      answer: 'Key documents include the PAN card of the applicant, proof of business address, and bank account details of the business. Additional documents may be needed depending on the nature of the business.'
    },
    {
      question: 'Is there any renewal requirement for IEC?',
      answer: 'No, IEC is a one-time registration with lifetime validity. It does not need to be renewed unless there are changes in the business structure or ownership.'
    },
    {
      question: 'Can IEC be used by multiple branches or units of the same company?',
      answer: 'Yes, a single IEC can be used by all branches or divisions of the company, as it is issued to the entity as a whole.'
    },
    {
      question: 'What is the cost for obtaining an IEC?',
      answer: 'The government fee for IEC registration is minimal, but service providers may charge additional fees for assistance with documentation and application.'
    },
    {
      question: 'Can IEC be surrendered or canceled?',
      answer: 'Yes, if a business no longer requires an IEC, it can be surrendered by submitting an application to the DGFT, and the code will be canceled.'
    },
    {
      question: 'Does IEC require any periodic filings or compliance?',
      answer: 'No, IEC does not require any annual filings or compliance, unlike other tax registrations. It remains valid throughout the business\'s lifetime unless voluntarily surrendered or revoked.'
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
                  console.log('Initiating payment for IEC Registration:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'iec');
                  localStorage.setItem('selectedRegistrationTitle', 'Import Export Code (IEC) Registration');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success) {
                    if (result.showPopup) {
                      console.log('✅ Payment successful! Showing popup...');
                      setShowPaymentPopup(true);
                    } else if (result.redirect) {
                      console.log('✅ Payment successful! Redirecting to form...');
                      navigate('/iec-form');
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
            introTitle="About Import Export Code"
            introDescription="International trade offers immense opportunities for businesses in India. Whether you're aiming to import goods, export products, or expand your operations globally, having an Importer Exporter Code (IEC) is essential to access international markets. The IEC is issued by the Directorate General of Foreign Trade (DGFT) under the Ministry of Commerce. For importers, the IEC is crucial for customs clearance and facilitating payments to foreign banks, ensuring smooth international trade transactions. Similarly, exporters rely on the IEC to simplify shipping and receiving payments from overseas clients."
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
            onClick={() => navigate('/registrations/iec')}
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

export default IECDetails;

