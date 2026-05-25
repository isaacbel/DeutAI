'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ProgressBar({ current, total }) {
  const { t } = useLanguage();
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span
          className="font-mono text-[15px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {t('quiz.progress')}
        </span>
        <span className="font-mono text-[15px] tabular-nums" style={{ color: 'var(--color-primary)' }}>
          {current}/{total}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-bg-sidebar)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--color-primary), rgba(156,123,172,0.65))',
            boxShadow: '0 0 12px rgba(156,123,172,0.30)',
          }}
        />
      </div>
    </div>
  );
}
