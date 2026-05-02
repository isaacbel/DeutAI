'use client';

export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span
          className="font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: '#8a90a8' }}
        >
          Progression
        </span>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: '#c9a227' }}>
          {current}/{total}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #c9a227, #f1d98d)',
            boxShadow: '0 0 12px rgba(201,162,39,0.35)',
          }}
        />
      </div>
    </div>
  );
}
