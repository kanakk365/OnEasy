import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_CONFIG } from '../../config/auth';

function RoleBasedRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER) || '{}');
    const role = user.role || user.role_id;

    if (role === 'admin' || role === 5) {
      navigate('/admin/clients');
    } else if (role === 'superadmin') {
      navigate('/superadmin/clients');
    } else {
      navigate('/client');
    }
  }, [navigate]);

  return null;
}

export default RoleBasedRedirect;

