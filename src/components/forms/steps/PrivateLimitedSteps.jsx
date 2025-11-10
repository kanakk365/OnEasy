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

// Step 1: Name Application (Business Details)
export function NameApplicationContent({ formData, setFormData, disabled = false }) {
  const step1 = formData.step1 || {};
  const suffix = ' Private Limited';

  const companyTypes = [
    'OPC (Private)',
    'Section 8 Company',
    'Nidhi Company',
    'Public Limited Company',
    'Private Limited Company',
    'LLP to Company',
    'Firm to Company',
  ];

  const updateStep1 = (field, value) => {
    setFormData({
      ...formData,
      step1: {
        ...step1,
        [field]: value
      }
    });
  };

  const handleBlur = (field, value) => {
    // Add suffix only if there's a value and it doesn't already have the suffix
    if (value.trim() && !value.includes(suffix)) {
      updateStep1(field, value.trim() + suffix);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      {/* Name of the Company Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Name of the Company
        </h3>
        
        {/* Name Options - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Name Option 1">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter first choice of company name"
              value={step1.nameOption1 || ''}
              onChange={(e) => updateStep1('nameOption1', e.target.value)}
              onBlur={(e) => handleBlur('nameOption1', e.target.value)}
              disabled={disabled}
            />
          </Field>

          <Field label="Name Option 2">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter second choice of company name"
              value={step1.nameOption2 || ''}
              onChange={(e) => updateStep1('nameOption2', e.target.value)}
              onBlur={(e) => handleBlur('nameOption2', e.target.value)}
              disabled={disabled}
            />
          </Field>
        </div>
      </div>

      {/* Reason for names */}
      <div className="md:col-span-2">
        <Field label="Mention any reason for the company names, if any">
          <textarea
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Optional: Explain your choice of names"
            value={step1.nameReason || ''}
            onChange={(e) => updateStep1('nameReason', e.target.value)}
            disabled={disabled}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Type of the Company">
          <CustomDropdown
            options={companyTypes}
            placeholder="Select Company Type"
            value={step1.companyType || ''}
            onChange={(value) => updateStep1('companyType', value)}
            disabled={disabled}
          />
        </Field>

        <div></div>
      </div>

      <div className="md:col-span-2">
        <Field label="Nature of the Business">
          <textarea
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Describe the main line of activity in brief"
            value={step1.natureOfBusiness || ''}
            onChange={(e) => updateStep1('natureOfBusiness', e.target.value)}
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );
}

// Step 2: Basic Company Details
export function StartupInformationContent({ formData, setFormData, disabled = false, isAdmin = false }) {
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

  const handlePaidUpCapitalChange = (value) => {
    const paidUp = parseFloat(value) || 0;
    const authorized = parseFloat(step2.authorizedCapital || 100000) || 0;
    
    if (paidUp <= authorized) {
      updateStep2('paidUpCapital', value);
    } else {
      alert('Paid-Up Capital cannot exceed Authorized Capital');
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Union Territories (Delhi, Puducherry, Chandigarh, Ladakh, etc.)'
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      {/* Number of Directors and Shareholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Number of Proposed Directors">
          <CustomDropdown
            options={['1', '2', '3']}
            placeholder="Select number of directors"
            value={formData.numberOfDirectors ? formData.numberOfDirectors.toString() : '1'}
            onChange={(value) => setFormData({ ...formData, numberOfDirectors: parseInt(value) })}
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Up to 3 New Directors (additional directors excess of 2 incur a fee of ₹1500 each for digital signature)
          </p>
        </Field>

        <Field label="Number of Proposed Shareholders">
          <CustomDropdown
            options={['1', '2', '3', '4', '5', '6']}
            placeholder="Select number of shareholders"
            value={formData.numberOfShareholders ? formData.numberOfShareholders.toString() : '1'}
            onChange={(value) => setFormData({ ...formData, numberOfShareholders: parseInt(value) })}
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Up to 6 shareholders (additional shareholders will incur a fee)
          </p>
        </Field>
      </div>

      {/* Authorized and Paid Up Capital */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Authorized Capital of the Company">
          <input
            type="number"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="₹1,00,000"
            value={step2.authorizedCapital || '100000'}
            onChange={(e) => updateStep2('authorizedCapital', e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Default: ₹1,00,000. Additional stamp duty may apply if there's any change in authorized capital.
          </p>
        </Field>

        <Field label="Paid Up Capital of the Company">
          <input
            type="number"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter paid-up capital"
            value={step2.paidUpCapital || ''}
            onChange={(e) => handlePaidUpCapitalChange(e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-red-500 mt-1">
            Note: Cannot exceed Authorized Capital
          </p>
        </Field>
      </div>

      {/* Company Email and Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Company Email Address">
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="company@example.com"
            value={step2.companyEmail || ''}
            onChange={(e) => updateStep2('companyEmail', e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Official email address for government communication
          </p>
        </Field>

        <Field label="Contact Number">
          <div className="flex gap-2">
            <input
              type="text"
              defaultValue="+91"
              className="w-20 px-4 py-3 rounded-lg bg-white outline-none"
              disabled
            />
            <input
              type="tel"
              className="flex-1 px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter contact number"
              value={step2.contactNumber || ''}
              onChange={(e) => updateStep2('contactNumber', e.target.value)}
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Contact number for government communication
          </p>
        </Field>
      </div>

      {/* Registered Office Address */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Complete Address of the Proposed Registered Office
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <Field label="Address Line 1">
            <textarea
              rows="2"
              className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter address line 1"
              value={step2.addressLine1 || ''}
              onChange={(e) => updateStep2('addressLine1', e.target.value)}
              disabled={disabled}
            />
          </Field>

          <Field label="Address Line 2">
            <textarea
              rows="2"
              className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter address line 2"
              value={step2.addressLine2 || ''}
              onChange={(e) => updateStep2('addressLine2', e.target.value)}
              disabled={disabled}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="City/Place">
              <input
                className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter city/place"
                value={step2.city || ''}
                onChange={(e) => updateStep2('city', e.target.value)}
                disabled={disabled}
              />
            </Field>

            <Field label="State">
              <CustomDropdown
                options={indianStates}
                placeholder="Select your state"
                value={step2.state || ''}
                onChange={(value) => updateStep2('state', value)}
                disabled={disabled}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Country">
              <input
                className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={step2.country || 'India'}
                onChange={(e) => updateStep2('country', e.target.value)}
                disabled={disabled}
              />
            </Field>

            <Field label="Pin Code">
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter pin code"
                value={step2.pincode || ''}
                onChange={(e) => updateStep2('pincode', e.target.value)}
                disabled={disabled}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Approved Name and Letter (Admin Only Fields) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="col-span-2">
            <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Admin Only Fields
            </p>
          </div>
          <div>
            <Field label="Approved Name of the Company">
              <input
                className="w-full px-4 py-3 rounded-lg bg-white border border-blue-300 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter approved company name"
                value={step2.approvedCompanyName || ''}
                onChange={(e) => updateStep2('approvedCompanyName', e.target.value)}
                disabled={disabled}
              />
            </Field>
            <p className="text-xs text-blue-600 mt-1">
              ℹ️ Final approved name from government
            </p>
          </div>

          <div>
            <FileUploadField
              label="Name Approval Letter"
              accept=".pdf"
              buttonLabel="Upload Name Approval Letter (PDF)"
              onFileSelect={async (file) => {
                const base64 = await fileToBase64(file);
                updateStep2('nameApprovalLetter', base64);
              }}
            />
            <p className="text-xs text-blue-600 mt-1">
              ℹ️ Upload official approval letter from government
            </p>
          </div>
        </div>
      )}

      {/* NOC From Landlord */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          NOC From Landlord
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <Field label="Date">
            <input
              type="date"
              className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={step2.nocDate || ''}
              onChange={(e) => updateStep2('nocDate', e.target.value)}
              disabled={disabled}
            />
          </Field>

          <Field label="Name of the Landlord">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter landlord's name"
              value={step2.landlordName || ''}
              onChange={(e) => updateStep2('landlordName', e.target.value)}
              disabled={disabled}
            />
          </Field>

          <Field label="Address of the Registered Premises">
            <textarea
              rows="3"
              className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter registered premises address"
              value={step2.registeredPremisesAddress || ''}
              onChange={(e) => updateStep2('registeredPremisesAddress', e.target.value)}
              disabled={disabled}
            />
          </Field>
        </div>
      </div>

      {/* Utility Bill */}
      <div>
        <FileUploadField
          label="Utility Bill (Electricity Bill or Similar) for Registered Office"
          accept=".pdf,.jpg,.jpeg,.png"
          buttonLabel="Upload Utility Bill (PDF, JPG, PNG)"
          onFileSelect={async (file) => {
            const base64 = await fileToBase64(file);
            updateStep2('utilityBill', base64);
          }}
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload a recent utility bill (not older than 1 month)
        </p>
      </div>
    </div>
  );
}

// Step 3: Basic Directors and Shareholders Details
export function OfficeAddressContent({ formData, setFormData, disabled = false }) {
  const numberOfDirectors = formData?.numberOfDirectors || 1;
  
  // Initialize directors from formData or create empty array
  const directors = formData.directors || Array.from({ length: numberOfDirectors }, () => ({}));

  // Ensure we have the right number of directors
  React.useEffect(() => {
    const currentDirectors = formData.directors || [];
    if (currentDirectors.length !== numberOfDirectors) {
      const newDirectors = Array.from({ length: numberOfDirectors }, (_, i) => 
        currentDirectors[i] || {}
      );
      setFormData({ ...formData, directors: newDirectors });
    }
  }, [numberOfDirectors]);

  const [authorizedSignatorySelected, setAuthorizedSignatorySelected] = React.useState(false);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Union Territories (Delhi, Puducherry, Chandigarh, Ladakh, etc.)'
  ];

  const updateDirector = (index, field, value) => {
    const newDirectors = [...directors];
    newDirectors[index] = {
      ...newDirectors[index],
      [field]: value
    };
    setFormData({ ...formData, directors: newDirectors });
  };

  const handleRelationChange = (index, value) => {
    updateDirector(index, 'relation', value);
  };

  const handleAuthorizedSignatoryChange = (index, value) => {
    updateDirector(index, 'isAuthorizedSignatory', value);
    if (value === 'Yes') {
      setAuthorizedSignatorySelected(true);
    } else {
      const anyYes = directors.some((d, i) => i !== index && d.isAuthorizedSignatory === 'Yes');
      setAuthorizedSignatorySelected(anyYes);
    }
  };

  const renderDirectorSection = (index) => {
    const director = directors[index] || {};
    const showShareholderFields = director.relation === 'Shareholder' || director.relation === 'Both Director and Shareholder';
    const showDesignation = director.relation !== 'Shareholder';

    return (
      <div key={index} className="border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          {director.relation === 'Shareholder' ? 'Shareholder' : 'Director'} {index + 1}
        </h3>

        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6">
          <Field label="Name of Person">
            <input
              className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter name as per PAN card"
              value={director.name || ''}
              onChange={(e) => updateDirector(index, 'name', e.target.value)}
              disabled={disabled}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Relation with the Company">
              <CustomDropdown
                options={['Director', 'Shareholder', 'Both Director and Shareholder']}
                placeholder="Select relation"
                value={director.relation || ''}
                onChange={(value) => handleRelationChange(index, value)}
                disabled={disabled}
              />
            </Field>

            {showDesignation && (
              <Field label="Designation of the Director">
                <CustomDropdown
                  options={['Director', 'Managing Director', 'Whole Time Director', 'Nominee Director']}
                  placeholder="Select designation"
                  value={director.designation || ''}
                  onChange={(value) => updateDirector(index, 'designation', value)}
                  disabled={disabled}
                />
              </Field>
            )}
          </div>

          {/* Shareholder Fields */}
          {showShareholderFields && (
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Shareholder Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Number of Shares Subscribed">
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter number of shares"
                    value={director.numberOfShares || ''}
                    onChange={(e) => updateDirector(index, 'numberOfShares', e.target.value)}
                    disabled={disabled}
                  />
                </Field>
                <Field label="Face Value of Each Share">
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter face value"
                    value={director.faceValue || ''}
                    onChange={(e) => updateDirector(index, 'faceValue', e.target.value)}
                    disabled={disabled}
                  />
                </Field>
                <Field label="Total Equity Share Capital">
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter total equity"
                    value={director.totalEquity || ''}
                    onChange={(e) => updateDirector(index, 'totalEquity', e.target.value)}
                    disabled={disabled}
                  />
                </Field>
                <Field label="% of Share Holding">
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter percentage"
                    value={director.sharePercentage || ''}
                    onChange={(e) => updateDirector(index, 'sharePercentage', e.target.value)}
                    disabled={disabled}
                  />
                </Field>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Educational Qualification">
              <CustomDropdown
                options={[
                  'Primary Education',
                  'Secondary Education',
                  "Bachelor's Degree",
                  "Master's Degree",
                  'Doctorate or Higher',
                  'Professional Diploma',
                  'Vocational Qualification'
                ]}
                placeholder="Select qualification"
                value={director.educationalQualification || ''}
                onChange={(value) => updateDirector(index, 'educationalQualification', value)}
                disabled={disabled}
              />
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={director.dateOfBirth || ''}
                onChange={(e) => updateDirector(index, 'dateOfBirth', e.target.value)}
                disabled={disabled}
              />
              <p className="text-xs text-gray-500 mt-1">Please match date as per PAN card</p>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Gender">
              <CustomDropdown
                options={['Male', 'Female', 'Transgender']}
                placeholder="Select gender"
                value={director.gender || ''}
                onChange={(value) => updateDirector(index, 'gender', value)}
                disabled={disabled}
              />
            </Field>

            <Field label="Occupation Type">
              <CustomDropdown
                options={[
                  'Business',
                  'Professional',
                  'Government Employment',
                  'Private Employment',
                  'Housewife',
                  'Student'
                ]}
                placeholder="Select occupation"
                value={director.occupationType || ''}
                onChange={(value) => updateDirector(index, 'occupationType', value)}
                disabled={disabled}
              />
            </Field>
          </div>

          {/* Place of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Place of Birth - District">
              <input
                className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter district"
                value={director.placeOfBirthDistrict || ''}
                onChange={(e) => updateDirector(index, 'placeOfBirthDistrict', e.target.value)}
                disabled={disabled}
              />
            </Field>

            <Field label="Place of Birth - State">
              <CustomDropdown
                options={indianStates}
                placeholder="Select state"
                value={director.placeOfBirthState || ''}
                onChange={(value) => updateDirector(index, 'placeOfBirthState', value)}
                disabled={disabled}
              />
            </Field>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Income Tax PAN">
              <input
                className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter PAN number"
                value={director.panNumber || ''}
                onChange={(e) => updateDirector(index, 'panNumber', e.target.value)}
                disabled={disabled}
              />
            </Field>

            <Field label="Email ID">
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter email address"
                value={director.email || ''}
                onChange={(e) => updateDirector(index, 'email', e.target.value)}
                disabled={disabled}
              />
            </Field>
          </div>

          <Field label="Contact Number">
            <div className="flex gap-2">
              <input
                type="text"
                defaultValue="+91"
                className="w-20 px-4 py-3 rounded-lg bg-white outline-none"
                disabled
              />
              <input
                type="tel"
                className="flex-1 px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter contact number"
                value={director.contactNumber || ''}
                onChange={(e) => updateDirector(index, 'contactNumber', e.target.value)}
                disabled={disabled}
              />
            </div>
          </Field>

          {/* Permanent Address */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Permanent Address</h4>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Address Line 1">
                <textarea
                  rows="2"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter address line 1"
                  value={director.permanentAddressLine1 || ''}
                  onChange={(e) => updateDirector(index, 'permanentAddressLine1', e.target.value)}
                  disabled={disabled}
                />
              </Field>

              <Field label="Address Line 2 (Optional)">
                <textarea
                  rows="2"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter address line 2"
                  value={director.permanentAddressLine2 || ''}
                  onChange={(e) => updateDirector(index, 'permanentAddressLine2', e.target.value)}
                  disabled={disabled}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="City">
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter city"
                    value={director.permanentCity || ''}
                    onChange={(e) => updateDirector(index, 'permanentCity', e.target.value)}
                    disabled={disabled}
                  />
                </Field>

                <Field label="State">
                  <CustomDropdown
                    options={indianStates}
                    placeholder="Select state"
                    value={director.permanentState || ''}
                    onChange={(value) => updateDirector(index, 'permanentState', value)}
                    disabled={disabled}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Country">
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={director.permanentCountry || 'India'}
                    onChange={(e) => updateDirector(index, 'permanentCountry', e.target.value)}
                    disabled={disabled}
                  />
                </Field>

                <Field label="Pin Code">
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter pin code"
                    value={director.permanentPincode || ''}
                    onChange={(e) => updateDirector(index, 'permanentPincode', e.target.value)}
                    disabled={disabled}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`different-address-${index}`}
                  checked={director.isDifferentPresentAddress || false}
                  onChange={(e) => updateDirector(index, 'isDifferentPresentAddress', e.target.checked)}
                  className="w-4 h-4"
                  disabled={disabled}
                />
                <label htmlFor={`different-address-${index}`} className="text-sm text-gray-700">
                  Click here if permanent address is different from present address
                </label>
              </div>
            </div>
          </div>

          {/* Present Address - Conditional */}
          {director.isDifferentPresentAddress && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Present Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Address Line 1">
                  <textarea
                    rows="2"
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter address line 1"
                    value={director.presentAddressLine1 || ''}
                    onChange={(e) => updateDirector(index, 'presentAddressLine1', e.target.value)}
                    disabled={disabled}
                  />
                </Field>

                <Field label="Address Line 2 (Optional)">
                  <textarea
                    rows="2"
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter address line 2"
                    value={director.presentAddressLine2 || ''}
                    onChange={(e) => updateDirector(index, 'presentAddressLine2', e.target.value)}
                    disabled={disabled}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="City">
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter city"
                      value={director.presentCity || ''}
                      onChange={(e) => updateDirector(index, 'presentCity', e.target.value)}
                      disabled={disabled}
                    />
                  </Field>

                  <Field label="State">
                    <CustomDropdown
                      options={indianStates}
                      placeholder="Select state"
                      value={director.presentState || ''}
                      onChange={(value) => updateDirector(index, 'presentState', value)}
                      disabled={disabled}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Country">
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={director.presentCountry || 'India'}
                      onChange={(e) => updateDirector(index, 'presentCountry', e.target.value)}
                      disabled={disabled}
                    />
                  </Field>

                  <Field label="Pin Code">
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter pin code"
                      value={director.presentPincode || ''}
                      onChange={(e) => updateDirector(index, 'presentPincode', e.target.value)}
                      disabled={disabled}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          <Field label="Duration of Stay at Present Address">
            <div className="grid grid-cols-2 gap-4">
              <CustomDropdown
                options={Array.from({ length: 51 }, (_, i) => `${i} Years`)}
                placeholder="Select years"
                value={director.durationYears || ''}
                onChange={(value) => updateDirector(index, 'durationYears', value)}
                disabled={disabled}
              />
              <CustomDropdown
                options={Array.from({ length: 12 }, (_, i) => `${i} Months`)}
                placeholder="Select months"
                value={director.durationMonths || ''}
                onChange={(value) => updateDirector(index, 'durationMonths', value)}
                disabled={disabled}
              />
            </div>
          </Field>

          {/* Authorized Signatory */}
          <Field label="Are you an Authorized Signatory for the Bank?">
            <CustomDropdown
              options={authorizedSignatorySelected && director.isAuthorizedSignatory !== 'Yes' ? ['No'] : ['Yes', 'No']}
              placeholder="Select option"
              value={director.isAuthorizedSignatory || ''}
              onChange={(value) => handleAuthorizedSignatoryChange(index, value)}
              disabled={disabled}
            />
          </Field>

          {director.isAuthorizedSignatory === 'Yes' && (
            <div>
              <FileUploadField
                label="Specimen Signature for Authorisation"
                accept=".pdf,.jpg,.jpeg,.png"
                buttonLabel="Upload Signature"
                disabled={disabled}
                onFileSelect={async (file) => {
                  const base64 = await fileToBase64(file);
                  updateDirector(index, 'specimenSignature', base64);
                }}
              />
            </div>
          )}

          {/* Director in Other Company */}
          <Field label="Are you a Director in Any Other Company?">
            <CustomDropdown
              options={['Yes', 'No']}
              placeholder="Select option"
              value={director.isDirectorInOtherCompany || ''}
              onChange={(value) => updateDirector(index, 'isDirectorInOtherCompany', value)}
              disabled={disabled}
            />
          </Field>

          {director.isDirectorInOtherCompany === 'Yes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Name">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter company name"
                  value={director.otherCompanyName || ''}
                  onChange={(e) => updateDirector(index, 'otherCompanyName', e.target.value)}
                  disabled={disabled}
                />
              </Field>
              <Field label="Position Held">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Director"
                  value={director.otherCompanyPosition || ''}
                  onChange={(e) => updateDirector(index, 'otherCompanyPosition', e.target.value)}
                  disabled={disabled}
                />
              </Field>
            </div>
          )}

          {/* Shareholder in Other Company */}
          <Field label="Are you a Shareholder in Any Other Company?">
            <CustomDropdown
              options={['Yes', 'No']}
              placeholder="Select option"
              value={director.isShareholderInOtherCompany || ''}
              onChange={(value) => updateDirector(index, 'isShareholderInOtherCompany', value)}
              disabled={disabled}
            />
          </Field>

          {director.isShareholderInOtherCompany === 'Yes' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Company Name">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter company name"
                  value={director.shareholderCompanyName || ''}
                  onChange={(e) => updateDirector(index, 'shareholderCompanyName', e.target.value)}
                  disabled={disabled}
                />
              </Field>
              <Field label="Number of Shares Held">
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter shares"
                  value={director.shareholderCompanyShares || ''}
                  onChange={(e) => updateDirector(index, 'shareholderCompanyShares', e.target.value)}
                  disabled={disabled}
                />
              </Field>
              <Field label="Face Value of Share">
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter face value"
                  value={director.shareholderCompanyFaceValue || ''}
                  onChange={(e) => updateDirector(index, 'shareholderCompanyFaceValue', e.target.value)}
                  disabled={disabled}
                />
              </Field>
            </div>
          )}

          {/* Document Uploads */}
          <div className="grid grid-cols-1 gap-4">
            <FileUploadField
              label="Aadhaar Card"
              accept=".pdf,.jpg,.jpeg,.png"
              buttonLabel="Upload Aadhaar Card"
              disabled={disabled}
              onFileSelect={async (file) => {
                const base64 = await fileToBase64(file);
                updateDirector(index, 'aadhaarCard', base64);
              }}
            />

            <FileUploadField
              label="Passport Size Photo"
              accept=".jpg,.jpeg,.png"
              buttonLabel="Upload Photo"
              disabled={disabled}
              onFileSelect={async (file) => {
                const base64 = await fileToBase64(file);
                updateDirector(index, 'passportPhoto', base64);
              }}
            />

            <FileUploadField
              label="PAN Card"
              accept=".pdf,.jpg,.jpeg,.png"
              buttonLabel="Upload PAN Card"
              disabled={disabled}
              onFileSelect={async (file) => {
                const base64 = await fileToBase64(file);
                updateDirector(index, 'panCard', base64);
              }}
            />

            <div>
              <FileUploadField
                label="Most Recent Bank Statement or Utility Bill"
                accept=".pdf,.jpg,.jpeg,.png"
                buttonLabel="Upload Document"
                disabled={disabled}
                onFileSelect={async (file) => {
                  const base64 = await fileToBase64(file);
                  updateDirector(index, 'bankStatementOrUtilityBill', base64);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: Should be within the last month and should have your present residential address
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-8 mt-6">
      {Array.from({ length: numberOfDirectors }, (_, index) => renderDirectorSection(index))}
    </div>
  );
}

// Step 4: Director/Partner Details
export function DirectorDetailsContent({ formData, setFormData }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <p className="text-gray-600">Director/Partner Details step will be implemented based on your requirements...</p>
    </div>
  );
}

// Step 5: Authorization Letter
export function AuthorizationLetterContent({ formData, setFormData }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <p className="text-gray-600">Authorization Letter step will be implemented based on your requirements...</p>
    </div>
  );
}

