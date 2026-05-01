'use client';

export default function OcrConfirmation({ text, onChange, confidence, onConfirm, onRetake, loading }) {
  const isLowConfidence = confidence === 'low';

  return (
    <div className="flex flex-col gap-4">
      {/* Confidence indicator */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-mono tracking-wider px-2 py-1 rounded"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: isLowConfidence ? '#1A0A0A' : confidence === 'medium' ? 'rgba(212,175,55,0.08)' : 'rgba(74,154,74,0.1)',
            border: `1px solid ${isLowConfidence ? '#3A1A1A' : confidence === 'medium' ? 'rgba(212,175,55,0.3)' : 'rgba(74,154,74,0.3)'}`,
            color: isLowConfidence ? '#CC5555' : confidence === 'medium' ? '#D4AF37' : '#4A9A4A',
          }}
        >
          OCR {confidence?.toUpperCase() || 'MEDIUM'} CONFIANCE
        </span>
      </div>

      {/* Low confidence warning */}
      {isLowConfidence && (
        <div
          className="px-4 py-3 rounded-lg text-sm text-error flex items-start gap-2"
          style={{ background: '#1A0A0A', border: '1px solid #3A1A1A', animation: 'fadeIn 0.3s ease-out' }}
        >
          <span>⚠</span>
          <span>Texte peu lisible — vérifiez bien le texte avant de valider. Vous pouvez le corriger directement ci-dessous.</span>
        </div>
      )}

      {/* Extracted text editable area */}
      <div>
        <label className="block text-[11px] font-mono text-text-muted mb-2 tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          TEXTE EXTRAIT — VÉRIFIEZ ET CORRIGEZ SI NÉCESSAIRE
        </label>
        <textarea
          value={text}
          onChange={e => onChange(e.target.value)}
          rows={6}
          className="input-dark px-4 py-3 text-sm resize-none w-full"
          style={{ fontFamily: 'Inter, sans-serif' }}
          placeholder="Texte extrait par OCR..."
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onConfirm}
          disabled={loading || !text.trim()}
          className="btn-gold w-full py-3 text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              ANALYSE EN COURS...
            </span>
          ) : (
            '→ VALIDER ET ANALYSER'
          )}
        </button>
        <button
          onClick={onRetake}
          disabled={loading}
          className="btn-outline w-full py-3 text-sm"
        >
          ↺ Reprendre une photo
        </button>
      </div>
    </div>
  );
}
