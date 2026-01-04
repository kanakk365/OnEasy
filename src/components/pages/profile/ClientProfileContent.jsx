import React from "react";

const ClientProfileContent = ({
  formData,
  userId,
  clientStatus,
  saving,
  handleInputChange,
  handleFileChange,
  handleViewFile,
  handleSaveClientProfile,
}) => {
  return (
    <div className="px-6 pb-6 pt-2">
      <div className="space-y-6">
        {/* Row 1: System Client ID, Client Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* System Client ID */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              System Client ID
            </label>
            <div className="w-full px-4 py-3 bg-[#F4F6F8] rounded-lg">
              <span className="text-sm font-semibold text-[#01334C]">
                {userId || "ON0013"}
              </span>
            </div>
          </div>

          {/* Client Status */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Client Status
            </label>
            <div className="w-full px-4 py-3 bg-[#F4F6F8] rounded-lg">
              <span className="text-sm font-semibold text-[#01334C]">
                {clientStatus || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Name, Whatsapp Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Name (As per PAN)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 bg-[#F4F6F8] border-none rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter Name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Whatsapp number
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              className="w-full px-4 py-3 bg-[#F4F6F8] border-none rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter Whatsapp Number"
            />
          </div>
        </div>

        {/* Row 3: Email Id, Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email Id</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 bg-[#F4F6F8] border-none rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter Email Id"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
                className="w-full px-4 py-3 bg-[#F4F6F8] border-none rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="DD/MM/YY"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Address, Business Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full px-4 py-3 bg-[#F4F6F8] border-none rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter Address"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Business Address (If available)
            </label>
            <input
              type="text"
              value={formData.businessAddress}
              onChange={(e) =>
                handleInputChange("businessAddress", e.target.value)
              }
              className="w-full px-4 py-3 bg-[#F4F6F8] border-none rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter Business address"
            />
          </div>
        </div>

        {/* Row 5: Document Uploads - Aadhar Card, Pan Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Aadhar Card
            </label>
            <div className="flex bg-[#F4F6F8] rounded-lg p-1 items-center">
              <div className="flex-1 px-4 py-2 text-sm text-gray-500">
                {formData.aadharCard &&
                typeof formData.aadharCard === "string" &&
                formData.aadharCard.trim() !== ""
                  ? "File uploaded"
                  : "Upload file"}
              </div>
              <label className="bg-[#00486D] text-white w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#01334C] transition-colors flex-shrink-0">
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("aadharCard", e.target.files[0])
                  }
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16V8M12 16L9 13M12 16L15 13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </label>
            </div>
            {formData.aadharCard &&
              typeof formData.aadharCard === "string" &&
              formData.aadharCard.trim() !== "" && (
                <div className="mt-2 text-right">
                  <button
                    onClick={() => handleViewFile(formData.aadharCard)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View file
                  </button>
                </div>
              )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Pan Card</label>
            <div className="flex bg-[#F4F6F8] rounded-lg p-1 items-center">
              <div className="flex-1 px-4 py-2 text-sm text-gray-500">
                {formData.panCard &&
                typeof formData.panCard === "string" &&
                formData.panCard.trim() !== ""
                  ? "File uploaded"
                  : "Upload file"}
              </div>
              <label className="bg-[#00486D] text-white w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#01334C] transition-colors flex-shrink-0">
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("panCard", e.target.files[0])
                  }
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16V8M12 16L9 13M12 16L15 13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </label>
            </div>
            {formData.panCard &&
              typeof formData.panCard === "string" &&
              formData.panCard.trim() !== "" && (
                <div className="mt-2 text-right">
                  <button
                    onClick={() => handleViewFile(formData.panCard)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View file
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Row 6: Signature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Signature
            </label>
            <div className="flex bg-[#F4F6F8] rounded-lg p-1 items-center">
              <div className="flex-1 px-4 py-2 text-sm text-gray-500">
                {formData.signature &&
                typeof formData.signature === "string" &&
                formData.signature.trim() !== ""
                  ? "File uploaded"
                  : "Upload file"}
              </div>
              <label className="bg-[#00486D] text-white w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#01334C] transition-colors flex-shrink-0">
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("signature", e.target.files[0])
                  }
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16V8M12 16L9 13M12 16L15 13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </label>
            </div>
            {formData.signature &&
              typeof formData.signature === "string" &&
              formData.signature.trim() !== "" && (
                <div className="mt-2 text-right">
                  <button
                    onClick={() => handleViewFile(formData.signature)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View file
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSaveClientProfile}
            disabled={saving}
            className="px-6 py-2 text-white rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              background: "linear-gradient(90deg, #01334C 0%, #00486D 100%)",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileContent;
