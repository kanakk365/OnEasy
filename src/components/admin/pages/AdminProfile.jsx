import React, { useState, useEffect } from "react";
import { AUTH_CONFIG } from "../../../config/auth";
import apiClient from "../../../utils/api";
import {
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiCalendarLine,
  RiWomenLine,
  RiMenLine,
  RiUpload2Line,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";
import { BsPersonVcard } from "react-icons/bs";

function AdminProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    profileImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          dateOfBirth: userData.date_of_birth || "",
          gender: userData.gender || "",
          profileImage: userData.profile_image || null,
        });
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await apiClient.put("/auth/profile", {
        name: formData.name,
        email: formData.email,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        profile_image: formData.profileImage,
      });

      if (response.success) {
        const storedUser = JSON.parse(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
        );
        const updatedUser = {
          ...storedUser,
          name: formData.name,
          email: formData.email,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          profile_image: formData.profileImage,
        };
        localStorage.setItem(
          AUTH_CONFIG.STORAGE_KEYS.USER,
          JSON.stringify(updatedUser)
        );
        window.dispatchEvent(new Event("profileUpdated"));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
            }}
          >
            <BsPersonVcard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Profile Settings
            </h1>
            <p className="text-gray-500 italic ml-1">
              Manage your account information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="relative mb-4 group">
                <div className="w-40 h-40 rounded-full border-4 border-gray-50 overflow-hidden shadow-lg">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                      <RiUserLine className="w-20 h-20" />
                    </div>
                  )}
                </div>

                <label className="absolute bottom-2 right-2 w-10 h-10 bg-[#00486D] text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#003855] transition-all hover:scale-110">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <RiUpload2Line className="w-5 h-5" />
                </label>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {formData.name || "Admin User"}
              </h2>
              <p className="text-gray-500 text-sm mb-4">Administrator</p>

              <div className="w-full pt-4 border-t border-gray-100 flex justify-center gap-4">
                <div className="text-center">
                  <span className="block text-gray-900 font-bold mb-0.5">
                    {formData.phone ? "Verified" : "Unverified"}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Phone
                  </span>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="text-center">
                  <span className="block text-gray-900 font-bold mb-0.5">
                    {formData.email ? "Verified" : "Unverified"}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Email
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <RiUserLine className="w-5 h-5 text-[#00486D]" />
                  Personal Information
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                        placeholder="Enter your full name"
                      />
                      <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                        placeholder="Enter your email"
                      />
                      <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        placeholder="Mobile number"
                      />
                      <RiPhoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow"
                      />
                      <RiCalendarLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow appearance-none bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {formData.gender === "Female" ? (
                        <RiWomenLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      ) : (
                        <RiMenLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      )}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {message.text && (
                  <div
                    className={`p-4 rounded-xl flex items-start gap-3 ${
                      message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-100"
                        : "bg-red-50 text-red-800 border border-red-100"
                    }`}
                  >
                    {message.type === "success" ? (
                      <RiCheckLine className="w-5 h-5 mt-0.5" />
                    ) : (
                      <RiCloseLine className="w-5 h-5 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">{message.text}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-medium active:scale-95 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
