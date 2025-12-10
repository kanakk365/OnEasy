import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopTabs from './company-details/TopTabs';
import PackagesSection from './company-details/PackagesSection';
import ProcessSection from './company-details/ProcessSection';
import DocumentsSection from './company-details/DocumentsSection';
import PrerequisitesSection from './company-details/PrerequisitesSection';
import AboutSection from './company-details/AboutSection';
import FAQSection from './company-details/FAQSection';
import { initPayment } from '../../utils/payment';

function StartupIndiaDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Packages as per the 2nd image
  const packages = [
    {
      name: 'Starter',
      price: '2,999',
      priceValue: 2999,
      period: 'One Time',
      description: 'Key Features',
      icon: '★',
      features: [
        'Application Filing',
        'DPIIT Registration',
        'Startup India certificate'
      ]
    },
    {
      name: 'Growth',
      price: '5,999',
      priceValue: 5999,
      period: 'One Time',
      description: 'Key Features',
      icon: '✢',
      features: [
        'Application Filing',
        'DPIIT Registration',
        'Startup India certificate',
        'Business Consultation',
        'Class 3 Digital Signature'
      ]
    },
    {
      name: 'Pro',
      price: '14,999',
      priceValue: 14999,
      period: 'One Time',
      description: 'Key Features',
      icon: '✤',
      features: [
        'Application Filing',
        'DPIIT Registration',
        'Startup India certificate',
        'Business Consultation',
        'Class 3 Digital Signature',
        'Pitch Deck',
        'Startup Course'
      ],
      isHighlighted: true
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Incorporate Your Business',
      description: 'Start by forming your company as a Private Limited Company, LLP, or Partnership. Obtain your Certificate of Incorporation to confirm your business\'s legal formation.'
    },
    {
      step: 2,
      title: 'Register with Startup India',
      description: 'Once incorporated, fill out a registration form on the Startup India portal and upload the necessary documents, including details about your business and services.'
    },
    {
      step: 3,
      title: 'Obtain DPIIT Registration',
      description: 'Sign in with your credentials on the Startup India website to apply for DPIIT recognition. This essential step will grant you access to exclusive benefits.'
    },
    {
      step: 4,
      title: 'Receive Your Recognition Number',
      description: 'Upon applying, you will get a DPIIT recognition number as an acknowledgment. The official Startup India Certificate will follow after a thorough document review.'
    },
    {
      step: 5,
      title: 'Apply for Benefits',
      description: 'After receiving your DPIIT certificate, you can apply for various benefits offered under the Startup India scheme.'
    }
  ];

  const documents = [
    'Company Incorporation/Registration Certificate',
    'Memorandum of Association',
    'PAN',
    'TAN',
    'Udyam Registration Certificate',
    'Director KYC Details',
    'Website or Mobile App Details',
    'Logo of the Company'
  ];

  const prerequisites = [
    {
      title: 'Business Structure',
      description: 'Incorporate your startup as a private limited company, limited liability partnership (LLP), or partnership firm.'
    },
    {
      title: 'Age of the Startup',
      description: 'Your startup should be a maximum of 10 years old (15 years for biotech startups).'
    },
    {
      title: 'Annual Revenue',
      description: 'Ensure your turnover does not exceed INR 100 crores in any fiscal year since inception.'
    },
    {
      title: 'Innovative Approach',
      description: 'Aim to innovate and commercialize new products or services driven by technology or intellectual property.'
    },
    {
      title: 'DPIIT Recognition',
      description: 'Obtain your Startup India certificate from DPIIT.'
    },
    {
      title: 'Legal Compliance',
      description: 'Comply with relevant laws such as the Companies Act, Income Tax Act, and maintain a business bank account.'
    },
    {
      title: 'Job Creation',
      description: 'Contribute to job creation or show potential for future employment opportunities.'
    }
  ];

  const aboutSections = [
    {
      id: 'overview',
      title: 'Overview',
      content: 'With the Startup India initiative, the Indian Government has rolled out a robust program to empower ambitious entrepreneurs like you! By securing your Startup India Registration, you can unlock a treasure trove of benefits—including tax exemptions, simplified compliance processes, and access to funding opportunities. This registration legitimizes your business and integrates you into a vibrant network of resources and support systems designed to help you thrive in today\'s competitive landscape.\n\nAt OnEasy, we specialize in making your Startup India registration swift and hassle-free so you can focus on your vision and goals.\n\nJoin the Rising Tide of Successful Entrepreneurs!'
    },
    {
      id: 'about-startup-india',
      title: 'About Startup India',
      content: 'Startup India is more than just a program; it\'s a movement. Launched in 2016, this initiative aims to foster a thriving startup ecosystem that positions India as a global leader in innovation. With Startup Registration, your startup can tap into numerous benefits tailored for growth and success.'
    },
    {
      id: 'advantages',
      title: 'Advantages of Startup India Registration',
      content: 'When you register under the Startup India scheme, you gain access to a plethora of benefits, including:\n\n• Patents, Trademarks, and Design Registration: Enjoy an 80% fee reduction for securing patents and trademarks through approved facilitators.\n\n• Funding Support: Tap into a government fund designed to bolster startups, with an initial corpus of Rs. 2,500 crore.\n\n• Self-Certification: Simplify compliance by self-certifying under various labor and environmental laws for up to five years post-incorporation.\n\n• Tax Exemption: Eligible startups can enjoy income tax exemptions for three consecutive financial years within their first ten years of operation.\n\n• Streamlined Winding Up: If you need to close your business, do so within 90 days, making the exit process straightforward.\n\n• Relaxed Public Procurement Norms: Compete in public procurements without the usual turnover requirements.'
    }
  ];

  const faqs = [
    {
      question: 'What is Startup India Registration?',
      answer: 'Startup India Registration is a process through which eligible startups can obtain recognition from the Department for Promotion of Industry and Internal Trade (DPIIT) in India, allowing them to access various benefits under the Startup India initiative.'
    },
    {
      question: 'Who is eligible for Startup India Registration?',
      answer: 'To be eligible, a startup must be a private limited company, LLP, or partnership firm, incorporated in India, not more than 10 years old (15 years for biotech), and have an annual turnover not exceeding INR 100 crores. It must also aim for innovation and comply with relevant legal requirements.'
    },
    {
      question: 'What are the benefits of Startup India Registration?',
      answer: 'Benefits include tax exemptions, self-certification under employment and labour laws, access to government funding, patent and trademark fee reductions, relaxed public procurement norms, and a streamlined winding-up process.'
    },
    {
      question: 'What documents are required for Startup India Registration?',
      answer: 'Required documents typically include the Company Incorporation Certificate, proof of funding (if any), authorization letter, proof of concept, details of patents/trademarks (if applicable), awards or certificates, and PAN.'
    },
    {
      question: 'How do I apply for Startup India Registration?',
      answer: 'You can apply by first incorporating your business, then registering on the Startup India website by filling out the required form and uploading the necessary documents. Finally, apply for DPIIT recognition through your Startup India profile.'
    },
    {
      question: 'How long does it take to get Startup India Registration?',
      answer: 'The registration process can vary, but once you submit your application for DPIIT recognition, you typically receive acknowledgment within a few days. The official certificate may take several weeks depending on the review process.'
    },
    {
      question: 'What is DPIIT recognition?',
      answer: 'DPIIT recognition is an acknowledgment from the Department for Promotion of Industry and Internal Trade that confirms your startup\'s eligibility for benefits under the Startup India scheme. It is crucial for accessing various government schemes and incentives.'
    },
    {
      question: 'Can I apply for Startup India Registration if my startup is not innovative?',
      answer: 'No, innovation is a key criterion for eligibility. Your startup must aim to develop, deploy, or commercialize new products, processes, or services driven by technology or intellectual property.'
    },
    {
      question: 'Is there any fee for Startup India Registration?',
      answer: 'While there is no fee for applying for DPIIT recognition, there may be costs associated with incorporating your business and obtaining the necessary documentation. Additionally, certain benefits, like patent registration, may incur fees.'
    },
    {
      question: 'Can foreign entrepreneurs register for Startup India?',
      answer: 'Yes, foreign entrepreneurs can register their startups in India, provided they meet the eligibility criteria and incorporate their business as a legal entity recognized in India (like a Private Limited Company or LLP).'
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
          <PackagesSection
            packages={packages}
            onGetStarted={async (selectedPackage) => {
              try {
                console.log('Initiating payment for Startup India:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'startup-india');
                localStorage.setItem('selectedRegistrationTitle', 'Start - Up India Certificate');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success && result.redirect) {
                  console.log('✅ Payment successful! Redirecting to form...');
                  navigate('/startup-india-form');
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
            building={null}
            aboutSections={aboutSections}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
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
            onClick={() => navigate('/startup-india-dashboard')}
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

export default StartupIndiaDetails;

