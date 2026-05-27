'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function periodToDays(period) {
  switch (period) {
    case '30d':
      return 30;
    case '3m':
      return 90;
    case '6m':
      return 180;
    case '1y':
      return 365;
    default:
      return 30;
  }
}

function normalizeDateKey(raw) {
  if (!raw) return '';
  const s = String(raw);
  return s.includes('T') ? s.slice(0, 10) : s;
}

/** Full daily timeline for the selected period (UTC day keys), merged with API counts */
function buildTimeline(evolutionData, period, lang) {
  const days = periodToDays(period);
  const map = new Map();
  (evolutionData || []).forEach((d) => {
    const key = normalizeDateKey(d.date);
    if (key) map.set(key, Number(d.count) || 0);
  });

  const out = [];
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(end);
    dt.setUTCDate(dt.getUTCDate() - i);
    const key = dt.toISOString().slice(0, 10);
    const count = map.get(key) ?? 0;
    const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'de-DE';
    const short = dt.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
    out.push({ dateKey: key, label: short, count });
  }
  return out;
}

function summarizeTimeline(rows) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  const activeDays = rows.filter((r) => r.count > 0).length;
  let peak = 0;
  let peakLabel = '—';
  rows.forEach((r) => {
    if (r.count > peak) {
      peak = r.count;
      peakLabel = r.label;
    }
  });
  const avg = rows.length > 0 ? Math.round((total / rows.length) * 10) / 10 : 0;
  return { total, activeDays, peak, peakLabel, avg };
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const v = payload[0].value;
  return (
    <div
      className="rounded-lg border border-var(--color-border) bg-white px-3 py-2 text-sm shadow-xl"
      style={{ fontFamily: 'JetBrains Mono, monospace' }}
    >
      <p className="text-text-muted">{row.dateKey}</p>
      <p className="mt-0.5 text-primary" style={{ color: 'var(--color-primary)' }}>
        {v} analyse{v !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default function EvolutionChart({ data, period = '30d' }) {
  const { t, lang } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const chartData = buildTimeline(data, period, lang);
  const { total, activeDays, peak, peakLabel, avg } = summarizeTimeline(chartData);
  const dense = chartData.length > 120;

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {t('stats.noActivityPeriod')}
        </p>
        <p className="text-sm text-text-secondary">{t('stats.activityWillAppear')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-var(--color-border) bg-var(--color-bg-sidebar) px-2.5 py-2">
          <p className="text-[14px] uppercase tracking-normal sm:tracking-wider text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {t('stats.labelAnalyses')}
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {total}
          </p>
        </div>
        <div className="rounded-lg border border-var(--color-border) bg-var(--color-bg-sidebar) px-2.5 py-2">
          <p className="text-[14px] uppercase tracking-normal sm:tracking-wider text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {t('stats.labelActiveDays')}
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeDays}
          </p>
        </div>
        <div className="rounded-lg border border-[rgba(255,127,45,0.25)] bg-[rgba(255,127,45,0.06)] px-2.5 py-2">
          <p className="text-[14px] uppercase tracking-normal sm:tracking-wider text-accent" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-accent)' }}>
            {t('stats.labelPeak')}
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {peak}
          </p>
          <p className="truncate text-[13px] text-text-secondary" title={peakLabel}>
            {peakLabel}
          </p>
        </div>
        <div className="rounded-lg border border-var(--color-border) bg-var(--color-bg-sidebar) px-2.5 py-2">
          <p className="text-[14px] uppercase tracking-normal sm:tracking-wider text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {t('stats.labelAvgPerDay')}
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {avg}
          </p>
        </div>
      </div>

      {/* Explicit pixel height: Recharts measures parent; % height alone often resolves to -1 in flex/grid. */}
      <div
        className="w-full min-w-0"
        style={{ height: '260px', minHeight: '220px' }}
      >
        {isMounted && (
          <ResponsiveContainer width="100%" height={260} debounce={50}>
            <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 12, bottom: 4 }}>
            <defs>
              <linearGradient id="evolutionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-text-muted)', fontSize: dense ? 8 : 9, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false}
              tickLine={false}
              interval={dense ? Math.floor(chartData.length / 6) : 'preserveStartEnd'}
              minTickGap={dense ? 40 : 8}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(156,123,172,0.25)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#evolutionFill)"
              activeDot={{ r: 5, fill: '#fff', stroke: 'var(--color-primary)', strokeWidth: 2 }}
              dot={dense ? false : { fill: 'var(--color-primary)', r: 2, strokeWidth: 0 }}
            />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-center text-[13px] text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {t('stats.chartCaption')}
      </p>
    </div>
  );
}
