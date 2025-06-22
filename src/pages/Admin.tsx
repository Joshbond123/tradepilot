
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPage } from '@/components/admin/AdminPage';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();

  useEffect(() => {
    // If not authenticated, redirect to dashboard
    if (!isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    login();
  };

  if (!isAuthenticated) {
    return (
      <AdminAuth
        onLogin={handleLogin}
        onClose={() => navigate('/dashboard')}
      />
    );
  }

  return <AdminPage />;
};

export default Admin;
