import React from "react";
import { ChevronDown } from "lucide-react";

function AboutSection({
  building,
  aboutSections,
  expandedSection,
  setExpandedSection,
  introTitle = "About Private Limited Company",
  introDescription = "A Private Limited Company is one of the most popular and trusted business structures in India, known for providing limited liability protection to its shareholders. It requires a minimum of two shareholders and two directors and allows easy ownership transferability while offering credibility in the business world. This structure is ideal for small to medium-sized businesses aiming for long-term growth.",
}) {
  return (
    <div className="mt-8">
      {building && (
        <div
          className="rounded-lg p-8 mb-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(90deg, #00486D 0%, #01334C 100%)",
          }}
        >
          <div className="relative z-10 max-w-[60%]">
            <h2 className="text-[18px] font-semibold tracking-[0.03em] text-white mb-4">
              {introTitle}
            </h2>
            <p className="text-white text-[14px] font-normal leading-7 tracking-[0.03em] opacity-95">
              {introDescription}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-[45%] h-[110%]">
            <img
              src={building}
              alt="Building Illustration"
              className="w-full h-full object-cover"
              style={{ opacity: 0.88 }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {aboutSections.map((section) => {
          const isOpen = expandedSection === section.id;
          return (
            <div
              key={section.id}
              className="bg-white rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.id ? "" : section.id
                  )
                }
                className={`w-full px-6 py-3 flex bg-white items-center justify-between text-left rounded-md transition-colors duration-200 ${
                  isOpen ? " hover:bg-gray-50" : "bg-[rgba(0,72,109,0.06)]"
                }`}
              >
                <span
                  className="font-medium tracking-[0.03em]"
                  style={{ color: "#00486D" }}
                >
                  {section.title}
                </span>
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isOpen
                      ? "bg-[#00486D] text-white"
                      : "bg-[#c3d4dd] text-[#00486D]"
                  }`}
                  aria-hidden="true"
                >
                  <ChevronDown
                    size={18}
                    className={`transform transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              <div
                className={`bg-gray-50 border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out px-6 ${
                  isOpen
                    ? "max-h-[1000px] opacity-100 py-4"
                    : "max-h-0 opacity-0 py-0"
                }`}
                aria-hidden={!isOpen}
              >
                {section.content.introduction ? (
                  <div className="space-y-4">
                    <p className="text-gray-900 text-sm font-normal leading-7 tracking-[0.03em]">
                      {section.content.introduction}
                    </p>
                    <div className="space-y-4">
                      {section.content.points.map((item, index) => (
                        <div key={index} className="flex items-center gap-6">
                          <div
                            className="w-6 h-6 rounded-full text-white text-xs font-medium flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(180deg, #00486D 0%, #01334C 100%)",
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm tracking-[0.03em] text-gray-900">
                              {item.title}:
                            </span>
                            <span className="text-gray-900 text-sm tracking-[0.03em] ml-1">
                              {item.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : Array.isArray(section.content) ? (
                  <div className="space-y-4">
                    {section.content.map((item, index) => (
                      <div key={index} className="flex items-center gap-6">
                        <div
                          className="w-6 h-6 rounded-full text-white text-xs font-medium flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(180deg, #00486D 0%, #01334C 100%)",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-sm tracking-[0.03em] text-gray-900">
                            {item.title}:
                          </span>
                          <span className="text-gray-900 text-sm tracking-[0.03em] ml-1">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(section.content) ? (
                      section.content.map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-neutral-500 text-sm  leading-7 tracking-[0.03em]"
                        >
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-neutral-500 text-sm font-normal leading-7 tracking-[0.03em] whitespace-pre-line">
                        {section.content}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AboutSection;
