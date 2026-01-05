import React, { useState } from 'react';
import { RiTicketLine, RiCheckLine, RiMoneyDollarCircleLine, RiPercentLine } from 'react-icons/ri';
import { MdContentCopy } from 'react-icons/md';
import { FiDownload, FiInfo, FiTag, FiHash } from 'react-icons/fi';
import apiClient from '../../utils/api';

function CouponCodeGenerator() {
  const [copied, setCopied] = useState(false);
  const [prefix, setPrefix] = useState('ONEASY');
  const [length] = useState(8);
  const [includeNumbers] = useState(true);
  const [includeLetters] = useState(true);
  const [quantity] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [discountAmount, setDiscountAmount] = useState(500);
  const [saving, setSaving] = useState(false);

  const generateCode = () => {
    const discount =
      discountType === 'percentage'
        ? typeof discountPercentage === 'string'
          ? parseFloat(discountPercentage)
          : discountPercentage
        : typeof discountAmount === 'string'
          ? parseFloat(discountAmount)
          : discountAmount;

    if (
      !discount ||
      isNaN(discount) ||
      (discountType === 'percentage' && (discount <= 0 || discount > 100)) ||
      (discountType === 'amount' && discount <= 0)
    ) {
      alert(
        discountType === 'percentage'
          ? 'Please enter a valid discount percentage (1-100)'
          : 'Please enter a valid discount amount (> 0)'
      );
      return;
    }

    const codes = [];
    for (let i = 0; i < quantity; i++) {
      // Start with prefix + discount value (e.g., ONEASY10 or ONEASY500)
      const baseValue = Math.round(discount || 10).toString();
      let code = prefix.toUpperCase() + baseValue;
      
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

    const discount =
      discountType === 'percentage'
        ? typeof discountPercentage === 'string'
          ? parseFloat(discountPercentage)
          : discountPercentage
        : typeof discountAmount === 'string'
          ? parseFloat(discountAmount)
          : discountAmount;

    if (
      !discount ||
      isNaN(discount) ||
      (discountType === 'percentage' && (discount <= 0 || discount > 100)) ||
      (discountType === 'amount' && discount <= 0)
    ) {
      alert(
        discountType === 'percentage'
          ? 'Please enter a valid discount percentage (1-100)'
          : 'Please enter a valid discount amount (> 0)'
      );
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.post('/coupons/create', {
        couponCodes: generatedCodes,
        discountPercentage: discountType === 'percentage' ? discount : undefined,
        discountAmount: discountType === 'amount' ? discount : undefined,
        discountType,
        prefix: prefix,
        codeLength: length,
        description:
          discountType === 'percentage'
            ? `${discount}% discount coupon code`
            : `₹${discount} discount coupon code`
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

  const parsedDiscountPercentage = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) || 0 : discountPercentage;
  const parsedDiscountAmount = typeof discountAmount === 'string' ? parseFloat(discountAmount) || 0 : discountAmount;
  const displayDiscountLabel =
    discountType === 'percentage'
      ? `${parsedDiscountPercentage}%`
      : `₹${parsedDiscountAmount}`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
             <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" 
                style={{ background: "linear-gradient(180deg, #022B51 0%, #015079 100%)" }}
             >
                <RiTicketLine className="w-5 h-5" />
             </div>
             <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                   Coupon Generator
                </h1>
                <p className="text-gray-500 italic ml-1">Create unique promotional codes</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Generator Settings Card */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                       <FiTag className="w-4 h-4 text-[#00486D]" />
                       Generator Settings
                    </h2>
                 </div>
                 
                 <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Prefix Input */}
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
                          <div className="relative">
                             <input
                                type="text"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow uppercase"
                                placeholder="ONEASY"
                                maxLength={10}
                             />
                             <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 ml-1">Example: ONEASY10, ONEASY500</p>
                       </div>

                       {/* Discount Type Selector */}
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                          <div className="flex gap-2">
                             <button 
                                onClick={() => setDiscountType('percentage')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                                   discountType === 'percentage' 
                                   ? 'bg-[#E0F2FE] border-[#00486D] text-[#00486D] font-medium' 
                                   : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                             >
                                <RiPercentLine className="w-4 h-4" /> Percentage
                             </button>
                             <button 
                                onClick={() => setDiscountType('amount')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                                   discountType === 'amount' 
                                   ? 'bg-[#E0F2FE] border-[#00486D] text-[#00486D] font-medium' 
                                   : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                             >
                                <RiMoneyDollarCircleLine className="w-4 h-4" /> Fixed Amount
                             </button>
                          </div>
                       </div>
                    </div>

                    {/* Discount Values */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`transition-opacity duration-300 ${discountType === 'percentage' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Percentage Value</label>
                           <div className="relative mb-3">
                              <input
                                 type="number"
                                 value={discountPercentage}
                                 onChange={(e) => {
                                    const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                    setDiscountPercentage(val);
                                 }}
                                 className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow disabled:bg-gray-50"
                                 min="0" max="100"
                                 disabled={discountType !== 'percentage'}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                           </div>
                           <div className="flex gap-2">
                              {[10, 15, 20, 25, 50].map(val => (
                                 <button 
                                    key={val}
                                    onClick={() => setDiscountType('percentage') || setDiscountPercentage(val)}
                                    className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
                                    disabled={discountType !== 'percentage'}
                                 >
                                    {val}%
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className={`transition-opacity duration-300 ${discountType === 'amount' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Amount</label>
                           <div className="relative mb-3">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                              <input
                                 type="number"
                                 value={discountAmount}
                                 onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                                 className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00486D] transition-shadow disabled:bg-gray-50"
                                 min="0"
                                 disabled={discountType !== 'amount'}
                              />
                           </div>
                           <div className="flex gap-2">
                              {[100, 500, 1000, 2000].map(val => (
                                 <button 
                                    key={val}
                                    onClick={() => setDiscountType('amount') || setDiscountAmount(val)}
                                    className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
                                    disabled={discountType !== 'amount'}
                                 >
                                    ₹{val}
                                 </button>
                              ))}
                           </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                       <button
                          onClick={generateCode}
                          className="px-6 py-3 bg-[#01334C] text-white rounded-xl hover:bg-[#00486D] transition-all shadow-md hover:shadow-lg font-medium active:scale-95"
                       >
                          Generate Code
                       </button>
                       {generatedCodes.length > 0 && (
                          <button
                             onClick={saveCouponsToDatabase}
                             disabled={saving}
                             className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                             {saving ? 'Saving...' : 'Save to DB'}
                          </button>
                       )}
                    </div>
                 </div>
              </div>

              {/* Tips Card */}
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                 <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                       <FiInfo className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-sm font-semibold text-blue-900 mb-1">Quick Tips</h3>
                       <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
                          <li>Use a meaningful prefix to identify your campaign (e.g., SUMMER, DIWALI).</li>
                          <li>Ensure the discount value reflects your intended offer strategy.</li>
                          <li>Save the generated code to the database to activate it for users.</li>
                       </ul>
                    </div>
                 </div>
              </div>
           </div>

           {/* Results Sidebar */}
           <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden h-full flex flex-col">
                 <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Generated Code</h2>
                    {generatedCodes.length > 0 && (
                       <div className="flex gap-2">
                          <button onClick={copyAllCodes} className="p-1.5 text-gray-500 hover:text-[#00486D] hover:bg-blue-50 rounded-lg transition-colors" title="Copy All">
                             <MdContentCopy className="w-4 h-4" />
                          </button>
                          <button onClick={downloadCodes} className="p-1.5 text-gray-500 hover:text-[#00486D] hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                             <FiDownload className="w-4 h-4" />
                          </button>
                       </div>
                    )}
                 </div>

                 <div className="flex-1 p-6">
                    {generatedCodes.length > 0 ? (
                       <div className="space-y-4">
                          <div className="bg-gradient-to-br from-[#01334C] to-[#00507A] rounded-2xl p-6 text-center shadow-lg relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-4 -mt-4"></div>
                             <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-tr-full -ml-4 -mb-4"></div>
                             
                             <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-2">
                                {discountType === 'percentage' ? `${parsedDiscountPercentage}% OFF` : `₹${parsedDiscountAmount} OFF`}
                             </p>
                             <div className="flex items-center justify-center gap-3 mb-1">
                                <code className="text-2xl font-mono font-bold text-white tracking-widest break-all">
                                   {generatedCodes[0]}
                                </code>
                             </div>
                             <button
                                onClick={() => copyToClipboard(generatedCodes[0])}
                                className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 mx-auto"
                             >
                                {copied ? <><RiCheckLine /> Copied</> : <><MdContentCopy /> Copy Code</>}
                             </button>
                          </div>
                       </div>
                    ) : (
                       <div className="h-40 flex flex-col items-center justify-center text-center text-gray-400">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                             <RiTicketLine className="w-6 h-6 text-gray-300" />
                          </div>
                          <p className="text-sm">No code generated yet</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default CouponCodeGenerator;
