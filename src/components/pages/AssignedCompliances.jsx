import React from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiCheckCircle, FiClock, FiFileText } from "react-icons/fi";
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

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orgGroups.length > 0 ? (
          orgGroups.map((group) => (
            <div
              key={group.orgId}
              onClick={() =>
                navigate(`/assigned-compliances/org/${group.orgId}`, {
                  state: { orgData: group },
                })
              }
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#023752]/20 transition-all duration-200 cursor-pointer group"
            >
              {/* Org Icon & Name */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#023752]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#023752]/20 transition-colors">
                  <HiOutlineBuildingOffice2 className="w-6 h-6 text-[#023752]" />
                </div>
                <div className="min-w-0">
                  <h3
                    className="text-lg font-bold text-gray-900 truncate"
                    title={group.legalName || "Unassigned"}
                  >
                    {group.legalName || "Unassigned"}
                  </h3>
                  {group.tradeName && (
                    <p
                      className="text-sm text-gray-500 truncate"
                      title={group.tradeName}
                    >
                      {group.tradeName}
                    </p>
                  )}
                  {group.gstin && (
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      GSTIN: {group.gstin}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiFileText className="w-4 h-4 text-[#023752]" />
                    <span className="text-gray-600 text-sm">Compliances</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {String(group.totalCompliances).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 text-sm">Done</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {String(group.doneInstances).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600 text-sm">Pending</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {String(group.pendingInstances).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Bottom progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-[#023752] h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width:
                      group.totalInstances > 0
                        ? `${(group.doneInstances / group.totalInstances) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          ))
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
