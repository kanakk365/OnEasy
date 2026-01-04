import React from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";

const AttachmentsSection = ({
  editingOrg,
  selectedOrg,
  updateOrganizationField,
  handleViewFile,
  getCurrentUserId,
  uploadFileDirect,
}) => {
  const data = editingOrg || selectedOrg;

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      e.target.value = "";
      return;
    }

    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        alert("User ID not found. Please refresh the page.");
        e.target.value = "";
        return;
      }

      // If we are editing, we have an ID. If new, we might rely on 'new' or generate a temp ID.
      // Ideally we should have a stable ID, but for now 'new' or passed ID works as handled in parent.
      const orgId = data.id || "new";

      const folder = `organizations/${currentUserId}/org-${orgId}`;
      const { s3Url } = await uploadFileDirect(file, folder, fieldName);
      updateOrganizationField(fieldName, s3Url);
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      alert("Failed to upload file. Please try again.");
      e.target.value = "";
    }
  };

  const AttachmentField = ({ label, fieldName, fileUrl }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden items-center p-1">
        <div className="flex-1 px-4 py-2 text-sm text-gray-500 truncate">
          {fileUrl ? "File uploaded" : "Upload file"}
        </div>
        {editingOrg ? (
          <label className="bg-[#00486D] text-white w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#01334C] transition-colors flex-shrink-0">
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, fieldName)}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <AiOutlineCloudUpload className="w-5 h-5" />
          </label>
        ) : (
          fileUrl && (
            <button
              onClick={() => handleViewFile(fileUrl)}
              className="bg-[#00486D] text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#01334C] transition-colors flex-shrink-0"
            >
              <AiOutlineCloudUpload className="w-5 h-5" />
            </button>
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-[#f2f6f7] rounded-xl p-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Attachments</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <AttachmentField
          label="Optional Attachment 1"
          fieldName="optionalAttachment1"
          fileUrl={data.optionalAttachment1}
        />
        <AttachmentField
          label="Optional Attachment 2"
          fieldName="optionalAttachment2"
          fileUrl={data.optionalAttachment2}
        />
      </div>
    </div>
  );
};

export default AttachmentsSection;
