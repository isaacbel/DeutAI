'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Full error type label map (matches backend taxonomy)
const ERROR_LABELS = {
  // Grammar & Morphology
  conjugaison:        'Conjugaison',
  temps:              'Temps verbal',
  auxiliaire:         'Auxiliaire',
  déclinaison:        'Déclinaison',
  genre:              'Genre',
  nombre:             'Nombre',
  accord:             'Accord',
  // Syntax
  ordre:              'Ordre des mots',
  position_verbe:     'Position du verbe',
  subordonnée:        'Subordonnée',
  // Prepositions
  préposition:        'Préposition',
  cas_prépositionnel: 'Cas prépositionnel',
  // Vocabulary
  choix_mot:          'Choix du mot',
  faux_ami:           'Faux ami',
  collocation:        'Collocation',
  registre:           'Registre',
  // Writing
  orthographe:        'Orthographe',
  majuscule:          'Majuscule',
  ponctuation:        'Ponctuation',
  // German-specific
  verbe_séparable:    'Verbe séparable',
  infinitif_zu:       'Infinitif + zu',
  modalverbe:         'Verbe modal',
  // Other
  autre:              'Autre',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs font-mono"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          background: '#111',
          border: '1px solid #2a2a2a',
          color: '#D4AF37',
        }}
      >
        {payload[0].value} erreur{payload[0].value !== 1 ? 's' : ''}
      </div>
    );
  }
  return null;
};

export default function ErrorTypeChart({ data }) {
  const chartData = Object.entries(data || {})
    .filter(([, v]) => v > 0)
    .map(([type, count]) => ({
      type: ERROR_LABELS[type] || type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs font-mono text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Aucune donnée disponible
        </p>
      </div>
    );
  }

  // Dynamic height based on number of entries
  const chartHeight = Math.max(200, chartData.length * 28 + 20);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 110, right: 20, top: 8, bottom: 8 }}>
        <XAxis type="number" tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="type"
          tick={{ fill: '#aaa', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          width={106}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
          {chartData.map((_, i) => (
            <Cell
              key={i}
              fill="#D4AF37"
              fillOpacity={1 - i * 0.06}
              style={{ filter: i === 0 ? 'drop-shadow(0 0 6px rgba(212,175,55,0.5))' : undefined }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
