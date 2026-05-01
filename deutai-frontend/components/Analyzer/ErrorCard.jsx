'use client';
import { ShieldAlert, CheckCircle2, Tag, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ERROR_TYPE_LABELS = {
  // Grammar & Morphology
  conjugaison:        'CONJUGAISON',
  temps:              'TEMPS VERBAL',
  auxiliaire:         'AUXILIAIRE',
  déclinaison:        'DÉCLINAISON',
  genre:              'GENRE',
  nombre:             'NOMBRE',
  accord:             'ACCORD',
  // Syntax
  ordre:              'ORDRE DES MOTS',
  position_verbe:     'POSITION VERBE',
  subordonnée:        'SUBORDONNÉE',
  // Prepositions
  préposition:        'PRÉPOSITION',
  cas_prépositionnel: 'CAS PRÉP.',
  // Vocabulary
  choix_mot:          'CHOIX DU MOT',
  faux_ami:           'FAUX AMI',
  collocation:        'COLLOCATION',
  registre:           'REGISTRE',
  // Writing
  orthographe:        'ORTHOGRAPHE',
  majuscule:          'MAJUSCULE',
  ponctuation:        'PONCTUATION',
  // German-specific
  verbe_séparable:    'VERBE SÉPARABLE',
  infinitif_zu:       'INFINITIF + ZU',
  modalverbe:         'VERBE MODAL',
  // Other
  autre:              'AUTRE',
  aucun:              'AUCUNE ERREUR',
};

const ERROR_TYPE_COLORS = {
  // Grammar (red family)
  conjugaison:        '#e05252',
  temps:              '#e06060',
  auxiliaire:         '#CC4444',
  déclinaison:        '#e07752',
  genre:              '#d64f8f',
  nombre:             '#c94477',
  accord:             '#d94d9a',
  // Syntax (purple family)
  ordre:              '#b95de0',
  position_verbe:     '#9f4dd0',
  subordonnée:        '#8a40c0',
  // Prepositions (teal family)
  préposition:        '#55c4e0',
  cas_prépositionnel: '#3db0cc',
  // Vocabulary (orange family)
  choix_mot:          '#e09955',
  faux_ami:           '#e08844',
  collocation:        '#d07840',
  registre:           '#c07038',
  // Writing (blue family)
  orthographe:        '#5588e0',
  majuscule:          '#4477cc',
  ponctuation:        '#3366bb',
  // German-specific (green family)
  verbe_séparable:    '#4ab870',
  infinitif_zu:       '#3da060',
  modalverbe:         '#339050',
  // Other
  autre:              '#888888',
  aucun:              '#4A9A4A',
};

const SEVERITY_CONFIG = {
  high:   { icon: AlertTriangle, color: '#e05252', label: 'CRITIQUE' },
  medium: { icon: AlertCircle,   color: '#e09955', label: 'IMPORTANT' },
  low:    { icon: Info,          color: '#5588e0', label: 'MINEUR' },
};

function SingleErrorCard({ error, index, originalSentence }) {
  const typeColor = ERROR_TYPE_COLORS[error.errorType] || '#CC5555';
  const typeLabel = ERROR_TYPE_LABELS[error.errorType] || (error.errorType?.toUpperCase() ?? 'ERREUR');
  const severity = SEVERITY_CONFIG[error.severity] || SEVERITY_CONFIG.medium;
  const SeverityIcon = severity.icon;

  // Highlight the error in the original sentence
  const renderHighlightedSentence = () => {
    if (!originalSentence || !error.errorText) {
      return <span style={{ color: '#999' }}>{originalSentence || error.errorText}</span>;
    }
    const idx = originalSentence.indexOf(error.errorText);
    if (idx === -1) return <span style={{ color: '#999' }}>{originalSentence}</span>;
    return (
      <>
        <span style={{ color: '#666' }}>{originalSentence.slice(0, idx)}</span>
        <span style={{
          color: typeColor,
          background: `${typeColor}15`,
          borderRadius: '3px',
          padding: '0 2px',
          textDecoration: 'underline wavy',
          textDecorationColor: typeColor,
          fontWeight: 600,
        }}>
          {error.errorText}
        </span>
        <span style={{ color: '#666' }}>{originalSentence.slice(idx + error.errorText.length)}</span>
      </>
    );
  };

  return (
    <div
      style={{
        background: 'rgba(26,10,10,0.9)',
        border: `1px solid ${typeColor}30`,
        borderRadius: '12px',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '3px', borderRadius: '12px 0 0 12px',
        background: typeColor, opacity: 0.8,
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingLeft: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Error number */}
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: `${typeColor}20`, border: `1px solid ${typeColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
            fontWeight: 700, color: typeColor, flexShrink: 0,
          }}>
            {index + 1}
          </div>
          {/* Type badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
            padding: '2px 8px', borderRadius: '4px',
            background: `${typeColor}10`, border: `1px solid ${typeColor}30`,
            color: typeColor, letterSpacing: '1px',
          }}>
            <Tag size={8} />
            {typeLabel}
          </div>
        </div>

        {/* Severity */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
          color: severity.color, letterSpacing: '1px',
        }}>
          <SeverityIcon size={10} />
          {severity.label}
        </div>
      </div>

      {/* Highlighted sentence */}
      <div style={{
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.04)',
        marginBottom: '10px',
        fontSize: '13px',
        lineHeight: '1.7',
        fontFamily: 'Inter, sans-serif',
      }}>
        {renderHighlightedSentence()}
      </div>

      {/* Correction row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#555', width: '36px', flexShrink: 0 }}>CORR:</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#D4AF37', fontWeight: 600 }}>
          {error.correction}
        </span>
      </div>

      {/* Suggestions */}
      {error.suggestions?.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingLeft: '44px', marginBottom: '4px' }}>
          {error.suggestions.map((s, i) => (
            <span key={i} style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
              padding: '2px 7px', borderRadius: '4px',
              background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)',
              color: '#9a8030', letterSpacing: '0.5px',
            }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ErrorCard({ result }) {
  const { hasErrors, hasError, errors = [], originalSentence, input } = result;
  const hasAnyError = hasErrors ?? hasError ?? false;
  const sentence = originalSentence || input || '';

  /* ── Phrase correcte ── */
  if (!hasAnyError || errors.length === 0) {
    return (
      <div
        className="rounded-xl p-5 relative overflow-hidden group"
        style={{ background: 'rgba(5,15,5,0.8)', border: '1px solid rgba(74,154,74,0.25)' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A9A4A] opacity-60 group-hover:opacity-100 transition-opacity rounded-l-xl" />
        <div className="absolute inset-0 bg-[#4A9A4A]/3 pointer-events-none" />
        <div className="flex items-center gap-3 mb-2.5">
          <div className="p-1.5 rounded-lg bg-[#4A9A4A]/10 border border-[#4A9A4A]/20">
            <CheckCircle2 size={16} className="text-[#4A9A4A]" />
          </div>
          <span
            className="text-[11px] font-mono tracking-[0.2em] text-[#4A9A4A] font-bold"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            AUCUNE ERREUR DÉTECTÉE
          </span>
        </div>
        <p className="text-sm text-text-muted leading-relaxed pl-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          La phrase est grammaticalement correcte.
        </p>
        {sentence && (
          <p className="text-sm mt-3 pl-0.5" style={{ fontFamily: 'Inter, sans-serif', color: '#4A9A4A', fontStyle: 'italic' }}>
            "{sentence}"
          </p>
        )}
      </div>
    );
  }

  /* ── Erreurs détectées ── */
  return (
    <div className="flex flex-col gap-3">
      {/* Header summary */}
      <div
        className="rounded-xl p-4 relative overflow-hidden"
        style={{ background: 'rgba(26,10,10,0.9)', border: '1px solid rgba(204,85,85,0.25)' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-error opacity-70" />
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-error/10 border border-error/20">
              <ShieldAlert size={16} className="text-error" />
            </div>
            <span
              className="text-[11px] font-mono tracking-[0.2em] text-error font-bold"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {errors.length} ERREUR{errors.length > 1 ? 'S' : ''} DÉTECTÉE{errors.length > 1 ? 'S' : ''}
            </span>
          </div>
          {/* Error count bubbles by severity */}
          <div className="flex items-center gap-2">
            {['high', 'medium', 'low'].map(sev => {
              const count = errors.filter(e => e.severity === sev).length;
              if (!count) return null;
              const cfg = SEVERITY_CONFIG[sev];
              return (
                <span key={sev} style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
                  padding: '2px 7px', borderRadius: '4px',
                  background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`,
                  color: cfg.color,
                }}>
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual error cards */}
      {errors.map((error, i) => (
        <SingleErrorCard
          key={i}
          index={i}
          error={error}
          originalSentence={sentence}
        />
      ))}
    </div>
  );
}
