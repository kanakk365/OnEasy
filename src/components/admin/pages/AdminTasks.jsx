import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../utils/api';
import { HiOutlinePlus, HiOutlineX, HiOutlineLink, HiOutlineUpload, HiOutlinePencil, HiOutlineFilter } from 'react-icons/hi';
import { FiEye } from 'react-icons/fi';

const STATUS_TABS = ['ALL', 'DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TASK_TYPES = ['DEFAULT_TASK', 'OPEN_TO_PAY'];

const statusColor = (s) => {
  const map = { DRAFT: 'bg-gray-100 text-gray-600', PUBLISHED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-600' };
  return map[s] || 'bg-gray-100 text-gray-600';
};

// Combo input — type freely or pick from suggestions
function ComboInput({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const ref = React.useRef(null);

  // Resolve display value: show label if matched, otherwise raw value
  const selected = options.find(o => String(o.value) === String(value));
  const displayVal = open ? inputVal : (selected ? selected.label : value || '');

  const filtered = options.filter(o =>
    (o.label || '').toLowerCase().includes((inputVal || '').toLowerCase())
  );

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={displayVal}
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setInputVal(selected ? selected.label : value || ''); }}
        onChange={e => { setInputVal(e.target.value); onChange(e.target.value); setOpen(true); }}
        className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent transition-all"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <button type="button" key={o.value} onClick={() => { onChange(o.value); setInputVal(o.label); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${String(value) === String(o.value) ? 'text-[#022B51] font-medium bg-blue-50/50' : 'text-gray-700'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('');
  const [executorFilter, setExecutorFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('admin'); // 'admin', 'templates', or 'executor'

  // Executor tasks
  const [executorTasks, setExecutorTasks] = useState([]);

  // Create/Edit task
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'DEFAULT_TASK', clientUserId: '', executorUserId: '', dueDate: '' });
  const [saving, setSaving] = useState(false);

  // Clients list for dropdowns
  const [clients, setClients] = useState([]);

  // Detail
  const [detailTask, setDetailTask] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ title: '', description: '', type: 'DEFAULT_TASK' });
  const [templateSaving, setTemplateSaving] = useState(false);

  // ── Fetch tasks with all filters ──
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (clientFilter.trim()) params.set('clientUserId', clientFilter.trim());
      if (executorFilter.trim()) params.set('executorUserId', executorFilter.trim());
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient.get(`/admin/tasks${qs}`);
      setTasks(res?.data || res?.tasks || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [statusFilter, clientFilter, executorFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Fetch clients for dropdowns ──
  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await apiClient.get('/admin/clients');
        setClients(res?.data || (Array.isArray(res) ? res : []));
      } catch (e) { console.error(e); }
    };
    loadClients();
  }, []);

  // ── Executor: fetch my tasks ──
  const fetchExecutorTasks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/executor/tasks');
      setExecutorTasks(res?.data || res?.tasks || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // ── Executor: update task status ──
  const updateExecutorStatus = async (taskId, status) => {
    try {
      await apiClient.patch(`/executor/tasks/${taskId}/status`, { status });
      fetchExecutorTasks();
    } catch (e) { console.error(e); alert('Failed to update status'); }
  };

  useEffect(() => { if (viewMode === 'executor') fetchExecutorTasks(); }, [viewMode]);

  // ── Get single task detail ──
  const viewTaskDetail = async (taskId) => {
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/admin/tasks/${taskId}`);
      setDetailTask(res?.data || res?.task || res);
    } catch (e) {
      console.error(e);
      alert('Failed to load task details');
    }
    setDetailLoading(false);
  };

  // ── Create task ──
  const createTask = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await apiClient.post('/admin/tasks', form);
      setShowCreate(false);
      resetForm();
      fetchTasks();
    } catch (e) { console.error(e); alert('Failed to create task'); }
    setSaving(false);
  };

  // ── Update task (PATCH) ──
  const updateTask = async () => {
    if (!editingTask || !form.title.trim()) return;
    setSaving(true);
    try {
      await apiClient.patch(`/admin/tasks/${editingTask.id}`, form);
      setEditingTask(null);
      setShowCreate(false);
      resetForm();
      fetchTasks();
    } catch (e) { console.error(e); alert('Failed to update task'); }
    setSaving(false);
  };

  // ── Publish ──
  const publishTask = async (taskId) => {
    try {
      await apiClient.post(`/admin/tasks/${taskId}/publish`);
      fetchTasks();
      if (detailTask?.id === taskId) viewTaskDetail(taskId);
    } catch (e) { console.error(e); alert('Failed to publish'); }
  };

  // ── Generate Payment Link ──
  const generatePaymentLink = async (taskId) => {
    try {
      const res = await apiClient.post(`/admin/tasks/${taskId}/payment-link`);
      const link = res?.paymentLink || res?.data?.paymentLink || 'Generated';
      alert(`Payment link: ${link}`);
      fetchTasks();
      if (detailTask?.id === taskId) viewTaskDetail(taskId);
    } catch (e) { console.error(e); alert('Failed to generate payment link'); }
  };

  // ── Templates CRUD ──
  const fetchTemplates = async () => {
    try {
      const res = await apiClient.get('/admin/tasks/templates');
      setTemplates(res?.data || res?.templates || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); }
  };

  const createTemplate = async () => {
    if (!templateForm.title.trim()) return;
    setTemplateSaving(true);
    try {
      await apiClient.post('/admin/tasks/templates', templateForm);
      setShowCreateTemplate(false);
      setTemplateForm({ title: '', description: '', type: 'DEFAULT_TASK' });
      fetchTemplates();
    } catch (e) { console.error(e); alert('Failed to create template'); }
    setTemplateSaving(false);
  };

  const updateTemplate = async () => {
    if (!editingTemplate || !templateForm.title.trim()) return;
    setTemplateSaving(true);
    try {
      await apiClient.patch(`/admin/tasks/templates/${editingTemplate.id}`, templateForm);
      setEditingTemplate(null);
      setShowCreateTemplate(false);
      setTemplateForm({ title: '', description: '', type: 'DEFAULT_TASK' });
      fetchTemplates();
    } catch (e) { console.error(e); alert('Failed to update template'); }
    setTemplateSaving(false);
  };

  const applyTemplate = (t) => {
    setForm(prev => ({ ...prev, title: t.title || '', description: t.description || '', type: t.type || 'DEFAULT_TASK' }));
    setViewMode('admin');
    setShowCreate(true);
    setEditingTask(null);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      type: task.type || 'DEFAULT_TASK',
      clientUserId: task.clientUserId || '',
      executorUserId: task.executorUserId || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowCreate(true);
    setDetailTask(null);
  };

  const openEditTemplate = (t) => {
    setEditingTemplate(t);
    setTemplateForm({ title: t.title || '', description: t.description || '', type: t.type || 'DEFAULT_TASK' });
    setShowCreateTemplate(true);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', type: 'DEFAULT_TASK', clientUserId: '', executorUserId: '', dueDate: '' });
    setEditingTask(null);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Tasks</h1>
        <p className="text-gray-500 italic">Manage tasks, templates and executor assignments</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 border rounded-xl transition-all ${showFilters ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`} style={showFilters ? { background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' } : {}}>
              <HiOutlineFilter className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { 
            if (viewMode === 'templates') { 
              setEditingTemplate(null); setTemplateForm({ title: '', description: '', type: 'DEFAULT_TASK' }); setShowCreateTemplate(true); 
            } else { 
              resetForm(); setShowCreate(true); 
            }
          }} className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
            <HiOutlinePlus className="w-4 h-4" /> {viewMode === 'templates' ? 'New Template' : 'Create Task'}
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-3 flex-wrap">
          {[{ key: 'admin', label: 'Tasks' }, { key: 'templates', label: 'Templates' }, { key: 'executor', label: 'Executor' }].map(tab => (
            <button key={tab.key} onClick={() => { setViewMode(tab.key); if (tab.key === 'templates') fetchTemplates(); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${viewMode === tab.key ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={viewMode === tab.key ? { background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' } : {}}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters - admin only */}
      {viewMode === 'admin' && showFilters && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <ComboInput value={clientFilter} onChange={v => setClientFilter(v)} placeholder="All Clients" options={clients.map(c => ({ value: c.user_id, label: c.name || c.email || `User ${c.user_id}` }))} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <ComboInput value={executorFilter} onChange={v => setExecutorFilter(v)} placeholder="All Executors" options={clients.map(c => ({ value: c.user_id, label: c.name || c.email || `User ${c.user_id}` }))} />
            </div>
          </div>
        </div>
      )}

      {/* Status Tabs - admin */}
      {viewMode === 'admin' && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1 flex-wrap">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${statusFilter === s ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={statusFilter === s ? { background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' } : {}}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Admin Tasks Table */}
      {viewMode === 'admin' && (loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022B51] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tasks Found</h3>
          <p className="text-gray-500">Create your first task to get started.</p>
        </div>
      ) : (
        <div className="p-3 sm:p-6 rounded-2xl bg-[#f2f6f7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium rounded-l-xl" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Due Date</th>
                  <th className="px-4 py-3 text-center text-sm font-medium rounded-r-xl" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map(task => (
                  <tr key={task.id} className="bg-white hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900 text-sm">{task.title}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{task.type?.replace('_', ' ')}</td>
                    <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor(task.status)}`}>{task.status?.replace('_', ' ')}</span></td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => viewTaskDetail(task.id)} className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }} title="View"><FiEye className="w-4 h-4" /></button>
                        <button onClick={() => openEditTask(task)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Edit"><HiOutlinePencil className="w-4 h-4" /></button>
                        {task.status === 'DRAFT' && <button onClick={() => publishTask(task.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Publish"><HiOutlineUpload className="w-4 h-4" /></button>}
                        {task.type === 'OPEN_TO_PAY' && <button onClick={() => generatePaymentLink(task.id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Payment Link"><HiOutlineLink className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Executor View - My Assigned Tasks */}
      {viewMode === 'executor' && (loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022B51] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your assigned tasks...</p>
        </div>
      ) : executorTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assigned Tasks</h3>
          <p className="text-gray-500">Tasks assigned to you as executor will appear here.</p>
        </div>
      ) : (
        <div className="p-3 sm:p-6 rounded-2xl bg-[#f2f6f7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium rounded-l-xl" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Due Date</th>
                  <th className="px-4 py-3 text-center text-sm font-medium rounded-r-xl" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {executorTasks.map(task => (
                  <tr key={task.id} className="bg-white hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                      {task.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>}
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{task.type?.replace('_', ' ')}</td>
                    <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor(task.status)}`}>{task.status?.replace('_', ' ')}</span></td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {task.status === 'PUBLISHED' && (
                          <button onClick={() => updateExecutorStatus(task.id, 'IN_PROGRESS')} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-all" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Start</button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <button onClick={() => updateExecutorStatus(task.id, 'COMPLETED')} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">Complete</button>
                        )}
                        {task.status === 'COMPLETED' && (
                          <span className="text-xs text-green-600 font-medium">✓ Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Create / Edit Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowCreate(false); resetForm(); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Title</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Enter task title" className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter task description" rows={3} className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent transition-all">
                  {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to Client</label>
                <ComboInput value={form.clientUserId} onChange={v => setForm(p => ({ ...p, clientUserId: v }))} placeholder="Search and select client" options={clients.map(c => ({ value: c.user_id, label: c.name || c.email || c.phone || `User ${c.user_id}` }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Executor</label>
                <ComboInput value={form.executorUserId} onChange={v => setForm(p => ({ ...p, executorUserId: v }))} placeholder="Search and select executor" options={clients.map(c => ({ value: c.user_id, label: c.name || c.email || c.phone || `User ${c.user_id}` }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent transition-all" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={editingTask ? updateTask : createTask} disabled={saving || !form.title.trim()} className="px-5 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition-all" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
                {saving ? 'Saving...' : editingTask ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetailTask(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022B51] mx-auto"></div></div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-gray-900">{detailTask.title}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditTask(detailTask)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Edit"><HiOutlinePencil className="w-4 h-4" /></button>
                    <button onClick={() => setDetailTask(null)} className="p-1 hover:bg-gray-100 rounded-lg"><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2"><span className="text-gray-500 w-24">Status:</span> <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor(detailTask.status)}`}>{detailTask.status?.replace('_', ' ')}</span></div>
                  <div className="flex items-center gap-2"><span className="text-gray-500 w-24">Type:</span> <span className="text-gray-900">{detailTask.type?.replace('_', ' ')}</span></div>
                  {detailTask.dueDate && <div className="flex items-center gap-2"><span className="text-gray-500 w-24">Due:</span> <span className="text-gray-900">{new Date(detailTask.dueDate).toLocaleDateString()}</span></div>}
                  {detailTask.clientUserId && <div className="flex items-center gap-2"><span className="text-gray-500 w-24">Client:</span> <span className="text-gray-900">{clients.find(c => String(c.user_id) === String(detailTask.clientUserId))?.name || detailTask.clientUserId}</span></div>}
                  {detailTask.executorUserId && <div className="flex items-center gap-2"><span className="text-gray-500 w-24">Executor:</span> <span className="text-gray-900">{clients.find(c => String(c.user_id) === String(detailTask.executorUserId))?.name || detailTask.executorUserId}</span></div>}
                  {detailTask.description && <div><span className="text-gray-500">Description:</span><p className="mt-1 text-gray-700 bg-[#F8F9FA] rounded-xl p-3">{detailTask.description}</p></div>}
                  {detailTask.paymentLink && <div><span className="text-gray-500">Payment Link:</span> <a href={detailTask.paymentLink} target="_blank" rel="noopener noreferrer" className="text-[#022B51] underline break-all">{detailTask.paymentLink}</a></div>}
                </div>
                <div className="flex gap-3 mt-6">
                  {detailTask.status === 'DRAFT' && <button onClick={() => publishTask(detailTask.id)} className="px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Publish</button>}
                  {detailTask.type === 'OPEN_TO_PAY' && <button onClick={() => generatePaymentLink(detailTask.id)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">Generate Payment Link</button>}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Templates View */}
      {viewMode === 'templates' && (loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022B51] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates</h3>
          <p className="text-gray-500 mb-4">Create reusable task templates to speed up task creation.</p>
          <button onClick={() => { setEditingTemplate(null); setTemplateForm({ title: '', description: '', type: 'DEFAULT_TASK' }); setShowCreateTemplate(true); }} className="px-5 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
            Create First Template
          </button>
        </div>
      ) : (
        <div className="p-3 sm:p-6 rounded-2xl bg-[#f2f6f7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium rounded-l-xl" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Type</th>
                  <th className="px-4 py-3 text-center text-sm font-medium rounded-r-xl" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templates.map(t => (
                  <tr key={t.id} className="bg-white hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900 text-sm">{t.title}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm max-w-xs truncate">{t.description || '—'}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{t.type?.replace('_', ' ') || '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => applyTemplate(t)} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-all" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>Use</button>
                        <button onClick={() => openEditTemplate(t)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Edit"><HiOutlinePencil className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Create / Edit Template Modal */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => { setShowCreateTemplate(false); setEditingTemplate(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => { setShowCreateTemplate(false); setEditingTemplate(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Template Title</label>
                <input value={templateForm.title} onChange={e => setTemplateForm(p => ({ ...p, title: e.target.value }))} placeholder="Enter template title" className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={templateForm.description} onChange={e => setTemplateForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter template description" rows={3} className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Type</label>
                <select value={templateForm.type} onChange={e => setTemplateForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022B51] focus:border-transparent transition-all">
                  {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowCreateTemplate(false); setEditingTemplate(null); }} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={editingTemplate ? updateTemplate : createTemplate} disabled={templateSaving || !templateForm.title.trim()} className="px-5 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition-all" style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
                {templateSaving ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
