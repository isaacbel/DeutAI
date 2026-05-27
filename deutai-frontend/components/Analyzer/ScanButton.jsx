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
      className="w-full min-h-12 py-[15px] px-3 rounded-xl font-bold font-mono relative overflow-hidden transition-all duration-300 select-none"
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '15px',
        letterSpacing: '1.4px',
        ...(isActive ? {
          background: 'var(--color-primary)',
          border: '1px solid var(--color-primary)',
          color: '#121212',
          cursor: 'pointer',
        } : loading ? {
          background: 'rgba(156,123,172,0.7)',
          border: '1px solid rgba(156,123,172,0.8)',
          color: '#121212',
          cursor: 'not-allowed',
        } : {
          background: 'var(--color-bg-sidebar)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
          cursor: 'not-allowed',
        }),
      }}
      onMouseEnter={e => {
        if (isActive) {
          e.currentTarget.style.background = 'var(--color-accent)';
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.boxShadow = '0 0 24px rgba(255,127,45,0.3)';
        }
      }}
      onMouseLeave={e => {
        if (isActive) {
          e.currentTarget.style.background = 'var(--color-primary)';
          e.currentTarget.style.borderColor = 'var(--color-primary)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      onMouseDown={e => { if (isActive) e.currentTarget.style.transform = 'scale(0.99)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      aria-label={loading ? t('analyze.scanInProgress') : t('analyze.startAnalyze')}
    >
      {/* Shimmer on active */}
      {isActive && (
        <span
          className="absolute inset-y-0 w-1/3 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
            animation: 'shimmerSlide 2.4s ease-in-out infinite',
          }}
        />
      )}

      <span className="flex items-center justify-center gap-3 relative z-10">
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin text-[#121212]" />
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
