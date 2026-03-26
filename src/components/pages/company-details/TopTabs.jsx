import React from "react";

function TopTabs({ tabs, activeTab, onChange, disabled = false }) {
  return (
    <div className="bg-white rounded-t-xl overflow-x-auto">
      <div
        className="flex min-w-max lg:grid border-b border-gray-100"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && onChange && onChange(tab.id)}
              disabled={disabled}
              className={`relative flex flex-col items-center justify-center h-[44px] lg:h-[53px] px-4 lg:px-0 whitespace-nowrap ${
                disabled && !isActive ? "cursor-default opacity-60" : "cursor-pointer"
              }`}
            >
              <span
                className={
                  isActive
                    ? "text-[#022B51] font-medium text-sm lg:text-lg tracking-[0.03em]"
                    : "text-[#797979] text-sm lg:text-lg tracking-[0.03em]"
                }
              >
                {tab.label}
              </span>
              <div
                className={
                  isActive
                    ? "absolute bottom-0 left-0 right-0 border-b-4 border-[#022B51]"
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



