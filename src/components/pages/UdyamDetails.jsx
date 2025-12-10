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

function UdyamDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  const packages = [
    {
      name: 'Starter',
      price: '1,299',
      priceValue: 1299,
      period: 'One Time',
      description: 'Key Features',
      icon: '★',
      features: [
        'MSME/Udyam Application',
        'MSME/Udyam Registration',
        'MSME/Udyam Certificate'
      ],
      color: 'blue'
    },
    {
      name: 'Growth',
      price: '2,399',
      priceValue: 2399,
      period: 'One Time',
      description: 'Key Features',
      icon: '✢',
      features: [
        'GST Application',
        'GST registration',
        'Filing GST returns for two months',
        'MSME/Udyam Registration',
        'MSME/Udyam Certificate',
        'GST Consultation'
      ],
      color: 'blue'
    },
    {
      name: 'Pro',
      price: '4,999',
      priceValue: 4999,
      period: 'One Time',
      description: 'Key Features',
      icon: '✤',
      features: [
        'License Application',
        'Labour license certificate',
        'GST Application',
        'GST registration',
        'Filing GST returns for one month',
        'MSME/Udyam Registration',
        'MSME/Udyam Certificate'
      ],
      isHighlighted: true,
      color: 'blue'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Application Submission',
      description: 'Submit your Udyam registration application with all required details including Aadhaar, PAN, and business information.'
    },
    {
      step: 2,
      title: 'Verification and Processing',
      description: 'The application is verified by the MSME department. Once approved, you receive your Udyam Registration Number.'
    },
    {
      step: 3,
      title: 'Certificate Issuance',
      description: 'Receive your Udyam Registration Certificate, which is valid for the lifetime of your enterprise.'
    }
  ];

  const documents = [
    'PAN Card of the business or proprietor',
    'Aadhaar Number of the Respective Representative',
    'Aadhaar Card of Proprietor/Director/Partner',
    'GST Registration Number'
  ];

  const prerequisites = [
    {
      title: 'Eligibility for Udyam Registration',
      description: 'Udyam Registration is available to any individual or entity looking to establish a micro, small, or medium enterprise. Eligible applicants include: Proprietorships, Partnership Firms, Hindu Undivided Family (HUF), One Person Companies (OPC), Private Limited Companies, Public Limited Companies, Limited Liability Partnerships (LLP), Co-operative Societies, and Producer Companies. Enterprises can file a single Udyam Registration for multiple activities, including manufacturing and services.'
    },
    {
      title: 'Eligibility Criteria',
      description: 'To qualify for Udyam Registration, your enterprise must fall within the following investment and turnover limits:\n\n• Micro Enterprise: Investment up to ₹1 crore, Annual Turnover not exceeding ₹5 crore\n• Small Enterprise: Investment up to ₹10 crore, Annual Turnover not exceeding ₹50 crore\n• Medium Enterprise: Investment up to ₹50 crore, Annual Turnover not exceeding ₹250 crore'
    }
  ];

  const aboutSections = [
    {
      id: 'maximize-potential',
      title: 'Maximize Your Business Potential with Udyam Registration Through OnEasy',
      content: "In today's competitive business environment, small and medium-sized enterprises (SMEs) must capitalize on every opportunity that enhances their operations, offers government benefits, and provides formal recognition. One such critical initiative introduced by the Government of India is Udyam Registration, previously known as Udyog Aadhar. This initiative, launched by the Ministry of Micro, Small & Medium Enterprises (MSME) on July 1, 2020, is aimed at fostering the growth and development of MSMEs. With the new process and revised classification criteria, Udyam Registration has become an essential step for businesses seeking to unlock various government schemes and incentives."
    },
    {
      id: 'what-is-udyam',
      title: 'What is Udyam Registration?',
      content: "Udyam Registration is the official process for MSME classification and recognition, implemented by the Government of India. It replaced the earlier Udyog Aadhar system to provide a more streamlined and efficient registration process. The primary goal of Udyam Registration is to classify micro, small, and medium enterprises based on their investment in plant and machinery or equipment and annual turnover. Once registered, businesses receive a Udyam Registration Number and an e-certificate, enabling them to leverage various government schemes designed to support MSMEs.\n\nAt OnEasy, we streamline the Udyam registration process for businesses, ensuring seamless and efficient registration. Our expert team guides you through every step, making sure your business is formally registered under Udyam, allowing you to access the associated benefits without hassle."
    },
    {
      id: 'key-benefits',
      title: 'Key Benefits of Udyam Registration',
      content: [
        {
          title: 'Priority Access to Government Tenders',
          description: 'Udyam-registered businesses receive preferential treatment in government procurement, increasing their chances of winning contracts.'
        },
        {
          title: 'Collateral-Free Loans',
          description: 'Udyam Registration facilitates access to bank loans without the need for collateral, making financing easier for MSMEs.'
        },
        {
          title: 'Reduced Interest Rates',
          description: 'Registered businesses enjoy a 1% interest rate exemption on bank overdrafts, helping reduce borrowing costs.'
        },
        {
          title: 'Tax Rebates',
          description: 'Udyam-registered enterprises are eligible for various tax rebates, resulting in significant savings.'
        },
        {
          title: 'Simplified Licensing & Certification',
          description: 'The registration process provides priority in obtaining essential government licenses and certifications.'
        },
        {
          title: 'Subsidies',
          description: 'Registered MSMEs can access subsidies on capital investments and tariffs, enhancing profitability and reducing costs.'
        },
        {
          title: 'Lower Utility Bills',
          description: 'Businesses benefit from discounted electricity tariffs, reducing operational expenses.'
        },
        {
          title: 'Payment Protection',
          description: 'MSMEs are protected against delayed payments from buyers, improving cash flow management.'
        },
        {
          title: 'Discounts on Intellectual Property Filings',
          description: 'Udyam Registration entitles businesses to a 50% discount on government fees for trademarks and patents, making it easier to protect intellectual property.'
        },
        {
          title: 'Expedited Dispute Resolution',
          description: 'Udyam-registered enterprises benefit from faster resolution of disputes, minimizing business interruptions.'
        }
      ]
    },
    {
      id: 'lifetime-validity',
      title: 'Lifetime Validity of Udyam Registration',
      content: "Once registered, the Udyam Certificate remains valid for the lifetime of the enterprise, provided it continues to meet the MSME classification criteria. There is no need for renewal, making it a hassle-free process."
    },
    {
      id: 'why-register-early',
      title: 'Why Register Early?',
      content: 'While Udyam Registration is not mandatory, it is strongly recommended for businesses to register early. Doing so allows enterprises to fully benefit from the various government schemes and incentives available to MSMEs.'
    },
    {
      id: 'how-oneasy-helps',
      title: 'How OnEasy Simplifies the Udyam Registration Process',
      content: "At OnEasy, we make Udyam Registration quick and effortless. Our dedicated team of professionals manages the entire process—from gathering essential information to submitting the registration on your behalf. We ensure your business is registered accurately and promptly, minimizing delays and complications. Upon successful registration, your business will receive its Udyam Certificate, giving you access to numerous government benefits tailored to MSMEs.\n\nPartner with OnEasy to streamline your Udyam Registration process, and unlock a world of opportunities to grow your business efficiently and effectively."
    }
  ];

  const faqs = [
    {
      question: 'What is Udyam Registration?',
      answer: 'Udyam Registration is an official government process for recognizing micro, small, and medium enterprises (MSMEs). It replaced the previous Udyog Aadhar system on July 1, 2020, and classifies businesses based on their investment and turnover.'
    },
    {
      question: 'Who is eligible for Udyam Registration?',
      answer: 'Any individual or entity, such as proprietorships, partnership firms, LLPs, private limited companies, public limited companies, and co-operative societies, engaged in manufacturing or services, can apply for Udyam Registration if they meet the criteria for micro, small, or medium enterprises.'
    },
    {
      question: 'What are the investment and turnover limits for MSME classification under Udyam Registration?',
      answer: 'The investment and turnover limits for MSMEs are as follows:\n\n• Micro Enterprise: Investment up to ₹1 crore and turnover up to ₹5 crore\n• Small Enterprise: Investment up to ₹10 crore and turnover up to ₹50 crore\n• Medium Enterprise: Investment up to ₹50 crore and turnover up to ₹250 crore'
    },
    {
      question: 'Is Udyam Registration mandatory?',
      answer: 'No, Udyam Registration is not mandatory. However, it is highly recommended for MSMEs to take advantage of various government schemes and incentives available to registered businesses.'
    },
    {
      question: 'What are the benefits of Udyam Registration?',
      answer: 'Registered MSMEs enjoy numerous benefits such as access to government tenders, collateral-free loans, interest rate exemptions, tax rebates, priority in licensing, subsidies, and protection against delayed payments.'
    },
    {
      question: 'How long is the Udyam Registration Certificate valid?',
      answer: 'The Udyam Registration Certificate is valid for a lifetime, as long as the enterprise continues to meet the classification criteria for MSMEs. There is no need for renewal.'
    },
    {
      question: 'What documents are required for Udyam Registration?',
      answer: 'Udyam Registration requires only a few basic details, including the Aadhaar number of the business owner or authorized signatory, PAN card number, and bank details. No additional documents need to be uploaded during the process.'
    },
    {
      question: 'Can a business have multiple Udyam Registrations?',
      answer: 'No, a business is allowed only one Udyam Registration. However, a single registration can include multiple activities such as manufacturing, services, or both.'
    },
    {
      question: 'Is GST registration required for Udyam Registration?',
      answer: 'GST registration is mandatory only for businesses that are required to be registered under the GST laws. If GST is applicable, the GST number must be provided during Udyam Registration.'
    },
    {
      question: 'How can I update or modify my Udyam Registration details?',
      answer: 'You can update your Udyam Registration details through the Udyam portal by providing the necessary updated information, such as changes in investment, turnover, or business activities, as long as your enterprise still meets the MSME criteria.'
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
                  console.log('Initiating payment for Udyam Registration:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'udyam');
                  localStorage.setItem('selectedRegistrationTitle', 'Udyam Registration');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success && result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/udyam-registration-form');
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
            introTitle="About Udyam Registration"
            introDescription="Udyam Registration is a government initiative in India designed to support small and medium enterprises (SMEs) by providing a unique identification number. This registration enhances the credibility of businesses and enables access to various benefits, including subsidies, loans, and government schemes. It simplifies the process of recognition, ensuring compliance with MSME policies. By registering, entrepreneurs can leverage resources for growth and development. Udyam Registration is a vital step toward empowering SMEs and fostering economic growth."
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

export default UdyamDetails;

