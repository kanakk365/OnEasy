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

function ProfessionalTaxDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages: apiPackages, loading: packagesLoading } = usePackages('professional-tax');
  
  // Use packages from API, fallback to empty array if loading
  const packages = packagesLoading ? [] : apiPackages;

  const processSteps = [
    {
      step: 1,
      title: 'Application Preparation',
      description: 'We help you prepare all required documents and complete the professional tax registration application form accurately.'
    },
    {
      step: 2,
      title: 'Application Submission',
      description: 'Submit your application to the appropriate state authority along with all necessary documents and fees.'
    },
    {
      step: 3,
      title: 'Obtain Registration Certificate',
      description: 'Receive your Professional Tax Registration Certificate (PTRC) and Professional Tax Enrollment Certificate (PTEC) upon approval.'
    }
  ];

  const documents = [
    'Registration Certificate',
    'MOA and AOA',
    'PAN Card of Company/LLP/Proprietor',
    'Aadhaar Card of Proprietor/Director',
    'NOC from the landlord (if applicable)',
    'Photographs of Proprietor/Director',
    'Bank Statement of Proprietor/Director',
    'Employee details and salary structure'
  ];

  const prerequisites = [
    {
      title: 'Registration Requirement',
      description: 'Registering for professional tax is mandatory for businesses and professionals within 30 days of starting operations or employment.'
    },
    {
      title: 'Applicability of Professional Tax',
      description: 'Professional tax applies to a wide range of professionals, trades, and employment types. This tax must be paid by Individuals, Hindu Undivided Families (HUF), Companies/Firms/Co-operative Societies/Associations of Persons, whether incorporated or not. Professionals such as lawyers, teachers, doctors, chartered accountants, and others earning income from their work must pay professional tax.'
    },
    {
      title: 'States Where Professional Tax is Applicable',
      description: 'Professional tax is levied by specific states in India. The states include: Andhra Pradesh, Assam, Bihar, Gujarat, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Pondicherry, Punjab, Sikkim, Tamil Nadu, Telangana, Tripura, and West Bengal.'
    }
  ];

  const aboutSections = [
    {
      id: 'what-is-professional-tax',
      title: 'What is Professional Tax?',
      content: 'Professional tax is a direct tax imposed on individuals earning an income from practicing a profession, employment, calling, or trade. Unlike income tax, which is levied by the Central Government, professional tax is collected by the respective State or Union Territory governments in India. For salaried individuals, employers are responsible for deducting professional tax from the salary and remitting it to the state government. Professionals operating as independent entities are mandated to remit the professional tax directly to the authorities. While the applicable tax amount varies by state jurisdiction, it is subject to an annual ceiling of ₹2,500.'
    },
    {
      id: 'professional-tax-rates',
      title: 'Professional Tax Rates',
      content: "The maximum annual professional tax payable is ₹2,500. This tax is deducted from an individual's income on a monthly basis and is calculated on the basis of the person's gross income. Each state/union territory determines tax slabs, which vary accordingly."
    },
    {
      id: 'who-pays',
      title: 'Who Pays Professional Tax?',
      content: 'For salaried employees, the employer is responsible for deducting professional tax and paying it to the respective state government. Self-employed professionals such as freelancers and individuals in business must directly pay professional tax to the government.'
    },
    {
      id: 'employer-responsibility',
      title: "Employer's Responsibility for Professional Tax",
      content: "Business owners must ensure professional tax is deducted from employees' salaries and paid to the appropriate government department. They are also responsible for filing the tax return within the specified time, along with proof of tax payment."
    },
    {
      id: 'exemptions',
      title: 'Exemptions from Professional Tax',
      content: 'Certain individuals are exempt from paying professional tax, including:\n\n• Parents of children with permanent disabilities or mental disabilities\n• Members of the Armed Forces, auxiliary forces, or reservists\n• Badli workers in the textile industry\n• Individuals with permanent physical disabilities (including blindness)\n• Senior citizens over the age of 65\n• Guardians of individuals with mental disabilities\n• Women agents under specific savings schemes'
    },
    {
      id: 'registration-compliance',
      title: 'Professional Tax Registration and Compliance',
      content: 'Registering for professional tax is mandatory for businesses and professionals within 30 days of starting operations or employment. OnEasy makes this process simple and hassle-free, ensuring timely and accurate registration with minimal effort on your part.'
    },
    {
      id: 'due-dates',
      title: 'Due Dates for Professional Tax Payment',
      content: 'Employers with more than 20 employees must pay professional tax by the 15th of the following month. For businesses with fewer employees, payment is due quarterly.'
    },
    {
      id: 'return-filing',
      title: 'Professional Tax Return Filing',
      content: 'Professional tax returns must be filed by all liable individuals and entities. Filing deadlines differ by state, and timely filing is crucial to avoid penalties.'
    },
    {
      id: 'benefits',
      title: 'Benefits of Professional Tax Registration',
      content: [
        {
          title: 'Simple Compliance',
          description: 'With straightforward regulations, compliance becomes easier and more manageable.'
        },
        {
          title: 'Legal Requirement',
          description: 'Timely payment helps avoid penalties and legal action.'
        },
        {
          title: 'Revenue for State Welfare',
          description: 'Professional tax contributes to state revenues, helping fund welfare and development schemes.'
        },
        {
          title: 'Tax Deductions',
          description: 'Employers and professionals can claim deductions on previously paid professional tax.'
        }
      ]
    },
    {
      id: 'registration-process',
      title: 'Registration Process',
      content: [
        {
          title: 'Submit Application',
          description: 'Submit an application form along with the required documents.'
        },
        {
          title: 'Application Submission',
          description: 'OnEasy will ensure your application is submitted correctly and on time to the concerned state authority.'
        },
        {
          title: 'Certificate Issuance',
          description: 'The application is reviewed by the tax authority, and after verification, a professional tax registration certificate is issued.'
        }
      ]
    },
    {
      id: 'penalties',
      title: 'Penalties for Non-Compliance',
      content: 'Failure to register or pay professional tax on time can result in penalties. The specific penalties differ by state. In Maharashtra, for example, the penalties are as follows:\n\n• Not obtaining PT registration: ₹5 per day\n• Late filing of PT return: ₹1,000\n• Late payment of dues: 1.25% interest per month, with an additional 10% penalty'
    },
    {
      id: 'oneasy-services',
      title: 'Seamless Professional Tax Services with OnEasy',
      content: "OnEasy simplifies professional tax registration for businesses and individuals. Here's how we can help:\n\n• Expert Advice: OnEasy provides expert advice, ensuring your registration complies with the latest rules and regulations.\n• Complete Assistance: We handle the submission of your tax registration, ensuring compliance with all legal requirements.\n• Fast Registration: Our efficient processes ensure fast registration and timely issuance of the tax certificate.\n• Personalized Services: OnEasy offers personalized services tailored to meet your business's unique needs.\n• Updated Compliance: We stay up-to-date with the latest tax regulations to ensure your compliance at all times.\n• Dedicated Customer Support: Our team is available to answer any questions and provide assistance throughout the registration process.\n\nLet OnEasy handle your professional tax registration, so you can focus on your business with peace of mind."
    }
  ];

  const faqs = [
    {
      question: 'What is Professional Tax?',
      answer: 'Professional tax is a state-imposed tax levied on individuals earning income through employment, business, or profession. The tax is deducted by employers from salaries and deposited with the State Government.'
    },
    {
      question: 'Who is required to register for Professional Tax?',
      answer: 'Any individual earning income from a salary or practicing a profession (such as doctors, lawyers, chartered accountants) must register and pay professional tax. Employers are also required to register and deduct the tax from employee salaries.'
    },
    {
      question: 'Is Professional Tax applicable across all states in India?',
      answer: 'No, Professional Tax is not applicable in all states. It is imposed by specific states such as Maharashtra, Karnataka, Tamil Nadu, West Bengal, Gujarat, etc. The rates and rules vary by state.'
    },
    {
      question: 'What are the penalties for not registering for Professional Tax?',
      answer: "Failure to register for Professional Tax or late payment of the tax can attract penalties, including fines or interest on the unpaid amount. Penalties vary depending on the state's regulations."
    },
    {
      question: 'How is Professional Tax calculated?',
      answer: 'Professional tax is typically calculated based on the income or salary of an individual. Each state has its own slab rates, and the tax amount increases as income levels rise.'
    },
    {
      question: 'Can Professional Tax be deducted as a business expense?',
      answer: 'Yes, Professional Tax paid by businesses for their employees can be deducted as a business expense under the Income Tax Act.'
    },
    {
      question: 'What is the process of Professional Tax registration for businesses?',
      answer: 'To register for Professional Tax, businesses need to submit relevant documents such as PAN, address proof, and employee details through the state government portal. OnEasy offers complete assistance with this registration process.'
    },
    {
      question: 'Are there any exemptions from paying Professional Tax?',
      answer: 'Yes, certain states provide exemptions for individuals with disabilities, senior citizens, or women engaged in specific professions. The exemptions vary from state to state.'
    },
    {
      question: 'Is Professional Tax the same for all employees in a company?',
      answer: "No, the amount of Professional Tax deducted from employees' salaries depends on their individual income and the slab rates applicable in the state."
    },
    {
      question: 'How often should Professional Tax be paid?',
      answer: "The payment frequency for Professional Tax depends on the state's rules. Typically, employers need to remit the tax monthly or quarterly, while professionals may need to pay annually."
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
                  console.log('Initiating payment for Professional Tax:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'professional-tax');
                  localStorage.setItem('selectedRegistrationTitle', 'Professional Tax Registration');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success) {
                    if (result.showPopup) {
                      console.log('✅ Payment successful! Showing popup...');
                      setShowPaymentPopup(true);
                    } else if (result.redirect) {
                      console.log('✅ Payment successful! Redirecting to form...');
                      navigate('/professional-tax-form');
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
            introTitle="About Professional Tax Registration"
            introDescription="Professional Tax is a direct tax on individuals earning income from professions, employment, or trades, collected by State or Union Territory governments in India. Unlike income tax, which is levied by the Central Government, employers deduct professional tax from salaried individuals' salaries and remit it to the state. Other professionals must pay this tax directly. The amount varies by state but is capped at ₹2,500 annually. Understanding professional tax is essential for compliance and financial planning."
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
            onClick={() => navigate('/registrations/professional-tax')}
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

export default ProfessionalTaxDetails;

