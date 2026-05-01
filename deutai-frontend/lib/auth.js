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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    const payload = decodeJwt(token);
    if (payload) {
      setUser({ email: payload.email || payload.sub || '', id: payload.sub });
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.replace('/login');
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
    if (!ctx.loading && !ctx.user && redirectIfUnauthenticated) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/login');
      }
    }
  }, [ctx, redirectIfUnauthenticated, router]);

  if (!ctx) {
    // Fallback when used outside AuthProvider (plain hook usage pattern from prompt)
    return { user: null, loading: true, logout: () => {} };
  }

  return ctx;
}

// Standalone hook for pages that import useAuth directly without AuthProvider
// This matches the pattern used in the prompt code snippets
export function useAuthStandalone() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/login');
      setLoading(false);
      return;
    }
    const payload = decodeJwt(token);
    if (!payload) {
      router.replace('/login');
      setLoading(false);
      return;
    }
    setUser({ email: payload.email || payload.sub || '', id: payload.sub });
    setLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.replace('/login');
  }, [router]);

  return { user, loading, logout };
}
