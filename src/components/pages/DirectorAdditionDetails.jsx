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

function DirectorAdditionDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('director-addition');

  const processSteps = [
    {
      step: 1,
      title: 'Review Articles of Association',
      description: 'Ensure the AOA permits the addition of directors. If absent, amend the AOA.'
    },
    {
      step: 2,
      title: 'General Meeting Resolution',
      description: 'Hold an AGM or EGM to pass a resolution for director appointment with shareholder approval.'
    },
    {
      step: 3,
      title: 'DIN and DSC Application',
      description: 'The proposed director must obtain a Digital Signature Certificate (DSC) and Director Identification Number (DIN).'
    },
    {
      step: 4,
      title: 'Regulatory Filings',
      description: 'File director\'s consent (Form DIR-2) and appointment particulars (Form DIR-12) with ROC within 30 days.'
    }
  ];

  const documents = [
    'PAN Card of the director',
    'The Aadhaar Card of the director',
    'Bank Statement (Recent)',
    'Photograph of the director'
  ];

  const prerequisites = [
    {
      title: 'Age Requirement',
      description: 'Proposed Director must be 18 years or older.'
    },
    {
      title: 'Disqualification Check',
      description: 'The individual must not be disqualified based on the conditions outlined in the Companies Act 2013.'
    },
    {
      title: 'Approval Requirements',
      description: 'The appointment must be collectively approved by the Board of Directors, shareholders and the proposed director.'
    }
  ];

  const aboutSections = [
    {
      id: 'director-addition-intro',
      title: 'About Director Addition',
      content: 'In a Private Limited Company, directors play a crucial role in ensuring smooth operations and steering the strategic direction of the business. They manage daily activities and make vital decisions impacting the company\'s future, particularly concerning shareholder investments. As businesses evolve and expand, the need may arise to appoint additional directors to address growing demands or meet shareholder expectations. This process must be conducted strictly with the Companies Act of 2013 to maintain proper governance and ensure the company remains compliant.\n\nAt OnEasy, we offer expert assistance in navigating the complexities of director appointments. Our services help your company meet its strategic needs while ensuring adherence to all legal requirements. Our professional guidance is invaluable for companies looking to expand their board of directors and manage the appointment process seamlessly. Contact us today to learn more and start the process of adding new directors to your company.'
    },
    {
      id: 'role-of-director',
      title: 'Understanding the Role of a Director',
      content: 'A director is a pivotal figure appointed by shareholders to oversee the company\'s operations in accordance with the Memorandum of Association (MOA) and Articles of Association (AOA). Since a company is a legal entity that cannot act independently, it operates through individuals—namely, the directors. Collectively, these directors form the Board of Directors, which is entrusted with the overall management of the company.\n\nIn a Private Limited Company, directors are essential for daily decision-making and managing affairs. Shareholders trust directors to manage their investments efficiently, which often drives the process of appointing new directors.'
    },
    {
      id: 'types-of-directors',
      title: 'Types of Directors',
      content: 'Directors in a company can be categorised into several types, each with distinct functions:\n\n• Executive Directors: These individuals are deeply involved in daily operations and management, typically holding positions like Chief Executive Officer (CEO), Chief Financial Officer (CFO), or Chief Operating Officer (COO). They play a crucial role in strategic and operational decision-making.\n\n• Non-Executive Directors: Unlike executive directors, non-executive directors do not engage in day-to-day management. They provide objective oversight, contribute to board decisions, and bring external perspectives.\n\n• Independent Directors: This subset of non-executive directors is characterized by a lack of material or pecuniary relationships with the company or its management, ensuring unbiased judgments. Their primary duty is to protect shareholder interests and ensure transparency in governance practices.'
    },
    {
      id: 'appointment-process',
      title: 'The Appointment Process for Directors',
      content: 'The law mandates a minimum of two directors and allows for a maximum of fifteen in a private limited company. If additional directors are needed, a special resolution must be passed with more than 75% approval from voting shareholders. Each director appointment must comply with the Companies Act of 2013.\n\nKey Sections of the Companies Act, 2013 Related to Director Appointments:\n\n• Section 149: Outlines requirements for the composition of the Board of Directors, including the minimum and maximum number of directors, the necessity of a female director, and the inclusion of a resident director.\n\n• Section 152: Governs the appointment procedure, typically carried out during a general meeting, and emphasizes the requirement for a Director Identification Number (DIN).\n\n• Section 161: Provides guidelines on appointing additional, alternate, and nominee directors by the Board.\n\n• Section 164: Lists conditions that disqualify individuals from serving as directors.'
    },
    {
      id: 'reasons-for-adding',
      title: 'Reasons for Modifying or Adding Directors',
      content: 'Companies may consider adding or changing directors for several reasons:\n\n• Fresh Expertise: As a company grows, new skills and perspectives may be needed to navigate the accompanying challenges and opportunities.\n\n• Strategic Control: Adding more directors allows shareholders to distribute operational tasks while maintaining strategic oversight without diluting ownership stakes.\n\n• Revitalizing Board Performance: Introducing new directors can enhance board effectiveness when current directors face health issues or retirement challenges.\n\n• Legal Compliance: Companies must ensure they have the necessary number of directors to meet the requirements of the Companies Act 2013. If the board size falls below the mandated minimum, new appointments may be required.'
    },
    {
      id: 'procedure',
      title: 'Procedure for Director Appointment or Addition of a Director',
      content: 'The steps for appointing a director include:\n\n• Reviewing the Articles of Association (AOA): Ensure the AOA permits the addition of directors. If absent, amend the AOA.\n\n• Resolution at a General Meeting: Appointments typically occur at the Annual General Meeting (AGM). At other times, an Extraordinary General Meeting (EGM) is convened to pass a resolution for the appointment.\n\n• Application for DIN and DSC: The proposed director must obtain a Digital Signature Certificate (DSC) and a Director Identification Number (DIN).\n\n• Obtaining Director\'s Consent (Form DIR-2): The proposed director must formally agree to the appointment.\n\n• Issuing the Letter of Appointment: After fulfilling all requirements, the company issues a formal Letter detailing responsibilities and terms.\n\n• Regulatory Filings with the ROC: File the director\'s consent (Form DIR-2) and appointment particulars (Form DIR-12) with the Registrar of Companies (ROC) within 30 days.\n\n• Updating the Register of Directors: Update the Register of Directors and Key Managerial Personnel to reflect the new director\'s details.\n\n• Updating Regulatory and Tax Records: To maintain compliance, update the director\'s details with GST and other tax authorities.\n\nEach of these steps requires meticulous attention to detail and adherence to the legal requirements of the Companies Act 2013 to ensure valid and compliant director appointments.'
    },
    {
      id: 'why-oneasy',
      title: 'Simplifying Director Appointments with OnEasy',
      content: 'At OnEasy, we provide comprehensive support, starting with reviewing the Articles of Association (AOA) to ensure they permit the addition of directors. We then guide companies through the process of holding general meetings for director appointments and assist in obtaining the necessary Digital Signature Certificate (DSC) and Director Identification Number (DIN). Our expertise ensures that the entire process complies with the Companies Act of 2013, making the appointment of directors seamless and legally sound for businesses in India.\n\nConnect with OnEasy experts today and ensure a smooth, legally compliant board expansion for your business.'
    }
  ];

  const faqs = [
    {
      question: 'What is the minimum and maximum number of directors required in a Private Limited Company?',
      answer: 'A Private Limited Company must have a minimum of two directors and can have a maximum of fifteen directors.'
    },
    {
      question: 'What qualifications must a person meet to be appointed director?',
      answer: 'A director must be at least 18 years old, not disqualified under the Companies Act, and must provide a Director Identification Number (DIN) and Digital Signature Certificate (DSC).'
    },
    {
      question: 'How is a new director appointed in a Private Limited Company?',
      answer: 'A new director is typically appointed through a resolution passed in a general meeting. For appointments outside the AGM, an extraordinary general meeting (EGM) must be convened.'
    },
    {
      question: 'What documents are required for appointing a new director?',
      answer: 'Required documents include the proposed director\'s PAN card, proof of identity, proof of residence, recent passport-sized photo, and consent to act as a director (Form DIR-2).'
    },
    {
      question: 'What is the Director Identification Number (DIN), and how can it be obtained?',
      answer: 'The DIN is a unique identification number for directors issued by the Registrar of Companies (ROC). It can be obtained by submitting an application in Form DIR-3 and the required documents.'
    },
    {
      question: 'Should a general meeting be held to add a director?',
      answer: 'Yes, a general meeting is required to pass a resolution appointing a new director, except in specific cases where the Board has the authority to appoint directors.'
    },
    {
      question: 'What are the consequences of not filing the appointment of a new director with the ROC?',
      answer: 'Please file the appointment with the ROC within 30 days to avoid penalties for the company and the appointed director.'
    },
    {
      question: 'Can a foreign national be appointed director in an Indian company?',
      answer: 'A foreign national can be appointed as a director in an Indian Private Limited Company, provided they have a valid DIN and comply with the necessary legal requirements.'
    },
    {
      question: 'How does the appointment of a new director impact the company\'s management?',
      answer: 'Appointing a new director can bring fresh perspectives and expertise to the board, enhance decision-making, and help manage the company\'s operations more effectively.'
    },
    {
      question: 'What is the process for removing a director from a Private Limited Company?',
      answer: 'A director can be removed through a special resolution passed at a general meeting, with at least 75% approval from the voting shareholders. The director must be allowed to present their case before the resolution is passed.'
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
                console.log('Initiating payment for Director Addition:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'director-addition');
                localStorage.setItem('selectedRegistrationTitle', 'Director Addition');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/director-addition-form');
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
            introTitle="About Director Addition"
            introDescription="In a Private Limited Company, directors play a crucial role in ensuring smooth operations and steering the strategic direction of the business. They manage daily activities and make vital decisions impacting the company's future."
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
      <PaymentSuccessPopup 
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)} 
      />
    </div>
  );
}

export default DirectorAdditionDetails;

