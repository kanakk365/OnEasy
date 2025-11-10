import React, { useState, useRef } from "react";
import Field from "./Field";

function FileUploadField({ label, buttonLabel, required = false, accept, onFileSelect, disabled = false }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleFileClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const displayText = fileName || buttonLabel || label;

  return (
    <div className="grid grid-cols-[1fr_48px] items-end">
      <Field label={label} required={required}>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleFileClick}
            disabled={disabled}
            className={`w-full text-left px-4 py-3 rounded-l-lg outline-none ${
              disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-400 cursor-pointer'
            }`}
          >
            {displayText}
          </button>
        </div>
      </Field>
      <button
        type="button"
        onClick={handleFileClick}
        disabled={disabled}
        className={`h-[48px] w-[48px] rounded-r-lg text-white flex items-center justify-center text-xl transition-all ${
          disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-b from-[#00486D] to-[#015A88] cursor-pointer hover:from-[#015A88] hover:to-[#00486D]'
        }`}
      >
        +
      </button>
    </div>
  );
}

export default FileUploadField;
