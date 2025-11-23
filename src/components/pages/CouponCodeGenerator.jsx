import React, { useState } from 'react';
import { RiTicketLine, RiCheckLine } from 'react-icons/ri';
import { MdContentCopy } from 'react-icons/md';
import apiClient from '../../utils/api';

function CouponCodeGenerator() {
  const [copied, setCopied] = useState(false);
  const [prefix, setPrefix] = useState('ONEASY');
  const [length, setLength] = useState(8);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeLetters, setIncludeLetters] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [saving, setSaving] = useState(false);

  const generateCode = () => {
    const discount = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) : discountPercentage;
    if (!discount || isNaN(discount) || discount <= 0 || discount > 100) {
      alert('Please enter a valid discount percentage (1-100)');
      return;
    }

    const codes = [];
    for (let i = 0; i < quantity; i++) {
      // Start with prefix + discount percentage (e.g., ONEASY10, ONEASY20)
      const discount = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) : discountPercentage;
      let code = prefix.toUpperCase() + Math.round(discount || 10).toString();
      
      // If we still need more characters, add random characters
      const remainingLength = length - code.length;
      if (remainingLength > 0) {
        const chars = [];
        
        if (includeLetters) chars.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        if (includeNumbers) chars.push(...'0123456789');
        
        if (chars.length === 0) {
          alert('Please select at least one character type (letters or numbers)');
          return;
        }
        
        for (let j = 0; j < remainingLength; j++) {
          code += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      codes.push(code);
    }
    
    setGeneratedCodes(codes);
  };

  const saveCouponsToDatabase = async () => {
    if (generatedCodes.length === 0) {
      alert('Please generate coupon codes first');
      return;
    }

    const discount = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) : discountPercentage;
    if (!discount || isNaN(discount) || discount <= 0 || discount > 100) {
      alert('Please enter a valid discount percentage (1-100)');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.post('/coupons/create', {
        couponCodes: generatedCodes,
        discountPercentage: discount,
        discountType: 'percentage',
        prefix: prefix,
        codeLength: length,
        description: `${discount}% discount coupon code`
      });

      if (response.success) {
        alert(`✅ Successfully saved ${response.data.length} coupon code(s) to database!`);
      }
    } catch (error) {
      console.error('Error saving coupons:', error);
      alert(`Failed to save coupons: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyAllCodes = () => {
    const allCodes = generatedCodes.join('\n');
    navigator.clipboard.writeText(allCodes).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadCodes = () => {
    const content = generatedCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupon-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <RiTicketLine className="text-[#01334C]" />
            Coupon Code Generator
          </h1>
          <p className="text-gray-600 mt-2">Generate unique coupon codes for your promotions</p>
        </div>

        {/* Generator Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Generator Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prefix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prefix
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                placeholder="ONEASY"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">Code will start with this prefix + discount percentage (e.g., ONEASY10 for 10%)</p>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Length
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(Math.max(4, Math.min(20, parseInt(e.target.value) || 8)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                min="4"
                max="20"
              />
              <p className="text-xs text-gray-500 mt-1">Length of random characters (4-20)</p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C]"
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Number of codes to generate (1-100)</p>
            </div>

            {/* Character Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Types
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeLetters}
                    onChange={(e) => setIncludeLetters(e.target.checked)}
                    className="mr-2 w-4 h-4 text-[#01334C] border-gray-300 rounded focus:ring-[#01334C]"
                  />
                  <span className="text-sm text-gray-700">Include Letters (A-Z)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="mr-2 w-4 h-4 text-[#01334C] border-gray-300 rounded focus:ring-[#01334C]"
                  />
                  <span className="text-sm text-gray-700">Include Numbers (0-9)</span>
                </label>
              </div>
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow user to type freely - accept any valid number input
                    if (inputValue === '') {
                      setDiscountPercentage('');
                    } else {
                      const numValue = parseFloat(inputValue);
                      if (!isNaN(numValue)) {
                        // Allow typing any number, we'll clamp on blur
                        setDiscountPercentage(numValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // Validate and clamp on blur
                    const value = parseFloat(e.target.value);
                    if (isNaN(value) || e.target.value === '' || value < 1) {
                      setDiscountPercentage(1);
                    } else if (value > 100) {
                      setDiscountPercentage(100);
                    } else {
                      // Ensure it's an integer
                      setDiscountPercentage(Math.round(value));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] pr-12"
                  min="1"
                  max="100"
                  step="1"
                  required
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Discount percentage (1-100%)</p>
            </div>
          </div>

          {/* Generate and Save Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={generateCode}
              className="px-8 py-3 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium shadow-sm"
            >
              Generate Coupon Code{quantity > 1 ? 's' : ''}
            </button>
            {generatedCodes.length > 0 && (
              <button
                onClick={saveCouponsToDatabase}
                disabled={saving}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save to Database'}
              </button>
            )}
          </div>
        </div>

        {/* Generated Codes Display */}
        {generatedCodes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Generated Code{generatedCodes.length > 1 ? 's' : ''} ({generatedCodes.length})
              </h2>
              <div className="flex gap-2">
                {generatedCodes.length > 1 && (
                  <>
                    <button
                      onClick={copyAllCodes}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <MdContentCopy className="w-4 h-4" />
                      Copy All
                    </button>
                    <button
                      onClick={downloadCodes}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Download
                    </button>
                  </>
                )}
              </div>
            </div>

            {generatedCodes.length === 1 ? (
              <div className="bg-gradient-to-r from-[#01334C] to-[#00486D] rounded-lg p-6 text-center">
                <div className="mb-2">
                  <span className="text-white/80 text-sm">Discount: {typeof discountPercentage === 'string' ? parseFloat(discountPercentage) || 0 : discountPercentage}%</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <code className="text-2xl font-mono font-bold text-white tracking-wider">
                    {generatedCodes[0]}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedCodes[0])}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    {copied ? (
                      <RiCheckLine className="w-5 h-5 text-white" />
                    ) : (
                      <MdContentCopy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-300 text-sm mt-2">Copied to clipboard!</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {generatedCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <code className="text-lg font-mono font-semibold text-gray-900 block">
                        {code}
                      </code>
                      <span className="text-sm text-gray-600 mt-1">Discount: {typeof discountPercentage === 'string' ? parseFloat(discountPercentage) || 0 : discountPercentage}%</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="p-2 text-gray-600 hover:text-[#01334C] hover:bg-white rounded-lg transition-colors ml-4"
                      title="Copy code"
                    >
                      {copied ? (
                        <RiCheckLine className="w-5 h-5" />
                      ) : (
                        <MdContentCopy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use a meaningful prefix to identify your campaign</li>
            <li>Longer codes are more secure but harder to remember</li>
            <li>You can generate multiple codes at once for bulk promotions</li>
            <li>Download codes as a text file for easy sharing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CouponCodeGenerator;

