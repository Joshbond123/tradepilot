
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPage } from '@/components/admin/AdminPage';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAdminAuth();

  const handleLogin = () => {
    console.log('Admin login successful');
    login();
  };

  const handleClose = () => {
    navigate('/');
  };

  console.log('Admin page - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return (
      <AdminAuth
        onLogin={handleLogin}
        onClose={handleClose}
      />
    );
  }

  return <AdminPage />;
};

export default Admin;
