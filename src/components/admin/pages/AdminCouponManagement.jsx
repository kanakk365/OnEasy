import React, { useState, useEffect } from 'react';
import { RiTicketLine, RiCheckLine, RiCloseLine, RiDeleteBinLine } from 'react-icons/ri';
import { FiLock, FiUnlock, FiRefreshCw } from 'react-icons/fi';
import apiClient from '../../../utils/api';

function AdminCouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/coupons');
      if (response.success) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableCoupon = async (couponCode) => {
    if (!window.confirm(`Are you sure you want to disable coupon "${couponCode}"?`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [couponCode]: true }));
      const response = await apiClient.post('/coupons/disable', { couponCode });
      
      if (response.success) {
        alert('✅ Coupon disabled successfully');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error disabling coupon:', error);
      alert(`Failed to disable coupon: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [couponCode]: false }));
    }
  };

  const handleEnableCoupon = async (couponCode) => {
    try {
      setActionLoading(prev => ({ ...prev, [couponCode]: true }));
      const response = await apiClient.post('/coupons/enable', { couponCode });
      
      if (response.success) {
        alert('✅ Coupon enabled successfully');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error enabling coupon:', error);
      alert(`Failed to enable coupon: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [couponCode]: false }));
    }
  };

  const handleDeleteCoupon = async (couponCode) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${couponCode}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [`delete-${couponCode}`]: true }));
      const response = await apiClient.delete(`/coupons/${couponCode}`);
      
      if (response.success) {
        alert('✅ Coupon deleted successfully');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert(`Failed to delete coupon: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${couponCode}`]: false }));
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (filterActive === 'active') return coupon.is_active;
    if (filterActive === 'inactive') return !coupon.is_active;
    return true;
  });

  const getUsagePercentage = (coupon) => {
    if (!coupon.usage_limit) return 0;
    return (coupon.usage_count / coupon.usage_limit) * 100;
  };

  const getStatusBadge = (coupon) => {
    if (!coupon.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <FiLock className="w-3 h-3" /> Disabled
        </span>
      );
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          Fully Used
        </span>
      );
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <RiCheckLine className="w-3 h-3" /> Active
      </span>
    );
  };

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
                Coupon Management
              </h1>
              <p className="text-gray-500 italic ml-1">View and manage coupon codes</p>
            </div>
          </div>

          <button
            onClick={fetchCoupons}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filterActive === 'all'
                    ? 'bg-[#01334C] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({coupons.length})
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filterActive === 'active'
                    ? 'bg-[#01334C] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active ({coupons.filter(c => c.is_active).length})
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-[#01334C] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Disabled ({coupons.filter(c => !c.is_active).length})
              </button>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Coupon Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading coupons...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="font-mono font-semibold text-[#01334C] bg-blue-50 px-2 py-1 rounded">
                          {coupon.coupon_code}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.discount_type === 'percentage' ? (
                          <span className="text-sm font-medium text-gray-900">
                            {coupon.discount_percentage}% OFF
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            ₹{coupon.discount_amount} OFF
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>
                                {coupon.usage_count} / {coupon.usage_limit || '∞'}
                              </span>
                              {coupon.usage_limit && (
                                <span>{Math.round(getUsagePercentage(coupon))}%</span>
                              )}
                            </div>
                            {coupon.usage_limit && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    getUsagePercentage(coupon) >= 100
                                      ? 'bg-red-500'
                                      : getUsagePercentage(coupon) >= 75
                                      ? 'bg-orange-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(100, getUsagePercentage(coupon))}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(coupon.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {coupon.is_active ? (
                            <button
                              onClick={() => handleDisableCoupon(coupon.coupon_code)}
                              disabled={actionLoading[coupon.coupon_code]}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading[coupon.coupon_code] ? (
                                'Disabling...'
                              ) : (
                                <>
                                  <FiLock className="w-3 h-3" /> Disable
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnableCoupon(coupon.coupon_code)}
                              disabled={actionLoading[coupon.coupon_code]}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading[coupon.coupon_code] ? (
                                'Enabling...'
                              ) : (
                                <>
                                  <FiUnlock className="w-3 h-3" /> Enable
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCoupon(coupon.coupon_code)}
                            disabled={actionLoading[`delete-${coupon.coupon_code}`]}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                            title="Delete coupon permanently"
                          >
                            {actionLoading[`delete-${coupon.coupon_code}`] ? (
                              'Deleting...'
                            ) : (
                              <>
                                <RiDeleteBinLine className="w-3 h-3" /> Delete
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCouponManagement;
