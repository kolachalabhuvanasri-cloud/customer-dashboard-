import { createContext, useContext, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'customer-dashboard-auth';

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { token: '', user: null };
  } catch {
    return { token: '', user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readSession);

  const persistSession = (next) => {
    setSession(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const login = async (email, password) => {
    const data = await apiRequest('/login', { method: 'POST', body: { email, password } });
    persistSession({ token: data.token, user: data.user });
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await apiRequest('/register', { method: 'POST', body: { name, email, password } });
    persistSession({ token: data.token, user: data.user });
    return data.user;
  };

  const logout = () => {
    persistSession({ token: '', user: null });
  };

  const refreshProfile = async () => {
    if (!session.token) return null;
    const data = await apiRequest('/profile', { token: session.token });
    persistSession({ token: session.token, user: data.user });
    return data.user;
  };

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token),
      login,
      register,
      logout,
      refreshProfile
    }),
    [session.token, session.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
