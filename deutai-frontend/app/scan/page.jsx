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
      <div className="min-h-screen relative" style={{ background: 'var(--color-bg-ice)' }}>
        <div className="absolute inset-0 grid-scan-bg opacity-100 pointer-events-none" />

        {/* Header */}
        <header
          className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(242,248,252,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}
        >
          <Link href="/analyze" className="inline-flex min-h-11 min-w-11 items-center justify-center text-text-muted hover:text-primary transition-colors text-sm">←</Link>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--color-primary)', letterSpacing: '2px' }}>
              {t('scan.title')}
            </h1>
            <p className="system-subtitle" style={{ fontSize: '8px', letterSpacing: '2px' }}>{t('scan.subtitle')}</p>
          </div>
        </header>

        <div className="px-3 sm:px-4 py-6 sm:py-8 max-w-sm mx-auto flex flex-col gap-6">
          {status === 'scanning' && (
            <>
              <p className="text-sm font-mono text-text-muted text-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {t('scan.pointCamera')}
              </p>
              <QRScanner onDetected={handleDetected} onError={handleError} />
            </>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div
                className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
                style={{ animation: 'spin-slow 1s linear infinite', borderColor: 'rgba(156,123,172,0.2)', borderTopColor: 'var(--color-primary)' }}
              />
              <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
                {t('scan.resolving')}
              </p>
            </div>
          )}

          {status === 'success' && unitInfo && (
            <div
              className="rounded-xl p-6 flex flex-col items-center gap-3 text-center"
              style={{ background: 'rgba(124,176,120,0.08)', border: '1px solid rgba(124,176,120,0.3)', animation: 'fadeInUp 0.4s ease-out' }}
            >
              <span className="text-4xl">✓</span>
              <p className="font-bold" style={{ color: 'var(--color-success)' }}>
                {t('scan.found')}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {unitInfo.title}
              </p>
              {unitInfo.chapter_number && (
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {t('scan.chapter')} {unitInfo.chapter_number}
                </span>
              )}
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('scan.redirecting')}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(204,85,85,0.06)', border: '1px solid rgba(204,85,85,0.2)' }}
              >
                <p className="text-error text-sm mb-1">⚠ {error}</p>
              </div>
              <button
                onClick={() => { setStatus('scanning'); setError(''); }}
                className="btn-gold w-full py-3 text-sm min-h-12"
              >
                {t('scan.retry')}
              </button>
              <Link href="/analyze" className="btn-outline w-full py-3 text-sm text-center">
                {t('scan.back')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
