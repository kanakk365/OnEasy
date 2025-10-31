import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Check, TriangleAlert, CloudUpload, ChevronDown } from "lucide-react";

function Field({ label, required = false, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#28303F]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function UploadButton({ label }) {
  return (
    <button
      type="button"
      className="w-full text-left px-4 py-3 rounded-l-lg bg-white outline-none"
    >
      {label}
    </button>
  );
}

function FileUploadField({ label, buttonLabel, required = false, accept, onFileSelect }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const displayText = fileName || buttonLabel || label;

  return (
    <div className="grid grid-cols-[1fr_48px] items-end">
      <Field label={label} required={required}>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleFileClick}
            className="w-full text-left px-4 py-3 rounded-l-lg bg-white outline-none"
          >
            {displayText}
          </button>
        </div>
      </Field>
      <button
        type="button"
        onClick={handleFileClick}
        className="h-[48px] w-[48px] rounded-r-lg bg-gradient-to-b from-[#00486D] to-[#015A88] text-white flex items-center justify-center text-xl cursor-pointer hover:from-[#015A88] hover:to-[#00486D] transition-all"
      >
        +
      </button>
    </div>
  );
}

function CustomDropdown({ options = [], placeholder = "Select an option", value, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

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

  const handleSelect = (option) => {
    setSelectedValue(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  const displayText = selectedValue || placeholder;
  const displayColor = selectedValue ? "text-[#28303F]" : "text-[#5A5A5A]";

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-lg bg-white outline-none border border-transparent hover:border-[#CFD6DC] focus:border-[#00486D] focus:ring-1 focus:ring-[#00486D] flex items-center justify-between transition-colors ${displayColor}`}
      >
        <span className="text-left truncate">{displayText}</span>
        <ChevronDown
          size={20}
          className={`text-[#5A5A5A] transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E6EAEF] rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#5A5A5A]">No options available</div>
          ) : (
            options.map((option, index) => {
              const optionValue = typeof option === "string" ? option : option.value;
              const optionLabel = typeof option === "string" ? option : option.label;
              const isSelected = selectedValue === optionValue;
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(optionValue)}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-[#F0F7FA] text-[#00486D] font-medium"
                      : "text-[#28303F] hover:bg-[#F9FAFB]"
                  } ${index === 0 ? "rounded-t-lg" : ""} ${
                    index === options.length - 1 ? "rounded-b-lg" : ""
                  }`}
                >
                  {optionLabel}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function StepCircle({ status }) {
  if (status === "completed") {
    return (
      <div className="w-5 h-5 rounded-full bg-[#00486D] flex items-center justify-center">
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 6.5L5 8.5L9 3.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-[#00486D] flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-[#00486D] block" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border border-[#CFD6DC] bg-white" />
  );
}

function Connector({ completed }) {
  return (
    <div
      className={`flex-1 h-[2px] ${
        completed ? "bg-[#00486D]" : "bg-[#CFD6DC]"
      }`}
    />
  );
}

function BusinessDetailsForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const goBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      return;
    }
    navigate(-1);
  };

  const goNext = () => {
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }
    // Placeholder for submission or navigation to next route after step 5
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold text-[#28303F] mb-6">
          Add your Details
        </h1>

        {/* Stepper */}
        <div className="rounded-lg mb-6 p-4">
          <div className="flex items-center w-full">
            {[
              "Business Details",
              "Startup Information",
              "Office Address",
              "Director/Partner Details",
              "Authorization Letter",
            ].map((title, idx, arr) => {
              const index = idx + 1;
              const status =
                step > index
                  ? "completed"
                  : step === index
                  ? "active"
                  : "upcoming";
              const isLast = idx === arr.length - 1;
              return (
                <React.Fragment key={title}>
                  <div className="flex items-center justify-center flex-1 min-w-0">
                    <StepCircle status={status} />
                  </div>
                  {!isLast && (
                    <div className="flex-1 -mx-10">
                      <Connector completed={step > index} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Labels row */}
          <div className="flex items-center w-full mt-1">
            {[
              "Business Details",
              "Startup Information",
              "Office Address",
              "Director/Partner Details",
              "Authorization Letter",
            ].map((title, idx, arr) => {
              const index = idx + 1;
              const status =
                step > index
                  ? "completed"
                  : step === index
                  ? "active"
                  : "upcoming";
              const isLast = idx === arr.length - 1;
              return (
                <React.Fragment key={title}>
                  <div className={`flex items-center justify-center flex-1 min-w-0 ${idx === 0 ? "pl-6" : ""} ${isLast ? "pr-4" : ""}`}>
                    <div
                      className={`text-[14px] leading-5 text-center ${
                        status === "upcoming"
                          ? "text-[#5C5C5C]"
                          : "text-[#0D0B26]"
                      }`}
                    >
                      {title}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex-1 -mx-2">
                      {/* Spacer to match connector width */}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg p-6 ">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Business Name" required>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Enter your Business Name"
                />
              </Field>

              <Field label="Type of Business" required>
                <CustomDropdown
                  options={["Private Limited", "Public Limited", "LLP", "Partnership", "Sole Proprietorship"]}
                  placeholder="Select your Business Type"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Nature of Business" required>
                  <textarea
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                    placeholder="Write minimum 400 characters"
                  />
                </Field>
              </div>

              <Field label="Business Email" required>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Enter your Business Email"
                />
              </Field>

              <Field label="Business Contact Number" required>
                <div className="flex gap-2">
                  <input
                    disabled
                    value="+91"
                    className="w-16 px-3 py-3 rounded-lg bg-white text-[#5A5A5A]"
                  />
                  <input
                    className="flex-1 px-4 py-3 rounded-lg bg-white outline-none"
                    placeholder="Enter your Business Contact Number"
                  />
                </div>
              </Field>

              <Field label="Number of Directors/Partners" required>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Enter Number of Directors/Partners"
                />
              </Field>

              <Field label="Mobile App link" required>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Enter Mobile App link"
                />
              </Field>

              <Field label="Website link" required>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Enter Website link"
                />
              </Field>

              <Field label="Number of Employees" required>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Enter Number of Employees"
                />
              </Field>

              <FileUploadField
                label="Upload Logo"
                buttonLabel="Upload Logo in Jpg, Jpeg"
                required
                accept="image/jpeg,image/jpg"
              />

              <FileUploadField
                label="Udyam Registration"
                buttonLabel="Upload Doc in PDF"
                accept="application/pdf"
              />

              <FileUploadField
                label="Certificate of Incorporation / Partnership Deed"
                buttonLabel="Upload Doc in PDF"
                required
                accept="application/pdf"
              />

              <FileUploadField
                label="PAN(Entity)"
                buttonLabel="Upload Doc in PDF"
                required
                accept="application/pdf"
              />

              <FileUploadField
                label="TAN(Entity)"
                buttonLabel="Upload Doc in PDF"
                required
                accept="application/pdf"
              />

              <Field
                label="Any recognition or awards received by the startup"
                required
              >
                <CustomDropdown
                  options={["Yes", "No"]}
                  placeholder="Select Yes or No"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-6">
              <Field label="What problem your startup is solving" required>
                <textarea
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Write minimum 100–400 characters"
                />
              </Field>

              <Field
                label="How does the startup propose to solve the problem"
                required
              >
                <textarea
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Write minimum 100–400 characters"
                />
              </Field>

              <Field label="What is the uniqueness of the solution" required>
                <textarea
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Write minimum 100–400 characters"
                />
              </Field>

              <Field label="How your startup earns revenue" required>
                <textarea
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Write minimum 100–400 characters"
                />
              </Field>

              <Field
                label="Brief note supporting the options chosen for innovation, improvement and scalability"
                required
              >
                <textarea
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Write minimum 100–400 characters"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Has the Startup Applied for IPR (Intellectual Property Rights) includes Patent, Trademark, Copyright, Design and Plant Variety">
                  <CustomDropdown
                    options={["Yes", "No"]}
                    placeholder="Select Yes or No"
                  />
                </Field>

                <FileUploadField
                  label="Upload Doc"
                  buttonLabel="Doc PDF"
                  accept="application/pdf"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Has your startup received any funding" required>
                  <CustomDropdown
                    options={["Yes", "No"]}
                    placeholder="Select Yes or No"
                  />
                </Field>

                <Field label="Select who you want to connect with">
                  <CustomDropdown
                    options={["Investors", "Mentors", "Partners", "Clients", "Suppliers"]}
                    placeholder="Select the business you want to connect"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 gap-6">
              <Field label="Address 1" required>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Type your address here"
                />
              </Field>

              <Field label="Address 2" required>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  placeholder="Type your address here"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="State" required>
                  <CustomDropdown
                    options={["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat", "West Bengal", "Rajasthan", "Others"]}
                    placeholder="Select your State"
                  />
                </Field>

                <Field label="City" required>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                    placeholder="Enter City Name"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Country" required>
                  <input
                    defaultValue="India"
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                  />
                </Field>

                <Field label="Pincode" required>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                    placeholder="Enter Pincode"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 gap-8">
              {/* Director 1 */}
              <div className="flex flex-col gap-4">
                <div className="text-sm font-medium text-[#28303F]">
                  Director 1
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Name (as per PAN)" required>
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                      placeholder="Enter your Name (as per PAN)"
                    />
                  </Field>
                  <Field label="Email address" required>
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
                        className="w-16 px-3 py-3 rounded-lg bg-white text-[#5A5A5A]"
                      />
                      <input
                        className="flex-1 px-4 py-3 rounded-lg bg-white outline-none"
                        placeholder="Enter your Contact Number"
                      />
                    </div>
                  </Field>
                  <FileUploadField
                    label="Upload Aadhaar Card"
                    buttonLabel="Upload Doc in PDF"
                    required
                    accept="application/pdf"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadField
                    label="PAN Upload"
                    buttonLabel="Upload Doc in PDF"
                    required
                    accept="application/pdf"
                  />
                  <Field label="Are you an Authorised Representative" required>
                    <CustomDropdown
                      options={["Yes", "No"]}
                      placeholder="Select Yes or No"
                    />
                  </Field>
                </div>
              </div>

              {/* Director 2 */}
              <div className="flex flex-col gap-4">
                <div className="text-sm font-medium text-[#28303F]">
                  Director 2
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Name (as per PAN)" required>
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                      placeholder="Enter your Name (as per PAN)"
                    />
                  </Field>
                  <Field label="Email address" required>
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
                        className="flex-1 px-4 py-3 rounded-lg bg-white outline-none"
                        placeholder="Enter your Contact Number"
                      />
                    </div>
                  </Field>
                  <FileUploadField
                    label="Upload Aadhaar Card"
                    buttonLabel="Upload Doc in PDF"
                    required
                    accept="application/pdf"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadField
                    label="PAN Upload"
                    buttonLabel="Upload Doc in PDF"
                    required
                    accept="application/pdf"
                  />
                  <Field label="Are you an Authorised Representative" required>
                    <CustomDropdown
                      options={["Yes", "No"]}
                      placeholder="Select Yes or No"
                    />
                  </Field>
                </div>
              </div>

              {/* Director 3 */}
              <div className="flex flex-col gap-4">
                <div className="text-sm font-medium text-[#28303F]">
                  Director 3
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Name (as per PAN)" required>
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none"
                      placeholder="Enter your Name (as per PAN)"
                    />
                  </Field>
                  <Field label="Email address" required>
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-white outline-none"
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
                        className="flex-1 px-4 py-3 rounded-lg bg-white outline-none"
                        placeholder="Enter your Contact Number"
                      />
                    </div>
                  </Field>
                  <FileUploadField
                    label="Upload Aadhaar Card"
                    buttonLabel="Upload Doc in PDF"
                    required
                    accept="application/pdf"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadField
                    label="PAN Upload"
                    buttonLabel="Upload Doc in PDF"
                    required
                    accept="application/pdf"
                  />
                  <Field label="Are you an Authorised Representative" required>
                    <CustomDropdown
                      options={["Yes", "No"]}
                      placeholder="Select Yes or No"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
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

              {/* Dropzone */}
              <div className="border-2 border-dashed flex flex-col items-center justify-center border-[#AFC3D2] rounded-xl p-8 text-center text-[#5A5A5A] bg-white">
                <CloudUpload
                  size={24}
                  className="text-[#00486D] "
                />
                <div className="text-sm">Drag & Drop your ID here</div>
                <button
                  type="button"
                  className="mt-1 text-[#00486D] underline text-sm"
                >
                  Browse Files
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="px-6 py-3 rounded-md text-white text-sm"
                  style={{ background: 'linear-gradient(90deg, #01334C 0%, #00486D 100%)' }}
                >
                  Upload Signed Authorization Letter
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-1.5 rounded-md border border-[#CFE6F0] text-[#00486D] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-1.5 rounded-md text-white font-medium bg-[#6E6E6E] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetailsForm;
