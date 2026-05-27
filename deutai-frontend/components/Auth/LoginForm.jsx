'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { flushSync } from 'react-dom';
import { login as loginApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth(false); // false = don't redirect while on /login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || t('auth.errorInvalidCredentials'));
        return;
      }
      const payload = data.data || data;
      if (payload.access_token) {
        // flushSync forces the setUser() inside login() to complete synchronously
        // BEFORE router.replace fires — preventing the race condition where
        // the protected page renders with user=null and redirects back to /login
        flushSync(() => {
          login(payload.access_token, payload.refresh_token);
        });
        router.replace('/analyze');
      } else {
        setError(t('auth.errorUnexpectedResponse'));
      }
    } catch {
      setError(t('auth.errorCannotReachServer'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ background: 'rgba(220,100,80,0.06)', border: '1px solid rgba(220,100,80,0.20)', color: 'var(--color-error)', animation: 'fadeIn 0.3s ease-out' }}
        >
          ⚠ {error}
        </div>
      )}

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
          disabled={loading}
          className="input-dark px-4 py-3 text-base"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-[15px] font-mono text-text-muted tracking-widest"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {t('auth.password')}
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          className="input-dark px-4 py-3 text-base"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="btn-gold w-full py-4"
        style={{ letterSpacing: '2px' }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t('auth.loginLoading')}
          </span>
        ) : (
          t('auth.loginBtn')
        )}
      </button>

      <div className="flex flex-col items-center gap-3 mt-2">
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center justify-center text-sm font-mono transition-colors"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-muted)' }}
        >
          {t('auth.forgotPassword')}
        </Link>
        <p className="text-sm text-text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="inline-flex min-h-11 items-center hover:underline" style={{ color: 'var(--color-primary)' }}>
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </form>
  );
}
