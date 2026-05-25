'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Camera, QrCode, WifiOff, TriangleAlert, Crosshair, RefreshCw, ChevronRight } from 'lucide-react';
import AppShell from '@/components/Layout/AppShell';
import TextInput from '@/components/Analyzer/TextInput';
import ScanButton from '@/components/Analyzer/ScanButton';
import ScanAnimation from '@/components/Analyzer/ScanAnimation';
import ResultCards from '@/components/Analyzer/ResultCards';
import { useAuth } from '@/lib/auth';
import { analyzeText } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const MIN_SCAN_DURATION = 300;
const MAX_ANALYZE_CHARS = 1000;
const DRAFT_KEY = 'deutai:analyze-session-v1';

function AnalyzeContent() {
  const { t, lang } = useLanguage();
  const { loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const unitId = searchParams.get('unit');

  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.text === 'string') setText(saved.text);
        if (saved.result && typeof saved.result === 'object') setResult(saved.result);
      }
    } catch { /* ignore */ } finally { setHydrated(true); }
  }, []);

  // Persist draft
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ text, result })); }
    catch { /* ignore */ }
  }, [text, result, hydrated]);

  // Offline detection
  useEffect(() => {
    setOffline(!navigator.onLine);
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  // Retry countdown
  useEffect(() => {
    if (retryAfter && retryAfter > 0) {
      const t = setTimeout(() => setRetryAfter(p => (p > 0 ? p - 1 : null)), 1000);
      return () => clearTimeout(t);
    }
  }, [retryAfter]);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || text.length > MAX_ANALYZE_CHARS || offline) return;
    setError('');
    setResult(null);
    setScanning(true);
    const startTime = Date.now();
    try {
      const res = await analyzeText(text, unitId || undefined);
      if (res.status === 429) {
        const retry = parseInt(res.headers.get('retry-after') || '60', 10);
        setRetryAfter(retry);
        setError(t('analyze.errorTooManyRequests', { seconds: retry }));
        return;
      }
      if (!res.ok) {
        if (res.status === 401) { window.location.href = '/login'; return; }
        const data = await res.json().catch(() => ({}));
        setError(
          res.status === 503 || res.status === 502
            ? t('analyze.errorServiceUnavailable')
            : data.message || t('analyze.errorAnalysisFailed')
        );
        return;
      }
      const data = await res.json();
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_SCAN_DURATION) await new Promise(r => setTimeout(r, MIN_SCAN_DURATION - elapsed));
      setResult({ ...data, input: text });
    } catch {
      setError(t('analyze.errorCannotReachServer'));
    } finally {
      setScanning(false);
    }
  }, [text, unitId, offline, t]);

  const handleReset = useCallback(() => {
    setText('');
    setResult(null);
    setError('');
    setRetryAfter(null);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }, []);

  const isDisabled = !text.trim() || text.length > MAX_ANALYZE_CHARS || offline || scanning || !!retryAfter;

  if (authLoading) return null;

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-bg-ice)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      {/* Background accents */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(156,123,172,0.07) 0%, transparent 60%)',
        }}
      />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between"
        style={{
          background: 'rgba(242,248,252,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
          minHeight: '60px',
        }}
      >
        <div className={lang === 'ar' ? 'pr-12 sm:pr-14' : 'pl-12 sm:pl-14'}>
          <h1
            className="text-[18px] font-bold tracking-[.16em] flex items-center gap-2"
            style={{ color: 'var(--color-primary)', fontFamily: 'inherit' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'var(--color-primary)', boxShadow: '0 0 8px rgba(156,123,172,0.6)' }}
            />
            DeutAI
          </h1>
          <p className="text-[13px] tracking-[.26em] uppercase mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t('app.system404')}</p>
        </div>

        <div className={`flex items-center gap-2 ${lang === 'ar' ? 'pl-12 sm:pl-0' : 'pr-12 sm:pr-0'}`}>
          {[
            { href: '/notebook', icon: Camera, label: 'Notebook' },
            { href: '/scan',     icon: QrCode,  label: 'QR' },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-2.5 py-[7px] rounded-lg text-[14px] transition-all"
              style={{
                border: '1px solid var(--color-border)',
                background: 'rgba(156,123,172,0.06)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(156,123,172,0.4)'; e.currentTarget.style.color='var(--color-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--color-border)'; e.currentTarget.style.color='var(--color-text-muted)'; }}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </header>

      {/* ── Unit badge ── */}
      {unitId && (
        <div
          className="mx-4 mt-4 px-4 py-2.5 rounded-xl flex items-center gap-2.5 relative overflow-hidden"
          style={{ background: 'rgba(76,177,255,0.08)', border: '1px solid rgba(76,177,255,0.25)' }}
        >
          <span className={`absolute top-0 bottom-0 w-1 ${lang === 'ar' ? 'right-0 rounded-r-xl' : 'left-0 rounded-l-xl'}`} style={{ background: 'var(--color-info)' }} />
          <Crosshair size={13} style={{ color: 'var(--color-info)' }} className="flex-shrink-0" />
          <span className="text-[14px] tracking-wide flex-1" style={{ color: 'var(--color-info)' }}>
            {t('analyze.activeUnit', { unit: unitId })}
          </span>
          <Link
            href="/analyze"
            className="transition-colors p-1 rounded-md text-sm"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={t('analyze.removeUnit')}
          >
            ✕
          </Link>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="px-3 sm:px-6 py-4 sm:py-6 w-full max-w-4xl mx-auto relative z-10">

        {/* Offline banner */}
        {offline && (
          <div
            className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2.5 text-[15px]"
            style={{ background: 'rgba(204,85,85,0.07)', border: '1px solid rgba(204,85,85,0.25)', color: 'var(--color-error)' }}
          >
            <WifiOff size={16} className="flex-shrink-0" />
            <span className="font-medium">{t('analyze.offline')}</span>
          </div>
        )}

        {/* Input area */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-[3px] h-[11px] rounded-full" style={{ background: 'var(--color-primary)', opacity: 0.7 }} />
            <label
              className="text-[14px] tracking-[.18em] font-semibold uppercase"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('analyze.sentenceToAnalyze')}
            </label>
          </div>

          {scanning ? (
            <ScanAnimation text={text} />
          ) : (
            <TextInput value={text} onChange={setText} disabled={scanning} />
          )}
        </div>

        {/* Error message */}
        {error && !scanning && (
          <div
            className="mb-5 p-4 rounded-xl text-[15px] flex flex-col gap-3"
            style={{ background: 'rgba(204,85,85,0.06)', border: '1px solid rgba(204,85,85,0.2)', color: 'var(--color-error)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
              {retryAfter > 0 && (
                <span
                  className="text-sm flex-shrink-0 px-2 py-0.5 rounded"
                  style={{ background: 'rgba(204,85,85,0.12)', color: 'var(--color-error)' }}
                >
                  {retryAfter}s
                </span>
              )}
            </div>
            {(error.includes('unavailable') || error.includes('server') || error.includes('متاح') || error.includes('Dienst') || error.includes('erreichbar')) && (
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-1.5 self-start text-[14px] px-2 py-1 -ml-1 rounded transition-all"
                style={{ color: 'var(--color-primary)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(156,123,172,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
              >
                <RefreshCw size={13} />
                {t('analyze.retry')}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="flex-1 min-w-0">
            <ScanButton onClick={handleAnalyze} disabled={isDisabled} loading={scanning} />
          </div>
          {(result || text) && !scanning && (
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-[14px] rounded-xl text-[15px] transition-all whitespace-nowrap"
              style={{
                border: '1px solid var(--color-border)',
                background: 'white',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(156,123,172,0.4)'; e.currentTarget.style.color='var(--color-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--color-border)'; e.currentTarget.style.color='var(--color-text-muted)'; }}
            >
              {t('analyze.newAnalyze')}
            </button>
          )}
        </div>

        {/* Results */}
        {!scanning && result && <ResultCards result={result} />}

        {/* Empty state */}
        {!scanning && !result && !error && (
          <div className="mt-14 flex flex-col items-center justify-center" style={{ opacity: 0.5 }} aria-hidden="true">
            <div className="w-px h-10 mb-4" style={{ background: 'linear-gradient(to bottom, transparent, rgba(156,123,172,0.5))' }} />
            <p className="text-[14px] tracking-[.2em] flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
              <ChevronRight size={13} />
              {t('analyze.waiting')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <AnalyzeContent />
      </Suspense>
    </AppShell>
  );
}