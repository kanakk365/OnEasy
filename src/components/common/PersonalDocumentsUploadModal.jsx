import React, { useState, useRef } from "react";
import apiClient from "../../utils/api";
import { uploadFileDirect } from "../../utils/s3Upload";
import { AUTH_CONFIG } from "../../config/auth";

function PersonalDocumentsUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const documentTypes = [
    { value: "aadhar_card", label: "Aadhaar Card" },
    { value: "pan_card", label: "PAN Card" },
    { value: "passport", label: "Passport" },
    { value: "profile_image", label: "Profile Photo" },
    { value: "signature", label: "Signature" },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedDocType || !selectedFile) {
      alert("Please select a document type and file");
      return;
    }

    setUploading(true);
    try {
      // Get user ID
      const storedUser = JSON.parse(
        localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
      );
      const userId = storedUser.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Upload directly to S3
      const folder = `user-profiles/${userId}/personal`;
      const { s3Url } = await uploadFileDirect(
        selectedFile,
        folder,
        selectedFile.name
      );

      // Save S3 URL to database
      const response = await apiClient.post("/users-page/upload-personal-document", {
        documentType: selectedDocType,
        fileUrl: s3Url, // Use fileUrl instead of fileData
        fileName: selectedFile.name,
      });

      if (response.success) {
        alert("Document uploaded successfully!");
        // Reset form
        setSelectedDocType("");
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Notify parent to refresh documents
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        onClose();
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedDocType("");
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Upload Personal Document</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
              disabled={uploading}
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#01334C] transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-[#01334C] hover:text-[#00486D] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#01334C]"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="sr-only"
                      accept="image/*,.pdf"
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF up to 5MB
                </p>
                {selectedFile && (
                  <p className="text-sm text-gray-700 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="border border-gray-300 rounded-lg p-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48 mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedDocType || !selectedFile}
              className="flex-1 px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalDocumentsUploadModal;

