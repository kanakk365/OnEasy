import React from "react";

function Field({ label, required = false, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#28303F]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default Field;

