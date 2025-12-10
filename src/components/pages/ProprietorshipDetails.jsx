import React, { useState, useEffect } from "react";
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
import { usePackages } from "../../hooks/usePackages";

function ProprietorshipDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("packages");
  const [expandedSection, setExpandedSection] = useState("");
  const [hidePackagesTab, setHidePackagesTab] = useState(false);
  const [isInFlow, setIsInFlow] = useState(false);

  // Fetch packages from API
  const { packages: apiPackages, loading: packagesLoading } = usePackages('proprietorship');

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
      id: "what-is-proprietorship",
      title: "About Proprietorship",
      content: [
        {
          title: "What is Sole Proprietorship?",
          description:
            "A Sole Proprietorship is one of the oldest and simplest business structures to start in India. It is a type of business owned, managed, and controlled by a single person, known as the proprietor. Since the proprietorship and the proprietor are considered the same legal entity, it is easy to start, with minimal compliance requirements.",
        },
        {
          title: "Key Characteristics",
          description:
            "A proprietorship cannot have partners or shareholders as the proprietor and the business are considered as one entity. There is also no limited liability protection, meaning the proprietor is personally liable for the business's activities. This structure is ideal for small businesses with no more than five employees.",
        },
      ],
    },
    {
      id: "key-features",
      title: "Key Features and Benefits of Proprietorship",
      content: [
        {
          title: "Easy to Start",
          description:
            "Simplest form of business structure with minimal compliance requirements and documentation.",
        },
        {
          title: "Full Control",
          description:
            "The proprietor has complete control over business decisions and operations without needing approvals.",
        },
        {
          title: "Low Cost",
          description:
            "Minimal registration costs and operational expenses compared to other business structures.",
        },
        {
          title: "Single Legal Entity",
          description:
            "The proprietor and business are treated as one entity for legal and tax purposes.",
        },
        {
          title: "Tax Benefits",
          description:
            "Income tax benefits and simplified tax filing procedures under the proprietor's PAN.",
        },
        {
          title: "Easy Closure",
          description:
            "Can be easily closed or dissolved without complex legal procedures.",
        },
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility Criteria",
      content: [
        {
          title: "Resident Indian Only",
          description:
            "Only Resident Indians can start a proprietorship firm. Non-resident Indians (NRIs) and foreign nationals are not eligible.",
        },
        {
          title: "Age Requirement",
          description:
            "The proprietor must be at least 18 years of age to start a proprietorship firm.",
        },
        {
          title: "Single Owner",
          description:
            "A proprietorship can have only one owner. No partners or shareholders are allowed.",
        },
        {
          title: "Personal Liability",
          description:
            "The proprietor has unlimited liability - personally responsible for all business debts and obligations.",
        },
      ],
    },
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
    color: 'blue' // Default color for proprietorship
  }));

  const processSteps = [
    {
      step: 1,
      title: "Select Your Package",
      description: "Choose the package that best suits your business needs",
    },
    {
      step: 2,
      title: "Complete Payment",
      description: "Secure payment via Razorpay gateway",
    },
    {
      step: 3,
      title: "Submit Documents",
      description: "Upload required documents and business information",
    },
    {
      step: 4,
      title: "CA Verification",
      description: "Our CA will verify and process your registration",
    },
    {
      step: 5,
      title: "Receive Certificate",
      description: "Get your proprietorship certificate and other documents",
    },
  ];

  const prerequisites = [
    "Only Resident Indians can start a proprietorship firm. Non-resident Indians (NRIs) and foreign nationals are not eligible to establish a proprietorship business in India.",
    "The proprietor must be at least 18 years old to start a proprietorship firm.",
    "PAN Card and Aadhaar Card of the Proprietor is required for identity and address verification.",
    "A proprietorship needs to have a registered address for the business. If the property is rented, a rental agreement may be required.",
    "GST Registration if the business's turnover exceeds the specified threshold.",
    "Income Tax Registration under the proprietor's PAN, as the business's income is treated as the proprietor's income.",
  ];

  const documents = [
    "PAN of the Proprietor",
    "Aadhaar Card of the Proprietor",
    "Bank Statement of the Proprietor",
    "Photograph of the Proprietor",
    "Rental Agreement and NOC (Premises)",
    "Utility bill of the Premises",
    "Photograph of the premises",
  ];

  const faqs = [
    {
      question: "What is a Proprietorship Firm?",
      answer: "A Proprietorship Firm is a business owned, managed, and controlled by a single person. It is not a separate legal entity, and the owner and the business are considered the same."
    },
    {
      question: "Is registration mandatory for a Proprietorship Firm?",
      answer: "Registration of a Proprietorship Firm is not mandatory. However, various licenses and registrations may be required depending on the nature of the business (like GST registration, MSME registration, etc.)."
    },
    {
      question: "What are the key documents required to start a Proprietorship Firm?",
      answer: "Key documents include the owner's PAN Card, Aadhar Card, proof of business address (utility bill), and any licenses required based on the type of business."
    },
    {
      question: "How long does it take to register a Proprietorship Firm?",
      answer: "Registration of a Proprietorship Firm is usually quick and can be completed within 3 to 5 working days, depending on the type of licenses required."
    },
    {
      question: "Can a Proprietorship Firm have employees?",
      answer: "Yes, a Proprietorship Firm can hire employees, and the owner is responsible for paying their salaries and complying with labour laws."
    },
    {
      question: "Can a Proprietorship Firm be converted into another entity, like a Private Limited Company?",
      answer: "Yes, a Proprietorship Firm can be converted into a Private Limited Company or other entities, but it requires following specific procedures for conversion."
    },
    {
      question: "What are the tax implications for a Proprietorship Firm?",
      answer: "The income of a Proprietorship Firm is taxed as the individual income of the owner under the income tax slab rates. There is no separate tax structure for the firm."
    },
    {
      question: "Is there any minimum capital requirement for starting a Proprietorship Firm?",
      answer: "No, there is no minimum capital requirement to start a Proprietorship Firm. The owner can start the business with any amount of capital."
    },
    {
      question: "Can a Proprietorship Firm have multiple owners?",
      answer: "No, a Proprietorship Firm is owned and operated by a single individual. If there are multiple owners, it must be registered as a partnership or another form of business entity."
    },
    {
      question: "What are the benefits of registering a Proprietorship Firm under MSME?",
      answer: "Registering a Proprietorship Firm under MSME (Udyam Registration) provides benefits such as access to government schemes, lower interest rates on loans, and easier access to credit and subsidies."
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
                
                // Store registration type in localStorage for payment verification
                localStorage.setItem('selectedRegistrationType', 'proprietorship');
                localStorage.setItem('selectedRegistrationTitle', 'Proprietorship Registration');
                
                const result = await initPayment(selectedPackage);
                
                if (result.success && result.redirect) {
                  console.log('✅ Payment successful! Redirecting...');
                  navigate('/proprietorship-form');
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
            onClick={() => navigate('/proprietorship-dashboard')}
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
              onClick={isLastStep ? handleContinue : handleNext}
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
    </div>
  );
}

export default ProprietorshipDetails;
