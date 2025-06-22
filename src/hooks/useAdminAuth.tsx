
import { useState, useEffect } from 'react';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('admin_authenticated');
      const loginTime = localStorage.getItem('admin_login_time');
      
      console.log('Checking auth - adminAuth:', adminAuth, 'loginTime:', loginTime);
      
      if (adminAuth === 'true' && loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
        
        console.log('Hours since login:', hoursSinceLogin);
        
        // Session expires after 8 hours
        if (hoursSinceLogin < 8) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_login_time');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const login = () => {
    console.log('Login called');
    localStorage.setItem('admin_authenticated', 'true');
    localStorage.setItem('admin_login_time', new Date().toISOString());
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_login_time');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};
