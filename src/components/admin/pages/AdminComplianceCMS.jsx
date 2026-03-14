import React, { useState, useEffect } from "react";
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

  // ─── Categories State ───
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // ─── Compliance Items State ───
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemSearch, setItemSearch] = useState("");

  // ─── Flow Tree State ───
  const [flowBranches, setFlowBranches] = useState([]);
  const [flowBranches1B, setFlowBranches1B] = useState([]);
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



  // ─── Fetch Data ───
  useEffect(() => {
    fetchItems();
    fetchFlowTree();
    fetchFlowTree1B();
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

  const fetchFlowTree1B = async () => {
    try {
      let token = "";
      try {
        token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
      } catch {
        /* ignore */
      }
      if (!token) token = localStorage.getItem("token") || "";

      const response = await fetch(
        "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1b/flow/whimsical-db",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.ok) {
        const data = await response.json();
        setFlowBranches1B(data.branches || []);
      }
    } catch (e) {
      console.error("Error fetching annexure-1b whimsical-db flow tree:", e);
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



  // ─── Flow Tree Helpers ───

  /**
   * Derive dueDateType and format dueDate/reminders for the right-panel edit form.
   * The whimsical-db API may not include `dueDateType` explicitly — it's encoded
   * in `dueDateSchedule.type` ("monthly" / "quarterly" / "yearly").
   * Reminder days live in `reminderSchedule.days` (for monthly).
   */
  const resolveItemForEdit = (item) => {
    // Determine effective type: prefer explicit dueDateType, fall back to dueDateSchedule.type
    const scheduleType = (item.dueDateSchedule?.type || "").toUpperCase(); // e.g. "MONTHLY"
    const effectiveDueDateType = item.dueDateType || scheduleType || "";

    let formattedDueDate = null;
    let formattedReminders = null;

    if (effectiveDueDateType === "MONTHLY") {
      // Due date
      const dayFromSchedule = item.dueDateSchedule?.day;
      if (dayFromSchedule !== undefined) {
        formattedDueDate = dayFromSchedule;
      } else {
        formattedDueDate = parseInt(item.dueDate, 10) || 20;
      }

      // Reminders
      if (Array.isArray(item.reminderSchedule?.days)) {
        formattedReminders = [...item.reminderSchedule.days];
      } else {
        try {
          formattedReminders = JSON.parse(item.reminders);
        } catch {
          formattedReminders = typeof item.reminders === "string"
            ? item.reminders.split(",").map((r) => parseInt(r.match(/\d+/)?.[0] || 0, 10)).filter(Boolean)
            : [];
        }
      }
      if (!Array.isArray(formattedReminders)) formattedReminders = [];

    } else if (effectiveDueDateType === "QUARTERLY") {
      // Due Date
      let qDueDate = { Q1: { month: 7, day: 8 }, Q2: { month: 10, day: 8 }, Q3: { month: 1, day: 8 }, Q4: { month: 4, day: 8 } };
      if (item.dueDateSchedule && item.dueDateSchedule.quarters) {
        ["Q1", "Q2", "Q3", "Q4"].forEach(q => {
          if (item.dueDateSchedule.quarters[q]) {
            qDueDate[q] = { month: item.dueDateSchedule.quarters[q].month, day: item.dueDateSchedule.quarters[q].day };
          }
        });
      } else {
        try { 
          const parsed = typeof item.dueDate === "string" ? JSON.parse(item.dueDate) : item.dueDate;
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.Q1) qDueDate = parsed;
        } catch { /* ignore */ }
      }
      formattedDueDate = qDueDate;

      // Reminders
      let qReminders = { Q1: { month: qDueDate.Q1.month, days: [] }, Q2: { month: qDueDate.Q2.month, days: [] }, Q3: { month: qDueDate.Q3.month, days: [] }, Q4: { month: qDueDate.Q4.month, days: [] } };
      
      if (item.reminderSchedule && item.reminderSchedule.months) {
        // Map backend 'months' string keys to Q1-Q4 based on their due date months
        const expectedQuarterMonths = {
          Q1: qDueDate.Q1.month,
          Q2: qDueDate.Q2.month,
          Q3: qDueDate.Q3.month,
          Q4: qDueDate.Q4.month
        };
        ["Q1", "Q2", "Q3", "Q4"].forEach(q => {
          const m = expectedQuarterMonths[q];
          const daysArray = item.reminderSchedule.months[String(m)] || [];
          qReminders[q] = { month: m, days: Array.isArray(daysArray) ? [...daysArray] : [] };
        });
      } else {
        try {
          const parsed = typeof item.reminders === "string" ? JSON.parse(item.reminders) : item.reminders;
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.Q1) {
            ["Q1", "Q2", "Q3", "Q4"].forEach(q => {
              if (parsed[q]) {
                qReminders[q] = {
                  month: parseInt(parsed[q].month) || qDueDate[q].month,
                  days: Array.isArray(parsed[q].days) ? parsed[q].days : []
                };
              }
            });
          }
        } catch { /* ignore */ }
      }
      formattedReminders = qReminders;

    } else if (effectiveDueDateType === "YEARLY") {
      // Due Date
      let yDueDate = { month: 1, day: 1 };
      if (item.dueDateSchedule?.month && item.dueDateSchedule?.day) {
        yDueDate = { month: item.dueDateSchedule.month, day: item.dueDateSchedule.day };
      } else {
        try {
          const parsed = typeof item.dueDate === "string" ? JSON.parse(item.dueDate) : item.dueDate;
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.month) {
            yDueDate = parsed;
          }
        } catch { /* ignore */ }
      }
      formattedDueDate = yDueDate;

      // Reminders
      let yReminders = [];
      if (item.reminderSchedule && Array.isArray(item.reminderSchedule.dates)) {
        yReminders = item.reminderSchedule.dates.map(r => {
          if (Array.isArray(r)) return [parseInt(r[0]) || 1, parseInt(r[1]) || 1];
          if (r && typeof r === "object") return [parseInt(r.month) || 1, parseInt(r.day) || 1];
          return [1, 1];
        });
      } else {
        try {
          const parsed = typeof item.reminders === "string" ? JSON.parse(item.reminders) : item.reminders;
          if (Array.isArray(parsed)) {
            yReminders = parsed.map(r => {
              if (Array.isArray(r)) return [parseInt(r[0]) || 1, parseInt(r[1]) || 1];
              if (r && typeof r === "object") return [parseInt(r.month) || 1, parseInt(r.day) || 1];
              return [1, 1];
            });
          }
        } catch { /* ignore */ }
      }
      formattedReminders = yReminders;

    } else {
      if (typeof item.dueDate === "object") formattedDueDate = JSON.stringify(item.dueDate, null, 2);
      if (typeof item.reminders === "object") formattedReminders = JSON.stringify(item.reminders, null, 2);
    }

    return {
      ...item,
      dueDateType: effectiveDueDateType,
      monthBasis: item.monthBasis || item.dueDateSchedule?.monthBasis || "NEXT_MONTH",
      dueDate: formattedDueDate || item.dueDate,
      reminders: formattedReminders || item.reminders || [],
    };
  };

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
    const annexure = activeTab === "rules" ? "1b" : "1a";
    try {
      if (selectedNode.type === "branch") {
        const payload = {
          heading: selectedNode.data.heading,
          order: Number(selectedNode.data.order),
          parentId: selectedNode.action === "add_branch" 
                    ? (selectedNode.parentId || null) 
                    : (selectedNode.data.parentId || null),
        };
        if (selectedNode.action === "add_branch") {
          await complianceApi.createWhimsicalBranch(payload, annexure);
        } else {
          await complianceApi.updateWhimsicalBranch(
            selectedNode.data.id,
            payload,
            annexure,
          );
        }
      } else if (selectedNode.type === "item") {
        const payload = {
          code: selectedNode.data.code,
          name: selectedNode.data.name,
          order: Number(selectedNode.data.order),
        };

        if (annexure === "1a") {
          const dueDateType = selectedNode.data.dueDateType || "MONTHLY";
          payload.dueDateType = dueDateType;
          payload.reminderType = dueDateType;

          const cleanQData = (obj, isReminder) => {
            if (!obj || typeof obj !== "object") return obj;
            const res = {};
            ["Q1", "Q2", "Q3", "Q4"].forEach((q) => {
              if (obj[q]) {
                if (isReminder) {
                  res[q] = {
                    month: parseInt(obj[q].month) || 1,
                    days: Array.isArray(obj[q].days)
                      ? obj[q].days.map((d) => parseInt(d)).filter((n) => !isNaN(n))
                      : [],
                  };
                } else {
                  res[q] = {
                    month: parseInt(obj[q].month) || 1,
                    day: parseInt(obj[q].day) || 1,
                  };
                }
              }
            });
            return res;
          };

          if (dueDateType === "QUARTERLY") {
            payload.dueDate = cleanQData(selectedNode.data.dueDate, false);
            payload.reminders = cleanQData(selectedNode.data.reminders, true);
          } else if (dueDateType === "YEARLY") {
            payload.dueDate = {
              month: parseInt(selectedNode.data.dueDate?.month) || 1,
              day: parseInt(selectedNode.data.dueDate?.day) || 1,
            };
            if (Array.isArray(selectedNode.data.reminders)) {
              payload.reminders = selectedNode.data.reminders.map((r) => [
                parseInt(r[0]) || 1,
                parseInt(r[1]) || 1,
              ]);
            } else {
              payload.reminders = [];
            }
          } else {
            // MONTHLY
            payload.monthBasis = selectedNode.data.monthBasis || "NEXT_MONTH";
            payload.dueDate = parseInt(selectedNode.data.dueDate) || 20;

            if (Array.isArray(selectedNode.data.reminders)) {
              payload.reminders = selectedNode.data.reminders
                .map((r) => parseInt(r))
                .filter((n) => !isNaN(n));
            } else if (typeof selectedNode.data.reminders === "string") {
              try {
                payload.reminders = JSON.parse(selectedNode.data.reminders)
                  .map((r) => parseInt(r))
                  .filter((n) => !isNaN(n));
              } catch {
                payload.reminders = selectedNode.data.reminders
                  .split(",")
                  .map((r) => parseInt(r.trim()))
                  .filter((n) => !isNaN(n));
              }
            } else {
              payload.reminders = [];
            }
          }
        } else {
          // 1b annexure — generic fallback
          try {
            payload.dueDate =
              typeof selectedNode.data.dueDate === "string"
                ? JSON.parse(selectedNode.data.dueDate)
                : selectedNode.data.dueDate;
          } catch {
            payload.dueDate = selectedNode.data.dueDate;
          }

          try {
            payload.reminders =
              typeof selectedNode.data.reminders === "string"
                ? JSON.parse(selectedNode.data.reminders)
                : selectedNode.data.reminders;
          } catch {
            payload.reminders = selectedNode.data.reminders;
          }
        } // End annexure-specific payload

        if (selectedNode.action === "add_item") {
          await complianceApi.createWhimsicalItem(
            selectedNode.branchId,
            payload,
            annexure,
          );
        } else {
          await complianceApi.updateWhimsicalItem(
            selectedNode.data.id,
            payload,
            annexure,
          );
        }
      }
      setSelectedNode(null);
      if (annexure === "1b") await fetchFlowTree1B();
      else await fetchFlowTree();
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
    const annexure = activeTab === "rules" ? "1b" : "1a";
    try {
      if (deleteModal.type === "branch") {
        await complianceApi.deleteWhimsicalBranch(deleteModal.data.id, annexure);
        if (selectedNode?.data?.id === deleteModal.data.id)
          setSelectedNode(null);
      } else {
        await complianceApi.deleteWhimsicalItem(deleteModal.data.id, annexure);
        if (selectedNode?.data?.id === deleteModal.data.id)
          setSelectedNode(null);
      }
      setDeleteModal({ open: false, type: null, data: null });
      if (annexure === "1b") await fetchFlowTree1B();
      else await fetchFlowTree();
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
            selectedNode.data.id === branch.id
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
              className={`flex items-center gap-1 transition-opacity ${selectedNode && selectedNode.type === "branch" && selectedNode.data.id === branch.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
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
                      dueDateType: "",
                      monthBasis: "NEXT_MONTH",
                      dueDate: "",
                      reminders: [],
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
                          setSelectedNode({
                            type: "item",
                            action: "edit",
                            data: resolveItemForEdit(item),
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
                            setSelectedNode({
                              type: "item",
                              action: "edit",
                              data: resolveItemForEdit(item),
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
            onClick={handleCreateItem}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg font-medium"
          >
            <RiAddLine className="w-5 h-5" />
            <span>
              Add Compliance Item
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
              <span>1a compliance</span>
              <span
                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "items"
                    ? "bg-[#01334C] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {flowBranches.length}
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
              <span>1b compliance</span>
              <span
                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "rules"
                    ? "bg-[#01334C] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {flowBranches1B.length}
              </span>
              {activeTab === "rules" && (
                <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#01334C] rounded-t-full" />
              )}
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════
             TAB: COMPLIANCE ITEMS (1A and 1B)
          ════════════════════════════════════════════════════════════ */}
          {(activeTab === "items" || activeTab === "rules") && (() => {
            const activeFlowBranches = activeTab === "items" ? flowBranches : flowBranches1B;
            return (
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
                                order: activeFlowBranches.length + 1,
                              },
                            })
                          }
                          className="text-xs font-semibold px-4 py-2 bg-blue-50 text-[#00486D] rounded-lg hover:bg-blue-100 shadow flex items-center gap-1 transition-colors"
                        >
                          <RiAddLine /> Add Root Section
                        </button>
                      </div>
                      <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                        {filterBranches(activeFlowBranches).length > 0 ? (
                          filterBranches(activeFlowBranches).map((branch) =>
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
                                
                                {activeTab === "items" && (
                                <React.Fragment>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-0.5">
                                    Due Date Type
                                  </label>
                                  <select
                                    className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                    value={selectedNode.data.dueDateType || ""}
                                    onChange={(e) => {
                                      const newType = e.target.value;
                                      let newDueDate = selectedNode.data.dueDate;
                                      let newReminders = selectedNode.data.reminders;
                                      
                                      if (newType === "QUARTERLY" && selectedNode.data.dueDateType !== "QUARTERLY") {
                                        newDueDate = {
                                          Q1: { month: 6, day: 30 },
                                          Q2: { month: 9, day: 30 },
                                          Q3: { month: 12, day: 31 },
                                          Q4: { month: 3, day: 31 }
                                        };
                                        newReminders = {
                                          Q1: { month: 6, days: [] },
                                          Q2: { month: 9, days: [] },
                                          Q3: { month: 12, days: [] },
                                          Q4: { month: 3, days: [] }
                                        };
                                      } else if (newType === "YEARLY" && selectedNode.data.dueDateType !== "YEARLY") {
                                        newDueDate = { month: 1, day: 1 };
                                        newReminders = [];
                                      } else if (newType === "MONTHLY" && selectedNode.data.dueDateType !== "MONTHLY") {
                                        newDueDate = 20;
                                        newReminders = [15];
                                      }
                                      
                                      setSelectedNode({
                                        ...selectedNode,
                                        data: {
                                          ...selectedNode.data,
                                          dueDateType: newType,
                                          dueDate: newDueDate,
                                          reminders: newReminders
                                        },
                                      });
                                    }}
                                  >
                                    <option value="" disabled>Select Due Date Type</option>
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
                                  ) : selectedNode.data.dueDateType === "QUARTERLY" && typeof selectedNode.data.dueDate === 'object' && selectedNode.data.dueDate !== null ? (
                                    <div className="space-y-3">
                                      {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                                        <div key={`dueDate-${q}`} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                          <div className="w-10 font-bold text-gray-700 text-sm">{q}</div>
                                          <div className="flex-1">
                                            <select
                                              className="w-full text-sm p-2 bg-white border border-gray-200 rounded shadow-sm outline-none"
                                              value={selectedNode.data.dueDate[q]?.month || 1}
                                              onChange={(e) => {
                                                const newDueDate = { ...selectedNode.data.dueDate };
                                                newDueDate[q] = { ...newDueDate[q], month: e.target.value };
                                                setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, dueDate: newDueDate } });
                                              }}
                                            >
                                              {[
                                                "January", "February", "March", "April", "May", "June", 
                                                "July", "August", "September", "October", "November", "December"
                                              ].map((monthName, i) => (
                                                <option key={i+1} value={i+1}>{monthName}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className="flex-1">
                                            <select
                                              className="w-full text-sm p-2 bg-white border border-gray-200 rounded shadow-sm outline-none"
                                              value={selectedNode.data.dueDate[q]?.day || 1}
                                              onChange={(e) => {
                                                const newDueDate = { ...selectedNode.data.dueDate };
                                                newDueDate[q] = { ...newDueDate[q], day: e.target.value };
                                                setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, dueDate: newDueDate } });
                                              }}
                                            >
                                              {[...Array(31)].map((_, i) => (
                                                <option key={i+1} value={i+1}>Day {i+1}</option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : selectedNode.data.dueDateType === "YEARLY" && typeof selectedNode.data.dueDate === 'object' && selectedNode.data.dueDate !== null ? (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                      <div className="flex-1">
                                        <select
                                          className="w-full text-sm p-2 bg-white border border-gray-200 rounded shadow-sm outline-none"
                                          value={selectedNode.data.dueDate.month || 1}
                                          onChange={(e) => {
                                            setSelectedNode({
                                              ...selectedNode,
                                              data: { ...selectedNode.data, dueDate: { ...selectedNode.data.dueDate, month: e.target.value } }
                                            });
                                          }}
                                        >
                                          {[
                                            "January", "February", "March", "April", "May", "June", 
                                            "July", "August", "September", "October", "November", "December"
                                          ].map((monthName, i) => (
                                            <option key={i+1} value={i+1}>{monthName}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="flex-1">
                                        <select
                                          className="w-full text-sm p-2 bg-white border border-gray-200 rounded shadow-sm outline-none"
                                          value={selectedNode.data.dueDate.day || 1}
                                          onChange={(e) => {
                                            setSelectedNode({
                                              ...selectedNode,
                                              data: { ...selectedNode.data, dueDate: { ...selectedNode.data.dueDate, day: e.target.value } }
                                            });
                                          }}
                                        >
                                          {[...Array(31)].map((_, i) => (
                                            <option key={i+1} value={i+1}>Day {i+1}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
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
                                  <label className="block text-xs font-semibold text-gray-700 mb-2 ml-0.5 mt-1">
                                    Reminders{" "}
                                    <span className="text-gray-400 font-normal">
                                      (Optional)
                                    </span>
                                  </label>
                                  {selectedNode.data.dueDateType === "MONTHLY" ? (
                                    <div className="space-y-2">
                                      {Array.isArray(selectedNode.data.reminders) ? (
                                        selectedNode.data.reminders.map((reminderValue, idx) => (
                                          <div key={`reminder-${idx}`} className="flex items-center gap-2">
                                            <input
                                              type="number"
                                              min="1"
                                              max="31"
                                              className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00486D]/30 focus:border-[#00486D] outline-none transition-all"
                                              value={reminderValue}
                                              onChange={(e) => {
                                                const newReminders = [...selectedNode.data.reminders];
                                                newReminders[idx] = e.target.value;
                                                setSelectedNode({
                                                  ...selectedNode,
                                                  data: {
                                                    ...selectedNode.data,
                                                    reminders: newReminders,
                                                  },
                                                });
                                              }}
                                              placeholder="Day (e.g. 15)"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newReminders = selectedNode.data.reminders.filter((_, i) => i !== idx);
                                                setSelectedNode({
                                                  ...selectedNode,
                                                  data: { ...selectedNode.data, reminders: newReminders }
                                                });
                                              }}
                                              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex-shrink-0"
                                            >
                                              <RiDeleteBinLine className="w-4 h-4" />
                                            </button>
                                          </div>
                                        ))
                                      ) : null}
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = Array.isArray(selectedNode.data.reminders) ? selectedNode.data.reminders : [];
                                          setSelectedNode({
                                            ...selectedNode,
                                            data: { ...selectedNode.data, reminders: [...current, ""] }
                                          });
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#00486D] bg-blue-50/50 border border-blue-100/50 hover:bg-blue-100 hover:border-blue-200 rounded-lg transition-colors w-full justify-center"
                                      >
                                        <RiAddLine className="w-4 h-4" />
                                        Add Reminder Day
                                      </button>
                                    </div>
                                  ) : selectedNode.data.dueDateType === "QUARTERLY" ? (
                                    <div className="space-y-4">
                                      {["Q1", "Q2", "Q3", "Q4"].map((q) => {
                                        const qReminders = selectedNode.data.reminders[q] || { month: 1, days: [] };
                                        return (
                                          <div key={`rem-${q}`} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                                            <div className="flex items-center gap-2">
                                              <div className="w-10 font-bold text-gray-700 text-sm">{q}</div>
                                              <div className="flex-1 text-sm font-semibold text-gray-700">Days to Trigger Reminder</div>
                                            </div>
                                            <div className="pl-12 space-y-2">
                                              {Array.isArray(qReminders.days) && qReminders.days.map((dayVal, idx) => (
                                                <div key={`rem-${q}-day-${idx}`} className="flex items-center gap-2">
                                                  <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    className="flex-1 text-sm p-2 bg-white border border-gray-200 rounded shadow-sm outline-none focus:ring-2 focus:ring-[#00486D]/30"
                                                    value={dayVal}
                                                    onChange={(e) => {
                                                      const newReminders = { ...selectedNode.data.reminders };
                                                      const newDays = [...(qReminders.days || [])];
                                                      newDays[idx] = e.target.value;
                                                      newReminders[q] = { ...qReminders, days: newDays };
                                                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, reminders: newReminders } });
                                                    }}
                                                    placeholder="Day (e.g. 15)"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const newReminders = { ...selectedNode.data.reminders };
                                                      const newDays = qReminders.days.filter((_, i) => i !== idx);
                                                      newReminders[q] = { ...qReminders, days: newDays };
                                                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, reminders: newReminders } });
                                                    }}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                  >
                                                    <RiDeleteBinLine className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              ))}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newReminders = { ...selectedNode.data.reminders };
                                                  const newDays = [...(qReminders.days || []), ""];
                                                  newReminders[q] = { ...qReminders, days: newDays };
                                                  setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, reminders: newReminders } });
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#00486D] bg-blue-50/50 border border-blue-100/50 hover:bg-blue-100 rounded-lg transition-colors justify-center w-full"
                                              >
                                                <RiAddLine className="w-4 h-4" />
                                                Add Day
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : selectedNode.data.dueDateType === "YEARLY" ? (
                                    <div className="space-y-4">
                                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                                        <div className="space-y-2">
                                          {(Array.isArray(selectedNode.data.reminders) ? selectedNode.data.reminders : []).map((remPair, idx) => (
                                            <div key={`rem-y-${idx}`} className="flex items-center gap-2">
                                              <select
                                                className="flex-1 text-sm p-2 bg-white border border-gray-200 rounded shadow-sm outline-none focus:ring-2 focus:ring-[#00486D]/30"
                                                value={remPair[0] || 1}
                                                onChange={(e) => {
                                                  const newReminders = [...selectedNode.data.reminders];
                                                  newReminders[idx] = [e.target.value, remPair[1]];
                                                  setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, reminders: newReminders } });
                                                }}
                                              >
                                                {[
                                                  "January", "February", "March", "April", "May", "June", 
                                                  "July", "August", "September", "October", "November", "December"
                                                ].map((monthName, i) => (
                                                  <option key={i+1} value={i+1}>{monthName}</option>
                                                ))}
                                              </select>
                                              <select
                                                className="flex-1 text-sm p-2 bg-white border border-gray-200 rounded shadow-sm outline-none focus:ring-2 focus:ring-[#00486D]/30"
                                                value={remPair[1] || 1}
                                                onChange={(e) => {
                                                  const newReminders = [...selectedNode.data.reminders];
                                                  newReminders[idx] = [remPair[0], e.target.value];
                                                  setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, reminders: newReminders } });
                                                }}
                                              >
                                                {[...Array(31)].map((_, i) => (
                                                  <option key={i+1} value={i+1}>Day {i+1}</option>
                                                ))}
                                              </select>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newReminders = selectedNode.data.reminders.filter((_, i) => i !== idx);
                                                  setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, reminders: newReminders } });
                                                }}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                              >
                                                <RiDeleteBinLine className="w-4 h-4" />
                                              </button>
                                            </div>
                                          ))}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newReminders = [...selectedNode.data.reminders, [1, 1]];
                                              setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, reminders: newReminders } });
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#00486D] bg-blue-50/50 border border-blue-100/50 hover:bg-blue-100 rounded-lg transition-colors justify-center w-full"
                                          >
                                            <RiAddLine className="w-4 h-4" />
                                            Add Reminder Date
                                          </button>
                                        </div>
                                      </div>
                                    </div>
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
                                </React.Fragment>
                                )}
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
            );
          })()}


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
