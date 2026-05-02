'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get('next') || '/admin/qrcodes';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Accès refusé.');
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#08080a', color: '#e8e8f0' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'rgba(10,10,16,0.98)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: '#c9a227' }}>
          Administration
        </p>
        <h1 className="font-sans text-xl font-semibold mb-6" style={{ color: '#f1d98d' }}>
          Connexion
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase mb-2" style={{ color: '#6b7088' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none"
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e8e8f0',
              }}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p className="text-[13px]" style={{ color: '#fca5a5' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-mono text-[11px] tracking-[0.14em] uppercase py-3 rounded-xl disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #c9a227, #e8d48a)',
              color: '#0a0a0c',
              border: 'none',
            }}
          >
            {loading ? '…' : 'Entrer'}
          </button>
        </form>
        <Link href="/" className="mt-6 block text-center font-mono text-[10px] uppercase" style={{ color: '#6b7088' }}>
          ← Accueil
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
