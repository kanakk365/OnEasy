import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BsCalendar3 } from "react-icons/bs";

const TasksContent = ({
  adminTasksList,
  userTasksList,
  isAddingUserTask,
  setIsAddingUserTask,
  currentUserTask,
  setCurrentUserTask,
  saving,
  handleSaveTasks,
}) => {
  // Reusable Input Component
  const StyledInput = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    className = "",
  }) => (
    <div className={className}>
      <label className="block text-sm text-gray-700 mb-2 font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
        />
        {type === "date" && (
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
            <BsCalendar3 />
          </div>
        )}
      </div>
    </div>
  );

  // Reusable Select Component
  const StyledSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    className = "",
  }) => (
    <div className={className}>
      <label className="block text-sm text-gray-700 mb-2 font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          value={value || ""}
          onChange={onChange}
          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptySectionState = ({ title, buttonText, onAdd }) => (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <div className="mb-4">
        <img
          src="/empty.svg"
          alt="No Items"
          className="w-16 h-16 opacity-90 mx-auto"
        />
      </div>
      <p className="text-gray-500 text-sm mb-4">{title}</p>
      {buttonText && (
        <button
          type="button"
          onClick={onAdd}
          className="px-5 py-2.5 bg-[#01334C] text-white rounded-md hover:bg-[#01283a] transition-colors text-xs font-medium"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  const [selectedAdminTask, setSelectedAdminTask] = useState(null);

  return (
    <div className="px-6 pb-6 pt-6">
      <div className="space-y-6">
        {/* Admin Tasks Section */}
        <div className="bg-[#F8F9FA] rounded-xl p-6">
          <h3 className="text-[15px] font-medium text-gray-900 mb-4">
            Admin Tasks
          </h3>
          {adminTasksList.length > 0 ? (
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
                  {adminTasksList.map((task, idx) => (
                    <tr
                      key={idx}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedAdminTask(task)}
                    >
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                          {task.date
                            ? new Date(task.date).toLocaleDateString("en-IN")
                            : "-"}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <div
                          className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 whitespace-pre-wrap break-words"
                          title={task.title || "-"}
                        >
                          {task.title || "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700">
                          {task.type || "-"}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <div
                          className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 whitespace-pre-wrap break-words"
                          title={task.description || "-"}
                        >
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

        {/* My Tasks Section */}
        <div className="bg-[#F8F9FA] rounded-xl p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] font-medium text-gray-900">My Tasks</h3>
            {userTasksList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddingUserTask(true)}
                className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors text-xs font-semibold flex items-center gap-2"
              >
                <AiOutlinePlus className="w-3 h-3" /> Add More Tasks
              </button>
            )}
          </div>

          {!isAddingUserTask && userTasksList.length === 0 ? (
            <EmptySectionState
              title="No Tasks Yet"
              buttonText="Add My Tasks"
              onAdd={() => setIsAddingUserTask(true)}
            />
          ) : (
            <div className="space-y-6">
              {/* Existing Tasks Table */}
              {userTasksList.length > 0 && (
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
                        <tr key={idx}>
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
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-md text-xs border border-gray-100 text-gray-700 truncate max-w-[150px]">
                              {task.description || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              // onClick={() => removeUserTask(task.id)} // Placeholder
                              className="text-[#FF3B30] hover:text-red-700 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add New Task Form */}
              {isAddingUserTask && (
                <div className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <StyledInput
                      label="Date"
                      type="date"
                      value={currentUserTask.date}
                      onChange={(e) =>
                        setCurrentUserTask({
                          ...currentUserTask,
                          date: e.target.value,
                        })
                      }
                      placeholder="Choose Date"
                    />
                    <StyledInput
                      label="Title"
                      value={currentUserTask.title}
                      onChange={(e) =>
                        setCurrentUserTask({
                          ...currentUserTask,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter Task Title"
                    />
                    <StyledSelect
                      label="Type"
                      value={currentUserTask.type}
                      onChange={(e) =>
                        setCurrentUserTask({
                          ...currentUserTask,
                          type: e.target.value,
                        })
                      }
                      placeholder="Select Type"
                      options={[
                        { value: "Recurring", label: "Recurring" },
                        { value: "Non-Recurring", label: "Non-Recurring" },
                        { value: "Urgent", label: "Urgent" },
                        { value: "Normal", label: "Normal" },
                      ]}
                    />
                    <StyledInput
                      label="Description"
                      value={currentUserTask.description}
                      onChange={(e) =>
                        setCurrentUserTask({
                          ...currentUserTask,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter Task Description"
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setIsAddingUserTask(false)}
                      className="text-[#FF3B30] hover:text-red-700 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveTasks}
            disabled={saving}
            className="px-8 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
            }}
          >
            {saving ? "Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Admin Task Details Modal */}
      {selectedAdminTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
                    ? new Date(selectedAdminTask.date).toLocaleDateString(
                        "en-IN"
                      )
                    : "-"}
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
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAdminTask(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
                style={{
                  background:
                    "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksContent;
