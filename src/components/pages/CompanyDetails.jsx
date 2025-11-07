import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useParams } from "react-router-dom";
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
import PrivateLimitedForm from "../forms/PrivateLimitedForm";
import { getMyRegistrations } from "../../utils/privateLimitedApi";

function CompanyDetails() {
  // const { type } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("packages");
  const [expandedSection, setExpandedSection] = useState("");
  const [hidePackagesTab, setHidePackagesTab] = useState(false);
  const [isInFlow, setIsInFlow] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Listen for payment success event
  useEffect(() => {
    const handlePaymentSuccess = (event) => {
      const { packageData } = event.detail;
      setSelectedPackage(packageData);
      setShowForm(true);
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    
    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
    };
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

  const handleContinue = () => {
    // Navigate to company form page
    navigate("/company-form");
  };

  const aboutSections = [
    {
      id: "key-features",
      title: "Key Features and Benefits of a Private Limited Company",
      content: [
        {
          title: "Limited Liability",
          description:
            "Shareholders are only liable for the company's debts to the extent of their shareholding.",
        },
        {
          title: "Separate Legal Entity",
          description:
            "The company has a distinct identity from its shareholders and directors.",
        },
        {
          title: "Perpetual Succession",
          description:
            "The company's existence remains unaffected by changes in ownership or the death of shareholders.",
        },
        {
          title: "Transfer of Shares",
          description:
            "Shares of a Private Limited Company can be easily transferred between individuals.",
        },
        {
          title: "Compliance and Transparency",
          description:
            "It operates under strict regulatory oversight, enhancing transparency and credibility.",
        },
        {
          title: "Ease of Raising Funds",
          description:
            "Private Limited Companies can attract investors and raise funds more easily compared to other business structures.",
        },
        {
          title: "Tax Advantages",
          description:
            "Various tax benefits are available, making it a tax-efficient business model.",
        },
        {
          title: "Ownership Flexibility",
          description:
            "Both individuals and entities can become shareholders in a Private Limited Company.",
        },
        {
          title: "Employee Benefits",
          description:
            "The structure enables ESOPs (Employee Stock Ownership Plans), attracting top talent.",
        },
        {
          title: "Growth Potential",
          description:
            "Private Limited Companies are ideal for scaling businesses and attracting venture capital or private equity.",
        },
      ],
    },
    {
      id: "registration",
      title: "Private Limited Company Registration in India",
      content:
        "Starting a business in India often involves choosing a private limited company as the preferred business structure. This option provides limited liability protection for shareholders while maintaining specific ownership restrictions. Unlike an LLP where partners manage the business, a private limited company separates the roles of directors and shareholders.\n\nAt Oneasy, we offer cost-effective solutions for Private Limited Company registration, managing all legal formalities, and ensuring compliance with the Ministry of Corporate Affairs (MCA) regulations.",
    },
    {
      id: "what-is",
      title: "What is a Private Limited Company?",
      content: {
        introduction:
          "A Private Limited Company in India is a privately held entity with limited liability. It is one of the most popular business structures due to the following advantages:",
        points: [
          {
            title: "Limited Liability Protection",
            description:
              "Shareholders are only liable for the amount of their shareholding, safeguarding personal assets from company liabilities",
          },
          {
            title: "Separate Legal Entity",
            description:
              "The company is considered a distinct legal entity, allowing it to own property, enter contracts, and initiate legal actions under its name",
          },
          {
            title: "Minimum Shareholders",
            description:
              "A minimum of two shareholders is required, with a maximum of 200",
          },
          {
            title: "Minimum Directors",
            description:
              "At least two directors are needed, with one being a resident Indian",
          },
          {
            title: "Minimum Capital",
            description:
              "The company must have a minimum paid-up capital of ₹1 lakh",
          },
          {
            title: "Company Name",
            description: 'The name must end with "Private Limited."',
          },
          {
            title: "Restricted Share Transfer",
            description:
              "Shares can only be transferred with approval from the Board of Directors",
          },
          {
            title: "No Public Invitation",
            description:
              "The company cannot invite the public to subscribe to its shares or debentures",
          },
          {
            title: "Compliance Requirements",
            description:
              "Proper financial records must be maintained, annual general meetings must be held, and annual returns must be filed with the ROC",
          },
        ],
      },
    },
    {
      id: "types",
      title: "Types of Private Limited Companies",
      content: [
        {
          title: "Company Limited by Shares",
          description:
            "Shareholders' liability is limited to the amount mentioned in the Memorandum of Association",
        },
        {
          title: "Company Limited by Guarantee",
          description:
            "Member liability is based on the guarantee specified in the Memorandum of Association",
        },
        {
          title: "Unlimited Companies",
          description:
            "Members have unlimited personal liability for the company's debts",
        },
      ],
    },
    {
      id: "advantages",
      title: "Advantages of a Private Limited Company",
      content: [
        {
          title: "Limited Liability",
          description:
            "Shareholders' personal assets are protected from the company's financial liabilities",
        },
        {
          title: "Distinct Legal Identity",
          description:
            "The company has its own legal identity, separate from its owners",
        },
        {
          title: "Continuity",
          description:
            "The company remains operational regardless of changes in shareholders or directors",
        },
        {
          title: "Ease of Fundraising",
          description:
            "Private limited companies can raise capital through shares from investors or venture capitalists",
        },
        {
          title: "Tax Benefits",
          description: "Certain tax benefits and exemptions are available",
        },
        {
          title: "Credibility",
          description:
            'The "Private Limited" title adds credibility to the business',
        },
      ],
    },
    {
      id: "disadvantages",
      title: "Disadvantages of a Private Limited Company",
      content: [
        {
          title: "Compliance Burden",
          description: "Regulatory filings and audits can be time-consuming",
        },
        {
          title: "Complex Setup",
          description:
            "Registration and management costs are higher than simpler business structures",
        },
        {
          title: "Restricted Share Transfer",
          description: "Shares can't be easily transferred without approval",
        },
        {
          title: "Public Disclosure",
          description: "Financial information is publicly available",
        },
        {
          title: "Complex Exit",
          description:
            "Exiting the company can be complicated compared to other business structures",
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
  // Show tabs even when in flow so users know where they are
  const visibleTabs = hidePackagesTab || isInFlow
    ? tabs.filter((tab) => tab.id !== "packages")
    : tabs;

  const packages = [
    {
      name: "Starter",
      price: "12,999",
      priceValue: 12999,
      period: "Month",
      description: "For solo entrepreneurs",
      icon: "★",
      originalPrice: "18,999",
      features: [
        "2% 3rd-party payment providers",
        "Inventory tracking (7 markets)",
        "24/7 chat support",
        "Standard global selling (7 markets)",
        "Limited staff accounts",
      ],
      color: "red",
    },
    {
      name: "Growth",
      price: "16,999",
      priceValue: 16999,
      period: "Month",
      description: "As your business scales",
      icon: "✢",
      originalPrice: "24,999",
      features: [
        "1.9% 3rd-party payment providers",
        "Inventory tracking (15 markets)",
        "24/7 chat & phone support",
        "Advanced global selling (15 markets)",
        "Up to 15 staff accounts",
      ],
      color: "red",
    },
    {
      name: "Pro",
      price: "25,499",
      priceValue: 25499,
      period: "Month",
      description: "For more complex businesses",
      icon: "✤",
      originalPrice: "34,999",
      features: [
        "Competitive rates for high-volume merchants",
        "Custom reports and analytics",
        "Priority 24/7 phone support",
        "Unlimited global selling (20 markets)",
        "Unlimited staff accounts",
      ],
      isHighlighted: true,
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Obtain a Digital Signature Certificate (DSC)",
      description: "For each director and shareholder",
    },
    {
      step: 2,
      title: "Obtain a Director Identification Number (DIN)",
      description: "",
    },
    {
      step: 3,
      title: "Reserve the company name",
      description: "By filing the SPICe+ Part A form",
    },
    {
      step: 4,
      title: "Submit company details",
      description:
        "Via the SPICe+ Part B form, including capital structure, registered office address, and director information",
    },
    {
      step: 5,
      title: "Draft and submit the MOA and AOA",
      description:
        "Memorandum of Association (MOA) and Articles of Association (AOA)",
    },
    {
      step: 6,
      title: "File the AGILE-PRO-S form",
      description:
        "To register for GST, EPFO, ESIC, and other necessary licenses",
    },
  ];

  const prerequisites = [
    "A minimum of two Directors is required, with at least one being a Resident Indian citizen.",
    "A maximum of 15 Directors is permitted.",
    "A minimum of 2 members and a maximum of 200 shareholders (members) are allowed.",
    "There is no minimum paid-up capital requirement, but the authorized capital must be at least Rs. 1 lakh.",
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
                const result = await initPayment(selectedPackage);
                
                // If payment successful and needs redirect
                if (result.success && result.redirect) {
                  console.log('✅ Payment successful! Redirecting to form...');
                  
                  // Navigate immediately without alert
                  navigate('/private-limited-form');
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
        return <DocumentsSection illustration={documentsIllustration} />;

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
        return <FAQSection />;

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

  // Show form after successful payment
  if (showForm && selectedPackage) {
    return (
      <PrivateLimitedForm
        packageDetails={selectedPackage}
        onClose={() => {
          setShowForm(false);
          setSelectedPackage(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Registrations Button - Top Right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/private-limited-dashboard')}
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

export default CompanyDetails;
