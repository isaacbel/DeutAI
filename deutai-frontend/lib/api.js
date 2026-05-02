// lib/api.js
// All routes return a standard fetch Response.
// Protected routes handle token refresh automatically.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function refreshAccessToken() {
  const refresh_token = localStorage.getItem('refresh_token');
  if (!refresh_token) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
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

async function authFetch(url, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = localStorage.getItem('access_token');
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

/* ─── Auth ─────────────────────────────────────────── */
export function login(email, password) {
  return fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register(email, password) {
  return fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function forgotPassword(email) {
  return fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, password) {
  return fetch(`${API_URL}/auth/reset-password`, {
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
export function notebookOcr(base64Image) {
  return authFetch(`${API_URL}/notebook/ocr`, {
    method: 'POST',
    body: JSON.stringify({ image: base64Image }),
  });
}

export function notebookAnalyze(text) {
  return authFetch(`${API_URL}/notebook/analyze`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

/* ─── Ping (cold start) ────────────────────────────── */
export function ping() {
  return fetch(`${API_URL}/ping`, { method: 'GET' });
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
  return authFetch(`${API_URL}/history/all`, { method: 'DELETE' });
}
