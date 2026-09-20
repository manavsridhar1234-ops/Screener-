import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  role?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'equitylens_auth_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Generate clean user session
    const username = email.split('@')[0] || 'Analyst';
    const cleanName = username.charAt(0).toUpperCase() + username.slice(1);
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email,
      isGuest: false,
      role: 'Registered Analyst',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
    return true;
  };

  const signup = async (name: string, email: string, _password?: string): Promise<boolean> => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Analyst',
      email,
      isGuest: false,
      role: 'Registered Analyst',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
    return true;
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: 'Guest Analyst',
      email: 'guest@equitylens.internal',
      isGuest: true,
      role: 'Guest Observer',
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        signup,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
