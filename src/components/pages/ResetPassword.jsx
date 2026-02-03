import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Redirects to login page - reset password flow happens on login page
function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || searchParams.get('resetToken');

  useEffect(() => {
    if (token) {
      navigate(`/login?resetToken=${token}`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  return null;
}

export default ResetPassword;
