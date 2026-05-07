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
        <p className="text-lg md:text-2xl" style={{ ...paragraphStyle, color: 'rgba(234,234,234,0.72)' }}>
          {originalSentence}
        </p>
      );
    }

    const pattern = new RegExp(`(${tokens.join('|')})`, 'gi');
    const parts = originalSentence.split(pattern);

    return (
      <p className="text-lg md:text-2xl" style={{ ...paragraphStyle, color: 'rgba(234,234,234,0.72)' }}>
        {parts.map((part, idx) => {
          const isError = errors.some((err) => err?.errorText?.toLowerCase() === part.toLowerCase());
          if (!isError) return <span key={idx}>{part}</span>;

          return (
            <span
              key={idx}
              style={{
                color: '#FF8080',
                textDecoration: 'line-through',
                textDecorationColor: 'rgba(255,128,128,0.8)',
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
        background: 'linear-gradient(150deg, rgba(24,24,24,0.94), rgba(18,18,18,0.94))',
        border: '1px solid rgba(212,175,55,0.22)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 10px 36px rgba(0,0,0,0.42), 0 0 0 1px rgba(212,175,55,0.03) inset',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(130deg, rgba(212,175,55,0.13), transparent 42%, transparent 70%, rgba(255,255,255,0.03))',
          borderRadius: '24px',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          borderRadius: '24px',
          backgroundImage: 'repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.08) 0 0.8px, transparent 0.8px 2px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'soft-light',
        }}
      />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div
          className="p-1.5 rounded-lg"
          style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}
        >
          <Sparkles size={16} className="text-gold" />
        </div>
        <span
          className="text-[13px] uppercase font-semibold"
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.28em', color: '#E3C66F' }}
        >
          {t('errorCard.correction')}
        </span>
        {errors.length > 0 && (
          <span
            style={{
              marginLeft: isRtl ? undefined : 'auto',
              marginRight: isRtl ? 'auto' : undefined,
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '5px 11px',
              borderRadius: '999px',
              color: '#E3C66F',
              border: '1px solid rgba(212,175,55,0.32)',
              background: 'rgba(212,175,55,0.14)',
            }}
          >
            {t('errorCard.fixCount', { count: errors.length })}
          </span>
        )}
      </div>

      <div
        className="relative z-10 flex flex-col md:grid md:grid-cols-2 gap-4"
        style={{
          marginBottom: fullCorrectedSentence && errors.length > 0 ? '18px' : 0,
        }}
      >
        {originalSentence && (
          <div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#FF6B6B',
                marginBottom: '10px',
              }}
            >
              {t('errorCard.before')}
            </p>
            <div
              style={{
                borderRadius: '16px',
                background: 'rgba(255,107,107,0.12)',
                border: '1px solid rgba(255,107,107,0.25)',
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
                fontSize: '12px',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#4ADE80',
                marginBottom: '10px',
              }}
            >
              {t('errorCard.after')}
            </p>
            <div
              style={{
                borderRadius: '16px',
                background: 'rgba(74,222,128,0.12)',
                border: '1px solid rgba(74,222,128,0.25)',
                padding: '16px 18px',
                height: '100%',
              }}
            >
              {/* Fix #12 — corrected text is always German, so lang="de" is intentional */}
              <p
                className="text-lg md:text-2xl"
                lang="de"
                style={{
                  ...paragraphStyle,
                  color: '#86EFAC',
                  textShadow: '0 0 22px rgba(74,222,128,0.15)',
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
            borderTop: '1px solid rgba(212,175,55,0.14)',
            paddingTop: '14px',
            display: 'grid',
            gap: '8px',
          }}
        >
          {errors.map((err, index) => (
            <div
              key={`${err.errorText || 'err'}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  color: '#FF6B6B',
                  textDecoration: 'line-through',
                  textDecorationColor: 'rgba(255,107,107,0.8)',
                  textDecorationThickness: '2px',
                  background: 'rgba(255,107,107,0.12)',
                  border: '1px solid rgba(255,107,107,0.25)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                }}
              >
                {err.errorText}
              </span>
              <span style={{ color: 'rgba(212,175,55,0.55)', fontSize: '12px' }}>{isRtl ? '←' : '→'}</span>
              <span
                style={{
                  fontSize: '13px',
                  color: '#4ADE80',
                  background: 'rgba(74,222,128,0.12)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  padding: '4px 8px',
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
