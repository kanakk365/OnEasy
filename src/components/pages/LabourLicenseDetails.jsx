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

function LabourLicenseDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  // Packages as per user requirements
  const packages = [
    {
      name: 'Starter',
      price: '999',
      priceValue: 999,
      period: 'One Time',
      description: 'Basic labour license registration',
      icon: '★',
      features: [
        'CA Assisted Registration',
        'Shops & establishment act registration',
        'Proprietorship certificate',
        'Startup Bank Current Account'
      ],
      color: 'blue'
    },
    {
      name: 'Starter',
      price: '1,499',
      priceValue: 1499,
      period: 'One Time',
      description: 'Enhanced labour license package',
      icon: '✢',
      features: [
        'CA Assisted Registration',
        'Shops & establishment act registration ( 5 employees )',
        'Proprietorship certificate',
        'Startup Bank Current Account',
        'Guidance'
      ],
      color: 'blue'
    },
    {
      name: 'Growth',
      price: '3,499',
      priceValue: 3499,
      period: 'One Time',
      description: 'Complete labour license solution',
      icon: '✤',
      features: [
        'CA Assisted Registration',
        'Shops & establishment act registration',
        'Proprietorship certificate',
        'Startup Bank Current Account',
        'MSME registration',
        '15 mins CA consultation'
      ],
      isHighlighted: true,
      color: 'blue'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Eligibility Check',
      description: 'Determine whether your business needs a Labour License based on employee count and the nature of your operations.'
    },
    {
      step: 2,
      title: 'Application Submission',
      description: "Complete the application form required by your state's Labour Department. This can usually be done online or at designated offices."
    },
    {
      step: 3,
      title: 'License Issuance',
      description: 'After successful verification and inspection (if required), the Labour License will be issued, allowing you to legally employ workers.'
    }
  ];

  const documents = [
    'Business Name',
    'Nature of Business (MOA in case of company)',
    'Latest utility bill of the Business Premises (Electricity Bill)',
    'PAN Card of the Business entity',
    'PAN Card of the employer',
    'Aadhaar Card of the employer',
    'Bank Statement of the employer (Recent)',
    'Photo of the Employer',
    'Details about employees and gender',
    'Bank statement of the business'
  ];

  const prerequisites = [
    {
      title: 'Employment Size',
      description: 'Businesses employing a specific minimum number of workers (usually 10 or more) must obtain a Labour License, depending on state regulations.'
    },
    {
      title: 'Type of Business',
      description: 'Industries such as construction, manufacturing, and services, where labor is a significant component, are often mandated to acquire a Labour License.'
    },
    {
      title: 'Contract Labour',
      description: 'Companies engaging contract laborers must obtain a Labour License to ensure compliance with the Contract Labour (Regulation and Abolition) Act, 1970.'
    },
    {
      title: 'Safety Regulations',
      description: 'Establishments that need to adhere to safety and health regulations for their workforce must secure a Labour License to demonstrate compliance.'
    },
    {
      title: 'Government Contracts',
      description: 'Businesses seeking government contracts or tenders may be required to possess a valid Labour License as part of the eligibility criteria.'
    },
    {
      title: 'Legal Compliance',
      description: 'Any organization aiming to comply with labor laws and regulations, ensuring fair treatment and welfare of employees, should obtain a Labour License.'
    }
  ];

  const aboutSections = [
    {
      id: 'registration-process',
      title: 'Registration Process',
      content: [
        {
          title: 'Eligibility Check',
          description: 'Determine whether your business needs a Labour License based on employee count and the nature of your operations.'
        },
        {
          title: 'Application Submission',
          description: "Complete the application form required by your state's Labour Department. This can usually be done online or at designated offices."
        },
        {
          title: 'Document Submission',
          description: 'Provide the necessary documents as outlined by the Labour Department.'
        },
        {
          title: 'Inspection',
          description: 'In certain cases, a departmental inspection may occur to verify compliance with labor laws.'
        },
        {
          title: 'License Issuance',
          description: 'After successful verification, the Labour License will be issued, allowing you to legally employ workers.'
        }
      ]
    },
    {
      id: 'advantages',
      title: 'Advantages of Holding a Labour License',
      content: [
        {
          title: 'Legal Compliance',
          description: 'Ensures adherence to labor laws, minimizing the risk of legal complications and penalties.'
        },
        {
          title: 'Employee Protection',
          description: 'Establishes a framework for safeguarding employee rights, contributing to a healthier workplace environment.'
        },
        {
          title: 'Enhanced Credibility',
          description: "Boosts your business's reputation by demonstrating a commitment to ethical practices."
        },
        {
          title: 'Access to Government Benefits',
          description: 'Eligible for government schemes and subsidies designed for registered businesses.'
        }
      ]
    },
    {
      id: 'disadvantages',
      title: 'Disadvantages of Holding a Labour License',
      content: [
        {
          title: 'Compliance Costs',
          description: 'The registration process may incur fees and ongoing compliance costs.'
        },
        {
          title: 'Bureaucratic Delays',
          description: 'The process can sometimes be slow and cumbersome, leading to delays in obtaining the license.'
        },
        {
          title: 'Periodic Renewals',
          description: 'Labour Licenses may require periodic renewals, necessitating continuous administrative efforts.'
        }
      ]
    },
    {
      id: 'benefits',
      title: 'Benefits of Holding a Labour License',
      content: [
        {
          title: 'Risk Mitigation',
          description: 'Reduces the chances of disputes related to employee rights and benefits.'
        },
        {
          title: 'Improved Employee Relations',
          description: 'Fosters trust and goodwill among employees, enhancing productivity and morale.'
        },
        {
          title: 'Government Support',
          description: 'Registered businesses may receive guidance and support from government initiatives aimed at promoting labor welfare.'
        }
      ]
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: 'In conclusion, obtaining a Labour License is a crucial step for businesses employing a significant workforce. While there are costs and administrative responsibilities involved, the long-term benefits of legal compliance, employee protection, and enhanced business credibility far outweigh the disadvantages.\n\nStay informed about the specific requirements and processes applicable in your state to ensure a smooth registration process with OnEasy.'
    }
  ];

  const faqs = [
    {
      question: 'What is a Labour License?',
      answer: 'A Labour License is a legal document required for certain businesses in India that employ a specific number of workers, ensuring compliance with labor laws.'
    },
    {
      question: 'Who needs to obtain a Labour License?',
      answer: 'Businesses that employ a certain number of workers (usually 10 or more, depending on the state) in sectors such as construction, manufacturing, and services are required to obtain a Labour License.'
    },
    {
      question: 'What is the registration process for obtaining a Labour License?',
      answer: 'The process involves checking eligibility, submitting an application form, providing necessary documents, undergoing an inspection (if required), and receiving the license upon approval.'
    },
    {
      question: 'What documents are required for Labour License registration?',
      answer: 'Common documents include the application form, business registration certificate, address proof, employee details, bank account information, PAN card, and any relevant licenses.'
    },
    {
      question: 'How long does it take to obtain a Labour License?',
      answer: 'The time frame can vary based on the state and the efficiency of the Labour Department, but it generally takes a few weeks to a couple of months.'
    },
    {
      question: 'Is there a fee for obtaining a Labour License?',
      answer: 'Yes, there are fees associated with the registration process, which can vary by state and the number of employees.'
    },
    {
      question: 'What are the benefits of obtaining a Labour License?',
      answer: 'Benefits include legal compliance, employee protection, enhanced business credibility, and access to government schemes and subsidies.'
    },
    {
      question: 'What happens if a business operates without a Labour License?',
      answer: 'Operating without a Labour License can lead to legal penalties, fines, and potential closure of the business.'
    },
    {
      question: 'Does a Labour License need to be renewed?',
      answer: 'Yes, Labour Licenses typically require periodic renewals, which necessitate ongoing administrative efforts.'
    },
    {
      question: 'How can OnEasy assist with Labour License registration?',
      answer: 'OnEasy can provide guidance through the registration process, assist in document preparation, and ensure compliance with state-specific regulations, simplifying the overall process for business owners.'
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
                  console.log('Initiating payment for Labour License:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'labour-license');
                  localStorage.setItem('selectedRegistrationTitle', 'Labour License Registration');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success && result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/labour-license-form');
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
            introTitle="About Labour License"
            introDescription="A Labour License is a mandatory legal requirement for certain businesses in India that employ a specified number of workers. It ensures compliance with various labor laws, safeguarding both employees' rights and employers' interests. Understanding the registration process, required documentation, and the pros and cons of obtaining a Labour License is essential for business owners. At OnEasy, our team of experts is committed to guiding businesses through the complexities of Labour License Registration."
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

export default LabourLicenseDetails;

