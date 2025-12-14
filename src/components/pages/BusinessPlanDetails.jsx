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

function BusinessPlanDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('business-plan');

  const processSteps = [
    {
      step: 1,
      title: 'Business Analysis',
      description: 'Analyze your business model, market, and financial requirements.'
    },
    {
      step: 2,
      title: 'Plan Drafting',
      description: 'Draft comprehensive business plan with financial projections.'
    },
    {
      step: 3,
      title: 'Review & Finalization',
      description: 'Review the plan with experts and finalize for presentation.'
    }
  ];

  const documents = [
    'Financial statements',
    'Market research',
    'Competitor analysis',
    'Sales projections',
    'Marketing strategies',
    'Organizational charts',
    'Legal documentation'
  ];

  const prerequisites = [
    {
      title: 'Executive Summary',
      description: 'Overview of the business, mission, and objectives.'
    },
    {
      title: 'Business Description',
      description: 'Type of business, industry background, and business model.'
    },
    {
      title: 'Market Research',
      description: 'Target market analysis and competitive landscape.'
    },
    {
      title: 'Marketing Strategy',
      description: 'Branding, sales strategy, and promotional plans.'
    },
    {
      title: 'Operational Plan',
      description: 'Location, facilities, production process, and supply chain.'
    },
    {
      title: 'Management and Organization',
      description: 'Organizational structure and key team profiles.'
    },
    {
      title: 'Financial Projections',
      description: 'Sales forecasts, budget, and financial statements.'
    },
    {
      title: 'Funding Requirements',
      description: 'Capital needed and potential sources.'
    },
    {
      title: 'Risk Analysis',
      description: 'Identification of risks and contingency plans.'
    },
    {
      title: 'Appendices',
      description: 'Supporting documents like resumes and market studies.'
    }
  ];

  const aboutSections = [
    {
      id: 'business-plan-intro',
      title: 'About Business Plan',
      content: 'A business plan goes beyond being a simple document—it\'s a strategic tool that lays out your company\'s objectives, charts a roadmap to reach them, and serves as a persuasive piece for potential investors and stakeholders. Whether you\'re a startup looking for initial funding or an established business planning to expand, having a detailed business plan is crucial for success.\n\nAt OnEasy, we specialize in helping businesses develop tailored, industry-standard business plans that comply with regulatory requirements and clearly outline goals, strategies, and market positioning.\n\nGet a Professionally Crafted Business Plan with OnEasy. Start Your Success Story Today!'
    },
    {
      id: 'what-is',
      title: 'What is a Business Plan?',
      content: 'A business plan is a formal document that defines your business\'s goals, strategies, market analysis, financial projections, and more. It acts as a comprehensive guide for setting internal goals, securing funding, and outlining your business model.\n\nA business plan answers critical questions like:\n\n• Where is the business now?\n\n• Where does the business want to go?\n\n• How will it get there?\n\nFor startups and established businesses alike, a well-crafted business plan aids in both short-term and long-term decision-making, ensuring that the team aligns with the company\'s goals and growth strategy.'
    },
    {
      id: 'why-important',
      title: 'Why is a Business Plan Important?',
      content: 'A business plan allows you to think through every aspect of your business, from marketing to financial projections. Here\'s why creating a business plan is essential:\n\n• Funding: Investors and banks need a detailed business plan to assess the feasibility and growth potential of your business.\n\n• Guidance: It serves as a roadmap for business owners, defining steps to achieve business goals.\n\n• Risk Mitigation: Identifies market risks early, allowing for strategy adjustments.\n\n• Performance Tracking: Sets benchmarks for evaluating business progress.\n\n• Strategic Alignment: Ensures that all departments are working toward the same objectives.'
    },
    {
      id: 'why-need',
      title: 'Why Do You Need a Business Plan?',
      content: 'A business plan acts as both a strategic guide and a financial blueprint. It provides direction, secures funding, and enables informed decision-making for scaling, marketing, and operations.\n\nHaving a business continuity plan is also critical for managing unexpected disruptions. By planning for risks, you can protect your business\'s long-term viability.'
    },
    {
      id: 'types',
      title: 'Types of Business Plans',
      content: 'Business plans can vary based on a company\'s needs, ranging from simple outlines to detailed 40-page documents. Here are some common types of business plans:\n\n• Startup Business Plan: Details the structure, goals, and operations of a new business, along with market analysis and a financial model to help investors evaluate feasibility and potential profitability.\n\n• Feasibility Plan: Focuses on assessing the market and profitability of new products or services, evaluating customer bases, and profit margins.\n\n• Expansion Plan: Outlines steps for scaling operations, covering resources, financial investment, and staffing.\n\n• Operations Plan: Details day-to-day operations necessary to meet business objectives and aligns all departments with company goals.\n\n• Strategic Plan: Sets long-term internal strategies, often using a SWOT analysis to identify strengths, weaknesses, opportunities, and threats.'
    },
    {
      id: 'key-elements',
      title: 'Key Elements of a Business Plan',
      content: 'A complete business plan covers several critical areas:\n\n• Executive Summary: A concise introduction to your business, including target market and financial status.\n\n• Company Description: Provides business structure, history, and mission statement.\n\n• Market Analysis: Research on market trends, growth potential, and target audience.\n\n• Competitive Analysis: In-depth analysis of competitors and strategies for gaining a competitive edge.\n\n• Organization and Management: Structure of your organization and key members of the management team.\n\n• Product Line or Services: Details on the products or services offered, including pricing models and product lifecycle stages.\n\n• Marketing Plan: Outlines strategies to attract and retain customers.\n\n• Funding Request: Clear and specific funding requirements and how they will enable business goals.\n\n• Financial Projections: Income statements, cash flow, and balance sheets to forecast future performance.\n\n• Appendix: Supplementary documents, such as legal permits, that add credibility to your business plan.'
    },
    {
      id: 'how-to-prepare',
      title: 'How to Prepare a Business Plan',
      content: 'To create an effective business plan:\n\n• Research: Conduct thorough research on your industry, competitors, and target market.\n\n• Outline: Create a detailed outline to cover all essential elements from executive summary to financial projections.\n\n• Draft: Write each section with clarity and precision, avoiding unnecessary jargon.\n\n• Review: Review for accuracy and completeness, ensuring alignment with your business goals.\n\nAt OnEasy, we provide expert assistance to create a business plan that stands out to investors.'
    },
    {
      id: 'continuity-plan',
      title: 'Business Continuity Plan',
      content: 'In addition to a core business plan, a continuity plan is vital. It outlines how your business will continue during unexpected disruptions, safeguarding your long-term goals.'
    },
    {
      id: 'benefits',
      title: 'Benefits of a Business Plan',
      content: 'A strong business plan:\n\n• Clarifies key business details.\n\n• Secures funding.\n\n• Demonstrates growth potential.\n\n• Tracks progress.\n\n• Aids informed decisions.'
    },
    {
      id: 'how-oneasy-helps',
      title: 'How OnEasy Can Help You',
      content: 'At OnEasy, we understand the importance of a well-structured business plan that reflects your vision and meets industry standards.\n\n• Initial Consultation: We start by understanding your business and its unique needs.\n\n• Drafting the Business Plan: We cover essential elements, including financial projections and market analysis.\n\n• Final Review and Submission: After revising, we prepare the final document ready for submission to investors or for internal use.'
    }
  ];

  const faqs = [
    {
      question: 'What is a business plan, and why do I need one?',
      answer: 'A business plan is a strategic document that outlines your business\'s objectives, strategies, market research, and financial forecasts. It serves as a roadmap for growth and is essential for attracting investors and guiding internal decision-making.'
    },
    {
      question: 'How long should a business plan be?',
      answer: 'The length of a business plan depends on the complexity and requirements of the business, but typically, a plan is between 10-40 pages. Startups might need more detailed financial projections, while established businesses may require a concise version.'
    },
    {
      question: 'What are the key elements of a business plan?',
      answer: 'A comprehensive business plan usually includes an executive summary, company description, market analysis, competitive analysis, organization and management structure, products/services offered, marketing strategy, funding requests, financial projections and an appendix.'
    },
    {
      question: 'How often should a business plan be updated?',
      answer: 'It\'s recommended to review and update your business plan at least annually, or whenever significant changes occur, like a shift in market conditions, new product launches, or when seeking funding.'
    },
    {
      question: 'How much does it cost to prepare a business plan?',
      answer: 'The cost can vary widely based on complexity and professional assistance. Basic plans may be free or low-cost if self-prepared, while expert-guided, detailed plans may require an investment but offer a higher chance of securing funding.'
    },
    {
      question: 'Who should write my business plan?',
      answer: 'You can write your business plan yourself or hire a professional. While self-preparation gives you deeper insight, a professional can help ensure it\'s tailored to attract investors and meets industry standards.'
    },
    {
      question: 'What financial projections are necessary for a business plan?',
      answer: 'Most business plans include income statements, cash flow projections, and balance sheets for at least 3-5 years. These forecasts show your business\'s financial potential and help investors assess viability.'
    },
    {
      question: 'Can a business plan help secure funding?',
      answer: 'Yes, a well-structured business plan is crucial for securing funding from investors or lenders, as it demonstrates the business\'s potential, financial health, and the owner\'s commitment to the venture.'
    },
    {
      question: 'What\'s the difference between a business plan and a business model?',
      answer: 'A business model explains how a business generates value and earns revenue, while a business plan is a comprehensive document detailing the business\'s goals, strategies, and path to achieve success.'
    },
    {
      question: 'What is a business continuity plan and is it part of a business plan?',
      answer: 'A business continuity plan focuses on how a business will continue operating during disruptions. It is not usually part of a business plan but can be added as an appendix or included in risk assessment sections.'
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
                localStorage.setItem('selectedRegistrationType', 'business-plan');
                localStorage.setItem('selectedRegistrationTitle', 'Business Plan');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/business-plan-form');
                  }
                }
              } catch (error) {
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
            introTitle="About Business Plan"
            introDescription="A comprehensive business plan is essential for startups and growing businesses."
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
        <TopTabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />
        {renderTabContent()}
      </div>
      <PaymentSuccessPopup 
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)} 
      />
    </div>
  );
}

export default BusinessPlanDetails;

