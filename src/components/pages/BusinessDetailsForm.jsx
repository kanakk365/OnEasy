import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "../forms/StepIndicator";
import { Step1Content, Step2Content, Step3Content, Step4Content, Step5Content } from "../forms/FormSteps";

function BusinessDetailsForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const goBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      return;
    }
    navigate(-1);
  };

  const goNext = () => {
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }
    // Placeholder for submission or navigation to next route after step 5
  };

  const steps = [
    "Business Details",
    "Startup Information",
    "Office Address",
    "Director/Partner Details",
    "Authorization Letter",
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1Content />;
      case 2:
        return <Step2Content />;
      case 3:
        return <Step3Content />;
      case 4:
        return <Step4Content />;
      case 5:
        return <Step5Content />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold text-[#28303F] mb-6">
          Add your Details
        </h1>

        {/* Stepper */}
        <StepIndicator steps={steps} currentStep={step} />

        <div className="rounded-lg p-6">
          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-1.5 rounded-md border border-[#CFE6F0] text-[#00486D] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-1.5 rounded-md text-white font-medium bg-[#6E6E6E] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetailsForm;
