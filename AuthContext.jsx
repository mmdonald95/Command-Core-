import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from './src/lib/supabase.js';
import {
  applyCompanyThemeToDocument,
  getCompanyTheme,
} from '@/lib/companyTheme';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [company, setCompanyRecord] = useState(null);
  const [companyTheme, setCompanyTheme] = useState(getCompanyTheme(null));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userCompanyId, setUserCompanyId] = useState(null);
  const [authError, setAuthError] = useState(null);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      setUserCompanyId(null);
      setCompanyRecord(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      setProfile(null);
      setUserCompanyId(localStorage.getItem('selected_company_id') || null);
      setCompanyRecord(null);
      setAuthError({
        type: 'profile_missing',
        message: error.message || 'No profile record found.',
      });
      return;
    }

    setProfile(data);
    setAuthError(null);

    const selectedCompany =
      data.company_id ||
      localStorage.getItem('selected_company_id') ||
      null;

    if (selectedCompany) {
      localStorage.setItem('selected_company_id', selectedCompany);
    }

    setUserCompanyId(selectedCompany);
  }, []);

  const loadCompany = useCallback(async (companyId) => {
    if (!companyId) {
      setCompanyRecord(null);
      const defaultTheme = getCompanyTheme(null);
      setCompanyTheme(defaultTheme);
      applyCompanyThemeToDocument(defaultTheme);
      return;
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      setCompanyRecord(null);
      const fallbackTheme = getCompanyTheme(null);
      setCompanyTheme(fallbackTheme);
      applyCompanyThemeToDocument(fallbackTheme);
      return;
    }

    setCompanyRecord(data || null);
    const nextTheme = getCompanyTheme(data || null);
    setCompanyTheme(nextTheme);
    applyCompanyThemeToDocument(nextTheme);
  }, []);

  const applySession = useCallback(async (session) => {
    const authUser = session?.user || null;

    setUser(authUser);
    setIsAuthenticated(!!authUser);

    if (authUser) {
      await loadProfile(authUser);
    } else {
      setProfile(null);
      setCompanyRecord(null);
      setUserCompanyId(null);
      setAuthError(null);
      const defaultTheme = getCompanyTheme(null);
      setCompanyTheme(defaultTheme);
      applyCompanyThemeToDocument(defaultTheme);
    }

    setIsLoadingAuth(false);
  }, [loadProfile]);

  const checkAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setUser(null);
      setProfile(null);
      setCompanyRecord(null);
      setIsAuthenticated(false);
      setUserCompanyId(null);
      setAuthError({ type: 'session_error', message: error.message });
      setIsLoadingAuth(false);
      return;
    }

    await applySession(data?.session || null);
  }, [applySession]);

  useEffect(() => {
    applyCompanyThemeToDocument(getCompanyTheme(null));
  }, []);

  useEffect(() => {
    loadCompany(userCompanyId);
  }, [userCompanyId, loadCompany]);

  useEffect(() => {
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Avoid async deadlocks here; defer session handling.
      setTimeout(() => {
        applySession(session || null);
      }, 0);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [checkAuth, applySession]);

  const logout = async () => {
    localStorage.removeItem('selected_company_id');
    localStorage.removeItem('pending_company_code');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCompanyRecord(null);
    setIsAuthenticated(false);
    setUserCompanyId(null);
    setAuthError(null);
    const defaultTheme = getCompanyTheme(null);
    setCompanyTheme(defaultTheme);
    applyCompanyThemeToDocument(defaultTheme);
    window.location.href = '/';
  };

  const setCompany = (companyId) => {
    localStorage.setItem('selected_company_id', companyId);
    setUserCompanyId(companyId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        company,
        companyTheme,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        userCompanyId,
        logout,
        setCompany,
        refreshCompany: () => loadCompany(userCompanyId),
        checkAppState: checkAuth,
        navigateToLogin: () => {
          window.location.href = '/SignIn';
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
