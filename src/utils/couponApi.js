import apiClient from './api';

/**
 * Validate a coupon code
 * @param {string} couponCode - The coupon code to validate
 * @param {number} purchaseAmount - The purchase amount
 * @returns {Promise<Object>} - Validation result with discount info
 */
export const validateCoupon = async (couponCode, purchaseAmount) => {
  try {
    const response = await apiClient.post('/coupons/validate', {
      couponCode: couponCode.toUpperCase().trim(),
      purchaseAmount
    });

    if (response.success) {
      return {
        success: true,
        valid: response.valid,
        discountAmount: response.discountAmount,
        discountPercentage: response.discountPercentage,
        finalAmount: response.finalAmount,
        message: response.message || 'Coupon applied successfully',
        coupon: response.coupon
      };
    } else {
      return {
        success: false,
        valid: false,
        message: response.message || 'Invalid coupon code'
      };
    }
  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      success: false,
      valid: false,
      message: error.message || 'Failed to validate coupon code'
    };
  }
};


