import React, { useState, useEffect } from "react";
import {
  FiX,
  FiCheck,
  FiChevronRight,
  FiArrowLeft,
  FiSearch,
} from "react-icons/fi";
import apiClient from "../../../../utils/api";
import ConfirmationModal from "../../../common/ConfirmationModal";
import SuccessModal from "../../../common/SuccessModal";

const API_FLOW_URL =
  "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/flow/whimsical";
const API_POST_URL =
  "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/user-compliances";

function ClientComplianceAssignmentTab({ userId, organisations: orgsProp }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successfulSave, setSuccessfulSave] = useState(false);

  // Org selection state
  const [selectedOrg, setSelectedOrg] = useState(null);
  const userOrgs = orgsProp || [];

  // Hierarchical data from API
  const [flowBranches, setFlowBranches] = useState([]);
  const [navigationPath, setNavigationPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      const branches = data.branches || [];
      setFlowBranches(branches);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching compliance flow:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Collect all items recursively from a branch node
  const collectAllItems = (node) => {
    let items = [];
    if (node.items) {
      items = [...items, ...node.items];
    }
    if (node.subBranches) {
      node.subBranches.forEach((sb) => {
        items = [...items, ...collectAllItems(sb)];
      });
    }
    return items;
  };

  // Get current level data based on navigation path
  const getCurrentLevel = () => {
    if (navigationPath.length === 0) {
      return { branches: flowBranches, items: [] };
    }
    let current = flowBranches;
    let node = null;
    for (let i = 0; i < navigationPath.length; i++) {
      node = current.find((b) => b.heading === navigationPath[i]);
      if (!node) return { branches: [], items: [] };
      current = node.subBranches || [];
    }
    return {
      branches: node?.subBranches || [],
      items: node?.items || [],
    };
  };

  const handleBranchSelect = (branch) => {
    if (
      (branch.subBranches && branch.subBranches.length > 0) ||
      (branch.items && branch.items.length > 0)
    ) {
      setNavigationPath((prev) => [...prev, branch.heading]);
    }
    setSearchQuery("");
  };

  const handleNavigateBack = () => {
    setNavigationPath((prev) => prev.slice(0, -1));
    setSearchQuery("");
  };

  // Count selected items in a branch
  const getSelectedCount = (branch) => {
    const allItems = collectAllItems(branch);
    return allItems.filter((item) => selectedCodes.includes(item.code)).length;
  };

  // Get total items count in a branch
  const getTotalCount = (branch) => {
    return collectAllItems(branch).length;
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
      setSelectedItemsMap((prev) => ({
        ...prev,
        [item.code]: {
          code: item.code,
          label: item.name,
          dueDate: item.dueDate,
          reminders: item.reminders,
          category: navigationPath.length > 0 ? navigationPath[0] : "General",
        },
      }));
    }
  };

  const toggleAllCurrentItems = (items) => {
    const codes = items.map((i) => i.code);
    const allSelected = codes.every((c) => selectedCodes.includes(c));

    if (allSelected) {
      // Deselect all
      setSelectedCodes((prev) => prev.filter((c) => !codes.includes(c)));
      const newMap = { ...selectedItemsMap };
      codes.forEach((c) => delete newMap[c]);
      setSelectedItemsMap(newMap);
    } else {
      // Select all
      const newCodes = [...selectedCodes];
      const newMap = { ...selectedItemsMap };
      const category =
        navigationPath.length > 0 ? navigationPath[0] : "General";

      items.forEach((item) => {
        if (!newCodes.includes(item.code)) {
          newCodes.push(item.code);
          newMap[item.code] = {
            code: item.code,
            label: item.name,
            dueDate: item.dueDate,
            reminders: item.reminders,
            category,
          };
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
        orgId: String(selectedOrg.id),
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

  // Step 1: Show org selection if no org is selected yet
  if (!selectedOrg) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select Organisation
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose an organisation to assign compliance to
        </p>

        {userOrgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <svg
              className="w-12 h-12 text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <p className="text-gray-400 text-sm font-medium">
              No organisations found for this user
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Please add an organisation in the Organisations tab first
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userOrgs.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrg(org)}
                className="group text-left p-5 rounded-xl border border-gray-200 bg-white hover:border-[#00486D] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform"
                    style={{
                      background:
                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#00486D] transition-colors">
                      {org.legal_name ||
                        org.legalName ||
                        "Unnamed Organisation"}
                    </h3>
                    {(org.trade_name || org.tradeName) && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        Trade: {org.trade_name || org.tradeName}
                      </p>
                    )}
                    {org.gstin && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        GSTIN: {org.gstin}
                      </p>
                    )}
                    {org.organisation_type && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                        {org.organisation_type}
                      </span>
                    )}
                  </div>
                  <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#00486D] flex-shrink-0 mt-1 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Step 2: Show compliance assignment with hierarchical drill-down
  const { branches: currentBranches, items: currentItems } = getCurrentLevel();
  const isAtRoot = navigationPath.length === 0;

  // Filter items by search
  const filteredItems = currentItems.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.code && i.code.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Filter branches by search
  const filteredBranches = currentBranches.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (b.heading.toLowerCase().includes(q)) return true;
    const allItems = collectAllItems(b);
    return allItems.some(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q)),
    );
  });

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-200px)]">
      {/* Selected Org Header */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] px-5 py-3">
        <button
          onClick={() => {
            setSelectedOrg(null);
            setSelectedCodes([]);
            setSelectedItemsMap({});
            setNavigationPath([]);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          title="Change organisation"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{
            background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Assigning to
          </p>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {selectedOrg.legal_name || selectedOrg.legalName || "Organisation"}
            {(selectedOrg.trade_name || selectedOrg.tradeName) &&
              ` (${selectedOrg.trade_name || selectedOrg.tradeName})`}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedOrg(null);
            setSelectedCodes([]);
            setSelectedItemsMap({});
            setNavigationPath([]);
          }}
          className="text-xs font-medium text-[#00486D] hover:underline px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Change
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Column: Compliance Selection (Hierarchical) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          {/* Header with navigation */}
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {!isAtRoot && (
                <button
                  onClick={handleNavigateBack}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                >
                  <FiArrowLeft size={18} />
                </button>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isAtRoot
                    ? "Select Compliance Category"
                    : navigationPath[navigationPath.length - 1]}
                </h2>
              </div>
            </div>

            {/* Breadcrumb */}
            {navigationPath.length > 0 && (
              <div className="flex items-center gap-1 text-xs mt-2 overflow-x-auto">
                <button
                  onClick={() => setNavigationPath([])}
                  className="text-[#00486D] hover:underline font-medium flex-shrink-0"
                >
                  All
                </button>
                {navigationPath.map((path, idx) => (
                  <React.Fragment key={idx}>
                    <FiChevronRight
                      className="text-gray-400 flex-shrink-0"
                      size={12}
                    />
                    {idx === navigationPath.length - 1 ? (
                      <span className="text-gray-600 font-medium flex-shrink-0">
                        {path}
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          setNavigationPath((prev) => prev.slice(0, idx + 1))
                        }
                        className="text-[#00486D] hover:underline font-medium flex-shrink-0"
                      >
                        {path}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          {(currentItems.length > 0 || currentBranches.length > 3) && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    currentItems.length > 0
                      ? "Search compliances..."
                      : "Search categories..."
                  }
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00486D]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Sub-branches (category cards) */}
            {filteredBranches.length > 0 && (
              <div>
                {currentItems.length > 0 && (
                  <h3 className="font-bold text-gray-600 uppercase text-xs tracking-wider mb-3 px-1">
                    Sub-Categories
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredBranches.map((branch) => {
                    const selCount = getSelectedCount(branch);
                    const totalCount = getTotalCount(branch);
                    return (
                      <div
                        key={branch.heading}
                        onClick={() => handleBranchSelect(branch)}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md group ${
                          selCount > 0
                            ? "bg-[#00486D]/5 border-[#00486D]/30"
                            : "bg-white border-gray-200 hover:border-[#00486D]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#00486D] transition-colors">
                              {branch.heading}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {totalCount} compliance
                              {totalCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selCount > 0 && (
                              <span className="text-xs font-semibold text-[#00486D] bg-[#00486D]/10 px-2 py-0.5 rounded-full">
                                {selCount}/{totalCount}
                              </span>
                            )}
                            <FiChevronRight
                              className="text-gray-400 group-hover:text-[#00486D] transition-colors flex-shrink-0"
                              size={18}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items (selectable compliance items) */}
            {filteredItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-gray-600 uppercase text-xs tracking-wider">
                    Compliances
                  </h3>
                  <button
                    onClick={() => toggleAllCurrentItems(filteredItems)}
                    className="text-xs text-[#00486D] hover:underline font-medium"
                  >
                    {filteredItems.every((i) => selectedCodes.includes(i.code))
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                  {filteredItems.map((item) => {
                    const isSelected = selectedCodes.includes(item.code);
                    return (
                      <div
                        key={item.code}
                        onClick={() => toggleItem(item)}
                        className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                          isSelected ? "bg-[#F0F7FA]" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 ${
                              isSelected
                                ? "bg-[#00486D] border-[#00486D]"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <FiCheck className="text-white w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                isSelected ? "text-[#00486D]" : "text-gray-700"
                              }`}
                            >
                              {item.name}
                            </p>
                            {item.dueDate && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                📅 Due: {item.dueDate}
                              </p>
                            )}
                            {item.reminders && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                🔔 {item.reminders}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty search state */}
            {filteredBranches.length === 0 && filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiSearch size={36} className="mb-3" />
                <p className="text-sm">
                  {searchQuery
                    ? "No compliances found matching your search."
                    : "No items available at this level."}
                </p>
              </div>
            )}
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
                    {item.category && (
                      <p className="text-xs text-blue-600 font-medium mt-0.5 capitalize">
                        {item.category}
                      </p>
                    )}
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
              Configure Reminders ({selectedCodes.length})
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Assignment"
        message={`Are you sure you want to assign ${selectedCodes.length} compliance(s) to "${selectedOrg.legal_name || selectedOrg.legalName || "this organisation"}"?`}
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
