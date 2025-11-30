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

function ESIDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  // Packages as per user requirements
  const packages = [
    {
      name: 'Starter',
      price: '4,999',
      priceValue: 4999,
      originalPrice: '7,599',
      originalPriceValue: 7599,
      period: 'One Time',
      description: 'Basic ESI registration package',
      icon: '★',
      features: [
        'ESIC Application',
        'ESIC Submission',
        'ESIC Certificate',
        'Setting up of the policies',
        'Adding 5 employees'
      ],
      color: 'blue'
    },
    {
      name: 'Growth',
      price: '7,599',
      priceValue: 7599,
      originalPrice: '10,599',
      originalPriceValue: 10599,
      period: 'One Time',
      description: 'Enhanced ESI package',
      icon: '✢',
      features: [
        'ESIC Application',
        'ESIC Submission',
        'ESIC Certificate',
        'Setting up of the policies',
        'Adding 5 employees',
        'PF registration',
        'PF returns for 3 Months'
      ],
      color: 'blue'
    },
    {
      name: 'Pro',
      price: '11,999',
      priceValue: 11999,
      originalPrice: '13,999',
      originalPriceValue: 13999,
      period: 'One Time',
      description: 'Complete ESI solution',
      icon: '✤',
      features: [
        'ESIC Application',
        'ESIC Submission',
        'ESIC Certificate',
        'Setting up of the policies',
        'Adding 5 employees',
        'PF registration',
        'PF returns for 3 Months',
        'PT Registration',
        'Labour License'
      ],
      isHighlighted: true,
      color: 'blue'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Application and Document Preparation',
      description: 'Our team assists you in preparing the ESIC application and gathering all required documents including business registration proof, PAN cards, employee details, and bank statements.'
    },
    {
      step: 2,
      title: 'ESIC Portal Submission',
      description: 'We submit your ESI registration application through the ESIC portal on your behalf, ensuring all information is accurate and compliant with ESIC regulations.'
    },
    {
      step: 3,
      title: 'Certificate Issuance and Policy Setup',
      description: 'Once approved, you receive your ESIC certificate and we help set up policies and add employees to the ESI scheme, ensuring your business is fully compliant.'
    }
  ];

  const documents = [
    'Business registration proof',
    'Partnership Deed/ MOA & AOA',
    'GST registration certificate',
    'Company PAN Card',
    'PAN Card of all the Employees',
    'Employee salary details',
    'Employee attendance register',
    'Bank Statement of the Company',
    'Director and shareholder details'
  ];

  const prerequisites = [
    {
      title: 'ESI Registration Requirements',
      description: 'The following businesses are required to register for ESI if they employ 10 or more workers:\n\n• Retail outlets\n• Dining establishments and hotels\n• Road transport organizations\n• Private educational institutions\n• Private healthcare providers\n• Media houses such as newspaper establishments\n\nFor central government-related businesses, ESI registration becomes mandatory when employing 20 or more individuals.'
    }
  ];

  const aboutSections = [
    {
      id: 'esi-overview',
      title: 'ESI Scheme Overview',
      content: 'The Employee State Insurance (ESI) scheme operates under the ESI Act of 1948, providing essential social security benefits to workers. The scheme is managed by the Employee State Insurance Corporation (ESIC), and employers are required to register their businesses with ESIC and provide employee details to include them in the scheme.\n\nGiven the complex regulations involved, OnEasy\'s ESI registration experts are here to support you at every step.'
    },
    {
      id: 'scope',
      title: 'Scope of Establishments Under the ESI Act',
      content: 'The Employee State Insurance (ESI) Act applies to any organized establishment employing 10 or more workers (or 20 in some states), where employees earn up to Rs. 21,000 per month, or Rs. 25,000 for individuals with disabilities. The law also covers retail outlets, restaurants, movie theatres, road transport companies, private healthcare institutions, and educational entities.\n\nBoth state and central government-affiliated entities that meet the criteria must also register under the ESI Act.'
    },
    {
      id: 'registration-benefits',
      title: 'ESI Registration Benefits',
      content: 'All employees in establishments with more than 10 employees are eligible for ESI benefits under the ESI Act.\n\nWorkers earning less than Rs. 21,000 per month, or Rs. 25,000 for disabled employees, are eligible for comprehensive medical and social security benefits, including maternity benefits.'
    },
    {
      id: 'advantages',
      title: 'Advantages of ESI Registration with OnEasy',
      content: [
        {
          title: 'Sickness Benefit',
          description: '70% of wages for up to 91 days annually during illness.'
        },
        {
          title: 'Extended Sickness Benefit',
          description: '80% of wages for long-term illnesses for up to two years.'
        },
        {
          title: 'Maternity Benefit',
          description: '100% of wages for up to 26 weeks, with extensions for additional conditions.'
        },
        {
          title: 'Medical Benefits',
          description: 'Full medical care for employees and dependents.'
        },
        {
          title: 'Permanent & Temporary Disablement Benefits',
          description: '90% of wages provided during temporary or permanent disability.'
        },
        {
          title: 'Dependents\' Benefit',
          description: '90% of wages for dependents in case of death due to workplace injury.'
        },
        {
          title: 'Funeral Expenses',
          description: 'Rs. 15,000 to cover funeral costs.'
        }
      ]
    },
    {
      id: 'compliances',
      title: 'Compliances After ESI Registration',
      content: 'Once ESI registration is complete, businesses must maintain certain records, including:\n\n• Attendance register\n• Wages register\n• Accident register\n• Monthly returns and challan submissions'
    },
    {
      id: 'process',
      title: 'ESI Registration Process at OnEasy',
      content: 'The ESI registration process has been simplified, and our team at OnEasy is here to assist you through each step. We offer seamless guidance for completing the online registration process on the ESIC portal, ensuring compliance without any hassle.\n\nOur efficient process saves you time, offers transparency, and provides continuous updates throughout. Should you have any questions, our team is always available to provide support.'
    }
  ];

  const faqs = [
    {
      question: 'What is ESI registration?',
      answer: 'ESI (Employee State Insurance) registration is a process through which eligible employers register their businesses with the Employee State Insurance Corporation (ESIC) to provide health and social security benefits to their employees earning less than Rs. 21,000 per month (or Rs. 25,000 for disabled employees).'
    },
    {
      question: 'Who is eligible for ESI registration?',
      answer: 'Any business with 10 or more employees (or 20 in some states) earning less than Rs. 21,000 per month is required to register under the ESI Act and provide coverage to their employees.'
    },
    {
      question: 'What benefits do employees receive under the ESI scheme?',
      answer: 'Employees receive various benefits such as medical care, sickness benefits, maternity benefits, dependents\' benefits in case of death due to employment injury, and disability benefits in case of temporary or permanent disability.'
    },
    {
      question: 'Is ESI registration mandatory for all businesses?',
      answer: 'Yes, ESI registration is mandatory for businesses that meet the eligibility criteria, such as having 10 or more employees and offering a salary below the specified threshold of Rs. 21,000.'
    },
    {
      question: 'What documents are required for ESI registration?',
      answer: 'The key documents include business registration proof, GST registration, PAN cards of the business and employees, employee salary details, bank account information, director/shareholder details, and an attendance register.'
    },
    {
      question: 'What is the contribution rate under the ESI scheme?',
      answer: 'Under the ESI scheme, employers contribute 3.25% of the employee\'s wages, and employees contribute 0.75% of their wages, totaling 4% of the salary.'
    },
    {
      question: 'How long does it take to complete the ESI registration process?',
      answer: 'The ESI registration process can typically be completed within 7 to 15 working days, depending on the accuracy of the information provided and any additional requirements by the ESIC.'
    },
    {
      question: 'Can the ESI registration process be done online?',
      answer: 'Yes, ESI registration can be done entirely online through the ESIC portal. At OnEasy, we assist businesses in completing the online registration process seamlessly.'
    },
    {
      question: 'What are the post-registration compliances for ESI?',
      answer: 'After registration, businesses must maintain records such as an attendance register, wage register, accident register, and submit monthly returns and challans to ensure compliance with ESIC regulations.'
    },
    {
      question: 'What are the penalties for non-compliance with ESI registration?',
      answer: 'Non-compliance with ESI registration can result in penalties, fines, and legal action. It is crucial for eligible businesses to register and comply with ESI regulations to avoid such consequences.'
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
                  console.log('Initiating payment for ESI Registration:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'esi');
                  localStorage.setItem('selectedRegistrationTitle', 'Employee State Insurance (ESI) Registration');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success && result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/esi-form');
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
            introTitle="About Employee State Insurance (ESI) Registration"
            introDescription="Employee State Insurance (ESI) registration is a mandatory compliance requirement for businesses in India, governed by the Employee State Insurance Corporation (ESIC). This scheme provides social security and health insurance benefits to workers earning a specified monthly wage, extending to their dependents. Depending on the type and location of the business, it applies to companies with 10 or more employees. At OnEasy, our team of experts is committed to guiding businesses through the complexities of ESI registration. With our in-depth knowledge of the regulatory landscape and a client-centric approach, we ensure a smooth and efficient ESIC registration process online, securing the extensive benefits of the ESI scheme for your employees."
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

export default ESIDetails;

