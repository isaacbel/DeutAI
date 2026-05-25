'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // '' | 'success' | 'error'
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage(t('resetPassword.invalidLink'));
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage(t('resetPassword.passwordsMismatch'));
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage(t('resetPassword.passwordLength'));
      return;
    }
    
    setLoading(true);
    setStatus('');
    setMessage('');
    
    try {
      const res = await resetPassword(token, password);
      if (res.ok) {
        setStatus('success');
        setMessage(t('resetPassword.successUpdate'));
        setTimeout(() => router.replace('/login'), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(data.message || t('resetPassword.linkExpired'));
      }
    } catch {
      setStatus('error');
      setMessage(t('resetPassword.serverError'));
    } finally {
      setLoading(false);
    }
  }

  if (!token && status === '') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div
          className="px-4 py-4 rounded-lg text-sm flex flex-col items-center gap-2"
          style={{ background: 'rgba(220,100,80,0.06)', border: '1px solid rgba(220,100,80,0.20)', color: 'var(--color-error)' }}
        >
          <span className="text-2xl">⚠</span>
          <span>{t('resetPassword.missingLink')}</span>
        </div>
        <Link href="/forgot-password" className="btn-outline w-full py-3">
          {t('resetPassword.requestNew')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {status === 'success' && (
        <div
          className="px-4 py-3 rounded-lg text-sm flex flex-col items-center text-center gap-2"
          style={{ background: 'rgba(74,154,74,0.1)', border: '1px solid rgba(74,154,74,0.3)', color: '#4A9A4A' }}
        >
          <span className="text-xl">✓</span>
          <span>{message}</span>
          <span className="text-sm opacity-80 mt-1">{t('resetPassword.redirecting')}</span>
        </div>
      )}

      {status === 'error' && (
        <div
          className="px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ background: 'rgba(220,100,80,0.06)', border: '1px solid rgba(220,100,80,0.20)', color: 'var(--color-error)' }}
        >
          <span>⚠</span>
          <span>{message}</span>
        </div>
      )}

      {status !== 'success' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[15px] font-mono text-text-muted tracking-widest"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {t('resetPassword.newPassword')}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 caractères"
              required
              disabled={loading}
              className="input-dark px-4 py-3 text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[15px] font-mono text-text-muted tracking-widest"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {t('resetPassword.confirmPassword')}
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="input-dark px-4 py-3 text-sm"
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: confirm && password !== confirm ? '#CC5555' : undefined,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="btn-gold w-full py-4 mt-2"
            style={{ letterSpacing: '2px' }}
          >
            {loading ? t('resetPassword.updating') : t('resetPassword.submit')}
          </button>
        </>
      )}

      <Link href="/login" className="text-sm text-center transition-colors mt-2" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)' }}>
        {t('resetPassword.backToLogin')}
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--color-bg-ice)' }}>
      <div className="absolute inset-0 grid-scan-bg opacity-10 pointer-events-none" />
      <div className="w-full max-w-sm mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-gold"
            style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '4px' }}
          >
            DeutAI
          </h1>
          <p className="system-subtitle mt-2" style={{ fontSize: '14px' }}>
            {t('resetPassword.title')}
          </p>
        </div>

        <div className="auth-card p-6">
          <Suspense fallback={<div className="h-40 shimmer rounded-xl" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
