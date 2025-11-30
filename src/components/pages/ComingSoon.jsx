import React from 'react';
import { useLocation } from 'react-router-dom';

function ComingSoon() {
  const location = useLocation();
  
  // Get the page name from the path
  const getPageName = () => {
    const path = location.pathname;
    if (path === '/compliance') return 'Compliance';
    if (path === '/ai-agent') return 'AI Agent';
    if (path === '/resources') return 'Resources';
    if (path === '/documents') return 'My Documents';
    return 'This Page';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] text-center">
        <div className="mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#01334C] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 md:w-16 md:h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Coming Soon
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-2 max-w-md mx-auto">
          {getPageName()} is currently under development
        </p>
        
        <p className="text-base text-gray-500 mb-8 max-w-lg mx-auto">
          We're working hard to bring you an amazing experience. Check back soon for updates!
        </p>
        
        <div className="mt-8">
          <a
            href="/client"
            className="inline-flex items-center px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;

