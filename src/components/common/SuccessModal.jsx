import React, { useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";

function SuccessModal({ isOpen, onClose, title, message }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[400px] p-3 sm:p-6 z-[110] transform scale-100 transition-transform">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title || "Success!"}
          </h3>
          <p className="text-gray-600 mb-6">
            {message || "Operation completed successfully."}
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all duration-200" style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
