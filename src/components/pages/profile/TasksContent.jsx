import React from "react";
import { AiOutlinePlus } from "react-icons/ai";

const TasksContent = ({
  adminTasksList,
  userTasksList,
  expandedAdminTaskId,
  setExpandedAdminTaskId,
  expandedUserTaskId,
  setExpandedUserTaskId,
  isUserAdmin,
  isAddingAdminTask,
  setIsAddingAdminTask,
  isAddingUserTask,
  setIsAddingUserTask,
  currentAdminTask,
  setCurrentAdminTask,
  currentUserTask,
  setCurrentUserTask,
  saving,
  addAdminTask,
  addUserTask,
  handleSaveTasks,
}) => {
  return (
    <div className="px-6 pb-6 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Tasks Section - Read Only for Users */}
        <div className="border-r border-gray-200 pr-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Admin Tasks
            {!isUserAdmin && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Read Only
              </span>
            )}
          </h3>

          {/* Admin Tasks Table */}
          {adminTasksList.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Date
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Title
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Type
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminTasksList.map((task, idx) => (
                  <React.Fragment key={task.id || idx}>
                    <tr
                      onClick={() =>
                        setExpandedAdminTaskId(
                          expandedAdminTaskId === idx ? null : idx
                        )
                      }
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {task.date
                          ? new Date(task.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate text-xs">
                        {task.title || "-"}
                      </td>
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {task.type ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.type === "urgent"
                                ? "bg-red-100 text-red-700"
                                : task.type === "recurring"
                                ? "bg-blue-100 text-blue-700"
                                : task.type === "non-recurring"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {task.type.charAt(0).toUpperCase() +
                              task.type.slice(1)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate text-xs">
                        {task.description || "-"}
                      </td>
                    </tr>
                    {expandedAdminTaskId === idx && (
                      <tr className="bg-gray-50">
                        <td colSpan="4" className="px-3 py-3">
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">
                                Date:
                              </span>{" "}
                              <span className="text-gray-600">
                                {task.date
                                  ? new Date(task.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Title:
                              </span>{" "}
                              <span className="text-gray-600">
                                {task.title || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Type:
                              </span>{" "}
                              <span className="text-gray-600">
                                {task.type
                                  ? task.type.charAt(0).toUpperCase() +
                                    task.type.slice(1)
                                  : "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Description:
                              </span>
                              <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                {task.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-center py-4 text-xs">
              No admin tasks added yet
            </p>
          )}

          {/* Add Admin Task Form - Only for Admins */}
          {isUserAdmin && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {isAddingAdminTask ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    >
                      <option value="">Select type</option>
                      <option value="recurring">Recurring</option>
                      <option value="non-recurring">Non-Recurring</option>
                      <option value="urgent">Urgent</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={currentAdminTask.description}
                      onChange={(e) =>
                        setCurrentAdminTask({
                          ...currentAdminTask,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addAdminTask}
                      disabled={saving}
                      className="flex-1 px-3 py-2 bg-[#00486D] text-white rounded text-xs hover:bg-[#01334C] disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingAdminTask(false);
                        setCurrentAdminTask({
                          date: "",
                          title: "",
                          description: "",
                          type: "",
                        });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded text-xs hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingAdminTask(true)}
                  className="w-full px-3 py-2 bg-[#00486D] text-white rounded text-xs hover:bg-[#01334C] flex items-center justify-center gap-2"
                >
                  <AiOutlinePlus className="w-4 h-4" />
                  Add Admin Task
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Tasks Section - Editable */}
        <div className="pl-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">My Tasks</h3>
          </div>

          {/* User Tasks Table */}
          {userTasksList.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Date
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Title
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Type
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-xs">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {userTasksList.map((task, idx) => (
                  <React.Fragment key={task.id || idx}>
                    <tr
                      onClick={() =>
                        setExpandedUserTaskId(
                          expandedUserTaskId === idx ? null : idx
                        )
                      }
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {task.date
                          ? new Date(task.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate text-xs">
                        {task.title || "-"}
                      </td>
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {task.type ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.type === "urgent"
                                ? "bg-red-100 text-red-700"
                                : task.type === "recurring"
                                ? "bg-blue-100 text-blue-700"
                                : task.type === "non-recurring"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {task.type.charAt(0).toUpperCase() +
                              task.type.slice(1)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate text-xs">
                        {task.description || "-"}
                      </td>
                    </tr>
                    {expandedUserTaskId === idx && (
                      <tr className="bg-gray-50">
                        <td colSpan="4" className="px-3 py-3">
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">
                                Date:
                              </span>{" "}
                              <span className="text-gray-600">
                                {task.date
                                  ? new Date(task.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Title:
                              </span>{" "}
                              <span className="text-gray-600">
                                {task.title || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Type:
                              </span>{" "}
                              <span className="text-gray-600">
                                {task.type
                                  ? task.type.charAt(0).toUpperCase() +
                                    task.type.slice(1)
                                  : "-"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Description:
                              </span>
                              <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                {task.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 text-center py-4 text-xs">
              No tasks added yet
            </p>
          )}

          {/* Add User Task Form */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {isAddingUserTask ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={currentUserTask.date}
                    onChange={(e) =>
                      setCurrentUserTask({
                        ...currentUserTask,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={currentUserTask.title}
                    onChange={(e) =>
                      setCurrentUserTask({
                        ...currentUserTask,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={currentUserTask.type}
                    onChange={(e) =>
                      setCurrentUserTask({
                        ...currentUserTask,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                  >
                    <option value="">Select type</option>
                    <option value="recurring">Recurring</option>
                    <option value="non-recurring">Non-Recurring</option>
                    <option value="urgent">Urgent</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={currentUserTask.description}
                    onChange={(e) =>
                      setCurrentUserTask({
                        ...currentUserTask,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="Enter task description"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addUserTask}
                    disabled={saving}
                    className="flex-1 px-3 py-2 bg-[#00486D] text-white rounded text-xs hover:bg-[#01334C] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingUserTask(false);
                      setCurrentUserTask({
                        date: "",
                        title: "",
                        description: "",
                        type: "",
                      });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded text-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingUserTask(true)}
                className="w-full px-3 py-2 bg-[#00486D] text-white rounded text-xs hover:bg-[#01334C] flex items-center justify-center gap-2"
              >
                <AiOutlinePlus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveTasks}
          disabled={saving}
          className="px-8 py-3 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default TasksContent;
