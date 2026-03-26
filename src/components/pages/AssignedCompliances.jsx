import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { AUTH_CONFIG } from "../../config/auth";

const AssignedCompliances = () => {
  const navigate = useNavigate();
  const [orgGroups, setOrgGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
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

        // Group items by organisation
        const orgMap = {};
        items.forEach((item) => {
          const orgId = item.organisation?.id || "unassigned";
          if (!orgMap[orgId]) {
            orgMap[orgId] = {
              orgId,
              legalName: item.organisation?.legalName || null,
              tradeName: item.organisation?.tradeName || null,
              gstin: item.organisation?.gstin || null,
              compliances: [],
            };
          }
          orgMap[orgId].compliances.push(item);
        });

        // Convert map to array and compute stats
        const groups = Object.values(orgMap).map((group) => {
          let totalInstances = 0;
          let doneInstances = 0;
          let pendingInstances = 0;

          group.compliances.forEach((comp) => {
            const instances = comp.instances || [];
            totalInstances += instances.length;
            doneInstances += instances.filter((i) => i.isDone).length;
            pendingInstances += instances.filter((i) => !i.isDone).length;
          });

          return {
            ...group,
            totalCompliances: group.compliances.length,
            totalInstances,
            doneInstances,
            pendingInstances,
          };
        });

        setOrgGroups(groups);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching compliances:", err);
        setError("Failed to load compliances");
        setLoading(false);
      }
    };

    fetchCompliances();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-12 py-6 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading compliances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-12 py-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-12 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <IoChevronBackOutline className="w-5 h-5 mr-1" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Assigned Compliances
        </h1>
        <p className="text-gray-500 italic">
          Select an organisation to view its assigned compliances
        </p>
      </div>

      {/* Organisation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgGroups.length > 0 ? (
          orgGroups.map((group) => {
            const progressPercent =
              group.totalInstances > 0
                ? Math.round((group.doneInstances / group.totalInstances) * 100)
                : 0;

            return (
              <button
                key={group.orgId}
                onClick={() =>
                  navigate(`/assigned-compliances/org/${group.orgId}`, {
                    state: { orgData: group },
                  })
                }
                className="group text-left p-8 rounded-xl border border-gray-200 bg-white hover:border-[#022B51] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform"
                    style={{
                      background:
                        group.orgId === "unassigned"
                          ? "linear-gradient(180deg, #6B7280 0%, #9CA3AF 100%)"
                          : "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }}
                  >
                    <HiOutlineBuildingOffice2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#022B51] transition-colors"
                      title={group.legalName || "Unassigned"}
                    >
                      {group.legalName || "Unassigned"}
                    </h3>
                    {group.tradeName && group.tradeName !== group.legalName && (
                      <p
                        className="text-xs text-gray-500 mt-0.5 truncate"
                        title={group.tradeName}
                      >
                        Trade: {group.tradeName}
                      </p>
                    )}
                    {group.gstin && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate font-mono">
                        GSTIN: {group.gstin}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="mt-3 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {group.totalCompliances} compliance(s)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                          Progress
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">
                          {group.doneInstances}/{group.totalInstances}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPercent}%`,
                            background:
                              progressPercent === 100 && progressPercent > 0
                                ? "#16a34a"
                                : "linear-gradient(90deg, #022B51, #015079)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-[#022B51] mt-1 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No compliances found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedCompliances;
