import React from 'react';
import Field from '../Field';
import CustomDropdown from '../CustomDropdown';
import FileUploadField from '../FileUploadField';

// Helper to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Indian States and Union Territories List
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Puducherry',
  'Chandigarh',
  'Ladakh'
];

const BUSINESS_TYPES = [
  'Manufacturing',
  'Trading - Whole Sale',
  'Trading - Retail Trade',
  'Services'
];

const SOCIAL_CATEGORIES = ['General', 'SC', 'ST', 'OBC'];

const OCCUPATION_TYPES = [
  'Business',
  'Professional',
  'Government Employment',
  'Private Employment',
  'Housewife',
  'Student'
];

// Step 1: Basic Business Details
export function BasicBusinessDetailsContent({ formData, setFormData, disabled = false }) {
  const step1 = formData.step1 || {};

  const updateStep1 = (field, value) => {
    if (disabled) return;
    setFormData({
      ...formData,
      step1: {
        ...step1,
        [field]: value
      }
    });
  };

  const handleFileUpload = async (field, file) => {
    if (disabled || !file) return;
      try {
        const base64 = await fileToBase64(file);
        updateStep1(field, base64);
      } catch (error) {
        console.error('Error converting file:', error);
        alert('Failed to upload file. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      {/* Business Name and Nature - Two Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Name of the Business">
          <input
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter business name"
            value={step1.businessName || ''}
            onChange={(e) => updateStep1('businessName', e.target.value)}
          />
        </Field>

        <Field label="Business Email">
          <input
            type="email"
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter business email"
            value={step1.businessEmail || ''}
            onChange={(e) => updateStep1('businessEmail', e.target.value)}
          />
        </Field>
      </div>

      {/* Nature of Business - Full Width */}
      <Field label="Nature of the Business">
        <textarea
          rows={4}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none resize-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Describe the main line of activity briefly"
          value={step1.natureOfBusiness || ''}
          onChange={(e) => updateStep1('natureOfBusiness', e.target.value)}
        />
      </Field>

      {/* Contact Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Business Contact Number">
          <div className="flex gap-2">
            <input
              type="text"
              value="+91"
              disabled
              className="w-16 px-3 py-3 rounded-lg bg-gray-100 text-center outline-none"
            />
            <input
              type="tel"
              disabled={disabled}
              className={`flex-1 px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter contact number"
              value={step1.contactNumber || ''}
              onChange={(e) => updateStep1('contactNumber', e.target.value)}
              maxLength="10"
            />
          </div>
        </Field>

        <Field label="Number of Employees">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Male"
              value={step1.maleEmployees || ''}
              onChange={(e) => updateStep1('maleEmployees', e.target.value)}
              min="0"
            />
            <input
              type="number"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Female"
              value={step1.femaleEmployees || ''}
              onChange={(e) => updateStep1('femaleEmployees', e.target.value)}
              min="0"
            />
          </div>
        </Field>
      </div>

      {/* Address Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Complete Address of the Proposed Registered Office
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Address Line 1">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Building, Street"
              value={step1.addressLine1 || ''}
              onChange={(e) => updateStep1('addressLine1', e.target.value)}
            />
          </Field>

          <Field label="Address Line 2">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Area, Landmark"
              value={step1.addressLine2 || ''}
              onChange={(e) => updateStep1('addressLine2', e.target.value)}
            />
          </Field>

          <Field label="City">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter city"
              value={step1.city || ''}
              onChange={(e) => updateStep1('city', e.target.value)}
            />
          </Field>

          <Field label="State">
            <CustomDropdown
              options={INDIAN_STATES}
              value={step1.state || ''}
              onChange={(value) => updateStep1('state', value)}
              placeholder="Select State"
              disabled={disabled}
            />
          </Field>

          <Field label="Country">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              value="India"
              disabled
            />
          </Field>

          <Field label="Pin Code">
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter pin code"
              value={step1.pincode || ''}
              onChange={(e) => updateStep1('pincode', e.target.value)}
              maxLength="6"
            />
          </Field>
        </div>
      </div>

      {/* Document Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadField
          label="Utility Bill (Electricity Bill or Similar)"
          accept=".pdf,.jpg,.jpeg,.png"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('utilityBill', file)}
          value={step1.utilityBill}
          disabled={disabled}
        />

        <FileUploadField
          label="Rental Agreement/Affidavit"
          accept=".pdf"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('rentalAgreement', file)}
          value={step1.rentalAgreement}
          disabled={disabled}
        />
      </div>

      {/* Business Type and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Business Type">
          <CustomDropdown
            options={BUSINESS_TYPES}
            value={step1.businessType || ''}
            onChange={(value) => updateStep1('businessType', value)}
            placeholder="Select Business Type"
            disabled={disabled}
          />
        </Field>

        <Field label="Social Category of the Entrepreneur">
          <CustomDropdown
            options={SOCIAL_CATEGORIES}
            value={step1.socialCategory || ''}
            onChange={(value) => updateStep1('socialCategory', value)}
            placeholder="Select Category"
            disabled={disabled}
          />
        </Field>
      </div>

      {/* Bank Details */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Bank Account Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Bank Name">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter bank name"
              value={step1.bankName || ''}
              onChange={(e) => updateStep1('bankName', e.target.value)}
            />
          </Field>

          <Field label="Bank Account Number">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter account number"
              value={step1.bankAccountNumber || ''}
              onChange={(e) => updateStep1('bankAccountNumber', e.target.value)}
            />
          </Field>

          <Field label="IFSC Code">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter IFSC code"
              value={step1.ifscCode || ''}
              onChange={(e) => updateStep1('ifscCode', e.target.value)}
            />
          </Field>

          <Field label="Do you have GSTIN Number?">
            <CustomDropdown
              options={['Yes', 'No']}
              value={step1.hasGSTIN ? 'Yes' : 'No'}
              onChange={(value) => updateStep1('hasGSTIN', value === 'Yes')}
              placeholder="Select Yes or No"
              disabled={disabled}
            />
          </Field>

          {step1.hasGSTIN && (
            <Field label="GSTIN Number">
              <input
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Enter GSTIN number"
                value={step1.gstinNumber || ''}
                onChange={(e) => updateStep1('gstinNumber', e.target.value)}
              />
            </Field>
          )}
        </div>
      </div>

      {/* Status of Enterprise */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Status of Enterprise
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Date of Incorporation/Registration">
            <input
              type="date"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              value={step1.dateOfIncorporation || ''}
              onChange={(e) => updateStep1('dateOfIncorporation', e.target.value)}
            />
          </Field>

          <Field label="Whether production/Business commenced">
            <CustomDropdown
              options={['Yes', 'No']}
              value={step1.businessCommenced ? 'Yes' : 'No'}
              onChange={(value) => updateStep1('businessCommenced', value === 'Yes')}
              placeholder="Select Yes or No"
              disabled={disabled}
            />
          </Field>

          {step1.businessCommenced && (
            <Field label="Date of Commencement of Business">
              <input
                type="date"
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                value={step1.dateOfCommencement || ''}
                onChange={(e) => updateStep1('dateOfCommencement', e.target.value)}
              />
            </Field>
          )}

          <Field label="Have you filed the ITR for Previous Year?">
            <CustomDropdown
              options={['Yes', 'No']}
              value={step1.filedITR ? 'Yes' : 'No'}
              onChange={(value) => updateStep1('filedITR', value === 'Yes')}
              placeholder="Select Yes or No"
              disabled={disabled}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// Step 2: Basic Proprietor Details
export function BasicProprietorDetailsContent({ formData, setFormData, disabled = false }) {
  const step2 = formData.step2 || {};

  const updateStep2 = (field, value) => {
    if (disabled) return;
    setFormData({
      ...formData,
      step2: {
        ...step2,
        [field]: value
      }
    });
  };

  const handleFileUpload = async (field, file) => {
    if (disabled || !file) return;
      try {
        const base64 = await fileToBase64(file);
        updateStep2(field, base64);
      } catch (error) {
        console.error('Error converting file:', error);
        alert('Failed to upload file. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      {/* Proprietor Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Name of Proprietor">
          <input
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter name as per PAN card"
            value={step2.proprietorName || ''}
            onChange={(e) => updateStep2('proprietorName', e.target.value)}
          />
        </Field>

        <Field label="Date of Birth">
          <input
            type="date"
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            value={step2.dateOfBirth || ''}
            onChange={(e) => updateStep2('dateOfBirth', e.target.value)}
          />
        </Field>

        <Field label="Occupation Type">
          <CustomDropdown
            options={OCCUPATION_TYPES}
            value={step2.occupationType || ''}
            onChange={(value) => updateStep2('occupationType', value)}
            placeholder="Select occupation type"
            disabled={disabled}
          />
        </Field>

        <Field label="Email ID of the Proprietor">
          <input
            type="email"
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter email address"
            value={step2.proprietorEmail || ''}
            onChange={(e) => updateStep2('proprietorEmail', e.target.value)}
          />
        </Field>
      </div>

      {/* Contact Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Contact Number">
          <div className="flex gap-2">
            <input
              type="text"
              value="+91"
              disabled
              className="w-16 px-3 py-3 rounded-lg bg-gray-100 text-center outline-none"
            />
            <input
              type="tel"
              disabled={disabled}
              className={`flex-1 px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter contact number"
              value={step2.proprietorContact || ''}
              onChange={(e) => updateStep2('proprietorContact', e.target.value)}
              maxLength="10"
            />
          </div>
        </Field>
      </div>

      {/* Permanent Address */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Permanent Address
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Address Line 1">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Building, Street"
              value={step2.permanentAddressLine1 || ''}
              onChange={(e) => updateStep2('permanentAddressLine1', e.target.value)}
            />
          </Field>

          <Field label="Address Line 2">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Area, Landmark (optional)"
              value={step2.permanentAddressLine2 || ''}
              onChange={(e) => updateStep2('permanentAddressLine2', e.target.value)}
            />
          </Field>

          <Field label="City">
            <input
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter city"
              value={step2.permanentCity || ''}
              onChange={(e) => updateStep2('permanentCity', e.target.value)}
            />
          </Field>

          <Field label="State">
            <CustomDropdown
              options={INDIAN_STATES}
              value={step2.permanentState || ''}
              onChange={(value) => updateStep2('permanentState', value)}
              placeholder="Select State"
              disabled={disabled}
            />
          </Field>

          <Field label="Country">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              value="India"
              disabled
            />
          </Field>

          <Field label="Pin Code">
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter pin code"
              value={step2.permanentPincode || ''}
              onChange={(e) => updateStep2('permanentPincode', e.target.value)}
              maxLength="6"
            />
          </Field>
        </div>
      </div>

      {/* Document Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadField
          label="Aadhaar Card"
          accept=".pdf,.jpg,.jpeg,.png"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('aadhaarCard', file)}
          value={step2.aadhaarCard}
          disabled={disabled}
        />

        <FileUploadField
          label="Passport Size Photo"
          accept=".jpg,.jpeg,.png"
          placeholder="Upload Photo in JPG, JPEG"
          onChange={(file) => handleFileUpload('passportPhoto', file)}
          value={step2.passportPhoto}
          disabled={disabled}
        />

        <FileUploadField
          label="PAN Card Photo"
          accept=".pdf,.jpg,.jpeg,.png"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('panCard', file)}
          value={step2.panCard}
          disabled={disabled}
        />

        <FileUploadField
          label="Most Recent Bank Statement"
          accept=".pdf"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('bankStatement', file)}
          value={step2.bankStatement}
          disabled={disabled}
        />

        <FileUploadField
          label="Name board of the premises (Optional)"
          accept=".jpg,.jpeg,.png"
          placeholder="Upload Photo in JPG, JPEG"
          onChange={(file) => handleFileUpload('nameBoard', file)}
          value={step2.nameBoard}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

