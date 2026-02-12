import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../../utils/api";
import { updateUserDataByUserId } from "../../../utils/usersPageApi";
import { viewFile, uploadFileDirect } from "../../../utils/s3Upload";
import { FiChevronLeft } from "react-icons/fi";
import ClientProfileTab from "./client-overview/ClientProfileTab";
import ClientServicesTab from "./client-overview/ClientServicesTab";
import ClientComplianceTab from "./client-overview/ClientComplianceTab";
import ClientSubscriptionsTab from "./client-overview/ClientSubscriptionsTab";
import ClientTasksTab from "./client-overview/ClientTasksTab";
import ClientNotesTab from "./client-overview/ClientNotesTab";
import ClientPersonaNotepad from "./client-overview/ClientPersonaNotepad";
import ClientComplianceAssignmentTab from "./client-overview/ClientComplianceAssignmentTab";
import ClientAssignedComplianceTab from "./client-overview/ClientAssignedComplianceTab";
import PaymentMethodDialog from "./client-overview/PaymentMethodDialog";

function AdminClientOverview() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "services",
  ); // profile, services, compliance, subscriptions
  const orgIdFromQuery = searchParams.get("orgId");
  const [expandedSection, setExpandedSection] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [savingNotes, setSavingNotes] = useState(false);
  const [expandedOrgId, setExpandedOrgId] = useState(null);
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [activeOrgTab, setActiveOrgTab] = useState("organization-details");
  const [documentUrls, setDocumentUrls] = useState({});
  const [showNotepad, setShowNotepad] = useState(false);
  const [clientPersonaList, setClientPersonaList] = useState([]);
  const [expandedPersonaId, setExpandedPersonaId] = useState(null);
  const [isAddingPersona, setIsAddingPersona] = useState(false);
  const [currentPersona, setCurrentPersona] = useState({
    date: "",
    description: "",
  });
  const [adminNotesList, setAdminNotesList] = useState([]);
  const [userNotesList, setUserNotesList] = useState([]);
  const [selectedAdminNote, setSelectedAdminNote] = useState(null);
  const [selectedUserNote, setSelectedUserNote] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [currentNote, setCurrentNote] = useState({
    organizationId: "",
    date: "",
    description: "",
    attachments: [],
    adminActionItems: [""],
    clientActionItems: [""],
  });
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  // Tasks state
  const [adminTasksList, setAdminTasksList] = useState([]);
  const [userTasksList, setUserTasksList] = useState([]);
  const [selectedAdminTask, setSelectedAdminTask] = useState(null);
  const [selectedUserTask, setSelectedUserTask] = useState(null);
  const [isAddingAdminTask, setIsAddingAdminTask] = useState(false);
  const [_isAddingUserTask, setIsAddingUserTask] = useState(false);
  const [editingAdminTaskIndex, setEditingAdminTaskIndex] = useState(null);
  const [_editingUserTaskIndex] = useState(null);
  const [currentAdminTask, setCurrentAdminTask] = useState({
    date: "",
    title: "",
    description: "",
    type: "",
  });
  const [currentUserTask, setCurrentUserTask] = useState({
    date: "",
    title: "",
    description: "",
    type: "",
  });
  const [savingTasks, setSavingTasks] = useState(false);
  const [isServiceCardExpanded, setIsServiceCardExpanded] = useState(null); // Track which card index is expanded
  const [_serviceStatus, setServiceStatus] = useState("registered");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(null); // Track which card's dropdown is open (by index)
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    dateOfPayment: "",
    person: "",
    remark: "",
  });
  const [_visiblePasswords] = useState({});
  const [isEditingOrganisations, setIsEditingOrganisations] = useState(false);
  const [_isEditingWebsites, setIsEditingWebsites] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [savingOrg, setSavingOrg] = useState(false);
  const [_savingWebsites, setSavingWebsites] = useState(false);
  // Personal details editing state
  const [isEditingPersonalDetails, setIsEditingPersonalDetails] =
    useState(false);
  const [savingPersonalDetails, setSavingPersonalDetails] = useState(false);
  const [personalDetailsForm, setPersonalDetailsForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    dob: "",
    address_line1: "",
    business_address: "",
    customClientId: "",
    clientStatus: "",
  });
  // Document upload state
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState(null);

  const handleDeleteService = async (registration) => {
    if (!registration.ticket_id) return;
    const serviceName =
      registration.package_name ||
      registration.business_name ||
      registration.ticket_id;

    if (
      !window.confirm(
        `Are you sure you want to permanently delete this service?\n\nService: ${serviceName}\nTicket ID: ${registration.ticket_id}\n\nThis action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await apiClient.delete("/admin/delete-service", {
        body: JSON.stringify({ ticketId: registration.ticket_id }),
      });

      if (response.success) {
        setAllRegistrations((prev) =>
          prev.filter((r) => r.ticket_id !== registration.ticket_id),
        );
      } else {
        throw new Error(response.message || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  useEffect(() => {
    fetchClientDetails();
    fetchClientProfile();
    fetchClientPersona();
    fetchAllRegistrations();

    // Set active tab from URL params
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "profile",
        "services",
        "compliance",
        "compliance-assignment",
        "subscriptions",
        "organizations",
        "tasks",
        "notes",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [userId, searchParams]);

  // Auto-expand organization if orgId is in query params
  useEffect(() => {
    if (orgIdFromQuery && clientProfile?.user?.organisations) {
      const orgIndex = clientProfile.user.organisations.findIndex(
        (org) =>
          org.id === parseInt(orgIdFromQuery) ||
          org.id === orgIdFromQuery ||
          String(org.id) === String(orgIdFromQuery),
      );
      if (orgIndex !== -1) {
        setExpandedOrgId(orgIndex);
        if (activeTab !== "organizations") {
          setActiveTab("organizations");
        }
      }
    }
  }, [orgIdFromQuery, clientProfile, activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isStatusDropdownOpen !== null) {
        setIsStatusDropdownOpen(null);
      }
    };

    if (isStatusDropdownOpen !== null) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  const handleViewFile = async (fileData) => {
    await viewFile(fileData);
  };

  const handleUploadDocument = async (documentType, file) => {
    if (!file || !userId) {
      alert("Please select a file");
      return;
    }

    setUploadingDocument(true);
    setUploadDocumentType(documentType);
    try {
      // Upload directly to S3
      const folder = `user-profiles/${userId}/personal`;
      const { s3Url } = await uploadFileDirect(file, folder, file.name);

      // Save S3 URL to database using admin endpoint
      const response = await apiClient.post(
        `/users-page/upload-personal-document/${userId}`,
        {
          documentType: documentType,
          fileUrl: s3Url,
          fileName: file.name,
        },
      );

      if (response.success) {
        alert("Document uploaded successfully!");
        // Refresh client profile to show new document (this will also refresh document URLs)
        await fetchClientProfile();
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload document. Please try again.");
    } finally {
      setUploadingDocument(false);
      setUploadDocumentType(null);
    }
  };

  const handleFileInputChange = (documentType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload an image (JPG, PNG, GIF) or PDF");
      e.target.value = "";
      return;
    }

    handleUploadDocument(documentType, file);
    // Reset input
    e.target.value = "";
  };

  const fetchClientDetails = async () => {
    try {
      const response = await apiClient.get("/admin/clients");

      if (response.success) {
        const clientData = response.data.find((c) => c.user_id === userId);
        if (clientData) {
          setClient(clientData);
          // Load service status
          setServiceStatus(clientData.service_status || "registered");
        } else {
          console.error("Client not found");
          navigate("/admin/clients");
        }
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
      navigate("/admin/clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientProfile = async () => {
    try {
      const response = await apiClient.get(`/users-page/user-data/${userId}`);

      if (response.success && response.data) {
        setClientProfile(response.data);

        // Initialize organisations with websites included
        if (
          response.data.user?.organisations &&
          response.data.user.organisations.length > 0
        ) {
          setOrganisations(
            response.data.user.organisations.map((org, idx) => {
              // Parse websites from JSONB or use empty array
              let websites = [];
              if (org.websites) {
                try {
                  websites =
                    typeof org.websites === "string"
                      ? JSON.parse(org.websites)
                      : org.websites;
                } catch {
                  websites = [];
                }
              }

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
                incorporationDate: org.incorporation_date || "",
                panNumber: org.pan_number || "",
                panFile: org.pan_file || null,
                tan: org.tan || "",
                cin: org.cin || "",
                registeredAddress: org.registered_address || "",
                registeredAddressLine1:
                  org.registered_address_line1 ||
                  org.registered_address?.split(",")[0]?.trim() ||
                  "",
                registeredAddressLine2:
                  org.registered_address_line2 ||
                  org.registered_address
                    ?.split(",")
                    .slice(1)
                    .join(",")
                    .trim() ||
                  "",
                registeredAddressDistrict:
                  org.registered_address_district || "",
                registeredAddressState: org.registered_address_state || "",
                registeredAddressCountry:
                  org.registered_address_country || "India",
                registeredAddressPincode: org.registered_address_pincode || "",
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
                websites: websites.map((w, wIdx) => ({
                  id: w.id || wIdx + 1,
                  type: w.type || "",
                  url: w.url || "",
                  login: w.login || "",
                  password: w.password || "",
                  remarks: w.remarks || "",
                  showPassword: false,
                })),
              };
            }),
          );
        } else {
          setOrganisations([
            {
              id: 1,
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
            },
          ]);
        }

        // Keep separate websites state for backward compatibility but don't use it
        setWebsites([]);

        const adminNotesRaw = response.data.user?.admin_notes || "";

        // Parse admin notes (array of notes)
        try {
          const notesList = JSON.parse(adminNotesRaw);
          const normalizeNotes = (list) =>
            list.map((n) => ({
              ...n,
              adminActionItems: n.adminActionItems || [],
              clientActionItems: n.clientActionItems || [],
              attachments: n.attachments || [],
            }));
          if (Array.isArray(notesList)) {
            setAdminNotesList(normalizeNotes(notesList));
          } else if (notesList.note !== undefined) {
            setAdminNotesList(normalizeNotes([notesList]));
          } else if (adminNotesRaw) {
            setAdminNotesList(
              normalizeNotes([
                { date: "", description: adminNotesRaw, attachments: [] },
              ]),
            );
          }
        } catch {
          if (adminNotesRaw) {
            setAdminNotesList([
              {
                date: "",
                description: adminNotesRaw,
                attachments: [],
                adminActionItems: [],
                clientActionItems: [],
              },
            ]);
          }
        }

        // Parse user notes (array of notes)
        const userNotesRaw = response.data.user?.user_notes || "";
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

        // Parse admin tasks (array of tasks)
        const adminTasksRaw = response.data.user?.admin_tasks || "";
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
        const userTasksRaw = response.data.user?.user_tasks || "";
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

        // Fetch signed URLs for documents if they're S3 URLs
        await fetchDocumentSignedUrls(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching client profile:", error);
    }
  };

  const fetchClientPersona = async () => {
    try {
      const response = await apiClient.get(`/admin/client-persona/${userId}`);

      if (response.success && response.data) {
        // Parse personaList from response
        if (
          response.data.personaList &&
          Array.isArray(response.data.personaList)
        ) {
          setClientPersonaList(response.data.personaList);
        } else if (response.data.client_persona) {
          try {
            const parsed = JSON.parse(response.data.client_persona);
            if (Array.isArray(parsed)) {
              setClientPersonaList(parsed);
            } else {
              setClientPersonaList([
                {
                  date: new Date().toISOString().split("T")[0],
                  description: response.data.client_persona,
                },
              ]);
            }
          } catch {
            setClientPersonaList([
              {
                date: new Date().toISOString().split("T")[0],
                description: response.data.client_persona,
              },
            ]);
          }
        } else {
          setClientPersonaList([]);
        }
      }
    } catch (error) {
      console.error("Error fetching client persona:", error);
    }
  };

  const fetchAllRegistrations = async () => {
    try {
      console.log("🔍 Fetching all registrations for user ID:", userId);

      // Fetch private limited, proprietorship, startup india, GST, and all other services from registration_details
      const [
        privateLimitedResponse,
        proprietorshipResponse,
        startupIndiaResponse,
        gstResponse,
        allServicesResponse,
      ] = await Promise.all([
        apiClient
          .get(`/private-limited/user-registrations/${userId}`)
          .catch(() => ({ success: false, data: [] })),
        apiClient
          .get(`/proprietorship/user-registrations/${userId}`)
          .catch(() => ({ success: false, data: [] })),
        apiClient
          .get(`/startup-india/user-registrations/${userId}`)
          .catch(() => ({ success: false, data: [] })),
        apiClient
          .get(`/gst/user-registrations/${userId}`)
          .catch(() => ({ success: false, data: [] })),
        apiClient
          .get(`/admin/user-services/${userId}`)
          .catch(() => ({ success: false, data: [] })),
      ]);

      // Handle response structure - check if data is nested
      const privateLimited = privateLimitedResponse.success
        ? Array.isArray(privateLimitedResponse.data)
          ? privateLimitedResponse.data
          : privateLimitedResponse.data?.data || []
        : [];
      const proprietorship = proprietorshipResponse.success
        ? Array.isArray(proprietorshipResponse.data)
          ? proprietorshipResponse.data
          : proprietorshipResponse.data?.data || []
        : [];
      const startupIndia = startupIndiaResponse.success
        ? Array.isArray(startupIndiaResponse.data)
          ? startupIndiaResponse.data
          : startupIndiaResponse.data?.data || []
        : [];
      const gst = gstResponse.success
        ? Array.isArray(gstResponse.data)
          ? gstResponse.data
          : gstResponse.data?.data || []
        : [];
      const allServices = allServicesResponse.success
        ? Array.isArray(allServicesResponse.data)
          ? allServicesResponse.data
          : allServicesResponse.data?.data || []
        : [];

      console.log(
        "📊 Private Limited:",
        privateLimited.length,
        "registrations",
        privateLimited,
      );
      console.log(
        "📊 Proprietorship:",
        proprietorship.length,
        "registrations",
        proprietorship,
      );
      console.log(
        "📊 Startup India:",
        startupIndia.length,
        "registrations",
        startupIndia,
      );
      console.log("📊 GST:", gst.length, "registrations", gst);
      console.log(
        "📊 Generic Services:",
        allServices.length,
        "registrations",
        allServices,
      );

      // Include both paid and pending payment registrations
      // Show services that are either paid OR have pending payment status (created by admin with payment link)
      const filterServices = (r) => {
        // Paid services (has payment_id)
        const isPaid =
          (r.razorpay_payment_id &&
            String(r.razorpay_payment_id).trim() !== "") ||
          (r.payment_id && String(r.payment_id).trim() !== "") ||
          (r.payment_status &&
            String(r.payment_status).toLowerCase() === "paid");

        // Pending payment services (created by admin with payment link)
        // More lenient: show if payment_status is pending/unpaid and has ticket_id (admin created it)
        const isPendingPayment =
          r.ticket_id &&
          r.payment_status &&
          (String(r.payment_status).toLowerCase() === "pending" ||
            String(r.payment_status).toLowerCase() === "unpaid");

        const result = isPaid || isPendingPayment;

        // Debug logging for pending payments
        if (isPendingPayment && !isPaid) {
          console.log("🔍 Found pending payment service:", {
            ticket_id: r.ticket_id,
            payment_status: r.payment_status,
            service_status: r.service_status,
            user_id: r.user_id,
            package_name: r.package_name,
          });
        }

        return result;
      };

      // Filter generic services - also filter by userId to ensure we only get this client's services
      const filteredAllServices = allServices.filter((r) => {
        // First check if it belongs to this user
        const belongsToUser =
          r.user_id === userId || r.user_id === String(userId);
        if (!belongsToUser) return false;
        // Then apply the payment filter
        return filterServices(r);
      });

      // Combine, filter by userId, and sort by created_at
      // Also deduplicate by ticket_id to avoid showing the same service multiple times
      const allCombined = [
        ...privateLimited,
        ...proprietorship,
        ...startupIndia,
        ...gst,
        ...filteredAllServices,
      ];

      // Filter by userId and payment status, then deduplicate
      const filtered = allCombined.filter((r) => {
        // Ensure it belongs to this user
        const belongsToUser =
          r.user_id === userId || r.user_id === String(userId);
        if (!belongsToUser) {
          // Debug: log if service doesn't belong to user
          if (
            r.ticket_id &&
            (r.payment_status === "pending" || r.payment_status === "unpaid")
          ) {
            console.log("⚠️ Service filtered out (wrong user):", {
              ticket_id: r.ticket_id,
              service_user_id: r.user_id,
              target_user_id: userId,
              payment_status: r.payment_status,
            });
          }
          return false;
        }
        const passesFilter = filterServices(r);
        if (
          !passesFilter &&
          (r.payment_status === "pending" || r.payment_status === "unpaid")
        ) {
          console.log("⚠️ Service filtered out (filter failed):", {
            ticket_id: r.ticket_id,
            payment_status: r.payment_status,
            service_status: r.service_status,
            has_payment_id: !!(r.razorpay_payment_id || r.payment_id),
            has_ticket_id: !!r.ticket_id,
          });
        }
        return passesFilter;
      });

      // Deduplicate by ticket_id
      const seen = new Set();
      const unique = filtered.filter((r) => {
        const key = r.ticket_id || r.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const combined = unique.sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0),
      );

      setAllRegistrations(combined);
      console.log("📊 Total registrations for this user:", combined.length);
      console.log("📋 Registrations:", combined);
    } catch (error) {
      console.error("Error fetching all registrations:", error);
    }
  };

  const fetchDocumentSignedUrls = async (user) => {
    if (!user) return;

    try {
      // Fetch personal documents from the API (more reliable than user table fields)
      const personalDocsResponse = await apiClient
        .get(`/users-page/personal-documents/${userId}`)
        .catch(() => ({
          success: false,
          data: {},
        }));

      const urls = {};

      // Get URLs from personal documents API (preferred)
      if (personalDocsResponse.success && personalDocsResponse.data) {
        Object.keys(personalDocsResponse.data).forEach((docType) => {
          const docs = personalDocsResponse.data[docType];
          if (Array.isArray(docs) && docs.length > 0 && docs[0].url) {
            urls[docType] = docs[0].url;
          }
        });
      }

      // Fallback to user table fields if personal documents API doesn't have them
      const userTableDocs = {
        aadhar_card: user.aadhar_card,
        pan_card: user.pan_card,
        signature: user.signature,
      };

      for (const [key, url] of Object.entries(userTableDocs)) {
        // Only use user table field if we don't already have a URL from personal documents
        if (
          !urls[key] &&
          url &&
          typeof url === "string" &&
          url.trim().length > 0
        ) {
          urls[key] = url;
        }
      }

      // Process URLs to get signed URLs for S3 files
      for (const [key, url] of Object.entries(urls)) {
        if (
          url &&
          typeof url === "string" &&
          url.includes("s3.") &&
          url.includes(".amazonaws.com")
        ) {
          try {
            const response = await apiClient
              .post("/admin/get-signed-url", { s3Url: url })
              .catch(() => ({ success: false }));
            if (response.success && response.signedUrl) {
              urls[key] = response.signedUrl;
            }
            // If signed URL fails, keep original URL
          } catch {
            // Silently fail - keep original URL
            console.warn(
              `Could not get signed URL for ${key}, using original URL`,
            );
          }
        }
      }

      setDocumentUrls(urls);
    } catch (error) {
      console.error("Error fetching document URLs:", error);
      setDocumentUrls({});
    }
  };

  const handleNoteFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingAttachments(true);

    try {
      // Upload all files directly to S3
      const uploadPromises = files.map(async (file) => {
        try {
          const folder = `admin-notes/${userId}`;
          const { s3Url } = await uploadFileDirect(
            file,
            folder,
            `${Date.now()}-${file.name}`,
            (progress) => {
              // Progress tracking can be added here if needed
              console.log(`Upload progress for ${file.name}: ${progress}%`);
            },
          );

          return {
            name: file.name,
            url: s3Url,
            type: file.type,
            size: file.size,
          };
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          alert(`Failed to upload ${file.name}. Please try again.`);
          return null;
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFiles.filter((file) => file !== null);

      if (successfulUploads.length > 0) {
        setCurrentNote((prev) => ({
          ...prev,
          attachments: [...prev.attachments, ...successfulUploads],
        }));
      }

      // Reset file input
      if (e.target) {
        e.target.value = "";
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploadingAttachments(false);
    }
  };

  const removeNoteAttachment = (index) => {
    setCurrentNote((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== index),
    }));
  };

  const handleEditNote = (note, index) => {
    setCurrentNote({
      date: note.date,
      description: note.description,
      attachments: note.attachments || [],
      adminActionItems:
        note.adminActionItems && note.adminActionItems.length
          ? note.adminActionItems
          : [""],
      clientActionItems:
        note.clientActionItems && note.clientActionItems.length
          ? note.clientActionItems
          : [""],
    });
    setEditingNoteIndex(index);
    setIsAddingNote(true);
  };

  const handleDeleteNote = async (index) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      setSavingNotes(true);
      const updatedNotesList = adminNotesList.filter((_, idx) => idx !== index);

      const response = await apiClient.post("/admin/update-client-notes", {
        userId,
        adminNotes: JSON.stringify(updatedNotesList),
        userNotes: JSON.stringify(userNotesList),
      });

      if (response.success) {
        setAdminNotesList(updatedNotesList);
        alert("Note deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    } finally {
      setSavingNotes(false);
    }
  };

  // Task handling functions
  const handleEditTask = (task, index) => {
    setCurrentAdminTask({
      date: task.date || "",
      title: task.title || "",
      description: task.description || "",
      type: task.type || "",
    });
    setEditingAdminTaskIndex(index);
    setIsAddingAdminTask(true);
  };

  const handleDeleteTask = async (index) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      setSavingTasks(true);
      const updatedTasksList = adminTasksList.filter((_, idx) => idx !== index);

      const payload = {
        adminTasks: JSON.stringify(updatedTasksList),
        userTasks: JSON.stringify(userTasksList),
      };

      const response = await updateUserDataByUserId(userId, payload);

      if (response.success) {
        setAdminTasksList(updatedTasksList);
        setSelectedAdminTask(null);
        alert("Task deleted successfully!");
        await fetchClientProfile();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    } finally {
      setSavingTasks(false);
    }
  };

  const addAdminTask = async () => {
    if (!currentAdminTask.title || !currentAdminTask.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      setSavingTasks(true);
      let updatedTasksList;

      if (editingAdminTaskIndex !== null) {
        // Editing existing task
        updatedTasksList = adminTasksList.map((task, idx) =>
          idx === editingAdminTaskIndex
            ? {
                ...task,
                date: currentAdminTask.date,
                title: currentAdminTask.title,
                description: currentAdminTask.description,
                type: currentAdminTask.type,
              }
            : task,
        );
      } else {
        // Adding new task
        updatedTasksList = [
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
      }

      const payload = {
        adminTasks: JSON.stringify(updatedTasksList),
        userTasks: JSON.stringify(userTasksList),
      };

      const response = await updateUserDataByUserId(userId, payload);

      if (response.success) {
        setAdminTasksList(updatedTasksList);
        setCurrentAdminTask({ date: "", title: "", description: "", type: "" });
        setEditingAdminTaskIndex(null);
        setIsAddingAdminTask(false);
        alert("Task saved successfully!");
        await fetchClientProfile();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    } finally {
      setSavingTasks(false);
    }
  };

  const _addUserTask = async () => {
    if (!currentUserTask.title || !currentUserTask.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      setSavingTasks(true);
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
        adminTasks: JSON.stringify(adminTasksList),
        userTasks: JSON.stringify(updatedTasksList),
      };

      const response = await updateUserDataByUserId(userId, payload);

      if (response.success) {
        setUserTasksList(updatedTasksList);
        setCurrentUserTask({ date: "", title: "", description: "", type: "" });
        setIsAddingUserTask(false);
        alert("Task saved successfully!");
        await fetchClientProfile();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    } finally {
      setSavingTasks(false);
    }
  };

  const handleSaveTasks = async () => {
    try {
      setSavingTasks(true);

      const payload = {
        adminTasks: JSON.stringify(adminTasksList),
        userTasks: JSON.stringify(userTasksList),
      };

      const response = await updateUserDataByUserId(userId, payload);

      if (response.success) {
        alert("✅ Tasks saved successfully!");
        await fetchClientProfile();
      }
    } catch (error) {
      console.error("❌ Error saving Tasks:", error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingTasks(false);
    }
  };

  const handleSaveAdminNote = async () => {
    try {
      setSavingNotes(true);

      if (!currentNote.organizationId) {
        alert("Please select an organization for this note.");
        setSavingNotes(false);
        return;
      }

      let updatedNotesList;

      const cleanedAdmin = (currentNote.adminActionItems || []).filter(
        (t) => t && t.trim() !== "",
      );
      const cleanedClient = (currentNote.clientActionItems || []).filter(
        (t) => t && t.trim() !== "",
      );

      if (editingNoteIndex !== null) {
        // Update existing note
        updatedNotesList = adminNotesList.map((note, idx) =>
          idx === editingNoteIndex
            ? {
                ...note,
                organizationId:
                  currentNote.organizationId || note.organizationId || null,
                date: currentNote.date,
                description: currentNote.description,
                attachments: currentNote.attachments,
                adminActionItems: cleanedAdmin,
                clientActionItems: cleanedClient,
                updatedAt: new Date().toISOString(),
              }
            : note,
        );
      } else {
        // Add new note
        updatedNotesList = [
          ...adminNotesList,
          {
            id: Date.now(),
            organizationId: currentNote.organizationId || null,
            date: currentNote.date,
            description: currentNote.description,
            attachments: currentNote.attachments,
            adminActionItems: cleanedAdmin,
            clientActionItems: cleanedClient,
            createdAt: new Date().toISOString(),
          },
        ];
      }

      const response = await apiClient.post("/admin/update-client-notes", {
        userId,
        adminNotes: JSON.stringify(updatedNotesList),
        userNotes: JSON.stringify(userNotesList),
      });

      if (response.success) {
        setAdminNotesList(updatedNotesList);
        setCurrentNote({
          organizationId: "",
          date: "",
          description: "",
          attachments: [],
          adminActionItems: [""],
          clientActionItems: [""],
        });
        setIsAddingNote(false);
        setEditingNoteIndex(null);
        alert(
          editingNoteIndex !== null
            ? "Note updated successfully!"
            : "Note saved successfully!",
        );
      }
    } catch (error) {
      console.error("Error saving admin note:", error);
      alert("Failed to save note");
    } finally {
      setSavingNotes(false);
    }
  };

  // Organization handlers
  const addOrganization = () => {
    setOrganisations([
      ...organisations,
      {
        id: Date.now(),
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
      },
    ]);
  };

  const removeOrganization = (id) => {
    const updatedOrgs = organisations.filter((o) => o.id !== id);
    setOrganisations(updatedOrgs);

    // If no organizations left, exit edit mode
    if (updatedOrgs.length === 0) {
      setIsEditingOrganisations(false);
    }
  };

  const updateOrganization = (id, field, value) => {
    // Use functional update to ensure we always have the latest state
    setOrganisations((prevOrganisations) => {
      return prevOrganisations.map((org) => {
        if (org.id === id) {
          // Special handling for PIN code to ensure it's always a string and max 6 digits
          if (field === "registeredAddressPincode") {
            const pincodeValue = String(value || "")
              .replace(/\D/g, "")
              .slice(0, 6);
            return { ...org, [field]: pincodeValue };
          }
          return { ...org, [field]: value };
        }
        return org;
      });
    });
  };

  // Website handlers for organizations
  const addWebsiteToOrg = (orgId) => {
    setOrganisations(
      organisations.map((org) =>
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
                  remarks: "",
                  showPassword: false,
                },
              ],
            }
          : org,
      ),
    );
  };

  const removeWebsiteFromOrg = (orgId, websiteId) => {
    setOrganisations(
      organisations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              websites: (org.websites || []).filter((w) => w.id !== websiteId),
            }
          : org,
      ),
    );
  };

  const updateWebsiteInOrg = (orgId, websiteId, field, value) => {
    setOrganisations(
      organisations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              websites: (org.websites || []).map((website) =>
                website.id === websiteId
                  ? { ...website, [field]: value }
                  : website,
              ),
            }
          : org,
      ),
    );
  };

  const togglePasswordVisibilityInOrg = (orgId, websiteId) => {
    setOrganisations(
      organisations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              websites: (org.websites || []).map((website) =>
                website.id === websiteId
                  ? { ...website, showPassword: !website.showPassword }
                  : website,
              ),
            }
          : org,
      ),
    );
  };

  // Director/Partner management functions
  const addDirectorPartner = (orgId) => {
    setOrganisations(
      organisations.map((org) =>
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
          : org,
      ),
    );
  };

  const removeDirectorPartner = (orgId, id) => {
    setOrganisations(
      organisations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              directorsPartners: (org.directorsPartners || []).filter(
                (dp) => dp.id !== id,
              ),
            }
          : org,
      ),
    );
  };

  const updateDirectorPartner = (orgId, id, field, value) => {
    setOrganisations(
      organisations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              directorsPartners: (org.directorsPartners || []).map((dp) =>
                dp.id === id ? { ...dp, [field]: value } : dp,
              ),
            }
          : org,
      ),
    );
  };

  // Digital Signature management functions
  const addDigitalSignature = (orgId) => {
    setOrganisations(
      organisations.map((org) =>
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
          : org,
      ),
    );
  };

  const removeDigitalSignature = (orgId, id) => {
    setOrganisations(
      organisations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              digitalSignatures: (org.digitalSignatures || []).filter(
                (ds) => ds.id !== id,
              ),
            }
          : org,
      ),
    );
  };

  const updateDigitalSignature = (orgId, id, field, value) => {
    setOrganisations(
      organisations.map((org) =>
        org.id === orgId
          ? {
              ...org,
              digitalSignatures: (org.digitalSignatures || []).map((ds) =>
                ds.id === id ? { ...ds, [field]: value } : ds,
              ),
            }
          : org,
      ),
    );
  };

  const handleSaveOrganisations = async () => {
    try {
      setSavingOrg(true);

      const payload = {
        organisations: organisations.map((org) => ({
          organisationType: org.organisationType,
          legalName: org.legalName,
          tradeName: org.tradeName,
          category: org.category || "",
          gstin: org.gstin,
          incorporationDate: org.incorporationDate,
          panNumber: org.panNumber || "",
          panFile: org.panFile,
          tan: org.tan,
          cin: org.cin,
          registeredAddress: org.registeredAddress,
          registeredAddressLine1: org.registeredAddressLine1 || "",
          registeredAddressLine2: org.registeredAddressLine2 || "",
          registeredAddressDistrict: org.registeredAddressDistrict || "",
          registeredAddressState: org.registeredAddressState || "",
          registeredAddressCountry: org.registeredAddressCountry || "India",
          registeredAddressPincode: org.registeredAddressPincode || "",
          directorsPartners: (org.directorsPartners || []).filter(
            (dp) => dp.name || dp.dinNumber || dp.contact || dp.email,
          ),
          digitalSignatures: (org.digitalSignatures || []).filter(
            (ds) => ds.name || ds.dscNumber,
          ),
          optionalAttachment1: org.optionalAttachment1 || null,
          optionalAttachment2: org.optionalAttachment2 || null,
          websites: (org.websites || [])
            // keep rows that have any field filled or were explicitly added
            .filter((w) => w.type || w.url || w.login || w.password)
            .map((w) => ({
              type: w.type || "",
              url: w.url || "",
              login: w.login || "",
              password: w.password || "",
              remarks: w.remarks || "",
            })),
        })),
      };

      const response = await updateUserDataByUserId(userId, payload);

      if (response.success) {
        alert("✅ Organisation Details saved successfully!");
        setIsEditingOrganisations(false);
        setEditingOrgId(null);
        await fetchClientProfile();
      }
    } catch (error) {
      console.error("❌ Error saving Organisation:", error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingOrg(false);
    }
  };

  // Delete organization handler
  const handleDeleteOrganization = async (orgIndex) => {
    if (
      !confirm(
        "Are you sure you want to delete this organization? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setSavingOrg(true);

      // Get current organizations and remove the one at the specified index
      const currentOrgs = clientProfile.user?.organisations || [];
      const updatedOrgs = currentOrgs.filter((_, idx) => idx !== orgIndex);

      // Map to the expected format for the backend
      const payload = {
        organisations: updatedOrgs.map((org) => {
          // Parse websites if needed
          let websites = [];
          if (org.websites) {
            try {
              websites =
                typeof org.websites === "string"
                  ? JSON.parse(org.websites)
                  : org.websites;
            } catch {
              websites = [];
            }
          }

          return {
            organisationType: org.organisation_type || "",
            legalName: org.legal_name || "",
            tradeName: org.trade_name || "",
            gstin: org.gstin || "",
            incorporationDate: org.incorporation_date || "",
            panNumber: org.pan_number || "",
            panFile: org.pan_file || null,
            tan: org.tan || "",
            cin: org.cin || "",
            registeredAddress: org.registered_address || "",
            websites: (websites || []).map((w) => ({
              type: w.type || "",
              url: w.url || "",
              login: w.login || "",
              password: w.password || "",
              remarks: w.remarks || "",
            })),
          };
        }),
      };

      const response = await updateUserDataByUserId(userId, payload);

      if (response.success) {
        alert("✅ Organization deleted successfully!");
        setExpandedOrgId(null);
        await fetchClientProfile();
      }
    } catch (error) {
      console.error("❌ Error deleting organization:", error);
      alert(`❌ Failed to delete: ${error.message}`);
    } finally {
      setSavingOrg(false);
    }
  };

  // Website handlers
  const _addWebsite = () => {
    setWebsites([
      ...websites,
      {
        id: Date.now(),
        type: "",
        url: "",
        login: "",
        password: "",
        showPassword: false,
      },
    ]);
  };

  const _removeWebsite = (id) => {
    if (websites.length > 1) {
      setWebsites(websites.filter((w) => w.id !== id));
    }
  };

  const _updateWebsite = (id, field, value) => {
    setWebsites(
      websites.map((website) =>
        website.id === id ? { ...website, [field]: value } : website,
      ),
    );
  };

  const _togglePasswordVisibility = (id) => {
    setWebsites(
      websites.map((website) =>
        website.id === id
          ? { ...website, showPassword: !website.showPassword }
          : website,
      ),
    );
  };

  const _handleSaveWebsites = async () => {
    try {
      setSavingWebsites(true);

      const payload = {
        websites: websites.map((w) => ({
          type: w.type,
          url: w.url,
          login: w.login,
          password: w.password,
          remarks: w.remarks || "",
        })),
      };

      const response = await updateUserDataByUserId(userId, payload);

      if (response.success) {
        alert("✅ Website Details saved successfully!");
        setIsEditingWebsites(false);
        await fetchClientProfile();
      }
    } catch (error) {
      console.error("❌ Error saving Websites:", error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingWebsites(false);
    }
  };

  // Personal details handlers
  const handleEditPersonalDetails = () => {
    // Initialize form with current values
    setPersonalDetailsForm({
      name: clientProfile?.user?.name || "",
      email: clientProfile?.user?.email || "",
      whatsapp: clientProfile?.user?.whatsapp || "",
      dob: clientProfile?.user?.dob || "",
      address_line1: clientProfile?.user?.address_line1 || "",
      business_address: clientProfile?.user?.business_address || "",
      customClientId: clientProfile?.user?.custom_client_id || "",
      clientStatus: clientProfile?.user?.client_status || "Active",
    });
    setIsEditingPersonalDetails(true);
  };

  const handleSavePersonalDetails = async () => {
    try {
      setSavingPersonalDetails(true);

      // Backend expects data in clientProfile format
      const payload = {
        clientProfile: {
          name: personalDetailsForm.name,
          email: personalDetailsForm.email,
          whatsapp: personalDetailsForm.whatsapp,
          dob: personalDetailsForm.dob,
          address: personalDetailsForm.address_line1,
          businessAddress: personalDetailsForm.business_address,
          customClientId: personalDetailsForm.customClientId || null,
          clientStatus: personalDetailsForm.clientStatus || "Active",
        },
      };

      const response = await updateUserDataByUserId(userId, payload);

      if (response.success) {
        alert("✅ Personal details saved successfully!");
        setIsEditingPersonalDetails(false);
        await fetchClientProfile();
      }
    } catch (error) {
      console.error("❌ Error saving personal details:", error);
      alert(`❌ Failed to save: ${error.message}`);
    } finally {
      setSavingPersonalDetails(false);
    }
  };

  const handleSaveClientPersona = async () => {
    try {
      setSavingNotes(true);

      const response = await apiClient.post("/admin/update-client-persona", {
        userId,
        personaList: JSON.stringify(clientPersonaList),
      });

      if (response.success) {
        alert("Client persona saved successfully!");
        setShowNotepad(false);
        await fetchClientPersona();
      }
    } catch (error) {
      console.error("Error saving client persona:", error);
      alert("Failed to save client persona");
    } finally {
      setSavingNotes(false);
    }
  };

  const addPersonaEntry = () => {
    if (!currentPersona.description || !currentPersona.description.trim()) {
      alert("Please enter a description");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: currentPersona.date || new Date().toISOString().split("T")[0],
      description: currentPersona.description,
      createdAt: new Date().toISOString(),
    };

    setClientPersonaList([...clientPersonaList, newEntry]);
    setCurrentPersona({ date: "", description: "" });
    setIsAddingPersona(false);
  };

  const removePersonaEntry = (index) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    const updatedList = clientPersonaList.filter((_, idx) => idx !== index);
    setClientPersonaList(updatedList);
  };

  const handleUpdateServiceStatus = async (newStatus, ticketId) => {
    try {
      if (!ticketId) {
        alert("Ticket ID is required to update status");
        return;
      }

      // Find the registration to check payment status
      const registration = allRegistrations.find(
        (r) => r.ticket_id === ticketId,
      );
      if (!registration) {
        alert("Registration not found");
        return;
      }

      // Check if payment is pending and status is being changed from "Payment pending"
      const currentStatus = (registration.service_status || "")
        .toLowerCase()
        .trim();
      const isPaymentPending =
        currentStatus === "payment pending" ||
        (registration.payment_status &&
          (registration.payment_status.toLowerCase() === "pending" ||
            registration.payment_status.toLowerCase() === "unpaid"));
      const hasPaymentId = !!registration.razorpay_payment_id;
      const isChangingFromPending =
        isPaymentPending &&
        newStatus.toLowerCase().trim() !== "Payment pending";

      // If payment is pending and trying to change status, show payment method dialog
      if (isChangingFromPending && !hasPaymentId) {
        setPendingStatusUpdate({ newStatus, ticketId });
        setShowPaymentMethodDialog(true);
        return;
      }

      // If already paid (has payment ID) or not changing from pending, proceed with status update
      await performStatusUpdate(newStatus, ticketId, null);
    } catch (error) {
      console.error("Error updating service status:", error);
      const errorMessage =
        error.message || error.response?.data?.message || "Unknown error";
      alert("Failed to update status: " + errorMessage);
    }
  };

  const handlePaymentMethodSelection = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    // Don't close the dialog, show the form instead
  };

  const handlePaymentFormSubmit = async () => {
    if (!pendingStatusUpdate || !selectedPaymentMethod) return;

    // Validate required fields
    if (!paymentFormData.dateOfPayment || !paymentFormData.person) {
      alert("Please fill in Date of Payment and Person fields");
      return;
    }

    const { newStatus, ticketId } = pendingStatusUpdate;
    try {
      await performStatusUpdate(
        newStatus,
        ticketId,
        selectedPaymentMethod,
        paymentFormData,
      );
      // Reset form and close dialog
      setShowPaymentMethodDialog(false);
      setPendingStatusUpdate(null);
      setSelectedPaymentMethod(null);
      setPaymentFormData({
        dateOfPayment: "",
        person: "",
        remark: "",
      });
    } catch (error) {
      console.error("Error updating status with payment method:", error);
      const errorMessage =
        error.message || error.response?.data?.message || "Unknown error";
      alert("Failed to update status: " + errorMessage);
    }
  };

  const performStatusUpdate = async (
    newStatus,
    ticketId,
    paymentMethod,
    paymentDetails = null,
  ) => {
    try {
      const payload = {
        ticketId,
        status: newStatus,
        ...(paymentMethod && { paymentMethod }),
        ...(paymentDetails && {
          dateOfPayment: paymentDetails.dateOfPayment,
          person: paymentDetails.person,
          remark: paymentDetails.remark,
        }),
      };

      const response = await apiClient.post(
        "/admin/update-service-status",
        payload,
      );

      console.log("📝 Update status response:", response);

      if (response.success) {
        // Refresh the client data and registrations to show updated status
        await fetchAllRegistrations();
        fetchClientProfile();
        console.log("✅ Service status updated:", newStatus);
      } else {
        // Check if it requires payment method
        if (response.requiresPaymentMethod) {
          setPendingStatusUpdate({ newStatus, ticketId });
          setShowPaymentMethodDialog(true);
        } else {
          throw new Error(response.message || "Failed to update status");
        }
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      const errorMessage =
        error.message || error.response?.data?.message || "Unknown error";

      // Check if it's a database column error
      if (
        errorMessage.includes("service_status") &&
        errorMessage.includes("column")
      ) {
        alert(
          "The service_status column does not exist in the database. Please run the migration SQL first. See backend/migrations/add_service_status_column.sql",
        );
      } else if (error.response?.data?.requiresPaymentMethod) {
        // Backend is asking for payment method
        setPendingStatusUpdate({ newStatus, ticketId });
        setShowPaymentMethodDialog(true);
      } else {
        alert("Failed to update status: " + errorMessage);
      }
      throw error;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      let date;

      // Handle different date string formats
      if (typeof dateString === "string") {
        // If it's a space-separated date-time without timezone (e.g., "2025-12-09 10:56:00")
        // PostgreSQL/Supabase stores timestamps in UTC, but when returned as string without timezone,
        // we need to parse it correctly
        if (
          dateString.includes(" ") &&
          !dateString.includes("Z") &&
          !dateString.includes("+") &&
          !dateString.match(/[+-]\d{2}:\d{2}$/)
        ) {
          // Replace space with T for ISO format, then add Z to treat as UTC
          const isoString = dateString.replace(" ", "T");
          // Parse as UTC (since database stores in UTC)
          date = new Date(isoString + "Z");
        } else if (
          dateString.includes("T") &&
          !dateString.includes("Z") &&
          !dateString.includes("+") &&
          !dateString.match(/[+-]\d{2}:\d{2}$/)
        ) {
          // ISO format without timezone, treat as UTC
          date = new Date(dateString + "Z");
        } else {
          // Has timezone info, parse normally
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) return "-";

      // Format in IST (Asia/Kolkata timezone)
      const datePart = date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      });

      const timePart = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

      return `${datePart}, ${timePart}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "-";
    try {
      let date;

      // Handle different date string formats
      if (typeof dateString === "string") {
        // For date-only fields, extract just the date part (YYYY-MM-DD)
        if (dateString.includes(" ")) {
          // If it has time, extract just the date part
          date = new Date(dateString.split(" ")[0] + "T00:00:00Z");
        } else if (dateString.includes("T")) {
          // ISO format, extract date part
          date = new Date(dateString.split("T")[0] + "T00:00:00Z");
        } else {
          // Pure date string (YYYY-MM-DD)
          date = new Date(dateString + "T00:00:00Z");
        }
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) return "-";

      // Format only the date part in IST (Asia/Kolkata timezone)
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const _getStatusBadge = (client) => {
    if (client.team_fill_requested) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Team Fill Requested
        </span>
      );
    } else if (client.registration_submitted) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Registered
        </span>
      );
    } else if (client.payment_completed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Payment Done
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          New
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-gray-600">Client not found</p>
          <button
            onClick={() => navigate("/admin/clients")}
            className="mt-4 px-4 py-2 bg-[#00486D] text-white rounded-md hover:bg-[#01334C]"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
      {/* Header with Back Button */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => navigate("/admin/clients")}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {client?.name || "Client Details"}
          </h1>
        </div>
        <p className="text-gray-500 italic ml-9">
          View and manage client profile, services, and documents
        </p>
      </div>

      {/* Top Tabs Navigation */}
      <div className="bg-white rounded-2xl p-4 md:p-6 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {[
            { key: "profile", label: "Profile" },
            {
              key: "services",
              label: "Services",
              count: allRegistrations.length,
            },
            { key: "compliance", label: "Compliance" },
            { key: "compliance-assignment", label: "Add/Assign Compliance" },
            { key: "assigned-compliance", label: "Assigned Compliance" },
            { key: "subscriptions", label: "Subscriptions" },
            { key: "tasks", label: "Tasks" },
            { key: "notes", label: "Notes" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                activeTab === tab.key
                  ? {
                      background:
                        "linear-gradient(180deg, #022B51 0%, #015079 100%)",
                    }
                  : {}
              }
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-[#00486D] text-white"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && clientProfile && (
        <ClientProfileTab
          clientProfile={clientProfile}
          userId={userId}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
          isEditingPersonalDetails={isEditingPersonalDetails}
          setIsEditingPersonalDetails={setIsEditingPersonalDetails}
          personalDetailsForm={personalDetailsForm}
          setPersonalDetailsForm={setPersonalDetailsForm}
          savingPersonalDetails={savingPersonalDetails}
          handleEditPersonalDetails={handleEditPersonalDetails}
          handleSavePersonalDetails={handleSavePersonalDetails}
          documentUrls={documentUrls}
          handleViewFile={handleViewFile}
          handleFileInputChange={handleFileInputChange}
          uploadingDocument={uploadingDocument}
          uploadDocumentType={uploadDocumentType}
          organisations={organisations}
          setOrganisations={setOrganisations}
          isEditingOrganisations={isEditingOrganisations}
          setIsEditingOrganisations={setIsEditingOrganisations}
          expandedOrgId={expandedOrgId}
          setExpandedOrgId={setExpandedOrgId}
          editingOrgId={editingOrgId}
          setEditingOrgId={setEditingOrgId}
          activeOrgTab={activeOrgTab}
          setActiveOrgTab={setActiveOrgTab}
          savingOrg={savingOrg}
          addOrganization={addOrganization}
          removeOrganization={removeOrganization}
          updateOrganization={updateOrganization}
          handleSaveOrganisations={handleSaveOrganisations}
          handleDeleteOrganization={handleDeleteOrganization}
          addWebsiteToOrg={addWebsiteToOrg}
          removeWebsiteFromOrg={removeWebsiteFromOrg}
          updateWebsiteInOrg={updateWebsiteInOrg}
          togglePasswordVisibilityInOrg={togglePasswordVisibilityInOrg}
          addDirectorPartner={addDirectorPartner}
          removeDirectorPartner={removeDirectorPartner}
          updateDirectorPartner={updateDirectorPartner}
          addDigitalSignature={addDigitalSignature}
          removeDigitalSignature={removeDigitalSignature}
          updateDigitalSignature={updateDigitalSignature}
          navigate={navigate}
          formatDateOnly={formatDateOnly}
          fetchClientProfile={fetchClientProfile}
        />
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <ClientServicesTab
          allRegistrations={allRegistrations}
          userId={userId}
          navigate={navigate}
          isServiceCardExpanded={isServiceCardExpanded}
          setIsServiceCardExpanded={setIsServiceCardExpanded}
          isStatusDropdownOpen={isStatusDropdownOpen}
          setIsStatusDropdownOpen={setIsStatusDropdownOpen}
          handleUpdateServiceStatus={handleUpdateServiceStatus}
          handleDeleteService={handleDeleteService}
          formatDate={formatDate}
          apiClient={apiClient}
        />
      )}

      {/* Compliance Tab */}
      {activeTab === "compliance" && <ClientComplianceTab />}

      {/* Compliance Assignment Tab */}
      {activeTab === "compliance-assignment" && (
        <ClientComplianceAssignmentTab userId={userId} />
      )}

      {/* Assigned Compliance Tab */}
      {activeTab === "assigned-compliance" && (
        <ClientAssignedComplianceTab userId={userId} />
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <ClientSubscriptionsTab allRegistrations={allRegistrations} />
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <ClientTasksTab
          adminTasksList={adminTasksList}
          userTasksList={userTasksList}
          isAddingAdminTask={isAddingAdminTask}
          setIsAddingAdminTask={setIsAddingAdminTask}
          editingAdminTaskIndex={editingAdminTaskIndex}
          setEditingAdminTaskIndex={setEditingAdminTaskIndex}
          currentAdminTask={currentAdminTask}
          setCurrentAdminTask={setCurrentAdminTask}
          savingTasks={savingTasks}
          addAdminTask={addAdminTask}
          handleEditTask={handleEditTask}
          handleDeleteTask={handleDeleteTask}
          handleSaveTasks={handleSaveTasks}
          selectedAdminTask={selectedAdminTask}
          setSelectedAdminTask={setSelectedAdminTask}
          selectedUserTask={selectedUserTask}
          setSelectedUserTask={setSelectedUserTask}
        />
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <ClientNotesTab
          adminNotesList={adminNotesList}
          userNotesList={userNotesList}
          isAddingNote={isAddingNote}
          setIsAddingNote={setIsAddingNote}
          editingNoteIndex={editingNoteIndex}
          setEditingNoteIndex={setEditingNoteIndex}
          currentNote={currentNote}
          setCurrentNote={setCurrentNote}
          savingNotes={savingNotes}
          handleSaveAdminNote={handleSaveAdminNote}
          handleEditNote={handleEditNote}
          handleDeleteNote={handleDeleteNote}
          handleNoteFileUpload={handleNoteFileUpload}
          removeNoteAttachment={removeNoteAttachment}
          uploadingAttachments={uploadingAttachments}
          organisations={organisations}
          selectedAdminNote={selectedAdminNote}
          setSelectedAdminNote={setSelectedAdminNote}
          selectedUserNote={selectedUserNote}
          setSelectedUserNote={setSelectedUserNote}
          handleViewFile={handleViewFile}
        />
      )}

      {/* Floating Notepad Button - Admin Only */}
      {activeTab === "profile" && (
        <>
          <button
            onClick={() => setShowNotepad(!showNotepad)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#00486D] text-white rounded-full shadow-lg hover:bg-[#01334C] transition-all duration-300 flex items-center justify-center z-[9998] hover:scale-110"
            title="Quick Notes"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Notepad Modal */}
          {showNotepad && (
            <ClientPersonaNotepad
              setShowNotepad={setShowNotepad}
              clientPersonaList={clientPersonaList}
              expandedPersonaId={expandedPersonaId}
              setExpandedPersonaId={setExpandedPersonaId}
              isAddingPersona={isAddingPersona}
              setIsAddingPersona={setIsAddingPersona}
              currentPersona={currentPersona}
              setCurrentPersona={setCurrentPersona}
              addPersonaEntry={addPersonaEntry}
              removePersonaEntry={removePersonaEntry}
              handleSaveClientPersona={handleSaveClientPersona}
              fetchClientPersona={fetchClientPersona}
              savingNotes={savingNotes}
            />
          )}
        </>
      )}

      {/* Payment Method Selection Dialog */}
      {showPaymentMethodDialog && (
        <PaymentMethodDialog
          showPaymentMethodDialog={showPaymentMethodDialog}
          setShowPaymentMethodDialog={setShowPaymentMethodDialog}
          pendingStatusUpdate={pendingStatusUpdate}
          setPendingStatusUpdate={setPendingStatusUpdate}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          paymentFormData={paymentFormData}
          setPaymentFormData={setPaymentFormData}
          handlePaymentMethodSelection={handlePaymentMethodSelection}
          handlePaymentFormSubmit={handlePaymentFormSubmit}
        />
      )}
    </div>
  );
}

export default AdminClientOverview;
