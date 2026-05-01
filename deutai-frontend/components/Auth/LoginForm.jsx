'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginForm() {
  const router = useRouter();
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
      const res = await login(email, password);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Identifiants incorrects.');
        return;
      }
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        router.replace('/analyze');
      } else {
        setError('Réponse inattendue du serveur.');
      }
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm text-error"
          style={{ background: '#1A0A0A', border: '1px solid #3A1A1A', animation: 'fadeIn 0.3s ease-out' }}
        >
          ⚠ {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          className="text-[11px] font-mono text-text-muted tracking-widest"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          ADRESSE EMAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          required
          disabled={loading}
          className="input-dark px-4 py-3 text-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-[11px] font-mono text-text-muted tracking-widest"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          MOT DE PASSE
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          className="input-dark px-4 py-3 text-sm"
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
            CONNEXION...
          </span>
        ) : (
          '→ SE CONNECTER'
        )}
      </button>

      <div className="flex flex-col items-center gap-3 mt-2">
        <Link
          href="/forgot-password"
          className="text-xs font-mono text-text-muted hover:text-gold transition-colors"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          Mot de passe oublié ?
        </Link>
        <p className="text-xs text-text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-gold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </form>
  );
}
