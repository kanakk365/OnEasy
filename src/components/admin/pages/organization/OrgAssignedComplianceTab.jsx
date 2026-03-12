import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiBell,
  FiList,
  FiCalendar,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import apiClient from "../../../../utils/api";
import SuccessModal from "../../../common/SuccessModal";
import ConfirmationModal from "../../../common/ConfirmationModal";

const API_DELETE_URL =
  "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/user-compliances";

const API_DELETE_INSTANCE_URL =
  "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/instances";

// ─── Calendar Constants ───────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATEGORY_DOT_COLORS = {
  return: "#10b981",
  payment: "#f59e0b",
  tax_filing: "#ef4444",
  filing: "#3b82f6",
};

// ─── Component ────────────────────────────────────────────────────────────────
const OrgAssignedComplianceTab = ({ userId, org }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  // View mode: "list" | "calendar"
  const [viewMode, setViewMode] = useState("list");

  // States for the details view
  const [instances, setInstances] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [saving, setSaving] = useState(false);
  const [successfulSave, setSuccessfulSave] = useState(false);

  // States for multi-select delete
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // States for individual instance delete
  const [instanceToDelete, setInstanceToDelete] = useState(null);
  const [showInstanceDeleteConfirm, setShowInstanceDeleteConfirm] =
    useState(false);
  const [deletingInstance, setDeletingInstance] = useState(false);

  // Calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const token = apiClient.getToken();
      if (!token) throw new Error("No auth token found");

      const response = await fetch(
        `https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/user-compliances?userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();
      const allItems = data.items || [];
      const orgAssignments = allItems.filter((item) => {
        const assignmentOrg = item.organisation;
        if (!assignmentOrg || !org) return false;
        return (
          String(assignmentOrg.id) === String(org.id) ||
          (assignmentOrg.legalName === org.legalName &&
            assignmentOrg.gstin === org.gstin) ||
          (assignmentOrg.legal_name === org.legalName &&
            assignmentOrg.gstin === org.gstin)
        );
      });
      setAssignments(orgAssignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError(err.message || "Failed to load compliance assignments");
    } finally {
      setLoading(false);
    }
  }, [userId, org]);

  useEffect(() => {
    if (userId) fetchAssignments();
  }, [userId, fetchAssignments]);

  // ─── Compliance Detail Handlers ─────────────────────────────────────────────
  const handleComplianceClick = (assignment) => {
    setSelectedCompliance(assignment);
    const sortedInstances = [...(assignment.instances || [])].sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    );
    setInstances(sortedInstances);
    setPendingUpdates({});
  };

  const handleBack = () => {
    setSelectedCompliance(null);
    setInstances([]);
    setPendingUpdates({});
  };

  const toggleInstanceStatus = (instanceId, currentStatus) => {
    setPendingUpdates((prev) => ({
      ...prev,
      [instanceId]: !currentStatus,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = apiClient.getToken();
      const doneInstanceIds = instances
        .filter((inst) => {
          if (pendingUpdates[inst.id] !== undefined)
            return pendingUpdates[inst.id];
          return inst.isDone;
        })
        .map((inst) => inst.id);

      if (doneInstanceIds.length === 0) {
        alert("No instances selected to mark as done.");
        setSaving(false);
        return;
      }

      const response = await fetch(
        "https://oneasycompliance.oneasy.ai/admin/compliance/annexure-1a/mark-instances-done",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ instanceIds: doneInstanceIds }),
        },
      );

      if (!response.ok) throw new Error("Failed to update status");

      await fetchAssignments();
      setSuccessfulSave(true);
      setPendingUpdates({});
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessfulSave(false);
    handleBack();
  };

  // ─── Delete Handlers ────────────────────────────────────────────────────────
  const toggleDeleteSelection = (complianceCode) => {
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(complianceCode)) next.delete(complianceCode);
      else next.add(complianceCode);
      return next;
    });
  };

  const handleDeleteClick = () => {
    if (selectedForDelete.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      const token = apiClient.getToken();
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(API_DELETE_URL, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          orgId: String(org.id),
          complianceCodes: Array.from(selectedForDelete),
        }),
      });

      if (!response.ok) throw new Error("Failed to delete compliances");

      setDeleteSuccess(true);
      setSelectedForDelete(new Set());
      await fetchAssignments();
    } catch (err) {
      console.error("Error deleting compliances:", err);
      alert(`❌ Failed to delete: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Instance Delete Handlers ──────────────────────────────────────────────
  const handleInstanceDeleteClick = (instance) => {
    setInstanceToDelete(instance);
    setShowInstanceDeleteConfirm(true);
  };

  const handleConfirmInstanceDelete = async () => {
    if (!instanceToDelete) return;
    setShowInstanceDeleteConfirm(false);
    setDeletingInstance(true);
    try {
      const token = apiClient.getToken();
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${API_DELETE_INSTANCE_URL}/${instanceToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to delete instance");

      // Remove instance from local state
      setInstances((prev) => prev.filter((i) => i.id !== instanceToDelete.id));
      setInstanceToDelete(null);
      // Refresh the full list in background
      fetchAssignments();
    } catch (err) {
      console.error("Error deleting instance:", err);
      alert(`❌ Failed to delete instance: ${err.message}`);
    } finally {
      setDeletingInstance(false);
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const formatCategory = (cat) => cat?.replace(/_/g, " ") || "General";

  const getPillLabel = (instance, idx, category) => {
    if (category.toLowerCase().includes("quarter")) return `Q${(idx % 4) + 1}`;
    const date = new Date(instance.dueDate);
    if (!isNaN(date)) return date.toLocaleString("default", { month: "short" });
    return instance.yearMonth;
  };

  // ─── Calendar Helpers ───────────────────────────────────────────────────────
  const prevMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
    setSelectedDate(null);
  }, []);

  const nextMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    const t = new Date();
    setCalMonth(t.getMonth());
    setCalYear(t.getFullYear());
    setSelectedDate(null);
  }, []);

  // Build dateKey -> events map from all assignments
  const calendarEvents = useMemo(() => {
    const map = {};
    assignments.forEach((assignment) => {
      const compName = assignment.compliance?.name || "Compliance";
      const compCode = assignment.compliance?.code;
      const category = assignment.compliance?.category;
      const reminders = assignment.compliance?.reminders || null;
      const type =
        category === "return"
          ? "Return"
          : category === "payment"
            ? "Payment"
            : category === "tax_filing"
              ? "Tax Filing"
              : "Other";

      (assignment.instances || []).forEach((instance, idx) => {
        if (!instance.dueDate) return;
        const dt = new Date(instance.dueDate);
        if (isNaN(dt)) return;

        const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        if (!map[key]) map[key] = [];

        const catForPill = formatCategory(category);
        const label = getPillLabel(instance, idx, catForPill);

        map[key].push({
          complianceName: compName,
          complianceCode: compCode,
          category,
          type,
          reminders,
          period: label,
          dueDate: dt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          status: instance.isDone ? "Done" : "Pending",
          assignmentObj: assignment,
        });
      });
    });
    return map;
  }, [assignments]);

  // Build the calendar grid for the current month
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();
    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--)
      cells.push({ day: daysInPrevMonth - i, currentMonth: false, date: null });

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${calYear}-${calMonth}-${d}`;
      cells.push({
        day: d,
        currentMonth: true,
        date: new Date(calYear, calMonth, d),
        events: calendarEvents[key] || [],
        key,
      });
    }

    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++)
      cells.push({ day: i, currentMonth: false, date: null });

    return cells;
  }, [calYear, calMonth, calendarEvents]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return calendarEvents[key] || [];
  }, [selectedDate, calendarEvents]);

  const isToday = (date) => {
    if (!date) return false;
    const t = new Date();
    return (
      date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // ─── Org Stats ──────────────────────────────────────────────────────────────
  const totalInstances = assignments.reduce(
    (s, a) => s + (a.instances?.length || 0),
    0,
  );
  const doneInstances = assignments.reduce(
    (s, a) => s + (a.instances?.filter((i) => i.isDone).length || 0),
    0,
  );
  const pendingInstances = totalInstances - doneInstances;

  // ─── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
        <p>Error: {error}</p>
        <button onClick={fetchAssignments} className="mt-4 underline">
          Retry
        </button>
      </div>
    );
  }

  // ─── Detail / Tracker View ──────────────────────────────────────────────────
  if (selectedCompliance) {
    const categoryName = formatCategory(
      selectedCompliance.compliance?.category,
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {selectedCompliance.compliance?.name} Tracker
          </h2>
        </div>

        {/* Reminders Info Card */}
        {selectedCompliance.compliance?.reminders && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiBell className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">
                Reminders
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCompliance.compliance.reminders
                .split(",")
                .map((reminder, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white text-amber-800 border border-amber-200 shadow-sm"
                  >
                    <FiBell className="w-3 h-3 mr-1.5 text-amber-500" />
                    {reminder.trim()}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <p className="text-gray-500 italic mb-6">
              Configure compliance periods ({instances.length} items)
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-[#00486D] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Period
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold w-24">
                      Action
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold w-16">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {instances.map((instance, idx) => {
                    const date = new Date(instance.dueDate);
                    const formattedDate = !isNaN(date)
                      ? date.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : instance.dueDate;

                    // Format yearMonth (e.g. "2026-03") as full name: "March 2026"
                    const periodLabel = (() => {
                      if (instance.yearMonth) {
                        const [, mo] = instance.yearMonth.split("-");
                        const monthNames = [
                          "January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"
                        ];
                        const monthIndex = parseInt(mo, 10) - 1;
                        if (monthIndex >= 0 && monthIndex < 12) {
                          return monthNames[monthIndex];
                        }
                      }
                      return instance.yearMonth || getPillLabel(instance, idx, categoryName);
                    })();

                    const isDone =
                      pendingUpdates[instance.id] !== undefined
                        ? pendingUpdates[instance.id]
                        : instance.isDone;

                    return (
                      <tr
                        key={instance.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {periodLabel}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isDone
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isDone ? "Completed" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() =>
                                toggleInstanceStatus(instance.id, isDone)
                              }
                              className="w-5 h-5 rounded border-gray-300 text-[#00486D] focus:ring-[#00486D] cursor-pointer"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleInstanceDeleteClick(instance)}
                            disabled={deletingInstance}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete instance"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-[#00486D] text-white text-sm font-semibold rounded-lg hover:bg-[#003855] disabled:opacity-70 transition-colors shadow-lg shadow-blue-900/10"
              >
                {saving ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          </div>
        </div>

        <SuccessModal
          isOpen={successfulSave}
          onClose={handleSuccessModalClose}
          title="Success"
          message="Progress saved successfully!"
        />

        <ConfirmationModal
          isOpen={showInstanceDeleteConfirm}
          onClose={() => {
            setShowInstanceDeleteConfirm(false);
            setInstanceToDelete(null);
          }}
          onConfirm={handleConfirmInstanceDelete}
          title="Delete Instance"
          message={`Are you sure you want to delete this compliance instance? This action cannot be undone.`}
        />
      </div>
    );
  }

  // ─── Org Display Name ───────────────────────────────────────────────────────
  const orgDisplayName =
    org.legalName !== "-"
      ? org.legalName
      : org.tradeName !== "-"
        ? org.tradeName
        : "Organisation";

  // ─── Main View (List + Calendar) ─────────────────────────────────────────────
  return (
    <div className="space-y-6 relative">
      {/* Header row: org name + view toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
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
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {orgDisplayName}
            </h2>
            <p className="text-xs text-gray-500">
              {assignments.length} compliance(s) assigned
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === "list"
                ? "bg-white text-[#022B51] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiList className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === "calendar"
                ? "bg-white text-[#022B51] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiCalendar className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl border border-green-100">
          <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs font-semibold text-green-700">
            {doneInstances} Done
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
          <FiClock className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-700">
            {pendingInstances} Pending
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-xs font-semibold text-gray-500">
            {totalInstances} Total
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LIST VIEW
      ══════════════════════════════════════════ */}
      {viewMode === "list" && (
        <>
          {assignments.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const allCodes = assignments
                    .map((a) => a.compliance?.code)
                    .filter(Boolean);
                  const allSelected = allCodes.every((c) =>
                    selectedForDelete.has(c),
                  );
                  if (allSelected) setSelectedForDelete(new Set());
                  else setSelectedForDelete(new Set(allCodes));
                }}
                className="text-sm font-medium text-[#00486D] hover:text-[#003855] hover:underline transition-colors"
              >
                {assignments
                  .map((a) => a.compliance?.code)
                  .filter(Boolean)
                  .every((c) => selectedForDelete.has(c))
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          )}

          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                No compliances assigned to this organisation yet.
              </div>
            ) : (
              assignments.map((assignment) => {
                const completedCount = assignment.instances.filter(
                  (i) => i.isDone,
                ).length;
                const totalCount = assignment.instances.length;
                const category = formatCategory(
                  assignment.compliance?.category,
                );
                const compCode = assignment.compliance?.code;
                const isItemSelected =
                  compCode && selectedForDelete.has(compCode);

                return (
                  <div
                    key={assignment.id}
                    className={`bg-white border rounded-xl p-6 hover:shadow-md transition-all ${
                      isItemSelected
                        ? "border-red-300 bg-red-50/30 shadow-sm"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isItemSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (compCode) toggleDeleteSelection(compCode);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer flex-shrink-0"
                        />
                        <h3 className="text-lg font-bold text-gray-900">
                          {assignment.compliance?.name}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize border border-gray-200">
                          {category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                          Status
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {completedCount} of {totalCount} completed
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                      {assignment.compliance?.description ||
                        `${category} Compliance`}
                    </p>

                    {/* Instance Pills */}
                    <div className="flex flex-wrap gap-3">
                      {assignment.instances.slice(0, 12).map((instance, i) => {
                        const label = getPillLabel(instance, i, category);
                        return (
                          <button
                            key={instance.id}
                            onClick={() => handleComplianceClick(assignment)}
                            className={`h-9 px-4 rounded-full text-sm font-medium border transition-all ${
                              instance.isDone
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleComplianceClick(assignment)}
                        className="h-9 px-4 rounded-full text-sm font-medium bg-[#00486D]/5 text-[#00486D] border border-[#00486D]/10 hover:bg-[#00486D]/10 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Floating Delete Button */}
          {selectedForDelete.size > 0 && (
            <div className="sticky bottom-6 flex justify-end pt-4">
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25 disabled:opacity-70"
              >
                <FiTrash2 className="w-4 h-4" />
                {deleting
                  ? "Deleting..."
                  : `Delete Selected (${selectedForDelete.size})`}
              </button>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          CALENDAR VIEW
      ══════════════════════════════════════════ */}
      {viewMode === "calendar" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Panel */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-[#022B51] to-[#034b6e]">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {MONTH_NAMES[calMonth]} {calYear}
              </h3>
              <button
                onClick={goToToday}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20"
              >
                Today
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
              {calendarGrid.map((cell, idx) => {
                const hasEvents = cell.events && cell.events.length > 0;
                const _isToday = cell.currentMonth && isToday(cell.date);
                const _isSelected = cell.currentMonth && isSelected(cell.date);

                const pendingCount = hasEvents
                  ? cell.events.filter((e) => e.status === "Pending").length
                  : 0;
                const doneCount = hasEvents
                  ? cell.events.filter((e) => e.status === "Done").length
                  : 0;

                const eventCategories = hasEvents
                  ? [...new Set(cell.events.map((e) => e.category))].slice(0, 3)
                  : [];

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (cell.currentMonth && hasEvents)
                        setSelectedDate(cell.date);
                    }}
                    className={`
                      relative min-h-[90px] p-2 border-b border-r border-gray-50 transition-all duration-150
                      ${!cell.currentMonth ? "bg-gray-50/50" : "bg-white"}
                      ${cell.currentMonth && hasEvents ? "cursor-pointer hover:bg-[#022B51]/[0.03]" : ""}
                      ${_isSelected ? "bg-[#022B51]/[0.06] ring-2 ring-inset ring-[#022B51]/20" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold
                          ${!cell.currentMonth ? "text-gray-300" : "text-gray-700"}
                          ${_isToday ? "bg-[#022B51] text-white" : ""}
                          ${_isSelected && !_isToday ? "bg-[#022B51]/10 text-[#022B51]" : ""}
                        `}
                      >
                        {cell.day}
                      </span>
                      {hasEvents && (
                        <span className="text-[10px] font-bold text-gray-400">
                          {cell.events.length}
                        </span>
                      )}
                    </div>

                    {hasEvents && cell.currentMonth && (
                      <div className="space-y-0.5">
                        {pendingCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            <span className="text-[9px] font-medium text-amber-600 truncate">
                              {pendingCount} pending
                            </span>
                          </div>
                        )}
                        {doneCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span className="text-[9px] font-medium text-emerald-600 truncate">
                              {doneCount} done
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-0.5 pt-0.5">
                          {eventCategories.map((cat, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  CATEGORY_DOT_COLORS[cat] || "#6b7280",
                              }}
                              title={cat}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Legend
              </span>
              {Object.entries(CATEGORY_DOT_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600 capitalize">
                    {cat.replace("_", " ")}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-gray-600">Done</span>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:w-[360px] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-[#022B51]" />
                  <h3 className="font-bold text-gray-900 text-sm">
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Select a Date"}
                  </h3>
                </div>
                {selectedDate && selectedDateEvents.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedDateEvents.length} compliance
                    {selectedDateEvents.length > 1 ? "s" : ""} due
                  </p>
                )}
              </div>

              {/* Panel Body */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {!selectedDate ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FiCalendar className="w-10 h-10 mb-3 text-gray-200" />
                    <p className="text-sm font-medium">No date selected</p>
                    <p className="text-xs mt-1">
                      Click on a highlighted date to see details
                    </p>
                  </div>
                ) : selectedDateEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FiCheckCircle className="w-10 h-10 mb-3 text-gray-200" />
                    <p className="text-sm font-medium">No compliances due</p>
                    <p className="text-xs mt-1">This date has no deadlines</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event, idx) => {
                      const isPending = event.status === "Pending";
                      const dotColor =
                        CATEGORY_DOT_COLORS[event.category] || "#6b7280";

                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            handleComplianceClick(event.assignmentObj)
                          }
                          className="group p-4 rounded-xl border border-gray-100 hover:border-[#022B51]/20 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                        >
                          {/* Left accent bar */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                            style={{ backgroundColor: dotColor }}
                          />

                          <div className="pl-3">
                            <h4 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-[#022B51] transition-colors">
                              {event.complianceName}
                            </h4>

                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                                style={{
                                  backgroundColor: dotColor + "15",
                                  color: dotColor,
                                  borderColor: dotColor + "30",
                                }}
                              >
                                {event.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  isPending
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {event.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {event.dueDate}
                              </span>
                              <span>Period: {event.period}</span>
                            </div>

                            {event.reminders && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {event.reminders.split(",").map((r, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-amber-50 text-amber-600 border border-amber-100"
                                  >
                                    <FiBell className="w-2 h-2 mr-0.5" />
                                    {r.trim()}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-[10px] text-[#022B51] mt-2 font-medium group-hover:underline">
                              Click to view tracker →
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Compliances"
        message={`Are you sure you want to delete ${selectedForDelete.size} compliance(s) from "${orgDisplayName}"? This action cannot be undone.`}
      />

      <SuccessModal
        isOpen={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        title="Deleted"
        message="Selected compliances have been removed successfully!"
      />
    </div>
  );
};

export default OrgAssignedComplianceTab;
