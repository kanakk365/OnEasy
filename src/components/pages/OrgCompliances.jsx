import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  FiCheckCircle,
  FiClock,
  FiBell,
  FiList,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { AUTH_CONFIG } from "../../config/auth";

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

// Category color map for calendar dots
const CATEGORY_DOT_COLORS = {
  return: "#10b981",
  payment: "#f59e0b",
  tax_filing: "#ef4444",
  filing: "#3b82f6",
};

const OrgCompliances = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const location = useLocation();

  const [compliances, setCompliances] = React.useState([]);
  const [orgInfo, setOrgInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [viewMode, setViewMode] = useState("list");

  // Calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  React.useEffect(() => {
    // If we have state from navigation, use it directly
    if (location.state?.orgData) {
      const orgData = location.state.orgData;
      setOrgInfo({
        legalName: orgData.legalName,
        tradeName: orgData.tradeName,
        gstin: orgData.gstin,
      });
      const transformed = transformCompliances(orgData.compliances);
      setCompliances(transformed);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API and filter
    const fetchCompliances = async () => {
      try {
        const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await fetch(
          "https://oneasycompliance.oneasy.ai/compliance/annexure-1a/my-compliances",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch compliances");
        }

        const data = await response.json();
        const items = data.items || [];

        // Filter items for this org
        const orgItems = items.filter((item) => {
          if (orgId === "unassigned") return !item.organisation;
          return item.organisation?.id === orgId;
        });

        if (orgItems.length > 0 && orgItems[0].organisation) {
          setOrgInfo({
            legalName: orgItems[0].organisation.legalName,
            tradeName: orgItems[0].organisation.tradeName,
            gstin: orgItems[0].organisation.gstin,
          });
        }

        const transformed = transformCompliances(orgItems);
        setCompliances(transformed);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching compliances:", err);
        setError("Failed to load compliances");
        setLoading(false);
      }
    };

    fetchCompliances();
  }, [orgId, location.state]);

  const transformCompliances = (items) => {
    return items.map((item) => {
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
        stats: {
          done: doneCount,
          pending: pendingCount,
        },
        totalItems: instances.length,
        progress: sortedInstances.map((i) => i.isDone),
        details: sortedInstances.map((instance) => {
          const date = new Date(instance.dueDate);
          return {
            period: instance.yearMonth
              ? instance.yearMonth.split("-")[1] > 0
                ? instance.yearMonth.split("-")[1]
                : "Q1"
              : "Q1",
            year: instance.yearMonth
              ? instance.yearMonth.split("-")[0]
              : "2026",
            dueDate: date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            }),
            dueDateRaw: instance.dueDate,
            status: instance.isDone ? "Done" : "Pending",
          };
        }),
      };
    });
  };

  // ─── Calendar Helpers ───
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

  // Build a map: dateKey -> array of compliance events for that date
  const calendarEvents = useMemo(() => {
    const map = {};
    compliances.forEach((comp) => {
      (comp.details || []).forEach((d) => {
        if (d.dueDateRaw) {
          const dt = new Date(d.dueDateRaw);
          const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
          if (!map[key]) map[key] = [];
          map[key].push({
            complianceName: comp.name,
            complianceId: comp.id,
            category: comp.category,
            type: comp.type,
            reminders: comp.reminders,
            period: d.period,
            year: d.year,
            dueDate: d.dueDate,
            status: d.status,
          });
        }
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

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        currentMonth: false,
        date: null,
      });
    }
    // Current month days
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
    // Next month leading days to fill 6 rows
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        currentMonth: false,
        date: null,
      });
    }

    return cells;
  }, [calYear, calMonth, calendarEvents]);

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return calendarEvents[key] || [];
  }, [selectedDate, calendarEvents]);

  // Check if a date is today
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading compliances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const displayName = orgInfo?.legalName || "Unassigned";

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/assigned-compliances")}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <IoChevronBackOutline className="w-5 h-5 mr-1" />
        </button>

        {/* Org Info + View Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#023752]/10 flex items-center justify-center flex-shrink-0">
              <HiOutlineBuildingOffice2 className="w-5 h-5 text-[#023752]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {displayName}
              </h1>
              {orgInfo?.tradeName && (
                <p className="text-sm text-gray-500">{orgInfo.tradeName}</p>
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white text-[#023752] shadow-sm"
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
                  ? "bg-white text-[#023752] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiCalendar className="w-4 h-4" />
              Calendar
            </button>
          </div>
        </div>

        <p className="text-gray-500 italic mt-3">
          {viewMode === "list"
            ? "View and manage all assigned compliances for this organisation"
            : "Calendar view of compliance due dates and reminders"}
        </p>
      </div>

      {/* ══════════════════════════════════════════
         LIST VIEW
      ══════════════════════════════════════════ */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {compliances.length > 0 ? (
            compliances.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  navigate(`/assigned-compliances/${item.id}`, { state: item })
                }
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <h3
                    className="text-lg font-bold text-gray-900 line-clamp-2"
                    title={item.name}
                  >
                    {item.name}
                  </h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200 whitespace-nowrap ml-2">
                    {item.type}
                  </span>
                </div>

                {/* Reminders */}
                {item.reminders && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.reminders.split(",").map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                      >
                        <FiBell className="w-2.5 h-2.5 mr-1 text-amber-500" />
                        {r.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 font-medium">Done</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {item.stats.done}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-700 font-medium">Pending</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {String(item.stats.pending).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center space-x-1 mt-auto flex-wrap gap-y-1">
                  {item.progress.map((isDone, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isDone ? "bg-[#023752]" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">
              No compliances found for this organisation.
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
         CALENDAR VIEW
      ══════════════════════════════════════════ */}
      {viewMode === "calendar" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#023752] to-[#034b6e]">
              <div className="flex items-center gap-3">
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
              <h2 className="text-lg font-bold text-white tracking-wide">
                {MONTH_NAMES[calMonth]} {calYear}
              </h2>
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

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarGrid.map((cell, idx) => {
                const hasEvents = cell.events && cell.events.length > 0;
                const _isToday = cell.currentMonth && isToday(cell.date);
                const _isSelected = cell.currentMonth && isSelected(cell.date);

                // Group events by category for dot colors
                const eventCategories = hasEvents
                  ? [...new Set(cell.events.map((e) => e.category))].slice(0, 3)
                  : [];

                // Count pending vs done
                const pendingCount = hasEvents
                  ? cell.events.filter((e) => e.status === "Pending").length
                  : 0;
                const doneCount = hasEvents
                  ? cell.events.filter((e) => e.status === "Done").length
                  : 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (cell.currentMonth && hasEvents) {
                        setSelectedDate(cell.date);
                      }
                    }}
                    className={`
                      relative min-h-[90px] p-2 border-b border-r border-gray-50 transition-all duration-150
                      ${!cell.currentMonth ? "bg-gray-50/50" : "bg-white"}
                      ${cell.currentMonth && hasEvents ? "cursor-pointer hover:bg-[#023752]/[0.03]" : ""}
                      ${_isSelected ? "bg-[#023752]/[0.06] ring-2 ring-inset ring-[#023752]/20" : ""}
                    `}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold
                          ${!cell.currentMonth ? "text-gray-300" : "text-gray-700"}
                          ${_isToday ? "bg-[#023752] text-white" : ""}
                          ${_isSelected && !_isToday ? "bg-[#023752]/10 text-[#023752]" : ""}
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
                        {/* Status mini-bars */}
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
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-[#023752]" />
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
                              {
                                state: compliances.find(
                                  (c) => c.id === event.complianceId,
                                ),
                              },
                            )
                          }
                          className="group p-4 rounded-xl border border-gray-100 hover:border-[#023752]/20 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                        >
                          {/* Left accent bar */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                            style={{ backgroundColor: dotColor }}
                          />

                          <div className="pl-3">
                            {/* Compliance name */}
                            <h4 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-[#023752] transition-colors">
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
                                Period: {event.period} • {event.year}
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

export default OrgCompliances;
