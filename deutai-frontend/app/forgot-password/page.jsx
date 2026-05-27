'use client';
import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus('');
    setMessage('');
    try {
      const res = await forgotPassword(email);
      if (res.ok) {
        setStatus('success');
        setMessage(t('auth.forgotSuccessMessage'));
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(data.message || t('auth.forgotErrorMessage'));
      }
    } catch {
      setStatus('error');
      setMessage(t('auth.errorCannotReachServer'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100svh] flex flex-col justify-center px-4 py-8 sm:py-12 relative overflow-hidden" style={{ background: 'var(--color-bg-ice)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(156,123,172,0.12) 0%, transparent 70%)' }} />
      <div className="w-full max-w-sm mx-auto relative z-10">
        <div className="text-center mb-6 sm:mb-10">
          <h1
            className="text-2xl sm:text-3xl font-bold text-gold"
            style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '3px' }}
          >
            DeutAI
          </h1>
          <p className="system-subtitle mt-2" style={{ fontSize: '14px' }}>
            {t('auth.recoverySystem')}
          </p>
        </div>

        <div className="auth-card p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {status === 'success' && (
              <div
                className="px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                style={{ background: 'rgba(124,176,120,0.10)', border: '1px solid rgba(124,176,120,0.30)', color: 'var(--color-success)' }}
              >
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div
                className="px-4 py-3 rounded-lg text-sm text-error flex items-start gap-2"
                style={{ background: 'rgba(204,85,85,0.06)', border: '1px solid rgba(204,85,85,0.2)' }}
              >
                <span>⚠</span>
                <span>{message}</span>
              </div>
            )}

            <p className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t('auth.resetHelp')}
            </p>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[15px] font-mono text-text-muted tracking-widest"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading || status === 'success'}
                className="input-dark px-4 py-3 text-base"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || status === 'success'}
              className="btn-gold w-full py-4"
              style={{ letterSpacing: '2px' }}
            >
              {loading ? t('auth.sending') : t('auth.sendLink')}
            </button>

            <Link href="/login" className="inline-flex min-h-11 items-center justify-center text-sm text-center text-text-muted hover:text-primary transition-colors mt-2">
              {t('auth.backToLogin')}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
