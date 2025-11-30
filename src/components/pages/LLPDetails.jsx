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

function LLPDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("packages");
  const [expandedSection, setExpandedSection] = useState("");
  const [hidePackagesTab, setHidePackagesTab] = useState(false);
  const [isInFlow, setIsInFlow] = useState(false);

  // Ensure we start with packages tab on mount
  useEffect(() => {
    setActiveTab("packages");
    setExpandedSection("");
    setIsInFlow(false);
    setHidePackagesTab(false);
  }, []);

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
      id: "what-is-llp",
      title: "What is an LLP?",
      content: "A Limited Liability Partnership (LLP) is a unique business model that merges the benefits of partnerships and companies. In an LLP, partners enjoy limited liability, similar to shareholders in a company, but with the flexibility and ease of a partnership. This provides the LLP with its own legal identity, separate from its partners, allowing it to engage in legal actions independently.\n\nLLPs are increasingly popular across industries, offering protection for partners' assets while requiring less regulatory compliance than traditional corporations. Introduced in India in 2008 under the Limited Liability Partnership Act, LLPs offer a flexible and reliable business option for companies of all sizes.\n\nRegistering your LLP in India is simple with OnEasy. Many businesses trust us to assist them in registering their LLPs and staying compliant with legal regulations. Our expert team will guide you through the online registration process, ensuring a seamless and cost-effective experience. Just reach out to us, and start your journey towards a successful business with hassle-free LLP registration."
    },
    {
      id: "key-features",
      title: "Key Features of LLP",
      content: [
        {
          title: "Separate Legal Identity",
          description: "LLPs operate as independent legal entities, like larger companies, distinct from their partners."
        },
        {
          title: "Minimum Two Partners",
          description: "You need at least two partners to form an LLP, fostering teamwork and collaboration."
        },
        {
          title: "No Limit on Partners",
          description: "LLPs can have an unlimited number of partners, making it easy to expand."
        },
        {
          title: "Two Designated Partners",
          description: "Two designated partners are required, and at least one must reside in India."
        },
        {
          title: "Limited Liability Protection",
          description: "Partners' liability is limited to their agreed contributions, safeguarding personal assets."
        },
        {
          title: "Cost-Effective",
          description: "LLP registration is more affordable compared to larger companies, making it ideal for smaller businesses."
        },
        {
          title: "Fewer Compliance Requirements",
          description: "LLPs have fewer regulations and reporting obligations than corporations, reducing paperwork."
        },
        {
          title: "No Minimum Capital Requirement",
          description: "Unlike other business models, LLPs don't require a fixed capital amount to get started, allowing flexibility."
        }
      ]
    },
    {
      id: "advantages",
      title: "Advantages of LLP",
      content: [
        {
          title: "Independent Legal Entity",
          description: "LLPs function as separate legal entities, enhancing trust and credibility."
        },
        {
          title: "Limited Liability for Partners",
          description: "Partners are protected from business risks, with liability limited to their contribution."
        },
        {
          title: "Cost and Time Efficient",
          description: "LLP registration is more affordable and involves fewer compliance burdens compared to companies."
        },
        {
          title: "No Fixed Capital Requirement",
          description: "LLPs allow partners to invest according to their capacity, with no fixed capital requirement."
        }
      ]
    },
    {
      id: "disadvantages",
      title: "Disadvantages of LLP",
      content: [
        {
          title: "Penalties for Non-Compliance",
          description: "LLPs face significant penalties for failing to meet regulatory obligations, even if they are inactive."
        },
        {
          title: "Dissolution Risks",
          description: "LLPs must maintain at least two partners; if fewer, they may be dissolved after six months."
        },
        {
          title: "Challenges in Raising Capital",
          description: "LLPs don't issue shares like companies, making it harder to attract large-scale investments."
        }
      ]
    },
    {
      id: "name-structure",
      title: "LLP Name Structure",
      content: "When selecting a name for your LLP, ensure it is unique and not already in use. The name should clearly reflect your business activities and must end with \"LLP\" or \"Limited Liability Partnership\" to indicate its structure."
    },
    {
      id: "oneasy-support",
      title: "Easy LLP Registration with OnEasy",
      content: "OnEasy provides complete support throughout the LLP registration process, ensuring a smooth and stress-free experience. Our experienced team simplifies the process, providing clear and accurate information every step of the way. We help you check and reserve your LLP name in compliance with MCA regulations. Our experts help draft your LLP agreement and manage its filing with the authorities. We streamline the process of applying for your LLP's PAN and TAN. Our LLP registration fees are competitive, offering premium service at cost-effective rates. We provide ongoing updates and customer support throughout the registration process, ensuring a smooth experience. With OnEasy, registering your LLP is simple, allowing you to focus on building your business with confidence."
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

  // Packages - same as Private Limited Company
  const packages = [
    {
      name: "Starter",
      price: "12,999",
      priceValue: 12999,
      period: "One Time",
      description: "For solo entrepreneurs",
      icon: "★",
      features: [
        "LLP Name Reservation",
        "DSC for Partners",
        "DPIN Application",
        "LLP Agreement Drafting",
        "FiLLiP Form Filing",
        "Certificate of Incorporation",
        "PAN & TAN Application",
        "GST Registration (if applicable)"
      ],
      color: "blue",
    },
    {
      name: "Growth",
      price: "16,999",
      priceValue: 16999,
      period: "One Time",
      description: "As your business scales",
      icon: "✢",
      features: [
        "Everything in Starter",
        "Professional Tax Registration",
        "Shops & Establishment License",
        "MSME Registration",
        "Bank Account Opening Assistance",
        "CA Consultation (15 mins)",
        "Priority Support"
      ],
      isHighlighted: true,
      color: "blue",
    },
    {
      name: "Pro",
      price: "25,499",
      priceValue: 25499,
      period: "One Time",
      description: "For more complex businesses",
      icon: "✤",
      features: [
        "Everything in Growth",
        "Startup India Registration",
        "FSSAI License (if applicable)",
        "Trade License",
        "CA Consultation (30 mins)",
        "Dedicated Account Manager",
        "1 Year Compliance Support",
        "Legal Document Templates"
      ],
      color: "blue",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Select an LLP Name",
      description: "Choose a unique name for your LLP, adhering to MCA guidelines."
    },
    {
      step: 2,
      title: "File Form for LLP Incorporation (FiLLiP)",
      description: "This form gathers details about the LLP, its partners, and the registered office address."
    },
    {
      step: 3,
      title: "Draft LLP Agreement",
      description: "Prepare the LLP agreement which outlines the objectives of the LLP and delineates the roles and responsibilities of each partner. Serving as the constitution of the LLP, it establishes governance frameworks and operational procedures to ensure clarity and mitigate potential disputes."
    },
    {
      step: 4,
      title: "Obtain Certificate of Incorporation",
      description: "Once approved, the Registrar of Companies (ROC) will issue the Certificate of Incorporation, officially recognizing your LLP."
    },
    {
      step: 5,
      title: "Apply for PAN and TAN",
      description: "After incorporation, apply for the LLP's PAN and TAN."
    }
  ];

  const prerequisites = [
    "Minimum Partners: At least 2 partners are required to form an LLP.",
    "Designated Partners: Minimum 2 designated partners, with at least one being a resident in India.",
    "Corporate Partner Representation: If a body corporate is a partner, a natural person must represent it.",
    "Contribution: Partners must agree on the capital contribution."
  ];

  const documents = [
    "PAN Card of all Partners",
    "Aadhaar Card of all Partners",
    "Bank Statement of all Partners (Recent)",
    "Passport (only for Foreign Nationals)",
    "Photographs of all partners",
    "Rental Agreement and NOC (Premises)",
    "Latest utility bill of the Premises (Electricity Bill)"
  ];

  const faqItems = [
    {
      question: "What is an LLP?",
      answer: "An LLP is a hybrid business structure that combines the features of both a partnership and a company, offering the benefits of limited liability to its partners."
    },
    {
      question: "What is the minimum number of partners required to form an LLP?",
      answer: "A minimum of two partners is required to form an LLP, with no maximum limit."
    },
    {
      question: "Can foreign nationals or NRIs become partners in an LLP?",
      answer: "Yes, foreign nationals and NRIs can become partners in an LLP, provided they have valid documents and meet the residency requirements."
    },
    {
      question: "What are the requirements for a designated partner in an LLP?",
      answer: "An LLP must have at least two designated partners, and at least one of them must be an Indian resident."
    },
    {
      question: "What is the difference between an LLP and a Private Limited Company?",
      answer: "An LLP offers more flexibility in management, fewer compliance requirements, and limited liability, whereas a Private Limited Company has stricter regulations and greater separation between ownership and management."
    },
    {
      question: "Is there a requirement for minimum capital to start an LLP?",
      answer: "No, there is no minimum capital requirement for incorporating an LLP in India. Partners can contribute any amount agreed upon."
    },
    {
      question: "Can an existing partnership firm be converted into an LLP?",
      answer: "Yes, a partnership firm can be converted into an LLP by following the conversion process as per the LLP Act."
    },
    {
      question: "What documents are required for LLP incorporation?",
      answer: "Documents like PAN card, address proof, residence proof, and registered office proof of partners are required."
    },
    {
      question: "What is the validity of the LLP agreement?",
      answer: "The LLP agreement outlines the roles and responsibilities of partners and must be filed with the Registrar within 30 days of incorporation."
    },
    {
      question: "How long does it take to register an LLP in India?",
      answer: "The registration process typically takes 10-15 working days, depending on the accuracy of documentation and approvals from the Ministry of Corporate Affairs (MCA)."
    }
  ];

  const handleGetStarted = async (pkg) => {
    try {
      console.log('💳 Initiating payment for LLP:', pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', 'llp');
      localStorage.setItem('selectedRegistrationTitle', 'Limited Liability Partnership Registration');

      // Initiate payment
      const result = await initPayment({
        name: `LLP - ${pkg.name}`,
        price: pkg.price,
        priceValue: pkg.priceValue,
        ...pkg
      });

      if (result.success && result.redirect) {
        console.log('✅ Payment successful! Redirecting to form...');
        navigate('/llp-form');
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error.message !== 'Payment cancelled') {
        alert(`Payment failed: ${error.message || 'Please try again'}`);
      }
    }
  };

  const handleContinue = () => {
    // Navigate to LLP form page
    navigate("/llp-form");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "packages":
        return (
          <PackagesSection
            packages={packages}
            onGetStarted={handleGetStarted}
          />
        );

      case "process":
        return <ProcessSection processSteps={processSteps} />;

      case "documents":
        return <DocumentsSection documents={documents} illustration={documentsIllustration} />;

      case "prerequisites":
        return <PrerequisitesSection prerequisites={prerequisites} />;

      case "about":
        return (
          <AboutSection
            building={building}
            aboutSections={aboutSections}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            introTitle="About Limited Liability Partnership"
            introDescription="Limited Liability Partnership (LLP) is a modern and beneficial business structure that combines the advantages of a partnership with the security of limited liability. It offers entrepreneurs a flexible platform to collaborate and innovate with confidence."
          />
        );

      case "faq":
        return <FAQSection faqs={faqItems} />;

      default:
        return null;
    }
  };

  // Check if current tab is in the flow steps
  const isInFlowStep = flowSteps.includes(activeTab);
  // Don't show navigation buttons on FAQ tab (removed Continue button)
  const showNavigationButtons = isInFlow && isInFlowStep && activeTab !== "faq";
  
  // Show Continue button only on FAQ, Next on all other flow steps
  const isLastStep = activeTab === "faq";

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

        {/* Tabs - show always so users know where they are */}
        <TopTabs
          tabs={visibleTabs}
          activeTab={activeTab}
          onChange={(id) => {
            // Only allow tab changes if not in flow, or if clicking on a flow step
            if (!isInFlow || flowSteps.includes(id) || id === "faq") {
              setActiveTab(id);
            }
          }}
          disabled={isInFlow}
        />
        {renderTabContent()}
        {showNavigationButtons && (
          <div className=" mt-8 px-8  mb-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-[#00486D] text-[#00486D] rounded-lg font-semibold transition-all duration-300 hover:bg-[#00486D] hover:text-white cursor-pointer"
              >
                Back
              </button>
              {isLastStep ? (
                <button
                  onClick={handleContinue}
                  className="px-6 py-2 bg-[#00486D] text-white rounded-lg font-semibold transition-all duration-300 hover:bg-[#01334C] cursor-pointer"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#00486D] text-white rounded-lg font-semibold transition-all duration-300 hover:bg-[#01334C] cursor-pointer"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LLPDetails;

