'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/Layout/AppShell';
import QRScanner from '@/components/UI/QRScanner';
import { useAuthStandalone } from '@/lib/auth';
import { getUnit } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ScanPage() {
  const { t } = useLanguage();
  const { loading: authLoading } = useAuthStandalone();
  const router = useRouter();
  const [status, setStatus] = useState('scanning'); // scanning | loading | error | success
  const [error, setError] = useState('');
  const [unitInfo, setUnitInfo] = useState(null);

  async function handleDetected(qrData) {
    setStatus('loading');
    setError('');
    try {
      // Extract slug from URL or use raw QR data
      let slug = qrData;
      try {
        const url = new URL(qrData);
        slug = url.pathname.split('/').filter(Boolean).pop() || qrData;
      } catch {}

      const res = await getUnit(slug);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || t('scan.unrecognized'));
        setStatus('error');
        return;
      }
      const data = await res.json();
      setUnitInfo(data);
      setStatus('success');
      // Redirect after brief delay to show success
      setTimeout(() => {
        router.replace(`/questions?unit=${slug}`);
      }, 1500);
    } catch {
      setError(t('scan.resolveError'));
      setStatus('error');
    }
  }

  function handleError(msg) {
    setError(msg);
    setStatus('error');
  }

  if (authLoading) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-black relative">
        <div className="absolute inset-0 grid-scan-bg opacity-10 pointer-events-none" />

        {/* Header */}
        <header
          className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a' }}
        >
          <Link href="/analyze" className="text-text-muted hover:text-gold transition-colors text-sm">←</Link>
          <div>
            <h1 className="text-sm font-bold text-gold font-mono" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px' }}>
              {t('scan.title')}
            </h1>
            <p className="system-subtitle" style={{ fontSize: '8px', letterSpacing: '2px' }}>{t('scan.subtitle')}</p>
          </div>
        </header>

        <div className="px-4 py-8 max-w-sm mx-auto flex flex-col gap-6">
          {status === 'scanning' && (
            <>
              <p className="text-xs font-mono text-text-muted text-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {t('scan.pointCamera')}
              </p>
              <QRScanner onDetected={handleDetected} onError={handleError} />
            </>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div
                className="w-16 h-16 rounded-full border-2 border-gold/20 flex items-center justify-center"
                style={{ animation: 'spin-slow 1s linear infinite', borderTopColor: '#D4AF37' }}
              />
              <p className="text-sm font-mono text-gold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {t('scan.resolving')}
              </p>
            </div>
          )}

          {status === 'success' && unitInfo && (
            <div
              className="rounded-xl p-6 flex flex-col items-center gap-3 text-center"
              style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', animation: 'fadeInUp 0.4s ease-out' }}
            >
              <span className="text-4xl">✓</span>
              <p className="text-gold font-mono font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {t('scan.found')}
              </p>
              <p className="text-sm text-text-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
                {unitInfo.title}
              </p>
              {unitInfo.chapter_number && (
                <span className="text-xs font-mono text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {t('scan.chapter')} {unitInfo.chapter_number}
                </span>
              )}
              <p className="text-xs text-text-muted mt-1">{t('scan.redirecting')}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: '#1A0A0A', border: '1px solid #3A1A1A' }}
              >
                <p className="text-error text-sm mb-1">⚠ {error}</p>
              </div>
              <button
                onClick={() => { setStatus('scanning'); setError(''); }}
                className="btn-gold w-full py-3 text-sm"
              >
                {t('scan.retry')}
              </button>
              <Link href="/analyze" className="btn-outline w-full py-3 text-sm text-center block">
                {t('scan.back')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
