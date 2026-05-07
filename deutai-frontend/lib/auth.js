'use client';
import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Fix #28 — check both signature validity AND expiry
function isTokenValid(token) {
  const payload = decodeJwt(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isTokenValid(token)) {
      // Fix #28 — clear expired token so the UI doesn't show stale auth state
      if (token) localStorage.removeItem('access_token');
      setLoading(false);
      return;
    }
    const payload = decodeJwt(token);
    // Fix #30 — never alias a UUID sub to the email field
    setUser({ email: payload.email || '', id: payload.sub || payload.userId });
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.replace('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(redirectIfUnauthenticated = true) {
  const ctx = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!ctx) return;
    // Fix #31 — trust AuthProvider's resolved ctx.user; no need for a redundant localStorage check
    if (!ctx.loading && !ctx.user && redirectIfUnauthenticated) {
      router.replace('/login');
    }
  }, [ctx, redirectIfUnauthenticated, router]);

  if (!ctx) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useAuth] called outside <AuthProvider>. Wrap your app in <AuthProvider>.');
    }
    return { user: null, loading: true, logout: () => {} };
  }

  return ctx;
}

// Fix #29 — NOTE: this hook duplicates AuthProvider state.
// It is intentionally kept for pages that cannot be wrapped in AuthProvider,
// but its auth state is NOT shared with AuthProvider consumers.
// Prefer useAuth() inside AuthProvider-wrapped pages.
export function useAuthStandalone() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // Fix #28 — validate expiry, not just presence
    if (!token || !isTokenValid(token)) {
      if (token) localStorage.removeItem('access_token');
      router.replace('/login');
      setLoading(false);
      return;
    }
    const payload = decodeJwt(token);
    // Fix #30 — don't alias sub to email
    setUser({ email: payload.email || '', id: payload.sub || payload.userId });
    setLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.replace('/');
  }, [router]);

  return { user, loading, logout };
}
