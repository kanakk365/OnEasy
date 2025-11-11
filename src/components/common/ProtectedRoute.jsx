import React from 'react';
import { Navigate } from 'react-router-dom';
import { AUTH_CONFIG } from '../../config/auth';

/**
 * ProtectedRoute - Wrapper component to protect routes
 * @param {Object} props
 * @param {React.Component} props.children - Child components to render
 * @param {Array} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectTo - Where to redirect if unauthorized (default: '/login')
 */
function ProtectedRoute({ children, allowedRoles = [], redirectTo = '/' }) {
  // Get user from localStorage
  const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
  const storedToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);

  // Check if user is authenticated
  if (!storedUser || !storedToken) {
    console.log('❌ No authentication found, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  try {
    const user = JSON.parse(storedUser);
    const userRole = user.role || user.role_id;

    console.log('🔐 Protected Route Check:', {
      userRole,
      allowedRoles,
      isAllowed: allowedRoles.length === 0 || allowedRoles.includes(userRole)
    });

    // If no specific roles required, allow authenticated users
    if (allowedRoles.length === 0) {
      return children;
    }

    // Check if user's role is in allowed roles
    const isAuthorized = allowedRoles.some(role => {
      // Check both string roles ('admin', 'superadmin', 'user') and numeric role_id (1, 2, 5)
      return userRole === role || 
             (typeof role === 'string' && role === 'admin' && (userRole === 'admin' || userRole === 1)) ||
             (typeof role === 'string' && role === 'superadmin' && (userRole === 'superadmin' || userRole === 2)) ||
             (typeof role === 'string' && role === 'user' && (userRole === 'user' || userRole === 5));
    });

    if (!isAuthorized) {
      console.log('❌ Unauthorized access attempt:', { userRole, allowedRoles });
      
      // Redirect based on user's role
      if (userRole === 'admin' || userRole === 1) {
        return <Navigate to="/admin/clients" replace />;
      } else if (userRole === 'superadmin' || userRole === 2) {
        return <Navigate to="/superadmin/clients" replace />;
      } else {
        return <Navigate to="/client" replace />;
      }
    }

    // User is authorized
    return children;

  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    // Clear invalid data and redirect to login
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    return <Navigate to={redirectTo} replace />;
  }
}

export default ProtectedRoute;

