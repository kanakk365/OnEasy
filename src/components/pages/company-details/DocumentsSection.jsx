import React from "react";

function DocumentsSection({ illustration, documents }) {
  // Default documents for Private Limited if not provided
  const defaultDocuments = [
    "PAN Card of all Directors",
    "Aadhaar Card of all Directors",
    "Passport (only for Foreign Nationals)",
    "Bank Statement of all Directors (Recent)",
    "Photograph of all the Directors",
    "Rental Agreement and NOC (Company)",
    "Latest utility bill of the Company (Electricity Bill)",
  ];
  
  const documentsList = documents || defaultDocuments;

  return (
    <div className="mt-8 bg-white p-8 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#00486D" }}>
        Documents Required
      </h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:space-x-8">
        <div className="flex-1 space-y-6 mb-8 md:mb-0">
          {documentsList.map((doc, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full text-white text-xs font-semibold flex items-center justify-center"
                style={{
                  background: "linear-gradient(180deg, #00486D 0%, #01334C 100%)",
                }}
              >
                {index + 1}
              </div>
              <p className="text-gray-900 text-sm font-semibold tracking-[0.03em]">
                {doc}
              </p>
            </div>
          ))}
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img src={illustration} alt="Documents Illustration" className="max-w-full h-auto" />
        </div>
      </div>
    </div>
  );
}

export default DocumentsSection;





