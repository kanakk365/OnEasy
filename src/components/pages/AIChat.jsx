import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessions, getSessionMessages, streamQuestion } from '../../utils/aiChatApi';
import { HiOutlinePlusCircle, HiOutlineChatAlt2, HiOutlineMenu, HiOutlineX, HiOutlinePaperAirplane } from 'react-icons/hi';
import { RiRobot2Line } from 'react-icons/ri';

// ─── Markdown-like rendering (bold, inline code, code blocks) ────────────────
function RenderMarkdown({ text }) {
  if (!text) return null;

  // Split into code blocks and regular text
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="leading-relaxed space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return (
            <pre key={i} className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto font-mono whitespace-pre-wrap">
              {code}
            </pre>
          );
        }

        // Process inline: bold, inline-code, newlines
        const inline = part.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
        return (
          <span key={i}>
            {inline.map((chunk, j) => {
              if (chunk.startsWith('**') && chunk.endsWith('**')) {
                return <strong key={j}>{chunk.slice(2, -2)}</strong>;
              }
              if (chunk.startsWith('`') && chunk.endsWith('`')) {
                return (
                  <code key={j} className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-xs font-mono">
                    {chunk.slice(1, -1)}
                  </code>
                );
              }
              if (chunk === '\n') return <br key={j} />;
              return chunk;
            })}
          </span>
        );
      })}
    </div>
  );
}

// ─── Single chat message bubble ───────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${isUser ? 'bg-[#00486d]' : 'bg-[#bd0008]'}`}>
        {isUser ? 'U' : <img src="/agent.png" alt="AI" className="w-4 h-4 brightness-0 invert" />}
      </div>
      {/* Bubble */}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm shadow-sm ${isUser ? 'text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`} style={isUser ? { background: 'linear-gradient(180deg, #022B51 0%, #015079 100%)' } : {}}>
        {isUser ? <p className="leading-relaxed">{message.content}</p> : <RenderMarkdown text={message.content} />}
        {message.timestamp && (
          <p className={`text-[10px] mt-1 ${isUser ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
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
  const sendMessage = async () => {
    const question = input.trim();
    if (!question || streaming) return;

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
      const response = await streamQuestion(question, sessionId);

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
      setStreamingStatus('Processing...');

      if (reader) {
      while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines from buffer
          const lines = buffer.split('\n');
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === '') continue;

            // SSE "data:" lines
            if (trimmed.startsWith('data:')) {
              const raw = trimmed.slice(5).trim();

              // Stream end sentinel
              if (raw === '[DONE]') continue;

              try {
                const parsed = JSON.parse(raw);
                const type = parsed?.type || parsed?.event;

                // Show status messages as live indicator
                if (type === 'status' && parsed?.message) {
                  setStreamingStatus(parsed.message);
                  continue;
                }

                if (type === 'process' || type === 'ready' || type === 'start' || type === 'end' || type === 'error') continue;

                const token =
                  parsed?.content ||
                  parsed?.token ||
                  parsed?.text ||
                  parsed?.delta ||
                  parsed?.choices?.[0]?.delta?.content ||
                  '';

                if (token) {
                  accumulated += token;
                  setStreamingStatus('');
                  setStreamingText(accumulated);
                }
              } catch {
                if (raw && raw !== 'process' && raw !== 'ready' && raw !== 'start' && raw !== 'end') {
                  accumulated += raw;
                  setStreamingStatus('');
                  setStreamingText(accumulated);
                }
              }
            }
          }
        }

        // Flush any remaining buffer content
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer.trim());
            const token = parsed?.content || parsed?.token || parsed?.text || '';
            if (token) accumulated += token;
          } catch { /* ignore */ }
        }
      }

      // Finalise: commit streamed text into messages list
      setStreamingStatus('');
      if (!accumulated) {
        // Backend connected but sent no content — likely a backend-side issue
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: '⚠️ The server is processing your request but no response was returned. Please try again in a moment.',
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

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
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500">Online</span>
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
