import React from "react";

function PrerequisitesSection({ prerequisites }) {
  return (
    <div className="mt-8 bg-white p-8 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#00486D" }}>
        Pre-requisites
      </h2>
      <div className="space-y-6">
        {prerequisites.map((prerequisite, index) => (
          <div key={index} className="flex items-center gap-6">
            <div
              className="w-6 h-6 rounded-full text-white text-xs font-semibold flex items-center justify-center"
              style={{
                background: "linear-gradient(180deg, #00486D 0%, #01334C 100%)",
              }}
            >
              {index + 1}
            </div>
            <p className="text-gray-900 text-sm font-semibold tracking-[0.03em]">
              {prerequisite}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrerequisitesSection;


