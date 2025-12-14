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

function WindingUpLLPDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages, loading: packagesLoading } = usePackages('winding-up-llp');

  const processSteps = [
    {
      step: 1,
      title: 'Consent of Partners',
      description: 'Obtain consent from all partners to wind up the LLP, documented in a resolution. For voluntary winding up, the majority of designated partners must agree.'
    },
    {
      step: 2,
      title: 'Declaration of Solvency',
      description: 'Obtain a Declaration of Solvency (DOS) verified by an affidavit, alongside audited financial statements and a valuation report of assets, if applicable.'
    },
    {
      step: 3,
      title: 'Resolution for Winding Up',
      description: 'Pass a resolution for voluntary liquidation and appoint a liquidator within four weeks of obtaining the DOS. If there are debts, obtain creditors\' approval (two-thirds of debt value) within seven days.'
    },
    {
      step: 4,
      title: 'Filing of Form 1',
      description: 'Submit a notice of the proposed winding up to the Registrar of Companies (ROC) using Form 1. Notify the Registrar and the Insolvency and Bankruptcy Board of India (IBBI) about the resolution within seven days.'
    },
    {
      step: 5,
      title: 'Appointment of Liquidator',
      description: 'Appoint an insolvency professional as the liquidator, with terms and remuneration included in the resolution. The liquidator must make a public announcement inviting claims from stakeholders within five days.'
    },
    {
      step: 6,
      title: 'Settlement of Liabilities',
      description: 'The liquidator verifies claims within 30 days, values and sells the LLP\'s assets, and settles all outstanding debts and liabilities.'
    },
    {
      step: 7,
      title: 'Distribution of Assets',
      description: 'After settling all debts and deducting liquidation costs, distribute any remaining assets among the partners as per the LLP agreement within six months.'
    },
    {
      step: 8,
      title: 'Filing of Final Accounts',
      description: 'Prepare and file final account statements of assets and liabilities (Form 27) with the Registrar, completing the winding-up process.'
    }
  ];

  const documents = [
    'Resolution of Partners',
    'Form 1',
    'Liquidator Appointment Letter',
    'Statement of Assets and Liabilities',
    'Notice to Creditors',
    'Final Accounts',
    'Form 27'
  ];

  const prerequisites = [
    {
      title: 'Consent of Partners',
      description: 'All partners must agree to the winding up, documented in a resolution.'
    },
    {
      title: 'Filing of Form 1',
      description: 'Submit a notice of the proposed winding up to the Registrar of Companies (ROC) using Form 1.'
    },
    {
      title: 'Settling of Liabilities',
      description: 'All outstanding debts and liabilities must be settled.'
    },
    {
      title: 'Appointment of Liquidator',
      description: 'A liquidator should be appointed to oversee the process.'
    },
    {
      title: 'Notification to Creditors',
      description: 'Creditors must be informed of the winding-up proceedings.'
    },
    {
      title: 'Filing of Final Accounts',
      description: 'Prepare a final account statement of assets and liabilities.'
    },
    {
      title: 'Compliance with Legal Requirements',
      description: 'Ensure adherence to the Limited Liability Partnership Act and other regulations.'
    }
  ];

  const aboutSections = [
    {
      id: 'winding-up-llp-intro',
      title: 'About Winding Up of a LLP',
      content: 'Winding up a Limited Liability Partnership (LLP) is the formal process of dissolving the entity by settling its debts, liquidating its assets, and distributing any remaining assets to the partners. This process can be initiated voluntarily by the partners or compulsorily by a tribunal for various reasons, including insolvency, inactivity, or legal non-compliance. Navigating the complexities of winding up requires a thorough understanding of legal procedures, compliance requirements, and effective financial management. It\'s essential for LLP members to approach this process methodically to ensure a smooth dissolution while protecting the interests of all parties involved.\n\nAt OnEasy, we provide expert guidance and support throughout the winding-up process of your LLP, ensuring compliance with all legal requirements and minimizing potential complications. Contact us today to get started and ensure a seamless and compliant winding-up procedure for your LLP.'
    },
    {
      id: 'what-is-winding-up',
      title: 'What is Winding Up of LLP?',
      content: 'Winding up of a Limited Liability Partnership (LLP) refers to the formal process of closing the LLP\'s operations, disposing of its assets, and settling its liabilities. This process is undertaken when an LLP ceases its business activities and dissolves as a legal entity.'
    },
    {
      id: 'laws-governing',
      title: 'Laws Governing LLP Winding Up',
      content: 'The winding-up and dissolution of LLPs in India are primarily governed by the following provisions:\n\n• Section 65 of the LLP Act, 2008: Empowers the Central Government to formulate rules regarding the winding up and dissolution of LLPs.\n\n• Section 67 of the LLP Act, 2008: Grants the Central Government the authority to apply relevant provisions from the Companies Act, 1956, to LLPs, including those related to winding up, thereby allowing for a more flexible regulatory approach.\n\n• Notification GSR 6(E), dated 6th January 2010: Directs that specific sections of the Companies Act, 1956, apply to the winding up of LLPs.\n\n• Limited Liability Partnership (Winding Up and Dissolution) Rules, 2012: Outlines the procedures, forms, and fees associated with the winding up and dissolution of LLPs.'
    },
    {
      id: 'comparison',
      title: 'Comparison Between Winding Up and Dissolution of LLP',
      content: 'Winding up and dissolution are two distinct stages in the closure of a Limited Liability Partnership (LLP). Here\'s a simplified comparison:\n\n• Winding Up: Preparing to close by selling assets and paying creditors. The LLP remains a legal entity and can engage in legal proceedings.\n\n• Dissolution: The final step, where the LLP is officially closed and ceases to exist after completing all legal procedures. After dissolution, the LLP no longer exists legally, its name is removed from ROC records, and it cannot sue or be sued.\n\nIn essence, the winding-up process involves settling the LLP\'s affairs, while dissolution marks the official end of the LLP\'s existence.'
    },
    {
      id: 'modes-of-winding-up',
      title: 'Modes of LLP Winding Up',
      content: 'An LLP can be wound up through various methods, each with its own procedures and legal implications:\n\n• Voluntary Winding Up: Partners decide to wind up the affairs of the LLP based on mutual agreement or reasons specified in the LLP agreement.\n\n• Insolvency and Bankruptcy Code (IBC), 2016: While primarily focused on restructuring, the IBC allows the National Company Law Tribunal (NCLT) to order the liquidation of an LLP in insolvency cases.\n\n• Compulsory Winding Up by the Tribunal: Initiated by an external order, the tribunal may wind up the LLP for reasons such as non-compliance, inability to pay debts, or other legal grounds.'
    },
    {
      id: 'voluntary-liquidation',
      title: 'Voluntary Liquidation',
      content: 'Voluntary liquidation is a self-initiated process where the partners decide to dissolve and wind up the LLP\'s affairs without external compulsion, such as a court order. Reasons for this decision may include financial struggles, mutual agreement among partners to cease operations, or achieving the objectives for which the LLP was formed.'
    },
    {
      id: 'prerequisites-voluntary',
      title: 'Pre-requisites for Voluntary Liquidation',
      content: 'To initiate a voluntary liquidation under the IBC, 2016, an LLP must meet the following criteria:\n\n• Solvency: The LLP must be solvent, meaning it can pay its debts in full.\n\n• Declaration by Designated Partners: A declaration by the majority of designated partners affirming that the LLP can pay all debts from the proceeds of asset sales.\n\n• No Intent to Defraud: The liquidation process must not be undertaken with the intention to defraud any person.'
    },
    {
      id: 'procedure-voluntary',
      title: 'Procedure for Voluntary Liquidation of LLP',
      content: 'The voluntary liquidation process involves several critical steps:\n\n1. Commencement of Liquidation: Obtain a Declaration of Solvency (DOS) verified by an affidavit, alongside audited financial statements and a valuation report of assets.\n\n2. Resolution: Pass a resolution for voluntary liquidation and appoint a liquidator within four weeks of obtaining the DOS.\n\n3. Creditors\' Approval: If there are debts, creditors representing two-thirds of the debt value must approve the resolution within seven days.\n\n4. Notification: Inform the Registrar and the Insolvency and Bankruptcy Board of India (IBBI) about the resolution within seven days.\n\n5. Liquidation Proceedings: Liquidation commences upon resolution approval, and the LLP must cease operations except for actions beneficial to the winding-up process.\n\n6. Appointment and Remuneration of Liquidator: An insolvency professional is appointed as the liquidator, with terms and remuneration included in the resolution.\n\n7. Public Announcement: The liquidator must make a public announcement inviting claims from stakeholders within five days of appointment.\n\n8. Verification of Claims: The liquidator verifies claims within 30 days and may admit or reject them wholly or partially.\n\n9. Realisation of Assets: The liquidator is responsible for valuing and selling the LLP\'s assets and recovering dues.\n\n10. Deposit and Distribution of Proceeds: Open a bank account for the LLP in voluntary liquidation to deposit received monies and distribute proceeds within six months after deducting liquidation costs.'
    },
    {
      id: 'tribunal-winding-up',
      title: 'Winding Up of LLP by Tribunal',
      content: 'Tribunal winding up can occur for several reasons:\n\n• Voluntary Winding Up: The LLP consents to be wound up.\n\n• Insufficient Number of Partners: Having fewer than two partners for six months.\n\n• Inability to Pay Debts: Financial insolvency preventing debt repayment.\n\n• Activities Against National Interest: Engaging in detrimental activities.\n\n• Non-compliance with Statutory Filings: Failing to file required documents for five consecutive financial years.\n\n• Just and Equitable Grounds: The Tribunal may find it just and equitable to wind up the LLP.'
    },
    {
      id: 'procedure-tribunal',
      title: 'Procedure for Winding Up by a Tribunal',
      content: 'The winding-up process by a Tribunal includes several steps:\n\n1. Petition for Winding Up: File a petition with the Tribunal by the LLP, creditors, or partners.\n\n2. Tribunal\'s Decision: The Tribunal considers the petition and, if valid, passes a winding-up order.\n\n3. Appointment of Liquidator: A Liquidator is appointed to manage the winding-up process.\n\n4. Public Announcement: The Liquidator publicly announces the winding up, inviting claims from creditors.\n\n5. Settlement of Claims: Claims from creditors are settled as per legal requirements.\n\n6. Liquidation of Assets: The Liquidator sells the LLP\'s assets to pay off debts.\n\n7. Distribution of Assets: Remaining assets are distributed among the partners as per the LLP agreement.\n\n8. Dissolution of LLP: After settling debts and distributing assets, the Liquidator applies for dissolution.\n\n9. Filing with Registrar: The dissolution order is filed with the Registrar, resulting in the LLP being officially dissolved.\n\nKey Considerations:\n\n• The winding-up process must adhere to the LLP Act and relevant laws.\n\n• Creditor interests are prioritized throughout the process.\n\n• The Liquidator plays a crucial role and must act impartially and diligently.'
    },
    {
      id: 'insolvency-proceedings',
      title: 'Insolvency Proceedings for LLPs under the IBC, 2016',
      content: 'The IBC provides a framework for insolvency resolution and liquidation for corporate entities, including LLPs. The process involves initiation, a moratorium period, appointment of an Insolvency Resolution Professional (IRP), a Committee of Creditors (CoC), and potential liquidation if a resolution plan is not approved.'
    },
    {
      id: 'why-choose',
      title: 'OnEasy: Your Partner in LLP Winding Up',
      content: 'OnEasy offers specialized services to facilitate the winding up of Limited Liability Partnerships (LLPs), ensuring a smooth and compliant process from start to finish. Our team of experts provides comprehensive support, including necessary documentation preparation, declaration of solvency, resolution passing, and liquidator appointment. We guide you through each step, ensuring all legal requirements are met efficiently. With OnEasy, you can confidently navigate the complexities of the LLP winding-up process, providing a seamless transition and closure of your business affairs.\n\nContact our experts today for personalized assistance.'
    }
  ];

  const faqs = [
    {
      question: 'What is winding up of an LLP?',
      answer: 'Winding up of an LLP refers to the process of closing the business, settling its debts, liquidating its assets, and formally dissolving the partnership.'
    },
    {
      question: 'What are the reasons for winding up an LLP?',
      answer: 'Common reasons include financial insolvency, mutual agreement among partners to cease operations, non-compliance with legal requirements, or achieving the LLP\'s business objectives.'
    },
    {
      question: 'What is the difference between winding up and dissolution of an LLP?',
      answer: 'Winding up involves the process of settling debts and liquidating assets, while dissolution is the final step where the LLP ceases to exist as a legal entity.'
    },
    {
      question: 'How can an LLP be wound up?',
      answer: 'An LLP can be wound up voluntarily by partners, through a tribunal order, or under the Insolvency and Bankruptcy Code (IBC) in case of insolvency.'
    },
    {
      question: 'What is voluntary winding up?',
      answer: 'Voluntary winding up occurs when the partners of the LLP mutually agree to dissolve the partnership, often based on specific provisions in the LLP agreement.'
    },
    {
      question: 'What are the prerequisites for voluntary winding up?',
      answer: 'The LLP must be solvent, and a Declaration of Solvency must be filed by the designated partners affirming that the LLP can pay all its debts.'
    },
    {
      question: 'What is the role of a liquidator in the winding-up process?',
      answer: 'The liquidator is responsible for managing the winding-up process, including asset liquidation, debt settlement, and ensuring compliance with legal procedures.'
    },
    {
      question: 'How long does the winding-up process take?',
      answer: 'The duration varies based on the LLP\'s complexity and the efficiency of the liquidator, but it typically ranges from a few months to over a year.'
    },
    {
      question: 'What happens to the remaining assets after winding up?',
      answer: 'After settling all debts and liabilities, any remaining assets are distributed among the partners as per the LLP agreement.'
    },
    {
      question: 'What are the legal implications of failing to wind up an LLP properly?',
      answer: 'Failing to follow proper winding-up procedures can lead to legal liabilities for the partners, potential penalties from regulatory authorities, and issues related to asset recovery or creditor claims.'
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
                console.log('Initiating payment for Winding Up - LLP:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'winding-up-llp');
                localStorage.setItem('selectedRegistrationTitle', 'Winding Up - LLP');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/roc/winding-up-llp-form');
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
            introTitle="About Winding Up of a LLP"
            introDescription="Winding up a Limited Liability Partnership (LLP) is the formal process of dissolving the entity by settling its debts, liquidating its assets, and distributing any remaining assets to the partners."
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

export default WindingUpLLPDetails;

