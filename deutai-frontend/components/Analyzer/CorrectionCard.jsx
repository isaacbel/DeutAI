'use client';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

// Fix #9 — correctedSentence is the canonical prop; correction kept as a legacy alias.
// Fix #10 — beforeSentence alias removed; originalSentence used directly.
export default function CorrectionCard({ correctedSentence, correction, errors = [], originalSentence = '' }) {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';

  // Fix #9 — nullish coalescing so an empty string correctedSentence doesn't fall back to correction
  const fullCorrectedSentence = correctedSentence ?? correction;

  const paragraphStyle = {
    fontFamily: 'Georgia, "Times New Roman", serif',
    lineHeight: 1.8,
  };

  // Fix #10 — uses originalSentence directly (the alias beforeSentence was redundant)
  const renderBeforeSentence = () => {
    if (!originalSentence) return null;

    const tokens = errors
      .map((err) => err?.errorText)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map((txt) => txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (!tokens.length) {
      return (
        <p className="text-lg md:text-2xl" dir="ltr" lang="de" style={{ ...paragraphStyle, color: 'var(--color-text-primary)', textAlign: isRtl ? 'left' : undefined }}>
          {originalSentence}
        </p>
      );
    }

    const pattern = new RegExp(`(${tokens.join('|')})`, 'gi');
    const parts = originalSentence.split(pattern);

    return (
      <p className="text-lg md:text-2xl" dir="ltr" lang="de" style={{ ...paragraphStyle, color: 'var(--color-text-primary)', textAlign: isRtl ? 'left' : undefined }}>
        {parts.map((part, idx) => {
          const isError = errors.some((err) => err?.errorText?.toLowerCase() === part.toLowerCase());
          if (!isError) return <span key={idx}>{part}</span>;

          return (
            <span
              key={idx}
              style={{
                color: 'var(--color-error)',
                textDecoration: 'line-through',
                textDecorationColor: 'rgba(204,85,85,0.8)',
                textDecorationThickness: '2px',
              }}
            >
              {part}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 4px 24px rgba(156, 123, 172, 0.06)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div
          className="p-1.5 rounded-lg"
          style={{ background: 'rgba(156, 123, 172, 0.08)', border: '1px solid rgba(156, 123, 172, 0.25)' }}
        >
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
        </div>
        <span
          className="text-base uppercase font-semibold"
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', color: 'var(--color-primary)' }}
        >
          {t('errorCard.correction')}
        </span>
        {errors.length > 0 && (
          <span
            style={{
              marginLeft: isRtl ? undefined : 'auto',
              marginRight: isRtl ? 'auto' : undefined,
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '5px 11px',
              borderRadius: '999px',
              color: 'var(--color-primary)',
              border: '1px solid rgba(156, 123, 172, 0.25)',
              background: 'rgba(156, 123, 172, 0.06)',
            }}
          >
            {t('errorCard.fixCount', { count: errors.length })}
          </span>
        )}
      </div>

      <div
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{
          marginBottom: fullCorrectedSentence && errors.length > 0 ? '18px' : 0,
        }}
      >
        {originalSentence && (
          <div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-error)',
                marginBottom: '10px',
              }}
            >
              {t('errorCard.before')}
            </p>
            <div
              style={{
                borderRadius: '16px',
                background: 'rgba(204, 85, 85, 0.04)',
                border: '1px solid rgba(204, 85, 85, 0.12)',
                padding: '16px 18px',
                height: '100%',
              }}
            >
              {renderBeforeSentence()}
            </div>
          </div>
        )}

        {fullCorrectedSentence && (
          <div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-success)',
                marginBottom: '10px',
              }}
            >
              {t('errorCard.after')}
            </p>
            <div
              style={{
                borderRadius: '16px',
                background: 'rgba(124, 176, 120, 0.04)',
                border: '1px solid rgba(124, 176, 120, 0.12)',
                padding: '16px 18px',
                height: '100%',
              }}
            >
              {/* Fix #12 — corrected text is always German, so lang="de" is intentional */}
              <p
                className="text-lg md:text-2xl"
                lang="de"
                dir="ltr"
                style={{
                  ...paragraphStyle,
                  color: 'var(--color-success)',
                  textAlign: isRtl ? 'left' : undefined,
                }}
              >
                {fullCorrectedSentence}
              </p>
            </div>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="relative z-10"
          style={{
            marginTop: '4px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '14px',
            display: 'grid',
            gap: '8px',
          }}
        >
          {errors.map((err, index) => (
            <div
              key={`${err.errorText || 'err'}-${index}`}
              dir="ltr"
              lang="de"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                fontFamily: 'Inter, sans-serif',
                justifyContent: isRtl ? 'flex-end' : 'flex-start',
                rowGap: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  color: 'var(--color-error)',
                  textDecoration: 'line-through',
                  textDecorationColor: 'rgba(204, 85, 85, 0.8)',
                  textDecorationThickness: '2px',
                  background: 'rgba(204, 85, 85, 0.04)',
                  border: '1px solid rgba(204, 85, 85, 0.15)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                }}
              >
                {err.errorText}
              </span>
              <span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>→</span>
              <span
                style={{
                  fontSize: '16px',
                  color: 'var(--color-success)',
                  background: 'rgba(124, 176, 120, 0.07)',
                  border: '1px solid rgba(124, 176, 120, 0.18)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                {err.correction}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
