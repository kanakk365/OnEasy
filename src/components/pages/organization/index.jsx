import React from "react";
import { useOrganizationData } from "./hooks/useOrganizationData";
import OrganizationList from "./components/OrganizationList";
import OrganizationDetails from "./components/OrganizationDetails";

function Organization() {
  const {
    // State
    loading,
    organizations,
    selectedOrg,
    setSelectedOrg,
    editingOrg,
    saving,
    searchTerm,
    setSearchTerm,
    currentPage,

    // Computed
    filteredOrgs,
    currentItems,
    totalPages,
    indexOfFirstItem,

    // Notes and Tasks
    adminNotesList,
    userNotesList,
    adminTasksList,
    userTasksList,

    // Actions
    formatDate,
    handleViewFile,
    getCurrentUserId,
    addWebsite,
    updateWebsite,
    togglePasswordVisibility,
    removeWebsite,
    addDirectorPartner,
    removeDirectorPartner,
    updateDirectorPartner,
    addDigitalSignature,
    removeDigitalSignature,
    updateDigitalSignature,
    handleEditOrganization,
    updateOrganizationField,
    handleSaveOrganization,
    handleCancelEdit,
    addOrganization,
    paginate,
    uploadFileDirect,
    handleSaveUserNoteInline,
    updateUsersPageData,
  } = useOrganizationData();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01334C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  // If an organization is selected, show detailed view
  if (selectedOrg) {
    return (
      <OrganizationDetails
        selectedOrg={selectedOrg}
        editingOrg={editingOrg}
        saving={saving}
        setSelectedOrg={setSelectedOrg}
        handleEditOrganization={handleEditOrganization}
        handleSaveOrganization={handleSaveOrganization}
        handleCancelEdit={handleCancelEdit}
        updateOrganizationField={updateOrganizationField}
        formatDate={formatDate}
        handleViewFile={handleViewFile}
        getCurrentUserId={getCurrentUserId}
        uploadFileDirect={uploadFileDirect}
        // Directors/Partners
        addDirectorPartner={addDirectorPartner}
        removeDirectorPartner={removeDirectorPartner}
        updateDirectorPartner={updateDirectorPartner}
        // Digital Signatures
        addDigitalSignature={addDigitalSignature}
        removeDigitalSignature={removeDigitalSignature}
        updateDigitalSignature={updateDigitalSignature}
        // Websites
        addWebsite={addWebsite}
        updateWebsite={updateWebsite}
        togglePasswordVisibility={togglePasswordVisibility}
        removeWebsite={removeWebsite}
        // Notes and Tasks
        adminNotesList={adminNotesList}
        userNotesList={userNotesList}
        adminTasksList={adminTasksList}
        userTasksList={userTasksList}
        handleSaveUserNoteInline={handleSaveUserNoteInline}
        updateUsersPageData={updateUsersPageData}
        organisations={organizations}
      />
    );
  }

  return (
    <OrganizationList
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      currentItems={currentItems}
      filteredOrgs={filteredOrgs}
      indexOfFirstItem={indexOfFirstItem}
      totalPages={totalPages}
      currentPage={currentPage}
      paginate={paginate}
      addOrganization={addOrganization}
      setSelectedOrg={setSelectedOrg}
    />
  );
}

export default Organization;
