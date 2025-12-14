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

function WindingUpCompanyDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('winding-up-company');

  const processSteps = [
    {
      step: 1,
      title: 'Board Resolution',
      description: 'Pass a board resolution recommending the winding up of the company and propose the matter to shareholders.'
    },
    {
      step: 2,
      title: 'Shareholder Approval',
      description: 'Obtain approval from shareholders through a special resolution in a general meeting, authorizing the voluntary winding up of the company.'
    },
    {
      step: 3,
      title: 'Declaration of Solvency',
      description: 'Directors assess the company\'s financial position and declare its ability to pay all debts using Form 107, if applicable.'
    },
    {
      step: 4,
      title: 'Appointment of Liquidator',
      description: 'Appoint a liquidator to oversee the winding-up process and fix their remuneration. The liquidator\'s consent must be obtained.'
    },
    {
      step: 5,
      title: 'Notification and Publication',
      description: 'Publish the resolution in the Official Gazette and newspapers within 10 days, and file a copy with the Registrar. Notify the Registrar about the liquidator\'s appointment.'
    },
    {
      step: 6,
      title: 'Liquidator\'s Public Announcement',
      description: 'The appointed liquidator announces his role in the Official Gazette and to the Registrar within 14 days of appointment using Form 110.'
    },
    {
      step: 7,
      title: 'Settlement of Debts',
      description: 'The liquidator liquidates assets, settles debts with creditors, and distributes any remaining surplus to shareholders based on their ownership stake.'
    },
    {
      step: 8,
      title: 'Final Report and Meeting',
      description: 'Upon completion, the liquidator compiles a final report and financial account, summoning a meeting of members to present these documents.'
    },
    {
      step: 9,
      title: 'Company Dissolution',
      description: 'Submit final documents to the Registrar using Form 112. The ROC reviews and dissolves the company, marking the end of its corporate existence.'
    }
  ];

  const documents = [
    'Board Resolution',
    'Shareholders\' Special Resolution',
    'Liquidator Appointment Letter',
    'Statement of Assets and Liabilities',
    'Notice to Creditors',
    'Form MGT-14'
  ];

  const prerequisites = [
    {
      title: 'Board Resolution',
      description: 'A resolution must be passed by the board of directors recommending the winding up of the company.'
    },
    {
      title: 'Shareholder Approval',
      description: 'Approval from shareholders is required, typically through a special resolution in a general meeting.'
    },
    {
      title: 'Payment of Debts',
      description: 'All outstanding debts and liabilities of the company must be settled or arrangements made for their settlement.'
    },
    {
      title: 'Appointment of Liquidator',
      description: 'A liquidator should be appointed to oversee the winding-up process.'
    },
    {
      title: 'Filing of Necessary Forms',
      description: 'Relevant forms, such as Form MGT-14 (for filing the resolution) and Form INC-28 (for the notice of winding up), must be submitted to the Ministry of Corporate Affairs (MCA).'
    },
    {
      title: 'Notice to Creditors',
      description: 'A notice of the proposed winding up must be sent to all creditors and stakeholders.'
    },
    {
      title: 'Compliance with Legal Requirements',
      description: 'Ensure compliance with the Companies Act and any other applicable regulations.'
    }
  ];

  const aboutSections = [
    {
      id: 'winding-up-intro',
      title: 'About Winding Up of a Company',
      content: 'Company winding up, also known as liquidation, is the formal process by which a company concludes its operations and is ultimately dissolved. This process involves systematically closing the company\'s affairs, including selling assets, settling debts with the proceeds, and distributing any remaining surplus to shareholders based on their ownership stake. Winding up can be initiated by a court order or through a voluntary resolution passed by the company. Once the winding-up process is completed, the company is officially dissolved and ceases to exist, marking the end of its corporate life through this legal procedure.'
    },
    {
      id: 'understanding-winding-up',
      title: 'Understanding Winding Up Under Indian Law',
      content: 'According to Section 2(94A) of the Companies Act, 2013, winding up refers to the formal closure of a company through the mechanisms outlined in the Companies Act or by undergoing liquidation as per the Insolvency and Bankruptcy Code, 2016. This process entails halting regular business activities, liquidating assets, and settling outstanding debts, ultimately leading to the dissolution of the company. During the winding-up phase and until dissolution, the company retains its legal entity status, enabling it to engage in legal actions within a Tribunal. The primary goal of winding up is to ensure an orderly closure and fair distribution of the company\'s assets.'
    },
    {
      id: 'modes-of-winding-up',
      title: 'Modes of Winding Up Under the Companies Act',
      content: 'The Companies Act recognizes three primary methods for winding up a company, as specified in Section 293:\n\n• Compulsory Winding Up - By the Court: This method is initiated through a court order, typically occurring when the company cannot pay its debts, violates legal requirements, or when winding up is deemed just and equitable. The court appoints an official liquidator to manage the process, which involves selling assets, paying creditors, and distributing any surplus to shareholders.\n\n• Voluntary Winding Up: This occurs when the members or creditors decide to wind up the company\'s affairs. It can be initiated by a resolution of the members (shareholders) if the company is solvent and capable of paying its debts or by the creditors if the company is insolvent. The liquidator is appointed to conduct the winding-up process without court intervention.\n\n• Winding Up Subject to Court Supervision: In this scenario, the winding-up process starts voluntarily but is subject to court oversight. The court may intervene to supervise the process, ensuring the interests of stakeholders are protected and the proceedings are conducted fairly.'
    },
    {
      id: 'voluntary-winding-up',
      title: 'Voluntary Winding Up of a Company',
      content: 'Voluntary winding up is initiated by the members of a company under circumstances that do not require court intervention. This process can commence under two primary conditions:\n\n• By Special Resolution: The members pass a special resolution indicating their decision to dissolve the company.\n\n• By Expiry or Event as Specified in the Articles of Association: The company is wound up voluntarily due to the expiration of its duration as outlined in its Articles of Association or upon the occurrence of a specified event that necessitates dissolution.'
    },
    {
      id: 'documents-voluntary',
      title: 'Documents Required for Voluntary Winding Up',
      content: 'The following documents are essential for the voluntary winding up of a company:\n\n• Special Resolution (Form-26): A document affirming the company\'s decision to wind up.\n\n• Declaration of Solvency (Form 107): A statement demonstrating the company\'s ability to pay its debts.\n\n• Directors\' Affidavit: A sworn declaration verifying financial documents, including the auditor\'s report and accounts up to the latest date before declaring solvency.\n\n• Liquidator\'s Consent: Agreement from the appointed liquidator to undertake the winding-up process.\n\n• Notice of Winding Up Resolution: A published notice in the Official Gazette regarding the company\'s decision to wind up.\n\n• Notice of Liquidator Appointment: A published notice in the Official Gazette about the liquidator\'s appointment.\n\n• Preliminary Liquidator\'s Report: An initial report from the liquidator outlining the winding-up plan.\n\n• Final Liquidator\'s Report and Accounts: The liquidator\'s comprehensive final report and financial statements presented at the last shareholders\' meeting.\n\n• Notice of Final Meeting: Announcement of the company\'s concluding gathering.\n\n• Meeting Return: Documentation of the final report, accounts, and meeting minutes submitted to the company registration office.'
    },
    {
      id: 'procedure-voluntary',
      title: 'Procedure for Voluntary Winding Up',
      content: 'To conduct a voluntary winding up under relevant company law, the following procedure should be followed:\n\n1. Declaration of Solvency: Directors assess the company\'s financial position and declare its ability to pay all debts using Form 107. The board convenes to propose winding up to the shareholders and schedules a General Meeting as per Section 362.\n\n2. Shareholders\' Approval: At the General Meeting, shareholders review the proposal and, upon agreement, pass a Special Resolution to wind up the company voluntarily. A liquidator is appointed, and his remuneration is fixed.\n\n3. Notification of Resolution: The resolution is published in the Official Gazette and newspapers within 10 days, with a copy filed with the Registrar as per Section 361.\n\n4. Liquidator\'s Appointment Notification: The company informs the Registrar about the liquidator\'s appointment and consent within 10 days.\n\n5. Liquidator\'s Public Announcement: The appointed liquidator announces his role in the Official Gazette and to the Registrar within 14 days of appointment using Form 110.\n\n6. Creditors\' Meeting: If the liquidator determines that the company cannot fully settle its debts, a creditors\' meeting is convened to present a financial statement.\n\n7. Documentation of Creditors\' Meeting: The liquidator files a return with the Registrar within 10 days, including the creditors\' meeting notice and relevant documents.\n\n8. Annual General Meeting: If the winding-up process extends over a year, the liquidator must call an annual general meeting of shareholders and seek court approval for extending the winding-up duration.\n\n9. Filing of General Meeting Documentation: Returns including notices of meetings, financial statements, and minutes must be filed with the Registrar within 10 days post-meeting.\n\n10. Final Report and Meeting: Upon completion, the liquidator compiles a final report and financial account, summoning a meeting of members to present these documents.\n\n11. Notice of Final Meeting: The final meeting notice is published in the Gazette and newspapers at least 10 days before the date.\n\n12. Submission of Final Documents: Within a week following the final meeting, the liquidator submits the final report and accounts to the Registrar using Form 112, marking the completion of the winding-up process.'
    },
    {
      id: 'compulsory-winding-up',
      title: 'Compulsory Winding Up of a Company',
      content: 'The compulsory winding up of a private limited company is a legal process overseen by the tribunal. This action may be initiated for various reasons, including:\n\n• Unpaid Debts: The company\'s failure to settle debts may prompt creditors to seek legal redress.\n\n• Special Resolution: Members pass a special resolution recognizing the need to dissolve the company due to challenges.\n\n• Unlawful Acts: Engagement in illegal activities compromises the company\'s integrity.\n\n• Fraud and Misconduct: Involvement in fraudulent practices damages the company\'s reputation.\n\n• Non-compliance with ROC Filings: Failure to file annual returns or financial statements for five consecutive years signals dysfunction.\n\n• Tribunal\'s Discretion: The tribunal may determine that winding up serves the best interests of stakeholders.'
    },
    {
      id: 'procedure-compulsory',
      title: 'Procedure for Compulsory Winding Up',
      content: 'The legal process for compulsory winding up involves the following steps:\n\n1. Filing a Petition: A petition is filed with the tribunal, including a detailed statement of the company\'s affairs.\n\n2. Tribunal\'s Review: The tribunal reviews the petition and may require the company to submit objections and affairs within 30 days.\n\n3. Appointment of a Liquidator: A liquidator is appointed to oversee the winding-up process and ensure fair asset distribution.\n\n4. Preparation and Approval of Reports: The liquidator prepares a preliminary report, which is submitted for tribunal approval.\n\n5. Submission to the Registrar of Companies (ROC): The liquidator submits a copy of the winding-up order to the ROC within 30 days.\n\n6. Final Approval by ROC: The ROC reviews the winding-up order and dissolves the company.\n\n7. Publication in the Official Gazette: A notice is published to formally announce the company\'s dissolution.'
    },
    {
      id: 'court-supervision',
      title: 'Winding Up of Company Subject to Court Supervision',
      content: 'When a company resolves to undergo winding up, a court may supervise the process at the request of creditors, members, or stakeholders. This ensures regulated and transparent proceedings.'
    },
    {
      id: 'implications',
      title: 'Implications of Company Winding Up',
      content: 'Winding up a company has significant consequences for various stakeholders:\n\n• For the Company: The company retains its legal entity status until officially dissolved, with management transitioning to the appointed liquidator.\n\n• For Shareholders: Shareholders face new statutory liabilities, and any share transfers post-winding up initiation without liquidator sanction are null and void.\n\n• For Creditors: Legal actions against the company are barred without court permission, and creditors must submit and validate claims with the liquidator.\n\n• For Management: The powers of directors and officers are suspended, except for specific procedural tasks.'
    },
    {
      id: 'role-liquidator',
      title: 'Role and Powers of a Liquidator in Company Winding Up',
      content: 'A liquidator plays a crucial role in overseeing the winding-up process, including liquidating assets, settling debts, and distributing remaining funds to shareholders. The official liquidator operates under the court\'s guidance and adheres to a structured reporting mechanism.'
    },
    {
      id: 'timeframe',
      title: 'How Long Does It Take to Wind Up a Business?',
      content: 'The time required for winding up a business varies based on factors like complexity and size. Initial preparations may take 2 to 3 months, while the liquidation phase can extend from a few months to over a year.'
    },
    {
      id: 'why-choose',
      title: 'Simplify Your Company Winding Up Process with OnEasy!',
      content: 'At OnEasy, we simplify the company winding-up process, ensuring your company\'s closure is seamless and compliant. Our dedicated team offers tailored support, guiding you through each step—from ROC filings to final dissolution. Contact us today to begin your company\'s winding-up journey!'
    }
  ];

  const faqs = [
    {
      question: 'What is company winding up?',
      answer: 'Company winding up is the formal process of closing a company\'s operations, liquidating its assets, settling debts, and distributing any remaining funds to shareholders before dissolving the company entirely.'
    },
    {
      question: 'What are the different types of winding up?',
      answer: 'The main types of winding up are: Compulsory Winding Up (initiated by a court order), Voluntary Winding Up (initiated by the company\'s shareholders or creditors), and Winding Up Subject to Court Supervision (a voluntary process that is overseen by the court).'
    },
    {
      question: 'How long does the winding up process take?',
      answer: 'The duration varies based on the company\'s complexity and size. Initial preparations may take a few months, while the entire winding up could take from several months to over a year.'
    },
    {
      question: 'What documents are required for winding up a company?',
      answer: 'Essential documents include: Special resolution to wind up, Declaration of solvency, Notice of the winding-up resolution, Liquidator\'s consent and reports, and Notices of meetings and other necessary filings with the Registrar of Companies.'
    },
    {
      question: 'Can a company be wound up if it is still solvent?',
      answer: 'Yes, a solvent company can be voluntarily wound up if its members agree to do so. This is often done to retire the company or if the business has fulfilled its purpose.'
    },
    {
      question: 'What happens to the employees of a company during winding up?',
      answer: 'Employees may be terminated as part of the winding-up process. They are entitled to receive their outstanding wages and any severance packages due as part of the liquidation process.'
    },
    {
      question: 'What are the roles and powers of a liquidator?',
      answer: 'A liquidator is responsible for overseeing the winding-up process, including liquidating assets, settling debts, distributing remaining assets to shareholders, and ensuring compliance with legal obligations.'
    },
    {
      question: 'What are the implications for shareholders during winding up?',
      answer: 'Shareholders may lose their investments if the company has insufficient assets to cover its liabilities. They are paid only after all debts to creditors have been settled.'
    },
    {
      question: 'Can creditors take legal action against the company during winding up?',
      answer: 'Legal actions against the company are generally prohibited once winding up has commenced, unless the court permits them to protect creditors\' interests.'
    },
    {
      question: 'How can I initiate the winding-up process for my company?',
      answer: 'To initiate winding up, a petition must be filed with the appropriate court (for compulsory winding up) or a special resolution must be passed by the shareholders (for voluntary winding up). It\'s advisable to consult a legal professional or a company secretary for guidance.'
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
                console.log('Initiating payment for Winding Up - Company:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'winding-up-company');
                localStorage.setItem('selectedRegistrationTitle', 'Winding Up - Company');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/winding-up-company-form');
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
            introTitle="About Winding Up of a Company"
            introDescription="Company winding up, also known as liquidation, is the formal process by which a company concludes its operations and is ultimately dissolved. This process involves systematically closing the company's affairs, including selling assets, settling debts, and distributing any remaining surplus to shareholders."
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

export default WindingUpCompanyDetails;

