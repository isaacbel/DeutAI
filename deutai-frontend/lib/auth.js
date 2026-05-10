'use client';
import { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) throw new Error('InvalidLengthError');
      base64 += new Array(5 - pad).join('=');
    }
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

function isTokenValid(token) {
  const payload = decodeJwt(token);
  if (!payload) return false;
  // Trust the backend to validate expiry via 401s; client clocks can be out of sync
  return true;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isTokenValid(token)) {
      if (token) localStorage.removeItem('access_token');
      setLoading(false);
      return;
    }
    const payload = decodeJwt(token);
    setUser({ email: payload.email || '', id: payload.sub || payload.userId });
    setLoading(false);
  }, []);

  // ✅ Call after a successful login — updates state immediately without re-reading localStorage
  const login = useCallback((accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    const payload = decodeJwt(accessToken);
    setUser({ email: payload?.email || '', id: payload?.sub || payload?.userId });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.replace('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
export function useAuthStandalone(redirectIfUnauthenticated = true) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  // useRef keeps a stable reference that never changes, so the effect runs once only
  const routerRef = useRef(router);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isTokenValid(token)) {
      if (token) localStorage.removeItem('access_token');
      setLoading(false);
      if (redirectIfUnauthenticated) {
        routerRef.current.replace('/login');
      }
      return;
    }
    const payload = decodeJwt(token);
    setUser({ email: payload?.email || '', id: payload?.sub || payload?.userId });
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.replace('/');
  }, [router]);

  return { user, loading, logout };
}
