import React, { useState, useEffect, useMemo } from "react";
import complianceApi from "../../../utils/complianceApi";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCloseLine,
  RiFilterLine,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFileList3Line,
  RiShieldCheckLine,
  RiEyeLine,
  RiCheckLine,
} from "react-icons/ri";
import { BsShieldCheck } from "react-icons/bs";

const DEFAULT_CATEGORIES = [
  { value: "filing", label: "Filing" },
  { value: "return", label: "Return" },
  { value: "payment", label: "Payment" },
  { value: "registration", label: "Registration" },
  { value: "tax_filing", label: "Tax Filing" },
];

const DEFAULT_CATEGORY_COLORS = {
  filing: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  return: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  payment: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  registration: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  tax_filing: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};

// Extra color palettes for dynamically added categories
const EXTRA_COLOR_PALETTES = [
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200" },
  {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
  },
  { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
];

function AdminComplianceCMS() {
  const [activeTab, setActiveTab] = useState("items");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ─── Categories State ───
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [categoryColors, setCategoryColors] = useState(DEFAULT_CATEGORY_COLORS);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // ─── Compliance Items State ───
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("all");
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    code: "",
    name: "",
    category: "filing",
    description: "",
    reminders: "",
    annexureType: "1A",
  });

  // ─── Compliance Rules State ───
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [ruleSearch, setRuleSearch] = useState("");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleSaving, setRuleSaving] = useState(false);
  const [ruleFormData, setRuleFormData] = useState({
    complianceItemId: "",
    conditionId: "",
    optionId: "",
    priority: 0,
    isRequired: true,
  });

  // ─── Fetch Data ───
  useEffect(() => {
    fetchItems();
    fetchRules();
  }, []);

  // Sync categories from fetched items (pick up any categories from DB that aren't in defaults)
  useEffect(() => {
    if (items.length > 0) {
      const existingValues = new Set(categories.map((c) => c.value));
      const newCats = [];
      items.forEach((item) => {
        if (item.category && !existingValues.has(item.category)) {
          existingValues.add(item.category);
          newCats.push({
            value: item.category,
            label: item.category
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
          });
        }
      });
      if (newCats.length > 0) {
        setCategories((prev) => [...prev, ...newCats]);
        // Assign colors to new categories
        setCategoryColors((prev) => {
          const updated = { ...prev };
          newCats.forEach((cat, i) => {
            if (!updated[cat.value]) {
              const paletteIndex =
                (Object.keys(updated).length -
                  Object.keys(DEFAULT_CATEGORY_COLORS).length +
                  i) %
                EXTRA_COLOR_PALETTES.length;
              updated[cat.value] = EXTRA_COLOR_PALETTES[paletteIndex];
            }
          });
          return updated;
        });
      }
    }
  }, [items]);

  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      const data = await complianceApi.getComplianceItems();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching compliance items:", error);
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      setRulesLoading(true);
      const data = await complianceApi.getComplianceRules();
      setRules(data.rules || []);
    } catch (error) {
      console.error("Error fetching compliance rules:", error);
    } finally {
      setRulesLoading(false);
    }
  };

  // ─── Compliance Items CRUD ───
  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setItemFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setItemFormData({
      code: "",
      name: "",
      category: "filing",
      description: "",
      reminders: "",
      annexureType: "1A",
    });
    setShowAddCategory(false);
    setNewCategoryName("");
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      code: item.code || "",
      name: item.name || "",
      category: item.category || "filing",
      description: item.description || "",
      reminders: item.reminders || "",
      annexureType: item.annexureType || "1A",
    });
    setShowAddCategory(false);
    setNewCategoryName("");
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!itemFormData.code || !itemFormData.name) {
      alert("Code and Name are required");
      return;
    }

    try {
      setItemSaving(true);
      if (editingItem) {
        await complianceApi.updateComplianceItem(editingItem.id, {
          name: itemFormData.name,
          category: itemFormData.category,
          description: itemFormData.description,
          reminders: itemFormData.reminders,
          annexureType: itemFormData.annexureType,
        });
        alert("Compliance item updated successfully!");
      } else {
        await complianceApi.createComplianceItem(itemFormData);
        alert("Compliance item created successfully!");
      }
      setShowItemModal(false);
      setEditingItem(null);
      await fetchItems();
    } catch (error) {
      console.error("Error saving compliance item:", error);
      alert(error.message || "Failed to save compliance item");
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${item.name}" (${item.code})?`,
      )
    )
      return;

    try {
      await complianceApi.deleteComplianceItem(item.id);
      alert("Compliance item deleted successfully!");
      await fetchItems();
    } catch (error) {
      console.error("Error deleting compliance item:", error);
      alert(error.message || "Failed to delete compliance item");
    }
  };

  // ─── Compliance Rules CRUD ───
  const handleRuleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRuleFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setRuleFormData({
      complianceItemId: "",
      conditionId: "",
      optionId: "",
      priority: 0,
      isRequired: true,
    });
    setShowRuleModal(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setRuleFormData({
      complianceItemId: rule.complianceItemId || "",
      conditionId: rule.conditionId || "",
      optionId: rule.optionId || "",
      priority: rule.priority || 0,
      isRequired: rule.isRequired ?? true,
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = async () => {
    if (!ruleFormData.complianceItemId || !ruleFormData.optionId) {
      alert("Compliance Item and Option ID are required");
      return;
    }

    try {
      setRuleSaving(true);
      const payload = {
        ...ruleFormData,
        conditionId: ruleFormData.conditionId || null,
        priority: parseInt(ruleFormData.priority) || 0,
      };

      if (editingRule) {
        await complianceApi.updateComplianceRule(editingRule.id, payload);
        alert("Compliance rule updated successfully!");
      } else {
        await complianceApi.createComplianceRule(payload);
        alert("Compliance rule created successfully!");
      }
      setShowRuleModal(false);
      setEditingRule(null);
      await fetchRules();
      await fetchItems();
    } catch (error) {
      console.error("Error saving compliance rule:", error);
      alert(error.message || "Failed to save compliance rule");
    } finally {
      setRuleSaving(false);
    }
  };

  const handleDeleteRule = async (rule) => {
    if (
      !window.confirm(`Are you sure you want to delete this compliance rule?`)
    )
      return;

    try {
      await complianceApi.deleteComplianceRule(rule.id);
      alert("Compliance rule deleted successfully!");
      await fetchRules();
      await fetchItems();
    } catch (error) {
      console.error("Error deleting compliance rule:", error);
      alert(error.message || "Failed to delete compliance rule");
    }
  };

  // ─── Filtered data ───
  const filteredItems = useMemo(() => {
    setCurrentPage(1); // Reset page on filter change
    return items.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.code?.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(itemSearch.toLowerCase());
      const matchesCategory =
        itemCategoryFilter === "all" || item.category === itemCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, itemSearch, itemCategoryFilter]);

  const filteredRules = useMemo(() => {
    setCurrentPage(1); // Reset page on filter change
    return rules.filter((rule) => {
      const matchesSearch =
        rule.id?.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        rule.optionId?.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        rule.complianceItem?.name
          ?.toLowerCase()
          .includes(ruleSearch.toLowerCase()) ||
        rule.complianceItem?.code
          ?.toLowerCase()
          .includes(ruleSearch.toLowerCase()) ||
        rule.option?.label?.toLowerCase().includes(ruleSearch.toLowerCase());
      return matchesSearch;
    });
  }, [rules, ruleSearch]);

  // Pagination Logic
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  const paginatedRules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRules.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRules, currentPage]);

  const totalPages = Math.ceil(
    (activeTab === "items" ? filteredItems.length : filteredRules.length) /
      itemsPerPage,
  );

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <span className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-900">
            {Math.min(
              currentPage * itemsPerPage,
              activeTab === "items"
                ? filteredItems.length
                : filteredRules.length,
            )}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">
            {activeTab === "items"
              ? filteredItems.length
              : filteredRules.length}
          </span>{" "}
          results
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RiArrowLeftSLine className="w-5 h-5 text-gray-600" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1),
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="text-gray-400 px-1">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? "bg-[#01334C] text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RiArrowRightSLine className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  // ─── Add Category Handler ───
  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const value = trimmed.toLowerCase().replace(/\s+/g, "_");

    // Check if already exists
    if (categories.some((c) => c.value === value)) {
      alert("This category already exists!");
      return;
    }

    const label = trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
    setCategories((prev) => [...prev, { value, label }]);

    // Assign a color from the extra palette
    setCategoryColors((prev) => {
      const usedExtra =
        Object.keys(prev).length - Object.keys(DEFAULT_CATEGORY_COLORS).length;
      const paletteIndex = usedExtra % EXTRA_COLOR_PALETTES.length;
      return { ...prev, [value]: EXTRA_COLOR_PALETTES[paletteIndex] };
    });

    // Auto-select the new category in the form
    setItemFormData((prev) => ({ ...prev, category: value }));
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const getCategoryStyle = (category) => {
    return (
      categoryColors[category] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      }
    );
  };

  // ─── Render ───
  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
            >
              <BsShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Compliance CMS
              </h1>
              <p className="text-gray-500 italic ml-1">
                Manage compliance items and rules
              </p>
            </div>
          </div>

          <button
            onClick={
              activeTab === "items" ? handleCreateItem : handleCreateRule
            }
            className="flex items-center gap-2 px-6 py-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg font-medium"
          >
            <RiAddLine className="w-5 h-5" />
            <span>
              {activeTab === "items"
                ? "Add Compliance Item"
                : "Add Compliance Rule"}
            </span>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                activeTab === "items"
                  ? "text-[#01334C] bg-white"
                  : "text-gray-400 hover:text-gray-600 bg-gray-50/50"
              }`}
            >
              <RiFileList3Line className="w-4 h-4" />
              <span>Compliance Items</span>
              <span
                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "items"
                    ? "bg-[#01334C] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {items.length}
              </span>
              {activeTab === "items" && (
                <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#01334C] rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                activeTab === "rules"
                  ? "text-[#01334C] bg-white"
                  : "text-gray-400 hover:text-gray-600 bg-gray-50/50"
              }`}
            >
              <RiShieldCheckLine className="w-4 h-4" />
              <span>Compliance Rules</span>
              <span
                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "rules"
                    ? "bg-[#01334C] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {rules.length}
              </span>
              {activeTab === "rules" && (
                <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#01334C] rounded-t-full" />
              )}
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════
             TAB: COMPLIANCE ITEMS
          ════════════════════════════════════════════════════════════ */}
          {activeTab === "items" && (
            <>
              {/* Filter Bar */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, code, or description..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow bg-white"
                  />
                </div>
                <div className="w-full md:w-56">
                  <div className="relative">
                    <RiFilterLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={itemCategoryFilter}
                      onChange={(e) => setItemCategoryFilter(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow appearance-none bg-white font-medium text-gray-700"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <RiArrowDownSLine className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="min-h-[400px]">
                {itemsLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D]"></div>
                    <p className="mt-4 text-gray-500 font-medium">
                      Loading compliance items...
                    </p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <RiFileList3Line className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-lg font-medium">
                      No compliance items found
                    </p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-100">
                      {paginatedItems.map((item) => {
                        const catStyle = getCategoryStyle(item.category);
                        return (
                          <div
                            key={item.id}
                            className="group hover:bg-[#F8FAFC] transition-colors"
                          >
                            <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                  <h4 className="text-[15px] font-bold text-gray-900 truncate">
                                    {item.name}
                                  </h4>
                                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md font-mono border border-gray-200">
                                    {item.code}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${catStyle.bg} ${catStyle.text} ${catStyle.border} border`}
                                  >
                                    {item.category?.replace("_", " ")}
                                  </span>
                                  {item.annexureType && (
                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
                                      Annexure {item.annexureType}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  {item.description && (
                                    <p className="text-sm text-gray-600 truncate max-w-3xl">
                                      {item.description}
                                    </p>
                                  )}
                                  {item.reminders && (
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                      <span className="font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                                        Reminders:
                                      </span>
                                      <span className="truncate max-w-2xl">
                                        {item.reminders}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#00486D] bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 rounded-lg transition-colors"
                                >
                                  <RiEditLine className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 rounded-lg transition-colors"
                                >
                                  <RiDeleteBinLine className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <PaginationControls />
                  </>
                )}
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════
             TAB: COMPLIANCE RULES
          ════════════════════════════════════════════════════════════ */}
          {activeTab === "rules" && (
            <>
              {/* Filter Bar */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="relative">
                  <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by compliance item name, option label, or question..."
                    value={ruleSearch}
                    onChange={(e) => setRuleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow bg-white"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="min-h-[400px]">
                {rulesLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D]"></div>
                    <p className="mt-4 text-gray-500 font-medium">
                      Loading compliance rules...
                    </p>
                  </div>
                ) : filteredRules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <RiShieldCheckLine className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-lg font-medium">
                      No compliance rules found
                    </p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search terms
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-200">
                            <th className="text-left px-5 py-4 font-bold text-gray-600 uppercase text-[11px] tracking-wider bg-gray-50/50 sticky top-0 z-10 w-[20%]">
                              Compliance Item
                            </th>
                            <th className="text-left px-5 py-4 font-bold text-gray-600 uppercase text-[11px] tracking-wider bg-gray-50/50 sticky top-0 z-10 w-[20%]">
                              Option
                            </th>
                            <th className="text-left px-5 py-4 font-bold text-gray-600 uppercase text-[11px] tracking-wider bg-gray-50/50 sticky top-0 z-10 w-[25%]">
                              Question
                            </th>
                            <th className="text-center px-5 py-4 font-bold text-gray-600 uppercase text-[11px] tracking-wider bg-gray-50/50 sticky top-0 z-10 w-[10%]">
                              Required
                            </th>
                            <th className="text-center px-5 py-4 font-bold text-gray-600 uppercase text-[11px] tracking-wider bg-gray-50/50 sticky top-0 z-10 w-[10%]">
                              Priority
                            </th>
                            <th className="text-right px-5 py-4 font-bold text-gray-600 uppercase text-[11px] tracking-wider bg-gray-50/50 sticky top-0 z-10 w-[15%]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedRules.map((rule) => {
                            const catStyle = getCategoryStyle(
                              rule.complianceItem?.category,
                            );
                            return (
                              <tr
                                key={rule.id}
                                className="hover:bg-[#F8FAFC] transition-colors group"
                              >
                                <td className="px-5 py-4 align-top">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-bold text-gray-900 text-[13px] line-clamp-2">
                                      {rule.complianceItem?.name || "—"}
                                    </span>
                                    <div className="flex flex-col gap-1">
                                      {rule.complianceItem?.category && (
                                        <span
                                          className={`inline-block w-fit px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                                        >
                                          {rule.complianceItem.category.replace(
                                            "_",
                                            " ",
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4 align-top">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium text-gray-800 text-[13px] line-clamp-2">
                                      {rule.option?.label || "—"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 align-top">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[13px] text-gray-700 line-clamp-3">
                                      {rule.option?.question?.text || "—"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-center align-top pt-5">
                                  <span
                                    className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                                      rule.isRequired
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                    }`}
                                  >
                                    {rule.isRequired ? "Yes" : "No"}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-center align-top pt-5">
                                  <span
                                    className={`text-sm font-semibold font-mono ${
                                      rule.priority > 0
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {rule.priority}
                                  </span>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEditRule(rule)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#00486D] bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 rounded-lg transition-colors"
                                    >
                                      <RiEditLine className="w-3.5 h-3.5" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRule(rule)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 rounded-lg transition-colors"
                                    >
                                      <RiDeleteBinLine className="w-3.5 h-3.5" />
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <PaginationControls />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
         MODAL: COMPLIANCE ITEM
      ════════════════════════════════════════════════════════════ */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowItemModal(false);
              setEditingItem(null);
            }}
          ></div>
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editingItem ? (
                  <RiEditLine className="w-5 h-5 text-[#00486D]" />
                ) : (
                  <RiAddLine className="w-5 h-5 text-[#00486D]" />
                )}
                {editingItem
                  ? "Edit Compliance Item"
                  : "Create Compliance Item"}
              </h2>
              <button
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={itemFormData.code}
                    onChange={handleItemInputChange}
                    disabled={!!editingItem}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 font-mono"
                    placeholder="e.g. GSTR3B_MONTHLY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={itemFormData.name}
                    onChange={handleItemInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                    placeholder="e.g. GSTR3B - Monthly"
                  />
                </div>
              </div>

              {showAddCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Add New Category
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCategory();
                        }
                        if (e.key === "Escape") {
                          setShowAddCategory(false);
                          setNewCategoryName("");
                        }
                      }}
                      autoFocus
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                      placeholder="e.g. Audit"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                      className="p-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Add category"
                    >
                      <RiCheckLine className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryName("");
                      }}
                      className="p-2.5 border border-gray-300 text-gray-500 rounded-xl hover:bg-gray-100 transition-all"
                      title="Cancel"
                    >
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={itemFormData.category}
                      onChange={(e) => {
                        if (e.target.value === "__add_new__") {
                          setShowAddCategory(true);
                          setNewCategoryName("");
                        } else {
                          handleItemInputChange(e);
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent bg-white appearance-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                      <option value="__add_new__">+ Add New Category</option>
                    </select>
                    <RiArrowDownSLine className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Annexure Type
                  </label>
                  <select
                    name="annexureType"
                    value={itemFormData.annexureType}
                    onChange={handleItemInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent bg-white"
                  >
                    <option value="1A">1A</option>
                    <option value="1B">1B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={itemFormData.description}
                  onChange={handleItemInputChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent resize-none"
                  placeholder="Due date or filing information..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reminders
                </label>
                <textarea
                  name="reminders"
                  value={itemFormData.reminders}
                  onChange={handleItemInputChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent resize-none"
                  placeholder="e.g. 15th, 17th, 19th Every Month"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                disabled={itemSaving}
                className="px-8 py-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {itemSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>{editingItem ? "Update Item" : "Create Item"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
         MODAL: COMPLIANCE RULE
      ════════════════════════════════════════════════════════════ */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowRuleModal(false);
              setEditingRule(null);
            }}
          ></div>
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editingRule ? (
                  <RiEditLine className="w-5 h-5 text-[#00486D]" />
                ) : (
                  <RiAddLine className="w-5 h-5 text-[#00486D]" />
                )}
                {editingRule
                  ? "Edit Compliance Rule"
                  : "Create Compliance Rule"}
              </h2>
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Compliance Item <span className="text-red-500">*</span>
                </label>
                <select
                  name="complianceItemId"
                  value={ruleFormData.complianceItemId}
                  onChange={handleRuleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent bg-white"
                >
                  <option value="">Select compliance item...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingRule && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Option ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="optionId"
                    value={ruleFormData.optionId}
                    onChange={handleRuleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent font-mono"
                    placeholder="e.g. opt_1a_gst_regular_monthly"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Condition ID{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="conditionId"
                  value={ruleFormData.conditionId}
                  onChange={handleRuleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent font-mono"
                  placeholder="Leave empty if no condition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Priority
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={ruleFormData.priority}
                    onChange={handleRuleInputChange}
                    min={0}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors w-full">
                    <input
                      type="checkbox"
                      name="isRequired"
                      checked={ruleFormData.isRequired}
                      onChange={handleRuleInputChange}
                      className="w-4 h-4 text-[#00486D] border-gray-300 rounded focus:ring-[#00486D] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Is Required
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRule}
                disabled={ruleSaving}
                className="px-8 py-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {ruleSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>{editingRule ? "Update Rule" : "Create Rule"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComplianceCMS;
