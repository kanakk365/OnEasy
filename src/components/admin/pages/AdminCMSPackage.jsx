import React, { useState, useEffect } from 'react';
import apiClient from '../../../utils/api';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine, RiCloseLine, RiCheckLine } from 'react-icons/ri';

function AdminCMSPackage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [newFeature, setNewFeature] = useState('');

  const [formData, setFormData] = useState({
    service_type: '',
    package_name: '',
    price: '',
    original_price: '',
    features: [],
    description: '',
    icon: '★',
    period: 'One Time',
    is_highlighted: false,
    display_order: 0
  });

  const serviceTypes = [
    { value: 'all', label: 'All Services' },
    { value: 'private-limited', label: 'Private Limited' },
    { value: 'proprietorship', label: 'Proprietorship' },
    { value: 'gst', label: 'GST' },
    { value: 'startup-india', label: 'Startup India' },
    { value: 'opc', label: 'OPC' },
    { value: 'llp', label: 'LLP' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'section-8', label: 'Section 8' },
    { value: 'public-limited', label: 'Public Limited' },
    { value: 'mca-name-approval', label: 'MCA Name Approval' },
    { value: 'indian-subsidiary', label: 'Indian Subsidiary' },
    { value: 'professional-tax', label: 'Professional Tax' },
    { value: 'labour-license', label: 'Labour License' },
    { value: 'udyam', label: 'Udyam/MSME' },
    { value: 'fssai', label: 'FSSAI' },
    { value: 'trade-license', label: 'Trade License' },
    { value: 'iec', label: 'IEC' },
    { value: 'lut', label: 'GST LUT' },
    { value: 'dsc', label: 'DSC' },
    { value: 'esi', label: 'ESI' },
    { value: '12a', label: '12A' },
    { value: '80g', label: '80G' }
  ];

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/packages');
      if (response.success) {
        setPackages(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      alert('Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      service_type: pkg.service_type || '',
      package_name: pkg.package_name || '',
      price: pkg.price || '',
      original_price: pkg.original_price || '',
      features: Array.isArray(pkg.features) ? [...pkg.features] : [],
      description: pkg.description || '',
      icon: pkg.icon || '★',
      period: pkg.period || 'One Time',
      is_highlighted: pkg.is_highlighted || false,
      display_order: pkg.display_order || 0
    });
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingPackage(null);
    setFormData({
      service_type: selectedService !== 'all' ? selectedService : '',
      package_name: '',
      price: '',
      original_price: '',
      features: [],
      description: '',
      icon: '★',
      period: 'One Time',
      is_highlighted: false,
      display_order: 0
    });
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingPackage(null);
    setNewFeature('');
  };

  const handleSave = async () => {
    if (!formData.service_type || !formData.package_name || !formData.price) {
      alert('Service type, package name, and price are required');
      return;
    }

    if (formData.features.length === 0) {
      alert('Please add at least one feature');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        display_order: parseInt(formData.display_order) || 0
      };

      let response;
      if (editingPackage) {
        response = await apiClient.put(`/packages/${editingPackage.id}`, payload);
      } else {
        response = await apiClient.post('/packages', payload);
      }

      if (response.success) {
        await fetchPackages();
        handleCancel();
        alert(editingPackage ? 'Package updated successfully!' : 'Package created successfully!');
      } else {
        alert(response.message || 'Failed to save package');
      }
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Are you sure you want to delete ${pkg.package_name} package for ${pkg.service_type}?`)) {
      return;
    }

    try {
      const response = await apiClient.delete(`/packages/${pkg.id}`);
      if (response.success) {
        await fetchPackages();
        alert('Package deleted successfully!');
      } else {
        alert(response.message || 'Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package. Please try again.');
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService === 'all' || pkg.service_type === selectedService;
    
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">CMS for Package</h1>
          <p className="text-sm text-gray-600">Manage package prices and key features for all services</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 bg-[#01334C] text-white px-4 py-2 rounded-lg hover:bg-[#014a6b] transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
          />
        </div>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
        >
          {serviceTypes.map(service => (
            <option key={service.value} value={service.value}>{service.label}</option>
          ))}
        </select>
      </div>

      {/* Packages List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#01334C]"></div>
          <p className="mt-2 text-gray-600">Loading packages...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No packages found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPackages).map(([serviceType, servicePackages]) => (
            <div key={serviceType} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {serviceTypes.find(s => s.value === serviceType)?.label || serviceType}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {servicePackages.map((pkg) => (
                  <div key={pkg.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{pkg.icon || '★'}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{pkg.package_name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xl font-bold text-[#01334C]">₹{parseFloat(pkg.price || 0).toLocaleString()}</span>
                              {pkg.original_price && (
                                <span className="text-sm text-gray-500 line-through">₹{parseFloat(pkg.original_price).toLocaleString()}</span>
                              )}
                              {pkg.is_highlighted && (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Popular</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {pkg.description && (
                          <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                        )}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Key Features:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {Array.isArray(pkg.features) && pkg.features.map((feature, idx) => (
                              <li key={idx} className="text-sm text-gray-600">{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="p-2 text-[#01334C] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <RiEditLine className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <RiDeleteBinLine className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  >
                    <option value="">Select Service</option>
                    {serviceTypes.filter(s => s.value !== 'all').map(service => (
                      <option key={service.value} value={service.value}>{service.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="package_name"
                    value={formData.package_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                    placeholder="e.g., Starter, Growth, Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (₹) <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    maxLength="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <input
                    type="text"
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_highlighted"
                    checked={formData.is_highlighted}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#01334C] border-gray-300 rounded focus:ring-[#01334C]"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Mark as Popular</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Features <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Add a feature and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#014a6b] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {formData.features.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No features added yet</p>
                  ) : (
                    formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <RiCloseLine className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#014a6b] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCMSPackage;
