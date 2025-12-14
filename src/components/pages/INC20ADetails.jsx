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

function INC20ADetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('inc-20a');

  const processSteps = [
    {
      step: 1,
      title: 'Receive Share Subscription Money',
      description: 'Ensure the subscription amount for shares as stated in the Memorandum of Association (MOA) is received in the company\'s bank account.'
    },
    {
      step: 2,
      title: 'Obtain Proof of Subscription',
      description: 'Obtain proof of receipt of subscription money, such as a bank statement or certificate from the bank confirming the receipt of funds.'
    },
    {
      step: 3,
      title: 'Pass Board Resolution',
      description: 'Pass a board resolution authorizing the declaration of commencement of business and authorizing a director to sign the INC-20A form.'
    },
    {
      step: 4,
      title: 'Gather Required Documents',
      description: 'Collect all necessary documents including Certificate of Incorporation, PAN details, proof of registered office address, bank statement, and photographs of the premises.'
    },
    {
      step: 5,
      title: 'Professional Certification',
      description: 'Get the form certified by a practicing Chartered Accountant (CA), Company Secretary (CS), or Cost Accountant.'
    },
    {
      step: 6,
      title: 'Digital Signature',
      description: 'Ensure a valid Digital Signature Certificate (DSC) of one of the directors is available to digitally sign the form.'
    },
    {
      step: 7,
      title: 'File Form INC-20A',
      description: 'File Form INC-20A with the Registrar of Companies (ROC) through the MCA portal within 180 days from the date of incorporation.'
    },
    {
      step: 8,
      title: 'Compliance Confirmation',
      description: 'Upon successful filing, the company can legally commence business operations and exercise borrowing powers.'
    }
  ];

  const documents = [
    'A bank statement',
    'Board Resolution',
    'Certificate of Incorporation',
    'Photograph of the premises'
  ];

  const prerequisites = [
    {
      title: 'Share Capital Requirement',
      description: 'The company should have share capital, as companies without share capital are exempt from filing INC-20A.'
    },
    {
      title: 'Subscription Amount Received',
      description: 'The subscription amount for shares as stated in the Memorandum of Association (MOA) must be received.'
    },
    {
      title: 'Proof of Receipt',
      description: 'Proof of the receipt of subscription money, such as a bank statement or a certificate from the bank, is required.'
    },
    {
      title: 'Functional Bank Account',
      description: 'A functional bank account in the company\'s name must be opened to receive the subscription money.'
    },
    {
      title: 'Board Resolution',
      description: 'A board resolution authorizing the declaration of commencement of business must be passed.'
    },
    {
      title: 'Certificate of Incorporation',
      description: 'Certificate of Incorporation issued by the Ministry of Corporate Affairs (MCA) is required.'
    },
    {
      title: 'PAN Details',
      description: 'PAN details of the company must be available.'
    },
    {
      title: 'Registered Office Address Proof',
      description: 'Proof of the registered office address should be provided.'
    },
    {
      title: 'Digital Signature Certificate (DSC)',
      description: 'A valid Digital Signature Certificate (DSC) of one of the directors is required to digitally sign the form.'
    },
    {
      title: 'Professional Certification',
      description: 'Professional certification by a practicing Chartered Accountant (CA), Company Secretary (CS), or Cost Accountant is mandatory.'
    },
    {
      title: 'Filing Deadline',
      description: 'The form must be filed within 180 days from the date of incorporation to avoid penalties.'
    }
  ];

  const aboutSections = [
    {
      id: 'inc-20a-intro',
      title: 'About INC 20A',
      content: 'INC-20A is a mandatory form under the Companies Act, 2013, required for companies incorporated after November 2, 2018. It confirms that the company has received its share subscription money and is ready to start business activities. This form must be filed with the Registrar of Companies within 180 days of incorporation, along with proof of subscription money, a board resolution, and other necessary documents.\n\nFiling ensures legal compliance and operational authorization. Failure to file can result in penalties, operational restrictions, and removal from the Register of Companies. OnEasy provides expert assistance for timely and hassle-free INC-20A filing, ensuring your business stays compliant.'
    },
    {
      id: 'what-is-inc-20a',
      title: 'What is INC-20A',
      content: 'INC-20A is a statutory form prescribed under Section 10A of the Companies Act, 2013, which must be filed by companies incorporated in India after the Companies (Amendment) Ordinance, 2018. This form is a declaration by the directors of a company, confirming that:\n\n• The company has received the subscription amount for its shares as stated in the Memorandum of Association (MOA).\n\n• The company is ready to commence its business operations.\n\nFiling INC-20A is a prerequisite for companies with share capital to legally begin business activities or exercise borrowing powers.'
    },
    {
      id: 'why-important',
      title: 'Why is INC-20A Important',
      content: 'Filing INC-20A is crucial for the following reasons:\n\n• Legal Obligation: It is mandatory under the Companies Act, 2013, for newly incorporated companies.\n\n• Business Authorization: Without filing INC-20A, companies are not legally permitted to commence their operations or borrow money.\n\n• Corporate Transparency: It provides proof to the government and stakeholders that the company is active and operationally ready.\n\n• Avoiding Penalties: Non-filing leads to significant penalties and could risk the company being declared defunct.'
    },
    {
      id: 'compliance-requirements',
      title: 'Key Compliance Requirements for Filing INC-20A',
      content: 'The filing process requires adherence to several compliance requirements:\n\n• Eligibility: Applicable to all companies incorporated after November 2, 2018, under the Companies Act, 2013, except companies not having share capital.\n\n• Deadline: The form must be filed within 180 days from the date of incorporation of the company.\n\n• Authorized Signatory: The form must be digitally signed by a director of the company, using a valid Digital Signature Certificate (DSC).\n\n• Professional Certification: The form must be certified by a practicing Chartered Accountant (CA), Company Secretary (CS), or Cost Accountant.'
    },
    {
      id: 'advantages',
      title: 'Advantages of Filing INC-20A',
      content: 'Filing INC-20A offers multiple benefits, including:\n\n• Legal Compliance: Ensures that the company adheres to statutory obligations under the Companies Act, 2013.\n\n• Business Operations: Filing INC-20A allows the company to commence operations legally and execute business plans.\n\n• Ease of Borrowing: The company can legally borrow funds and establish its financial framework.\n\n• Enhanced Credibility: Demonstrates a commitment to compliance and builds trust among stakeholders, investors, and government authorities.'
    },
    {
      id: 'disadvantages',
      title: 'Disadvantages of Not Filing INC-20A',
      content: 'Failure to file INC-20A can result in the following issues:\n\nPenalties:\n\n• A fine of ₹50,000 is levied on the company.\n\n• Each director is subject to an additional penalty of ₹1,000 per day of delay, up to a maximum of ₹1,00,000.\n\nOperational Restrictions:\n\n• The company cannot commence business activities.\n\n• It cannot borrow funds or raise capital.\n\nLegal Risks:\n\n• The company may face legal action for non-compliance.\n\n• Directors may also be held personally liable.\n\nStrike-Off Risk:\n\n• The Registrar of Companies has the authority to strike off the company\'s name from its records, rendering it defunct.'
    },
    {
      id: 'consequences',
      title: 'Consequences of Not Filing INC-20A',
      content: 'The repercussions of non-filing are severe and include:\n\n• Non-Compliance Status: The company is marked as non-compliant with statutory requirements, impacting its reputation.\n\n• Prohibition on Operations: The company cannot officially commence its business activities, affecting growth and revenue generation.\n\n• Borrowing Prohibited: The company is barred from accessing loans or other financial facilities, hindering its financial stability.\n\n• Strike-Off from ROC: The company\'s name may be removed from the Register of Companies, leading to dissolution.\n\n• Legal Actions: Directors may face prosecution and financial penalties, resulting in personal liability.'
    },
    {
      id: 'on-easy-help',
      title: 'How OnEasy Can Help You with INC-20A Filing',
      content: 'OnEasy is your trusted partner in ensuring a seamless and hassle-free INC-20A filing process. Here\'s how we assist:\n\n• Expert Consultation: Our team of legal and compliance experts provides personalized guidance, ensuring you understand every aspect of the filing process.\n\n• Document Preparation: We help you gather, verify, and prepare all necessary documents, including bank statements, board resolutions, and declarations.\n\n• Digital Signature Assistance: If you do not have a valid Digital Signature Certificate (DSC), we assist in obtaining one efficiently.\n\n• Accurate Filing: Our professionals ensure error-free filing of INC-20A with the Registrar of Companies, adhering to all statutory requirements.\n\n• Timely Submission: We ensure your form is filed within the 180-day deadline, avoiding penalties and ensuring compliance.\n\n• End-to-End Support: From initial consultation to successful submission, we provide dedicated assistance every step of the way.\n\n• Compliance Assurance: Our services guarantee your company remains compliant with the law, enhancing its credibility and operational readiness.\n\nWith OnEasy, you can focus on building your business while we handle all your compliance needs with professionalism and precision.'
    }
  ];

  const faqs = [
    {
      question: 'What is INC-20A?',
      answer: 'INC-20A is a declaration form filed with the Registrar of Companies (ROC) to confirm that a newly incorporated company has received its subscription money and is ready to commence business operations.'
    },
    {
      question: 'Who needs to file INC-20A?',
      answer: 'All companies incorporated in India after November 2, 2018, under the Companies Act, 2013, that have share capital are required to file INC-20A. Companies without share capital are exempt.'
    },
    {
      question: 'What is the deadline to file INC-20A?',
      answer: 'The form must be filed within 180 days from the date of incorporation of the company.'
    },
    {
      question: 'What documents are required for filing INC-20A?',
      answer: 'Required documents include: Proof of subscription money received (bank statement or certificate), Board resolution authorizing the declaration, Certificate of Incorporation and PAN details, and Internal and external photograph of the Premises.'
    },
    {
      question: 'What happens if INC-20A is not filed on time?',
      answer: 'Non-filing can result in penalties: ₹50,000 for the company and ₹1,000 per day for directors (up to ₹1,00,000). Additionally, the company cannot commence business or borrow funds, and its name may be struck off the Register of Companies.'
    },
    {
      question: 'Can a company start business operations before filing INC-20A?',
      answer: 'No, a company is not legally permitted to commence business activities or borrow funds until INC-20A is filed.'
    },
    {
      question: 'Does INC-20A require professional certification?',
      answer: 'Yes, INC-20A must be certified by a practicing Chartered Accountant (CA), Company Secretary (CS), or Cost Accountant.'
    },
    {
      question: 'Are companies without share capital required to file INC-20A?',
      answer: 'No, companies that do not have share capital are exempt from filing INC-20A.'
    },
    {
      question: 'What are the consequences of not receiving share subscription money?',
      answer: 'If the subscription money is not received, the company cannot file INC-20A, resulting in penalties and restrictions on operations and borrowing.'
    },
    {
      question: 'How can OnEasy help with INC-20A filing?',
      answer: 'OnEasy provides expert guidance, assists in document preparation, ensures timely and accurate filing, and handles the entire process to keep your company compliant.'
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
                console.log('Initiating payment for INC 20A - MCA:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'inc-20a');
                localStorage.setItem('selectedRegistrationTitle', 'INC 20A - MCA');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/inc-20a-form');
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
            introTitle="About INC 20A"
            introDescription="INC-20A is a mandatory form under the Companies Act, 2013, required for companies incorporated after November 2, 2018. It confirms that the company has received its share subscription money and is ready to start business activities."
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

export default INC20ADetails;

