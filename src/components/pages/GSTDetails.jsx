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

function GSTDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  // Packages as per user requirements
  const packages = [
    {
      name: 'Starter',
      price: '2,599',
      priceValue: 2599,
      originalPrice: '4,599',
      period: 'One Time',
      description: 'Basic GST registration package',
      icon: '★',
      features: [
        'GST Application',
        'GST registration',
        'Filing GST return for one month'
      ]
    },
    {
      name: 'Growth',
      price: '5,599',
      priceValue: 5599,
      originalPrice: '7,499',
      period: 'One Time',
      description: 'Enhanced GST package',
      icon: '✢',
      features: [
        'GST Application',
        'GST registration',
        'Filing GST returns for two months',
        'MSME Registration',
        'GST Consultation'
      ]
    },
    {
      name: 'Pro',
      price: '12,999',
      priceValue: 12999,
      originalPrice: '17,499',
      period: 'One Time',
      description: 'Complete GST solution',
      icon: '✤',
      features: [
        'GST Application',
        'GST registration',
        'Filing GST returns for one year',
        'MSME Registration',
        'GST Consultation'
      ],
      isHighlighted: true
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Central Goods and Services Tax (CGST)',
      description: 'Levied by the Central Government on goods and services within a state.'
    },
    {
      step: 2,
      title: 'State Goods and Services Tax (SGST)',
      description: 'Charged by the State Government on Intra-State transactions.'
    },
    {
      step: 3,
      title: 'Integrated Goods and Services Tax (IGST)',
      description: 'Levied by the Central Government on Inter-State or State-to-Union Territory transactions.'
    }
  ];

  const documents = [
    'PAN Card of the Company/Owner/Partners',
    'Aadhaar Card of Company/Owner/Partners',
    'Bank Statement of the Directors/Partners',
    'Photograph of the Directors/Partners',
    'Partnership Deed/ MOA & AOA',
    'Registration Certificate',
    'Bank Statement of the Business'
  ];

  const prerequisites = [
    {
      title: 'Business Entities',
      description: 'Enterprises with annual turnover exceeding ₹40 lakhs (₹20 lakhs for special category states).'
    },
    {
      title: 'Service Providers',
      description: 'Those with turnover exceeding ₹20 lakhs (₹10 lakhs for special category states).'
    },
    {
      title: 'Inter-State Supply',
      description: 'Engaged in Inter-State supply of goods.'
    },
    {
      title: 'Casual Taxable Persons',
      description: 'Involved in occasional taxable supplies.'
    },
    {
      title: 'Reverse Charge Mechanism',
      description: 'Entities under Reverse Charge Mechanism and Input Service Distributors.'
    },
    {
      title: 'E-Commerce Operators',
      description: 'E-Commerce Operators and Non-Resident Taxable Persons.'
    },
    {
      title: 'Voluntary Registration',
      description: 'Businesses with turnover below ₹20 lakhs can voluntarily register for GST.'
    },
    {
      title: 'GST Turnover Limits',
      description: 'For service providers exceeding ₹20 lakhs and suppliers of goods exceeding ₹40 lakhs, GST registration is mandatory. Special provisions apply for businesses operating in special category states.'
    }
  ];

  const aboutSections = [
    {
      id: 'overview',
      title: 'About Goods & Services Tax Registration',
      content: 'GST Registration is crucial for businesses in India. If your business revenue exceeds certain threshold levels or belongs to specific categories that require GST registration, it is important to comply with the GST regulations.\n\nOnEasy is here to assist you in obtaining your GST registration effortlessly. Contact our experts today to streamline your GST registration process!'
    },
    {
      id: 'gst-overview',
      title: 'Overview of GST Registration Online',
      content: 'Since its implementation on July 1, 2017, the Goods and Services Tax (GST) has been mandatory for all service providers, traders, manufacturers, and even freelancers in India. GST was introduced to replace various Central and State-level taxes such as Service Tax, Excise Duty, CST, Entertainment Tax, Luxury Tax, and VAT, creating a more streamlined tax process. The GST registration charges may vary based on the type of business and turnover.\n\nFor taxpayers with an annual turnover of less than ₹1.5 crores, the GST system offers a Composition Scheme. This scheme provides simplified GST procedures and allows for tax payment at a fixed rate based on turnover.\n\nGST operates throughout different stages of the supply chain, from raw materials to production, wholesale, retail, and final sale to the consumer. GST is levied at each stage. For example, if a product is manufactured in West Bengal and sold in Uttar Pradesh, the GST revenue is allocated entirely to Uttar Pradesh, emphasizing GST\'s consumption-based nature.'
    },
    {
      id: 'key-components',
      title: 'Key Components of GST Registration',
      content: 'The Goods and Services Tax (GST) in India is categorized into three main components:\n\n• Central Goods and Services Tax (CGST): Levied by the Central Government on goods and services within a state.\n\n• State Goods and Services Tax (SGST): Charged by the State Government on Intra-State transactions.\n\n• Integrated Goods and Services Tax (IGST): Levied by the Central Government on Inter-State or State-to-Union Territory transactions.'
    },
    {
      id: 'advantages',
      title: 'Advantages of GST Registration',
      content: 'Registering for GST offers several benefits:\n\n• Legal Compliance: Ensures your business complies with tax laws and avoids penalties.\n\n• Input Tax Credit: Claim credit on the GST paid on purchases.\n\n• Ease of Inter-State Trade: Transact across states without facing tax issues.\n\n• Elimination of Cascading Effect: Reduces the cost of goods and services.\n\n• Competitive Edge: Gain credibility with potential customers and partners.\n\n• Access to Larger Markets: Eligible to work with major companies.\n\n• Optimized Cash Flow: Efficient tax management can enhance your cash flow.\n\n• Improved Credit Profile: A positive GST compliance record boosts your business\'s credit rating.\n\n• Simplified Compliance: Easy online filing and payment processes.\n\n• Transparent Operations: Maintain accurate records, reflecting professionalism.'
    },
    {
      id: 'gst-certificate',
      title: 'GST Certificate',
      content: 'A GST Certificate is an official document provided to GST-registered businesses, confirming their compliance. It allows businesses to collect GST from customers and claim input tax credits. The GST Certificate is also essential for:\n\n• Loan Applications: Often required for validating business credentials.\n\n• Government Tenders: A prerequisite for participating in official tenders.\n\n• Market Reputation: Enhances business trust and compliance profile.'
    },
    {
      id: 'gstin',
      title: 'GSTIN',
      content: 'A GSTIN (Goods and Services Tax Identification Number) is a unique 15-digit code provided to all GST-registered taxpayers. You will receive your GSTIN after completing the registration process through the OnEasy platform.'
    },
    {
      id: 'voluntary-registration',
      title: 'Voluntary GST Registration',
      content: 'Businesses with turnover below ₹20 lakhs can voluntarily register for GST, which offers advantages like input tax credits, inter-state trade, and eligibility for listing on e-commerce platforms. Voluntary registration paves the way for growth and profitability.'
    },
    {
      id: 'penalties',
      title: 'Penalties for Non-Compliance',
      content: 'If a business fails to register or pays insufficient tax, a penalty of 10% of the unpaid tax is levied. Intentional tax evasion results in a 100% penalty of the unpaid amount.'
    },
    {
      id: 'get-started',
      title: 'Get GST Registration Online with OnEasy',
      content: 'At OnEasy, we make the GST registration process smooth and efficient. Our experts will guide you through the entire process, from understanding your business needs to submitting your application online.\n\nOnce you provide your information and documents, the GST registration process is completed within 3 to 7 working days.'
    }
  ];

  const faqs = [
    {
      question: 'What is GST and why is it important for businesses?',
      answer: 'GST (Goods and Services Tax) is a comprehensive, multi-stage, destination-based tax that is levied on every value addition. It simplifies the indirect tax structure, replacing multiple taxes like VAT, Service Tax, Excise Duty, etc., and is essential for businesses to comply with legal requirements and avoid penalties.'
    },
    {
      question: 'Who is required to register for GST?',
      answer: 'Businesses with an annual turnover exceeding ₹40 lakhs (₹20 lakhs for service providers or businesses in special category states) must register for GST. Certain businesses, including inter-state suppliers, casual taxable persons, and e-commerce operators, are also required to register regardless of turnover.'
    },
    {
      question: 'Can businesses with a turnover below the threshold voluntarily register for GST?',
      answer: 'Yes, businesses with a turnover below the prescribed threshold can voluntarily register for GST. Voluntary registration allows businesses to claim input tax credit, expand their market, and maintain a compliant business structure.'
    },
    {
      question: 'What documents are required for GST registration?',
      answer: 'The documents needed include the PAN card, Aadhaar card, business address proof, bank account details, and digital signature. For specific business structures like companies or partnerships, additional documents like the incorporation certificate and partnership deed are required.'
    },
    {
      question: 'How long does the GST registration process take?',
      answer: 'The GST registration process typically takes between 3 to 7 working days after submitting the required documents, provided all the information is accurate and complete.'
    },
    {
      question: 'What is a GSTIN and how is it obtained?',
      answer: 'GSTIN (Goods and Services Tax Identification Number) is a unique 15-digit code assigned to businesses that register for GST. It is obtained after the successful submission and approval of the GST registration application.'
    },
    {
      question: 'What is the penalty for not registering under GST?',
      answer: 'If a business is required to register under GST but fails to do so, a penalty of 10% of the unpaid tax amount is levied. In cases of deliberate evasion, the penalty may increase to 100% of the unpaid tax.'
    },
    {
      question: 'Can I amend my GST registration details after registration?',
      answer: 'Yes, GST registration details such as business name, address, or contact information can be amended by submitting a modification request through the GST portal.'
    },
    {
      question: 'What is the Composition Scheme under GST?',
      answer: 'The Composition Scheme is a simplified GST scheme for small taxpayers with a turnover of less than ₹1.5 crore (₹75 lakhs for special category states). It allows them to pay GST at a fixed rate on turnover without availing input tax credit, reducing compliance.'
    },
    {
      question: 'What are the benefits of registering for GST?',
      answer: 'GST registration offers several benefits including the ability to claim input tax credits, ease of conducting inter-state business, enhanced market credibility, and simplified tax compliance.'
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
                console.log('Initiating payment for GST:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'gst');
                localStorage.setItem('selectedRegistrationTitle', 'GST Registration');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success && result.redirect) {
                  console.log('✅ Payment successful! Redirecting to form...');
                  navigate('/gst-form');
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
            onClick={() => navigate('/gst-dashboard')}
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

export default GSTDetails;


