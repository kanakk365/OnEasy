import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  getUsersPageData,
  updateUsersPageData,
} from "../../utils/usersPageApi";
import { uploadFileDirect, viewFile } from "../../utils/s3Upload";
import { AUTH_CONFIG } from "../../config/auth";

// Import modular profile components
import {
  ClientProfileContent,
  NotesContent,
  TasksContent,
  OrganisationDetailsContent,
} from "./profile";

function Settings() {
  const [expandedSection, setExpandedSection] = useState("client-profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    dob: "",
    address: "",
    businessAddress: "",
    aadharCard: null,
    panCard: null,
    signature: null,
  });
  const [organizations, setOrganizations] = useState([
    {
      id: 1,
      organisationType: "",
      legalName: "",
      tradeName: "",
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
    },
  ]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [isAddingNewOrg, setIsAddingNewOrg] = useState(false);
  const [expandedOrgId, setExpandedOrgId] = useState(null);
  const [adminTasksList, setAdminTasksList] = useState([]);
  const [userTasksList, setUserTasksList] = useState([]);
  const [expandedAdminTaskId, setExpandedAdminTaskId] = useState(null);
  const [expandedUserTaskId, setExpandedUserTaskId] = useState(null);
  const [isAddingUserTask, setIsAddingUserTask] = useState(false);
  const [isAddingAdminTask, setIsAddingAdminTask] = useState(false);
  const [currentUserTask, setCurrentUserTask] = useState({
    date: "",
    title: "",
    description: "",
    type: "",
  });
  const [currentAdminTask, setCurrentAdminTask] = useState({
    date: "",
    title: "",
    description: "",
    type: "",
  });
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [notes, setNotes] = useState("");
  const [adminNotesList, setAdminNotesList] = useState([]);
  const [userNotesList, setUserNotesList] = useState([]);
  const [expandedAdminNoteId, setExpandedAdminNoteId] = useState(null);
  const [expandedUserNoteId, setExpandedUserNoteId] = useState(null);
  const [isAddingUserNote, setIsAddingUserNote] = useState(false);
  const [currentUserNote, setCurrentUserNote] = useState({
    date: "",
    description: "",
    attachments: [],
  });
  const [userId, setUserId] = useState("");
  const [customClientId, setCustomClientId] = useState("");
  const [clientStatus, setClientStatus] = useState("");

  // Load data on mount
  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = userData.role || "";
    setIsUserAdmin(userRole === "admin" || userRole === "superadmin");

    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await getUsersPageData();

      if (response.success && response.data) {
        const { user, websites: userWebsites } = response.data;

        // Store user ID, custom client ID, and client status
        setUserId(user.id || "");
        setCustomClientId(user.custom_client_id || "");
        setClientStatus(user.client_status || "Active");

        // Populate Client Profile data
        // Helper function to validate file URLs
        const validateFileUrl = (url) => {
          if (!url) return null;
          if (typeof url !== "string") return null;
          const trimmed = url.trim();
          if (
            trimmed === "" ||
            trimmed === "null" ||
            trimmed === "undefined" ||
            trimmed === "{}" ||
            trimmed === "[]"
          ) {
            return null;
          }
          return trimmed;
        };

        setFormData({
          name: user.name || "",
          whatsapp: user.whatsapp || "",
          email: user.email || "",
          dob: user.dob || "",
          address: user.address_line1 || "",
          businessAddress: user.business_address || "",
          aadharCard: validateFileUrl(user.aadhar_card),
          panCard: validateFileUrl(user.pan_card),
          signature: validateFileUrl(user.signature),
        });

        // Populate Organisation Details - now supports multiple organizations with websites
        if (user.organisations && user.organisations.length > 0) {
          setOrganizations(
            user.organisations.map((org, idx) => {
              // Parse websites from JSON or use empty array
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

              // Map websites to include showPassword
              websites = websites.map((w) => ({
                id: w.id || Date.now(),
                type: w.type || "",
                url: w.url || "",
                login: w.login || "",
                password: w.password || "",
                remarks: w.remarks || "",
                showPassword: false,
              }));

              // Parse directors/partners details
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

              // Parse digital signature details
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
                id: org.id || idx + 1,
                organisationType: org.organisation_type || "",
                legalName: org.legal_name || "",
                tradeName: org.trade_name || "",
                category: org.category || "",
                gstin: org.gstin || "",
                directorsPartners: directorsPartners.map((dp, index) => ({
                  id: dp.id || `dp-${Date.now()}-${index}`,
                  name: dp.name || "",
                  dinNumber: dp.din_number || "",
                  contact: dp.contact || "",
                  email: dp.email || "",
                  dateOfAddition: dp.date_of_addition || "",
                  status: dp.status || "Active",
                })),
                digitalSignatures: digitalSignatures.map((ds, index) => ({
                  id: ds.id || `ds-${Date.now()}-${index}`,
                  name: ds.name || "",
                  dscNumber: ds.dsc_number || "",
                  expiryDate: ds.expiry_date || "",
                  status: ds.status || "Active",
                })),
                optionalAttachment1: org.optional_attachment_1 || null,
                optionalAttachment2: org.optional_attachment_2 || null,
                incorporationDate: org.incorporation_date || "",
                panFile: org.pan_file || null,
                tan: org.tan || "",
                cin: org.cin || "",
                registeredAddress: org.registered_address || "",
                websites: websites,
              };
            })
          );
        } else if (user.organisation_type || user.legal_name) {
          // Backward compatibility - single organization from old schema
          // Migrate old websites to first organization
          let websites = [];
          if (userWebsites && userWebsites.length > 0) {
            websites = userWebsites.map((w) => ({
              id: w.id || Date.now(),
              type: w.website_type || "",
              url: w.website_url || "",
              login: w.login || "",
              password: w.password || "",
              remarks: w.remarks || "",
              showPassword: false,
            }));
          }

          setOrganizations([
            {
              id: 1,
              organisationType: user.organisation_type || "",
              legalName: user.legal_name || "",
              tradeName: user.trade_name || "",
              category: user.category || "",
              gstin: user.gstin || "",
              incorporationDate: user.incorporation_date || "",
              panFile: user.pan_file || null,
              tan: user.tan || "",
              cin: user.cin || "",
              registeredAddress: user.registered_address || "",
              websites: websites,
            },
          ]);
        }

        // Parse admin tasks (array of tasks)
        const adminTasksRaw = user.admin_tasks || "";
        try {
          const tasksList = JSON.parse(adminTasksRaw);
          if (Array.isArray(tasksList)) {
            setAdminTasksList(tasksList);
          } else if (adminTasksRaw) {
            setAdminTasksList([
              { date: "", title: adminTasksRaw, description: "", type: "" },
            ]);
          }
        } catch {
          if (adminTasksRaw) {
            setAdminTasksList([
              { date: "", title: adminTasksRaw, description: "", type: "" },
            ]);
          }
        }

        // Parse user tasks (array of tasks)
        const userTasksRaw = user.user_tasks || "";
        try {
          const tasksList = JSON.parse(userTasksRaw);
          if (Array.isArray(tasksList)) {
            setUserTasksList(tasksList);
          } else if (userTasksRaw) {
            setUserTasksList([
              { date: "", title: userTasksRaw, description: "", type: "" },
            ]);
          }
        } catch {
          if (userTasksRaw) {
            setUserTasksList([
              { date: "", title: userTasksRaw, description: "", type: "" },
            ]);
          }
        }

        // Populate Notes
        setNotes(user.notes || "");

        // Parse admin notes (array of notes)
        const adminNotesRaw = user.admin_notes || "";
        try {
          const notesList = JSON.parse(adminNotesRaw);
          if (Array.isArray(notesList)) {
            setAdminNotesList(notesList);
          } else if (notesList.note !== undefined) {
            setAdminNotesList([notesList]);
          } else if (adminNotesRaw) {
            setAdminNotesList([
              { date: "", description: adminNotesRaw, attachments: [] },
            ]);
          }
        } catch {
          if (adminNotesRaw) {
            setAdminNotesList([
              { date: "", description: adminNotesRaw, attachments: [] },
            ]);
          }
        }

        // Parse user notes (array of notes)
        const userNotesRaw = user.user_notes || "";
        try {
          const notesList = JSON.parse(userNotesRaw);
          if (Array.isArray(notesList)) {
            setUserNotesList(notesList);
          } else if (notesList.note !== undefined) {
            setUserNotesList([notesList]);
          } else if (userNotesRaw) {
            setUserNotesList([
              { date: "", description: userNotesRaw, attachments: [] },
            ]);
          }
        } catch {
          if (userNotesRaw) {
            setUserNotesList([
              { date: "", description: userNotesRaw, attachments: [] },
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      alert("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientProfile = async () => {
    try {
      console.log("💾 Saving Client Profile...");
      setSaving(true);

      // Get user ID
      const userData = JSON.parse(
        localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
      );
      const currentUserId = userData.id || userId;

      // Upload any files that are File objects (not yet uploaded)
      const documentFields = ["aadharCard", "panCard", "signature"];
      const updatedFormData = { ...formData };

      for (const field of documentFields) {
        const fileValue = formData[field];
        // If it's a File object, upload it first
        if (fileValue instanceof File) {
          try {
            const folder = `user-profiles/${currentUserId}/personal`;
            const { s3Url } = await uploadFileDirect(
              fileValue,
              folder,
              fileValue.name
            );
            updatedFormData[field] = s3Url;
            console.log(`✅ Uploaded ${field} to S3: ${s3Url}`);
          } catch (error) {
            console.error(`Error uploading ${field}:`, error);
            // Keep original value on error
          }
        }
        // If it's already an S3 URL or base64, keep it as is
      }

      const payload = {
        clientProfile: {
          name: updatedFormData.name,
          whatsapp: updatedFormData.whatsapp,
          email: updatedFormData.email,
          dob: updatedFormData.dob,
          address: updatedFormData.address,
          businessAddress: updatedFormData.businessAddress,
          aadharCard: updatedFormData.aadharCard,
          panCard: updatedFormData.panCard,
          signature: updatedFormData.signature,
        },
      };

      const response = await updateUsersPageData(payload);

      if (response.success) {
        alert("✅ Client Profile saved successfully!");
        await loadUserData();
      }
    } catch (error) {
      console.error("❌ Error saving Client Profile:", error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrganisation = async () => {
    try {
      console.log("💾 Saving Organisation Details with Websites...");
      setSaving(true);

      const payload = {
        organisations: organizations.map((org) => ({
          organisationType: org.organisationType,
          legalName: org.legalName,
          tradeName: org.tradeName,
          category: org.category || "",
          gstin: org.gstin,
          incorporationDate: org.incorporationDate,
          panFile: org.panFile,
          tan: org.tan,
          cin: org.cin,
          registeredAddress: org.registeredAddress,
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
        alert("✅ Organisation Details saved successfully!");
        setSelectedOrgId(null);
        setIsAddingNewOrg(false);
        await loadUserData();
      }
    } catch (error) {
      console.error("❌ Error saving Organisation:", error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUserNoteFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentUserNote((prev) => ({
          ...prev,
          attachments: [
            ...prev.attachments,
            {
              name: file.name,
              data: reader.result,
              type: file.type,
              size: file.size,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUserNoteAttachment = (index) => {
    setCurrentUserNote((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== index),
    }));
  };

  const handleSaveUserNote = async () => {
    try {
      setSaving(true);

      // Add new note to list
      const updatedNotesList = [
        ...userNotesList,
        {
          id: Date.now(),
          date: currentUserNote.date,
          description: currentUserNote.description,
          attachments: currentUserNote.attachments,
          createdAt: new Date().toISOString(),
        },
      ];

      const payload = {
        userNotes: JSON.stringify(updatedNotesList),
      };

      const response = await updateUsersPageData(payload);

      if (response.success) {
        setUserNotesList(updatedNotesList);
        setCurrentUserNote({ date: "", description: "", attachments: [] });
        setIsAddingUserNote(false);
        alert("Note saved successfully!");
        await loadUserData();
      }
    } catch (error) {
      console.error("Error saving user note:", error);
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleViewFile = async (fileData) => {
    if (!fileData) {
      alert("No file available to view.");
      return;
    }

    // If it's null, undefined, or empty string, show error
    if (fileData === null || fileData === undefined || fileData === "") {
      alert("No file available to view.");
      return;
    }

    // Convert to string if it's not already (handles edge cases)
    const fileDataString =
      typeof fileData === "string" ? fileData : String(fileData);

    // Check if it's a valid string (not 'null', 'undefined', '{}', etc.)
    if (
      fileDataString === "null" ||
      fileDataString === "undefined" ||
      fileDataString === "{}" ||
      fileDataString === "[]" ||
      fileDataString.trim() === ""
    ) {
      alert("Invalid file URL. The document may not be properly uploaded.");
      return;
    }

    await viewFile(fileDataString);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (field, file) => {
    if (!file) return;

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Get user ID
      const userData = JSON.parse(
        localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
      );
      const currentUserId = userData.id || userId;

      if (!currentUserId) {
        alert("User ID not found. Please refresh the page.");
        return;
      }

      // Upload directly to S3
      const folder = `user-profiles/${currentUserId}/personal`;
      const { s3Url } = await uploadFileDirect(file, folder, file.name);

      // Store S3 URL instead of file object
      setFormData((prev) => ({ ...prev, [field]: s3Url }));

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
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
    };
    setOrganizations([...organizations, newOrg]);
    setSelectedOrgId(newOrg.id);
    setIsAddingNewOrg(true);
  };

  // Director/Partner management functions
  const addDirectorPartner = (orgId) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              directorsPartners: [
                ...(org.directorsPartners || []),
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
            }
          : org
      )
    );
  };

  const removeDirectorPartner = (orgId, id) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              directorsPartners: (org.directorsPartners || []).filter(
                (dp) => dp.id !== id
              ),
            }
          : org
      )
    );
  };

  const updateDirectorPartner = (orgId, id, field, value) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              directorsPartners: (org.directorsPartners || []).map((dp) =>
                dp.id === id ? { ...dp, [field]: value } : dp
              ),
            }
          : org
      )
    );
  };

  // Digital Signature management functions
  const addDigitalSignature = (orgId) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              digitalSignatures: [
                ...(org.digitalSignatures || []),
                {
                  id: Date.now(),
                  name: "",
                  dscNumber: "",
                  expiryDate: "",
                  status: "Active",
                },
              ],
            }
          : org
      )
    );
  };

  const removeDigitalSignature = (orgId, id) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              digitalSignatures: (org.digitalSignatures || []).filter(
                (ds) => ds.id !== id
              ),
            }
          : org
      )
    );
  };

  const updateDigitalSignature = (orgId, id, field, value) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              digitalSignatures: (org.digitalSignatures || []).map((ds) =>
                ds.id === id ? { ...ds, [field]: value } : ds
              ),
            }
          : org
      )
    );
  };

  const updateOrganization = (id, field, value) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === id ? { ...org, [field]: value } : org
      )
    );
  };

  const addWebsite = (orgId) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              websites: [
                ...(org.websites || []),
                {
                  id: Date.now(),
                  type: "",
                  url: "",
                  login: "",
                  password: "",
                  showPassword: false,
                },
              ],
            }
          : org
      )
    );
  };

  const removeWebsite = (orgId, websiteId) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              websites: (org.websites || []).filter((w) => w.id !== websiteId),
            }
          : org
      )
    );
  };

  const updateWebsite = (orgId, websiteId, field, value) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              websites: (org.websites || []).map((website) =>
                website.id === websiteId
                  ? { ...website, [field]: value }
                  : website
              ),
            }
          : org
      )
    );
  };

  const togglePasswordVisibility = (orgId, websiteId) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              websites: (org.websites || []).map((website) =>
                website.id === websiteId
                  ? { ...website, showPassword: !website.showPassword }
                  : website
              ),
            }
          : org
      )
    );
  };

  const addUserTask = async () => {
    if (!currentUserTask.title || !currentUserTask.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      setSaving(true);
      const updatedTasksList = [
        ...userTasksList,
        {
          id: Date.now(),
          date: currentUserTask.date,
          title: currentUserTask.title,
          description: currentUserTask.description,
          type: currentUserTask.type,
          createdAt: new Date().toISOString(),
        },
      ];

      const payload = {
        userTasks: JSON.stringify(updatedTasksList),
      };

      const response = await updateUsersPageData(payload);

      if (response.success) {
        setUserTasksList(updatedTasksList);
        setCurrentUserTask({ date: "", title: "", description: "", type: "" });
        setIsAddingUserTask(false);
        alert("Task saved successfully!");
        await loadUserData();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addAdminTask = async () => {
    if (!currentAdminTask.title || !currentAdminTask.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      setSaving(true);
      const updatedTasksList = [
        ...adminTasksList,
        {
          id: Date.now(),
          date: currentAdminTask.date,
          title: currentAdminTask.title,
          description: currentAdminTask.description,
          type: currentAdminTask.type,
          createdAt: new Date().toISOString(),
        },
      ];

      const payload = {
        adminTasks: JSON.stringify(updatedTasksList),
      };

      const response = await updateUsersPageData(payload);

      if (response.success) {
        setAdminTasksList(updatedTasksList);
        setCurrentAdminTask({ date: "", title: "", description: "", type: "" });
        setIsAddingAdminTask(false);
        alert("Task saved successfully!");
        await loadUserData();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTasks = async () => {
    try {
      console.log("💾 Saving Tasks...");
      setSaving(true);

      const payload = {
        adminTasks: JSON.stringify(adminTasksList),
        userTasks: JSON.stringify(userTasksList),
      };

      const response = await updateUsersPageData(payload);

      if (response.success) {
        alert("✅ Tasks saved successfully!");
        await loadUserData();
      }
    } catch (error) {
      console.error("❌ Error saving Tasks:", error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Section definitions
  const sections = [
    { id: "client-profile", label: "Basic details" },
    { id: "organisation-details", label: "My Company Details" },
    { id: "tasks", label: "Tasks" },
    { id: "notes", label: "Notes" },
  ];

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01334C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-2 mb-1">
          <button className="text-black">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-black">Profile</h1>
        </div>
        <p className="text-gray-500 text-sm ml-8 italic">Create your profile</p>
      </div>

      <div className="max-w-7xl mx-auto border border-gray-100 rounded-xl bg-white shadow-sm p-2">
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg overflow-hidden border border-gray-100"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-[16px] font-medium text-gray-800">
                  {section.label}
                </span>
                {expandedSection === section.id ? (
                  <FiChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Accordion Content */}
              {expandedSection === section.id && (
                <div className="border-t border-gray-100">
                  {section.id === "client-profile" && (
                    <ClientProfileContent
                      formData={formData}
                      userId={userId}
                      clientStatus={clientStatus}
                      saving={saving}
                      handleInputChange={handleInputChange}
                      handleFileChange={handleFileChange}
                      handleViewFile={handleViewFile}
                      handleSaveClientProfile={handleSaveClientProfile}
                    />
                  )}
                  {section.id === "organisation-details" && (
                    <OrganisationDetailsContent
                      organizations={organizations}
                      selectedOrgId={selectedOrgId}
                      setSelectedOrgId={setSelectedOrgId}
                      isAddingNewOrg={isAddingNewOrg}
                      setIsAddingNewOrg={setIsAddingNewOrg}
                      expandedOrgId={expandedOrgId}
                      setExpandedOrgId={setExpandedOrgId}
                      userId={userId}
                      saving={saving}
                      addOrganization={addOrganization}
                      updateOrganization={updateOrganization}
                      addDirectorPartner={addDirectorPartner}
                      removeDirectorPartner={removeDirectorPartner}
                      updateDirectorPartner={updateDirectorPartner}
                      addDigitalSignature={addDigitalSignature}
                      removeDigitalSignature={removeDigitalSignature}
                      updateDigitalSignature={updateDigitalSignature}
                      addWebsite={addWebsite}
                      removeWebsite={removeWebsite}
                      updateWebsite={updateWebsite}
                      togglePasswordVisibility={togglePasswordVisibility}
                      handleViewFile={handleViewFile}
                      handleSaveOrganisation={handleSaveOrganisation}
                    />
                  )}
                  {section.id === "tasks" && (
                    <TasksContent
                      adminTasksList={adminTasksList}
                      userTasksList={userTasksList}
                      expandedAdminTaskId={expandedAdminTaskId}
                      setExpandedAdminTaskId={setExpandedAdminTaskId}
                      expandedUserTaskId={expandedUserTaskId}
                      setExpandedUserTaskId={setExpandedUserTaskId}
                      isUserAdmin={isUserAdmin}
                      isAddingAdminTask={isAddingAdminTask}
                      setIsAddingAdminTask={setIsAddingAdminTask}
                      isAddingUserTask={isAddingUserTask}
                      setIsAddingUserTask={setIsAddingUserTask}
                      currentAdminTask={currentAdminTask}
                      setCurrentAdminTask={setCurrentAdminTask}
                      currentUserTask={currentUserTask}
                      setCurrentUserTask={setCurrentUserTask}
                      saving={saving}
                      addAdminTask={addAdminTask}
                      addUserTask={addUserTask}
                      handleSaveTasks={handleSaveTasks}
                    />
                  )}
                  {section.id === "notes" && (
                    <NotesContent
                      adminNotesList={adminNotesList}
                      userNotesList={userNotesList}
                      expandedAdminNoteId={expandedAdminNoteId}
                      setExpandedAdminNoteId={setExpandedAdminNoteId}
                      expandedUserNoteId={expandedUserNoteId}
                      setExpandedUserNoteId={setExpandedUserNoteId}
                      isAddingUserNote={isAddingUserNote}
                      setIsAddingUserNote={setIsAddingUserNote}
                      currentUserNote={currentUserNote}
                      setCurrentUserNote={setCurrentUserNote}
                      saving={saving}
                      handleUserNoteFileUpload={handleUserNoteFileUpload}
                      removeUserNoteAttachment={removeUserNoteAttachment}
                      handleSaveUserNote={handleSaveUserNote}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;
