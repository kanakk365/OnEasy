import React, { useMemo } from "react";
import { AiOutlinePlus, AiOutlineEye } from "react-icons/ai";

const EmptySectionState = ({ title }) => (
  <div className="flex flex-col items-center justify-center text-center py-10">
    <div className="mb-4">
      <img src="/empty.svg" alt="No Items" className="w-16 h-16 opacity-90 mx-auto" />
    </div>
    <p className="text-gray-500 text-sm">{title}</p>
  </div>
);

const OrganizationTasksSection = ({
  adminTasksList = [],
  userTasksList = [],
  organizationId,
  onAddTask,
}) => {
  // Filter tasks by organization ID
  const filteredAdminTasks = useMemo(() => {
    if (!organizationId) return [];
    return adminTasksList.filter(
      (task) => String(task.organizationId) === String(organizationId)
    );
  }, [adminTasksList, organizationId]);

  const filteredUserTasks = useMemo(() => {
    if (!organizationId) return [];
    return userTasksList.filter(
      (task) => String(task.organizationId) === String(organizationId)
    );
  }, [userTasksList, organizationId]);

  return (
    <div className="space-y-6">
      {/* Admin Tasks Section */}
      <div className="bg-[#F8F9FA] rounded-xl p-6">
        <h3 className="text-[15px] font-medium text-gray-900 mb-4">
          Admin Tasks
        </h3>
        {filteredAdminTasks.length > 0 ? (
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-[#00486D] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAdminTasks.map((task, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                        {task.date
                          ? new Date(task.date).toLocaleDateString("en-IN")
                          : "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                        {task.title || "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                        {task.type || "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                        {task.description || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptySectionState title="No Admin Tasks Yet" />
        )}
      </div>

      {/* User Tasks Section */}
      <div className="bg-[#F8F9FA] rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[15px] font-medium text-gray-900">My Tasks</h3>
          {onAddTask && (
            <button
              type="button"
              onClick={onAddTask}
              className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
            >
              <AiOutlinePlus className="w-3 h-3" /> Add Task
            </button>
          )}
        </div>
        {filteredUserTasks.length > 0 ? (
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-[#00486D] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUserTasks.map((task, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                        {task.date || "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                        {task.title || "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                        {task.type || "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                        {task.description || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptySectionState title="No Tasks Yet" />
        )}
      </div>
    </div>
  );
};

export default OrganizationTasksSection;
