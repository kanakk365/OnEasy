import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiCheck,
  FiX,
  FiChevronRight,
  FiChevronDown,
  FiCheckCircle,
} from "react-icons/fi";
import { AUTH_CONFIG } from "../../../../config/auth";

const API_1A_GET =
  "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/flow/whimsical";
const API_1A_POST =
  "https://oneasycompliance.oneasy.ai/compliance/annexure-1a/my-compliances";

const AddComplianceSection = ({ selectedOrg }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flowBranches, setFlowBranches] = useState([]);
  const [expandedBranches, setExpandedBranches] = useState(new Set());
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const getAuthToken = () => {
    try {
      return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    } catch {
      return null;
    }
  };

  const fetchAvailableCompliances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(API_1A_GET, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFlowBranches(data.branches || []);
      } else {
        setError("Failed to load compliance list. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading compliance list.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAvailableCompliances();
  }, [fetchAvailableCompliances]);

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

  // Toggle expand/collapse for a branch path
  const toggleBranchExpand = (path) => {
    setExpandedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        // Collapse this and all children
        const toRemove = [];
        next.forEach((p) => {
          if (p === path || p.startsWith(path + " > ")) {
            toRemove.push(p);
          }
        });
        toRemove.forEach((p) => next.delete(p));
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const toggleSelection = (code) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const toggleAllItems = (items) => {
    const codes = items.map((i) => i.code);
    const allSelected = codes.every((c) => selectedCodes.includes(c));

    if (allSelected) {
      setSelectedCodes((prev) => prev.filter((c) => !codes.includes(c)));
    } else {
      setSelectedCodes((prev) => {
        const newSel = [...prev];
        codes.forEach((c) => {
          if (!newSel.includes(c)) newSel.push(c);
        });
        return newSel;
      });
    }
  };

  // Filter branches by search
  const filterBranches = (branches) => {
    if (!searchQuery) return branches;
    const q = searchQuery.toLowerCase();
    return branches.filter((b) => {
      if (b.heading.toLowerCase().includes(q)) return true;
      const allItems = collectAllItems(b);
      return allItems.some(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.code && item.code.toLowerCase().includes(q)),
      );
    });
  };

  // Build a name map for selected items preview
  const getSelectedItemDetails = () => {
    const details = [];
    const findItems = (branches, path = "") => {
      branches.forEach((branch) => {
        const currentPath = path
          ? `${path} > ${branch.heading}`
          : branch.heading;
        if (branch.items) {
          branch.items.forEach((item) => {
            if (selectedCodes.includes(item.code)) {
              details.push({
                code: item.code,
                name: item.name,
                category: branch.heading,
              });
            }
          });
        }
        if (branch.subBranches) {
          findItems(branch.subBranches, currentPath);
        }
      });
    };
    findItems(flowBranches);
    return details;
  };

  const submitSelection = async () => {
    if (selectedCodes.length === 0) return;
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const payload = {
        complianceCodes: selectedCodes,
        ...(selectedOrg ? { orgId: String(selectedOrg.id) } : {}),
      };

      const response = await fetch(API_1A_POST, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setSelectedCodes([]);
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        alert("Failed to submit compliances. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting compliances.");
    }
    setIsSubmitting(false);
  };

  // Recursive render for accordion tree
  const renderBranch = (branch, parentPath = "", depth = 0) => {
    const path = parentPath
      ? `${parentPath} > ${branch.heading}`
      : branch.heading;
    const isExpanded = expandedBranches.has(path);
    const allItems = collectAllItems(branch);
    const selCount = allItems.filter((i) =>
      selectedCodes.includes(i.code),
    ).length;
    const totalCount = allItems.length;
    const hasChildren =
      (branch.subBranches && branch.subBranches.length > 0) ||
      (branch.items && branch.items.length > 0);

    return (
      <div key={path} className={`${depth === 0 ? "mb-2" : ""}`}>
        {/* Branch Header */}
        <button
          onClick={() => hasChildren && toggleBranchExpand(path)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-left ${
            isExpanded
              ? "bg-[#00486D]/5 border border-[#00486D]/20"
              : "bg-white border border-gray-200 hover:border-[#00486D]/30 hover:bg-gray-50"
          }`}
          style={depth > 0 ? { marginLeft: `${depth * 16}px` } : {}}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren &&
              (isExpanded ? (
                <FiChevronDown
                  className="text-[#00486D] flex-shrink-0"
                  size={16}
                />
              ) : (
                <FiChevronRight
                  className="text-gray-400 flex-shrink-0"
                  size={16}
                />
              ))}
            <span
              className={`text-sm font-semibold truncate ${
                isExpanded ? "text-[#00486D]" : "text-gray-800"
              }`}
            >
              {branch.heading}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selCount > 0 && (
              <span className="text-xs font-semibold text-[#00486D] bg-[#00486D]/10 px-2 py-0.5 rounded-full">
                {selCount}/{totalCount}
              </span>
            )}
            {selCount === 0 && (
              <span className="text-xs text-gray-400">{totalCount}</span>
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {/* Sub-branches */}
            {branch.subBranches &&
              branch.subBranches.map((sub) =>
                renderBranch(sub, path, depth + 1),
              )}

            {/* Items */}
            {branch.items && branch.items.length > 0 && (
              <div
                className="mt-1"
                style={{ marginLeft: `${(depth + 1) * 16}px` }}
              >
                {/* Select All for this group */}
                <div className="flex items-center justify-between px-3 py-1.5 mb-1">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {branch.items.length} item
                    {branch.items.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllItems(branch.items);
                    }}
                    className="text-xs text-[#00486D] hover:underline font-medium"
                  >
                    {branch.items.every((i) => selectedCodes.includes(i.code))
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                {branch.items.map((item) => {
                  const isSel = selectedCodes.includes(item.code);
                  return (
                    <div
                      key={item.code}
                      onClick={() => toggleSelection(item.code)}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all mb-1 ${
                        isSel
                          ? "bg-[#00486D]/5 border border-[#00486D]/30"
                          : "bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSel
                            ? "bg-[#00486D] border-[#00486D]"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isSel && <FiCheck className="text-white w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isSel ? "text-[#00486D]" : "text-gray-800"
                          }`}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        {item.code && (
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {item.code}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D]"></div>
          <p className="text-sm text-gray-500">
            Loading available compliances...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={fetchAvailableCompliances}
          className="text-sm text-[#00486D] underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredBranches = filterBranches(flowBranches);
  const selectedDetails = getSelectedItemDetails();

  return (
    <div>
      {/* Success Banner */}
      {submitSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">
            Compliances assigned successfully to{" "}
            <span className="font-bold">
              {selectedOrg?.legal_name ||
                selectedOrg?.trade_name ||
                "this organisation"}
            </span>
            !
          </p>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-6">
        Select compliances to assign to{" "}
        <span className="font-semibold text-gray-700">
          {selectedOrg?.legal_name ||
            selectedOrg?.trade_name ||
            "this organisation"}
        </span>
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Accordion Tree */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search compliances or categories..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00486D] focus:ring-1 focus:ring-[#00486D]/20 transition-all bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Accordion Content */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => renderBranch(branch))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FiSearch size={40} className="mb-3" />
                <p className="text-sm">
                  No compliances found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selection Preview */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col min-h-0 bg-gray-50 rounded-xl border border-gray-200">
          <div className="p-4 pb-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Selected</h3>
            <span className="bg-[#00486D]/10 text-[#00486D] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {selectedCodes.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[350px] custom-scrollbar">
            {selectedDetails.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-gray-400 text-sm text-center">
                  No compliance selected yet.
                  <br />
                  <span className="text-xs text-gray-300">
                    Browse and select from the left panel
                  </span>
                </p>
              </div>
            ) : (
              selectedDetails.map((item) => (
                <div
                  key={item.code}
                  className="flex items-start justify-between p-2.5 rounded-lg bg-white border border-gray-200 group transition-all hover:border-gray-300"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p
                      className="text-xs font-semibold text-gray-900 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[#00486D] font-medium mt-0.5">
                      {item.category}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSelection(item.code)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-gray-200 space-y-2">
            <button
              onClick={submitSelection}
              disabled={selectedCodes.length === 0 || isSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#00486D] text-white text-sm font-medium hover:bg-[#003855] disabled:opacity-50 transition-colors shadow-md shadow-blue-900/10"
            >
              {isSubmitting
                ? "Assigning..."
                : `Assign ${selectedCodes.length > 0 ? `(${selectedCodes.length})` : ""} Compliance${selectedCodes.length !== 1 ? "s" : ""}`}
            </button>
            {selectedCodes.length > 0 && (
              <button
                onClick={() => setSelectedCodes([])}
                className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-white transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddComplianceSection;
