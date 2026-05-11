'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from './api';
import { clearSession, loadSession, saveSession } from './storage';
import type { AuthSession, AuthUser } from './types';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setHydrated(true);
  }, []);

  const setSession = useCallback((session: AuthSession) => {
    saveSession(session);
    setUser(session.user);
    setToken(session.token);
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        // ignorar errores de red al cerrar sesión
      }
    }
    clearSession();
    setUser(null);
    setToken(null);
  }, [token]);

  const value = useMemo(
    () => ({ user, token, hydrated, setSession, logout }),
    [user, token, hydrated, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
