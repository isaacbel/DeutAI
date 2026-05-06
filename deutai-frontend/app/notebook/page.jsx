'use client';
import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Layout/AppShell';
import PhotoCapture from '@/components/Notebook/PhotoCapture';
import OcrConfirmation from '@/components/Notebook/OcrConfirmation';
import ResultCards from '@/components/Analyzer/ResultCards';
import ScanAnimation from '@/components/Analyzer/ScanAnimation';
import { useAuthStandalone } from '@/lib/auth';
import { notebookOcr, notebookAnalyze } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const STEP = { CAPTURE: 'capture', OCR: 'ocr', SCANNING: 'scanning', RESULT: 'result' };

// FIX: Helper to add a timeout to any fetch promise
function withTimeout(promise, ms = 30000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), ms)
  );
  return Promise.race([promise, timeout]);
}

export default function NotebookPage() {
  const { t, lang } = useLanguage();
  const { loading: authLoading } = useAuthStandalone();
  const [step, setStep] = useState(STEP.CAPTURE);
  const [ocrText, setOcrText] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState('medium');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  async function handleCapture(base64) {
    setError('');
    setOcrLoading(true);
    try {
      // FIX: was passing bare base64 string; backend expects { image: base64 }
      const res = await withTimeout(notebookOcr({ image: base64 }));
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.details?.[0] || t('notebook.extractError'));
        return;
      }
      const data = await res.json();
      setOcrText(data.extractedText || '');
      setOcrConfidence(data.confidence || 'medium');
      setStep(STEP.OCR);
    } catch (err) {
      if (err?.message === 'REQUEST_TIMEOUT') {
        setError(t('notebook.timeoutError'));
      } else {
        setError(t('notebook.serverError'));
      }
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleConfirm() {
    if (!ocrText.trim()) return;
    setError('');
    setStep(STEP.SCANNING);
    setAnalyzeLoading(true);
    const startTime = Date.now();
    try {
      // FIX: was sending ocrText as body; backend expects { confirmedText }
      const res = await withTimeout(notebookAnalyze({ confirmedText: ocrText }));
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.details?.[0] || t('notebook.analyzeError'));
        setStep(STEP.OCR);
        return;
      }
      const data = await res.json();
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
      setResult({ ...data, input: ocrText });
      setStep(STEP.RESULT);
    } catch (err) {
      if (err?.message === 'REQUEST_TIMEOUT') {
        setError(t('notebook.timeoutError'));
      } else {
        setError(t('notebook.serverError'));
      }
      setStep(STEP.OCR);
    } finally {
      setAnalyzeLoading(false);
    }
  }

  function handleReset() {
    setStep(STEP.CAPTURE);
    setOcrText('');
    setOcrConfidence('medium');
    setResult(null);
    setError('');
  }

  if (authLoading) return null;

  const stepLabels = [
    { key: STEP.CAPTURE, label: t('notebook.step1') },
    { key: STEP.OCR, label: t('notebook.step2') },
    { key: STEP.RESULT, label: t('notebook.step3') },
  ];

  // FIX: compute active/done outside JSX for clarity
  const currentStepIndex = stepLabels.findIndex(s => s.key === step);

  return (
    <AppShell>
      <div className="min-h-screen bg-black relative" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
        <div className="absolute inset-0 grid-scan-bg opacity-10 pointer-events-none" />

        {/* Header */}
        <header
          className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a' }}
        >
          <Link href="/analyze" className="text-text-muted hover:text-gold transition-colors text-sm">
            ←
          </Link>
          <div>
            <h1 className="text-sm font-bold text-gold font-mono" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px' }}>
              {t('notebook.title')}
            </h1>
            <p className="system-subtitle" style={{ fontSize: '8px', letterSpacing: '2px' }}>{t('notebook.subtitle')}</p>
          </div>
        </header>

        {/* Step indicators */}
        <div className="flex px-4 pt-4 gap-2">
          {stepLabels.map((s, i) => {
            const isActive = step === s.key || (step === STEP.SCANNING && s.key === STEP.OCR);
            // FIX: SCANNING step sits between OCR and RESULT — treat it as step > OCR for progress bar
            const effectiveIndex = step === STEP.SCANNING ? 2 : currentStepIndex;
            const isDone = effectiveIndex > i;
            return (
              <div key={s.key} className="flex-1 text-center">
                <div
                  className="h-0.5 rounded-full mb-1 transition-all duration-500"
                  style={{ background: isDone ? '#D4AF37' : isActive ? '#D4AF37' : '#2a2a2a' }}
                />
                <span
                  className="text-[9px] font-mono tracking-wider"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isActive || isDone ? '#D4AF37' : '#444',
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="px-4 py-4 max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm text-error" style={{ background: '#1A0A0A', border: '1px solid #3A1A1A' }}>
              ⚠ {error}
            </div>
          )}

          {/* FIX: Show PhotoCapture only when not OCR-loading to prevent UI overlap */}
          {step === STEP.CAPTURE && !ocrLoading && (
            <PhotoCapture onCapture={handleCapture} loading={ocrLoading} />
          )}

          {/* FIX: Show scan animation in its own block, replacing PhotoCapture */}
          {step === STEP.CAPTURE && ocrLoading && (
            <ScanAnimation text={t('notebook.extracting')} />
          )}

          {step === STEP.OCR && (
            <OcrConfirmation
              text={ocrText}
              onChange={setOcrText}
              confidence={ocrConfidence}
              onConfirm={handleConfirm}
              onRetake={handleReset}
              loading={analyzeLoading}
            />
          )}

          {step === STEP.SCANNING && (
            <ScanAnimation text={ocrText} />
          )}

          {step === STEP.RESULT && result && (
            <div className="flex flex-col gap-5">
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-[3px] h-[11px] bg-[#4a4a60] rounded-full" />
                  <label
                    className="text-[10px] font-mono text-[#6a6a80] tracking-[.18em] font-semibold uppercase"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {t('analyze.sentenceToAnalyze')}
                  </label>
                </div>
                <div className="px-4 py-3 text-sm rounded-xl" style={{ fontFamily: 'Inter, sans-serif', background: 'rgba(20,20,20,0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#a0a0b0' }}>
                  {result.input}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-[14px] rounded-xl text-[12px] font-mono transition-all whitespace-nowrap sm:w-auto w-full text-center"
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
              </div>

              <ResultCards result={result} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
