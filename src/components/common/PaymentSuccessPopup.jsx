import React from 'react';

function PaymentSuccessPopup({ isOpen = true, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Success icon */}
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
          Payment Successful!
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Hold on while we work on the rest of the process. Our team will get in touch with you shortly.
        </p>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-[#00486D] text-white rounded-lg hover:bg-[#003855] transition-colors font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccessPopup;

