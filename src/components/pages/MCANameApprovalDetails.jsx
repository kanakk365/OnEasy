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
import PaymentSuccessPopup from "../common/PaymentSuccessPopup";
import { initPayment } from "../../utils/payment";

function MCANameApprovalDetails() {
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
      id: "company-name-search",
      title: "Company Name Search Process",
      content: "A company name search ensures the proposed name is unique and not already registered with the Ministry of Corporate Affairs (MCA). It checks for compliance with legal requirements, prevents infringement on existing trademarks, and avoids misleading similarities with other business names.\n\nThis step is vital to avoid legal disputes, safeguard your brand identity, and lay a strong foundation for your business in a competitive marketplace.\n\nAt OnEasy, we recognize the significance of this step and offer expert guidance in helping you select your company's unique name. We also help you to check the availability of your desired company name under the MCA, ensuring it's unique and not already registered. Verifying name availability is an essential part of the registration process, helping you secure a distinctive and legally compliant name from the start."
    },
    {
      id: "why-crucial",
      title: "Why Company Name Search is Crucial",
      content: [
        {
          title: "Legal Compliance",
          description: "Ensures your chosen name adheres to MCA regulations, avoiding names that are restricted by law."
        },
        {
          title: "Uniqueness",
          description: "Confirms your name isn't too similar to existing businesses or trademarks, helping you stand out."
        },
        {
          title: "Avoiding Infringement",
          description: "Protects your business from potential legal issues by preventing trademark violations."
        },
        {
          title: "Brand Image",
          description: "A unique and legally compliant name builds trust and credibility with customers and stakeholders."
        },
        {
          title: "Market Positioning",
          description: "A carefully chosen, verified name reflects your company's values and aids in strategic branding."
        },
        {
          title: "Future-proofing",
          description: "Ensures the name remains suitable as your business expands."
        },
        {
          title: "Digital Presence",
          description: "A unique name makes it easier to secure a matching domain, supporting your online presence."
        }
      ]
    },
    {
      id: "regulations",
      title: "Regulations for Company Names in India",
      content: [
        {
          title: "Uniqueness",
          description: "The name must be distinct from existing companies and not infringe on trademarks."
        },
        {
          title: "Restricted Names",
          description: "Avoid names that are offensive, misleading, or prohibited by law."
        },
        {
          title: "Approval",
          description: "The Registrar of Companies (ROC) approves company names, ensuring they meet legal standards."
        }
      ]
    },
    {
      id: "naming-guidelines",
      title: "Naming Guidelines for Different Business Entities",
      content: [
        {
          title: "Private Limited Companies",
          description: "Must end with \"Private Limited.\""
        },
        {
          title: "One Person Companies (OPC)",
          description: "Must include \"OPC Private Limited.\""
        },
        {
          title: "LLPs",
          description: "Should end with \"LLP.\""
        },
        {
          title: "Section 8 Companies",
          description: "Often use terms like \"Trust\" or \"Council.\""
        },
        {
          title: "Public Limited Companies",
          description: "Must end with \"Limited.\""
        },
        {
          title: "Producer Companies",
          description: "Must include \"Producer Company Limited.\""
        }
      ]
    },
    {
      id: "naming-donts",
      title: "Naming Don'ts",
      content: [
        {
          title: "No Misleading Terms",
          description: "Ensure the name reflects your business accurately."
        },
        {
          title: "No Government Links",
          description: "Don't imply government affiliation without permission."
        },
        {
          title: "No Illegal Associations",
          description: "Avoid names that suggest illegal activities."
        },
        {
          title: "No Trademark Infringements",
          description: "Respect existing names and intellectual property rights."
        }
      ]
    },
    {
      id: "tips",
      title: "Tips for Choosing a Great Company Name",
      content: [
        {
          title: "Check Availability",
          description: "Check and ensure your name is available."
        },
        {
          title: "Domain Name",
          description: "Ensure the name is also available as a domain."
        },
        {
          title: "Memorable",
          description: "Choose a name that's easy to recall and pronounce."
        },
        {
          title: "Industry Relevance",
          description: "Pick a name that resonates with your sector."
        },
        {
          title: "Audience Appeal",
          description: "Ensure the name speaks to your target audience."
        },
        {
          title: "Legal Compliance",
          description: "Make sure the name adheres to all legal standards."
        },
        {
          title: "Cultural Sensitivity",
          description: "Ensure the name is appropriate for your market."
        }
      ]
    },
    {
      id: "mca-approval",
      title: "Getting MCA Approval",
      content: "Securing MCA approval is a key part of the process. The MCA reviews your name to ensure that it is unique, legally compliant, and meets the requirements of the Companies Act 2013."
    },
    {
      id: "oneasy-simplify",
      title: "Simplify Your Company Name Selection with OnEasy",
      content: "At OnEasy, we simplify the name selection and registration process. We ensure your chosen name is unique, legally compliant, and ready for MCA approval. Let us guide you in creating a name that captures your brand's essence and complies with all regulations.\n\nContact OnEasy today to confidently start your business journey!"
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

  // Package - Only one package for MCA Name Approval
  const packages = [
    {
      name: "Starter",
      price: "1,499",
      priceValue: 1499,
      period: "One Time",
      description: "Get your company name approved",
      icon: "★",
      features: [
        "Guidance of choosing a name",
        "Assistance in registering the name",
        "Name approval certificate"
      ],
      color: "blue",
      isHighlighted: true,
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Choose Your Name",
      description: "Select a unique and compliant name for your company following MCA guidelines."
    },
    {
      step: 2,
      title: "Name Search & Verification",
      description: "We check the availability of your proposed name with MCA and verify it meets all legal requirements."
    },
    {
      step: 3,
      title: "Get Name Approval",
      description: "Submit the application and receive your MCA name approval certificate."
    }
  ];

  const prerequisites = [
    "Unique Name.",
    "Reason for selecting such name.",
    "Objective of the Entity to be incorporated."
  ];

  const documents = [
    "Objective of the entity",
    "A Unique Name"
  ];

  const faqItems = [
    {
      question: "What is MCA Name Approval?",
      answer: "MCA Name Approval is the process where the Ministry of Corporate Affairs (MCA) verifies and approves the proposed name for a company to ensure it is unique and complies with legal regulations."
    },
    {
      question: "How do I check if a company name is available?",
      answer: "You can check the availability of your desired company name using the MCA's name search tool. This tool allows you to verify if the name is already registered or similar to an existing company."
    },
    {
      question: "What are the key criteria for MCA name approval?",
      answer: "The proposed name must:\n\n• Be unique and not identical or deceptively similar to any existing company or trademark.\n• Comply with the Companies Act 2013 and other relevant regulations.\n• Not contain any prohibited or restricted words (e.g., names suggesting government affiliation without permission)."
    },
    {
      question: "Can I reserve a company name before registering my business?",
      answer: "Yes, you can reserve a company name using the MCA SPICe+ (Simplified Proforma for Incorporating Company Electronically Plus) form, which allows you to apply for name approval before proceeding with company incorporation."
    },
    {
      question: "How long does it take to get MCA name approval?",
      answer: "The MCA typically takes 2 to 3 working days to process the name approval request, but it may take longer if the proposed name requires additional scrutiny."
    },
    {
      question: "What happens if my proposed name is rejected?",
      answer: "If your name is rejected, you will receive a reason for the rejection. You can reapply with a different name or make necessary modifications to comply with the MCA's guidelines."
    },
    {
      question: "Are there restrictions on certain words or phrases in a company name?",
      answer: "Yes, certain words or phrases are restricted or prohibited, such as names implying government affiliation, offensive terms, or words that violate public norms. Approval may require special permissions for certain words."
    },
    {
      question: "How many name options can I propose for approval?",
      answer: "When applying through the SPICe+ form, you can propose up to two name options for approval. If the first name is rejected, the MCA will consider the second option."
    },
    {
      question: "Can I modify an approved name before completing the registration?",
      answer: "Yes, if you want to modify the approved name before company incorporation, you can submit a fresh name approval request. However, the original approval will no longer be valid."
    },
    {
      question: "Is MCA name approval permanent?",
      answer: "No, MCA name approval is valid for 20 days from the date of approval for new companies. You must complete the company registration process within this period to secure the name. If you fail to do so, the name will become available for others to register."
    }
  ];

  const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);

  const handleGetStarted = async (pkg) => {
    try {
      console.log('💳 Initiating payment for MCA Name Approval:', pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', 'mca-name-approval');
      localStorage.setItem('selectedRegistrationTitle', 'MCA Name Approval');

      // Initiate payment
      const result = await initPayment({
        name: `MCA Name Approval - ${pkg.name}`,
        price: pkg.price,
        priceValue: pkg.priceValue,
        ...pkg
      });

      if (result.success) {
        if (result.showPopup) {
          console.log('✅ Payment successful! Showing popup...');
          setShowPaymentPopup(true);
        } else if (result.redirect) {
        console.log('✅ Payment successful! Redirecting to form...');
        // For MCA name approval, we might want to redirect to a specific form or dashboard
        navigate('/mca-name-approval-form');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error.message !== 'Payment cancelled') {
        alert(`Payment failed: ${error.message || 'Please try again'}`);
      }
    }
  };

  const handleContinue = () => {
    // Navigate to MCA name approval form page
    navigate("/mca-name-approval-form");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "packages":
        return (
          <div>
            <PackagesSection
              packages={packages}
              onGetStarted={handleGetStarted}
            />
          </div>
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
            introTitle="About MCA Name Approval"
            introDescription="Choosing the right name is a critical first step when starting a business in India. It represents the essence of your brand and can greatly impact how potential customers perceive and engage with your business. A unique and memorable name helps create a strong identity and boost visibility. Moreover, securing your company name is the foundation of the company registration process."
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
            onClick={() => navigate('/registrations/mca-name-approval')}
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
      <PaymentSuccessPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
      />
    </div>
  );
}

export default MCANameApprovalDetails;

