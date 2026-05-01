'use client';
import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import AppShell from '@/components/Layout/AppShell';
import StatsSummary from '@/components/Stats/StatsSummary';
import ErrorTypeChart from '@/components/Stats/ErrorTypeChart';
import EvolutionChart from '@/components/Stats/EvolutionChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStandalone } from '@/lib/auth';
import { getStats } from '@/lib/api';

const PERIOD_OPTIONS = [
  { key: '30d', label: '30 jours' },
  { key: '3m', label: '3 mois' },
  { key: '6m', label: '6 mois' },
  { key: '1y', label: '1 an' },
];

export default function StatsPage() {
  const { loading: authLoading } = useAuthStandalone();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (!authLoading) loadStats(period);
  }, [authLoading, period]);

  async function loadStats(selectedPeriod = period) {
    setError('');
    setLoading(true);
    try {
      const res = await getStats(selectedPeriod);
      if (!res.ok) {
        setError('Impossible de charger les statistiques.');
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch {
      setError('Erreur reseau. Verifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  const hasData = stats && (stats.totalAnalyses > 0 || Object.values(stats.errorsByType || {}).some(v => v > 0));

  return (
    <AppShell>
      <div className="relative min-h-screen bg-[#08080a]">
        <div className="pointer-events-none absolute inset-0 grid-scan-bg opacity-10" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[70%] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="border-[#453a16] bg-[#171306] text-[#d6b354]">Dashboard</Badge>
                <Badge>{PERIOD_OPTIONS.find((opt) => opt.key === period)?.label || '30 jours'}</Badge>
              </div>
              <h1 className="font-mono text-xl font-bold tracking-[0.18em] text-[#f3f4fa]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                STATISTIQUES
              </h1>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#7d7d8f]">Performance et erreurs de vos analyses</p>
            </div>
            <BarChart3 className="hidden text-[#d4af37] sm:block" size={28} />
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                {PERIOD_OPTIONS.map((option) => {
                  const active = option.key === period;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setPeriod(option.key)}
                      className={`rounded-md px-3 py-1.5 text-xs transition ${
                        active
                          ? 'border border-[#6f5a1f] bg-[#201a0c] text-[#e5c266]'
                          : 'border border-transparent bg-[#111118] text-[#8f8fa0] hover:border-[#2d2d38] hover:text-[#d7d7e3]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-[#4d2222] bg-[#170d0d]">
              <CardContent className="flex items-center justify-between p-4">
                <p className="text-sm text-[#f08e8e]">⚠ {error}</p>
                <Button onClick={loadStats} className="gap-2">
                  <RefreshCw size={14} />
                  Reessayer
                </Button>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl shimmer" />)}
              </div>
              <div className="h-72 rounded-xl shimmer" />
              <div className="h-64 rounded-xl shimmer" />
            </div>
          ) : !hasData ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <Sparkles size={36} className="text-[#d4af37]" />
                <p className="font-mono text-sm text-[#d2d2df]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Aucune analyse effectuee pour l instant
                </p>
                <p className="text-sm text-[#8c8c98]">Analysez une phrase pour generer votre dashboard.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <StatsSummary stats={stats} />

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <Card className="xl:col-span-3">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>Erreurs par type</CardTitle>
                        <CardDescription>Methode Kleppin - repartition complete</CardDescription>
                      </div>
                      <Badge>Types</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ErrorTypeChart data={stats.errorsByType} />
                  </CardContent>
                </Card>

                <Card className="xl:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>Evolution</CardTitle>
                        <CardDescription>Activite sur la periode selectionnee</CardDescription>
                      </div>
                      <TrendingUp size={18} className="text-[#d4af37]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <EvolutionChart data={stats.evolution} />
                  </CardContent>
                </Card>
              </div>

              {stats.mostCommonError && (
                <Card className="border-[#413716] bg-[#131107]">
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="text-gold">⊕</span>
                    <div className="min-w-0">
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8f8f9f]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        Erreur la plus frequente
                      </p>
                      <p className="truncate text-base font-medium text-gold">
                        {stats.mostCommonError}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
