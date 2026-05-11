'use client';
import { CheckCircle2, ShieldAlert, Tag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

// ─── Colors per error type ───────────────────────────────────────────────────
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

const SEVERITY_CONFIG = {
  high:   { color: '#FF5050', bg: 'rgba(255,80,80,0.08)',  border: 'rgba(255,80,80,0.2)' },
  medium: { color: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)' },
  low:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
};

// ─── Highlight specific words inside a sentence ──────────────────────────────
function HighlightedText({ text, words, highlightColor }) {
  if (!text) return null;
  if (!words || words.length === 0) {
    return <span style={{ color: '#bbb', fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '1.8' }}>{text}</span>;
  }

  const validWords = words.filter(Boolean).sort((a, b) => b.length - a.length);
  const escaped = validWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <span dir="ltr" lang="de" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '1.8', wordBreak: 'break-word' }}>
      {parts.map((part, idx) => {
        const isMatch = validWords.some(w => w.toLowerCase() === part.toLowerCase());
        if (!isMatch) return <span key={idx} style={{ color: '#bbb' }}>{part}</span>;
        return (
          <mark key={idx} style={{
            background: `${highlightColor}18`,
            color: highlightColor,
            borderRadius: '4px',
            padding: '1px 4px',
            textDecoration: 'underline wavy',
            textDecorationColor: highlightColor,
            WebkitTextDecorationColor: highlightColor,
            fontWeight: 700,
          }}>
            {part}
          </mark>
        );
      })}
    </span>
  );
}

// ─── One card per error type group ───────────────────────────────────────────
function GroupedErrorCard({ errorType, groupErrors, originalSentence, correctedSentence, t, lang }) {
  const isRtl     = lang === 'ar';
  const typeColor = ERROR_TYPE_COLORS[errorType] || '#CC5555';
  const typeLabel = t(`errorCard.errorTypes.${errorType}`) || errorType?.toUpperCase() || '';

  // Words to highlight in original (error words) and in corrected (correction words)
  const errorWords      = groupErrors.map(e => e.errorText).filter(Boolean);
  const correctionWords = groupErrors.map(e => e.correction).filter(Boolean);

  // Unique suggestions across all errors in this group
  const uniqueSuggestions = [...new Set(groupErrors.flatMap(e => e.suggestions || []))];

  // Top severity for this group
  const topSev = ['high', 'medium', 'low'].find(s => groupErrors.some(e => e.severity === s));
  const sevCfg = topSev ? SEVERITY_CONFIG[topSev] : null;
  const sevLabel = topSev === 'high' ? t('errorCard.critical') : topSev === 'medium' ? t('errorCard.important') : topSev === 'low' ? t('errorCard.minor') : '';

  return (
    <div style={{
      borderRadius: '14px',
      overflow: 'hidden',
      border: `1px solid ${typeColor}28`,
      background: 'rgba(20,12,12,0.95)',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        background: `${typeColor}0C`,
        borderBottom: `1px solid ${typeColor}20`,
        direction: isRtl ? 'rtl' : 'ltr',
      }}>
        {/* Color accent dot */}
        <span style={{
          width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
          background: typeColor, boxShadow: `0 0 8px ${typeColor}70`,
        }} />

        {/* Type name */}
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '15px',
          letterSpacing: '1.5px',
          fontWeight: 700,
          color: typeColor,
          textTransform: 'uppercase',
          flex: 1,
        }}>
          {typeLabel}
        </span>

        {/* Severity badge */}
        {sevCfg && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px',
            padding: '3px 10px',
            borderRadius: '6px',
            background: sevCfg.bg,
            border: `1px solid ${sevCfg.border}`,
            color: sevCfg.color,
            fontWeight: 600,
          }}>
            {sevLabel}
          </span>
        )}

        {/* Count badge (only if multiple errors of same type) */}
        {groupErrors.length > 1 && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px',
            padding: '3px 9px',
            borderRadius: '6px',
            background: `${typeColor}15`,
            border: `1px solid ${typeColor}35`,
            color: typeColor,
          }}>
            ×{groupErrors.length}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Before / After sentences — stack on mobile, 2-col on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Original */}
          <div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '15px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#FF6B6B',
              opacity: 0.85,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF6B6B', flexShrink: 0 }} />
              {t('errorCard.before')}
            </div>
            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(255,107,107,0.04)',
              border: '1px solid rgba(255,107,107,0.12)',
              minHeight: '60px',
            }}>
              <HighlightedText
                text={originalSentence}
                words={errorWords}
                highlightColor="#FF6B6B"
              />
            </div>
          </div>

          {/* Corrected */}
          <div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '15px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#4ADE80',
              opacity: 0.85,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', flexShrink: 0 }} />
              {t('errorCard.after')}
            </div>
            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(74,222,128,0.04)',
              border: '1px solid rgba(74,222,128,0.12)',
              minHeight: '60px',
            }}>
              <HighlightedText
                text={correctedSentence}
                words={correctionWords}
                highlightColor="#4ADE80"
              />
            </div>
          </div>
        </div>

        {/* Suggestions chips — below both texts */}
        {uniqueSuggestions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', direction: isRtl ? 'rtl' : 'ltr', marginTop: '20px' }}>
            {uniqueSuggestions.map((s, i) => (
              <span key={i} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '15px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(74,222,128,0.07)',
                border: '1px solid rgba(74,222,128,0.18)',
                color: '#4ADE80',
                fontWeight: 600,
              }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root component ──────────────────────────────────────────────────────────
export default function ErrorCard({ result }) {
  const { t, lang } = useLanguage();
  const {
    hasErrors, hasError, errors = [],
    originalSentence, input,
    correctedSentence, correction,
  } = result;

  const hasAnyError    = hasErrors ?? hasError ?? false;
  const sentence       = originalSentence || input || '';
  const finalCorrected = correctedSentence || correction || '';

  // ── No errors ──
  if (!hasAnyError || errors.length === 0) {
    return (
      <div style={{
        background: 'rgba(5,18,5,0.85)',
        border: '1px solid rgba(74,154,74,0.2)',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
      }}>
        <div style={{
          padding: '10px', borderRadius: '10px', flexShrink: 0,
          background: 'rgba(74,154,74,0.1)', border: '1px solid rgba(74,154,74,0.2)',
        }}>
          <CheckCircle2 size={20} style={{ color: '#4A9A4A', display: 'block' }} />
        </div>
        <div>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '15px',
            letterSpacing: '2px', color: '#4A9A4A', fontWeight: 700,
            textTransform: 'uppercase', marginBottom: '6px',
          }}>
            {t('errorCard.noError')}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#666', lineHeight: '1.6', margin: 0 }}>
            {t('errorCard.noErrorMessage')}
          </p>
          {sentence && (
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#4A9A4A',
              fontStyle: 'italic', marginTop: '10px', marginBottom: 0,
            }} dir="ltr" lang="de">
              &ldquo;{sentence}&rdquo;
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Group errors by type ──
  const grouped = errors.reduce((acc, err) => {
    const type = err.errorType || 'autre';
    (acc[type] = acc[type] || []).push(err);
    return acc;
  }, {});

  const severityCounts = { high: 0, medium: 0, low: 0 };
  errors.forEach(e => { if (e.severity) severityCounts[e.severity]++; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* ── Summary header ── */}
      <div style={{
        background: 'rgba(28,8,8,0.95)',
        border: '1px solid rgba(255,80,80,0.2)',
        borderRadius: '14px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <ShieldAlert size={18} style={{ color: '#FF5050', flexShrink: 0 }} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '14px',
          letterSpacing: '1.5px',
          fontWeight: 700,
          color: '#FF5050',
          textTransform: 'uppercase',
          flex: 1,
        }}>
          {t(errors.length > 1 ? 'errorCard.errorsDetected_other' : 'errorCard.errorsDetected_one', { count: errors.length })}
        </span>

        {/* Severity badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['high', 'medium', 'low'].map(sev => {
            const count = severityCounts[sev];
            if (!count) return null;
            const cfg = SEVERITY_CONFIG[sev];
            const label = sev === 'high' ? t('errorCard.critical') : sev === 'medium' ? t('errorCard.important') : t('errorCard.minor');
            return (
              <span key={sev} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '15px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
              }}>
                {count} {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── One card per error type ── */}
      {Object.entries(grouped).map(([type, group]) => (
        <GroupedErrorCard
          key={type}
          errorType={type}
          groupErrors={group}
          originalSentence={sentence}
          correctedSentence={finalCorrected}
          t={t}
          lang={lang}
        />
      ))}
    </div>
  );
}
