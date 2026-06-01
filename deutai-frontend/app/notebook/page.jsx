'use client';
import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Layout/AppShell';
import PhotoCapture from '@/components/Notebook/PhotoCapture';
import OcrConfirmation from '@/components/Notebook/OcrConfirmation';
import ResultCards from '@/components/Analyzer/ResultCards';
import ScanAnimation from '@/components/Analyzer/ScanAnimation';
import CameraPermissionModal from '@/components/Notebook/CameraPermissionModal';
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
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending' | 'granted' | 'denied'
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
      {/* ── Camera permission modal — shown once on first open ── */}
      <CameraPermissionModal
        visible={cameraPermission === 'pending'}
        onGranted={() => setCameraPermission('granted')}
        onDenied={() => setCameraPermission('denied')}
      />

      <div className="min-h-screen relative" style={{ background: 'var(--color-bg-ice)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
        <div className="absolute inset-0 grid-scan-bg opacity-100 pointer-events-none" />

        {/* Header */}
        <header
          className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(242,248,252,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}
        >
          <Link href="/analyze" className="inline-flex min-h-11 min-w-11 items-center justify-center text-text-muted hover:text-primary transition-colors text-sm">
            ←
          </Link>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--color-primary)', letterSpacing: '2px' }}>
              {t('notebook.title')}
            </h1>
            <p className="system-subtitle" style={{ fontSize: '8px', letterSpacing: '2px' }}>{t('notebook.subtitle')}</p>
          </div>
        </header>

        {/* Step indicators */}
        <div className="flex px-3 sm:px-4 pt-4 gap-2">
          {stepLabels.map((s, i) => {
            const isActive = step === s.key || (step === STEP.SCANNING && s.key === STEP.OCR);
            // FIX: SCANNING step sits between OCR and RESULT — treat it as step > OCR for progress bar
            const effectiveIndex = step === STEP.SCANNING ? 2 : currentStepIndex;
            const isDone = effectiveIndex > i;
            return (
              <div key={s.key} className="flex-1 text-center">
                <div
                  className="h-0.5 rounded-full mb-1 transition-all duration-500"
                  style={{ background: isDone ? 'var(--color-primary)' : isActive ? 'var(--color-primary)' : 'var(--color-border)' }}
                />
                <span
                  className="text-[14px] sm:text-[11px] tracking-normal sm:tracking-wider"
                  style={{
                    color: isActive || isDone ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="px-3 sm:px-4 py-4 max-w-2xl mx-auto">
          {/* Camera permission denied banner */}
          {cameraPermission === 'denied' && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-3"
              style={{ background: 'rgba(156,123,172,0.07)', border: '1px solid rgba(156,123,172,0.22)', color: 'var(--color-text-secondary)' }}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>📷</span>
              <span>
                <strong style={{ color: 'var(--color-primary)' }}>Camera access was denied.</strong>
                {' '}You can still upload images from your device. To enable the camera later, update your browser permissions.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm text-error" style={{ background: 'rgba(204,85,85,0.06)', border: '1px solid rgba(204,85,85,0.2)' }}>
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
                  <span className="w-[3px] h-[11px] rounded-full" style={{ background: 'var(--color-primary)', opacity: 0.7 }} />
                  <label
                    className="text-[14px] tracking-[.18em] font-semibold uppercase"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {t('analyze.sentenceToAnalyze')}
                  </label>
                </div>
                <div className="px-4 py-3 text-sm rounded-xl" style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  {result.input}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-[14px] min-h-12 rounded-xl text-[14px] transition-all whitespace-nowrap sm:w-auto w-full text-center"
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
              </div>

              <ResultCards result={result} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
