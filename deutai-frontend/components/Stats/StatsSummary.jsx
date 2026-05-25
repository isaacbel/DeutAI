'use client';
import { Activity, AlertTriangle, Gauge } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function StatsSummary({ stats }) {
  const { t, lang } = useLanguage();
  const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'de-DE';
  const { totalAnalyses = 0, totalErrors = 0, errorRate = 0 } = stats || {};

  const items = [
    {
      label: t('stats.labelAnalyses'),
      value: totalAnalyses.toLocaleString(locale),
      icon: Activity,
      color: 'var(--color-primary)',
      bg: 'white',
      border: 'var(--color-border)',
      iconBg: 'rgba(156,123,172,0.08)',
      iconBorder: 'rgba(156,123,172,0.2)',
    },
    {
      label: t('stats.labelErrors'),
      value: totalErrors.toLocaleString(locale),
      icon: AlertTriangle,
      color: 'var(--color-error)',
      bg: 'white',
      border: 'var(--color-border)',
      iconBg: 'rgba(204,85,85,0.08)',
      iconBorder: 'rgba(204,85,85,0.2)',
    },
    {
      label: t('stats.labelErrorRate'),
      value: `${Math.round(errorRate)}%`,
      icon: Gauge,
      color: 'var(--color-accent)',
      bg: 'white',
      border: 'var(--color-border)',
      iconBg: 'rgba(255,127,45,0.08)',
      iconBorder: 'rgba(255,127,45,0.2)',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-xl px-4 py-3.5 flex flex-col gap-3 shadow-[0_4px_16px_rgba(156,123,172,0.04)]"
            style={{ background: item.bg, border: `1px solid ${item.border}` }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[13px] uppercase tracking-[.18em] font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-muted)' }}
              >
                {item.label}
              </span>
              <div style={{
                background: item.iconBg,
                border: `1px solid ${item.iconBorder}`,
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={14} style={{ color: item.color }} />
              </div>
            </div>
            <p
              className="font-mono text-[28px] font-bold tracking-tight tabular-nums leading-none"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: item.color }}
            >
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}