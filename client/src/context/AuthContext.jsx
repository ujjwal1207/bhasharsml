import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as logoutService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isAuthenticated,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
