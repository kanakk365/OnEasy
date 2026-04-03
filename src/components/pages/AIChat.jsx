import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessions, getSessionMessages, streamQuestion } from '../../utils/aiChatApi';
import apiClient from '../../utils/api';
import { getUsersPageData } from '../../utils/usersPageApi';
import { HiOutlinePlusCircle, HiOutlineChatAlt2, HiOutlineMenu, HiOutlineX, HiOutlinePaperAirplane } from 'react-icons/hi';

// ─── Markdown-like rendering ──────────────────────────────────────────────────
function RenderMarkdown({ text }) {
  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  const docLinkRegex = /^\[([^\]]+)\]\(([^)]+)\)(?:\s*-\s*Filename:\s*(.+))?$/;

  const renderInline = (str) => {
    // Handle ***bold italic***, **bold**, *italic*, `code`, [links](url), bare URLs
    const tokens = str.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<)]+)/g);
    return tokens.map((t, j) => {
      if (!t) return null;
      if (t.startsWith('***') && t.endsWith('***'))
        return <strong key={j} className="font-semibold italic text-gray-900">{t.slice(3, -3)}</strong>;
      if (t.startsWith('**') && t.endsWith('**'))
        return <strong key={j} className="font-semibold text-gray-900">{t.slice(2, -2)}</strong>;
      if (t.startsWith('*') && t.endsWith('*'))
        return <em key={j} className="italic text-gray-700">{t.slice(1, -1)}</em>;
      if (t.startsWith('`') && t.endsWith('`'))
        return <code key={j} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-[13px] font-mono">{t.slice(1, -1)}</code>;
      const linkMatch = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch)
        return <a key={j} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#00486d] underline underline-offset-2 hover:text-[#bd0008] transition-colors">{linkMatch[1]}</a>;
      if (/^https?:\/\//.test(t))
        return <a key={j} href={t} target="_blank" rel="noopener noreferrer" className="text-[#00486d] underline underline-offset-2 break-all hover:text-[#bd0008] transition-colors">{t}</a>;
      return t;
    });
  };

  const renderDocCard = (name, url, filename, key) => (
    <a
      key={key}
      href="#"
      onClick={async (e) => {
        e.preventDefault();
        try {
          if (url.includes('.s3.') || url.includes('amazonaws.com')) {
            const response = await apiClient.post('/admin/get-signed-url', { s3Url: url });
            if (response.success && response.signedUrl) {
              window.open(response.signedUrl, '_blank');
              return;
            }
          }
          window.open(url, '_blank');
        } catch {
          window.open(url, '_blank');
        }
      }}
      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all group shadow-sm"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00486d] flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-800 group-hover:text-blue-700 truncate">{name}</p>
        {filename && <p className="text-[11px] text-gray-400 truncate mt-0.5">{filename}</p>}
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  );

  const renderBlock = (block) => {
    const lines = block.split('\n');
    const elements = [];
    let listItems = [];
    let listType = null;
    let docCards = [];
    let pendingDocName = null;

    const flushList = () => {
      if (listItems.length === 0) return;
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      const cls = listType === 'ol' ? 'list-decimal' : 'list-disc';
      elements.push(<Tag key={`l${elements.length}`} className={`${cls} pl-5 space-y-1.5 my-2 text-[13px] leading-relaxed text-gray-700`}>{listItems}</Tag>);
      listItems = [];
      listType = null;
    };

    const flushDocs = () => {
      if (docCards.length === 0) return;
      elements.push(<div key={`d${elements.length}`} className="space-y-2 my-3">{docCards}</div>);
      docCards = [];
    };

    const flushPending = (idx) => {
      if (!pendingDocName) return;
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(<li key={`p${idx}`}>{renderInline(pendingDocName)}</li>);
      pendingDocName = null;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) { flushPending(idx); flushList(); flushDocs(); return; }

      // Horizontal rule: ---, ***, ___
      if (/^[-*_]{3,}$/.test(trimmed)) {
        flushPending(idx); flushList(); flushDocs();
        elements.push(<hr key={idx} className="my-3 border-gray-200" />);
        return;
      }

      if (pendingDocName) {
        const viewMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)(?:\s*-\s*Filename:\s*(.+))?$/);
        if (viewMatch) {
          flushList();
          docCards.push(renderDocCard(pendingDocName, viewMatch[2], viewMatch[3], idx));
          pendingDocName = null;
          return;
        }
        flushPending(idx);
      }

      const listContent = trimmed.match(/^[-*•]\s+(.*)/)?.[1] || trimmed.match(/^\d+[.)]\s+(.*)/)?.[1];
      if (listContent) {
        const singleLineDoc = listContent.match(docLinkRegex);
        if (singleLineDoc && singleLineDoc[2].startsWith('http')) {
          flushList();
          docCards.push(renderDocCard(singleLineDoc[1], singleLineDoc[2], singleLineDoc[3], idx));
          return;
        }
      }

      flushDocs();

      const ulMatch = trimmed.match(/^[-*•]\s+(.*)/);
      const olMatch = !ulMatch && trimmed.match(/^\d+[.)]\s+(.*)/);

      if (ulMatch) {
        pendingDocName = ulMatch[1];
        return;
      }

      if (olMatch) {
        if (listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(<li key={idx}>{renderInline(olMatch[1])}</li>);
      } else {
        flushList();
        // Check if plain line is a doc link: [Name](url) - Filename: xyz
        const plainDocMatch = trimmed.match(docLinkRegex);
        if (plainDocMatch && plainDocMatch[2].startsWith('http')) {
          docCards.push(renderDocCard(plainDocMatch[1], plainDocMatch[2], plainDocMatch[3], idx));
        } else if (trimmed.startsWith('### '))
          elements.push(<h3 key={idx} className="font-semibold text-[13px] text-gray-900 mt-4 mb-1.5">{renderInline(trimmed.slice(4))}</h3>);
        else if (trimmed.startsWith('## '))
          elements.push(<h2 key={idx} className="font-bold text-[14px] text-gray-900 mt-4 mb-1.5">{renderInline(trimmed.slice(3))}</h2>);
        else if (trimmed.startsWith('# '))
          elements.push(<h1 key={idx} className="font-bold text-[15px] text-gray-900 mt-4 mb-1.5">{renderInline(trimmed.slice(2))}</h1>);
        else
          elements.push(<p key={idx} className="text-[13px] leading-relaxed text-gray-700">{renderInline(trimmed)}</p>);
      }
    });
    flushPending(lines.length);
    flushList();
    flushDocs();
    return elements;
  };

  return (
    <div className="space-y-1.5">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return (
            <pre key={i} className="bg-gray-900 text-green-300 rounded-xl p-4 text-[12px] overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed my-3">
              {code}
            </pre>
          );
        }
        return <div key={i}>{renderBlock(part)}</div>;
      })}
    </div>
  );
}

// ─── Format timestamp with date & time ────────────────────────────────────────
function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${time}`;
}

// ─── Single chat message bubble ───────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-5`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow ${isUser ? 'bg-[#00486d]' : 'bg-[#bd0008]'}`}>
        {isUser ? 'U' : <img src="/agent.png" alt="AI" className="w-4 h-4 brightness-0 invert" />}
      </div>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${isUser ? 'text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`} style={isUser ? { background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' } : {}}>
        {isUser ? <p className="text-[13px] leading-relaxed">{message.content}</p> : <RenderMarkdown text={message.content} />}
        {message.timestamp && (
          <p className={`text-[10px] mt-2 ${isUser ? 'text-blue-200/70 text-right' : 'text-gray-300'}`}>
            {formatTimestamp(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ status }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#bd0008] text-white shadow-sm">
        <img src="/agent.png" alt="AI" className="w-4 h-4 brightness-0 invert" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
        {status ? (
          <p className="text-xs text-gray-400 italic">{status}</p>
        ) : (
          <div className="flex gap-1 items-center h-5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main AIChat Component ────────────────────────────────────────────────────
export default function AIChat() {
  const navigate = useNavigate();

  // Sessions sidebar
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Messages
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Input
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingStatus, setStreamingStatus] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Organization selection
  const [organisations, setOrganisations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);

  // Fetch user's organisations and auto-select if only one
  const fetchOrganisations = useCallback(async () => {
    setOrgLoading(true);
    try {
      const data = await getUsersPageData();
      const orgs = data?.data?.organisations || data?.data?.user?.organisations || [];
      setOrganisations(orgs);
      if (orgs.length === 1) setSelectedOrg(orgs[0]);
      return orgs;
    } catch (err) {
      console.error('Failed to fetch organisations:', err);
      return [];
    } finally {
      setOrgLoading(false);
    }
  }, []);

  // Load orgs on mount
  useEffect(() => { fetchOrganisations(); }, [fetchOrganisations]);

  // ── Scroll to bottom whenever messages change ──────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // ── Load messages for selected session ────────────────────────────────────
  const selectSession = useCallback(async (sessionId) => {
    setActiveSessionId(sessionId);
    setSidebarOpen(false);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const data = await getSessionMessages(sessionId, 1, 50);
      // API returns { id, sessionId, messages: [...], pagination: {...} }
      const msgs = data?.messages || (Array.isArray(data) ? data : data?.data || []);
      const normalised = msgs.map(m => ({
        id: m.id,
        // Role comes back as uppercase "USER" / "ASSISTANT" — normalise to lowercase
        role: (m.role || '').toLowerCase() === 'user' ? 'user' : 'assistant',
        content: m.content || '',
        timestamp: m.createdAt || m.created_at || m.timestamp,
      }));
      // Messages are already in chronological order from the API
      setMessages(normalised);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ── Load sessions on mount ─────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      // API returns { total, items: [...] }
      const list = Array.isArray(data) ? data : data?.items || data?.sessions || data?.data || [];
      setSessions(list);
      // Auto-select the most recent session
      if (list.length > 0 && !activeSessionId) {
        selectSession(list[0].sessionId || list[0].id);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  }, [activeSessionId, selectSession]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ── Start a new session (no explicit API; first message will create one) ───
  const startNewSession = () => {
    const tempId = `temp-${Date.now()}`;
    setActiveSessionId(tempId);
    setMessages([]);
    setSidebarOpen(false);
  };

  // ── Send message & stream response ────────────────────────────────────────
  const sendMessage = async (overrideQuestion, overrideOrgId) => {
    const question = overrideQuestion || input.trim();
    if (!question || streaming) return;

    const orgId = overrideOrgId || selectedOrg?.id || null;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setStreamingText('');

    // Resize textarea back
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const sessionId = activeSessionId?.startsWith('temp-') ? undefined : activeSessionId;
      const response = await streamQuestion(question, sessionId, orgId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errText}`);
      }

      // ── Read SSE stream ────────────────────────────────────────────────────
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';
      let rawDebug = ''; // collect everything for debugging
      setStreamingStatus('Processing...');

      const SKIP_TYPES = new Set(['process', 'ready', 'start', 'end', 'error']);

      // Try to extract a content token from a JSON string
      const extractToken = (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          const type = parsed?.type || parsed?.event;

          if (type === 'status' && parsed?.message) {
            setStreamingStatus(parsed.message);
            return null;
          }
          if (SKIP_TYPES.has(type)) return null;

          return parsed?.content || parsed?.token || parsed?.text || parsed?.delta || parsed?.choices?.[0]?.delta?.content || parsed?.message || null;
        } catch {
          return null;
        }
      };

      const processLine = (trimmed) => {
        if (!trimmed || trimmed === '[DONE]') return;

        // Strip "data:" prefix if present
        let raw = trimmed;
        if (raw.startsWith('data:')) {
          raw = raw.slice(5).trim();
        }
        if (!raw || raw === '[DONE]') return;
        if (SKIP_TYPES.has(raw)) return;

        // Try JSON parse first
        const token = extractToken(raw);
        if (token) {
          accumulated += token;
          setStreamingStatus('');
          setStreamingText(accumulated);
          return;
        }

        // If not valid JSON and not a skip keyword, treat as raw text
        if (raw && !raw.startsWith('{') && !raw.startsWith('[')) {
          accumulated += raw;
          setStreamingStatus('');
          setStreamingText(accumulated);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        rawDebug += chunk;
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          processLine(line.trim());
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        processLine(buffer.trim());
      }

      // Finalise: commit streamed text into messages list
      setStreamingStatus('');
      if (!accumulated) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: '⚠️ The AI service connected but did not return a response. This is likely a backend issue — please check the server logs for the compliance-chat service or try again later.',
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        const assistantMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: accumulated,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
      setStreamingText('');
      loadSessions();
    } catch (err) {
      console.error('Stream error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: '⚠️ Sorry, something went wrong. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
      setStreamingText('');
      setStreamingStatus('');
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleOrgSelect = (org) => {
    setSelectedOrg(org);
    setShowOrgPicker(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[100dvh] pb-[70px] lg:pb-0 bg-gray-50 overflow-hidden">

      {/* ── Sidebar Overlay (mobile) ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' }}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#bd0008] rounded-full flex items-center justify-center shadow-md">
              <img src="/agent.png" alt="AI" className="w-4 h-4 brightness-0 invert" />
            </div>
            <span className="font-semibold text-base">OnEasy AI Assistance</span>
          </div>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat button */}
        <div className="px-4 py-3">
          <button
            onClick={startNewSession}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {sessions.length === 0 && (
            <p className="text-white/50 text-xs text-center mt-6">No sessions yet. Start a new chat!</p>
          )}
          {sessions.map((s) => {
            const id = s.sessionId || s.id;
            const label = s.title || `Session ${id?.slice(0, 8)}`;
            const preview = s.lastMessage?.content;
            const isActive = id === activeSessionId;
            return (
              <button
                key={id}
                onClick={() => selectSession(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10 text-white/80'}`}
              >
                <HiOutlineChatAlt2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{label}</p>
                  {preview && (
                    <p className="truncate text-[10px] text-white/50 mt-0.5">{preview}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Back to dashboard */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={() => navigate('/client')}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm text-white/70 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* ── Main Chat Area ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top Bar */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
          <button
            className="lg:hidden text-gray-500 hover:text-[#00486d] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <HiOutlineMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#bd0008] rounded-full flex items-center justify-center shadow-sm">
              <img src="/agent.png" alt="AI" className="w-4 h-4 brightness-0 invert" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">OnEasy AI Assistance</p>
              <p className="text-[10px] text-gray-400">Powered by OnEasy</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-500">Online</span>
            </div>
            <button
              onClick={() => navigate('/client')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          {/* Empty state */}
          {messages.length === 0 && !loadingMessages && !streaming && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#bd0008] rounded-2xl flex items-center justify-center shadow-lg">
                <img src="/agent.png" alt="AI" className="w-8 h-8 brightness-0 invert" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">OnEasy AI Assistance</h2>
              <p className="text-sm text-gray-500">Ask me anything about your compliance tasks, upcoming deadlines, registrations, or any business queries.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-2">
                {[
                  'What are my upcoming compliances?',
                  'Show my assigned tasks',
                  'What documents do I need for GST?',
                  'How do I register a Private Limited Company?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                    className="text-left px-3 py-2.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-[#bd0008] hover:text-[#bd0008] transition-colors shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading messages skeleton */}
          {loadingMessages && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                  <div className={`h-12 bg-gray-200 rounded-2xl animate-pulse ${i % 2 === 0 ? 'w-40' : 'w-64'}`} />
                </div>
              ))}
            </div>
          )}

          {/* Rendered messages */}
          {!loadingMessages && messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Streaming assistant response */}
          {streaming && streamingText && (
            <MessageBubble message={{ id: 'streaming', role: 'assistant', content: streamingText }} />
          )}

          {/* Typing indicator when streaming hasn't produced text yet */}
          {streaming && !streamingText && <TypingIndicator status={streamingStatus} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 sm:px-6 py-4 bg-white border-t border-gray-100">
          {/* Org Picker Overlay */}
          {showOrgPicker && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Select an organisation</p>
                <button onClick={() => setShowOrgPicker(false)} className="text-gray-400 hover:text-gray-600">
                  <HiOutlineX className="w-4 h-4" />
                </button>
              </div>
              {orgLoading ? (
                <p className="text-xs text-gray-500">Loading...</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {organisations.map(org => (
                    <button
                      key={org.id}
                      onClick={() => handleOrgSelect(org)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-[#022B51]/5 border transition-all ${selectedOrg?.id === org.id ? 'border-[#022B51]/30 bg-[#022B51]/5' : 'border-transparent hover:border-[#022B51]/20'}`}
                    >
                      <p className="text-sm font-medium text-gray-800">{org.legal_name || org.trade_name}</p>
                      {org.trade_name && org.legal_name && <p className="text-xs text-gray-500">{org.trade_name}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Org Badge — click to change */}
          {organisations.length > 0 && !showOrgPicker && (
            <div className="mb-2 flex items-center gap-2">
              <button onClick={() => setShowOrgPicker(true)} className="text-xs bg-[#022B51]/10 text-[#022B51] px-2 py-1 rounded-full font-medium hover:bg-[#022B51]/20 transition-colors">
                {selectedOrg ? (selectedOrg.legal_name || selectedOrg.trade_name) : 'Select Organisation'}
              </button>
              {selectedOrg && (
                <button onClick={() => setSelectedOrg(null)} className="text-gray-400 hover:text-gray-600">
                  <HiOutlineX className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#00486d] focus-within:ring-2 focus-within:ring-[#00486d]/10 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask about your compliance, tasks, legal status…"
              className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 max-h-[120px] py-1 leading-relaxed"
              disabled={streaming}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${input.trim() && !streaming ? 'text-white hover:opacity-90 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              style={input.trim() && !streaming ? { background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' } : {}}
            >
              <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
