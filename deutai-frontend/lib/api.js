// lib/api.js
// All routes return a standard fetch Response.
// Protected routes handle token refresh automatically.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fix #27 — wrap fetch with a configurable timeout
function fetchWithTimeout(url, options = {}, ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

// Fix #24 — singleton promise to prevent concurrent refresh races
let _refreshPromise = null;

async function _doRefresh() {
  const refresh_token = localStorage.getItem('refresh_token');
  if (!refresh_token) return false;
  try {
    const res = await fetchWithTimeout(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function refreshAccessToken() {
  // Fix #24 — reuse in-flight refresh; clear after resolution
  if (!_refreshPromise) {
    _refreshPromise = _doRefresh().finally(() => { _refreshPromise = null; });
  }
  return _refreshPromise;
}

async function authFetch(url, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res = await fetchWithTimeout(url, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = localStorage.getItem('access_token');
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetchWithTimeout(url, { ...options, headers });
    }
    // Fix: guard window access for SSR safety; prefer router.replace in components
    if (res.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return res;
    }
  }

  return res;
}

/* ─── Auth ─────────────────────────────────────────── */
export function login(email, password) {
  return fetchWithTimeout(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register(email, password) {
  return fetchWithTimeout(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function forgotPassword(email) {
  return fetchWithTimeout(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, password) {
  return fetchWithTimeout(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
}

/* ─── Analyzer ─────────────────────────────────────── */
export function analyzeText(text, unit_id) {
  return authFetch(`${API_URL}/analyze`, {
    method: 'POST',
    body: JSON.stringify({ text, ...(unit_id ? { unit_id } : {}) }),
  });
}

/* ─── Flashcards ───────────────────────────────────── */
export function getFlashcards() {
  return authFetch(`${API_URL}/flashcards`);
}

export function deleteFlashcard(id) {
  return authFetch(`${API_URL}/flashcards/${id}`, { method: 'DELETE' });
}

/* ─── Stats ────────────────────────────────────────── */
export function getStats(period = '30d') {
  const query = new URLSearchParams({ period }).toString();
  return authFetch(`${API_URL}/stats?${query}`);
}

/* ─── Units / QR ───────────────────────────────────── */
export function getUnit(slug) {
  return authFetch(`${API_URL}/units/${slug}`);
}

/* ─── Notebook ─────────────────────────────────────── */
export function notebookOcr(payload) {
  return authFetch(`${API_URL}/notebook/ocr`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function notebookAnalyze(payload) {
  return authFetch(`${API_URL}/notebook/analyze`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ─── Ping (cold start) ────────────────────────────── */
export function ping() {
  return fetchWithTimeout(`${API_URL}/ping`, { method: 'GET' });
}

/* ─── History ──────────────────────────────────────── */
export function getHistory(page = 1, limit = 30) {
  const q = new URLSearchParams({ page, limit }).toString();
  return authFetch(`${API_URL}/history?${q}`);
}

export function getHistoryItem(id) {
  return authFetch(`${API_URL}/history/${id}`);
}

export function deleteHistoryItem(id) {
  return authFetch(`${API_URL}/history/${id}`, { method: 'DELETE' });
}

export function clearHistory() {
  // NOTE: server returns 204 No Content on success — callers must check
  // res.ok rather than calling res.json() to avoid a parse error.
  return authFetch(`${API_URL}/history/all`, { method: 'DELETE' });
}

/* ─── Quiz ─────────────────────────────────────────── */
// Fix #26 — default lang to 'de' (German); the app teaches German, not French
export function generateQuiz(category, difficulty, count, lang = 'de') {
  return authFetch(`${API_URL}/quiz/generate`, {
    method: 'POST',
    body: JSON.stringify({ category, difficulty, count, lang }),
  });
}
