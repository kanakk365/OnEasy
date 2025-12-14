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

function GSTNoticeDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('gst-notice');

  const processSteps = [
    {
      step: 1,
      title: 'Review Notice',
      description: 'Carefully review the GST notice to understand the issue, requirements, and response timeframe.'
    },
    {
      step: 2,
      title: 'Prepare Response',
      description: 'Gather all relevant documents and prepare a comprehensive reply addressing all points raised in the notice.'
    },
    {
      step: 3,
      title: 'Submit Response',
      description: 'Submit your response online through the GST portal with digital/e-signature and supporting documentation.'
    }
  ];

  const documents = [
    'Valid PAN card',
    'Business registration and address proof',
    'Bank details linked to GST',
    'Previous tax returns'
  ];

  const prerequisites = [
    {
      title: 'Registration',
      description: 'Must be registered under GST with a valid GSTIN. Regularly file GST returns.'
    },
    {
      title: 'Compliance',
      description: 'Maintain proper accounts and invoices. Digital signature certificate (if applicable).'
    },
    {
      title: 'Notice Types',
      description: 'Show Cause Notice: Non-filing, mismatches, discrepancies, or non-payment. Assessment Notice: Failure to file, incorrect filings, suspicion of evasion. Audit Notice: High turnover, significant credit claims, major discrepancies.'
    },
    {
      title: 'Timeline',
      description: 'Respond within 15-30 days (extensions possible). Keep records for 6 years.'
    },
    {
      title: 'Considerations',
      description: 'Respond even if non-operational. Use registered communication. Keep submission acknowledgments.'
    },
    {
      title: 'Common Triggers',
      description: 'Delayed filings. Mismatches in GSTRs. Input tax credit issues. Non-payment or incorrect claims.'
    }
  ];

  const aboutSections = [
    {
      id: 'gst-notice-intro',
      title: 'About GST Notice',
      content: 'GST Notices are official communications sent by GST Authorities to taxpayers, serving as reminders or warnings about compliance issues or as requests for additional information. Responding promptly to these notices within the specified timeframe is crucial, as failure to do so may lead to legal actions, including penalties or prosecution for wilful default. Therefore, taxpayers must address GST notices with care to ensure timely compliance.\n\nAt OnEasy, our team of experts is dedicated to helping you handle the complexities of GST notices. Whether you\'ve received a notice or anticipate one, we are here to assist in preparing and submitting a well-structured response.'
    },
    {
      id: 'what-is-gst-notice',
      title: 'What is a GST Notice?',
      content: 'A GST notice is an official message from GST Authorities to taxpayers, covering various topics, from compliance defaults to requests for additional information. These notices play a vital role in maintaining tax compliance and ensuring smooth GST processes.\n\nDifferent types of GST notices may be issued depending on the nature of the detected issue or actions required from the taxpayer. Common reasons for receiving GST notices include failure to register, late or non-filing of returns, discrepancies in tax payments and incorrect claims for Input Tax Credit (ITC). Upon receiving a notice, it is essential for taxpayers to respond within the specified timeframe.'
    },
    {
      id: 'types-of-notices',
      title: 'Types of GST Notices',
      content: 'Under GST, taxpayers may encounter different types of notices, including:\n\n• Show Cause Notice (SCN): Issued when authorities suspect a GST law violation. The taxpayer must provide an explanation within a specific period.\n\n• Demand Notice: Sent when there is a confirmed tax liability due from the taxpayer, specifying the amount along with any interest or penalties.\n\n• Scrutiny Notice: Issued when authorities examine returns and documents for compliance, requiring detailed records and information.\n\n• Assessment Notice: Sent after assessing a taxpayer\'s GST liability based on submitted returns and other records.\n\n• Recovery Notice: Issued when a taxpayer fails to pay outstanding tax as per a demand notice, often followed by asset or account attachment.\n\n• Notice for Personal Hearing: May be issued for a personal appearance to resolve discrepancies or present additional information.'
    },
    {
      id: 'common-reasons',
      title: 'Common Reasons for Receiving GST Notices',
      content: 'Here are the most common reasons GST authorities issue notices:\n\n• Discrepancies in details reported in GSTR-1 and GSTR-3B.\n\n• Mismatches in ITC claims between GSTR-3B and GSTR-2B/2A.\n\n• Consecutive non-filing of GSTR-1 and GSTR-3B for more than six months.\n\n• Differences in GSTR-1 and e-way bill details.\n\n• Non-compliance with rate cut requirements, leading to profiteering concerns.\n\n• Delayed or missed GST payments, even if unintentional.\n\n• Incorrect or inappropriate GST refund claims.\n\n• Improper ITC claims or misuse.\n\n• Operating without mandatory GST registration.\n\n• Discrepancies in exports reporting or missing records for tax authorities.\n\n• Non-compliance during audits or failure to submit information on time.'
    },
    {
      id: 'notice-overview',
      title: 'Overview of GST Notices and Required Actions',
      content: 'Timely attention and appropriate responses are crucial for all GST notices. Missing deadlines or providing incorrect information can lead to serious consequences, including penalties and legal proceedings. Consulting with a qualified tax professional is recommended for proper compliance.\n\nCommon notice types include:\n\n• GSTR-3A: Default notice for missed GST returns - 15 days to respond\n\n• CMP-05: Show cause notice for composition scheme eligibility - 15 days to respond\n\n• REG-03: Clarification needed for GST registration - 7 working days to respond\n\n• REG-17: Show cause notice for potential GST registration cancellation - 7 working days to respond\n\n• DRC-01: Tax demand notice - 60 days to respond\n\n• ADT-01: Tax authority audit notice requiring personal appearance\n\n• RFD-08: Potential GST refund rejection - 15 days to respond\n\nAnd many more. Each notice has specific response requirements and consequences for non-compliance.'
    },
    {
      id: 'consequences',
      title: 'Consequences of Not Responding to GST Notices',
      content: 'Ignoring a GST notice can lead to penalties, legal actions, or prosecution based on GST rules, depending on the case\'s specifics. Consequences may include:\n\n• Tax assessment and penalties (Rs. 10,000 or 10% of tax due, whichever is higher)\n\n• Cancellation of GST registration\n\n• Asset attachment and recovery proceedings\n\n• Prosecution for wilful default\n\n• Unfavorable assessment based on available information\n\n• Higher penalties and interest charges\n\nIt is crucial to respond to all GST notices promptly and accurately to avoid these serious consequences.'
    },
    {
      id: 'steps-to-respond',
      title: 'Steps to Respond to GST Notices',
      content: 'To respond effectively to GST notices, follow these steps:\n\n• Review the Notice: Understand the issue and requirements in the notice.\n\n• Gather Documentation: Collect relevant documents to address the notice.\n\n• Access GST Portal: Log in to the GST portal to prepare your response.\n\n• Use Digital/E-Signature: Verify your submission with a digital or e-signature.\n\n• Clear Dues: Settle any tax or interest payments related to the notice.\n\n• Submit Response: File your reply on the GST portal with supporting documentation.\n\n• Maintain Records: Keep all related records for reference.\n\nFor a comprehensive reply, the experts at OnEasy are here to help you navigate each step, ensuring your response is accurate and compliant.'
    },
    {
      id: 'why-oneasy',
      title: 'Choose OnEasy for Trusted GST Support',
      content: 'OnEasy is your reliable partner in ensuring seamless GST compliance. Our dedicated GST experts simplify the entire process, from registration to GSTR filing, to minimize your risk of receiving a GST notice. If you do receive one, our team will prepare and submit a precise and timely response, ensuring your business remains compliant with minimal disruption. With OnEasy, you have a partner committed to safeguarding your business\'s compliance and success.\n\nNeed expert assistance with GST compliance? Contact us today for guidance and quick, reliable support!'
    }
  ];

  const faqs = [
    {
      question: 'What is a GST Notice, and why is it issued?',
      answer: 'A GST Notice is an official communication from GST authorities to a taxpayer, often issued to address defaults in compliance, discrepancies, or to request additional information.'
    },
    {
      question: 'What are the types of GST Notices a taxpayer can receive?',
      answer: 'Common types include Show Cause Notices, Demand Notices, Scrutiny Notices, Assessment Notices, Recovery Notices and Notices for Personal Hearing. Each serves a specific purpose based on compliance issues or actions required from the taxpayer.'
    },
    {
      question: 'What should I do upon receiving a GST Notice?',
      answer: 'Review the notice carefully, understand the issue highlighted, gather relevant documents, and respond within the specified timeframe. Delayed or inaccurate responses can lead to penalties or further legal action.'
    },
    {
      question: 'What happens if I don\'t respond to a GST Notice on time?',
      answer: 'Failure to respond can lead to consequences like penalties, legal actions, and assessment based on available information, which may result in an unfavourable outcome for the taxpayer.'
    },
    {
      question: 'Can I respond to a GST Notice online?',
      answer: 'Yes, responses can be submitted through the GST portal. Log in to the portal, prepare your reply, and upload any necessary documents. A digital or e-signature may be required.'
    },
    {
      question: 'What are the common reasons for receiving a GST Notice?',
      answer: 'Notices may be issued for reasons such as late or non-filing of GST returns, discrepancies in input tax credit claims, operating without GST registration when required, and underpayment or non-payment of GST.'
    },
    {
      question: 'Is it possible to get an extension for responding to a GST Notice?',
      answer: 'Extensions are not commonly granted and may depend on the specific circumstances and discretion of the GST authorities. It\'s crucial to respond promptly to avoid penalties.'
    },
    {
      question: 'What is the penalty for non-compliance with a GST Notice?',
      answer: 'Penalties vary based on the nature of non-compliance and can include fines, additional interest, and other legal consequences. For instance, non-filing of returns could result in penalties up to 10% of the tax due or ₹10,000, whichever is higher.'
    },
    {
      question: 'How can I avoid receiving GST Notices?',
      answer: 'To minimize the risk, ensure timely filing of returns, maintain accurate records, and comply with all GST regulations. Proper GST registration and consistent reporting can significantly reduce the chance of receiving notices.'
    },
    {
      question: 'How can OnEasy assist me with GST Notices?',
      answer: 'OnEasy offers expert guidance to help you understand, respond, and manage GST Notices effectively. Our team will support you in preparing a response and submitting all required documents, ensuring compliance and peace of mind.'
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
                console.log('Initiating payment for GST Notice:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'gst-notice');
                localStorage.setItem('selectedRegistrationTitle', 'GST Notice');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/gst-notice-form');
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
            introTitle="About GST Notice"
            introDescription="GST Notices are official communications sent by GST Authorities to taxpayers, serving as reminders or warnings about compliance issues or as requests for additional information. Responding promptly to these notices within the specified timeframe is crucial."
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

export default GSTNoticeDetails;

