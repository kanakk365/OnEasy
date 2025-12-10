import { useState, useEffect } from 'react';
import apiClient from '../utils/api';

/**
 * Custom hook to fetch packages for a service type
 * @param {string} serviceType - The service type (e.g., 'gst', 'private-limited')
 * @param {boolean} enabled - Whether to fetch packages (default: true)
 * @returns {object} { packages, loading, error, refetch }
 */
export function usePackages(serviceType, enabled = true) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPackages = async () => {
    if (!enabled || !serviceType) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/packages?service_type=${serviceType}`);
      
      if (response.success && response.data) {
        // Transform API data to match frontend format
        const transformedPackages = response.data.map(pkg => ({
          name: pkg.package_name,
          price: parseFloat(pkg.price || 0).toLocaleString('en-IN'),
          priceValue: parseFloat(pkg.price || 0),
          originalPrice: pkg.original_price ? parseFloat(pkg.original_price).toLocaleString('en-IN') : null,
          originalPriceValue: pkg.original_price ? parseFloat(pkg.original_price) : null,
          period: pkg.period || 'One Time',
          description: pkg.description || 'Key Features',
          icon: pkg.icon || '★',
          features: Array.isArray(pkg.features) ? pkg.features : [],
          isHighlighted: pkg.is_highlighted || false,
          color: 'blue' // Default color, can be customized per service
        }));
        
        setPackages(transformedPackages);
      } else {
        setPackages([]);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [serviceType, enabled]);

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages
  };
}

