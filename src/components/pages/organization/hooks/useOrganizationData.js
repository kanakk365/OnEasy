import { useState, useEffect, useCallback } from "react";
import {
  getUsersPageData,
  updateUsersPageData,
} from "../../../../utils/usersPageApi";
import { uploadFileDirect, viewFile } from "../../../../utils/s3Upload";
import { AUTH_CONFIG } from "../../../../config/auth";

export const useOrganizationData = () => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [adminNotesList, setAdminNotesList] = useState([]);
  const [userNotesList, setUserNotesList] = useState([]);
  const [adminTasksList, setAdminTasksList] = useState([]);
  const [userTasksList, setUserTasksList] = useState([]);

  const loadOrganizationData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsersPageData();

      if (response.success && response.data) {
        const { organisations } = response.data;

        if (organisations && organisations.length > 0) {
          setOrganizations(
            organisations.map((org) => {
              let websites = [];
              if (org.websites) {
                try {
                  websites =
                    typeof org.websites === "string"
                      ? JSON.parse(org.websites)
                      : org.websites;
                  if (!Array.isArray(websites)) websites = [];
                } catch {
                  websites = [];
                }
              }

              let directorsPartners = [];
              if (org.directors_partners_details) {
                try {
                  directorsPartners =
                    typeof org.directors_partners_details === "string"
                      ? JSON.parse(org.directors_partners_details)
                      : org.directors_partners_details;
                  if (!Array.isArray(directorsPartners)) directorsPartners = [];
                } catch {
                  directorsPartners = [];
                }
              }

              let digitalSignatures = [];
              if (org.digital_signature_details) {
                try {
                  digitalSignatures =
                    typeof org.digital_signature_details === "string"
                      ? JSON.parse(org.digital_signature_details)
                      : org.digital_signature_details;
                  if (!Array.isArray(digitalSignatures)) digitalSignatures = [];
                } catch {
                  digitalSignatures = [];
                }
              }

              return {
                id: org.id,
                organisationType: org.organisation_type || "-",
                legalName: org.legal_name || "-",
                tradeName: org.trade_name || "-",
                category: org.category || "-",
                gstin: org.gstin || "-",
                panNumber: org.pan_number || "-",
                incorporationDate: org.incorporation_date || "-",
                tan: org.tan || "-",
                cin: org.cin || "-",
                // Legacy support: if new fields don't exist, try to parse from old registered_address
                registeredAddress: org.registered_address || "-",
                registeredAddressLine1: org.registered_address_line1 || org.registered_address?.split(',')[0]?.trim() || "-",
                registeredAddressLine2: org.registered_address_line2 || org.registered_address?.split(',').slice(1).join(',').trim() || "-",
                registeredAddressDistrict: org.registered_address_district || "-",
                registeredAddressState: org.registered_address_state || "-",
                registeredAddressCountry: org.registered_address_country || "India",
                registeredAddressPincode: org.registered_address_pincode || "-",
                panFile: org.pan_file || null,
                directorsPartners: directorsPartners.map((dp, idx) => ({
                  id: dp.id || `dp-${Date.now()}-${idx}`,
                  name: dp.name || "",
                  dinNumber: dp.din_number || "",
                  contact: dp.contact || "",
                  email: dp.email || "",
                  dateOfAddition: dp.date_of_addition || "",
                  status: dp.status || "Active",
                })),
                digitalSignatures: digitalSignatures.map((ds, idx) => ({
                  id: ds.id || `ds-${Date.now()}-${idx}`,
                  name: ds.name || "",
                  dscNumber: ds.dsc_number || "",
                  expiryDate: ds.expiry_date || "",
                  status: ds.status || "Active",
                })),
                optionalAttachment1: org.optional_attachment_1 || null,
                optionalAttachment2: org.optional_attachment_2 || null,
                websites: websites.map((w, index) => {
                  const baseId = Date.now();
                  return {
                    ...w,
                    id: w.id || baseId + index * 1000,
                    remarks: w.remarks || "",
                    showPassword: w.showPassword || false,
                  };
                }),
              };
            })
          );
        }

        // Load notes and tasks
        const user = response.data.user || {};
        
        // Parse admin notes
        const adminNotesRaw = user.admin_notes || "";
        try {
          const notesList = JSON.parse(adminNotesRaw);
          if (Array.isArray(notesList)) {
            setAdminNotesList(notesList);
          } else if (notesList.note !== undefined) {
            setAdminNotesList([notesList]);
          } else if (adminNotesRaw) {
            setAdminNotesList([{ date: "", description: adminNotesRaw, attachments: [], adminActionItems: [], clientActionItems: [] }]);
          }
        } catch {
          if (adminNotesRaw) {
            setAdminNotesList([{ date: "", description: adminNotesRaw, attachments: [], adminActionItems: [], clientActionItems: [] }]);
          }
        }

        // Parse user notes
        const userNotesRaw = user.user_notes || "";
        try {
          const notesList = JSON.parse(userNotesRaw);
          if (Array.isArray(notesList)) {
            setUserNotesList(notesList);
          } else if (notesList.note !== undefined) {
            setUserNotesList([notesList]);
          } else if (userNotesRaw) {
            setUserNotesList([{ date: "", description: userNotesRaw, attachments: [] }]);
          }
        } catch {
          if (userNotesRaw) {
            setUserNotesList([{ date: "", description: userNotesRaw, attachments: [] }]);
          }
        }

        // Parse admin tasks
        const adminTasksRaw = user.admin_tasks || "";
        try {
          const tasksList = JSON.parse(adminTasksRaw);
          if (Array.isArray(tasksList)) {
            setAdminTasksList(tasksList);
          } else if (adminTasksRaw) {
            setAdminTasksList([{ date: "", title: adminTasksRaw, description: "", type: "" }]);
          }
        } catch {
          if (adminTasksRaw) {
            setAdminTasksList([{ date: "", title: adminTasksRaw, description: "", type: "" }]);
          }
        }

        // Parse user tasks
        const userTasksRaw = user.user_tasks || "";
        try {
          const tasksList = JSON.parse(userTasksRaw);
          if (Array.isArray(tasksList)) {
            setUserTasksList(tasksList);
          } else if (userTasksRaw) {
            setUserTasksList([{ date: "", title: userTasksRaw, description: "", type: "" }]);
          }
        } catch {
          if (userTasksRaw) {
            setUserTasksList([{ date: "", title: userTasksRaw, description: "", type: "" }]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading organization data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewFile = async (fileData) => {
    if (!fileData) return;
    await viewFile(fileData);
  };

  const getCurrentUserId = () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
      );
      return storedUser.id;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

  // Website management
  const addWebsite = () => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      websites: [
        ...(editingOrg.websites || []),
        {
          id: Date.now(),
          type: "",
          url: "",
          login: "",
          password: "",
          remarks: "",
          showPassword: false,
        },
      ],
    };
    setEditingOrg(updatedOrg);
  };

  const updateWebsite = (websiteId, field, value) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      websites: (editingOrg.websites || []).map((website) => {
        if (website.id === websiteId) {
          return { ...website, [field]: value };
        }
        return { ...website };
      }),
    };
    setEditingOrg(updatedOrg);
  };

  const togglePasswordVisibility = (websiteId) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      websites: (editingOrg.websites || []).map((website) =>
        website.id === websiteId
          ? { ...website, showPassword: !website.showPassword }
          : website
      ),
    };
    setEditingOrg(updatedOrg);
  };

  const removeWebsite = (websiteId) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      websites: (editingOrg.websites || []).filter(
        (website) => website.id !== websiteId
      ),
    };
    setEditingOrg(updatedOrg);
  };

  // Director/Partner management
  const addDirectorPartner = () => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      directorsPartners: [
        ...(editingOrg.directorsPartners || []),
        {
          id: Date.now(),
          name: "",
          dinNumber: "",
          contact: "",
          email: "",
          dateOfAddition: "",
          status: "Active",
        },
      ],
    };
    setEditingOrg(updatedOrg);
  };

  const removeDirectorPartner = (id) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      directorsPartners: (editingOrg.directorsPartners || []).filter(
        (dp) => dp.id !== id
      ),
    };
    setEditingOrg(updatedOrg);
  };

  const updateDirectorPartner = (id, field, value) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      directorsPartners: (editingOrg.directorsPartners || []).map((dp) =>
        dp.id === id ? { ...dp, [field]: value } : dp
      ),
    };
    setEditingOrg(updatedOrg);
  };

  // Digital Signature management
  const addDigitalSignature = () => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      digitalSignatures: [
        ...(editingOrg.digitalSignatures || []),
        {
          id: Date.now(),
          name: "",
          dscNumber: "",
          expiryDate: "",
          status: "Active",
        },
      ],
    };
    setEditingOrg(updatedOrg);
  };

  const removeDigitalSignature = (id) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      digitalSignatures: (editingOrg.digitalSignatures || []).filter(
        (ds) => ds.id !== id
      ),
    };
    setEditingOrg(updatedOrg);
  };

  const updateDigitalSignature = (id, field, value) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      digitalSignatures: (editingOrg.digitalSignatures || []).map((ds) =>
        ds.id === id ? { ...ds, [field]: value } : ds
      ),
    };
    setEditingOrg(updatedOrg);
  };

  const handleEditOrganization = () => {
    let websites = selectedOrg.websites || [];
    if (!Array.isArray(websites)) websites = [];

    let idCounter = Date.now();
    const orgToEdit = {
      ...selectedOrg,
      directorsPartners: selectedOrg.directorsPartners || [],
      digitalSignatures: selectedOrg.digitalSignatures || [],
      optionalAttachment1: selectedOrg.optionalAttachment1 || null,
      optionalAttachment2: selectedOrg.optionalAttachment2 || null,
      websites: websites.map((w) => ({
        ...w,
        id: w.id || idCounter++,
        showPassword: w.showPassword || false,
      })),
    };
    setEditingOrg(orgToEdit);
  };

  const updateOrganizationField = (field, value) => {
    if (!editingOrg) {
      console.log("[UPDATE FIELD] No editingOrg, cannot update:", field, value);
      return;
    }
    console.log("[UPDATE FIELD] Updating:", {
      field,
      value,
      currentEditingOrg: editingOrg,
      currentFieldValue: editingOrg[field]
    });
    // Use functional update to ensure we always have the latest state
    setEditingOrg((prevEditingOrg) => {
      if (!prevEditingOrg) {
        console.log("[UPDATE FIELD] prevEditingOrg is null, cannot update");
        return editingOrg; // Fallback to current editingOrg
      }
      const updatedOrg = {
        ...prevEditingOrg,
        [field]: value,
      };
      console.log("[UPDATE FIELD] New org object:", {
        field,
        newValue: updatedOrg[field],
        registeredAddressState: updatedOrg.registeredAddressState,
        registeredAddressPincode: updatedOrg.registeredAddressPincode
      });
      return updatedOrg;
    });
    console.log("[UPDATE FIELD] setEditingOrg called");
  };

  const handleSaveOrganization = async () => {
    if (!editingOrg) return;

    const hasLegalName =
      editingOrg.legalName &&
      editingOrg.legalName.trim() !== "" &&
      editingOrg.legalName !== "-";
    const hasTradeName =
      editingOrg.tradeName &&
      editingOrg.tradeName.trim() !== "" &&
      editingOrg.tradeName !== "-";
    const hasGstin =
      editingOrg.gstin &&
      editingOrg.gstin.trim() !== "" &&
      editingOrg.gstin !== "-";

    if (!hasLegalName && !hasTradeName && !hasGstin) {
      alert(
        "⚠️ Please fill at least one of the following: Legal Name, Trade Name, or GST Number"
      );
      return;
    }

    try {
      setSaving(true);

      const updatedOrganizations = organizations.map((org) =>
        org.id === editingOrg.id ? editingOrg : org
      );

      const validOrganizations = updatedOrganizations.filter((org) => {
        const hasLegalName =
          org.legalName && org.legalName.trim() !== "" && org.legalName !== "-";
        const hasTradeName =
          org.tradeName && org.tradeName.trim() !== "" && org.tradeName !== "-";
        const hasGstin =
          org.gstin && org.gstin.trim() !== "" && org.gstin !== "-";
        return hasLegalName || hasTradeName || hasGstin;
      });

      if (validOrganizations.length === 0) {
        alert(
          "⚠️ Please fill at least one organization with required details before saving."
        );
        setSaving(false);
        return;
      }

      const payload = {
        organisations: validOrganizations.map((org) => ({
          organisationType:
            org.organisationType !== "-" ? org.organisationType : "",
          legalName: org.legalName !== "-" ? org.legalName : "",
          tradeName: org.tradeName !== "-" ? org.tradeName : "",
          category: org.category !== "-" ? org.category : "",
          gstin: org.gstin !== "-" ? org.gstin : "",
          panNumber: org.panNumber !== "-" ? org.panNumber : "",
          incorporationDate:
            org.incorporationDate !== "-" ? org.incorporationDate : "",
          panFile: org.panFile,
          tan: org.tan !== "-" ? org.tan : "",
          cin: org.cin !== "-" ? org.cin : "",
          registeredAddress:
            org.registeredAddress !== "-" ? org.registeredAddress : "",
          registeredAddressLine1: org.registeredAddressLine1 !== "-" ? org.registeredAddressLine1 : "",
          registeredAddressLine2: org.registeredAddressLine2 !== "-" ? org.registeredAddressLine2 : "",
          registeredAddressDistrict: org.registeredAddressDistrict !== "-" ? org.registeredAddressDistrict : "",
          registeredAddressState: org.registeredAddressState !== "-" ? org.registeredAddressState : "",
          registeredAddressCountry: org.registeredAddressCountry !== "-" ? org.registeredAddressCountry : "India",
          registeredAddressPincode: org.registeredAddressPincode !== "-" ? org.registeredAddressPincode : "",
          directorsPartners: (org.directorsPartners || []).filter(
            (dp) => dp.name || dp.dinNumber || dp.contact || dp.email
          ),
          digitalSignatures: (org.digitalSignatures || []).filter(
            (ds) => ds.name || ds.dscNumber
          ),
          optionalAttachment1: org.optionalAttachment1 || null,
          optionalAttachment2: org.optionalAttachment2 || null,
          websites: (org.websites || [])
            .filter((w) => w.url && w.url.trim() !== "")
            .map((w) => ({
              type: w.type,
              url: w.url,
              login: w.login,
              password: w.password,
              remarks: w.remarks || "",
            })),
        })),
      };

      const response = await updateUsersPageData(payload);

      if (response.success) {
        alert("✅ Organization Details saved successfully!");
        setOrganizations(validOrganizations);
        const savedOrg = validOrganizations.find((o) => o.id === editingOrg.id);
        if (savedOrg) {
          setSelectedOrg(savedOrg);
        } else {
          setSelectedOrg(null);
        }
        setEditingOrg(null);
        await loadOrganizationData();
      }
    } catch (error) {
      console.error("❌ Error saving organization:", error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrg(null);
    if (
      (selectedOrg && !selectedOrg.id) ||
      selectedOrg.id > Date.now() - 10000
    ) {
      setOrganizations(organizations.filter((o) => o.id !== selectedOrg.id));
      setSelectedOrg(null);
    } else {
      const org = organizations.find((o) => o.id === selectedOrg.id);
      if (org) setSelectedOrg(org);
    }
  };

  const addOrganization = () => {
    const newOrg = {
      id: Date.now(),
      organisationType: "",
      legalName: "",
      tradeName: "",
      category: "",
      gstin: "",
      panNumber: "",
      incorporationDate: "",
      panFile: null,
      tan: "",
      cin: "",
      registeredAddress: "",
      registeredAddressLine1: "",
      registeredAddressLine2: "",
      registeredAddressDistrict: "",
      registeredAddressState: "",
      registeredAddressCountry: "India",
      registeredAddressPincode: "",
      directorsPartners: [],
      digitalSignatures: [],
      optionalAttachment1: null,
      optionalAttachment2: null,
      websites: [],
    };
    setOrganizations([...organizations, newOrg]);
    setSelectedOrg(newOrg);
    setEditingOrg(newOrg);
  };

  // Search and Pagination
  const filteredOrgs = organizations.filter((org) => {
    const term = searchTerm.toLowerCase();
    return (
      (org.legalName?.toLowerCase() || "").includes(term) ||
      (org.tradeName?.toLowerCase() || "").includes(term) ||
      (org.gstin?.toLowerCase() || "").includes(term)
    );
  });

  const totalPages = Math.ceil(filteredOrgs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrgs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSaveUserNoteInline = async (editedNote, noteIndex) => {
    try {
      if (!editedNote.organizationId) {
        alert("Please select an organization for this note.");
        return;
      }

      const updatedNotesList = userNotesList.map((note, idx) =>
        idx === noteIndex
          ? {
              ...note,
              organizationId: editedNote.organizationId || note.organizationId || null,
              date: editedNote.date,
              description: editedNote.description,
              attachments: editedNote.attachments,
              updatedAt: new Date().toISOString(),
            }
          : note,
      );

      const payload = {
        userNotes: JSON.stringify(updatedNotesList),
      };

      const response = await updateUsersPageData(payload);

      if (response.success) {
        setUserNotesList(updatedNotesList);
        alert("Note updated successfully!");
        await loadOrganizationData();
      } else {
        alert("Failed to save note");
      }
    } catch (error) {
      console.error("Error saving user note:", error);
      alert("Failed to save note");
    }
  };

  return {
    // State
    loading,
    organizations,
    selectedOrg,
    setSelectedOrg,
    editingOrg,
    setEditingOrg,
    saving,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,

    // Computed
    filteredOrgs,
    currentItems,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,

    // Actions
    loadOrganizationData,
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
    adminNotesList,
    userNotesList,
    adminTasksList,
    userTasksList,
    handleSaveUserNoteInline,
    updateUsersPageData,
  };
};

export default useOrganizationData;
