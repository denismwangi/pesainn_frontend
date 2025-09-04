import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const sessionData = authService.getCurrentUser();
    if (sessionData && sessionData.user) {
      setUser(sessionData.user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const login = async (identifier, password, loginType) => {
    const result = await authService.login(identifier, password, loginType);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = async () => {
    const result = await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    return result;
  };

  const refreshUserProfile = async () => {
    const result = await userService.getUserProfile();
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const updateUser = (userData) => {
    setUser(userData);
    userService.updateLocalUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUserProfile,
    updateUser,
    checkAuthentication
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};