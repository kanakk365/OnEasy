import React, { useState } from 'react';

// Indian States List
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Step 1: Basic Business Details
export function BasicBusinessDetailsContent({ formData, onChange, onNext }) {
  const [data, setData] = useState({
    businessName: formData.businessName || '',
    natureOfBusiness: formData.natureOfBusiness || '',
    businessEmail: formData.businessEmail || '',
    contactNumber: formData.contactNumber || '',
    addressLine1: formData.addressLine1 || '',
    addressLine2: formData.addressLine2 || '',
    city: formData.city || '',
    state: formData.state || '',
    country: formData.country || 'India',
    pincode: formData.pincode || '',
    utilityBill: formData.utilityBill || null,
    rentalAgreement: formData.rentalAgreement || null,
    maleEmployees: formData.maleEmployees || '',
    femaleEmployees: formData.femaleEmployees || '',
    businessType: formData.businessType || [],
    socialCategory: formData.socialCategory || '',
    specialAbled: formData.specialAbled || false,
    bankName: formData.bankName || '',
    bankAccountNumber: formData.bankAccountNumber || '',
    ifscCode: formData.ifscCode || '',
    additionalUnitName: formData.additionalUnitName || '',
    additionalUnitAddressLine1: formData.additionalUnitAddressLine1 || '',
    additionalUnitAddressLine2: formData.additionalUnitAddressLine2 || '',
    additionalUnitCity: formData.additionalUnitCity || '',
    additionalUnitState: formData.additionalUnitState || '',
    additionalUnitCountry: formData.additionalUnitCountry || 'India',
    additionalUnitPincode: formData.additionalUnitPincode || '',
    hasGSTIN: formData.hasGSTIN || false,
    gstinNumber: formData.gstinNumber || '',
    dateOfIncorporation: formData.dateOfIncorporation || '',
    businessCommenced: formData.businessCommenced || false,
    filedITR: formData.filedITR || false,
    dateOfCommencement: formData.dateOfCommencement || ''
  });

  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    onChange(updatedData);
  };

  const handleFileChange = async (field, file) => {
    if (file) {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBusinessTypeChange = (type) => {
    const currentTypes = data.businessType || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    handleChange('businessType', updatedTypes);
  };

  const validateAndNext = () => {
    // Basic validation
    if (!data.businessName || !data.natureOfBusiness || !data.businessEmail || !data.contactNumber) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!data.addressLine1 || !data.city || !data.state || !data.pincode) {
      alert('Please complete the address details');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Section 1: Basic Business Details
      </h2>

      {/* Business Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name of the Business <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Fill the name of Business / Enterprise which will get printed on Certificate
        </p>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          placeholder="Enter business name"
        />
      </div>

      {/* Nature of Business */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nature of the Business <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Describe the main line of activity briefly
        </p>
        <textarea
          value={data.natureOfBusiness}
          onChange={(e) => handleChange('natureOfBusiness', e.target.value)}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          placeholder="Describe your business activity"
        />
      </div>

      {/* Business Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Email Address <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Provide an official email address for government communication
        </p>
        <input
          type="email"
          value={data.businessEmail}
          onChange={(e) => handleChange('businessEmail', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          placeholder="business@example.com"
        />
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Number <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Provide a contact number for government communication
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value="+91"
            disabled
            className="w-20 px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
          <input
            type="tel"
            value={data.contactNumber}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
            placeholder="9876543210"
            maxLength="10"
          />
        </div>
      </div>

      {/* Complete Address */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-3">
          Complete Address of the Proposed Registered Office
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Enter the full address matching a recent utility bill
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Building, Street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={data.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Area, Landmark"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={data.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={data.country}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                placeholder="560001"
                maxLength="6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Utility Bill */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Utility Bill (Electricity Bill or Similar) <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Upload a recent utility bill (not older than 1 month). Acceptable formats: PDF, JPG, PNG
        </p>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange('utilityBill', e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        />
      </div>

      {/* Rental Agreement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rental Agreement/Affidavit of the premises <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Acceptable format: PDF
        </p>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileChange('rentalAgreement', e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        />
      </div>

      {/* Number of Employees */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Employees
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Male</label>
            <input
              type="number"
              value={data.maleEmployees}
              onChange={(e) => handleChange('maleEmployees', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Female</label>
            <input
              type="number"
              value={data.femaleEmployees}
              onChange={(e) => handleChange('femaleEmployees', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Business Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Manufacturing / Trading / Service
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.businessType.includes('Manufacturing')}
              onChange={() => handleBusinessTypeChange('Manufacturing')}
              className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Manufacturing</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.businessType.includes('Trading - Whole Sale')}
              onChange={() => handleBusinessTypeChange('Trading - Whole Sale')}
              className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Trading - Whole Sale</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.businessType.includes('Trading - Retail Trade')}
              onChange={() => handleBusinessTypeChange('Trading - Retail Trade')}
              className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Trading - Retail Trade</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.businessType.includes('Services')}
              onChange={() => handleBusinessTypeChange('Services')}
              className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Services</span>
          </label>
        </div>
      </div>

      {/* Social Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Social category of the Entrepreneur
        </label>
        <div className="space-y-2">
          {['General', 'SC', 'ST', 'OBC'].map(category => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="socialCategory"
                checked={data.socialCategory === category}
                onChange={() => handleChange('socialCategory', category)}
                className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Special Abled Person */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.specialAbled}
            onChange={(e) => handleChange('specialAbled', e.target.checked)}
            className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Special Abled Person</span>
        </label>
      </div>

      {/* Bank Account Details */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-3">
          Bank Account Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <input
              type="text"
              value={data.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Enter bank name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account Number
            </label>
            <input
              type="text"
              value={data.bankAccountNumber}
              onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Enter account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code
            </label>
            <input
              type="text"
              value={data.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Enter IFSC code"
            />
          </div>
        </div>
      </div>

      {/* Additional Unit */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-3">
          Additional Unit (If any)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name of the Unit
            </label>
            <input
              type="text"
              value={data.additionalUnitName}
              onChange={(e) => handleChange('additionalUnitName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Enter unit name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location of the Unit
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={data.additionalUnitAddressLine1}
                onChange={(e) => handleChange('additionalUnitAddressLine1', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                placeholder="Address Line 1"
              />
              <input
                type="text"
                value={data.additionalUnitAddressLine2}
                onChange={(e) => handleChange('additionalUnitAddressLine2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                placeholder="Address Line 2 (optional)"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={data.additionalUnitCity}
                  onChange={(e) => handleChange('additionalUnitCity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                  placeholder="City"
                />
                <select
                  value={data.additionalUnitState}
                  onChange={(e) => handleChange('additionalUnitState', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={data.additionalUnitCountry}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  placeholder="Country"
                />
                <input
                  type="text"
                  value={data.additionalUnitPincode}
                  onChange={(e) => handleChange('additionalUnitPincode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                  placeholder="Pin Code"
                  maxLength="6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GSTIN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you have GSTIN Number?
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGSTIN"
                checked={data.hasGSTIN === true}
                onChange={() => handleChange('hasGSTIN', true)}
                className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasGSTIN"
                checked={data.hasGSTIN === false}
                onChange={() => handleChange('hasGSTIN', false)}
                className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
          {data.hasGSTIN && (
            <input
              type="text"
              value={data.gstinNumber}
              onChange={(e) => handleChange('gstinNumber', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Enter GSTIN number"
            />
          )}
        </div>
      </div>

      {/* Status of Enterprise */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-3">
          Status of Enterprise
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Incorporation/Registration <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.dateOfIncorporation}
              onChange={(e) => handleChange('dateOfIncorporation', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Whether production/Business commenced
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="businessCommenced"
                  checked={data.businessCommenced === true}
                  onChange={() => handleChange('businessCommenced', true)}
                  className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="businessCommenced"
                  checked={data.businessCommenced === false}
                  onChange={() => handleChange('businessCommenced', false)}
                  className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Filed ITR */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.filedITR}
            onChange={(e) => handleChange('filedITR', e.target.checked)}
            className="mr-2 h-4 w-4 text-[#00486D] focus:ring-[#00486D] border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Have you filed the ITR for Previous Year?
          </span>
        </label>
      </div>

      {/* Date of Commencement */}
      {data.businessCommenced && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Commencement of Business <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.dateOfCommencement}
            onChange={(e) => handleChange('dateOfCommencement', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          />
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={validateAndNext}
          className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
        >
          Next: Proprietor Details →
        </button>
      </div>
    </div>
  );
}

// Step 2: Basic Proprietor Details
export function BasicProprietorDetailsContent({ formData, onChange, onBack, onSubmit, isSubmitting }) {
  const [data, setData] = useState({
    proprietorName: formData.proprietorName || '',
    dateOfBirth: formData.dateOfBirth || '',
    occupationType: formData.occupationType || '',
    proprietorEmail: formData.proprietorEmail || '',
    proprietorContact: formData.proprietorContact || '',
    permanentAddressLine1: formData.permanentAddressLine1 || '',
    permanentAddressLine2: formData.permanentAddressLine2 || '',
    permanentCity: formData.permanentCity || '',
    permanentState: formData.permanentState || '',
    permanentCountry: formData.permanentCountry || 'India',
    permanentPincode: formData.permanentPincode || '',
    aadhaarCard: formData.aadhaarCard || null,
    passportPhoto: formData.passportPhoto || null,
    panCard: formData.panCard || null,
    bankStatement: formData.bankStatement || null,
    nameBoard: formData.nameBoard || null
  });

  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    onChange(updatedData);
  };

  const handleFileChange = async (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAndSubmit = () => {
    // Basic validation
    if (!data.proprietorName || !data.dateOfBirth || !data.occupationType || !data.proprietorEmail || !data.proprietorContact) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!data.permanentAddressLine1 || !data.permanentCity || !data.permanentState || !data.permanentPincode) {
      alert('Please complete the address details');
      return;
    }

    onSubmit();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Section 2: Basic Proprietor Details
      </h2>

      {/* Proprietor Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name of Proprietor <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Enter the name as per the PAN card
        </p>
        <input
          type="text"
          value={data.proprietorName}
          onChange={(e) => handleChange('proprietorName', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          placeholder="Enter name as per PAN card"
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Please match date as per PAN card
        </p>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        />
      </div>

      {/* Occupation Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Occupation Type <span className="text-red-500">*</span>
        </label>
        <select
          value={data.occupationType}
          onChange={(e) => handleChange('occupationType', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        >
          <option value="">Select occupation type</option>
          <option value="Business">Business</option>
          <option value="Professional">Professional</option>
          <option value="Government Employment">Government Employment</option>
          <option value="Private Employment">Private Employment</option>
          <option value="Housewife">Housewife</option>
          <option value="Student">Student</option>
        </select>
      </div>

      {/* Proprietor Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email ID of the Proprietor <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={data.proprietorEmail}
          onChange={(e) => handleChange('proprietorEmail', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
          placeholder="proprietor@example.com"
        />
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Number <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Provide a contact number for government communication
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value="+91"
            disabled
            className="w-20 px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
          <input
            type="tel"
            value={data.proprietorContact}
            onChange={(e) => handleChange('proprietorContact', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
            placeholder="9876543210"
            maxLength="10"
          />
        </div>
      </div>

      {/* Permanent Address */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-3">
          Permanent Address
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.permanentAddressLine1}
              onChange={(e) => handleChange('permanentAddressLine1', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Building, Street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={data.permanentAddressLine2}
              onChange={(e) => handleChange('permanentAddressLine2', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              placeholder="Area, Landmark (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.permanentCity}
                onChange={(e) => handleChange('permanentCity', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={data.permanentState}
                onChange={(e) => handleChange('permanentState', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={data.permanentCountry}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.permanentPincode}
                onChange={(e) => handleChange('permanentPincode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
                placeholder="560001"
                maxLength="6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aadhaar Card */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aadhaar Card <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange('aadhaarCard', e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        />
      </div>

      {/* Passport Size Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Passport Size Photo <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(e) => handleFileChange('passportPhoto', e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        />
      </div>

      {/* PAN Card */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          PAN Card Photo <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange('panCard', e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        />
      </div>

      {/* Bank Statement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Most Recent Bank Statement <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Bank statement should be within the last month
        </p>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileChange('bankStatement', e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        />
      </div>

      {/* Name Board (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name board of the premises (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Please attach the photo of the name board of your premises in Telugu
        </p>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(e) => handleFileChange('nameBoard', e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00486D]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={validateAndSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(to right, #01334C, #00486D)' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </div>
    </div>
  );
}

