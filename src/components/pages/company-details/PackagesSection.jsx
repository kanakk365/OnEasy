import React from "react";

function PackagesSection({ packages, onGetStarted }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-center mb-2">Choose your Package</h2>
      <p className="text-center text-gray-600 mb-8">
        Our carefully designed pricing plans take into consideration the
        needs of teams of various sizes.
      </p>
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
            <button
              onClick={onGetStarted}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 mt-auto ${
                pkg.isHighlighted
                  ? "bg-white/20 text-white shadow-sm hover:bg-white/30"
                  : "border border-[#00486D] text-[#00486D] hover:bg-[#00486D] hover:text-white"
              }`}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PackagesSection;


