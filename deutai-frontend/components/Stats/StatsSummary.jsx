'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, Gauge } from 'lucide-react';

export default function StatsSummary({ stats }) {
  const { totalAnalyses = 0, totalErrors = 0, errorRate = 0 } = stats || {};

  const items = [
    { label: 'Analyses', value: totalAnalyses, icon: Activity, tone: 'text-[#7dd3fc]' },
    { label: 'Erreurs', value: totalErrors, icon: AlertTriangle, tone: 'text-[#fda4af]' },
    {
      label: 'Taux d erreur',
      value: `${Math.round(errorRate)}%`,
      icon: Gauge,
      highlight: errorRate > 70,
      tone: errorRate > 70 ? 'text-[#f87171]' : 'text-[#fcd34d]',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map(item => (
        <Card key={item.label} className={item.highlight ? 'border-[#5a2323]' : ''}>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <Badge>{item.label}</Badge>
              <item.icon size={16} className={item.tone} />
            </div>
            <p className={`font-mono text-3xl font-bold tracking-tight ${item.tone}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
