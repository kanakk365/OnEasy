/**
 * Maps service types/identifiers to display names
 */
export const SERVICE_NAME_MAP = {
  // Registration Services
  'private-limited': 'Private Limited',
  'proprietorship': 'Proprietorship',
  'opc': 'One Person Company',
  'llp': 'Limited Liability Partnership',
  'partnership': 'Partnership',
  'section-8': 'Section 8 Company',
  'public-limited': 'Public Limited',
  'mca-name-approval': 'MCA Name Approval',
  'indian-subsidiary': 'Indian Subsidiary',
  
  // GST Services
  'gst': 'GST Registration',
  'gst-registration': 'GST Registration',
  'gst-returns': 'GST Returns',
  'gst-notice': 'GST Notice',
  'gst-lut': 'GST LUT',
  
  // Startup Services
  'startup-india': 'Startup India',
  'udyam': 'Udyam Registration',
  
  // ROC & MCA Services
  'roc-compliance': 'ROC Compliance',
  'mca-compliance': 'MCA Compliance',
  'din-application': 'DIN Application',
  'name-change-company': 'Name Change Company',
  'share-transfer': 'Share Transfer',
  'adt1': 'ADT-1',
  
  // Compliance Services
  'esi': 'ESI Registration',
  'pf': 'Provident Fund',
  'provident-fund': 'Provident Fund',
  'professional-tax': 'Professional Tax',
  'labour-license': 'Labour License',
  'fssai': 'FSSAI Registration',
  'trade-license': 'Trade License',
  'iec': 'IEC Registration',
  'dsc': 'Digital Signature Certificate',
  
  // Tax & Accounting Services
  'itr': 'Income Tax Return',
  '12a': '12A Registration',
  '80g': '80G Registration',
  'business-plan': 'Business Plan',
  'hr-payroll': 'HR & Payroll',
  'proprietorship-compliance': 'Proprietorship Compliance',
  
  // Package names mapping (fallback)
  'Starter': 'Service',
  'Growth': 'Service',
  'Pro': 'Service',
  'Basic': 'Service',
  'Premium': 'Service'
};

/**
 * Get service display name from various inputs
 * @param {string} serviceType - Service type identifier
 * @param {string} packageName - Package name (fallback)
 * @param {string} routePath - Current route path
 * @returns {string} Display name
 */
export const getServiceDisplayName = (serviceType = null, packageName = null, routePath = null) => {
  // Try service type first
  if (serviceType && SERVICE_NAME_MAP[serviceType.toLowerCase()]) {
    return SERVICE_NAME_MAP[serviceType.toLowerCase()];
  }
  
  // Try route path
  if (routePath) {
    const pathParts = routePath.split('/').filter(p => p);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && SERVICE_NAME_MAP[lastPart.toLowerCase()]) {
      return SERVICE_NAME_MAP[lastPart.toLowerCase()];
    }
  }
  
  // Try package name
  if (packageName && SERVICE_NAME_MAP[packageName]) {
    return SERVICE_NAME_MAP[packageName];
  }
  
  // Try to get from localStorage
  const registrationTitle = localStorage.getItem('selectedRegistrationTitle');
  if (registrationTitle) {
    return registrationTitle;
  }
  
  // Default fallback
  return packageName || 'Service';
};

