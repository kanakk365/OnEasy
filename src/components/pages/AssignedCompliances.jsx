import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { AUTH_CONFIG } from "../../config/auth";

const AssignedCompliances = () => {
  const navigate = useNavigate();
  const [compliances, setCompliances] = React.useState([]);
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

        // Transform API data to match UI component structure
        const transformedData = (data.items || []).map((item) => {
          const instances = item.instances || [];
          const doneCount = instances.filter((i) => i.isDone).length;
          const pendingCount = instances.length - doneCount;

          // Sort instances by dueDate
          const sortedInstances = [...instances].sort(
            (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
          );

          return {
            id: item.id,
            name: item.compliance.name,
            type:
              item.compliance.category === "return"
                ? "Monthly"
                : item.compliance.category === "payment"
                  ? "Monthly"
                  : "Yearly", // Approximate based on data
            stats: {
              done: doneCount,
              pending: pendingCount,
            },
            totalItems: instances.length,
            // Create boolean array for progress dots, pad with false if needed, or limit
            progress: sortedInstances.map((i) => i.isDone),
            // Store raw details for the details page
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

        setCompliances(transformedData);
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
          View and manage all assigned compliances for this client
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
            No compliances found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedCompliances;
