import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEye } from "react-icons/fi";

function ClientTasksTab({
  adminTasksList,
  userTasksList,
  isAddingAdminTask,
  setIsAddingAdminTask,
  editingAdminTaskIndex,
  setEditingAdminTaskIndex,
  currentAdminTask,
  setCurrentAdminTask,
  savingTasks,
  addAdminTask,
  handleEditTask,
  handleDeleteTask,
  handleSaveTasks,
  selectedAdminTask,
  setSelectedAdminTask,
  selectedUserTask,
  setSelectedUserTask,
  organisations = [],
}) {
  const getOrgName = (orgId) => {
    if (!orgId || !Array.isArray(organisations)) return "-";
    const match = organisations.find(
      (o) => String(o.id) === String(orgId),
    );
    return match?.legalName || match?.tradeName || "-";
  };
  return (
        <div className="px-6 pb-6 pt-6">
          <div className="space-y-6">
            {/* Admin Tasks Section */}
            <div className="bg-[#F8F9FA] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-medium text-gray-900">
                  Admin Tasks (Editable)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingAdminTask(true)}
                  className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
                >
                  <AiOutlinePlus className="w-3 h-3" />
                  Add Task
                </button>
              </div>

              {/* Add Admin Task Form */}
              {isAddingAdminTask && (
                <div className="mb-4 p-4 bg-white border border-gray-100 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    {editingAdminTaskIndex !== null ? "Edit Task" : "New Task"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Organization
                      </label>
                      <select
                        value={currentAdminTask.organizationId || ""}
                        onChange={(e) =>
                          setCurrentAdminTask({
                            ...currentAdminTask,
                            organizationId: e.target.value || null,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select organization</option>
                        {organisations.map((org, idx) => (
                          <option key={org.id || idx} value={org.id}>
                            {org.legalName || org.tradeName || `Organization ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Date
                      </label>
                      <input
                        type="date"
                        value={currentAdminTask.date}
                        onChange={(e) =>
                          setCurrentAdminTask({
                            ...currentAdminTask,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Title
                      </label>
                      <input
                        type="text"
                        value={currentAdminTask.title}
                        onChange={(e) =>
                          setCurrentAdminTask({
                            ...currentAdminTask,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter task title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Type
                      </label>
                      <select
                        value={currentAdminTask.type}
                        onChange={(e) =>
                          setCurrentAdminTask({
                            ...currentAdminTask,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select type</option>
                        <option value="Recurring">Recurring</option>
                        <option value="Non-Recurring">Non-Recurring</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Normal">Normal</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-900 mb-2 font-medium">
                        Description
                      </label>
                      <input
                        type="text"
                        value={currentAdminTask.description}
                        onChange={(e) =>
                          setCurrentAdminTask({
                            ...currentAdminTask,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter task description"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setIsAddingAdminTask(false);
                        setEditingAdminTaskIndex(null);
                        setCurrentAdminTask({
                          date: "",
                          title: "",
                          description: "",
                          type: "",
                          organizationId: null,
                        });
                      }}
                      className="text-[#FF3B30] hover:text-red-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addAdminTask}
                      disabled={savingTasks}
                      className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold disabled:opacity-50"
                    >
                      {savingTasks
                        ? "Saving..."
                        : editingAdminTaskIndex !== null
                        ? "Update"
                        : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {adminTasksList.length > 0 ? (
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-[#00486D] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Organization
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {adminTasksList.map((task, idx) => (
                        <tr
                          key={task.id || idx}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedAdminTask(task)}
                        >
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                              {task.date
                                ? new Date(task.date).toLocaleDateString("en-IN")
                                : "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[200px]">
                              {getOrgName(task.organizationId)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[200px]">
                              {task.title || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                              {task.type || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[150px]">
                              {task.description || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              className="flex items-center gap-1 px-3 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs font-medium"
                            >
                              <FiEye className="w-4 h-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="mb-4">
                    <img src="/empty.svg" alt="No Items" className="w-16 h-16 opacity-90 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No Admin Tasks Yet</p>
                </div>
              )}
            </div>

            {/* User Tasks Section */}
            <div className="bg-[#F8F9FA] rounded-xl p-6">
              <h3 className="text-[15px] font-medium text-gray-900 mb-4">
                User Tasks (Read Only)
              </h3>
              {userTasksList.length > 0 ? (
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-[#00486D] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Organization
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {userTasksList.map((task, idx) => (
                        <tr
                          key={task.id || idx}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedUserTask(task)}
                        >
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                              {task.date
                                ? new Date(task.date).toLocaleDateString("en-IN")
                                : "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[200px]">
                              {getOrgName(task.organizationId)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[200px]">
                              {task.title || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                              {task.type || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[150px]">
                              {task.description || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              className="flex items-center gap-1 px-3 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C] transition-colors text-xs font-medium"
                            >
                              <FiEye className="w-4 h-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="mb-4">
                    <img src="/empty.svg" alt="No Items" className="w-16 h-16 opacity-90 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">No User Tasks Yet</p>
                </div>
              )}
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveTasks}
                disabled={savingTasks}
                className="px-8 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                }}
              >
                {savingTasks ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Admin Task Details Modal */}
          {selectedAdminTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Admin Task Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedAdminTask(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="px-6 py-4 space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Date
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {selectedAdminTask.date
                        ? new Date(selectedAdminTask.date).toLocaleDateString("en-IN")
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Organization
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {getOrgName(selectedAdminTask.organizationId)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Title
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                      {selectedAdminTask.title || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Type
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {selectedAdminTask.type || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Description
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                      {selectedAdminTask.description || "-"}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const taskIndex = adminTasksList.findIndex(
                        (task) =>
                          (task.id && selectedAdminTask.id && task.id === selectedAdminTask.id) ||
                          (task === selectedAdminTask)
                      );
                      if (taskIndex !== -1) {
                        handleDeleteTask(taskIndex);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAdminTask(null)}
                      className="px-4 py-1.5 text-xs font-semibold text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const taskIndex = adminTasksList.findIndex(
                          (task) =>
                            (task.id && selectedAdminTask.id && task.id === selectedAdminTask.id) ||
                            (task === selectedAdminTask)
                        );
                        if (taskIndex !== -1) {
                          handleEditTask(selectedAdminTask, taskIndex);
                          setSelectedAdminTask(null);
                        }
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
                      style={{
                        background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Task Details Modal */}
          {selectedUserTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h4 className="text-sm font-semibold text-gray-900">
                    User Task Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedUserTask(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="px-6 py-4 space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Date
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {selectedUserTask.date
                        ? new Date(selectedUserTask.date).toLocaleDateString("en-IN")
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Organization
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {getOrgName(selectedUserTask.organizationId)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Title
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                      {selectedUserTask.title || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Type
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
                      {selectedUserTask.type || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Description
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-100 text-gray-800 whitespace-pre-wrap break-words">
                      {selectedUserTask.description || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
  );
}

export default ClientTasksTab;