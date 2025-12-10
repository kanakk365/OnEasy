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

function PublicLimitedDetails() {
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
      id: "what-is-public-limited",
      title: "What is a Public Limited Company?",
      content: "Public Limited Companies are governed by strict regulatory and reporting standards, outlined in India's Companies Act of 2013. The minimum requirement is seven shareholders, with no maximum limit. Day-to-day management is handled by an executive team, while the company's ownership rests with the shareholders. Shareholders have voting rights, including electing the board of directors, who in turn appoint the executive team to manage operations.\n\nA Public Limited Company allows the general public to own shares through stock exchange trading. These shares can be bought and sold by a diverse group of investors. This structure enables wider investment and ownership across varied backgrounds.\n\nOnEasy makes Public Limited Company registration in India simple and efficient. Our end-to-end services cover everything from registration to compliance management, ensuring a seamless setup process for your business.\n\nStart your Public Limited Company registration with OnEasy today!"
    },
    {
      id: "key-characteristics",
      title: "Key Characteristics of a Public Limited Company",
      content: [
        {
          title: "Board of Directors",
          description: "A Public Limited Company must have at least three directors, with no upper limit. The board oversees the company's governance and strategic decisions."
        },
        {
          title: "Company Name",
          description: "The word \"Limited\" must be part of the company name, indicating it's a public entity, open to stock market trading and public investment."
        },
        {
          title: "Prospectus",
          description: "Public companies must issue a prospectus detailing operations and financials, providing potential investors with critical insights."
        },
        {
          title: "Paid-Up Capital",
          description: "There's no minimum capital requirement for registration, offering flexibility to companies in structuring their finances."
        }
      ]
    },
    {
      id: "types",
      title: "Types of Public Limited Company",
      content: [
        {
          title: "Listed Company",
          description: "Shares are actively traded on stock exchanges, providing greater liquidity and exposure to a wide range of investors."
        },
        {
          title: "Unlisted Company",
          description: "Shares are not publicly traded, offering fewer transfer restrictions but less public scrutiny."
        }
      ]
    },
    {
      id: "advantages",
      title: "Advantages of Public Limited Company Registration",
      content: [
        {
          title: "Access to Capital",
          description: "Raise funds through public share offerings, providing significant capital for growth."
        },
        {
          title: "Financial Flexibility",
          description: "Public companies can utilize diverse financial options, backed by investor confidence."
        },
        {
          title: "Limited Liability",
          description: "Shareholders' liability is limited to their investment."
        },
        {
          title: "Growth Opportunities",
          description: "Public listing can drive expansion by attracting more funds and improving operational efficiency."
        },
        {
          title: "Flexible Shareholding",
          description: "No limit on the number of shareholders."
        },
        {
          title: "Easy Share Trading",
          description: "Shares can be easily traded, attracting more investors and offering liquidity to shareholders."
        }
      ]
    },
    {
      id: "registration-procedure",
      title: "Public Limited Company Registration Procedure",
      content: [
        {
          title: "Check Company Name Availability",
          description: "Ensure the name is available and compliant with trademark laws."
        },
        {
          title: "File SPICe+ Form",
          description: "Complete and submit this comprehensive form along with MOA and AOA."
        },
        {
          title: "Certificate of Incorporation",
          description: "Once approved, the ROC will issue this legal certificate with your Corporate Identification Number (CIN)."
        },
        {
          title: "Apply for PAN and TAN",
          description: "Essential for tax-related transactions."
        },
        {
          title: "Open a Company Bank Account",
          description: "Use the incorporation certificate and other relevant documents."
        }
      ]
    },
    {
      id: "additional-steps",
      title: "Additional Steps",
      content: "You may also need to register for GST, obtain an import/export code, or secure industry-specific licenses based on your business nature."
    },
    {
      id: "oneasy-help",
      title: "Register Your Company with Oneasy",
      content: "At OnEasy, we provide expert guidance to ensure a smooth and compliant registration process for your Public Limited Company. We handle all documentation, including DSC, DIN, MOA, and AOA, making it easier for you to focus on business growth while we manage the legal formalities.\n\nGet started with OnEasy today and establish your Public Limited Company with ease!"
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
        "Name Reservation",
        "PF and ESIC Registration"
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
        "CA Consultation for 30 Minutes",
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
      title: "Check Company Name Availability",
      description: "Ensure the name is available and compliant with trademark laws."
    },
    {
      step: 2,
      title: "File SPICe+ Form",
      description: "Complete and submit this comprehensive form along with MOA and AOA."
    },
    {
      step: 3,
      title: "Certificate of Incorporation",
      description: "Once approved, the ROC will issue this legal certificate with your Corporate Identification Number (CIN)."
    },
    {
      step: 4,
      title: "Apply for PAN and TAN",
      description: "Essential for tax-related transactions."
    },
    {
      step: 5,
      title: "Open a Company Bank Account",
      description: "Use the incorporation certificate and other relevant documents."
    }
  ];

  const prerequisites = [
    "Minimum Shareholders: At least seven, with no maximum limit.",
    "Board of Directors: Minimum of three directors.",
    "Authorized Share Capital: Minimum of Rs. 1 lakh.",
    "Company Name: Must be unique and compliant with the Companies Act."
  ];

  const documents = [
    "PAN Card of all Directors",
    "Aadhaar Card of all Directors",
    "Passport (only for Foreign Nationals)",
    "Bank Statement of all Directors (Recent)",
    "Photograph of all the Directors",
    "Rental Agreement and NOC (Company)",
    "Latest utility bill of the Company (Electricity Bill)"
  ];

  const faqItems = [
    {
      question: "What is a Public Limited Company?",
      answer: "A Public Limited Company (PLC) is a corporate entity that allows shares to be publicly traded on stock exchanges. It has a minimum of 7 shareholders and 3 directors, with no maximum limit on the number of shareholders."
    },
    {
      question: "What is the minimum number of shareholders required for a Public Limited Company?",
      answer: "A minimum of 7 shareholders is required to incorporate a Public Limited Company in India, and there is no upper limit on the number of shareholders."
    },
    {
      question: "What is the minimum number of directors required for a Public Limited Company?",
      answer: "A Public Limited Company must have at least 3 directors."
    },
    {
      question: "Is there a minimum capital requirement for incorporating a Public Limited Company?",
      answer: "The Companies Act does not mandate a minimum paid-up capital for registration, but most PLCs start with a minimum authorized share capital of Rs. 1 lakh."
    },
    {
      question: "Can a Public Limited Company raise funds from the public?",
      answer: "Yes, one of the key features of a Public Limited Company is its ability to raise funds from the general public by offering shares on stock exchanges."
    },
    {
      question: "What documents are needed to incorporate a Public Limited Company?",
      answer: "Documents required include identity and address proof for all directors and the company's office address proof."
    },
    {
      question: "What is the procedure to incorporate a Public Limited Company?",
      answer: "The procedure includes checking name availability, filing the SPICe+ form along with MOA and AOA, obtaining the Certificate of Incorporation, and then applying for PAN and TAN."
    },
    {
      question: "What are the advantages of incorporating a Public Limited Company?",
      answer: "Advantages include easier access to capital through public share offerings, limited liability for shareholders, enhanced growth opportunities, and greater transparency due to regulatory requirements."
    },
    {
      question: "What is the difference between a listed and unlisted Public Limited Company?",
      answer: "A listed Public Limited Company trades its shares on stock exchanges, allowing greater liquidity and public investment, while an unlisted company does not trade its shares publicly and is subject to fewer regulatory requirements."
    },
    {
      question: "What regulatory requirements must a Public Limited Company comply with?",
      answer: "Public Limited Companies must adhere to stricter regulations under the Companies Act, 2013, including filing annual returns, preparing a prospectus, and maintaining transparency with shareholders and regulators."
    }
  ];

  const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);

  const handleGetStarted = async (pkg) => {
    try {
      console.log('💳 Initiating payment for Public Limited Company:', pkg);

      // Store registration type and package in localStorage
      localStorage.setItem('selectedRegistrationType', 'public-limited');
      localStorage.setItem('selectedRegistrationTitle', 'Public Limited Company Registration');

      // Initiate payment
      const result = await initPayment({
        name: `Public Limited - ${pkg.name}`,
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
        navigate('/public-limited-form');
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
    // Navigate to Public Limited form page
    navigate("/public-limited-form");
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
            introTitle="About Public Limited Company"
            introDescription="In India, a Public Limited Company (PLC) is ideal for entrepreneurs aiming for large-scale business operations. Unlike private companies, PLCs can raise capital from the general public by offering shares on stock exchanges, allowing broader access to funds for growth. A Public Limited Company enjoys corporate entity benefits along with the feature of limited liability. This corporate structure is ideal for larger businesses looking to raise substantial funds and enhance their market presence."
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
            onClick={() => navigate('/registrations/public-limited')}
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

export default PublicLimitedDetails;

