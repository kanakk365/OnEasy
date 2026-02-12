import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiChevronRight, FiChevronDown } from "react-icons/fi";
import apiClient from "../../../../utils/api";
import ConfirmationModal from "../../../common/ConfirmationModal";
import SuccessModal from "../../../common/SuccessModal";

const API_FLOW_URL =
  "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/flow";
const API_POST_URL =
  "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/user-compliances";

function ClientComplianceAssignmentTab({ userId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successfulSave, setSuccessfulSave] = useState(false);

  // Data derived from API
  const [complianceSections, setComplianceSections] = useState([]);

  // Selected IDs (Using Code as ID)
  const [selectedCodes, setSelectedCodes] = useState([]);
  // Map of code -> item details for preview
  const [selectedItemsMap, setSelectedItemsMap] = useState({});

  useEffect(() => {
    fetchComplianceFlow();
  }, []);

  const fetchComplianceFlow = async () => {
    try {
      const token = apiClient.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(API_FLOW_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch compliance flow");
      }

      const data = await response.json();
      const sections = processFlowData(data);
      setComplianceSections(sections);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching compliance flow:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const processFlowData = (data) => {
    if (!data?.flow) return [];
    const root = data.flow.find((q) => q.key === "annexure_1a_entity_type");
    if (!root) return [];

    let sections = [];

    // 1. Process Root Options (Direct Compliances)
    root.options.forEach((opt) => {
      const directCompliances = extractCompliances(opt);
      if (directCompliances.length > 0) {
        sections.push({
          id: opt.value,
          title: opt.label,
          items: directCompliances,
        });
      }
    });

    // 2. Process Children Questions (Sub-options with compliances)
    if (root.children) {
      root.children.forEach((childQ) => {
        if (childQ.options) {
          childQ.options.forEach((childOpt) => {
            const childCompliances = extractCompliances(childOpt);
            if (childCompliances.length > 0) {
              let sectionTitle = childOpt.label;

              // Try to find context from key to give better titles
              if (childQ.key.includes("gst"))
                sectionTitle = `GST - ${childOpt.label}`;
              else if (childQ.key.includes("mca"))
                sectionTitle = `MCA - ${childOpt.label}`;
              else if (childQ.key.includes("income"))
                sectionTitle = `Income Tax - ${childOpt.label}`;

              sections.push({
                id: childOpt.value,
                title: sectionTitle,
                items: childCompliances,
              });
            }
          });
        }
      });
    }

    return sections;
  };

  const extractCompliances = (obj) => {
    const items = [];
    const seenCodes = new Set();

    if (obj.compliances) {
      Object.values(obj.compliances)
        .flat()
        .forEach((c) => {
          if (c && c.code && !seenCodes.has(c.code)) {
            items.push({
              code: c.code,
              label: c.name,
              category: c.category,
              description: c.description,
            });
            seenCodes.add(c.code);
          }
        });
    }
    return items;
  };

  const toggleItem = (item) => {
    const isSelected = selectedCodes.includes(item.code);
    if (isSelected) {
      setSelectedCodes((prev) => prev.filter((c) => c !== item.code));
      const newMap = { ...selectedItemsMap };
      delete newMap[item.code];
      setSelectedItemsMap(newMap);
    } else {
      setSelectedCodes((prev) => [...prev, item.code]);
      setSelectedItemsMap((prev) => ({ ...prev, [item.code]: item }));
    }
  };

  const toggleSectionAll = (section) => {
    const allCodes = section.items.map((i) => i.code);
    const allSelected = allCodes.every((code) => selectedCodes.includes(code));

    if (allSelected) {
      // Deselect all
      setSelectedCodes((prev) => prev.filter((c) => !allCodes.includes(c)));
      const newMap = { ...selectedItemsMap };
      allCodes.forEach((c) => delete newMap[c]);
      setSelectedItemsMap(newMap);
    } else {
      // Select all
      const newCodes = [...selectedCodes];
      const newMap = { ...selectedItemsMap };

      section.items.forEach((item) => {
        if (!newCodes.includes(item.code)) {
          newCodes.push(item.code);
          newMap[item.code] = item;
        }
      });

      setSelectedCodes(newCodes);
      setSelectedItemsMap(newMap);
    }
  };

  const removeItem = (code) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
    const newMap = { ...selectedItemsMap };
    delete newMap[code];
    setSelectedItemsMap(newMap);
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    try {
      const token = apiClient.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const payload = {
        userId: userId,
        complianceCodes: selectedCodes,
      };

      const response = await fetch(API_POST_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save compliances");
      }

      const result = await response.json();
      console.log("Save result:", result);
      setSuccessfulSave(true);

      // Reset selection
      setSelectedCodes([]);
      setSelectedItemsMap({});
    } catch (err) {
      console.error("Error saving compliances:", err);
      alert(`❌ Failed to save: ${err.message}`);
    }
  };

  const formatBadge = (cat) => {
    if (!cat) return "";
    return cat.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error: {error}</p>
        <button onClick={fetchComplianceFlow} className="underline mt-2">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
      {/* Left Column: Compliance Selection */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Assign Compliance
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {complianceSections.map((section) => {
            const allCodes = section.items.map((i) => i.code);
            const allSelected = allCodes.every((code) =>
              selectedCodes.includes(code),
            );

            return (
              <div
                key={section.id}
                className="rounded-lg border border-gray-200 bg-gray-50/30 overflow-hidden"
              >
                {/* Section Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    {section.title}
                  </h3>
                  <button
                    onClick={() => toggleSectionAll(section)}
                    className="text-xs font-medium text-[#00486D] hover:underline"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {/* Items Grid */}
                <div className="divide-y divide-gray-100">
                  {section.items.map((item) => {
                    const isSelected = selectedCodes.includes(item.code);
                    return (
                      <div
                        key={item.code}
                        onClick={() => toggleItem(item)}
                        className={`
                            flex items-center justify-between p-3 cursor-pointer transition-colors
                            ${isSelected ? "bg-[#F0F7FA]" : "hover:bg-gray-50"}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                             flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors
                             ${isSelected ? "bg-[#00486D] border-[#00486D]" : "bg-white border-gray-300"}
                          `}
                          >
                            {isSelected && (
                              <FiCheck className="text-white w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-medium ${isSelected ? "text-[#00486D]" : "text-gray-700"}`}
                            >
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-semibold bg-white border border-gray-200 text-gray-500">
                          {formatBadge(item.category)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selection Preview */}
      <div className="w-full lg:w-96 flex-shrink-0 flex flex-col min-h-0 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900">
            Selection Preview
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {selectedCodes.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {selectedCodes.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 p-8">
              <p className="text-gray-400 text-sm text-center">
                No compliance selected
              </p>
            </div>
          ) : (
            Object.values(selectedItemsMap).map((item) => (
              <div
                key={item.code}
                className="flex items-start justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 group transition-all hover:border-gray-300"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={item.label}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5 capitalize">
                    {formatBadge(item.category)}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.code)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            className="w-full py-2.5 px-4 bg-[#00486D] text-white text-sm font-medium rounded-lg hover:bg-[#003855] transition-colors focus:ring-4 focus:ring-[#00486D]/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled={selectedCodes.length === 0}
            onClick={handleSaveClick}
          >
            Configure Reminders
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Assignment"
        message={`Are you sure you want to assign ${selectedCodes.length} compliance(s) to this client?`}
      />

      <SuccessModal
        isOpen={successfulSave}
        onClose={() => setSuccessfulSave(false)}
        title="Success"
        message="Compliances assigned successfully!"
      />
    </div>
  );
}

export default ClientComplianceAssignmentTab;
