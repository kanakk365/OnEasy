import React from "react";

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="w-full py-3 mb-6" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* Progress bar with circles */}
      <div className="flex items-center justify-between relative max-w-3xl mx-auto px-8">
        {steps.map((title, idx) => {
          const stepNumber = idx + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          const isLast = idx === steps.length - 1;
          
          return (
            <React.Fragment key={title}>
              {/* Step Circle */}
              <div className="relative z-10 flex flex-col items-center">
                {isActive ? (
                  // Active step: ring with filled center
                  <div className="w-5 h-5 rounded-full border-2 border-[#00486D] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00486D]" />
                  </div>
                ) : (
                  // Completed or inactive: simple filled circle
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                      isCompleted ? "bg-[#00486D]" : "bg-[#D1D5DB]"
                    }`}
                  />
                )}
                {/* Step Label */}
                <div className="absolute top-7 w-32 text-center">
                  <span
                    className={`text-[14px] font-normal whitespace-normal leading-tight ${
                      isActive
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {title}
                  </span>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-[1px] bg-[#D1D5DB] mx-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentStep > stepNumber ? "bg-[#00486D]" : "bg-[#D1D5DB]"
                    }`}
                    style={{
                      width: currentStep > stepNumber ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;


function StepCircle({ status }) {
  if (status === "completed") {
    return (
      <div className="w-5 h-5 rounded-full bg-[#00486D] flex items-center justify-center">
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 6.5L5 8.5L9 3.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-[#00486D] flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-[#00486D] block" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border border-[#CFD6DC] bg-white" />
  );
}

function Connector({ completed }) {
  return (
    <div
      className={`flex-1 h-[2px] ${
        completed ? "bg-[#00486D]" : "bg-[#CFD6DC]"
      }`}
    />
  );
}

export { StepCircle, Connector };


function StepIndicator({ steps, currentStep }) {
  return (
    <div className="rounded-lg mb-6 p-4">
      <div className="flex items-center w-full">
        {steps.map((title, idx, arr) => {
          const index = idx + 1;
          const status =
            currentStep > index
              ? "completed"
              : currentStep === index
              ? "active"
              : "upcoming";
          const isLast = idx === arr.length - 1;
          return (
            <React.Fragment key={title}>
              <div className="flex items-center justify-center flex-1 min-w-0">
                <StepCircle status={status} />
              </div>
              {!isLast && (
                <div className="flex-1 -mx-10">
                  <Connector completed={currentStep > index} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Labels row */}
      <div className="flex items-center w-full mt-1">
        {steps.map((title, idx, arr) => {
          const index = idx + 1;
          const status =
            currentStep > index
              ? "completed"
              : currentStep === index
              ? "active"
              : "upcoming";
          const isLast = idx === arr.length - 1;
          return (
            <React.Fragment key={title}>
              <div className={`flex items-center justify-center flex-1 min-w-0 ${idx === 0 ? "pl-6" : ""} ${isLast ? "pr-4" : ""}`}>
                <div
                  className={`text-[14px] leading-5 text-center ${
                    status === "upcoming"
                      ? "text-[#5C5C5C]"
                      : "text-[#0D0B26]"
                  }`}
                >
                  {title}
                </div>
              </div>
              {!isLast && (
                <div className="flex-1 -mx-2">
                  {/* Spacer to match connector width */}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
export { StepCircle, Connector };

