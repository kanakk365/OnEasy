import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { AUTH_CONFIG } from "../../../../config/auth";

const UserOrgComplianceSection = ({ selectedOrg }) => {
  const navigate = useNavigate();
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch compliances");

        const data = await response.json();
        const items = data.items || [];

        // Filter items for this org
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D]"></div>
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
          className="text-sm text-[#00486D] underline"
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

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        {compliances.length} compliance(s) assigned to this organisation
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {compliances.map((item) => (
          <div
            key={item.id}
            onClick={() =>
              navigate(`/assigned-compliances/${item.id}`, { state: item })
            }
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#00486D]/20 transition-all duration-200 cursor-pointer group"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-5">
              <h3
                className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-[#00486D] transition-colors"
                title={item.name}
              >
                {item.name}
              </h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200 whitespace-nowrap ml-2 capitalize">
                {item.type}
              </span>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Stats */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 text-sm">Done</span>
                </div>
                <span className="font-bold text-gray-900">
                  {item.stats.done}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600 text-sm">Pending</span>
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
        ))}
      </div>
    </div>
  );
};

export default UserOrgComplianceSection;
