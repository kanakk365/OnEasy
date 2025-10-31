import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

function CustomDropdown({ options = [], placeholder = "Select an option", value, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    setSelectedValue(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  const displayText = selectedValue || placeholder;
  const displayColor = selectedValue ? "text-[#28303F]" : "text-[#5A5A5A]";

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-transparent hover:border-[#CFD6DC] focus:border-[#00486D] focus:ring-1 focus:ring-[#00486D] flex items-center justify-between transition-colors ${displayColor}`}
      >
        <span className="text-left truncate">{displayText}</span>
        <ChevronDown
          size={20}
          className={`text-[#5A5A5A] transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E6EAEF] rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#5A5A5A]">No options available</div>
          ) : (
            options.map((option, index) => {
              const optionValue = typeof option === "string" ? option : option.value;
              const optionLabel = typeof option === "string" ? option : option.label;
              const isSelected = selectedValue === optionValue;
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(optionValue)}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-[#F0F7FA] text-[#00486D] font-medium"
                      : "text-[#28303F] hover:bg-[#F9FAFB]"
                  } ${index === 0 ? "rounded-t-lg" : ""} ${
                    index === options.length - 1 ? "rounded-b-lg" : ""
                  }`}
                >
                  {optionLabel}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;

