import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { AUTH_CONFIG } from "../../config/auth";

const OrgCompliances = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const location = useLocation();

  const [compliances, setCompliances] = React.useState([]);
  const [orgInfo, setOrgInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

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
            status: instance.isDone ? "Done" : "Pending",
          };
        }),
      };
    });
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

        {/* Org Info */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[#023752]/10 flex items-center justify-center flex-shrink-0">
            <HiOutlineBuildingOffice2 className="w-5 h-5 text-[#023752]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
            {orgInfo?.tradeName && (
              <p className="text-sm text-gray-500">{orgInfo.tradeName}</p>
            )}
          </div>
        </div>
        <p className="text-gray-500 italic mt-1">
          View and manage all assigned compliances for this organisation
        </p>
      </div>

      {/* Cards Grid */}
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
    </div>
  );
};

export default OrgCompliances;
