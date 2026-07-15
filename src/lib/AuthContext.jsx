import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as authService from '@/services/auth';
import { isSupabaseConfigured } from '@/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) {
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }
    })();

    const unsub = authService.onAuthStateChange((_event, nextUser) => {
      if (cancelled) return;
      setUser(nextUser);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const logout = useCallback((shouldRedirect = true) => {
    setUser(null);
    if (shouldRedirect) {
      authService.logout().finally(() => {
        window.location.assign(`${window.location.origin}/`);
      });
    } else {
      authService.logout();
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    const url = new URL('/login', window.location.origin);
    url.searchParams.set('return', window.location.href);
    window.location.assign(url.toString());
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!user?.role) return false;
      if (!roles || (Array.isArray(roles) && roles.length === 0)) return true;
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(user.role);
    },
    [user]
  );

  const value = {
    user,
    role: user?.role ?? null,
    departmentId: user?.department_id ?? null,
    isAuthenticated: Boolean(user),
    isLoadingAuth,
    authChecked,
    authError: null,
    isMock: !isSupabaseConfigured,
    hasRole,
    logout,
    navigateToLogin,
    checkUserAuth,
    checkAppState: checkUserAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
