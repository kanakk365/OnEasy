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

function FSSAIDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  // Packages as per user requirements
  const packages = [
    {
      name: 'Starter',
      price: '1,999',
      priceValue: 1999,
      originalPrice: '3,999',
      originalPriceValue: 3999,
      period: 'One Time',
      description: 'Basic FSSAI application package',
      icon: '★',
      features: [
        'Basic Application preparation',
        'Basic Application filing',
        '1 year registration'
      ],
      color: 'blue'
    },
    {
      name: 'Growth',
      price: '9,999',
      priceValue: 9999,
      originalPrice: '14,999',
      originalPriceValue: 14999,
      period: 'One Time',
      description: 'Advanced FSSAI package',
      icon: '✢',
      features: [
        'Advanced Application preparation',
        'Advanced Application filing',
        '1 year registration',
        'CA Consultation'
      ],
      isHighlighted: true,
      color: 'blue'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Consultation and Document Collection',
      description: 'Our experts guide you through FSSAI license types and requirements. We assist in gathering all necessary documents for your specific license category.'
    },
    {
      step: 2,
      title: 'Application Preparation and Submission',
      description: 'We prepare your FSSAI license application with accurate details and documentation, then submit it to the relevant FSSAI authorities.'
    },
    {
      step: 3,
      title: 'Follow-up and License Receipt',
      description: 'We monitor the progress of your application, communicate updates, and ensure you receive your FSSAI license upon approval.'
    }
  ];

  const documents = [
    'AADHAR CARD',
    'PAN CARD',
    'BLUE PRINT',
    'ANY REGISTRATION',
    'TRADE LICENSE',
    'WATER REPORT',
    'RENTAL AGREEMENT',
    'CURRENT BILL',
    'MAIL ID',
    'PHONE NUMBER',
    'PHOTO',
    'FIRM NAME',
    'NATURE OF BUSINESS'
  ];

  const prerequisites = [
    {
      title: 'FSSAI License Requirement',
      description: 'In India, any entity engaged in activities like making, storing, distributing, selling, or importing food products must secure an FSSAI license. This includes restaurants, catering services, food processing factories, food delivery services, and online food vendors. Both individuals and companies involved in these operations must obtain an FSSAI license to operate legally within India.'
    }
  ];

  const aboutSections = [
    {
      id: 'licensing-registration',
      title: 'Licensing and Registration for Food Businesses in India',
      content: 'As per Section 31(1) of the Food Safety and Standards Act, 2006, all Food Business Operators (FBOs) in India must obtain an FSSAI license from the Food Safety & Standards Authority of India. This requirement is governed by the Food Safety & Standards (Licensing and Registration of Food Business) Regulations, 2011. Any food manufacturing, storage, transportation, or distribution entity must hold a valid FSSAI License or Registration. The specific type of authorized registration or license depends on the scale and nature of your food business.'
    },
    {
      id: 'fssai-registration',
      title: 'FSSAI Registration',
      content: 'FSSAI Registration is mandatory for small-scale food manufacturers or FBOs whose turnover is below Rs. 12 Lakhs, unless they fall under the compulsory licensing category. Petty FBOs producing or selling food items, such as hawkers, small retailers, itinerant vendors, temporary stall holders, or small-scale food enterprises, need to obtain an FSSAI registration certificate if they meet the following conditions:\n\n• Annual Turnover: Should be less than Rs. 12 lakhs.\n• Production Capacity: Food products (excluding milk, meat, and fish) should not exceed 100 liters or kg daily.\n• Milk Procurement: Limited to 500 liters daily for milk procurement, handling, and collection.\n• Slaughtering Capacity: Up to ten small animals, two large animals, or 50 poultry birds per day or less.\n• Food Distribution: Engaging in food distribution at religious or social gatherings, except as a caterer.\n\nThe FSSAI registration number is a 14-digit code issued by the State Licensing Authority, starting with the digit 2.'
    },
    {
      id: 'fssai-license',
      title: 'FSSAI License for Food Businesses',
      content: 'An FSSAI License is essential for enterprises with a turnover exceeding Rs. 12 lakhs and for FBOs involved in food processing and manufacturing. This license is classified into two main types: Central FSSAI License and State FSSAI License. The FSSAI license is identified by a 14-digit code starting with the digit 1. The choice between a State or Central license depends on your business scale, and maintaining the license validity through FSSAI License Renewal is crucial. You can check the authenticity and validity of your license through the FSSAI license online check.\n\nState License:\n\nFBOs, such as medium-scale processors, manufacturers, traders, marketers, or transporters, must obtain a state license from their respective state governments. Medium-sized FBOs with an annual turnover exceeding Rs. 12 lakhs but not exceeding Rs. 20 Crores are required to obtain a state license.\n\nCentral License:\n\nLarge-scale enterprises involved in food processing, transportation, manufacturing, and international trade of food products must secure an FSSAI central license. An FBO is classified as large if its annual turnover exceeds Rs. 20 Crores, necessitating the acquisition of an FSSAI central license from the Central Government.'
    },
    {
      id: 'benefits',
      title: 'Benefits of Obtaining an FSSAI License for Your Food Business',
      content: [
        {
          title: 'Legal Compliance',
          description: 'Obtaining an FSSAI license registration ensures your business meets regulatory requirements, minimizing legal risks.'
        },
        {
          title: 'Food Safety Assurance',
          description: 'The license guarantees adherence to stringent safety standards, boosting customer confidence in your product quality.'
        },
        {
          title: 'Building Goodwill',
          description: 'Displaying the FSSAI logo on your products and premises fosters consumer trust and enhances your brand\'s reputation.'
        },
        {
          title: 'Consumer Awareness',
          description: 'FSSAI registration demonstrates your commitment to food safety, promoting awareness and fostering loyalty.'
        },
        {
          title: 'Regulation Facilitation',
          description: 'The FSSAI license simplifies managing manufacturing, storage, distribution, and selling of food items, ensuring compliance.'
        },
        {
          title: 'Attracting Investors',
          description: 'An FSSAI license adds credibility, making your business more attractive to potential investors who value quality and safety adherence.'
        },
        {
          title: 'Quality Assurance',
          description: 'The FSSAI registration number prominently displayed at your establishment reflects your dedication to hygiene and quality.'
        }
      ]
    },
    {
      id: 'validity-renewal',
      title: 'Validity & FSSAI License Renewal',
      content: 'The FSSAI License / Registration is issued for a period of 1 to 5 years, as chosen by the Food Business Operator. This validity period commences from the issuance date. FSSAI License Renewal is crucial, and FBOs must initiate the renewal process at least 30 days before the current license or registration expires.'
    },
    {
      id: 'penalties',
      title: 'Penalties for Conducting Business Without an FSSAI License',
      content: 'Any individual or food business operator required to acquire a license but engaging in activities such as manufacturing, selling, storing, distributing, or importing food items without the necessary permit may face penalties, including:\n\n• Imprisonment: Offenders may face imprisonment for up to six months.\n• Monetary Fine: Offenders can incur fines of up to five lakh rupees.\n\nOperating a food-related business without the appropriate FSSAI license can result in legal consequences, including imprisonment and substantial financial penalties. Timely FSSAI license checks can help mitigate the risk of non-compliance penalties and issues.'
    },
    {
      id: 'why-oneasy',
      title: 'Why Choose OnEasy for Your Food License Needs?',
      content: 'Obtaining an FSSAI License is crucial for regulatory compliance, food safety assurance, building consumer trust, and expanding your food business. OnEasy is your reliable partner for FSSAI license applications in India. Our expert team simplifies the process, ensuring accurate documentation and a smooth submission experience. Whether you operate a small business or a larger enterprise, OnEasy guides you through the FSSAI requirements, streamlining compliance and allowing you to focus on your core business operations. Our experienced professionals will assist you in selecting the appropriate food category and license.\n\nThe FSSAI license application process through OnEasy involves the following steps:\n\n• Consultation: Our experts will guide you through the different types of FSSAI licenses based on your business size and activities at an affordable price.\n• Document Collection: We\'ll assist you in gathering the necessary documents for your specific license category, simplifying the online application process.\n• Application Preparation: Our team will prepare your FSSAI license application with accurate details and documentation.\n• Submission: We will submit your application to the relevant FSSAI authorities.\n• Follow-up: OnEasy will monitor the progress of your application and communicate updates to you.\n• License Receipt: Once approved, you will receive your FSSAI license, and we will ensure you are aware of the renewal process.\n\nBy choosing OnEasy, you can secure your FSSAI License swiftly and efficiently.\n\nContact us today for expert guidance on obtaining your FSSAI License and ensuring compliance with food safety standards.'
    }
  ];

  const faqs = [
    {
      question: 'What is an FSSAI License, and why is it required?',
      answer: 'FSSAI License is a mandatory registration for all food businesses in India to ensure that food products meet safety standards set by the Food Safety and Standards Authority of India. It is required to operate legally and build customer trust.'
    },
    {
      question: 'Who needs to obtain an FSSAI License?',
      answer: 'Any business involved in manufacturing, processing, packaging, storing, distributing, selling, or importing food products in India must obtain an FSSAI License or Registration based on their size and operations.'
    },
    {
      question: 'What is the difference between FSSAI Registration and FSSAI License?',
      answer: 'FSSAI Registration is required for small food businesses with a turnover below Rs. 12 lakhs, while an FSSAI License (State or Central) is needed for larger businesses with higher turnovers or those involved in food manufacturing, processing, or trading.'
    },
    {
      question: 'How can I apply for an FSSAI License?',
      answer: 'You can apply for an FSSAI License online through the FSSAI website or with the assistance of a service provider like OnEasy, which simplifies the application process.'
    },
    {
      question: 'What documents are required to apply for an FSSAI License?',
      answer: 'Required documents include proof of identity, proof of business premises, a list of food products, and for manufacturing units, additional documents such as layout plans, equipment details, and water testing reports.'
    },
    {
      question: 'How long does it take to obtain an FSSAI License?',
      answer: 'The time required to get an FSSAI License varies but usually takes around 15-30 working days from the submission of a complete application, depending on the type of license.'
    },
    {
      question: 'What is the validity of an FSSAI License?',
      answer: 'An FSSAI License is valid for a period ranging from 1 to 5 years, depending on the period chosen during the application process. It needs to be renewed before its expiry.'
    },
    {
      question: 'What are the penalties for not having an FSSAI License?',
      answer: 'Operating without an FSSAI License can result in penalties such as fines up to Rs. 5 lakhs, imprisonment of up to six months, and legal action by the authorities.'
    },
    {
      question: 'How do I check the status of my FSSAI License application?',
      answer: 'You can track the status of your FSSAI License application online using the application reference number on the FSSAI website.'
    },
    {
      question: 'How can I renew my FSSAI License?',
      answer: 'You can renew your FSSAI License online by applying for renewal at least 30 days before the expiry date. Failure to renew on time can result in penalties and disruption of business operations.'
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
                  console.log('Initiating payment for FSSAI License:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'fssai');
                  localStorage.setItem('selectedRegistrationTitle', 'FSSAI License');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success && result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/fssai-form');
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
            introTitle="About FSSAI License"
            introDescription="If your business sells food or edible items, compliance with the FSSAI (Food Safety and Standards Authority of India) Act regulations is essential. This legal framework mandates that your business is officially registered with the government and obtains a license from the Food Safety Department. Regardless of whether you operate a small-scale or large-scale food business involved in manufacturing, storing, transporting, or distributing food, securing FSSAI registration or a license based on your business size and nature is vital. Adhering to these regulations ensures the safety and quality of food products in the country. At OnEasy, we recognize the importance of obtaining FSSAI license registration for your business. We are dedicated to making the FSSAI License online process seamless and hassle-free."
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

export default FSSAIDetails;

