import React from "react";

function PaymentMethodDialog({
  showPaymentMethodDialog,
  setShowPaymentMethodDialog,
  pendingStatusUpdate,
  setPendingStatusUpdate,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  paymentFormData,
  setPaymentFormData,
  handlePaymentMethodSelection,
  handlePaymentFormSubmit,
}) {
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPaymentMethod ? "Payment Details" : "Payment Method Required"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPaymentMethod
                    ? "Please fill in the payment details below."
                    : "Payment is pending. Please select the payment method before changing the status."}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentMethodDialog(false);
                  setPendingStatusUpdate(null);
                  setSelectedPaymentMethod(null);
                  setPaymentFormData({
                    dateOfPayment: "",
                    person: "",
                    remark: "",
                  });
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!selectedPaymentMethod ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handlePaymentMethodSelection("cash")}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Paid by Cash
                </button>
                <button
                  onClick={() => handlePaymentMethodSelection("other")}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Paid by Other Source
                </button>
                <button
                  onClick={() => {
                    setShowPaymentMethodDialog(false);
                    setPendingStatusUpdate(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPaymentMethod === "cash" ? "Paid by Cash" : "Paid by Other Source"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedPaymentMethod(null)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Change payment method
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Payment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.dateOfPayment}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        dateOfPayment: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.person}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        person: e.target.value,
                      })
                    }
                    placeholder="Enter person name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark
                  </label>
                  <textarea
                    value={paymentFormData.remark}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        remark: e.target.value,
                      })
                    }
                    placeholder="Enter any remarks (optional)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePaymentFormSubmit}
                    className="flex-1 px-4 py-2 bg-[#01334C] text-white rounded-md hover:bg-[#00486D] font-medium transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentMethodDialog(false);
                      setPendingStatusUpdate(null);
                      setSelectedPaymentMethod(null);
                      setPaymentFormData({
                        dateOfPayment: "",
                        person: "",
                        remark: "",
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
  );
}

export default PaymentMethodDialog;