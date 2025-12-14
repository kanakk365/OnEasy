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

function DINApplicationDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('din-application');

  const processSteps = [
    {
      step: 1,
      title: 'Obtain Digital Signature Certificate (DSC)',
      description: 'First, obtain a valid Digital Signature Certificate (DSC) from a licensed Certifying Authority, as it is required for online application submission.'
    },
    {
      step: 2,
      title: 'Prepare Required Documents',
      description: 'Gather all necessary documents including PAN Card, Address Proof, recent passport-sized photograph, and ensure all documents are self-attested and in the prescribed format.'
    },
    {
      step: 3,
      title: 'Fill Form DIR-3',
      description: 'Complete Form DIR-3 on the MCA portal with accurate personal information, ensuring all details match your official documents (PAN card, address proof, etc.).'
    },
    {
      step: 4,
      title: 'Upload Documents',
      description: 'Upload self-attested copies of all required documents including proof of identity, proof of address, photograph, and any other documents as specified.'
    },
    {
      step: 5,
      title: 'Digital Signature',
      description: 'Apply your Digital Signature Certificate (DSC) to the completed form for authentication and submission.'
    },
    {
      step: 6,
      title: 'Payment of Fees',
      description: 'Pay the nominal application fee online through the MCA portal using the available payment methods.'
    },
    {
      step: 7,
      title: 'Submit Application',
      description: 'Submit the completed application form along with all documents and payment confirmation to the MCA portal.'
    },
    {
      step: 8,
      title: 'Verification and Approval',
      description: 'The MCA will verify your application and documents. Upon successful verification, your DIN will be issued, typically within 1-2 business days.'
    }
  ];

  const documents = [
    'Digital Signature Certificate (DSC)',
    'PAN Card',
    'Address Proof',
    'Photograph',
    'The mobile number of the Director',
    'Email address of Director'
  ];

  const prerequisites = [
    {
      title: 'Individual Applicant',
      description: 'The applicant must be an individual, as DIN is issued only to individuals, not entities.'
    },
    {
      title: 'Valid PAN Card',
      description: 'A valid PAN card is mandatory for Indian citizens.'
    },
    {
      title: 'Aadhaar Card',
      description: 'Aadhaar card for Proof of identity.'
    },
    {
      title: 'Digital Signature Certificate (DSC)',
      description: 'The applicant must have a valid and active Digital Signature Certificate (DSC).'
    },
    {
      title: 'Passport-sized Photograph',
      description: 'A recent passport-sized photograph of the applicant is required.'
    },
    {
      title: 'Contact Information',
      description: 'A valid email ID and mobile number for communication and verification purposes.'
    },
    {
      title: 'Self-attested Documents',
      description: 'The applicant must have self-attested copies of proof of identity and proof of address.'
    },
    {
      title: 'Accurate Information',
      description: 'The applicant should ensure that all information provided is accurate and matches the details on official documents.'
    },
    {
      title: 'Board Resolution (if applicable)',
      description: 'In case of a nomination by an existing company, a board resolution is required.'
    },
    {
      title: 'Prescribed Format',
      description: 'All documents must be in the prescribed format and ready for upload during the application process.'
    }
  ];

  const aboutSections = [
    {
      id: 'din-application-intro',
      title: 'About DIN Application',
      content: 'A Director Identification Number (DIN) is a unique identification number assigned to individuals who wish to become directors of Indian companies. This 8-digit numeric code, issued by the Ministry of Corporate Affairs (MCA), is a mandatory requirement for anyone serving as a director or designated partner in a company or LLP. The DIN helps streamline corporate governance, enhances transparency, and ensures that directors are legally accountable for their actions.\n\nAt OnEasy, we simplify the DIN application process. Our expert team ensures that all necessary documents are accurately prepared and submitted, making the application process smooth, fast, and hassle-free. Whether you\'re a first-time director or updating your details, we provide end-to-end support to help you stay compliant and efficiently manage your directorial role.'
    },
    {
      id: 'what-is-din',
      title: 'Understanding Director Identification Number (DIN)',
      content: 'The Director Identification Number (DIN) is a unique identifier issued by the Ministry of Corporate Affairs (MCA) to individuals appointed as directors of companies in India. It serves as an essential mechanism for tracking and monitoring the professional history of directors, ensuring transparency and accountability within the corporate sector. As per the provisions of the Companies Act, 2013, obtaining a DIN is a mandatory requirement for anyone wishing to serve as a director in a company incorporated in India.\n\nA DIN is an 8-digit numeric code assigned to an individual, which remains valid for life, unless revoked or cancelled for reasons of non-compliance or other legal issues. It links the director\'s personal details to their corporate activities, offering a transparent and reliable means of verifying directorial information.'
    },
    {
      id: 'why-necessary',
      title: 'Why is it Necessary to Apply for a DIN',
      content: 'There are several key reasons why obtaining a Director Identification Number (DIN) is essential:\n\n1. Legal Requirement: Under the Companies Act, 2013, every individual who seeks to be appointed as a director in an Indian company must apply for a DIN. The DIN is a mandatory legal prerequisite for appointment as a director in any company incorporated under the Companies Act.\n\n2. Enhancing Transparency: The DIN system allows the Ministry of Corporate Affairs (MCA) to maintain a comprehensive record of directors across companies. This ensures a transparent, accountable, and traceable process for tracking individuals in directorial positions, preventing the appointment of individuals in multiple companies without proper oversight.\n\n3. Strengthening Corporate Governance: The DIN system plays a crucial role in ensuring that directors are held accountable for their actions. By associating a director\'s personal information with their corporate role, it enhances governance by making it easier for stakeholders and regulatory bodies to verify a director\'s history, particularly in the event of disputes or legal proceedings.\n\n4. Mitigating Fraud Risks: The DIN process helps prevent fraudulent activities such as the use of fictitious identities. It ensures that only verified individuals can assume directorial positions, thus reducing the risk of misrepresentation or unauthorized actions within companies.\n\n5. Simplifying Regulatory Processes: The DIN streamlines various regulatory and corporate processes. Once obtained, it serves as a unique identifier for the director in all company-related formalities, including documentation and filings, making the process more efficient and transparent.\n\n6. Facilitating Efficient Corporate Operations: A DIN ensures smooth corporate operations by providing a system for easily managing directorial appointments, changes, and removals. Companies can update directorial records with the MCA in real time, ensuring that their corporate governance records remain accurate and up to date.'
    },
    {
      id: 'who-needs',
      title: 'Who Needs to Apply for a DIN?',
      content: 'The following individuals are required to apply for a Director Identification Number (DIN):\n\n1. Prospective Directors: Any individual intending to be appointed as a director in an Indian company - whether public, private, or non-profit - must obtain a DIN before the appointment process begins.\n\n2. Current Directors Without a DIN: Any individual who is already serving as a director in an Indian company but has not previously applied for a DIN must apply for it. This applies to directors of both private and public companies, as well as limited liability partnerships (LLPs).\n\n3. Designated Partners of LLPs: In the case of Limited Liability Partnerships (LLPs), the designated partners - who assume responsibilities similar to that of directors in companies - must also obtain a DIN.\n\n4. Foreign Directors of Indian Subsidiaries: Directors appointed by foreign companies for their Indian subsidiaries or branches must also secure a DIN.\n\n5. Additional or Substituted Directors: When new directors are appointed to fill vacancies or when additional directors are appointed, they must apply for a DIN if they do not already possess one.\n\n6. Nominee Directors: Nominee directors, often appointed by financial institutions or investors, must also obtain a DIN in order to legally hold their position.'
    },
    {
      id: 'advantages',
      title: 'Advantages of Obtaining a DIN',
      content: '1. Improved Corporate Transparency: The DIN ensures greater transparency by linking directors to their respective companies, making it easier for stakeholders to verify a director\'s involvement across businesses. This promotes higher standards of corporate governance and accountability.\n\n2. Prevention of Identity Duplication: The DIN system eliminates the possibility of identity duplication, ensuring that each director is assigned a unique identifier. This enhances the reliability of corporate records and reduces the risk of fraudulent activities.\n\n3. Enhanced Monitoring by Regulatory Authorities: Regulatory bodies such as the Ministry of Corporate Affairs (MCA) can efficiently track directorial changes, ensuring that companies adhere to the regulatory framework. This supports the enforcement of corporate laws and accountability within the business ecosystem.\n\n4. Efficient Record Maintenance: By consolidating all director-related information in a centralized system, the DIN helps maintain accurate and up-to-date records. This simplifies compliance and reporting requirements for both companies and regulatory bodies.\n\n5. Lifetime Validity: A DIN remains valid for the lifetime of the individual unless it is revoked or cancelled. This long-term validity simplifies administrative processes and ensures continuity for directors serving in multiple capacities.'
    },
    {
      id: 'disadvantages',
      title: 'Disadvantages of Obtaining a DIN',
      content: '1. Lengthy Application Process: While the DIN application process is relatively straightforward, it can still be time-consuming, particularly for individuals who are unfamiliar with the procedure. Discrepancies or incomplete documentation may result in delays.\n\n2. Compliance Costs: While applying for a DIN is not prohibitively expensive, there may be additional costs for professional assistance in preparing documentation or applying on behalf of multiple directors.\n\n3. Risk of Misuse: If not properly managed, the DIN system could be misused. For example, individuals or companies may attempt to submit incorrect or falsified information during the application process, leading to potential legal consequences.\n\n4. Consequences of Non-Compliance: Failure to comply with the regulatory requirements or failure to update necessary details may lead to the cancellation of the DIN. Non-compliance can also result in penalties or legal action for both the individual and the company.\n\n5. Challenges for New Directors: New directors being unfamiliar with corporate governance processes may find it challenging to navigate the DIN application system and meet all compliance requirements. Professional guidance can help mitigate these challenges.'
    },
    {
      id: 'prevent-deactivation',
      title: 'How to Prevent DIN Deactivation',
      content: 'To ensure that your Director Identification Number (DIN) remains active and valid, it is crucial to adhere to the following best practices:\n\n1. Timely Filing of Compliance Documents: Ensure that your company submits all necessary filings, such as annual returns, financial statements, and other required documents, within the prescribed deadlines. Non-compliance with filing requirements may lead to penalties or the deactivation of your DIN.\n\n2. Regularly Update Personal Information: Keep your personal details, such as contact information or address, up to date with the Ministry of Corporate Affairs (MCA). Failure to update this information can result in your DIN being flagged or deactivated.\n\n3. Avoid Over-Appointment as Director: Be mindful of the maximum number of directorships allowed under the law. Holding directorial positions in more companies than is legally permitted could result in disqualification and cancellation of your DIN.\n\n4. Adhere to the Provisions of the Companies Act: Ensure compliance with all provisions outlined in the Companies Act, 2013. Any violation of the Act or failure to meet regulatory requirements could result in the revocation of your DIN.\n\n5. Promptly Respond to MCA Communications: Always respond to any communications or notices from the Ministry of Corporate Affairs (MCA) in a timely manner. Ignoring official correspondence could result in the suspension or cancellation of your DIN.'
    },
    {
      id: 'on-easy-assistance',
      title: 'How OnEasy Can Assist You with DIN Applications',
      content: 'OnEasy is committed to providing seamless support for individuals and businesses seeking to apply for or update their Director Identification Number (DIN). Our professional services include:\n\n1. Expert Assistance with Application Filing: We offer step-by-step guidance throughout the DIN application process, ensuring that all necessary documentation is accurately completed and submitted to the Ministry of Corporate Affairs (MCA) without delays.\n\n2. Efficient Processing of Applications: At OnEasy, we prioritize efficiency, ensuring that your DIN application is processed in a timely manner, minimizing the potential for delays or errors.\n\n3. Ongoing Compliance Support: We assist with maintaining compliance by ensuring that all relevant filings are made on time and by providing regular updates to keep your DIN and corporate records current.\n\n4. Tailored Solutions: Whether you are a first-time director or managing multiple directorships, we offer personalized services that cater to your specific needs, ensuring a smooth and straightforward application process.\n\n5. Comprehensive End-to-End Support: From the initial application to ongoing DIN management, OnEasy offers end-to-end support, allowing you to focus on your core business operations while we handle the regulatory details.\n\nLet OnEasy help you navigate the DIN application process with ease and confidence.'
    }
  ];

  const faqs = [
    {
      question: 'What is a DIN (Director Identification Number)?',
      answer: 'A DIN is a unique identification number assigned by the Ministry of Corporate Affairs (MCA) to individuals intending to serve as directors of a company in India. It helps in tracking the identity and activities of the director in the corporate world.'
    },
    {
      question: 'Who can apply for a DIN?',
      answer: 'Any individual who wishes to become a director of a company or an existing director can apply for a DIN. The applicant must be an Indian citizen or a foreign national.'
    },
    {
      question: 'What documents are required to apply for a DIN?',
      answer: 'The following documents are typically required: A valid proof of identity (such as Aadhar Card, Passport, Voter ID, or Driver\'s License), a proof of address (such as a utility bill, bank statement, or passport), a recent passport-sized photograph, and Digital Signature Certificate (DSC) of the applicant (for online application).'
    },
    {
      question: 'How can I apply for a DIN?',
      answer: 'You can apply for a DIN through the MCA portal. The process involves filling out the Form DIR-3 along with the required documents. If you do not already have a DSC, it needs to be obtained before applying.'
    },
    {
      question: 'Is there any fee for applying for a DIN?',
      answer: 'Yes, there is a nominal fee for applying for a DIN, which can be paid online through the MCA portal during the application process.'
    },
    {
      question: 'Can an individual apply for more than one DIN?',
      answer: 'No, a person is allowed to have only one DIN. If someone applies for more than one, the additional DINs will be invalidated.'
    },
    {
      question: 'How long does it take to get a DIN?',
      answer: 'The DIN application process usually takes around 1-2 business days if all documents are submitted correctly. In case of discrepancies or additional verifications, it might take longer.'
    },
    {
      question: 'What should I do if my DIN application is rejected?',
      answer: 'If your DIN application is rejected, you should review the reasons for rejection provided by the MCA, make the necessary corrections, and re-submit the application. You may need to provide additional documents or clarify discrepancies.'
    },
    {
      question: 'Can a foreign national apply for a DIN?',
      answer: 'Yes, a foreign national can apply for a DIN, provided they have the required documents, including a passport and proof of address. The process is similar to that of Indian nationals.'
    },
    {
      question: 'What should I do if I forget my DIN?',
      answer: 'If you forget your DIN, you can retrieve it by visiting the MCA portal and using the DIN search option. You will need to enter your name and date of birth to find your DIN.'
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
                console.log('Initiating payment for DIN Application - MCA:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'din-application');
                localStorage.setItem('selectedRegistrationTitle', 'DIN Application - MCA');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/din-application-form');
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
            introTitle="About DIN Application"
            introDescription="A Director Identification Number (DIN) is a unique identification number assigned to individuals who wish to become directors of Indian companies. This 8-digit numeric code, issued by the Ministry of Corporate Affairs (MCA), is a mandatory requirement for anyone serving as a director or designated partner in a company or LLP."
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

export default DINApplicationDetails;

