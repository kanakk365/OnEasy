import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BasicDetailsSection from "./BasicDetailsSection";
import DirectorsPartnersSection from "./DirectorsPartnersSection";
import DigitalSignaturesSection from "./DigitalSignaturesSection";
import AttachmentsSection from "./AttachmentsSection";
import CredentialsSection from "./CredentialsSection";
import OrganizationNotesSection from "./OrganizationNotesSection";
import OrganizationTasksSection from "./OrganizationTasksSection";
import UserOrgComplianceSection from "./UserOrgComplianceSection";
import AddComplianceSection from "./AddComplianceSection";

const OrganizationDetails = ({
  selectedOrg,
  editingOrg,
  saving,
  setSelectedOrg,
  handleEditOrganization,
  handleSaveOrganization,
  handleCancelEdit,
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
  // Notes and Tasks
  adminNotesList = [],
  userNotesList = [],
  adminTasksList = [],
  userTasksList = [],
  handleSaveUserNoteInline,
  updateUsersPageData,
  organisations = [],
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("organization-details");

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  const tabs = [
    { key: "organization-details", label: "Organization Details" },
    { key: "directors-partners", label: "Directors / Partners Details" },
    { key: "digital-signatures", label: "Digital Signature Details" },
    { key: "attachments", label: "Attachments" },
    { key: "credentials", label: "Credentials" },
    { key: "notes", label: "Notes" },
    { key: "tasks", label: "Tasks" },
    { key: "assigned-compliances", label: "Assigned Compliances" },
    { key: "add-compliance", label: "Add Compliance" },
  ];

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header with Edit Button */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Organisation Details
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

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 px-4 pt-4 overflow-x-auto overflow-y-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-white text-[#00486D] border-b-2 border-[#00486D] -mb-px"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[400px]">
          {activeTab === "organization-details" && (
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
          )}

          {activeTab === "directors-partners" && (
            <DirectorsPartnersSection
              editingOrg={editingOrg}
              selectedOrg={selectedOrg}
              addDirectorPartner={addDirectorPartner}
              removeDirectorPartner={removeDirectorPartner}
              updateDirectorPartner={updateDirectorPartner}
              formatDate={formatDate}
            />
          )}

          {activeTab === "digital-signatures" && (
            <DigitalSignaturesSection
              editingOrg={editingOrg}
              selectedOrg={selectedOrg}
              addDigitalSignature={addDigitalSignature}
              removeDigitalSignature={removeDigitalSignature}
              updateDigitalSignature={updateDigitalSignature}
              formatDate={formatDate}
            />
          )}

          {activeTab === "attachments" && (
            <AttachmentsSection
              editingOrg={editingOrg}
              selectedOrg={selectedOrg}
              updateOrganizationField={updateOrganizationField}
              handleViewFile={handleViewFile}
              getCurrentUserId={getCurrentUserId}
              uploadFileDirect={uploadFileDirect}
            />
          )}

          {activeTab === "credentials" && (
            <CredentialsSection
              editingOrg={editingOrg}
              selectedOrg={selectedOrg}
              addWebsite={addWebsite}
              updateWebsite={updateWebsite}
              togglePasswordVisibility={togglePasswordVisibility}
              removeWebsite={removeWebsite}
            />
          )}

          {activeTab === "notes" && (
            <OrganizationNotesSection
              adminNotesList={adminNotesList}
              userNotesList={userNotesList}
              organizationId={selectedOrg?.id}
              handleViewFile={handleViewFile}
              organisations={organisations}
              userId={getCurrentUserId()}
              updateUsersPageData={updateUsersPageData}
              onAddNote={() => {
                // Redirect to Settings Notes tab to add note
                navigate(`/settings?tab=notes&orgId=${selectedOrg?.id}`);
              }}
              onSaveUserNote={
                handleSaveUserNoteInline
                  ? async (editedNote, noteIndex) => {
                      await handleSaveUserNoteInline(editedNote, noteIndex);
                    }
                  : undefined
              }
              onDeleteUserNote={(index, note) => {
                // Redirect to Settings Notes tab for deletion (or handle inline if needed)
                navigate(
                  `/settings?tab=notes&orgId=${selectedOrg?.id}&deleteNoteId=${note.id || index}`,
                );
              }}
            />
          )}

          {activeTab === "tasks" && (
            <OrganizationTasksSection
              adminTasksList={adminTasksList}
              userTasksList={userTasksList}
              organizationId={selectedOrg?.id}
              onAddTask={() => {
                // Redirect to Settings Tasks tab to add task
                navigate(`/settings?tab=tasks&orgId=${selectedOrg?.id}`);
              }}
            />
          )}

          {activeTab === "assigned-compliances" && (
            <UserOrgComplianceSection selectedOrg={selectedOrg} />
          )}

          {activeTab === "add-compliance" && (
            <AddComplianceSection selectedOrg={selectedOrg} />
          )}

          {/* Save Changes Button */}
          {editingOrg && (
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOrganization}
                  disabled={saving}
                  className="px-8 py-2.5 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetails;
