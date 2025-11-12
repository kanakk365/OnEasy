import React, { useState } from 'react';
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
  'Ladakh',
  'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Jammu and Kashmir',
  'Lakshadweep'
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
export function BasicBusinessDetailsContent({ formData, setFormData }) {
  const step1 = formData.step1 || {};

  const updateStep1 = (field, value) => {
    setFormData({
      ...formData,
      step1: {
        ...step1,
        [field]: value
      }
    });
  };

  const handleFileUpload = async (field, file) => {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        updateStep1(field, base64);
      } catch (error) {
        console.error('Error converting file:', error);
        alert('Failed to upload file. Please try again.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      {/* Business Name and Nature - Two Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Name of the Business" required>
          <input
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            placeholder="Enter business name"
            value={step1.businessName || ''}
            onChange={(e) => updateStep1('businessName', e.target.value)}
          />
        </Field>

        <Field label="Business Email" required>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            placeholder="Enter business email"
            value={step1.businessEmail || ''}
            onChange={(e) => updateStep1('businessEmail', e.target.value)}
          />
        </Field>
      </div>

      {/* Nature of Business - Full Width */}
      <Field label="Nature of the Business" required>
        <textarea
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none"
          placeholder="Describe the main line of activity briefly"
          value={step1.natureOfBusiness || ''}
          onChange={(e) => updateStep1('natureOfBusiness', e.target.value)}
        />
      </Field>

      {/* Contact Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Business Contact Number" required>
          <div className="flex gap-2">
            <input
              type="text"
              value="+91"
              disabled
              className="w-16 px-3 py-3 rounded-lg bg-gray-100 text-center outline-none"
            />
            <input
              type="tel"
              className="flex-1 px-4 py-3 rounded-lg bg-white outline-none"
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
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Male"
              value={step1.maleEmployees || ''}
              onChange={(e) => updateStep1('maleEmployees', e.target.value)}
              min="0"
            />
            <input
              type="number"
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
          <Field label="Address Line 1" required>
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Building, Street"
              value={step1.addressLine1 || ''}
              onChange={(e) => updateStep1('addressLine1', e.target.value)}
            />
          </Field>

          <Field label="Address Line 2">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Area, Landmark"
              value={step1.addressLine2 || ''}
              onChange={(e) => updateStep1('addressLine2', e.target.value)}
            />
          </Field>

          <Field label="City" required>
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Enter city"
              value={step1.city || ''}
              onChange={(e) => updateStep1('city', e.target.value)}
            />
          </Field>

          <Field label="State" required>
            <CustomDropdown
              options={INDIAN_STATES}
              value={step1.state || ''}
              onChange={(value) => updateStep1('state', value)}
              placeholder="Select State"
            />
          </Field>

          <Field label="Country">
            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-100 outline-none"
              value="India"
              disabled
            />
          </Field>

          <Field label="Pin Code" required>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
          required
          accept=".pdf,.jpg,.jpeg,.png"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('utilityBill', file)}
          value={step1.utilityBill}
        />

        <FileUploadField
          label="Rental Agreement/Affidavit"
          required
          accept=".pdf"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('rentalAgreement', file)}
          value={step1.rentalAgreement}
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
          />
        </Field>

        <Field label="Social Category of the Entrepreneur">
          <CustomDropdown
            options={SOCIAL_CATEGORIES}
            value={step1.socialCategory || ''}
            onChange={(value) => updateStep1('socialCategory', value)}
            placeholder="Select Category"
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
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Enter bank name"
              value={step1.bankName || ''}
              onChange={(e) => updateStep1('bankName', e.target.value)}
            />
          </Field>

          <Field label="Bank Account Number">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Enter account number"
              value={step1.bankAccountNumber || ''}
              onChange={(e) => updateStep1('bankAccountNumber', e.target.value)}
            />
          </Field>

          <Field label="IFSC Code">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
            />
          </Field>

          {step1.hasGSTIN && (
            <Field label="GSTIN Number">
              <input
                className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
          <Field label="Date of Incorporation/Registration" required>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
            />
          </Field>

          {step1.businessCommenced && (
            <Field label="Date of Commencement of Business" required>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// Step 2: Basic Proprietor Details
export function BasicProprietorDetailsContent({ formData, setFormData }) {
  const step2 = formData.step2 || {};

  const updateStep2 = (field, value) => {
    setFormData({
      ...formData,
      step2: {
        ...step2,
        [field]: value
      }
    });
  };

  const handleFileUpload = async (field, file) => {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        updateStep2(field, base64);
      } catch (error) {
        console.error('Error converting file:', error);
        alert('Failed to upload file. Please try again.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      {/* Proprietor Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Name of Proprietor" required>
          <input
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            placeholder="Enter name as per PAN card"
            value={step2.proprietorName || ''}
            onChange={(e) => updateStep2('proprietorName', e.target.value)}
          />
        </Field>

        <Field label="Date of Birth" required>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            value={step2.dateOfBirth || ''}
            onChange={(e) => updateStep2('dateOfBirth', e.target.value)}
          />
        </Field>

        <Field label="Occupation Type" required>
          <CustomDropdown
            options={OCCUPATION_TYPES}
            value={step2.occupationType || ''}
            onChange={(value) => updateStep2('occupationType', value)}
            placeholder="Select occupation type"
          />
        </Field>

        <Field label="Email ID of the Proprietor" required>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            placeholder="Enter email address"
            value={step2.proprietorEmail || ''}
            onChange={(e) => updateStep2('proprietorEmail', e.target.value)}
          />
        </Field>
      </div>

      {/* Contact Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Contact Number" required>
          <div className="flex gap-2">
            <input
              type="text"
              value="+91"
              disabled
              className="w-16 px-3 py-3 rounded-lg bg-gray-100 text-center outline-none"
            />
            <input
              type="tel"
              className="flex-1 px-4 py-3 rounded-lg bg-white outline-none"
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
          <Field label="Address Line 1" required>
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Building, Street"
              value={step2.permanentAddressLine1 || ''}
              onChange={(e) => updateStep2('permanentAddressLine1', e.target.value)}
            />
          </Field>

          <Field label="Address Line 2">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Area, Landmark (optional)"
              value={step2.permanentAddressLine2 || ''}
              onChange={(e) => updateStep2('permanentAddressLine2', e.target.value)}
            />
          </Field>

          <Field label="City" required>
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
              placeholder="Enter city"
              value={step2.permanentCity || ''}
              onChange={(e) => updateStep2('permanentCity', e.target.value)}
            />
          </Field>

          <Field label="State" required>
            <CustomDropdown
              options={INDIAN_STATES}
              value={step2.permanentState || ''}
              onChange={(value) => updateStep2('permanentState', value)}
              placeholder="Select State"
            />
          </Field>

          <Field label="Country">
            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-100 outline-none"
              value="India"
              disabled
            />
          </Field>

          <Field label="Pin Code" required>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
          required
          accept=".pdf,.jpg,.jpeg,.png"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('aadhaarCard', file)}
          value={step2.aadhaarCard}
        />

        <FileUploadField
          label="Passport Size Photo"
          required
          accept=".jpg,.jpeg,.png"
          placeholder="Upload Photo in JPG, JPEG"
          onChange={(file) => handleFileUpload('passportPhoto', file)}
          value={step2.passportPhoto}
        />

        <FileUploadField
          label="PAN Card Photo"
          required
          accept=".pdf,.jpg,.jpeg,.png"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('panCard', file)}
          value={step2.panCard}
        />

        <FileUploadField
          label="Most Recent Bank Statement"
          required
          accept=".pdf"
          placeholder="Upload Doc in PDF"
          onChange={(file) => handleFileUpload('bankStatement', file)}
          value={step2.bankStatement}
        />

        <FileUploadField
          label="Name board of the premises (Optional)"
          accept=".jpg,.jpeg,.png"
          placeholder="Upload Photo in JPG, JPEG"
          onChange={(file) => handleFileUpload('nameBoard', file)}
          value={step2.nameBoard}
        />
      </div>
    </div>
  );
}

