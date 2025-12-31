import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../utils/api';
import {
  FaBuilding,
  FaStore,
  FaFileInvoiceDollar,
  FaRocket,
  FaUserTie,
  FaHandshake,
  FaUniversity,
  FaGlobe,
  FaCertificate,
  FaIndustry,
  FaIdBadge,
  FaShieldAlt,
  FaUserPlus,
  FaExchangeAlt,
  FaMapMarkerAlt,
  FaFileContract,
  FaUserMinus,
  FaFileAlt,
  FaEdit,
  FaChartLine,
  FaTag,
  FaPowerOff,
  FaRedo,
  FaFileInvoice,
  FaTimesCircle,
  FaIdCard,
  FaBriefcase,
  FaTrademark,
  FaHome,
  FaShoppingCart,
  FaUsers
} from 'react-icons/fa';
import PaymentLinkGeneration from './PaymentLinkGeneration';
import { usePackages } from '../../../hooks/usePackages';

function AdminNewRegistration() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1); // 1: Select User, 2: Select Type, 3: Select Plan, 4: Payment Link, 5: Fill Form
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeSearch, setTypeSearch] = useState('');

  // Fetch packages for selected service type
  const serviceTypeForApi = selectedType?.id || null;
  const { packages: apiPackages, loading: packagesLoading } = usePackages(serviceTypeForApi, !!selectedType);

  const registrationTypes = [
    // Startup Services (9)
    {
      id: 'private-limited',
      name: 'Private Limited Company',
      icon: <FaBuilding className="w-8 h-8" />,
      description: 'Register a private limited company'
    },
    {
      id: 'opc',
      name: 'One Person Company',
      icon: <FaUserTie className="w-8 h-8" />,
      description: 'Register a one person company'
    },
    {
      id: 'proprietorship',
      name: 'Proprietorship',
      icon: <FaStore className="w-8 h-8" />,
      description: 'Register a proprietorship business'
    },
    {
      id: 'llp',
      name: 'Limited Liability Partnership',
      icon: <FaHandshake className="w-8 h-8" />,
      description: 'Register an LLP'
    },
    {
      id: 'partnership',
      name: 'Partnership Firm',
      icon: <FaHandshake className="w-8 h-8" />,
      description: 'Register a partnership firm'
    },
    {
      id: 'section-8',
      name: 'Section 8 Company',
      icon: <FaUniversity className="w-8 h-8" />,
      description: 'Register a Section 8 company'
    },
    {
      id: 'public-limited',
      name: 'Public Limited Company',
      icon: <FaGlobe className="w-8 h-8" />,
      description: 'Register a public limited company'
    },
    {
      id: 'mca-name-approval',
      name: 'MCA Name Approval',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Apply for MCA name approval'
    },
    {
      id: 'indian-subsidiary',
      name: 'Indian Subsidiary Company',
      icon: <FaIndustry className="w-8 h-8" />,
      description: 'Register an Indian subsidiary'
    },
    // Registration Services (14)
    {
      id: 'startup-india',
      name: 'Start - Up India Certificate',
      icon: <FaRocket className="w-8 h-8" />,
      description: 'Get certified under Start-Up India initiative'
    },
    {
      id: 'professional-tax',
      name: 'Professional Tax Registration',
      icon: <FaIdBadge className="w-8 h-8" />,
      description: 'Register for professional tax compliance'
    },
    {
      id: 'labour-license',
      name: 'Labour License Registration',
      icon: <FaShieldAlt className="w-8 h-8" />,
      description: 'Obtain labor license for your business'
    },
    {
      id: 'provident-fund',
      name: 'Provident Fund Registration',
      icon: <FaShieldAlt className="w-8 h-8" />,
      description: 'Register for PF and employee benefits'
    },
    {
      id: 'gst',
      name: 'GST Registration',
      icon: <FaFileInvoiceDollar className="w-8 h-8" />,
      description: 'Register for Goods and Services Tax'
    },
    {
      id: 'udyam',
      name: 'Udyam Registration',
      icon: <FaIdBadge className="w-8 h-8" />,
      description: 'MSME/Udyog Aadhaar registration'
    },
    {
      id: 'fssai',
      name: 'FSSAI / Food license',
      icon: <FaShoppingCart className="w-8 h-8" />,
      description: 'Food safety and standards authority license'
    },
    {
      id: 'trade-license',
      name: 'Trade License',
      icon: <FaBuilding className="w-8 h-8" />,
      description: 'Municipal trade license for business operations'
    },
    {
      id: 'iec',
      name: 'Import Export Code (IEC) Registration',
      icon: <FaGlobe className="w-8 h-8" />,
      description: 'IEC for import/export business'
    },
    {
      id: 'lut',
      name: 'Letter of Undertaking',
      icon: <FaFileContract className="w-8 h-8" />,
      description: 'LOU for business transactions'
    },
    {
      id: 'esi',
      name: 'Employee State Insurance (ESI) Registration',
      icon: <FaShieldAlt className="w-8 h-8" />,
      description: 'ESI registration for employee insurance'
    },
    {
      id: 'dsc',
      name: 'Digital Signature Certificate',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'DSC for digital authentication'
    },
    {
      id: '12a',
      name: '12A Registration',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Income tax exemption for NGOs/Trusts'
    },
    {
      id: '80g',
      name: '80G Registration',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Tax deduction certificate for donations'
    },
    // Goods and Services Tax (6)
    {
      id: 'gst-registration',
      name: 'GST Registration',
      icon: <FaFileInvoiceDollar className="w-8 h-8" />,
      description: 'Register for Goods and Services Tax'
    },
    {
      id: 'gst-returns',
      name: 'GST Returns',
      icon: <FaFileAlt className="w-8 h-8" />,
      description: 'File your GST returns regularly'
    },
    {
      id: 'gst-lut',
      name: 'Letter of Undertaking',
      icon: <FaFileContract className="w-8 h-8" />,
      description: 'Apply for GST LUT for exports'
    },
    {
      id: 'gst-annual-return',
      name: 'GST Annual Return Filing',
      icon: <FaFileInvoice className="w-8 h-8" />,
      description: 'File your annual GST return'
    },
    {
      id: 'gst-amendment',
      name: 'GST Amendment',
      icon: <FaEdit className="w-8 h-8" />,
      description: 'Amend your GST registration details'
    },
    {
      id: 'gst-notice',
      name: 'GST Notice',
      icon: <FaShieldAlt className="w-8 h-8" />,
      description: 'Respond to GST notices and queries'
    },
    // ROC & MCA Services (17)
    {
      id: 'director-addition',
      name: 'Director Addition',
      icon: <FaUserPlus className="w-8 h-8" />,
      description: 'Add new directors to your company'
    },
    {
      id: 'share-transfer',
      name: 'Share Transfer',
      icon: <FaExchangeAlt className="w-8 h-8" />,
      description: 'Transfer shares between shareholders'
    },
    {
      id: 'address-change',
      name: 'Address Change (Registered Office Change)',
      icon: <FaMapMarkerAlt className="w-8 h-8" />,
      description: 'Update your company\'s registered office address'
    },
    {
      id: 'charge-creation',
      name: 'Charge Creation',
      icon: <FaFileContract className="w-8 h-8" />,
      description: 'Create charges on company assets'
    },
    {
      id: 'director-removal',
      name: 'Director Removal',
      icon: <FaUserMinus className="w-8 h-8" />,
      description: 'Remove directors from your company'
    },
    {
      id: 'moa-amendment',
      name: 'MOA Amendment',
      icon: <FaFileAlt className="w-8 h-8" />,
      description: 'Amend Memorandum of Association'
    },
    {
      id: 'aoa-amendment',
      name: 'AOA Amendment',
      icon: <FaEdit className="w-8 h-8" />,
      description: 'Amend Articles of Association'
    },
    {
      id: 'objects-clause-change',
      name: 'Change In Objects clause',
      icon: <FaBuilding className="w-8 h-8" />,
      description: 'Modify company\'s main objects clause'
    },
    {
      id: 'increase-share-capital',
      name: 'Increase in Share Capital',
      icon: <FaChartLine className="w-8 h-8" />,
      description: 'Increase authorized share capital'
    },
    {
      id: 'name-change-company',
      name: 'Name Change - Company',
      icon: <FaTag className="w-8 h-8" />,
      description: 'Change your company name'
    },
    {
      id: 'din-deactivation',
      name: 'DIN Deactivation',
      icon: <FaPowerOff className="w-8 h-8" />,
      description: 'Deactivate Director Identification Number'
    },
    {
      id: 'din-reactivation',
      name: 'DIN Reactivation',
      icon: <FaRedo className="w-8 h-8" />,
      description: 'Reactivate Director Identification Number'
    },
    {
      id: 'adt-1',
      name: 'ADT-1',
      icon: <FaFileInvoice className="w-8 h-8" />,
      description: 'Appointment of Auditor'
    },
    {
      id: 'winding-up-company',
      name: 'Winding Up - Company',
      icon: <FaTimesCircle className="w-8 h-8" />,
      description: 'Wind up a company'
    },
    {
      id: 'winding-up-llp',
      name: 'Winding Up - LLP',
      icon: <FaHandshake className="w-8 h-8" />,
      description: 'Wind up a Limited Liability Partnership'
    },
    {
      id: 'din-application',
      name: 'DIN Application - MCA',
      icon: <FaIdCard className="w-8 h-8" />,
      description: 'Apply for Director Identification Number'
    },
    {
      id: 'inc-20a',
      name: 'INC 20A - MCA',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Declaration for commencement of business'
    },
    // Compliance Services (11)
    {
      id: 'fssai-renewal',
      name: 'FSSAI Renewal',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Renew your FSSAI license'
    },
    {
      id: 'fssai-return-filing',
      name: 'FSSAI Return Filing',
      icon: <FaFileAlt className="w-8 h-8" />,
      description: 'File your FSSAI returns'
    },
    {
      id: 'business-plan',
      name: 'Business Plan',
      icon: <FaFileInvoice className="w-8 h-8" />,
      description: 'Create a comprehensive business plan'
    },
    {
      id: 'hr-payroll',
      name: 'HR & Payroll Service',
      icon: <FaUsers className="w-8 h-8" />,
      description: 'Manage HR and payroll compliance'
    },
    {
      id: 'pf-return-filing',
      name: 'PF Return Filing',
      icon: <FaBuilding className="w-8 h-8" />,
      description: 'File your Provident Fund returns'
    },
    {
      id: 'esi-return-filing',
      name: 'ESI Return Filing',
      icon: <FaFileContract className="w-8 h-8" />,
      description: 'File your Employee State Insurance returns'
    },
    {
      id: 'professional-tax-return',
      name: 'Professional Tax Return Filing',
      icon: <FaFileAlt className="w-8 h-8" />,
      description: 'File your professional tax returns'
    },
    {
      id: 'partnership-compliance',
      name: 'Partnership Compliance',
      icon: <FaHandshake className="w-8 h-8" />,
      description: 'Ensure partnership firm compliance'
    },
    {
      id: 'proprietorship-compliance',
      name: 'Proprietorship Compliance',
      icon: <FaUserTie className="w-8 h-8" />,
      description: 'Maintain proprietorship compliance'
    },
    {
      id: 'company-compliance',
      name: 'Company Compliance',
      icon: <FaBriefcase className="w-8 h-8" />,
      description: 'Ensure company regulatory compliance'
    },
    {
      id: 'trademark',
      name: 'Trademark',
      icon: <FaTrademark className="w-8 h-8" />,
      description: 'Register and manage your trademarks'
    },
    // Tax & Accounting Services (7)
    {
      id: 'salary-itr',
      name: 'Income Tax Return - Salary',
      icon: <FaFileInvoiceDollar className="w-8 h-8" />,
      description: 'File income tax returns for salaried individuals'
    },
    {
      id: 'business-itr',
      name: 'Business - Income Tax Return',
      icon: <FaBriefcase className="w-8 h-8" />,
      description: 'File income tax returns for business income'
    },
    {
      id: 'house-property-itr',
      name: 'House Property - Income Tax Return',
      icon: <FaHome className="w-8 h-8" />,
      description: 'File income tax returns for house property income'
    },
    {
      id: 'trust-itr',
      name: 'Trust - Income Tax Return',
      icon: <FaHandshake className="w-8 h-8" />,
      description: 'File income tax returns for trusts'
    },
    {
      id: 'salary-hp-capital-gains',
      name: 'Income From Salary, HP and Capital gains',
      icon: <FaChartLine className="w-8 h-8" />,
      description: 'File returns for salary, house property, and capital gains'
    },
    {
      id: 'partnership-firm-itr',
      name: 'Partnership Firm - ITR',
      icon: <FaBuilding className="w-8 h-8" />,
      description: 'File income tax returns for partnership firms'
    },
    {
      id: 'company-itr',
      name: 'Company - ITR',
      icon: <FaFileAlt className="w-8 h-8" />,
      description: 'File income tax returns for companies'
    }
  ];

  // Transform API packages to match component format
  const getPlansFromApi = () => {
    if (!apiPackages || apiPackages.length === 0) return [];
    
    return apiPackages.map((pkg, index) => ({
      id: pkg.name?.toLowerCase().replace(/\s+/g, '-') || `package-${index}`,
      name: pkg.name || 'Package',
      price: pkg.priceValue || 0,
      description: pkg.description || 'Key Features',
      originalPrice: pkg.originalPriceValue || null,
      features: Array.isArray(pkg.features) ? pkg.features : []
    }));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-select user if userId is provided in URL params
  useEffect(() => {
    const userIdFromUrl = searchParams.get('userId');
    if (userIdFromUrl && users.length > 0 && !selectedUser) {
      const user = users.find(u => String(u.id) === String(userIdFromUrl));
      if (user) {
        setSelectedUser(user);
        setStep(2); // Skip to step 2 (Select Registration Type)
      }
    }
  }, [users, searchParams, selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/clients');
      if (response.success && response.data) {
        // Transform clients data to users format
        const usersList = response.data.map(client => ({
          id: client.user_id || client.id,
          name: client.name,
          email: client.email,
          phone: client.phone
        }));
        setUsers(usersList || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    );
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setStep(2);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep(3);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep(4); // Go to payment link generation step
  };

  const handlePayLater = async (plan) => {
    if (!selectedUser || !selectedType || !plan) {
      alert('Please ensure user and service are selected');
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiClient.post('/admin/registrations/create-pay-later', {
        userId: selectedUser.id,
        registrationType: selectedType.id,
        packagePlan: {
          name: plan.name,
          price: plan.price,
          priceValue: plan.price,
          originalPrice: plan.originalPrice || plan.price,
          discountAmount: 0,
          discountPercentage: 0,
          couponCode: null
        }
      });

      if (response.success) {
        alert(`✅ Registration created successfully! Payment can be collected later via Custom Payment.`);
        // Reset form
        setStep(1);
        setSelectedUser(null);
        setSelectedType(null);
        setSelectedPlan(null);
      } else {
        alert(response.message || 'Failed to create registration');
      }
    } catch (error) {
      console.error('Error creating pay later registration:', error);
      alert(error.response?.data?.message || error.message || 'Failed to create registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentLinkGenerated = () => {
    // Payment link generated successfully
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedUser(null);
    } else if (step === 3) {
      setStep(2);
      setSelectedType(null);
    } else if (step === 4) {
      setStep(3);
      setSelectedPlan(null);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            New Registration
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Select a user to create a registration on their behalf
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
          />
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-[#F3F3F3]">
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-[#F3F3F3]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#01334C] text-white flex items-center justify-center font-semibold text-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-medium text-gray-900">{user.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors text-sm font-medium"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
        <div className="mb-6 md:mb-8">
          <button
            onClick={handleBack}
            className="mb-4 text-[#01334C] hover:text-[#00486D] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            Select Registration Type
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Selected User: <span className="font-medium">{selectedUser?.name} ({selectedUser?.email})</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Total Services Available: <span className="font-semibold">{registrationTypes.length}</span>
            {typeSearch && (
              <> | Showing: <span className="font-semibold">{registrationTypes.filter((type) => {
                const s = typeSearch.toLowerCase();
                return type.name.toLowerCase().includes(s) || type.id.toLowerCase().includes(s);
              }).length}</span></>
            )}
          </p>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search services..."
            value={typeSearch}
            onChange={(e) => setTypeSearch(e.target.value)}
            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01334C] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {registrationTypes
            .filter((type) => {
              if (!typeSearch.trim()) return true;
              const s = typeSearch.toLowerCase();
              return type.name.toLowerCase().includes(s) || type.id.toLowerCase().includes(s);
            })
            .map((type) => (
            <div
              key={type.id}
              onClick={() => handleTypeSelect(type)}
              className="bg-white rounded-xl p-8 border border-[#F3F3F3] cursor-pointer hover:border-[#01334C] hover:shadow-lg transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#01334C] text-white flex items-center justify-center mx-auto mb-4">
                {type.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 3) {
    const plans = getPlansFromApi();

    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6">
        <div className="mb-6 md:mb-8">
          <button
            onClick={handleBack}
            className="mb-4 text-[#01334C] hover:text-[#00486D] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            Select Package Plan
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Service: <span className="font-medium">{selectedType?.name}</span> | 
            User: <span className="font-medium">{selectedUser?.name}</span>
          </p>
        </div>

        {packagesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-dashed border-gray-300 text-center text-gray-700">
            <p className="mb-2 font-semibold">No packages available for this service.</p>
            <p className="text-sm text-gray-600">You can go back and choose another service or add packages in CMS.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-[#01334C] hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-[#01334C] mb-1">₹{plan.price.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handlePlanSelect(plan)}
                    className="w-full px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium"
                  >
                    Select Plan
                  </button>
                  <button 
                    onClick={() => handlePayLater(plan)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Pay Later'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (step === 4) {
    return (
      <PaymentLinkGeneration
        user={selectedUser}
        registrationType={selectedType}
        packagePlan={selectedPlan}
        onBack={handleBack}
        onPaymentLinkGenerated={handlePaymentLinkGenerated}
      />
    );
  }

  return null;
}

export default AdminNewRegistration;

