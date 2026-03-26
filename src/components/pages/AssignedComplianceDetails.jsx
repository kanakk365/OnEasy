import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  FiBell,
  FiList,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

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

const AssignedComplianceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [viewMode, setViewMode] = useState("list");

  // Calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // Use passed state or fallback values
  const complianceData = location.state || {
    name: "TDS - 2026",
    details: [
      {
        period: "Q1",
        year: "2026",
        dueDate: "15 July",
        dueDateRaw: "2026-07-15",
        status: "Done",
      },
      {
        period: "Q2",
        year: "2026",
        dueDate: "15 Oct",
        dueDateRaw: "2026-10-15",
        status: "Done",
      },
      {
        period: "Q3",
        year: "2026",
        dueDate: "15 Jan",
        dueDateRaw: "2027-01-15",
        status: "Pending",
      },
      {
        period: "Q4",
        year: "2026",
        dueDate: "15 May",
        dueDateRaw: "2027-05-15",
        status: "Pending",
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "done":
        return "text-green-600 bg-green-50 border border-green-200";
      case "pending":
        return "text-amber-600 bg-amber-50 border border-amber-200";
      default:
        return "text-gray-500 bg-gray-50 border border-gray-200";
    }
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

  // Build a map: dateKey -> array of compliance instances for that date
  const calendarEvents = useMemo(() => {
    const map = {};
    const details = complianceData.details || [];
    details.forEach((d) => {
      const rawDate = d.dueDateRaw || d.dueDate;
      if (rawDate) {
        const dt = new Date(rawDate);
        if (!isNaN(dt)) {
          const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
          if (!map[key]) map[key] = [];
          map[key].push({
            period: d.period,
            year: d.year,
            dueDate: d.dueDate,
            dueDateRaw: d.dueDateRaw || rawDate,
            status: d.status,
          });
        }
      }
    });
    return map;
  }, [complianceData.details]);

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

  // Stats
  const totalItems = (complianceData.details || []).length;
  const doneItems = (complianceData.details || []).filter(
    (d) => d.status?.toLowerCase() === "done",
  ).length;
  const pendingItems = totalItems - doneItems;

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-800 hover:text-gray-600 transition-colors mr-1"
            >
              <IoChevronBackOutline className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {complianceData.name || `Compliance ${id}`}
            </h1>
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

        <p className="text-gray-500 italic ml-8 mt-1">
          {viewMode === "list"
            ? "View all compliance periods and their status"
            : "Calendar view of compliance due dates"}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
          <FiCheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold text-green-700">
            {doneItems} Done
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
          <FiClock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700">
            {pendingItems} Pending
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-sm font-semibold text-gray-600">
            {totalItems} Total
          </span>
        </div>
      </div>

      {/* Reminders Info Card */}
      {complianceData.reminders && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FiBell className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Reminders</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {complianceData.reminders.split(",").map((reminder, i) => (
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

      {/* ══════════════════════════════════════════
         LIST VIEW
      ══════════════════════════════════════════ */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[200px]">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-white" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complianceData.details && complianceData.details.length > 0 ? (
                  complianceData.details.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Period + Year */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#022B51]/8 text-[#022B51] text-sm font-bold">
                            {item.period}
                          </span>
                          {item.year && (
                            <span className="text-xs text-gray-400 font-medium">
                              {item.year}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-800">
                          {item.dueDate}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-16 text-center text-gray-400 text-sm"
                    >
                      No compliance periods found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#022B51] to-[#015079]">
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

                const pendingCount = hasEvents
                  ? cell.events.filter((e) => e.status === "Pending").length
                  : 0;
                const doneCount = hasEvents
                  ? cell.events.filter(
                      (e) => e.status?.toLowerCase() === "done",
                    ).length
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
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-gray-600">Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#022B51]" />
                <span className="text-xs text-gray-600">Today</span>
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
                    {selectedDateEvents.length} deadline
                    {selectedDateEvents.length > 1 ? "s" : ""} on this date
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
                    <p className="text-sm font-medium">No deadlines</p>
                    <p className="text-xs mt-1">
                      This date has no compliance due
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event, idx) => {
                      const isPending =
                        event.status?.toLowerCase() === "pending";

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-gray-100 hover:border-[#022B51]/20 hover:shadow-md transition-all relative overflow-hidden"
                        >
                          {/* Left accent bar */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                              isPending ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                          />

                          <div className="pl-3">
                            {/* Status badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  isPending
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {event.status}
                              </span>
                            </div>

                            {/* Period & Year */}
                            <p className="font-semibold text-gray-900 text-sm mb-1">
                              Period: {event.period}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              Year: {event.year}
                            </p>

                            {/* Due date */}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FiCalendar className="w-3 h-3" />
                              <span>Due: {event.dueDate}</span>
                            </div>
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

export default AssignedComplianceDetails;
