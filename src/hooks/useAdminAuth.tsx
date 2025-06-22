
import { useState, useEffect } from 'react';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('admin_authenticated');
      const loginTime = localStorage.getItem('admin_login_time');
      
      if (adminAuth === 'true' && loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
        
        // Session expires after 8 hours
        if (hoursSinceLogin < 8) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_login_time');
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_login_time');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};
