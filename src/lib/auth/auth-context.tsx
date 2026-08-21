'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SessionUser } from '@/types';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  signup: (email: string, password: string, name: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const COOKIE_NAME = 'medidemo-session';
const ONE_WEEK = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ─── Server-side auth (works for both mock and Firebase modes) ───
// The server mints a Firebase custom token (Firebase mode) or a
// base64 mock token (mock mode) and we store it as a cookie.
// The server's /api/auth/me endpoint verifies this token on each request.

async function serverLogin(email: string, password: string): Promise<{ token: string; user: SessionUser }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return { token: data.token, user: data.user as SessionUser };
}

async function serverSignup(
  email: string,
  password: string,
  name: string,
): Promise<{ token: string; user: SessionUser }> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return { token: data.token, user: data.user as SessionUser };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await serverLogin(email, password);
    setCookie(COOKIE_NAME, token, ONE_WEEK);
    setUser(user);
    return user;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const { token, user } = await serverSignup(email, password, name);
    setCookie(COOKIE_NAME, token, ONE_WEEK);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    clearCookie(COOKIE_NAME);
    setUser(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
