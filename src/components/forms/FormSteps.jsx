import React from "react";
import { Download, Check, TriangleAlert, CloudUpload } from "lucide-react";
import Field from "./Field";
import CustomDropdown from "./CustomDropdown";
import FileUploadField from "./FileUploadField";

function DirectorForm({ directorNumber }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-medium text-[#28303F]">
        Director {directorNumber}
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
  );
}

export function Step1Content() {
  return (
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
  );
}

export function Step2Content() {
  return (
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
  );
}

export function Step3Content() {
  return (
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
  );
}

export function Step4Content() {
  return (
    <div className="grid grid-cols-1 gap-8">
      <DirectorForm directorNumber={1} />
      <DirectorForm directorNumber={2} />
      <DirectorForm directorNumber={3} />
    </div>
  );
}

export function Step5Content() {
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
  );
}

