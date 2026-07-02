import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  const refreshAuth = async () => {
    const authed = await isAuthenticated();
    setLoggedIn(authed);
    if (authed) setUser(await getCurrentUser());
    setChecking(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const signOut = async () => {
    await apiLogout();
    setUser(null);
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, loggedIn, checking, refreshAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
