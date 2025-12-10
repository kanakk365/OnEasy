import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import building from "../../assets/building.png";
import documentsIllustration from "../../assets/OBJECTS.png";
import PackagesSection from "./company-details/PackagesSection";
import ProcessSection from "./company-details/ProcessSection";
import DocumentsSection from "./company-details/DocumentsSection";
import PrerequisitesSection from "./company-details/PrerequisitesSection";
import AboutSection from "./company-details/AboutSection";
import FAQSection from "./company-details/FAQSection";
import TopTabs from "./company-details/TopTabs";
import { initPayment } from "../../utils/payment";
import PaymentSuccessPopup from "../common/PaymentSuccessPopup";
import { usePackages } from "../../hooks/usePackages";

function PartnershipDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("packages");
  const [expandedSection, setExpandedSection] = useState("");
  const [hidePackagesTab, setHidePackagesTab] = useState(false);
  const [isInFlow, setIsInFlow] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  // Fetch packages from API
  const { packages: apiPackages, loading: packagesLoading } = usePackages('partnership');

  // Define the sequential flow steps
  const flowSteps = ["process", "documents", "prerequisites", "about", "faq"];
  
  const getCurrentStepIndex = () => {
    return flowSteps.indexOf(activeTab);
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < flowSteps.length - 1) {
      setActiveTab(flowSteps[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex === 0) {
      // Go back to packages and exit flow
      setActiveTab("packages");
      setIsInFlow(false);
      setHidePackagesTab(false);
    } else {
      setActiveTab(flowSteps[currentIndex - 1]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const aboutSections = [
    {
      id: "partnership-firms",
      title: "Partnership Firms",
      content: "A partnership is a common business structure where two or more individuals collaborate to run a business, sharing profits as per a mutually agreed ratio. It is ideal for various trades, occupations, and professions, and offers fewer regulatory requirements compared to companies.\n\nAt OnEasy, we understand that partnership firm registration can be overwhelming. That's why we offer a hassle-free, end-to-end online service tailored to meet your needs, with affordable fees. Whether you're a new startup or an existing unregistered partnership looking to formalize your business, our expert team will guide you through every step of the registration process."
    },
    {
      id: "governing-law",
      title: "Governing Law for Partnership Firms",
      content: "In India, partnership firms are governed by the Indian Partnership Act of 1932. Partners come together through a contract, known as a \"Partnership Deed,\" which outlines the terms and conditions of the business arrangement."
    },
    {
      id: "partnership-deed",
      title: "Partnership Deed",
      content: "A partnership deed is a legal document that defines the rights and responsibilities of partners, the profit-sharing ratio, capital contributions, and the partnership's duration. It helps prevent conflicts by clearly laying out roles and responsibilities and serves as legal proof of the partnership."
    },
    {
      id: "partnership-registration",
      title: "Partnership Firm Registration",
      content: "Partnership firm registration involves the formal recognition of the partnership by the Registrar of Firms in the state where the firm operates. Although registration is optional, it is highly recommended as it provides legal recognition and protection.\n\nTo register a partnership firm, at least two individuals must come together, agree on a firm name, and prepare a partnership deed."
    },
    {
      id: "who-can-be-partner",
      title: "Who Can Be a Partner in a Partnership Firm?",
      content: [
        {
          title: "Mental and Legal Fitness",
          description: "Partners must be mentally sound, not minors, not insolvent, and legally capable of entering contracts."
        },
        {
          title: "Registered Firms",
          description: "Registered firms can partner with other businesses."
        },
        {
          title: "HUF Leaders",
          description: "Heads of Hindu Undivided Families (HUF) can be partners, provided they contribute their personal skills."
        },
        {
          title: "Companies as Partners",
          description: "Companies can become partners if their objectives align with the firm's activities."
        },
        {
          title: "Trustees of Specific Trusts",
          description: "Trustees of private or family trusts can partner unless restricted by their trust's rules."
        }
      ]
    },
    {
      id: "advantages",
      title: "Advantages of a Partnership Firm",
      content: [
        {
          title: "Easy Formation",
          description: "Partnerships are simple and cost-effective to form, with fewer formalities than other business structures."
        },
        {
          title: "Skill Diversity",
          description: "Partners bring varied skills, knowledge, and resources to the business."
        },
        {
          title: "Shared Risk",
          description: "Partners share financial responsibilities, reducing the burden on any one individual."
        },
        {
          title: "Tax Efficiency",
          description: "Profits are taxed at individual partners' rates, potentially reducing tax liabilities."
        },
        {
          title: "Flexible Decision-Making",
          description: "Partnerships offer flexibility in decision-making, with partners having equal say in business operations."
        },
        {
          title: "Capital Access",
          description: "Partners can contribute capital, and additional partners can join to raise more funds."
        }
      ]
    },
    {
      id: "disadvantages",
      title: "Disadvantages of a Partnership Firm",
      content: [
        {
          title: "Unlimited Liability",
          description: "Partners are personally liable for the firm's debts, risking personal assets."
        },
        {
          title: "Limited Capital",
          description: "Raising substantial capital may be challenging as it depends on partner contributions."
        },
        {
          title: "Conflict Potential",
          description: "Disagreements among partners may lead to disputes, affecting business operations."
        },
        {
          title: "Limited Growth",
          description: "Partnerships may face limitations in scaling compared to larger business structures."
        },
        {
          title: "Continuity Issues",
          description: "The firm may dissolve if a partner dies, withdraws, or becomes insolvent, unless otherwise provided in the partnership deed."
        },
        {
          title: "Tax Complexities",
          description: "Each partner is responsible for their own tax compliance, which may require professional assistance."
        }
      ]
    },
    {
      id: "importance-registration",
      title: "Importance of Partnership Firm Registration",
      content: "While registering a partnership firm is not mandatory under the Indian Partnership Act, it is highly recommended for several reasons:\n\nLegal Standing: A registered partnership firm is legally recognized, allowing partners to enforce their rights in court.\n\nAbility to Sue: Registered firms can file lawsuits against third parties, unlike unregistered firms.\n\nClaim Set-Off: Registered firms can claim set-offs in legal proceedings, a benefit unavailable to unregistered firms."
    },
    {
      id: "procedure-registration",
      title: "Procedure for Partnership Firm Registration",
      content: "The steps for partnership firm registration include:\n\nChoose a Firm Name: Select a unique name for the partnership firm that complies with legal naming guidelines.\n\nDraft a Partnership Deed: Prepare a detailed partnership deed outlining the firm's operations, profit-sharing ratio, and partner responsibilities.\n\nSubmit the Registration Application: File the registration application with the Registrar of Firms, providing details of the firm and partners.\n\nReceive the Certificate of Registration: Upon verification, the Registrar issues a Certificate of Registration, confirming the partnership.\n\nApply for PAN and TAN: Obtain a PAN and TAN for tax-related purposes from the Income Tax Department."
    },
    {
      id: "oneasy-help",
      title: "How OnEasy Can Help with Partnership Firm Registration",
      content: "At OnEasy, we simplify the process of partnership firm registration. Our experienced team will:\n\nGuide you through every step of the registration process.\n\nAssist with documentation and name selection.\n\nEnsure full legal compliance.\n\nHandle the submission to the relevant authorities.\n\nKeep you updated with timely progress reports.\n\nWe also provide ongoing support post-registration, ensuring you understand the legal responsibilities of operating a partnership firm.\n\nWith OnEasy, your partnership firm registration is efficient, affordable, and stress-free. Contact us today to get started!"
    },
    {
      id: "partnership-deed-info",
      title: "Information needed for a Partnership Deed",
      content: [
        {
          title: "Partner Details",
          description: "Who are the partners and what is their residential address?"
        },
        {
          title: "Duration",
          description: "How long do they want to keep the duration of the firm?"
        },
        {
          title: "Principal Place of Business",
          description: "Principal place of business of the firm."
        },
        {
          title: "Objective",
          description: "Objective of the partnership firm."
        },
        {
          title: "Capital Contribution",
          description: "Capital required for the business may be contributed and arranged by the partners from time to time as and when needed, or in such manner as may be mutually agreed upon."
        }
      ]
    }
  ];

  const tabs = [
    { id: "packages", label: "Packages" },
    { id: "process", label: "Process" },
    { id: "documents", label: "Documents" },
    { id: "prerequisites", label: "Pre requisites" },
    { id: "about", label: "About" },
    { id: "faq", label: "FAQ" },
  ];

  // Filter out packages tab if it should be hidden
  const visibleTabs = hidePackagesTab || isInFlow
    ? tabs.filter((tab) => tab.id !== "packages")
    : tabs;

  // Use packages from API, fallback to empty array if loading
  const packages = packagesLoading ? [] : apiPackages.map(pkg => ({
    ...pkg,
    color: 'blue' // Default color for partnership
  }));

  const processSteps = [
    {
      step: 1,
      title: "Choose a Firm Name",
      description: "Select a unique name for the partnership firm that complies with legal naming guidelines."
    },
    {
      step: 2,
      title: "Draft a Partnership Deed",
      description: "Prepare a detailed partnership deed outlining the firm's operations, profit-sharing ratio, and partner responsibilities."
    },
    {
      step: 3,
      title: "Submit the Registration Application",
      description: "File the registration application with the Registrar of Firms, providing details of the firm and partners."
    },
    {
      step: 4,
      title: "Receive the Certificate of Registration",
      description: "Upon verification, the Registrar issues a Certificate of Registration, confirming the partnership."
    },
    {
      step: 5,
      title: "Apply for PAN and TAN",
      description: "Obtain a PAN and TAN for tax-related purposes from the Income Tax Department."
    }
  ];

  const prerequisites = [
    "A minimum of two partners is required to form a partnership firm.",
    "The partners must be at least 18 years old to start a partnership firm.",
    "PAN and Aadhar Card of all Partners for identity and address verification.",
    "Capital Contribution: Specify the amount of capital contributed by each partner.",
    "Specify the primary location where the business will operate (for this an address proof is required)."
  ];

  const documents = [
    "PAN Card of Partners",
    "Aadhar Card of Partners",
    "Bank Statement of Partners (Recent)",
    "Rental Agreement and NOC (Premises)",
    "Photographs of all partners"
  ];

  const faqs = [
    {
      question: "Is it mandatory to register a Partnership Firm?",
      answer: "No, registration of a partnership firm is not mandatory, but it is advisable as it offers legal benefits and protection."
    },
    {
      question: "How many partners can a Partnership Firm have?",
      answer: "A partnership firm can have a minimum of 2 partners and a maximum of 50 partners, as per the Indian Partnership Act."
    },
    {
      question: "What is a Partnership Deed, and why is it important?",
      answer: "A partnership deed is a legal document that outlines the rights, responsibilities, and profit-sharing ratios of partners. It helps prevent disputes."
    },
    {
      question: "Can a Partnership Firm have a corporate partner?",
      answer: "Yes, a company or LLP can be a partner in a partnership firm if its objectives allow it."
    },
    {
      question: "Do Partnership Firms have to pay taxes?",
      answer: "Partnership firms are subject to income tax, and profits are taxed at the firm level. Partners also pay tax on their share of profits."
    },
    {
      question: "What is the difference between a registered and unregistered partnership firm?",
      answer: "A registered firm has legal recognition and can enforce contracts in court. Unregistered firms cannot sue or enforce legal rights."
    },
    {
      question: "Can a partnership firm be converted into a company or LLP?",
      answer: "Yes, a partnership firm can be converted into a private limited company or LLP if the partners choose to do so."
    },
    {
      question: "What documents are needed to incorporate a Partnership Firm?",
      answer: "Documents such as the partnership deed, PAN cards, address proofs of partners, and proof of the firm's business address are required."
    },
    {
      question: "Is GST registration necessary for a Partnership Firm?",
      answer: "GST registration is required if the firm's turnover exceeds the threshold limit or engages in interstate trade."
    },
    {
      question: "Can a Partnership Firm operate from a rented property?",
      answer: "Yes, a partnership firm can operate from a rented property. A rent agreement must be provided as address proof during registration."
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "packages":
        return (
          <PackagesSection
            packages={packages}
            onGetStarted={async (selectedPackage) => {
              try {
                console.log('Initiating payment for:', selectedPackage.name);
                
                // Store registration type
                localStorage.setItem('selectedRegistrationType', 'partnership');
                localStorage.setItem('selectedRegistrationTitle', 'Partnership Firm');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                  console.log('✅ Payment successful! Redirecting...');
                  // Navigate to partnership form when ready
                  // navigate('/partnership-form');
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

      case "process":
        return <ProcessSection processSteps={processSteps} />;

      case "documents":
        return <DocumentsSection illustration={documentsIllustration} documents={documents} />;

      case "prerequisites":
        return <PrerequisitesSection prerequisites={prerequisites} />;

      case "about":
        return (
          <AboutSection
            building={building}
            aboutSections={aboutSections}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            introTitle="About Partnership Firm"
            introDescription="A Partnership Firm is a favored choice among entrepreneurs for its simplicity and flexibility. It allows multiple individuals to pool their resources, skills, and expertise to run a business. This model allows for flexibility in management and profit-sharing, tailored to the partners' agreement. Partnerships benefit from relatively easy formation and fewer regulatory requirements compared to corporations."
          />
        );

      case "faq":
        return <FAQSection faqs={faqs} />;

      default:
        return null;
    }
  };

  // Check if current tab is in the flow steps
  const isInFlowStep = flowSteps.includes(activeTab);
  const showNavigationButtons = isInFlow && isInFlowStep && activeTab !== "faq";
  const isLastStep = activeTab === "faq";

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Registrations Button - Top Right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/registrations/partnership')}
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
          tabs={visibleTabs}
          activeTab={activeTab}
          onChange={(id) => {
            if (!isInFlow || flowSteps.includes(id) || id === "faq") {
              setActiveTab(id);
            }
          }}
          disabled={isInFlow}
        />
        {renderTabContent()}
        {showNavigationButtons && (
          <div className="flex justify-between items-center max-w-3xl mx-auto mt-8 mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <button
              onClick={isLastStep ? handleNext : handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors"
            >
              {isLastStep ? "Continue" : "Next"}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      <PaymentSuccessPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
      />
    </div>
  );
}

export default PartnershipDetails;

