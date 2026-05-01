'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs font-mono"
        style={{ fontFamily: 'JetBrains Mono, monospace', background: '#111', border: '1px solid #2a2a2a', color: '#D4AF37' }}
      >
        <p className="text-text-muted">{label}</p>
        <p>{payload[0].value} analyse{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export default function EvolutionChart({ data }) {
  const chartData = (data || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    count: d.count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs font-mono text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Aucune donnée disponible
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
        <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#666', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#666', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={20}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#D4AF37"
          strokeWidth={2}
          dot={{ fill: '#D4AF37', r: 3, strokeWidth: 0 }}
          activeDot={{ fill: '#fff', r: 4, stroke: '#D4AF37', strokeWidth: 2 }}
          style={{ filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.4))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
