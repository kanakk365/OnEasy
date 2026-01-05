import React, { useState, useEffect } from "react";
import apiClient from "../../../utils/api";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCloseLine,
  RiCheckLine,
  RiArchiveDrawerLine,
  RiStarFill,
} from "react-icons/ri";
import { BsBoxSeam } from "react-icons/bs";

function AdminCMSPackage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [newFeature, setNewFeature] = useState("");

  const [formData, setFormData] = useState({
    service_type: "",
    package_name: "",
    price: "",
    original_price: "",
    features: [],
    description: "",
    icon: "★",
    period: "One Time",
    is_highlighted: false,
    display_order: 0,
  });

  const serviceTypes = [
    { value: "all", label: "All Services" },
    { value: "private-limited", label: "Private Limited" },
    { value: "proprietorship", label: "Proprietorship" },
    { value: "gst", label: "GST" },
    { value: "gst-registration", label: "GST Registration" },
    { value: "gst-returns", label: "GST Returns" },
    { value: "gst-annual-return", label: "GST Annual Return Filing" },
    { value: "gst-amendment", label: "GST Amendment" },
    { value: "gst-notice", label: "GST Notice" },
    { value: "director-addition", label: "Director Addition" },
    { value: "share-transfer", label: "Share Transfer" },
    { value: "address-change", label: "Address Change" },
    { value: "charge-creation", label: "Charge Creation" },
    { value: "director-removal", label: "Director Removal" },
    { value: "moa-amendment", label: "MOA Amendment" },
    { value: "aoa-amendment", label: "AOA Amendment" },
    { value: "objects-clause-change", label: "Change In Objects Clause" },
    { value: "increase-share-capital", label: "Increase in Share Capital" },
    { value: "name-change-company", label: "Name Change - Company" },
    { value: "din-deactivation", label: "DIN Deactivation" },
    { value: "din-reactivation", label: "DIN Reactivation" },
    { value: "adt-1", label: "ADT-1" },
    { value: "winding-up-company", label: "Winding Up - Company" },
    { value: "winding-up-llp", label: "Winding Up - LLP" },
    { value: "din-application", label: "DIN Application" },
    { value: "inc-20a", label: "INC 20A" },
    { value: "fssai-renewal", label: "FSSAI Renewal" },
    { value: "fssai-return-filing", label: "FSSAI Return Filing" },
    { value: "business-plan", label: "Business Plan" },
    { value: "hr-payroll", label: "HR & Payroll Service" },
    { value: "pf-return-filing", label: "PF Return Filing" },
    { value: "esi-return-filing", label: "ESI Return Filing" },
    {
      value: "professional-tax-return",
      label: "Professional Tax Return Filing",
    },
    { value: "partnership-compliance", label: "Partnership Compliance" },
    { value: "proprietorship-compliance", label: "Proprietorship Compliance" },
    { value: "company-compliance", label: "Company Compliance" },
    { value: "trademark", label: "Trademark" },
    { value: "salary-itr", label: "Income Tax Return - Salary" },
    { value: "business-itr", label: "Business - Income Tax Return" },
    {
      value: "house-property-itr",
      label: "House Property - Income Tax Return",
    },
    { value: "trust-itr", label: "Trust - Income Tax Return" },
    {
      value: "salary-hp-capital-gains",
      label: "Income From Salary, HP and Capital gains",
    },
    { value: "partnership-firm-itr", label: "Partnership Firm - ITR" },
    { value: "company-itr", label: "Company - ITR" },
    { value: "startup-india", label: "Startup India" },
    { value: "opc", label: "OPC" },
    { value: "llp", label: "LLP" },
    { value: "partnership", label: "Partnership" },
    { value: "section-8", label: "Section 8" },
    { value: "public-limited", label: "Public Limited" },
    { value: "mca-name-approval", label: "MCA Name Approval" },
    { value: "indian-subsidiary", label: "Indian Subsidiary" },
    { value: "professional-tax", label: "Professional Tax" },
    { value: "labour-license", label: "Labour License" },
    { value: "udyam", label: "Udyam/MSME" },
    { value: "fssai", label: "FSSAI" },
    { value: "trade-license", label: "Trade License" },
    { value: "iec", label: "IEC" },
    { value: "lut", label: "GST LUT" },
    { value: "dsc", label: "DSC" },
    { value: "esi", label: "ESI" },
    { value: "12a", label: "12A" },
    { value: "80g", label: "80G" },
  ];

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/packages");
      if (response.success) {
        setPackages(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      alert("Failed to load packages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      service_type: pkg.service_type || "",
      package_name: pkg.package_name || "",
      price: pkg.price || "",
      original_price: pkg.original_price || "",
      features: Array.isArray(pkg.features) ? [...pkg.features] : [],
      description: pkg.description || "",
      icon: pkg.icon || "★",
      period: pkg.period || "One Time",
      is_highlighted: pkg.is_highlighted || false,
      display_order: pkg.display_order || 0,
    });
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingPackage(null);
    setFormData({
      service_type: selectedService !== "all" ? selectedService : "",
      package_name: "",
      price: "",
      original_price: "",
      features: [],
      description: "",
      icon: "★",
      period: "One Time",
      is_highlighted: false,
      display_order: 0,
    });
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingPackage(null);
    setNewFeature("");
  };

  const handleSave = async () => {
    if (!formData.service_type || !formData.package_name || !formData.price) {
      alert("Service type, package name, and price are required");
      return;
    }

    if (formData.features.length === 0) {
      alert("Please add at least one feature");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        display_order: parseInt(formData.display_order) || 0,
      };

      let response;
      if (editingPackage) {
        response = await apiClient.put(
          `/packages/${editingPackage.id}`,
          payload
        );
      } else {
        response = await apiClient.post("/packages", payload);
      }

      if (response.success) {
        await fetchPackages();
        handleCancel();
        alert(
          editingPackage
            ? "Package updated successfully!"
            : "Package created successfully!"
        );
      } else {
        alert(response.message || "Failed to save package");
      }
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Failed to save package. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkg) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${pkg.package_name} package for ${pkg.service_type}?`
      )
    ) {
      return;
    }

    try {
      const response = await apiClient.delete(`/packages/${pkg.id}`);
      if (response.success) {
        await fetchPackages();
        alert("Package deleted successfully!");
      } else {
        alert(response.message || "Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package. Please try again.");
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService =
      selectedService === "all" || pkg.service_type === selectedService;

    return matchesSearch && matchesService;
  });

  // Group packages by service type
  const groupedPackages = filteredPackages.reduce((acc, pkg) => {
    if (!acc[pkg.service_type]) {
      acc[pkg.service_type] = [];
    }
    acc[pkg.service_type].push(pkg);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #022B51 0%, #015079 100%)",
              }}
            >
              <BsBoxSeam className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                CMS Packages
              </h1>
              <p className="text-gray-500 italic ml-1">
                Manage service packages and pricing
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg font-medium"
          >
            <RiAddLine className="w-5 h-5" />
            <span>Add New Package</span>
          </button>
        </div>

        {/* Filters and List */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search packages by name, service or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow bg-white"
              />
            </div>
            <div className="w-full md:w-72">
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow appearance-none bg-white font-medium text-gray-700"
                >
                  {serviceTypes.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
                <RiArchiveDrawerLine className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00486D]"></div>
                <p className="mt-4 text-gray-500 font-medium">
                  Loading packages...
                </p>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <BsBoxSeam className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-lg font-medium">No packages found</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {Object.entries(groupedPackages).map(
                  ([serviceType, servicePackages]) => (
                    <div
                      key={serviceType}
                      className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00486D]"></span>
                          {serviceTypes.find((s) => s.value === serviceType)
                            ?.label || serviceType}
                        </h3>
                        <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500 font-medium">
                          {servicePackages.length} Packages
                        </span>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {servicePackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="p-6 group hover:bg-[#F8FAFC] transition-colors"
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-start gap-4 mb-2">
                                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-xl shadow-sm text-[#00486D] font-bold">
                                    {pkg.icon || "★"}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <h4 className="text-lg font-bold text-gray-900">
                                        {pkg.package_name}
                                      </h4>
                                      {pkg.is_highlighted && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                                          <RiStarFill className="w-3 h-3" />{" "}
                                          Popular
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-baseline gap-2 mt-1">
                                      <span className="text-2xl font-bold text-[#00486D]">
                                        ₹
                                        {parseFloat(
                                          pkg.price || 0
                                        ).toLocaleString()}
                                      </span>
                                      {pkg.original_price && (
                                        <span className="text-sm text-gray-400 line-through decoration-gray-400">
                                          ₹
                                          {parseFloat(
                                            pkg.original_price
                                          ).toLocaleString()}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500 font-medium ml-1 px-2 py-0.5 bg-gray-100 rounded-md">
                                        {pkg.period || "One Time"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {pkg.description && (
                                  <p className="text-sm text-gray-600 mt-3 mb-4 leading-relaxed max-w-2xl">
                                    {pkg.description}
                                  </p>
                                )}

                                <div className="bg-white border border-gray-100 rounded-xl p-4 mt-2">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Included Features
                                  </p>
                                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    {Array.isArray(pkg.features) &&
                                      pkg.features.map((feature, idx) => (
                                        <li
                                          key={idx}
                                          className="text-sm text-gray-700 flex items-start gap-2"
                                        >
                                          <RiCheckLine className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                          <span className="line-clamp-1">
                                            {feature}
                                          </span>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="flex flex-row md:flex-col gap-2 shrink-0 md:border-l border-gray-100 md:pl-6 md:ml-2">
                                <button
                                  onClick={() => handleEdit(pkg)}
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#00486D] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <RiEditLine className="w-4 h-4" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(pkg)}
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <RiDeleteBinLine className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={handleCancel}
          ></div>

          <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editingPackage ? (
                  <RiEditLine className="w-5 h-5 text-[#00486D]" />
                ) : (
                  <RiAddLine className="w-5 h-5 text-[#00486D]" />
                )}
                {editingPackage ? "Edit Package Details" : "Create New Package"}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                      Basic Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Service Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="service_type"
                        value={formData.service_type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent bg-white"
                      >
                        <option value="">Select Service Category</option>
                        {serviceTypes
                          .filter((s) => s.value !== "all")
                          .map((service) => (
                            <option key={service.value} value={service.value}>
                              {service.label}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Package Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="package_name"
                        value={formData.package_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                        placeholder="e.g. Standard Plan"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Original Price (opt)
                        </label>
                        <input
                          type="number"
                          name="original_price"
                          value={formData.original_price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                      Presentation & Features
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Icon (Emoji)
                        </label>
                        <input
                          type="text"
                          name="icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                          maxLength="2"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent text-center text-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Period
                        </label>
                        <input
                          type="text"
                          name="period"
                          value={formData.period}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                          placeholder="e.g. One Time, Yearly"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Display Order
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          name="display_order"
                          value={formData.display_order}
                          onChange={handleInputChange}
                          min="0"
                          className="w-24 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent"
                        />
                        <div className="flex items-center px-4 py-2.5 bg-yellow-50 rounded-xl border border-yellow-100 cursor-pointer hover:bg-yellow-100 transition-colors">
                          <input
                            type="checkbox"
                            id="is_highlighted"
                            name="is_highlighted"
                            checked={formData.is_highlighted}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[#00486D] border-gray-300 rounded focus:ring-[#00486D] cursor-pointer"
                          />
                          <label
                            htmlFor="is_highlighted"
                            className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Mark as Popular
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent resize-none"
                        placeholder="Brief description of the package..."
                      />
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Features <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddFeature())
                      }
                      placeholder="Type a feature and press Enter or Click Add..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00486D] focus:border-transparent shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-6 py-2.5 bg-[#00486D] text-white rounded-xl hover:bg-[#003855] transition-colors font-medium shadow-sm"
                    >
                      Add Feature
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
                    {formData.features.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <RiAddLine className="w-6 h-6 mb-1" />
                        <p className="text-sm">
                          No features added yet. Add some features above.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm group hover:border-[#00486D] transition-colors"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-sm text-gray-700 truncate">
                                {feature}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(index)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <RiCloseLine className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2.5 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>{editingPackage ? "Update Package" : "Create Package"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCMSPackage;
