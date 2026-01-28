import React, { useState, useRef } from "react";
import { Download, Check, TriangleAlert, CloudUpload } from "lucide-react";
import Field from "./Field";
import CustomDropdown from "./CustomDropdown";
import FileUploadField from "./FileUploadField";

import { uploadFileDirect } from '../../utils/s3Upload';
import { AUTH_CONFIG } from '../../config/auth';

// Helper to get user ID and ticket ID for S3 folder path
const getUploadFolder = (ticketId = null) => {
  const storedUser = JSON.parse(
    localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || "{}"
  );
  const userId = storedUser.id;
  
  const currentTicketId = ticketId || 
    localStorage.getItem('editingTicketId') || 
    localStorage.getItem('fillingOnBehalfTicketId') ||
    new URLSearchParams(window.location.search).get('ticketId') ||
    'temp';
  
  // Determine folder based on form type - default to general uploads
  return `uploads/${userId}/${currentTicketId}`;
};

function DirectorForm({ directorNumber, disabled = false }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-medium text-[#28303F]">
        Director {directorNumber}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Name (as per PAN)" required>
          <input
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter your Name (as per PAN)"
          />
        </Field>
        <Field label="Email address" required>
          <input
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Select your Email address"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Contact Number" required>
          <div className="flex gap-2">
            <input
              disabled
              value="+91"
              className="w-16 px-3 py-3 rounded-lg bg-white text-[#5A5A5A] disabled:opacity-100"
            />
            <input
              disabled={disabled}
              className={`flex-1 px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter your Contact Number"
            />
          </div>
        </Field>
        <FileUploadField
          label="Upload Aadhaar Card"
          buttonLabel="Upload Doc in PDF"
          accept="application/pdf"
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadField
          label="PAN Upload"
          buttonLabel="Upload Doc in PDF"
          accept="application/pdf"
          disabled={disabled}
        />
        <Field label="Are you an Authorised Representative" required>
          <CustomDropdown
            options={["Yes", "No"]}
            placeholder="Select Yes or No"
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );
}

export function Step1Content({ formData, setFormData, disabled = false }) {
  const step1 = formData?.step1 || {};
  
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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Business Name">
        <input
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Enter your Business Name"
          value={step1.businessName || ''}
          onChange={(e) => updateStep1('businessName', e.target.value)}
        />
      </Field>

      <Field label="Type of Business">
        <CustomDropdown
          options={["Private Limited", "Public Limited", "LLP", "Partnership", "Sole Proprietorship"]}
          placeholder="Select your Business Type"
          value={step1.businessType || ''}
          onChange={(value) => updateStep1('businessType', value)}
          disabled={disabled}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Nature of Business">
          <textarea
            rows="5"
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Write minimum 400 characters"
            value={step1.natureOfBusiness || ''}
            onChange={(e) => updateStep1('natureOfBusiness', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Business Email">
        <input
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Enter your Business Email"
          value={step1.businessEmail || ''}
          onChange={(e) => updateStep1('businessEmail', e.target.value)}
        />
      </Field>

      <Field label="Business Contact Number">
        <div className="flex gap-2">
          <input
            disabled
            value="+91"
            className="w-16 px-3 py-3 rounded-lg bg-white text-[#5A5A5A]"
          />
          <input
            disabled={disabled}
            className={`flex-1 px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter your Business Contact Number"
            value={step1.businessContactNumber || ''}
            onChange={(e) => updateStep1('businessContactNumber', e.target.value)}
          />
        </div>
      </Field>

      <Field label="Number of Directors/Partners">
        <input
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Enter Number of Directors/Partners"
          value={step1.numberOfDirectorsPartners || ''}
          onChange={(e) => updateStep1('numberOfDirectorsPartners', e.target.value)}
        />
      </Field>

      <Field label="Mobile App link">
        <input
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Enter Mobile App link"
          value={step1.mobileAppLink || ''}
          onChange={(e) => updateStep1('mobileAppLink', e.target.value)}
        />
      </Field>

      <Field label="Website link">
        <input
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Enter Website link"
          value={step1.websiteLink || ''}
          onChange={(e) => updateStep1('websiteLink', e.target.value)}
        />
      </Field>

      <Field label="Number of Employees">
        <input
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Enter Number of Employees"
          value={step1.numberOfEmployees || ''}
          onChange={(e) => updateStep1('numberOfEmployees', e.target.value)}
        />
      </Field>

      <FileUploadField
        label="Upload Logo"
        buttonLabel="Upload Logo in Jpg, Jpeg"
        accept="image/jpeg,image/jpg"
        disabled={disabled}
      />

      <FileUploadField
        label="Udyam Registration"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        disabled={disabled}
      />

      <FileUploadField
        label="Certificate of Incorporation / Partnership Deed"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        disabled={disabled}
      />

      <FileUploadField
        label="PAN(Entity)"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        disabled={disabled}
      />

      <FileUploadField
        label="TAN(Entity)"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        disabled={disabled}
      />

      <Field
        label="Any recognition or awards received by the startup"
      >
        <CustomDropdown
          options={["Yes", "No"]}
          placeholder="Select Yes or No"
          value={step1.recognitionOrAwards ? 'Yes' : (step1.recognitionOrAwards === false ? 'No' : '')}
          onChange={(value) => updateStep1('recognitionOrAwards', value === 'Yes')}
          disabled={disabled}
        />
      </Field>
    </div>
  );
}

export function Step2Content({ formData, setFormData, disabled = false }) {
  const step2 = formData?.step2 || {};
  
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

  return (
    <div className="grid grid-cols-1 gap-6">
      <Field label="What problem your startup is solving">
        <textarea
          rows="5"
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Write minimum 100–400 characters"
          value={step2.problemSolving || ''}
          onChange={(e) => updateStep2('problemSolving', e.target.value)}
        />
      </Field>

      <Field
        label="How does the startup propose to solve the problem"
      >
        <textarea
          rows="5"
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Write minimum 100–400 characters"
          value={step2.solutionProposal || ''}
          onChange={(e) => updateStep2('solutionProposal', e.target.value)}
        />
      </Field>

      <Field label="What is the uniqueness of the solution">
        <textarea
          rows="5"
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Write minimum 100–400 characters"
          value={step2.uniquenessOfSolution || ''}
          onChange={(e) => updateStep2('uniquenessOfSolution', e.target.value)}
        />
      </Field>

      <Field label="How your startup earns revenue">
        <textarea
          rows="5"
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Write minimum 100–400 characters"
          value={step2.revenueModel || ''}
          onChange={(e) => updateStep2('revenueModel', e.target.value)}
        />
      </Field>

      <Field
        label="Brief note supporting the options chosen for innovation, improvement and scalability"
      >
        <textarea
          rows="5"
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Write minimum 100–400 characters"
          value={step2.innovationNote || ''}
          onChange={(e) => updateStep2('innovationNote', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Has the Startup Applied for IPR (Intellectual Property Rights) includes Patent, Trademark, Copyright, Design and Plant Variety">
          <CustomDropdown
            options={["Yes", "No"]}
            placeholder="Select Yes or No"
            disabled={disabled}
            value={step2.hasIpr ? 'Yes' : 'No'}
            onChange={(value) => updateStep2('hasIpr', value === 'Yes')}
          />
        </Field>

        <FileUploadField
          label="Upload Doc"
          buttonLabel="Doc PDF"
          accept="application/pdf"
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Has your startup received any funding" required>
          <CustomDropdown
            options={["Yes", "No"]}
            placeholder="Select Yes or No"
            disabled={disabled}
          />
        </Field>

        <Field label="Select who you want to connect with">
          <CustomDropdown
            options={["Investors", "Mentors", "Partners", "Clients", "Suppliers"]}
            placeholder="Select the business you want to connect"
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );
}

export function Step3Content({ formData, setFormData, disabled = false }) {
  const step3 = formData?.step3 || {};
  
  const updateStep3 = (field, value) => {
    if (disabled) return;
    setFormData({
      ...formData,
      step3: {
        ...step3,
        [field]: value,
        // Always set country to India
        registeredOfficeCountry: 'India'
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Field label="Address 1" required>
        <textarea
          rows="4"
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Type your address here"
          value={step3.registeredOfficeAddressLine1 || ''}
          onChange={(e) => updateStep3('registeredOfficeAddressLine1', e.target.value)}
        />
      </Field>

      <Field label="Address 2" required>
        <textarea
          rows="4"
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="Type your address here"
          value={step3.registeredOfficeAddressLine2 || ''}
          onChange={(e) => updateStep3('registeredOfficeAddressLine2', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="State" required>
          <CustomDropdown
            options={["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat", "West Bengal", "Rajasthan", "Others"]}
            placeholder="Select your State"
            disabled={disabled}
            value={step3.registeredOfficeState || ''}
            onChange={(value) => updateStep3('registeredOfficeState', value)}
          />
        </Field>

        <Field label="City" required>
          <input
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter City Name"
            value={step3.registeredOfficeCity || ''}
            onChange={(e) => updateStep3('registeredOfficeCity', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Country" required>
          <input
            disabled
            value="India"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          />
        </Field>

        <Field label="Pincode" required>
          <input
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-lg bg-white outline-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Enter Pincode"
            value={step3.registeredOfficePincode || ''}
            onChange={(e) => updateStep3('registeredOfficePincode', e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

export function Step4Content({ disabled = false }) {
  return (
    <div className="grid grid-cols-1 gap-8">
      <DirectorForm directorNumber={1} disabled={disabled} />
      <DirectorForm directorNumber={2} disabled={disabled} />
      <DirectorForm directorNumber={3} disabled={disabled} />
    </div>
  );
}

export function Step5Content({ formData, setFormData, disabled = false }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const step5 = formData?.step5 || {};

  // Update step5 data
  const updateStep5 = (field, value) => {
    if (disabled) return;
    setFormData({
      ...formData,
      step5: {
        ...step5,
        [field]: value
      }
    });
  };

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (disabled || !file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    try {
      const folder = getUploadFolder();
      const fileName = file.name || 'authorization-letter.pdf';
      const { s3Url } = await uploadFileDirect(file, folder, fileName);
      setFileName(file.name);
      updateStep5('authorizationLetter', s3Url);
    } catch (error) {
      console.error('Error converting file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle browse button click
  const handleBrowseClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    // Create a sample PDF content (minimal PDF structure)
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
100 700 Td
(Authorization Letter) Tj
0 -20 Td
(This letter confirms authorization for official) Tj
0 -20 Td
(communication and actions on behalf of the startup.) Tj
0 -40 Td
(Authorized Representative Name: ________________) Tj
0 -20 Td
(Designation: ________________) Tj
0 -40 Td
(Signature: ________________) Tj
0 -20 Td
(Date: ________________) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000316 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
516
%%EOF`;

    // Create a blob from the PDF content
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Authorization_Letter_Startup_India.pdf';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Download */}
      <div className="bg-[#F9FAFB] border border-[#E6EAEF] rounded-lg p-4 flex flex-col items-start justify-between">
        <div className="text-sm text-[#5A5A5A]">
          <div className="text-[14px] font-medium text-[#28303F] mb-2">
            Authorization Letter Upload
          </div>
          <p>
            This letter confirms authorization for official
            communication and actions on behalf of the startup. Download
            the letter, print it, sign it, and upload the signed copy to
            proceed.
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-md text-white text-sm self-end flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #01334C 0%, #00486D 100%)' }}
          onClick={handleDownloadPDF}
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Signature instructions */}
      <div className="bg-[#F9FAFB] border border-[#E6EAEF] rounded-lg p-4">
        <div className="text-[14px] font-medium text-[#28303F] mb-6">
          Signature Instructions
        </div>
        <ul className="flex flex-col gap-6 text-sm text-[#5A5A5A] ">
          <li className="flex items-start gap-2">
            <div className="mt-1 h-4 w-4 rounded-full bg-[#004264] flex items-center justify-center">
              <Check size={10} className="text-white" />
            </div>
            Print the downloaded letter on a clean A4 sheet
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 h-4 w-4 rounded-full bg-[#004264] flex items-center justify-center">
              <Check size={10} className="text-white" />
            </div>
            Authorised representative must sign at the marked area
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 h-4 w-4 rounded-full bg-[#004264] flex items-center justify-center">
              <Check size={10} className="text-white" />
            </div>
            Ensure signature matches ID proof
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1 h-4 w-4 rounded-full bg-[#004264] flex items-center justify-center">
              <Check size={10} className="text-white" />
            </div>
            Scan the signed document in PDF format
          </li>
        </ul>
      </div>

      {/* Warnings */}
      <div className="bg-[#F9FAFB] border border-[#E6EAEF] rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm">
          <TriangleAlert
            size={16}
            className="text-amber-300"
          />
          Only one authorised representative is allowed
        </div>
        <div className="flex items-center gap-2 text-sm mt-6">
          <TriangleAlert
            size={16}
            className="text-amber-300"
          />
          Upload must be a clear readable PDF
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Dropzone */}
      <div
        className={`border-2 border-dashed flex flex-col items-center justify-center rounded-xl p-8 text-center text-[#5A5A5A] bg-white transition-colors ${
          disabled 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : isDragging 
              ? 'border-[#00486D] bg-[#F0F7FA] cursor-pointer' 
              : 'border-[#AFC3D2] cursor-pointer'
        }`}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : handleBrowseClick}
      >
        <CloudUpload
          size={24}
          className="text-[#00486D]"
        />
        <div className="text-sm mt-2">
          {fileName ? (
            <span className="text-[#00486D] font-medium">✓ {fileName}</span>
          ) : (
            <>
              Drag & Drop your PDF here
              <br />
              <button
                type="button"
                className="mt-1 text-[#00486D] underline text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
              >
                Browse Files
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          disabled={disabled}
          className={`px-6 py-3 rounded-md text-white text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={disabled ? {} : { background: 'linear-gradient(90deg, #01334C 0%, #00486D 100%)' }}
          onClick={() => {
            if (disabled) return;
            if (fileName) {
              alert('Authorization letter uploaded successfully!');
            } else {
              handleBrowseClick();
            }
          }}
        >
          {fileName ? '✓ Upload Signed Authorization Letter' : 'Upload Signed Authorization Letter'}
        </button>
      </div>
    </div>
  );
}

