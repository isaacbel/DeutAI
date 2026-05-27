'use client';
import { useState } from 'react';
import { BookOpen, GraduationCap, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
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
};

function highlightKeywords(text) {
  return text.split(/(\*[^*]+\*|_[^_]+_|«[^»]+»)/g).map((part, i) => {
    if (part.match(/^(\*[^*]+\*|_[^_]+_|«[^»]+»)$/)) {
      return (
        <span key={i} style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
          {part.replace(/[*_«»]/g, '')}
        </span>
      );
    }
    return part;
  });
}

function parseBilingualExplanation(text) {
  if (!text) return null;
  const match = text.match(/DE:\s*(.*?)\s*\|\|\s*AR:\s*(.*)$/i);
  if (!match) return null;
  return { de: match[1], ar: match[2] };
}

function renderBilingualExplanation(text, language) {
  const parsed = parseBilingualExplanation(text);
  if (!parsed) return highlightKeywords(text);

  if (language === 'ar') {
    return (
      <span dir="rtl" style={{ textAlign: 'right', display: 'block' }}>
        <strong style={{ color: 'var(--color-primary)' }}>AR:</strong> {highlightKeywords(parsed.ar)}
      </span>
    );
  }

  return (
    <span dir="ltr" lang="de" style={{ display: 'block', textAlign: 'left' }}>
      <strong style={{ color: 'var(--color-info)' }}>DE:</strong> {highlightKeywords(parsed.de)}
    </span>
  );
}

function ExerciseItem({ exercise, index, t, explanationLanguage }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="rounded-lg p-4 mt-3 relative overflow-hidden group cursor-default"
      style={{
        background: 'var(--color-bg-sidebar)',
        border: '1px solid var(--color-border)',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(156,123,172,0.4)';
        e.currentTarget.style.background = 'rgba(156,123,172,0.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.background = 'var(--color-bg-sidebar)';
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-[15px] font-mono font-bold mt-0.5"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(156,123,172,0.08)',
            border: '1px solid rgba(156,123,172,0.25)',
            color: 'var(--color-primary)',
          }}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-primary leading-relaxed mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            {renderBilingualExplanation(exercise.question, explanationLanguage)}
          </div>

          {revealed ? (
            <div
              className="text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: 'var(--color-success)',
                background: 'rgba(124,176,120,0.08)',
                border: '1px solid rgba(124,176,120,0.25)',
                animation: 'fadeIn 0.25s ease-out',
              }}
            >
              <span className="text-var(--color-success) text-base">✓</span>
              <span>{renderBilingualExplanation(exercise.answer, explanationLanguage)}</span>
              <button
                onClick={() => setRevealed(false)}
                className="ml-auto opacity-60 hover:opacity-100 transition-opacity shrink-0"
                style={{ color: 'var(--color-success)', background: 'none', border: 'none', cursor: 'pointer' }}
                title={t('errorCard.hideAnswer')}
              >
                <EyeOff size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="flex items-center gap-2 text-[13px] font-mono transition-all py-1.5 px-3 rounded-md"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: 'white',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(156,123,172,0.06)';
                e.currentTarget.style.borderColor = 'rgba(156,123,172,0.25)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              <Eye size={12} />
              {t('errorCard.revealAnswer')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorRuleBlock({ error, index, explanationLanguage }) {
  const [open, setOpen] = useState(true);
  const color = ERROR_TYPE_COLORS[error.errorType] || '#CC5555';

  return (
    <div style={{
      borderRadius: '10px',
      border: `1px solid ${color}20`,
      background: 'white',
      overflow: 'hidden',
    }}>
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: `${color}20`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '14px',
          fontWeight: 700, color, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <span dir="ltr" lang="de" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color, flex: 1, textAlign: 'left' }}>
          {error.errorText} → {error.correction}
        </span>
        {open
          ? <ChevronUp size={13} style={{ color: '#555', flexShrink: 0 }} />
          : <ChevronDown size={13} style={{ color: '#555', flexShrink: 0 }} />
        }
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {error.rule && (
            <div className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-primary)', lineHeight: '1.75', margin: 0 }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <span>📖</span>
                <div style={{ flex: 1 }}>{renderBilingualExplanation(error.rule, explanationLanguage)}</div>
              </div>
            </div>
          )}
          {error.explanation && error.explanation !== error.rule && (
            <div className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-secondary)', lineHeight: '1.75', margin: 0, fontStyle: 'italic' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <span>💡</span>
                <div style={{ flex: 1 }}>{renderBilingualExplanation(error.explanation, explanationLanguage)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RuleCard({ rule, exercises, errors = [], globalExplanation }) {
  const { t, lang } = useLanguage();
  const [exercisesOpen, setExercisesOpen] = useState(true);
  const [explanationLanguage, setExplanationLanguage] = useState(lang);
  const hasExercises = exercises && exercises.length > 0;
  const hasMultiErrors = errors.length > 0;
  const hasBilingualExplanations = Boolean(
    parseBilingualExplanation(globalExplanation) ||
    parseBilingualExplanation(rule) ||
    errors.some((err) => parseBilingualExplanation(err?.explanation) || parseBilingualExplanation(err?.rule))
  );

  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: 'var(--color-bg-mint)',
        border: '1px solid rgba(124, 176, 120, 0.3)',
      }}
    >
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-[var(--color-success)]/80 via-[var(--color-success)] to-[var(--color-success)]/40" />

      {/* Subtle bg glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(124,176,120,0.06) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-1.5 rounded-lg"
          style={{ background: 'rgba(124, 176, 120, 0.08)', border: '1px solid rgba(124, 176, 120, 0.25)' }}
        >
          <BookOpen size={16} style={{ color: 'var(--color-success)' }} />
        </div>
        <span
          className="text-sm font-mono tracking-[0.15em] font-bold"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-success)' }}
        >
          {t('errorCard.grammarRules')}
        </span>
        {hasBilingualExplanations && (
          <div
            className="ml-auto flex items-center gap-1 rounded-md p-1"
            style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid var(--color-border)' }}
          >
            <button
              onClick={() => setExplanationLanguage('de')}
              className="px-3 py-1.5 text-sm rounded cursor-pointer"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: explanationLanguage === 'de' ? 'rgba(156,123,172,0.12)' : 'transparent',
                color: explanationLanguage === 'de' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                border: 'none',
              }}
            >
              DE
            </button>
            <button
              onClick={() => setExplanationLanguage('ar')}
              className="px-3 py-1.5 text-sm rounded cursor-pointer"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: explanationLanguage === 'ar' ? 'rgba(156,123,172,0.12)' : 'transparent',
                color: explanationLanguage === 'ar' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                border: 'none',
              }}
            >
              AR
            </button>
          </div>
        )}
      </div>

      {/* Global explanation */}
      {globalExplanation && (
        <p className="text-sm leading-relaxed text-text-muted pl-0.5 mb-4" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.75' }}>
          {renderBilingualExplanation(globalExplanation, explanationLanguage)}
        </p>
      )}

      {/* Per-error rules */}
      {hasMultiErrors ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: hasExercises ? '16px' : 0 }}>
          {errors.map((err, i) => (
            <ErrorRuleBlock key={i} error={err} index={i} explanationLanguage={explanationLanguage} />
          ))}
        </div>
      ) : rule ? (
        <div
          className="text-sm leading-relaxed text-text-muted pl-0.5 mb-4"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.75' }}
        >
          {renderBilingualExplanation(rule, explanationLanguage)}
        </div>
      ) : null}

      {/* Exercises section */}
      {hasExercises && (
        <div className="mt-2">
          <button
            onClick={() => setExercisesOpen(o => !o)}
            className="w-full flex items-center gap-3 group bg-transparent border-none cursor-pointer p-0"
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={14} className="text-text-muted group-hover:text-primary transition-colors" />
              <span
                className="text-sm font-mono tracking-[0.15em] text-text-muted group-hover:text-primary transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {t('errorCard.targetedExercises')}
              </span>
              <span
                className="text-sm font-mono px-2 py-1 rounded"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: 'rgba(156, 123, 172, 0.06)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(156, 123, 172, 0.25)',
                }}
              >
                {exercises.length}
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            {exercisesOpen
              ? <ChevronUp size={14} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
              : <ChevronDown size={14} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
            }
          </button>

          {exercisesOpen && (
            <div className="mt-1">
              {exercises.map((ex, i) => (
                <ExerciseItem key={i} exercise={ex} index={i} t={t} explanationLanguage={explanationLanguage} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
