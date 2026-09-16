import React, { createContext, useContext, useState, useCallback } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { getHomeRoute, isSuperAdminRole, isTeamRole } from '../config/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('crm_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/signin', { email, password });
      const token = data?.token;
      const backendUser = data?.data || {};

      if (!token || !backendUser?.id) {
        throw new Error('Invalid login response from server');
      }

      const normalizedUser = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        isAdmin: Boolean(
          backendUser.isAdmin || backendUser.role === 'admin' || backendUser.role === 'superadmin'
        ),
        role: backendUser.role || 'employee',
        status: backendUser.status || 'active',
      };

      localStorage.setItem('crm_token', token);
      localStorage.setItem('crm_user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      toast.success(`Welcome back, ${normalizedUser.name}!`);
      return {
        success: true,
        redirectTo: getHomeRoute(normalizedUser.role),
        user: normalizedUser,
      };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(msg);
      console.error('Login error:', error);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updates };
      localStorage.setItem('crm_user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const isAdmin = Boolean(user?.isAdmin) || isSuperAdminRole(user?.role);
  const isSuperAdmin = isAdmin;
  const isEmployee = user?.role === 'employee';
  const isTeamLead = isTeamRole(user?.role);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUser, isAdmin, isSuperAdmin, isEmployee, isTeamLead }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
