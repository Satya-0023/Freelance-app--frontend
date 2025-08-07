// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  profile?: any;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await apiService.getMe(token);
      if (res.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('AuthContext: Refresh user error:', err);
      setUser(null);
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext: Token found:', !!token);

    if (token) {
      apiService.getMe(token)
        .then(res => {
          console.log('AuthContext: getMe response:', res);
          if (res.success) {
            setUser(res.data.user);
            console.log('AuthContext: User set:', res.data.user);
          } else {
            console.log('AuthContext: getMe failed:', res.message);
            setUser(null);
            localStorage.removeItem('token');
          }
        })
        .catch((error) => {
          console.log('AuthContext: getMe error:', error);
          setUser(null);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      console.log('AuthContext: No token found');
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await apiService.login({ email, password });
      if (res.success) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
      } else {
        const errorMessage = res.message || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("AuthContext: Login error:", err);
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await apiService.register(data);
      if (res.success) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
      } else {
        const errorMessage = res.message || 'Registration failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("AuthContext: Register error:", err);
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await apiService.logout(token);
      } catch (err) {
        console.warn('AuthContext: Logout error (ignored)', err);
      }
      localStorage.removeItem('token');
    }
    setUser(null);
    setError(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...data } : prev));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated, 
      error,
      login, 
      register, 
      logout, 
      updateUser,
      clearError,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
