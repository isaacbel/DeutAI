'use client';
import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import AppShell from '@/components/Layout/AppShell';
import StatsSummary from '@/components/Stats/StatsSummary';
import ErrorTypeChart from '@/components/Stats/ErrorTypeChart';
import EvolutionChart from '@/components/Stats/EvolutionChart';
import { useAuthStandalone } from '@/lib/auth';
import { getStats } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function PeriodSelector({ period, onChange, t }) {
  const PERIOD_OPTIONS = [
    { key: '30d', label: t('stats.period30d') },
    { key: '3m',  label: t('stats.period3m')  },
    { key: '6m',  label: t('stats.period6m')  },
    { key: '1y',  label: t('stats.period1y')  },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-3 rounded-xl mb-4"
      style={{ background: 'white', border: '1px solid var(--color-border)' }}
    >
      {PERIOD_OPTIONS.map(opt => {
        const active = opt.key === period;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className="px-3.5 py-[7px] rounded-lg text-[14px] transition-all"
            style={{
              background: active ? 'rgba(156,123,172,0.15)' : 'transparent',
              border: `1px solid ${active ? 'rgba(156,123,172,0.5)' : 'transparent'}`,
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.color='var(--color-text-primary)'; e.currentTarget.style.borderColor='var(--color-border)'; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.color='var(--color-text-muted)'; e.currentTarget.style.borderColor='transparent'; }}}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Skeleton({ h = 'h-72' }) {
  return (
    <div
      className={`${h} rounded-xl`}
      style={{
        background: 'linear-gradient(90deg, #e8eef4 25%, #f0f5f9 50%, #e8eef4 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  );
}

export default function StatsPage() {
  const { t } = useLanguage();
  const { loading: authLoading } = useAuthStandalone();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30d');

  const PERIOD_OPTIONS = [
    { key: '30d', label: t('stats.period30d') },
    { key: '3m',  label: t('stats.period3m')  },
    { key: '6m',  label: t('stats.period6m')  },
    { key: '1y',  label: t('stats.period1y')  },
  ];

  useEffect(() => {
    if (!authLoading) loadStats(period);
  }, [authLoading, period]);

  async function loadStats(p = period) {
    setError('');
    setLoading(true);
    try {
      const res = await getStats(p);
      if (!res.ok) { setError(t('stats.errorLoadStats')); return; }
      setStats(await res.json());
    } catch {
      setError(t('stats.errorNetwork'));
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  const hasData = stats && (
    stats.totalAnalyses > 0 ||
    Object.values(stats.errorsByType || {}).some(v => v > 0)
  );

  return (
    <AppShell>
      <div className="relative min-h-screen" style={{ background: 'var(--color-bg-ice)' }}>

        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 30% at 50% 0%, rgba(156,123,172,0.07) 0%, transparent 60%)',
          }}
        />

        {/* ── Header ── */}
        <header
          className="sticky top-0 z-30 px-4 sm:px-6 py-4"
          style={{
            background: 'rgba(242,248,252,0.92)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[13px] font-semibold px-2.5 py-[4px] rounded-full tracking-[.12em] uppercase"
                  style={{ background: 'rgba(156,123,172,0.12)', border: '1px solid rgba(156,123,172,0.3)', color: 'var(--color-primary)' }}
                >
                  {t('stats.dashboard')}
                </span>
                <span
                  className="text-[13px] font-semibold px-2.5 py-[4px] rounded-full tracking-[.12em] uppercase"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  {PERIOD_OPTIONS.find(o => o.key === period)?.label}
                </span>
              </div>
              <h1
                className="text-[17px] font-bold tracking-[.18em]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t('stats.title')}
              </h1>
              <p className="text-[14px] uppercase tracking-[.22em] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('stats.subtitle')}
              </p>
            </div>
            <BarChart3 size={26} className="hidden sm:block opacity-70" style={{ color: 'var(--color-primary)' }} />
          </div>
        </header>

        {/* ── Content ── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col gap-4 relative z-10">

          {/* Bug fix: was calling setPeriod(p) AND loadStats(p), causing a double
              fetch. useEffect already watches [period] and triggers loadStats. */}
          <PeriodSelector period={period} onChange={setPeriod} t={t} />

          {/* Error state */}
          {error && (
            <div
              className="flex items-center justify-between p-4 rounded-xl text-[15px]"
              style={{ background: 'rgba(204,85,85,0.06)', border: '1px solid rgba(204,85,85,0.2)', color: 'var(--color-error)' }}
            >
              <span>⚠ {error}</span>
              <button
                onClick={() => loadStats()}
                className="flex items-center gap-1.5 text-[14px] px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                <RefreshCw size={13} />
                {t('stats.retry')}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} h="h-24" />
                ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3"><Skeleton h="h-80" /></div>
                <div className="xl:col-span-2"><Skeleton h="h-80" /></div>
              </div>
            </div>
          ) : !hasData ? (
            <div
              className="flex flex-col items-center justify-center gap-4 py-16 text-center rounded-xl"
              style={{ background: 'white', border: '1px solid var(--color-border)' }}
            >
              <Sparkles size={34} className="opacity-60" style={{ color: 'var(--color-primary)' }} />
              <p className="text-[15px]" style={{ color: 'var(--color-text-primary)' }}>
                {t('stats.noAnalysis')}
              </p>
              <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>{t('stats.startAnalysisPrompt')}</p>
            </div>
          ) : (
            <>
              <StatsSummary stats={stats} />

              {/* Charts */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">

                {/* Error type chart */}
                <div
                  className="xl:col-span-3 rounded-xl overflow-hidden"
                  style={{ background: 'white', border: '1px solid var(--color-border)' }}
                >
                  <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {t('stats.errorsByType')}
                      </p>
                      <p className="text-[13px] mt-0.5 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{t('stats.errorsByTypeMethod')}</p>
                    </div>
                    <span
                      className="text-[12px] font-semibold px-2.5 py-[4px] rounded-full tracking-[.12em] uppercase"
                      style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      {t('stats.typesLabel')}
                    </span>
                  </div>
                  <div className="p-5">
                    <ErrorTypeChart data={stats.errorsByType} />
                  </div>
                </div>

                {/* Evolution chart */}
                <div
                  className="xl:col-span-2 rounded-xl overflow-hidden"
                  style={{ background: 'white', border: '1px solid var(--color-border)' }}
                >
                  <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {t('stats.analysisActivity')}
                      </p>
                      <p className="text-[13px] mt-0.5 tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                        {t('stats.dailyVolume', { period: PERIOD_OPTIONS.find(o => o.key === period)?.label })}
                      </p>
                    </div>
                    <TrendingUp size={17} className="opacity-70 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div className="p-5">
                    <EvolutionChart data={stats.evolution} period={period} />
                  </div>
                </div>

              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes shimmer {
            0%   { background-position: -200% 0 }
            100% { background-position:  200% 0 }
          }
        `}</style>
      </div>
    </AppShell>
  );
}