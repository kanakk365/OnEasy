import React, { useState, useEffect, useMemo } from "react";
import complianceApi from "../../../utils/complianceApi";
import { AUTH_CONFIG } from "../../../config/auth";
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

  // ─── Compliance Items State ───
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemSearch, setItemSearch] = useState("");

  // ─── Flow Tree State ───
  const [flowBranches, setFlowBranches] = useState([]);
  const [expandedBranches, setExpandedBranches] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeSaving, setNodeSaving] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: null,
    data: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
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
    fetchFlowTree();
  }, []);

  // Sync categories from fetched items (pick up any categories from DB that aren't in defaults)
  // Used for the filter bar category dropdown
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchFlowTree = async () => {
    try {
      let token = "";
      try {
        token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
      } catch {
        /* ignore */
      }
      if (!token) token = localStorage.getItem("token") || "";

      const response = await fetch(
        "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/flow/whimsical-db",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.ok) {
        const data = await response.json();
        setFlowBranches(data.branches || []);
      }
    } catch (e) {
      console.error("Error fetching whimsical-db flow tree:", e);
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
  const paginatedRules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRules.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRules, currentPage]);

  const totalPages = Math.ceil(
    (activeTab === "rules" ? filteredRules.length : 0) / itemsPerPage,
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
            {Math.min(currentPage * itemsPerPage, filteredRules.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">
            {filteredRules.length}
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

  const getCategoryStyle = (category) => {
    return (
      categoryColors[category] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      }
    );
  };

  // ─── Flow Tree Helpers ───
  const collectAllItems = (node) => {
    let list = [];
    if (node.items) list = [...list, ...node.items];
    if (node.subBranches)
      node.subBranches.forEach((sb) => {
        list = [...list, ...collectAllItems(sb)];
      });
    return list;
  };

  const toggleBranchExpand = (path) => {
    setExpandedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        const toRemove = [];
        next.forEach((p) => {
          if (p === path || p.startsWith(path + " > ")) toRemove.push(p);
        });
        toRemove.forEach((p) => next.delete(p));
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const filterBranches = (branches) => {
    if (!itemSearch) return branches;
    const q = itemSearch.toLowerCase();
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

  const handleSaveNode = async (e) => {
    e.preventDefault();
    setNodeSaving(true);
    try {
      if (selectedNode.type === "branch") {
        const payload = {
          heading: selectedNode.data.heading,
          order: Number(selectedNode.data.order),
        };
        if (selectedNode.action === "add_branch") {
          if (selectedNode.parentId) {
            payload.parentId = selectedNode.parentId;
          }
          await complianceApi.createWhimsicalBranch(payload);
        } else {
          await complianceApi.updateWhimsicalBranch(
            selectedNode.data.id,
            payload,
          );
        }
      } else if (selectedNode.type === "item") {
        const payload = {
          code: selectedNode.data.code,
          name: selectedNode.data.name,
          dueDateType: selectedNode.data.dueDateType || "MONTHLY",
          reminderType: selectedNode.data.dueDateType || "MONTHLY",
          order: Number(selectedNode.data.order),
        };

        if (payload.dueDateType === "MONTHLY") {
          payload.monthBasis = selectedNode.data.monthBasis || "NEXT_MONTH";
          payload.dueDate = parseInt(selectedNode.data.dueDate) || 20;
          if (typeof selectedNode.data.reminders === "string") {
            payload.reminders = selectedNode.data.reminders
              .split(",")
              .map((r) => parseInt(r.trim()))
              .filter((n) => !isNaN(n));
          } else {
            payload.reminders = selectedNode.data.reminders || [];
          }
        } else {
          try {
            payload.dueDate =
              typeof selectedNode.data.dueDate === "string"
                ? JSON.parse(selectedNode.data.dueDate)
                : selectedNode.data.dueDate;
          } catch (e) {
            payload.dueDate = selectedNode.data.dueDate;
          }

          try {
            payload.reminders =
              typeof selectedNode.data.reminders === "string"
                ? JSON.parse(selectedNode.data.reminders)
                : selectedNode.data.reminders;
          } catch (e) {
            payload.reminders = selectedNode.data.reminders;
          }
        }

        if (selectedNode.action === "add_item") {
          await complianceApi.createWhimsicalItem(
            selectedNode.branchId,
            payload,
          );
        } else {
          await complianceApi.updateWhimsicalItem(
            selectedNode.data.id,
            payload,
          );
        }
      }
      setSelectedNode(null);
      await fetchFlowTree();
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setNodeSaving(false);
    }
  };

  const handleDeleteBranch = (branch, e) => {
    if (e) e.stopPropagation();
    const message =
      branch.subBranches?.length > 0 || branch.items?.length > 0
        ? `"${branch.heading}" has sub-sections or items. Deleting it will remove all nested content. Are you sure?`
        : `Are you sure you want to delete the section "${branch.heading}"?`;
    setDeleteModal({ open: true, type: "branch", data: branch, message });
  };

  const handleDeleteItem = (item, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({
      open: true,
      type: "item",
      data: item,
      message: `Are you sure you want to delete the item "${item.name}"?`,
    });
  };

  const executeDelete = async () => {
    if (!deleteModal.data) return;
    setDeleteLoading(true);
    try {
      if (deleteModal.type === "branch") {
        await complianceApi.deleteWhimsicalBranch(deleteModal.data.id);
        if (selectedNode?.data?.id === deleteModal.data.id)
          setSelectedNode(null);
      } else {
        await complianceApi.deleteWhimsicalItem(deleteModal.data.id);
        if (selectedNode?.data?.id === deleteModal.data.id)
          setSelectedNode(null);
      }
      setDeleteModal({ open: false, type: null, data: null });
      await fetchFlowTree();
    } catch (err) {
      alert("Error deleting: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderBranch = (branch, parentPath = "", depth = 0) => {
    const path = parentPath
      ? `${parentPath} > ${branch.heading}`
      : branch.heading;
    const isExpanded = expandedBranches.has(path);
    const allItems = collectAllItems(branch);
    const totalCount = allItems.length;
    const hasChildren =
      (branch.subBranches && branch.subBranches.length > 0) ||
      (branch.items && branch.items.length > 0);

    return (
      <div key={path} className={`${depth === 0 ? "mb-2" : ""}`}>
        <div
          onClick={() => toggleBranchExpand(path)}
          className={`group flex items-center justify-between px-4 py-3 rounded-lg transition-all cursor-pointer ${
            isExpanded
              ? "bg-[#00486D]/5 border border-[#00486D]/20"
              : "bg-white border border-gray-200 hover:border-[#00486D]/30 hover:bg-gray-50"
          } ${
            selectedNode &&
            selectedNode.type === "branch" &&
            selectedNode.data.id === branch.id &&
            selectedNode.action === "edit"
              ? "ring-2 ring-[#00486D] shadow-sm"
              : ""
          }`}
          style={depth > 0 ? { marginLeft: `${depth * 16}px` } : {}}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              isExpanded ? (
                <RiArrowDownSLine className="text-[#00486D]" size={20} />
              ) : (
                <RiArrowRightSLine className="text-gray-400" size={20} />
              )
            ) : (
              <div className="w-5" />
            )}
            <span
              className={`text-sm font-semibold truncate ${
                isExpanded ? "text-[#00486D]" : "text-gray-800"
              }`}
            >
              {branch.heading}
            </span>
          </div>
          <div
            className="flex items-center gap-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-gray-400 mr-2">
              {totalCount} items
            </span>
            <div
              className={`flex items-center gap-1 transition-opacity ${selectedNode && selectedNode.type === "branch" && selectedNode.data.id === branch.id && selectedNode.action === "edit" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode({
                    type: "branch",
                    action: "edit",
                    data: { ...branch },
                  });
                }}
                className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium transition-colors border border-blue-200/50"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode({
                    type: "branch",
                    action: "add_branch",
                    parentId: branch.id,
                    data: {
                      heading: "",
                      order: (branch.subBranches?.length || 0) + 1,
                    },
                  });
                  // Auto expand when adding section
                  if (!isExpanded) toggleBranchExpand(path);
                }}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs font-medium transition-colors border border-emerald-200/50"
              >
                +Section
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode({
                    type: "item",
                    action: "add_item",
                    branchId: branch.id,
                    data: {
                      code: "",
                      name: "",
                      dueDateType: "MONTHLY",
                      monthBasis: "NEXT_MONTH",
                      dueDate: 20,
                      reminders: "",
                      order: (branch.items?.length || 0) + 1,
                    },
                  });
                  // Auto expand when adding item
                  if (!isExpanded) toggleBranchExpand(path);
                }}
                className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-xs font-medium transition-colors border border-purple-200/50"
              >
                +Item
              </button>
              <button
                onClick={(e) => handleDeleteBranch(branch, e)}
                className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium transition-colors border border-red-200/50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-1 space-y-1">
            {branch.subBranches &&
              branch.subBranches.map((sub) =>
                renderBranch(sub, path, depth + 1),
              )}
            {branch.items && branch.items.length > 0 && (
              <div
                className="mt-1"
                style={{ marginLeft: `${(depth + 1) * 16}px` }}
              >
                <div className="flex items-center justify-between px-3 py-1.5 mb-1">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {branch.items.length} item
                    {branch.items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {branch.items.map((item) => {
                  return (
                    <div
                      key={item.id || item.code}
                      onClick={() => {
                        let formattedDueDate = item.dueDate;
                        let formattedReminders = item.reminders;
                        if (item.dueDateType === "MONTHLY") {
                          if (Array.isArray(item.reminders)) {
                             formattedReminders = item.reminders.join(", ");
                          }
                        } else {
                          if (typeof item.dueDate === 'object') formattedDueDate = JSON.stringify(item.dueDate, null, 2);
                          if (typeof item.reminders === 'object') formattedReminders = JSON.stringify(item.reminders, null, 2);
                        }
                        setSelectedNode({
                          type: "item",
                          action: "edit",
                          data: { 
                            ...item,
                            dueDateType: item.dueDateType || "MONTHLY",
                            monthBasis: item.monthBasis || "NEXT_MONTH",
                            dueDate: formattedDueDate,
                            reminders: formattedReminders
                          },
                        });
                      }}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 group cursor-pointer ${
                        selectedNode &&
                        selectedNode.type === "item" &&
                        selectedNode.data.id === item.id &&
                        selectedNode.action === "edit"
                          ? "bg-blue-50/50 border border-blue-200 ring-1 ring-blue-500/20"
                          : "bg-white border border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${selectedNode && selectedNode.type === "item" && selectedNode.data.id === item.id && selectedNode.action === "edit" ? "text-blue-800" : "text-gray-800"}`}
                        >
                          {item.name}
                        </p>
                        {item.dueDate && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            <span className="font-semibold">Due:</span>{" "}
                            {item.dueDate}
                          </p>
                        )}
                        {item.reminders && (
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                            <span className="font-medium text-gray-500">
                              Reminders:
                            </span>{" "}
                            {item.reminders}
                          </p>
                        )}
                        {item.code && (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded mt-1.5 inline-block border border-gray-200">
                            {item.code}
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-2 transition-opacity ${selectedNode && selectedNode.type === "item" && selectedNode.data.id === item.id && selectedNode.action === "edit" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            let formattedDueDate = item.dueDate;
                            let formattedReminders = item.reminders;
                            if (item.dueDateType === "MONTHLY") {
                              if (Array.isArray(item.reminders)) {
                                 formattedReminders = item.reminders.join(", ");
                              }
                            } else {
                              if (typeof item.dueDate === 'object') formattedDueDate = JSON.stringify(item.dueDate, null, 2);
                              if (typeof item.reminders === 'object') formattedReminders = JSON.stringify(item.reminders, null, 2);
                            }
                            setSelectedNode({
                              type: "item",
                              action: "edit",
                              data: { 
                                ...item,
                                dueDateType: item.dueDateType || "MONTHLY",
                                monthBasis: item.monthBasis || "NEXT_MONTH",
                                dueDate: formattedDueDate,
                                reminders: formattedReminders
                              },
                            });
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/50 rounded-md text-xs font-semibold"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDeleteItem(item, e)}
                          className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 rounded-md text-xs font-semibold"
                          title="Delete"
                        >
                          Delete
                        </button>
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
              </div>

              {/* Content */}
              <div className="min-h-[400px] p-6 pt-6">
                {itemsLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D]"></div>
                    <p className="mt-4 text-gray-500 font-medium">
                      Loading compliance items...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column: Accordion Tree */}
                    <div className="flex-1 flex flex-col min-h-0 relative">
                      <div className="flex justify-end mb-4 absolute right-0 -top-12">
                        <button
                          onClick={() =>
                            setSelectedNode({
                              type: "branch",
                              action: "add_branch",
                              parentId: null,
                              data: {
                                heading: "",
                                order: flowBranches.length + 1,
                              },
                            })
                          }
                          className="text-xs font-semibold px-4 py-2 bg-blue-50 text-[#00486D] rounded-lg hover:bg-blue-100 shadow flex items-center gap-1 transition-colors"
                        >
                          <RiAddLine /> Add Root Section
                        </button>
                      </div>
                      <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                        {filterBranches(flowBranches).length > 0 ? (
                          filterBranches(flowBranches).map((branch) =>
                            renderBranch(branch),
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <RiSearchLine size={40} className="mb-3" />
                            <p className="text-sm">
                              No compliances found matching your search.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Editor Panel */}
                    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm relative">
                      {selectedNode ? (
                        <form
                          onSubmit={handleSaveNode}
                          className="flex flex-col h-full"
                        >
                          <div className="p-4 pb-3 border-b border-gray-200 flex justify-between items-center bg-[#01334c] text-white rounded-t-xl">
                            <h3 className="text-[16px] font-semibold tracking-wide">
                              {selectedNode.type === "branch"
                                ? selectedNode.action === "add_branch"
                                  ? "Add Section"
                                  : "Edit Section"
                                : selectedNode.action === "add_item"
                                  ? "Add Item"
                                  : "Edit Item"}
                            </h3>
                            <button
                              type="button"
                              onClick={() => setSelectedNode(null)}
                              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <RiCloseLine size={18} />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {selectedNode.type === "branch" && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Section Heading{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                    required
                                    value={selectedNode.data.heading}
                                    onChange={(e) =>
                                      setSelectedNode({
                                        ...selectedNode,
                                        data: {
                                          ...selectedNode.data,
                                          heading: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder="e.g. GST Returns"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Display Order
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                    required
                                    value={selectedNode.data.order}
                                    onChange={(e) =>
                                      setSelectedNode({
                                        ...selectedNode,
                                        data: {
                                          ...selectedNode.data,
                                          order: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </>
                            )}

                            {selectedNode.type === "item" && (
                              <>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Code <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all bg-gray-50 uppercase font-mono"
                                    required
                                    value={selectedNode.data.code}
                                    onChange={(e) =>
                                      setSelectedNode({
                                        ...selectedNode,
                                        data: {
                                          ...selectedNode.data,
                                          code: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder="e.g. GSTR1_MONTHLY"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                    required
                                    value={selectedNode.data.name}
                                    onChange={(e) =>
                                      setSelectedNode({
                                        ...selectedNode,
                                        data: {
                                          ...selectedNode.data,
                                          name: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Due Date Type
                                  </label>
                                  <select
                                    className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                    value={selectedNode.data.dueDateType || "MONTHLY"}
                                    onChange={(e) =>
                                      setSelectedNode({
                                        ...selectedNode,
                                        data: {
                                          ...selectedNode.data,
                                          dueDateType: e.target.value,
                                        },
                                      })
                                    }
                                  >
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="YEARLY">Yearly</option>
                                  </select>
                                </div>

                                {selectedNode.data.dueDateType === "MONTHLY" && (
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                      Month Basis
                                    </label>
                                    <select
                                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                      value={selectedNode.data.monthBasis || "NEXT_MONTH"}
                                      onChange={(e) =>
                                        setSelectedNode({
                                          ...selectedNode,
                                          data: {
                                            ...selectedNode.data,
                                            monthBasis: e.target.value,
                                          },
                                        })
                                      }
                                    >
                                      <option value="NEXT_MONTH">Next Month</option>
                                      <option value="THIS_MONTH">This Month</option>
                                    </select>
                                  </div>
                                )}

                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Due Date
                                  </label>
                                  {selectedNode.data.dueDateType === "MONTHLY" ? (
                                    <select
                                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                      value={selectedNode.data.dueDate || 1}
                                      onChange={(e) =>
                                        setSelectedNode({
                                          ...selectedNode,
                                          data: {
                                            ...selectedNode.data,
                                            dueDate: e.target.value,
                                          },
                                        })
                                      }
                                    >
                                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>{day}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <textarea
                                      className="w-full text-sm p-3 border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all resize-y text-xs"
                                      rows={4}
                                      value={typeof selectedNode.data.dueDate === 'string' ? selectedNode.data.dueDate : JSON.stringify(selectedNode.data.dueDate, null, 2)}
                                      onChange={(e) =>
                                        setSelectedNode({
                                          ...selectedNode,
                                          data: {
                                            ...selectedNode.data,
                                            dueDate: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder='Enter JSON (e.g. {"month": 10, "day": 31})'
                                    />
                                  )}
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Reminders{" "}
                                    <span className="text-gray-400 font-normal">
                                      (Optional)
                                    </span>
                                  </label>
                                  {selectedNode.data.dueDateType === "MONTHLY" ? (
                                    <input
                                      type="text"
                                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                      value={selectedNode.data.reminders}
                                      onChange={(e) =>
                                        setSelectedNode({
                                          ...selectedNode,
                                          data: {
                                            ...selectedNode.data,
                                            reminders: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="Comma separated days (e.g. 15, 17, 19)"
                                    />
                                  ) : (
                                    <textarea
                                      className="w-full text-sm p-3 border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all resize-y text-xs"
                                      rows={6}
                                      value={typeof selectedNode.data.reminders === 'string' ? selectedNode.data.reminders : JSON.stringify(selectedNode.data.reminders, null, 2)}
                                      onChange={(e) =>
                                        setSelectedNode({
                                          ...selectedNode,
                                          data: {
                                            ...selectedNode.data,
                                            reminders: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder='Enter JSON (e.g. [[8, 25], [9, 15]])'
                                    />
                                  )}
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Display Order
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                    required
                                    value={selectedNode.data.order}
                                    onChange={(e) =>
                                      setSelectedNode({
                                        ...selectedNode,
                                        data: {
                                          ...selectedNode.data,
                                          order: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-3 rounded-b-xl mt-auto">
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => setSelectedNode(null)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-white hover:border-gray-400 transition-colors shadow-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={nodeSaving}
                                className="flex-1 py-2.5 rounded-lg bg-[#01334C] text-white text-sm font-semibold hover:bg-[#00486D] disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
                              >
                                {nodeSaving ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                            {selectedNode.action === "edit" &&
                              selectedNode.data.id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedNode.type === "branch") {
                                      handleDeleteBranch(selectedNode.data);
                                    } else {
                                      handleDeleteItem(selectedNode.data);
                                    }
                                  }}
                                  className="w-full py-2.5 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 hover:border-red-400 transition-colors"
                                >
                                  <span className="flex items-center justify-center gap-2">
                                    <RiDeleteBinLine className="w-4 h-4" />
                                    Delete{" "}
                                    {selectedNode.type === "branch"
                                      ? "Section"
                                      : "Item"}
                                  </span>
                                </button>
                              )}
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 h-full text-center">
                          <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-105">
                            <RiEditLine className="w-8 h-8 text-blue-400" />
                          </div>
                          <h3 className="text-gray-900 font-semibold mb-2 text-lg">
                            Select to Edit
                          </h3>
                          <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed">
                            Click{" "}
                            <span className="font-semibold text-gray-700 bg-gray-100 px-1 rounded">
                              Edit
                            </span>{" "}
                            or{" "}
                            <span className="font-semibold text-gray-700 bg-gray-100 px-1 rounded">
                              + Add
                            </span>{" "}
                            on any section or item in the left panel to modify
                            the hierarchy structure.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={itemFormData.category}
                    onChange={handleItemInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                    placeholder="e.g. filing, return, payment, tax_filing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Annexure Type
                  </label>
                  <input
                    type="text"
                    name="annexureType"
                    value={itemFormData.annexureType}
                    onChange={handleItemInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                    placeholder="e.g. 1A, 1B"
                  />
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

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() =>
              !deleteLoading &&
              setDeleteModal({ open: false, type: null, data: null })
            }
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden z-[110] animate-in fade-in zoom-in-95">
            <div className="p-6 pb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <RiDeleteBinLine className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete {deleteModal.type === "branch" ? "Section" : "Item"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {deleteModal.message}
              </p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ open: false, type: null, data: null })
                }
                disabled={deleteLoading}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <RiDeleteBinLine className="w-4 h-4" />
                    Delete
                  </>
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
