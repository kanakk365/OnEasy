import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/api';
import { HiOutlineBell, HiOutlineX, HiOutlineClock, HiOutlineExternalLink } from 'react-icons/hi';

const statusColor = (s) => {
  const map = { DRAFT: 'bg-gray-100 text-gray-600', PUBLISHED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-600' };
  return map[s] || 'bg-gray-100 text-gray-600';
};

export default function ClientTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/client/tasks');
      setTasks(res?.data || res?.tasks || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/client/notifications');
      setNotifications(res?.data || res?.notifications || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); }
  };

  const markNotificationSent = async (id) => {
    try {
      await apiClient.post(`/client/notifications/${id}/mark-sent`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTasks(); fetchNotifications(); }, [fetchTasks]);

  const unreadCount = notifications.length;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#022B51]">My Tasks</h1>
        <button onClick={() => { fetchNotifications(); setShowNotifications(true); }} className="relative p-2 hover:bg-gray-100 rounded-lg">
          <HiOutlineBell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
        </button>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No tasks assigned yet</div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#022B51]/30 hover:shadow-sm cursor-pointer transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm">{task.title}</h3>
                  {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(task.status)}`}>{task.status}</span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <HiOutlineClock className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{task.type?.replace('_', ' ')}</span>
                  </div>
                </div>
                {task.type === 'OPEN_TO_PAY' && task.paymentLink && (
                  <a href={task.paymentLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg shrink-0" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
                    Pay Now <HiOutlineExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#022B51]">{selectedTask.title}</h2>
              <button onClick={() => setSelectedTask(null)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(selectedTask.status)}`}>{selectedTask.status}</span></div>
              <div><span className="text-gray-500">Type:</span> {selectedTask.type?.replace('_', ' ')}</div>
              {selectedTask.dueDate && <div><span className="text-gray-500">Due:</span> {new Date(selectedTask.dueDate).toLocaleDateString()}</div>}
              {selectedTask.description && <div><span className="text-gray-500">Description:</span><p className="mt-1 text-gray-700">{selectedTask.description}</p></div>}
              {selectedTask.type === 'OPEN_TO_PAY' && selectedTask.paymentLink && (
                <a href={selectedTask.paymentLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg mt-2" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
                  Pay Now <HiOutlineExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNotifications(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#022B51]">Notifications</h2>
              <button onClick={() => setShowNotifications(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No notifications</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start justify-between gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{n.message || n.title}</p>
                      {n.createdAt && <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>}
                    </div>
                    <button onClick={() => markNotificationSent(n.id)} className="text-xs text-blue-600 hover:underline shrink-0">Dismiss</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
