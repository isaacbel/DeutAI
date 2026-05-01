'use client';
import ResultCards from '@/components/Analyzer/ResultCards';

export default function NotebookResults({ result, onReset }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gold">📓</span>
          <span className="text-xs font-mono text-gold tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            RÉSULTATS NOTEBOOK
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-mono text-text-muted hover:text-gold transition-colors"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          + Nouvelle analyse
        </button>
      </div>

      {result.input && (
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
          <p className="text-[10px] font-mono text-text-muted mb-1 tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            TEXTE ANALYSÉ
          </p>
          <p className="text-sm text-text-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
            {result.input}
          </p>
        </div>
      )}

      <ResultCards result={result} />
    </div>
  );
}
