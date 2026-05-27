'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function AdminLoginForm() {
  const { t } = useLanguage();
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
        setError(data.message || t('admin.accessDenied'));
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError(t('admin.networkError'));
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
        className="w-full max-w-sm rounded-2xl p-5 sm:p-8"
        style={{
          background: 'rgba(10,10,16,0.98)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <p className="font-mono text-[15px] tracking-[0.22em] uppercase mb-2" style={{ color: '#c9a227' }}>
          {t('admin.title')}
        </p>
        <h1 className="font-sans text-xl font-semibold mb-6" style={{ color: '#f1d98d' }}>
          {t('admin.login')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[14px] tracking-wider uppercase mb-2" style={{ color: '#6b7088' }}>
              {t('admin.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 font-sans text-base outline-none"
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
            <p className="text-[15px]" style={{ color: '#fca5a5' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-12 font-mono text-[15px] tracking-[0.14em] uppercase py-3 rounded-xl disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #c9a227, #e8d48a)',
              color: '#0a0a0c',
              border: 'none',
            }}
          >
            {loading ? '…' : t('admin.enter')}
          </button>
        </form>
        <Link href="/" className="mt-6 inline-flex min-h-11 w-full items-center justify-center text-center font-mono text-[14px] uppercase" style={{ color: '#6b7088' }}>
          {t('admin.home')}
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
