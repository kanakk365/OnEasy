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

function DSCDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);

  // Packages as per user requirements - only 2 packages
  const packages = [
    {
      name: 'Starter',
      price: '1,999',
      priceValue: 1999,
      originalPrice: '3,500',
      originalPriceValue: 3500,
      period: 'One Time',
      description: 'Class 3 - Individual',
      icon: '★',
      features: [
        'Digital Signature Application',
        'Digital Signature Certificate'
      ],
      color: 'blue'
    },
    {
      name: 'Growth',
      price: '2,999',
      priceValue: 2999,
      originalPrice: '3,999',
      originalPriceValue: 3999,
      period: 'One Time',
      description: 'Class 3- Company',
      icon: '✢',
      features: [
        'Digital Signature Application',
        'Digital Signature Certificate'
      ],
      isHighlighted: true,
      color: 'blue'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Application and Document Submission',
      description: 'Fill out the DSC application form and submit required documents including Aadhar Card, PAN Card, mobile number, and email ID for identity verification.'
    },
    {
      step: 2,
      title: 'Identity Verification',
      description: 'Your identity is verified by the certifying authority through the submitted documents and personal information.'
    },
    {
      step: 3,
      title: 'Certificate Issuance and USB Token Delivery',
      description: 'Once verified, you receive your Class 3 Digital Signature Certificate with a secure USB token (valid for 2 years), enabling secure digital transactions.'
    }
  ];

  const documents = [
    'Aadhar Card of the applicant',
    'PAN Card',
    'Mobile number',
    'E-Mail ID'
  ];

  const prerequisites = [
    {
      title: 'Class 3 DSC for Individuals',
      description: 'OnEasy assists individuals in obtaining a Class 3 Digital Signature with an e-Pass Token. Authorized users can attach the DSC to electronically submitted documents, ensuring the confidentiality and validity of the records.'
    },
    {
      title: 'Class 3 DSC for Companies/Organizations',
      description: 'The Class 3 DSC is also applicable to companies, NGOs, trusts, government departments, and other organizations. The DSC will be issued in the company\'s name, verifying the user\'s authority to sign on behalf of the organization and including personal and company details.'
    }
  ];

  const aboutSections = [
    {
      id: 'dsc-by-oneasy',
      title: 'Digital Signature Certificate (DSC) by OnEasy',
      content: 'In India, obtaining a DSC is a statutory requirement for submitting various forms to government agencies. It employs public-key encryption for creating signatures, which are embedded in electronic documents, emails, and other digitally transmitted materials. This process enhances security through advanced encryption technology.\n\nThe Controller of Certifying Authorities oversees the issuance of Digital Signature Certificates in India. The Office of the Controller of Certification Agencies (CCA) has authorized eight certification agencies to issue DSCs, including eMudhra, a prominent certifying authority.\n\nAt OnEasy, we assist you in acquiring an Class 3 Digital Signature Certificate with a validity of two years, accompanied by a secure USB token. Our fully online application process eliminates the need for manual document submission or courier services. Each Digital Signature comes with a FIPS-compliant ePass USB token, ensuring the protection of your signature throughout its validity period.'
    },
    {
      id: 'class-3-dsc',
      title: 'Class 3 Digital Signature Certificate',
      content: 'The Class 3 DSC is the most secure type of certificate, incorporating both signature and encryption capabilities. At OnEasy, we facilitate in obtaining a Class 3 DSC, complete with an encryption certificate and USB token. The signature certificate is used to sign documents, while the encryption certificate is vital for securing data. Class 3 DSCs are available for both individuals and organizations.\n\nThis certificate can be used for various purposes, including:\n\n• MCA e-filing\n• Income Tax e-filing\n• e-Tendering\n• LLP registration\n• GST application\n• Import-Export code registration\n• Form 16\n• Patent and trademark e-filing\n• Customs e-filing\n• e-Procurement\n• e-Bidding\n• e-Auction and more.'
    },
    {
      id: 'importance',
      title: 'Importance of Digital Signature Certificates',
      content: [
        {
          title: 'Legal Compliance',
          description: 'DSCs are vital for adhering to electronic signature laws and regulations, ensuring that digital documents and transactions meet legal standards.'
        },
        {
          title: 'Business Transactions',
          description: 'In the corporate world, DSCs are essential for signing contracts, agreements, financial transactions, and other critical documents, offering a secure and efficient business process.'
        },
        {
          title: 'Government Transactions',
          description: 'Numerous government departments require DSCs for online submissions, fostering trust in digital interactions with the government.'
        },
        {
          title: 'Financial Transactions',
          description: 'Financial institutions often mandate DSCs for secure online banking and transactions, safeguarding sensitive data against fraud.'
        },
        {
          title: 'International Trade',
          description: 'DSCs facilitate secure and compliant international trade by ensuring the secure exchange of trade-related documents.'
        }
      ]
    },
    {
      id: 'benefits',
      title: 'Benefits of DSC',
      content: [
        {
          title: 'Security',
          description: 'DSCs provide robust security by confirming the signer\'s identity and ensuring document integrity, protecting against unauthorized access.'
        },
        {
          title: 'Legally Binding',
          description: 'Digital signatures are recognized as legally valid in many countries, including India, making them suitable for various legal transactions.'
        },
        {
          title: 'Efficiency',
          description: 'DSCs streamline document processing by eliminating the need for physical signatures, leading to quicker transactions and reduced administrative burdens.'
        },
        {
          title: 'Cost Savings',
          description: 'By minimizing reliance on paper-based processes and courier services, DSCs lead to cost savings and better resource management.'
        },
        {
          title: 'Global Acceptance',
          description: 'DSCs are recognized internationally, ensuring secure cross-border transactions.'
        },
        {
          title: 'Data Integrity',
          description: 'Using encryption, DSCs secure data during transmission, critical for protecting sensitive information.'
        }
      ]
    },
    {
      id: 'renewal',
      title: 'Renewal of Class 3 DSC',
      content: 'Renewing a Digital Signature Certificate requires fresh identity verification as per CCA guidelines. You can renew your Class 3 DSC through the same process as applying for a new certificate on the OnEasy website.\n\nApplications for renewal can be submitted once the certificate has expired or even before it reaches its expiry date. Renewal pricing remains consistent with the cost of obtaining a new DSC.'
    },
    {
      id: 'why-oneasy',
      title: 'Secure Your Digital Signature with OnEasy',
      content: 'OnEasy is your reliable partner in acquiring a Class 3 Digital Signature Certificate. This comprehensive certificate includes a signature certificate, an encryption certificate, and a secure USB token. While the signature certificate is crucial for signing documents, the encryption certificate ensures data safety. We offer DSCs for both individuals and organizations.\n\nBy obtaining your Class 3 Digital Signature Certificate through OnEasy, you enhance the security and reliability of your online transactions, safeguarding the authenticity of your digital documents with robust encryption.\n\nReady to bolster your online security?\n\nContact OnEasy today to obtain your Digital Signature Certificate and start your journey toward secure digital transactions.'
    }
  ];

  const faqs = [
    {
      question: 'What is a Digital Signature Certificate (DSC)?',
      answer: 'A Digital Signature Certificate (DSC) is a secure electronic key issued by certifying authorities to verify the identity of the holder. It is used for digitally signing documents and ensuring the authenticity and integrity of electronic communications.'
    },
    {
      question: 'Why do I need a Digital Signature Certificate?',
      answer: 'A DSC is essential for legally signing electronic documents, submitting forms to government agencies, and conducting secure online transactions. It enhances security, compliance, and efficiency in business and legal processes.'
    },
    {
      question: 'Who issues Digital Signature Certificates in India?',
      answer: 'Digital Signature Certificates in India are issued by authorized certifying authorities under the supervision of the Controller of Certifying Authorities (CCA). Some prominent certifying authorities include eMudhra, Sify, and Ncode.'
    },
    {
      question: 'What are the different types of Digital Signature Certificates?',
      answer: 'There are three types of Digital Signature Certificates:\n\n• Class 1: Used for personal use; it verifies the user\'s email address.\n• Class 2: Used for business transactions; it verifies the user\'s identity against a government database.\n• Class 3: The most secure, used for high-stake transactions; it requires the user to present themselves in person to a registration authority.'
    },
    {
      question: 'How can I obtain a Digital Signature Certificate?',
      answer: 'You can obtain a DSC by applying through a certifying authority\'s website. The process typically involves filling out an application form, submitting identity verification documents, and making the required payment.'
    },
    {
      question: 'What is the validity period of a Digital Signature Certificate?',
      answer: 'The validity period of a Digital Signature Certificate is generally one to two years, depending on the issuing authority. It can be renewed before its expiry date by following the renewal process.'
    },
    {
      question: 'How do I renew my Digital Signature Certificate?',
      answer: 'To renew your DSC, you need to follow the same process as obtaining a new certificate, including identity verification. Renewal applications can be submitted online through the certifying authority\'s website.'
    },
    {
      question: 'Can I use my Digital Signature Certificate for multiple purposes?',
      answer: 'Yes, a Digital Signature Certificate can be used for various purposes, including e-filing income tax returns, signing contracts, participating in e-tendering, and submitting documents to government agencies.'
    },
    {
      question: 'Is a Digital Signature Certificate legally binding?',
      answer: 'Yes, Digital Signature Certificates hold the same legal validity as traditional handwritten signatures in many jurisdictions, including India. They are recognized under the Information Technology Act, 2000.'
    },
    {
      question: 'What should I do if I lose my Digital Signature Certificate or USB token?',
      answer: 'If you lose your Digital Signature Certificate or USB token, you should immediately inform the certifying authority. You may need to go through a re-issuance process, which could involve identity verification and application for a new DSC.'
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
                  console.log('Initiating payment for Digital Signature Certificate:', selectedPackage.name);
                  
                  // Store registration type
                  localStorage.setItem('selectedRegistrationType', 'dsc');
                  localStorage.setItem('selectedRegistrationTitle', 'Digital Signature Certificate');
                  
                  const result = await initPayment(selectedPackage);
                  
                  if (result.success && result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/dsc-form');
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
            introTitle="About Digital Signature Certificate"
            introDescription="A Digital Signature Certificate (DSC) is a secure cryptographic key issued by certifying authorities to validate and authenticate the identity of the certificate holder. DSCs are primarily used when businesses need to digitally sign documents online, ensuring the signature's integrity and validating the signed documents. At OnEasy, we assist you in acquiring an Class 3 Digital Signature Certificate with a validity of two years, accompanied by a secure USB token. Let OnEasy guide you through the process, empowering you to engage in secure online transactions with confidence."
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

export default DSCDetails;

