import React, { useState, useRef, useEffect } from "react";
import { Download, Check, TriangleAlert, CloudUpload, ChevronDown } from "lucide-react";
import Field from "./Field";
import CustomDropdown from "./CustomDropdown";
import FileUploadField from "./FileUploadField";

// Helper to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Multi-select dropdown component with checkboxes
function MultiSelectDropdown({ options = [], selectedValues = [], onChange, placeholder = "Select options" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleOption = (value) => {
    const currentSelected = selectedValues || [];
    const newSelected = currentSelected.includes(value)
      ? currentSelected.filter(v => v !== value)
      : [...currentSelected, value];
    if (onChange) {
      onChange(newSelected);
    }
  };

  const displayText = selectedValues && selectedValues.length > 0
    ? selectedValues.map(val => {
        const option = options.find(opt => opt.value === val);
        return option ? option.label : val;
      }).join(', ')
    : placeholder;

  const displayColor = selectedValues && selectedValues.length > 0 ? "text-[#28303F]" : "text-[#5A5A5A]";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-transparent hover:border-[#CFD6DC] focus:border-[#00486D] focus:ring-1 focus:ring-[#00486D] flex items-center justify-between transition-colors ${displayColor} cursor-pointer`}
      >
        <span className="text-left truncate flex-1">{displayText}</span>
        <ChevronDown
          size={20}
          className={`text-[#5A5A5A] transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E6EAEF] rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => {
            const isSelected = selectedValues && selectedValues.includes(option.value);
            
            return (
              <label
                key={index}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#F0F7FA] text-[#00486D]"
                    : "text-[#28303F] hover:bg-[#F9FAFB]"
                } ${index === 0 ? "rounded-t-lg" : ""} ${
                  index === options.length - 1 ? "rounded-b-lg" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected || false}
                  onChange={() => handleToggleOption(option.value)}
                  className="w-5 h-5 text-[#00486D] border-gray-300 rounded focus:ring-[#00486D] focus:ring-2"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DirectorForm({ directorIndex, director, formData, setFormData, disabled = false }) {
  const step4 = formData?.step4 || { directors: [] };
  const directors = step4.directors || [];

  const updateDirector = (index, field, value) => {
    const newDirectors = [...directors];
    if (!newDirectors[index]) {
      newDirectors[index] = {};
    }
    newDirectors[index] = {
      ...newDirectors[index],
      [field]: value
    };
    setFormData({
      ...formData,
      step4: {
        ...step4,
        directors: newDirectors
      }
    });
  };

  const directorData = director || {};

  return (
    <div className="flex flex-col gap-4 border-2 border-gray-200 rounded-lg p-6">
      <div className="text-lg font-semibold text-[#28303F] mb-2">
        Director {directorIndex + 1}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Name (as per PAN)" required>
          <input
            className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your Name (as per PAN)"
            value={directorData.name || ''}
            onChange={(e) => updateDirector(directorIndex, 'name', e.target.value)}
            disabled={disabled}
          />
        </Field>
        <Field label="Email address" required>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your Email address"
            value={directorData.email || ''}
            onChange={(e) => updateDirector(directorIndex, 'email', e.target.value)}
            disabled={disabled}
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
              type="tel"
              className="flex-1 px-4 py-3 rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your Contact Number"
              value={directorData.contactNumber || ''}
              onChange={(e) => updateDirector(directorIndex, 'contactNumber', e.target.value)}
              disabled={disabled}
            />
          </div>
        </Field>
        <FileUploadField
          label="Upload Aadhaar Card"
          buttonLabel="Upload Doc in PDF"
          accept="application/pdf"
          onFileSelect={async (file) => {
            const base64 = await fileToBase64(file);
            updateDirector(directorIndex, 'aadhaarCard', base64);
          }}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadField
          label="PAN Upload"
          buttonLabel="Upload Doc in PDF"
          accept="application/pdf"
          onFileSelect={async (file) => {
            const base64 = await fileToBase64(file);
            updateDirector(directorIndex, 'panCard', base64);
          }}
          disabled={disabled}
        />
        <Field label="Are you an Authorised Representative" required>
          <CustomDropdown
            options={["Yes", "No"]}
            placeholder="Select Yes or No"
            value={directorData.isAuthorizedRepresentative || 'No'}
            onChange={(value) => updateDirector(directorIndex, 'isAuthorizedRepresentative', value)}
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );
}

export function Step1Content({ formData, setFormData }) {
  const step1 = formData?.step1 || {};
  
  const updateStep1 = (field, value) => {
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
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Nature of Business">
          <textarea
            rows="5"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            placeholder="Write minimum 400 characters"
            value={step1.natureOfBusiness || ''}
            onChange={(e) => updateStep1('natureOfBusiness', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Business Email">
        <input
          type="email"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
            type="tel"
            className="flex-1 px-4 py-3 rounded-lg bg-white outline-none"
            placeholder="Enter your Business Contact Number"
            value={step1.businessContactNumber || ''}
            onChange={(e) => updateStep1('businessContactNumber', e.target.value)}
          />
        </div>
      </Field>

      <Field label="Number of Directors/Partners" required>
        <CustomDropdown
          options={['1', '2', '3', '4', '5']}
          placeholder="Select number of directors"
          value={step1.numberOfDirectorsPartners ? step1.numberOfDirectorsPartners.toString() : '1'}
          onChange={(value) => {
            const numDirectors = parseInt(value);
            updateStep1('numberOfDirectorsPartners', numDirectors);
            
            // Update directors array in step4
            const step4 = formData.step4 || { directors: [] };
            const currentDirectors = step4.directors || [];
            const newDirectors = [];
            for (let i = 0; i < numDirectors; i++) {
              newDirectors.push(currentDirectors[i] || {
                name: '',
                email: '',
                contactNumber: '',
                aadhaarCard: '',
                panCard: '',
                isAuthorizedRepresentative: 'No'
              });
            }
            setFormData({
              ...formData,
              step1: { ...step1, numberOfDirectorsPartners: numDirectors },
              step4: { ...step4, directors: newDirectors }
            });
          }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Select the number of directors/partners for your startup
        </p>
      </Field>

      <Field label="Mobile App link">
        <input
          type="url"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          placeholder="Enter Mobile App link"
          value={step1.mobileAppLink || ''}
          onChange={(e) => updateStep1('mobileAppLink', e.target.value)}
        />
      </Field>

      <Field label="Website link">
        <input
          type="url"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          placeholder="Enter Website link"
          value={step1.websiteLink || ''}
          onChange={(e) => updateStep1('websiteLink', e.target.value)}
        />
      </Field>

      <Field label="Number of Employees">
        <input
          type="number"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          placeholder="Enter Number of Employees"
          value={step1.numberOfEmployees || ''}
          onChange={(e) => updateStep1('numberOfEmployees', e.target.value)}
        />
      </Field>

      <FileUploadField
        label="Upload Logo"
        buttonLabel="Upload Logo in Jpg, Jpeg"
        accept="image/jpeg,image/jpg"
        onFileSelect={async (file) => {
          const base64 = await fileToBase64(file);
          updateStep1('logo', base64);
        }}
      />

      <FileUploadField
        label="Udyam Registration"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        onFileSelect={async (file) => {
          const base64 = await fileToBase64(file);
          updateStep1('udyamRegistration', base64);
        }}
      />

      <FileUploadField
        label="Certificate of Incorporation / Partnership Deed"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        onFileSelect={async (file) => {
          const base64 = await fileToBase64(file);
          updateStep1('certificateOfIncorporation', base64);
        }}
      />

      <FileUploadField
        label="PAN(Entity)"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        onFileSelect={async (file) => {
          const base64 = await fileToBase64(file);
          updateStep1('panEntity', base64);
        }}
      />

      <FileUploadField
        label="TAN(Entity)"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        onFileSelect={async (file) => {
          const base64 = await fileToBase64(file);
          updateStep1('tanEntity', base64);
        }}
      />

      <Field
        label="Any recognition or awards received by the startup"
      >
        <CustomDropdown
          options={["Yes", "No"]}
          placeholder="Select Yes or No"
          value={step1.recognitionOrAwards ? (step1.recognitionOrAwards === true || step1.recognitionOrAwards === 'Yes' ? 'Yes' : 'No') : 'No'}
          onChange={(value) => updateStep1('recognitionOrAwards', value === 'Yes')}
        />
      </Field>
    </div>
  );
}

export function Step2Content({ formData, setFormData }) {
  const step2 = formData?.step2 || {};
  
  const updateStep2 = (field, value) => {
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
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          placeholder="Write minimum 100–400 characters"
          value={step2.solutionProposal || ''}
          onChange={(e) => updateStep2('solutionProposal', e.target.value)}
        />
      </Field>

      <Field label="What is the uniqueness of the solution">
        <textarea
          rows="5"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          placeholder="Write minimum 100–400 characters"
          value={step2.uniquenessOfSolution || ''}
          onChange={(e) => updateStep2('uniquenessOfSolution', e.target.value)}
        />
      </Field>

      <Field label="How your startup earns revenue">
        <textarea
          rows="5"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          placeholder="Write minimum 100–400 characters"
          value={step2.revenueModel || ''}
          onChange={(e) => updateStep2('revenueModel', e.target.value)}
        />
      </Field>

      <Field label="Select Options (Innovation, Improvement, Scalability)">
        <MultiSelectDropdown
          options={[
            { value: 'innovation', label: 'Innovation' },
            { value: 'improvement', label: 'Improvement' },
            { value: 'scalability', label: 'Scalability' }
          ]}
          selectedValues={step2.innovationOptions || []}
          onChange={(selected) => updateStep2('innovationOptions', selected)}
          placeholder="Select one or more options"
        />
      </Field>

      <Field
        label="Brief note supporting the options chosen for innovation, improvement and scalability"
      >
        <textarea
          rows="5"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
            value={step2.hasIpr ? (step2.hasIpr === true || step2.hasIpr === 'Yes' ? 'Yes' : 'No') : 'No'}
            onChange={(value) => updateStep2('hasIpr', value === 'Yes')}
          />
        </Field>

        <FileUploadField
          label="Upload Doc"
          buttonLabel="Doc PDF"
          accept="application/pdf"
          onFileSelect={async (file) => {
            const base64 = await fileToBase64(file);
            updateStep2('iprDocument', base64);
          }}
        />
      </div>
    </div>
  );
}

export function Step3Content({ formData, setFormData }) {
  const step3 = formData?.step3 || {};
  
  const updateStep3 = (field, value) => {
    setFormData({
      ...formData,
      step3: {
        ...step3,
        [field]: value
      }
    });
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
    <div className="grid grid-cols-1 gap-6">
      <Field label="Address 1" required>
        <textarea
          rows="4"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          placeholder="Type your address here"
          value={step3.registeredOfficeAddressLine1 || ''}
          onChange={(e) => updateStep3('registeredOfficeAddressLine1', e.target.value)}
        />
      </Field>

      <Field label="Address 2" required>
        <textarea
          rows="4"
          className="w-full px-4 py-3 rounded-lg bg-white outline-none"
          placeholder="Type your address here"
          value={step3.registeredOfficeAddressLine2 || ''}
          onChange={(e) => updateStep3('registeredOfficeAddressLine2', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="State" required>
          <CustomDropdown
            options={indianStates}
            placeholder="Select your State"
            value={step3.registeredOfficeState || ''}
            onChange={(value) => updateStep3('registeredOfficeState', value)}
          />
        </Field>

        <Field label="City" required>
          <input
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            placeholder="Enter City Name"
            value={step3.registeredOfficeCity || ''}
            onChange={(e) => updateStep3('registeredOfficeCity', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Country" required>
          <input
            value={step3.registeredOfficeCountry || 'India'}
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            onChange={(e) => updateStep3('registeredOfficeCountry', e.target.value)}
          />
        </Field>

        <Field label="Pincode" required>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg bg-white outline-none"
            placeholder="Enter Pincode"
            value={step3.registeredOfficePincode || ''}
            onChange={(e) => updateStep3('registeredOfficePincode', e.target.value)}
          />
        </Field>
      </div>

      <FileUploadField
        label="Registered Office Address Proof"
        buttonLabel="Upload Doc in PDF"
        accept="application/pdf"
        onFileSelect={async (file) => {
          const base64 = await fileToBase64(file);
          updateStep3('registeredOfficeProof', base64);
        }}
      />
    </div>
  );
}

export function Step4Content({ formData, setFormData, disabled = false }) {
  const step1 = formData?.step1 || {};
  const step4 = formData?.step4 || { directors: [] };
  const numberOfDirectors = step1.numberOfDirectorsPartners || 1;
  
  // Initialize directors array if needed
  React.useEffect(() => {
    const currentDirectors = step4.directors || [];
    if (currentDirectors.length !== numberOfDirectors) {
      const newDirectors = Array.from({ length: numberOfDirectors }, (_, i) => 
        currentDirectors[i] || {
          name: '',
          email: '',
          contactNumber: '',
          aadhaarCard: '',
          panCard: '',
          isAuthorizedRepresentative: 'No'
        }
      );
      setFormData((prevFormData) => ({
        ...prevFormData,
        step4: {
          ...(prevFormData.step4 || {}),
          directors: newDirectors
        }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfDirectors]);

  const directors = step4.directors || Array.from({ length: numberOfDirectors }, () => ({}));

  return (
    <div className="grid grid-cols-1 gap-8">
      {directors.map((director, index) => (
        <DirectorForm
          key={index}
          directorIndex={index}
          director={director}
          formData={formData}
          setFormData={setFormData}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export function Step5Content({ formData, setFormData }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const step5 = formData?.step5 || {};

  // Update step5 data
  const updateStep5 = (field, value) => {
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
    if (!file) return;

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
      const base64 = await fileToBase64(file);
      setFileName(file.name);
      updateStep5('authorizationLetter', base64);
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
      />

      {/* Dropzone */}
      <div
        className={`border-2 border-dashed flex flex-col items-center justify-center rounded-xl p-8 text-center text-[#5A5A5A] bg-white cursor-pointer transition-colors ${
          isDragging 
            ? 'border-[#00486D] bg-[#F0F7FA]' 
            : 'border-[#AFC3D2]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
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
          className="px-6 py-3 rounded-md text-white text-sm"
          style={{ background: 'linear-gradient(90deg, #01334C 0%, #00486D 100%)' }}
          onClick={() => {
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

