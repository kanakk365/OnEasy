import React from "react";

function FAQSection() {
  const faqs = [
    {
      question:
        "What is the minimum number of directors required to register a Private Limited Company?",
      answer:
        "A minimum of two directors is required, and at least one must be a resident Indian citizen.",
    },
    {
      question:
        "What is the maximum number of shareholders allowed in a Private Limited Company?",
      answer: "A Private Limited Company can have a maximum of 200 shareholders.",
    },
    {
      question:
        "Is there a minimum capital requirement for incorporating a Private Limited Company?",
      answer:
        "There is no minimum paid-up capital requirement, but the authorized capital must be at least Rs. 1 lakh.",
    },
    {
      question:
        "Can a foreign national be a director in a Private Limited Company in India?",
      answer:
        "Yes, a foreign national can be a director, but at least one director must be an Indian resident.",
    },
    {
      question: "How long does it take to register a Private Limited Company in India?",
      answer:
        "The registration process typically takes 10-15 business days, depending on the processing time of the MCA.",
    },
    {
      question:
        "What documents are needed for the incorporation of a Private Limited Company?",
      answer:
        "The required documents include ID proof (PAN, Aadhaar), address proof (bank statement, utility bill), and office address proof (rental agreement or sale deed, NOC from property owner).",
    },
    {
      question: "What are the compliance requirements after incorporation?",
      answer:
        "Post-registration, companies must comply with annual filings, maintain financial records, and conduct board and general meetings regularly.",
    },
    {
      question: "Can a Private Limited Company be converted into another business structure?",
      answer:
        "Yes, a Private Limited Company can be converted into an LLP, public company, or other business structures, subject to regulatory approvals.",
    },
    {
      question: "What is the role of a Director Identification Number (DIN)?",
      answer:
        "A DIN is a unique identification number required for every director, issued by the MCA, and is mandatory for company incorporation.",
    },
    {
      question:
        "Are there any restrictions on transferring shares in a Private Limited Company?",
      answer:
        "Yes, shares in a Private Limited Company can only be transferred with the approval of the Board of Directors as per the company's Articles of Association.",
    },
  ];

  return (
    <div className=" bg-white p-8 rounded-lg shadow-sm">
      <h2 className="text-xl mb-6 text-[#00486D] " >
        FAQs
      </h2>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start">
              <span className=" font-bold text-gray-900 mr-2">{index + 1}.</span>
              <p className="font-medium text-gray-900">{faq.question}</p>
            </div>
            <div className="ml-4">
              <p className="text-neutral-500 leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQSection;


