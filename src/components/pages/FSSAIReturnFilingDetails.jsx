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

function FSSAIReturnFilingDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('fssai-return-filing');

  const processSteps = [
    {
      step: 1,
      title: 'Prepare Returns',
      description: 'Gather all necessary information and prepare FSSAI returns.'
    },
    {
      step: 2,
      title: 'File Returns',
      description: 'Submit the returns through the FSSAI portal.'
    },
    {
      step: 3,
      title: 'Verification',
      description: 'FSSAI authorities verify and process the filed returns.'
    }
  ];

  const documents = [
    'Name of the product',
    'Container size or packaging type',
    'Quantity in Metric Tons',
    'Selling price per unit',
    'Value of the food product',
    'Quantity of imported goods in kgs',
    'List of countries or ports of import',
    'Rate per unit for packaging cost'
  ];

  const prerequisites = [
    {
      title: 'Business Turnover',
      description: 'FBOs with a business turnover exceeding Rs. 12 lakhs must file FSSAI returns.'
    },
    {
      title: 'Food Activities',
      description: 'FBOs involved in importing, selling, manufacturing, exporting, storing, distributing, handling, or transporting food products must file FSSAI returns.'
    },
    {
      title: 'Milk Manufacturing and Distribution',
      description: 'FBOs engaged in manufacturing and distributing milk must also file FSSAI returns.'
    }
  ];

  const aboutSections = [
    {
      id: 'fssai-return-intro',
      title: 'About FSSAI Return Filing',
      content: 'As per the Food Safety and Standards Authority of India (FSSAI) regulations, every food business with an FSSAI license must submit an annual return individually. This applies to each FSSAI license held, regardless of whether the same Food Business Operator holds multiple licenses.\n\nWith OnEasy by your side, managing FSSAI Annual Return filings is effortless, allowing you to focus on what you do best – delivering safe, quality food to your valued customers.'
    },
    {
      id: 'purpose',
      title: 'Purpose of the Annual Food Business Return',
      content: 'The Annual Food Business Return ensures compliance with FSSAI regulations and promotes transparency in operations. By submitting the return, businesses provide essential details to the FSSAI on their operations, covering aspects like food production, handling, storage, and distribution. Food Business Operators (FBOs) should recognize the importance of timely submission, as non-compliance can result in penalties or even suspension of the FSSAI license, potentially disrupting business operations.'
    },
    {
      id: 'eligible-fbos',
      title: 'Food Business Operators (FBOs) Eligible for Annual Return Submission',
      content: 'The FSSAI annual return in Form D1 must be submitted online to the Food Licensing Authority by certain Food Business Operators (FBOs) based on the type of food products manufactured or sold during the previous financial year. This includes:\n\n• Food manufacturers\n\n• Labelers\n\n• Importers\n\n• Packers\n\n• FBOs engaged in the distribution of milk and milk products'
    },
    {
      id: 'exempted',
      title: 'Exempted Entities from Filing Returns',
      content: 'The FSSAI has issued a notification exempting certain entities from filing the FSSAI annual return, including:\n\n• Fast-food joints: Primarily focused on fast-food preparation and service.\n\n• Restaurants: Dining establishments serving prepared meals and beverages for on-site consumption.\n\n• Grocery stores: Retailers selling a variety of food and household items.\n\n• Canteens: Facilities serving food to specific groups, such as workplace employees or students.\n\nThese exempted entities are not obligated to file the FSSAI annual return.'
    },
    {
      id: 'deadline',
      title: 'Deadline for Food Business Annual Return',
      content: 'Under Clause 2.1.13(1) of the Food Safety and Standards (Licensing and Registration of Food Businesses) Regulation, 2011, all licensed manufacturers and importers must submit their Annual Return using Form D1 by May 31 each year, covering activities from the previous financial year.'
    },
    {
      id: 'penalties',
      title: 'Penalties for Late or Non-Submission of Annual Returns',
      content: 'It is crucial to meet the submission deadline. Any delay in filing the Food Business Annual Return beyond May 31 will incur a penalty of Rs. 100 per day until the return is filed, with a maximum penalty of up to five times the annual license fees.'
    },
    {
      id: 'online-submission',
      title: 'Online Submission of Annual Returns for Food Businesses',
      content: 'On December 18, 2020, the Food Safety and Standards Authority of India (FSSAI) issued updated guidelines requiring food businesses involved in manufacturing and importing food products to submit annual returns online from the financial year 2020-2021 onwards.'
    },
    {
      id: 'how-oneasy-helps',
      title: 'How OnEasy Can Assist with FSSAI Annual Return Filings',
      content: 'At OnEasy, we understand the importance of timely and accurate FSSAI Annual Return filings for Food Business Operators (FBOs).\n\nHere\'s how we help:\n\n• Compliance Expertise: Our team provides clear guidance on the FSSAI Annual Return filing process, ensuring you understand your obligations.\n\n• Document Collection and Verification: We help collect and organize the necessary information and documents for FSSAI Annual Return. Our professionals review and verify the accuracy of all data to minimize errors.\n\n• Form D1 Preparation: We prepare the FSSAI Annual Return in Form D1, making sure all required details are accurately filled out.\n\n• Timely Submission: We keep you informed of submission deadlines, ensuring your FSSAI Annual Return is filed on time and helping you avoid penalties.\n\n• Penalty Avoidance: We explain the penalties for late or non-submission, motivating timely compliance.\n\n• Compliance Updates: We keep you informed of any FSSAI regulatory changes impacting Annual Return filings, so you can have peace of mind.\n\nOnEasy is dedicated to making the FSSAI Annual Return filing process seamless for FBOs. Our experienced professionals help your food business stay compliant, allowing you to focus on running your business effectively while ensuring food safety standards.'
    }
  ];

  const faqs = [
    {
      question: 'What is FSSAI Return Filing?',
      answer: 'FSSAI Return Filing is an annual submission that food business operators must complete to comply with regulations set by the Food Safety and Standards Authority of India (FSSAI). It provides information on food-related activities conducted during the financial year.'
    },
    {
      question: 'Who is required to file an FSSAI Annual Return?',
      answer: 'All Food Business Operators (FBOs) holding an FSSAI license, including manufacturers, labelers, importers, packers, and distributors of milk and milk products, are required to file an annual return.'
    },
    {
      question: 'Are there any exemptions from filing the FSSAI Annual Return?',
      answer: 'Yes, certain businesses such as fast-food joints, restaurants, grocery stores, and canteens are exempt from filing the annual return as per FSSAI notifications.'
    },
    {
      question: 'What is the deadline for filing the FSSAI Annual Return?',
      answer: 'The FSSAI Annual Return (Form D1) must be filed by May 31 each year, covering the activities of the previous financial year.'
    },
    {
      question: 'What are the penalties for late or non-submission of the FSSAI Annual Return?',
      answer: 'FBOs who file their return after the May 31 deadline may face a penalty of Rs. 100 per day until submission, with a maximum penalty of up to five times the annual license fees.'
    },
    {
      question: 'What information is required in the FSSAI Annual Return?',
      answer: 'Details needed include the name of the product, container size, quantity in Metric Tons, selling price, total value, quantity of imports, and list of import sources.'
    },
    {
      question: 'How can FBOs submit the FSSAI Annual Return?',
      answer: 'FBOs can submit the FSSAI Annual Return online through the Food Licensing Authority\'s portal, making it easier and faster to comply with filing requirements.'
    },
    {
      question: 'Do I need to file separate returns for each license if I operate multiple food businesses?',
      answer: 'Yes, each licensed food business unit must submit a separate FSSAI Annual Return, regardless of ownership by the same Food Business Operator.'
    },
    {
      question: 'What is Form D1 in FSSAI Return Filing?',
      answer: 'Form D1 is the standard form prescribed by FSSAI for the Annual Return filing. It includes information about food items produced, imported, and sold by the FBO during the financial year.'
    },
    {
      question: 'Can I file my FSSAI Annual Return if I don\'t have all the required details?',
      answer: 'It\'s essential to collect and accurately fill in all required information before filing, as missing or incorrect details could result in penalties or delays in processing the return.'
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
                localStorage.setItem('selectedRegistrationType', 'fssai-return-filing');
                localStorage.setItem('selectedRegistrationTitle', 'FSSAI Return Filing');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/fssai-return-filing-form');
                  }
                }
              } catch (error) {
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
            introTitle="About FSSAI Return Filing"
            introDescription="FSSAI return filing is mandatory for food businesses to maintain compliance."
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

export default FSSAIReturnFilingDetails;

