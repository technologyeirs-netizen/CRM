import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { getHomeRoute, isSuperAdminRole, isTeamRole } from '../config/roles';

const AuthContext = createContext(null);

const readStoredPermissions = () => {
  const stored = localStorage.getItem('crm_permissions');
  return stored ? JSON.parse(stored) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('crm_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [permissions, setPermissions] = useState(readStoredPermissions);
  const [loading, setLoading] = useState(false);

  // Pulls the fresh, tab-by-tab permission matrix for whoever is logged in
  // right now (see GET /api/auth/me on the server). Called right after
  // login and once on app boot so a page refresh doesn't lose it.
  const refreshPermissions = useCallback(async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data?.permissions) {
        setPermissions(data.permissions);
        localStorage.setItem('crm_permissions', JSON.stringify(data.permissions));
      }
      return data?.permissions || null;
    } catch (error) {
      // Non-fatal — the app falls back to the coarse team-based gating in
      // config/roles.js if this fails for any reason.
      return null;
    }
  }, []);

  useEffect(() => {
    if (user && !permissions) {
      refreshPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

      const freshPermissions = await refreshPermissions();

      return {
        success: true,
        redirectTo: getHomeRoute(normalizedUser.role),
        user: normalizedUser,
        permissions: freshPermissions,
      };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(msg);
      console.error('Login error:', error);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [refreshPermissions]);

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    localStorage.removeItem('crm_permissions');
    setUser(null);
    setPermissions(null);
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

  // Fine-grained permission check: can('sales-leads', 'assign').
  // Super Admin always passes.
  const can = useCallback(
    (moduleKey, action = 'view') => {
      if (isAdmin) return true;
      if (!permissions) return false;
      if (permissions.isSuperAdmin) return true;
      if (!permissions.modules) return true;
      return Boolean(permissions.modules[moduleKey]?.[action]);
    },
    [isAdmin, permissions]
  );

  const canViewFullRevenue = isAdmin || Boolean(permissions?.canViewFullRevenue);
  const canManageTeamUsers = isAdmin || Boolean(permissions?.canManageTeamUsers);
  const dataScope = isAdmin ? 'all' : permissions?.dataScope || 'own';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAdmin,
        isSuperAdmin,
        isEmployee,
        isTeamLead,
        permissions,
        refreshPermissions,
        can,
        canViewFullRevenue,
        canManageTeamUsers,
        dataScope,
      }}
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
