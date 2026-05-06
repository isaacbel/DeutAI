'use client';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const ERROR_TYPE_META = {
  conjugaison: { label: 'Conjugaison', hue: '#E05252' },
  temps: { label: 'Temps verbal', hue: '#E06060' },
  auxiliaire: { label: 'Auxiliaire', hue: '#CC4444' },
  déclinaison: { label: 'Déclinaison', hue: '#E07752' },
  genre: { label: 'Genre', hue: '#D64F8F' },
  nombre: { label: 'Nombre', hue: '#C94477' },
  accord: { label: 'Accord', hue: '#D94D9A' },
  ordre: { label: 'Ordre des mots', hue: '#B95DE0' },
  position_verbe: { label: 'Position verbe', hue: '#9F4DD0' },
  subordonnée: { label: 'Subordonnée', hue: '#8A40C0' },
  préposition: { label: 'Préposition', hue: '#55C4E0' },
  cas_prépositionnel: { label: 'Cas prép.', hue: '#3DB0CC' },
  choix_mot: { label: 'Choix du mot', hue: '#E09955' },
  faux_ami: { label: 'Faux ami', hue: '#E08844' },
  collocation: { label: 'Collocation', hue: '#D07840' },
  registre: { label: 'Registre', hue: '#C07038' },
  orthographe: { label: 'Orthographe', hue: '#5588E0' },
  majuscule: { label: 'Majuscule', hue: '#4477CC' },
  ponctuation: { label: 'Ponctuation', hue: '#3366BB' },
  verbe_séparable: { label: 'Verbe séparable', hue: '#4AB870' },
  infinitif_zu: { label: 'Infinitif + zu', hue: '#3DA060' },
  modalverbe: { label: 'Verbe modal', hue: '#339050' },
  autre: { label: 'Autre', hue: '#777777' },
};

function formatDate(dateStr, lang) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'de-DE', {
    day: '2-digit', month: 'short', year: '2-digit',
  });
}

function parseBack(back) {
  const lines = (back || '').split('\n').filter(Boolean);
  const correction = lines[0] || '';
  const ruleLine = lines.find(l => l.includes('Règle'));
  const rule = ruleLine ? ruleLine.replace(/^.*Règle\s*:\s*/u, '') : '';
  const explanationLine = lines.find(l => l.startsWith('💡'));
  const explanation = explanationLine ? explanationLine.replace('💡 ', '') : '';
  const suggestionsLine = lines.find(l => l.startsWith('✓'));
  const suggestions = suggestionsLine
    ? suggestionsLine.replace('✓ Variantes : ', '').split(' / ').filter(Boolean)
    : [];
  return { correction, rule, explanation, suggestions };
}

function parseBilingualExplanation(text) {
  if (!text) return null;
  const match = text.match(/DE:\s*(.*?)\s*\|\|\s*AR:\s*(.*)$/i);
  if (!match) return null;
  return { de: match[1], ar: match[2] };
}

const CARD_STYLES = `
  .fc-scene { perspective: 1400px; }
  .fc-inner {
    position: relative;
    width: 100%;
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.35, 0.1, 0.15, 1);
  }
  .fc-scene.is-flipped .fc-inner { transform: rotateY(180deg); }
  .fc-face {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 16px;
    overflow: hidden;
  }
  .fc-back-face {
    position: absolute;
    inset: 0;
    transform: rotateY(180deg);
  }
  .fc-del {
    opacity: 1;
    transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.12s ease;
  }
  .fc-del:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #1b1b22 !important;
    border-color: #47475a !important;
    color: #d6d8ea !important;
  }
  @media (max-width: 900px) {
    .fc-front-layout,
    .fc-back-layout {
      flex-direction: column !important;
    }
    .fc-front-side,
    .fc-back-side {
      width: 100% !important;
      border-right: none !important;
      border-bottom: 1px solid #1e1e24;
      padding: 14px 16px !important;
      gap: 8px !important;
    }
    .fc-front-main,
    .fc-back-main {
      padding: 16px !important;
    }
    .fc-right-rail {
      width: 100% !important;
      min-height: 46px;
      border-left: none !important;
      border-top: 1px solid #1a1a1f;
      flex-direction: row !important;
      justify-content: space-between !important;
      padding: 8px 12px !important;
    }
    .fc-rail-text {
      writing-mode: horizontal-tb !important;
      text-orientation: initial !important;
      transform: none !important;
      font-size: 11px !important;
    }
  }
`;

export default function FlashcardItem({ flashcard, onDelete }) {
  const { t, lang } = useLanguage();
  const [flipped, setFlipped] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [explanationLanguage, setExplanationLanguage] = useState('de');

  const typeKey = `errorCard.errorTypes.${flashcard.error_type}`;
  const typeLabel = t(typeKey) || (flashcard.error_type ?? t('errorCard.noError'));
  const hue = (ERROR_TYPE_META[flashcard.error_type] || { hue: '#777' }).hue;
  const meta = { label: typeLabel, hue };
  const { correction, rule, explanation, suggestions } = parseBack(flashcard.back);
  const bilingualExplanation = parseBilingualExplanation(explanation);
  const visibleExplanation = bilingualExplanation
    ? (explanationLanguage === 'ar' ? bilingualExplanation.ar : bilingualExplanation.de)
    : explanation;

  function handleDeleteClick(e) {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
      return;
    }
    setDeleting(true);
    onDelete(flashcard.id);
  }

  return (
    <div
      className={`fc-scene ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped(f => !f)}
      style={{ cursor: 'pointer', width: '100%' }}
    >
      <style>{CARD_STYLES}</style>

      {/* Dynamic height based on content */}
      <div className="fc-inner" style={{ minHeight: '220px' }}>

        {/* ── FRONT ── */}
        <div className="fc-face fc-front-layout" style={{
          position: 'absolute', inset: 0,
          background: '#111113',
          border: '1px solid #222228',
          display: 'flex',
          flexDirection: 'row',
          minHeight: '220px',
        }}>
          {/* Left color accent bar */}
          <div style={{
            width: '4px',
            flexShrink: 0,
            background: `linear-gradient(to bottom, ${meta.hue}, ${meta.hue}40)`,
            borderRadius: '16px 0 0 16px',
          }} />

          {/* Left panel — error info */}
          <div className="fc-front-side" style={{
            flex: '0 0 auto',
            width: '220px',
            padding: '20px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid #1e1e24',
            background: `linear-gradient(135deg, ${meta.hue}06 0%, transparent 60%)`,
          }}>
            <div>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '2.5px', textTransform: 'uppercase',
                color: meta.hue, opacity: 1,
                display: 'block', marginBottom: '14px',
              }}>
                {meta.label}
              </span>
              {flashcard.unit_title && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', letterSpacing: '2px', color: '#383840', textTransform: 'uppercase' }}>Unit</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#50505c' }}>{flashcard.unit_title}</span>
                </div>
              )}
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8e94ac', letterSpacing: '1px' }}>
              {formatDate(flashcard.created_at, lang)}
            </span>
          </div>

          {/* Center panel — main content */}
          <div className="fc-front-main" style={{
            flex: 1,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '14px',
            minWidth: 0,
          }}>
            {/* Erroneous phrase */}
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '24px', lineHeight: '1.7',
              color: '#D7DBEE',
              textDecoration: 'line-through',
              textDecorationColor: meta.hue + 'AA',
              textDecorationThickness: '1.5px',
              margin: 0,
              wordBreak: 'break-word',
            }}>
              {flashcard.front}
            </p>

            {flashcard.input_text && flashcard.input_text !== flashcard.front && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  letterSpacing: '2px', color: '#8e94ac',
                  paddingTop: '3px', flexShrink: 0, textTransform: 'uppercase',
                }}>Phrase</span>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '15px', color: '#b8bed8',
                  fontStyle: 'italic', lineHeight: '1.65',
                  wordBreak: 'break-word',
                }}>
                  « {flashcard.input_text} »
                </span>
              </div>
            )}
          </div>

          {/* Right panel — flip hint + delete */}
          <div className="fc-right-rail" style={{
            flex: '0 0 auto',
            width: '56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 0',
            borderLeft: '1px solid #1a1a1f',
          }}>
            <button
              className="fc-del"
              onClick={handleDeleteClick}
              disabled={deleting}
              style={{
                background: confirmDelete ? `${meta.hue}20` : '#171720',
                border: `1px solid ${confirmDelete ? meta.hue + '60' : '#303040'}`,
                borderRadius: '10px', padding: '6px 9px', cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.3px',
                color: confirmDelete ? meta.hue : '#9ca2bd',
                transition: 'all 0.18s',
                minWidth: '44px',
                textAlign: 'center',
              }}
              title={confirmDelete ? t('history.confirmDelete') : 'DEL'}
            >
              {deleting ? '...' : confirmDelete ? 'CONF' : 'DEL'}
            </button>

            <span className="fc-rail-text" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px', color: '#6f758d',
              letterSpacing: '1px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}>
              {t('flashcards.clickToFlip')} ↺
            </span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div className="fc-face fc-back-face fc-back-layout" style={{
          background: '#0c0d09',
          border: '1px solid #252518',
          display: 'flex',
          flexDirection: 'row',
          minHeight: '220px',
        }}>
          {/* Gold left accent */}
          <div style={{
            width: '4px',
            flexShrink: 0,
            background: 'linear-gradient(to bottom, #C9A227, #C9A22740)',
            borderRadius: '16px 0 0 16px',
          }} />

          {/* Left label panel */}
          <div className="fc-back-side" style={{
            flex: '0 0 auto',
            width: '120px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '6px',
            borderRight: '1px solid #252518',
            background: 'linear-gradient(135deg, rgba(201,162,39,0.06) 0%, transparent 60%)',
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
              letterSpacing: '2.5px', textTransform: 'uppercase',
              color: '#bca54b', fontWeight: 700,
            }}>
              {t('errorCard.correction')}
            </span>
            {bilingualExplanation && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => setExplanationLanguage('de')}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '9px',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    border: '1px solid rgba(201,162,39,0.24)',
                    background: explanationLanguage === 'de' ? 'rgba(201,162,39,0.18)' : 'transparent',
                    color: explanationLanguage === 'de' ? '#C9A227' : '#66623f',
                  }}
                >
                  DE
                </button>
                <button
                  onClick={() => setExplanationLanguage('ar')}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '9px',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    border: '1px solid rgba(201,162,39,0.24)',
                    background: explanationLanguage === 'ar' ? 'rgba(201,162,39,0.18)' : 'transparent',
                    color: explanationLanguage === 'ar' ? '#C9A227' : '#66623f',
                  }}
                >
                  AR
                </button>
              </div>
            )}
          </div>

          {/* Center — correction content */}
          <div className="fc-back-main" style={{
            flex: 1,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            minWidth: 0,
            overflowY: 'auto',
          }}>
            {/* Corrected phrase */}
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px', lineHeight: '1.6',
              color: '#C9A227', margin: 0,
              fontStyle: 'italic',
              wordBreak: 'break-word',
            }}>
              {correction}
            </p>

            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #2e2d10, transparent)' }} />

            {rule && (
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  letterSpacing: '2px', color: '#484820',
                  paddingTop: '3px', flexShrink: 0,
                  textTransform: 'uppercase', minWidth: '36px',
                }}>Rule</span>
                <p style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '14px', color: '#726a38',
                  lineHeight: '1.7', margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {rule}
                </p>
              </div>
            )}

            {visibleExplanation && visibleExplanation !== rule && (
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  letterSpacing: '2px', color: '#484820',
                  paddingTop: '3px', flexShrink: 0,
                  textTransform: 'uppercase', minWidth: '36px',
                }}>Expl.</span>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px', color: '#585840',
                  lineHeight: '1.65', margin: 0,
                  wordBreak: 'break-word',
                  direction: explanationLanguage === 'ar' && bilingualExplanation ? 'rtl' : 'ltr',
                  textAlign: explanationLanguage === 'ar' && bilingualExplanation ? 'right' : 'left',
                }}>
                  {visibleExplanation}
                </p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  letterSpacing: '2px', color: '#484820',
                  paddingTop: '5px', flexShrink: 0,
                  textTransform: 'uppercase', minWidth: '36px',
                }}>Var.</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {suggestions.map((s, i) => (
                    <span key={i} style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                      padding: '3px 9px', borderRadius: '6px',
                      background: 'rgba(201,162,39,0.07)',
                      border: '1px solid rgba(201,162,39,0.18)',
                      color: '#8a7820',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right flip hint */}
          <div className="fc-right-rail" style={{
            flex: '0 0 auto',
            width: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '1px solid #202010',
          }}>
            <span className="fc-rail-text" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px', color: '#6f6c3f',
              letterSpacing: '1px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}>
              {t('flashcards.clickToFlip')} ↺
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}