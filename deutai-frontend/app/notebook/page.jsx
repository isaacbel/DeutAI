'use client';
import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/Layout/AppShell';
import PhotoCapture from '@/components/Notebook/PhotoCapture';
import OcrConfirmation from '@/components/Notebook/OcrConfirmation';
import NotebookResults from '@/components/Notebook/NotebookResults';
import ScanAnimation from '@/components/Analyzer/ScanAnimation';
import { useAuthStandalone } from '@/lib/auth';
import { notebookOcr, notebookAnalyze } from '@/lib/api';

const STEP = { CAPTURE: 'capture', OCR: 'ocr', SCANNING: 'scanning', RESULT: 'result' };

export default function NotebookPage() {
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
      const res = await notebookOcr(base64);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Erreur lors de l\'extraction du texte.');
        return;
      }
      const data = await res.json();
      setOcrText(data.extractedText || '');
      setOcrConfidence(data.confidence || 'medium');
      setStep(STEP.OCR);
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
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
      const res = await notebookAnalyze(ocrText);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Erreur lors de l\'analyse.');
        setStep(STEP.OCR);
        return;
      }
      const data = await res.json();
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
      setResult({ ...data, input: ocrText });
      setStep(STEP.RESULT);
    } catch {
      setError('Impossible de contacter le serveur.');
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
    { key: STEP.CAPTURE, label: '01 — Photo' },
    { key: STEP.OCR, label: '02 — Confirmation' },
    { key: STEP.RESULT, label: '03 — Résultats' },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-black relative">
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
              SMART NOTEBOOK
            </h1>
            <p className="system-subtitle" style={{ fontSize: '8px', letterSpacing: '2px' }}>ANALYSE DE TEXTE MANUSCRIT</p>
          </div>
        </header>

        {/* Step indicators */}
        <div className="flex px-4 pt-4 gap-2">
          {stepLabels.map((s, i) => {
            const isActive = step === s.key || (step === STEP.SCANNING && s.key === STEP.OCR);
            const isDone = stepLabels.findIndex(x => x.key === step) > i || step === STEP.RESULT;
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

          {step === STEP.CAPTURE && (
            <PhotoCapture onCapture={handleCapture} loading={ocrLoading} />
          )}

          {ocrLoading && step === STEP.CAPTURE && (
            <div className="mt-4">
              <ScanAnimation text="Extraction du texte en cours..." />
            </div>
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
            <NotebookResults result={result} onReset={handleReset} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
