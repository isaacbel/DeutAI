'use client';
import { Sparkles } from 'lucide-react';

export default function CorrectionCard({ correction, correctedSentence, errors = [], originalSentence = '' }) {
  const fullCorrectedSentence = correctedSentence || correction;
  const beforeSentence = originalSentence || '';

  const paragraphStyle = {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '24px',
    lineHeight: 1.8,
  };

  const renderBeforeSentence = () => {
    if (!beforeSentence) return null;

    const tokens = errors
      .map((err) => err?.errorText)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map((txt) => txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (!tokens.length) {
      return (
        <p style={{ ...paragraphStyle, color: 'rgba(234,234,234,0.72)' }}>
          {beforeSentence}
        </p>
      );
    }

    const pattern = new RegExp(`(${tokens.join('|')})`, 'gi');
    const parts = beforeSentence.split(pattern);

    return (
      <p style={{ ...paragraphStyle, color: 'rgba(234,234,234,0.72)' }}>
        {parts.map((part, idx) => {
          const isError = errors.some((err) => err?.errorText?.toLowerCase() === part.toLowerCase());
          if (!isError) return <span key={idx}>{part}</span>;

          return (
            <span
              key={idx}
              style={{
                color: '#F0A2A2',
                textDecoration: 'line-through',
                textDecorationColor: 'rgba(224,82,82,0.78)',
                textDecorationThickness: '1px',
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
          Correction
        </span>
        {errors.length > 0 && (
          <span
            style={{
              marginLeft: 'auto',
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
            {errors.length} fix{errors.length > 1 ? 'es' : ''}
          </span>
        )}
      </div>

      <div
        className="relative z-10 grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          marginBottom: fullCorrectedSentence && errors.length > 0 ? '18px' : 0,
        }}
      >
        {beforeSentence && (
          <div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#D08A8A',
                marginBottom: '10px',
              }}
            >
              Before
            </p>
            <div
              style={{
                borderRadius: '16px',
                background: 'rgba(107,31,31,0.13)',
                border: '1px solid rgba(208,84,84,0.2)',
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
                color: '#E3C66F',
                marginBottom: '10px',
              }}
            >
              After
            </p>
            <div
              style={{
                borderRadius: '16px',
                background: 'rgba(212,175,55,0.09)',
                border: '1px solid rgba(212,175,55,0.26)',
                padding: '16px 18px',
                height: '100%',
              }}
            >
              <p
                style={{
                  ...paragraphStyle,
                  color: '#F6E5AF',
                  textShadow: '0 0 22px rgba(212,175,55,0.12)',
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
                  color: '#D08A8A',
                  textDecoration: 'line-through',
                  textDecorationColor: 'rgba(224,82,82,0.78)',
                  textDecorationThickness: '1px',
                  background: 'rgba(107,31,31,0.13)',
                  border: '1px solid rgba(208,84,84,0.2)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                }}
              >
                {err.errorText}
              </span>
              <span style={{ color: 'rgba(212,175,55,0.55)', fontSize: '12px' }}>→</span>
              <span
                style={{
                  fontSize: '13px',
                  color: '#E3C66F',
                  background: 'rgba(212,175,55,0.09)',
                  border: '1px solid rgba(212,175,55,0.26)',
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
