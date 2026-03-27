import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

const prompts = [
  "Want to check your due compliance?",
  "Want to get the list of compliances?",
  "Want to get the list of company details?",
  "Need help with annual filings?",
  "Want to check registration status?",
];

const AIAgentFAB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Hide on AI chat page
  if (location.pathname === '/ai-chat') return null;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPrompt((prev) => (prev + 1) % prompts.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden lg:flex flex-col items-end gap-3">
      {/* Expanded panel */}
      {isOpen && (
        <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 bg-white rounded-3xl shadow-2xl border border-gray-50 w-[340px] overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <img src="/agent.png" alt="AI" className="w-6 h-6 brightness-0 invert" />
              </div>
              <div>
                <p className="text-white font-bold text-base">OnEasy AI Assistance</p>
                <p className="text-white/70 text-xs">Your compliance assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <HiOutlineX className="text-xl" />
            </button>
          </div>

          <div className="p-4 space-y-1.5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Quick actions</p>
            {prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => { setIsOpen(false); navigate('/ai-chat'); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-3 group"
              >
                <HiOutlineSearch className="text-gray-400 group-hover:text-red-500 flex-shrink-0 text-base" />
                <span className="text-[13px]">{prompt}</span>
              </button>
            ))}
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={() => { setIsOpen(false); navigate('/ai-chat'); }}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <img src="/agent.png" alt="AI" className="w-5 h-5 brightness-0 invert" />
              Open AI Chat
            </button>
          </div>
        </div>
      )}

      {/* FAB with animated text */}
      {!isOpen && (
        <div className="flex items-center gap-3">
          <div
            className="bg-white rounded-3xl shadow-lg border border-red-50 px-5 py-3 w-[320px] cursor-pointer hover:shadow-xl hover:border-red-100 transition-all duration-300"
            onClick={() => setIsOpen(true)}
          >
            <p className="text-[11px] text-red-400 font-semibold mb-0.5">OnEasy AI Assistance</p>
            <p
              className={`text-sm text-gray-700 font-medium transition-all duration-300 ${
                isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              {prompts[currentPrompt]}
            </p>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-300/50 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300 border-[3px] border-red-400 relative"
          >
            <img src="/agent.png" alt="AI Agent" className="w-8 h-8 brightness-0 invert" />
            <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-20" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAgentFAB;
