import React from "react";

function PrerequisitesSection({ prerequisites }) {
  return (
    <div className="mt-8 bg-white p-8 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#00486D" }}>
        Pre-requisites
      </h2>
      <div className="space-y-6">
        {prerequisites.map((prerequisite, index) => {
          // Handle both string and object formats
          const title =
            typeof prerequisite === "string"
              ? prerequisite
              : prerequisite.title;
          const description =
            typeof prerequisite === "object" ? prerequisite.description : null;

          return (
            <div key={index} className="flex items-start gap-6">
              <div
                className="w-6 h-6 rounded-full text-white text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background:
                    "linear-gradient(180deg, #00486D 0%, #01334C 100%)",
                }}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm font-medium tracking-[0.03em]">
                  {title}
                </p>
                {description && (
                  <p className="text-gray-600 text-sm tracking-[0.03em] mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PrerequisitesSection;
