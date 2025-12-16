import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { validateCoupon } from "../../../utils/couponApi";
import { createSupportRequest } from "../../../utils/supportRequestApi";
import { AUTH_CONFIG } from "../../../config/auth";
import { getServiceDisplayName } from "../../../utils/serviceNames";

function PackagesSection({ packages, onGetStarted, serviceName = null }) {
  const location = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [_selectedPackage, setSelectedPackage] = useState(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    // Validate coupon with minimum package price to check basic validity
    // Will be re-validated with actual package price when user selects a package
    const minPrice = Math.min(...packages.map(p => p.priceValue));
    const result = await validateCoupon(couponCode, minPrice);

    setValidatingCoupon(false);

    if (result.valid) {
      setAppliedCoupon(result);
      setCouponError("");
    } else {
      setAppliedCoupon(null);
      setCouponError(result.message || "Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleGetStartedWithCoupon = async (pkg) => {
    setSelectedPackage(pkg);
    
    // If coupon is applied, re-validate with this specific package's price
    if (appliedCoupon && appliedCoupon.valid && couponCode.trim()) {
      // Re-validate coupon with actual package price
      const validation = await validateCoupon(couponCode, pkg.priceValue);
      
      if (!validation.valid) {
        setCouponError(validation.message || "Coupon is not valid for this package");
        setAppliedCoupon(null);
        // Still proceed with payment without coupon
        onGetStarted(pkg);
        return;
      }

      // Calculate discount for this specific package
      const discountAmount = validation.discountAmount;
      const finalAmount = validation.finalAmount;
      
      // Create package with discounted price
      const discountedPackage = {
        ...pkg,
        originalPrice: pkg.price,
        originalPriceValue: pkg.priceValue,
        price: finalAmount.toLocaleString('en-IN'),
        priceValue: Math.round(finalAmount),
        couponCode: couponCode.toUpperCase().trim(),
        discountAmount: Math.round(discountAmount),
        discountPercentage: validation.discountPercentage
      };
      
      onGetStarted(discountedPackage);
    } else {
      onGetStarted(pkg);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-center mb-2">Choose your Package</h2>
      <p className="text-center text-gray-600 mb-8">
        Our carefully designed pricing plans take into consideration the
        needs of teams of various sizes.
      </p>

      {/* Coupon Code Section */}
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Have a coupon code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError("");
                if (appliedCoupon) {
                  setAppliedCoupon(null);
                }
              }}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
              disabled={validatingCoupon}
            />
            {appliedCoupon ? (
              <button
                onClick={handleRemoveCoupon}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {validatingCoupon ? "Applying..." : "Apply"}
              </button>
            )}
          </div>
          {appliedCoupon && appliedCoupon.valid && (
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✓ Coupon applied! {appliedCoupon.discountPercentage}% discount will be applied at checkout.
            </div>
          )}
          {couponError && (
            <div className="mt-2 text-sm text-red-600">
              {couponError}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-9">
        {packages.map((pkg, index) => (
          <div
            key={index}
            className={`relative flex flex-col h-full transition-all duration-300 cursor-pointer group rounded-[36px] p-10 shadow-sm ${
              pkg.isHighlighted
                ? "bg-gradient-to-b from-[#00486D] to-[#014365] text-white hover:shadow-lg"
                : "bg-gradient-to-b from-white to-[#EAEAEA] border border-[#E2E2E2] text-[#101828] hover:shadow-md"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl ${
                pkg.isHighlighted ? "bg-white/15 text-white" : "bg-[#ED1C25] text-white"
              }`}
            >
              {pkg.icon}
            </div>
            <h3 className={`mb-2 font-medium ${pkg.isHighlighted ? "text-white text-2xl" : "text-[#101828] text-2xl"}`}>
              {pkg.name}
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <span className={`font-medium ${pkg.isHighlighted ? "text-5xl text-white" : "text-5xl text-[#101828]"}`}>
                ₹{pkg.price}
              </span>
              <div className="flex flex-col">
                {pkg.originalPrice && (
                  <span className={`line-through ${pkg.isHighlighted ? "text-white/90" : "text-[#101828]"} text-base`}>
                    ₹{pkg.originalPrice}
                  </span>
                )}
                <span className={`${pkg.isHighlighted ? "text-white/60" : "text-[#475467]"} text-sm`}>
                  /per month
                </span>
              </div>
            </div>
            <p className={`mb-6 text-base ${pkg.isHighlighted ? "text-white/80" : "text-[#101828]/80"}`}>
              {pkg.description}
            </p>
            <ul className="space-y-4 mb-8 flex-1">
              {pkg.features.map((feature, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${pkg.isHighlighted ? "bg-white" : "bg-[#01334C]"}`}>
                    <span className={`text-[10px] ${pkg.isHighlighted ? "text-[#01334C]" : "text-white"}`}>✓</span>
                  </div>
                  <span className={`text-sm ${pkg.isHighlighted ? "text-white" : "text-[#101828]"}`}>{feature}</span>
                </li>
              ))}
            </ul>
            {appliedCoupon && appliedCoupon.valid && (
              <div className="mb-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className={pkg.isHighlighted ? "text-white/80" : "text-gray-600"}>
                    Original Price:
                  </span>
                  <span className={pkg.isHighlighted ? "text-white line-through" : "text-gray-500 line-through"}>
                    ₹{pkg.price}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className={pkg.isHighlighted ? "text-white font-semibold" : "text-[#101828] font-semibold"}>
                    Discount ({appliedCoupon.discountPercentage}%):
                  </span>
                  <span className={pkg.isHighlighted ? "text-white font-semibold" : "text-green-600 font-semibold"}>
                    -₹{Math.round((pkg.priceValue * appliedCoupon.discountPercentage) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                  <span className={pkg.isHighlighted ? "text-white font-bold text-lg" : "text-[#101828] font-bold text-lg"}>
                    Final Price:
                  </span>
                  <span className={pkg.isHighlighted ? "text-white font-bold text-lg" : "text-[#01334C] font-bold text-lg"}>
                    ₹{(pkg.priceValue - Math.round((pkg.priceValue * appliedCoupon.discountPercentage) / 100)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => handleGetStartedWithCoupon(pkg)}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 mt-auto ${
                pkg.isHighlighted
                  ? "bg-white/20 text-white shadow-sm hover:bg-white/30"
                  : "border border-[#00486D] text-[#00486D] hover:bg-[#00486D] hover:text-white"
              }`}
            >
              Get Started
            </button>
            <button
              onClick={async () => {
                try {
                  const user = JSON.parse(localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || '{}');
                  if (!user.id) {
                    alert('Please login to contact support.');
                    return;
                  }
                  
                  // Get service display name using utility function
                  const requestServiceName = getServiceDisplayName(
                    serviceName,
                    pkg.name,
                    location.pathname
                  );
                  const packageName = pkg.name || null;
                  
                  const result = await createSupportRequest(requestServiceName, packageName);
                  if (result.success) {
                    alert('Support request submitted successfully! Our team will contact you soon.');
                  } else {
                    alert('Failed to submit support request. Please try again.');
                  }
                } catch (error) {
                  console.error('Error submitting support request:', error);
                  alert('An error occurred. Please try again.');
                }
              }}
              className={`w-full py-2 mt-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                pkg.isHighlighted
                  ? "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Contact Support for Assistance
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PackagesSection;


