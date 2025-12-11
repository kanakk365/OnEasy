import React, { useState, useEffect } from 'react';
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
  FaShieldAlt
} from 'react-icons/fa';
import PaymentLinkGeneration from './PaymentLinkGeneration';
import { usePackages } from '../../../hooks/usePackages';

function AdminNewRegistration() {
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
    {
      id: 'private-limited',
      name: 'Private Limited Company',
      icon: <FaBuilding className="w-8 h-8" />,
      description: 'Register a private limited company'
    },
    {
      id: 'proprietorship',
      name: 'Proprietorship',
      icon: <FaStore className="w-8 h-8" />,
      description: 'Register a proprietorship business'
    },
    {
      id: 'startup-india',
      name: 'Startup India',
      icon: <FaRocket className="w-8 h-8" />,
      description: 'Register for Startup India Certificate'
    },
    {
      id: 'gst',
      name: 'GST Registration',
      icon: <FaFileInvoiceDollar className="w-8 h-8" />,
      description: 'Register for Goods and Services Tax'
    },
    {
      id: 'opc',
      name: 'One Person Company',
      icon: <FaUserTie className="w-8 h-8" />,
      description: 'Register a one person company'
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
      name: 'Indian Subsidiary',
      icon: <FaIndustry className="w-8 h-8" />,
      description: 'Register an Indian subsidiary'
    },
    {
      id: 'professional-tax',
      name: 'Professional Tax Registration',
      icon: <FaIdBadge className="w-8 h-8" />,
      description: 'Register for Professional Tax'
    },
    {
      id: 'labour-license',
      name: 'Labour License',
      icon: <FaShieldAlt className="w-8 h-8" />,
      description: 'Apply for Labour License'
    },
    {
      id: 'udyam',
      name: 'Udyam / MSME',
      icon: <FaIdBadge className="w-8 h-8" />,
      description: 'Register for Udyam/MSME'
    },
    {
      id: 'fssai',
      name: 'FSSAI / Food License',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Apply for FSSAI/Food license'
    },
    {
      id: 'trade-license',
      name: 'Trade License',
      icon: <FaIdBadge className="w-8 h-8" />,
      description: 'Apply for Trade License'
    },
    {
      id: 'iec',
      name: 'Import Export Code (IEC)',
      icon: <FaGlobe className="w-8 h-8" />,
      description: 'Apply for IEC'
    },
    {
      id: 'lut',
      name: 'GST LUT',
      icon: <FaFileInvoiceDollar className="w-8 h-8" />,
      description: 'Apply for GST LUT'
    },
    {
      id: 'dsc',
      name: 'Digital Signature (DSC)',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Apply for DSC'
    },
    {
      id: 'esi',
      name: 'ESI Registration',
      icon: <FaShieldAlt className="w-8 h-8" />,
      description: 'Apply for ESI'
    },
    {
      id: '12a',
      name: '12A Registration',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Apply for 12A registration'
    },
    {
      id: '80g',
      name: '80G Registration',
      icon: <FaCertificate className="w-8 h-8" />,
      description: 'Apply for 80G registration'
    },
    {
      id: 'provident-fund',
      name: 'Provident Fund Registration',
      icon: <FaShieldAlt className="w-8 h-8" />,
      description: 'Register for Provident Fund'
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
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
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
                onClick={() => handlePlanSelect(plan)}
                className="bg-white rounded-xl p-8 border-2 border-gray-200 cursor-pointer hover:border-[#01334C] hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-[#01334C] mb-1">₹{plan.price.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                <button className="w-full px-4 py-2 bg-[#01334C] text-white rounded-lg hover:bg-[#00486D] transition-colors font-medium">
                  Select Plan
                </button>
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

