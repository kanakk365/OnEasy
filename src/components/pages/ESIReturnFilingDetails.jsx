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

function ESIReturnFilingDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const { packages, loading: packagesLoading } = usePackages('esi-return-filing');

  const processSteps = [
    { step: 1, title: 'Data Collection', description: 'Collect employee ESIC contribution data.' },
    { step: 2, title: 'Statement Preparation', description: 'Prepare monthly ESIC statements.' },
    { step: 3, title: 'Filing & Payment', description: 'File returns and make ESIC payments.' }
  ];

  const documents = [
    'Attendance register',
    'Form 6',
    'Register of wages',
    'Accident register',
    'Cancelled cheque of the company',
    'Inspection book',
    'PAN card of the organization',
    'Monthly challans and returns for ESI'
  ];

  const prerequisites = [
    {
      title: 'ESI Registration Certificate',
      description: 'Ensure your organization is registered under the ESI Act and has the registration certificate.'
    },
    {
      title: 'Employee Details',
      description: 'Maintain an updated list of all employees covered under ESI, including their personal and employment information.'
    },
    {
      title: 'Monthly Contribution Records',
      description: 'Keep accurate records of monthly contributions for both employees and employers.'
    },
    {
      title: 'Salary and Wage Details',
      description: 'Document the salary and wage details of employees to calculate ESI contributions accurately.'
    },
    {
      title: 'Challan for Payment',
      description: 'Prepare the ESI payment challan for the contributions due for the relevant period.'
    },
    {
      title: 'Form 6',
      description: 'Ensure that Form 6, which is the ESI return form, is accurately filled out with all required information.'
    },
    {
      title: 'KYC Documents',
      description: 'Collect and maintain employees\' KYC documents, such as Aadhaar and bank details.'
    },
    {
      title: 'Compliance with ESI Regulations',
      description: 'Familiarize yourself with the latest ESI regulations and ensure that all filings comply with legal requirements.'
    },
    {
      title: 'Audit Reports',
      description: 'If applicable, have audit reports ready to verify compliance with ESI contributions and filings.'
    }
  ];

  const aboutSections = [
    {
      id: 'esi-return-intro',
      title: 'About ESI Return Filing',
      content: 'Employee State Insurance (ESI) registration is a vital requirement for businesses in India, ensuring that employees are protected under the ESI scheme, which offers a range of social security benefits. Once registered, employers must file ESI returns quarterly, providing details of the contributions made on behalf of each employee. These returns are essential for maintaining compliance with ESIC regulations and enabling employees to access their entitled benefits.\n\nAt OnEasy, we simplify this process for businesses, guiding you through every step of ESI registration and the return filing process, ensuring accuracy, compliance, and peace of mind for both employers and employees.'
    },
    {
      id: 'understanding-esi',
      title: 'Understanding the Employees\' State Insurance (ESI) Scheme',
      content: 'The Employees\' State Insurance (ESI) scheme is a comprehensive social security program aimed at providing financial protection and healthcare benefits to employees in unexpected situations. Funded by contributions from both employers and employees, this scheme ensures that insured workers and their families receive medical services, financial support during illness or maternity, compensation for work-related disabilities, and coverage for funeral and confinement expenses. Moreover, in the unfortunate event of an employee\'s death due to a work-related incident, ESI offers financial assistance to the deceased\'s family, underscoring the scheme\'s commitment to safeguarding employees\' socio-economic well-being.'
    },
    {
      id: 'who-needs-register',
      title: 'Who Needs to Register for the ESI Scheme?',
      content: 'The ESI scheme, overseen by the Employees\' State Insurance Corporation (ESIC) and regulated by the Ministry of Labour and Employment in India, requires contributions from both employers and employees, amounting to 4% of an employee\'s monthly gross salary. Businesses in India with a workforce of 10 or more are required to register with the ESIC within 15 days of becoming eligible.'
    },
    {
      id: 'filing-overview',
      title: 'Filing ESI Returns: An Overview',
      content: 'Employers registered under the ESI scheme must submit ESI Returns every six months, providing crucial information about the insured employees, their salaries, and contributions from both the employer and employees. These returns are critical for verifying the accuracy of contributions to the ESI scheme and ensuring employees can access the benefits they are entitled to. Understanding how to file ESI returns is essential for businesses to comply with regulations concerning employee welfare and healthcare contributions.'
    },
    {
      id: 'benefits',
      title: 'Benefits of Filing ESI Returns',
      content: 'Filing ESI Returns offers several significant advantages for both employers and employees:\n\n• Compliance: Timely filing ensures adherence to the ESI Act, helping employers avoid legal penalties and fines.\n\n• Record Keeping: Maintains an accurate official record of all contributions, useful for audits or clarifications.\n\n• Benefit Entitlement: Essential for validating employees\' entitlement to various benefits under the ESI scheme.\n\n• Transparency: Regular filings promote transparency in financial and administrative aspects, enhancing trust.\n\n• Dispute Resolution: Filed returns serve as a reliable reference for resolving discrepancies regarding contributions or benefits.\n\n• Ease of Benefit Processing: Facilitates the smooth processing of claims and benefits for employees.\n\n• Financial Health: Regular compliance reflects positively on businesses\' operational health and builds credibility with stakeholders.\n\n• Updates and Adjustments: Allows employers to correct discrepancies in employee details or contributions, ensuring records are current.'
    },
    {
      id: 'deadlines',
      title: 'ESI Return Filing Deadlines',
      content: 'Filing ESI Returns is a key responsibility under the Employees\' State Insurance (ESI) Act, submitted to the ESIC to track contributions from employers and employees.\n\nMonthly Contributions and Due Dates:\n\nEmployers must deduct a portion of their employees\' wages for ESI contributions, which must be paid to the ESIC by the 15th of the following month. For instance, the due date for the ESI monthly contribution for October 2024 is November 15, 2024. Even if there are no active employees, private limited companies and one-person companies must file a "nil return." This payment schedule aligns with the Provident Fund (PF) contribution system.\n\nAnnual and Half-Yearly Returns:\n\n• Annual Return: Filed by January 31st each year, detailing any changes in the establishment or workforce from the previous year.\n\n• Half-Yearly Contribution Returns: Submitted within 42 days after each contribution period:\n  - Contribution Period 1: Ends on September 30; due by November 11.\n  - Contribution Period 2: Ends on March 31; due by May 12.'
    },
    {
      id: 'consequences',
      title: 'Consequences of Non-Payment or Late Payment of Contributions',
      content: 'Failure to deposit the ESI contributions deducted from employees\' salaries is a serious violation. Employers are responsible for ensuring these amounts are deposited with ESI, and any failure constitutes a \'Criminal Breach of Trust,\' punishable under IPC Sections 406 and 409, as well as under ESI Act sections 85(b-g).\n\nDiscrepancies such as non-payment or delayed payments can result in penalties, including imprisonment of up to 2 years and fines of up to ₹5,000. Additionally, employers face a simple interest charge of 12% annually for each day the payment is delayed.'
    },
    {
      id: 'penalty-structure',
      title: 'Penalty Structure for Delayed or Unpaid ESI Contributions',
      content: 'The ESIC imposes damages based on the delay duration for any non-payment or delays in contributions, with maximum damages not exceeding the due contribution amount:\n\n• Delay under 2 months: 5% per annum\n\n• Delay between 2 to 4 months: 10% per annum\n\n• Delay between 4 to 6 months: 15% per annum\n\n• Delay over 6 months: 25% per annum'
    },
    {
      id: 'filing-procedure',
      title: 'Procedure to File ESI Returns for Employers',
      content: 'To file ESI returns, employers must follow these steps to ensure compliance:\n\n• Registration on ESIC Portal: Register your establishment on the ESIC portal to obtain an ESIC registration number.\n\n• Login to ESIC Portal: Access the portal using your employer code and password.\n\n• Employee Enrolment: Ensure all eligible employees are registered and their details are updated.\n\n• Download the Return Form: Obtain the \'Return of Contributions\' form from the ESIC portal.\n\n• Review Contribution Details: Check the contribution details for each employee to ensure accuracy.\n\n• Correct Discrepancies: Amend any discrepancies before submitting.\n\n• Submit the Return: File the return on the ESIC portal once all data is verified.\n\n• Acknowledgment Receipt: Save the acknowledgment receipt generated upon successful submission.\n\n• Keep Records: Maintain copies of filed returns and acknowledgment receipts for compliance audits.\n\n• Regular Updates: Update employee details, salary changes, or additions and deletions to keep records current.'
    },
    {
      id: 'how-oneasy-helps',
      title: 'How OnEasy Supports ESI Return Filing',
      content: 'OnEasy offers comprehensive assistance with ESI registration and the return filing process. Here\'s how we make the process seamless:\n\n• Document Collection: Our experts will gather all necessary data and documents for ESI return preparation tailored to your business.\n\n• Return Preparation: We will meticulously prepare your ESI return, ensuring accuracy and compliance before submitting it for your review.\n\n• Return Filing: Once you verify and approve, our dedicated professional will file the ESI return with the ESIC, ensuring compliance.\n\nWith OnEasy, you receive expert guidance and a hassle-free process, ensuring your ESI returns are accurately prepared and filed on time, meeting critical ESIC deadlines.'
    }
  ];

  const faqs = [
    {
      question: 'What is ESI, and why is it important?',
      answer: 'ESI stands for Employee State Insurance, a social security scheme that provides medical and financial benefits to employees in case of sickness, maternity, or work-related injuries. It ensures employees have access to healthcare and financial support during challenging times.'
    },
    {
      question: 'Who is required to register for ESI?',
      answer: 'All establishments with 10 or more employees earning a monthly salary of up to ₹21,000 are required to register for ESI and contribute to the scheme.'
    },
    {
      question: 'What are the key deadlines for ESI return filing?',
      answer: 'ESI returns must be filed biannually. The due dates are:\n\n• For the contribution period from April to September: by November 11\n\n• For the contribution period from October to March: by May 12'
    },
    {
      question: 'What documents are needed for ESI return filing?',
      answer: 'Essential documents include the attendance register, Form 6, wages register, accident register, cancelled cheque of the organization, and PAN card of the establishment, among others.'
    },
    {
      question: 'What happens if I miss the ESI return filing deadline?',
      answer: 'Missing the deadline can lead to penalties, which may include fines and interest on the unpaid amount. It is essential to file on time to avoid complications.'
    },
    {
      question: 'Can ESI contributions be paid online?',
      answer: 'Yes, ESI contributions can be paid online through the ESIC portal using various payment options such as net banking, credit/debit cards, or electronic funds transfer.'
    },
    {
      question: 'How can I check my ESI contribution status?',
      answer: 'Employers can check their ESI contribution status by logging into the ESIC portal using their credentials. Employees can also check their status through the ESIC website or mobile app.'
    },
    {
      question: 'What are the penalties for late payment of ESI contributions?',
      answer: 'Employers may face penalties based on the delay duration, ranging from 5% to 25% of the due contribution, depending on how late the payment is.'
    },
    {
      question: 'Is it mandatory to file a nil return if there are no employees?',
      answer: 'Yes, even if there are no employees, establishments must file a "nil return" to maintain compliance with the ESI Act.'
    },
    {
      question: 'How can OnEasy assist with ESI return filing?',
      answer: 'OnEasy offers comprehensive support for ESI registration and return filing, including document preparation, submission assistance, and ensuring compliance with all regulations, allowing businesses to focus on their core operations.'
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
                localStorage.setItem('selectedRegistrationType', 'esi-return-filing');
                localStorage.setItem('selectedRegistrationTitle', 'ESI Return Filing');
                const result = await initPayment(selectedPackage);
                if (result.success) {
                  if (result.showPopup) {
                    console.log('✅ Payment successful! Showing popup...');
                    setShowPaymentPopup(true);
                  } else if (result.redirect) {
                    console.log('✅ Payment successful! Redirecting to form...');
                    navigate('/compliance/esi-return-filing-form');
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
            introTitle="About ESI Return Filing"
            introDescription="Monthly Employee State Insurance return filing ensures compliance with ESIC regulations."
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

export default ESIReturnFilingDetails;

