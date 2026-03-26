import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiBell,
  FiList,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { AUTH_CONFIG } from "../../../../config/auth";

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
const UserOrgComplianceSection = ({ selectedOrg }) => {
  const navigate = useNavigate();
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View mode: "list" | "calendar"
  const [viewMode, setViewMode] = useState("list");

  // Calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // ─── Data Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedOrg) return;

    const fetchCompliances = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
        if (!token) throw new Error("No auth token found");

        const response = await fetch(
          "https://oneasycompliance.oneasy.ai/compliance/annexure-1a/my-compliances",
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!response.ok) throw new Error("Failed to fetch compliances");

        const data = await response.json();
        const items = data.items || [];

        // Filter for this org
        const orgId = String(selectedOrg.id);
        const orgItems = items.filter((item) => {
          const assignmentOrg = item.organisation;
          if (!assignmentOrg) return false;
          return (
            String(assignmentOrg.id) === orgId ||
            (assignmentOrg.legalName === selectedOrg.legal_name &&
              assignmentOrg.gstin === selectedOrg.gstin)
          );
        });

        // Transform items
        const transformed = orgItems.map((item) => {
          const instances = item.instances || [];
          const doneCount = instances.filter((i) => i.isDone).length;
          const pendingCount = instances.length - doneCount;
          const sortedInstances = [...instances].sort(
            (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
          );

          return {
            id: item.id,
            name: item.compliance.name,
            code: item.compliance.code,
            category: item.compliance.category,
            description: item.compliance.description,
            reminders: item.compliance.reminders || null,
            type:
              item.compliance.category === "return"
                ? "Return"
                : item.compliance.category === "payment"
                  ? "Payment"
                  : item.compliance.category === "tax_filing"
                    ? "Tax Filing"
                    : "Other",
            stats: { done: doneCount, pending: pendingCount },
            totalItems: instances.length,
            progress: sortedInstances.map((i) => i.isDone),
            details: sortedInstances.map((instance, idx) => {
              const date = new Date(instance.dueDate);
              // Derive period label from yearMonth (e.g. "2026-09" -> "Sep")
              const MONTH_SHORT = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              let period = "—";
              if (instance.yearMonth) {
                const parts = instance.yearMonth.split("-");
                const mNum = parseInt(parts[1], 10);
                period =
                  mNum >= 1 && mNum <= 12 ? MONTH_NAMES[mNum - 1] : `M${mNum}`;
              } else if (!isNaN(date)) {
                period = MONTH_NAMES[date.getMonth()];
              }
              // Check if quarterly compliance by name/category
              const isQuarterly =
                item.compliance?.name?.toLowerCase().includes("q") ||
                (item.compliance?.category || "")
                  .toLowerCase()
                  .includes("quarter");
              if (isQuarterly) period = `Q${(idx % 4) + 1}`;

              return {
                period,
                dueDate: !isNaN(date)
                  ? date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : instance.dueDate,
                dueDateRaw: instance.dueDate,
                status: instance.isDone ? "Done" : "Pending",
              };
            }),
          };
        });

        setCompliances(transformed);
      } catch (err) {
        console.error("Error fetching compliances:", err);
        setError(err.message || "Failed to load compliances");
      } finally {
        setLoading(false);
      }
    };

    fetchCompliances();
  }, [selectedOrg]);

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

  // Build dateKey -> events map from all compliances
  const calendarEvents = useMemo(() => {
    const map = {};
    compliances.forEach((comp) => {
      (comp.details || []).forEach((d) => {
        const rawDate = d.dueDateRaw;
        if (!rawDate) return;
        const dt = new Date(rawDate);
        if (isNaN(dt)) return;
        const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push({
          complianceName: comp.name,
          complianceId: comp.id,
          complianceObj: comp,
          category: comp.category,
          type: comp.type,
          reminders: comp.reminders,
          period: d.period,
          year: d.year,
          dueDate: d.dueDate,
          status: d.status,
        });
      });
    });
    return map;
  }, [compliances]);

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

  // ─── Aggregate stats ─────────────────────────────────────────────────────────
  const totalInstances = compliances.reduce((s, c) => s + c.totalItems, 0);
  const doneInstances = compliances.reduce((s, c) => s + c.stats.done, 0);
  const pendingInstances = compliances.reduce((s, c) => s + c.stats.pending, 0);

  // ─── Loading / Error / Empty states ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022B51]"></div>
          <p className="text-sm text-gray-500">Loading compliances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[#022B51] underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (compliances.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <FiCheckCircle className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 text-sm">
          No compliances assigned to this organisation yet.
        </p>
      </div>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header: count + view toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-gray-500">
          {compliances.length} compliance(s) assigned to this organisation
        </p>

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
        <div className="space-y-4">
          {compliances.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              No compliances assigned to this organisation.
            </div>
          ) : (
            compliances.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-xl p-3 sm:p-6 border-gray-200 hover:shadow-md transition-all"
              >
                {/* Top Row: Title, Badge, Status */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize border border-gray-200">
                      {(item.category || "General").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                      Status
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {item.stats.done} of {item.totalItems} completed
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  {item.description ||
                    `${(item.category || "General").replace(/_/g, " ")} Compliance`}
                </p>

                {/* Instances Pills/Buttons */}
                <div className="flex flex-wrap gap-3">
                  {item.details.slice(0, 12).map((instance, i) => (
                    <button
                      key={`${item.id}-${i}`}
                      onClick={() =>
                        navigate(`/assigned-compliances/${item.id}`, {
                          state: item,
                        })
                      }
                      className={`
                        h-9 px-4 rounded-full text-sm font-medium border transition-all
                        ${
                          instance.status === "Done"
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }
                      `}
                    >
                      {instance.period}
                    </button>
                  ))}

                  {/* View Details Button as a pill */}
                  <button
                    onClick={() =>
                      navigate(`/assigned-compliances/${item.id}`, {
                        state: item,
                      })
                    }
                    className="h-9 px-4 rounded-full text-sm font-medium bg-[#022B51]/5 text-[#022B51] border border-[#022B51]/10 hover:bg-[#015079]/10 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          CALENDAR VIEW
      ══════════════════════════════════════════ */}
      {viewMode === "calendar" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Panel */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-[#022B51] to-[#015079]">
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
            <div className="grid grid-cols-7 min-w-[400px] border-b border-gray-100">
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
            <div className="grid grid-cols-7 min-w-[400px]">
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
                      ${cell.currentMonth && hasEvents ? "cursor-pointer hover:bg-[#015079]/[0.03]" : ""}
                      ${_isSelected ? "bg-[#022B51]/[0.06] ring-2 ring-inset ring-[#022B51]/20" : ""}
                    `}
                  >
                    {/* Day Number */}
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

                    {/* Event Indicators */}
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
                        {/* Category dots */}
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

          {/* Side Panel: Selected Date Details */}
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
                            navigate(
                              `/assigned-compliances/${event.complianceId}`,
                              { state: event.complianceObj },
                            )
                          }
                          className="group p-4 rounded-xl border border-gray-100 hover:border-[#022B51]/20 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                        >
                          {/* Left accent bar */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                            style={{ backgroundColor: dotColor }}
                          />

                          <div className="pl-3">
                            {/* Compliance name */}
                            <h4 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-[#022B51] transition-colors">
                              {event.complianceName}
                            </h4>

                            {/* Type badge + status */}
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

                            {/* Due date & period */}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {event.dueDate}
                              </span>
                              <span>
                                Period: {event.period}
                              </span>
                            </div>

                            {/* Reminders */}
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
                              Click to view details →
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
    </div>
  );
};

export default UserOrgComplianceSection;
