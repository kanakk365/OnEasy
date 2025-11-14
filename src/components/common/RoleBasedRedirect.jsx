import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AUTH_CONFIG } from '../../config/auth';

function RoleBasedRedirect({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);
      const userRole = user.role || user.role_id;

      // If admin is on client routes, redirect to admin panel
      if ((userRole === 'admin' || userRole === '1' || userRole === '2')) {
        const clientRoutes = ['/client', '/registrations', '/settings', '/organization', '/company-categories'];
        if (clientRoutes.includes(location.pathname)) {
          console.log('🔐 Admin detected on client route, redirecting to admin panel...');
          navigate('/admin/clients', { replace: true });
          return;
        }
      }

      // If regular user is on admin routes, redirect to client dashboard
      if (userRole !== 'admin' && userRole !== '1' && userRole !== '2') {
        const adminRoutes = ['/admin'];
        if (location.pathname.startsWith('/admin') && !location.pathname.includes('/admin/clients') && !location.pathname.includes('/admin/profile')) {
          console.log('🔐 Non-admin detected on admin route, redirecting to client dashboard...');
          navigate('/client', { replace: true });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
}

export default RoleBasedRedirect;





import { useNavigate, useLocation } from 'react-router-dom';
import { AUTH_CONFIG } from '../../config/auth';

function RoleBasedRedirect({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);
      const userRole = user.role || user.role_id;

      // If admin is on client routes, redirect to admin panel
      if ((userRole === 'admin' || userRole === '1' || userRole === '2')) {
        const clientRoutes = ['/client', '/registrations', '/settings', '/organization', '/company-categories'];
        if (clientRoutes.includes(location.pathname)) {
          console.log('🔐 Admin detected on client route, redirecting to admin panel...');
          navigate('/admin/clients', { replace: true });
          return;
        }
      }

      // If regular user is on admin routes, redirect to client dashboard
      if (userRole !== 'admin' && userRole !== '1' && userRole !== '2') {
        const adminRoutes = ['/admin'];
        if (location.pathname.startsWith('/admin') && !location.pathname.includes('/admin/clients') && !location.pathname.includes('/admin/profile')) {
          console.log('🔐 Non-admin detected on admin route, redirecting to client dashboard...');
          navigate('/client', { replace: true });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
}

export default RoleBasedRedirect;





