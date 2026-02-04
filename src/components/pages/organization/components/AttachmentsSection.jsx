import React from "react";
import { useNavigate } from "react-router-dom";

const AttachmentsSection = ({ editingOrg, selectedOrg }) => {
  const data = editingOrg || selectedOrg;
  const navigate = useNavigate();

  if (!data) return null;

  return (
    <div className="bg-[#f2f6f7] rounded-xl p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Attachments
        </h3>
        <p className="text-sm text-gray-600 max-w-xl">
          Upload and manage all company documents for this organization in the
          Company Documents section.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate(`/company-documents/${data.id}`)}
        className="px-6 py-2 bg-[#00486D] text-white rounded-lg text-sm font-semibold hover:bg-[#01334C] transition-colors"
      >
        Go to Company Documents
      </button>
    </div>
  );
};

export default AttachmentsSection;
