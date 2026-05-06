'use client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const CONFIDENCE_STYLES = {
  low: {
    bg: '#1A0A0A',
    border: '#3A1A1A',
    color: '#CC5555',
  },
  medium: {
    bg: 'rgba(212,175,55,0.08)',
    border: 'rgba(212,175,55,0.3)',
    color: '#D4AF37',
  },
  high: {
    bg: 'rgba(74,154,74,0.1)',
    border: 'rgba(74,154,74,0.3)',
    color: '#4A9A4A',
  },
};

export default function OcrConfirmation({ text, onChange, confidence, onConfirm, onRetake, loading }) {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';

  const normalizedConfidence = CONFIDENCE_STYLES[confidence] ? confidence : 'medium';
  const isLowConfidence = normalizedConfidence === 'low';
  const styles = CONFIDENCE_STYLES[normalizedConfidence];

  const hasValidText = text?.trim().length > 0;

  return (
    <div className="flex flex-col gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Confidence indicator */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-mono tracking-wider px-2 py-1 rounded"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: styles.bg,
            border: `1px solid ${styles.border}`,
            color: styles.color,
          }}
        >
          {t('notebook.ocrConfidence', { level: normalizedConfidence.toUpperCase() })}
        </span>
      </div>

      {/* Low confidence warning */}
      {isLowConfidence && (
        <div
          className="px-4 py-3 rounded-lg text-sm text-error flex items-start gap-2"
          style={{ background: '#1A0A0A', border: '1px solid #3A1A1A', animation: 'fadeIn 0.3s ease-out' }}
        >
          <span>⚠</span>
          <span>{t('notebook.lowConfidenceWarning')}</span>
        </div>
      )}

      {/* Extracted text editable area */}
      <div>
        <label className="block text-[11px] font-mono text-text-muted mb-2 tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {t('notebook.extractedTextLabel')}
        </label>
        <textarea
          value={text}
          onChange={e => onChange(e.target.value)}
          rows={6}
          className="input-dark px-4 py-3 text-sm resize-none w-full"
          style={{ fontFamily: 'Inter, sans-serif', direction: 'ltr', textAlign: 'left' }}
          placeholder={t('notebook.ocrPlaceholder')}
          maxLength={1000}
          lang="de"
        />
        <p className="text-[10px] font-mono text-text-muted mt-1 text-right" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {text?.length ?? 0} / 1000
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onConfirm}
          disabled={loading || !hasValidText}
          className="btn-gold w-full py-3 text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {t('notebook.analyzingInProgress')}
            </span>
          ) : (
            t('notebook.validateAndAnalyze')
          )}
        </button>
        <button
          onClick={onRetake}
          disabled={loading}
          className="btn-outline w-full py-3 text-sm"
        >
          {t('notebook.retakePhoto')}
        </button>
      </div>
    </div>
  );
}
