import React from 'react';
import Field from './Field';
import CustomDropdown from './CustomDropdown';
import FileUploadField from './FileUploadField';

import { uploadFileDirect } from '../../utils/s3Upload';
import { AUTH_CONFIG } from '../../config/auth';

// Helper to get user ID and ticket ID for S3 folder path
const getUploadFolder = (ticketId = null) => {
  const currentTicketId = ticketId || 
    localStorage.getItem('editingTicketId') || 
    localStorage.getItem('fillingOnBehalfTicketId') ||
    new URLSearchParams(window.location.search).get('ticketId') ||
    'temp';
  
  return `gst/${currentTicketId}`;
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

const BUSINESS_CONSTITUTION = [
  'Limited Liability Partnership',
  'Partnership Firm',
  'Private Limited Company',
  'Proprietorship Firm',
  'Public Limited Company',
  'Private Limited Company (OPC)'
];

// Step 1: Basic Business Details
export function Step1Content({ formData, setFormData, disabled = false }) {
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
    try {
      const folder = getUploadFolder();
      const fileName = file.name || `${field}.pdf`;
      const { s3Url } = await uploadFileDirect(file, folder, fileName);
      updateStep1(field, s3Url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  // Check if Company or LLP is selected
  const isCompanyOrLLP = step1.constitutionOfBusiness === 'Private Limited Company' || 
                         step1.constitutionOfBusiness === 'Public Limited Company' ||
                         step1.constitutionOfBusiness === 'Private Limited Company (OPC)' ||
                         step1.constitutionOfBusiness === 'Limited Liability Partnership';
  
  // Check if Partnership Firm is selected
  const isPartnershipFirm = step1.constitutionOfBusiness === 'Partnership Firm';

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[#28303F] mb-6">
        Section 1: Basic Business Details
      </h2>

      {/* Basic Information */}
      <div className="space-y-6">
        <Field label="Legal Name of the Business" required>
          <input
            type="text"
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Proposed name of the business (As per PAN in case of Business Other than Proprietorship, Partnership Firm)"
            value={step1.businessName || ''}
            onChange={(e) => updateStep1('businessName', e.target.value)}
          />
        </Field>

        <Field label="Trade Name of the Business">
          <input
            type="text"
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter trade name if different from legal name"
            value={step1.tradeName || ''}
            onChange={(e) => updateStep1('tradeName', e.target.value)}
          />
        </Field>

        <Field label="Nature of the Business" required>
          <textarea
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] min-h-[100px] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Describe the main line of activity in brief"
            value={step1.natureOfBusiness || ''}
            onChange={(e) => updateStep1('natureOfBusiness', e.target.value)}
          />
        </Field>

        <Field label="Constitution of the Business" required>
          <CustomDropdown
            options={BUSINESS_CONSTITUTION}
            value={step1.constitutionOfBusiness || ''}
            onChange={(value) => updateStep1('constitutionOfBusiness', value)}
            placeholder="Select Constitution"
            disabled={disabled}
          />
        </Field>

        <Field label="Email Address of the business" required>
          <input
            type="email"
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Provide an official email address for government communication"
            value={step1.businessEmail || ''}
            onChange={(e) => updateStep1('businessEmail', e.target.value)}
          />
        </Field>

        <Field label="Contact Number" required>
          <div className="flex">
            <span className="px-4 py-3 bg-gray-100 rounded-l-lg border border-r-0 border-gray-200 text-gray-700">
              +91
            </span>
            <input
              type="tel"
              disabled={disabled}
              className={`flex-1 px-4 py-3 rounded-r-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Provide a contact number for government communication"
              value={step1.contactNumber || ''}
              onChange={(e) => updateStep1('contactNumber', e.target.value)}
              maxLength={10}
            />
          </div>
        </Field>
      </div>

      {/* Complete Address of the Business Registered Office */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Complete Address of the Business Registered Office
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Address Line 1" required>
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter full address matching a recent utility bill"
              value={step1.addressLine1 || ''}
              onChange={(e) => updateStep1('addressLine1', e.target.value)}
            />
          </Field>

          <Field label="Address Line 2">
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Area, Landmark"
              value={step1.addressLine2 || ''}
              onChange={(e) => updateStep1('addressLine2', e.target.value)}
            />
          </Field>

          <Field label="City" required>
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
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
              disabled={disabled}
            />
          </Field>

          <Field label="Country">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-gray-100 outline-none border border-gray-200"
              value="India"
              disabled
            />
          </Field>

          <Field label="Pin Code" required>
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter pin code"
              value={step1.pincode || ''}
              onChange={(e) => updateStep1('pincode', e.target.value)}
              maxLength={6}
            />
          </Field>
        </div>
      </div>

      {/* Additional Place of Business */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Additional Place of Business (If any)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Address Line 1">
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter full address matching a recent utility bill"
              value={step1.additionalAddressLine1 || ''}
              onChange={(e) => updateStep1('additionalAddressLine1', e.target.value)}
            />
          </Field>

          <Field label="Address Line 2">
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Area, Landmark"
              value={step1.additionalAddressLine2 || ''}
              onChange={(e) => updateStep1('additionalAddressLine2', e.target.value)}
            />
          </Field>

          <Field label="City">
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter city"
              value={step1.additionalCity || ''}
              onChange={(e) => updateStep1('additionalCity', e.target.value)}
            />
          </Field>

          <Field label="State">
            <CustomDropdown
              options={INDIAN_STATES}
              value={step1.additionalState || ''}
              onChange={(value) => updateStep1('additionalState', value)}
              placeholder="Select State"
              disabled={disabled}
            />
          </Field>

          <Field label="Pin Code">
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter pin code"
              value={step1.additionalPincode || ''}
              onChange={(e) => updateStep1('additionalPincode', e.target.value)}
              maxLength={6}
            />
          </Field>
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Documents
        </h3>
        
        <div className="space-y-6">
          <FileUploadField
            label="Electricity Bill for Registered Office"
            buttonLabel="Upload Electricity Bill (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileUpload('electricityBill', file)}
            required
            disabled={disabled}
          />
          {step1.electricityBill && (
            <p className="text-xs text-gray-500 -mt-4">
              Note: The whole Address in Electricity bill must be presented in Rental Agreement.
            </p>
          )}

          <FileUploadField
            label="Property Tax for Registered Office"
            buttonLabel="Upload Property Tax Receipt (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileUpload('propertyTax', file)}
            required
            disabled={disabled}
          />

          <FileUploadField
            label="Rental Agreement/ Sale Deed/ Affidavit"
            buttonLabel="Upload Rental Agreement (PDF)"
            accept=".pdf"
            onFileSelect={(file) => handleFileUpload('rentalAgreement', file)}
            required
            disabled={disabled}
          />
          {step1.rentalAgreement && (
            <p className="text-xs text-gray-500 -mt-4">
              Note: Rental Agreement/ Affidavit must be signed by both Tenant and Landlord on all the pages, Witness details must be entered Name, Phone Number, Signature, Aadhar Number and Address. Rental Agreement must be on Bond Paper and must be notarized mandatorily.
            </p>
          )}

          <FileUploadField
            label="PAN Card of the Landlord"
            buttonLabel="Upload Landlord PAN Card (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileUpload('landlordPanCard', file)}
            required
            disabled={disabled}
          />

          <FileUploadField
            label="Aadhar Card of the Landlord"
            buttonLabel="Upload Landlord Aadhar Card (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileUpload('landlordAadhaarCard', file)}
            required
            disabled={disabled}
          />

          <FileUploadField
            label="PAN Card of the Business entity/ Proprietor"
            buttonLabel="Upload Business PAN Card (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileUpload('businessPanCard', file)}
            required
            disabled={disabled}
          />

          <FileUploadField
            label="Picture of Principal Place of Business"
            buttonLabel="Upload Photo (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileUpload('principalPlacePhoto', file)}
            required
            disabled={disabled}
          />

          <FileUploadField
            label="Bank Statement of the Business"
            buttonLabel="Upload Bank Statement (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileUpload('businessBankStatement', file)}
            required
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 -mt-4">
            Current Account in the name of the entity as mentioned as per PAN
          </p>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Number of Directors/Partners/ Members" required>
          <CustomDropdown
            options={['1', '2', '3', '4', '5']}
            value={String(step1.numberOfDirectorsPartners || 1)}
            onChange={(value) => {
              const numValue = parseInt(value) || 1;
              updateStep1('numberOfDirectorsPartners', numValue);
              // Update directors array in step2
              const step2 = formData.step2 || { directors: [] };
              const currentDirectors = step2.directors || [];
              const newDirectors = [];
              for (let i = 0; i < numValue; i++) {
                newDirectors.push(currentDirectors[i] || {
                  name: '',
                  isAuthorizedSignatory: 'No',
                  aadhaarCard: '',
                  passportPhoto: '',
                  panCard: '',
                  email: '',
                  mobileNumber: ''
                });
              }
              setFormData({
                ...formData,
                step1: { ...step1, numberOfDirectorsPartners: numValue },
                step2: { ...step2, directors: newDirectors }
              });
            }}
            placeholder="Select number"
            disabled={disabled}
          />
        </Field>

        {isCompanyOrLLP && (
          <Field label="CIN /LLP Number" required>
            <input
              type="text"
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter CIN/LLP Number"
              value={step1.cinLlpNumber || ''}
              onChange={(e) => updateStep1('cinLlpNumber', e.target.value)}
            />
          </Field>
        )}

        {isPartnershipFirm && (
          <FileUploadField
            label="Partnership Deed"
            buttonLabel="Upload Partnership Deed (PDF)"
            accept=".pdf"
            onFileSelect={(file) => handleFileUpload('partnershipDeed', file)}
            required
            disabled={disabled}
          />
        )}

        {isCompanyOrLLP && (
          <FileUploadField
            label="Certificate of Incorporation"
            buttonLabel="Upload Certificate (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelect={(file) => handleFileUpload('certificateOfIncorporation', file)}
            required
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

// Step 2: Proprietor/Partner/Director Details
export function Step2Content({ formData, setFormData, disabled = false }) {
  const step2 = formData.step2 || { directors: [] };
  const step1 = formData.step1 || {};
  const numberOfDirectors = step1.numberOfDirectorsPartners || 1;
  
  // Ensure directors array matches the number
  const directors = step2.directors || [];
  while (directors.length < numberOfDirectors) {
    directors.push({
      name: '',
      isAuthorizedSignatory: 'No',
      aadhaarCard: '',
      passportPhoto: '',
      panCard: '',
      email: '',
      mobileNumber: ''
    });
  }

  const updateDirector = (index, field, value) => {
    const newDirectors = [...directors];
    newDirectors[index] = {
      ...newDirectors[index],
      [field]: value
    };
    
    // If Authorized Signatory is set to "Yes" for one, disable others
    if (field === 'isAuthorizedSignatory' && value === 'Yes') {
      newDirectors.forEach((dir, idx) => {
        if (idx !== index) {
          dir.isAuthorizedSignatory = 'No';
        }
      });
    }
    
    setFormData({
      ...formData,
      step2: {
        ...step2,
        directors: newDirectors
      }
    });
  };

  const handleFileUpload = async (index, field, file) => {
    try {
      const folder = getUploadFolder();
      const fileName = file.name || `${field}-${index}.pdf`;
      const { s3Url } = await uploadFileDirect(file, folder, fileName);
      updateDirector(index, field, s3Url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  // Check if any director is already authorized signatory
  const hasAuthorizedSignatory = directors.some(dir => dir.isAuthorizedSignatory === 'Yes');
  const isProprietorship = step1.constitutionOfBusiness === 'Proprietorship Firm';

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[#28303F] mb-6">
        Section 2: Basic Proprietor/Partner/Director Details
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {isProprietorship 
          ? 'Note: In case of proprietor the default section is 1.'
          : `Based on the number of directors/Partners selected (${numberOfDirectors}), please fill the details below.`
        }
      </p>

      {directors.map((director, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-6 mb-6">
          <h3 className="text-lg font-medium text-[#28303F] mb-4">
            {isProprietorship ? 'Proprietor' : `Director/Partner ${index + 1}`} Details
          </h3>

          {/* Director/Partner Information Section */}
          <div className="space-y-6">
            <h4 className="text-base font-semibold text-[#28303F] mb-4 pb-2 border-b border-gray-300">
              {isProprietorship ? 'Proprietor' : 'Director/Partner'} Information
            </h4>

            <Field label="Name of the Proprietor/ Managing Director/ Managing Partner" required>
              <input
                type="text"
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Enter the name as per the PAN card"
                value={director.name || ''}
                onChange={(e) => updateDirector(index, 'name', e.target.value)}
              />
            </Field>

            <Field label="Email ID of the Proprietor/ Managing Director/ Managing Partner" required>
              <input
                type="email"
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Enter email address"
                value={director.email || ''}
                onChange={(e) => updateDirector(index, 'email', e.target.value)}
              />
            </Field>

            <Field label="Mobile Number" required>
              <input
                type="tel"
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="Enter mobile number"
                value={director.mobileNumber || ''}
                onChange={(e) => updateDirector(index, 'mobileNumber', e.target.value)}
                maxLength={10}
              />
            </Field>
          </div>

          {/* Director/Partner Documents Section */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h4 className="text-base font-semibold text-[#28303F] mb-4 pb-2 border-b border-gray-300">
              {isProprietorship ? 'Proprietor' : 'Director/Partner'} Documents
            </h4>

            <FileUploadField
              label="Aadhaar Card"
              buttonLabel="Upload Aadhaar Card"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelect={(file) => handleFileUpload(index, 'aadhaarCard', file)}
              required
              disabled={disabled}
            />

            <FileUploadField
              label="Passport Size Photo"
              buttonLabel="Upload Passport Size Photo"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelect={(file) => handleFileUpload(index, 'passportPhoto', file)}
              required
              disabled={disabled}
            />

            <FileUploadField
              label="PAN Card Photo"
              buttonLabel="Upload PAN Card"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelect={(file) => handleFileUpload(index, 'panCard', file)}
              required
              disabled={disabled}
            />
          </div>

          {/* Authorized Signatory Section */}
          {!isProprietorship && (
            <>
              <div className="space-y-6 pt-6 border-t-2 border-gray-400">
                <h4 className="text-base font-semibold text-[#28303F] mb-4 pb-2 border-b border-gray-300">
                  Authorized Signatory
                </h4>

                <Field label="Is this person an Authorised Signatory? (Not required for Proprietorship)">
                  <CustomDropdown
                    options={['Yes', 'No']}
                    value={director.isAuthorizedSignatory || 'No'}
                    onChange={(value) => updateDirector(index, 'isAuthorizedSignatory', value)}
                    placeholder="Select"
                    disabled={disabled || (hasAuthorizedSignatory && director.isAuthorizedSignatory !== 'Yes')}
                  />
                  {hasAuthorizedSignatory && director.isAuthorizedSignatory !== 'Yes' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Another director/partner is already set as Authorized Signatory
                    </p>
                  )}
                </Field>
              </div>

              {director.isAuthorizedSignatory === 'Yes' && (
                <div className="space-y-6 pt-6 border-t-2 border-[#00486D] bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#00486D] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Authorized Signatory Details
                  </h4>

                  {/* Authorized Signatory Information */}
                  <div className="space-y-6 mb-6">
                    <h5 className="text-sm font-semibold text-[#00486D] mb-4">
                      Personal Information
                    </h5>
                    
                    <Field label="Name of the authorised person" required>
                      <input
                        type="text"
                        disabled={disabled}
                        className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Enter name of the authorised person"
                        value={director.authorizedPersonName || ''}
                        onChange={(e) => updateDirector(index, 'authorizedPersonName', e.target.value)}
                      />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="Mobile" required>
                        <input
                          type="tel"
                          disabled={disabled}
                          className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          placeholder="Enter mobile number"
                          value={director.authorizedPersonMobile || ''}
                          onChange={(e) => updateDirector(index, 'authorizedPersonMobile', e.target.value)}
                          maxLength={10}
                        />
                      </Field>

                      <Field label="Email" required>
                        <input
                          type="email"
                          disabled={disabled}
                          className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          placeholder="Enter email address"
                          value={director.authorizedPersonEmail || ''}
                          onChange={(e) => updateDirector(index, 'authorizedPersonEmail', e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Designation" required>
                      <input
                        type="text"
                        disabled={disabled}
                        className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Enter designation"
                        value={director.authorizedPersonDesignation || ''}
                        onChange={(e) => updateDirector(index, 'authorizedPersonDesignation', e.target.value)}
                      />
                    </Field>
                  </div>

                  {/* Authorized Signatory Documents */}
                  <div className="space-y-6 pt-6 border-t border-blue-200">
                    <h5 className="text-sm font-semibold text-[#00486D] mb-4">
                      Authorized Signatory Documents
                    </h5>

                    <FileUploadField
                      label="Photo"
                      buttonLabel="Upload Photo"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onFileSelect={(file) => handleFileUpload(index, 'authorizedPersonPhoto', file)}
                      required
                      disabled={disabled}
                    />

                    <FileUploadField
                      label="PAN"
                      buttonLabel="Upload PAN Card"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onFileSelect={(file) => handleFileUpload(index, 'authorizedPersonPAN', file)}
                      required
                      disabled={disabled}
                    />

                    <FileUploadField
                      label="Aadhar"
                      buttonLabel="Upload Aadhar Card"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onFileSelect={(file) => handleFileUpload(index, 'authorizedPersonAadhar', file)}
                      required
                      disabled={disabled}
                    />

                    <FileUploadField
                      label="Bank Statement"
                      buttonLabel="Upload Bank Statement"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onFileSelect={(file) => handleFileUpload(index, 'authorizedPersonBankStatement', file)}
                      required
                      disabled={disabled}
                    />

                    <FileUploadField
                      label="Letter of Authorization"
                      buttonLabel="Upload Letter of Authorization (PDF)"
                      accept=".pdf"
                      onFileSelect={(file) => handleFileUpload(index, 'authorizationLetter', file)}
                      required
                      disabled={disabled}
                    />

                    <Field label="Optional Field 1">
                      <input
                        type="text"
                        disabled={disabled}
                        className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-gray-200 focus:border-[#00486D] ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Enter optional information"
                        value={director.authorizedPersonOptionalField1 || ''}
                        onChange={(e) => updateDirector(index, 'authorizedPersonOptionalField1', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

