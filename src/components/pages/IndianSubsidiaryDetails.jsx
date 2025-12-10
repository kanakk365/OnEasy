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
import PaymentSuccessPopup from "../common/PaymentSuccessPopup";

function IndianSubsidiaryDetails() {
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
      id: "subsidiary-company",
      title: "Subsidiary Company",
      content: "A subsidiary company is sometimes referred to as a sister company, while the parent company or holding company exercises control over it. The parent company holds the authority to control the subsidiary either partially or entirely.\n\nThe registration process for a foreign subsidiary company in India is governed by the Companies Act of 2013. According to this act, a subsidiary company is defined as a company where a foreign corporate body or parent entity holds at least 50% of the total share capital. Essentially, the parent company exerts significant control over the subsidiary.\n\nAt OnEasy, we specialize in offering comprehensive and tailored services for incorporating a foreign subsidiary in India. Our team of experts is here to guide you through the complexities of Indian subsidiary registration, from understanding legal requirements and navigating regulatory approvals to assisting with compliance and documentation."
    },
    {
      id: "types",
      title: "Types of Subsidiaries in India",
      content: [
        {
          title: "Wholly-Owned Subsidiary",
          description: "A wholly-owned subsidiary is one where the parent company owns 100% of the subsidiary's shares. These subsidiaries can only be established in sectors that permit 100% Foreign Direct Investment (FDI)."
        },
        {
          title: "Subsidiary Company",
          description: "In this structure, the parent company owns at least 50% of the shares in the subsidiary."
        }
      ]
    },
    {
      id: "rbi-approval",
      title: "RBI Approval",
      content: "Before setting up a foreign subsidiary in India, approval from the Reserve Bank of India (RBI) is crucial. This regulatory step ensures compliance with India's foreign investment regulations and safeguards stakeholders' interests."
    },
    {
      id: "advantages",
      title: "Advantages of Indian Subsidiary Registration",
      content: [
        {
          title: "Entry into the Indian Market",
          description: "India offers a wealth of investment opportunities, attracting foreign entrepreneurs to establish subsidiaries in the country."
        },
        {
          title: "Foreign Direct Investment (FDI) in India",
          description: "FDI involves foreign companies investing in Indian private companies through share subscriptions or acquisitions."
        },
        {
          title: "Perpetual Succession",
          description: "A company's existence remains unaffected by changes in management, membership transfers, or insolvency. This ensures continuity and stability for the business."
        },
        {
          title: "Limited Liability",
          description: "The limited liability principle protects the personal assets of shareholders and directors, as the company bears responsibility for its debts."
        },
        {
          title: "Scope of Diversification",
          description: "Establishing a subsidiary allows foreign businesses to diversify their operations, contributing to the growth of the Indian economy and increasing competition."
        },
        {
          title: "Separate Legal Identity",
          description: "A subsidiary is recognized as a distinct legal entity separate from its shareholders and directors, empowering the company to engage in contracts and legal actions in its own name."
        },
        {
          title: "Property Ownership and Rental",
          description: "A subsidiary company can own or rent property in India, aligning with the principle of perpetual succession."
        }
      ]
    },
    {
      id: "regulatory-authorities",
      title: "Regulatory Authorities for Subsidiary Registration",
      content: [
        {
          title: "Ministry of Corporate Affairs (MCA)",
          description: "Governs company registration and compliance."
        },
        {
          title: "Registrar of Companies (ROC)",
          description: "Oversees the incorporation process and legal requirements."
        },
        {
          title: "Reserve Bank of India (RBI)",
          description: "Regulates foreign exchange transactions."
        }
      ]
    },
    {
      id: "taxation-compliance",
      title: "Taxation and Compliance for Subsidiaries in India",
      content: [
        {
          title: "Corporate Tax Rate",
          description: "Approximately 25.36%."
        },
        {
          title: "Goods and Services Tax (GST)",
          description: "Applies to domestic sales."
        },
        {
          title: "Annual Compliance",
          description: "Annual filings, statutory audits, and compliance with Indian regulations are required."
        }
      ]
    },
    {
      id: "registration-steps",
      title: "Steps to Register a Subsidiary Company in India",
      content: [
        {
          title: "Choose the type of subsidiary",
          description: "Choose the type of subsidiary (wholly-owned or partial)."
        },
        {
          title: "Get the subsidiary's name approved",
          description: "Get the subsidiary's name approved by the MCA."
        },
        {
          title: "Prepare MOA and AOA",
          description: "Prepare Memorandum of Association (MOA) and Articles of Association (AOA) as these legal documents outline the company's objectives, rules, and regulations."
        },
        {
          title: "Submit documents via SPICe+",
          description: "Submit all required documents via the MCA's online portal (SPICe+ form)."
        },
        {
          title: "Pay Registration Fees",
          description: "Fees are based on the company's authorized capital."
        },
        {
          title: "Obtain Certificate of Incorporation",
          description: "Once approved, the ROC issues the COI, confirming the subsidiary's registration."
        },
        {
          title: "Apply for PAN and TAN",
          description: "Apply for Permanent Account Number (PAN) and Tax Registration essential for taxation purposes."
        },
        {
          title: "Open a Bank Account",
          description: "Open a Bank Account as it is required to operate the subsidiary's business in India."
        },
        {
          title: "Obtain GST Number",
          description: "It is mandatory if the company is involved in taxable goods or services."
        }
      ]
    },
    {
      id: "compliance-requirements",
      title: "Compliance Requirements for Subsidiary Registration",
      content: [
        {
          title: "Foreign Exchange Management Act (FEMA)",
          description: "Ensures compliance with foreign exchange laws."
        },
        {
          title: "Companies Act, 2013",
          description: "Governs company formation and operations."
        },
        {
          title: "RBI Compliances",
          description: "Foreign subsidiaries must adhere to RBI guidelines."
        },
        {
          title: "Income Tax Act, 1961",
          description: "Subsidiaries must file annual income tax returns."
        }
      ]
    },
    {
      id: "how-oneasy-helps",
      title: "How OnEasy Can Help You",
      content: "Still unsure how to register a subsidiary in India?\n\nAt OnEasy, we simplify the registration process by offering complete assistance at every stage. From name selection and obtaining essential documents to opening bank accounts and ensuring compliance, we cover it all.\n\nWith OnEasy as your partner, your subsidiary can operate confidently, meeting all regulatory and compliance requirements, allowing you to focus on business growth in India."
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
        "Name Reservation",
        "PF and ESIC Registration",
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
        "Name Reservation",
        "PF and ESIC Registration",
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
      title: "Choose Subsidiary Type",
      description: "Select whether you want a wholly-owned or partial subsidiary structure based on your business needs and FDI regulations."
    },
    {
      step: 2,
      title: "Name Approval & Documentation",
      description: "Get your subsidiary name approved by MCA and prepare all required documents including MOA, AOA, and board resolutions."
    },
    {
      step: 3,
      title: "Registration & Compliance",
      description: "Submit documents via SPICe+ form, pay registration fees, obtain Certificate of Incorporation, and complete PAN, TAN, and GST registrations."
    }
  ];

  const prerequisites = [
    "Company Name.",
    "Shareholders: The parent company can own up to 100% of the shares, and Indian shareholders are not mandatory.",
    "Directors: At least two directors are required, with one being an Indian resident.",
    "Registered Address: Every company must have a registered address in India, which can be virtual if needed for communication and legal purpose.",
    "Annual General Meeting (AGM): Mandatory under the Companies Act.",
    "Bank Account: Open a bank account in the subsidiary's name for financial transactions.",
    "Power of Attorney: Authorizing an Indian representative to handle the incorporation process.",
    "Company Secretary: Required to file secretarial returns and appoint a statutory auditor."
  ];

  const documents = [
    "PAN Card of all Indian Directors",
    "PAN Card of all Indian Shareholders (if any)",
    "Passport of all Foreign Directors",
    "Passport of all Foreign Shareholders",
    "Bank Statement of all Directors (Recent)",
    "Photograph of all the Directors",
    "Rental Agreement and NOC (Company)",
    "Latest utility bill of the Company (Electricity Bill)",
    "MOA and AOA outlining the objectives",
    "Board Resolution by the Parent Company",
    "Power of Attorney"
  ];

  const faqItems = [
    {
      question: "What is an Indian subsidiary company?",
      answer: "An Indian subsidiary company is a business entity where a foreign company (parent company) holds at least 50% of the total equity shares, allowing it to control the operations of the subsidiary in India."
    },
    {
      question: "What are the types of subsidiary companies in India?",
      answer: "There are two types:\n\n• Wholly-Owned Subsidiary: The foreign parent company holds 100% of the shares.\n• Subsidiary Company: The parent company holds at least 50% of the shares."
    },
    {
      question: "Is RBI approval required for incorporating a foreign subsidiary in India?",
      answer: "Yes, RBI approval may be required, particularly in sectors where Foreign Direct Investment (FDI) is regulated or restricted."
    },
    {
      question: "How many directors are required for an Indian subsidiary?",
      answer: "A minimum of two directors is required, and at least one director must be an Indian resident."
    },
    {
      question: "Is there a minimum capital requirement for an Indian subsidiary?",
      answer: "No, there is no prescribed minimum capital requirement for incorporating a subsidiary in India."
    },
    {
      question: "Can a foreign national be a shareholder in an Indian subsidiary?",
      answer: "Yes, foreign nationals and foreign entities can be shareholders in an Indian subsidiary."
    },
    {
      question: "What documents are required for incorporating an Indian subsidiary?",
      answer: "Key documents include identity and address proofs of directors, the parent company's board resolution, Memorandum of Association (MOA), Articles of Association (AOA), and office address proof."
    },
    {
      question: "What is the time frame for incorporating a subsidiary in India?",
      answer: "The process usually takes around 10-15 working days, depending on the submission of documents and government processing times."
    },
    {
      question: "What are the annual compliance requirements for an Indian subsidiary?",
      answer: "Indian subsidiaries must file annual returns, conduct statutory audits, hold annual general meetings, and comply with income tax and GST regulations."
    },
    {
      question: "Can a foreign subsidiary repatriate profits to the parent company?",
      answer: "Yes, profits can be repatriated to the foreign parent company, subject to the fulfillment of tax and regulatory compliances."
    }
  ];

  const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);

  const handleGetStarted = async (pkg) => {
    try {
      console.log('💳 Initiating payment for Indian Subsidiary Company:', pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', 'indian-subsidiary');
      localStorage.setItem('selectedRegistrationTitle', 'Indian Subsidiary Company Registration');

      // Initiate payment
      const result = await initPayment({
        name: `Indian Subsidiary - ${pkg.name}`,
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
        navigate('/indian-subsidiary-form');
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
    // Navigate to Indian Subsidiary form page
    navigate("/indian-subsidiary-form");
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
            introTitle="About Indian Subsidiary"
            introDescription="An Indian Subsidiary is a company incorporated under Indian laws that is either wholly or partially owned by a foreign parent company. This structure allows the parent company to conduct business in India as a separate legal entity, leveraging local market insights and adhering to regulatory frameworks. Indian subsidiaries can engage in a wide range of activities, including manufacturing, services, and sales. They are required to comply with Indian regulations, such as the Companies Act and relevant foreign investment policies, ensuring legal and operational alignment within the Indian market."
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
            onClick={() => navigate('/registrations/indian-subsidiary')}
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

export default IndianSubsidiaryDetails;

