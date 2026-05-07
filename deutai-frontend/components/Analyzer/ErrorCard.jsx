'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Tag, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

// Error type keys — labels now come from t() at render time
const ERROR_TYPE_KEYS = [
  'conjugaison', 'temps', 'auxiliaire', 'déclinaison', 'genre', 'nombre', 'accord',
  'ordre', 'position_verbe', 'subordonnée', 'préposition', 'cas_prépositionnel',
  'choix_mot', 'faux_ami', 'collocation', 'registre', 'orthographe', 'majuscule',
  'ponctuation', 'verbe_séparable', 'infinitif_zu', 'modalverbe', 'autre', 'aucun',
];

const ERROR_TYPE_COLORS = {
  conjugaison:        '#e05252',
  temps:              '#e06060',
  auxiliaire:         '#CC4444',
  déclinaison:        '#e07752',
  genre:              '#d64f8f',
  nombre:             '#c94477',
  accord:             '#d94d9a',
  ordre:              '#b95de0',
  position_verbe:     '#9f4dd0',
  subordonnée:        '#8a40c0',
  préposition:        '#55c4e0',
  cas_prépositionnel: '#3db0cc',
  choix_mot:          '#e09955',
  faux_ami:           '#e08844',
  collocation:        '#d07840',
  registre:           '#c07038',
  orthographe:        '#5588e0',
  majuscule:          '#4477cc',
  ponctuation:        '#3366bb',
  verbe_séparable:    '#4ab870',
  infinitif_zu:       '#3da060',
  modalverbe:         '#339050',
  autre:              '#888888',
  aucun:              '#4A9A4A',
};

function SingleErrorCard({ error, index, originalSentence, t }) {
  const typeColor = ERROR_TYPE_COLORS[error.errorType] || '#CC5555';
  const typeLabel = t(`errorCard.errorTypes.${error.errorType}`) || (error.errorType?.toUpperCase() ?? t('errorCard.noError'));

  const severityConfig = {
    high:   { icon: AlertTriangle, color: '#FF5050', label: t('errorCard.critical') },
    medium: { icon: AlertCircle,   color: '#F5A623', label: t('errorCard.important') },
    low:    { icon: Info,          color: '#60A5FA', label: t('errorCard.minor') },
  };
  const severity = severityConfig[error.severity] || severityConfig.medium;
  const SeverityIcon = severity.icon;

  const renderHighlightedSentence = () => {
    if (!originalSentence || !error.errorText) {
      return <span style={{ color: '#999' }}>{originalSentence || error.errorText}</span>;
    }
    const idx = originalSentence.indexOf(error.errorText);
    if (idx === -1) return <span style={{ color: '#999' }}>{originalSentence}</span>;
    return (
      <>
        <span style={{ color: '#aaa' }}>{originalSentence.slice(0, idx)}</span>
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
        <span style={{ color: '#aaa' }}>{originalSentence.slice(idx + error.errorText.length)}</span>
      </>
    );
  };

  return (
    <div
      style={{
        background: 'rgba(30,10,10,0.95)',
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
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: `${typeColor}20`, border: `1px solid ${typeColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
            fontWeight: 700, color: typeColor, flexShrink: 0,
          }}>
            {index + 1}
          </div>
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
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#4ADE80', fontWeight: 700 }}>
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
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
              color: '#4ADE80', letterSpacing: '0.5px',
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
  const { t } = useLanguage();
  const { hasErrors, hasError, errors = [], originalSentence, input } = result;
  const hasAnyError = hasErrors ?? hasError ?? false;
  const sentence = originalSentence || input || '';

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
            {t('errorCard.noError').toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-text-muted leading-relaxed pl-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          {t('errorCard.noErrorMessage')}
        </p>
        {sentence && (
          <p className="text-sm mt-3 pl-0.5" style={{ fontFamily: 'Inter, sans-serif', color: '#4A9A4A', fontStyle: 'italic' }}>
            &ldquo;{sentence}&rdquo;
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header summary */}
      <div
        className="rounded-xl p-4 relative overflow-hidden"
        style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(255,107,107,0.3)' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-80" style={{ background: '#FF5050' }} />
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)' }}>
              <ShieldAlert size={16} style={{ color: '#FF5050' }} />
            </div>
            <span
              className="text-[11px] font-mono tracking-[0.2em] font-bold"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FF5050' }}
            >
              {t(errors.length > 1 ? 'errorCard.errorsDetected_other' : 'errorCard.errorsDetected_one', { count: errors.length }).toUpperCase()}
            </span>
          </div>
          {/* Error count bubbles by severity */}
          <div className="flex items-center gap-2">
            {['high', 'medium', 'low'].map(sev => {
              const count = errors.filter(e => e.severity === sev).length;
              if (!count) return null;
              const severityConfig = {
                high:   { color: '#FF5050', label: t('errorCard.critical') },
                medium: { color: '#F5A623', label: t('errorCard.important') },
                low:    { color: '#60A5FA', label: t('errorCard.minor') },
              };
              const cfg = severityConfig[sev];
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
          t={t}
        />
      ))}
    </div>
  );
}
