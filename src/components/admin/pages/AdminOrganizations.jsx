import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../../utils/api";
import { updateUserDataByUserId } from "../../../utils/usersPageApi";
import { uploadFileDirect, viewFile } from "../../../utils/s3Upload";
import logo from "../../../assets/logo.png";
import { BsBuilding, BsCalendar3 } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEye, FiEyeOff } from "react-icons/fi";

function AdminOrganizations() {
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
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Organization form state
  const [newOrganization, setNewOrganization] = useState({
    organisationType: '',
    legalName: '',
    tradeName: '',
    category: '',
    gstin: '',
    incorporationDate: '',
    panFile: null,
    tan: '',
    cin: '',
    registeredAddress: '',
    directorsPartners: [],
    digitalSignatures: [],
    optionalAttachment1: null,
    optionalAttachment2: null,
    websites: []
  });

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const response = await apiClient.get('/admin/clients');
      if (response.success && response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (clientFilter) params.clientFilter = clientFilter;

      const response = await apiClient.get('/admin/organizations', { params });
      if (response.success && response.data) {
        setOrganizations(response.data);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, clientFilter]);

  useEffect(() => {
    loadClients();
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleEditOrganization = () => {
    if (!selectedOrg) return;
    // Create a copy with all fields initialized
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
        id: w.id || (idCounter++),
        remarks: w.remarks || '',
        showPassword: w.showPassword || false
      }))
    };
    setEditingOrg(orgToEdit);
  };

  const updateOrganizationField = (field, value) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      [field]: value
    };
    setEditingOrg(updatedOrg);
  };

  const addDirectorPartner = () => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      directorsPartners: [...(editingOrg.directorsPartners || []), {
        id: Date.now(),
        name: '',
        dinNumber: '',
        contact: '',
        email: '',
        dateOfAddition: '',
        status: 'Active'
      }]
    };
    setEditingOrg(updatedOrg);
  };

  const removeDirectorPartner = (id) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      directorsPartners: (editingOrg.directorsPartners || []).filter(dp => dp.id !== id)
    };
    setEditingOrg(updatedOrg);
  };

  const updateDirectorPartner = (id, field, value) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      directorsPartners: (editingOrg.directorsPartners || []).map(dp =>
        dp.id === id ? { ...dp, [field]: value } : dp
      )
    };
    setEditingOrg(updatedOrg);
  };

  const addDigitalSignature = () => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      digitalSignatures: [...(editingOrg.digitalSignatures || []), {
        id: Date.now(),
        name: '',
        dscNumber: '',
        expiryDate: '',
        status: 'Active'
      }]
    };
    setEditingOrg(updatedOrg);
  };

  const removeDigitalSignature = (id) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      digitalSignatures: (editingOrg.digitalSignatures || []).filter(ds => ds.id !== id)
    };
    setEditingOrg(updatedOrg);
  };

  const updateDigitalSignature = (id, field, value) => {
    if (!editingOrg) return;
    const updatedOrg = {
      ...editingOrg,
      digitalSignatures: (editingOrg.digitalSignatures || []).map(ds =>
        ds.id === id ? { ...ds, [field]: value } : ds
      )
    };
    setEditingOrg(updatedOrg);
  };

  const handleSaveOrganization = async () => {
    if (!editingOrg || !selectedOrgUserId) return;
    
    // Validate that at least one required field is filled
    const hasLegalName = editingOrg.legalName && editingOrg.legalName.trim() !== '' && editingOrg.legalName !== '-';
    const hasTradeName = editingOrg.tradeName && editingOrg.tradeName.trim() !== '' && editingOrg.tradeName !== '-';
    const hasGstin = editingOrg.gstin && editingOrg.gstin.trim() !== '' && editingOrg.gstin !== '-';
    
    if (!hasLegalName && !hasTradeName && !hasGstin) {
      alert('⚠️ Please fill at least one of the following: Legal Name, Trade Name, or GST Number');
      return;
    }

    try {
      setSavingOrg(true);
      
      // Get existing organizations for this client
      const userDataResponse = await apiClient.get(`/users-page/user-data/${selectedOrgUserId}`).catch(() => ({
        success: false,
        data: { organisations: [] }
      }));

      let existingOrgs = [];
      if (userDataResponse.success && userDataResponse.data?.organisations) {
        existingOrgs = userDataResponse.data.organisations;
      }

      // Update the specific organization
      const updatedOrgs = existingOrgs.map((org) => {
        // Match by ID or by key fields
        const matches = (org.id === editingOrg.id) || 
                       (String(org.id) === String(editingOrg.id)) ||
                       (org.legal_name === selectedOrg.legalName && org.gstin === selectedOrg.gstin);
        
        if (matches) {
          return {
            organisationType: editingOrg.organisationType !== '-' ? editingOrg.organisationType : '',
            legalName: editingOrg.legalName !== '-' ? editingOrg.legalName : '',
            tradeName: editingOrg.tradeName !== '-' ? editingOrg.tradeName : '',
            category: editingOrg.category !== '-' ? editingOrg.category : '',
            gstin: editingOrg.gstin !== '-' ? editingOrg.gstin : '',
            incorporationDate: editingOrg.incorporationDate !== '-' ? editingOrg.incorporationDate : '',
            panFile: editingOrg.panFile,
            tan: editingOrg.tan !== '-' ? editingOrg.tan : '',
            cin: editingOrg.cin !== '-' ? editingOrg.cin : '',
            registeredAddress: editingOrg.registeredAddress !== '-' ? editingOrg.registeredAddress : '',
            directorsPartners: (editingOrg.directorsPartners || []).filter(dp => 
              dp.name || dp.dinNumber || dp.contact || dp.email
            ),
            digitalSignatures: (editingOrg.digitalSignatures || []).filter(ds => 
              ds.name || ds.dscNumber
            ),
            optionalAttachment1: editingOrg.optionalAttachment1 || null,
            optionalAttachment2: editingOrg.optionalAttachment2 || null,
            websites: (editingOrg.websites || []).filter(w => w.url && w.url.trim() !== '').map(w => ({
              type: w.type,
              url: w.url,
              login: w.login,
              password: w.password,
              remarks: w.remarks || ''
            }))
          };
        }
        return org;
      });

      // Save using updateUserDataByUserId
      const payload = {
        organisations: updatedOrgs
      };

      const response = await updateUserDataByUserId(selectedOrgUserId, payload);

      if (response.success) {
        alert('✅ Organization updated successfully!');
        // Update selectedOrg with edited data
        setSelectedOrg(editingOrg);
        setEditingOrg(null);
        // Reload organizations list
        loadOrganizations();
      } else {
        throw new Error(response.message || 'Failed to save organization');
      }
    } catch (error) {
      console.error('❌ Error saving organization:', error);
      alert(`❌ Failed to save: ${error.message || 'Unknown error'}`);
    } finally {
      setSavingOrg(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return '-';
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrg || !selectedOrgUserId) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this organization?\n\n` +
      `Organization: ${selectedOrg.legalName !== '-' ? selectedOrg.legalName : selectedOrg.tradeName}\n` +
      `This will permanently delete the organization and all associated files from S3.\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setSavingOrg(true);
      
      // Call the delete endpoint
      const response = await apiClient.delete(
        `/admin/organizations/${selectedOrg.id}?userId=${selectedOrgUserId}`
      );

      if (response.success) {
        alert('✅ Organization deleted successfully!');
        // Clear selected org and go back to list
        setSelectedOrg(null);
        setEditingOrg(null);
        setSelectedOrgUserId(null);
        // Reload organizations list
        loadOrganizations();
      } else {
        alert(`❌ Failed to delete: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting organization:', error);
      alert(`❌ Failed to delete: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setSavingOrg(false);
    }
  };

  const handleAddOrganization = () => {
    setIsAddingOrg(true);
    setSelectedOrg(null); // Clear any selected org view
    setEditingOrg(null); // Clear any editing org
    // Reset form
    setNewOrganization({
      organisationType: '',
      legalName: '',
      tradeName: '',
      category: '',
      gstin: '',
      incorporationDate: '',
      panFile: null,
      tan: '',
      cin: '',
      registeredAddress: '',
      directorsPartners: [],
      digitalSignatures: [],
      optionalAttachment1: null,
      optionalAttachment2: null,
      websites: []
    });
    setSelectedClient(null);
  };

  const updateNewOrganizationField = (field, value) => {
    setNewOrganization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNewDirectorPartner = () => {
    setNewOrganization(prev => ({
      ...prev,
      directorsPartners: [...(prev.directorsPartners || []), {
        id: Date.now(),
        name: '',
        dinNumber: '',
        contact: '',
        email: '',
        dateOfAddition: '',
        status: 'Active'
      }]
    }));
  };

  const removeNewDirectorPartner = (id) => {
    setNewOrganization(prev => ({
      ...prev,
      directorsPartners: (prev.directorsPartners || []).filter(dp => dp.id !== id)
    }));
  };

  const updateNewDirectorPartner = (id, field, value) => {
    setNewOrganization(prev => ({
      ...prev,
      directorsPartners: (prev.directorsPartners || []).map(dp =>
        dp.id === id ? { ...dp, [field]: value } : dp
      )
    }));
  };

  const addNewDigitalSignature = () => {
    setNewOrganization(prev => ({
      ...prev,
      digitalSignatures: [...(prev.digitalSignatures || []), {
        id: Date.now(),
        name: '',
        dscNumber: '',
        expiryDate: '',
        status: 'Active'
      }]
    }));
  };

  const removeNewDigitalSignature = (id) => {
    setNewOrganization(prev => ({
      ...prev,
      digitalSignatures: (prev.digitalSignatures || []).filter(ds => ds.id !== id)
    }));
  };

  const updateNewDigitalSignature = (id, field, value) => {
    setNewOrganization(prev => ({
      ...prev,
      digitalSignatures: (prev.digitalSignatures || []).map(ds =>
        ds.id === id ? { ...ds, [field]: value } : ds
      )
    }));
  };

  const addNewWebsite = () => {
    setNewOrganization(prev => ({
      ...prev,
      websites: [...(prev.websites || []), {
        id: Date.now(),
        type: '',
        url: '',
        login: '',
        password: '',
        remarks: '',
        showPassword: false
      }]
    }));
  };

  const removeNewWebsite = (id) => {
    setNewOrganization(prev => ({
      ...prev,
      websites: (prev.websites || []).filter(w => w.id !== id)
    }));
  };

  const updateNewWebsite = (id, field, value) => {
    setNewOrganization(prev => ({
      ...prev,
      websites: (prev.websites || []).map(w =>
        w.id === id ? { ...w, [field]: value } : w
      )
    }));
  };

  const toggleNewPasswordVisibility = (id) => {
    setNewOrganization(prev => ({
      ...prev,
      websites: (prev.websites || []).map(w =>
        w.id === id ? { ...w, showPassword: !w.showPassword } : w
      )
    }));
  };

  const handleSaveNewOrganization = async () => {
    // Validate that at least one required field is filled
    const hasLegalName = newOrganization.legalName && newOrganization.legalName.trim() !== '';
    const hasTradeName = newOrganization.tradeName && newOrganization.tradeName.trim() !== '';
    const hasGstin = newOrganization.gstin && newOrganization.gstin.trim() !== '';
    
    if (!hasLegalName && !hasTradeName && !hasGstin) {
      alert('⚠️ Please fill at least one of the following: Legal Name, Trade Name, or GST Number');
      return;
    }

    try {
      setSaving(true);
      
      // Get existing organizations for this client first
      const userDataResponse = await apiClient.get(`/users-page/user-data/${selectedClient.user_id}`).catch(() => ({
        success: false,
        data: { organisations: [] }
      }));

      let existingOrgs = [];
      if (userDataResponse.success && userDataResponse.data?.organisations) {
        // Convert backend snake_case to camelCase if needed
        existingOrgs = userDataResponse.data.organisations.map(org => ({
          organisationType: org.organisation_type || org.organisationType || '',
          legalName: org.legal_name || org.legalName || '',
          tradeName: org.trade_name || org.tradeName || '',
          category: org.category || '',
          gstin: org.gstin || '',
          incorporationDate: org.incorporation_date || org.incorporationDate || '',
          panFile: org.pan_file || org.panFile || null,
          tan: org.tan || '',
          cin: org.cin || '',
          registeredAddress: org.registered_address || org.registeredAddress || '',
          directorsPartners: org.directors_partners_details || org.directorsPartners || [],
          digitalSignatures: org.digital_signature_details || org.digitalSignatures || [],
          optionalAttachment1: org.optional_attachment_1 || org.optionalAttachment1 || null,
          optionalAttachment2: org.optional_attachment_2 || org.optionalAttachment2 || null,
          websites: org.websites || []
        }));
      }

      // Prepare the new organization data
      const orgData = {
        organisationType: newOrganization.organisationType || '',
        legalName: newOrganization.legalName || '',
        tradeName: newOrganization.tradeName || '',
        category: newOrganization.category || '',
        gstin: newOrganization.gstin || '',
        incorporationDate: newOrganization.incorporationDate || '',
        panFile: newOrganization.panFile,
        tan: newOrganization.tan || '',
        cin: newOrganization.cin || '',
        registeredAddress: newOrganization.registeredAddress || '',
        directorsPartners: (newOrganization.directorsPartners || []).filter(dp => 
          dp.name || dp.dinNumber || dp.contact || dp.email
        ),
        digitalSignatures: (newOrganization.digitalSignatures || []).filter(ds => 
          ds.name || ds.dscNumber
        ),
        optionalAttachment1: newOrganization.optionalAttachment1 || null,
        optionalAttachment2: newOrganization.optionalAttachment2 || null,
        websites: (newOrganization.websites || []).filter(w => w.url && w.url.trim() !== '').map(w => ({
          type: w.type,
          url: w.url,
          login: w.login,
          password: w.password,
          remarks: w.remarks || ''
        }))
      };

      // Combine existing organizations with the new one
      const allOrganizations = [...existingOrgs, orgData];

      // Save using updateUserDataByUserId
      const payload = {
        organisations: allOrganizations
      };

      const response = await updateUserDataByUserId(selectedClient.user_id, payload);

      if (response.success) {
        alert('✅ Organization created successfully!');
        // Reset form and close inline form
        setNewOrganization({
          organisationType: '',
          legalName: '',
          tradeName: '',
          category: '',
          gstin: '',
          incorporationDate: '',
          panFile: null,
          tan: '',
          cin: '',
          registeredAddress: '',
          directorsPartners: [],
          digitalSignatures: [],
          optionalAttachment1: null,
          optionalAttachment2: null,
          websites: []
        });
        setSelectedClient(null);
        setIsAddingOrg(false);
        // Reload organizations list
        loadOrganizations();
      } else {
        throw new Error(response.message || 'Failed to save organization');
      }
    } catch (error) {
      console.error('❌ Error saving organization:', error);
      alert(`❌ Failed to save: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleViewAll = async (org) => {
    try {
      setLoadingOrgDetails(true);
      // Fetch full organization details from the client's data
      const userDataResponse = await apiClient.get(`/users-page/user-data/${org.user_id}`).catch(() => ({
        success: false,
        data: { organisations: [] }
      }));

      if (userDataResponse.success && userDataResponse.data?.organisations) {
        // Find the specific organization
        const foundOrg = userDataResponse.data.organisations.find(o => 
          o.id === org.id || 
          String(o.id) === String(org.id) ||
          (o.legal_name === org.legalName && o.gstin === org.gstin)
        );

        if (foundOrg) {
          // Convert backend format to frontend format
          let directorsPartners = [];
          if (foundOrg.directors_partners_details) {
            try {
              directorsPartners = typeof foundOrg.directors_partners_details === 'string' 
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
              digitalSignatures = typeof foundOrg.digital_signature_details === 'string' 
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
              websites = typeof foundOrg.websites === 'string' ? JSON.parse(foundOrg.websites) : foundOrg.websites;
              if (!Array.isArray(websites)) websites = [];
            } catch {
              websites = [];
            }
          }

          setSelectedOrg({
            id: foundOrg.id,
            organisationType: foundOrg.organisation_type || '-',
            legalName: foundOrg.legal_name || '-',
            tradeName: foundOrg.trade_name || '-',
            category: foundOrg.category || '-',
            gstin: foundOrg.gstin || '-',
            incorporationDate: foundOrg.incorporation_date || '-',
            panFile: foundOrg.pan_file || null,
            tan: foundOrg.tan || '-',
            cin: foundOrg.cin || '-',
            registeredAddress: foundOrg.registered_address || '-',
            directorsPartners: directorsPartners.map((dp, index) => ({
              id: dp.id || `dp-${Date.now()}-${index}`,
              name: dp.name || '',
              dinNumber: dp.din_number || '',
              contact: dp.contact || '',
              email: dp.email || '',
              dateOfAddition: dp.date_of_addition || '',
              status: dp.status || 'Active'
            })),
            digitalSignatures: digitalSignatures.map((ds, index) => ({
              id: ds.id || `ds-${Date.now()}-${index}`,
              name: ds.name || '',
              dscNumber: ds.dsc_number || '',
              expiryDate: ds.expiry_date || '',
              status: ds.status || 'Active'
            })),
            optionalAttachment1: foundOrg.optional_attachment_1 || null,
            optionalAttachment2: foundOrg.optional_attachment_2 || null,
            websites: websites
          });
          setSelectedOrgUserId(org.user_id);
        } else {
          alert('Organization details not found');
        }
      } else {
        alert('Failed to load organization details');
      }
    } catch (error) {
      console.error('Error loading organization details:', error);
      alert('Failed to load organization details');
    } finally {
      setLoadingOrgDetails(false);
    }
  };

  // Get unique client names for filter
  const uniqueClients = [...new Set(organizations.map(org => org.clientName).filter(Boolean))];

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

  // If adding new organization, show full-page form view (like View all)
  if (isAddingOrg) {
    return (
      <div className="min-h-screen bg-[#f3f5f7]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
          {/* Back Button */}
          <button
            onClick={() => {
              setIsAddingOrg(false);
              setSelectedClient(null);
              setNewOrganization({
                organisationType: '',
                legalName: '',
                tradeName: '',
                category: '',
                gstin: '',
                incorporationDate: '',
                panFile: null,
                tan: '',
                cin: '',
                registeredAddress: '',
                directorsPartners: [],
                digitalSignatures: [],
                optionalAttachment1: null,
                optionalAttachment2: null,
                websites: []
              });
            }}
            className="mb-6 flex items-center text-[#01334C] hover:text-[#00486D] font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to List
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Organization</h1>
            {!selectedClient ? (
              <p className="text-gray-600">Select a client to create an organization</p>
            ) : (
              <p className="text-gray-600">
                Client: <span className="font-medium">{selectedClient?.name}</span> ({selectedClient?.email})
              </p>
            )}
          </div>

          {/* Client Selection or Organization Form */}
          {!selectedClient ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Client</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select a client for whom you want to create an organization
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <select
                  value={selectedClient?.user_id || ""}
                  onChange={(e) => {
                    const client = clients.find(c => c.user_id === e.target.value);
                    setSelectedClient(client);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                  disabled={loadingClients}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.user_id} value={client.user_id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Organization Details</h2>
                    <p className="text-sm text-gray-600">
                      Client: <span className="font-medium">{selectedClient?.name}</span> ({selectedClient?.email})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                    }}
                    className="text-sm text-[#01334C] hover:text-[#00486D] font-medium"
                  >
                    Change Client
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Row 1: Legal Name, Trade Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Legal Name
                      </label>
                      <input
                        type="text"
                        value={newOrganization.legalName}
                        onChange={(e) => updateNewOrganizationField('legalName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
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
                        onChange={(e) => updateNewOrganizationField('tradeName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                        placeholder="Enter trade name"
                      />
                    </div>
                  </div>

                  {/* Row 1.5: Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={newOrganization.category}
                        onChange={(e) => updateNewOrganizationField('category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] appearance-none bg-white"
                      >
                        <option value="">Select Category</option>
                        <option value="Individual">Individual</option>
                        <option value="Hindu undivided family">Hindu undivided family</option>
                        <option value="Partnership Firm">Partnership Firm</option>
                        <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                        <option value="One Person Company">One Person Company</option>
                        <option value="Section 8 Company">Section 8 Company</option>
                        <option value="Society">Society</option>
                        <option value="Charitable Trust">Charitable Trust</option>
                        <option value="Government">Government</option>
                        <option value="Association of Persons">Association of Persons</option>
                        <option value="Body of Individuals">Body of Individuals</option>
                        <option value="Artificial Judicial Person">Artificial Judicial Person</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: GSTIN, Incorporation Date, PAN File */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={newOrganization.gstin}
                        onChange={(e) => updateNewOrganizationField('gstin', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] font-mono"
                        placeholder="Enter GSTIN"
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
                          onChange={(e) => updateNewOrganizationField('incorporationDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                        />
                        <BsCalendar3 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN File
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={newOrganization.panFile ? 'File uploaded' : 'No file chosen'}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              if (file.size > 10 * 1024 * 1024) {
                                alert('File size must be less than 10MB');
                                e.target.value = '';
                                return;
                              }

                              try {
                                const folder = `user-profiles/${selectedClient.user_id}/organizations/org-new`;
                                const { s3Url } = await uploadFileDirect(
                                  file,
                                  folder,
                                  'pan-file'
                                );
                                updateNewOrganizationField('panFile', s3Url);
                              } catch (error) {
                                console.error('Error uploading PAN file:', error);
                                alert('Failed to upload file. Please try again.');
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <span className="px-4 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block">
                            {newOrganization.panFile ? 'Change' : 'Upload'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: TAN, CIN, Registered Address */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TAN
                      </label>
                      <input
                        type="text"
                        value={newOrganization.tan}
                        onChange={(e) => updateNewOrganizationField('tan', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] font-mono"
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
                        onChange={(e) => updateNewOrganizationField('cin', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] font-mono"
                        placeholder="Enter CIN"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registered Address
                      </label>
                      <textarea
                        rows={3}
                        value={newOrganization.registeredAddress}
                        onChange={(e) => updateNewOrganizationField('registeredAddress', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] resize-y"
                        placeholder="Enter registered address"
                      />
                    </div>
                  </div>

                  {/* Director/Partners Details Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Director/Partners Details</h3>
                      <button
                        onClick={addNewDirectorPartner}
                        className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
                      >
                        <AiOutlinePlus className="w-4 h-4 mr-2" />
                        Add Director/Partner
                      </button>
                    </div>

                    {newOrganization.directorsPartners.length > 0 && (
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse bg-white min-w-[800px]">
                          <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Name</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">DIN/Number</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Contact</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Email</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Date of Addition</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Status</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newOrganization.directorsPartners.map((dp) => (
                              <tr key={dp.id} className="border-b border-gray-200">
                                <td className="px-4 py-3 border border-gray-300">
                                  <input
                                    type="text"
                                    value={dp.name || ''}
                                    onChange={(e) => updateNewDirectorPartner(dp.id, 'name', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Name"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <input
                                    type="text"
                                    value={dp.dinNumber || ''}
                                    onChange={(e) => updateNewDirectorPartner(dp.id, 'dinNumber', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="DIN/Number"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <input
                                    type="text"
                                    value={dp.contact || ''}
                                    onChange={(e) => updateNewDirectorPartner(dp.id, 'contact', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Contact"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <input
                                    type="email"
                                    value={dp.email || ''}
                                    onChange={(e) => updateNewDirectorPartner(dp.id, 'email', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Email"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <input
                                    type="date"
                                    value={dp.dateOfAddition || ''}
                                    onChange={(e) => updateNewDirectorPartner(dp.id, 'dateOfAddition', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <select
                                    value={dp.status || 'Active'}
                                    onChange={(e) => updateNewDirectorPartner(dp.id, 'status', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <button
                                    onClick={() => removeNewDirectorPartner(dp.id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Digital Signature Details Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Digital Signature Details</h3>
                      <button
                        onClick={addNewDigitalSignature}
                        className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
                      >
                        <AiOutlinePlus className="w-4 h-4 mr-2" />
                        Add Digital Signature
                      </button>
                    </div>

                    {newOrganization.digitalSignatures.length > 0 && (
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse bg-white min-w-[600px]">
                          <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Name</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">DSC Number</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Expiry Date</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Status</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newOrganization.digitalSignatures.map((ds) => (
                              <tr key={ds.id} className="border-b border-gray-200">
                                <td className="px-4 py-3 border border-gray-300">
                                  <input
                                    type="text"
                                    value={ds.name || ''}
                                    onChange={(e) => updateNewDigitalSignature(ds.id, 'name', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Name"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <input
                                    type="text"
                                    value={ds.dscNumber || ''}
                                    onChange={(e) => updateNewDigitalSignature(ds.id, 'dscNumber', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="DSC Number"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <input
                                    type="date"
                                    value={ds.expiryDate || ''}
                                    onChange={(e) => updateNewDigitalSignature(ds.id, 'expiryDate', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <select
                                    value={ds.status || 'Active'}
                                    onChange={(e) => updateNewDigitalSignature(ds.id, 'status', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3 border border-gray-300">
                                  <button
                                    onClick={() => removeNewDigitalSignature(ds.id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Website Details Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Credentials</h3>
                      <button
                        onClick={addNewWebsite}
                        className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
                      >
                        <AiOutlinePlus className="w-4 h-4 mr-2" />
                        Add Website
                      </button>
                    </div>

                    {/* Saved Websites Table */}
                    {(newOrganization.websites || []).filter(w => w.url && w.url.trim() !== '').length > 0 && (
                      <div className="overflow-x-auto mb-4 table-responsive">
                        <table className="w-full border-collapse bg-white min-w-[600px]">
                          <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Type</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">URL</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Login</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Password</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(newOrganization.websites || []).filter(w => w.url && w.url.trim() !== '').map((website) => (
                              <tr key={website.id} className="bg-white border-b border-gray-200">
                                <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                                  <select
                                    value={website.type}
                                    onChange={(e) => updateNewWebsite(website.id, 'type', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm appearance-none bg-white"
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
                                <td className="px-4 py-3 border border-gray-300 text-sm">
                                  <input
                                    type="url"
                                    value={website.url}
                                    onChange={(e) => updateNewWebsite(website.id, 'url', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Enter URL"
                                  />
                                </td>
                                <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                                  <input
                                    type="text"
                                    value={website.login}
                                    onChange={(e) => updateNewWebsite(website.id, 'login', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Enter login"
                                  />
                                </td>
                                <td className="px-4 py-3 border border-gray-300 text-sm">
                                  <div className="relative">
                                    <input
                                      type={website.showPassword ? 'text' : 'password'}
                                      value={website.password}
                                      onChange={(e) => updateNewWebsite(website.id, 'password', e.target.value)}
                                      className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                                      placeholder="Enter password"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => toggleNewPasswordVisibility(website.id)}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                      {website.showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-3 border border-gray-300 text-sm">
                                  <input
                                    type="text"
                                    value={website.remarks || ''}
                                    onChange={(e) => updateNewWebsite(website.id, 'remarks', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Enter remarks"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* New Website Entry Forms */}
                    {(newOrganization.websites || []).filter(w => !w.url || w.url.trim() === '').length > 0 && (
                      <div className="space-y-4">
                        {(newOrganization.websites || []).filter(w => !w.url || w.url.trim() === '').map((website) => (
                          <div key={website.id} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-2">Website Type</label>
                                <select
                                  value={website.type}
                                  onChange={(e) => updateNewWebsite(website.id, 'type', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                                >
                                  <option value="">Select Website Type</option>
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
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-2">Website URL</label>
                                <input
                                  type="url"
                                  value={website.url}
                                  onChange={(e) => updateNewWebsite(website.id, 'url', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Enter website URL"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-2">Login</label>
                                <input
                                  type="text"
                                  value={website.login}
                                  onChange={(e) => updateNewWebsite(website.id, 'login', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Enter login"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-2">Password</label>
                                <div className="relative">
                                  <input
                                    type={website.showPassword ? 'text' : 'password'}
                                    value={website.password}
                                    onChange={(e) => updateNewWebsite(website.id, 'password', e.target.value)}
                                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Enter password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => toggleNewPasswordVisibility(website.id)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  >
                                    {website.showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-2">Remarks</label>
                                <input
                                  type="text"
                                  value={website.remarks || ''}
                                  onChange={(e) => updateNewWebsite(website.id, 'remarks', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Enter remarks"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end mt-3">
                              <button
                                type="button"
                                onClick={() => removeNewWebsite(website.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Save/Cancel Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAddingOrg(false);
                    setSelectedClient(null);
                    setNewOrganization({
                      organisationType: '',
                      legalName: '',
                      tradeName: '',
                      category: '',
                      gstin: '',
                      incorporationDate: '',
                      panFile: null,
                      tan: '',
                      cin: '',
                      registeredAddress: '',
                      directorsPartners: [],
                      digitalSignatures: [],
                      optionalAttachment1: null,
                      optionalAttachment2: null,
                      websites: []
                    });
                  }}
                  disabled={saving}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewOrganization}
                  disabled={saving}
                  className="px-6 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium disabled:opacity-50 inline-flex items-center"
                >
                  {saving ? 'Saving...' : 'Save Organization'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If an organization is selected, show detailed view (same as Organization.jsx)
  if (selectedOrg) {
    return (
      <div className="min-h-screen bg-[#f3f5f7]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedOrg(null)}
            className="mb-6 flex items-center text-[#01334C] hover:text-[#00486D] font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to List
          </button>

          {/* Header */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingOrg ? (editingOrg.legalName !== '-' ? editingOrg.legalName : 'Edit Organization') : selectedOrg.legalName !== '-' ? selectedOrg.legalName : selectedOrg.tradeName}
              </h1>
              {!editingOrg && (
                <p className="text-gray-600 mt-2">
                  View organization information
                </p>
              )}
            </div>
            {!editingOrg && (
              <div className="flex gap-3">
                <button
                  onClick={handleEditOrganization}
                  className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Organization
                </button>
                <button
                  onClick={handleDeleteOrganization}
                  disabled={savingOrg}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {savingOrg ? 'Deleting...' : 'Delete Organization'}
                </button>
              </div>
            )}
          </div>

          {/* Organization Details Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 border border-[#F3F3F3] [box-shadow:0px_4px_12px_0px_#00000012]">
            <div className="px-6 py-6">
              <div className="space-y-6">
                {/* Row 1: Legal Name, Trade Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Name
                    </label>
                    {editingOrg ? (
                      <input
                        type="text"
                        value={editingOrg.legalName !== '-' ? editingOrg.legalName : ''}
                        onChange={(e) => updateOrganizationField('legalName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                        placeholder="Enter legal name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-900 font-semibold">{selectedOrg.legalName}</p>
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
                        value={editingOrg.tradeName !== '-' ? editingOrg.tradeName : ''}
                        onChange={(e) => updateOrganizationField('tradeName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                        placeholder="Enter trade name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-900">{selectedOrg.tradeName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 1.5: Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    {editingOrg ? (
                      <select
                        value={editingOrg.category !== '-' ? editingOrg.category : ''}
                        onChange={(e) => updateOrganizationField('category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] appearance-none bg-white"
                      >
                        <option value="">Select Category</option>
                        <option value="Individual">Individual</option>
                        <option value="Hindu undivided family">Hindu undivided family</option>
                        <option value="Partnership Firm">Partnership Firm</option>
                        <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                        <option value="One Person Company">One Person Company</option>
                        <option value="Section 8 Company">Section 8 Company</option>
                        <option value="Society">Society</option>
                        <option value="Charitable Trust">Charitable Trust</option>
                        <option value="Government">Government</option>
                        <option value="Association of Persons">Association of Persons</option>
                        <option value="Body of Individuals">Body of Individuals</option>
                        <option value="Artificial Judicial Person">Artificial Judicial Person</option>
                      </select>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-900">{selectedOrg.category}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: GSTIN, Incorporation Date, PAN File */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GSTIN
                    </label>
                    {editingOrg ? (
                      <input
                        type="text"
                        value={editingOrg.gstin !== '-' ? editingOrg.gstin : ''}
                        onChange={(e) => updateOrganizationField('gstin', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] font-mono"
                        placeholder="Enter GSTIN"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-900 font-mono">{selectedOrg.gstin}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incorporation Date
                    </label>
                    {editingOrg ? (
                      <div className="relative">
                        <input
                          type="date"
                          value={editingOrg.incorporationDate !== '-' ? editingOrg.incorporationDate : ''}
                          onChange={(e) => updateOrganizationField('incorporationDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                        />
                        <BsCalendar3 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                        <BsCalendar3 className="text-gray-400 mr-2" />
                        <p className="text-gray-900">{formatDate(selectedOrg.incorporationDate)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN File
                    </label>
                    {editingOrg ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={editingOrg.panFile ? 'File uploaded' : 'No file chosen'}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              if (file.size > 10 * 1024 * 1024) {
                                alert('File size must be less than 10MB');
                                e.target.value = '';
                                return;
                              }

                              try {
                                const folder = `user-profiles/${selectedOrgUserId}/organizations/org-${editingOrg.id || 'new'}`;
                                const { s3Url } = await uploadFileDirect(
                                  file,
                                  folder,
                                  'pan-file'
                                );
                                updateNewOrganizationField('panFile', s3Url);
                              } catch (error) {
                                console.error('Error uploading PAN file:', error);
                                alert('Failed to upload file. Please try again.');
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <span className="px-4 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors inline-block">
                            {editingOrg.panFile ? 'Change' : 'Upload'}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-900">
                          {selectedOrg.panFile ? (
                            <button
                              onClick={() => viewFile(selectedOrg.panFile)}
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View File
                            </button>
                          ) : (
                            'Not uploaded'
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: TAN, CIN, Registered Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TAN
                    </label>
                    {editingOrg ? (
                      <input
                        type="text"
                        value={editingOrg.tan !== '-' ? editingOrg.tan : ''}
                        onChange={(e) => updateOrganizationField('tan', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] font-mono"
                        placeholder="Enter TAN"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-900 font-mono">{selectedOrg.tan}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CIN
                    </label>
                    {editingOrg ? (
                      <input
                        type="text"
                        value={editingOrg.cin !== '-' ? editingOrg.cin : ''}
                        onChange={(e) => updateOrganizationField('cin', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] font-mono"
                        placeholder="Enter CIN"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-900 font-mono">{selectedOrg.cin}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registered Address
                    </label>
                    {editingOrg ? (
                      <textarea
                        rows={3}
                        value={editingOrg.registeredAddress !== '-' ? editingOrg.registeredAddress : ''}
                        onChange={(e) => updateOrganizationField('registeredAddress', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] resize-y"
                        placeholder="Enter registered address"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-900">{selectedOrg.registeredAddress}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Director/Partners Details Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Director/Partners Details</h3>
                    {editingOrg && (
                      <button
                        onClick={addDirectorPartner}
                        className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
                      >
                        <AiOutlinePlus className="w-4 h-4 mr-2" />
                        Add Director/Partner
                      </button>
                    )}
                  </div>

                  {/* Directors/Partners Table */}
                  {((editingOrg || selectedOrg)?.directorsPartners || []).length > 0 && (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border-collapse bg-white min-w-[800px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">DIN/Number</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Contact</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Email</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Date of Addition</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Status</th>
                            {editingOrg && <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {(editingOrg || selectedOrg).directorsPartners.map((dp) => (
                            <tr key={dp.id} className="border-b border-gray-200">
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <input
                                    type="text"
                                    value={dp.name || ''}
                                    onChange={(e) => updateDirectorPartner(dp.id, 'name', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Name"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{dp.name || '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <input
                                    type="text"
                                    value={dp.dinNumber || ''}
                                    onChange={(e) => updateDirectorPartner(dp.id, 'dinNumber', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="DIN/Number"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{dp.dinNumber || '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <input
                                    type="text"
                                    value={dp.contact || ''}
                                    onChange={(e) => updateDirectorPartner(dp.id, 'contact', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Contact"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{dp.contact || '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <input
                                    type="email"
                                    value={dp.email || ''}
                                    onChange={(e) => updateDirectorPartner(dp.id, 'email', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Email"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{dp.email || '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <input
                                    type="date"
                                    value={dp.dateOfAddition || ''}
                                    onChange={(e) => updateDirectorPartner(dp.id, 'dateOfAddition', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{dp.dateOfAddition ? formatDate(dp.dateOfAddition) : '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <select
                                    value={dp.status || 'Active'}
                                    onChange={(e) => updateDirectorPartner(dp.id, 'status', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                  </select>
                                ) : (
                                  <span className="text-sm text-gray-700">{dp.status || 'Active'}</span>
                                )}
                              </td>
                              {editingOrg && (
                                <td className="px-4 py-3 border border-gray-300">
                                  <button
                                    onClick={() => removeDirectorPartner(dp.id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Empty State */}
                  {(!editingOrg && (!selectedOrg?.directorsPartners || selectedOrg.directorsPartners.length === 0)) && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No directors/partners added yet.
                    </div>
                  )}
                </div>

                {/* Digital Signature Details Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Digital Signature Details</h3>
                    {editingOrg && (
                      <button
                        onClick={addDigitalSignature}
                        className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
                      >
                        <AiOutlinePlus className="w-4 h-4 mr-2" />
                        Add Digital Signature
                      </button>
                    )}
                  </div>

                  {/* Digital Signatures Table */}
                  {((editingOrg || selectedOrg)?.digitalSignatures || []).length > 0 && (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border-collapse bg-white min-w-[600px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">DSC Number</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Expiry Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Status</th>
                            {editingOrg && <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {(editingOrg || selectedOrg).digitalSignatures.map((ds) => (
                            <tr key={ds.id} className="border-b border-gray-200">
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <input
                                    type="text"
                                    value={ds.name || ''}
                                    onChange={(e) => updateDigitalSignature(ds.id, 'name', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Name"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{ds.name || '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <input
                                    type="text"
                                    value={ds.dscNumber || ''}
                                    onChange={(e) => updateDigitalSignature(ds.id, 'dscNumber', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="DSC Number"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{ds.dscNumber || '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <input
                                    type="date"
                                    value={ds.expiryDate || ''}
                                    onChange={(e) => updateDigitalSignature(ds.id, 'expiryDate', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-700">{ds.expiryDate ? formatDate(ds.expiryDate) : '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300">
                                {editingOrg ? (
                                  <select
                                    value={ds.status || 'Active'}
                                    onChange={(e) => updateDigitalSignature(ds.id, 'status', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                  </select>
                                ) : (
                                  <span className="text-sm text-gray-700">{ds.status || 'Active'}</span>
                                )}
                              </td>
                              {editingOrg && (
                                <td className="px-4 py-3 border border-gray-300">
                                  <button
                                    onClick={() => removeDigitalSignature(ds.id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Empty State */}
                  {(!editingOrg && (!selectedOrg?.digitalSignatures || selectedOrg.digitalSignatures.length === 0)) && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No digital signatures added yet.
                    </div>
                  )}
                </div>

                {/* Website Details Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Credentials</h3>
                    {editingOrg && (
                      <button
                        onClick={() => {
                          const idCounter = Date.now();
                          setEditingOrg({
                            ...editingOrg,
                            websites: [...(editingOrg.websites || []), {
                              id: idCounter,
                              type: '',
                              url: '',
                              login: '',
                              password: '',
                              remarks: '',
                              showPassword: false
                            }]
                          });
                        }}
                        className="px-4 py-2 text-sm bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium inline-flex items-center"
                      >
                        <AiOutlinePlus className="w-4 h-4 mr-2" />
                        Add Website
                      </button>
                    )}
                  </div>

                  {/* Empty State Message */}
                  {!editingOrg && (!selectedOrg.websites || selectedOrg.websites.length === 0 || selectedOrg.websites.every(w => !w.url || w.url.trim() === '')) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No websites added yet. Click "Edit Organization" to add websites.</p>
                    </div>
                  )}

                  {/* Saved Websites Table */}
                  {((editingOrg || selectedOrg)?.websites || []).filter(w => w.url && w.url.trim() !== '').length > 0 && (
                    <div className="overflow-x-auto mb-4 table-responsive">
                      <table className="w-full border-collapse bg-white min-w-[600px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Type</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">URL</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Login</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Password</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300 text-sm">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(editingOrg || selectedOrg)?.websites?.filter(w => w.url && w.url.trim() !== '').map((website) => (
                            <tr key={website.id} className="bg-white border-b border-gray-200">
                              <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                                {editingOrg ? (
                                  <select
                                    value={website.type}
                                    onChange={(e) => {
                                      const updatedWebsites = (editingOrg.websites || []).map(w => 
                                        w.id === website.id ? { ...w, type: e.target.value } : w
                                      );
                                      setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm appearance-none bg-white"
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
                                  website.type || '-'
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300 text-sm">
                                {editingOrg ? (
                                  <input
                                    type="url"
                                    value={website.url}
                                    onChange={(e) => {
                                      const updatedWebsites = (editingOrg.websites || []).map(w => 
                                        w.id === website.id ? { ...w, url: e.target.value } : w
                                      );
                                      setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Enter URL"
                                  />
                                ) : (
                                  website.url ? (
                                    <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {website.url}
                                    </a>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-900 border border-gray-300 text-sm">
                                {editingOrg ? (
                                  <input
                                    type="text"
                                    value={website.login}
                                    onChange={(e) => {
                                      const updatedWebsites = (editingOrg.websites || []).map(w => 
                                        w.id === website.id ? { ...w, login: e.target.value } : w
                                      );
                                      setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Enter login"
                                  />
                                ) : (
                                  website.login || '-'
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300 text-sm">
                                {editingOrg ? (
                                  <div className="relative">
                                    <input
                                      type={website.showPassword ? 'text' : 'password'}
                                      value={website.password}
                                      onChange={(e) => {
                                        const updatedWebsites = (editingOrg.websites || []).map(w => 
                                          w.id === website.id ? { ...w, password: e.target.value } : w
                                        );
                                        setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                      }}
                                      className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                                      placeholder="Enter password"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedWebsites = (editingOrg.websites || []).map(w => 
                                          w.id === website.id ? { ...w, showPassword: !w.showPassword } : w
                                        );
                                        setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                      }}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                      {website.showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-900">{website.password ? '••••••••' : '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 border border-gray-300 text-sm">
                                {editingOrg ? (
                                  <input
                                    type="text"
                                    value={website.remarks || ''}
                                    onChange={(e) => {
                                      const updatedWebsites = (editingOrg.websites || []).map(w => 
                                        w.id === website.id ? { ...w, remarks: e.target.value } : w
                                      );
                                      setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Enter remarks"
                                  />
                                ) : (
                                  <span className="text-gray-900">{website.remarks || '-'}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* New Website Entry Forms */}
                  {editingOrg && (editingOrg.websites || []).filter(w => !w.url || w.url.trim() === '').length > 0 && (
                    <div className="space-y-4">
                      {(editingOrg.websites || []).filter(w => !w.url || w.url.trim() === '').map((website) => (
                        <div key={website.id} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Website Type</label>
                              <select
                                value={website.type}
                                onChange={(e) => {
                                  const updatedWebsites = (editingOrg.websites || []).map(w => 
                                    w.id === website.id ? { ...w, type: e.target.value } : w
                                  );
                                  setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                              >
                                <option value="">Select Website Type</option>
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
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Website URL</label>
                              <input
                                type="url"
                                value={website.url}
                                onChange={(e) => {
                                  const updatedWebsites = (editingOrg.websites || []).map(w => 
                                    w.id === website.id ? { ...w, url: e.target.value } : w
                                  );
                                  setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter website URL"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Login</label>
                              <input
                                type="text"
                                value={website.login}
                                onChange={(e) => {
                                  const updatedWebsites = (editingOrg.websites || []).map(w => 
                                    w.id === website.id ? { ...w, login: e.target.value } : w
                                  );
                                  setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter login"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Password</label>
                              <div className="relative">
                                <input
                                  type={website.showPassword ? 'text' : 'password'}
                                  value={website.password}
                                  onChange={(e) => {
                                    const updatedWebsites = (editingOrg.websites || []).map(w => 
                                      w.id === website.id ? { ...w, password: e.target.value } : w
                                    );
                                    setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                  }}
                                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Enter password"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedWebsites = (editingOrg.websites || []).map(w => 
                                      w.id === website.id ? { ...w, showPassword: !w.showPassword } : w
                                    );
                                    setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                  }}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {website.showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">Remarks</label>
                              <input
                                type="text"
                                value={website.remarks || ''}
                                onChange={(e) => {
                                  const updatedWebsites = (editingOrg.websites || []).map(w => 
                                    w.id === website.id ? { ...w, remarks: e.target.value } : w
                                  );
                                  setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter remarks"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedWebsites = (editingOrg.websites || []).filter(w => w.id !== website.id);
                                setEditingOrg({ ...editingOrg, websites: updatedWebsites });
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save/Cancel Buttons */}
                {editingOrg && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={handleSaveOrganization}
                      disabled={savingOrg}
                      className="flex-1 px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {savingOrg ? 'Saving...' : 'Save Organization'}
                    </button>
                    <button
                      onClick={() => setEditingOrg(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">List Of Companies</h1>
          <p className="text-gray-600">Your registered organizations</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-[#F3F3F3] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by organization name or GST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Client</label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01334C]"
              >
                <option value="">All Clients</option>
                {uniqueClients.map((clientName, idx) => (
                  <option key={idx} value={clientName}>
                    {clientName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setClientFilter("");
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Organizations Table and Add Button - Inline like Organization.jsx */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#F3F3F3] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Logo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GST Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.length > 0 ? (
                  organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{org.clientName}</div>
                        <div className="text-xs text-gray-500">{org.clientEmail}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-full bg-[#01334C] flex items-center justify-center overflow-hidden">
                          <img
                            src={logo}
                            alt="Company Logo"
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {org.legalName !== '-' ? org.legalName : org.tradeName}
                        </div>
                        {org.tradeName !== '-' && org.legalName !== '-' && org.tradeName !== org.legalName && (
                          <div className="text-xs text-gray-500 mt-1">{org.tradeName}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{org.gstin !== '-' ? org.gstin : '-'}</div>
                        {org.incorporationDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Since: {formatDate(org.incorporationDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewAll(org)}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#01334C] rounded-md hover:bg-[#00486D] transition-colors"
                        >
                          View all
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="text-gray-500">
                        <BsBuilding className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No organizations found</p>
                        {searchTerm || clientFilter ? (
                          <p className="text-sm mt-2">Try adjusting your search or filters</p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Add Organization Button */}
          <button
            onClick={handleAddOrganization}
            className="w-12 h-12 bg-[#01334C] text-white rounded-full flex items-center justify-center hover:bg-[#00486D] transition-colors flex-shrink-0"
            title="Add Organization"
          >
            <AiOutlinePlus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminOrganizations;

