import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiLogin, apiRegister, apiUpdateProfile } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook', name: string, email: string) => Promise<void>;
  register: (payload: {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    role: 'buyer' | 'seller';
    authProvider?: 'mobile' | 'google' | 'facebook';
    agreedTerms: boolean;
    sellerDetails?: any;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  switchRoleDemo: (role: 'buyer' | 'seller' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'xantro_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const login = async (identifier: string, password?: string) => {
    const res = await apiLogin({ identifier, password });
    saveUserSession(res.user);
  };

  const socialLogin = async (provider: 'google' | 'facebook', name: string, email: string) => {
    const res = await apiLogin({ provider, name, email });
    saveUserSession(res.user);
  };

  const register = async (payload: {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    role: 'buyer' | 'seller';
    authProvider?: 'mobile' | 'google' | 'facebook';
    agreedTerms: boolean;
    sellerDetails?: any;
  }) => {
    const res = await apiRegister(payload);
    saveUserSession(res.user);
  };

  const logout = () => {
    saveUserSession(null);
  };

  const updateUser = (updatedUser: User) => {
    saveUserSession(updatedUser);
  };

  const switchRoleDemo = async (targetRole: 'buyer' | 'seller' | 'admin') => {
    if (targetRole === 'admin') {
      const res = await apiLogin({ identifier: 'admin@xantro.com', password: 'admin123' });
      saveUserSession(res.user);
    } else if (targetRole === 'seller') {
      const res = await apiLogin({ identifier: '9876500001', password: 'seller123' });
      saveUserSession(res.user);
    } else {
      const res = await apiLogin({ identifier: '9812345678', password: 'buyer123' });
      saveUserSession(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        socialLogin,
        register,
        logout,
        updateUser,
        switchRoleDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
