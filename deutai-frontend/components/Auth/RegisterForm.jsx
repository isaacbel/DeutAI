'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { flushSync } from 'react-dom';
import { register, login as apiLogin } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function passwordError(value) {
    if (value.length < 8) return t('auth.errorPasswordTooShort');
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      return 'Password must contain at least one letter and one number.';
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('auth.errorPasswordsDoNotMatch'));
      return;
    }
    const weakPasswordMessage = passwordError(password);
    if (weakPasswordMessage) {
      setError(weakPasswordMessage);
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await register(email, password);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === 'EMAIL_EXISTS') {
          setError(t('auth.errorEmailAlreadyExists'));
        } else {
          setError(data.message || data.details?.join(' ') || t('auth.errorUnableToCreateAccount'));
        }
        return;
      }

      // Show success notification
      setSuccess(t('auth.successAccountCreated') || 'Account created successfully! Logging in...');

      // Attempt auto-login
      try {
        const loginRes = await apiLogin(email, password);
        const loginData = await loginRes.json().catch(() => ({}));
        const loginPayload = loginData.data || loginData;
        if (loginRes.ok && loginPayload.access_token) {
          // Stagger slightly so they see the success message
          await new Promise((resolve) => setTimeout(resolve, 1200));
          flushSync(() => {
            login(loginPayload.access_token, loginPayload.refresh_token);
          });
          router.replace('/analyze');
          return;
        }
      } catch (loginErr) {
        console.error('Auto-login failed:', loginErr);
      }

      // Fallback: if auto-login fails, redirect to login page after 1.5s
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace('/login');
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

      {success && (
        <div
          className="px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ background: 'rgba(74,184,112,0.06)', border: '1px solid rgba(74,184,112,0.20)', color: 'var(--color-success, #7CB078)', animation: 'fadeIn 0.3s ease-out' }}
        >
          ✓ {success}
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
          className="input-dark px-4 py-3 text-sm"
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
          placeholder={t('auth.minCharsPlaceholder')}
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
          {t('auth.confirmPassword')}
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
            borderColor: confirm && password !== confirm ? 'var(--color-error)' : undefined,
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email || !password || !confirm}
        className="btn-gold w-full py-4"
        style={{ letterSpacing: '2px' }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t('auth.registerLoading')}
          </span>
        ) : (
          t('auth.registerBtn')
        )}
      </button>

      <p className="text-sm text-center text-text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
        {t('auth.alreadyRegistered')}{' '}
        <Link href="/login" className="hover:underline" style={{ color: 'var(--color-primary)' }}>
          {t('landing.signIn')}
        </Link>
      </p>
    </form>
  );
}
