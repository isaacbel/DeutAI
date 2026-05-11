'use client';
import { Cpu, Loader2, ScanLine } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ScanButton({ onClick, disabled, loading }) {
  const { t } = useLanguage();
  const isActive = !disabled && !loading;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-[15px] rounded-xl font-bold font-mono relative overflow-hidden transition-all duration-300 select-none"
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '15px',
        letterSpacing: '2.5px',
        ...(isActive ? {
          background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.18), rgba(212,175,55,0.1))',
          border: '1px solid rgba(212,175,55,0.4)',
          color: '#f0d787',
          cursor: 'pointer',
        } : loading ? {
          background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.14), rgba(212,175,55,0.08))',
          border: '1px solid rgba(212,175,55,0.28)',
          color: '#d4af37',
          cursor: 'not-allowed',
        } : {
          background: '#13131a',
          border: '1px solid rgba(52,52,68,0.8)',
          color: '#7a7a90',
          cursor: 'not-allowed',
        }),
      }}
      onMouseEnter={e => { if (isActive) e.currentTarget.style.boxShadow = '0 0 24px rgba(212,175,55,0.16)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
      onMouseDown={e => { if (isActive) e.currentTarget.style.transform = 'scale(0.99)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      aria-label={loading ? t('analyze.scanInProgress') : t('analyze.startAnalyze')}
    >
      {/* Shimmer on active */}
      {isActive && (
        <span
          className="absolute inset-y-0 w-1/3 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)',
            animation: 'shimmerSlide 2.4s ease-in-out infinite',
          }}
        />
      )}

      <span className="flex items-center justify-center gap-3 relative z-10">
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin text-[#D4AF37]" />
            <span className="animate-pulse tracking-[4px]">{t('analyze.scanning')}</span>
          </>
        ) : (
          <>
            <ScanLine size={18} />
            <span>{t('analyze.scanCta')}</span>
            <Cpu size={14} style={{ opacity: 0.55 }} />
          </>
        )}
      </span>

      <style>{`
        @keyframes shimmerSlide {
          0% { transform: translateX(-120%) }
          50% { transform: translateX(380%) }
          100% { transform: translateX(380%) }
        }
      `}</style>
    </button>
  );
}