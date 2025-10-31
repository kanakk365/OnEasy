import React, { useState, useRef } from "react";
import Field from "./Field";

function FileUploadField({ label, buttonLabel, required = false, accept, onFileSelect }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
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
          />
          <button
            type="button"
            onClick={handleFileClick}
            className="w-full text-left px-4 py-3 rounded-l-lg bg-white outline-none"
          >
            {displayText}
          </button>
        </div>
      </Field>
      <button
        type="button"
        onClick={handleFileClick}
        className="h-[48px] w-[48px] rounded-r-lg bg-gradient-to-b from-[#00486D] to-[#015A88] text-white flex items-center justify-center text-xl cursor-pointer hover:from-[#015A88] hover:to-[#00486D] transition-all"
      >
        +
      </button>
    </div>
  );
}

export default FileUploadField;

