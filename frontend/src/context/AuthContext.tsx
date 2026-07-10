import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'owner' | 'admin';
  membership: {
    plan: 'none' | 'basic' | 'premium' | 'vip';
    status: 'active' | 'inactive' | 'cancelled';
    startDate: string | null;
    endDate: string | null;
  };
  favoriteGyms: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  apiUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const apiUrl = 'http://localhost:5050/api';

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get(`${apiUrl}/auth/me`);
          setUser({
            id: res.data._id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
            membership: res.data.membership,
            favoriteGyms: res.data.favoriteGyms?.map((g: any) => g._id || g) || []
          });
        } catch (err) {
          console.error('Error loading user:', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      setToken(userToken);
      setUser(userData);
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.message || 'Login failed.');
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/auth/register`, { name, email, password, role });
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      setToken(userToken);
      setUser(userData);
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${apiUrl}/auth/me`);
      setUser({
        id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        membership: res.data.membership,
        favoriteGyms: res.data.favoriteGyms?.map((g: any) => g._id || g) || []
      });
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, apiUrl }}>
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
