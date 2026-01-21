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
            <div className="flex gap-3">
              <select
                value={formData.countryCode || "+91"}
                onChange={(e) => handleInputChange("countryCode", e.target.value)}
                className="w-28 px-3 py-3 bg-[#F4F6F8] border-none rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.75rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+60">🇲🇾 +60</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+64">🇳🇿 +64</option>
                <option value="+86">🇨🇳 +86</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+82">🇰🇷 +82</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+39">🇮🇹 +39</option>
                <option value="+34">🇪🇸 +34</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+974">🇶🇦 +974</option>
                <option value="+965">🇰🇼 +965</option>
                <option value="+968">🇴🇲 +968</option>
                <option value="+92">🇵🇰 +92</option>
                <option value="+880">🇧🇩 +880</option>
                <option value="+94">🇱🇰 +94</option>
                <option value="+977">🇳🇵 +977</option>
                <option value="+27">🇿🇦 +27</option>
                <option value="+55">🇧🇷 +55</option>
                <option value="+52">🇲🇽 +52</option>
                <option value="+7">🇷🇺 +7</option>
              </select>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => {
                  // Only allow digits, adjust max length based on country
                  const value = e.target.value.replace(/\D/g, "");
                  const maxLength = formData.countryCode === "+91" ? 10 : 15; // India is 10, others can be up to 15
                  handleInputChange("whatsapp", value.slice(0, maxLength));
                }}
                className="flex-1 px-4 py-3 bg-[#F4F6F8] border-none rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={formData.countryCode === "+91" ? "Enter 10-digit number" : "Enter phone number"}
                maxLength={formData.countryCode === "+91" ? 10 : 15}
              />
            </div>
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
