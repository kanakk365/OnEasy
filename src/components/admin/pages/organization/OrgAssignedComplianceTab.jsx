import React, { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import apiClient from "../../../../utils/api";
import SuccessModal from "../../../common/SuccessModal";

const OrgAssignedComplianceTab = ({ userId, org }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  // States for the details view
  const [instances, setInstances] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState({}); // Map of instanceId -> boolean (isDone)
  const [saving, setSaving] = useState(false);
  const [successfulSave, setSuccessfulSave] = useState(false);

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

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();
      // Filter assignments that belong to this organisation
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
    if (userId) {
      fetchAssignments();
    }
  }, [userId, fetchAssignments]);

  const handleComplianceClick = (assignment) => {
    setSelectedCompliance(assignment);
    // Sort instances by due date
    const sortedInstances = [...(assignment.instances || [])].sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    );
    setInstances(sortedInstances);
    setPendingUpdates({}); // Reset pending updates
  };

  const handleBack = () => {
    setSelectedCompliance(null);
    setInstances([]);
    setPendingUpdates({});
  };

  const toggleInstanceStatus = (instanceId, currentStatus) => {
    setPendingUpdates((prev) => {
      const newStatus = !currentStatus;
      return {
        ...prev,
        [instanceId]: newStatus,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = apiClient.getToken();

      const doneInstanceIds = instances
        .filter((inst) => {
          if (pendingUpdates[inst.id] !== undefined) {
            return pendingUpdates[inst.id];
          }
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
          body: JSON.stringify({
            instanceIds: doneInstanceIds,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh assignments to get latest state
      await fetchAssignments();

      // Show success modal
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

  // Helper to format category for badges
  const formatCategory = (cat) => cat?.replace(/_/g, " ") || "General";

  // Helper to get Label for pill (Q1, Q2, Jan, Feb)
  const getPillLabel = (instance, idx, category) => {
    if (category.toLowerCase().includes("quarter")) {
      return `Q${(idx % 4) + 1}`;
    }
    // Month name from dueDate
    const date = new Date(instance.dueDate);
    if (!isNaN(date)) {
      return date.toLocaleString("default", { month: "short" });
    }
    return instance.yearMonth;
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
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
        <p>Error: {error}</p>
        <button onClick={fetchAssignments} className="mt-4 underline">
          Retry
        </button>
      </div>
    );
  }

  // --- Detail View (Tracker Table) ---
  if (selectedCompliance) {
    const categoryName = formatCategory(
      selectedCompliance.compliance?.category,
    );

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
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

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <p className="text-gray-500 italic mb-6">
              Configure compliance periods ({instances.length} items)
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-[#00486D] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold w-24">
                      Period
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Month
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {instances.map((instance, idx) => {
                    const date = new Date(instance.dueDate);
                    const monthName = !isNaN(date)
                      ? date.toLocaleString("default", { month: "long" })
                      : "-";
                    const formattedDate = !isNaN(date)
                      ? date.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : instance.dueDate;

                    const label = getPillLabel(instance, idx, categoryName);

                    // Determine effective status (local pending or saved)
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
                          {label}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {monthName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-medium ${isDone ? "text-orange-400" : "text-orange-400"}`}
                          >
                            {isDone ? (
                              <span className="text-green-600">Completed</span>
                            ) : (
                              "Pending"
                            )}
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
      </div>
    );
  }

  // --- Direct Compliance List View (No org selection step) ---
  const orgDisplayName =
    org.legalName !== "-"
      ? org.legalName
      : org.tradeName !== "-"
        ? org.tradeName
        : "Organisation";

  return (
    <div className="space-y-6">
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
          <h2 className="text-lg font-bold text-gray-900">{orgDisplayName}</h2>
          <p className="text-xs text-gray-500">
            {assignments.length} compliance(s) assigned
          </p>
        </div>
      </div>

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
            const category = formatCategory(assignment.compliance?.category);

            return (
              <div
                key={assignment.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                {/* Top Row: Title, Badge, Status */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div className="flex items-center gap-3">
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

                {/* Instances Pills/Buttons */}
                <div className="flex flex-wrap gap-3">
                  {assignment.instances.slice(0, 12).map((instance, i) => {
                    const label = getPillLabel(instance, i, category);

                    return (
                      <button
                        key={instance.id}
                        onClick={() => handleComplianceClick(assignment)}
                        className={`
                          h-9 px-4 rounded-full text-sm font-medium border transition-all
                          ${
                            instance.isDone
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                          }
                        `}
                      >
                        {label}
                      </button>
                    );
                  })}

                  {/* View Details Button as a pill */}
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
    </div>
  );
};

export default OrgAssignedComplianceTab;
