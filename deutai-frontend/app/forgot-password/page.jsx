'use client';
import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // '' | 'success' | 'error'
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
        setMessage('Si un compte est associé à cette adresse, un email de réinitialisation a été envoyé.');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(data.message || 'Une erreur est survenue.');
      }
    } catch {
      setStatus('error');
      setMessage('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-scan-bg opacity-10 pointer-events-none" />
      <div className="w-full max-w-sm mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-gold"
            style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '4px' }}
          >
            DeutAI
          </h1>
          <p className="system-subtitle mt-2" style={{ fontSize: '10px' }}>
            RÉCUPÉRATION SYSTÈME
          </p>
        </div>

        <div className="auth-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {status === 'success' && (
              <div
                className="px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                style={{ background: 'rgba(74,154,74,0.1)', border: '1px solid rgba(74,154,74,0.3)', color: '#4A9A4A' }}
              >
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div
                className="px-4 py-3 rounded-lg text-sm text-error flex items-start gap-2"
                style={{ background: '#1A0A0A', border: '1px solid #3A1A1A' }}
              >
                <span>⚠</span>
                <span>{message}</span>
              </div>
            )}

            <p className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
            </p>

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
                disabled={loading || status === 'success'}
                className="input-dark px-4 py-3 text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || status === 'success'}
              className="btn-gold w-full py-4"
              style={{ letterSpacing: '2px' }}
            >
              {loading ? 'ENVOI...' : '→ ENVOYER LE LIEN'}
            </button>

            <Link href="/login" className="text-xs text-center text-text-muted hover:text-gold transition-colors mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              ← Retour à la connexion
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
