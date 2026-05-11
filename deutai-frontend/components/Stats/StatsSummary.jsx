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
      color: '#7dd3fc',
      bg: 'rgba(125,211,252,0.07)',
      border: 'rgba(125,211,252,0.15)',
    },
    {
      label: t('stats.labelErrors'),
      value: totalErrors.toLocaleString(locale),
      icon: AlertTriangle,
      color: '#fda4af',
      bg: 'rgba(253,164,175,0.07)',
      border: 'rgba(253,164,175,0.15)',
    },
    {
      label: t('stats.labelErrorRate'),
      value: `${Math.round(errorRate)}%`,
      icon: Gauge,
      color: errorRate > 70 ? '#f87171' : '#fcd34d',
      bg: errorRate > 70 ? 'rgba(248,113,113,0.07)' : 'rgba(252,211,77,0.07)',
      border: errorRate > 70 ? 'rgba(248,113,113,0.18)' : 'rgba(252,211,77,0.15)',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-xl px-4 py-3.5 flex flex-col gap-3"
            style={{ background: item.bg, border: `1px solid ${item.border}` }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[15px] uppercase tracking-[.18em] font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: item.color, opacity: 0.8 }}
              >
                {item.label}
              </span>
              <Icon size={15} style={{ color: item.color, opacity: 0.7 }} />
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