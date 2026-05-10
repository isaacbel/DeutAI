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

const renderSentenceWithHighlights = (text, words, highlightColor) => {
  if (!text || !words || words.length === 0) return <span style={{ color: '#999' }}>{text}</span>;

  const validWords = words.filter(Boolean);
  if (validWords.length === 0) return <span style={{ color: '#999' }}>{text}</span>;

  const escapedWords = validWords
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, idx) => {
        const isMatch = validWords.some(w => w.toLowerCase() === part.toLowerCase());
        if (!isMatch) return <span key={idx} style={{ color: '#aaa' }}>{part}</span>;
        return (
          <span key={idx} style={{
            color: highlightColor,
            background: `${highlightColor}15`,
            borderRadius: '4px',
            padding: '2px 4px',
            textDecoration: 'underline wavy',
            textDecorationColor: highlightColor,
            fontWeight: 700,
          }}>
            {part}
          </span>
        );
      })}
    </>
  );
};

function GroupedErrorCard({ errorType, groupErrors, originalSentence, correctedSentence, t, lang }) {
  const isRtl = lang === 'ar';
  const typeColor = ERROR_TYPE_COLORS[errorType] || '#CC5555';
  const typeLabel = t(`errorCard.errorTypes.${errorType}`) || (errorType?.toUpperCase() ?? t('errorCard.noError'));

  const errorWords = groupErrors.map(e => e.errorText).filter(Boolean);
  const correctionWords = groupErrors.map(e => e.correction).filter(Boolean);

  const allSuggestions = [];
  groupErrors.forEach(e => {
    if (e.suggestions) {
      allSuggestions.push(...e.suggestions);
    }
  });
  const uniqueSuggestions = Array.from(new Set(allSuggestions));

  return (
    <div
      style={{
        background: 'rgba(30,10,10,0.95)',
        border: `1px solid ${typeColor}30`,
        borderRadius: '16px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '4px', borderRadius: '16px 0 0 16px',
        background: typeColor, opacity: 0.8,
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingLeft: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '14px',
          padding: '6px 14px', borderRadius: '8px',
          background: `${typeColor}15`, border: `1px solid ${typeColor}40`,
          color: typeColor, letterSpacing: '1px', fontWeight: 700
        }}>
          <Tag size={16} />
          {typeLabel.toUpperCase()}
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: '14px',
          color: '#888', fontWeight: 500
        }}>
          {groupErrors.length} {t(groupErrors.length > 1 ? 'errorCard.errorsDetected_other' : 'errorCard.errorsDetected_one', { count: groupErrors.length })}
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 pl-2">
        {/* Original Sentence */}
        {originalSentence && (
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#FF6B6B', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('errorCard.before')}
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(255,107,107,0.06)',
              border: '1px solid rgba(255,107,107,0.15)',
              fontSize: '16px',
              lineHeight: '1.8',
              fontFamily: 'Inter, sans-serif',
              textAlign: isRtl ? 'left' : undefined,
              height: '100%'
            }} dir="ltr" lang="de">
              {renderSentenceWithHighlights(originalSentence, errorWords, '#FF6B6B')}
            </div>
          </div>
        )}

        {/* Corrected Sentence */}
        {correctedSentence && (
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#4ADE80', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('errorCard.after')}
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(74,222,128,0.06)',
              border: '1px solid rgba(74,222,128,0.15)',
              fontSize: '16px',
              lineHeight: '1.8',
              fontFamily: 'Inter, sans-serif',
              textAlign: isRtl ? 'left' : undefined,
              height: '100%'
            }} dir="ltr" lang="de">
              {renderSentenceWithHighlights(correctedSentence, correctionWords, '#4ADE80')}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {uniqueSuggestions.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingLeft: '8px', marginTop: '16px' }}>
          {uniqueSuggestions.map((s, i) => (
            <span key={i} style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
              padding: '6px 14px', borderRadius: '8px',
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
              color: '#4ADE80', letterSpacing: '0.5px', fontWeight: 600
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
  const { t, lang } = useLanguage();
  const { hasErrors, hasError, errors = [], originalSentence, input, correctedSentence, correction } = result;
  const hasAnyError = hasErrors ?? hasError ?? false;
  const sentence = originalSentence || input || '';
  const finalCorrection = correctedSentence || correction || '';

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

  // Group errors by errorType
  const groupedErrors = errors.reduce((acc, err) => {
    const type = err.errorType || 'autre';
    if (!acc[type]) acc[type] = [];
    acc[type].push(err);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      {/* Header summary */}
      <div
        className="rounded-xl p-4 relative overflow-hidden"
        style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(255,107,107,0.3)' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-80" style={{ background: '#FF5050' }} />
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)' }}>
              <ShieldAlert size={20} style={{ color: '#FF5050' }} />
            </div>
            <span
              className="text-sm font-mono tracking-[0.15em] font-bold"
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
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                  padding: '4px 10px', borderRadius: '6px',
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

      {/* Render a GroupedErrorCard for each error type */}
      {Object.entries(groupedErrors).map(([type, group]) => (
        <GroupedErrorCard
          key={type}
          errorType={type}
          groupErrors={group}
          originalSentence={sentence}
          correctedSentence={finalCorrection}
          t={t}
          lang={lang}
        />
      ))}
    </div>
  );
}
