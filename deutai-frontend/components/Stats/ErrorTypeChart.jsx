'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const ERROR_LABELS = {
  conjugaison: 'Conjugaison',
  temps: 'Temps verbal',
  auxiliaire: 'Auxiliaire',
  déclinaison: 'Déclinaison',
  genre: 'Genre',
  nombre: 'Nombre',
  accord: 'Accord',
  ordre: 'Ordre des mots',
  position_verbe: 'Position du verbe',
  subordonnée: 'Subordonnée',
  préposition: 'Préposition',
  cas_prépositionnel: 'Cas prépositionnel',
  choix_mot: 'Choix du mot',
  faux_ami: 'Faux ami',
  collocation: 'Collocation',
  registre: 'Registre',
  orthographe: 'Orthographe',
  majuscule: 'Majuscule',
  ponctuation: 'Ponctuation',
  verbe_séparable: 'Verbe séparable',
  infinitif_zu: 'Infinitif + zu',
  modalverbe: 'Verbe modal',
  autre: 'Autre',
};

const ERROR_TYPE_COLORS = {
  conjugaison: '#e05252',
  temps: '#e06060',
  auxiliaire: '#CC4444',
  déclinaison: '#e07752',
  genre: '#d64f8f',
  nombre: '#c94477',
  accord: '#d94d9a',
  ordre: '#b95de0',
  position_verbe: '#9f4dd0',
  subordonnée: '#8a40c0',
  préposition: '#55c4e0',
  cas_prépositionnel: '#3db0cc',
  choix_mot: '#e09955',
  faux_ami: '#e08844',
  collocation: '#d07840',
  registre: '#c07038',
  orthographe: '#5588e0',
  majuscule: '#4477cc',
  ponctuation: '#3366bb',
  verbe_séparable: '#4ab870',
  infinitif_zu: '#3da060',
  modalverbe: '#339050',
  autre: '#888888',
};

function buildRows(data, t) {
  const entries = Object.entries(data || {})
    .filter(([, v]) => Number(v) > 0)
    .map(([typeKey, count]) => {
      const n = Number(count);
      return {
        typeKey,
        name: t(`errorCard.errorTypes.${typeKey}`) || typeKey.replace(/_/g, ' '),
        count: n,
        color: ERROR_TYPE_COLORS[typeKey] || '#9a9aaf',
      };
    })
    .sort((a, b) => b.count - a.count);

  const total = entries.reduce((s, e) => s + e.count, 0);
  return entries.map((e) => ({
    ...e,
    percent: total > 0 ? Math.round((e.count / total) * 1000) / 10 : 0,
  }));
}

function buildPieSlices(rows, othersLabel, maxSlices = 8) {
  if (rows.length === 0) return [];
  if (rows.length <= maxSlices) {
    return rows.map((r) => ({ name: r.name, value: r.count, color: r.color }));
  }
  const top = rows.slice(0, maxSlices);
  const rest = rows.slice(maxSlices).reduce((s, r) => s + r.count, 0);
  return [
    ...top.map((r) => ({ name: r.name, value: r.count, color: r.color })),
    { name: othersLabel, value: rest, color: '#5c5c6b', isOther: true },
  ];
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const total = payload[0].payload?.total ?? 0;
  const val = p.value;
  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
  return (
    <div
      className="rounded-lg border border-var(--color-border) bg-white px-3 py-2 text-sm shadow-xl"
      style={{ fontFamily: 'JetBrains Mono, monospace' }}
    >
      <p className="font-medium text-text-primary">{p.payload.isOther ? p.payload.tName : p.name}</p>
      <p className="mt-0.5 text-primary" style={{ color: 'var(--color-primary)' }}>
        {val} {val !== 1 ? p.payload.tErrorsPlural : p.payload.tErrorSingular} · {pct}%
      </p>
    </div>
  );
}

export default function ErrorTypeChart({ data }) {
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const rows = buildRows(data, t);
  const totalErrors = rows.reduce((s, r) => s + r.count, 0);
  const pieData = buildPieSlices(rows, t('stats.others')).map((d) => ({ 
    ...d, 
    total: totalErrors,
    tName: t('stats.others'),
    tErrorSingular: t('stats.errorSingular'),
    tErrorsPlural: t('stats.errorsPlural')
  }));

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
        <PieChartIcon className="h-10 w-10 text-[#2a2a36]" strokeWidth={1.25} />
        <p className="text-sm text-[#6b6b7a]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {t('stats.noErrorTypes')}
        </p>
      </div>
    );
  }

  const top = rows[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Summary strip */}
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
        <div className="rounded-xl border border-var(--color-border) bg-var(--color-bg-sidebar) px-3 py-2.5">
          <p className="text-[14px] uppercase tracking-normal sm:tracking-wider text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {t('stats.totalErrorsLabel')}
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {totalErrors}
          </p>
        </div>
        <div className="rounded-xl border border-var(--color-border) bg-var(--color-bg-sidebar) px-3 py-2.5">
          <p className="text-[14px] uppercase tracking-normal sm:tracking-wider text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {t('stats.activeTypesLabel')}
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {rows.length}
          </p>
        </div>
        <div className="rounded-xl border border-[rgba(156,123,172,0.25)] bg-[rgba(156,123,172,0.06)] px-3 py-2.5 sm:col-span-1">
          <p className="text-[14px] uppercase tracking-normal sm:tracking-wider text-primary" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-primary)' }}>
            {t('stats.mostFrequentLabel')}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-text-primary" title={top.name}>
            {top.name}
          </p>
          <p className="font-mono text-sm text-text-secondary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {top.count} ({top.percent}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Ranked list + bars */}
        <div className="min-h-0 lg:col-span-3">
          <p
            className="mb-3 text-[14px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-text-muted"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {t('stats.ranking')}
          </p>
          <ul className="max-h-[min(420px,55vh)] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] lg:max-h-[380px]">
            {rows.map((row, i) => (
              <li key={row.typeKey} className="rounded-lg border border-var(--color-border) bg-var(--color-bg-sidebar) px-3 py-2.5">
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 w-5 shrink-0 text-right text-[14px] tabular-nums text-text-muted"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color, boxShadow: `0 0 8px ${row.color}55` }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium text-text-primary">{row.name}</span>
                      <span
                        className="shrink-0 text-sm tabular-nums text-text-secondary"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {row.count}
                        <span className="text-text-muted"> · </span>
                        {row.percent}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full transition-[width] duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, row.percent)}%`,
                          backgroundColor: row.color,
                          opacity: 0.92,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Donut */}
        <div className="flex flex-col items-center justify-start lg:col-span-2">
          <p
            className="mb-2 w-full text-[14px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-text-muted lg:text-center"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {t('stats.distribution')}
          </p>
          <div className="relative mx-auto w-full max-w-[280px]" style={{ height: '240px', minHeight: '240px' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={240} debounce={50}>
                <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
              </ResponsiveContainer>
            )}
            <div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              style={{ marginTop: -8 }}
            >
              <span className="font-mono text-2xl font-bold tabular-nums text-text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {totalErrors}
              </span>
              <span className="text-[13px] uppercase tracking-wider text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {t('stats.errorsSuffix')}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
