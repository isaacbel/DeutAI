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
import { useAuthStandalone } from '@/lib/auth';
import { analyzeText } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const MIN_SCAN_DURATION = 300;
const MAX_ANALYZE_CHARS = 1000;
const DRAFT_KEY = 'deutai:analyze-session-v1';

function AnalyzeContent() {
  const { t, lang } = useLanguage();
  const { loading: authLoading } = useAuthStandalone();
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
    <div className="min-h-screen bg-[#08080a] relative" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      {/* Background accents */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 60%)',
        }}
      />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between"
        style={{
          background: 'rgba(8,8,12,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          minHeight: '60px',
        }}
      >
        <div className={lang === 'ar' ? 'pr-12 sm:pr-14' : 'pl-12 sm:pl-14'}>
          <h1
            className="text-[18px] font-bold font-mono tracking-[.16em] flex items-center gap-2"
            style={{ color: '#D4AF37', fontFamily: 'JetBrains Mono, monospace' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"
              style={{ boxShadow: '0 0 8px rgba(212,175,55,0.8)' }}
            />
            DeutAI
          </h1>
          <p className="text-[9px] text-[#4a4a58] tracking-[.26em] uppercase mt-0.5">{t('app.system404')}</p>
        </div>

        <div className={`flex items-center gap-2 ${lang === 'ar' ? 'pl-12 sm:pl-0' : 'pr-12 sm:pr-0'}`}>
          {[
            { href: '/notebook', icon: Camera, label: 'Notebook' },
            { href: '/scan',     icon: QrCode,  label: 'QR' },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-2.5 py-[7px] rounded-lg text-[12px] font-mono transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                color: '#8a8aaa',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(212,175,55,0.35)'; e.currentTarget.style.color='#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#8a8aaa'; }}
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
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}
        >
          <span className={`absolute top-0 bottom-0 w-1 bg-[#D4AF37]/50 ${lang === 'ar' ? 'right-0 rounded-r-xl' : 'left-0 rounded-l-xl'}`} />
          <Crosshair size={13} className="text-[#D4AF37] flex-shrink-0" />
          <span className="text-[12px] font-mono text-[#D4AF37]/95 tracking-wide flex-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {t('analyze.activeUnit', { unit: unitId })}
          </span>
          <Link
            href="/analyze"
            className="text-[#7a7a90] hover:text-[#e05252] transition-colors p-1 hover:bg-[rgba(204,85,85,0.1)] rounded-md text-sm"
            aria-label={t('analyze.removeUnit')}
          >
            ✕
          </Link>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="px-4 sm:px-6 py-6 w-full lg:w-[80%] max-w-7xl mx-auto relative z-10">

        {/* Offline banner */}
        {offline && (
          <div
            className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2.5 text-[13px]"
            style={{ background: 'rgba(204,85,85,0.07)', border: '1px solid rgba(204,85,85,0.2)', color: '#e05252' }}
          >
            <WifiOff size={16} className="flex-shrink-0" />
            <span className="font-medium">{t('analyze.offline')}</span>
          </div>
        )}

        {/* Input area */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-[3px] h-[11px] bg-[#C9A227] rounded-full" style={{ opacity: 0.6 }} />
            <label
              className="text-[11px] font-mono tracking-[.18em] font-semibold uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b8a878' }}
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
            className="mb-5 p-4 rounded-xl text-[13px] flex flex-col gap-3"
            style={{ background: '#140a0a', border: '1px solid rgba(204,85,85,0.2)', color: '#e05252' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
              {retryAfter > 0 && (
                <span
                  className="font-mono text-sm flex-shrink-0 px-2 py-0.5 rounded"
                  style={{ fontFamily: 'JetBrains Mono, monospace', background: 'rgba(204,85,85,0.1)' }}
                >
                  {retryAfter}s
                </span>
              )}
            </div>
            {(error.includes('unavailable') || error.includes('server') || error.includes('متاح') || error.includes('Dienst') || error.includes('erreichbar')) && (
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-1.5 self-start text-[12px] font-mono px-2 py-1 -ml-1 rounded transition-all"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#D4AF37' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(212,175,55,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
              >
                <RefreshCw size={13} />
                {t('analyze.retry')}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0">
            <ScanButton onClick={handleAnalyze} disabled={isDisabled} loading={scanning} />
          </div>
          {(result || text) && !scanning && (
            <button
              onClick={handleReset}
              className="px-4 py-[14px] rounded-xl text-[12px] font-mono transition-all whitespace-nowrap sm:w-auto"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: '#8a8aaa',
                letterSpacing: '.06em',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='#c0c0d0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#8a8aaa'; }}
            >
              {t('analyze.newAnalyze')}
            </button>
          )}
        </div>

        {/* Results */}
        {!scanning && result && <ResultCards result={result} />}

        {/* Empty state */}
        {!scanning && !result && !error && (
          <div className="mt-14 flex flex-col items-center justify-center" style={{ opacity: 0.6 }} aria-hidden="true">
            <div className="w-px h-10 mb-4" style={{ background: 'linear-gradient(to bottom, transparent, #C9A22760)' }} />
            <p className="text-[12px] font-mono tracking-[.2em] flex items-center gap-1.5"
               style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a8a5a' }}>
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