import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../utils/api';
import { HiOutlinePlus, HiOutlineX, HiOutlineLink, HiOutlineUpload, HiOutlineEye, HiOutlinePencil } from 'react-icons/hi';

const STATUS_TABS = ['ALL', 'DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TASK_TYPES = ['DEFAULT_TASK', 'OPEN_TO_PAY'];

const statusColor = (s) => {
  const map = { DRAFT: 'bg-gray-100 text-gray-600', PUBLISHED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-600' };
  return map[s] || 'bg-gray-100 text-gray-600';
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'DEFAULT_TASK', clientUserId: '', executorUserId: '', dueDate: '' });
  const [saving, setSaving] = useState(false);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await apiClient.get(`/admin/tasks${params}`);
      setTasks(res?.data || res?.tasks || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [statusFilter]);

  const fetchTemplates = async () => {
    try {
      const res = await apiClient.get('/admin/tasks/templates');
      setTemplates(res?.data || res?.templates || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await apiClient.post('/admin/tasks', form);
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'DEFAULT_TASK', clientUserId: '', executorUserId: '', dueDate: '' });
      fetchTasks();
    } catch (e) { console.error(e); alert('Failed to create task'); }
    setSaving(false);
  };

  const publishTask = async (taskId) => {
    try {
      await apiClient.post(`/admin/tasks/${taskId}/publish`);
      fetchTasks();
    } catch (e) { console.error(e); alert('Failed to publish'); }
  };

  const generatePaymentLink = async (taskId) => {
    try {
      const res = await apiClient.post(`/admin/tasks/${taskId}/payment-link`);
      alert(`Payment link: ${res?.paymentLink || res?.data?.paymentLink || 'Generated'}`);
      fetchTasks();
    } catch (e) { console.error(e); alert('Failed to generate payment link'); }
  };

  const applyTemplate = (t) => {
    setForm(prev => ({ ...prev, title: t.title || '', description: t.description || '', type: t.type || 'DEFAULT_TASK' }));
    setShowTemplates(false);
    setShowCreate(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#022B51]">Tasks</h1>
        <div className="flex gap-2">
          <button onClick={() => { fetchTemplates(); setShowTemplates(true); }} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Templates</button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
            <HiOutlinePlus className="w-4 h-4" /> Create Task
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-[#022B51] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No tasks found</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Due Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{task.title}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{task.type?.replace('_', ' ')}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(task.status)}`}>{task.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailTask(task)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View"><HiOutlineEye className="w-4 h-4 text-gray-500" /></button>
                        {task.status === 'DRAFT' && <button onClick={() => publishTask(task.id)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Publish"><HiOutlineUpload className="w-4 h-4 text-blue-600" /></button>}
                        {task.type === 'OPEN_TO_PAY' && <button onClick={() => generatePaymentLink(task.id)} className="p-1.5 hover:bg-green-50 rounded-lg" title="Payment Link"><HiOutlineLink className="w-4 h-4 text-green-600" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#022B51]">Create Task</h2>
              <button onClick={() => setShowCreate(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              <input value={form.clientUserId} onChange={e => setForm(p => ({ ...p, clientUserId: e.target.value }))} placeholder="Client User ID" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input value={form.executorUserId} onChange={e => setForm(p => ({ ...p, executorUserId: e.target.value }))} placeholder="Executor User ID" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={createTask} disabled={saving || !form.title.trim()} className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetailTask(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#022B51]">{detailTask.title}</h2>
              <button onClick={() => setDetailTask(null)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(detailTask.status)}`}>{detailTask.status}</span></div>
              <div><span className="text-gray-500">Type:</span> {detailTask.type?.replace('_', ' ')}</div>
              {detailTask.dueDate && <div><span className="text-gray-500">Due:</span> {new Date(detailTask.dueDate).toLocaleDateString()}</div>}
              {detailTask.description && <div><span className="text-gray-500">Description:</span><p className="mt-1 text-gray-700">{detailTask.description}</p></div>}
              {detailTask.paymentLink && <div><span className="text-gray-500">Payment Link:</span> <a href={detailTask.paymentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{detailTask.paymentLink}</a></div>}
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowTemplates(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#022B51]">Task Templates</h2>
              <button onClick={() => setShowTemplates(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
            </div>
            {templates.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No templates found</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {templates.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)} className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-800 text-sm">{t.title}</p>
                    {t.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
