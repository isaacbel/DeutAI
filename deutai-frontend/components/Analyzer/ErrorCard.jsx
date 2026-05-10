'use client';
import { useState } from 'react';
import { ShieldAlert, CheckCircle2, Tag, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

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
  high:   { color: '#FF5050', bg: 'rgba(255,80,80,0.08)',   border: 'rgba(255,80,80,0.2)' },
  medium: { color: '#F5A623', bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.2)' },
  low:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)' },
};

// ─── Word-level diff ────────────────────────────────────────────────────────
function computeDiff(original, corrected) {
  if (!original || !corrected) return { origTokens: [], corrTokens: [] };

  const tokenize = str => str.match(/(\s+|\S+)/g) || [];
  const origWords = tokenize(original);
  const corrWords = tokenize(corrected);

  // LCS-based diff (Myers-lite)
  const m = origWords.length, n = corrWords.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = origWords[i].toLowerCase() === corrWords[j].toLowerCase()
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const origTokens = [], corrTokens = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && origWords[i].toLowerCase() === corrWords[j].toLowerCase()) {
      origTokens.push({ text: origWords[i], type: 'same' });
      corrTokens.push({ text: corrWords[j], type: 'same' });
      i++; j++;
    } else if (j < n && (i >= m || dp[i + 1][j] >= dp[i][j + 1])) {
      corrTokens.push({ text: corrWords[j], type: 'add' });
      j++;
    } else {
      origTokens.push({ text: origWords[i], type: 'remove' });
      i++;
    }
  }
  return { origTokens, corrTokens };
}

function DiffLine({ tokens, mode }) {
  // mode: 'original' | 'corrected'
  const markColor   = mode === 'original' ? '#FF6B6B' : '#4ADE80';
  const markBg      = mode === 'original' ? 'rgba(255,107,107,0.12)' : 'rgba(74,222,128,0.12)';
  const markType    = mode === 'original' ? 'remove' : 'add';

  return (
    <span dir="ltr" lang="de" style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '1.9', wordBreak: 'break-word' }}>
      {tokens.map((tok, idx) => {
        if (/^\s+$/.test(tok.text)) return <span key={idx}>{tok.text}</span>;
        if (tok.type === markType) {
          return (
            <mark key={idx} style={{
              background: markBg,
              color: markColor,
              borderRadius: '4px',
              padding: '1px 3px',
              textDecoration: `underline wavy ${markColor}`,
              fontWeight: 700,
              WebkitTextDecorationColor: markColor,
            }}>
              {tok.text}
            </mark>
          );
        }
        return <span key={idx} style={{ color: '#aaa' }}>{tok.text}</span>;
      })}
    </span>
  );
}

// ─── Single grouped error card ──────────────────────────────────────────────
function GroupedErrorCard({ errorType, groupErrors, originalSentence, correctedSentence, t, lang, index }) {
  const [open, setOpen] = useState(true);
  const isRtl    = lang === 'ar';
  const typeColor = ERROR_TYPE_COLORS[errorType] || '#CC5555';
  const typeLabel = t(`errorCard.errorTypes.${errorType}`) || (errorType?.toUpperCase() ?? t('errorCard.noError'));
  const hasDiff   = originalSentence && correctedSentence;
  const { origTokens, corrTokens } = hasDiff
    ? computeDiff(originalSentence, correctedSentence)
    : { origTokens: [], corrTokens: [] };

  const uniqueSuggestions = Array.from(
    new Set(groupErrors.flatMap(e => e.suggestions || []))
  );

  const topSeverity = (['high', 'medium', 'low'].find(s =>
    groupErrors.some(e => e.severity === s)
  ));
  const sevCfg = topSeverity ? SEVERITY_CONFIG[topSeverity] : null;

  return (
    <div style={{
      border: `1px solid ${typeColor}25`,
      borderRadius: '14px',
      overflow: 'hidden',
      animation: `slideIn 0.25s ease-out ${index * 60}ms both`,
    }}>
      {/* Card header — clickable */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          background: `${typeColor}0A`,
          border: 'none',
          borderBottom: open ? `1px solid ${typeColor}20` : 'none',
          cursor: 'pointer',
          textAlign: 'left',
          direction: isRtl ? 'rtl' : 'ltr',
        }}
      >
        {/* Color dot */}
        <span style={{
          width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
          background: typeColor, boxShadow: `0 0 6px ${typeColor}60`,
        }} />

        {/* Type label */}
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          letterSpacing: '1px',
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
            fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
            padding: '3px 10px', borderRadius: '6px',
            background: sevCfg.bg, border: `1px solid ${sevCfg.border}`,
            color: sevCfg.color, fontWeight: 600,
          }}>
            {t(`errorCard.${topSeverity === 'high' ? 'critical' : topSeverity === 'medium' ? 'important' : 'minor'}`)}
          </span>
        )}

        {/* Count badge */}
        {groupErrors.length > 1 && (
          <span style={{
            fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
            padding: '3px 9px', borderRadius: '6px',
            background: `${typeColor}15`, border: `1px solid ${typeColor}30`,
            color: typeColor,
          }}>
            ×{groupErrors.length}
          </span>
        )}

        <ChevronDown size={16} style={{
          color: typeColor, opacity: 0.7, flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }} />
      </button>

      {/* Card body */}
      {open && (
        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Diff lines */}
          {hasDiff && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Before */}
              <div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '1.5px',
                  color: '#FF6B6B', marginBottom: '8px', textTransform: 'uppercase', opacity: 0.8,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF6B6B', display: 'inline-block' }} />
                  {t('errorCard.before')}
                </div>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,107,107,0.04)',
                  border: '1px solid rgba(255,107,107,0.12)',
                }}>
                  <DiffLine tokens={origTokens} mode="original" />
                </div>
              </div>

              {/* After */}
              <div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '1.5px',
                  color: '#4ADE80', marginBottom: '8px', textTransform: 'uppercase', opacity: 0.8,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                  {t('errorCard.after')}
                </div>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'rgba(74,222,128,0.04)',
                  border: '1px solid rgba(74,222,128,0.12)',
                }}>
                  <DiffLine tokens={corrTokens} mode="corrected" />
                </div>
              </div>
            </div>
          )}

          {/* Explanations per sub-error */}
          {groupErrors.some(e => e.explanation) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {groupErrors.filter(e => e.explanation).map((e, i) => (
                <div key={i} style={{
                  fontSize: '13px', fontFamily: 'Inter, sans-serif',
                  color: '#888', lineHeight: '1.6',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  direction: isRtl ? 'rtl' : 'ltr',
                }}>
                  {e.explanation}
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {uniqueSuggestions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', direction: isRtl ? 'rtl' : 'ltr' }}>
              {uniqueSuggestions.map((s, i) => (
                <span key={i} style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
                  padding: '6px 14px', borderRadius: '8px',
                  background: 'rgba(74,222,128,0.06)',
                  border: '1px solid rgba(74,222,128,0.15)',
                  color: '#4ADE80', fontWeight: 600,
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Score ring ─────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 18, circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score));
  const color = pct >= 0.8 ? '#4ADE80' : pct >= 0.5 ? '#F5A623' : '#FF5050';
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="22" y="27" textAnchor="middle"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, fill: color }}>
        {Math.round(pct * 100)}
      </text>
    </svg>
  );
}

// ─── Root component ─────────────────────────────────────────────────────────
export default function ErrorCard({ result }) {
  const { t, lang } = useLanguage();
  const {
    hasErrors, hasError, errors = [],
    originalSentence, input,
    correctedSentence, correction,
    score,
  } = result;

  const hasAnyError   = hasErrors ?? hasError ?? false;
  const sentence      = originalSentence || input || '';
  const finalCorrected = correctedSentence || correction || '';

  // ── No errors ──────────────────────────────────────────────────────────────
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
        animation: 'fadeIn 0.3s ease-out',
      }}>
        <div style={{
          padding: '10px', borderRadius: '10px',
          background: 'rgba(74,154,74,0.1)', border: '1px solid rgba(74,154,74,0.2)', flexShrink: 0,
        }}>
          <CheckCircle2 size={20} style={{ color: '#4A9A4A', display: 'block' }} />
        </div>
        <div>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
            letterSpacing: '2px', color: '#4A9A4A', fontWeight: 700,
            textTransform: 'uppercase', marginBottom: '6px',
          }}>
            {t('errorCard.noError')}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
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

  // ── Group by type ──────────────────────────────────────────────────────────
  const grouped = errors.reduce((acc, err) => {
    const type = err.errorType || 'autre';
    (acc[type] = acc[type] || []).push(err);
    return acc;
  }, {});

  const severityCounts = { high: 0, medium: 0, low: 0 };
  errors.forEach(e => { if (e.severity) severityCounts[e.severity]++; });

  // Score: if not provided, derive from severity counts
  const computedScore = score ?? Math.max(0,
    1 - (severityCounts.high * 0.25 + severityCounts.medium * 0.12 + severityCounts.low * 0.05)
  );

  return (
    <>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* ── Summary bar ─────────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(28,8,8,0.95)',
          border: '1px solid rgba(255,80,80,0.2)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <ScoreRing score={computedScore} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <ShieldAlert size={16} style={{ color: '#FF5050', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                letterSpacing: '1.5px', fontWeight: 700, color: '#FF5050', textTransform: 'uppercase',
              }}>
                {t(errors.length > 1 ? 'errorCard.errorsDetected_other' : 'errorCard.errorsDetected_one', { count: errors.length })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {(['high', 'medium', 'low']).map(sev => {
                const count = severityCounts[sev];
                if (!count) return null;
                const cfg = SEVERITY_CONFIG[sev];
                const label = t(`errorCard.${sev === 'high' ? 'critical' : sev === 'medium' ? 'important' : 'minor'}`);
                return (
                  <span key={sev} style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                    padding: '4px 10px', borderRadius: '6px',
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    color: cfg.color,
                  }}>
                    {count} {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Error type dots legend */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            justifyContent: 'flex-end', maxWidth: '160px',
          }}>
            {Object.keys(grouped).map(type => (
              <span key={type} title={t(`errorCard.errorTypes.${type}`) || type} style={{
                width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block',
                background: ERROR_TYPE_COLORS[type] || '#888',
                boxShadow: `0 0 4px ${ERROR_TYPE_COLORS[type] || '#888'}50`,
                flexShrink: 0,
              }} />
            ))}
          </div>
        </div>

        {/* ── Error cards ──────────────────────────────────────────────────── */}
        {Object.entries(grouped).map(([type, group], i) => (
          <GroupedErrorCard
            key={type}
            index={i}
            errorType={type}
            groupErrors={group}
            originalSentence={sentence}
            correctedSentence={finalCorrected}
            t={t}
            lang={lang}
          />
        ))}
      </div>
    </>
  );
}