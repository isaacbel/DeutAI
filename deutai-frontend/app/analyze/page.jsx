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

const MIN_SCAN_DURATION = 1500;
const MAX_ANALYZE_CHARS = 1000;

function AnalyzeContent() {
  const { loading: authLoading } = useAuthStandalone();
  const searchParams = useSearchParams();
  const unitId = searchParams.get('unit');

  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    if (retryAfter && retryAfter > 0) {
      const t = setTimeout(() => setRetryAfter(prev => (prev > 0 ? prev - 1 : null)), 1000);
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
        const retry = parseInt(res.headers.get('retry-after') || '60');
        setRetryAfter(retry);
        setError(`Trop de requêtes. Réessayez dans ${retry}s.`);
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (res.status === 503 || res.status === 502) {
          setError('Service IA indisponible. Réessayez dans quelques instants.');
        } else {
          setError(data.message || 'Erreur lors de l\'analyse.');
        }
        return;
      }

      const data = await res.json();

      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_SCAN_DURATION) {
        await new Promise(r => setTimeout(r, MIN_SCAN_DURATION - elapsed));
      }

      setResult({ ...data, input: text });
    } catch (err) {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setScanning(false);
    }
  }, [text, unitId, offline]);

  const isDisabled = !text.trim() || text.length > MAX_ANALYZE_CHARS || offline || scanning || !!retryAfter;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0 grid-scan-bg opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-gold/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between transition-all" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(42, 42, 42, 0.5)' }}>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gold font-mono tracking-[0.2em] flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
            DeutAI
          </h1>
          <p className="system-subtitle opacity-70 tracking-[0.3em] uppercase" style={{ fontSize: '8px' }}>Système 404</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/notebook"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border border-transparent bg-[#111] hover:bg-[#1a1a1a] hover:border-gold/30 hover:text-gold hover:shadow-[0_0_12px_rgba(212,175,55,0.1)] text-text-muted"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            <Camera size={14} className="group-hover:text-gold transition-colors" />
            <span className="hidden sm:inline">Notebook</span>
          </Link>
          <Link
            href="/scan"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border border-transparent bg-[#111] hover:bg-[#1a1a1a] hover:border-gold/30 hover:text-gold hover:shadow-[0_0_12px_rgba(212,175,55,0.1)] text-text-muted"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            <QrCode size={14} className="group-hover:text-gold transition-colors" />
            <span className="hidden sm:inline">QR</span>
          </Link>
        </div>
      </header>

      {/* Unit badge */}
      {unitId && (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-lg flex items-center gap-2.5 relative overflow-hidden group" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold/50 rounded-l-lg group-hover:bg-gold transition-colors" />
          <Crosshair size={14} className="text-gold" />
          <span className="text-xs font-mono text-gold/90 tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Unité active : {unitId}
          </span>
          <Link href="/analyze" className="ml-auto text-text-muted hover:text-error transition-all p-1 hover:bg-error/10 rounded">✕</Link>
        </div>
      )}

      {/* Main content */}
      <div className="px-4 py-6 max-w-2xl mx-auto relative z-10">
        {/* Offline message */}
        {offline && (
          <div className="mb-5 px-4 py-3 rounded-lg text-sm text-error flex items-center gap-2.5 border border-error/20 bg-error/5 shadow-[0_0_15px_rgba(204,85,85,0.05)]">
            <WifiOff size={16} />
            <span className="font-medium">Mode hors ligne — L'analyse est indisponible</span>
          </div>
        )}

        {/* Input area */}
        <div className="mb-6 relative">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-3 bg-text-muted/50 rounded-full" />
            <label className="block text-[10px] font-mono text-text-muted tracking-[0.2em] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              PHRASE À ANALYSER
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
          <div className="mb-6 p-4 rounded-xl text-sm border border-error/20 bg-[#1A0A0A] text-error flex flex-col gap-3 shadow-[0_0_20px_rgba(204,85,85,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
              {retryAfter && retryAfter > 0 && (
                <span className="text-xs font-mono shrink-0 px-2 py-1 bg-error/10 rounded" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {retryAfter}s
                </span>
              )}
            </div>
            {(error.includes('indisponible') || error.includes('serveur')) && (
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-1.5 self-start text-xs text-gold hover:text-gold/80 transition-colors font-mono py-1 px-2 -ml-2 rounded hover:bg-gold/10"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                <RefreshCw size={12} />
                Réessayer
              </button>
            )}
          </div>
        )}

        {/* Scan button */}
        <ScanButton
          onClick={handleAnalyze}
          disabled={isDisabled}
          loading={scanning}
        />

        {/* Results */}
        {!scanning && result && (
          <ResultCards result={result} />
        )}

        {/* Empty state */}
        {!scanning && !result && !error && (
          <div className="mt-12 flex flex-col items-center justify-center opacity-40">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-text-muted to-transparent mb-4" />
            <p className="text-[11px] font-mono text-text-muted tracking-widest flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <ChevronRight size={12} />
              EN ATTENTE DE DONNÉES
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
