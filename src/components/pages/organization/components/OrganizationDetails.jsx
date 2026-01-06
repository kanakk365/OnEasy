import React from "react";
import BasicDetailsSection from "./BasicDetailsSection";
import DirectorsPartnersSection from "./DirectorsPartnersSection";
import DigitalSignaturesSection from "./DigitalSignaturesSection";
import AttachmentsSection from "./AttachmentsSection";
import CredentialsSection from "./CredentialsSection";

const OrganizationDetails = ({
  selectedOrg,
  editingOrg,
  saving,
  setSelectedOrg,
  handleEditOrganization,
  handleSaveOrganization,
  updateOrganizationField,
  formatDate,
  handleViewFile,
  getCurrentUserId,
  uploadFileDirect,
  // Directors/Partners
  addDirectorPartner,
  removeDirectorPartner,
  updateDirectorPartner,
  // Digital Signatures
  addDigitalSignature,
  removeDigitalSignature,
  updateDigitalSignature,
  // Websites
  addWebsite,
  updateWebsite,
  togglePasswordVisibility,
  removeWebsite,
}) => {
  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Back Button */}
      <button
        onClick={() => setSelectedOrg(null)}
        className="mb-6 flex items-center text-gray-900 font-bold text-lg hover:text-gray-700 transition-colors"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to List
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Organisation Details (With Websites)
          </h2>
          {!editingOrg && (
            <button
              onClick={handleEditOrganization}
              className="px-4 py-2 bg-[#00486D] text-white rounded-lg hover:bg-[#01334C] transition-colors font-medium text-sm"
            >
              Edit Details
            </button>
          )}
        </div>

        {/* Basic Details Section */}
        <BasicDetailsSection
          editingOrg={editingOrg}
          selectedOrg={selectedOrg}
          updateOrganizationField={updateOrganizationField}
          handlePanFileUpload={(e) => {
            // Logic adapted from previous implementation
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
              alert("File size must be less than 10MB");
              e.target.value = "";
              return;
            }
            const currentUserId = getCurrentUserId();
            if (!currentUserId) {
              alert("User ID not found");
              return;
            }
            const folder = `organizations/${currentUserId}/org-${
              editingOrg.id || "new"
            }`;
            uploadFileDirect(file, folder, "pan-file").then(({ s3Url }) => {
              updateOrganizationField("panFile", s3Url);
            });
          }}
          handleViewFile={handleViewFile}
          formatDate={formatDate}
        />

        {/* Directors / Partners Details */}
        <DirectorsPartnersSection
          editingOrg={editingOrg}
          selectedOrg={selectedOrg}
          addDirectorPartner={addDirectorPartner}
          removeDirectorPartner={removeDirectorPartner}
          updateDirectorPartner={updateDirectorPartner}
          formatDate={formatDate}
        />

        {/* Digital Signature Details */}
        <DigitalSignaturesSection
          editingOrg={editingOrg}
          selectedOrg={selectedOrg}
          addDigitalSignature={addDigitalSignature}
          removeDigitalSignature={removeDigitalSignature}
          updateDigitalSignature={updateDigitalSignature}
          formatDate={formatDate}
        />

        {/* Attachments */}
        <AttachmentsSection
          editingOrg={editingOrg}
          selectedOrg={selectedOrg}
          updateOrganizationField={updateOrganizationField}
          handleViewFile={handleViewFile}
          getCurrentUserId={getCurrentUserId}
          uploadFileDirect={uploadFileDirect}
        />

        {/* Website Details */}
        <CredentialsSection
          editingOrg={editingOrg}
          selectedOrg={selectedOrg}
          addWebsite={addWebsite}
          updateWebsite={updateWebsite}
          togglePasswordVisibility={togglePasswordVisibility}
          removeWebsite={removeWebsite}
        />

        {/* Save Changes Button */}
        {editingOrg && (
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveOrganization}
              disabled={saving}
              className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetails;
