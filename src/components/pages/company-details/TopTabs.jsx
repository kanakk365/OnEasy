import React from "react";

function TopTabs({ tabs, activeTab, onChange, disabled = false }) {
  return (
    <div className="bg-white rounded-t-xl">
      <div 
        className="grid"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && onChange && onChange(tab.id)}
              disabled={disabled}
              className={`relative flex flex-col items-center justify-center h-[53px] w-full ${
                disabled && !isActive ? "cursor-default opacity-60" : "cursor-pointer"
              }`}
            >
              <span
                className={
                  isActive
                    ? "text-[#00486D] font-medium text-lg  tracking-[0.03em]"
                    : "text-[#797979]  text-lg tracking-[0.03em]"
                }
              >
                {tab.label}
              </span>
              <div
                className={
                  isActive
                    ? "absolute bottom-0 left-0 right-0 border-b-4 border-[#00486D]"
                    : "absolute bottom-0 left-0 right-0 border-b-4 border-transparent"
                }
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TopTabs;


