import React from "react";

function ProcessSection({ processSteps }) {
  return (
    <div className="mt-8 bg-white rounded-lg p-8">
      <h2 className="text-2xl font-semibold mb-8" style={{ color: "#00486D" }}>
        Steps for Company Registration in India
      </h2>

      <div className="space-y-6 mb-8">
        {processSteps.map((step, index) => (
          <div key={index} className="flex items-start relative">
            {index < processSteps.length - 1 && (
              <div className="absolute left-4 top-4 bottom-[-28px] w-0.5 bg-gray-300" />
            )}

            <div className="flex-shrink-0 mr-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#01334C] text-white flex items-center justify-center text-xs font-medium">
                {step.step}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                <span className="font-medium">Step no {step.step}:</span>{" "}
                {step.title}
                {step.description && (
                  <span className="text-gray-600"> {step.description}</span>
                )}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#00486D" }}>
          Certificate of Incorporation
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Once the documents are verified, the MCA will issue the Certificate of
          Incorporation (COI) along with the Company Identification Number
          (CIN), Permanent Account Number (PAN) and Tax Deduction and Collection
          Account Number (TAN).
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#00486D" }}>
          Post-Registration Compliance
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          After the company is registered, it's crucial to maintain compliance
          with annual filings and regulatory requirements to ensure smooth
          operations.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#00486D" }}>
          Register Your Company with Oneasy
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          At Oneasy, we provide expert support for Private Limited Company
          registration, ensuring a smooth and compliant process. We handle
          everything from document preparation to name reservation and
          compliance management, allowing you to focus on growing your business.
        </p>
      </div>
    </div>
  );
}

export default ProcessSection;
