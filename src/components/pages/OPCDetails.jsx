import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import building from "../../assets/building.png";
import documentsIllustration from "../../assets/OBJECTS.png";
import PackagesSection from "./company-details/PackagesSection";
import ProcessSection from "./company-details/ProcessSection";
import DocumentsSection from "./company-details/DocumentsSection";
import PrerequisitesSection from "./company-details/PrerequisitesSection";
import AboutSection from "./company-details/AboutSection";
import PaymentSuccessPopup from "../common/PaymentSuccessPopup";
import { initPayment } from "../../utils/payment";
import FAQSection from "./company-details/FAQSection";
import TopTabs from "./company-details/TopTabs";

function OPCDetails() {
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
      id: "what-is-opc",
      title: "What is a One-Person Company (OPC)?",
      content: "Introduced under the Companies Act, 2013, One-Person Company (OPC) allows a single person to establish a company, merging the advantages of sole proprietorship and company structures. This structure supports small businesses and MSMEs, allowing one person to act as both director and shareholder.\n\nAs per Section 2(62) of the Companies Act, a company can be formed with just one director and one member, who can be the same individual. OPC registration provides limited liability while promoting formal entrepreneurship."
    },
    {
      id: "eligibility",
      title: "Eligibility Criteria for OPC Registration",
      content: [
        {
          title: "Natural Person & Indian Citizen",
          description: "Only Indian citizens, not legal entities (Corporates), can establish an OPC."
        },
        {
          title: "Resident in India",
          description: "The promoter must have lived in India for at least 182 days in the previous year."
        },
        {
          title: "Authorized Capital",
          description: "Minimum authorized capital is Rs. 1,00,000."
        },
        {
          title: "Nominee Appointment",
          description: "A nominee must be appointed to take over in case of death or incapacity."
        },
        {
          title: "Business Restrictions",
          description: "OPCs cannot engage in financial activities like banking or insurance."
        },
        {
          title: "Conversion to Private Limited",
          description: "If the capital exceeds Rs. 50 lakhs or turnover crosses Rs. 2 crores, conversion to a private limited company is required."
        }
      ]
    },
    {
      id: "advantages",
      title: "Advantages of OPC",
      content: [
        {
          title: "Limited Liability",
          description: "Personal assets are protected from company liabilities."
        },
        {
          title: "Simplified Compliance",
          description: "OPCs benefit from reduced compliance obligations."
        },
        {
          title: "Perpetual Succession",
          description: "The company continues to exist even if the sole member changes."
        },
        {
          title: "Ease of Fundraising",
          description: "OPCs can raise funds from venture capitalists, investors, or banks."
        }
      ]
    },
    {
      id: "disadvantages",
      title: "Disadvantages of OPC",
      content: [
        {
          title: "Limited to Small Scale",
          description: "OPCs are best suited for small businesses."
        },
        {
          title: "Business Restrictions",
          description: "OPCs cannot engage in certain business activities like NBFCs."
        },
        {
          title: "Ownership vs. Management",
          description: "The single owner serves as both director and shareholder, blurring the lines between ownership and management."
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

  // Packages - same as Private Limited Company
  const packages = [
    {
      name: "Starter",
      price: "12,999",
      priceValue: 12999,
      period: "One Time",
      description: "Key Features",
      icon: "★",
      features: [
        "CA Assisted Incorporation",
        "Certificate of Incorporation",
        "Legal drafting of MOA and AOA",
        "PAN and TAN",
        "Digital Signatures (2 No's)",
        "Name Reservation",
        "PF and ESIC Registration",
        "MSME Registration",
        "Director Identification Number",
        "Bank account in one day",
      ],
      color: "blue",
    },
    {
      name: "Growth",
      price: "16,999",
      priceValue: 16999,
      period: "One Time",
      description: "Key Features",
      icon: "✢",
      features: [
        "CA Assisted Incorporation",
        "Certificate of Incorporation",
        "Legal drafting of MOA and AOA",
        "PAN and TAN",
        "Digital Signatures (2 No's)",
        "MSME Registration",
        "Director Identification Number",
        "Bank account in one day",
        "GST Registration",
        "Shops & Establishment Reg",
        "Post incorporation checklist",
        "Partner collaboration",
      ],
      isHighlighted: true,
      color: "blue",
    },
    {
      name: "Pro",
      price: "25,499",
      priceValue: 25499,
      period: "One Time",
      description: "Key Features",
      icon: "✤",
      features: [
        "CA Assisted Incorporation",
        "Certificate of Incorporation",
        "Legal drafting of MOA and AOA",
        "PAN and TAN",
        "Digital Signatures (2 No's)",
        "MSME Registration",
        "Director Identification Number",
        "Bank account in one day",
        "GST Registration",
        "Shops & Establishment Reg",
        "Post incorporation checklist",
        "Partner collaboration",
        "Startup India Registration",
        "CA Consultation for 30min",
        "1000+ Finance Dashboards",
        "Free GST filings for 6 months",
        "Professional Tax Registration",
        "Dedicated Account Manager",
      ],
      color: "blue",
    },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Name Reservation",
      description: "Reserve the company name through SPICe+ (Part A)."
    },
    {
      step: 2,
      title: "Prepare MOA & AOA",
      description: "Draft the Memorandum and Articles of Association."
    },
    {
      step: 3,
      title: "File Forms",
      description: "Submit the required forms and documents."
    },
    {
      step: 4,
      title: "Incorporation Certificate",
      description: "Upon approval, the Registrar issues the Certificate of Incorporation, marking the official registration of the OPC."
    },
  ];

  const prerequisites = [
    "The Sole Member must be a natural person (individual) and a resident of India.",
    "The Sole Member should be at least 18 years old.",
    "The OPC must have a nominee who will take over in case of the founder's demise or incapacity.",
    "A minimum of one Director and maximum of 15 Directors can be appointed.",
    "A minimum authorized capital of Rs. 1,00,000 is required to be raised.",
    "The proposed name for the OPC must be unique and not similar to any existing registered companies.",
    "A registered office address is necessary. It can be a residential address, provided it is suitable for receiving official communications and documents."
  ];

  const documents = [
    "PAN Card of all Directors",
    "Aadhaar Card of all Directors",
    "Bank Statement of all Directors (Recent)",
    "Photograph of all the Directors",
    "Rental Agreement and NOC (Company)",
    "Latest utility bill of the Company (Electricity Bill)",
    "A written consent from the nominee",
    "PAN card of the Nominee",
    "Aadhar Card of the Nominee"
  ];

  const faqItems = [
    {
      question: "Who is eligible to incorporate an OPC?",
      answer: "Only a natural person who is an Indian citizen and resident of India (staying for 182+ days in the preceding financial year) can form an OPC."
    },
    {
      question: "Can I form more than one OPC?",
      answer: "No, an individual can only form one OPC at a time. They cannot be a nominee in more than one OPC either."
    },
    {
      question: "What is the minimum capital required to start an OPC?",
      answer: "The minimum authorized capital to incorporate an OPC is Rs. 1,00,000."
    },
    {
      question: "Is a nominee mandatory for OPC registration?",
      answer: "Yes, appointing a nominee is mandatory during the incorporation process, as the nominee will take over in case of the owner's death or incapacity."
    },
    {
      question: "Can OPC be converted into a private limited company?",
      answer: "Yes, an OPC must be converted into a private limited company if its paid-up capital exceeds Rs. 50 lakhs or its turnover exceeds Rs. 2 crores."
    },
    {
      question: "Can an OPC engage in financial activities?",
      answer: "No, OPCs are not allowed to carry out financial activities like banking, insurance, or investments."
    },
    {
      question: "What are the compliance requirements for an OPC?",
      answer: "OPCs must file annual financial statements and returns with the Registrar of Companies, but they enjoy relaxed compliance compared to other companies."
    },
    {
      question: "How long does it take to incorporate an OPC?",
      answer: "It typically takes 5-10 working days, depending on the submission of documents and approvals from the Registrar of Companies (ROC)."
    },
    {
      question: "Can an OPC raise funds from investors?",
      answer: "Yes, OPCs can raise funds from banks, venture capitalists, or angel investors, just like private limited companies."
    },
    {
      question: "What documents are required for OPC incorporation?",
      answer: "Required documents include the DSC, DIN, MOA, AOA, proof of registered office, nominee consent, and declarations from the director and professional."
    }
  ];

  const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);

  const handleGetStarted = async (pkg) => {
    try {
      console.log('💳 Initiating payment for OPC:', pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', 'opc');
      localStorage.setItem('selectedRegistrationTitle', 'One Person Company Registration');

      // Initiate payment
      const result = await initPayment({
        name: `OPC - ${pkg.name}`,
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
        navigate('/opc-form');
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
    // Navigate to OPC form page
    navigate("/opc-form");
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
            introTitle="About One Person Company"
            introDescription="One Person Company (OPC) is a unique business structure that allows a single individual to operate as a separate legal entity. It offers limited liability protection, ensuring personal assets are shielded from business debts. OPCs are ideal for entrepreneurs seeking full control while benefiting from the advantages of a corporate structure. They require minimal compliance and can be incorporated with just one director and one nominee. This model fosters entrepreneurship and innovation by simplifying the process of starting and managing a business."
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
            onClick={() => navigate('/registrations/opc')}
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

export default OPCDetails;

