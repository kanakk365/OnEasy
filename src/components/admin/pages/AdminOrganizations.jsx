import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/api";
import { updateUserDataByUserId } from "../../../utils/usersPageApi";
import { uploadFileDirect, viewFile } from "../../../utils/s3Upload";
import { lookupPincode } from "../../../utils/pincodeLookup";
import {
  FiBriefcase,
  FiGlobe,
  FiClock,
  FiShield,
  FiUser,
  FiFileText,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiEyeOff,
  FiUpload,
} from "react-icons/fi";
import { BsBuilding, BsCalendar3 } from "react-icons/bs";

function AdminOrganizations() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);
  const [loadingOrgDetails, setLoadingOrgDetails] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [selectedOrgUserId, setSelectedOrgUserId] = useState(null);
  const [isAddingOrg, setIsAddingOrg] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("organization-details");
  const [activeDetailTab, setActiveDetailTab] = useState("organization-details");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Organization form state
  const [newOrganization, setNewOrganization] = useState({
    organisationType: "",
    legalName: "",
    tradeName: "",
    category: "",
    gstin: "",
    incorporationDate: "",
    panNumber: "",
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
  });

  const loadClients = async () => {
    try {
      const response = await apiClient.get("/admin/clients");
      if (response.success && response.data) setClients(response.data);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      // Load all organizations - filtering will be done client-side
      const response = await apiClient.get("/admin/organizations");
      if (response.success && response.data) setOrganizations(response.data);
      else setOrganizations([]);
    } catch (error) {
      console.error("Error loading organizations:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
    loadOrganizations();
  }, [loadOrganizations]);

  // Handle opening organization from sessionStorage (when navigating from Directors page)
  useEffect(() => {
    if (organizations.length > 0 && !loading) {
      const editOrgId = sessionStorage.getItem('editOrganizationId');
      const editOrgUserId = sessionStorage.getItem('editOrganizationUserId');
      if (editOrgId && editOrgUserId) {
        sessionStorage.removeItem('editOrganizationId');
        sessionStorage.removeItem('editOrganizationUserId');
        // Find and open the organization
        const orgToOpen = organizations.find(
          (org) => String(org.id) === String(editOrgId) && String(org.user_id) === String(editOrgUserId)
        );
        if (orgToOpen) {
          handleViewAll(orgToOpen);
        }
      }
    }
  }, [organizations, loading]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clientFilter]);

  const handleEditOrganization = () => {
    if (!selectedOrg) return;
    let websites = Array.isArray(selectedOrg.websites)
      ? selectedOrg.websites
      : [];
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
        remarks: w.remarks || "",
        showPassword: w.showPassword || false,
      })),
    };
    setEditingOrg(orgToEdit);
  };

  const updateOrganizationField = (field, value) => {
    if (!editingOrg) return;
    setEditingOrg({ ...editingOrg, [field]: value });
  };

  // Director Functions
  const addDirectorPartner = () => {
    if (!editingOrg) return;
    setEditingOrg({
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
    });
  };
  const removeDirectorPartner = (id) => {
    if (!editingOrg) return;
    setEditingOrg({
      ...editingOrg,
      directorsPartners: (editingOrg.directorsPartners || []).filter(
        (dp) => dp.id !== id
      ),
    });
  };
  const updateDirectorPartner = (id, field, value) => {
    if (!editingOrg) return;
    setEditingOrg({
      ...editingOrg,
      directorsPartners: (editingOrg.directorsPartners || []).map((dp) =>
        dp.id === id ? { ...dp, [field]: value } : dp
      ),
    });
  };

  // DSC Functions
  const addDigitalSignature = () => {
    if (!editingOrg) return;
    setEditingOrg({
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
    });
  };
  const removeDigitalSignature = (id) => {
    if (!editingOrg) return;
    setEditingOrg({
      ...editingOrg,
      digitalSignatures: (editingOrg.digitalSignatures || []).filter(
        (ds) => ds.id !== id
      ),
    });
  };
  const updateDigitalSignature = (id, field, value) => {
    if (!editingOrg) return;
    setEditingOrg({
      ...editingOrg,
      digitalSignatures: (editingOrg.digitalSignatures || []).map((ds) =>
        ds.id === id ? { ...ds, [field]: value } : ds
      ),
    });
  };

  const handleSaveOrganization = async () => {
    if (!editingOrg || !selectedOrgUserId) return;
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
      setSavingOrg(true);
      const userDataResponse = await apiClient
        .get(`/users-page/user-data/${selectedOrgUserId}`)
        .catch(() => ({ success: false, data: { organisations: [] } }));
      let existingOrgs =
        userDataResponse.success && userDataResponse.data?.organisations
          ? userDataResponse.data.organisations
          : [];

      const updatedOrgs = existingOrgs.map((org) => {
        const matches =
          org.id === editingOrg.id ||
          String(org.id) === String(editingOrg.id) ||
          (org.legal_name === selectedOrg.legalName &&
            org.gstin === selectedOrg.gstin);
        if (matches) {
          return {
            organisationType:
              editingOrg.organisationType !== "-"
                ? editingOrg.organisationType
                : "",
            legalName: editingOrg.legalName !== "-" ? editingOrg.legalName : "",
            tradeName: editingOrg.tradeName !== "-" ? editingOrg.tradeName : "",
            category: editingOrg.category !== "-" ? editingOrg.category : "",
            gstin: editingOrg.gstin !== "-" ? editingOrg.gstin : "",
            incorporationDate:
              editingOrg.incorporationDate !== "-"
                ? editingOrg.incorporationDate
                : "",
            panNumber: editingOrg.panNumber !== "-" ? editingOrg.panNumber || "" : "",
            panFile: editingOrg.panFile,
            tan: editingOrg.tan !== "-" ? editingOrg.tan : "",
            cin: editingOrg.cin !== "-" ? editingOrg.cin : "",
            registeredAddress:
              editingOrg.registeredAddress !== "-"
                ? editingOrg.registeredAddress
                : "",
            registeredAddressLine1: editingOrg.registeredAddressLine1 !== "-" ? editingOrg.registeredAddressLine1 || "" : "",
            registeredAddressLine2: editingOrg.registeredAddressLine2 !== "-" ? editingOrg.registeredAddressLine2 || "" : "",
            registeredAddressDistrict: editingOrg.registeredAddressDistrict !== "-" ? editingOrg.registeredAddressDistrict || "" : "",
            registeredAddressState: editingOrg.registeredAddressState !== "-" ? editingOrg.registeredAddressState || "" : "",
            registeredAddressCountry: editingOrg.registeredAddressCountry !== "-" ? editingOrg.registeredAddressCountry || "India" : "India",
            registeredAddressPincode: editingOrg.registeredAddressPincode !== "-" ? editingOrg.registeredAddressPincode || "" : "",
            directorsPartners: (editingOrg.directorsPartners || []).filter(
              (dp) => dp.name || dp.dinNumber || dp.contact || dp.email
            ),
            digitalSignatures: (editingOrg.digitalSignatures || []).filter(
              (ds) => ds.name || ds.dscNumber
            ),
            optionalAttachment1: editingOrg.optionalAttachment1 || null,
            optionalAttachment2: editingOrg.optionalAttachment2 || null,
            websites: (editingOrg.websites || [])
              .filter((w) => w.url && w.url.trim() !== "")
              .map((w) => ({
                type: w.type,
                url: w.url,
                login: w.login,
                password: w.password,
                remarks: w.remarks || "",
              })),
          };
        }
        return org;
      });

      const response = await updateUserDataByUserId(selectedOrgUserId, {
        organisations: updatedOrgs,
      });
      if (response.success) {
        alert("✅ Organization updated successfully!");
        setSelectedOrg(editingOrg);
        setEditingOrg(null);
        loadOrganizations();
      } else {
        throw new Error(response.message || "Failed to save organization");
      }
    } catch (error) {
      console.error("❌ Error saving organization:", error);
      alert(`❌ Failed to save: ${error.message || "Unknown error"}`);
    } finally {
      setSavingOrg(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const handleViewFile = async (fileData) => {
    await viewFile(fileData);
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrg || !selectedOrgUserId) return;
    if (
      !window.confirm(
        `Are you sure you want to delete this organization?\n\nThis will permanently delete the organization and all associated files.\n\nThis action cannot be undone.`
      )
    )
      return;

    try {
      setSavingOrg(true);
      const response = await apiClient.delete(
        `/admin/organizations/${selectedOrg.id}?userId=${selectedOrgUserId}`
      );
      if (response.success) {
        alert("✅ Organization deleted successfully!");
        setSelectedOrg(null);
        setEditingOrg(null);
        setSelectedOrgUserId(null);
        loadOrganizations();
      } else {
        alert(`❌ Failed to delete: ${response.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error deleting organization:", error);
      alert(
        `❌ Failed to delete: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`
      );
    } finally {
      setSavingOrg(false);
    }
  };

  // Add Org Functions
  const handleAddOrganization = () => {
    setIsAddingOrg(true);
    setSelectedOrg(null);
    setEditingOrg(null);
    setSelectedClient(null);
    setNewOrganization({
      organisationType: "",
      legalName: "",
      tradeName: "",
      category: "",
      gstin: "",
      incorporationDate: "",
      panFile: null,
      tan: "",
      cin: "",
      registeredAddress: "",
      directorsPartners: [],
      digitalSignatures: [],
      optionalAttachment1: null,
      optionalAttachment2: null,
      websites: [],
    });
  };
  const updateNewOrganizationField = (field, value) =>
    setNewOrganization((prev) => ({ ...prev, [field]: value }));
  const addNewDirectorPartner = () =>
    setNewOrganization((prev) => ({
      ...prev,
      directorsPartners: [
        ...(prev.directorsPartners || []),
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
    }));
  const removeNewDirectorPartner = (id) =>
    setNewOrganization((prev) => ({
      ...prev,
      directorsPartners: (prev.directorsPartners || []).filter(
        (dp) => dp.id !== id
      ),
    }));
  const updateNewDirectorPartner = (id, field, value) =>
    setNewOrganization((prev) => ({
      ...prev,
      directorsPartners: (prev.directorsPartners || []).map((dp) =>
        dp.id === id ? { ...dp, [field]: value } : dp
      ),
    }));
  const addNewDigitalSignature = () =>
    setNewOrganization((prev) => ({
      ...prev,
      digitalSignatures: [
        ...(prev.digitalSignatures || []),
        {
          id: Date.now(),
          name: "",
          dscNumber: "",
          expiryDate: "",
          status: "Active",
        },
      ],
    }));
  const removeNewDigitalSignature = (id) =>
    setNewOrganization((prev) => ({
      ...prev,
      digitalSignatures: (prev.digitalSignatures || []).filter(
        (ds) => ds.id !== id
      ),
    }));
  const updateNewDigitalSignature = (id, field, value) =>
    setNewOrganization((prev) => ({
      ...prev,
      digitalSignatures: (prev.digitalSignatures || []).map((ds) =>
        ds.id === id ? { ...ds, [field]: value } : ds
      ),
    }));
  const addNewWebsite = () =>
    setNewOrganization((prev) => ({
      ...prev,
      websites: [
        ...(prev.websites || []),
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
    }));
  const removeNewWebsite = (id) =>
    setNewOrganization((prev) => ({
      ...prev,
      websites: (prev.websites || []).filter((w) => w.id !== id),
    }));
  const updateNewWebsite = (id, field, value) =>
    setNewOrganization((prev) => ({
      ...prev,
      websites: (prev.websites || []).map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    }));
  const toggleNewPasswordVisibility = (id) =>
    setNewOrganization((prev) => ({
      ...prev,
      websites: (prev.websites || []).map((w) =>
        w.id === id ? { ...w, showPassword: !w.showPassword } : w
      ),
    }));

  const handleSaveNewOrganization = async () => {
    const hasLegalName =
      newOrganization.legalName && newOrganization.legalName.trim() !== "";
    const hasTradeName =
      newOrganization.tradeName && newOrganization.tradeName.trim() !== "";
    const hasGstin =
      newOrganization.gstin && newOrganization.gstin.trim() !== "";

    if (!hasLegalName && !hasTradeName && !hasGstin) {
      alert(
        "⚠️ Please fill at least one of the following: Legal Name, Trade Name, or GST Number"
      );
      return;
    }

    try {
      setSaving(true);
      const userDataResponse = await apiClient
        .get(`/users-page/user-data/${selectedClient.user_id}`)
        .catch(() => ({ success: false, data: { organisations: [] } }));
      let existingOrgs = [];
      if (userDataResponse.success && userDataResponse.data?.organisations) {
        existingOrgs = userDataResponse.data.organisations.map((org) => ({
          organisationType: org.organisation_type || org.organisationType || "",
          legalName: org.legal_name || org.legalName || "",
          tradeName: org.trade_name || org.tradeName || "",
          category: org.category || "",
          gstin: org.gstin || "",
          incorporationDate:
            org.incorporation_date || org.incorporationDate || "",
          panNumber: org.pan_number || org.panNumber || "",
          panFile: org.pan_file || org.panFile || null,
          tan: org.tan || "",
          cin: org.cin || "",
          registeredAddress:
            org.registered_address || org.registeredAddress || "",
          registeredAddressLine1: org.registered_address_line1 || org.registeredAddressLine1 || org.registered_address?.split(',')[0]?.trim() || "",
          registeredAddressLine2: org.registered_address_line2 || org.registeredAddressLine2 || org.registered_address?.split(',').slice(1).join(',').trim() || "",
          registeredAddressDistrict: org.registered_address_district || org.registeredAddressDistrict || "",
          registeredAddressState: org.registered_address_state || org.registeredAddressState || "",
          registeredAddressCountry: org.registered_address_country || org.registeredAddressCountry || "India",
          registeredAddressPincode: org.registered_address_pincode || org.registeredAddressPincode || "",
          directorsPartners:
            org.directors_partners_details || org.directorsPartners || [],
          digitalSignatures:
            org.digital_signature_details || org.digitalSignatures || [],
          optionalAttachment1:
            org.optional_attachment_1 || org.optionalAttachment1 || null,
          optionalAttachment2:
            org.optional_attachment_2 || org.optionalAttachment2 || null,
          websites: org.websites || [],
        }));
      }

      const orgData = {
        organisationType: newOrganization.organisationType || "",
        legalName: newOrganization.legalName || "",
        tradeName: newOrganization.tradeName || "",
        category: newOrganization.category || "",
        gstin: newOrganization.gstin || "",
        incorporationDate: newOrganization.incorporationDate || "",
        panNumber: newOrganization.panNumber || "",
        panFile: newOrganization.panFile,
        tan: newOrganization.tan || "",
        cin: newOrganization.cin || "",
        registeredAddress: newOrganization.registeredAddress || "",
        registeredAddressLine1: newOrganization.registeredAddressLine1 || "",
        registeredAddressLine2: newOrganization.registeredAddressLine2 || "",
        registeredAddressDistrict: newOrganization.registeredAddressDistrict || "",
        registeredAddressState: newOrganization.registeredAddressState || "",
        registeredAddressCountry: newOrganization.registeredAddressCountry || "India",
        registeredAddressPincode: newOrganization.registeredAddressPincode || "",
        directorsPartners: (newOrganization.directorsPartners || []).filter(
          (dp) => dp.name || dp.dinNumber || dp.contact || dp.email
        ),
        digitalSignatures: (newOrganization.digitalSignatures || []).filter(
          (ds) => ds.name || ds.dscNumber
        ),
        optionalAttachment1: newOrganization.optionalAttachment1 || null,
        optionalAttachment2: newOrganization.optionalAttachment2 || null,
        websites: (newOrganization.websites || [])
          .filter((w) => w.url && w.url.trim() !== "")
          .map((w) => ({
            type: w.type,
            url: w.url,
            login: w.login,
            password: w.password,
            remarks: w.remarks || "",
          })),
      };

      const response = await updateUserDataByUserId(selectedClient.user_id, {
        organisations: [...existingOrgs, orgData],
      });
      if (response.success) {
        alert("✅ Organization created successfully!");
        setNewOrganization({
          organisationType: "",
          legalName: "",
          tradeName: "",
          category: "",
          gstin: "",
          incorporationDate: "",
          panNumber: "",
          panFile: null,
          tan: "",
          cin: "",
          registeredAddress: "",
          directorsPartners: [],
          digitalSignatures: [],
          optionalAttachment1: null,
          optionalAttachment2: null,
          websites: [],
        });
        setSelectedClient(null);
        setIsAddingOrg(false);
        loadOrganizations();
      } else {
        throw new Error(response.message || "Failed to save organization");
      }
    } catch (error) {
      console.error("❌ Error saving organization:", error);
      alert(`❌ Failed to save: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleViewAll = async (org) => {
    try {
      setLoadingOrgDetails(true);
      const userDataResponse = await apiClient
        .get(`/users-page/user-data/${org.user_id}`)
        .catch(() => ({ success: false, data: { organisations: [] } }));
      if (userDataResponse.success && userDataResponse.data?.organisations) {
        const foundOrg = userDataResponse.data.organisations.find(
          (o) =>
            o.id === org.id ||
            String(o.id) === String(org.id) ||
            (o.legal_name === org.legalName && o.gstin === org.gstin)
        );
        if (foundOrg) {
          let directorsPartners = [];
          if (foundOrg.directors_partners_details) {
            try {
              directorsPartners =
                typeof foundOrg.directors_partners_details === "string"
                  ? JSON.parse(foundOrg.directors_partners_details)
                  : foundOrg.directors_partners_details;
              if (!Array.isArray(directorsPartners)) directorsPartners = [];
            } catch {
              directorsPartners = [];
            }
          }
          let digitalSignatures = [];
          if (foundOrg.digital_signature_details) {
            try {
              digitalSignatures =
                typeof foundOrg.digital_signature_details === "string"
                  ? JSON.parse(foundOrg.digital_signature_details)
                  : foundOrg.digital_signature_details;
              if (!Array.isArray(digitalSignatures)) digitalSignatures = [];
            } catch {
              digitalSignatures = [];
            }
          }
          let websites = [];
          if (foundOrg.websites) {
            try {
              websites =
                typeof foundOrg.websites === "string"
                  ? JSON.parse(foundOrg.websites)
                  : foundOrg.websites;
              if (!Array.isArray(websites)) websites = [];
            } catch {
              websites = [];
            }
          }

          setSelectedOrg({
            id: foundOrg.id,
            organisationType: foundOrg.organisation_type || "-",
            legalName: foundOrg.legal_name || "-",
            tradeName: foundOrg.trade_name || "-",
            category: foundOrg.category || "-",
            gstin: foundOrg.gstin || "-",
            incorporationDate: foundOrg.incorporation_date || "-",
            panNumber: foundOrg.pan_number || "-",
            panFile: foundOrg.pan_file || null,
            tan: foundOrg.tan || "-",
            cin: foundOrg.cin || "-",
            registeredAddress: foundOrg.registered_address || "-",
            registeredAddressLine1: foundOrg.registered_address_line1 || foundOrg.registered_address?.split(',')[0]?.trim() || "-",
            registeredAddressLine2: foundOrg.registered_address_line2 || foundOrg.registered_address?.split(',').slice(1).join(',').trim() || "-",
            registeredAddressDistrict: foundOrg.registered_address_district || "-",
            registeredAddressState: foundOrg.registered_address_state || "-",
            registeredAddressCountry: foundOrg.registered_address_country || "India",
            registeredAddressPincode: foundOrg.registered_address_pincode || "-",
            directorsPartners: (Array.isArray(directorsPartners)
              ? directorsPartners
              : []
            ).map((dp, index) => ({
              id: dp.id || `dp-${Date.now()}-${index}`,
              name: dp.name || "",
              dinNumber: dp.din_number || "",
              contact: dp.contact || "",
              email: dp.email || "",
              dateOfAddition: dp.date_of_addition || "",
              status: dp.status || "Active",
            })),
            digitalSignatures: (Array.isArray(digitalSignatures)
              ? digitalSignatures
              : []
            ).map((ds, index) => ({
              id: ds.id || `ds-${Date.now()}-${index}`,
              name: ds.name || "",
              dscNumber: ds.dsc_number || "",
              expiryDate: ds.expiry_date || "",
              status: ds.status || "Active",
            })),
            optionalAttachment1: foundOrg.optional_attachment_1 || null,
            optionalAttachment2: foundOrg.optional_attachment_2 || null,
            websites: (Array.isArray(websites) ? websites : []).map((w, index) => ({
              id: w.id || `w-${Date.now()}-${index}`,
              type: w.type || "",
              url: w.url || "",
              login: w.login || "",
              password: w.password || "",
              remarks: w.remarks || "",
              showPassword: false,
            })),
          });
          setSelectedOrgUserId(org.user_id);
        } else {
          alert("Organization details not found");
        }
      } else {
        alert("Failed to load organization details");
      }
    } catch (error) {
      console.error("Error loading organization details:", error);
      alert("Failed to load organization details");
    } finally {
      setLoadingOrgDetails(false);
    }
  };

  const uniqueClients = useMemo(() => {
    return [
      ...new Set(organizations.map((org) => org.clientName).filter(Boolean)),
    ];
  }, [organizations]);

  // Filter organizations client-side as fallback
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          (org.legalName && org.legalName.toLowerCase().includes(searchLower)) ||
          (org.tradeName && org.tradeName.toLowerCase().includes(searchLower)) ||
          (org.gstin && org.gstin.toLowerCase().includes(searchLower)) ||
          (org.clientName && org.clientName.toLowerCase().includes(searchLower)) ||
          (org.clientEmail && org.clientEmail.toLowerCase().includes(searchLower))
      );
    }

    // Apply client filter
    if (clientFilter) {
      filtered = filtered.filter(
        (org) =>
          org.clientName === clientFilter ||
          org.clientEmail === clientFilter
      );
    }

    return filtered;
  }, [organizations, searchTerm, clientFilter]);

  // Pagination Details
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrganizations = filteredOrganizations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading || loadingOrgDetails) {
    return (
      <div className="min-h-screen bg-[#f3f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  // --- ADD ORGANIZATION VIEW ---
  if (isAddingOrg) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
        <button
          onClick={() => {
            setIsAddingOrg(false);
            setSelectedClient(null);
          }}
          className="mb-6 flex items-center text-[#01334C] hover:text-[#00486D] font-medium"
        >
          <FiChevronLeft className="w-5 h-5 mr-2" /> Back to List
        </button>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Add Organization
          </h1>
          <p className="text-gray-600">
            {selectedClient
              ? `Client: ${selectedClient.name} (${selectedClient.email})`
              : "Select a client to create an organization"}
          </p>
        </div>

        {!selectedClient ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Client
            </h3>
            <div className="relative">
              <select
                value={selectedClient?.user_id || ""}
                onChange={(e) =>
                  setSelectedClient(
                    clients.find((c) => c.user_id === e.target.value)
                  )
                }
                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C] appearance-none"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.user_id} value={client.user_id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
              <FiBriefcase className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Organization Details
              </h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-sm text-[#01334C] hover:underline"
              >
                Change Client
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-1 px-4 pt-4">
                {[
                  { key: "organization-details", label: "Organization Details" },
                  { key: "directors-partners", label: "Directors / Partners Details" },
                  { key: "digital-signatures", label: "Digital Signature Details" },
                  { key: "attachments", label: "Attachments" },
                  { key: "credentials", label: "Credentials" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
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
                <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Name
                  </label>
                  <input
                    type="text"
                    value={newOrganization.legalName}
                    onChange={(e) =>
                      updateNewOrganizationField("legalName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter legal name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trade Name
                  </label>
                  <input
                    type="text"
                    value={newOrganization.tradeName}
                    onChange={(e) =>
                      updateNewOrganizationField("tradeName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter trade name"
                  />
                </div>
              </div>

              {/* Simplified Additional Fields for Brevity - Keeping all functional fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={newOrganization.category}
                      onChange={(e) =>
                        updateNewOrganizationField("category", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C] appearance-none bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="Private Limited Company">
                        Private Limited Company
                      </option>
                      <option value="Partnership Firm">Partnership Firm</option>
                      <option value="One Person Company">
                        One Person Company
                      </option>
                      <option value="Limited Liability Partnership">
                        Limited Liability Partnership
                      </option>
                      <option value="Individual">Individual</option>
                    </select>
                    <FiBriefcase className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={newOrganization.gstin}
                    onChange={(e) =>
                      updateNewOrganizationField("gstin", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter GSTIN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={newOrganization.panNumber}
                    onChange={(e) =>
                      updateNewOrganizationField("panNumber", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter PAN Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incorporation Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newOrganization.incorporationDate}
                      onChange={(e) =>
                        updateNewOrganizationField(
                          "incorporationDate",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    />
                  </div>
                </div>
              </div>

              {/* PAN File Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN File
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={
                        newOrganization.panFile
                          ? "File uploaded"
                          : "No file chosen"
                      }
                      className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                    />
                    <label className="cursor-pointer flex-shrink-0">
                      <input
                        type="file"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              // Validate file size (max 5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                alert("File size must be less than 5MB");
                                e.target.value = "";
                                return;
                              }

                              // Upload directly to S3
                              const folder = `user-profiles/${selectedClient?.id || "new"}/organizations/org-new`;
                              const { s3Url } = await uploadFileDirect(
                                file,
                                folder,
                                "pan-file"
                              );

                              // Store S3 URL
                              updateNewOrganizationField("panFile", s3Url);
                            } catch (error) {
                              console.error("Error uploading PAN file:", error);
                              alert(
                                "Failed to upload file. Please try again."
                              );
                              e.target.value = "";
                            }
                          }
                        }}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <span className="px-4 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors text-sm whitespace-nowrap">
                        {newOrganization.panFile ? "Change" : "Upload"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TAN
                  </label>
                  <input
                    type="text"
                    value={newOrganization.tan}
                    onChange={(e) =>
                      updateNewOrganizationField("tan", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter TAN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIN
                  </label>
                  <input
                    type="text"
                    value={newOrganization.cin}
                    onChange={(e) =>
                      updateNewOrganizationField("cin", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter CIN"
                  />
                </div>
              </div>

              {/* Registered Office Address Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Registered Office Address</h4>
                </div>
                
                {/* Address Line 1 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={newOrganization.registeredAddressLine1 || ""}
                    onChange={(e) =>
                      updateNewOrganizationField("registeredAddressLine1", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter Address Line 1"
                  />
                </div>

                {/* Address Line 2 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={newOrganization.registeredAddressLine2 || ""}
                    onChange={(e) =>
                      updateNewOrganizationField("registeredAddressLine2", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter Address Line 2 (Optional)"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    value={newOrganization.registeredAddressDistrict || ""}
                    onChange={(e) =>
                      updateNewOrganizationField("registeredAddressDistrict", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter District"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={newOrganization.registeredAddressState || ""}
                    onChange={(e) =>
                      updateNewOrganizationField("registeredAddressState", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter State"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newOrganization.registeredAddressCountry || "India"}
                    onChange={(e) =>
                      updateNewOrganizationField("registeredAddressCountry", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter Country"
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newOrganization.registeredAddressPincode || ""}
                    onChange={async (e) => {
                      // Get the raw input value
                      const inputValue = e.target.value;
                      
                      // Remove all non-digit characters and limit to 6 digits
                      const cleanedValue = inputValue.replace(/\D/g, "").slice(0, 6);
                      
                      // Update the field - this should allow all 6 digits
                      updateNewOrganizationField("registeredAddressPincode", cleanedValue);
                      
                      // Auto-trigger lookup when exactly 6 digits are entered
                      if (cleanedValue.length === 6) {
                        // Store PIN code to preserve it
                        const pincodeToPreserve = cleanedValue;
                        
                        try {
                          const result = await lookupPincode(cleanedValue);
                          if (result.success) {
                            if (result.state) {
                              updateNewOrganizationField("registeredAddressState", result.state);
                            }
                            if (result.district) {
                              updateNewOrganizationField("registeredAddressDistrict", result.district);
                            }
                            
                            // Ensure PIN code is preserved after State/District updates
                            setTimeout(() => {
                              const currentPincode = newOrganization?.registeredAddressPincode;
                              if (currentPincode !== pincodeToPreserve) {
                                updateNewOrganizationField("registeredAddressPincode", pincodeToPreserve);
                              }
                            }, 200);
                          }
                        } catch (error) {
                          console.error("PIN code lookup error:", error);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                    placeholder="Enter 6-digit PIN Code"
                    maxLength={6}
                  />
                </div>
              </div>
                </div>
              )}

              {activeTab === "directors-partners" && (
                <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Directors / Partners
                  </h3>
                  <button
                    onClick={addNewDirectorPartner}
                    className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors text-sm"
                  >
                    <FiPlus className="w-4 h-4" /> Add Director/Partner
                  </button>
                </div>

                {!newOrganization.directorsPartners ||
                newOrganization.directorsPartners.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No Directors / Partners added yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#00486D] text-white">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            DIN No.
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Contact
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Date of Addition
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {newOrganization.directorsPartners.map((dp) => (
                          <tr key={dp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={dp.name || ""}
                                onChange={(e) =>
                                  updateNewDirectorPartner(
                                    dp.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Name"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={dp.dinNumber || ""}
                                onChange={(e) =>
                                  updateNewDirectorPartner(
                                    dp.id,
                                    "dinNumber",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="DIN Number"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={dp.contact || ""}
                                onChange={(e) =>
                                  updateNewDirectorPartner(
                                    dp.id,
                                    "contact",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Contact"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="email"
                                value={dp.email || ""}
                                onChange={(e) =>
                                  updateNewDirectorPartner(
                                    dp.id,
                                    "email",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Email"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={dp.dateOfAddition || ""}
                                onChange={(e) =>
                                  updateNewDirectorPartner(
                                    dp.id,
                                    "dateOfAddition",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={dp.status || "Active"}
                                onChange={(e) =>
                                  updateNewDirectorPartner(
                                    dp.id,
                                    "status",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeNewDirectorPartner(dp.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                </div>
              )}

              {activeTab === "digital-signatures" && (
                <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Digital Signatures
                  </h3>
                  <button
                    onClick={addNewDigitalSignature}
                    className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors text-sm"
                  >
                    <FiPlus className="w-4 h-4" /> Add Digital Signature
                  </button>
                </div>

                {!newOrganization.digitalSignatures ||
                newOrganization.digitalSignatures.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No Digital Signatures added yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#00486D] text-white">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            DSC Number
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Expiry Date
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {newOrganization.digitalSignatures.map((ds) => (
                          <tr key={ds.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={ds.name || ""}
                                onChange={(e) =>
                                  updateNewDigitalSignature(
                                    ds.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Name"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={ds.dscNumber || ""}
                                onChange={(e) =>
                                  updateNewDigitalSignature(
                                    ds.id,
                                    "dscNumber",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="DSC Number"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={ds.expiryDate || ""}
                                onChange={(e) =>
                                  updateNewDigitalSignature(
                                    ds.id,
                                    "expiryDate",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={ds.status || "Active"}
                                onChange={(e) =>
                                  updateNewDigitalSignature(
                                    ds.id,
                                    "status",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeNewDigitalSignature(ds.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="bg-[#F8F9FA] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Attachments
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 max-w-xl">
                    Upload and manage all company documents for this organization in the
                    Company Documents section.
                  </p>
                  {selectedClient && selectedOrg && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/client-company-documents/${selectedClient.user_id}/${selectedOrg.id}`,
                          { state: { orgId: selectedOrg.id, userId: selectedClient.user_id } }
                        )
                      }
                      className="px-6 py-2 bg-[#01334C] text-white rounded-lg text-sm font-semibold hover:bg-[#00486D] transition-colors"
                    >
                      Go to Company Documents
                    </button>
                  )}
                </div>
              )}

              {activeTab === "credentials" && (
                <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Credentials
                  </h3>
                  <button
                    onClick={addNewWebsite}
                    className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors text-sm"
                  >
                    <FiPlus className="w-4 h-4" /> Add Credential
                  </button>
                </div>

                {!newOrganization.websites ||
                newOrganization.websites.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No Credentials added yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#00486D] text-white">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            URL
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Login
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Password
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs">
                            Remarks
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {newOrganization.websites.map((website) => (
                          <tr key={website.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <select
                                value={website.type || ""}
                                onChange={(e) =>
                                  updateNewWebsite(website.id, "type", e.target.value)
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              >
                                <option value="">Select Type</option>
                                <option value="Income Tax">Income Tax</option>
                                <option value="GST">GST</option>
                                <option value="Income Tax – TAN Based">Income Tax – TAN Based</option>
                                <option value="Professional Tax">Professional Tax</option>
                                <option value="Provident Fund">Provident Fund</option>
                                <option value="ESIC">ESIC</option>
                                <option value="MCA">MCA</option>
                                <option value="Labour license">Labour license</option>
                                <option value="TRACES">TRACES</option>
                                <option value="ICEGATE">ICEGATE</option>
                                <option value="Service Tax">Service Tax</option>
                                <option value="VAT">VAT</option>
                                <option value="Others 1">Others 1</option>
                                <option value="Others 2">Others 2</option>
                                <option value="Others 3">Others 3</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={website.url || ""}
                                onChange={(e) =>
                                  updateNewWebsite(website.id, "url", e.target.value)
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="URL"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={website.login || ""}
                                onChange={(e) =>
                                  updateNewWebsite(website.id, "login", e.target.value)
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Login"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <input
                                  type={
                                    website.showPassword ? "text" : "password"
                                  }
                                  value={website.password || ""}
                                  onChange={(e) =>
                                    updateNewWebsite(website.id, "password", e.target.value)
                                  }
                                  className="w-full px-2 py-1 pr-8 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                  placeholder="Password"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleNewPasswordVisibility(website.id)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {website.showPassword ? (
                                    <FiEyeOff className="w-4 h-4" />
                                  ) : (
                                    <FiEye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={website.remarks || ""}
                                onChange={(e) =>
                                  updateNewWebsite(website.id, "remarks", e.target.value)
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Remarks"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeNewWebsite(website.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsAddingOrg(false);
                    setSelectedClient(null);
                  }}
                  className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewOrganization}
                  disabled={saving}
                  className="px-6 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Create Organization"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DETAIL/EDIT VIEW ---
  if (selectedOrg) {
    return (
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
        <button
          onClick={() => setSelectedOrg(null)}
          className="mb-6 flex items-center text-[#01334C] hover:text-[#00486D] font-medium"
        >
          <FiChevronLeft className="w-5 h-5 mr-2" /> Back to List
        </button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingOrg
                ? editingOrg.legalName !== "-"
                  ? editingOrg.legalName
                  : "Edit Organization"
                : selectedOrg.legalName !== "-"
                ? selectedOrg.legalName
                : selectedOrg.tradeName}
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage organization details
            </p>
          </div>
          {!editingOrg && (
            <div className="flex gap-3">
              <button
                onClick={handleEditOrganization}
                className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors"
              >
                <FiEdit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={handleDeleteOrganization}
                disabled={savingOrg}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 px-4 pt-4">
              {[
                { key: "organization-details", label: "Organization Details" },
                { key: "directors-partners", label: "Directors / Partners Details" },
                { key: "digital-signatures", label: "Digital Signature Details" },
                { key: "attachments", label: "Attachments" },
                { key: "credentials", label: "Credentials" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveDetailTab(tab.key)}
                  className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                    activeDetailTab === tab.key
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
          <div className="px-6 py-6 min-h-[400px]">
            {activeDetailTab === "organization-details" && (
              <div className="space-y-8">
                {/* Use same grid layout as Add Form for Read/Edit modes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Name
                    </label>
                    {editingOrg ? (
                      <input
                        type="text"
                        value={editingOrg.legalName}
                        onChange={(e) =>
                          updateOrganizationField("legalName", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                        {selectedOrg.legalName}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trade Name
                    </label>
                    {editingOrg ? (
                      <input
                        type="text"
                        value={editingOrg.tradeName}
                        onChange={(e) =>
                          updateOrganizationField("tradeName", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                        {selectedOrg.tradeName}
                      </div>
                    )}
                  </div>
                </div>

                {/* GSTIN, PAN Number & Incorporation Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GSTIN
                    </label>
                    {editingOrg ? (
                      <input
                        type="text"
                        value={editingOrg.gstin}
                        onChange={(e) =>
                          updateOrganizationField("gstin", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                        {selectedOrg.gstin}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number
                    </label>
                    {editingOrg ? (
                      <input
                        type="text"
                        value={editingOrg.panNumber || ""}
                        onChange={(e) =>
                          updateOrganizationField("panNumber", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                        {selectedOrg.panNumber || "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incorporation Date
                    </label>
                    {editingOrg ? (
                      <input
                        type="date"
                        value={editingOrg.incorporationDate}
                        onChange={(e) =>
                          updateOrganizationField(
                            "incorporationDate",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                        {formatDate(selectedOrg.incorporationDate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* PAN File Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN File
                    </label>
                {editingOrg ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={
                        editingOrg.panFile
                          ? "File uploaded"
                          : "No file chosen"
                      }
                      className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                    />
                    <label className="cursor-pointer flex-shrink-0">
                      <input
                        type="file"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              // Validate file size (max 5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                alert("File size must be less than 5MB");
                                e.target.value = "";
                                return;
                              }

                              // Upload directly to S3
                              const folder = `user-profiles/${selectedOrgUserId}/organizations/org-${editingOrg.id || "new"}`;
                              const { s3Url } = await uploadFileDirect(
                                file,
                                folder,
                                "pan-file"
                              );

                              // Store S3 URL
                              updateOrganizationField("panFile", s3Url);
                            } catch (error) {
                              console.error("Error uploading PAN file:", error);
                              alert(
                                "Failed to upload file. Please try again."
                              );
                              e.target.value = "";
                            }
                          }
                        }}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <span className="px-4 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors text-sm whitespace-nowrap">
                        {editingOrg.panFile ? "Change" : "Upload"}
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                    {selectedOrg.panFile ? (
                      <button
                        onClick={() => handleViewFile(selectedOrg.panFile)}
                        className="text-blue-600 hover:underline"
                      >
                        View File
                      </button>
                    ) : (
                      "Not uploaded"
                    )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    {editingOrg ? (
                      <select
                        value={editingOrg.category}
                        onChange={(e) =>
                          updateOrganizationField("category", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                      >
                        <option value="">Select Category</option>
                        <option value="Private Limited Company">
                          Private Limited Company
                        </option>
                        <option value="Partnership Firm">Partnership Firm</option>
                        <option value="One Person Company">
                          One Person Company
                        </option>
                        <option value="Limited Liability Partnership">
                          Limited Liability Partnership
                        </option>
                        <option value="Individual">Individual</option>
                      </select>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                        {selectedOrg.category || "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TAN
                    </label>
                    {editingOrg ? (
                    <input
                      type="text"
                      value={editingOrg.tan}
                      onChange={(e) =>
                        updateOrganizationField("tan", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                        {selectedOrg.tan || "-"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CIN
                    </label>
                    {editingOrg ? (
                    <input
                      type="text"
                      value={editingOrg.cin}
                      onChange={(e) =>
                        updateOrganizationField("cin", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                        {selectedOrg.cin || "-"}
                      </div>
                    )}
                  </div>
                  {/* Registered Office Address Section */}
                  <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Registered Office Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Address Line 1 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      {editingOrg ? (
                        <input
                          type="text"
                          value={editingOrg.registeredAddressLine1 || ""}
                          onChange={(e) =>
                            updateOrganizationField("registeredAddressLine1", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                          placeholder="Enter Address Line 1"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                          {selectedOrg.registeredAddressLine1 || "-"}
                        </div>
                      )}
                    </div>

                    {/* Address Line 2 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      {editingOrg ? (
                        <input
                          type="text"
                          value={editingOrg.registeredAddressLine2 || ""}
                          onChange={(e) =>
                            updateOrganizationField("registeredAddressLine2", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                          placeholder="Enter Address Line 2 (Optional)"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                          {selectedOrg.registeredAddressLine2 || "-"}
                        </div>
                      )}
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District
                      </label>
                      {editingOrg ? (
                        <input
                          type="text"
                          value={editingOrg.registeredAddressDistrict || ""}
                          onChange={(e) =>
                            updateOrganizationField("registeredAddressDistrict", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                          placeholder="Enter District"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                          {selectedOrg.registeredAddressDistrict || "-"}
                        </div>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      {editingOrg ? (
                        <input
                          type="text"
                          value={editingOrg.registeredAddressState || ""}
                          onChange={(e) =>
                            updateOrganizationField("registeredAddressState", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                          placeholder="Enter State"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                          {selectedOrg.registeredAddressState || "-"}
                        </div>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      {editingOrg ? (
                        <input
                          type="text"
                          value={editingOrg.registeredAddressCountry || "India"}
                          onChange={(e) =>
                            updateOrganizationField("registeredAddressCountry", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                          placeholder="Enter Country"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                          {selectedOrg.registeredAddressCountry || "India"}
                        </div>
                      )}
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>
                      {editingOrg ? (
                        <div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={editingOrg.registeredAddressPincode || ""}
                          onChange={async (e) => {
                            // Get the raw input value
                            const inputValue = e.target.value;
                            
                            // Remove all non-digit characters and limit to 6 digits
                            const cleanedValue = inputValue.replace(/\D/g, "").slice(0, 6);
                            
                            // Update the field - this should allow all 6 digits
                            updateOrganizationField("registeredAddressPincode", cleanedValue);
                            
                            // Auto-trigger lookup when exactly 6 digits are entered
                            if (cleanedValue.length === 6) {
                              // Store PIN code to preserve it
                              const pincodeToPreserve = cleanedValue;
                              
                              try {
                                const result = await lookupPincode(cleanedValue);
                                if (result.success) {
                                  if (result.state) {
                                    updateOrganizationField("registeredAddressState", result.state);
                                  }
                                  if (result.district) {
                                    updateOrganizationField("registeredAddressDistrict", result.district);
                                  }
                                  
                                  // Ensure PIN code is preserved after State/District updates
                                  setTimeout(() => {
                                    const currentPincode = editingOrg?.registeredAddressPincode;
                                    if (currentPincode !== pincodeToPreserve) {
                                      updateOrganizationField("registeredAddressPincode", pincodeToPreserve);
                                    }
                                  }, 200);
                                }
                              } catch (error) {
                                console.error("PIN code lookup error:", error);
                              }
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                          placeholder="Enter 6-digit PIN Code"
                          maxLength={6}
                        />
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                          {selectedOrg.registeredAddressPincode || "-"}
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            )}

            {activeDetailTab === "directors-partners" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Directors / Partners
                  </h3>
                  {editingOrg && (
                    <button
                      onClick={addDirectorPartner}
                      className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors text-sm"
                    >
                      <FiPlus className="w-4 h-4" /> Add Director/Partner
                    </button>
                  )}
                </div>

                {(!selectedOrg.directorsPartners ||
                selectedOrg.directorsPartners.length === 0) &&
                (!editingOrg ||
                  !editingOrg.directorsPartners ||
                  editingOrg.directorsPartners.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    No Directors / Partners added yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#00486D] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          DIN No.
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Date of Addition
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Status
                        </th>
                        {editingOrg && (
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(editingOrg?.directorsPartners ||
                        selectedOrg.directorsPartners ||
                        []).map((dp) => (
                        <tr key={dp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <input
                                type="text"
                                value={dp.name || ""}
                                onChange={(e) =>
                                  updateDirectorPartner(
                                    dp.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Name"
                              />
                            ) : (
                              <span className="text-gray-900">{dp.name || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <input
                                type="text"
                                value={dp.dinNumber || ""}
                                onChange={(e) =>
                                  updateDirectorPartner(
                                    dp.id,
                                    "dinNumber",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="DIN Number"
                              />
                            ) : (
                              <span className="text-gray-900">{dp.dinNumber || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <input
                                type="text"
                                value={dp.contact || ""}
                                onChange={(e) =>
                                  updateDirectorPartner(
                                    dp.id,
                                    "contact",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Contact"
                              />
                            ) : (
                              <span className="text-gray-900">{dp.contact || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <input
                                type="email"
                                value={dp.email || ""}
                                onChange={(e) =>
                                  updateDirectorPartner(
                                    dp.id,
                                    "email",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Email"
                              />
                            ) : (
                              <span className="text-gray-900">{dp.email || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <input
                                type="date"
                                value={dp.dateOfAddition || ""}
                                onChange={(e) =>
                                  updateDirectorPartner(
                                    dp.id,
                                    "dateOfAddition",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              />
                            ) : (
                              <span className="text-gray-900">
                                {dp.dateOfAddition
                                  ? formatDate(dp.dateOfAddition)
                                  : "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <select
                                value={dp.status || "Active"}
                                onChange={(e) =>
                                  updateDirectorPartner(
                                    dp.id,
                                    "status",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            ) : (
                              <span className="text-gray-900">{dp.status || "Active"}</span>
                            )}
                          </td>
                          {editingOrg && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeDirectorPartner(dp.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {activeDetailTab === "digital-signatures" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Digital Signatures
                  </h3>
                  {editingOrg && (
                    <button
                      onClick={addDigitalSignature}
                      className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors text-sm"
                    >
                      <FiPlus className="w-4 h-4" /> Add Digital Signature
                    </button>
                  )}
                </div>

                {(!selectedOrg.digitalSignatures ||
                selectedOrg.digitalSignatures.length === 0) &&
                (!editingOrg ||
                  !editingOrg.digitalSignatures ||
                  editingOrg.digitalSignatures.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    No Digital Signatures added yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#00486D] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          DSC Number
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Expiry Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Status
                        </th>
                        {editingOrg && (
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(editingOrg?.digitalSignatures ||
                        selectedOrg.digitalSignatures ||
                        []).map((ds) => (
                        <tr key={ds.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <input
                                type="text"
                                value={ds.name || ""}
                                onChange={(e) =>
                                  updateDigitalSignature(
                                    ds.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="Name"
                              />
                            ) : (
                              <span className="text-gray-900">{ds.name || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <input
                                type="text"
                                value={ds.dscNumber || ""}
                                onChange={(e) =>
                                  updateDigitalSignature(
                                    ds.id,
                                    "dscNumber",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                placeholder="DSC Number"
                              />
                            ) : (
                              <span className="text-gray-900">{ds.dscNumber || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <input
                                type="date"
                                value={ds.expiryDate || ""}
                                onChange={(e) =>
                                  updateDigitalSignature(
                                    ds.id,
                                    "expiryDate",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              />
                            ) : (
                              <span className="text-gray-900">
                                {ds.expiryDate ? formatDate(ds.expiryDate) : "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingOrg ? (
                              <select
                                value={ds.status || "Active"}
                                onChange={(e) =>
                                  updateDigitalSignature(
                                    ds.id,
                                    "status",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            ) : (
                              <span className="text-gray-900">{ds.status || "Active"}</span>
                            )}
                          </td>
                          {editingOrg && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeDigitalSignature(ds.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {activeDetailTab === "attachments" && (
              <div className="bg-[#F8F9FA] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Attachments
                </h3>
                <p className="text-sm text-gray-600 mb-4 max-w-xl">
                  Upload and manage all company documents for this organization in the
                  Company Documents section.
                </p>
                {selectedOrgUserId && selectedOrg && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/client-company-documents/${selectedOrgUserId}/${selectedOrg.id}`,
                        { state: { orgId: selectedOrg.id, userId: selectedOrgUserId } }
                      )
                    }
                    className="px-6 py-2 bg-[#01334C] text-white rounded-lg text-sm font-semibold hover:bg-[#00486D] transition-colors"
                  >
                    Go to Company Documents
                  </button>
                )}
              </div>
            )}

            {activeDetailTab === "credentials" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Credentials
                  </h3>
                  {editingOrg && (
                    <button
                      onClick={() => {
                        const newWebsite = {
                          id: Date.now(),
                          type: "",
                          url: "",
                          login: "",
                          password: "",
                          remarks: "",
                          showPassword: false,
                        };
                        setEditingOrg({
                          ...editingOrg,
                          websites: [...(editingOrg.websites || []), newWebsite],
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors text-sm"
                    >
                      <FiPlus className="w-4 h-4" /> Add Credential
                    </button>
                  )}
                </div>

                {(!selectedOrg.websites ||
                selectedOrg.websites.length === 0) &&
                (!editingOrg ||
                  !editingOrg.websites ||
                  editingOrg.websites.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    No Credentials added yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#00486D] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-xs rounded-tl-lg">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          URL
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Login
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Password
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-xs">
                          Remarks
                        </th>
                        {editingOrg && (
                          <th className="px-4 py-3 text-left font-medium text-xs rounded-tr-lg">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(editingOrg?.websites || selectedOrg.websites || []).map(
                        (website) => (
                          <tr key={website.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {editingOrg ? (
                                <select
                                  value={website.type || ""}
                                  onChange={(e) => {
                                    const updatedWebsites = (
                                      editingOrg.websites || []
                                    ).map((w) =>
                                      w.id === website.id
                                        ? { ...w, type: e.target.value }
                                        : w
                                    );
                                    setEditingOrg({
                                      ...editingOrg,
                                      websites: updatedWebsites,
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                >
                                  <option value="">Select Type</option>
                                  <option value="Income Tax">Income Tax</option>
                                  <option value="GST">GST</option>
                                  <option value="Income Tax – TAN Based">Income Tax – TAN Based</option>
                                  <option value="Professional Tax">Professional Tax</option>
                                  <option value="Provident Fund">Provident Fund</option>
                                  <option value="ESIC">ESIC</option>
                                  <option value="MCA">MCA</option>
                                  <option value="Labour license">Labour license</option>
                                  <option value="TRACES">TRACES</option>
                                  <option value="ICEGATE">ICEGATE</option>
                                  <option value="Service Tax">Service Tax</option>
                                  <option value="VAT">VAT</option>
                                  <option value="Others 1">Others 1</option>
                                  <option value="Others 2">Others 2</option>
                                  <option value="Others 3">Others 3</option>
                                </select>
                              ) : (
                                <span className="text-gray-900">
                                  {website.type || "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingOrg ? (
                                <input
                                  type="text"
                                  value={website.url || ""}
                                  onChange={(e) => {
                                    const updatedWebsites = (
                                      editingOrg.websites || []
                                    ).map((w) =>
                                      w.id === website.id
                                        ? { ...w, url: e.target.value }
                                        : w
                                    );
                                    setEditingOrg({
                                      ...editingOrg,
                                      websites: updatedWebsites,
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                  placeholder="URL"
                                />
                              ) : (
                                <span className="text-gray-900">
                                  {website.url || "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingOrg ? (
                                <input
                                  type="text"
                                  value={website.login || ""}
                                  onChange={(e) => {
                                    const updatedWebsites = (
                                      editingOrg.websites || []
                                    ).map((w) =>
                                      w.id === website.id
                                        ? { ...w, login: e.target.value }
                                        : w
                                    );
                                    setEditingOrg({
                                      ...editingOrg,
                                      websites: updatedWebsites,
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                  placeholder="Login"
                                />
                              ) : (
                                <span className="text-gray-900">
                                  {website.login || "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingOrg ? (
                                <div className="relative">
                                  <input
                                    type={
                                      website.showPassword ? "text" : "password"
                                    }
                                    value={website.password || ""}
                                    onChange={(e) => {
                                      const updatedWebsites = (
                                        editingOrg.websites || []
                                      ).map((w) =>
                                        w.id === website.id
                                          ? { ...w, password: e.target.value }
                                          : w
                                      );
                                      setEditingOrg({
                                        ...editingOrg,
                                        websites: updatedWebsites,
                                      });
                                    }}
                                    className="w-full px-2 py-1 pr-8 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                    placeholder="Password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedWebsites = (
                                        editingOrg.websites || []
                                      ).map((w) =>
                                        w.id === website.id
                                          ? {
                                              ...w,
                                              showPassword: !w.showPassword,
                                            }
                                          : w
                                      );
                                      setEditingOrg({
                                        ...editingOrg,
                                        websites: updatedWebsites,
                                      });
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  >
                                    {website.showPassword ? (
                                      <FiEyeOff className="w-4 h-4" />
                                    ) : (
                                      <FiEye className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-900">
                                  {website.password ? "••••••••" : "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingOrg ? (
                                <input
                                  type="text"
                                  value={website.remarks || ""}
                                  onChange={(e) => {
                                    const updatedWebsites = (
                                      editingOrg.websites || []
                                    ).map((w) =>
                                      w.id === website.id
                                        ? { ...w, remarks: e.target.value }
                                        : w
                                    );
                                    setEditingOrg({
                                      ...editingOrg,
                                      websites: updatedWebsites,
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#01334C]"
                                  placeholder="Remarks"
                                />
                              ) : (
                                <span className="text-gray-900">
                                  {website.remarks || "-"}
                                </span>
                              )}
                            </td>
                            {editingOrg && (
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => {
                                    const updatedWebsites = (
                                      editingOrg.websites || []
                                    ).filter((w) => w.id !== website.id);
                                    setEditingOrg({
                                      ...editingOrg,
                                      websites: updatedWebsites,
                                    });
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {/* Edit Actions */}
            {editingOrg && (
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingOrg(null)}
                  className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOrganization}
                  className="px-6 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors"
                >
                  {savingOrg ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
            }}
          >
            <BsBuilding className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              List Of Companies
            </h1>
            <p className="text-gray-500 italic ml-1">
              Your registered organizations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleAddOrganization}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-colors shadow-sm font-medium"
          >
            <FiPlus className="w-5 h-5" /> Create New
          </button>
          <button
            onClick={() => {
              loadClients();
              loadOrganizations();
            }}
            className="p-2.5 text-[#00486D] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          />
        </div>
        <div className="relative">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] appearance-none bg-white"
          >
            <option value="">All Clients</option>
            {uniqueClients.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="p-4 bg-[#f5f5f5] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-white">
                    <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D] rounded-l-xl">
                      Organisation Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                      Contact Person
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D]">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium bg-[#00486D] rounded-r-xl">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrganizations.length > 0 ? (
                    currentOrganizations.map((org) => (
                      <tr
                        key={org.id}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewAll(org)}
                            className="text-left hover:underline"
                          >
                            <div className="text-sm font-medium text-[#01334C] hover:text-[#00486D]">
                              {org.legalName !== "-"
                                ? org.legalName
                                : org.tradeName}
                            </div>
                            {org.tradeName !== "-" &&
                              org.legalName !== "-" &&
                              org.tradeName !== org.legalName && (
                                <div className="text-xs text-gray-500">
                                  {org.tradeName}
                                </div>
                              )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {org.clientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {org.clientEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {org.category && org.category !== "-" && org.category !== "N/A" ? org.category : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewAll(org)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#01334C]/10 text-[#01334C] rounded-lg hover:bg-[#01334C] hover:text-white transition-colors text-xs font-medium"
                          >
                            <FiEye className="w-4 h-4" /> View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <FiAlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p>No organizations found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredOrganizations.length > itemsPerPage && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {String(indexOfFirstItem + 1).padStart(2, "0")} of{" "}
                {filteredOrganizations.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-[#00486D] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003652]"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-[#00486D] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003652]"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrganizations;
