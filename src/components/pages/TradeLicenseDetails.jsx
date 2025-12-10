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

function TradeLicenseDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages: apiPackages, loading: packagesLoading } = usePackages('trade-license');
  
  // Use packages from API, fallback to empty array if loading
  const packages = packagesLoading ? [] : apiPackages;

  const processSteps = [
    {
      step: 1,
      title: 'Fill Out the Application Form',
      description: 'Obtain and fill out the Trade License application form from the local municipal authority with all required business and personal details.'
    },
    {
      step: 2,
      title: 'Submit Application and Documents',
      description: 'Submit the completed application form along with all required documents to the municipal authority, either online or in person, and pay the application fee.'
    },
    {
      step: 3,
      title: 'Municipal Inspection and License Issuance',
      description: 'After municipal inspection (if required), receive your Trade License upon approval. The license is valid for one year and must be renewed annually.'
    }
  ];

  const documents = [
    'Aadhar Card (Authorized Person)',
    'Rental Agreement of the premises',
    'Entity Registration',
    'Electricity Bill (registered office)',
    'Area of the premises (Sft)',
    'Address of the registered premises',
    'PAN of the Entity'
  ];

  const prerequisites = [
    {
      title: 'Meeting Legal Age Requirement',
      description: 'Applicants must be over 18 years old to be eligible for a Trade License.'
    },
    {
      title: 'No Criminal Records',
      description: 'Applicants should not have any criminal records to qualify for a Trade License.'
    },
    {
      title: 'Legally Permissible Business',
      description: 'To be eligible for a Trade License, the proposed business must comply with all legal requirements and regulations.'
    }
  ];

  const aboutSections = [
    {
      id: 'what-is-trade-license',
      title: 'What is a Trade License?',
      content: "A Trade License is an official document or certificate issued by the Municipal Corporation of a state, granting permission to the applicant (an individual seeking to establish a business) to engage in a specific trade or business activity within a designated area or location.\n\nThis license ensures that the business complies with all safety standards mandated by the State Municipal Corporation, safeguarding residents from potential health hazards. Obtaining a Trade License is mandatory for all businesses falling under the purview of the respective state's Municipal Corporation Act.\n\nIt's important to note that a Trade License restricts the holder from engaging in any trade or business activity other than the one for which it was issued. Additionally, the license does not confer any property ownership to the holder."
    },
    {
      id: 'who-can-issue',
      title: 'Who Can Issue a Trade License?',
      content: 'Trade licenses are typically issued by the licensing department of the Municipal Corporation, encompassing various departments such as industries, engineering, and health. These departments grant permission through a formal document or certificate, allowing businesses to operate within their jurisdiction. The issuance process may vary from state to state, depending on the rules and regulations of local government agencies, specifically the Municipal Corporation.'
    },
    {
      id: 'importance',
      title: 'The Importance of a Trade License',
      content: "In India, trade licenses were established four decades ago under the regulations of the respective state governments' Municipal Corporation Acts. These licenses are crucial in safeguarding against various trades or businesses' nuisances and health hazards.\n\nState governments require trade licenses for conducting specific businesses or trades within designated areas to prevent unethical business practices. The government can regulate various commercial activities nationwide by mandating trade licenses. This regulatory framework promotes societal harmony by ensuring every business adheres to relevant rules, guidelines, and safety measures."
    },
    {
      id: 'main-objectives',
      title: 'Main Objectives of a Trade License',
      content: 'The primary aim of a Trade License is to ensure that business activities within a specific area are regulated and controlled. This licensing system helps local authorities maintain public safety, health, and welfare by overseeing and managing the urban business landscape. By mandating a Trade License, the government ensures that businesses do not negatively impact the surrounding environment and community.'
    },
    {
      id: 'advantages',
      title: 'Advantages of a Trade License',
      content: [
        {
          title: 'Legal Compliance',
          description: 'Obtaining a Trade License ensures that your business operates within the legal framework set by the municipality or local governing body.'
        },
        {
          title: 'Public Safety',
          description: 'Trade Licenses often require businesses to adhere to safety standards and regulations, contributing to the public\'s overall safety.'
        },
        {
          title: 'Business Credibility',
          description: 'Having a Trade License can enhance the credibility of your business, instilling trust and confidence among customers, suppliers, and partners.'
        },
        {
          title: 'Regulatory Compliance',
          description: 'Trade Licenses help businesses comply with various regulatory requirements, avoiding potential fines, penalties, or legal issues.'
        },
        {
          title: 'Access to Government Support',
          description: 'Some government schemes, incentives, or benefits may require businesses to have a valid trade license to qualify.'
        },
        {
          title: 'Establishing Business Legitimacy',
          description: 'A Trade License serves as proof of your business\'s legitimacy, which can be beneficial when dealing with clients, banks, or investors.'
        },
        {
          title: 'Facilitates Expansion',
          description: 'A Trade License may be necessary when expanding your business operations or applying for permits or approvals for new projects or ventures.'
        }
      ]
    },
    {
      id: 'businesses-requiring',
      title: 'Businesses Requiring Trade License Registration',
      content: 'Shops and Establishments: Retail stores, restaurants, hotels, theatres, amusement parks, and similar establishments engaged in trading or commercial activities typically need a Trade License from the local municipal corporation.\n\nFood Establishments: Restaurants, cafes, food stalls, food processing units, and catering services that prepare, sell or distribute food and beverages often require a Trade License along with an FSSAI License.\n\nManufacturing Units: Factories, workshops, and industrial plants involved in manufacturing and production are usually required to obtain a Trade License to ensure compliance with safety and environmental regulations.\n\nHealthcare Facilities: Hospitals, clinics, nursing homes, and diagnostic centers need a Trade License to ensure they meet the necessary standards for providing healthcare services.\n\nEntertainment and Leisure Activities: Cinema halls, multiplexes, gyms, spas, and health clubs involved in entertainment and leisure activities typically require a Trade License for public safety and regulatory compliance.\n\nTransport Services: Auto rickshaws, taxis, cab aggregators, and goods carriers offering transportation services may need a Trade License for legal operation.\n\nConstruction and Real Estate: Real estate developers, construction companies, and contractors may require a Trade License to conduct their activities within specific municipal limits.\n\nFireworks and Explosives: Businesses engaged in the manufacturing, storage, sale, or use of fireworks and explosive materials are subject to strict regulations and usually need a Trade License.\n\nLiquor Establishments: Liquor shops, bars, and pubs that sell and distribute alcoholic beverages require a Trade License and permits from relevant authorities.\n\nStreet Vendors and Hawkers: Individuals or groups engaged in street vending or hawking activities may need a Trade License or specific vendor license from local authorities.'
    },
    {
      id: 'types-of-licenses',
      title: 'Types of Trade Licenses Issued by the Municipality',
      content: 'Type A: Required for all food service establishments.\n\nType B: Issued to units in manufacturing and processing that utilize machinery and electricity, such as milling units.\n\nType C: Provided for high-risk activities, including producing fireworks and wood and timber structures.'
    },
    {
      id: 'procedure',
      title: 'Procedure for Applying for a Trade License',
      content: 'Trade License applications can be submitted either online or offline. They must be filed with the city municipal corporation governing the area where the business is situated. The timeline for application submission differs depending on the State Municipal Corporation Act, with some states requiring the application before business commencement, while others allow it within 30 days of initiating operations.\n\nFill Out the Application Form:\n\nObtain the application form for a Trade License from the local municipal authority\'s office or website. Fill in the form accurately, providing all requested information regarding your business and personal details.\n\nSubmit the Application:\n\nDepending on the municipality\'s system, submit the completed application form along with all the required documents to the municipal authority, either in person or online. Pay the application fee, which varies depending on the type of business, size, and location.\n\nMunicipal Inspection:\n\nSometimes, a municipal inspector may visit your business location to verify the details provided in your application and ensure compliance with local health, safety, and environmental standards.\n\nObtain the License:\n\nOnce your application is approved, you will receive your Trade License. The time frame for approval can vary but generally takes a few weeks. Depending on the municipal authority\'s process, you can collect the Trade License in person or receive it by mail or online.\n\nRenewal:\n\nRemember that a Trade License is typically valid for one year and must be renewed annually. Keep track of the renewal date and submit a renewal application and the required fee before the license expires to avoid penalties.'
    },
    {
      id: 'penalties',
      title: 'Penalties for Non-Compliance',
      content: 'Operating a business without a valid Trade License or not adhering to the conditions of the license can lead to fines, penalties, and even the closure of the business.'
    },
    {
      id: 'why-oneasy',
      title: 'Obtain Your Trade License Easily with OnEasy',
      content: 'OnEasy offers comprehensive assistance in obtaining a Trade License, simplifying the complex process for businesses. Our team of experts guides clients through every step, from application submission to obtaining the license. With extensive knowledge of the regulatory requirements and procedures, we ensure that all necessary documents are accurately prepared and filed with the relevant authorities.\n\nBy choosing OnEasy, businesses can save time and effort, ensure compliance with legal requirements, and expedite the process of obtaining a Trade License.'
    }
  ];

  const faqs = [
    {
      question: 'What is a Trade License, and why is it required?',
      answer: 'A Trade License is a legal document issued by the local municipal authority, allowing a business to operate in a particular location. It is required to ensure that the business complies with local laws and safety regulations.'
    },
    {
      question: 'Who needs a Trade License?',
      answer: 'Any business involved in trade, commercial activities, or providing services within a municipal area, such as shops, restaurants, manufacturing units, or healthcare facilities, requires a Trade License.'
    },
    {
      question: 'How can I apply for a Trade License?',
      answer: 'You can apply for a Trade License by filling out the application form available at the local municipal office or through the municipality\'s online portal. Submit the required documents along with the application fee.'
    },
    {
      question: 'What documents are needed to apply for a Trade License?',
      answer: 'Typically, the required documents include proof of identity, proof of address, proof of business location, tax receipts, and NOCs from relevant authorities, among others.'
    },
    {
      question: 'Is a Trade License mandatory for all businesses?',
      answer: 'Yes, it is mandatory for most businesses involved in trading or providing services to obtain a Trade License to operate legally within municipal limits.'
    },
    {
      question: 'How long is a Trade License valid?',
      answer: 'A Trade License is usually valid for one year and must be renewed annually by paying the renewal fee and submitting a renewal application.'
    },
    {
      question: 'What are the penalties for not having a Trade License?',
      answer: 'Operating a business without a valid Trade License can lead to fines, legal action, and the forced closure of the business by municipal authorities.'
    },
    {
      question: 'Can a Trade License be transferred to another person or business?',
      answer: 'No, a Trade License is non-transferable. If the ownership of the business changes, a new Trade License must be obtained in the new owner\'s name.'
    },
    {
      question: 'How long does it take to get a Trade License?',
      answer: 'The time to process a Trade License application varies by municipality, but it generally takes a few days to a few weeks, depending on the type of business and location.'
    },
    {
      question: 'Can I operate multiple businesses under one Trade License?',
      answer: 'No, each business activity requires a separate Trade License. A Trade License is issued for a specific trade or business, and engaging in additional activities requires additional licenses.'
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
                  console.log('Initiating payment for Trade License:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'trade-license');
                  localStorage.setItem('selectedRegistrationTitle', 'Trade License');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success) {
                    if (result.showPopup) {
                      console.log('✅ Payment successful! Showing popup...');
                      setShowPaymentPopup(true);
                    } else if (result.redirect) {
                      console.log('✅ Payment successful! Redirecting to form...');
                      navigate('/trade-license-form');
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
            introTitle="About Trade License"
            introDescription="Engaging in any business activity within India mandates adherence to various regulations, among which acquiring a Trade License is paramount. Serving as an official document to commence specific trade or business operations within a designated locale, a trade license ensures businesses follow municipal norms and uphold public health and safety standards. With India's robust regulatory landscape, obtaining a Trade License becomes an indispensable step for businesses aiming to carve a niche in the competitive market, reinforcing the foundation for a trustworthy and lawful business. Getting a Trade License in India involves complex steps and rules. OnEasy makes this easier by guiding you through the process and helping you get your license smoothly."
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
            onClick={() => navigate('/registrations/trade-license')}
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

export default TradeLicenseDetails;

